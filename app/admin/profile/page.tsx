import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { requireAdmin } from "@/app/lib/auth";
import { PasswordForm, ProfileForm } from "../components/ProfileForms";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await requireAdmin();

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);

  if (!user) {
    return (
      <div className="max-w-2xl">
        <p className="text-sm text-red-600">User not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
          Profile
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your account information and password.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-900">{user.name}</p>
          <p className="text-xs text-slate-500 mt-0.5">{user.email}</p>
        </div>
        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-600 uppercase tracking-wide">
          {user.role}
        </span>
      </div>

      <ProfileForm defaultName={user.name} defaultEmail={user.email} />
      <PasswordForm />
    </div>
  );
}