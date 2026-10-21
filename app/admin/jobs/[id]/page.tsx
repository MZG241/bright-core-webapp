import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { ArrowLeft, ExternalLink, Users } from "lucide-react";
import { db } from "@/db";
import { applications, jobs } from "@/db/schema";
import { sql } from "drizzle-orm";
import { JobForm } from "../../components/JobForm";
import { DeleteJobButton } from "../../components/DeleteJobButton";


export const dynamic = "force-dynamic";

function toDateInputValue(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export default async function EditJobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [job] = await db
    .select()
    .from(jobs)
    .where(eq(jobs.id, id))
    .limit(1);

  if (!job) notFound();

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(applications)
    .where(eq(applications.jobId, job.id));

  const isExpired = job.closingDate.getTime() < Date.now();
  const isClosed = job.status === "CLOSED" || isExpired;

  return (
    <div className="max-w-4xl space-y-6">
      <Link
        href="/admin/jobs"
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand-700 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to jobs
      </Link>

      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
              Edit job
            </h1>
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium border ${
                isClosed
                  ? "bg-red-50 text-red-700 border-red-200"
                  : "bg-emerald-50 text-emerald-700 border-emerald-200"
              }`}
            >
              {isClosed ? "Closed" : "Open"}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1 truncate">{job.title}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href={`/admin/jobs/${job.id}/applications`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-50 px-3 py-2 text-sm font-medium text-brand-700 hover:bg-brand-100 transition-colors"
          >
            <Users className="h-4 w-4" />
            {count} applicant{count !== 1 ? "s" : ""}
          </Link>
       
          <DeleteJobButton jobId={job.id} jobTitle={job.title} />
        </div>
      </div>

      <JobForm
        mode="edit"
        jobId={job.id}
        initialStatus={job.status}
        defaultValues={{
          title: job.title,
          location: job.location,
          employmentType: job.employmentType,
          description: job.description,
          requirements: job.requirements,
          closingDate: toDateInputValue(job.closingDate),
        }}
      />
    </div>
  );
}