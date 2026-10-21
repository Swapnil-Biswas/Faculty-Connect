import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/ui/PageHeader";
import { MetricBlock } from "@/components/ui/MetricBlock";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { DotMatrixHero } from "@/components/dashboard/DotMatrixHero";
import {
  CheckSquare,
  Calendar,
  Trophy,
  Star,
  Clock,
  Award,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Faculty Console // Workspace" };

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
    <div style={{ maxWidth: 1240, margin: "0 auto", paddingBottom: 48 }}>
      {/* 1. Page Header with Bauhaus Eyebrow */}
      <PageHeader
        breadcrumbs={[
          { label: "FACULTY_CONSOLE" },
          { label: "WORKSPACE" },
        ]}
        eyebrow="FACULTY CONSOLE"
        title={`Good ${getGreeting()}, ${session.user.name}`}
        subtitle={`Operational console for ${formatDate(new Date())} · NODE: ${clusterName.toUpperCase()} · BMSIT CSE`}
        actions={
          <div style={{ display: "flex", gap: 10 }}>
            <Link
              href="/faculty/leave"
              className="btn-outline"
              style={{ fontSize: 12.5, padding: "8px 16px" }}
            >
              <Calendar size={14} />
              + APPLY LEAVE
            </Link>
            <Link
              href="/faculty/tasks"
              className="btn-primary"
              style={{ fontSize: 12.5, padding: "8px 18px" }}
            >
              <CheckSquare size={14} />
              TASK MATRIX
            </Link>
          </div>
        }
      />

      {/* Bauhaus Constructivist Command Hero */}
      <DotMatrixHero
        titleLine1="FACULTY"
        titleLine2="WORKSPACE"
        eyebrow={`// OPERATIONAL NODE · ${clusterName.toUpperCase()} · BMSIT CSE`}
        tagline="Realtime academic activity logging, peer recognition, and automated NAAC/NBA criteria dossier synchronization."
        stats={[
          { label: "MERIT STARS", value: totalPoints, color: "#121212" },
          { label: "LEADERBOARD", value: leaderboardRank ? `#${leaderboardRank.rank}` : "UNRANKED", color: "#1040C0" },
          { label: "ACTIVE TASKS", value: activeTasks.length, color: "#121212" },
          { label: "BADGES HELD", value: recentBadges.length, color: "#D02020" },
        ]}
      />

      {/* 2. Bauhaus Attention Alert Ribbons */}
      {(overdueTasks.length > 0 || pendingLeaves.length > 0) && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            marginBottom: 28,
          }}
        >
          {overdueTasks.length > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 20px",
                backgroundColor: "#D02020",
                color: "#FFFFFF",
                border: "3px solid #121212",
                boxShadow: "4px 4px 0px 0px #121212",
                gap: 14,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <AlertTriangle size={18} strokeWidth={3} />
                <div>
                  <span style={{ fontSize: 12.5, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    CRITICAL ATTENTION:
                  </span>{" "}
                  <span style={{ fontSize: 13, fontWeight: 600 }}>
                    You have {overdueTasks.length} overdue{" "}
                    {overdueTasks.length === 1 ? "deliverable" : "deliverables"} requiring immediate submission.
                  </span>
                </div>
              </div>
              <Link
                href="/faculty/tasks"
                style={{
                  fontSize: 12,
                  fontWeight: 900,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "#121212",
                  backgroundColor: "#FFFFFF",
                  border: "2px solid #121212",
                  padding: "4px 10px",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  whiteSpace: "nowrap",
                }}
              >
                RESOLVE MATRIX <ArrowRight size={13} strokeWidth={3} />
              </Link>
            </div>
          )}

          {pendingLeaves.length > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 20px",
                backgroundColor: "#F0C020",
                color: "#121212",
                border: "3px solid #121212",
                boxShadow: "4px 4px 0px 0px #121212",
                gap: 14,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Clock size={18} strokeWidth={3} />
                <div>
                  <span style={{ fontSize: 12.5, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    LEAVE PENDING:
                  </span>{" "}
                  <span style={{ fontSize: 13, fontWeight: 600 }}>
                    {pendingLeaves.length} leave application awaiting Cluster Head evaluation.
                  </span>
                </div>
              </div>
              <Link
                href="/faculty/leave"
                style={{
                  fontSize: 12,
                  fontWeight: 900,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "#FFFFFF",
                  backgroundColor: "#121212",
                  border: "2px solid #121212",
                  padding: "4px 10px",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  whiteSpace: "nowrap",
                }}
              >
                TRACK STATUS <ArrowRight size={13} strokeWidth={3} />
              </Link>
            </div>
          )}
        </div>
      )}

      {/* 3. Bauhaus Operational Metric Blocks */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 16,
          marginBottom: 28,
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
          label="Active Deliverables"
          value={activeTasks.length}
          context={
            overdueTasks.length > 0
              ? `${overdueTasks.length} overdue tasks`
              : "All tasks on schedule"
          }
          trendType={overdueTasks.length > 0 ? "danger" : "positive"}
          icon={<CheckSquare size={18} />}
        />
        <MetricBlock
          label="Department Standing"
          value={leaderboardRank ? `#${leaderboardRank.rank}` : "TOP TIER"}
          context="Monthly faculty leaderboard"
          trendType="neutral"
          icon={<Trophy size={18} />}
        />
        <MetricBlock
          label="Pending Applications"
          value={pendingLeaves.length}
          context={
            pendingLeaves.length > 0 ? "Under cluster review" : "Pipeline clear"
          }
          trendType={pendingLeaves.length > 0 ? "warning" : "neutral"}
          icon={<Calendar size={18} />}
        />
      </div>

      {/* 4. MAIN WORKSPACE: 2-COLUMN BAUHAUS GRID */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.65fr) minmax(0, 1fr)",
          gap: 24,
          alignItems: "start",
        }}
      >
        {/* LEFT COLUMN: ACTIVE TASKS */}
        <div
          style={{
            background: "#FFFFFF",
            border: "4px solid #121212",
            boxShadow: "6px 6px 0px 0px #121212",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "16px 22px",
              borderBottom: "3px solid #121212",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: "#F0F0F0",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span
                  style={{
                    fontSize: 10.5,
                    fontWeight: 900,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    backgroundColor: "#1040C0",
                    color: "#FFFFFF",
                    padding: "2px 8px",
                    border: "1.5px solid #121212",
                  }}
                >
                  // DELIVERABLES
                </span>
                <span
                  style={{
                    fontSize: 10.5,
                    fontWeight: 900,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    backgroundColor: "#F0C020",
                    color: "#121212",
                    padding: "2px 6px",
                    border: "1.5px solid #121212",
                  }}
                >
                  {tasks.length} ALLOCATED
                </span>
              </div>
              <h2 style={{ fontSize: 18, fontWeight: 900, textTransform: "uppercase", color: "#121212", margin: "6px 0 0 0" }}>
                Assigned Academic Tasks
              </h2>
            </div>
            <Link
              href="/faculty/tasks"
              style={{
                fontSize: 12,
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "#1040C0",
                textDecoration: "none",
              }}
            >
              EXPAND ALL →
            </Link>
          </div>

          {tasks.length === 0 ? (
            <div style={{ padding: 28 }}>
              <EmptyState
                icon={CheckSquare}
                title="NO TASKS ASSIGNED"
                description="You currently have no pending tasks allocated. New departmental tasks will populate in real time."
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
                    padding: "16px 22px",
                    borderBottom: index < tasks.length - 1 ? "2px solid #121212" : "none",
                    gap: 14,
                    backgroundColor: "#FFFFFF",
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: "#121212",
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
                        color: "#424245",
                      }}
                    >
                      <span style={{ display: "flex", alignItems: "center", gap: 4, fontWeight: 600 }}>
                        <Clock size={13} />
                        DUE: {formatDate(task.deadline)}
                      </span>
                      <span>
                        PRIORITY:{" "}
                        <strong
                          style={{
                            color: task.priority === "HIGH" ? "#D02020" : "#1040C0",
                            fontWeight: 900,
                          }}
                        >
                          {task.priority}
                        </strong>
                      </span>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                    <StatusBadge status={task.status} size="sm" />
                    <Link
                      href="/faculty/tasks"
                      className="btn-outline"
                      style={{ fontSize: 11, padding: "5px 12px" }}
                    >
                      UPDATE
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: RECOGNITION & LEAVE PIPELINE */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* BADGES / ACHIEVEMENTS */}
          <div
            style={{
              background: "#FFFFFF",
              border: "4px solid #121212",
              boxShadow: "6px 6px 0px 0px #121212",
              padding: 22,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: 10.5,
                    fontWeight: 900,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    backgroundColor: "#F0C020",
                    color: "#121212",
                    padding: "2px 8px",
                    border: "1.5px solid #121212",
                  }}
                >
                  // RECOGNITION
                </span>
                <h2 style={{ fontSize: 16, fontWeight: 900, textTransform: "uppercase", color: "#121212", margin: "6px 0 0 0" }}>
                  Earned Badges
                </h2>
              </div>
              <Link
                href="/faculty/stars"
                style={{
                  fontSize: 11.5,
                  fontWeight: 900,
                  textTransform: "uppercase",
                  color: "#D02020",
                  textDecoration: "none",
                }}
              >
                STARS LEDGER →
              </Link>
            </div>

            {recentBadges.length === 0 ? (
              <EmptyState
                icon={Award}
                title="NO BADGES UNLOCKED"
                description="Complete deliverables on schedule to unlock merit badges and institutional awards."
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
                      padding: "10px 14px",
                      backgroundColor: "#F0F0F0",
                      border: "2px solid #121212",
                      boxShadow: "3px 3px 0px 0px #121212",
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        backgroundColor: "#F0C020",
                        border: "2px solid #121212",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#121212",
                        flexShrink: 0,
                      }}
                    >
                      <Award size={18} strokeWidth={2.5} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 800,
                          textTransform: "uppercase",
                          color: "#121212",
                          lineHeight: 1.2,
                        }}
                      >
                        {ub.badge.name}
                      </div>
                      <div
                        style={{
                          fontSize: 11.5,
                          fontWeight: 500,
                          color: "#424245",
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

          {/* RECENT LEAVE PIPELINE */}
          <div
            style={{
              background: "#FFFFFF",
              border: "4px solid #121212",
              boxShadow: "6px 6px 0px 0px #121212",
              padding: 22,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: 10.5,
                    fontWeight: 900,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    backgroundColor: "#1040C0",
                    color: "#FFFFFF",
                    padding: "2px 8px",
                    border: "1.5px solid #121212",
                  }}
                >
                  // WORKFLOW
                </span>
                <h2 style={{ fontSize: 16, fontWeight: 900, textTransform: "uppercase", color: "#121212", margin: "6px 0 0 0" }}>
                  Leave Pipeline
                </h2>
              </div>
              <Link
                href="/faculty/leave"
                style={{
                  fontSize: 11.5,
                  fontWeight: 900,
                  textTransform: "uppercase",
                  color: "#1040C0",
                  textDecoration: "none",
                }}
              >
                APPLY LEAVE →
              </Link>
            </div>

            {leaves.length === 0 ? (
              <EmptyState
                icon={Calendar}
                title="NO LEAVE ENTRIES"
                description="No recent leave applications registered in your account."
              />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {leaves.map((leave) => (
                  <div
                    key={leave.id}
                    style={{
                      padding: "12px 14px",
                      backgroundColor: "#F0F0F0",
                      border: "2px solid #121212",
                      boxShadow: "3px 3px 0px 0px #121212",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 6,
                      }}
                    >
                      <span style={{ fontSize: 12, fontWeight: 800, color: "#121212" }}>
                        {formatDate(leave.startDate)} — {formatDate(leave.endDate)}
                      </span>
                      <StatusBadge status={leave.status} size="sm" />
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 500,
                        color: "#424245",
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