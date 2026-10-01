import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { BarChart3, CheckSquare, Clock, AlertTriangle, TrendingUp, Users, Calendar } from "lucide-react";

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
    <div className="page-content">
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 className="page-title">{cluster.name} — Cluster Analytics</h1>
        <p className="page-subtitle">
          Real-time workload metrics, task velocity, on-time completion rates, and faculty distribution.
        </p>
      </div>

      {/* KPI Stats */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: "hsl(var(--color-primary) / 0.12)", color: "hsl(var(--color-primary))" }}>
            <BarChart3 size={22} />
          </div>
          <div className="stat-card-value">{completionRate}%</div>
          <div className="stat-card-label">Overall Completion Rate</div>
          <div className="stat-card-trend trend-up">
            {completedTasks} of {totalTasks} tasks resolved
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: "hsl(var(--color-success) / 0.12)", color: "hsl(var(--color-success))" }}>
            <Clock size={22} />
          </div>
          <div className="stat-card-value">{onTimeRate}%</div>
          <div className="stat-card-label">On-Time Delivery Rate</div>
          <div className="stat-card-trend trend-up">
            {onTimeTasks} delivered before deadline
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: "hsl(var(--color-danger) / 0.12)", color: "hsl(var(--color-danger))" }}>
            <AlertTriangle size={22} />
          </div>
          <div className="stat-card-value">{overdueTasks}</div>
          <div className="stat-card-label">Overdue Tasks</div>
          <div className="stat-card-trend trend-down">
            Requires immediate cluster attention
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: "hsl(var(--color-info) / 0.12)", color: "hsl(var(--color-info))" }}>
            <Users size={22} />
          </div>
          <div className="stat-card-value">{cluster.members.length}</div>
          <div className="stat-card-label">Cluster Members</div>
          <div className="stat-card-trend" style={{ color: "hsl(var(--text-secondary))" }}>
            {inProgressTasks} ongoing tasks distributed
          </div>
        </div>
      </div>

      {/* Analytics Breakdown Grid */}
      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* Task Priority Distribution */}
        <div className="card">
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>Task Priority Distribution</h2>
          <p style={{ fontSize: 13, color: "hsl(var(--text-secondary))", marginBottom: 20 }}>
            Allocation of cluster tasks across urgency levels.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              { label: "Critical Priority", count: priorities.CRITICAL, color: "hsl(var(--color-danger))" },
              { label: "High Priority", count: priorities.HIGH, color: "#F97316" },
              { label: "Medium Priority", count: priorities.MEDIUM, color: "hsl(var(--color-warning))" },
              { label: "Low Priority", count: priorities.LOW, color: "hsl(var(--color-success))" },
            ].map((p) => {
              const pct = totalTasks > 0 ? Math.round((p.count / totalTasks) * 100) : 0;
              return (
                <div key={p.label}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                    <span style={{ fontWeight: 600 }}>{p.label}</span>
                    <span style={{ color: "hsl(var(--text-muted))" }}>{p.count} tasks ({pct}%)</span>
                  </div>
                  <div className="progress-bar" style={{ height: 8 }}>
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
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>Faculty Workload & Velocity</h2>
          <p style={{ fontSize: 13, color: "hsl(var(--text-secondary))", marginBottom: 20 }}>
            Comparative throughput of faculty members in this cluster.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {memberWorkload.length === 0 ? (
              <div style={{ color: "hsl(var(--text-muted))", fontSize: 13 }}>No active faculty members in this cluster.</div>
            ) : (
              memberWorkload.slice(0, 5).map((m) => (
                <div key={m.name}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                    <span style={{ fontWeight: 600 }}>{m.name}</span>
                    <span style={{ color: "hsl(var(--text-muted))" }}>
                      {m.completed}/{m.assigned} done ({m.rate}%) • <strong style={{ color: "#F59E0B" }}>★ {m.points}</strong>
                    </span>
                  </div>
                  <div className="progress-bar" style={{ height: 8 }}>
                    <div
                      style={{
                        width: `${m.rate}%`,
                        height: "100%",
                        background: "linear-gradient(90deg, var(--gradient-from), var(--gradient-to))",
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
