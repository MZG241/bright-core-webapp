"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function ApplyButton({ slug }: { slug: string }) {
  return (
    <Link
      href={`/jobs/${slug}/apply`}
      className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-700 transition-colors shadow-sm"
    >
      Apply for this job
      <ArrowRight className="h-4 w-4" />
    </Link>
  );
}