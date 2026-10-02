import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/ui/PageHeader";
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
    <div style={{ padding: "28px 32px", display: "flex", flexDirection: "column", gap: 24 }}>
      {/* 1. Page Header with BMSIT Dot Matrix */}
      <PageHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/hod" },
          { label: "Faculty of the Month" },
        ]}
        eyebrow="HOD // MERIT RECOGNITION"
        dotMatrixText="HONOREE"
        dotMatrixFontSize={34}
        title="Faculty of the Month Recognition"
        ghost="spotlight."
        subtitle="Algorithmic designation driven by PointsLedger aggregates, task velocity & peer ratings."
        actions={
          <RunFacultyOfMonthButton
            month={pendingCurrentMonth ? currentMonth : prevMonth}
            year={pendingCurrentMonth ? currentYear : prevYear}
            label={
              pendingCurrentMonth
                ? `RUN SELECTION — ${MONTHS[currentMonth - 1].toUpperCase()} ${currentYear}`
                : `RE-RUN — ${MONTHS[prevMonth - 1].toUpperCase()} ${prevYear}`
            }
          />
        }
      />

      {/* Current Month Spotlight */}
      {currentAward ? (
        <div
          className="card"
          style={{
            padding: "36px 32px",
            background: "#FAFAFA",
            border: "2px solid #1D1D1F",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
            boxShadow: "0 8px 30px rgba(0, 0, 0, 0.06)",
          }}
        >
          <span className="badge badge-dark" style={{ marginBottom: 16 }}>
            ★ {MONTHS[currentMonth - 1].toUpperCase()} {currentYear} HONOREE ★
          </span>
          
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              margin: "0 auto 16px",
              background: "#1D1D1F",
              color: "#FFFFFF",
              fontFamily: "var(--font-mono)",
              fontSize: 28,
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
            }}
          >
            {getInitials(currentAward.faculty.name)}
          </div>

          <h2 style={{ fontSize: 26, fontWeight: 800, color: "#1D1D1F", margin: "0 0 6px 0" }}>
            {currentAward.faculty.name}
          </h2>
          <div style={{ fontSize: 13.5, color: "#6E6E73", marginBottom: 24, fontFamily: "var(--font-mono)" }}>
            {currentAward.faculty.designation ?? currentAward.faculty.email}
          </div>

          {/* Snapshot Stats */}
          {currentAward.snapshotStats && (
            <div
              style={{
                display: "inline-flex",
                gap: 28,
                background: "#FFFFFF",
                padding: "16px 32px",
                borderRadius: 14,
                border: "1px solid #E8E8ED",
                flexWrap: "wrap",
                justifyContent: "center",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.02)",
              }}
            >
              {(() => {
                const stats = currentAward.snapshotStats as Record<string, number | string>;
                return (
                  <>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 22, fontWeight: 800, color: "#1D1D1F", fontFamily: "var(--font-mono)" }}>
                        {stats.pointsEarned ?? "—"}
                      </div>
                      <div style={{ fontSize: 10, color: "#86868B", fontFamily: "var(--font-mono)", marginTop: 2, letterSpacing: "0.08em" }}>POINTS EARNED</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 22, fontWeight: 800, color: "#1D1D1F", fontFamily: "var(--font-mono)" }}>
                        {stats.completedTasks ?? "—"}
                      </div>
                      <div style={{ fontSize: 10, color: "#86868B", fontFamily: "var(--font-mono)", marginTop: 2, letterSpacing: "0.08em" }}>TASKS COMPLETED</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 22, fontWeight: 800, color: "#16A34A", fontFamily: "var(--font-mono)" }}>
                        {stats.onTimeRate ?? "—"}%
                      </div>
                      <div style={{ fontSize: 10, color: "#86868B", fontFamily: "var(--font-mono)", marginTop: 2, letterSpacing: "0.08em" }}>ON-TIME VELOCITY</div>
                    </div>
                    {typeof stats.avgEvaluation === "number" && stats.avgEvaluation > 0 && (
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 22, fontWeight: 800, color: "#1D1D1F", fontFamily: "var(--font-mono)" }}>
                          {stats.avgEvaluation} / 5
                        </div>
                        <div style={{ fontSize: 10, color: "#86868B", fontFamily: "var(--font-mono)", marginTop: 2, letterSpacing: "0.08em" }}>AVG RATING</div>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          )}
        </div>
      ) : (
        <div className="card" style={{ padding: 48, textAlign: "center" }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🏅</div>
          <h2 className="card-title" style={{ marginBottom: 8 }}>
            {MONTHS[currentMonth - 1]} {currentYear} — Selection Standby
          </h2>
          <p className="card-muted" style={{ maxWidth: 480, margin: "0 auto" }}>
            Click &quot;RUN SELECTION&quot; above to compute this month&apos;s Faculty of the Month based on verified PointsLedger records.
          </p>
        </div>
      )}

      {/* History Timeline */}
      {history.length > 0 && (
        <div className="card">
          <div style={{ marginBottom: 18 }}>
            <span className="section-eyebrow">// ARCHIVAL RECORD</span>
            <h2 className="card-title" style={{ marginTop: 2 }}>
              Hall of Recognition & Past Honorees
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
            {history.map((award) => {
              const stats = award.snapshotStats as Record<string, number | string>;
              const isCurrentMonth = award.month === currentMonth && award.year === currentYear;
              return (
                <div
                  key={award.id}
                  style={{
                    padding: "20px 16px",
                    borderRadius: 12,
                    border: `1.5px solid ${isCurrentMonth ? "#1D1D1F" : "#E8E8ED"}`,
                    background: isCurrentMonth ? "#FAFAFA" : "#FFFFFF",
                    textAlign: "center",
                    position: "relative",
                  }}
                  className="cyber-card-hover"
                >
                  {isCurrentMonth && (
                    <span
                      style={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        fontSize: 9,
                        fontFamily: "var(--font-mono)",
                        fontWeight: 700,
                        padding: "2px 6px",
                        borderRadius: 4,
                        background: "#1D1D1F",
                        color: "#FFFFFF",
                      }}
                    >
                      CURRENT
                    </span>
                  )}
                  <div style={{ fontSize: 24, marginBottom: 8 }}>
                    {isCurrentMonth ? "🌟" : "⭐"}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 14.5, color: "#1D1D1F" }}>{award.faculty.name}</div>
                  <div style={{ fontSize: 11.5, color: "#6E6E73", fontFamily: "var(--font-mono)", marginTop: 2 }}>
                    {MONTHS[award.month - 1]} {award.year}
                  </div>
                  {typeof stats?.pointsEarned === "number" && (
                    <div style={{ marginTop: 8, fontSize: 13.5, fontWeight: 700, color: "#1D1D1F", fontFamily: "var(--font-mono)" }}>
                      ★ {stats.pointsEarned} pts
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