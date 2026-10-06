import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/ui/PageHeader";
import { MetricBlock } from "@/components/ui/MetricBlock";
import { Shield, Clock, AlertTriangle, Users } from "lucide-react";
import { AuditLedgerClient, SerializedAuditLog } from "./AuditLedgerClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Security Audit Ledger — Admin | Faculty Connect",
};

export default async function AdminAuditPage({
  searchParams,
}: {
  searchParams: Promise<{
    entity?: string;
    actor?: string;
    action?: string;
    page?: string;
  }>;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  if (session.user.role !== "ADMIN") {
    redirect("/admin");
  }

  const params = await searchParams;
  const entityFilter = params.entity?.trim();
  const actorFilter = params.actor?.trim();
  const actionFilter = params.action?.trim();
  const page = Math.max(1, parseInt(params.page ?? "1"));
  const PAGE_SIZE = 25;

  const where = {
    ...(entityFilter
      ? { entityType: { contains: entityFilter, mode: "insensitive" as const } }
      : {}),
    ...(actorFilter
      ? {
          actor: {
            OR: [
              { name: { contains: actorFilter, mode: "insensitive" as const } },
              { email: { contains: actorFilter, mode: "insensitive" as const } },
            ],
          },
        }
      : {}),
    ...(actionFilter
      ? { action: { equals: actionFilter, mode: "insensitive" as const } }
      : {}),
  };

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [
    totalIndexedEvents,
    eventsTodayCount,
    impersonatedCount,
    uniqueActorsList,
    filteredTotal,
    filteredLogs,
  ] = await Promise.all([
    db.auditLog.count(),
    db.auditLog.count({
      where: { timestamp: { gte: todayStart } },
    }),
    db.auditLog.count({
      where: { isImpersonated: true },
    }),
    db.auditLog.groupBy({
      by: ["actorId"],
    }),
    db.auditLog.count({ where }),
    db.auditLog.findMany({
      where,
      include: { actor: { select: { id: true, name: true, email: true } } },
      orderBy: { timestamp: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);

  const totalPages = Math.ceil(filteredTotal / PAGE_SIZE);

  const serializedLogs: SerializedAuditLog[] = filteredLogs.map((log) => ({
    id: log.id,
    actorId: log.actorId,
    action: log.action,
    entityType: log.entityType,
    entityId: log.entityId,
    beforeState: (log.beforeState as Record<string, any>) || null,
    afterState: (log.afterState as Record<string, any>) || null,
    isImpersonated: log.isImpersonated,
    impersonatorId: log.impersonatorId,
    ipAddress: log.ipAddress,
    timestamp: log.timestamp.toISOString(),
    actor: {
      id: log.actor.id,
      name: log.actor.name,
      email: log.actor.email,
    },
  }));

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
          { label: "Security Audit Ledger" },
        ]}
        title="Security Audit Ledger"
        subtitle="Complete immutable record of system events, IAM alterations, and administrative activities."
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
            <Shield size={14} color="#667085" />
            <span>{totalIndexedEvents.toLocaleString()} Indexed Events</span>
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
          label="Total Indexed Events"
          value={totalIndexedEvents.toLocaleString()}
          context="All recorded immutable events"
          trendType="neutral"
          icon={<Shield size={16} />}
        />
        <MetricBlock
          label="Events Recorded Today"
          value={eventsTodayCount.toLocaleString()}
          context="Logged in last 24 hours"
          trendType={eventsTodayCount > 0 ? "positive" : "neutral"}
          icon={<Clock size={16} />}
        />
        <MetricBlock
          label="Impersonated Dispatches"
          value={impersonatedCount.toLocaleString()}
          context="Elevated forensic events"
          trendType={impersonatedCount > 0 ? "warning" : "positive"}
          icon={<AlertTriangle size={16} />}
        />
        <MetricBlock
          label="Active System Actors"
          value={uniqueActorsList.length}
          context="Distinct identity accounts"
          trendType="neutral"
          icon={<Users size={16} />}
        />
      </div>

      {/* Structured Ledger Table, Filter Controls, CSV Export & State Diff Inspector */}
      <AuditLedgerClient
        logs={serializedLogs}
        total={filteredTotal}
        page={page}
        totalPages={totalPages}
        currentFilters={{
          action: actionFilter,
          entity: entityFilter,
          actor: actorFilter,
        }}
      />
    </div>
  );
}
