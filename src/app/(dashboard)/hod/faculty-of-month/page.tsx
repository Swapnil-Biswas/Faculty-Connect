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
    <div className="page-content" style={{ maxWidth: 1400, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>
      {/* BMSIT High-Tech Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "3px 10px", borderRadius: 4, background: "rgba(245, 158, 11, 0.1)", border: "1px solid rgba(245, 158, 11, 0.25)", color: "#F59E0B", fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 10 }}>
            <span>●</span> DEPARTMENT SPOTLIGHT // FACULTY OF THE MONTH
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "#F8FAFC", margin: "0 0 6px 0", letterSpacing: "-0.02em" }}>
            Faculty of the Month Recognition
          </h1>
          <p style={{ fontSize: 13, color: "#94A3B8", margin: 0, fontFamily: "var(--font-mono)" }}>
            // Algorithmic designation driven by PointsLedger aggregates, task velocity & peer ratings
          </p>
        </div>

        <RunFacultyOfMonthButton
          month={pendingCurrentMonth ? currentMonth : prevMonth}
          year={pendingCurrentMonth ? currentYear : prevYear}
          label={
            pendingCurrentMonth
              ? `RUN SELECTION — ${MONTHS[currentMonth - 1].toUpperCase()} ${currentYear}`
              : `RE-RUN — ${MONTHS[prevMonth - 1].toUpperCase()} ${prevYear}`
          }
        />
      </div>

      {/* Current Month Spotlight */}
      {currentAward ? (
        <div
          style={{
            padding: "36px 32px",
            background: "linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(14, 18, 27, 0.95) 50%, rgba(56, 189, 248, 0.08) 100%)",
            border: "1px solid rgba(245, 158, 11, 0.35)",
            borderRadius: 16,
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
            boxShadow: "0 10px 40px rgba(0, 0, 0, 0.5)",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "-50px",
              right: "-50px",
              width: "200px",
              height: "200px",
              background: "radial-gradient(circle, rgba(245, 158, 11, 0.15) 0%, transparent 70%)",
              borderRadius: "50%",
            }}
          />
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "4px 14px", borderRadius: 20, background: "rgba(245, 158, 11, 0.15)", border: "1px solid rgba(245, 158, 11, 0.3)", color: "#F59E0B", fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", marginBottom: 14 }}>
            ★ {MONTHS[currentMonth - 1].toUpperCase()} {currentYear} HONOREE ★
          </div>
          
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              margin: "0 auto 14px",
              background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
              color: "#0A0D14",
              fontFamily: "var(--font-mono)",
              fontSize: 28,
              fontWeight: 900,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 30px rgba(245, 158, 11, 0.4)",
            }}
          >
            {getInitials(currentAward.faculty.name)}
          </div>

          <h2 style={{ fontSize: 24, fontWeight: 900, color: "#F8FAFC", margin: "0 0 4px 0" }}>
            {currentAward.faculty.name}
          </h2>
          <div style={{ fontSize: 13, color: "#94A3B8", marginBottom: 20, fontFamily: "var(--font-mono)" }}>
            {currentAward.faculty.designation ?? currentAward.faculty.email}
          </div>

          {/* Snapshot Stats */}
          {currentAward.snapshotStats && (
            <div style={{
              display: "inline-flex",
              gap: 24,
              background: "rgba(7, 9, 14, 0.8)",
              backdropFilter: "blur(12px)",
              padding: "16px 28px",
              borderRadius: 10,
              border: "1px solid rgba(255, 255, 255, 0.08)",
              flexWrap: "wrap",
              justifyContent: "center",
            }}>
              {(() => {
                const stats = currentAward.snapshotStats as Record<string, number | string>;
                return (
                  <>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 20, fontWeight: 900, color: "#F59E0B", fontFamily: "var(--font-mono)" }}>
                        {stats.pointsEarned ?? "—"}
                      </div>
                      <div style={{ fontSize: 11, color: "#64748B", fontFamily: "var(--font-mono)", marginTop: 2 }}>POINTS EARNED</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 20, fontWeight: 900, color: "#38BDF8", fontFamily: "var(--font-mono)" }}>
                        {stats.completedTasks ?? "—"}
                      </div>
                      <div style={{ fontSize: 11, color: "#64748B", fontFamily: "var(--font-mono)", marginTop: 2 }}>TASKS COMPLETED</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 20, fontWeight: 900, color: "#22C55E", fontFamily: "var(--font-mono)" }}>
                        {stats.onTimeRate ?? "—"}%
                      </div>
                      <div style={{ fontSize: 11, color: "#64748B", fontFamily: "var(--font-mono)", marginTop: 2 }}>ON-TIME VELOCITY</div>
                    </div>
                    {typeof stats.avgEvaluation === "number" && stats.avgEvaluation > 0 && (
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 20, fontWeight: 900, color: "#A855F7", fontFamily: "var(--font-mono)" }}>
                          {stats.avgEvaluation} / 5
                        </div>
                        <div style={{ fontSize: 11, color: "#64748B", fontFamily: "var(--font-mono)", marginTop: 2 }}>AVG RATING</div>
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
          style={{
            padding: "48px 24px",
            textAlign: "center",
            background: "#0E121B",
            border: "1px dashed rgba(255, 255, 255, 0.1)",
            borderRadius: 12,
          }}
        >
          <div style={{ fontSize: 36, marginBottom: 12 }}>🏅</div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: "#F8FAFC", margin: "0 0 8px 0" }}>
            {MONTHS[currentMonth - 1]} {currentYear} — Selection Standby
          </h2>
          <p style={{ color: "#94A3B8", maxWidth: 480, margin: "0 auto 16px", fontSize: 13 }}>
            Click &quot;RUN SELECTION&quot; above to compute this month&apos;s Faculty of the Month based on verified PointsLedger records.
          </p>
        </div>
      )}

      {/* History Timeline */}
      {history.length > 0 && (
        <div
          style={{
            background: "#0E121B",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: 12,
            padding: 24,
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
          }}
        >
          <div style={{ marginBottom: 18, borderBottom: "1px solid rgba(255, 255, 255, 0.06)", paddingBottom: 14 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: "#F59E0B", fontFamily: "var(--font-mono)" }}>
              // ARCHIVAL RECORD
            </span>
            <h2 style={{ fontSize: 16, fontWeight: 800, margin: "2px 0 0", color: "#F8FAFC" }}>
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
                    borderRadius: 10,
                    border: `1px solid ${isCurrentMonth ? "rgba(245, 158, 11, 0.4)" : "rgba(255, 255, 255, 0.06)"}`,
                    background: isCurrentMonth
                      ? "linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, #07090E 100%)"
                      : "#07090E",
                    textAlign: "center",
                    position: "relative",
                  }}
                >
                  {isCurrentMonth && (
                    <span
                      style={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        fontSize: 9,
                        fontFamily: "var(--font-mono)",
                        fontWeight: 800,
                        padding: "2px 6px",
                        borderRadius: 4,
                        background: "rgba(245, 158, 11, 0.15)",
                        color: "#F59E0B",
                        border: "1px solid rgba(245, 158, 11, 0.3)",
                      }}
                    >
                      CURRENT
                    </span>
                  )}
                  <div style={{ fontSize: 24, marginBottom: 6 }}>
                    {isCurrentMonth ? "🌟" : "⭐"}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#F8FAFC" }}>{award.faculty.name}</div>
                  <div style={{ fontSize: 11, color: "#64748B", fontFamily: "var(--font-mono)", marginTop: 2 }}>
                    {MONTHS[award.month - 1]} {award.year}
                  </div>
                  {typeof stats.pointsEarned === "number" && (
                    <div style={{ marginTop: 8, fontSize: 14, fontWeight: 800, color: "#F59E0B", fontFamily: "var(--font-mono)" }}>
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