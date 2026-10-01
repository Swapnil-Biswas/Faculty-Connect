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
  AlertTriangle,
  Award,
  ArrowRight,
  ShieldAlert,
  Zap,
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
      {/* 1. Page Header with BMSIT Cyber Eyebrow */}
      <PageHeader
        breadcrumbs={[
          { label: "FACULTY_CONSOLE" },
          { label: "WORKSPACE" },
        ]}
        title={`Good ${getGreeting()}, ${session.user.name}`}
        subtitle={`Operational console for ${formatDate(new Date())} · NODE: ${clusterName.toUpperCase()} · BMSIT CSE`}
        actions={
          <div style={{ display: "flex", gap: 10 }}>
            <Link
              href="/faculty/leave"
              className="btn-outline"
              style={{ fontSize: 12.5, padding: "7px 14px", fontFamily: "var(--font-mono)" }}
            >
              <Calendar size={14} />
              + APPLY LEAVE
            </Link>
            <Link
              href="/faculty/tasks"
              className="btn-primary"
              style={{ fontSize: 12.5, padding: "7px 16px", fontFamily: "var(--font-mono)" }}
            >
              <CheckSquare size={14} />
              TASK MATRIX
            </Link>
          </div>
        }
      />

      {/* BMSIT Coding Club Cyber Dot Matrix Command Hero */}
      <DotMatrixHero
        titleLine1="FACULTY"
        titleLine2="WORKSPACE"
        eyebrow={`// OPERATIONAL NODE · ${clusterName.toUpperCase()} · BMSIT CSE`}
        tagline="Realtime academic activity logging, peer recognition, and automated NAAC/NBA criteria dossier synchronization."
        stats={[
          { label: "MERIT STARS", value: totalPoints, color: "#FFD700" },
          { label: "LEADERBOARD", value: leaderboardRank ? `#${leaderboardRank.rank}` : "UNRANKED", color: "#38BDF8" },
          { label: "ACTIVE TASKS", value: activeTasks.length, color: "#22C55E" },
          { label: "BADGES HELD", value: recentBadges.length, color: "#F59E0B" },
        ]}
      />

      {/* 2. Cyber Attention Alert Ribbons */}
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
                padding: "12px 18px",
                backgroundColor: "rgba(244, 63, 94, 0.08)",
                border: "1px solid rgba(244, 63, 94, 0.35)",
                borderRadius: 8,
                gap: 12,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span className="tech-led led-red" />
                <div>
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: "#FB7185", fontFamily: "var(--font-mono)" }}>
                    CRITICAL ATTENTION:
                  </span>{" "}
                  <span style={{ fontSize: 13, color: "#F8FAFC" }}>
                    You have {overdueTasks.length} overdue{" "}
                    {overdueTasks.length === 1 ? "deliverable" : "deliverables"} requiring immediate submission.
                  </span>
                </div>
              </div>
              <Link
                href="/faculty/tasks"
                style={{
                  fontSize: 11.5,
                  fontWeight: 700,
                  fontFamily: "var(--font-mono)",
                  color: "#FB7185",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  whiteSpace: "nowrap",
                }}
              >
                RESOLVE MATRIX <ArrowRight size={13} />
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
                backgroundColor: "rgba(245, 158, 11, 0.08)",
                border: "1px solid rgba(245, 158, 11, 0.35)",
                borderRadius: 8,
                gap: 12,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span className="tech-led led-gold" />
                <div>
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: "#FCD34D", fontFamily: "var(--font-mono)" }}>
                    LEAVE PENDING:
                  </span>{" "}
                  <span style={{ fontSize: 13, color: "#F8FAFC" }}>
                    {pendingLeaves.length} leave application awaiting Cluster Head evaluation.
                  </span>
                </div>
              </div>
              <Link
                href="/faculty/leave"
                style={{
                  fontSize: 11.5,
                  fontWeight: 700,
                  fontFamily: "var(--font-mono)",
                  color: "#FFD700",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  whiteSpace: "nowrap",
                }}
              >
                TRACK STATUS <ArrowRight size={13} />
              </Link>
            </div>
          )}
        </div>
      )}

      {/* 3. Cyber Operational Metric Blocks */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <MetricBlock
          label="Total Recognition Points"
          value={totalPoints.toLocaleString()}
          context="Verified append-only ledger"
          trendType="neutral"
          icon={<Star size={18} color="#FFD700" />}
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
          icon={<CheckSquare size={18} color="#38BDF8" />}
        />
        <MetricBlock
          label="Department Standing"
          value={leaderboardRank ? `#${leaderboardRank.rank}` : "TOP TIER"}
          context="Monthly faculty leaderboard"
          trendType="neutral"
          icon={<Trophy size={18} color="#FFD700" />}
        />
        <MetricBlock
          label="Pending Applications"
          value={pendingLeaves.length}
          context={
            pendingLeaves.length > 0 ? "Under cluster review" : "Pipeline clear"
          }
          trendType={pendingLeaves.length > 0 ? "warning" : "neutral"}
          icon={<Calendar size={18} color="#A78BFA" />}
        />
      </div>

      {/* 4. MAIN WORKSPACE: 2-COLUMN CYBER GRID */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.65fr) minmax(0, 1fr)",
          gap: 20,
          alignItems: "start",
        }}
      >
        {/* LEFT COLUMN: ACTIVE TASKS */}
        <div className="tech-card" style={{ padding: 0, overflow: "hidden" }}>
          <div
            style={{
              padding: "16px 22px",
              borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: "rgba(7, 9, 14, 0.6)",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span className="hero-eyebrow" style={{ margin: 0 }}>
                  // DELIVERABLES
                </span>
                <span className="glyph-chip glyph-chip-cyan" style={{ fontSize: 10 }}>
                  {tasks.length} ALLOCATED
                </span>
              </div>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "#F8FAFC", margin: "4px 0 0 0" }}>
                Assigned Academic Tasks
              </h2>
            </div>
            <Link
              href="/faculty/tasks"
              style={{
                fontSize: 11.5,
                fontWeight: 600,
                fontFamily: "var(--font-mono)",
                color: "#FFD700",
                textDecoration: "none",
                letterSpacing: "0.04em",
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
                    padding: "14px 22px",
                    borderBottom: index < tasks.length - 1 ? "1px solid rgba(255, 255, 255, 0.05)" : "none",
                    gap: 14,
                  }}
                  className="cyber-row-hover"
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "#F8FAFC",
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
                        fontSize: 11.5,
                        fontFamily: "var(--font-mono)",
                        color: "#64748B",
                      }}
                    >
                      <span style={{ display: "flex", alignItems: "center", gap: 4, color: "#94A3B8" }}>
                        <Clock size={12} />
                        DUE: {formatDate(task.deadline)}
                      </span>
                      <span>PRIORITY: <strong style={{ color: task.priority === "HIGH" ? "#F43F5E" : "#38BDF8" }}>{task.priority}</strong></span>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                    <StatusBadge status={task.status} size="sm" />
                    <Link
                      href="/faculty/tasks"
                      className="btn-outline"
                      style={{ fontSize: 11, padding: "4px 10px", fontFamily: "var(--font-mono)" }}
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
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* BADGES / ACHIEVEMENTS */}
          <div className="tech-card" style={{ padding: 22 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <div>
                <span className="hero-eyebrow" style={{ margin: 0 }}>
                  // RECOGNITION
                </span>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: "#F8FAFC", margin: "2px 0 0 0" }}>
                  Earned Badges
                </h2>
              </div>
              <Link
                href="/faculty/stars"
                style={{
                  fontSize: 11,
                  fontFamily: "var(--font-mono)",
                  fontWeight: 600,
                  color: "#FFD700",
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
                      backgroundColor: "rgba(255, 255, 255, 0.02)",
                      border: "1px solid rgba(255, 215, 0, 0.2)",
                      borderRadius: 8,
                    }}
                  >
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 6,
                        backgroundColor: "rgba(255, 215, 0, 0.1)",
                        border: "1px solid rgba(255, 215, 0, 0.3)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#FFD700",
                        flexShrink: 0,
                        boxShadow: "0 0 10px rgba(255, 215, 0, 0.15)",
                      }}
                    >
                      <Award size={18} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: "#F8FAFC",
                          lineHeight: 1.2,
                        }}
                      >
                        {ub.badge.name}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: "#64748B",
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
          <div className="tech-card" style={{ padding: 22 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <div>
                <span className="hero-eyebrow" style={{ margin: 0 }}>
                  // WORKFLOW
                </span>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: "#F8FAFC", margin: "2px 0 0 0" }}>
                  Leave Pipeline
                </h2>
              </div>
              <Link
                href="/faculty/leave"
                style={{
                  fontSize: 11,
                  fontFamily: "var(--font-mono)",
                  fontWeight: 600,
                  color: "#38BDF8",
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
                      backgroundColor: "rgba(255, 255, 255, 0.02)",
                      border: "1px solid rgba(255, 255, 255, 0.07)",
                      borderRadius: 8,
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
                      <span style={{ fontSize: 12, fontWeight: 600, fontFamily: "var(--font-mono)", color: "#F8FAFC" }}>
                        {formatDate(leave.startDate)} — {formatDate(leave.endDate)}
                      </span>
                      <StatusBadge status={leave.status} size="sm" />
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "#94A3B8",
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