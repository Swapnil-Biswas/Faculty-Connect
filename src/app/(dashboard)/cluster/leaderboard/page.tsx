import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getLiveLeaderboard } from "@/services/recognition";
import { Trophy, Star } from "lucide-react";
import { getInitials } from "@/lib/utils";

export default async function ClusterLeaderboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { role, clusterId } = session.user;
  if (!["CLUSTER_HEAD", "HOD", "ADMIN"].includes(role)) {
    redirect("/faculty");
  }

  const leaderboard = await getLiveLeaderboard(
    clusterId ? { clusterId } : undefined
  );

  return (
    <div className="dashboard-container" style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <div>
        <h1 className="page-title" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Trophy className="text-warning" size={28} />
          Cluster Leaderboard
        </h1>
        <p className="page-subtitle">
          Internal cluster rankings based on task delivery, timeliness, and evaluations.
        </p>
      </div>

      <div className="card" style={{ padding: "1.5rem" }}>
        {leaderboard.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem 1rem", color: "hsl(var(--text-muted))" }}>
            No ranking data available for your cluster yet.
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th style={{ width: "60px" }}>Rank</th>
                  <th>Faculty Member</th>
                  <th>Total Points</th>
                  <th>Tasks Completed</th>
                  <th>On-Time Rate</th>
                  <th>Average Rating</th>
                  <th>Badges</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry, idx) => (
                  <tr key={entry.userId}>
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
                            idx === 0
                              ? "#fef08a"
                              : idx === 1
                              ? "#e2e8f0"
                              : idx === 2
                              ? "#fed7aa"
                              : "hsl(var(--bg-muted))",
                          color:
                            idx === 0
                              ? "#854d0e"
                              : idx === 1
                              ? "#334155"
                              : idx === 2
                              ? "#9a3412"
                              : "inherit",
                        }}
                      >
                        {idx + 1}
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
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}