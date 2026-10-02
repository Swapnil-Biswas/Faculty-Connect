import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { BarChart3, Clock, AlertTriangle, Users } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";

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
    redirect("/cluster");
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
  const memberWorkload = cluster.members.map((m: any) => {
    const assigned = m.user.assignedTasks.length;
    const completed = m.user.assignedTasks.filter((t: any) => t.status === "COMPLETED").length;
    const points = m.user.pointsLedger.reduce((sum: number, p: any) => sum + p.amount, 0);
    return {
      name: m.user.name,
      assigned,
      completed,
      rate: assigned > 0 ? Math.round((completed / assigned) * 100) : 0,
      points: Math.round(points),
    };
  }).sort((a: any, b: any) => b.completed - a.completed);

  return (
    <div className="page-content" style={{ maxWidth: 1400, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>
      <PageHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/cluster" },
          { label: "Analytics" },
        ]}
        dotMatrixText="ANALYTICS"
        eyebrow={`CLUSTER TELEMETRY · ${cluster.name.toUpperCase()}`}
        title={`${cluster.name} — Cluster Analytics`}
        subtitle="Real-time workload metrics, task velocity, on-time completion rates, and faculty distribution."
      />

      {/* KPI Stats Grid */}
      <div className="stat-grid">
        <div className="stat-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span className="stat-card-label">Completion Rate</span>
            <BarChart3 size={16} color="var(--grey-600)" />
          </div>
          <div className="stat-card-num">{completionRate}%</div>
          <span style={{ fontSize: 11, color: "var(--grey-500)", fontFamily: "var(--font-mono)", marginTop: 6, display: "block" }}>
            {completedTasks} of {totalTasks} tasks resolved
          </span>
        </div>

        <div className="stat-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span className="stat-card-label">On-Time Rate</span>
            <Clock size={16} color="#16a34a" />
          </div>
          <div className="stat-card-num" style={{ color: "#16a34a" }}>{onTimeRate}%</div>
          <span style={{ fontSize: 11, color: "var(--grey-500)", fontFamily: "var(--font-mono)", marginTop: 6, display: "block" }}>
            {onTimeTasks} delivered before deadline
          </span>
        </div>

        <div className="stat-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span className="stat-card-label">Overdue Tasks</span>
            <AlertTriangle size={16} color="#dc2626" />
          </div>
          <div className="stat-card-num" style={{ color: overdueTasks > 0 ? "#dc2626" : "var(--grey-900)" }}>
            {overdueTasks}
          </div>
          <span style={{ fontSize: 11, color: "var(--grey-500)", fontFamily: "var(--font-mono)", marginTop: 6, display: "block" }}>
            {overdueTasks > 0 ? "Requires cluster review" : "All tasks within schedule"}
          </span>
        </div>

        <div className="stat-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span className="stat-card-label">Active Members</span>
            <Users size={16} color="var(--grey-600)" />
          </div>
          <div className="stat-card-num">{cluster.members.length}</div>
          <span style={{ fontSize: 11, color: "var(--grey-500)", fontFamily: "var(--font-mono)", marginTop: 6, display: "block" }}>
            {inProgressTasks} ongoing deliverables
          </span>
        </div>
      </div>

      {/* Analytics Breakdown Grid */}
      <div className="grid grid-2" style={{ gap: 24 }}>
        {/* Task Priority Distribution */}
        <div className="card">
          <span className="section-eyebrow" style={{ marginBottom: 4 }}>// WORKLOAD SPREAD</span>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: "2px 0 6px", color: "var(--grey-900)" }}>
            Task Priority Distribution
          </h2>
          <p className="card-muted" style={{ marginBottom: 20 }}>
            Allocation of cluster deliverables across urgency levels.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              { label: "Critical Priority", count: priorities.CRITICAL, color: "#dc2626" },
              { label: "High Priority", count: priorities.HIGH, color: "#ea580c" },
              { label: "Medium Priority", count: priorities.MEDIUM, color: "#d97706" },
              { label: "Low Priority", count: priorities.LOW, color: "#16a34a" },
            ].map((p) => {
              const pct = totalTasks > 0 ? Math.round((p.count / totalTasks) * 100) : 0;
              return (
                <div key={p.label}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                    <span style={{ fontWeight: 600, color: "var(--grey-900)" }}>{p.label}</span>
                    <span style={{ color: "var(--grey-500)", fontFamily: "var(--font-mono)" }}>
                      {p.count} tasks ({pct}%)
                    </span>
                  </div>
                  <div style={{ height: 6, background: "var(--grey-100)", borderRadius: 100, overflow: "hidden" }}>
                    <div
                      style={{
                        width: `${pct}%`,
                        height: "100%",
                        background: p.color,
                        borderRadius: 100,
                        transition: "width 0.4s ease",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Member Productivity Roster */}
        <div className="card">
          <span className="section-eyebrow" style={{ marginBottom: 4 }}>// FACULTY VELOCITY</span>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: "2px 0 6px", color: "var(--grey-900)" }}>
            Throughput & Completion Roster
          </h2>
          <p className="card-muted" style={{ marginBottom: 20 }}>
            Comparative throughput of faculty members in this cluster.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {memberWorkload.length === 0 ? (
              <div style={{ color: "var(--grey-400)", fontSize: 13 }}>No active faculty members in this cluster.</div>
            ) : (
              memberWorkload.slice(0, 5).map((m) => (
                <div key={m.name}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                    <span style={{ fontWeight: 600, color: "var(--grey-900)" }}>{m.name}</span>
                    <span style={{ color: "var(--grey-500)", fontFamily: "var(--font-mono)" }}>
                      {m.completed}/{m.assigned} done ({m.rate}%) · <strong style={{ color: "#d97706" }}>★ {m.points}</strong>
                    </span>
                  </div>
                  <div style={{ height: 6, background: "var(--grey-100)", borderRadius: 100, overflow: "hidden" }}>
                    <div
                      style={{
                        width: `${m.rate}%`,
                        height: "100%",
                        background: "var(--grey-800)",
                        borderRadius: 100,
                        transition: "width 0.4s ease",
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
