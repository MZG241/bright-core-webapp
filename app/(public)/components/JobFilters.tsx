"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useTransition, useState, useEffect } from "react";
import { Search, X, Loader2 } from "lucide-react";

const EMPLOYMENT_OPTIONS = [
  { value: "", label: "All" },
  { value: "FULL_TIME", label: "Full-time" },
  { value: "PART_TIME", label: "Part-time" },
  { value: "CONTRACT", label: "Contract" },
  { value: "INTERNSHIP", label: "Internship" },
];

export function JobFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const search = searchParams.get("q") ?? "";
  const type = searchParams.get("type") ?? "";

  const [input, setInput] = useState(search);

  // Synchronise l'input avec l'URL (ex. quand on clique "Clear")
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

  const submitSearch = () => {
    if (input === search) return;
    pushParams("q", input);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submitSearch();
    }
  };

  const hasFilters = search !== "" || type !== "";

  return (
    <div className="space-y-4">
      <div className="flex items-stretch rounded-full bg-white shadow-lg overflow-hidden p-1">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search by title or location…"
            className="w-full border-0 bg-transparent pl-11 pr-9 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
          {input && (
            <button
              type="button"
              onClick={() => setInput("")}
              className="absolute cursor-pointer right-2 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-slate-600"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={submitSearch}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-brand-600 px-5 sm:px-6 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
          <span className="hidden sm:inline">Search</span>
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        {EMPLOYMENT_OPTIONS.map((opt) => {
          const active = type === opt.value;
          return (
            <button
              key={opt.value || "all"}
              type="button"
              onClick={() => pushParams("type", opt.value)}
              className={`inline-flex cursor-pointer items-center rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors border ${
                active
                  ? "bg-white text-brand-700 border-white shadow-sm"
                  : "bg-white/10 text-white/90 border-white/20 hover:bg-white/20"
              }`}
            >
              {opt.label}
            </button>
          );
        })}

        {hasFilters && (
          <button
            type="button"
            onClick={() => {
              setInput("");
              startTransition(() => router.push(pathname));
            }}
            className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="h-3 w-3" />
            Clear
          </button>
        )}
      </div>
    </div>
  );
}