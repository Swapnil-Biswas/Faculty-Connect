import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { CreateEvaluationModal } from "./CreateEvaluationModal";
import { Star, UserCheck, Award } from "lucide-react";
import { formatDate, getInitials } from "@/lib/utils";
import { PageHeader } from "@/components/ui/PageHeader";

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

  const avgRating =
    evaluations.length > 0
      ? (
          evaluations.reduce((sum, e) => sum + e.overallRating, 0) /
          evaluations.length
        ).toFixed(1)
      : "0.0";

  return (
    <div className="page-content" style={{ maxWidth: 1400, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>
      <PageHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/cluster" },
          { label: "Evaluations" },
        ]}
        dotMatrixText="EVALS"
        eyebrow="PERFORMANCE EVALUATION · ACADEMIC APPRAISALS"
        title="Faculty Evaluations & Appraisals"
        subtitle="Evaluate faculty across quality, contribution & initiative — awards verified Recognition Stars."
        actions={
          facultyMembers.length > 0 ? (
            <CreateEvaluationModal facultyMembers={facultyMembers} />
          ) : undefined
        }
      />

      {/* Cluster Overview Stats */}
      <div className="stat-grid">
        <div className="stat-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span className="stat-card-label">Evaluations Submitted</span>
            <Award size={16} color="var(--grey-600)" />
          </div>
          <div className="stat-card-num">{evaluations.length}</div>
        </div>

        <div className="stat-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span className="stat-card-label">Avg Cluster Rating</span>
            <Star size={16} color="#d97706" />
          </div>
          <div className="stat-card-num" style={{ color: "#d97706" }}>
            {avgRating} <span style={{ fontSize: 16, color: "var(--grey-400)", fontWeight: 500 }}>/ 5.0</span>
          </div>
        </div>

        <div className="stat-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span className="stat-card-label">Eligible Faculty</span>
            <UserCheck size={16} color="#16a34a" />
          </div>
          <div className="stat-card-num" style={{ color: "#16a34a" }}>
            {facultyMembers.length}
          </div>
        </div>
      </div>

      {/* Evaluations History Table */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "18px 24px", borderBottom: "1px solid var(--grey-100)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <span className="section-eyebrow" style={{ marginBottom: 2 }}>
              // EVALUATION LOG
            </span>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: "2px 0 0", color: "var(--grey-900)" }}>
              Appraisal History & Audit Ledger
            </h2>
          </div>
          <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--grey-500)" }}>
            {evaluations.length} RECORDS LOGGED
          </span>
        </div>

        {evaluations.length === 0 ? (
          <div className="empty" style={{ margin: 24 }}>
            <div className="empty-title">No evaluations registered yet</div>
            <div className="empty-body">
              Click &quot;Evaluate Faculty&quot; above to submit an academic appraisal for a cluster member.
            </div>
          </div>
        ) : (
          <div className="table-wrap" style={{ border: "none", borderRadius: 0 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>FACULTY</th>
                  <th>PERIOD</th>
                  <th>QUALITY</th>
                  <th>CONTRIB</th>
                  <th>INITIATIVE</th>
                  <th>OVERALL</th>
                  <th>REMARKS</th>
                  <th>TIMESTAMP</th>
                </tr>
              </thead>
              <tbody>
                {evaluations.map((evalItem) => (
                  <tr key={evalItem.id} className="cyber-row-hover">
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
                          {getInitials(evalItem.faculty.name)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13, color: "var(--grey-900)" }}>
                            {evalItem.faculty.name}
                          </div>
                          <div style={{ fontSize: 11, color: "var(--grey-500)", fontFamily: "var(--font-mono)" }}>
                            {evalItem.faculty.designation ?? evalItem.faculty.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge">
                        {evalItem.period}
                      </span>
                    </td>
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: 13 }}>
                      {evalItem.quality} / 5
                    </td>
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: 13 }}>
                      {evalItem.contribution} / 5
                    </td>
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: 13 }}>
                      {evalItem.initiative} / 5
                    </td>
                    <td>
                      <span
                        className="badge"
                        style={{
                          fontWeight: 700,
                          color: evalItem.overallRating >= 4 ? "#16a34a" : "#d97706",
                        }}
                      >
                        ★ {evalItem.overallRating} / 5
                      </span>
                    </td>
                    <td style={{ maxWidth: 260 }}>
                      <span style={{ fontSize: 12, color: evalItem.remarks ? "var(--grey-700)" : "var(--grey-400)" }}>
                        {evalItem.remarks ?? "—"}
                      </span>
                    </td>
                    <td style={{ whiteSpace: "nowrap", fontSize: 12, color: "var(--grey-500)", fontFamily: "var(--font-mono)" }}>
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