import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { StatCard } from "@/components/ui/StatCard";
import { CheckSquare, Star, Calendar, Trophy, Clock, TrendingUp, Award } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "My Dashboard" };

export default async function FacultyDashboard() {
  const session = await auth();
  if (!session) redirect("/login");
  if (!["FACULTY", "CLUSTER_HEAD", "HOD", "ADMIN"].includes(session.user.role)) {
    redirect("/login");
  }

  const userId = session.user.id;

  // Parallel data fetching
  const [tasks, leaves, ledgerTotal, leaderboardRank, recentBadges] = await Promise.all([
    db.task.findMany({
      where: { assignedToId: userId, deletedAt: null },
      orderBy: { deadline: "asc" },
      take: 5,
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
      take: 3,
    }),
  ]);

  const totalPoints = ledgerTotal._sum.amount ?? 0;
  const openTasks = tasks.filter((t) => ["OPEN", "IN_PROGRESS"].includes(t.status)).length;
  const completedTasks = tasks.filter((t) => t.status === "COMPLETED").length;
  const overdueTasks = tasks.filter((t) => t.status === "OVERDUE").length;
  const pendingLeaves = leaves.filter((l) => l.status === "PENDING").length;

  return (
    <div>
      {/* Page header */}
      <div className="page-header">
        <h2 className="page-title">
          Good {getGreeting()},{" "}
          <span className="text-gradient">{session.user.name.split(" ")[0]}</span> 👋
        </h2>
        <p className="page-subtitle">
          Here's your activity summary for today, {formatDate(new Date())}.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid-4 fade-in" style={{ marginBottom: 28 }}>
        <StatCard
          label="Total Stars"
          value={totalPoints.toFixed(0)}
          icon={<Star size={20} />}
          iconBg="hsl(38 92% 50% / 0.12)"
          glowColor="hsl(38, 92%, 50%)"
          trend={{ value: 12, label: "+12 this week" }}
        />
        <StatCard
          label="Active Tasks"
          value={openTasks}
          icon={<CheckSquare size={20} />}
          iconBg="hsl(192 91% 50% / 0.12)"
          glowColor="hsl(192, 91%, 50%)"
          trend={overdueTasks > 0 ? { value: -1, label: `${overdueTasks} overdue` } : undefined}
        />
        <StatCard
          label="Leaderboard Rank"
          value={leaderboardRank ? `#${leaderboardRank.rank}` : "—"}
          icon={<Trophy size={20} />}
          iconBg="hsl(258 90% 66% / 0.12)"
          glowColor="hsl(258, 90%, 66%)"
        />
        <StatCard
          label="Pending Leaves"
          value={pendingLeaves}
          icon={<Calendar size={20} />}
          iconBg="hsl(142 71% 45% / 0.12)"
          glowColor="hsl(142, 71%, 45%)"
        />
      </div>

      <div className="grid-2" style={{ alignItems: "start" }}>
        {/* Tasks */}
        <div className="card fade-in fade-in-delay-1">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h3 className="section-title" style={{ margin: 0 }}>My Tasks</h3>
            <a href="/faculty/tasks" className="btn-outline" style={{ padding: "6px 14px", fontSize: 12 }}>
              View all
            </a>
          </div>

          {tasks.length === 0 ? (
            <div className="empty-state">
              <CheckSquare size={40} className="empty-state-icon" />
              <div className="empty-state-title">No tasks assigned</div>
              <div className="empty-state-desc">You have no tasks yet. Check back later.</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {tasks.map((task) => (
                <div
                  key={task.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px 14px",
                    background: "hsl(var(--bg-subtle))",
                    borderRadius: 10,
                    cursor: "pointer",
                    transition: "background 0.1s",
                  }}
                >
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: getTaskColor(task.status),
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 13.5,
                        fontWeight: 600,
                        color: "hsl(var(--text-primary))",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {task.title}
                    </div>
                    <div style={{ fontSize: 12, color: "hsl(var(--text-muted))", display: "flex", gap: 8, marginTop: 2 }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                        <Clock size={11} /> Due {formatDate(task.deadline)}
                      </span>
                    </div>
                  </div>
                  <span className={`status-badge status-${task.status.toLowerCase().replace("_", "-")}`}>
                    {task.status.replace("_", " ")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right column: Badges + Leave */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {/* Badges */}
          <div className="card fade-in fade-in-delay-2">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h3 className="section-title" style={{ margin: 0 }}>Recent Badges</h3>
              <a href="/faculty/stars" className="btn-outline" style={{ padding: "6px 14px", fontSize: 12 }}>
                View all
              </a>
            </div>

            {recentBadges.length === 0 ? (
              <div className="empty-state" style={{ padding: "24px" }}>
                <Award size={36} className="empty-state-icon" />
                <div className="empty-state-title">No badges yet</div>
                <div className="empty-state-desc">Complete tasks and evaluations to earn badges.</div>
              </div>
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
                      background: "hsl(var(--color-primary) / 0.06)",
                      borderRadius: 10,
                      border: "1px solid hsl(var(--color-primary) / 0.12)",
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: "linear-gradient(135deg, hsl(var(--color-primary)), hsl(var(--color-secondary)))",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 18,
                        flexShrink: 0,
                      }}
                    >
                      🏅
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "hsl(var(--text-primary))" }}>
                        {ub.badge.name}
                      </div>
                      <div style={{ fontSize: 11.5, color: "hsl(var(--text-secondary))" }}>
                        {ub.badge.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Leave status */}
          <div className="card fade-in fade-in-delay-3">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h3 className="section-title" style={{ margin: 0 }}>Leave Requests</h3>
              <a href="/faculty/leave" className="btn-outline" style={{ padding: "6px 14px", fontSize: 12 }}>
                Apply
              </a>
            </div>

            {leaves.length === 0 ? (
              <div className="empty-state" style={{ padding: "20px" }}>
                <Calendar size={32} className="empty-state-icon" />
                <div className="empty-state-title">No leave requests</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {leaves.map((leave) => (
                  <div
                    key={leave.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 12px",
                      background: "hsl(var(--bg-subtle))",
                      borderRadius: 8,
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "hsl(var(--text-primary))" }}>
                        {formatDate(leave.startDate)} — {formatDate(leave.endDate)}
                      </div>
                      <div style={{ fontSize: 12, color: "hsl(var(--text-muted))" }}>
                        {leave.reason.slice(0, 40)}{leave.reason.length > 40 ? "…" : ""}
                      </div>
                    </div>
                    <span className={`status-badge status-${leave.status.toLowerCase()}`}>
                      {leave.status}
                    </span>
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

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function getTaskColor(status: string) {
  switch (status) {
    case "COMPLETED": return "hsl(var(--color-success))";
    case "OVERDUE": return "hsl(var(--color-danger))";
    case "IN_PROGRESS": return "hsl(var(--color-warning))";
    default: return "hsl(var(--color-info))";
  }
}