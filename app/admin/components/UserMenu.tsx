"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { UserCircle, LogOut, ChevronDown } from "lucide-react";
import { logoutAction } from "@/app/actions/auth";

export function UserMenu({
  name,
  email,
  initials,
}: {
  name: string;
  email: string;
  initials: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) {
      document.addEventListener("mousedown", onClick);
      document.addEventListener("keydown", onKey);
    }
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex cursor-pointer items-center gap-2 rounded-full pl-1 pr-2 py-1 hover:bg-slate-100 transition-colors"
        aria-label="Open user menu"
        aria-expanded={open}
      >
        <span className="h-8 w-8 rounded-full bg-brand-600 text-white text-xs font-semibold flex items-center justify-center">
          {initials || "A"}
        </span>
        <span className="hidden sm:inline text-sm font-medium text-slate-700 max-w-[140px] truncate">
          {name}
        </span>
        <ChevronDown className="hidden sm:block h-4 w-4 text-slate-400" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-slate-100">
            <p className="text-sm font-medium text-slate-900 truncate">
              {name}
            </p>
            <p className="text-xs text-slate-500 truncate">{email}</p>
          </div>
          <Link
            href="/admin/profile"
            onClick={() => setOpen(false)}
            className="flex cursor-pointer items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <UserCircle className="h-4 w-4 text-slate-400" />
            Profile
          </Link>
          <form action={logoutAction}>
            <button
              type="submit"
              className="w-full flex cursor-pointer items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}