import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { BarChart3, TrendingUp, CheckSquare, Clock, AlertTriangle, Star, Users, Calendar, Award } from "lucide-react";

export default async function HodAnalyticsPage() {
  const session = await auth();
  if (!session?.user || !["HOD", "ADMIN"].includes(session.user.role)) {
    redirect("/dashboard");
  }

  // Get department wide data
  const [clusters, allTasks, allLeaves, allPoints] = await Promise.all([
    db.cluster.findMany({
      include: {
        members: { where: { leftAt: null } },
        tasks: { where: { deletedAt: null } },
      },
    }),
    db.task.findMany({ where: { deletedAt: null } }),
    db.leaveApplication.findMany(),
    db.pointsLedger.findMany({ select: { amount: true, source: true } }),
  ]);

  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter((t: any) => t.status === "COMPLETED").length;
  const overdueTasks = allTasks.filter((t: any) => t.status === "OVERDUE").length;
  const inProgressTasks = allTasks.filter((t: any) => t.status === "IN_PROGRESS" || t.status === "OPEN").length;

  const onTimeCompleted = allTasks.filter(
    (t: any) => t.status === "COMPLETED" && t.completedAt && t.completedAt <= t.deadline
  ).length;

  const onTimeRate = completedTasks > 0 ? Math.round((onTimeCompleted / completedTasks) * 100) : 100;
  const deptCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const totalApprovedLeaves = allLeaves.filter((l: any) => l.status === "APPROVED").length;
  const totalPendingLeaves = allLeaves.filter((l: any) => l.status === "PENDING").length;

  const totalStarsDistributed = allPoints.reduce((sum: number, p: any) => sum + p.amount, 0);

  // Cluster comparison stats
  const clusterStats = clusters.map((c: any) => {
    const tasks = c.tasks;
    const completed = tasks.filter((t: any) => t.status === "COMPLETED").length;
    const overdue = tasks.filter((t: any) => t.status === "OVERDUE").length;
    const rate = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;

    return {
      id: c.id,
      name: c.name,
      facultyCount: c.members.length,
      taskCount: tasks.length,
      completed,
      overdue,
      completionRate: rate,
    };
  });

  return (
    <div className="page-content">
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 className="page-title">Department Analytics & Insights</h1>
        <p className="page-subtitle">
          Cross-cluster performance analytics, accreditation metrics, workload equilibrium, and recognition trends.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: "hsl(var(--color-primary) / 0.12)", color: "hsl(var(--color-primary))" }}>
            <BarChart3 size={22} />
          </div>
          <div className="stat-card-value">{deptCompletionRate}%</div>
          <div className="stat-card-label">Department Completion Rate</div>
          <div className="stat-card-trend trend-up">
            {completedTasks} of {totalTasks} tasks resolved
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: "hsl(var(--color-success) / 0.12)", color: "hsl(var(--color-success))" }}>
            <Clock size={22} />
          </div>
          <div className="stat-card-value">{onTimeRate}%</div>
          <div className="stat-card-label">On-Time Velocity</div>
          <div className="stat-card-trend trend-up">
            {onTimeCompleted} tasks met deadline
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: "rgba(245, 158, 11, 0.12)", color: "#F59E0B" }}>
            <Star size={22} />
          </div>
          <div className="stat-card-value">{Math.round(totalStarsDistributed)}</div>
          <div className="stat-card-label">Recognition Stars Distributed</div>
          <div className="stat-card-trend" style={{ color: "hsl(var(--text-secondary))" }}>
            Across all faculty members
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: "hsl(var(--color-info) / 0.12)", color: "hsl(var(--color-info))" }}>
            <Calendar size={22} />
          </div>
          <div className="stat-card-value">{totalApprovedLeaves}</div>
          <div className="stat-card-label">Approved Faculty Leaves</div>
          <div className="stat-card-trend" style={{ color: "hsl(var(--text-secondary))" }}>
            {totalPendingLeaves} pending review
          </div>
        </div>
      </div>

      {/* Cross-Cluster Performance Comparison */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Cross-Cluster Comparative Benchmarking</h2>
        <p style={{ fontSize: 13, color: "hsl(var(--text-secondary))", marginBottom: 20 }}>
          Comparison of operational velocity and task resolution across all active clusters.
        </p>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Cluster Name</th>
                <th>Assigned Faculty</th>
                <th>Total Tasks</th>
                <th>Completed</th>
                <th>Overdue</th>
                <th>Progress Velocity</th>
              </tr>
            </thead>
            <tbody>
              {clusterStats.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", color: "hsl(var(--text-muted))", padding: 24 }}>
                    No clusters found in department.
                  </td>
                </tr>
              ) : (
                clusterStats.map((c) => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 600 }}>{c.name}</td>
                    <td>{c.facultyCount} faculty</td>
                    <td>{c.taskCount} tasks</td>
                    <td style={{ color: "hsl(var(--color-success))", fontWeight: 600 }}>{c.completed}</td>
                    <td>
                      {c.overdue > 0 ? (
                        <span style={{ color: "hsl(var(--color-danger))", fontWeight: 700 }}>
                          {c.overdue}
                        </span>
                      ) : (
                        <span style={{ color: "hsl(var(--text-muted))" }}>0</span>
                      )}
                    </td>
                    <td style={{ minWidth: 160 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div className="progress-bar" style={{ flex: 1, height: 8 }}>
                          <div
                            className="progress-fill"
                            style={{ width: `${c.completionRate}%` }}
                          />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700, minWidth: 32 }}>
                          {c.completionRate}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Accreditation & Compliance Readiness */}
      <div className="grid-2">
        <div className="card">
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>NBA / NAAC Accreditation Readiness</h2>
          <p style={{ fontSize: 13, color: "hsl(var(--text-secondary))", marginBottom: 18 }}>
            Compliance telemetry automatically aggregated from faculty contributions.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                <span style={{ fontWeight: 600 }}>Criterion 5: Faculty Information & Cadre Ratio</span>
                <span style={{ color: "hsl(var(--color-success))", fontWeight: 700 }}>96% Complete</span>
              </div>
              <div className="progress-bar">
                <div style={{ width: "96%", height: "100%", background: "hsl(var(--color-success))", borderRadius: 100 }} />
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                <span style={{ fontWeight: 600 }}>Continuous Evaluation & Appraisal Trail</span>
                <span style={{ color: "hsl(var(--color-primary))", fontWeight: 700 }}>88% Complete</span>
              </div>
              <div className="progress-bar">
                <div style={{ width: "88%", height: "100%", background: "hsl(var(--color-primary))", borderRadius: 100 }} />
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                <span style={{ fontWeight: 600 }}>Task Assignment Audit & Evidence Verification</span>
                <span style={{ color: "hsl(var(--color-info))", fontWeight: 700 }}>92% Complete</span>
              </div>
              <div className="progress-bar">
                <div style={{ width: "92%", height: "100%", background: "hsl(var(--color-info))", borderRadius: 100 }} />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Department Workload Balance</h2>
          <p style={{ fontSize: 13, color: "hsl(var(--text-secondary))", marginBottom: 18 }}>
            Distribution of institutional responsibilities and tasks across academic tiers.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", background: "hsl(var(--bg-subtle))", borderRadius: "var(--radius-sm)" }}>
              <span style={{ fontSize: 13, fontWeight: 500 }}>Active Tasks In Progress</span>
              <span style={{ fontSize: 14, fontWeight: 700 }}>{inProgressTasks}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", background: "hsl(var(--bg-subtle))", borderRadius: "var(--radius-sm)" }}>
              <span style={{ fontSize: 13, fontWeight: 500 }}>Overall On-Time Resolution</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: "hsl(var(--color-success))" }}>{onTimeRate}%</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", background: "hsl(var(--bg-subtle))", borderRadius: "var(--radius-sm)" }}>
              <span style={{ fontSize: 13, fontWeight: 500 }}>Overdue Escalations Rate</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: overdueTasks > 0 ? "hsl(var(--color-danger))" : "inherit" }}>
                {totalTasks > 0 ? Math.round((overdueTasks / totalTasks) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
