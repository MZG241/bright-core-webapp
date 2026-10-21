import { requireAdmin } from "@/app/lib/auth";
import { AdminSidebar } from "./components/AdminSidebar";
import { UserMenu } from "./components/UserMenu";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();

  const initials = session.name
    .split(" ")
    .filter((w) => w.length > 0)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div className="h-screen flex bg-slate-50 overflow-hidden">
      <AdminSidebar userName={session.name} />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 shrink-0 border-b border-slate-200 bg-white flex items-center justify-end px-4 sm:px-6">
        <UserMenu
            name={session.name}
            email={session.email}
            initials={initials}
          />
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}