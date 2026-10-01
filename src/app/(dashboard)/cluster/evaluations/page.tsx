import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { CreateEvaluationModal } from "./CreateEvaluationModal";
import { Star, UserCheck, Calendar, MessageSquare, Award } from "lucide-react";
import { formatDate, getInitials } from "@/lib/utils";

export default async function ClusterEvaluationsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { role, id: userId, clusterId } = session.user;
  if (!["CLUSTER_HEAD", "HOD", "ADMIN"].includes(role)) {
    redirect("/faculty");
  }

  // Find cluster
  const effectiveClusterId = clusterId;
  const cluster = effectiveClusterId
    ? await db.cluster.findUnique({
        where: { id: effectiveClusterId },
        include: {
          members: {
            where: { leftAt: null },
            include: { user: true },
          },
        },
      })
    : null;

  // Filter out the evaluator themselves from faculty dropdown
  const facultyMembers =
    cluster?.members
      .filter((m) => m.userId !== userId && m.user.deletedAt === null)
      .map((m) => ({
        id: m.user.id,
        name: m.user.name,
        designation: m.user.designation,
      })) ?? [];

  // Fetch past evaluations for this cluster or evaluator
  const evaluations = await db.evaluation.findMany({
    where: {
      OR: [
        { evaluatorId: userId },
        ...(cluster?.members.map((m) => ({ facultyId: m.userId })) ?? []),
      ],
    },
    include: {
      faculty: true,
      evaluator: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="page-content" style={{ maxWidth: 1400, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>
      {/* BMSIT High-Tech Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "3px 10px", borderRadius: 4, background: "rgba(245, 158, 11, 0.1)", border: "1px solid rgba(245, 158, 11, 0.25)", color: "#F59E0B", fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 10 }}>
            <span>●</span> PERFORMANCE EVALUATION // ACADEMIC APPRAISALS
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "#F8FAFC", margin: "0 0 6px 0", letterSpacing: "-0.02em" }}>
            Faculty Evaluations & Appraisals
          </h1>
          <p style={{ fontSize: 13, color: "#94A3B8", margin: 0, fontFamily: "var(--font-mono)" }}>
            // Evaluate faculty across quality, contribution & initiative — awards verified Recognition Stars
          </p>
        </div>

        {facultyMembers.length > 0 && (
          <CreateEvaluationModal facultyMembers={facultyMembers} />
        )}
      </div>

      {/* Cluster Overview Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
        <div style={{ background: "#0E121B", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: 10, padding: "18px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 11, color: "#94A3B8", fontFamily: "var(--font-mono)" }}>EVALUATIONS SUBMITTED</span>
            <Award size={16} style={{ color: "#38BDF8" }} />
          </div>
          <div style={{ fontSize: 32, fontWeight: 900, color: "#F8FAFC", fontFamily: "var(--font-mono)" }}>{evaluations.length}</div>
        </div>

        <div style={{ background: "#0E121B", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: 10, padding: "18px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 11, color: "#94A3B8", fontFamily: "var(--font-mono)" }}>AVG CLUSTER RATING</span>
            <Star size={16} style={{ color: "#F59E0B" }} />
          </div>
          <div style={{ fontSize: 32, fontWeight: 900, color: "#F59E0B", fontFamily: "var(--font-mono)" }}>
            {evaluations.length > 0
              ? (
                  evaluations.reduce((sum, e) => sum + e.overallRating, 0) /
                  evaluations.length
                ).toFixed(1)
              : "0.0"} <span style={{ fontSize: 14, color: "#64748B", fontWeight: 500 }}>/ 5.0</span>
          </div>
        </div>

        <div style={{ background: "#0E121B", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: 10, padding: "18px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 11, color: "#94A3B8", fontFamily: "var(--font-mono)" }}>ELIGIBLE FACULTY</span>
            <UserCheck size={16} style={{ color: "#22C55E" }} />
          </div>
          <div style={{ fontSize: 32, fontWeight: 900, color: "#22C55E", fontFamily: "var(--font-mono)" }}>{facultyMembers.length}</div>
        </div>
      </div>

      {/* Evaluations History Table */}
      <div
        style={{
          background: "#0E121B",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: 12,
          overflow: "hidden",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
        }}
      >
        <div style={{ padding: "18px 24px", borderBottom: "1px solid rgba(255, 255, 255, 0.08)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", fontFamily: "var(--font-mono)" }}>
              // EVALUATION LOG
            </span>
            <h2 style={{ fontSize: 16, fontWeight: 800, margin: "2px 0 0", color: "#F8FAFC" }}>
              Appraisal History & Audit Ledger
            </h2>
          </div>
          <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "#64748B" }}>
            {evaluations.length} RECORDS LOGGED
          </span>
        </div>

        {evaluations.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 20px", color: "#64748B", fontFamily: "var(--font-mono)" }}>
            // No evaluations registered yet. Click &quot;Evaluate Faculty&quot; to review a cluster member.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ background: "rgba(255, 255, 255, 0.02)", borderBottom: "1px solid rgba(255, 255, 255, 0.06)" }}>
                  <th style={{ padding: "12px 20px", fontSize: 11, fontFamily: "var(--font-mono)", color: "#94A3B8", fontWeight: 700 }}>FACULTY</th>
                  <th style={{ padding: "12px 20px", fontSize: 11, fontFamily: "var(--font-mono)", color: "#94A3B8", fontWeight: 700 }}>PERIOD</th>
                  <th style={{ padding: "12px 20px", fontSize: 11, fontFamily: "var(--font-mono)", color: "#94A3B8", fontWeight: 700 }}>QUALITY</th>
                  <th style={{ padding: "12px 20px", fontSize: 11, fontFamily: "var(--font-mono)", color: "#94A3B8", fontWeight: 700 }}>CONTRIB</th>
                  <th style={{ padding: "12px 20px", fontSize: 11, fontFamily: "var(--font-mono)", color: "#94A3B8", fontWeight: 700 }}>INITIATIVE</th>
                  <th style={{ padding: "12px 20px", fontSize: 11, fontFamily: "var(--font-mono)", color: "#94A3B8", fontWeight: 700 }}>OVERALL</th>
                  <th style={{ padding: "12px 20px", fontSize: 11, fontFamily: "var(--font-mono)", color: "#94A3B8", fontWeight: 700 }}>REMARKS</th>
                  <th style={{ padding: "12px 20px", fontSize: 11, fontFamily: "var(--font-mono)", color: "#94A3B8", fontWeight: 700 }}>TIMESTAMP</th>
                </tr>
              </thead>
              <tbody>
                {evaluations.map((evalItem) => (
                  <tr
                    key={evalItem.id}
                    style={{
                      borderBottom: "1px solid rgba(255, 255, 255, 0.04)",
                      transition: "background 0.15s ease",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <td style={{ padding: "14px 20px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 6,
                            background: "rgba(245, 158, 11, 0.12)",
                            border: "1px solid rgba(245, 158, 11, 0.25)",
                            color: "#F59E0B",
                            fontFamily: "var(--font-mono)",
                            fontSize: 12,
                            fontWeight: 700,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {getInitials(evalItem.faculty.name)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13, color: "#F8FAFC" }}>{evalItem.faculty.name}</div>
                          <div style={{ fontSize: 11, color: "#64748B", fontFamily: "var(--font-mono)" }}>
                            {evalItem.faculty.designation ?? evalItem.faculty.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      <span
                        style={{
                          fontSize: 11,
                          fontFamily: "var(--font-mono)",
                          padding: "3px 8px",
                          borderRadius: 4,
                          background: "rgba(56, 189, 248, 0.1)",
                          color: "#38BDF8",
                          border: "1px solid rgba(56, 189, 248, 0.25)",
                        }}
                      >
                        {evalItem.period}
                      </span>
                    </td>
                    <td style={{ padding: "14px 20px", fontFamily: "var(--font-mono)", fontSize: 13, color: "#CBD5E1" }}>
                      {evalItem.quality} / 5
                    </td>
                    <td style={{ padding: "14px 20px", fontFamily: "var(--font-mono)", fontSize: 13, color: "#CBD5E1" }}>
                      {evalItem.contribution} / 5
                    </td>
                    <td style={{ padding: "14px 20px", fontFamily: "var(--font-mono)", fontSize: 13, color: "#CBD5E1" }}>
                      {evalItem.initiative} / 5
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      <span
                        style={{
                          fontSize: 11,
                          fontFamily: "var(--font-mono)",
                          fontWeight: 700,
                          padding: "3px 8px",
                          borderRadius: 4,
                          background: evalItem.overallRating >= 4 ? "rgba(34, 197, 94, 0.12)" : "rgba(245, 158, 11, 0.12)",
                          color: evalItem.overallRating >= 4 ? "#22C55E" : "#F59E0B",
                          border: `1px solid ${evalItem.overallRating >= 4 ? "rgba(34, 197, 94, 0.25)" : "rgba(245, 158, 11, 0.25)"}`,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        ★ {evalItem.overallRating} / 5
                      </span>
                    </td>
                    <td style={{ padding: "14px 20px", maxWidth: 260 }}>
                      <span style={{ fontSize: 12, color: evalItem.remarks ? "#94A3B8" : "#64748B" }}>
                        {evalItem.remarks ?? "—"}
                      </span>
                    </td>
                    <td style={{ padding: "14px 20px", whiteSpace: "nowrap", fontSize: 12, color: "#64748B", fontFamily: "var(--font-mono)" }}>
                      {formatDate(evalItem.createdAt)}
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