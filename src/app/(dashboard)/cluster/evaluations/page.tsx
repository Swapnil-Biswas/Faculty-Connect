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
    <div className="dashboard-container" style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Top Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 className="page-title" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <UserCheck className="text-primary" size={28} />
            Faculty Evaluations & Appraisals
          </h1>
          <p className="page-subtitle">
            Evaluate cluster faculty across quality, contribution, and initiative. Submitting an evaluation automatically awards Recognition Stars.
          </p>
        </div>

        {facultyMembers.length > 0 && (
          <CreateEvaluationModal facultyMembers={facultyMembers} />
        )}
      </div>

      {/* Cluster Overview Stats */}
      <div className="grid-responsive-3" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: "hsl(var(--color-primary) / 0.15)", color: "hsl(var(--color-primary))" }}>
            <Award size={24} />
          </div>
          <div className="stat-card-value">{evaluations.length}</div>
          <div className="stat-card-label">Total Evaluations Submitted</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: "hsl(45 93% 47% / 0.15)", color: "#eab308" }}>
            <Star size={24} fill="#eab308" />
          </div>
          <div className="stat-card-value">
            {evaluations.length > 0
              ? (
                  evaluations.reduce((sum, e) => sum + e.overallRating, 0) /
                  evaluations.length
                ).toFixed(1)
              : "0.0"}{" "}
            <span style={{ fontSize: "14px", fontWeight: "normal", color: "hsl(var(--text-muted))" }}>/ 5.0</span>
          </div>
          <div className="stat-card-label">Average Cluster Rating</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: "hsl(142 71% 45% / 0.15)", color: "hsl(142 71% 45%)" }}>
            <UserCheck size={24} />
          </div>
          <div className="stat-card-value">{facultyMembers.length}</div>
          <div className="stat-card-label">Cluster Members</div>
        </div>
      </div>

      {/* Evaluations History Table */}
      <div className="card" style={{ padding: "1.5rem" }}>
        <h2 style={{ fontSize: "1.125rem", fontWeight: 700, marginBottom: "1rem" }}>
          Evaluation History
        </h2>

        {evaluations.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem 1rem", color: "hsl(var(--text-muted))" }}>
            No evaluations have been submitted yet. Click &quot;Evaluate Faculty&quot; to review a cluster member.
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Faculty</th>
                  <th>Period</th>
                  <th>Quality</th>
                  <th>Contribution</th>
                  <th>Initiative</th>
                  <th>Overall</th>
                  <th>Remarks</th>
                  <th>Evaluated On</th>
                </tr>
              </thead>
              <tbody>
                {evaluations.map((evalItem) => (
                  <tr key={evalItem.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <div className="avatar avatar-sm">{getInitials(evalItem.faculty.name)}</div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>{evalItem.faculty.name}</div>
                          <div style={{ fontSize: "0.75rem", color: "hsl(var(--text-muted))" }}>
                            {evalItem.faculty.designation ?? evalItem.faculty.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="role-badge" style={{ fontSize: "11px", padding: "2px 8px" }}>
                        {evalItem.period}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{evalItem.quality} / 5</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{evalItem.contribution} / 5</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{evalItem.initiative} / 5</span>
                    </td>
                    <td>
                      <span
                        className="status-badge"
                        style={{
                          fontSize: "12px",
                          fontWeight: 700,
                          background: evalItem.overallRating >= 4 ? "hsl(142 71% 45% / 0.15)" : "hsl(38 92% 50% / 0.15)",
                          color: evalItem.overallRating >= 4 ? "#16a34a" : "#b45309",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "3px",
                        }}
                      >
                        <Star size={12} fill="currentColor" />
                        {evalItem.overallRating} / 5
                      </span>
                    </td>
                    <td style={{ maxWidth: "260px" }}>
                      <span style={{ fontSize: "0.8125rem", color: evalItem.remarks ? "inherit" : "hsl(var(--text-muted))" }}>
                        {evalItem.remarks ?? "—"}
                      </span>
                    </td>
                    <td style={{ whiteSpace: "nowrap", fontSize: "0.8125rem", color: "hsl(var(--text-muted))" }}>
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