import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getDashboardPath } from "@/lib/utils";

export default async function HomePage() {
  const session = await auth();
  if (session) {
    redirect(getDashboardPath(session.user.role));
  }
  redirect("/login");
}