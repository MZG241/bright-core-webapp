"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { ApplicationDrawer } from "./ApplicationDrawer";
import type { Application } from "@/db/schema";

export function ApplicationRowActions({
  application,
}: {
  application: Application;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="inline-flex items-center gap-1">
        <a
          href={`/api/cv/${application.id}`}
          className="inline-flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-slate-600 hover:text-brand-700 hover:bg-slate-100 transition-colors"
        >
          <Download className="h-3 w-3" />
          CV
        </a>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-brand-600 hover:bg-brand-50 transition-colors"
        >
          View
        </button>
      </div>

      {open && (
        <ApplicationDrawer
          application={application}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}