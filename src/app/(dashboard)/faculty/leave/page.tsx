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
          icon={<Calendar size={18} color="#FFD700" />}
        />
        <MetricBlock
          label="Pending Evaluation"
          value={pendingCount}
          context={pendingCount > 0 ? "Under cluster review" : "Pipeline clear"}
          trendType={pendingCount > 0 ? "warning" : "positive"}
          icon={<Clock size={18} color="#F59E0B" />}
        />
        <MetricBlock
          label="Approved Requests"
          value={approvedCount}
          context="Institutional sanction granted"
          trendType="positive"
          icon={<CheckCircle2 size={18} color="#4ADE80" />}
        />
        <MetricBlock
          label="Declined / Revoked"
          value={rejectedCount}
          context="Declined by cluster lead"
          trendType="neutral"
          icon={<AlertCircle size={18} color="#FB7185" />}
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
        <div className="tech-card" style={{ padding: 24 }}>
          <div style={{ marginBottom: 18, borderBottom: "1px solid rgba(255, 255, 255, 0.08)", paddingBottom: 14 }}>
            <span className="hero-eyebrow" style={{ margin: 0 }}>
              // NEW ENTRY
            </span>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#F8FAFC", margin: "2px 0 0 0" }}>
              Submit Absence Application
            </h2>
            <p style={{ fontSize: 12.5, color: "#94A3B8", margin: "4px 0 0 0" }}>
              Specify the absence duration and formal academic justification.
            </p>
          </div>

          <ApplyLeaveForm />
        </div>

        {/* RIGHT COLUMN: LEAVE HISTORY TABLE */}
        <div className="tech-card" style={{ padding: 0, overflow: "hidden" }}>
          <div
            style={{
              padding: "16px 22px",
              borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: "rgba(7, 9, 14, 0.6)",
            }}
          >
            <div>
              <span className="hero-eyebrow" style={{ margin: 0 }}>
                // PIPELINE HISTORY
              </span>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "#F8FAFC", margin: "2px 0 0 0" }}>
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
                      backgroundColor: "rgba(255, 255, 255, 0.02)",
                      borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                      color: "#64748B",
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
                          borderBottom: idx < leaves.length - 1 ? "1px solid rgba(255, 255, 255, 0.04)" : "none",
                          transition: "background-color 0.15s ease",
                        }}
                      >
                        <td style={{ padding: "14px 20px", verticalAlign: "top" }}>
                          <div style={{ fontWeight: 600, color: "#F8FAFC", fontFamily: "var(--font-mono)", fontSize: 12.5, marginBottom: 3 }}>
                            {formatDate(leave.startDate)} — {formatDate(leave.endDate)}
                          </div>
                          <div style={{ fontSize: 12.5, color: "#94A3B8", lineHeight: 1.4, maxWidth: 320 }}>
                            {leave.reason}
                          </div>
                          {leave.remarks && (
                            <div
                              style={{
                                marginTop: 6,
                                fontSize: 11,
                                fontFamily: "var(--font-mono)",
                                color: "#FB7185",
                                backgroundColor: "rgba(244, 63, 94, 0.1)",
                                border: "1px solid rgba(244, 63, 94, 0.25)",
                                padding: "3px 8px",
                                borderRadius: 4,
                                display: "inline-block",
                              }}
                            >
                              NOTE: {leave.remarks}
                            </div>
                          )}
                        </td>

                        <td style={{ padding: "14px 16px", verticalAlign: "top", color: "#64748B", fontFamily: "var(--font-mono)", fontSize: 12, whiteSpace: "nowrap" }}>
                          {formatDate(leave.createdAt)}
                        </td>

                        <td style={{ padding: "14px 16px", verticalAlign: "top" }}>
                          <StatusBadge status={leave.status} size="sm" />
                          {leave.decidedBy && (
                            <div style={{ fontSize: 10.5, fontFamily: "var(--font-mono)", color: "#64748B", marginTop: 4 }}>
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
