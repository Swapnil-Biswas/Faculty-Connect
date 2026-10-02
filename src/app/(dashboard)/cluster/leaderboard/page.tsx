import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getLiveLeaderboard } from "@/services/recognition";
import { Trophy, Star, Award } from "lucide-react";
import { getInitials } from "@/lib/utils";
import { PageHeader } from "@/components/ui/PageHeader";

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
    <div className="page-content" style={{ maxWidth: 1400, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>
      <PageHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/cluster" },
          { label: "Leaderboard" },
        ]}
        dotMatrixText="LEADERBOARD"
        eyebrow="MERIT APPRAISAL · CLUSTER VELOCITY"
        title="Cluster Merit Leaderboard"
        subtitle="Internal cluster rankings based on verified task delivery, timeliness, publications, and evaluations."
      />

      {/* Top 3 Podium Cards */}
      {leaderboard.length >= 3 && (
        <div className="grid grid-3" style={{ gap: 20 }}>
          {leaderboard.slice(0, 3).map((entry, idx) => {
            const medals = ["🥇 1ST PLACE", "🥈 2ND PLACE", "🥉 3RD PLACE"];
            return (
              <div
                key={entry.userId}
                className="card card-hover"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  gap: 12,
                  padding: "28px 20px",
                  border: idx === 0 ? "1.5px solid var(--grey-800)" : "1px solid var(--grey-200)",
                }}
              >
                <span className="badge" style={{ fontWeight: 700 }}>
                  {medals[idx]}
                </span>
                <div
                  className="avatar avatar-lg"
                  style={{
                    backgroundColor: idx === 0 ? "var(--grey-900)" : "var(--grey-100)",
                    color: idx === 0 ? "var(--white)" : "var(--grey-800)",
                    fontSize: 20,
                    fontWeight: 700,
                  }}
                >
                  {getInitials(entry.name)}
                </div>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--grey-900)", margin: 0 }}>
                    {entry.name}
                  </h3>
                  <p style={{ fontSize: 12, color: "var(--grey-500)", margin: "4px 0 0" }}>
                    {entry.designation ?? entry.email}
                  </p>
                </div>
                <div style={{ marginTop: 8 }}>
                  <span style={{ fontSize: 28, fontWeight: 800, fontFamily: "var(--font-mono)", color: "var(--grey-900)" }}>
                    {entry.totalPoints}
                  </span>
                  <span style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--grey-500)", marginLeft: 4 }}>
                    PTS
                  </span>
                </div>
                <div style={{ display: "flex", gap: 12, fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--grey-500)" }}>
                  <span>{entry.completedTasks} Tasks</span>
                  <span>·</span>
                  <span>{Math.round(entry.onTimeRate * 100)}% On-Time</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full Leaderboard Table */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "18px 24px", borderBottom: "1px solid var(--grey-100)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <span className="section-eyebrow" style={{ marginBottom: 2 }}>// CLUSTER RANKINGS</span>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: "2px 0 0", color: "var(--grey-900)" }}>
              Faculty Standing & Recognition
            </h2>
          </div>
          <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--grey-500)" }}>
            {leaderboard.length} FACULTY RANKED
          </span>
        </div>

        {leaderboard.length === 0 ? (
          <div className="empty" style={{ margin: 24 }}>
            <div className="empty-title">No ranking data available</div>
            <div className="empty-body">
              Merit points will appear here once tasks are completed and research is approved.
            </div>
          </div>
        ) : (
          <div className="table-wrap" style={{ border: "none", borderRadius: 0 }}>
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: "60px" }}>RANK</th>
                  <th>FACULTY MEMBER</th>
                  <th>TOTAL POINTS</th>
                  <th>TASKS COMPLETED</th>
                  <th>ON-TIME RATE</th>
                  <th>AVERAGE RATING</th>
                  <th>BADGES</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry, idx) => (
                  <tr key={entry.userId} className="cyber-row-hover">
                    <td>
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: 12,
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 26,
                          height: 26,
                          borderRadius: "50%",
                          background: idx < 3 ? "var(--grey-800)" : "var(--grey-100)",
                          color: idx < 3 ? "var(--white)" : "var(--grey-700)",
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        {idx + 1}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div
                          className="avatar"
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 6,
                            background: "var(--grey-100)",
                            color: "var(--grey-800)",
                            fontFamily: "var(--font-mono)",
                            fontSize: 11,
                            fontWeight: 700,
                          }}
                        >
                          {getInitials(entry.name)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13, color: "var(--grey-900)" }}>
                            {entry.name}
                          </div>
                          <div style={{ fontSize: 11, color: "var(--grey-500)", fontFamily: "var(--font-mono)" }}>
                            {entry.designation ?? entry.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, fontSize: 14, fontFamily: "var(--font-mono)", color: "var(--grey-900)" }}>
                        {entry.totalPoints} pts
                      </span>
                    </td>
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: 13 }}>
                      {entry.completedTasks}
                    </td>
                    <td>
                      <span className="badge">
                        {Math.round(entry.onTimeRate * 100)}%
                      </span>
                    </td>
                    <td>
                      <span className="badge" style={{ color: "#d97706" }}>
                        ★ {entry.avgEvaluation.toFixed(1)}
                      </span>
                    </td>
                    <td>
                      <span className="badge">
                        🏅 {entry.badgesCount}
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