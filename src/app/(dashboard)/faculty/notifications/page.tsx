import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { NotificationsClient } from "./NotificationsClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Faculty Workspace — Notifications" };

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const notifications = await db.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", paddingBottom: 40 }}>
      {/* 1. Page Header */}
      <PageHeader
        breadcrumbs={[
          { label: "Faculty Workspace", href: "/faculty" },
          { label: "Notifications" },
        ]}
        title="Institutional Notification Center"
        subtitle="Chronological feed of task assignments, leave decision outcomes, and recognition credits."
      />

      <NotificationsClient
        initialNotifications={notifications.map((n) => ({
          id: n.id,
          title: n.title,
          message: n.message,
          eventType: n.eventType,
          isRead: n.isRead,
          deepLink: n.deepLink,
          createdAt: n.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
