import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { MetricBlock } from "@/components/ui/MetricBlock";
import { ApplyLeaveForm } from "./ApplyLeaveForm";
import { CancelLeaveButton } from "./CancelLeaveButton";
import { Calendar, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Faculty Console // Leave Center" };

export default async function FacultyLeavePage() {
  const session = await auth();
  if (!session) redirect("/login");

  const userId = session.user.id;

  const leaves = await db.leaveApplication.findMany({
    where: { applicantId: userId },
    include: { decidedBy: true },
    orderBy: { createdAt: "desc" },
  });

  const totalApplied = leaves.length;
  const approvedCount = leaves.filter((l) => l.status === "APPROVED").length;
  const pendingCount = leaves.filter((l) => l.status === "PENDING").length;
  const rejectedCount = leaves.filter((l) => ["REJECTED", "CANCELLED"].includes(l.status)).length;

  return (
    <div style={{ maxWidth: 1240, margin: "0 auto", paddingBottom: 48 }}>
      {/* 1. Page Header */}
      <PageHeader
        breadcrumbs={[
          { label: "FACULTY_CONSOLE", href: "/faculty" },
          { label: "LEAVE_PIPELINE" },
        ]}
        title="Leave Center & Absence Governance"
        subtitle="Submit casual leave applications and track transparent evaluation decisions from your Cluster Head."
        eyebrow="// ABSENCE GOVERNANCE · LEAVE CONSOLE"
        dotMatrixText="LEAVE"
      />

      {/* 2. Leave Metrics Strip (Real Database Counts) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <MetricBlock
          label="Total Applications"
          value={totalApplied}
          context="Recorded requests"
          trendType="neutral"
          icon={<Calendar size={18} color="#1D1D1F" />}
        />
        <MetricBlock
          label="Pending Evaluation"
          value={pendingCount}
          context={pendingCount > 0 ? "Under cluster review" : "Pipeline clear"}
          trendType={pendingCount > 0 ? "warning" : "positive"}
          icon={<Clock size={18} color="#D97706" />}
        />
        <MetricBlock
          label="Approved Requests"
          value={approvedCount}
          context="Institutional sanction granted"
          trendType="positive"
          icon={<CheckCircle2 size={18} color="#16A34A" />}
        />
        <MetricBlock
          label="Declined / Revoked"
          value={rejectedCount}
          context="Declined by cluster lead"
          trendType="neutral"
          icon={<AlertCircle size={18} color="#E11D48" />}
        />
      </div>

      {/* 3. 2-Column Workflow Layout: Apply on Left, History on Right */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.4fr)",
          gap: 24,
          alignItems: "start",
        }}
      >
        {/* LEFT COLUMN: APPLICATION FORM */}
        <div className="tech-card" style={{ padding: 24, backgroundColor: "#FFFFFF", border: "1px solid #E8E8ED" }}>
          <div style={{ marginBottom: 18, borderBottom: "1px solid #E8E8ED", paddingBottom: 14 }}>
            <span className="hero-eyebrow" style={{ margin: 0, color: "#86868B" }}>
              // NEW ENTRY
            </span>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#1D1D1F", margin: "2px 0 0 0" }}>
              Submit Absence Application
            </h2>
            <p style={{ fontSize: 12.5, color: "#6E6E73", margin: "4px 0 0 0" }}>
              Specify the absence duration and formal academic justification.
            </p>
          </div>

          <ApplyLeaveForm />
        </div>

        {/* RIGHT COLUMN: LEAVE HISTORY TABLE */}
        <div className="tech-card" style={{ padding: 0, overflow: "hidden", backgroundColor: "#FFFFFF", border: "1px solid #E8E8ED" }}>
          <div
            style={{
              padding: "16px 22px",
              borderBottom: "1px solid #E8E8ED",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: "#F5F5F7",
            }}
          >
            <div>
              <span className="hero-eyebrow" style={{ margin: 0, color: "#86868B" }}>
                // PIPELINE HISTORY
              </span>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "#1D1D1F", margin: "2px 0 0 0" }}>
                Leave Application Archive
              </h2>
            </div>
            <span className="glyph-chip glyph-chip-cyan" style={{ fontSize: 11 }}>
              {leaves.length} SUBMISSIONS
            </span>
          </div>

          {leaves.length === 0 ? (
            <div style={{ padding: 36 }}>
              <EmptyState
                icon={Calendar}
                title="NO LEAVE REQUESTS RECORDED"
                description="You have not submitted any leave applications yet. Use the form to apply for upcoming absences."
              />
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  textAlign: "left",
                  fontSize: 13,
                }}
              >
                <thead>
                  <tr
                    style={{
                      backgroundColor: "#F5F5F7",
                      borderBottom: "1px solid #E8E8ED",
                      color: "#6E6E73",
                      fontSize: 11,
                      fontFamily: "var(--font-mono)",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    <th style={{ padding: "12px 20px" }}>Dates & Justification</th>
                    <th style={{ padding: "12px 16px" }}>Submitted</th>
                    <th style={{ padding: "12px 16px" }}>Status</th>
                    <th style={{ padding: "12px 20px", textAlign: "right" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {leaves.map((leave, idx) => {
                    const isPending = leave.status === "PENDING";
                    return (
                      <tr
                        key={leave.id}
                        className="cyber-row-hover"
                        style={{
                          borderBottom: idx < leaves.length - 1 ? "1px solid #E8E8ED" : "none",
                          transition: "background-color 0.15s ease",
                        }}
                      >
                        <td style={{ padding: "14px 20px", verticalAlign: "top" }}>
                          <div style={{ fontWeight: 600, color: "#1D1D1F", fontFamily: "var(--font-mono)", fontSize: 12.5, marginBottom: 3 }}>
                            {formatDate(leave.startDate)} — {formatDate(leave.endDate)}
                          </div>
                          <div style={{ fontSize: 12.5, color: "#6E6E73", lineHeight: 1.4, maxWidth: 320 }}>
                            {leave.reason}
                          </div>
                          {leave.remarks && (
                            <div
                              style={{
                                marginTop: 6,
                                fontSize: 11,
                                fontFamily: "var(--font-mono)",
                                color: "#E11D48",
                                backgroundColor: "rgba(225, 29, 72, 0.08)",
                                border: "1px solid rgba(225, 29, 72, 0.25)",
                                padding: "3px 8px",
                                borderRadius: 4,
                                display: "inline-block",
                              }}
                            >
                              NOTE: {leave.remarks}
                            </div>
                          )}
                        </td>

                        <td style={{ padding: "14px 16px", verticalAlign: "top", color: "#6E6E73", fontFamily: "var(--font-mono)", fontSize: 12, whiteSpace: "nowrap" }}>
                          {formatDate(leave.createdAt)}
                        </td>

                        <td style={{ padding: "14px 16px", verticalAlign: "top" }}>
                          <StatusBadge status={leave.status} size="sm" />
                          {leave.decidedBy && (
                            <div style={{ fontSize: 10.5, fontFamily: "var(--font-mono)", color: "#86868B", marginTop: 4 }}>
                              BY: {leave.decidedBy.name.split(" ")[0].toUpperCase()}
                            </div>
                          )}
                        </td>

                        <td style={{ padding: "14px 20px", verticalAlign: "top", textAlign: "right" }}>
                          {isPending && <CancelLeaveButton leaveId={leave.id} />}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
