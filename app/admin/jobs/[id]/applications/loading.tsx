export default function Loading() {
  return (
    <div className="max-w-6xl space-y-6 animate-pulse">
      <div className="h-4 w-32 rounded bg-slate-200" />
      <div className="space-y-2">
        <div className="h-7 w-40 rounded bg-slate-200" />
        <div className="h-4 w-64 rounded bg-slate-200" />
      </div>
      <div className="flex gap-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-8 w-24 rounded-lg bg-slate-200" />
        ))}
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex gap-4">
          <div className="h-3 w-20 rounded bg-slate-200" />
          <div className="h-3 w-24 rounded bg-slate-200 hidden md:block" />
          <div className="h-3 w-16 rounded bg-slate-200" />
        </div>
        <div className="divide-y divide-slate-100">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="px-4 py-3 flex items-center gap-4">
              <div className="flex-1 space-y-1.5">
                <div className="h-4 w-1/2 rounded bg-slate-200" />
                <div className="h-3 w-2/3 rounded bg-slate-200" />
              </div>
              <div className="h-5 w-16 rounded-full bg-slate-200" />
              <div className="h-6 w-14 rounded bg-slate-200" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}