import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { StatCard } from "@/components/ui/StatCard";
import { RoleBadge } from "@/components/ui/RoleBadge";
import { PageHeader } from "@/components/ui/PageHeader";
import { Users, Shield, Settings, BarChart3, AlertTriangle, Clock, Activity, Cpu, Database } from "lucide-react";
import { formatDate, getInitials } from "@/lib/utils";
import { Role } from "@prisma/client";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin Console // System Overview" };

const ROLE_GLYPHS: Record<Role, string> = {
  FACULTY: "◆",
  CLUSTER_HEAD: "▣",
  HOD: "◈",
  ADMIN: "★",
};

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

  const todayAuditCount = recentAuditLogs.filter((l) =>
    new Date(l.timestamp).toDateString() === new Date().toDateString()
  ).length;

  return (
    <div style={{ maxWidth: 1240, margin: "0 auto", paddingBottom: 48 }}>
      <PageHeader
        breadcrumbs={[
          { label: "SYSTEM_ROOT" },
          { label: "ADMIN_CONSOLE" },
        ]}
        title="Infrastructure & System Console"
        subtitle="Full administrative control over identity directory, scoring heuristics, background engines, and cryptographic audit logs."
        actions={
          <div className="tech-ticker">
            <span className="tech-led led-green" />
            <span style={{ color: "#F8FAFC", fontWeight: 700 }}>CLUSTER STATE: HEALTHY</span>
          </div>
        }
      />

      {/* Cyber System Telemetry Stat Cards */}
      <div className="grid-4" style={{ marginBottom: 28 }}>
        <StatCard
          label="ACTIVE ACCOUNTS"
          value={totalUsers}
          icon={<Users size={20} />}
          iconBg="rgba(255, 215, 0, 0.1)"
          glowColor="rgba(255, 215, 0, 0.2)"
        />
        <StatCard
          label="CLUSTER UNITS"
          value={totalClusters}
          icon={<BarChart3 size={20} />}
          iconBg="rgba(14, 165, 233, 0.1)"
          glowColor="rgba(14, 165, 233, 0.2)"
        />
        <StatCard
          label="SCORING ENGINE"
          value={`v${scoringConfig?.version ?? 1}.0`}
          icon={<Settings size={20} />}
          iconBg="rgba(129, 140, 248, 0.1)"
          glowColor="rgba(129, 140, 248, 0.2)"
        />
        <StatCard
          label="SECURITY EVENTS"
          value={todayAuditCount}
          icon={<Shield size={20} />}
          iconBg="rgba(244, 63, 94, 0.1)"
          glowColor="rgba(244, 63, 94, 0.2)"
        />
      </div>

      {/* Role Breakdown Grid */}
      <div className="tech-card" style={{ marginBottom: 24, padding: "20px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <span className="hero-eyebrow" style={{ margin: 0 }}>
            // DIRECTORY DISTRIBUTION BY ROLE
          </span>
          <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "#64748B" }}>
            TOTAL IDENTITIES: {totalUsers}
          </span>
        </div>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          {Object.values(Role).map((role) => (
            <div
              key={role}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 18px",
                background: "rgba(255, 255, 255, 0.02)",
                borderRadius: 8,
                border: "1px solid rgba(255, 255, 255, 0.08)",
                minWidth: 150,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    color: "#F8FAFC",
                    fontFamily: "var(--font-mono)",
                    lineHeight: 1.1,
                  }}
                >
                  {roleCounts[role] ?? 0}
                </div>
                <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ color: "#FFD700", fontFamily: "var(--font-mono)", fontSize: 11 }}>
                    {ROLE_GLYPHS[role]}
                  </span>
                  <RoleBadge role={role} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid-2" style={{ alignItems: "start", gap: 20 }}>
        {/* Recent Users Card */}
        <div className="tech-card" style={{ padding: 22 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <span className="hero-eyebrow" style={{ margin: 0 }}>
                // RECENT PROVISIONING
              </span>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#F8FAFC", margin: "2px 0 0 0" }}>
                Identity Directory
              </h3>
            </div>
            <a href="/admin/users" className="btn-primary" style={{ padding: "6px 14px", fontSize: 11.5, fontFamily: "var(--font-mono)" }}>
              USER MATRIX →
            </a>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {recentUsers.map((u) => (
              <div
                key={u.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 14px",
                  background: "rgba(255, 255, 255, 0.02)",
                  borderRadius: 8,
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                }}
              >
                <div
                  className="avatar avatar-sm"
                  style={{
                    background: "#07090E",
                    border: "1.5px solid #FFD700",
                    color: "#FFD700",
                    fontFamily: "var(--font-mono)",
                    fontWeight: 700,
                  }}
                >
                  {getInitials(u.name)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: "#F8FAFC" }}>
                    {u.name}
                  </div>
                  <div style={{ fontSize: 11.5, fontFamily: "var(--font-mono)", color: "#64748B" }}>
                    {u.email}
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                  <RoleBadge role={u.role} />
                  <div style={{ fontSize: 10.5, fontFamily: "var(--font-mono)", color: "#475569" }}>
                    {formatDate(u.createdAt)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Audit Log preview */}
        <div className="tech-card" style={{ padding: 22 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <span className="hero-eyebrow" style={{ margin: 0 }}>
                // LEDGER TRAIL
              </span>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#F8FAFC", margin: "2px 0 0 0" }}>
                Security Audit Ledger
              </h3>
            </div>
            <a href="/admin/audit" className="btn-outline" style={{ padding: "6px 14px", fontSize: 11.5, fontFamily: "var(--font-mono)" }}>
              FULL LEDGER →
            </a>
          </div>

          {recentAuditLogs.length === 0 ? (
            <div style={{ padding: "28px", textAlign: "center" }}>
              <Shield size={32} style={{ color: "#334155", margin: "0 auto 8px" }} />
              <div style={{ fontSize: 13, fontFamily: "var(--font-mono)", color: "#64748B" }}>NO AUDIT EVENTS RECORDED</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {recentAuditLogs.map((log) => (
                <div
                  key={log.id}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                    padding: "10px 14px",
                    background: log.isImpersonated
                      ? "rgba(244, 63, 94, 0.08)"
                      : "rgba(255, 255, 255, 0.02)",
                    borderRadius: 8,
                    border: log.isImpersonated
                      ? "1px solid rgba(244, 63, 94, 0.35)"
                      : "1px solid rgba(255, 255, 255, 0.06)",
                  }}
                >
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      marginTop: 5,
                      background: log.isImpersonated ? "#F43F5E" : "#38BDF8",
                      boxShadow: `0 0 6px ${log.isImpersonated ? "#F43F5E" : "#38BDF8"}`,
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 700, fontFamily: "var(--font-mono)", color: "#F8FAFC" }}>
                      {log.action}
                      {log.isImpersonated && (
                        <span
                          style={{
                            fontSize: 10,
                            color: "#FB7185",
                            marginLeft: 6,
                            background: "rgba(244, 63, 94, 0.15)",
                            padding: "1px 6px",
                            borderRadius: 4,
                          }}
                        >
                          IMPERSONATED
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 11.5, color: "#64748B", marginTop: 2 }}>
                      BY: {log.actor.name.toUpperCase()} // ENTITY: {log.entityType} #{log.entityId.slice(0, 8)}
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      fontFamily: "var(--font-mono)",
                      color: "#475569",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      flexShrink: 0,
                    }}
                  >
                    <Clock size={11} />
                    {formatDate(log.timestamp)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Admin Quick Configuration Navigation */}
      <div className="tech-card" style={{ marginTop: 24, padding: 24 }}>
        <div style={{ marginBottom: 16 }}>
          <span className="hero-eyebrow" style={{ margin: 0 }}>
            // SYSTEM CONTROLS
          </span>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#F8FAFC", margin: "2px 0 0 0" }}>
            Operational Engine Configuration
          </h3>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
          {[
            { href: "/admin/users", icon: <Users size={18} />, label: "Identity & Roles Directory",
              desc: "Manage faculty profiles, cluster roles, and account provisioning" },
            { href: "/admin/clusters", icon: <BarChart3 size={18} />, label: "Cluster Topology Units",
              desc: "Configure departmental cluster nodes and leader assignments" },
            { href: "/admin/jobs", icon: <Clock size={18} />, label: "Automated Jobs & Cron",
              desc: "Monitor live cron timers, snapshot generators, and evaluation triggers" },
            { href: "/admin/webhooks", icon: <Database size={18} />, label: "Webhooks & Outbound API",
              desc: "Dispatch endpoints, delivery verification, and external sync" },
            { href: "/admin/scoring", icon: <Settings size={18} />, label: "Points Scoring Engine",
              desc: "Calibrate global multiplier rules and evaluation heuristics" },
            { href: "/admin/badges", icon: <Shield size={18} />, label: "Merit Badge Registry",
              desc: "Configure achievement rules and gamification criteria" },
          ].map((a) => (
            <a
              key={a.href}
              href={a.href}
              style={{
                padding: "16px",
                borderRadius: 10,
                background: "rgba(255, 255, 255, 0.02)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                textDecoration: "none",
                transition: "all 0.18s ease",
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(255, 215, 0, 0.35)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
                e.currentTarget.style.transform = "none";
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: "rgba(255, 215, 0, 0.08)",
                  border: "1px solid rgba(255, 215, 0, 0.25)",
                  color: "#FFD700",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {a.icon}
              </div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: "#F8FAFC" }}>
                {a.label}
              </div>
              <div style={{ fontSize: 12, color: "#94A3B8", lineHeight: 1.45 }}>
                {a.desc}
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}