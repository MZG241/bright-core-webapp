"use client";

import {
  useState,
  useEffect,
  useActionState,
  startTransition,
} from "react";
import Link from "next/link";
import { useForm, type UseFormRegisterReturn } from "react-hook-form";
import {
  Loader2,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  Briefcase,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import {
  loginAction,
  forgotPasswordAction,
  resetPasswordAction,
  type LoginState,
  type ForgotState,
  type ResetState,
} from "../../actions/auth";
import {
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  type LoginInput,
  type ForgotPasswordInput,
  type ResetPasswordInput,
} from "../../lib/validations/auth";

type Mode = "login" | "forgot" | "reset";

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow";

const btnClass =
  "w-full inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60 transition-colors shadow-sm";

function PasswordField({
  placeholder,
  autoComplete,
  registration,
  error,
}: {
  placeholder: string;
  autoComplete: string;
  registration: UseFormRegisterReturn;
  error?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          placeholder={placeholder}
          autoComplete={autoComplete}
          {...registration}
          className={`${inputClass} pr-10`}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          tabIndex={-1}
          className="absolute right-2 cursor-pointer top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}

export default function LoginPage() {



  const [mode, setMode] = useState<Mode>("login");
  const [resetEmail, setResetEmail] = useState("");

  const [year, setYear] = useState<number | null>(null);
  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <aside className="hidden md:flex flex-col justify-between bg-brand-950 text-white p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-brand-500 blur-3xl" />
          <div className="absolute bottom-0 -left-24 h-96 w-96 rounded-full bg-brand-400 blur-3xl" />
        </div>

        <div className="relative">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-brand-500 flex items-center justify-center font-bold text-white">
              B
            </div>
            <span className="text-lg font-semibold tracking-tight">
              BrightCore
            </span>
          </Link>
        </div>

        <div className="relative space-y-8 max-w-md">
          <h2 className="text-4xl font-semibold leading-tight tracking-tight">
            Manage your hiring,
            <br />
            <span className="text-brand-300">all in one place.</span>
          </h2>
          <p className="text-brand-200 text-base leading-relaxed">
            Review applications, post new openings and keep candidates moving —
            from a single dashboard built for your team.
          </p>

          <ul className="space-y-4 pt-4">
            <Feature
              icon={<Briefcase className="h-5 w-5" />}
              title="Post and manage jobs"
              desc="Create, edit and close openings in seconds."
            />
            <Feature
              icon={<ShieldCheck className="h-5 w-5" />}
              title="Review with confidence"
              desc="Accept or reject applicants with clear notes."
            />
            <Feature
              icon={<Sparkles className="h-5 w-5" />}
              title="Stay organized"
              desc="Filter by status and track every application."
            />
          </ul>
        </div>

        <p className="relative text-xs text-brand-300">
          © {year ?? ""} BrightCore. All rights reserved.
        </p>
      </aside>

      <main className="flex items-center justify-center bg-slate-50 px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="md:hidden mb-8 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-slate-900"
            >
              <div className="h-9 w-9 rounded-lg bg-brand-600 flex items-center justify-center font-bold text-white">
                B
              </div>
              <span className="text-lg font-semibold tracking-tight">
                BrightCore
              </span>
            </Link>
          </div>

          {mode === "login" && <LoginForm onForgot={() => setMode("forgot")} />}
          {mode === "forgot" && (
            <ForgotForm
              onBack={() => setMode("login")}
              onCodeSent={(email) => {
                setResetEmail(email);
                setMode("reset");
              }}
            />
          )}
          {mode === "reset" && (
            <ResetForm email={resetEmail} onBack={() => setMode("login")} />
          )}
        </div>
      </main>
    </div>
  );
}

function Feature({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <li className="flex items-start gap-3">
      <div className="mt-0.5 h-9 w-9 shrink-0 rounded-lg bg-brand-800/60 border border-brand-700 flex items-center justify-center text-brand-300">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-white">{title}</p>
        <p className="text-sm text-brand-200/80">{desc}</p>
      </div>
    </li>
  );
}

function LoginForm({ onForgot }: { onForgot: () => void }) {
  const [state, formAction, isPending] = useActionState<LoginState, FormData>(
    loginAction,
    null
  );

  const {
    register,
    getValues,
    setError,
    formState: { errors },
  } = useForm<LoginInput>();

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const parsed = loginSchema.safeParse(getValues());
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        setError(issue.path[0] as keyof LoginInput, {
          message: issue.message,
        });
      }
      return;
    }
    const fd = new FormData();
    fd.set("email", parsed.data.email);
    fd.set("password", parsed.data.password);
    startTransition(() => {
      formAction(fd);
    });
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
          Welcome back
        </h1>
        <p className="text-sm text-slate-500 mt-1.5">
          Sign in to your admin account to continue.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            type="email"
            placeholder="admin@brightcore.test"
            autoComplete="email"
            {...register("email")}
            className={inputClass}
          />
          {errors.email && (
            <p className="text-xs text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-slate-700">
              Password
            </label>
            <button
              type="button"
              onClick={onForgot}
              className="text-xs cursor-pointer font-medium text-brand-600 hover:text-brand-700 hover:underline"
            >
              Forgot password?
            </button>
          </div>
          <PasswordField
            placeholder="••••••••"
            autoComplete="current-password"
            registration={register("password")}
            error={errors.password?.message}
          />
        </div>

        {state?.error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {state.error}
          </p>
        )}

        <button type="submit" disabled={isPending} className={btnClass}>
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {isPending ? "Signing in…" : "Sign in"}
        </button>

        <div className="text-center pt-2">
          <Link href="/" className="text-xs cursor-pointer text-slate-500 hover:text-slate-900">
            ← Back to careers
          </Link>
        </div>
      </form>
    </>
  );
}

