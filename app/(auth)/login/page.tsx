import { redirect } from "next/navigation";
import { getSession } from "@/app/lib/auth";
import LoginPageClient from "./LoginPageClient";

export default async function LoginPage() {
  const session = await getSession();
  if (session?.role === "ADMIN") {
    redirect("/admin");
  }
  return <LoginPageClient />;
}