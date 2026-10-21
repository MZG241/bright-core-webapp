"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition } from "react";
import { Loader2 } from "lucide-react";

type Counts = {
  ALL: number;
  PENDING: number;
  ACCEPTED: number;
  REJECTED: number;
};

const TABS: { value: string; label: string; key: keyof Counts }[] = [
  { value: "", label: "All", key: "ALL" },
  { value: "PENDING", label: "Pending", key: "PENDING" },
  { value: "ACCEPTED", label: "Accepted", key: "ACCEPTED" },
  { value: "REJECTED", label: "Rejected", key: "REJECTED" },
];

export function ApplicationStatusFilters({ counts }: { counts: Counts }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const current = searchParams.get("status") ?? "";

  const goTo = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set("status", value);
    else params.delete("status");
    params.delete("page"); // reset pagination quand on change de filtre
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {TABS.map((tab) => {
        const active = current === tab.value;
        return (
          <button
            key={tab.value || "all"}
            type="button"
            onClick={() => goTo(tab.value)}
            className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              active
                ? "bg-brand-600 text-white"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {tab.label}
            <span
              className={`text-[11px] px-1.5 py-0.5 rounded-full ${
                active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
              }`}
            >
              {counts[tab.key]}
            </span>
          </button>
        );
      })}

      {isPending && (
        <Loader2 className="h-4 w-4 animate-spin text-slate-400 ml-1" />
      )}
    </div>
  );
}