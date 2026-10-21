import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { and, desc, eq, sql } from "drizzle-orm";
import { ArrowLeft, ExternalLink, Mail, Phone } from "lucide-react";
import { db } from "@/db";
import { applications, jobs } from "@/db/schema";
import { ApplicationStatusFilters } from "@/app/admin/components/ApplicationStatusFilters";
import { ApplicationStatusBadge } from "@/app/admin/components/ApplicationStatusBadge";
import { ApplicationRowActions } from "@/app/admin/components/ApplicationRowActions";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ status?: string }>;

export default async function JobApplicationsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: SearchParams;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const status = sp.status ?? "";

  const [job] = await db
    .select()
    .from(jobs)
    .where(eq(jobs.id, id))
    .limit(1);

  if (!job) notFound();

  const where =
    status === "PENDING" || status === "ACCEPTED" || status === "REJECTED"
      ? and(eq(applications.jobId, id), eq(applications.status, status))
      : eq(applications.jobId, id);

  const rows = await db
    .select()
    .from(applications)
    .where(where)
    .orderBy(desc(applications.createdAt));

  const counts = await db
    .select({
      status: applications.status,
      count: sql<number>`count(*)::int`,
    })
    .from(applications)
    .where(eq(applications.jobId, id))
    .groupBy(applications.status);

  const countMap = {
    ALL: counts.reduce((acc, c) => acc + c.count, 0),
    PENDING: counts.find((c) => c.status === "PENDING")?.count ?? 0,
    ACCEPTED: counts.find((c) => c.status === "ACCEPTED")?.count ?? 0,
    REJECTED: counts.find((c) => c.status === "REJECTED")?.count ?? 0,
  };

  return (
    <div className="max-w-6xl space-y-6">
      <Link
        href="/admin/jobs"
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand-700 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to jobs
      </Link>

      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
            Applicants
          </h1>
          <p className="text-sm text-slate-500 mt-1 truncate">{job.title}</p>
        </div>
      
      </div>

      <Suspense
        fallback={
          <div className="h-10 rounded-lg bg-slate-100 animate-pulse" />
        }
      >
        <ApplicationStatusFilters counts={countMap} />
      </Suspense>

      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        {rows.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm text-slate-500">
              {status
                ? `No ${status.toLowerCase()} applications for this job.`
                : "No applications yet."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr className="text-left text-xs font-medium text-slate-500">
                  <th className="px-4 py-3">Candidate</th>
                  <th className="px-4 py-3 hidden md:table-cell">Contact</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 hidden lg:table-cell">Applied</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((app) => (
                  <tr
                    key={app.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate max-w-[240px]">
                          {app.fullName}
                        </p>
                        {app.coverNote && (
                          <p className="text-xs text-slate-500 truncate max-w-[240px] mt-0.5">
                            {app.coverNote}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="space-y-0.5">
                        <a
                          href={`mailto:${app.email}`}
                          className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-brand-700"
                        >
                          <Mail className="h-3 w-3" />
                          {app.email}
                        </a>
                        <a
                          href={`tel:${app.phone}`}
                          className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-brand-700"
                        >
                          <Phone className="h-3 w-3" />
                          {app.phone}
                        </a>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <ApplicationStatusBadge status={app.status} />
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-xs text-slate-500 whitespace-nowrap">
                      {app.createdAt.toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <ApplicationRowActions application={app} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}