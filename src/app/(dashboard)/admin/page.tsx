import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/ui/PageHeader";
import { MetricBlock } from "@/components/ui/MetricBlock";
import { RoleBadge } from "@/components/ui/RoleBadge";
import { Users, Shield, Settings, FolderGit2, ArrowRight, UserCheck, Clock, Award, Bell, Globe, Cpu } from "lucide-react";
import { formatDate, getInitials, getRoleLabel } from "@/lib/utils";
import { Role } from "@prisma/client";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "System Overview — Admin | Faculty Connect" };

const ROLE_DESCRIPTIONS: Record<Role, string> = {
  FACULTY: "Teaching and research faculty members submitting tasks, publications, and leave requests.",
  CLUSTER_HEAD: "Academic leadership coordinating cluster faculty members and reviewing submissions.",
  HOD: "Head of Department with supervisory oversight, faculty approvals, and accreditation reporting.",
  ADMIN: "System administrators with full authority over identity, scoring, jobs, and security configuration.",
};

export default async function AdminDashboard() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [
    totalUsers,
    totalClusters,
    clusters,
    recentAuditLogs,
    todayAuditCount,
    recentUsers,
    scoringConfig,
    roleBreakdown,
  ] = await Promise.all([
    db.user.count({ where: { deletedAt: null } }),
    db.cluster.count({ where: { deletedAt: null } }),
    db.cluster.findMany({
      where: { deletedAt: null },
      include: {
        head: { select: { id: true, name: true, email: true } },
        members: { where: { leftAt: null }, select: { id: true } },
      },
      orderBy: { name: "asc" },
      take: 6,
    }),
    db.auditLog.findMany({
      orderBy: { timestamp: "desc" },
      take: 6,
      include: { actor: true },
    }),
    db.auditLog.count({
      where: { timestamp: { gte: todayStart } },
    }),
    db.user.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        clusterMemberships: {
          where: { leftAt: null },
          include: { cluster: { select: { name: true } } },
        },
      },
    }),
    db.scoringConfig.findFirst({ where: { isActive: true }, orderBy: { version: "desc" } }),
    db.user.groupBy({
      by: ["role"],
      where: { deletedAt: null },
      _count: { role: true },
    }),
  ]);

  const roleCounts: Record<Role, number> = {
    FACULTY: 0,
    CLUSTER_HEAD: 0,
    HOD: 0,
    ADMIN: 0,
  };
  for (const r of roleBreakdown) {
    roleCounts[r.role] = r._count.role;
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 24,
      }}
    >
      <PageHeader
        breadcrumbs={[
          { label: "Admin Console" },
          { label: "System Overview" },
        ]}
        title="System Overview"
        subtitle="Institutional identity directory, academic cluster topology, operational engines, and security audit ledger."
        showDotMatrix={false}
        actions={
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Link
              href="/admin/users"
              className="btn-outline"
              style={{
                fontSize: 12.5,
                fontWeight: 600,
                padding: "8px 14px",
                borderRadius: 8,
                backgroundColor: "#FFFFFF",
                borderColor: "#E4E7EC",
                color: "#17202A",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Users size={14} color="#667085" />
              User Directory
            </Link>
            <Link
              href="/admin/clusters"
              className="btn-primary"
              style={{
                fontSize: 12.5,
                fontWeight: 600,
                padding: "8px 14px",
                borderRadius: 8,
                backgroundColor: "#173B67",
                color: "#FFFFFF",
                border: "none",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <FolderGit2 size={14} color="#FFFFFF" />
              Academic Clusters
            </Link>
          </div>
        }
      />

      {/* Top Metric Blocks */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 16,
        }}
      >
        <MetricBlock
          label="Total Enrolled Users"
          value={totalUsers}
          context="Active institutional accounts"
          trendType="neutral"
          icon={<Users size={18} />}
        />
        <MetricBlock
          label="Academic Clusters"
          value={totalClusters}
          context="Departmental topology units"
          trendType="neutral"
          icon={<FolderGit2 size={18} />}
        />
        <MetricBlock
          label="Security Events Today"
          value={todayAuditCount}
          context="Immutable ledger activities"
          trendType="neutral"
          icon={<Shield size={18} />}
        />
        <MetricBlock
          label="Performance Scoring Engine"
          value={scoringConfig ? `v${scoringConfig.version}` : "Active"}
          context="Heuristic calibration rules"
          trendType="positive"
          icon={<Settings size={18} />}
        />
      </div>

      {/* Identity & Role Distribution */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #E4E7EC",
          borderRadius: 12,
          padding: 24,
          boxShadow: "0 1px 3px rgba(16, 24, 40, 0.04)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 18,
            paddingBottom: 14,
            borderBottom: "1px solid #F2F4F7",
          }}
        >
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#17202A", margin: 0 }}>
              Identity & Role Distribution
            </h2>
            <p style={{ fontSize: 13, color: "#667085", margin: "4px 0 0 0" }}>
              Breakdown of enrolled personnel across institutional role boundaries.
            </p>
          </div>
          <Link
            href="/admin/users"
            style={{
              fontSize: 12.5,
              fontWeight: 600,
              color: "#2F6FED",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <span>View User Directory</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 16,
          }}
        >
          {(["FACULTY", "CLUSTER_HEAD", "HOD", "ADMIN"] as Role[]).map((role) => (
            <div
              key={role}
              style={{
                backgroundColor: "#F7F8FA",
                border: "1px solid #E4E7EC",
                borderRadius: 10,
                padding: "16px 18px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <RoleBadge role={role} />
                  <span style={{ fontSize: 20, fontWeight: 700, color: "#17202A" }}>
                    {roleCounts[role]}
                  </span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#17202A", marginBottom: 4 }}>
                  {getRoleLabel(role)}
                </div>
                <p style={{ fontSize: 12, color: "#667085", lineHeight: 1.45, margin: 0 }}>
                  {ROLE_DESCRIPTIONS[role]}
                </p>
              </div>
              <div
                style={{
                  fontSize: 11.5,
                  fontWeight: 500,
                  color: "#667085",
                  paddingTop: 8,
                  borderTop: "1px solid #E4E7EC",
                }}
              >
                {totalUsers > 0 ? Math.round((roleCounts[role] / totalUsers) * 100) : 0}% of directory
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Academic Topology Preview */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #E4E7EC",
          borderRadius: 12,
          padding: 24,
          boxShadow: "0 1px 3px rgba(16, 24, 40, 0.04)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
            paddingBottom: 14,
            borderBottom: "1px solid #F2F4F7",
          }}
        >
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#17202A", margin: 0 }}>
              Academic Clusters Topology
            </h2>
            <p style={{ fontSize: 13, color: "#667085", margin: "4px 0 0 0" }}>
              Departmental cluster units, leadership assignments, and faculty allocations.
            </p>
          </div>
          <Link
            href="/admin/clusters"
            style={{
              fontSize: 12.5,
              fontWeight: 600,
              color: "#2F6FED",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <span>Configure Clusters</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {clusters.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px 0", color: "#667085" }}>
            <FolderGit2 size={32} style={{ color: "#98A2B3", margin: "0 auto 8px" }} />
            <div style={{ fontSize: 14, fontWeight: 600, color: "#17202A" }}>No Academic Clusters Configured</div>
            <p style={{ fontSize: 12.5, color: "#667085", margin: "4px 0 0 0" }}>
              Create cluster units to organize faculty workflows.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
              gap: 16,
            }}
          >
            {clusters.map((cluster) => (
              <div
                key={cluster.id}
                style={{
                  backgroundColor: "#F7F8FA",
                  border: "1px solid #E4E7EC",
                  borderRadius: 10,
                  padding: "16px 18px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                    <h3 style={{ fontSize: 14.5, fontWeight: 700, color: "#17202A", margin: 0 }}>
                      {cluster.name}
                    </h3>
                    <span
                      style={{
                        fontSize: 11.5,
                        fontWeight: 600,
                        backgroundColor: "#FFFFFF",
                        border: "1px solid #E4E7EC",
                        padding: "2px 8px",
                        borderRadius: 6,
                        color: "#173B67",
                      }}
                    >
                      {cluster.members.length} {cluster.members.length === 1 ? "Member" : "Members"}
                    </span>
                  </div>
                  <div style={{ fontSize: 12.5, color: "#667085", marginTop: 4 }}>
                    <span style={{ fontWeight: 500 }}>Cluster Head: </span>
                    {cluster.head ? (
                      <span style={{ fontWeight: 600, color: "#17202A" }}>{cluster.head.name}</span>
                    ) : (
                      <span style={{ color: "#C0392B", fontWeight: 500 }}>Not Appointed</span>
                    )}
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingTop: 10,
                    borderTop: "1px solid #E4E7EC",
                    fontSize: 11.5,
                    color: "#667085",
                  }}
                >
                  <span>{cluster.head?.email ?? "Action required"}</span>
                  <Link
                    href="/admin/clusters"
                    style={{ fontSize: 11.5, fontWeight: 600, color: "#2F6FED", textDecoration: "none" }}
                  >
                    Edit →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Split Grid: Recent Users & Recent Audit Events */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 380px), 1fr))", gap: 24 }}>
        {/* Recently Enrolled Users */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E4E7EC",
            borderRadius: 12,
            padding: 24,
            boxShadow: "0 1px 3px rgba(16, 24, 40, 0.04)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 16,
              paddingBottom: 12,
              borderBottom: "1px solid #F2F4F7",
            }}
          >
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#17202A", margin: 0 }}>
                Recent Identity Provisioning
              </h3>
              <p style={{ fontSize: 12.5, color: "#667085", margin: "3px 0 0 0" }}>
                Latest user accounts created in the system.
              </p>
            </div>
            <Link
              href="/admin/users"
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "#2F6FED",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <span>Directory</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {recentUsers.map((u) => (
              <div
                key={u.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 12px",
                  borderRadius: 8,
                  backgroundColor: "#F7F8FA",
                  border: "1px solid #E4E7EC",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      backgroundColor: "#173B67",
                      color: "#FFFFFF",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {getInitials(u.name)}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#17202A",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {u.name}
                    </div>
                    <div
                      style={{
                        fontSize: 11.5,
                        color: "#667085",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {u.email}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                  <RoleBadge role={u.role} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Security Audit Trail */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E4E7EC",
            borderRadius: 12,
            padding: 24,
            boxShadow: "0 1px 3px rgba(16, 24, 40, 0.04)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 16,
              paddingBottom: 12,
              borderBottom: "1px solid #F2F4F7",
            }}
          >
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#17202A", margin: 0 }}>
                Security Audit Ledger
              </h3>
              <p style={{ fontSize: 12.5, color: "#667085", margin: "3px 0 0 0" }}>
                Immutable administrative and operational activity log.
              </p>
            </div>
            <Link
              href="/admin/audit"
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "#2F6FED",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <span>Full Ledger</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          {recentAuditLogs.length === 0 ? (
            <div style={{ textAlign: "center", padding: "28px 0", color: "#667085" }}>
              <Shield size={28} style={{ color: "#98A2B3", margin: "0 auto 6px" }} />
              <div style={{ fontSize: 13, fontWeight: 600, color: "#17202A" }}>No Audit Events Recorded</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {recentAuditLogs.map((log) => (
                <div
                  key={log.id}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    padding: "10px 12px",
                    borderRadius: 8,
                    backgroundColor: log.isImpersonated ? "rgba(192, 57, 43, 0.04)" : "#F7F8FA",
                    border: `1px solid ${log.isImpersonated ? "rgba(192, 57, 43, 0.25)" : "#E4E7EC"}`,
                    gap: 12,
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: "#17202A",
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        {log.action}
                      </span>
                      {log.isImpersonated && (
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            color: "#C0392B",
                            backgroundColor: "rgba(192, 57, 43, 0.1)",
                            padding: "1px 5px",
                            borderRadius: 4,
                          }}
                        >
                          IMPERSONATED
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 11.5, color: "#667085", marginTop: 2 }}>
                      By {log.actor.name} · Entity: {log.entityType}
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "#667085",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      flexShrink: 0,
                    }}
                  >
                    <Clock size={11} color="#667085" />
                    {formatDate(log.timestamp)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Administrative Subsystem Navigation */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #E4E7EC",
          borderRadius: 12,
          padding: 24,
          boxShadow: "0 1px 3px rgba(16, 24, 40, 0.04)",
        }}
      >
        <div style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#17202A", margin: 0 }}>
            Administrative Subsystems & Governance
          </h2>
          <p style={{ fontSize: 13, color: "#667085", margin: "4px 0 0 0" }}>
            Direct access to institutional configuration, heuristics, and operational subsystems.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
            gap: 14,
          }}
        >
          {[
            {
              href: "/admin/users",
              icon: <Users size={18} color="#173B67" />,
              label: "User Directory",
              desc: "Manage personnel profiles, institutional roles, and account provisioning.",
            },
            {
              href: "/admin/clusters",
              icon: <FolderGit2 size={18} color="#173B67" />,
              label: "Academic Clusters",
              desc: "Configure departmental cluster topology and assign faculty leadership.",
            },
            {
              href: "/admin/scoring",
              icon: <Settings size={18} color="#173B67" />,
              label: "Scoring Configuration",
              desc: "Calibrate global multiplier heuristics, baseline benchmarks, and evaluation weights.",
            },
            {
              href: "/admin/badges",
              icon: <Award size={18} color="#173B67" />,
              label: "Merit Badges",
              desc: "Registry of academic achievement criteria and recognition milestones.",
            },
            {
              href: "/admin/notifications",
              icon: <Bell size={18} color="#173B67" />,
              label: "Notification Rules",
              desc: "Configure automated notification dispatch criteria and recipient channels.",
            },
            {
              href: "/admin/jobs",
              icon: <Clock size={18} color="#173B67" />,
              label: "Automation Jobs",
              desc: "Monitor recurring background engines, snapshot aggregators, and system daemons.",
            },
            {
              href: "/admin/webhooks",
              icon: <Globe size={18} color="#173B67" />,
              label: "External Webhooks",
              desc: "Manage outbound event subscriptions, payload delivery, and integration endpoints.",
            },
            {
              href: "/admin/audit",
              icon: <Shield size={18} color="#173B67" />,
              label: "Security Audit Ledger",
              desc: "Comprehensive immutable record of all administrative and privileged transactions.",
            },
          ].map((subsystem) => (
            <Link
              key={subsystem.href}
              href={subsystem.href}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 14,
                padding: "16px 18px",
                borderRadius: 10,
                backgroundColor: "#F7F8FA",
                border: "1px solid #E4E7EC",
                textDecoration: "none",
                transition: "all 0.15s ease",
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E4E7EC",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  marginTop: 2,
                }}
              >
                {subsystem.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: "#17202A", marginBottom: 3 }}>
                  {subsystem.label}
                </div>
                <div style={{ fontSize: 12, color: "#667085", lineHeight: 1.45 }}>
                  {subsystem.desc}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}