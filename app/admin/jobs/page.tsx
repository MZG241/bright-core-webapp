import Link from "next/link";
import { Suspense } from "react";
import { desc, eq, sql, and, or, ilike } from "drizzle-orm";
import { Plus, Users, Pencil, Eye, MapPin, Briefcase } from "lucide-react";
import { db } from "@/db";
import { applications, jobs } from "@/db/schema";
import { AdminJobsFilters } from "../components/AdminJobsFilters";
import { DeleteJobButton } from "../components/DeleteJobButton";
import { AdminJobsPagination } from "../components/AdminJobsPagination";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 10;

const EMPLOYMENT_LABELS: Record<string, string> = {
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  CONTRACT: "Contract",
  INTERNSHIP: "Internship",
};

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

type SearchParams = Promise<{
  q?: string;
  status?: string;
  page?: string;
}>;

export default async function AdminJobsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const status = sp.status ?? "";
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);

  const conditions = [];
  if (q) {
    conditions.push(
      or(ilike(jobs.title, `%${q}%`), ilike(jobs.location, `%${q}%`))!
    );
  }
  if (status === "OPEN" || status === "CLOSED") {
    conditions.push(eq(jobs.status, status));
  }
  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(jobs)
    .where(where);

  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const offset = (currentPage - 1) * PAGE_SIZE;

  const rows = await db
    .select({
      id: jobs.id,
      title: jobs.title,
      location: jobs.location,
      employmentType: jobs.employmentType,
      status: jobs.status,
      closingDate: jobs.closingDate,
      viewsCount: jobs.viewsCount,
      createdAt: jobs.createdAt,
      applicationsCount: sql<number>`count(${applications.id})::int`,
    })
    .from(jobs)
    .leftJoin(applications, eq(applications.jobId, jobs.id))
    .where(where)
    .groupBy(jobs.id)
    .orderBy(desc(jobs.createdAt))
    .limit(PAGE_SIZE)
    .offset(offset);

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
            Jobs
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {count} job{count !== 1 ? "s" : ""} total
          </p>
        </div>
        <Link
          href="/admin/jobs/new"
          className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New job
        </Link>
      </div>

      <Suspense
        fallback={
          <div className="h-10 rounded-lg bg-slate-100 animate-pulse" />
        }
      >
        <AdminJobsFilters />
      </Suspense>

      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        {rows.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm text-slate-500">
              {q || status
                ? "No jobs match your filters."
                : "No jobs yet. Create your first one to start receiving applications."}
            </p>
            {!q && !status && (
              <Link
                href="/admin/jobs/new"
                className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
              >
                Create a job
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr className="text-left text-xs font-medium text-slate-500">
                  <th className="px-4 py-3">Job</th>
                  <th className="px-4 py-3 hidden md:table-cell">Type</th>
                  <th className="px-4 py-3 hidden lg:table-cell">Closing</th>
                  <th className="px-4 py-3 hidden sm:table-cell text-center">
                    Views
                  </th>
                  <th className="px-4 py-3 text-center">Applicants</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((job) => {
                  const isExpired = job.closingDate.getTime() < Date.now();
                  const isClosed = job.status === "CLOSED" || isExpired;

                  return (
                    <tr
                      key={job.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/jobs/${job.id}`}
                          className="block min-w-0"
                        >
                          <p className="text-sm font-medium text-slate-900 truncate max-w-[280px]">
                            {job.title}
                          </p>
                          <p className="text-xs text-slate-500 inline-flex items-center gap-1 mt-0.5">
                            <MapPin className="h-3 w-3" />
                            {job.location}
                          </p>
                        </Link>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="inline-flex items-center gap-1 text-xs text-slate-600">
                          <Briefcase className="h-3 w-3" />
                          {EMPLOYMENT_LABELS[job.employmentType]}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-xs text-slate-600 whitespace-nowrap">
                        {formatDate(job.closingDate)}
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell text-center">
                        <span className="inline-flex items-center gap-1 text-xs text-slate-600">
                          <Eye className="h-3 w-3" />
                          {job.viewsCount}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Link
                          href={`/admin/jobs/${job.id}/applications`}
                          className="inline-flex items-center gap-1 rounded-md bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700 hover:bg-brand-100 transition-colors"
                        >
                          <Users className="h-3 w-3" />
                          {job.applicationsCount}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium border ${
                            isClosed
                              ? "bg-red-50 text-red-700 border-red-200"
                              : "bg-emerald-50 text-emerald-700 border-emerald-200"
                          }`}
                        >
                          {isClosed ? "Closed" : "Open"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-1">
                          <Link
                            href={`/admin/jobs/${job.id}`}
                            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-slate-600 hover:text-brand-700 hover:bg-slate-100 transition-colors"
                          >
                            <Pencil className="h-3 w-3" />
                            Edit
                          </Link>
                          <DeleteJobButton
                            jobId={job.id}
                            jobTitle={job.title}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Suspense fallback={null}>
        <AdminJobsPagination
          currentPage={currentPage}
          totalPages={totalPages}
        />
      </Suspense>
    </div>
  );
}