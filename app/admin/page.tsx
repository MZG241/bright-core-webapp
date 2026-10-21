import Link from "next/link";
import { desc, eq, sql } from "drizzle-orm";
import {
  Briefcase,
  Users,
  Clock,
  Eye,
  ArrowRight,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { db } from "@/db";
import { applications, jobs } from "@/db/schema";
import { requireAdmin } from "../lib/auth";

export const dynamic = "force-dynamic";

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    PENDING: "bg-amber-50 text-amber-700 border-amber-200",
    ACCEPTED: "bg-emerald-50 text-emerald-700 border-emerald-200",
    REJECTED: "bg-red-50 text-red-700 border-red-200",
  };
  const label: Record<string, string> = {
    PENDING: "Pending",
    ACCEPTED: "Accepted",
    REJECTED: "Rejected",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium border ${map[status]}`}
    >
      {label[status] ?? status}
    </span>
  );
}

export default async function AdminDashboardPage() {
  const session = await requireAdmin();

  const [
    jobsCount,
    openJobsCount,
    applicationsCount,
    pendingCount,
    acceptedCount,
    rejectedCount,
    totalViews,
  ] = await Promise.all([
    db.select({ c: sql<number>`count(*)::int` }).from(jobs),
    db
      .select({ c: sql<number>`count(*)::int` })
      .from(jobs)
      .where(eq(jobs.status, "OPEN")),
    db.select({ c: sql<number>`count(*)::int` }).from(applications),
    db
      .select({ c: sql<number>`count(*)::int` })
      .from(applications)
      .where(eq(applications.status, "PENDING")),
    db
      .select({ c: sql<number>`count(*)::int` })
      .from(applications)
      .where(eq(applications.status, "ACCEPTED")),
    db
      .select({ c: sql<number>`count(*)::int` })
      .from(applications)
      .where(eq(applications.status, "REJECTED")),
    db
      .select({ c: sql<number>`coalesce(sum(views_count), 0)::int` })
      .from(jobs),
  ]);

  const stats = [
    {
      label: "Total jobs",
      value: jobsCount[0].c,
      sub: `${openJobsCount[0].c} open`,
      icon: Briefcase,
      tone: "bg-brand-50 text-brand-700",
    },
    {
      label: "Applications",
      value: applicationsCount[0].c,
      sub: "all time",
      icon: Users,
      tone: "bg-slate-100 text-slate-700",
    },
    {
      label: "Pending review",
      value: pendingCount[0].c,
      sub: "needs attention",
      icon: Clock,
      tone: "bg-amber-50 text-amber-700",
    },
    {
      label: "Total views",
      value: totalViews[0].c,
      sub: "across all jobs",
      icon: Eye,
      tone: "bg-emerald-50 text-emerald-700",
    },
  ];

  const recentApplications = await db
    .select({
      id: applications.id,
      fullName: applications.fullName,
      email: applications.email,
      phone: applications.phone,
      status: applications.status,
      createdAt: applications.createdAt,
      jobTitle: jobs.title,
      jobSlug: jobs.slug,
    })
    .from(applications)
    .innerJoin(jobs, eq(applications.jobId, jobs.id))
    .orderBy(desc(applications.createdAt))
    .limit(8);

  return (
    <div className="max-w-6xl space-y-6">
      
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
          Welcome, {session.name}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Here&apos;s what&apos;s happening with your recruitment activity.
        </p>
      </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="rounded-2xl border border-slate-200 bg-white p-5"
            >
              <span
                className={`inline-flex items-center justify-center h-9 w-9 rounded-lg ${s.tone}`}
              >
                <Icon className="h-4 w-4" />
              </span>
              <p className="mt-4 text-2xl font-semibold text-slate-900">
                {s.value}
              </p>
              <p className="text-sm font-medium text-slate-700 mt-0.5">
                {s.label}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">{s.sub}</p>
            </div>
          );
        })}
      </div>

  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 flex items-center gap-3">
          <span className="inline-flex items-center justify-center h-9 w-9 rounded-lg bg-amber-50 text-amber-700">
            <Clock className="h-4 w-4" />
          </span>
          <div>
            <p className="text-xs text-slate-500">Pending</p>
            <p className="text-lg font-semibold text-slate-900">
              {pendingCount[0].c}
            </p>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 flex items-center gap-3">
          <span className="inline-flex items-center justify-center h-9 w-9 rounded-lg bg-emerald-50 text-emerald-700">
            <CheckCircle2 className="h-4 w-4" />
          </span>
          <div>
            <p className="text-xs text-slate-500">Accepted</p>
            <p className="text-lg font-semibold text-slate-900">
              {acceptedCount[0].c}
            </p>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 flex items-center gap-3">
          <span className="inline-flex items-center justify-center h-9 w-9 rounded-lg bg-red-50 text-red-700">
            <XCircle className="h-4 w-4" />
          </span>
          <div>
            <p className="text-xs text-slate-500">Rejected</p>
            <p className="text-lg font-semibold text-slate-900">
              {rejectedCount[0].c}
            </p>
          </div>
        </div>
      </div>

   <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">
            Recent applications
          </h2>
          <Link
            href="/admin/applications"
            className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700"
          >
            View all
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {recentApplications.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500">
            No applications yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr className="text-left text-xs font-medium text-slate-500">
                  <th className="px-5 py-3">Candidate</th>
                  <th className="px-5 py-3 hidden sm:table-cell">Job</th>
                  <th className="px-5 py-3 hidden md:table-cell">Phone</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 hidden lg:table-cell text-right">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentApplications.map((app) => (
                  <tr
                    key={app.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-5 py-3">
                      <Link
                        href={`/admin/applications/${app.id}`}
                        className="block min-w-0"
                      >
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {app.fullName}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {app.email}
                        </p>
                      </Link>
                    </td>
                    <td className="px-5 py-3 hidden sm:table-cell">
                      <Link
                        href={`/admin/jobs/${app.id}/applications`}
                        className="text-sm text-slate-700 hover:text-brand-700 truncate inline-block max-w-[200px]"
                      >
                        {app.jobTitle}
                      </Link>
                    </td>
                    <td className="px-5 py-3 hidden md:table-cell text-slate-600">
                      {app.phone}
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="px-5 py-3 hidden lg:table-cell text-right text-xs text-slate-500 whitespace-nowrap">
                      {app.createdAt.toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
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