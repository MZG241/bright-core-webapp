import Link from "next/link";
import { notFound } from "next/navigation";
import { eq, sql } from "drizzle-orm";
import { MapPin, Briefcase, ArrowLeft, Calendar, Eye } from "lucide-react";
import { db } from "@/db";
import { jobs } from "@/db/schema";
import { ApplyForm } from "@/app/(public)/components/ApplyForm";
import { SiteHeader } from "@/app/components/SiteHeader";
import { SiteFooter } from "@/app/components/SiteFooter";

const EMPLOYMENT_LABELS: Record<string, string> = {
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  CONTRACT: "Contract",
  INTERNSHIP: "Internship",
};

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export const dynamic = "force-dynamic";

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [job] = await db
    .select()
    .from(jobs)
    .where(eq(jobs.slug, slug))
    .limit(1);

  if (!job) notFound();

  await db
    .update(jobs)
    .set({ viewsCount: sql`${jobs.viewsCount} + 1` })
    .where(eq(jobs.id, job.id));

  const [updatedJob] = await db
    .select()
    .from(jobs)
    .where(eq(jobs.id, job.id))
    .limit(1);

  const currentJob = updatedJob ?? job;

  const now = new Date();
  const isExpired = currentJob.closingDate.getTime() < now.getTime();
  const isClosed = currentJob.status === "CLOSED" || isExpired;

  const requirements = Array.isArray(currentJob.requirements)
    ? currentJob.requirements
    : [];

  return (
    <>
      <SiteHeader />
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 sm:py-10">
        <Link
          href="/"
          className="inline-flex cursor-pointer items-center gap-1 text-sm text-slate-500 hover:text-brand-700 transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to all jobs
        </Link>

        <div className="grid lg:grid-cols-[1fr_400px] gap-6 lg:gap-10 items-start">
          <article className="min-w-0">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="min-w-0">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-slate-900 tracking-tight">
                  {currentJob.title}
                </h1>
                <div className="mt-3 flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-2 text-xs sm:text-sm text-slate-600">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-400" />
                    {currentJob.location}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Briefcase className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-400" />
                    {EMPLOYMENT_LABELS[currentJob.employmentType]}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-400" />
                    Closes {formatDate(currentJob.closingDate)}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-slate-400">
                    <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    {currentJob.viewsCount} view
                    {currentJob.viewsCount !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              <span
                className={`shrink-0 inline-flex items-center rounded-full px-2.5 sm:px-3 py-1 text-xs font-medium border ${
                  isClosed
                    ? "bg-red-50 text-red-700 border-red-200"
                    : "bg-emerald-50 text-emerald-700 border-emerald-200"
                }`}
              >
                {isClosed ? "Closed" : "Open"}
              </span>
            </div>

            <div className="my-8 border-t border-slate-200" />

            <section>
              <h2 className="text-lg sm:text-xl font-semibold text-slate-900 mb-3">
                About the role
              </h2>
              <div
                className="prose prose-slate prose-sm sm:prose-base max-w-none text-slate-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: currentJob.description }}
              />
            </section>

            {requirements.length > 0 && (
              <>
                <div className="my-8 border-t border-slate-200" />
                <section>
                  <h2 className="text-lg sm:text-xl font-semibold text-slate-900 mb-3">
                    Requirements
                  </h2>
                  <ul className="space-y-2">
                    {requirements.map((req, i) => (
                      <li
                        key={`${req}-${i}`}
                        className="flex items-start gap-2 text-sm text-slate-700"
                      >
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-brand-500 shrink-0" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </section>
              </>
            )}
          </article>

          <aside className="lg:sticky lg:top-6 lg:self-start">
            {isClosed ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-medium text-slate-700 mb-2">
                  Applications closed
                </p>
                <p className="text-sm text-slate-600">
                  This role is no longer accepting applications.
                </p>
                <Link
                  href="/"
                  className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
                >
                  Browse other open positions →
                </Link>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-slate-900">
                    Apply for this role
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Fill the form below to submit your application.
                  </p>
                </div>
                <ApplyForm slug={currentJob.slug} />
              </>
            )}
          </aside>
        </div>
      </div>
      <SiteFooter />
    </>
  );
}