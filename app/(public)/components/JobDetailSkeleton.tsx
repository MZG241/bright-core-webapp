export function JobDetailSkeleton() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 sm:py-10 animate-pulse">
     
      <div className="h-4 w-32 rounded bg-slate-200 mb-6" />

      <div className="grid lg:grid-cols-[1fr_400px] gap-6 lg:gap-10 items-start">
        
        <div className="min-w-0 space-y-6">
          <div className="space-y-3">
            <div className="h-9 w-2/3 rounded bg-slate-200" />
            <div className="flex flex-wrap gap-3">
              <div className="h-4 w-28 rounded bg-slate-200" />
              <div className="h-4 w-24 rounded bg-slate-200" />
              <div className="h-4 w-32 rounded bg-slate-200" />
              <div className="h-4 w-16 rounded bg-slate-200" />
            </div>
          </div>

          <div className="border-t border-slate-200" />

          <div className="space-y-3">
            <div className="h-6 w-40 rounded bg-slate-200" />
            <div className="h-4 w-full rounded bg-slate-200" />
            <div className="h-4 w-11/12 rounded bg-slate-200" />
            <div className="h-4 w-4/5 rounded bg-slate-200" />
            <div className="h-4 w-3/4 rounded bg-slate-200" />
          </div>

          <div className="border-t border-slate-200" />

          <div className="space-y-3">
            <div className="h-6 w-64 rounded bg-slate-200" />
            <div className="h-4 w-full rounded bg-slate-200" />
            <div className="h-4 w-10/12 rounded bg-slate-200" />
            <div className="h-4 w-2/3 rounded bg-slate-200" />
          </div>
        </div>

        
        <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
          <div className="space-y-2">
            <div className="h-5 w-40 rounded bg-slate-200" />
            <div className="h-3 w-56 rounded bg-slate-200" />
          </div>

          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 w-20 rounded bg-slate-200" />
              <div className="h-10 w-full rounded-lg bg-slate-200" />
            </div>
          ))}

          <div className="space-y-2">
            <div className="h-3 w-24 rounded bg-slate-200" />
            <div className="h-24 w-full rounded-lg bg-slate-200" />
          </div>

          <div className="space-y-2">
            <div className="h-3 w-32 rounded bg-slate-200" />
            <div className="h-24 w-full rounded-lg bg-slate-200" />
          </div>

          <div className="h-10 w-full rounded-lg bg-slate-200" />
        </div>
      </div>
    </div>
  );
}