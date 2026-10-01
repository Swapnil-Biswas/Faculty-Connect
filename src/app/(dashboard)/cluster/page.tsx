import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { StatCard } from "@/components/ui/StatCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { DotMatrixHero } from "@/components/dashboard/DotMatrixHero";
import { Users, CheckSquare, Calendar, AlertTriangle, Clock, ArrowRight } from "lucide-react";
import { formatDate, getInitials } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Cluster Console // Operations" };

export default async function ClusterDashboard() {
  const session = await auth();
  if (!session || !["CLUSTER_HEAD", "HOD", "ADMIN"].includes(session.user.role)) {
    redirect("/login");
  }

  const clusterId = session.user.clusterId;
  if (!clusterId) {
    return (
      <div className="empty-state">
        <AlertTriangle size={40} color="#F59E0B" />
        <div className="empty-state-title" style={{ fontFamily: "var(--font-mono)" }}>NO CLUSTER ASSIGNED</div>
        <div className="empty-state-desc">Contact the department HOD or Administrator to link your identity to a cluster node.</div>
      </div>
    );
  }

  const [cluster, pendingLeaves, clusterTasks, members] = await Promise.all([
    db.cluster.findUnique({
      where: { id: clusterId },
      include: { members: { include: { user: true } } },
    }),
    db.leaveApplication.findMany({
      where: { clusterId, status: "PENDING" },
      include: { applicant: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    db.task.findMany({
      where: { clusterId, deletedAt: null },
      include: { assignedTo: true },
      orderBy: { deadline: "asc" },
      take: 6,
    }),
    db.clusterMembership.findMany({
      where: { clusterId, leftAt: null },
      include: { user: true },
    }),
  ]);

  const totalMembers = members.length;
  const openTasks = clusterTasks.filter((t) => ["OPEN", "IN_PROGRESS"].includes(t.status)).length;
  const overdueTasks = clusterTasks.filter((t) => t.status === "OVERDUE").length;

  return (
    <div style={{ maxWidth: 1240, margin: "0 auto", paddingBottom: 48 }}>
      <PageHeader
        breadcrumbs={[
          { label: "CLUSTER_CONSOLE" },
          { label: cluster?.name?.toUpperCase() ?? "NODE_WORKSPACE" },
        ]}
        title={`${cluster?.name ?? "Cluster"} Operations Matrix`}
        subtitle="Manage assigned cluster deliverables, review faculty leave pipelines, and inspect roster standing."
        actions={
          <div className="tech-ticker">
            <span className="tech-led led-green" />
            <span style={{ color: "#F8FAFC", fontWeight: 700 }}>CLUSTER ACTIVE // {totalMembers} NODES</span>
          </div>
        }
      />

      {/* BMSIT Coding Club Cyber Dot Matrix Command Hero */}
      <DotMatrixHero
        titleLine1="CLUSTER"
        titleLine2="MANAGEMENT"
        eyebrow={`// SUB-NODE · ${(cluster?.name ?? "CLUSTER").toUpperCase()} · BMSIT CSE`}
        tagline="Manage faculty workgroups, evaluate criterion deliverables, and synchronize cluster activities."
        stats={[
          { label: "FACULTY MEMBERS", value: totalMembers, color: "#38BDF8" },
          { label: "ACTIVE TASKS", value: openTasks, color: "#FFD700" },
          { label: "OVERDUE TASKS", value: overdueTasks, color: overdueTasks > 0 ? "#F43F5E" : "#22C55E" },
          { label: "PENDING LEAVE", value: pendingLeaves.length, color: "#F59E0B" },
        ]}
      />

      {/* Cyber Stats */}
      <div className="grid-4" style={{ marginBottom: 28 }}>
        <StatCard
          label="FACULTY NODES"
          value={totalMembers}
          icon={<Users size={20} />}
          iconBg="rgba(14, 165, 233, 0.1)"
          glowColor="rgba(14, 165, 233, 0.2)"
        />
        <StatCard
          label="ACTIVE TASKS"
          value={openTasks}
          icon={<CheckSquare size={20} />}
          iconBg="rgba(255, 215, 0, 0.1)"
          glowColor="rgba(255, 215, 0, 0.2)"
        />
        <StatCard
          label="OVERDUE DELIVERABLES"
          value={overdueTasks}
          icon={<AlertTriangle size={20} />}
          iconBg="rgba(244, 63, 94, 0.1)"
          glowColor="rgba(244, 63, 94, 0.2)"
        />
        <StatCard
          label="PENDING LEAVE REVIEWS"
          value={pendingLeaves.length}
          icon={<Calendar size={20} />}
          iconBg="rgba(245, 158, 11, 0.1)"
          glowColor="rgba(245, 158, 11, 0.2)"
        />
      </div>

      <div className="grid-2" style={{ alignItems: "start", gap: 20 }}>
        {/* Pending Leave Requests */}
        <div className="tech-card" style={{ padding: 22 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <span className="hero-eyebrow" style={{ margin: 0 }}>
                // PENDING APPROVALS
              </span>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#F8FAFC", margin: "2px 0 0 0" }}>
                Leave Applications
              </h3>
            </div>
            <a href="/cluster/leave" className="btn-primary" style={{ padding: "6px 14px", fontSize: 11.5, fontFamily: "var(--font-mono)" }}>
              REVIEW ALL ({pendingLeaves.length})
            </a>
          </div>

          {pendingLeaves.length === 0 ? (
            <div style={{ padding: 28, textAlign: "center" }}>
              <Calendar size={32} style={{ color: "#334155", margin: "0 auto 8px" }} />
              <div style={{ fontSize: 13, fontFamily: "var(--font-mono)", color: "#64748B" }}>NO PENDING LEAVE REQUESTS</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {pendingLeaves.map((leave) => (
                <div
                  key={leave.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px 14px",
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
                    {getInitials(leave.applicant.name)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: "#F8FAFC" }}>
                      {leave.applicant.name}
                    </div>
                    <div style={{ fontSize: 11.5, fontFamily: "var(--font-mono)", color: "#64748B" }}>
                      {formatDate(leave.startDate)} — {formatDate(leave.endDate)}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <a
                      href={`/cluster/leave/${leave.id}?action=approve`}
                      className="btn-primary"
                      style={{ padding: "4px 10px", fontSize: 11, fontFamily: "var(--font-mono)" }}
                    >
                      APPROVE
                    </a>
                    <a
                      href={`/cluster/leave/${leave.id}?action=reject`}
                      className="btn-outline"
                      style={{ padding: "4px 10px", fontSize: 11, fontFamily: "var(--font-mono)" }}
                    >
                      REJECT
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Task overview */}
        <div className="tech-card" style={{ padding: 22 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <span className="hero-eyebrow" style={{ margin: 0 }}>
                // DELIVERABLES
              </span>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#F8FAFC", margin: "2px 0 0 0" }}>
                Active Task Pipeline
              </h3>
            </div>
            <a href="/cluster/tasks" className="btn-outline" style={{ padding: "6px 14px", fontSize: 11.5, fontFamily: "var(--font-mono)" }}>
              TASKS MATRIX →
            </a>
          </div>

          {clusterTasks.length === 0 ? (
            <div style={{ padding: 28, textAlign: "center" }}>
              <CheckSquare size={32} style={{ color: "#334155", margin: "0 auto 8px" }} />
              <div style={{ fontSize: 13, fontFamily: "var(--font-mono)", color: "#64748B" }}>NO CLUSTER TASKS LOGGED</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {clusterTasks.map((task) => (
                <div
                  key={task.id}
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
                      width: 28,
                      height: 28,
                      fontSize: 10,
                      background: "#07090E",
                      border: "1px solid #38BDF8",
                      color: "#38BDF8",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {getInitials(task.assignedTo.name)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#F8FAFC", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {task.title}
                    </div>
                    <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "#64748B", display: "flex", gap: 6, marginTop: 2 }}>
                      <Clock size={11} /> {formatDate(task.deadline)} · ASSIGNED: {task.assignedTo.name.split(" ")[0].toUpperCase()}
                    </div>
                  </div>
                  <StatusBadge status={task.status} size="sm" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Faculty Roster */}
      <div className="tech-card" style={{ marginTop: 24, padding: 0, overflow: "hidden" }}>
        <div
          style={{
            padding: "16px 24px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "rgba(7, 9, 14, 0.6)",
          }}
        >
          <div>
            <span className="hero-eyebrow" style={{ margin: 0 }}>
              // NODE DIRECTORY
            </span>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#F8FAFC", margin: "2px 0 0 0" }}>
              Faculty Cluster Roster
            </h3>
          </div>
          <a href="/cluster/roster" className="btn-primary" style={{ padding: "6px 14px", fontSize: 11.5, fontFamily: "var(--font-mono)" }}>
            FULL ROSTER →
          </a>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              textAlign: "left",
              fontSize: 13,
            }}
          >
            <thead>
              <tr
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.02)",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                  color: "#64748B",
                  fontSize: 11,
                  fontFamily: "var(--font-mono)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                <th style={{ padding: "12px 20px" }}>Faculty Member</th>
                <th style={{ padding: "12px 18px" }}>Designation</th>
                <th style={{ padding: "12px 18px" }}>Registered</th>
                <th style={{ padding: "12px 20px", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", color: "#64748B", padding: 36, fontFamily: "var(--font-mono)" }}>
                    NO MEMBERS IN THIS CLUSTER NODE YET.
                  </td>
                </tr>
              ) : (
                members.map((m) => (
                  <tr
                    key={m.userId}
                    className="cyber-row-hover"
                    style={{
                      borderBottom: "1px solid rgba(255, 255, 255, 0.04)",
                      transition: "background-color 0.15s ease",
                    }}
                  >
                    <td style={{ padding: "14px 20px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
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
                          {getInitials(m.user.name)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13.5, color: "#F8FAFC" }}>{m.user.name}</div>
                          <div style={{ fontSize: 11.5, fontFamily: "var(--font-mono)", color: "#64748B" }}>{m.user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ color: "#94A3B8", fontSize: 12.5, fontFamily: "var(--font-mono)", padding: "14px 18px" }}>
                      {m.user.designation ?? "FACULTY"}
                    </td>
                    <td style={{ color: "#64748B", fontSize: 12, fontFamily: "var(--font-mono)", padding: "14px 18px" }}>
                      {formatDate(m.joinedAt)}
                    </td>
                    <td style={{ padding: "14px 20px", textAlign: "right" }}>
                      <a
                        href={`/cluster/roster/${m.userId}`}
                        className="btn-outline"
                        style={{ padding: "5px 12px", fontSize: 11.5, fontFamily: "var(--font-mono)" }}
                      >
                        VIEW PROFILE
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}