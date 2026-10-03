import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/ui/PageHeader";
import { Award, Clock, Star, CheckSquare, Calendar } from "lucide-react";
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
    <div
      style={{
        padding: "28px 32px",
        display: "flex",
        flexDirection: "column",
        gap: 24,
        backgroundColor: "#F7F8FA",
        minHeight: "100%",
      }}
    >
      {/* 1. Page Header */}
      <PageHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/hod" },
          { label: "Faculty of the Month" },
        ]}
        title="Faculty of the Month"
        subtitle="Departmental monthly faculty recognition record determined by verified PointsLedger aggregates, deliverable velocity, and evaluation ratings."
        showDotMatrix={false}
        actions={
          <RunFacultyOfMonthButton
            month={pendingCurrentMonth ? currentMonth : prevMonth}
            year={pendingCurrentMonth ? currentYear : prevYear}
            label={
              pendingCurrentMonth
                ? `Run Selection — ${MONTHS[currentMonth - 1]} ${currentYear}`
                : `Re-Run Selection — ${MONTHS[prevMonth - 1]} ${prevYear}`
            }
          />
        }
      />

      {/* 2. Current Month Recognition / Standby Panel */}
      {currentAward ? (
        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E4E7EC",
            borderRadius: 8,
            padding: "28px 32px",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "#FFFFFF",
                backgroundColor: "#173B67",
                borderRadius: 4,
                padding: "4px 10px",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              Department Honoree · {MONTHS[currentMonth - 1]} {currentYear}
            </span>
            <span style={{ fontSize: 12, color: "#667085" }}>
              Selected via Verified PointsLedger Engine
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 28 }}>
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: 8,
                backgroundColor: "#F2F4F7",
                border: "1px solid #E4E7EC",
                color: "#17202A",
                fontSize: 22,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {getInitials(currentAward.faculty.name)}
            </div>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: "#17202A", margin: "0 0 4px 0" }}>
                {currentAward.faculty.name}
              </h2>
              <div style={{ fontSize: 13, color: "#667085" }}>
                {currentAward.faculty.designation ?? currentAward.faculty.email}
              </div>
            </div>
          </div>

          {/* Performance Snapshot Metrics */}
          {currentAward.snapshotStats && (
            <div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#667085",
                  marginBottom: 12,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                Performance Snapshot Indicators
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: 16,
                }}
              >
                {(() => {
                  const stats = currentAward.snapshotStats as Record<string, number | string>;
                  return (
                    <>
                      <div
                        style={{
                          backgroundColor: "#F7F8FA",
                          border: "1px solid #E4E7EC",
                          borderRadius: 6,
                          padding: "16px 20px",
                          textAlign: "center",
                        }}
                      >
                        <div style={{ fontSize: 22, fontWeight: 700, color: "#17202A" }}>
                          {stats.pointsEarned ?? "—"}
                        </div>
                        <div style={{ fontSize: 11, color: "#667085", marginTop: 4, fontWeight: 500 }}>
                          POINTS EARNED
                        </div>
                      </div>

                      <div
                        style={{
                          backgroundColor: "#F7F8FA",
                          border: "1px solid #E4E7EC",
                          borderRadius: 6,
                          padding: "16px 20px",
                          textAlign: "center",
                        }}
                      >
                        <div style={{ fontSize: 22, fontWeight: 700, color: "#17202A" }}>
                          {stats.completedTasks ?? "—"}
                        </div>
                        <div style={{ fontSize: 11, color: "#667085", marginTop: 4, fontWeight: 500 }}>
                          TASKS COMPLETED
                        </div>
                      </div>

                      <div
                        style={{
                          backgroundColor: "#F7F8FA",
                          border: "1px solid #E4E7EC",
                          borderRadius: 6,
                          padding: "16px 20px",
                          textAlign: "center",
                        }}
                      >
                        <div style={{ fontSize: 22, fontWeight: 700, color: "#198754" }}>
                          {stats.onTimeRate ?? "—"}%
                        </div>
                        <div style={{ fontSize: 11, color: "#667085", marginTop: 4, fontWeight: 500 }}>
                          ON-TIME VELOCITY
                        </div>
                      </div>

                      <div
                        style={{
                          backgroundColor: "#F7F8FA",
                          border: "1px solid #E4E7EC",
                          borderRadius: 6,
                          padding: "16px 20px",
                          textAlign: "center",
                        }}
                      >
                        <div style={{ fontSize: 22, fontWeight: 700, color: "#17202A" }}>
                          {typeof stats.avgEvaluation === "number" && stats.avgEvaluation > 0
                            ? `${stats.avgEvaluation.toFixed(1)} / 5`
                            : "—"}
                        </div>
                        <div style={{ fontSize: 11, color: "#667085", marginTop: 4, fontWeight: 500 }}>
                          AVERAGE EVALUATION
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E4E7EC",
            borderRadius: 8,
            padding: "48px 24px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 8,
              backgroundColor: "#F2F4F7",
              border: "1px solid #E4E7EC",
              color: "#173B67",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 14,
            }}
          >
            <Clock size={20} />
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: "#17202A", margin: "0 0 6px 0" }}>
            {MONTHS[currentMonth - 1]} {currentYear} — Selection Standby
          </h2>
          <p style={{ fontSize: 13.5, color: "#667085", maxWidth: 480, margin: "0 0 18px 0", lineHeight: 1.5 }}>
            The monthly faculty recognition algorithm for this period has not been executed yet. Click &quot;Run Selection&quot; to evaluate PointsLedger records and determine this month&apos;s department honoree.
          </p>
          <RunFacultyOfMonthButton
            month={currentMonth}
            year={currentYear}
            label={`Execute Selection for ${MONTHS[currentMonth - 1]} ${currentYear}`}
          />
        </div>
      )}

      {/* 3. Archival Recognition Ledger */}
      {history.length > 0 && (
        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E4E7EC",
            borderRadius: 8,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "18px 24px",
              borderBottom: "1px solid #E4E7EC",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: "#FFFFFF",
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: "#17202A",
                  margin: 0,
                }}
              >
                Recognition Archival Ledger
              </h2>
              <p
                style={{
                  fontSize: 12.5,
                  color: "#667085",
                  margin: "4px 0 0 0",
                }}
              >
                Chronological record of past monthly department honorees and recorded performance snapshots
              </p>
            </div>
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "#173B67",
                backgroundColor: "#F0F4F8",
                border: "1px solid #D0D7DE",
                borderRadius: 4,
                padding: "4px 10px",
              }}
            >
              {history.length} Recorded Periods
            </span>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
              <thead>
                <tr style={{ backgroundColor: "#F7F8FA", borderBottom: "1px solid #E4E7EC" }}>
                  <th style={{ padding: "12px 16px", fontWeight: 600, color: "#667085" }}>Recognition Period</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600, color: "#667085" }}>Department Honoree</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600, color: "#667085", textAlign: "center" }}>Points Recorded</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600, color: "#667085", textAlign: "center" }}>Tasks Completed</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600, color: "#667085", textAlign: "center" }}>On-Time Velocity</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600, color: "#667085", textAlign: "center" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map((award, index) => {
                  const stats = award.snapshotStats as Record<string, number | string>;
                  const isCurrentMonth = award.month === currentMonth && award.year === currentYear;
                  const rowBorder = index !== history.length - 1 ? "1px solid #F2F4F7" : "none";

                  return (
                    <tr
                      key={award.id}
                      style={{
                        borderBottom: rowBorder,
                        transition: "background-color 0.15s ease",
                      }}
                    >
                      {/* Recognition Period */}
                      <td style={{ padding: "14px 16px", fontWeight: 600, color: "#17202A" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <Calendar size={14} color="#667085" />
                          <span>
                            {MONTHS[award.month - 1]} {award.year}
                          </span>
                        </div>
                      </td>

                      {/* Faculty Member */}
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 6,
                              backgroundColor: "#F2F4F7",
                              border: "1px solid #E4E7EC",
                              color: "#17202A",
                              fontSize: 12,
                              fontWeight: 600,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            {getInitials(award.faculty.name)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 13.5, color: "#17202A" }}>
                              {award.faculty.name}
                            </div>
                            <div style={{ fontSize: 12, color: "#667085", marginTop: 2 }}>
                              {award.faculty.designation ?? award.faculty.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Points Recorded */}
                      <td style={{ padding: "14px 16px", textAlign: "center" }}>
                        <span style={{ fontWeight: 700, color: "#17202A" }}>
                          {typeof stats?.pointsEarned === "number" ? stats.pointsEarned.toLocaleString() : "—"}
                        </span>
                        {typeof stats?.pointsEarned === "number" && (
                          <span style={{ fontSize: 12, color: "#667085", marginLeft: 4 }}>pts</span>
                        )}
                      </td>

                      {/* Tasks Completed */}
                      <td style={{ padding: "14px 16px", textAlign: "center", fontWeight: 500, color: "#17202A" }}>
                        {stats?.completedTasks ?? "—"}
                      </td>

                      {/* On-Time Velocity */}
                      <td style={{ padding: "14px 16px", textAlign: "center" }}>
                        <span
                          style={{
                            fontWeight: 600,
                            color: typeof stats?.onTimeRate === "number" && stats.onTimeRate >= 80 ? "#198754" : "#17202A",
                          }}
                        >
                          {typeof stats?.onTimeRate === "number" ? `${stats.onTimeRate}%` : "—"}
                        </span>
                      </td>

                      {/* Status */}
                      <td style={{ padding: "14px 16px", textAlign: "center" }}>
                        {isCurrentMonth ? (
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 600,
                              color: "#173B67",
                              backgroundColor: "#F0F4F8",
                              border: "1px solid #D0D7DE",
                              borderRadius: 4,
                              padding: "2px 8px",
                            }}
                          >
                            Current Period
                          </span>
                        ) : (
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 500,
                              color: "#667085",
                              backgroundColor: "#F7F8FA",
                              border: "1px solid #E4E7EC",
                              borderRadius: 4,
                              padding: "2px 8px",
                            }}
                          >
                            Archived
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}