import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { BarChart3, Clock, AlertTriangle, Users, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { MetricBlock } from "@/components/ui/MetricBlock";
import { EmptyState } from "@/components/ui/EmptyState";
import { getInitials } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Cluster Head // Workload Analytics" };

export default async function ClusterAnalyticsPage() {
  const session = await auth();
  if (!session?.user || !["CLUSTER_HEAD", "HOD", "ADMIN"].includes(session.user.role)) {
    redirect("/dashboard");
  }

  let clusterId = session.user.clusterId;
  if (!clusterId && ["HOD", "ADMIN"].includes(session.user.role)) {
    const first = await db.cluster.findFirst({ select: { id: true } });
    clusterId = first?.id ?? null;
  }

  if (!clusterId) {
    return (
      <div style={{ maxWidth: 1240, margin: "0 auto", paddingBottom: 48 }}>
        <PageHeader
          breadcrumbs={[
            { label: "CLUSTER_CONSOLE", href: "/cluster" },
            { label: "ANALYTICS" },
          ]}
          title="Cluster Analytics"
          subtitle="Real-time workload metrics, task velocity, on-time completion rates, and faculty distribution."
          dotMatrixText="ANALYTICS"
        />
        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E4E7EC",
            borderRadius: 8,
            padding: "48px 24px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 8,
              backgroundColor: "rgba(183, 121, 31, 0.1)",
              border: "1px solid rgba(183, 121, 31, 0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              color: "#B7791F",
            }}
          >
            <AlertTriangle size={24} />
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: "#17202A", margin: "0 0 8px 0" }}>
            No Cluster Assigned
          </h2>
          <p style={{ fontSize: 14, color: "#667085", maxWidth: 460, margin: "0 auto" }}>
            You must be linked to an academic cluster to inspect telemetry data.
          </p>
        </div>
      </div>
    );
  }

  const cluster = await db.cluster.findUnique({
    where: { id: clusterId },
    include: {
      tasks: {
        where: { deletedAt: null },
        include: { assignedTo: { select: { id: true, name: true } } },
      },
      members: {
        where: { leftAt: null },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              assignedTasks: { where: { deletedAt: null }, select: { status: true } },
              leaveApplications: { where: { status: "APPROVED" }, select: { id: true, startDate: true, endDate: true } },
              pointsLedger: { select: { amount: true } },
            },
          },
        },
      },
    },
  });

  if (!cluster) redirect("/cluster");

  const totalTasks = cluster.tasks.length;
  const completedTasks = cluster.tasks.filter((t: any) => t.status === "COMPLETED").length;
  const inProgressTasks = cluster.tasks.filter((t: any) => t.status === "IN_PROGRESS" || t.status === "OPEN").length;
  const overdueTasks = cluster.tasks.filter((t: any) => t.status === "OVERDUE").length;

  const onTimeTasks = cluster.tasks.filter(
    (t: any) => t.status === "COMPLETED" && t.completedAt && t.completedAt <= t.deadline
  ).length;

  const onTimeRate = completedTasks > 0 ? Math.round((onTimeTasks / completedTasks) * 100) : 100;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Priority distribution
  const priorities = {
    CRITICAL: cluster.tasks.filter((t: any) => t.priority === "CRITICAL").length,
    HIGH: cluster.tasks.filter((t: any) => t.priority === "HIGH").length,
    MEDIUM: cluster.tasks.filter((t: any) => t.priority === "MEDIUM").length,
    LOW: cluster.tasks.filter((t: any) => t.priority === "LOW").length,
  };

  // Member workload breakdown
  const memberWorkload = cluster.members
    .map((m: any) => {
      const assigned = m.user.assignedTasks.length;
      const completed = m.user.assignedTasks.filter((t: any) => t.status === "COMPLETED").length;
      const points = m.user.pointsLedger.reduce((sum: number, p: any) => sum + p.amount, 0);
      return {
        id: m.user.id,
        name: m.user.name,
        assigned,
        completed,
        rate: assigned > 0 ? Math.round((completed / assigned) * 100) : 0,
        points: Math.round(points),
      };
    })
    .sort((a: any, b: any) => b.completed - a.completed);

  return (
    <div style={{ maxWidth: 1240, margin: "0 auto", paddingBottom: 48 }}>
      {/* 1. Page Header */}
      <PageHeader
        breadcrumbs={[
          { label: "CLUSTER_CONSOLE", href: "/cluster" },
          { label: "ANALYTICS" },
        ]}
        dotMatrixText="ANALYTICS"
        eyebrow={`// CLUSTER TELEMETRY · ${cluster.name.toUpperCase()}`}
        title={`${cluster.name} — Workload & Performance Analytics`}
        subtitle="Objective telemetry on task delivery velocity, on-time completion rates, priority distribution, and faculty throughput."
      />

      {/* 2. KPI Metric Blocks */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <MetricBlock
          label="Completion Rate"
          value={`${completionRate}%`}
          context={`${completedTasks} of ${totalTasks} tasks resolved`}
          trendType={completionRate >= 70 ? "positive" : "warning"}
          icon={<BarChart3 size={18} color="#173B67" />}
        />
        <MetricBlock
          label="On-Time Delivery Rate"
          value={`${onTimeRate}%`}
          context={`${onTimeTasks} delivered on or before deadline`}
          trendType={onTimeRate >= 80 ? "positive" : "warning"}
          icon={<Clock size={18} color="#198754" />}
        />
        <MetricBlock
          label="Overdue Deliverables"
          value={overdueTasks}
          context={overdueTasks > 0 ? "Requires management review" : "All deliverables on schedule"}
          trendType={overdueTasks > 0 ? "danger" : "positive"}
          icon={<AlertTriangle size={18} color={overdueTasks > 0 ? "#C0392B" : "#198754"} />}
        />
        <MetricBlock
          label="Active Faculty"
          value={cluster.members.length}
          context={`${inProgressTasks} ongoing tasks in pipeline`}
          trendType="neutral"
          icon={<Users size={18} color="#2F6FED" />}
        />
      </div>

      {/* 3. 2-Column Analytics Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(460px, 1fr))",
          gap: 20,
          marginBottom: 24,
        }}
      >
        {/* Task Priority Distribution */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E4E7EC",
            borderRadius: 8,
            padding: "20px 24px",
            boxShadow: "0 1px 3px rgba(16, 24, 40, 0.05)",
          }}
        >
          <span
            style={{
              fontSize: 10,
              fontFamily: "var(--font-mono)",
              fontWeight: 600,
              letterSpacing: "0.1em",
              color: "#667085",
              textTransform: "uppercase",
            }}
          >
            // WORKLOAD SPREAD
          </span>
          <h2 style={{ fontSize: 16, fontWeight: 600, margin: "2px 0 4px", color: "#17202A" }}>
            Deliverables by Priority Level
          </h2>
          <p style={{ fontSize: 12.5, color: "#667085", margin: "0 0 20px 0" }}>
            Allocation of cluster deliverables across urgency levels.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              { label: "Critical Priority", count: priorities.CRITICAL, color: "#C0392B" },
              { label: "High Priority", count: priorities.HIGH, color: "#B7791F" },
              { label: "Medium Priority", count: priorities.MEDIUM, color: "#2F6FED" },
              { label: "Low Priority", count: priorities.LOW, color: "#198754" },
            ].map((p) => {
              const pct = totalTasks > 0 ? Math.round((p.count / totalTasks) * 100) : 0;
              return (
                <div key={p.label}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 6 }}>
                    <span style={{ fontWeight: 600, color: "#17202A" }}>{p.label}</span>
                    <span style={{ color: "#667085", fontFamily: "var(--font-mono)", fontSize: 12 }}>
                      {p.count} tasks ({pct}%)
                    </span>
                  </div>
                  <div style={{ height: 6, backgroundColor: "#F2F4F7", borderRadius: 4, overflow: "hidden" }}>
                    <div
                      style={{
                        width: `${pct}%`,
                        height: "100%",
                        backgroundColor: p.color,
                        borderRadius: 4,
                        transition: "width 0.3s ease",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Workload Resolution Summary */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E4E7EC",
            borderRadius: 8,
            padding: "20px 24px",
            boxShadow: "0 1px 3px rgba(16, 24, 40, 0.05)",
          }}
        >
          <span
            style={{
              fontSize: 10,
              fontFamily: "var(--font-mono)",
              fontWeight: 600,
              letterSpacing: "0.1em",
              color: "#667085",
              textTransform: "uppercase",
            }}
          >
            // RESOLUTION TELEMETRY
          </span>
          <h2 style={{ fontSize: 16, fontWeight: 600, margin: "2px 0 4px", color: "#17202A" }}>
            Throughput & Resolution Velocity
          </h2>
          <p style={{ fontSize: 12.5, color: "#667085", margin: "0 0 20px 0" }}>
            Overview of cluster throughput metrics and average workload distribution.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px 14px",
                backgroundColor: "#F7F8FA",
                borderRadius: 6,
                border: "1px solid #E4E7EC",
              }}
            >
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#17202A" }}>Total Deliverables Logged</div>
                <div style={{ fontSize: 11.5, color: "#667085" }}>All time recorded deliverables</div>
              </div>
              <span style={{ fontSize: 16, fontWeight: 700, fontFamily: "var(--font-mono)", color: "#17202A" }}>
                {totalTasks}
              </span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px 14px",
                backgroundColor: "#F7F8FA",
                borderRadius: 6,
                border: "1px solid #E4E7EC",
              }}
            >
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#17202A" }}>Tasks Per Faculty (Avg)</div>
                <div style={{ fontSize: 11.5, color: "#667085" }}>Average workload balance</div>
              </div>
              <span style={{ fontSize: 16, fontWeight: 700, fontFamily: "var(--font-mono)", color: "#17202A" }}>
                {cluster.members.length > 0 ? (totalTasks / cluster.members.length).toFixed(1) : "0.0"}
              </span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px 14px",
                backgroundColor: "#F7F8FA",
                borderRadius: 6,
                border: "1px solid #E4E7EC",
              }}
            >
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#17202A" }}>On-Time Success Proportion</div>
                <div style={{ fontSize: 11.5, color: "#667085" }}>Deliverables met on schedule</div>
              </div>
              <span style={{ fontSize: 16, fontWeight: 700, fontFamily: "var(--font-mono)", color: "#198754" }}>
                {onTimeTasks} / {completedTasks}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Faculty Workload & Throughput Ledger Table */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #E4E7EC",
          borderRadius: 8,
          overflow: "hidden",
          boxShadow: "0 1px 3px rgba(16, 24, 40, 0.05)",
        }}
      >
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid #E4E7EC",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "#FAFAFA",
          }}
        >
          <div>
            <span
              style={{
                fontSize: 10,
                fontFamily: "var(--font-mono)",
                fontWeight: 600,
                letterSpacing: "0.1em",
                color: "#667085",
                textTransform: "uppercase",
              }}
            >
              // FACULTY VELOCITY
            </span>
            <h2 style={{ fontSize: 16, fontWeight: 600, margin: "2px 0 0", color: "#17202A" }}>
              Faculty Workload & Throughput Matrix
            </h2>
          </div>
          <span style={{ fontSize: 11.5, color: "#667085", fontWeight: 500 }}>
            {memberWorkload.length} FACULTY MEMBERS
          </span>
        </div>

        {memberWorkload.length === 0 ? (
          <EmptyState
            icon={BarChart3}
            title="No Faculty Members in Cluster"
            description="Workload metrics will appear here once faculty are enrolled and tasks are assigned."
          />
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #E4E7EC", backgroundColor: "#F7F8FA" }}>
                  <th style={{ padding: "10px 16px", fontSize: 11, fontWeight: 600, color: "#667085", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Faculty Member
                  </th>
                  <th style={{ padding: "10px 16px", fontSize: 11, fontWeight: 600, color: "#667085", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Assigned
                  </th>
                  <th style={{ padding: "10px 16px", fontSize: 11, fontWeight: 600, color: "#667085", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Resolved
                  </th>
                  <th style={{ padding: "10px 16px", fontSize: 11, fontWeight: 600, color: "#667085", textTransform: "uppercase", letterSpacing: "0.05em", minWidth: 160 }}>
                    Completion Rate
                  </th>
                  <th style={{ padding: "10px 16px", fontSize: 11, fontWeight: 600, color: "#667085", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "right" }}>
                    Merit Stars
                  </th>
                </tr>
              </thead>
              <tbody>
                {memberWorkload.map((m) => (
                  <tr
                    key={m.id}
                    style={{
                      borderBottom: "1px solid #F2F4F7",
                      transition: "background-color 0.15s ease",
                    }}
                  >
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 6,
                            backgroundColor: "#173B67",
                            color: "#FFFFFF",
                            fontFamily: "var(--font-mono)",
                            fontSize: 11,
                            fontWeight: 700,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          {getInitials(m.name)}
                        </div>
                        <span style={{ fontWeight: 600, fontSize: 13.5, color: "#17202A" }}>
                          {m.name}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "#17202A" }}>
                      {m.assigned}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "#17202A" }}>
                      {m.completed}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ flex: 1, height: 6, backgroundColor: "#F2F4F7", borderRadius: 3, overflow: "hidden" }}>
                          <div
                            style={{
                              width: `${m.rate}%`,
                              height: "100%",
                              backgroundColor: m.rate >= 75 ? "#198754" : m.rate >= 40 ? "#2F6FED" : "#B7791F",
                              borderRadius: 3,
                            }}
                          />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 600, color: "#17202A", fontFamily: "var(--font-mono)", width: 38 }}>
                          {m.rate}%
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "right" }}>
                      <span style={{ fontWeight: 700, fontSize: 13, color: "#17202A", fontFamily: "var(--font-mono)" }}>
                        {m.points.toLocaleString()} <span style={{ fontSize: 11, color: "#667085" }}>PTS</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
