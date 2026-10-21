export function JobCardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 animate-pulse">
      <div className="flex items-start justify-between gap-3">
        <div className="h-4 w-1/2 rounded bg-slate-200" />
        <div className="h-5 w-20 rounded-full bg-slate-200" />
      </div>
      <div className="mt-2 flex gap-3">
        <div className="h-3 w-24 rounded bg-slate-200" />
        <div className="h-3 w-28 rounded bg-slate-200" />
      </div>
      <div className="mt-3 space-y-2">
        <div className="h-3 w-full rounded bg-slate-200" />
        <div className="h-3 w-3/4 rounded bg-slate-200" />
      </div>
      <div className="mt-4 h-4 w-24 rounded bg-slate-200" />
    </div>
  );
}

export function JobListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <JobCardSkeleton key={i} />
      ))}
    </div>
  );
}