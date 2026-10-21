export function AdminJobsTableSkeleton() {
  return (
    <div className="max-w-6xl space-y-6 animate-pulse">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="space-y-2">
          <div className="h-7 w-24 rounded bg-slate-200" />
          <div className="h-3 w-32 rounded bg-slate-200" />
        </div>
        <div className="h-9 w-28 rounded-lg bg-slate-200" />
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="h-10 flex-1 rounded-lg bg-slate-200" />
        <div className="h-10 w-32 rounded-lg bg-slate-200" />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex gap-4">
          <div className="h-3 w-16 rounded bg-slate-200" />
          <div className="h-3 w-12 rounded bg-slate-200 hidden md:block" />
          <div className="h-3 w-16 rounded bg-slate-200 hidden lg:block" />
          <div className="h-3 w-12 rounded bg-slate-200 hidden sm:block" />
          <div className="h-3 w-20 rounded bg-slate-200 ml-auto" />
        </div>
        <div className="divide-y divide-slate-100">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="px-4 py-3 flex items-center gap-4">
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="h-4 w-2/3 rounded bg-slate-200" />
                <div className="h-3 w-1/3 rounded bg-slate-200" />
              </div>
              <div className="h-3 w-20 rounded bg-slate-200 hidden md:block" />
              <div className="h-3 w-16 rounded bg-slate-200 hidden lg:block" />
              <div className="h-3 w-10 rounded bg-slate-200 hidden sm:block" />
              <div className="h-5 w-8 rounded-full bg-slate-200" />
              <div className="h-5 w-16 rounded-full bg-slate-200" />
              <div className="h-6 w-14 rounded bg-slate-200" />
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="h-3 w-24 rounded bg-slate-200" />
        <div className="flex gap-1">
          <div className="h-8 w-16 rounded-lg bg-slate-200" />
          <div className="h-8 w-16 rounded-lg bg-slate-200" />
        </div>
      </div>
    </div>
  );
}