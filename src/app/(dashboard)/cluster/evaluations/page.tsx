import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { CreateEvaluationModal } from "./CreateEvaluationModal";
import { Star, UserCheck, Award, AlertTriangle } from "lucide-react";
import { formatDate, getInitials } from "@/lib/utils";
import { PageHeader } from "@/components/ui/PageHeader";
import { MetricBlock } from "@/components/ui/MetricBlock";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Cluster Head // Faculty Evaluations" };

export default async function ClusterEvaluationsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { role, id: userId, clusterId } = session.user;
  if (!["CLUSTER_HEAD", "HOD", "ADMIN"].includes(role)) {
    redirect("/faculty");
  }

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

  if (!cluster) {
    return (
      <div style={{ maxWidth: 1240, margin: "0 auto", paddingBottom: 48 }}>
        <PageHeader
          breadcrumbs={[
            { label: "CLUSTER_CONSOLE", href: "/cluster" },
            { label: "EVALUATIONS" },
          ]}
          title="Faculty Evaluations"
          subtitle="Record periodic appraisals across quality, contribution & initiative."
          dotMatrixText="EVALS"
        />
        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E4E7EC",
            borderRadius: 8,
            padding: "48px 24px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 8,
              backgroundColor: "rgba(183, 121, 31, 0.1)",
              border: "1px solid rgba(183, 121, 31, 0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              color: "#B7791F",
            }}
          >
            <AlertTriangle size={24} />
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: "#17202A", margin: "0 0 8px 0" }}>
            No Cluster Assigned
          </h2>
          <p style={{ fontSize: 14, color: "#667085", maxWidth: 460, margin: "0 auto" }}>
            You must be linked to an academic cluster to conduct faculty appraisals.
          </p>
        </div>
      </div>
    );
  }

  // Filter out the evaluator themselves from faculty dropdown
  const facultyMembers =
    cluster.members
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
        ...(cluster.members.map((m) => ({ facultyId: m.userId })) ?? []),
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
    <div style={{ maxWidth: 1240, margin: "0 auto", paddingBottom: 48 }}>
      {/* 1. Page Header */}
      <PageHeader
        breadcrumbs={[
          { label: "CLUSTER_CONSOLE", href: "/cluster" },
          { label: "EVALUATIONS" },
        ]}
        dotMatrixText="EVALS"
        eyebrow="// ACADEMIC GOVERNANCE · APPRAISAL LEDGER"
        title="Faculty Evaluations & Appraisals"
        subtitle="Evaluate faculty across quality, contribution & initiative — awards verified recognition stars."
        actions={
          facultyMembers.length > 0 ? (
            <CreateEvaluationModal facultyMembers={facultyMembers} />
          ) : undefined
        }
      />

      {/* 2. Cluster Overview Metric Blocks */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <MetricBlock
          label="Evaluations Recorded"
          value={evaluations.length}
          context="Verified appraisals in audit ledger"
          trendType="neutral"
          icon={<Award size={18} color="#173B67" />}
        />
        <MetricBlock
          label="Avg Cluster Rating"
          value={`${avgRating} / 5.0`}
          context="Composite cluster appraisal score"
          trendType="positive"
          icon={<Star size={18} color="#B7791F" />}
        />
        <MetricBlock
          label="Eligible Faculty"
          value={facultyMembers.length}
          context="Candidates in current cluster"
          trendType="neutral"
          icon={<UserCheck size={18} color="#2F6FED" />}
        />
      </div>

      {/* 3. Evaluations History Table Card */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #E4E7EC",
          borderRadius: 8,
          overflow: "hidden",
          boxShadow: "0 1px 3px rgba(16, 24, 40, 0.05)",
        }}
      >
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid #E4E7EC",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "#FAFAFA",
          }}
        >
          <div>
            <span
              style={{
                fontSize: 10,
                fontFamily: "var(--font-mono)",
                fontWeight: 600,
                letterSpacing: "0.1em",
                color: "#667085",
                textTransform: "uppercase",
              }}
            >
              // EVALUATION AUDIT LOG
            </span>
            <h2 style={{ fontSize: 16, fontWeight: 600, margin: "2px 0 0", color: "#17202A" }}>
              Appraisal History & Audit Ledger
            </h2>
          </div>
          <span style={{ fontSize: 11.5, color: "#667085", fontWeight: 500 }}>
            {evaluations.length} RECORDS LOGGED
          </span>
        </div>

        {evaluations.length === 0 ? (
          <EmptyState
            icon={Award}
            title="No Evaluations Registered Yet"
            description="Click 'Evaluate Faculty' above to submit an academic appraisal for a cluster member."
          />
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #E4E7EC", backgroundColor: "#F7F8FA" }}>
                  <th style={{ padding: "10px 16px", fontSize: 11, fontWeight: 600, color: "#667085", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Faculty Member
                  </th>
                  <th style={{ padding: "10px 16px", fontSize: 11, fontWeight: 600, color: "#667085", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Period
                  </th>
                  <th style={{ padding: "10px 16px", fontSize: 11, fontWeight: 600, color: "#667085", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Quality
                  </th>
                  <th style={{ padding: "10px 16px", fontSize: 11, fontWeight: 600, color: "#667085", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Contrib
                  </th>
                  <th style={{ padding: "10px 16px", fontSize: 11, fontWeight: 600, color: "#667085", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Initiative
                  </th>
                  <th style={{ padding: "10px 16px", fontSize: 11, fontWeight: 600, color: "#667085", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Overall Rating
                  </th>
                  <th style={{ padding: "10px 16px", fontSize: 11, fontWeight: 600, color: "#667085", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Remarks
                  </th>
                  <th style={{ padding: "10px 16px", fontSize: 11, fontWeight: 600, color: "#667085", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {evaluations.map((evalItem) => (
                  <tr
                    key={evalItem.id}
                    style={{
                      borderBottom: "1px solid #F2F4F7",
                      transition: "background-color 0.15s ease",
                    }}
                  >
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 6,
                            backgroundColor: "#173B67",
                            color: "#FFFFFF",
                            fontFamily: "var(--font-mono)",
                            fontSize: 11,
                            fontWeight: 700,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          {getInitials(evalItem.faculty.name)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13.5, color: "#17202A" }}>
                            {evalItem.faculty.name}
                          </div>
                          <div style={{ fontSize: 11.5, color: "#667085" }}>
                            {evalItem.faculty.designation ?? evalItem.faculty.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: "#17202A",
                          backgroundColor: "#F2F4F7",
                          padding: "2px 7px",
                          borderRadius: 4,
                        }}
                      >
                        {evalItem.period}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "#17202A" }}>
                      {evalItem.quality} / 5
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "#17202A" }}>
                      {evalItem.contribution} / 5
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "#17202A" }}>
                      {evalItem.initiative} / 5
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          fontSize: 12,
                          fontWeight: 700,
                          color: "#B7791F",
                          backgroundColor: "rgba(183, 121, 31, 0.08)",
                          border: "1px solid rgba(183, 121, 31, 0.25)",
                          padding: "2px 8px",
                          borderRadius: 4,
                        }}
                      >
                        <Star size={11} fill="#B7791F" color="#B7791F" />
                        {evalItem.overallRating} / 5
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", maxWidth: 240 }}>
                      <span style={{ fontSize: 12.5, color: evalItem.remarks ? "#17202A" : "#98A2B3" }}>
                        {evalItem.remarks ?? "—"}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", whiteSpace: "nowrap", fontSize: 12, color: "#667085" }}>
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