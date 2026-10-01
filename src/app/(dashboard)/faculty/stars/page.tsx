import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getLiveLeaderboard } from "@/services/recognition";
import { Star, Trophy, Award, Sparkles } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function FacultyStarsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = session.user.id;

  // 1. Fetch points ledger
  const ledger = await db.pointsLedger.findMany({
    where: { facultyId: userId },
    orderBy: { createdAt: "desc" },
  });

  const totalPoints = ledger.reduce((sum, p) => sum + p.amount, 0);

  // 2. Compute live rank
  const leaderboard = await getLiveLeaderboard();
  const rankEntry = leaderboard.find((e) => e.userId === userId);
  const currentRank = rankEntry ? rankEntry.rank : "-";
  const totalFaculty = leaderboard.length;

  // 3. Fetch Badges
  const allBadges = await db.badge.findMany();
  const userBadges = await db.userBadge.findMany({
    where: { userId },
    include: { badge: true },
  });

  const earnedBadgeIds = new Set(userBadges.map((ub) => ub.badgeId));

  // 4. Source breakdown
  const taskPoints = ledger
    .filter((p) => p.source === "TASK_COMPLETED")
    .reduce((sum, p) => sum + p.amount, 0);
  const evalPoints = ledger
    .filter((p) => p.source === "EVALUATION")
    .reduce((sum, p) => sum + p.amount, 0);
  const otherPoints = totalPoints - taskPoints - evalPoints;

  return (
    <div className="dashboard-container" style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Header */}
      <div>
        <h1 className="page-title" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Star className="text-warning" fill="currentColor" size={28} />
          My Recognition & Stars
        </h1>
        <p className="page-subtitle">
          Transparent, append-only performance ledger and achievements earned across academic tasks.
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid-responsive-4" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
        <div className="stat-card" style={{ position: "relative" }}>
          <div className="stat-card-glow" style={{ background: "hsl(45 93% 47% / 0.15)" }} />
          <div className="stat-card-icon" style={{ background: "hsl(45 93% 47% / 0.15)", color: "#eab308" }}>
            <Star size={24} fill="#eab308" />
          </div>
          <div className="stat-card-value" style={{ color: "#eab308" }}>{totalPoints}</div>
          <div className="stat-card-label">Total Points Earned</div>
        </div>

        <div className="stat-card" style={{ position: "relative" }}>
          <div className="stat-card-glow" style={{ background: "hsl(var(--color-primary) / 0.15)" }} />
          <div className="stat-card-icon" style={{ background: "hsl(var(--color-primary) / 0.15)", color: "hsl(var(--color-primary))" }}>
            <Trophy size={24} />
          </div>
          <div className="stat-card-value">#{currentRank} <span style={{ fontSize: "14px", fontWeight: "normal", color: "hsl(var(--text-muted))" }}>/ {totalFaculty}</span></div>
          <div className="stat-card-label">Department Rank</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: "hsl(142 71% 45% / 0.15)", color: "hsl(142 71% 45%)" }}>
            <Award size={24} />
          </div>
          <div className="stat-card-value">{userBadges.length} <span style={{ fontSize: "14px", fontWeight: "normal", color: "hsl(var(--text-muted))" }}>/ {allBadges.length}</span></div>
          <div className="stat-card-label">Badges Unlocked</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: "hsl(280 80% 60% / 0.15)", color: "hsl(280 80% 60%)" }}>
            <Sparkles size={24} />
          </div>
          <div className="stat-card-value">{rankEntry?.onTimeRate ?? 0}%</div>
          <div className="stat-card-label">On-Time Completion Rate</div>
        </div>
      </div>

      {/* Points Source Breakdown */}
      <div className="card" style={{ padding: "1.25rem" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1rem" }}>Points Breakdown by Source</h2>
        <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: "180px", padding: "0.75rem", background: "hsl(var(--bg-muted))", borderRadius: "var(--radius-md)" }}>
            <div style={{ fontSize: "0.8125rem", color: "hsl(var(--text-muted))" }}>Task Completion</div>
            <div style={{ fontSize: "1.25rem", fontWeight: 700, marginTop: "0.25rem" }}>{taskPoints} pts</div>
          </div>
          <div style={{ flex: 1, minWidth: "180px", padding: "0.75rem", background: "hsl(var(--bg-muted))", borderRadius: "var(--radius-md)" }}>
            <div style={{ fontSize: "0.8125rem", color: "hsl(var(--text-muted))" }}>Evaluations</div>
            <div style={{ fontSize: "1.25rem", fontWeight: 700, marginTop: "0.25rem" }}>{evalPoints} pts</div>
          </div>
          <div style={{ flex: 1, minWidth: "180px", padding: "0.75rem", background: "hsl(var(--bg-muted))", borderRadius: "var(--radius-md)" }}>
            <div style={{ fontSize: "0.8125rem", color: "hsl(var(--text-muted))" }}>Bonus & Achievements</div>
            <div style={{ fontSize: "1.25rem", fontWeight: 700, marginTop: "0.25rem" }}>{otherPoints} pts</div>
          </div>
        </div>
      </div>

      {/* Badges & Achievements Section */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Award className="text-primary" size={22} />
            Badges & Achievements
          </h2>
          <span style={{ fontSize: "0.875rem", color: "hsl(var(--text-muted))" }}>
            {userBadges.length} of {allBadges.length} unlocked
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
          {allBadges.map((badge) => {
            const isEarned = earnedBadgeIds.has(badge.id);
            const userBadge = userBadges.find((ub) => ub.badgeId === badge.id);

            return (
              <div
                key={badge.id}
                className={`badge-card ${isEarned ? "badge-unlocked" : "badge-locked"}`}
              >
                <div className="badge-icon-box">
                  {badge.name === "Early Bird" ? "⚡" :
                   badge.name === "Task Master" ? "👑" :
                   badge.name === "Consistent Performer" ? "🔥" :
                   badge.name === "Perfect Score" ? "🌟" :
                   badge.name === "Century Club" ? "💯" : "🏆"}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <div style={{ fontWeight: 600, fontSize: "0.9375rem" }}>{badge.name}</div>
                    {isEarned && (
                      <span className="status-badge status-approved" style={{ fontSize: "10px", padding: "1px 6px" }}>
                        Unlocked
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: "0.8125rem", color: "hsl(var(--text-muted))", marginTop: "2px" }}>
                    {badge.description}
                  </div>
                  {isEarned && userBadge && (
                    <div style={{ fontSize: "0.75rem", color: "hsl(var(--color-primary))", marginTop: "4px" }}>
                      Earned on {formatDate(userBadge.awardedAt)}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Append-Only Points Ledger Table */}
      <div className="card" style={{ padding: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
          <div>
            <h2 style={{ fontSize: "1.125rem", fontWeight: 700 }}>Points Ledger History</h2>
            <p style={{ fontSize: "0.8125rem", color: "hsl(var(--text-muted))" }}>
              Every star earned is recorded immutably with explainable criteria.
            </p>
          </div>
          <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "hsl(var(--text-secondary))" }}>
            {ledger.length} entries
          </span>
        </div>

        {ledger.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem 1rem", color: "hsl(var(--text-muted))" }}>
            No point entries yet. Complete tasks and receive evaluations to earn stars!
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Source</th>
                  <th>Reason / Details</th>
                  <th>Points</th>
                  <th>Config Version</th>
                </tr>
              </thead>
              <tbody>
                {ledger.map((entry) => (
                  <tr key={entry.id}>
                    <td style={{ whiteSpace: "nowrap", fontSize: "0.8125rem" }}>
                      {formatDate(entry.createdAt)}
                    </td>
                    <td>
                      <span
                        className="status-badge"
                        style={{
                          fontSize: "11px",
                          background:
                            entry.source === "TASK_COMPLETED"
                              ? "hsl(142 71% 45% / 0.12)"
                              : entry.source === "EVALUATION"
                              ? "hsl(var(--color-primary) / 0.12)"
                              : "hsl(38 92% 50% / 0.12)",
                          color:
                            entry.source === "TASK_COMPLETED"
                              ? "hsl(142 71% 35%)"
                              : entry.source === "EVALUATION"
                              ? "hsl(var(--color-primary))"
                              : "#b45309",
                        }}
                      >
                        {entry.source.replace("_", " ")}
                      </span>
                    </td>
                    <td style={{ maxWidth: "340px" }}>
                      <div style={{ fontWeight: 500, fontSize: "0.875rem" }}>{entry.reason}</div>
                    </td>
                    <td>
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: "0.9375rem",
                          color: "#16a34a",
                        }}
                      >
                        +{entry.amount} pts
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: "0.8125rem", color: "hsl(var(--text-muted))" }}>
                        v{entry.scoringConfigVersion ?? 1}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}