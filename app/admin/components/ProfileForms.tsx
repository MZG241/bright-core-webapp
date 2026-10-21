"use client";

import { useActionState, startTransition } from "react";
import { useForm } from "react-hook-form";
import { Loader2, CheckCircle2 } from "lucide-react";
import {
  updateProfileAction,
  changePasswordAction,
  type ProfileState,
} from "@/app/actions/profile";
import {
  profileSchema,
  passwordSchema,
  type ProfileInput,
  type PasswordInput,
} from "@/app/lib/validations/profile";

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent";

const btnClass =
  "inline-flex items-center cursor-pointer justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60 transition-colors";

export function ProfileForm({
  defaultName,
  defaultEmail,
}: {
  defaultName: string;
  defaultEmail: string;
}) {
  const [state, formAction, isPending] = useActionState<ProfileState, FormData>(
    updateProfileAction,
    null
  );

  const {
    register,
    getValues,
    setError,
    formState: { errors },
  } = useForm<ProfileInput>({
    defaultValues: { name: defaultName, email: defaultEmail },
  });

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const parsed = profileSchema.safeParse(getValues());
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        setError(issue.path[0] as keyof ProfileInput, {
          message: issue.message,
        });
      }
      return;
    }
    const fd = new FormData();
    fd.set("name", parsed.data.name);
    fd.set("email", parsed.data.email);
    startTransition(() => {
      formAction(fd);
    });
  };

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4"
    >
      <div>
        <h2 className="text-sm font-semibold text-slate-900">
          Personal information
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Update your name and email address.
        </p>
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-slate-700">
          Name
        </label>
        <input type="text" {...register("name")} className={inputClass} />
        {errors.name && (
          <p className="text-xs text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-slate-700">
          Email
        </label>
        <input type="email" {...register("email")} className={inputClass} />
        {errors.email && (
          <p className="text-xs text-red-600">{errors.email.message}</p>
        )}
      </div>

      {state?.error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {state.error}
        </p>
      )}
      {state?.success && (
        <p className="inline-flex items-center gap-1.5 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
          <CheckCircle2 className="h-4 w-4" />
          {state.success}
        </p>
      )}

      <button type="submit" disabled={isPending} className={btnClass}>
        {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        {isPending ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}

export function PasswordForm() {
  const [state, formAction, isPending] = useActionState<ProfileState, FormData>(
    changePasswordAction,
    null
  );

  const {
    register,
    getValues,
    setError,
    formState: { errors },
  } = useForm<PasswordInput>();

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const parsed = passwordSchema.safeParse(getValues());
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        setError(issue.path[0] as keyof PasswordInput, {
          message: issue.message,
        });
      }
      return;
    }
    const fd = new FormData();
    fd.set("currentPassword", parsed.data.currentPassword);
    fd.set("newPassword", parsed.data.newPassword);
    fd.set("confirmPassword", parsed.data.confirmPassword);
    startTransition(() => {
      formAction(fd);
    });
  };

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4"
    >
      <div>
        <h2 className="text-sm font-semibold text-slate-900">
          Change password
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Use a strong password you don&apos;t use elsewhere.
        </p>
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-slate-700">
          Current password
        </label>
        <input
          type="password"
          autoComplete="current-password"
          {...register("currentPassword")}
          className={inputClass}
        />
        {errors.currentPassword && (
          <p className="text-xs text-red-600">
            {errors.currentPassword.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-slate-700">
          New password
        </label>
        <input
          type="password"
          autoComplete="new-password"
          {...register("newPassword")}
          className={inputClass}
        />
        {errors.newPassword && (
          <p className="text-xs text-red-600">{errors.newPassword.message}</p>
        )}
        <p className="text-xs text-slate-500">
          Min. 8 chars, 1 uppercase, 1 lowercase, 1 number.
        </p>
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-slate-700">
          Confirm new password
        </label>
        <input
          type="password"
          autoComplete="new-password"
          {...register("confirmPassword")}
          className={inputClass}
        />
        {errors.confirmPassword && (
          <p className="text-xs text-red-600">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      {state?.error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {state.error}
        </p>
      )}
      {state?.success && (
        <p className="inline-flex items-center gap-1.5 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
          <CheckCircle2 className="h-4 w-4" />
          {state.success}
        </p>
      )}

      <button type="submit" disabled={isPending} className={btnClass}>
        {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        {isPending ? "Updating…" : "Update password"}
      </button>
    </form>
  );
}