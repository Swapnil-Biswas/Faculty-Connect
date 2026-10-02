import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
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
      <div className="card" style={{ padding: 48, textAlign: "center" }}>
        <AlertTriangle size={40} style={{ color: "#D97706", margin: "0 auto 12px" }} />
        <h2 className="card-title" style={{ marginBottom: 6 }}>NO CLUSTER ASSIGNED</h2>
        <p className="card-muted">Contact the department HOD or Administrator to link your identity to a cluster node.</p>
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
    <div style={{ padding: "28px 32px", display: "flex", flexDirection: "column", gap: 24 }}>
      {/* 1. Page Header */}
      <PageHeader
        breadcrumbs={[
          { label: "CLUSTER_CONSOLE" },
          { label: cluster?.name?.toUpperCase() ?? "NODE_WORKSPACE" },
        ]}
        eyebrow="CLUSTER // OPERATIONAL MATRIX"
        dotMatrixText="CLUSTER"
        dotMatrixFontSize={36}
        title={`${cluster?.name ?? "Cluster"} Operations Matrix`}
        ghost="workgroup."
        subtitle="Manage assigned cluster deliverables, review faculty leave pipelines, and inspect roster standing."
        actions={
          <span className="badge badge-dark">
            <span className="badge-dot" style={{ backgroundColor: "#16A34A" }} />
            CLUSTER ACTIVE · {totalMembers} NODES
          </span>
        }
      />

      {/* 2. Dot Matrix Command Hero */}
      <DotMatrixHero
        titleLine1="CLUSTER"
        titleLine2="MANAGEMENT"
        eyebrow={`// SUB-NODE · ${(cluster?.name ?? "CLUSTER").toUpperCase()} · BMSIT CSE`}
        tagline="Manage faculty workgroups, evaluate criterion deliverables, and synchronize cluster activities."
        stats={[
          { label: "FACULTY MEMBERS", value: totalMembers, color: "#1D1D1F" },
          { label: "ACTIVE TASKS", value: openTasks, color: "#1D1D1F" },
          { label: "OVERDUE TASKS", value: overdueTasks, color: overdueTasks > 0 ? "#E11D48" : "#16A34A" },
          { label: "PENDING LEAVE", value: pendingLeaves.length, color: "#D97706" },
        ]}
      />

      {/* 3. Metric Stats Grid */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-card-num">{totalMembers}</div>
          <div className="stat-card-label">FACULTY NODES</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-num">{openTasks}</div>
          <div className="stat-card-label">ACTIVE TASKS</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-num" style={{ color: overdueTasks > 0 ? "#E11D48" : "#1D1D1F" }}>
            {overdueTasks}
          </div>
          <div className="stat-card-label">OVERDUE DELIVERABLES</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-num" style={{ color: pendingLeaves.length > 0 ? "#D97706" : "#1D1D1F" }}>
            {pendingLeaves.length}
          </div>
          <div className="stat-card-label">PENDING LEAVE REVIEWS</div>
        </div>
      </div>

      <div className="grid-2" style={{ alignItems: "start", gap: 20 }}>
        {/* Pending Leave Requests */}
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <span className="section-eyebrow">// PENDING APPROVALS</span>
              <h3 className="card-title" style={{ marginTop: 2 }}>
                Leave Applications
              </h3>
            </div>
            <a href="/cluster/leave" className="btn-secondary btn-sm">
              REVIEW ALL ({pendingLeaves.length})
            </a>
          </div>

          {pendingLeaves.length === 0 ? (
            <div style={{ padding: 32, textAlign: "center", background: "#FAFAFA", borderRadius: 12, border: "1px dashed #D2D2D7" }}>
              <Calendar size={28} style={{ color: "#B0B0B5", margin: "0 auto 8px" }} />
              <div style={{ fontSize: 13, fontFamily: "var(--font-mono)", color: "#6E6E73" }}>NO PENDING LEAVE REQUESTS</div>
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
                    background: "#FAFAFA",
                    borderRadius: 10,
                    border: "1px solid #E8E8ED",
                  }}
                  className="cyber-card-hover"
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      background: "#1D1D1F",
                      color: "#FFFFFF",
                      fontFamily: "var(--font-mono)",
                      fontWeight: 700,
                      fontSize: 12,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {getInitials(leave.applicant.name)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: "#1D1D1F" }}>
                      {leave.applicant.name}
                    </div>
                    <div style={{ fontSize: 11.5, fontFamily: "var(--font-mono)", color: "#6E6E73" }}>
                      {formatDate(leave.startDate)} — {formatDate(leave.endDate)}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <a
                      href={`/cluster/leave/${leave.id}?action=approve`}
                      className="btn-primary btn-sm"
                    >
                      APPROVE
                    </a>
                    <a
                      href={`/cluster/leave/${leave.id}?action=reject`}
                      className="btn-secondary btn-sm"
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
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <span className="section-eyebrow">// DELIVERABLES</span>
              <h3 className="card-title" style={{ marginTop: 2 }}>
                Active Task Pipeline
              </h3>
            </div>
            <a href="/cluster/tasks" className="btn-secondary btn-sm">
              TASKS MATRIX →
            </a>
          </div>

          {clusterTasks.length === 0 ? (
            <div style={{ padding: 32, textAlign: "center", background: "#FAFAFA", borderRadius: 12, border: "1px dashed #D2D2D7" }}>
              <CheckSquare size={28} style={{ color: "#B0B0B5", margin: "0 auto 8px" }} />
              <div style={{ fontSize: 13, fontFamily: "var(--font-mono)", color: "#6E6E73" }}>NO CLUSTER TASKS LOGGED</div>
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
                    padding: "12px 14px",
                    background: "#FAFAFA",
                    borderRadius: 10,
                    border: "1px solid #E8E8ED",
                  }}
                  className="cyber-card-hover"
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      fontSize: 11,
                      background: "#1D1D1F",
                      color: "#FFFFFF",
                      fontFamily: "var(--font-mono)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {getInitials(task.assignedTo.name)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#1D1D1F", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {task.title}
                    </div>
                    <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "#6E6E73", display: "flex", gap: 6, marginTop: 2 }}>
                      <Clock size={11} /> {formatDate(task.deadline)} · ASSIGNED: {task.assignedTo.name.split(" ")[0].toUpperCase()}
                    </div>
                  </div>
                  <span className="badge" style={{ fontSize: 9.5, padding: "2px 7px" }}>
                    {task.status.replace("_", " ")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Faculty Roster */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div
          style={{
            padding: "18px 24px",
            borderBottom: "1px solid #E8E8ED",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#FAFAFA",
          }}
        >
          <div>
            <span className="section-eyebrow">// NODE DIRECTORY</span>
            <h3 className="card-title" style={{ marginTop: 2 }}>
              Faculty Cluster Roster
            </h3>
          </div>
          <a href="/cluster/roster" className="btn-secondary btn-sm">
            FULL ROSTER →
          </a>
        </div>
        <div className="table-wrap" style={{ border: "none", borderRadius: 0 }}>
          <table className="table">
            <thead>
              <tr>
                <th>Faculty Member</th>
                <th>Designation</th>
                <th>Registered</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", color: "#86868B", padding: 36, fontFamily: "var(--font-mono)" }}>
                    NO MEMBERS IN THIS CLUSTER NODE YET.
                  </td>
                </tr>
              ) : (
                members.map((m) => (
                  <tr key={m.userId}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            background: "#F5F5F7",
                            border: "1px solid #E8E8ED",
                            color: "#1D1D1F",
                            fontFamily: "var(--font-mono)",
                            fontWeight: 700,
                            fontSize: 11,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          {getInitials(m.user.name)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13.5, color: "#1D1D1F" }}>{m.user.name}</div>
                          <div style={{ fontSize: 11.5, fontFamily: "var(--font-mono)", color: "#86868B" }}>{m.user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ color: "#6E6E73", fontSize: 12.5, fontFamily: "var(--font-mono)" }}>
                      {m.user.designation ?? "FACULTY"}
                    </td>
                    <td style={{ color: "#86868B", fontSize: 12, fontFamily: "var(--font-mono)" }}>
                      {formatDate(m.joinedAt)}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <a
                        href={`/cluster/roster/${m.userId}`}
                        className="btn-secondary btn-sm"
                        style={{ padding: "4px 10px", fontSize: 11 }}
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