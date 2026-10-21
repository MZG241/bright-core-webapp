import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-500">
        <p>© BrightCore. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <Link
            href="/#openings"
            className="hover:text-brand-700 transition-colors"
          >
            Open positions
          </Link>
          <Link
            href="/login"
            className="hover:text-brand-700 transition-colors"
          >
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}