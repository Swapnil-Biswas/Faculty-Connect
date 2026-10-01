import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getLiveLeaderboard } from "@/services/recognition";
import { Trophy, Medal, Star, CheckCircle, Users } from "lucide-react";
import { getInitials } from "@/lib/utils";

export default async function FacultyLeaderboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const currentUserId = session.user.id;
  const leaderboard = await getLiveLeaderboard();

  const top3 = leaderboard.slice(0, 3);
  const rank1 = top3[0];
  const rank2 = top3[1];
  const rank3 = top3[2];

  return (
    <div className="dashboard-container" style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Header */}
      <div>
        <h1 className="page-title" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Trophy className="text-warning" size={28} />
          Department Leaderboard
        </h1>
        <p className="page-subtitle">
          Transparent department-wide performance rankings based on on-time completion, quality evaluations, and consistency.
        </p>
      </div>

      {/* Podium for Top 3 */}
      {leaderboard.length >= 3 && (
        <div className="podium-grid">
          {/* Rank 2 (Silver) */}
          <div className="podium-card podium-rank-2" style={{ order: 1 }}>
            <div className="podium-medal medal-silver">2</div>
            <div className="avatar avatar-md" style={{ margin: "0 auto 0.75rem auto" }}>
              {getInitials(rank2.name)}
            </div>
            <div style={{ fontWeight: 700, fontSize: "1.0625rem" }}>{rank2.name}</div>
            <div style={{ fontSize: "0.8125rem", color: "hsl(var(--text-muted))" }}>{rank2.clusterName}</div>
            <div style={{ marginTop: "1rem", fontSize: "1.5rem", fontWeight: 800, color: "hsl(var(--color-primary))" }}>
              {rank2.totalPoints} <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>pts</span>
            </div>
            <div style={{ fontSize: "0.75rem", color: "hsl(var(--text-muted))", marginTop: "0.25rem" }}>
              {rank2.onTimeRate}% on-time · {rank2.completedTasks} tasks
            </div>
          </div>

          {/* Rank 1 (Gold) */}
          <div className="podium-card podium-rank-1" style={{ order: 2 }}>
            <div className="podium-medal medal-gold">1</div>
            <div className="avatar avatar-lg" style={{ margin: "0 auto 0.75rem auto", boxShadow: "0 0 16px hsl(45 93% 47% / 0.3)" }}>
              {getInitials(rank1.name)}
            </div>
            <div style={{ fontWeight: 800, fontSize: "1.1875rem" }}>{rank1.name}</div>
            <div style={{ fontSize: "0.8125rem", color: "hsl(var(--text-muted))" }}>{rank1.clusterName}</div>
            <div style={{ marginTop: "1rem", fontSize: "1.75rem", fontWeight: 900, color: "#eab308" }}>
              {rank1.totalPoints} <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>pts</span>
            </div>
            <div style={{ fontSize: "0.75rem", color: "hsl(var(--text-muted))", marginTop: "0.25rem" }}>
              {rank1.onTimeRate}% on-time · {rank1.completedTasks} tasks
            </div>
          </div>

          {/* Rank 3 (Bronze) */}
          <div className="podium-card podium-rank-3" style={{ order: 3 }}>
            <div className="podium-medal medal-bronze">3</div>
            <div className="avatar avatar-md" style={{ margin: "0 auto 0.75rem auto" }}>
              {getInitials(rank3.name)}
            </div>
            <div style={{ fontWeight: 700, fontSize: "1.0625rem" }}>{rank3.name}</div>
            <div style={{ fontSize: "0.8125rem", color: "hsl(var(--text-muted))" }}>{rank3.clusterName}</div>
            <div style={{ marginTop: "1rem", fontSize: "1.5rem", fontWeight: 800, color: "#ea580c" }}>
              {rank3.totalPoints} <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>pts</span>
            </div>
            <div style={{ fontSize: "0.75rem", color: "hsl(var(--text-muted))", marginTop: "0.25rem" }}>
              {rank3.onTimeRate}% on-time · {rank3.completedTasks} tasks
            </div>
          </div>
        </div>
      )}

      {/* Full Leaderboard Table */}
      <div className="card" style={{ padding: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
          <div>
            <h2 style={{ fontSize: "1.125rem", fontWeight: 700 }}>Faculty Rankings</h2>
            <p style={{ fontSize: "0.8125rem", color: "hsl(var(--text-muted))" }}>
              Total point balances accumulated from tasks, bonuses, and evaluations.
            </p>
          </div>
          <span style={{ fontSize: "0.875rem", color: "hsl(var(--text-muted))" }}>
            {leaderboard.length} Faculty Members
          </span>
        </div>

        {leaderboard.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem 1rem", color: "hsl(var(--text-muted))" }}>
            No ranking data available yet.
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
                  <th>Avg Eval</th>
                  <th>Badges</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry) => {
                  const isCurrentUser = entry.userId === currentUserId;
                  return (
                    <tr
                      key={entry.userId}
                      style={{
                        backgroundColor: isCurrentUser
                          ? "hsl(var(--color-primary) / 0.08)"
                          : undefined,
                      }}
                    >
                      <td>
                        <span
                          style={{
                            fontWeight: 800,
                            fontSize: "0.9375rem",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "28px",
                            height: "28px",
                            borderRadius: "50%",
                            background:
                              entry.rank === 1
                                ? "#fef08a"
                                : entry.rank === 2
                                ? "#e2e8f0"
                                : entry.rank === 3
                                ? "#fed7aa"
                                : "hsl(var(--bg-muted))",
                            color:
                              entry.rank === 1
                                ? "#854d0e"
                                : entry.rank === 2
                                ? "#334155"
                                : entry.rank === 3
                                ? "#9a3412"
                                : "hsl(var(--text-primary))",
                          }}
                        >
                          {entry.rank}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                          <div className="avatar avatar-sm">{getInitials(entry.name)}</div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>
                              {entry.name}
                              {isCurrentUser && (
                                <span
                                  className="status-badge"
                                  style={{
                                    marginLeft: "0.5rem",
                                    fontSize: "10px",
                                    background: "hsl(var(--color-primary))",
                                    color: "white",
                                    padding: "1px 6px",
                                  }}
                                >
                                  You
                                </span>
                              )}
                            </div>
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
                        <span style={{ fontWeight: 800, fontSize: "0.9375rem", color: "hsl(var(--color-primary))" }}>
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
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}