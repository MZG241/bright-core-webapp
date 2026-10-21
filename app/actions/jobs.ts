"use server";

import { eq, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { jobs } from "@/db/schema";
import { assertAdmin } from "../lib/auth";
import { jobSchema } from "../lib/validations/job";
import { generateSlug, uniqueSlug } from "../lib/slug";
import { sanitizeRichText } from "../lib/sanitize";

export type JobFormState =
  | { success?: string; error?: string; fieldErrors?: Record<string, string> }
  | null;

export async function incrementViews(jobId: string) {
  await db
    .update(jobs)
    .set({ viewsCount: sql`${jobs.viewsCount} + 1` })
    .where(eq(jobs.id, jobId));
}

function parseRequirements(raw: FormDataEntryValue | null): unknown {
  if (!raw) return [];
  const str = String(raw);
  try {
    return JSON.parse(str);
  } catch {
    return [];
  }
}

export async function createJobAction(
  _prev: JobFormState,
  formData: FormData
): Promise<JobFormState> {
  await assertAdmin();

  const parsed = jobSchema.safeParse({
    title: formData.get("title"),
    location: formData.get("location"),
    employmentType: formData.get("employmentType"),
    description: formData.get("description"),
    requirements: parseRequirements(formData.get("requirements")),
    closingDate: formData.get("closingDate"),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0]?.toString() ?? "form";
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { error: "Please fix the errors below.", fieldErrors };
  }

  const baseSlug = generateSlug(parsed.data.title);

  const existing = await db
    .select({ slug: jobs.slug })
    .from(jobs)
    .where(sql`${jobs.slug} LIKE ${baseSlug + "%"}`);

  const slug = uniqueSlug(
    baseSlug,
    existing.map((e) => e.slug)
  );

  try {
    await db.insert(jobs).values({
      title: parsed.data.title.trim(),
      slug,
      location: parsed.data.location.trim(),
      employmentType: parsed.data.employmentType,
      description: sanitizeRichText(parsed.data.description),
      requirements: parsed.data.requirements,
      closingDate: new Date(parsed.data.closingDate),
      status: "OPEN",
    });
  } catch (err) {
    console.error("createJob error:", err);
    return { error: "Could not create the job. Please try again." };
  }

  revalidatePath("/admin/jobs");
  revalidatePath("/");
  redirect("/admin/jobs");
}

export async function updateJobAction(
  jobId: string,
  _prev: JobFormState,
  formData: FormData
): Promise<JobFormState> {
  await assertAdmin();

  const parsed = jobSchema.safeParse({
    title: formData.get("title"),
    location: formData.get("location"),
    employmentType: formData.get("employmentType"),
    description: formData.get("description"),
    requirements: parseRequirements(formData.get("requirements")),
    closingDate: formData.get("closingDate"),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0]?.toString() ?? "form";
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { error: "Please fix the errors below.", fieldErrors };
  }

  try {
    await db
      .update(jobs)
      .set({
        title: parsed.data.title.trim(),
        location: parsed.data.location.trim(),
        employmentType: parsed.data.employmentType,
        description: sanitizeRichText(parsed.data.description),
        requirements: parsed.data.requirements,
        closingDate: new Date(parsed.data.closingDate),
        updatedAt: new Date(),
      })
      .where(eq(jobs.id, jobId));
  } catch (err) {
    console.error("updateJob error:", err);
    return { error: "Could not update the job. Please try again." };
  }

  revalidatePath("/admin/jobs");
  revalidatePath(`/admin/jobs/${jobId}`);
  revalidatePath("/");
  redirect("/admin/jobs");
}

export async function toggleJobStatusAction(
  jobId: string,
  nextStatus: "OPEN" | "CLOSED"
) {
  await assertAdmin();

  await db
    .update(jobs)
    .set({ status: nextStatus, updatedAt: new Date() })
    .where(eq(jobs.id, jobId));

  revalidatePath("/admin/jobs");
  revalidatePath(`/admin/jobs/${jobId}`);
  revalidatePath("/");
}

export async function deleteJobAction(jobId: string) {
  await assertAdmin();

  const [job] = await db
    .select({ title: jobs.title })
    .from(jobs)
    .where(eq(jobs.id, jobId))
    .limit(1);

  if (!job) return;

  await db.delete(jobs).where(eq(jobs.id, jobId));

  revalidatePath("/admin/jobs");
  revalidatePath("/");
}