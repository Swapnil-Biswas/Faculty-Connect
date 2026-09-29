import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDashboardPath } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");
  redirect(getDashboardPath(session.user.role));
}