import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { StatCard } from "@/components/ui/StatCard";
import { RoleBadge } from "@/components/ui/RoleBadge";
import { PageHeader } from "@/components/ui/PageHeader";
import { DotMatrixHero } from "@/components/dashboard/DotMatrixHero";
import { Users, Shield, Settings, BarChart3, Clock, Database } from "lucide-react";
import { formatDate, getInitials } from "@/lib/utils";
import { Role } from "@prisma/client";
import type { Metadata } from "next";
import Link from "next/link";

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
    <div className="page-content" style={{ maxWidth: 1400, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>
      <PageHeader
        breadcrumbs={[
          { label: "SYSTEM_ROOT" },
          { label: "ADMIN_CONSOLE" },
        ]}
        dotMatrixText="ADMIN"
        eyebrow="ROOT INFRASTRUCTURE · BMSIT CSE ENGINE"
        title="Infrastructure & System Console"
        subtitle="Full administrative control over identity directory, scoring heuristics, background engines, and cryptographic audit logs."
        actions={
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", borderRadius: 8, background: "var(--grey-50)", border: "1px solid var(--grey-200)" }}>
            <span className="tech-led led-green" />
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 600, color: "var(--grey-800)" }}>
              CLUSTER STATE: HEALTHY
            </span>
          </div>
        }
      />

      {/* BMSIT Coding Club Cyber Dot Matrix Command Hero */}
      <DotMatrixHero
        titleLine1="ADMIN"
        titleLine2="GOVERNANCE"
        eyebrow="// ROOT INFRASTRUCTURE · BMSIT CSE ENGINE"
        tagline="Autonomous multi-cluster orchestration, scoring heuristics calibration, and cryptographic audit registry."
        stats={[
          { label: "USER ACCOUNTS", value: totalUsers, color: "var(--grey-900)" },
          { label: "CLUSTER UNITS", value: totalClusters, color: "#d97706" },
          { label: "AUDIT LOGS", value: recentAuditLogs.length, color: "#16a34a" },
          { label: "SCORING RULES", value: `v${scoringConfig?.version ?? 1}.0`, color: "var(--grey-800)" },
        ]}
      />

      {/* System Telemetry Stat Cards */}
      <div className="stat-grid">
        <div className="stat-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span className="stat-card-label">Active Accounts</span>
            <Users size={16} color="var(--grey-600)" />
          </div>
          <div className="stat-card-num">{totalUsers}</div>
        </div>

        <div className="stat-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span className="stat-card-label">Cluster Units</span>
            <BarChart3 size={16} color="#d97706" />
          </div>
          <div className="stat-card-num" style={{ color: "#d97706" }}>{totalClusters}</div>
        </div>

        <div className="stat-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span className="stat-card-label">Scoring Engine</span>
            <Settings size={16} color="var(--grey-600)" />
          </div>
          <div className="stat-card-num">v{scoringConfig?.version ?? 1}.0</div>
        </div>

        <div className="stat-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span className="stat-card-label">Security Events Today</span>
            <Shield size={16} color="#16a34a" />
          </div>
          <div className="stat-card-num" style={{ color: "#16a34a" }}>{todayAuditCount}</div>
        </div>
      </div>

      {/* Role Breakdown Grid */}
      <div className="card" style={{ padding: "20px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <span className="section-eyebrow" style={{ margin: 0 }}>
            // DIRECTORY DISTRIBUTION BY ROLE
          </span>
          <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--grey-500)" }}>
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
                background: "var(--grey-50)",
                borderRadius: 10,
                border: "1px solid var(--grey-200)",
                minWidth: 150,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    color: "var(--grey-900)",
                    fontFamily: "var(--font-mono)",
                    lineHeight: 1.1,
                  }}
                >
                  {roleCounts[role] ?? 0}
                </div>
                <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ color: "var(--grey-700)", fontFamily: "var(--font-mono)", fontSize: 11 }}>
                    {ROLE_GLYPHS[role]}
                  </span>
                  <RoleBadge role={role} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-2" style={{ alignItems: "start", gap: 24 }}>
        {/* Recent Users Card */}
        <div className="card" style={{ padding: 22 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <span className="section-eyebrow" style={{ margin: 0 }}>
                // RECENT PROVISIONING
              </span>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--grey-900)", margin: "2px 0 0 0" }}>
                Identity Directory
              </h3>
            </div>
            <Link href="/admin/users" className="btn-primary btn-sm">
              USER MATRIX →
            </Link>
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
                  background: "var(--grey-50)",
                  borderRadius: 8,
                  border: "1px solid var(--grey-200)",
                }}
              >
                <div
                  className="avatar avatar-sm"
                  style={{
                    background: "var(--grey-800)",
                    color: "var(--white)",
                    fontFamily: "var(--font-mono)",
                    fontWeight: 700,
                  }}
                >
                  {getInitials(u.name)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--grey-900)" }}>
                    {u.name}
                  </div>
                  <div style={{ fontSize: 11.5, fontFamily: "var(--font-mono)", color: "var(--grey-500)" }}>
                    {u.email}
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                  <RoleBadge role={u.role} />
                  <div style={{ fontSize: 10.5, fontFamily: "var(--font-mono)", color: "var(--grey-400)" }}>
                    {formatDate(u.createdAt)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Audit Log preview */}
        <div className="card" style={{ padding: 22 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <span className="section-eyebrow" style={{ margin: 0 }}>
                // LEDGER TRAIL
              </span>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--grey-900)", margin: "2px 0 0 0" }}>
                Security Audit Ledger
              </h3>
            </div>
            <Link href="/admin/audit" className="btn-secondary btn-sm">
              FULL LEDGER →
            </Link>
          </div>

          {recentAuditLogs.length === 0 ? (
            <div className="empty">
              <Shield size={32} style={{ color: "var(--grey-300)", margin: "0 auto 8px" }} />
              <div className="empty-title">No audit events recorded</div>
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
                      ? "rgba(220, 38, 38, 0.06)"
                      : "var(--grey-50)",
                    borderRadius: 8,
                    border: log.isImpersonated
                      ? "1px solid rgba(220, 38, 38, 0.25)"
                      : "1px solid var(--grey-200)",
                  }}
                >
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      marginTop: 5,
                      background: log.isImpersonated ? "#dc2626" : "var(--grey-800)",
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--grey-900)" }}>
                      {log.action}
                      {log.isImpersonated && (
                        <span
                          style={{
                            fontSize: 10,
                            color: "#dc2626",
                            marginLeft: 6,
                            background: "rgba(220, 38, 38, 0.1)",
                            padding: "1px 6px",
                            borderRadius: 4,
                          }}
                        >
                          IMPERSONATED
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 11.5, color: "var(--grey-500)", marginTop: 2 }}>
                      BY: {log.actor.name.toUpperCase()} // ENTITY: {log.entityType} #{log.entityId.slice(0, 8)}
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      fontFamily: "var(--font-mono)",
                      color: "var(--grey-400)",
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
      <div className="card" style={{ padding: 24 }}>
        <div style={{ marginBottom: 16 }}>
          <span className="section-eyebrow" style={{ margin: 0 }}>
            // SYSTEM CONTROLS
          </span>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--grey-900)", margin: "2px 0 0 0" }}>
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
            <Link
              key={a.href}
              href={a.href}
              className="cyber-card-hover"
              style={{
                padding: "16px",
                borderRadius: 12,
                background: "var(--grey-50)",
                border: "1px solid var(--grey-200)",
                textDecoration: "none",
                transition: "all 0.18s ease",
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: "var(--white)",
                  border: "1px solid var(--grey-200)",
                  color: "var(--grey-800)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {a.icon}
              </div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--grey-900)" }}>
                {a.label}
              </div>
              <div style={{ fontSize: 12, color: "var(--grey-500)", lineHeight: 1.45 }}>
                {a.desc}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}