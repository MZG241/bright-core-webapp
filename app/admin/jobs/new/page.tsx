import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { JobForm } from "../../components/JobForm";

export default function NewJobPage() {
  return (
    <div className="max-w-4xl space-y-6">
      <Link
        href="/admin/jobs"
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand-700 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to jobs
      </Link>

      <div>
        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
          New job
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Create a new position and start accepting applications.
        </p>
      </div>

      <JobForm mode="create" />
    </div>
  );
}