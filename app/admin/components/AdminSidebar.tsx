"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  UserCircle,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { logoutAction } from "@/app/actions/auth";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/jobs", label: "Jobs", icon: Briefcase, exact: false },
   {
    href: "/admin/applications",
    label: "Applications",
    icon: Users,
    exact: false,
  },
  { href: "/admin/profile", label: "Profile", icon: UserCircle, exact: false },
];

export function AdminSidebar({ userName }: { userName: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  const nav = (
    <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.href, item.exact);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={`flex items-center cursor-pointer gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              active
                ? "bg-brand-50 text-brand-700"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  const footer = (
    <div className="p-3 border-t border-slate-200 shrink-0 space-y-2">
      <div>
        <p className="text-xs text-slate-400 mb-1">Signed in as</p>
        <p className="text-sm font-medium text-slate-700 truncate">
          {userName}
        </p>
      </div>
      <form action={logoutAction}>
        <button
          type="submit"
          className="w-full cursor-pointer inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </form>
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-3.5 left-3 z-50 inline-flex items-center justify-center h-9 w-9 rounded-lg bg-white border border-slate-200 text-slate-600 shadow-sm"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <aside className="hidden lg:flex w-60 shrink-0 h-screen border-r border-slate-200 bg-white flex-col">
        <div className="h-16 shrink-0 flex items-center px-4 border-b border-slate-200">
          <Link href="/admin" className="inline-flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-brand-600 flex items-center justify-center font-bold text-white text-sm">
              B
            </div>
            <span className="text-sm font-semibold text-slate-900 tracking-tight">
              BrightCore
            </span>
          </Link>
        </div>
        {nav}
        {footer}
      </aside>

      {open && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-slate-900/40 z-40"
            onClick={() => setOpen(false)}
          />
          <aside className="lg:hidden fixed inset-y-0 left-0 w-64 z-50 bg-white border-r border-slate-200 flex flex-col">
            <div className="h-16 shrink-0 flex items-center justify-between px-4 border-b border-slate-200">
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="inline-flex items-center gap-2"
              >
                <div className="h-8 w-8 rounded-lg bg-brand-600 flex items-center justify-center font-bold text-white text-sm">
                  B
                </div>
                <span className="text-sm font-semibold text-slate-900">
                  BrightCore
                </span>
              </Link>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-slate-600 hover:bg-slate-100"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {nav}
            {footer}
          </aside>
        </>
      )}
    </>
  );
}