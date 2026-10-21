"use client";

import { useActionState, useState, useEffect, startTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { RichTextEditor } from "./RichTextEditor";
import { RequirementsInput } from "./RequirementsInput";
import {
  createJobAction,
  updateJobAction,
  toggleJobStatusAction,
  type JobFormState,
} from "@/app/actions/jobs";
import { jobSchema, employmentTypeValues } from "@/app/lib/validations/job";

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent";

const btnPrimary =
  "inline-flex items-center cursor-pointer justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60 transition-colors";

const btnSecondary =
  "inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors";

type JobFormProps =
  | { mode: "create" }
  | {
      mode: "edit";
      jobId: string;
      defaultValues: {
        title: string;
        location: string;
        employmentType: string;
        description: string;
        requirements: string[];
        closingDate: string;
      };
      initialStatus: "OPEN" | "CLOSED";
    };

export function JobForm(props: JobFormProps) {
  const router = useRouter();

  const initialValues =
    props.mode === "edit"
      ? {
          ...props.defaultValues,
          requirements: Array.isArray(props.defaultValues.requirements)
            ? props.defaultValues.requirements
            : [],
        }
      : {
          title: "",
          location: "",
          employmentType: "FULL_TIME",
          description: "",
          requirements: [] as string[],
          closingDate: "",
        };

  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"OPEN" | "CLOSED">(
    props.mode === "edit" ? props.initialStatus : "OPEN"
  );
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);

  const today = new Date().toISOString().slice(0, 10);

  const action =
    props.mode === "create"
      ? createJobAction
      : updateJobAction.bind(null, props.jobId);

  const [state, formAction, isPending] = useActionState<JobFormState, FormData>(
    action,
    null
  );

  useEffect(() => {
    if (state?.fieldErrors) setErrors(state.fieldErrors);
  }, [state]);

  const set = <K extends keyof typeof values>(
    key: K,
    value: (typeof values)[K]
  ) => {
    setValues((v) => ({ ...v, [key]: value }));
    if (errors[key as string]) {
      setErrors((e) => {
        const next = { ...e };
        delete next[key as string];
        return next;
      });
    }
  };

  const onToggleStatus = () => {
    if (props.mode !== "edit") return;
    const next: "OPEN" | "CLOSED" = status === "OPEN" ? "CLOSED" : "OPEN";
    setIsTogglingStatus(true);
    startTransition(async () => {
      try {
        await toggleJobStatusAction(props.jobId, next);
        setStatus(next);
        router.refresh();
      } catch (err) {
        console.error("toggleJobStatus error:", err);
      } finally {
        setIsTogglingStatus(false);
      }
    });
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const normalizedRequirements = Array.isArray(values.requirements)
      ? values.requirements
      : typeof values.requirements === "string"
      ? (values.requirements as string)
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    const parsed = jobSchema.safeParse({
      ...values,
      requirements: normalizedRequirements,
    });

    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0]?.toString() ?? "form";
        if (!next[key]) next[key] = issue.message;
      }
      setErrors(next);
      return;
    }

    const fd = new FormData();
    fd.set("title", parsed.data.title);
    fd.set("location", parsed.data.location);
    fd.set("employmentType", parsed.data.employmentType);
    fd.set("description", parsed.data.description);
    fd.set("requirements", JSON.stringify(parsed.data.requirements));
    fd.set("closingDate", parsed.data.closingDate);

    startTransition(() => {
      formAction(fd);
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {props.mode === "edit" && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 flex items-center justify-between gap-3 flex-wrap">
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-900">
              Job status
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {status === "OPEN"
                ? "This job is visible on the public site and accepting applications."
                : "This job is hidden from the public site and not accepting applications."}
            </p>
          </div>
          <button
            type="button"
            onClick={onToggleStatus}
            disabled={isTogglingStatus}
            className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors disabled:opacity-60 ${
              status === "OPEN"
                ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
                : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
            }`}
          >
            {isTogglingStatus ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : status === "OPEN" ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
            {isTogglingStatus
              ? "Updating…"
              : status === "OPEN"
              ? "Close job"
              : "Reopen job"}
          </button>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={values.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="Senior Full Stack Developer"
            className={inputClass}
          />
          {errors.title && (
            <p className="text-xs text-red-600">{errors.title}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">
            Location <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={values.location}
            onChange={(e) => set("location", e.target.value)}
            placeholder="Kigali, Rwanda"
            className={inputClass}
          />
          {errors.location && (
            <p className="text-xs text-red-600">{errors.location}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">
            Employment type <span className="text-red-500">*</span>
          </label>
          <select
            value={values.employmentType}
            onChange={(e) => set("employmentType", e.target.value)}
            className={inputClass}
          >
            {employmentTypeValues.map((v) => (
              <option key={v} value={v}>
                {v.replace("_", " ")}
              </option>
            ))}
          </select>
          {errors.employmentType && (
            <p className="text-xs text-red-600">{errors.employmentType}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">
            Closing date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={values.closingDate}
            min={today}
            onChange={(e) => set("closingDate", e.target.value)}
            className={inputClass}
          />
          {errors.closingDate && (
            <p className="text-xs text-red-600">{errors.closingDate}</p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-slate-700">
          Description <span className="text-red-500">*</span>
        </label>
        <RichTextEditor
          value={values.description}
          onChange={(html) => set("description", html)}
          placeholder="Describe the role…"
        />
        {errors.description && (
          <p className="text-xs text-red-600">{errors.description}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-slate-700">
          Requirements <span className="text-red-500">*</span>
        </label>
        <RequirementsInput
          value={values.requirements}
          onChange={(next) => set("requirements", next)}
          error={errors.requirements}
        />
      </div>

      {state?.error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {state.error}
        </p>
      )}

      <div className="flex items-center gap-2">
        <button type="submit" disabled={isPending} className={btnPrimary}>
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {isPending
            ? "Saving…"
            : props.mode === "create"
            ? "Create job"
            : "Save changes"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/jobs")}
          className={btnSecondary}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}