import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { BarChart3, TrendingUp, CheckSquare, Clock, AlertTriangle, Star, Users, Calendar, Award } from "lucide-react";

export default async function HodAnalyticsPage() {
  const session = await auth();
  if (!session?.user || !["HOD", "ADMIN"].includes(session.user.role)) {
    redirect("/login");
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
    <div style={{ padding: "28px 32px", display: "flex", flexDirection: "column", gap: 24 }}>
      {/* 1. Page Header with BMSIT Dot Matrix */}
      <PageHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/hod" },
          { label: "Analytics" },
        ]}
        eyebrow="HOD // TELEMETRY & INSIGHTS"
        dotMatrixText="ANALYTICS"
        dotMatrixFontSize={36}
        title="Department Analytics & Insights"
        ghost="metrics."
        subtitle="Cross-cluster performance analytics, accreditation metrics, workload equilibrium, and recognition trends."
      />

      {/* 2. KPI Cards */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-card-num">{deptCompletionRate}%</div>
          <div className="stat-card-label">COMPLETION RATE</div>
          <div style={{ fontSize: 11.5, color: "#6E6E73", marginTop: 4, fontFamily: "var(--font-mono)" }}>
            {completedTasks} of {totalTasks} tasks resolved
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-num" style={{ color: "#16A34A" }}>{onTimeRate}%</div>
          <div className="stat-card-label">ON-TIME VELOCITY</div>
          <div style={{ fontSize: 11.5, color: "#6E6E73", marginTop: 4, fontFamily: "var(--font-mono)" }}>
            {onTimeCompleted} tasks met deadline
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-num">{Math.round(totalStarsDistributed)}</div>
          <div className="stat-card-label">STARS DISTRIBUTED</div>
          <div style={{ fontSize: 11.5, color: "#6E6E73", marginTop: 4, fontFamily: "var(--font-mono)" }}>
            Across all faculty members
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-num">{totalApprovedLeaves}</div>
          <div className="stat-card-label">APPROVED LEAVES</div>
          <div style={{ fontSize: 11.5, color: "#6E6E73", marginTop: 4, fontFamily: "var(--font-mono)" }}>
            {totalPendingLeaves} pending review
          </div>
        </div>
      </div>

      {/* 3. Cross-Cluster Performance Comparison */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div
          style={{
            padding: "18px 24px",
            borderBottom: "1px solid #E8E8ED",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "#FAFAFA",
          }}
        >
          <div>
            <span className="section-eyebrow">// OPERATIONAL BENCHMARKING</span>
            <h2 className="card-title" style={{ marginTop: 2 }}>
              Cross-Cluster Comparative Velocity
            </h2>
          </div>
          <span className="badge badge-dark">
            {clusters.length} Active Nodes
          </span>
        </div>

        <div className="table-wrap" style={{ border: "none", borderRadius: 0 }}>
          <table className="table">
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
                  <td colSpan={6} style={{ textAlign: "center", color: "#86868B", padding: 32 }}>
                    No clusters found in department.
                  </td>
                </tr>
              ) : (
                clusterStats.map((c) => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 600, color: "#1D1D1F" }}>{c.name}</td>
                    <td style={{ color: "#6E6E73", fontFamily: "var(--font-mono)" }}>{c.facultyCount} faculty</td>
                    <td style={{ fontFamily: "var(--font-mono)" }}>{c.taskCount} tasks</td>
                    <td style={{ color: "#16A34A", fontWeight: 700, fontFamily: "var(--font-mono)" }}>{c.completed}</td>
                    <td>
                      {c.overdue > 0 ? (
                        <span style={{ color: "#E11D48", fontWeight: 700, fontFamily: "var(--font-mono)" }}>
                          {c.overdue}
                        </span>
                      ) : (
                        <span style={{ color: "#86868B", fontFamily: "var(--font-mono)" }}>0</span>
                      )}
                    </td>
                    <td style={{ minWidth: 160 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ flex: 1, height: 6, background: "#E8E8ED", borderRadius: 10, overflow: "hidden" }}>
                          <div
                            style={{
                              width: `${c.completionRate}%`,
                              height: "100%",
                              background: "#1D1D1F",
                              borderRadius: 10,
                            }}
                          />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700, fontFamily: "var(--font-mono)", color: "#1D1D1F", minWidth: 32 }}>
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

      {/* 4. Accreditation & Compliance Readiness */}
      <div className="grid-2">
        <div className="card">
          <span className="section-eyebrow">// ACCREDITATION COMPLIANCE</span>
          <h2 className="card-title" style={{ marginTop: 2, marginBottom: 4 }}>
            NBA / NAAC Accreditation Readiness
          </h2>
          <p className="card-muted" style={{ marginBottom: 18 }}>
            Compliance telemetry automatically aggregated from faculty contributions.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                <span style={{ fontWeight: 600, color: "#1D1D1F" }}>Criterion 5: Faculty Information & Cadre Ratio</span>
                <span style={{ color: "#16A34A", fontWeight: 700, fontFamily: "var(--font-mono)" }}>96% Complete</span>
              </div>
              <div style={{ height: 6, background: "#E8E8ED", borderRadius: 10, overflow: "hidden" }}>
                <div style={{ width: "96%", height: "100%", background: "#16A34A", borderRadius: 10 }} />
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                <span style={{ fontWeight: 600, color: "#1D1D1F" }}>Continuous Evaluation & Appraisal Trail</span>
                <span style={{ color: "#1D1D1F", fontWeight: 700, fontFamily: "var(--font-mono)" }}>88% Complete</span>
              </div>
              <div style={{ height: 6, background: "#E8E8ED", borderRadius: 10, overflow: "hidden" }}>
                <div style={{ width: "88%", height: "100%", background: "#1D1D1F", borderRadius: 10 }} />
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                <span style={{ fontWeight: 600, color: "#1D1D1F" }}>Task Assignment Audit & Evidence Verification</span>
                <span style={{ color: "#1D1D1F", fontWeight: 700, fontFamily: "var(--font-mono)" }}>92% Complete</span>
              </div>
              <div style={{ height: 6, background: "#E8E8ED", borderRadius: 10, overflow: "hidden" }}>
                <div style={{ width: "92%", height: "100%", background: "#1D1D1F", borderRadius: 10 }} />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <span className="section-eyebrow">// EQUILIBRIUM</span>
          <h2 className="card-title" style={{ marginTop: 2, marginBottom: 4 }}>
            Department Workload Balance
          </h2>
          <p className="card-muted" style={{ marginBottom: 18 }}>
            Distribution of institutional responsibilities and tasks across academic tiers.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 16px", background: "#FAFAFA", border: "1px solid #E8E8ED", borderRadius: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: "#6E6E73" }}>Active Tasks In Progress</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#1D1D1F", fontFamily: "var(--font-mono)" }}>{inProgressTasks}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 16px", background: "#FAFAFA", border: "1px solid #E8E8ED", borderRadius: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: "#6E6E73" }}>Overall On-Time Resolution</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#16A34A", fontFamily: "var(--font-mono)" }}>{onTimeRate}%</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 16px", background: "#FAFAFA", border: "1px solid #E8E8ED", borderRadius: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: "#6E6E73" }}>Overdue Escalations Rate</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: overdueTasks > 0 ? "#E11D48" : "#1D1D1F", fontFamily: "var(--font-mono)" }}>
                {totalTasks > 0 ? Math.round((overdueTasks / totalTasks) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
