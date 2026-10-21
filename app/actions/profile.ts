"use server";

import { eq, and, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { users } from "@/db/schema";
import { createSession, getSession, hashPassword, verifyPassword } from "../lib/auth";
import { passwordSchema, profileSchema } from "../lib/validations/profile";


export type ProfileState = { success?: string; error?: string } | null;

export async function updateProfileAction(
  _prev: ProfileState,
  formData: FormData
): Promise<ProfileState> {
  const session = await getSession();
  if (!session) return { error: "Not authenticated." };

  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const email = parsed.data.email.toLowerCase().trim();
  const name = parsed.data.name.trim();

  try {
    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.email, email), ne(users.id, session.userId)))
      .limit(1);

    if (existing) {
      return { error: "This email is already in use." };
    }

    await db
      .update(users)
      .set({
        name,
        email,
        updatedAt: new Date(),
      })
      .where(eq(users.id, session.userId));

   await createSession({
      userId: session.userId,
      email,
      name,
      role: session.role,
    });

    revalidatePath("/admin/profile");
    revalidatePath("/admin");

    return { success: "Profile updated." };
  } catch (err) {
    console.error("updateProfile error:", err);
    return { error: "Could not update profile. Please try again." };
  }
}

export async function changePasswordAction(
  _prev: ProfileState,
  formData: FormData
): Promise<ProfileState> {
  const session = await getSession();
  if (!session) return { error: "Not authenticated." };

  const parsed = passwordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);

    if (!user) return { error: "User not found." };

    const valid = await verifyPassword(
      parsed.data.currentPassword,
      user.passwordHash
    );
    if (!valid) {
      return { error: "Current password is incorrect." };
    }

    const newHash = await hashPassword(parsed.data.newPassword);
    await db
      .update(users)
      .set({ passwordHash: newHash, updatedAt: new Date() })
      .where(eq(users.id, session.userId));

    return { success: "Password changed." };
  } catch (err) {
    console.error("changePassword error:", err);
    return { error: "Could not change password. Please try again." };
  }
}