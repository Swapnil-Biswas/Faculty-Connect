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
    <div style={{ padding: "28px 32px", display: "flex", flexDirection: "column", gap: 24 }}>
      {/* 1. BMSIT Dot Matrix Page Header */}
      <PageHeader
        breadcrumbs={[
          { label: "Faculty Workspace", href: "/faculty" },
          { label: "Notifications" },
        ]}
        eyebrow="FACULTY // TELEMETRY & ALERTS"
        dotMatrixText="ALERTS"
        dotMatrixFontSize={36}
        title="Institutional Notification Center"
        ghost="inbox."
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
