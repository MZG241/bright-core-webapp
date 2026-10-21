import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE = "brightcore_session";

function getSecret() {
  return new TextEncoder().encode(process.env.AUTH_SECRET);
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  
  if (pathname === "/login") return NextResponse.next();

 
  const isAdminArea = pathname.startsWith("/admin");
  const isCvApi = pathname.startsWith("/api/cv");

  if (!isAdminArea && !isCvApi) return NextResponse.next();

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) {
    if (isCvApi) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    await jwtVerify(token, getSecret());
    return NextResponse.next();
  } catch {
    if (isCvApi) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: ["/admin/:path*", "/api/cv/:path*"],
};