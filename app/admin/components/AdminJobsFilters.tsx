"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useTransition, useState, useEffect } from "react";
import { Search, X, Loader2 } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "", label: "All" },
  { value: "OPEN", label: "Open" },
  { value: "CLOSED", label: "Closed" },
];

export function AdminJobsFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const search = searchParams.get("q") ?? "";
  const status = searchParams.get("status") ?? "";

  const [input, setInput] = useState(search);

  useEffect(() => {
    setInput(search);
  }, [search]);

  const pushParams = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      params.delete("page");
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      });
    },
    [router, pathname, searchParams]
  );

  useEffect(() => {
    if (input === search) return;
    const t = setTimeout(() => pushParams("q", input), 300);
    return () => clearTimeout(t);
  }, [input, search, pushParams]);

  const hasFilters = search !== "" || status !== "";

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Search by title or location…"
          className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-9 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
        />
        {input && (
          <button
            type="button"
            onClick={() => setInput("")}
            className="absolute cursor-pointer right-2 top-1/2 -translate-y-1/2 p-1 rounded text-slate-400 hover:text-slate-600"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <select
        value={status}
        onChange={(e) => pushParams("status", e.target.value)}
        className="rounded- cursor-pointer  border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {hasFilters && (
        <button
          type="button"
          onClick={() => {
            setInput("");
            startTransition(() => router.push(pathname));
          }}
          className="inline-flex cursor-pointer items-center justify-center gap-1 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        >
          <X className="h-4 w-4" />
          Clear
        </button>
      )}

      {isPending && (
        <div className="inline-flex items-center justify-center px-2 text-slate-400">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      )}
    </div>
  );
}