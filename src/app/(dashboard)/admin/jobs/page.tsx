import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { JobsClient } from "./JobsClient";
import { PageHeader } from "@/components/ui/PageHeader";
import { MetricBlock } from "@/components/ui/MetricBlock";
import { Clock, CalendarClock, Award, ShieldCheck } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Automation Jobs — Admin | Faculty Connect",
};

export default async function AdminJobsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  if (session.user.role !== "ADMIN") {
    redirect("/admin");
  }

  // Fetch real persistence sources for last-run telemetry and metric blocks
  const [
    latestLeaderboardSnapshot,
    latestFacultyOfMonth,
    manualDispatchAuditLogs,
    lastComplianceAudit,
  ] = await Promise.all([
    db.leaderboardSnapshot.findFirst({
      orderBy: { createdAt: "desc" },
    }),
    db.facultyOfMonth.findFirst({
      orderBy: { createdAt: "desc" },
      include: { faculty: { select: { name: true } } },
    }),
    db.auditLog.findMany({
      where: { action: "JOB_MANUALLY_DISPATCHED" },
      orderBy: { timestamp: "desc" },
      take: 20,
      include: { actor: { select: { name: true } } },
    }),
    db.auditLog.findFirst({
      where: {
        action: "JOB_MANUALLY_DISPATCHED",
        entityId: "compliance_check",
      },
      orderBy: { timestamp: "desc" },
      include: { actor: { select: { name: true } } },
    }),
  ]);

  // Compute Compliance metric data based on real audit record if available
  const complianceAfterState = lastComplianceAudit?.afterState as Record<string, any> | null;
  const complianceValue = complianceAfterState
    ? complianceAfterState.healthy
      ? "Compliant"
      : `${complianceAfterState.issues?.length ?? 1} Advisories`
    : "Not evaluated";
  const complianceContext = complianceAfterState
    ? complianceAfterState.healthy
      ? "All SSR criteria passed"
      : "Advisory notices flagged"
    : "No inspection recorded";
  const complianceTrend = complianceAfterState
    ? complianceAfterState.healthy
      ? ("positive" as const)
      : ("warning" as const)
    : ("neutral" as const);

  // Compute verified last-run sources for the 5 existing routines
  const initialLastRuns: Record<
    string,
    { timestamp: string; label: string; actorName?: string; isManual?: boolean } | null
  > = {
    overdue_tasks: (() => {
      const log = manualDispatchAuditLogs.find((l) => l.entityId === "overdue_tasks");
      if (!log) return null;
      return {
        timestamp: formatDate(log.timestamp),
        label: `Manual dispatch by ${log.actor.name}`,
        actorName: log.actor.name,
        isManual: true,
      };
    })(),
    leaderboard_snapshot: (() => {
      if (latestLeaderboardSnapshot) {
        return {
          timestamp: formatDate(latestLeaderboardSnapshot.createdAt),
          label: `Recorded snapshot (${latestLeaderboardSnapshot.period})`,
          isManual: false,
        };
      }
      const log = manualDispatchAuditLogs.find((l) => l.entityId === "leaderboard_snapshot");
      if (!log) return null;
      return {
        timestamp: formatDate(log.timestamp),
        label: `Manual dispatch by ${log.actor.name}`,
        actorName: log.actor.name,
        isManual: true,
      };
    })(),
    faculty_of_month: (() => {
      if (latestFacultyOfMonth) {
        return {
          timestamp: formatDate(latestFacultyOfMonth.createdAt),
          label: `Awarded to ${latestFacultyOfMonth.faculty.name} (${latestFacultyOfMonth.month}/${latestFacultyOfMonth.year})`,
          isManual: false,
        };
      }
      const log = manualDispatchAuditLogs.find((l) => l.entityId === "faculty_of_month");
      if (!log) return null;
      return {
        timestamp: formatDate(log.timestamp),
        label: `Manual dispatch by ${log.actor.name}`,
        actorName: log.actor.name,
        isManual: true,
      };
    })(),
    email_digest: (() => {
      const log = manualDispatchAuditLogs.find((l) => l.entityId === "email_digest");
      if (!log) return null;
      return {
        timestamp: formatDate(log.timestamp),
        label: `Manual dispatch by ${log.actor.name}`,
        actorName: log.actor.name,
        isManual: true,
      };
    })(),
    compliance_check: (() => {
      if (lastComplianceAudit) {
        return {
          timestamp: formatDate(lastComplianceAudit.timestamp),
          label: `Evaluated by ${lastComplianceAudit.actor.name}`,
          actorName: lastComplianceAudit.actor.name,
          isManual: true,
        };
      }
      return null;
    })(),
  };

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
          { label: "Automation Jobs" },
        ]}
        title="Automation Jobs"
        subtitle="Scheduled system routines, background synchronization, email digests, and compliance verification."
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
            <Clock size={14} color="#667085" />
            <span>5 Scheduled Automations</span>
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
          label="Registered Automations"
          value={5}
          context="Core maintenance routines"
          trendType="neutral"
          icon={<Clock size={16} />}
        />
        <MetricBlock
          label="Scheduled Automations"
          value="5 active"
          context="Configured cron definitions"
          trendType="positive"
          icon={<CalendarClock size={16} />}
        />
        <MetricBlock
          label="Last Leaderboard Snapshot"
          value={
            latestLeaderboardSnapshot
              ? formatDate(latestLeaderboardSnapshot.createdAt)
              : "No record"
          }
          context={
            latestLeaderboardSnapshot
              ? `Period: ${latestLeaderboardSnapshot.period}`
              : "No snapshot recorded"
          }
          trendType={latestLeaderboardSnapshot ? "positive" : "neutral"}
          icon={<Award size={16} />}
        />
        <MetricBlock
          label="Compliance Health"
          value={complianceValue}
          context={complianceContext}
          trendType={complianceTrend}
          icon={<ShieldCheck size={16} />}
        />
      </div>

      {/* Interactive Job Cards and Session Telemetry */}
      <JobsClient initialLastRuns={initialLastRuns} />
    </div>
  );
}
