import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { computeFacultyOfMonth } from "@/services/recognition";
import { Star, Trophy, Calendar, Award } from "lucide-react";
import { getInitials } from "@/lib/utils";
import { RunFacultyOfMonthButton } from "./RunFacultyOfMonthButton";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default async function FacultyOfMonthPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { role } = session.user;
  if (!["HOD", "ADMIN"].includes(role)) redirect("/faculty");

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;

  // Fetch current month award (if run)
  const currentAward = await db.facultyOfMonth.findUnique({
    where: { month_year: { month: currentMonth, year: currentYear } },
    include: { faculty: true },
  });

  // Fetch last 12 months of award history
  const history = await db.facultyOfMonth.findMany({
    include: { faculty: true },
    orderBy: [{ year: "desc" }, { month: "desc" }],
    take: 12,
  });

  const pendingCurrentMonth = !currentAward;

  return (
    <div className="dashboard-container" style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 className="page-title" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Star className="text-warning" fill="currentColor" size={28} />
            Faculty of the Month
          </h1>
          <p className="page-subtitle">
            Monthly recognition spotlighting the highest-performing faculty member. Selected automatically from PointsLedger aggregates.
          </p>
        </div>

        <RunFacultyOfMonthButton
          month={pendingCurrentMonth ? currentMonth : prevMonth}
          year={pendingCurrentMonth ? currentYear : prevYear}
          label={
            pendingCurrentMonth
              ? `Select Faculty of Month — ${MONTHS[currentMonth - 1]} ${currentYear}`
              : `Re-run ${MONTHS[prevMonth - 1]} ${prevYear}`
          }
        />
      </div>

      {/* Current Month Spotlight */}
      {currentAward ? (
        <div
          className="card"
          style={{
            padding: "2rem",
            background: "linear-gradient(135deg, hsl(45 93% 47% / 0.08), hsl(var(--color-primary) / 0.05))",
            border: "1px solid hsl(45 93% 47% / 0.35)",
            borderRadius: "var(--radius-xl)",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "-30px",
              right: "-30px",
              width: "160px",
              height: "160px",
              background: "hsl(45 93% 47% / 0.06)",
              borderRadius: "50%",
            }}
          />
          <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>🌟</div>
          <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "#eab308", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>
            {MONTHS[currentMonth - 1]} {currentYear} — Faculty of the Month
          </div>
          <div className="avatar avatar-xl" style={{ margin: "0.75rem auto", boxShadow: "0 0 32px hsl(45 93% 47% / 0.35)" }}>
            {getInitials(currentAward.faculty.name)}
          </div>
          <h2 style={{ fontSize: "1.75rem", fontWeight: 900, marginTop: "0.5rem" }}>
            {currentAward.faculty.name}
          </h2>
          <div style={{ fontSize: "0.9375rem", color: "hsl(var(--text-muted))", marginBottom: "1rem" }}>
            {currentAward.faculty.designation ?? currentAward.faculty.email}
          </div>

          {/* Snapshot Stats */}
          {currentAward.snapshotStats && (
            <div style={{
              display: "inline-flex",
              gap: "1.5rem",
              background: "hsl(var(--bg-surface) / 0.8)",
              backdropFilter: "blur(8px)",
              padding: "0.875rem 1.5rem",
              borderRadius: "var(--radius-lg)",
              border: "1px solid hsl(var(--border))",
              flexWrap: "wrap",
              justifyContent: "center",
            }}>
              {(() => {
                const stats = currentAward.snapshotStats as Record<string, number | string>;
                return (
                  <>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#eab308" }}>
                        {stats.pointsEarned ?? "—"}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "hsl(var(--text-muted))" }}>Points Earned</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "1.25rem", fontWeight: 800 }}>{stats.completedTasks ?? "—"}</div>
                      <div style={{ fontSize: "0.75rem", color: "hsl(var(--text-muted))" }}>Tasks Completed</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#16a34a" }}>
                        {stats.onTimeRate ?? "—"}%
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "hsl(var(--text-muted))" }}>On-Time Rate</div>
                    </div>
                    {typeof stats.avgEvaluation === "number" && stats.avgEvaluation > 0 && (
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: "1.25rem", fontWeight: 800 }}>{stats.avgEvaluation} / 5</div>
                        <div style={{ fontSize: "0.75rem", color: "hsl(var(--text-muted))" }}>Avg Evaluation</div>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          )}
        </div>
      ) : (
        <div
          className="card"
          style={{
            padding: "2.5rem",
            textAlign: "center",
            border: "2px dashed hsl(var(--border))",
            borderRadius: "var(--radius-xl)",
          }}
        >
          <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🏅</div>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>
            {MONTHS[currentMonth - 1]} {currentYear} — Not Yet Selected
          </h2>
          <p style={{ color: "hsl(var(--text-muted))", maxWidth: "480px", margin: "0 auto 1.25rem" }}>
            Click the button above to compute this month&apos;s Faculty of the Month based on current PointsLedger data.
          </p>
        </div>
      )}

      {/* History Timeline */}
      {history.length > 0 && (
        <div className="card" style={{ padding: "1.5rem" }}>
          <h2 style={{ fontSize: "1.125rem", fontWeight: 700, marginBottom: "1.25rem" }}>
            Award History
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: "1rem" }}>
            {history.map((award) => {
              const stats = award.snapshotStats as Record<string, number | string>;
              const isCurrentMonth = award.month === currentMonth && award.year === currentYear;
              return (
                <div
                  key={award.id}
                  style={{
                    padding: "1.25rem",
                    borderRadius: "var(--radius-lg)",
                    border: `1px solid ${isCurrentMonth ? "hsl(45 93% 47% / 0.4)" : "hsl(var(--border))"}`,
                    background: isCurrentMonth
                      ? "linear-gradient(135deg, hsl(45 93% 47% / 0.08), transparent)"
                      : "hsl(var(--bg-muted))",
                    textAlign: "center",
                    position: "relative",
                  }}
                >
                  {isCurrentMonth && (
                    <span
                      className="status-badge status-approved"
                      style={{ position: "absolute", top: "0.5rem", right: "0.5rem", fontSize: "10px" }}
                    >
                      Current
                    </span>
                  )}
                  <div style={{ fontSize: "1.5rem", marginBottom: "0.25rem" }}>
                    {isCurrentMonth ? "🌟" : "⭐"}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: "0.9375rem" }}>{award.faculty.name}</div>
                  <div style={{ fontSize: "0.8125rem", color: "hsl(var(--text-muted))", marginTop: "2px" }}>
                    {MONTHS[award.month - 1]} {award.year}
                  </div>
                  {typeof stats.pointsEarned === "number" && (
                    <div style={{ marginTop: "0.5rem", fontSize: "0.875rem", fontWeight: 700, color: "#eab308" }}>
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