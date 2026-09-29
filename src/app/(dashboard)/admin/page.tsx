import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { StatCard } from "@/components/ui/StatCard";
import { RoleBadge } from "@/components/ui/RoleBadge";
import { Users, Shield, Settings, BarChart3, AlertTriangle, Clock } from "lucide-react";
import { formatDate, getInitials } from "@/lib/utils";
import { Role } from "@prisma/client";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin Dashboard" };

export default async function AdminDashboard() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const [totalUsers, totalClusters, recentAuditLogs, recentUsers, scoringConfig] = await Promise.all([
    db.user.count({ where: { deletedAt: null } }),
    db.cluster.count({ where: { deletedAt: null } }),
    db.auditLog.findMany({
      orderBy: { timestamp: "desc" },
      take: 8,
      include: { actor: true },
    }),
    db.user.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { clusterMemberships: { include: { cluster: true } } },
    }),
    db.scoringConfig.findFirst({ where: { isActive: true }, orderBy: { version: "desc" } }),
  ]);

  const roleBreakdown = await db.user.groupBy({
    by: ["role"],
    where: { deletedAt: null },
    _count: { role: true },
  });

  const roleCounts: Record<string, number> = {};
  for (const r of roleBreakdown) {
    roleCounts[r.role] = r._count.role;
  }

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">
          <span className="text-gradient">Admin</span> Dashboard
        </h2>
        <p className="page-subtitle">System-level overview. All actions are fully audited.</p>
      </div>

      {/* Stats */}
      <div className="grid-4 fade-in" style={{ marginBottom: 28 }}>
        <StatCard label="Total Users" value={totalUsers} icon={<Users size={20} />}
          iconBg="hsl(258 90% 66% / 0.12)" glowColor="hsl(258, 90%, 66%)" />
        <StatCard label="Clusters" value={totalClusters} icon={<BarChart3 size={20} />}
          iconBg="hsl(192 91% 50% / 0.12)" glowColor="hsl(192, 91%, 50%)" />
        <StatCard label="Scoring Config v" value={scoringConfig?.version ?? 1}
          icon={<Settings size={20} />} iconBg="hsl(38 92% 50% / 0.12)" />
        <StatCard label="Audit Events Today" value={
          recentAuditLogs.filter((l) =>
            new Date(l.timestamp).toDateString() === new Date().toDateString()
          ).length
        } icon={<Shield size={20} />} iconBg="hsl(326 100% 65% / 0.12)" />
      </div>

      {/* Role breakdown pills */}
      <div className="card fade-in" style={{ marginBottom: 20 }}>
        <h3 className="section-title" style={{ marginBottom: 14 }}>User Distribution by Role</h3>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          {Object.values(Role).map((role) => (
            <div key={role} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "12px 18px",
              background: "hsl(var(--bg-subtle))",
              borderRadius: 12, border: "1px solid hsl(var(--border))",
              minWidth: 140,
            }}>
              <div>
                <div style={{ fontSize: 22, fontWeight: 800, color: "hsl(var(--text-primary))",
                  fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                  {roleCounts[role] ?? 0}
                </div>
                <RoleBadge role={role} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid-2" style={{ alignItems: "start" }}>
        {/* Recent Users */}
        <div className="card fade-in fade-in-delay-1">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h3 className="section-title" style={{ margin: 0 }}>Recent Users</h3>
            <a href="/admin/users" className="btn-gradient" style={{ padding: "6px 14px", fontSize: 12 }}>
              Manage Users
            </a>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {recentUsers.map((u) => (
              <div key={u.id} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "10px 12px", background: "hsl(var(--bg-subtle))", borderRadius: 10,
              }}>
                <div className="avatar avatar-sm">{getInitials(u.name)}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: "hsl(var(--text-primary))" }}>
                    {u.name}
                  </div>
                  <div style={{ fontSize: 12, color: "hsl(var(--text-muted))" }}>
                    {u.email}
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                  <RoleBadge role={u.role} />
                  <div style={{ fontSize: 11, color: "hsl(var(--text-muted))" }}>
                    {formatDate(u.createdAt)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Audit Log preview */}
        <div className="card fade-in fade-in-delay-2">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h3 className="section-title" style={{ margin: 0 }}>Recent Audit Events</h3>
            <a href="/admin/audit" className="btn-outline" style={{ padding: "6px 14px", fontSize: 12 }}>
              Full log
            </a>
          </div>

          {recentAuditLogs.length === 0 ? (
            <div className="empty-state" style={{ padding: "24px" }}>
              <Shield size={32} className="empty-state-icon" />
              <div className="empty-state-title">No audit events yet</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {recentAuditLogs.map((log) => (
                <div key={log.id} style={{
                  display: "flex", alignItems: "flex-start", gap: 10,
                  padding: "10px 12px",
                  background: log.isImpersonated
                    ? "hsl(326 100% 65% / 0.06)"
                    : "hsl(var(--bg-subtle))",
                  borderRadius: 8,
                  border: log.isImpersonated
                    ? "1px solid hsl(326 100% 65% / 0.2)"
                    : "1px solid transparent",
                }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: "50%", marginTop: 5,
                    background: "hsl(var(--color-primary))", flexShrink: 0,
                  }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: "hsl(var(--text-primary))" }}>
                      {log.action}
                      {log.isImpersonated && (
                        <span style={{ fontSize: 10, color: "hsl(326 80% 50%)", marginLeft: 6,
                          background: "hsl(326 100% 65% / 0.1)", padding: "1px 6px", borderRadius: 4 }}>
                          IMPERSONATED
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: "hsl(var(--text-muted))" }}>
                      by {log.actor.name} · {log.entityType} #{log.entityId.slice(0, 8)}
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: "hsl(var(--text-muted))", display: "flex",
                    alignItems: "center", gap: 3, flexShrink: 0 }}>
                    <Clock size={11} />
                    {formatDate(log.timestamp)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Admin quick actions */}
      <div className="card fade-in" style={{ marginTop: 20 }}>
        <h3 className="section-title" style={{ marginBottom: 14 }}>System Configuration</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {[
            { href: "/admin/users", icon: <Users size={20} />, label: "Manage Users & Roles",
              desc: "Create, edit, promote, or soft-delete any user" },
            { href: "/admin/clusters", icon: <BarChart3 size={20} />, label: "Manage Clusters",
              desc: "Create clusters, assign heads, manage memberships" },
            { href: "/admin/scoring", icon: <Settings size={20} />, label: "Scoring Defaults",
              desc: "Set system-wide scoring weights and factor config" },
            { href: "/admin/notifications", icon: <AlertTriangle size={20} />, label: "Notification Rules",
              desc: "Enable/disable event types, set thresholds" },
            { href: "/admin/badges", icon: <Shield size={20} />, label: "Badge Rules",
              desc: "Define badge criteria and gamification logic" },
            { href: "/admin/audit", icon: <Shield size={20} />, label: "Full Audit Log",
              desc: "View every action across every department" },
          ].map((a) => (
            <a
              key={a.href}
              href={a.href}
              style={{
                padding: "16px", borderRadius: 12,
                background: "hsl(var(--bg-subtle))",
                border: "1px solid hsl(var(--border))",
                textDecoration: "none",
                transition: "all 0.15s ease",
                display: "flex", flexDirection: "column", gap: 8,
              }}
            >
              <div style={{
                width: 38, height: 38, borderRadius: 10,
                background: "hsl(var(--color-primary) / 0.1)",
                color: "hsl(var(--color-primary))",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {a.icon}
              </div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: "hsl(var(--text-primary))" }}>
                {a.label}
              </div>
              <div style={{ fontSize: 12, color: "hsl(var(--text-secondary))", lineHeight: 1.4 }}>
                {a.desc}
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}