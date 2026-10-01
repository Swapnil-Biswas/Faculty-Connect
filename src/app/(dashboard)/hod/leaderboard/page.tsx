import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getLiveLeaderboard } from "@/services/recognition";
import { db } from "@/lib/db";
import { Trophy, Star, RefreshCw, Award } from "lucide-react";
import { getInitials } from "@/lib/utils";
import { RefreshLeaderboardButton } from "./RefreshLeaderboardButton";

export default async function HodLeaderboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { role } = session.user;
  if (!["HOD", "ADMIN"].includes(role)) redirect("/faculty");

  const leaderboard = await getLiveLeaderboard();

  // Cluster filter options
  const clusters = await db.cluster.findMany({
    where: { deletedAt: null },
    orderBy: { name: "asc" },
  });

  // Faculty of Month — last 6 months
  const fomHistory = await db.facultyOfMonth.findMany({
    include: { faculty: true },
    orderBy: [{ year: "desc" }, { month: "desc" }],
    take: 6,
  });

  const top3 = leaderboard.slice(0, 3);
  const rank1 = top3[0];
  const rank2 = top3[1];
  const rank3 = top3[2];

  const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  return (
    <div className="dashboard-container" style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 className="page-title" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Trophy className="text-warning" size={28} />
            Department Leaderboard
          </h1>
          <p className="page-subtitle">
            Live rankings across all clusters — computed from PointsLedger aggregates. Snapshot to persist a period&apos;s ranking.
          </p>
        </div>
        <RefreshLeaderboardButton />
      </div>

      {/* Summary Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
        <div className="stat-card" style={{ position: "relative" }}>
          <div className="stat-card-glow" style={{ background: "hsl(45 93% 47% / 0.1)" }} />
          <div className="stat-card-icon" style={{ background: "hsl(45 93% 47% / 0.15)", color: "#eab308" }}>
            <Star size={24} fill="#eab308" />
          </div>
          <div className="stat-card-value">
            {leaderboard.length > 0
              ? Math.round(leaderboard.reduce((s, e) => s + e.totalPoints, 0) / leaderboard.length)
              : 0}
          </div>
          <div className="stat-card-label">Avg Points per Faculty</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: "hsl(var(--color-primary) / 0.15)", color: "hsl(var(--color-primary))" }}>
            <Trophy size={24} />
          </div>
          <div className="stat-card-value">{leaderboard.length}</div>
          <div className="stat-card-label">Faculty Ranked</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: "hsl(142 71% 45% / 0.15)", color: "hsl(142 71% 45%)" }}>
            <Award size={24} />
          </div>
          <div className="stat-card-value">
            {leaderboard.length > 0
              ? Math.round(leaderboard.reduce((s, e) => s + e.onTimeRate, 0) / leaderboard.length)
              : 0}%
          </div>
          <div className="stat-card-label">Avg On-Time Rate</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: "hsl(280 80% 60% / 0.15)", color: "hsl(280 80% 60%)" }}>
            <Star size={24} />
          </div>
          <div className="stat-card-value">{clusters.length}</div>
          <div className="stat-card-label">Active Clusters</div>
        </div>
      </div>

      {/* Podium — Top 3 */}
      {leaderboard.length >= 3 && (
        <>
          <h2 style={{ fontSize: "1.125rem", fontWeight: 700 }}>🏆 Top Performers</h2>
          <div className="podium-grid">
            {/* Silver */}
            <div className="podium-card podium-rank-2" style={{ order: 1 }}>
              <div className="podium-medal medal-silver">2</div>
              <div className="avatar avatar-md" style={{ margin: "0 auto 0.75rem" }}>
                {getInitials(rank2.name)}
              </div>
              <div style={{ fontWeight: 700 }}>{rank2.name}</div>
              <div style={{ fontSize: "0.8125rem", color: "hsl(var(--text-muted))" }}>{rank2.clusterName}</div>
              <div style={{ marginTop: "0.75rem", fontSize: "1.5rem", fontWeight: 800, color: "hsl(var(--color-primary))" }}>
                {rank2.totalPoints} <span style={{ fontSize: "0.75rem", fontWeight: 500 }}>pts</span>
              </div>
              <div style={{ fontSize: "0.75rem", color: "hsl(var(--text-muted))" }}>
                {rank2.onTimeRate}% on-time · {rank2.completedTasks} tasks
              </div>
            </div>

            {/* Gold */}
            <div className="podium-card podium-rank-1" style={{ order: 2 }}>
              <div className="podium-medal medal-gold">1</div>
              <div className="avatar avatar-lg" style={{ margin: "0 auto 0.75rem", boxShadow: "0 0 20px hsl(45 93% 47% / 0.35)" }}>
                {getInitials(rank1.name)}
              </div>
              <div style={{ fontWeight: 800, fontSize: "1.125rem" }}>{rank1.name}</div>
              <div style={{ fontSize: "0.8125rem", color: "hsl(var(--text-muted))" }}>{rank1.clusterName}</div>
              <div style={{ marginTop: "0.75rem", fontSize: "1.75rem", fontWeight: 900, color: "#eab308" }}>
                {rank1.totalPoints} <span style={{ fontSize: "0.75rem", fontWeight: 500 }}>pts</span>
              </div>
              <div style={{ fontSize: "0.75rem", color: "hsl(var(--text-muted))" }}>
                {rank1.onTimeRate}% on-time · {rank1.completedTasks} tasks
              </div>
            </div>

            {/* Bronze */}
            <div className="podium-card podium-rank-3" style={{ order: 3 }}>
              <div className="podium-medal medal-bronze">3</div>
              <div className="avatar avatar-md" style={{ margin: "0 auto 0.75rem" }}>
                {getInitials(rank3.name)}
              </div>
              <div style={{ fontWeight: 700 }}>{rank3.name}</div>
              <div style={{ fontSize: "0.8125rem", color: "hsl(var(--text-muted))" }}>{rank3.clusterName}</div>
              <div style={{ marginTop: "0.75rem", fontSize: "1.5rem", fontWeight: 800, color: "#ea580c" }}>
                {rank3.totalPoints} <span style={{ fontSize: "0.75rem", fontWeight: 500 }}>pts</span>
              </div>
              <div style={{ fontSize: "0.75rem", color: "hsl(var(--text-muted))" }}>
                {rank3.onTimeRate}% on-time · {rank3.completedTasks} tasks
              </div>
            </div>
          </div>
        </>
      )}

      {/* Full Table */}
      <div className="card" style={{ padding: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
          <h2 style={{ fontSize: "1.125rem", fontWeight: 700 }}>All Faculty Rankings</h2>
          <span style={{ fontSize: "0.875rem", color: "hsl(var(--text-muted))" }}>
            {leaderboard.length} faculty members
          </span>
        </div>

        {leaderboard.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem 1rem", color: "hsl(var(--text-muted))" }}>
            No ranking data available yet. Faculty earn points by completing tasks and receiving evaluations.
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th style={{ width: "60px" }}>Rank</th>
                  <th>Faculty</th>
                  <th>Cluster</th>
                  <th>Total Points</th>
                  <th>Tasks Done</th>
                  <th>On-Time %</th>
                  <th>Avg Rating</th>
                  <th>Badges</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry) => (
                  <tr key={entry.userId}>
                    <td>
                      <span
                        style={{
                          fontWeight: 800,
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: "28px",
                          height: "28px",
                          borderRadius: "50%",
                          background:
                            entry.rank === 1 ? "#fef08a" :
                            entry.rank === 2 ? "#e2e8f0" :
                            entry.rank === 3 ? "#fed7aa" :
                            "hsl(var(--bg-muted))",
                          color:
                            entry.rank === 1 ? "#854d0e" :
                            entry.rank === 2 ? "#334155" :
                            entry.rank === 3 ? "#9a3412" : "inherit",
                        }}
                      >
                        {entry.rank}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <div className="avatar avatar-sm">{getInitials(entry.name)}</div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>{entry.name}</div>
                          <div style={{ fontSize: "0.75rem", color: "hsl(var(--text-muted))" }}>
                            {entry.designation ?? entry.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="role-badge" style={{ fontSize: "11px", padding: "2px 8px" }}>
                        {entry.clusterName}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 800, color: "hsl(var(--color-primary))" }}>
                        {entry.totalPoints} pts
                      </span>
                    </td>
                    <td>{entry.completedTasks}</td>
                    <td>
                      <span style={{ fontWeight: 600, color: entry.onTimeRate >= 80 ? "#16a34a" : "#b45309" }}>
                        {entry.onTimeRate}%
                      </span>
                    </td>
                    <td>
                      <span style={{ display: "flex", alignItems: "center", gap: "2px" }}>
                        <Star size={13} fill="#eab308" color="#eab308" />
                        {entry.avgEvaluation > 0 ? entry.avgEvaluation : "—"}
                      </span>
                    </td>
                    <td>
                      <span className="status-badge" style={{ fontSize: "11px" }}>
                        {entry.badgesCount} 🏅
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Faculty of Month History */}
      {fomHistory.length > 0 && (
        <div className="card" style={{ padding: "1.5rem" }}>
          <h2 style={{ fontSize: "1.125rem", fontWeight: 700, marginBottom: "1rem" }}>
            🌟 Faculty of the Month — History
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem" }}>
            {fomHistory.map((award) => {
              const stats = award.snapshotStats as Record<string, number | string>;
              return (
                <div
                  key={award.id}
                  className="card-glass"
                  style={{
                    padding: "1.25rem",
                    borderRadius: "var(--radius-lg)",
                    border: "1px solid hsl(45 93% 47% / 0.35)",
                    background: "linear-gradient(135deg, hsl(45 93% 47% / 0.06), transparent)",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>🌟</div>
                  <div style={{ fontWeight: 700, fontSize: "0.9375rem" }}>{award.faculty.name}</div>
                  <div style={{ fontSize: "0.8125rem", color: "hsl(var(--text-muted))", marginTop: "2px" }}>
                    {MONTHS[award.month - 1]} {award.year}
                  </div>
                  {typeof stats.pointsEarned === "number" && (
                    <div style={{ marginTop: "0.5rem", fontSize: "0.8125rem", fontWeight: 600, color: "#eab308" }}>
                      {stats.pointsEarned} pts
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}