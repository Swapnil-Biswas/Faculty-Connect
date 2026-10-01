import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { NotificationEventType } from "@prisma/client";
import { NotificationRulesClient } from "./NotificationRulesClient";

export default async function AdminNotificationsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  // Get current rules
  const rules = await db.notificationRule.findMany({
    orderBy: { eventType: "asc" },
  });

  // Ensure all event types are represented
  const allEventTypes = Object.values(NotificationEventType);
  const ruleMap = new Map(rules.map((r) => [r.eventType, r]));

  const combinedRules = allEventTypes.map((eventType) => {
    const existing = ruleMap.get(eventType);
    return {
      eventType,
      enabled: existing ? existing.enabled : true,
      threshold: existing?.threshold ?? null,
      updatedAt: existing?.updatedAt ? existing.updatedAt.toISOString() : null,
    };
  });

  return (
    <div className="page-content">
      <div style={{ marginBottom: 28 }}>
        <h1 className="page-title">Notification Rules Configuration</h1>
        <p className="page-subtitle">
          Configure automated departmental alerts, event triggers, and threshold settings.
        </p>
      </div>

      <NotificationRulesClient initialRules={combinedRules} />
    </div>
  );
}
