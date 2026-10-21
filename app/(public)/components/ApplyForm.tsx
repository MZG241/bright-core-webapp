"use client";

import {
  useActionState,
  useState,
  useRef,
  useCallback,
  useEffect,
  startTransition,
} from "react";
import { useForm } from "react-hook-form";
import {
  Loader2,
  CheckCircle2,
  Upload,
  X,
  FileText,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import {
  type ApplicationInput,
  applicationSchema,
  validateCvFile,
} from "@/app/lib/validations/application";
import { type ApplyState, submitApplication } from "@/app/actions/applications";

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow";

const btnClass =
  "w-full inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60 transition-colors shadow-sm";

type ConsentInput = ApplicationInput & { consent: boolean };

export function ApplyForm({ slug }: { slug: string }) {
  const [state, formAction, isPending] = useActionState<ApplyState, FormData>(
    submitApplication,
    null
  );
  const [cvName, setCvName] = useState<string>("");
  const [cvSize, setCvSize] = useState<number>(0);
  const [cvError, setCvError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [consent, setConsent] = useState(false);
  const [consentError, setConsentError] = useState<string | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const {
    register,
    getValues,
    setError,
    formState: { errors },
  } = useForm<ConsentInput>();

  
  useEffect(() => {
    if (!isUploading) return;
    if (uploadProgress >= 100) {
      const t = setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 400);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      setUploadProgress((p) => Math.min(100, p + 15));
    }, 120);
    return () => clearTimeout(t);
  }, [isUploading, uploadProgress]);

  const applyFile = useCallback((file: File | null) => {
    setCvName(file?.name ?? "");
    setCvSize(file?.size ?? 0);
    const err = validateCvFile(file);
    setCvError(err);
    if (!err && file) {
      setUploadProgress(0);
      setIsUploading(true);
    }
  }, []);

  if (state?.success) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center space-y-4">
        <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto" />
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Application submitted
          </h2>
          <p className="text-sm text-slate-600 mt-1.5">{state.success}</p>
        </div>
        <Link
          href="/"
          className="inline-flex cursor-pointer items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          ← Back to all jobs
        </Link>
      </div>
    );
  }

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    applyFile(e.target.files?.[0] ?? null);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0] ?? null;
    if (!file) return;
    const dt = new DataTransfer();
    dt.items.add(file);
    if (fileInputRef.current) fileInputRef.current.files = dt.files;
    applyFile(file);
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const removeFile = () => {
    setCvName("");
    setCvSize(0);
    setCvError(null);
    setIsUploading(false);
    setUploadProgress(0);
    setFileInputKey((k) => k + 1);
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!consent) {
      setConsentError("You must agree before submitting.");
      return;
    }
    setConsentError(null);

    const parsed = applicationSchema.safeParse(getValues());
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        setError(issue.path[0] as keyof ConsentInput, {
          message: issue.message,
        });
      }
      return;
    }

    const file = fileInputRef.current?.files?.[0] ?? null;
    const fileErr = validateCvFile(file);
    if (fileErr) {
      setCvError(fileErr);
      return;
    }
    setCvError(null);

    const fd = new FormData();
    fd.set("slug", slug);
    fd.set("fullName", parsed.data.fullName);
    fd.set("email", parsed.data.email);
    fd.set("phone", parsed.data.phone);
    fd.set("coverNote", parsed.data.coverNote ?? "");
    fd.set("cv", file!);

    startTransition(() => {
      formAction(fd);
    });
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm"
    >
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-slate-700">
          Full name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          placeholder="Adeline Muhire"
          autoComplete="name"
          {...register("fullName")}
          className={inputClass}
        />
        {errors.fullName && (
          <p className="text-xs text-red-600">{errors.fullName.message}</p>
        )}
        {state?.fieldErrors?.fullName && (
          <p className="text-xs text-red-600">{state.fieldErrors.fullName}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-slate-700">
          Email <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          placeholder="muhire@example.com"
          autoComplete="email"
          {...register("email")}
          className={inputClass}
        />
        {errors.email && (
          <p className="text-xs text-red-600">{errors.email.message}</p>
        )}
        {state?.fieldErrors?.email && (
          <p className="text-xs text-red-600">{state.fieldErrors.email}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-slate-700">
          Phone <span className="text-red-500">*</span>
        </label>
        <input
          type="tel"
          placeholder="+250 788 123 456"
          autoComplete="tel"
          {...register("phone")}
          className={inputClass}
        />
        {errors.phone && (
          <p className="text-xs text-red-600">{errors.phone.message}</p>
        )}
        {state?.fieldErrors?.phone && (
          <p className="text-xs text-red-600">{state.fieldErrors.phone}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-slate-700">
          Cover note <span className="text-slate-400">(optional)</span>
        </label>
        <textarea
          rows={4}
          placeholder="Tell us why you're a great fit…"
          {...register("coverNote")}
          className={`${inputClass} resize-y min-h-24`}
        />
        {errors.coverNote && (
          <p className="text-xs text-red-600">{errors.coverNote.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-slate-700">
          CV (PDF, max 5 MB) <span className="text-red-500">*</span>
        </label>

        <input
          key={fileInputKey}
          ref={fileInputRef}
          type="file"
          name="cv"
          accept="application/pdf,.pdf"
          onChange={onFileChange}
          className="sr-only"
          id="cv-upload"
        />

        {cvName ? (
          <div className="rounded-lg border border-brand-200 bg-brand-50 px-3 py-3">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-brand-600 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-brand-800 truncate">
                  {cvName}
                </p>
                <p className="text-xs text-brand-600">
                  {formatSize(cvSize)} · PDF
                </p>
              </div>
              {!isUploading && (
                <button
                  type="button"
                  onClick={removeFile}
                  className="shrink-0 p-1 cursor-pointer rounded text-brand-600 hover:bg-brand-100"
                  aria-label="Remove file"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {isUploading && (
              <div className="mt-3">
                <div className="h-1.5 w-full rounded-full bg-brand-100 overflow-hidden">
                  <div
                    className="h-full bg-brand-600 transition-all duration-150"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-xs text-brand-600 mt-1.5">
                  Uploading… {uploadProgress}%
                </p>
              </div>
            )}
          </div>
        ) : (
          <div
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-6 cursor-pointer transition-colors text-center ${
              isDragging
                ? "border-brand-400 bg-brand-50"
                : "border-slate-300 bg-slate-50 hover:border-brand-400 hover:bg-brand-50/30"
            }`}
          >
            <Upload
              className={`h-6 w-6 ${
                isDragging ? "text-brand-600" : "text-slate-400"
              }`}
            />
            <p className="text-sm text-slate-600">
              <span className="font-medium text-brand-600">Click to upload</span>{" "}
              or drag and drop
            </p>
            <p className="text-xs text-slate-400">PDF only · up to 5 MB</p>
          </div>
        )}

        {(cvError || state?.fieldErrors?.cv) && (
          <p className="inline-flex items-center gap-1 text-xs text-red-600">
            <AlertCircle className="h-3.5 w-3.5" />
            {cvError || state?.fieldErrors?.cv}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <label className="flex items-start gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => {
              setConsent(e.target.checked);
              if (e.target.checked) setConsentError(null);
            }}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-brand-600 focus:ring-brand-500 focus:ring-offset-0 cursor-pointer"
          />
          <span className="text-xs text-slate-600 leading-relaxed">
            I agree that BrightCore may process my application and contact me
            about this role. <span className="text-red-500">*</span>
          </span>
        </label>
        {consentError && (
          <p className="text-xs text-red-600">{consentError}</p>
        )}
      </div>

      {state?.error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending || !consent || isUploading}
        className={btnClass}
      >
        {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        {isPending ? "Submitting…" : "Submit application"}
      </button>

      <p className="text-[11px] text-slate-400 text-center leading-relaxed">
        Your data is only used to process this application.
      </p>
    </form>
  );
}