"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  Mail,
  Phone,
  Download,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { ApplicationStatusBadge } from "./ApplicationStatusBadge";
import type { Application } from "@/db/schema";
import { updateApplicationStatusAction } from "@/app/actions/applications";

type Props = {
  application: Application | null;
  onClose: () => void;
};

export function ApplicationDrawer({ application, onClose }: Props) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [pendingAction, setPendingAction] = useState<
    "ACCEPTED" | "REJECTED" | null
  >(null);

  if (!application) return null;

  const handleAction = (status: "ACCEPTED" | "REJECTED") => {
    setError(null);
    setPendingAction(status);
    startTransition(async () => {
      const res = await updateApplicationStatusAction(
        application.id,
        status,
        note
      );
      setPendingAction(null);
      if (res?.error) {
        setError(res.error);
        return;
      }
      setNote("");
      router.refresh();
      onClose();
    });
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-slate-900/40 z-40"
        onClick={() => !isPending && onClose()}
      />
      <aside className="fixed inset-y-0 right-0 w-full max-w-md z-50 bg-white shadow-2xl flex flex-col overflow-hidden">
        <header className="h-16 shrink-0 flex items-center justify-between px-5 border-b border-slate-200">
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-semibold text-slate-900 truncate">
              {application.fullName}
            </h2>
            <p className="text-xs text-slate-500 truncate">
              {application.email}
            </p>
          </div>
          <button
            type="button"
            onClick={() => !isPending && onClose()}
            className="shrink-0 inline-flex items-center justify-center h-8 w-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 ml-2"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto overflow-x-hidden p-5 space-y-5">
          <div className="flex items-center justify-between gap-2">
            <ApplicationStatusBadge status={application.status} />
            <span className="text-xs text-slate-400 shrink-0">
              {application.createdAt.toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>

          <div className="space-y-2">
            <a
              href={`mailto:${application.email}`}
              className="flex items-start gap-2 text-sm text-slate-700 hover:text-brand-700 break-all"
            >
              <Mail className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
              <span className="min-w-0">{application.email}</span>
            </a>
            <a
              href={`tel:${application.phone}`}
              className="flex items-start gap-2 text-sm text-slate-700 hover:text-brand-700 break-words"
            >
              <Phone className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
              <span className="min-w-0">{application.phone}</span>
            </a>
          </div>

          <div className="border-t border-slate-200" />

          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
              CV
            </p>
            <a
              href={`/api/cv/${application.id}`}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors max-w-full"
            >
              <Download className="h-4 w-4 shrink-0" />
              <span className="truncate">{application.cvFileName}</span>
            </a>
          </div>

          {application.coverNote && (
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                Cover note
              </p>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line break-words">
                {application.coverNote}
              </p>
            </div>
          )}

          {application.adminNote && (
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                Admin note
              </p>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line break-words bg-slate-50 rounded-lg p-3 border border-slate-200">
                {application.adminNote}
              </p>
            </div>
          )}

          <div className="border-t border-slate-200" />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Add a note <span className="text-slate-400">(optional)</span>
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="Optional message to include in the email…"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-y"
            />
            <p className="text-[11px] text-slate-400">
              This note will be sent to the candidate in the email.
            </p>
          </div>

          {error && (
            <p className="inline-flex items-start gap-1.5 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 break-words">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <span className="min-w-0">{error}</span>
            </p>
          )}
        </div>

        <footer className="shrink-0 p-4 border-t border-slate-200 bg-slate-50 flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleAction("REJECTED")}
            disabled={isPending || application.status === "REJECTED"}
            className="flex-1 cursor-pointer inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
          >
            {pendingAction === "REJECTED" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            Reject
          </button>
          <button
            type="button"
            onClick={() => handleAction("ACCEPTED")}
            disabled={isPending || application.status === "ACCEPTED"}
            className="flex-1 cursor-pointer inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
          >
            {pendingAction === "ACCEPTED" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            Accept
          </button>
        </footer>
      </aside>
    </>
  );
}