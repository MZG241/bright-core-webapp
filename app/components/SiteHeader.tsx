"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, UserCircle, LogOut, ChevronDown } from "lucide-react";
import { logoutAction } from "@/app/actions/auth";

type Props = {
  session: {
    name: string;
    email: string;
    role: string;
  } | null;
};

export function SiteHeader({ session }: Props) {
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const isAdmin = session?.role === "ADMIN";
  const initials = session?.name
    ?.split(" ")
    .filter((w) => w.length > 0)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

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

          {isAdmin ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                className="inline-flex cursor-pointer items-center gap-2 rounded-full pl-1 pr-2 py-1 hover:bg-slate-100 transition-colors"
                aria-label="Open user menu"
                aria-expanded={menuOpen}
              >
                <span className="h-8 w-8 rounded-full bg-brand-600 text-white text-xs font-semibold flex items-center justify-center">
                  {initials || "A"}
                </span>
                <span className="text-sm font-medium text-slate-700 max-w-[140px] truncate">
                  {session.name}
                </span>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </button>

              {menuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {session.name}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {session.email}
                      </p>
                    </div>
                    <Link
                      href="/admin"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <UserCircle className="h-4 w-4 text-slate-400" />
                      Dashboard
                    </Link>
                    <form action={logoutAction}>
                      <button
                        type="submit"
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign out
                      </button>
                    </form>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="text-sm cursor-pointer font-medium text-slate-600 hover:text-brand-700 transition-colors"
            >
              Admin
            </Link>
          )}
        </nav>

        {/* Mobile burger */}
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

            {isAdmin ? (
              <>
                <div className="px-3 py-2 border-t border-slate-100 mt-2 pt-3">
                  <p className="text-xs text-slate-400 mb-0.5">Signed in as</p>
                  <p className="text-sm font-medium text-slate-700 truncate">
                    {session.name}
                  </p>
                </div>
                <Link
                  href="/admin"
                  onClick={() => setOpen(false)}
                  className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors inline-flex items-center gap-2"
                >
                  <UserCircle className="h-4 w-4 text-slate-400" />
                  Dashboard
                </Link>
                <form action={logoutAction}>
                  <button
                    type="submit"
                    className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors inline-flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </form>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Admin
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}