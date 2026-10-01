import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/ui/PageHeader";
import { MetricBlock } from "@/components/ui/MetricBlock";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  CheckSquare,
  Calendar,
  Trophy,
  Star,
  Clock,
  AlertTriangle,
  Award,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Faculty Workspace — Dashboard" };

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}

export default async function FacultyDashboard() {
  const session = await auth();
  if (!session) redirect("/login");
  if (!["FACULTY", "CLUSTER_HEAD", "HOD", "ADMIN"].includes(session.user.role)) {
    redirect("/login");
  }

  const userId = session.user.id;

  // Real parallel data fetching from database
  const [tasks, leaves, ledgerTotal, leaderboardRank, recentBadges, userCluster] =
    await Promise.all([
      db.task.findMany({
        where: { assignedToId: userId, deletedAt: null },
        orderBy: { deadline: "asc" },
        take: 6,
      }),
      db.leaveApplication.findMany({
        where: { applicantId: userId },
        orderBy: { createdAt: "desc" },
        take: 3,
      }),
      db.pointsLedger.aggregate({
        where: { facultyId: userId },
        _sum: { amount: true },
      }),
      db.leaderboardSnapshot.findFirst({
        where: { facultyId: userId, period: "MONTHLY" },
        orderBy: { date: "desc" },
      }),
      db.userBadge.findMany({
        where: { userId },
        include: { badge: true },
        orderBy: { awardedAt: "desc" },
        take: 4,
      }),
      db.clusterMembership.findFirst({
        where: { userId },
        include: { cluster: true },
      }),
    ]);

  const totalPoints = ledgerTotal._sum.amount ?? 0;
  const activeTasks = tasks.filter((t) => ["OPEN", "IN_PROGRESS"].includes(t.status));
  const overdueTasks = tasks.filter((t) => t.status === "OVERDUE");
  const pendingLeaves = leaves.filter((l) => l.status === "PENDING");
  const clusterName = userCluster?.cluster?.name ?? "General Faculty";

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", paddingBottom: 40 }}>
      {/* 1. Page Header */}
      <PageHeader
        breadcrumbs={[
          { label: "Faculty Workspace" },
          { label: "Dashboard" },
        ]}
        title={`Good ${getGreeting()}, ${session.user.name}`}
        subtitle={`Academic profile and operational tasks for ${formatDate(new Date())} · ${clusterName}`}
        actions={
          <div style={{ display: "flex", gap: 8 }}>
            <Link
              href="/faculty/leave"
              className="btn-outline"
              style={{ fontSize: 13, padding: "7px 14px" }}
            >
              <Calendar size={14} />
              Apply Leave
            </Link>
            <Link
              href="/faculty/tasks"
              className="btn-primary"
              style={{ fontSize: 13, padding: "7px 14px" }}
            >
              <CheckSquare size={14} />
              View Tasks
            </Link>
          </div>
        }
      />

      {/* 2. SECTION A — ATTENTION AREA */}
      {(overdueTasks.length > 0 || pendingLeaves.length > 0) && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            marginBottom: 24,
          }}
        >
          {overdueTasks.length > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 16px",
                backgroundColor: "#FEF2F2",
                border: "1px solid #FECDCA",
                borderRadius: 6,
                gap: 12,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <ShieldAlert size={18} color="#C0392B" style={{ flexShrink: 0 }} />
                <div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#C0392B" }}>
                    Action Required:
                  </span>{" "}
                  <span style={{ fontSize: 13, color: "#17202A" }}>
                    You have {overdueTasks.length} overdue{" "}
                    {overdueTasks.length === 1 ? "task" : "tasks"} requiring completion.
                  </span>
                </div>
              </div>
              <Link
                href="/faculty/tasks"
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
                Resolve Tasks <ArrowRight size={13} />
              </Link>
            </div>
          )}

          {pendingLeaves.length > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 16px",
                backgroundColor: "#FEFCE8",
                border: "1px solid #FEF08A",
                borderRadius: 6,
                gap: 12,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Clock size={18} color="#B7791F" style={{ flexShrink: 0 }} />
                <div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#B7791F" }}>
                    Leave Pending Review:
                  </span>{" "}
                  <span style={{ fontSize: 13, color: "#17202A" }}>
                    {pendingLeaves.length} leave application is currently awaiting review by your Cluster Head.
                  </span>
                </div>
              </div>
              <Link
                href="/faculty/leave"
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
                Track Status <ArrowRight size={13} />
              </Link>
            </div>
          )}
        </div>
      )}

      {/* 3. SECTION C — OPERATIONAL CONTEXT METRICS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <MetricBlock
          label="Total Recognition Points"
          value={totalPoints.toLocaleString()}
          context="Verified append-only ledger"
          trendType="neutral"
          icon={<Star size={18} />}
        />
        <MetricBlock
          label="Active Tasks"
          value={activeTasks.length}
          context={
            overdueTasks.length > 0
              ? `${overdueTasks.length} overdue`
              : "All assignments on track"
          }
          trendType={overdueTasks.length > 0 ? "danger" : "positive"}
          icon={<CheckSquare size={18} />}
        />
        <MetricBlock
          label="Department Rank"
          value={leaderboardRank ? `#${leaderboardRank.rank}` : "—"}
          context="Monthly institutional standing"
          trendType="neutral"
          icon={<Trophy size={18} />}
        />
        <MetricBlock
          label="Pending Leave Requests"
          value={pendingLeaves.length}
          context={
            pendingLeaves.length > 0 ? "Awaiting decision" : "No active leave requests"
          }
          trendType={pendingLeaves.length > 0 ? "warning" : "neutral"}
          icon={<Calendar size={18} />}
        />
      </div>

      {/* 4. MAIN WORKSPACE: 2-COLUMN LAYOUT */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.6fr) minmax(0, 1fr)",
          gap: 20,
          alignItems: "start",
        }}
      >
        {/* LEFT COLUMN: ACTIVE TASKS */}
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div
            style={{
              padding: "16px 20px",
              borderBottom: "1px solid #E4E7EC",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 600, color: "#17202A", margin: 0 }}>
                Assigned Academic Tasks
              </h2>
              <p style={{ fontSize: 12, color: "#667085", margin: "2px 0 0 0" }}>
                Mandatory tasks allocated by Department and Cluster Heads
              </p>
            </div>
            <Link
              href="/faculty/tasks"
              style={{
                fontSize: 12,
                fontWeight: 500,
                color: "#2F6FED",
                textDecoration: "none",
              }}
            >
              View all ({tasks.length})
            </Link>
          </div>

          {tasks.length === 0 ? (
            <div style={{ padding: 24 }}>
              <EmptyState
                icon={CheckSquare}
                title="No tasks assigned"
                description="You currently have no tasks allocated. New departmental tasks will appear here."
              />
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {tasks.map((task, index) => (
                <div
                  key={task.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "14px 20px",
                    borderBottom: index < tasks.length - 1 ? "1px solid #F2F4F7" : "none",
                    gap: 12,
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 13.5,
                        fontWeight: 500,
                        color: "#17202A",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        marginBottom: 4,
                      }}
                    >
                      {task.title}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        fontSize: 12,
                        color: "#667085",
                      }}
                    >
                      <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <Clock size={12} />
                        Due {formatDate(task.deadline)}
                      </span>
                      <span>Priority: {task.priority.toLowerCase()}</span>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                    <StatusBadge status={task.status} size="sm" />
                    <Link
                      href="/faculty/tasks"
                      className="btn-outline"
                      style={{ fontSize: 11, padding: "4px 8px" }}
                    >
                      Update
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: RECOGNITION & LEAVE STATUS */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* BADGES / ACHIEVEMENTS */}
          <div className="card" style={{ padding: 20 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 14,
              }}
            >
              <h2 style={{ fontSize: 15, fontWeight: 600, color: "#17202A", margin: 0 }}>
                Recent Badges
              </h2>
              <Link
                href="/faculty/stars"
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: "#2F6FED",
                  textDecoration: "none",
                }}
              >
                View stars ledger
              </Link>
            </div>

            {recentBadges.length === 0 ? (
              <EmptyState
                icon={Award}
                title="No badges earned yet"
                description="Complete tasks on schedule and receive favorable evaluations to unlock institutional recognitions."
              />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {recentBadges.map((ub) => (
                  <div
                    key={ub.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "10px 12px",
                      backgroundColor: "#F7F8FA",
                      border: "1px solid #E4E7EC",
                      borderRadius: 6,
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 4,
                        backgroundColor: "#EFF6FF",
                        border: "1px solid #BFDBFE",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#2F6FED",
                        flexShrink: 0,
                      }}
                    >
                      <Award size={16} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "#17202A",
                          lineHeight: 1.2,
                        }}
                      >
                        {ub.badge.name}
                      </div>
                      <div
                        style={{
                          fontSize: 11.5,
                          color: "#667085",
                          marginTop: 2,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {ub.badge.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RECENT LEAVE LOG */}
          <div className="card" style={{ padding: 20 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 14,
              }}
            >
              <h2 style={{ fontSize: 15, fontWeight: 600, color: "#17202A", margin: 0 }}>
                Recent Leave Requests
              </h2>
              <Link
                href="/faculty/leave"
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: "#2F6FED",
                  textDecoration: "none",
                }}
              >
                Apply leave
              </Link>
            </div>

            {leaves.length === 0 ? (
              <EmptyState
                icon={Calendar}
                title="No leave applications"
                description="You have not submitted any recent leave applications."
              />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {leaves.map((leave) => (
                  <div
                    key={leave.id}
                    style={{
                      padding: "10px 12px",
                      backgroundColor: "#FFFFFF",
                      border: "1px solid #E4E7EC",
                      borderRadius: 6,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 4,
                      }}
                    >
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#17202A" }}>
                        {formatDate(leave.startDate)} — {formatDate(leave.endDate)}
                      </span>
                      <StatusBadge status={leave.status} size="sm" />
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "#667085",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {leave.reason || "Casual leave application"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}