"use client";

import { useState, useTransition } from "react";
import { Trash2, Loader2, AlertTriangle, X } from "lucide-react";
import { deleteJobAction } from "@/app/actions/jobs";


export function DeleteJobButton({
  jobId,
  jobTitle,
}: {
  jobId: string;
  jobTitle: string;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const onConfirm = () => {
    startTransition(async () => {
      try {
        await deleteJobAction(jobId);
        setOpen(false);
      } catch (err) {
        console.error(err);
        setOpen(false);
      }
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
      >
        <Trash2 className="h-3 w-3" />
        Delete
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 bg-slate-900/40 z-40"
            onClick={() => !isPending && setOpen(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl border border-slate-200 p-5">
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 shrink-0 rounded-full bg-red-50 flex items-center justify-center">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-sm font-semibold text-slate-900">
                    Delete this job?
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    <span className="font-medium text-slate-700">
                      {jobTitle}
                    </span>{" "}
                    and all its applications will be permanently deleted. This
                    cannot be undone.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => !isPending && setOpen(false)}
                  className="shrink-0 p-1 cursor-pointer rounded text-slate-400 hover:text-slate-600"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  disabled={isPending}
                  className="rounded-lg cursor-pointer border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={onConfirm}
                  disabled={isPending}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-60 transition-colors"
                >
                  {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  {isPending ? "Deleting…" : "Delete job"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}