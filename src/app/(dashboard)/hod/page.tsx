import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { StatCard } from "@/components/ui/StatCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { DotMatrixHero } from "@/components/dashboard/DotMatrixHero";
import { Users, CheckSquare, Calendar, Trophy, BarChart3, Star, ArrowRight, Award, Shield } from "lucide-react";
import { formatDate, getInitials } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "HOD Console // Executive Overview" };

export default async function HodDashboard() {
  const session = await auth();
  if (!session || !["HOD", "ADMIN"].includes(session.user.role)) {
    redirect("/login");
  }

  const [clusters, totalFaculty, totalTasks, pendingLeaves, fotm] = await Promise.all([
    db.cluster.findMany({
      where: { deletedAt: null },
      include: {
        head: true,
        members: true,
        _count: { select: { tasks: true, leaveApplications: true } },
      },
    }),
    db.user.count({ where: { role: "FACULTY", deletedAt: null } }),
    db.task.count({ where: { deletedAt: null } }),
    db.leaveApplication.count({ where: { status: "PENDING" } }),
    db.facultyOfMonth.findFirst({
      orderBy: [{ year: "desc" }, { month: "desc" }],
      include: { faculty: true },
    }),
  ]);

  const now = new Date();
  const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  const deptName = process.env.NEXT_PUBLIC_DEPARTMENT_NAME ?? "Dept. of Computer Science & Engineering";

  return (
    <div style={{ padding: "28px 32px", display: "flex", flexDirection: "column", gap: 24 }}>
      {/* 1. Page Header */}
      <PageHeader
        breadcrumbs={[
          { label: "EXECUTIVE_NODE" },
          { label: "DEPT_OVERVIEW" },
        ]}
        eyebrow="HOD // GOVERNANCE CONSOLE"
        dotMatrixText="HOD CONSOLE"
        dotMatrixFontSize={36}
        title="Department Executive Console"
        ghost="overview."
        subtitle={`Live institutional overview · ${deptName.toUpperCase()} · BMSIT BANGALORE`}
        actions={
          <span className="badge badge-dark">
            <span className="badge-dot" style={{ backgroundColor: "#16A34A" }} />
            EXECUTIVE DISPATCH ACTIVE
          </span>
        }
      />

      {/* 2. Dot Matrix Command Hero */}
      <DotMatrixHero
        titleLine1="HOD COMMAND"
        titleLine2="CENTER"
        eyebrow={`// GOVERNANCE NODE · ${deptName.toUpperCase()} · BMSIT`}
        tagline="Comprehensive departmental cluster monitoring, accreditation synthesis, and faculty merit governance."
        stats={[
          { label: "FACULTY ACTIVE", value: totalFaculty, color: "#1D1D1F" },
          { label: "CLUSTERS ONLINE", value: clusters.length, color: "#1D1D1F" },
          { label: "TASKS DISPATCHED", value: totalTasks, color: "#16A34A" },
          { label: "PENDING LEAVE", value: pendingLeaves, color: "#D97706" },
        ]}
      />

      {/* 3. Metric Stats Grid */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-card-num">{totalFaculty}</div>
          <div className="stat-card-label">TOTAL FACULTY</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-num">{clusters.length}</div>
          <div className="stat-card-label">ACTIVE CLUSTERS</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-num">{totalTasks}</div>
          <div className="stat-card-label">ALLOCATED TASKS</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-num" style={{ color: pendingLeaves > 0 ? "#D97706" : "#1D1D1F" }}>
            {pendingLeaves}
          </div>
          <div className="stat-card-label">PENDING LEAVE REVIEWS</div>
        </div>
      </div>

      <div className="grid-2" style={{ alignItems: "start", gap: 20 }}>
        {/* Cluster overview cards */}
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <div>
              <span className="section-eyebrow">// TOPOLOGY</span>
              <h3 className="card-title" style={{ marginTop: 2 }}>
                Departmental Clusters
              </h3>
            </div>
            <a href="/hod/clusters" className="btn-secondary btn-sm">
              CLUSTER MATRIX →
            </a>
          </div>

          {clusters.length === 0 ? (
            <div style={{ padding: 32, textAlign: "center" }}>
              <BarChart3 size={32} style={{ color: "#B0B0B5", margin: "0 auto 8px" }} />
              <div style={{ fontSize: 13, fontFamily: "var(--font-mono)", color: "#6E6E73" }}>NO CLUSTERS CONFIGURED</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {clusters.map((c) => (
                <a
                  key={c.id}
                  href={`/hod/clusters/${c.id}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "14px 16px",
                    background: "#FAFAFA",
                    borderRadius: 12,
                    textDecoration: "none",
                    border: "1px solid #E8E8ED",
                  }}
                  className="cyber-card-hover"
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: "#1D1D1F",
                      color: "#FFFFFF",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 16,
                      fontWeight: 800,
                      fontFamily: "var(--font-mono)",
                      flexShrink: 0,
                    }}
                  >
                    {c.name.charAt(0)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#1D1D1F" }}>
                      {c.name}
                    </div>
                    <div style={{ fontSize: 11.5, fontFamily: "var(--font-mono)", color: "#6E6E73", marginTop: 2 }}>
                      HEAD: {c.head?.name?.toUpperCase() ?? "UNASSIGNED"} · {c.members.length} MEMBERS
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3 }}>
                    <span className="badge">
                      {c._count.tasks} TASKS
                    </span>
                    <span style={{ fontSize: 10.5, fontFamily: "var(--font-mono)", color: "#D97706" }}>
                      {c._count.leaveApplications} LEAVES
                    </span>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Right panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Faculty of the Month */}
          <div className="card">
            <span className="section-eyebrow">// MERIT RECOGNITION</span>
            <h3 className="card-title" style={{ marginTop: 2, marginBottom: 14 }}>
              Faculty of the Month
            </h3>
            {fotm ? (
              <div
                style={{
                  padding: "18px",
                  background: "#FAFAFA",
                  borderRadius: 12,
                  border: "1px solid #E8E8ED",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 12,
                    background: "#1D1D1F",
                    color: "#FFFFFF",
                    fontFamily: "var(--font-mono)",
                    fontWeight: 800,
                    fontSize: 18,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {getInitials(fotm.faculty.name)}
                </div>
                <div>
                  <div style={{ fontSize: 10.5, fontFamily: "var(--font-mono)", color: "#B45309", fontWeight: 700, marginBottom: 2 }}>
                    ★ {monthNames[fotm.month - 1]} {fotm.year} RECIPIENT
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "#1D1D1F" }}>
                    {fotm.faculty.name}
                  </div>
                  <div style={{ fontSize: 12, color: "#6E6E73", marginTop: 2 }}>
                    {fotm.faculty.designation ?? "Faculty Member"}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ padding: 24, textAlign: "center", background: "#FAFAFA", borderRadius: 12, border: "1px dashed #D2D2D7" }}>
                <Star size={24} style={{ color: "#B0B0B5", margin: "0 auto 8px" }} />
                <div style={{ fontSize: 12.5, fontFamily: "var(--font-mono)", color: "#6E6E73" }}>NOT YET DETERMINED</div>
                <div style={{ fontSize: 11.5, color: "#86868B", marginTop: 2 }}>Computed automatically at month end.</div>
              </div>
            )}
            <a
              href="/hod/faculty-of-month"
              className="btn-secondary btn-block"
              style={{ textAlign: "center", marginTop: 14, padding: "8px 14px", fontSize: 11.5, fontFamily: "var(--font-mono)" }}
            >
              VIEW RECOGNITION ARCHIVE →
            </a>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <span className="section-eyebrow">// GOVERNANCE SHORTCUTS</span>
            <h3 className="card-title" style={{ marginTop: 2, marginBottom: 14 }}>
              Executive Actions
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { href: "/hod/tasks", icon: <CheckSquare size={15} />, label: "Assign Tasks Department-Wide" },
                { href: "/hod/leave", icon: <Calendar size={15} />, label: "Review All Faculty Leave Requests" },
                { href: "/hod/leaderboard", icon: <Trophy size={15} />, label: "Inspect Department Standings" },
                { href: "/hod/accreditation", icon: <Award size={15} />, label: "NBA / NAAC Criterion 5 Dossier" },
                { href: "/hod/export", icon: <BarChart3 size={15} />, label: "Export Department Records Archive" },
                { href: "/hod/audit", icon: <Shield size={15} />, label: "Audit Ledger Trail" },
              ].map((a) => (
                <a
                  key={a.href}
                  href={a.href}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "11px 14px",
                    borderRadius: 10,
                    textDecoration: "none",
                    border: "1px solid #E8E8ED",
                    background: "#FAFAFA",
                    color: "#1D1D1F",
                    fontSize: 13,
                    fontWeight: 500,
                  }}
                  className="cyber-card-hover"
                >
                  <span style={{ color: "#1D1D1F" }}>{a.icon}</span>
                  <span style={{ flex: 1 }}>{a.label}</span>
                  <ArrowRight size={13} style={{ opacity: 0.4 }} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}