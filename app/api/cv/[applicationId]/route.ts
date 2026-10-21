import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { applications } from "@/db/schema";
import { getSession } from "@/app/lib/auth";
import { imagekit } from "@/app/lib/imagekit";


export async function GET(
  _req: Request,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { applicationId } = await params;

  const [app] = await db
    .select({
      cvFileId: applications.cvFileId,
      cvFileName: applications.cvFileName,
    })
    .from(applications)
    .where(eq(applications.id, applicationId))
    .limit(1);

  if (!app) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

 
  const fileUrl = imagekit.url({
    path: app.cvFileId,
    signed: false,
  });

  try {
    const res = await fetch(fileUrl);

    if (!res.ok) {
      console.error("ImageKit fetch failed:", res.status, fileUrl);
      return NextResponse.json(
        { error: "CV not found on storage" },
        { status: 404 }
      );
    }

    const buffer = await res.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(app.cvFileName)}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (err) {
    console.error("CV proxy error:", err);
    return NextResponse.json(
      { error: "Could not fetch CV" },
      { status: 500 }
    );
  }
}