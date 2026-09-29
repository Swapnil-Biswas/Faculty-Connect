import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { StatCard } from "@/components/ui/StatCard";
import { Users, CheckSquare, Calendar, Trophy, BarChart3, Star } from "lucide-react";
import { formatDate, getInitials } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "HOD Dashboard" };

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
  const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">
          Department <span className="text-gradient">Overview</span>
        </h2>
        <p className="page-subtitle">
          {process.env.NEXT_PUBLIC_DEPARTMENT_NAME ?? "Department"} · {formatDate(now)}
        </p>
      </div>

      {/* Stats */}
      <div className="grid-4 fade-in" style={{ marginBottom: 28 }}>
        <StatCard label="Total Faculty" value={totalFaculty} icon={<Users size={20} />}
          iconBg="hsl(192 91% 50% / 0.12)" />
        <StatCard label="Total Clusters" value={clusters.length} icon={<BarChart3 size={20} />}
          iconBg="hsl(258 90% 66% / 0.12)" />
        <StatCard label="Total Tasks" value={totalTasks} icon={<CheckSquare size={20} />}
          iconBg="hsl(38 92% 50% / 0.12)" />
        <StatCard label="Pending Leaves (Dept)" value={pendingLeaves} icon={<Calendar size={20} />}
          iconBg="hsl(0 84% 60% / 0.12)" />
      </div>

      <div className="grid-2" style={{ alignItems: "start" }}>
        {/* Cluster overview cards */}
        <div className="card fade-in fade-in-delay-1">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <h3 className="section-title" style={{ margin: 0 }}>Clusters</h3>
            <a href="/hod/clusters" className="btn-outline" style={{ padding: "6px 14px", fontSize: 12 }}>
              Manage
            </a>
          </div>

          {clusters.length === 0 ? (
            <div className="empty-state" style={{ padding: "24px" }}>
              <BarChart3 size={36} className="empty-state-icon" />
              <div className="empty-state-title">No clusters yet</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {clusters.map((c) => (
                <a
                  key={c.id}
                  href={`/hod/clusters/${c.id}`}
                  style={{
                    display: "flex", alignItems: "center", gap: 14,
                    padding: "14px 16px",
                    background: "hsl(var(--bg-subtle))",
                    borderRadius: 12,
                    textDecoration: "none",
                    border: "1px solid hsl(var(--border))",
                    transition: "all 0.15s ease",
                  }}
                >
                  <div style={{
                    width: 42, height: 42, borderRadius: 12,
                    background: "linear-gradient(135deg, hsl(var(--color-primary)), hsl(var(--color-secondary)))",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "white", fontSize: 16, fontWeight: 800,
                    flexShrink: 0,
                  }}>
                    {c.name.charAt(0)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "hsl(var(--text-primary))" }}>
                      {c.name}
                    </div>
                    <div style={{ fontSize: 12.5, color: "hsl(var(--text-secondary))" }}>
                      Head: {c.head?.name ?? "Unassigned"} · {c.members.length} members
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3 }}>
                    <div style={{ fontSize: 11, color: "hsl(var(--text-muted))" }}>
                      {c._count.tasks} tasks
                    </div>
                    <div style={{ fontSize: 11, color: "hsl(var(--color-warning))" }}>
                      {c._count.leaveApplications} leaves
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Right panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {/* Faculty of the Month */}
          <div className="card fade-in fade-in-delay-2">
            <h3 className="section-title" style={{ marginBottom: 16 }}>Faculty of the Month</h3>
            {fotm ? (
              <div style={{
                padding: "16px",
                background: "linear-gradient(135deg, hsl(var(--color-primary) / 0.08), hsl(var(--color-secondary) / 0.06))",
                borderRadius: 12,
                border: "1px solid hsl(var(--color-primary) / 0.15)",
                display: "flex", alignItems: "center", gap: 14,
              }}>
                <div className="avatar avatar-lg">
                  {getInitials(fotm.faculty.name)}
                </div>
                <div>
                  <div style={{ fontSize: 13, color: "hsl(var(--color-primary))", fontWeight: 600, marginBottom: 2 }}>
                    🏆 {monthNames[fotm.month - 1]} {fotm.year}
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "hsl(var(--text-primary))", fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                    {fotm.faculty.name}
                  </div>
                  <div style={{ fontSize: 12.5, color: "hsl(var(--text-secondary))", marginTop: 2 }}>
                    {fotm.faculty.designation ?? "Faculty"}
                  </div>
                </div>
              </div>
            ) : (
              <div className="empty-state" style={{ padding: "20px" }}>
                <Star size={32} className="empty-state-icon" />
                <div className="empty-state-title">Not yet determined</div>
                <div className="empty-state-desc">Faculty of the Month will be computed at month end.</div>
              </div>
            )}
            <a href="/hod/faculty-of-month" className="btn-outline"
              style={{ display: "block", textAlign: "center", marginTop: 12, padding: "8px", fontSize: 13 }}>
              View History →
            </a>
          </div>

          {/* Quick actions */}
          <div className="card fade-in fade-in-delay-3">
            <h3 className="section-title" style={{ marginBottom: 14 }}>Quick Actions</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { href: "/hod/tasks", icon: <CheckSquare size={16} />, label: "Assign Tasks Department-wide" },
                { href: "/hod/leave", icon: <Calendar size={16} />, label: "Review All Leave Requests" },
                { href: "/hod/leaderboard", icon: <Trophy size={16} />, label: "View Department Leaderboard" },
                { href: "/hod/analytics", icon: <BarChart3 size={16} />, label: "Department Analytics" },
                { href: "/hod/export", icon: <BarChart3 size={16} />, label: "Export Department Data" },
                { href: "/hod/audit", icon: <BarChart3 size={16} />, label: "View Audit Log" },
              ].map((a) => (
                <a
                  key={a.href}
                  href={a.href}
                  className="sidebar-item"
                  style={{ padding: "10px 12px", borderRadius: 8, textDecoration: "none", border: "1px solid hsl(var(--border))" }}
                >
                  <span style={{ color: "hsl(var(--color-primary))" }}>{a.icon}</span>
                  <span style={{ fontSize: 13.5 }}>{a.label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}