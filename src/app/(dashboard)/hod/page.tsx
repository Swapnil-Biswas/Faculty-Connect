import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { StatCard } from "@/components/ui/StatCard";
import { PageHeader } from "@/components/ui/PageHeader";
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
    <div style={{ maxWidth: 1240, margin: "0 auto", paddingBottom: 48 }}>
      <PageHeader
        breadcrumbs={[
          { label: "EXECUTIVE_NODE" },
          { label: "DEPT_OVERVIEW" },
        ]}
        title="Department Executive Console"
        subtitle={`Live institutional overview · ${deptName.toUpperCase()} · BMSIT BANGALORE`}
        actions={
          <div className="tech-ticker">
            <span className="tech-led led-green" />
            <span style={{ color: "#F8FAFC", fontWeight: 700 }}>EXECUTIVE DISPATCH ACTIVE</span>
          </div>
        }
      />

      {/* Cyber Executive Stats */}
      <div className="grid-4" style={{ marginBottom: 28 }}>
        <StatCard
          label="TOTAL FACULTY"
          value={totalFaculty}
          icon={<Users size={20} />}
          iconBg="rgba(14, 165, 233, 0.1)"
          glowColor="rgba(14, 165, 233, 0.2)"
        />
        <StatCard
          label="ACTIVE CLUSTERS"
          value={clusters.length}
          icon={<BarChart3 size={20} />}
          iconBg="rgba(255, 215, 0, 0.1)"
          glowColor="rgba(255, 215, 0, 0.2)"
        />
        <StatCard
          label="ALLOCATED TASKS"
          value={totalTasks}
          icon={<CheckSquare size={20} />}
          iconBg="rgba(34, 197, 94, 0.1)"
          glowColor="rgba(34, 197, 94, 0.2)"
        />
        <StatCard
          label="PENDING LEAVE REVIEWS"
          value={pendingLeaves}
          icon={<Calendar size={20} />}
          iconBg="rgba(245, 158, 11, 0.1)"
          glowColor="rgba(245, 158, 11, 0.2)"
        />
      </div>

      <div className="grid-2" style={{ alignItems: "start", gap: 20 }}>
        {/* Cluster overview cards */}
        <div className="tech-card" style={{ padding: 22 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <div>
              <span className="hero-eyebrow" style={{ margin: 0 }}>
                // TOPOLOGY
              </span>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#F8FAFC", margin: "2px 0 0 0" }}>
                Departmental Clusters
              </h3>
            </div>
            <a href="/hod/clusters" className="btn-primary" style={{ padding: "6px 14px", fontSize: 11.5, fontFamily: "var(--font-mono)" }}>
              CLUSTER MATRIX →
            </a>
          </div>

          {clusters.length === 0 ? (
            <div style={{ padding: 28, textAlign: "center" }}>
              <BarChart3 size={32} style={{ color: "#334155", margin: "0 auto 8px" }} />
              <div style={{ fontSize: 13, fontFamily: "var(--font-mono)", color: "#64748B" }}>NO CLUSTERS CONFIGURED</div>
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
                    padding: "12px 16px",
                    background: "rgba(255, 255, 255, 0.02)",
                    borderRadius: 10,
                    textDecoration: "none",
                    border: "1px solid rgba(255, 255, 255, 0.07)",
                    transition: "all 0.18s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255, 215, 0, 0.35)";
                    e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.04)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.07)";
                    e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.02)";
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 8,
                      background: "#07090E",
                      border: "1.5px solid #FFD700",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#FFD700",
                      fontSize: 15,
                      fontWeight: 800,
                      fontFamily: "var(--font-mono)",
                      flexShrink: 0,
                    }}
                  >
                    {c.name.charAt(0)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#F8FAFC" }}>
                      {c.name}
                    </div>
                    <div style={{ fontSize: 11.5, fontFamily: "var(--font-mono)", color: "#64748B", marginTop: 2 }}>
                      HEAD: {c.head?.name?.toUpperCase() ?? "UNASSIGNED"} · {c.members.length} NODES
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3 }}>
                    <span className="glyph-chip glyph-chip-cyan" style={{ fontSize: 10, padding: "1px 6px" }}>
                      {c._count.tasks} TASKS
                    </span>
                    <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "#F59E0B" }}>
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
          <div className="tech-card" style={{ padding: 22 }}>
            <span className="hero-eyebrow" style={{ margin: 0 }}>
              // MERIT RECOGNITION
            </span>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#F8FAFC", margin: "2px 0 14px 0" }}>
              Faculty of the Month
            </h3>
            {fotm ? (
              <div
                style={{
                  padding: "16px",
                  background: "linear-gradient(135deg, rgba(255, 215, 0, 0.08) 0%, rgba(14, 165, 233, 0.05) 100%)",
                  borderRadius: 10,
                  border: "1.5px solid rgba(255, 215, 0, 0.35)",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  boxShadow: "0 0 16px rgba(255, 215, 0, 0.1)",
                }}
              >
                <div
                  className="avatar avatar-lg"
                  style={{
                    background: "#07090E",
                    border: "2px solid #FFD700",
                    color: "#FFD700",
                    fontFamily: "var(--font-mono)",
                    fontWeight: 800,
                  }}
                >
                  {getInitials(fotm.faculty.name)}
                </div>
                <div>
                  <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "#FFD700", fontWeight: 700, marginBottom: 2 }}>
                    ★ {monthNames[fotm.month - 1]} {fotm.year} RECIPIENT
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "#F8FAFC" }}>
                    {fotm.faculty.name}
                  </div>
                  <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 2 }}>
                    {fotm.faculty.designation ?? "Faculty Member"}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ padding: 20, textAlign: "center" }}>
                <Star size={28} style={{ color: "#334155", margin: "0 auto 8px" }} />
                <div style={{ fontSize: 13, fontFamily: "var(--font-mono)", color: "#64748B" }}>NOT YET DETERMINED</div>
                <div style={{ fontSize: 11.5, color: "#475569", marginTop: 2 }}>Computed automatically at month end.</div>
              </div>
            )}
            <a
              href="/hod/faculty-of-month"
              className="btn-outline"
              style={{ display: "block", textAlign: "center", marginTop: 14, padding: "8px", fontSize: 12, fontFamily: "var(--font-mono)" }}
            >
              VIEW RECOGNITION ARCHIVE →
            </a>
          </div>

          {/* Quick Actions */}
          <div className="tech-card" style={{ padding: 22 }}>
            <span className="hero-eyebrow" style={{ margin: 0 }}>
              // GOVERNANCE SHORTCUTS
            </span>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#F8FAFC", margin: "2px 0 14px 0" }}>
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
                    padding: "10px 14px",
                    borderRadius: 6,
                    textDecoration: "none",
                    border: "1px solid rgba(255, 255, 255, 0.06)",
                    background: "rgba(255, 255, 255, 0.02)",
                    color: "#F8FAFC",
                    fontSize: 13,
                    fontWeight: 500,
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255, 215, 0, 0.3)";
                    e.currentTarget.style.color = "#FFD700";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.06)";
                    e.currentTarget.style.color = "#F8FAFC";
                  }}
                >
                  <span style={{ color: "#FFD700" }}>{a.icon}</span>
                  <span style={{ flex: 1 }}>{a.label}</span>
                  <ArrowRight size={13} style={{ opacity: 0.5 }} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}