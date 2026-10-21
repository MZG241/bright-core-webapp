"use server";

import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { applications, jobs } from "@/db/schema";
import {
  applicationSchema,
  validateCvFile,
} from "../lib/validations/application";
import { uploadPrivateCv } from "../lib/imagekit";
import { sendMail } from "../lib/mailer";
import { applicationStatusEmail } from "../lib/email/template";
import { revalidatePath } from "next/cache";
import { assertAdmin } from "../lib/auth";

export type ApplyState =
  | { success?: string; error?: string; fieldErrors?: Record<string, string> }
  | null;

export async function submitApplication(
  _prev: ApplyState,
  formData: FormData
): Promise<ApplyState> {
  const slug = String(formData.get("slug") ?? "");

  if (!slug) return { error: "Job not found." };

  const [job] = await db
    .select()
    .from(jobs)
    .where(eq(jobs.slug, slug))
    .limit(1);

  if (!job) return { error: "Job not found." };

  const now = new Date();
  if (job.status === "CLOSED" || job.closingDate.getTime() < now.getTime()) {
    return { error: "This job is no longer accepting applications." };
  }

  const parsed = applicationSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    coverNote: formData.get("coverNote") ?? "",
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0]?.toString() ?? "form";
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { error: "Please fix the errors below.", fieldErrors };
  }

  const cv = formData.get("cv");
  const file = cv instanceof File ? cv : null;
  const fileError = validateCvFile(file);
  if (fileError) {
    return { error: fileError, fieldErrors: { cv: fileError } };
  }

  const [existing] = await db
    .select({ id: applications.id })
    .from(applications)
    .where(
      and(
        eq(applications.jobId, job.id),
        eq(applications.email, parsed.data.email.toLowerCase().trim())
      )
    )
    .limit(1);

  if (existing) {
    return {
      error: "You have already applied to this job with this email.",
      fieldErrors: { email: "An application already exists with this email." },
    };
  }

  let uploaded: { filePath: string; fileName: string };
  try {
    const buffer = Buffer.from(await file!.arrayBuffer());
    uploaded = await uploadPrivateCv(buffer, file!.name);
  } catch (err) {
    console.error("ImageKit upload error:", err);
    return { error: "Could not upload your CV. Please try again." };
  }

  try {
    await db.insert(applications).values({
      jobId: job.id,
      fullName: parsed.data.fullName.trim(),
      email: parsed.data.email.toLowerCase().trim(),
      phone: parsed.data.phone.trim(),
      coverNote: parsed.data.coverNote?.trim() || null,
      cvFileId: uploaded.filePath,
      cvFileName: uploaded.fileName,
    });
  } catch (err) {
    console.error("DB insert error:", err);
    return { error: "Could not save your application. Please try again." };
  }

  try {
    const tmpl = applicationStatusEmail("PENDING", {
      candidateName: parsed.data.fullName.trim(),
      jobTitle: job.title,
    });
    await sendMail({
      to: parsed.data.email.toLowerCase().trim(),
      subject: tmpl.subject,
      html: tmpl.html,
    });
  } catch (err) {
    console.error("Confirmation email error:", err);
  }

  return {
    success:
      "Application submitted! We've received your CV and will be in touch.",
  };
}

export async function updateApplicationStatusAction(
  applicationId: string,
  status: "ACCEPTED" | "REJECTED",
  adminNote: string | null
): Promise<{ success?: string; error?: string }> {
  await assertAdmin();

  const [app] = await db
    .select({
      id: applications.id,
      email: applications.email,
      fullName: applications.fullName,
      jobId: applications.jobId,
    })
    .from(applications)
    .where(eq(applications.id, applicationId))
    .limit(1);

  if (!app) return { error: "Application not found." };

  const [job] = await db
    .select({ title: jobs.title })
    .from(jobs)
    .where(eq(jobs.id, app.jobId))
    .limit(1);

  if (!job) return { error: "Job not found." };

  try {
    await db
      .update(applications)
      .set({
        status,
        adminNote: adminNote?.trim() || null,
        updatedAt: new Date(),
      })
      .where(eq(applications.id, applicationId));
  } catch (err) {
    console.error("updateApplicationStatus error:", err);
    return { error: "Could not update the application." };
  }

  try {
    const tmpl = applicationStatusEmail(status, {
      candidateName: app.fullName,
      jobTitle: job.title,
      adminNote: adminNote?.trim() || null,
    });
    await sendMail({
      to: app.email,
      subject: tmpl.subject,
      html: tmpl.html,
    });
  } catch (err) {
    console.error("Status email error:", err);
  }

  revalidatePath(`/admin/jobs/${app.jobId}/applications`);
  revalidatePath("/admin/applications");
  revalidatePath("/admin");

  return { success: "Application updated." };
}