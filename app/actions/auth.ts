"use server";

import { redirect } from "next/navigation";
import { randomInt, createHash } from "crypto";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import {
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
} from "../lib/validations/auth";
import {
  authenticate,
  createSession,
  destroySession,
  hashPassword,
} from "../lib/auth";
import { sendMail } from "../lib/mailer";

export type LoginState = { error?: string } | null;
export type ForgotState = { success?: string; error?: string } | null;
export type ResetState = { success?: string; error?: string } | null;


const forgotAttempts = new Map<string, { count: number; resetAt: number }>();
const FORGOT_WINDOW_MS = 15 * 60 * 1000;
const FORGOT_MAX = 3;
const CODE_MAX_ATTEMPTS = 5;

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const entry = forgotAttempts.get(key);
  if (!entry || now > entry.resetAt) {
    forgotAttempts.set(key, { count: 1, resetAt: now + FORGOT_WINDOW_MS });
    return false;
  }
  if (entry.count >= FORGOT_MAX) return true;
  entry.count += 1;
  return false;
}


function sha256(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}


export async function loginAction(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const user = await authenticate(parsed.data.email, parsed.data.password);
  if (!user) {
    return { error: "Invalid email or password" };
  }

  await createSession({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });

  redirect("/admin");
}


export async function logoutAction() {
  await destroySession();
  redirect("/login");
}


export async function forgotPasswordAction(
  _prev: ForgotState,
  formData: FormData
): Promise<ForgotState> {
  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const email = parsed.data.email.toLowerCase().trim();

  if (isRateLimited(email)) {
    return {
      error: "Too many requests. Please wait a few minutes before retrying.",
    };
  }

  const successMessage =
    "If an account exists with this email, a 6-digit code has been sent.";

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user) {
    return { success: successMessage };
  }

  const code = randomInt(0, 1_000_000).toString().padStart(6, "0");
  const codeHash = sha256(code);
  const expiresAt = new Date(Date.now() + 1000 * 60 * 15);

  await db
    .update(users)
    .set({
      resetCodeHash: codeHash,
      resetCodeExpiresAt: expiresAt,
      resetCodeAttempts: 0,
      updatedAt: new Date(),
    })
    .where(eq(users.id, user.id));

  try {
    await sendMail({
      to: user.email,
      subject: "Your BrightCore password reset code",
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px">
          <h2 style="color:#0f172a">Password reset code</h2>
          <p style="color:#475569">Hi ${escapeHtml(user.name)},</p>
          <p style="color:#475569">
            Use the code below to reset your BrightCore admin password.
            It expires in 15 minutes.
          </p>
          <div style="margin:24px 0;padding:16px;background:#f1f5f9;border-radius:8px;text-align:center">
            <span style="font-size:32px;font-weight:700;letter-spacing:8px;color:#0f172a">
              ${code}
            </span>
          </div>
          <p style="color:#94a3b8;font-size:12px">
            If you didn't request this, you can safely ignore this email.
          </p>
        </div>
      `,
    });
  } catch (err) {
    console.error("SMTP error:", err);
    await db
      .update(users)
      .set({ resetCodeHash: null, resetCodeExpiresAt: null })
      .where(eq(users.id, user.id));
    return { error: "Could not send email. Please try again later." };
  }

  return { success: successMessage };
}


export async function resetPasswordAction(
  _prev: ResetState,
  formData: FormData
): Promise<ResetState> {
  const parsed = resetPasswordSchema.safeParse({
    email: formData.get("email"),
    code: formData.get("code"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const email = parsed.data.email.toLowerCase().trim();
  const codeHash = sha256(parsed.data.code);

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user || !user.resetCodeHash || !user.resetCodeExpiresAt) {
    return { error: "Invalid or expired code." };
  }

  if (user.resetCodeExpiresAt.getTime() < Date.now()) {
    return { error: "Code has expired. Please request a new one." };
  }

  if (user.resetCodeAttempts >= CODE_MAX_ATTEMPTS) {
    return { error: "Too many attempts. Please request a new code." };
  }

  if (user.resetCodeHash !== codeHash) {
    await db
      .update(users)
      .set({ resetCodeAttempts: sql`${users.resetCodeAttempts} + 1` })
      .where(eq(users.id, user.id));
    return { error: "Invalid or expired code." };
  }

  const newPasswordHash = await hashPassword(parsed.data.password);

  await db
    .update(users)
    .set({
      passwordHash: newPasswordHash,
      resetCodeHash: null,
      resetCodeExpiresAt: null,
      resetCodeAttempts: 0,
      updatedAt: new Date(),
    })
    .where(eq(users.id, user.id));

  return {
    success: "Password updated. You can now sign in with your new password.",
  };
}