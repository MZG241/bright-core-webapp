import Link from "next/link";
import { MapPin, Clock, ArrowUpRight } from "lucide-react";
import type { Job } from "@/db/schema";

const EMPLOYMENT_LABELS: Record<Job["employmentType"], string> = {
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  CONTRACT: "Contract",
  INTERNSHIP: "Internship",
};

function getClosingInfo(date: Date): {
  label: string;
  tone: "urgent" | "soon" | "normal";
} {
  const days = Math.ceil(
    (date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  if (days <= 0) return { label: "Closing today", tone: "urgent" };
  if (days === 1) return { label: "Closes tomorrow", tone: "urgent" };
  if (days <= 3) return { label: `Closes in ${days} days`, tone: "urgent" };
  if (days <= 7) return { label: `Closes in ${days} days`, tone: "soon" };
  return {
    label: `Closes ${date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
    })}`,
    tone: "normal",
  };
}

const TONE_CLASSES: Record<"urgent" | "soon" | "normal", string> = {
  urgent: "bg-red-50 text-red-700 border-red-200",
  soon: "bg-amber-50 text-amber-700 border-amber-200",
  normal: "bg-slate-100 text-slate-600 border-slate-200",
};

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export function JobCard({ job }: { job: Job }) {
  const closing = getClosingInfo(job.closingDate);
  const plainDescription = stripHtml(job.description);
  const preview =
    plainDescription.length > 140
      ? `${plainDescription.slice(0, 140).trimEnd()}…`
      : plainDescription;

  return (
    <Link
      href={`/jobs/${job.slug}`}
      className="group flex flex-col rounded-2xl border border-slate-200 bg-white overflow-hidden hover:border-brand-300 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
    >
      <div className="flex items-center justify-between gap-2 px-5 pt-5">
        <span className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-medium text-brand-700 border border-brand-100">
          {EMPLOYMENT_LABELS[job.employmentType]}
        </span>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] border ${TONE_CLASSES[closing.tone]}`}
        >
          <Clock className="h-3 w-3" />
          {closing.label}
        </span>
      </div>

      <div className="px-5 mt-3">
        <h3 className="text-base font-semibold text-slate-900 group-hover:text-brand-700 transition-colors line-clamp-2 leading-snug">
          {job.title}
        </h3>
      </div>

      <div className="mx-5 my-3 border-t border-slate-100" />

      <div className="px-5 flex items-center gap-1.5 text-xs text-slate-500">
        <MapPin className="h-3.5 w-3.5 text-slate-400" />
        {job.location}
      </div>

      <div className="mx-5 my-3 border-t border-slate-100" />

      <p className="px-5 text-sm text-slate-600 leading-relaxed line-clamp-3 flex-1">
        {preview}
      </p>

      <div className="mt-4 border-t border-slate-100 bg-brand-50 group-hover:bg-brand-100 transition-colors rounded-b-2xl">
        <div className="px-5 py-3 flex items-center justify-between">
          <span className="text-sm font-medium text-brand-700">View role</span>
          <ArrowUpRight className="h-4 w-4 text-brand-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </div>
      </div>
    </Link>
  );
}