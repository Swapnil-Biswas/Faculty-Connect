import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { db } from "@/lib/db";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");

  // Fetch recent notifications (last 20)
  const notifications = await db.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const serializedNotifs = notifications.map((n) => ({
    id: n.id,
    title: n.title,
    message: n.message,
    isRead: n.isRead,
    createdAt: n.createdAt.toISOString(),
    eventType: n.eventType,
  }));

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Topbar title="Faculty Connect" notifications={serializedNotifs} />
        <main className="page-content">{children}</main>
      </div>
    </div>
  );
}