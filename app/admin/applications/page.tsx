import Link from "next/link";
import { Suspense } from "react";
import { desc, eq, sql } from "drizzle-orm";
import { Mail, Phone, ExternalLink } from "lucide-react";
import { db } from "@/db";
import { applications, jobs } from "@/db/schema";
import { ApplicationStatusFilters } from "@/app/admin/components/ApplicationStatusFilters";
import { ApplicationStatusBadge } from "@/app/admin/components/ApplicationStatusBadge";
import { ApplicationRowActions } from "@/app/admin/components/ApplicationRowActions";
import { ApplicationsPagination } from "@/app/admin/components/ApplicationsPagination";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 15;

type SearchParams = Promise<{ status?: string; page?: string }>;

export default async function AdminApplicationsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const status = sp.status ?? "";
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);

  const statusFilter =
    status === "PENDING" || status === "ACCEPTED" || status === "REJECTED"
      ? eq(applications.status, status)
      : undefined;

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(applications)
    .where(statusFilter);

  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const offset = (currentPage - 1) * PAGE_SIZE;

  const rows = await db
    .select({
      id: applications.id,
      fullName: applications.fullName,
      email: applications.email,
      phone: applications.phone,
      coverNote: applications.coverNote,
      status: applications.status,
      adminNote: applications.adminNote,
      cvFileId: applications.cvFileId,
      cvFileName: applications.cvFileName,
      createdAt: applications.createdAt,
      updatedAt: applications.updatedAt,
      jobId: applications.jobId,
      jobTitle: jobs.title,
    })
    .from(applications)
    .innerJoin(jobs, eq(applications.jobId, jobs.id))
    .where(statusFilter)
    .orderBy(desc(applications.createdAt))
    .limit(PAGE_SIZE)
    .offset(offset);

  const counts = await db
    .select({
      status: applications.status,
      count: sql<number>`count(*)::int`,
    })
    .from(applications)
    .groupBy(applications.status);

  const countMap = {
    ALL: counts.reduce((acc, c) => acc + c.count, 0),
    PENDING: counts.find((c) => c.status === "PENDING")?.count ?? 0,
    ACCEPTED: counts.find((c) => c.status === "ACCEPTED")?.count ?? 0,
    REJECTED: counts.find((c) => c.status === "REJECTED")?.count ?? 0,
  };

  return (
    <div className="max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
          Applications
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {countMap.ALL} application{countMap.ALL !== 1 ? "s" : ""} across all
          jobs
        </p>
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
                ? `No ${status.toLowerCase()} applications.`
                : "No applications yet."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr className="text-left text-xs font-medium text-slate-500">
                  <th className="px-4 py-3">Candidate</th>
                  <th className="px-4 py-3 hidden md:table-cell">Job</th>
                  <th className="px-4 py-3 hidden lg:table-cell">Contact</th>
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
                        <p className="text-sm font-medium text-slate-900 truncate max-w-[200px]">
                          {app.fullName}
                        </p>
                        <p className="text-xs text-slate-500 truncate max-w-[200px]">
                          {app.email}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <Link
                        href={`/admin/jobs/${app.jobId}/applications`}
                        className="inline-flex items-center gap-1 text-sm text-slate-700 hover:text-brand-700 max-w-[200px] truncate"
                      >
                        {app.jobTitle}
                        <ExternalLink className="h-3 w-3 shrink-0" />
                      </Link>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
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
                      <ApplicationRowActions
                        application={{
                          id: app.id,
                          jobId: app.jobId,
                          fullName: app.fullName,
                          email: app.email,
                          phone: app.phone,
                          coverNote: app.coverNote,
                          cvFileId: app.cvFileId,
                          cvFileName: app.cvFileName,
                          status: app.status,
                          adminNote: app.adminNote,
                          createdAt: app.createdAt,
                          updatedAt: app.updatedAt,
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Suspense fallback={null}>
        <ApplicationsPagination
          currentPage={currentPage}
          totalPages={totalPages}
        />
      </Suspense>
    </div>
  );
}