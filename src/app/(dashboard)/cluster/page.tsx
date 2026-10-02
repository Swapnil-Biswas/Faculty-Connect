import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/ui/PageHeader";
import { MetricBlock } from "@/components/ui/MetricBlock";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  Users,
  CheckSquare,
  Calendar,
  AlertTriangle,
  Clock,
  ArrowRight,
  UserCheck,
  Plus,
  ShieldAlert,
} from "lucide-react";
import { formatDate, getInitials } from "@/lib/utils";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Cluster Head // Management Console" };

export default async function ClusterDashboard() {
  const session = await auth();
  if (!session || !["CLUSTER_HEAD", "HOD", "ADMIN"].includes(session.user.role)) {
    redirect("/login");
  }

  const clusterId = session.user.clusterId;
  if (!clusterId) {
    return (
      <div style={{ maxWidth: 1240, margin: "0 auto", paddingBottom: 48 }}>
        <PageHeader
          breadcrumbs={[
            { label: "CLUSTER_CONSOLE" },
            { label: "WORKSPACE" },
          ]}
          title="Cluster Management Console"
          subtitle="Departmental faculty cluster management and academic deliverables oversight."
          dotMatrixText="CLUSTER"
        />
        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E4E7EC",
            borderRadius: 8,
            padding: "48px 24px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 8,
              backgroundColor: "rgba(183, 121, 31, 0.1)",
              border: "1px solid rgba(183, 121, 31, 0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              color: "#B7791F",
            }}
          >
            <AlertTriangle size={24} />
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: "#17202A", margin: "0 0 8px 0" }}>
            No Cluster Assigned
          </h2>
          <p style={{ fontSize: 14, color: "#667085", maxWidth: 460, margin: "0 auto" }}>
            Your account is not currently associated with a faculty cluster. Please contact the Head of Department or Administrator to link your profile.
          </p>
        </div>
      </div>
    );
  }

  const [cluster, pendingLeaves, clusterTasks, members] = await Promise.all([
    db.cluster.findUnique({
      where: { id: clusterId },
      include: {
        head: { select: { id: true, name: true, email: true } },
      },
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
      orderBy: [{ status: "asc" }, { deadline: "asc" }],
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

  const PRIORITY_BADGES: Record<string, { label: string; color: string; bg: string }> = {
    LOW: { label: "LOW", color: "#667085", bg: "rgba(102, 112, 133, 0.08)" },
    MEDIUM: { label: "MED", color: "#2F6FED", bg: "rgba(47, 111, 237, 0.08)" },
    HIGH: { label: "HIGH", color: "#B7791F", bg: "rgba(183, 121, 31, 0.08)" },
    CRITICAL: { label: "CRIT", color: "#C0392B", bg: "rgba(192, 57, 43, 0.08)" },
  };

  return (
    <div style={{ maxWidth: 1240, margin: "0 auto", paddingBottom: 48 }}>
      {/* 1. Page Header */}
      <PageHeader
        breadcrumbs={[
          { label: "CLUSTER_CONSOLE" },
          { label: (cluster?.name ?? "MANAGEMENT").toUpperCase() },
        ]}
        eyebrow="// CLUSTER MANAGEMENT · OPERATIONS CONSOLE"
        dotMatrixText="CLUSTER"
        title={`${cluster?.name ?? "Cluster"} Operations Matrix`}
        subtitle="Operational oversight, task deliverables, leave review queue, and faculty roster standing."
        actions={
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <Link
              href="/cluster/leave"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 14px",
                fontSize: 12.5,
                fontWeight: 600,
                color: "#17202A",
                backgroundColor: "#FFFFFF",
                border: "1px solid #E4E7EC",
                borderRadius: 6,
                textDecoration: "none",
                transition: "all 0.15s ease",
              }}
            >
              <Calendar size={14} color="#667085" />
              REVIEW LEAVES {pendingLeaves.length > 0 && `(${pendingLeaves.length})`}
            </Link>
            <Link
              href="/cluster/tasks"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 16px",
                fontSize: 12.5,
                fontWeight: 600,
                color: "#FFFFFF",
                backgroundColor: "#173B67",
                border: "1px solid #173B67",
                borderRadius: 6,
                textDecoration: "none",
                transition: "all 0.15s ease",
              }}
            >
              <Plus size={14} />
              ASSIGN TASK
            </Link>
          </div>
        }
      />

      {/* 2. Management Attention Banners */}
      {(overdueTasks > 0 || pendingLeaves.length > 0) && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
          {overdueTasks > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 18px",
                backgroundColor: "rgba(192, 57, 43, 0.06)",
                border: "1px solid rgba(192, 57, 43, 0.3)",
                borderRadius: 6,
                gap: 12,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <ShieldAlert size={18} color="#C0392B" />
                <div>
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: "#C0392B" }}>
                    CRITICAL ATTENTION:
                  </span>{" "}
                  <span style={{ fontSize: 13, color: "#17202A" }}>
                    There {overdueTasks === 1 ? "is 1 overdue deliverable" : `are ${overdueTasks} overdue deliverables`} requiring immediate follow-up.
                  </span>
                </div>
              </div>
              <Link
                href="/cluster/tasks"
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#C0392B",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  whiteSpace: "nowrap",
                }}
              >
                OPEN TASK MATRIX <ArrowRight size={13} />
              </Link>
            </div>
          )}

          {pendingLeaves.length > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 18px",
                backgroundColor: "rgba(183, 121, 31, 0.06)",
                border: "1px solid rgba(183, 121, 31, 0.3)",
                borderRadius: 6,
                gap: 12,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Clock size={18} color="#B7791F" />
                <div>
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: "#B7791F" }}>
                    SANCTION REQUIRED:
                  </span>{" "}
                  <span style={{ fontSize: 13, color: "#17202A" }}>
                    {pendingLeaves.length} leave {pendingLeaves.length === 1 ? "application is" : "applications are"} awaiting your review.
                  </span>
                </div>
              </div>
              <Link
                href="/cluster/leave"
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#B7791F",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  whiteSpace: "nowrap",
                }}
              >
                REVIEW QUEUE <ArrowRight size={13} />
              </Link>
            </div>
          )}
        </div>
      )}

      {/* 3. Executive Metric Blocks */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <MetricBlock
          label="Faculty Members"
          value={totalMembers}
          context="Active cluster nodes"
          trendType="neutral"
          icon={<Users size={18} color="#173B67" />}
        />
        <MetricBlock
          label="Active Deliverables"
          value={openTasks}
          context="In-progress academic workload"
          trendType="neutral"
          icon={<CheckSquare size={18} color="#2F6FED" />}
        />
        <MetricBlock
          label="Overdue Deliverables"
          value={overdueTasks}
          context={overdueTasks > 0 ? "Requires management follow-up" : "All deliverables on schedule"}
          trendType={overdueTasks > 0 ? "danger" : "positive"}
          icon={<AlertTriangle size={18} color={overdueTasks > 0 ? "#C0392B" : "#198754"} />}
        />
        <MetricBlock
          label="Pending Leave Reviews"
          value={pendingLeaves.length}
          context={pendingLeaves.length > 0 ? "Awaiting your sanction" : "Sanction queue clear"}
          trendType={pendingLeaves.length > 0 ? "warning" : "positive"}
          icon={<Calendar size={18} color={pendingLeaves.length > 0 ? "#B7791F" : "#198754"} />}
        />
      </div>

      {/* 4. Operations & Decisions Grid: Pending Leaves & Recent Tasks */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(460px, 1fr))",
          gap: 20,
          alignItems: "start",
          marginBottom: 24,
        }}
      >
        {/* Pending Leave Approvals */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E4E7EC",
            borderRadius: 8,
            padding: "20px 24px",
            boxShadow: "0 1px 3px rgba(16, 24, 40, 0.05)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 16,
              borderBottom: "1px solid #F2F4F7",
              paddingBottom: 12,
            }}
          >
            <div>
              <span
                style={{
                  fontSize: 10,
                  fontFamily: "var(--font-mono)",
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  color: "#667085",
                  textTransform: "uppercase",
                }}
              >
                // PENDING DECISIONS
              </span>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: "#17202A", margin: "2px 0 0" }}>
                Leave Review Queue
              </h2>
            </div>
            <Link
              href="/cluster/leave"
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "#2F6FED",
                textDecoration: "none",
              }}
            >
              View Queue ({pendingLeaves.length}) →
            </Link>
          </div>

          {pendingLeaves.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="No Pending Leave Requests"
              description="All submitted leave applications have been addressed."
            />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {pendingLeaves.map((leave) => {
                const days =
                  Math.ceil(
                    (new Date(leave.endDate).getTime() - new Date(leave.startDate).getTime()) /
                      (1000 * 60 * 60 * 24)
                  ) + 1;

                return (
                  <div
                    key={leave.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 12,
                      padding: "12px 14px",
                      backgroundColor: "#F7F8FA",
                      border: "1px solid #E4E7EC",
                      borderRadius: 6,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 6,
                          backgroundColor: "#173B67",
                          color: "#FFFFFF",
                          fontSize: 12,
                          fontWeight: 700,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        {getInitials(leave.applicant.name)}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 13.5, fontWeight: 600, color: "#17202A" }}>
                          {leave.applicant.name}
                        </div>
                        <div style={{ fontSize: 12, color: "#667085", marginTop: 2 }}>
                          {formatDate(leave.startDate)} — {formatDate(leave.endDate)} · {days} {days === 1 ? "day" : "days"}
                        </div>
                      </div>
                    </div>
                    <Link
                      href="/cluster/leave"
                      style={{
                        padding: "6px 12px",
                        fontSize: 11.5,
                        fontWeight: 600,
                        backgroundColor: "#FFFFFF",
                        border: "1px solid #E4E7EC",
                        borderRadius: 5,
                        color: "#173B67",
                        textDecoration: "none",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Review →
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Task Deliverables */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E4E7EC",
            borderRadius: 8,
            padding: "20px 24px",
            boxShadow: "0 1px 3px rgba(16, 24, 40, 0.05)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 16,
              borderBottom: "1px solid #F2F4F7",
              paddingBottom: 12,
            }}
          >
            <div>
              <span
                style={{
                  fontSize: 10,
                  fontFamily: "var(--font-mono)",
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  color: "#667085",
                  textTransform: "uppercase",
                }}
              >
                // WORKLOAD PIPELINE
              </span>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: "#17202A", margin: "2px 0 0" }}>
                Active Task Pipeline
              </h2>
            </div>
            <Link
              href="/cluster/tasks"
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "#2F6FED",
                textDecoration: "none",
              }}
            >
              Task Matrix →
            </Link>
          </div>

          {clusterTasks.length === 0 ? (
            <EmptyState
              icon={CheckSquare}
              title="No Tasks Assigned"
              description="No deliverables have been assigned to cluster faculty yet."
            />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {clusterTasks.map((task) => {
                const priorityInfo = PRIORITY_BADGES[task.priority] ?? PRIORITY_BADGES.MEDIUM;
                const isOverdue = task.status === "OVERDUE";

                return (
                  <div
                    key={task.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 12,
                      padding: "10px 12px",
                      backgroundColor: "#F7F8FA",
                      border: "1px solid #E4E7EC",
                      borderRadius: 6,
                    }}
                  >
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "#17202A",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {task.title}
                      </div>
                      <div
                        style={{
                          fontSize: 11.5,
                          color: "#667085",
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          marginTop: 2,
                        }}
                      >
                        <span>→ {task.assignedTo.name}</span>
                        <span>·</span>
                        <span style={{ color: isOverdue ? "#C0392B" : "#667085", fontWeight: isOverdue ? 600 : 400 }}>
                          Due {formatDate(task.deadline)}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: priorityInfo.color,
                          backgroundColor: priorityInfo.bg,
                          padding: "2px 6px",
                          borderRadius: 4,
                        }}
                      >
                        {priorityInfo.label}
                      </span>
                      <StatusBadge status={task.status} size="sm" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 5. Faculty Cluster Roster Summary Table */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #E4E7EC",
          borderRadius: 8,
          overflow: "hidden",
          boxShadow: "0 1px 3px rgba(16, 24, 40, 0.05)",
        }}
      >
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid #E4E7EC",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "#FAFAFA",
          }}
        >
          <div>
            <span
              style={{
                fontSize: 10,
                fontFamily: "var(--font-mono)",
                fontWeight: 600,
                letterSpacing: "0.1em",
                color: "#667085",
                textTransform: "uppercase",
              }}
            >
              // FACULTY DIRECTORY
            </span>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: "#17202A", margin: "2px 0 0" }}>
              Cluster Faculty Roster
            </h2>
          </div>
          <Link
            href="/cluster/roster"
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "#2F6FED",
              textDecoration: "none",
            }}
          >
            Full Roster ({members.length}) →
          </Link>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #E4E7EC", backgroundColor: "#F7F8FA" }}>
                <th style={{ padding: "10px 16px", fontSize: 11, fontWeight: 600, color: "#667085", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Faculty Member
                </th>
                <th style={{ padding: "10px 16px", fontSize: 11, fontWeight: 600, color: "#667085", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Designation
                </th>
                <th style={{ padding: "10px 16px", fontSize: 11, fontWeight: 600, color: "#667085", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Joined Cluster
                </th>
                <th style={{ padding: "10px 16px", fontSize: 11, fontWeight: 600, color: "#667085", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "right" }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {members.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", color: "#667085", padding: 36, fontSize: 13 }}>
                    No members enrolled in this cluster yet.
                  </td>
                </tr>
              ) : (
                members.map((m) => (
                  <tr
                    key={m.userId}
                    style={{
                      borderBottom: "1px solid #F2F4F7",
                      transition: "background-color 0.15s ease",
                    }}
                  >
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 6,
                            backgroundColor: "#173B67",
                            color: "#FFFFFF",
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
                          <div style={{ fontWeight: 600, fontSize: 13.5, color: "#17202A" }}>
                            {m.user.name}
                          </div>
                          <div style={{ fontSize: 11.5, color: "#667085" }}>
                            {m.user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px", color: "#667085", fontSize: 13 }}>
                      {m.user.designation ?? "Faculty Member"}
                    </td>
                    <td style={{ padding: "12px 16px", color: "#667085", fontSize: 12.5 }}>
                      {formatDate(m.joinedAt)}
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "right" }}>
                      <Link
                        href="/cluster/roster"
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: "#2F6FED",
                          textDecoration: "none",
                        }}
                      >
                        Inspect →
                      </Link>
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