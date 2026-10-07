import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { NotificationEventType } from "@prisma/client";
import { NotificationRulesClient } from "./NotificationRulesClient";
import { PageHeader } from "@/components/ui/PageHeader";
import { MetricBlock } from "@/components/ui/MetricBlock";
import { Bell, CheckCircle2, BellOff } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notification Rules — Admin | Faculty Connect",
};

export default async function AdminNotificationsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  if (session.user.role !== "ADMIN") {
    redirect("/admin");
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

  const activeRulesCount = combinedRules.filter((r) => r.enabled).length;
  const inactiveRulesCount = combinedRules.length - activeRulesCount;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 24,
      }}
    >
      <PageHeader
        breadcrumbs={[
          { label: "Admin Console", href: "/admin" },
          { label: "Notification Rules" },
        ]}
        title="Notification Rules"
        subtitle="Configure automated departmental alerts, event triggers, and threshold settings across institutional lifecycle events."
        showDotMatrix={false}
        actions={
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 12px",
              borderRadius: 6,
              backgroundColor: "#FFFFFF",
              border: "1px solid #E4E7EC",
              fontSize: 12,
              fontWeight: 600,
              color: "#17202A",
            }}
          >
            <Bell size={14} color="#667085" />
            <span>{activeRulesCount} of {allEventTypes.length} Rules Active</span>
          </div>
        }
      />

      {/* 3 Summary Metric Blocks */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))",
          gap: 16,
        }}
      >
        <MetricBlock
          label="System Events"
          value={allEventTypes.length}
          context="Registered lifecycle triggers"
          trendType="neutral"
          icon={<Bell size={18} />}
        />
        <MetricBlock
          label="Active Rules"
          value={activeRulesCount}
          context="Dispatched automated alerts"
          trendType="positive"
          icon={<CheckCircle2 size={18} />}
        />
        <MetricBlock
          label="Inactive Rules"
          value={inactiveRulesCount}
          context="Suppressed notification triggers"
          trendType="neutral"
          icon={<BellOff size={18} />}
        />
      </div>

      {/* Notification Rule Cards */}
      <NotificationRulesClient initialRules={combinedRules} />
    </div>
  );
}