function ForgotForm({
  onBack,
  onCodeSent,
}: {
  onBack: () => void;
  onCodeSent: (email: string) => void;
}) {
  const [state, formAction, isPending] = useActionState<ForgotState, FormData>(
    forgotPasswordAction,
    null
  );

  const {
    register,
    getValues,
    setError,
    formState: { errors },
  } = useForm<ForgotPasswordInput>();

  if (state?.success) {
    onCodeSent(getValues("email"));
    return null;
  }

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const parsed = forgotPasswordSchema.safeParse(getValues());
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        setError(issue.path[0] as keyof ForgotPasswordInput, {
          message: issue.message,
        });
      }
      return;
    }
    const fd = new FormData();
    fd.set("email", parsed.data.email);
    startTransition(() => {
      formAction(fd);
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 mb-6"
      >
        <ArrowLeft className="h-3 w-3" /> Back
      </button>

      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
          Forgot password?
        </h1>
        <p className="text-sm text-slate-500 mt-1.5">
          We&apos;ll email you a 6-digit code to reset your password.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            type="email"
            placeholder="admin@brightcore.test"
            autoComplete="email"
            {...register("email")}
            className={inputClass}
          />
          {errors.email && (
            <p className="text-xs text-red-600">{errors.email.message}</p>
          )}
        </div>

        {state?.error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {state.error}
          </p>
        )}

        <button type="submit" disabled={isPending} className={btnClass}>
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {isPending ? "Sending…" : "Send code"}
        </button>
      </form>
    </>
  );
}

function ResetForm({ email, onBack }: { email: string; onBack: () => void }) {
  const [state, formAction, isPending] = useActionState<ResetState, FormData>(
    resetPasswordAction,
    null
  );

  const {
    register,
    getValues,
    setError,
    formState: { errors },
  } = useForm<ResetPasswordInput>({ defaultValues: { email } });

  if (state?.success) {
    return (
      <div className="text-center space-y-5">
        <CheckCircle2 className="h-14 w-14 text-brand-600 mx-auto" />
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
            Password updated
          </h1>
          <p className="text-sm text-slate-500 mt-1.5">{state.success}</p>
        </div>
        <button type="button" onClick={onBack} className={btnClass}>
          Back to sign in
        </button>
      </div>
    );
  }

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const parsed = resetPasswordSchema.safeParse(getValues());
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        setError(issue.path[0] as keyof ResetPasswordInput, {
          message: issue.message,
        });
      }
      return;
    }
    const fd = new FormData();
    fd.set("email", parsed.data.email);
    fd.set("code", parsed.data.code);
    fd.set("password", parsed.data.password);
    fd.set("confirmPassword", parsed.data.confirmPassword);
    startTransition(() => {
      formAction(fd);
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 mb-6"
      >
        <ArrowLeft className="h-3 w-3" /> Back
      </button>

      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
          Enter your code
        </h1>
        <p className="text-sm text-slate-500 mt-1.5">
          We sent a 6-digit code to <strong>{email}</strong>. It expires in 15
          minutes.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        <input type="hidden" {...register("email")} />

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">
            6-digit code
          </label>
          <input
            inputMode="numeric"
            maxLength={6}
            placeholder="123456"
            autoComplete="one-time-code"
            {...register("code")}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-center text-lg tracking-[0.5em] font-mono focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
          {errors.code && (
            <p className="text-xs text-red-600">{errors.code.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">
            New password
          </label>
          <PasswordField
            placeholder="••••••••"
            autoComplete="new-password"
            registration={register("password")}
            error={errors.password?.message}
          />
          <p className="text-xs text-slate-500">
            Min. 8 chars, 1 uppercase, 1 lowercase, 1 number.
          </p>
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">
            Confirm password
          </label>
          <PasswordField
            placeholder="••••••••"
            autoComplete="new-password"
            registration={register("confirmPassword")}
            error={errors.confirmPassword?.message}
          />
        </div>

        {state?.error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {state.error}
          </p>
        )}

        <button type="submit" disabled={isPending} className={btnClass}>
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {isPending ? "Updating…" : "Update password"}
        </button>
      </form>
    </>
  );
}