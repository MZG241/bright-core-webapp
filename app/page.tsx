import { Suspense } from "react";
import { and, eq, gt, or, ilike, desc, sql } from "drizzle-orm";
import { db } from "@/db";
import { jobs } from "@/db/schema";
import { JobFilters } from "./(public)/components/JobFilters";
import { Pagination } from "./(public)/components/Pagination";
import { JobCard } from "./(public)/components/JobCards";
import { SiteHeader } from "./components/SiteHeader";
import { SiteFooter } from "./components/SiteFooter";
import { getSession } from "./lib/auth";


const PAGE_SIZE = 8;

const EMPLOYMENT_VALUES = [
  "FULL_TIME",
  "PART_TIME",
  "CONTRACT",
  "INTERNSHIP",
] as const;

type EmploymentType = (typeof EMPLOYMENT_VALUES)[number];

function isEmploymentType(v: string): v is EmploymentType {
  return (EMPLOYMENT_VALUES as readonly string[]).includes(v);
}

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  q?: string;
  type?: string;
  page?: string;
}>;

export default async function HomePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const type = sp.type ?? "";
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);

  const conditions = [
    eq(jobs.status, "OPEN"),
    gt(jobs.closingDate, new Date()),
  ];

   const session = await getSession();

  if (q) {
    conditions.push(
      or(ilike(jobs.title, `%${q}%`), ilike(jobs.location, `%${q}%`))!
    );
  }

  if (type && isEmploymentType(type)) {
    conditions.push(eq(jobs.employmentType, type));
  }

  const where = and(...conditions);

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(jobs)
    .where(where);

  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const offset = (currentPage - 1) * PAGE_SIZE;

  const openJobs = await db
    .select()
    .from(jobs)
    .where(where)
    .orderBy(desc(jobs.createdAt))
    .limit(PAGE_SIZE)
    .offset(offset);

  return (
    <>
      <SiteHeader session={session} />
   <section className="w-full bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 text-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-14 sm:py-20 md:py-24 text-center">
          

          <h1 className="mt-6 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight leading-tight">
            Find your next role
            <br />
            <span className="text-brand-200">at BrightCore.</span>
          </h1>

         <p className="mt-4 sm:mt-5 text-base sm:text-lg text-brand-100 max-w-2xl mx-auto leading-relaxed">
  Discover opportunities to grow your career with a team that values impact,
  ownership and craft. Your next chapter starts here.
</p>

          <div className="mt-8 max-w-2xl mx-auto text-left">
            <Suspense
              fallback={
                <div className="h-20 rounded-xl bg-white/20 animate-pulse" />
              }
            >
              <JobFilters />
            </Suspense>
          </div>
        </div>
      </section>

     
      <section
        id="openings"
        className="mx-auto max-w-6xl px-4 sm:px-6 py-10 sm:py-14"
      >
        <div className="mb-6 sm:mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">
              Open positions
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {count === 0
                ? "No matching openings."
                : `${count} role${count !== 1 ? "s" : ""} found`}
            </p>
          </div>
        </div>

        {openJobs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 sm:p-12 text-center">
            <p className="text-sm sm:text-base text-slate-500">
              {q || type
                ? "No jobs match your filters. Try clearing them."
                : "We're not hiring at the moment. Check back soon."}
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
              {openJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
            <Suspense fallback={null}>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
              />
            </Suspense>
          </>
        )}
      </section>

      <SiteFooter/>
    </>
  );
}