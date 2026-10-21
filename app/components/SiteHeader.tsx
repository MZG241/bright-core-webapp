"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        <Link
          href="/"
          onClick={() => setOpen(false)}
          className="inline-flex cursor-pointer items-center gap-2"
        >
          <div className="h-8 w-8 rounded-lg bg-brand-600 flex items-center justify-center font-bold text-white text-sm">
            B
          </div>
          <span className="text-base font-semibold text-slate-900 tracking-tight">
            BrightCore
          </span>
        </Link>

        
        <nav className="hidden sm:flex items-center gap-4">
          <Link
            href="/#openings"
            className="text-sm font-medium text-slate-600 hover:text-brand-700 transition-colors"
          >
            Open positions
          </Link>
          <Link
            href="/login"
            className="text-sm cursor-pointer font-medium text-slate-600 hover:text-brand-700 transition-colors"
          >
            Admin
          </Link>
        </nav>

        
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="sm:hidden cursor-pointer inline-flex items-center justify-center h-9 w-9 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      
      {open && (
        <div className="sm:hidden border-t border-slate-200 bg-white">
          <nav className="px-4 py-3 flex flex-col gap-1">
            <Link
              href="/#openings"
              onClick={() => setOpen(false)}
              className="px-3 cursor-pointer py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Open positions
            </Link>
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Admin
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}