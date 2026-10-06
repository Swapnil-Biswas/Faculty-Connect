import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { WebhooksClient } from "./WebhooksClient";
import { PageHeader } from "@/components/ui/PageHeader";
import { MetricBlock } from "@/components/ui/MetricBlock";
import { Server, ShieldCheck, Send, Activity } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "External Webhooks — Admin | Faculty Connect",
};

export default async function AdminWebhooksPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  if (session.user.role !== "ADMIN") {
    redirect("/admin");
  }

  // Fetch real persistence records for webhook simulator test dispatches
  const [totalDispatches, latestDispatch] = await Promise.all([
    db.auditLog.count({
      where: { action: "WEBHOOK_TEST_DISPATCHED" },
    }),
    db.auditLog.findFirst({
      where: { action: "WEBHOOK_TEST_DISPATCHED" },
      orderBy: { timestamp: "desc" },
    }),
  ]);

  const latestAfterState = latestDispatch?.afterState as Record<string, any> | null;
  const lastStatusVal = latestAfterState?.status
    ? `HTTP ${latestAfterState.status}`
    : latestDispatch
    ? "Recorded"
    : "No dispatches";
  const lastStatusContext = latestDispatch
    ? `${formatDate(latestDispatch.timestamp)}${
        latestAfterState?.hasSignature ? " · Signed" : " · Unsigned"
      }`
    : "No dispatches recorded";
  const lastStatusTrend = latestAfterState?.status
    ? latestAfterState.status >= 200 && latestAfterState.status < 300
      ? ("positive" as const)
      : ("warning" as const)
    : ("neutral" as const);

  return (
    <div
      style={{
        padding: "28px 32px",
        display: "flex",
        flexDirection: "column",
        gap: 24,
        backgroundColor: "#F7F8FA",
        minHeight: "100%",
      }}
    >
      <PageHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "External Webhooks" },
        ]}
        title="External Webhooks"
        subtitle="Enterprise event dispatchers, external LMS/ERP connectors, and HMAC-authenticated webhook simulation."
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
            <Server size={14} color="#667085" />
            <span>3 Connector Definitions</span>
          </div>
        }
      />

      {/* 4 Summary Metric Blocks */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 16,
        }}
      >
        <MetricBlock
          label="Configured Connectors"
          value="3 definitions"
          context="Integration endpoint blueprints"
          trendType="neutral"
          icon={<Server size={16} />}
        />
        <MetricBlock
          label="Signing Standard"
          value="HMAC-SHA256"
          context="Available for test dispatches"
          trendType="neutral"
          icon={<ShieldCheck size={16} />}
        />
        <MetricBlock
          label="Test Dispatches Recorded"
          value={totalDispatches}
          context="Historical simulator dispatches"
          trendType={totalDispatches > 0 ? "positive" : "neutral"}
          icon={<Send size={16} />}
        />
        <MetricBlock
          label="Last Dispatch Status"
          value={lastStatusVal}
          context={lastStatusContext}
          trendType={lastStatusTrend}
          icon={<Activity size={16} />}
        />
      </div>

      {/* Interactive Connector Cards and Test Simulator */}
      <WebhooksClient />
    </div>
  );
}
