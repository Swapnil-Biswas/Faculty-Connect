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

export const metadata: Metadata = { title: "Faculty Workspace — Leave Center" };

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
    <div style={{ maxWidth: 1200, margin: "0 auto", paddingBottom: 40 }}>
      {/* 1. Page Header */}
      <PageHeader
        breadcrumbs={[
          { label: "Faculty Workspace", href: "/faculty" },
          { label: "Leave Requests" },
        ]}
        title="Leave Center"
        subtitle="Submit casual leave applications and track approval decisions from your Cluster Head."
      />

      {/* 2. Leave Metrics Strip (Real Database Counts) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <MetricBlock
          label="Total Applications"
          value={totalApplied}
          context="Recorded requests"
          trendType="neutral"
          icon={<Calendar size={18} />}
        />
        <MetricBlock
          label="Pending Review"
          value={pendingCount}
          context={pendingCount > 0 ? "Awaiting cluster decision" : "No pending requests"}
          trendType={pendingCount > 0 ? "warning" : "positive"}
          icon={<Clock size={18} />}
        />
        <MetricBlock
          label="Approved Applications"
          value={approvedCount}
          context="Institutional sanction granted"
          trendType="positive"
          icon={<CheckCircle2 size={18} />}
        />
        <MetricBlock
          label="Rejected / Cancelled"
          value={rejectedCount}
          context="Revoked or declined"
          trendType="neutral"
          icon={<AlertCircle size={18} />}
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
        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E4E7EC",
            borderRadius: 6,
            padding: 24,
            boxShadow: "0 1px 2px 0 rgba(16, 24, 40, 0.04)",
          }}
        >
          <div style={{ marginBottom: 18, borderBottom: "1px solid #E4E7EC", paddingBottom: 14 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: "#17202A", margin: 0 }}>
              Apply for Leave
            </h2>
            <p style={{ fontSize: 12.5, color: "#667085", margin: "4px 0 0 0" }}>
              Specify the absence duration and formal justification.
            </p>
          </div>

          <ApplyLeaveForm />
        </div>

        {/* RIGHT COLUMN: LEAVE HISTORY TABLE */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E4E7EC",
            borderRadius: 6,
            overflow: "hidden",
            boxShadow: "0 1px 2px 0 rgba(16, 24, 40, 0.04)",
          }}
        >
          <div
            style={{
              padding: "16px 20px",
              borderBottom: "1px solid #E4E7EC",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 600, color: "#17202A", margin: 0 }}>
                Leave Application History
              </h2>
              <p style={{ fontSize: 12, color: "#667085", margin: "2px 0 0 0" }}>
                Chronological log of submitted applications and review comments
              </p>
            </div>
            <span style={{ fontSize: 12, fontWeight: 500, color: "#667085" }}>
              {leaves.length} records
            </span>
          </div>

          {leaves.length === 0 ? (
            <div style={{ padding: 32 }}>
              <EmptyState
                icon={Calendar}
                title="No leave requests"
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
                      backgroundColor: "#F7F8FA",
                      borderBottom: "1px solid #E4E7EC",
                      color: "#667085",
                      fontSize: 11.5,
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                    }}
                  >
                    <th style={{ padding: "10px 16px" }}>Dates & Reason</th>
                    <th style={{ padding: "10px 14px" }}>Submitted</th>
                    <th style={{ padding: "10px 14px" }}>Status</th>
                    <th style={{ padding: "10px 16px", textAlign: "right" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {leaves.map((leave, idx) => {
                    const isPending = leave.status === "PENDING";
                    return (
                      <tr
                        key={leave.id}
                        style={{
                          borderBottom: idx < leaves.length - 1 ? "1px solid #F2F4F7" : "none",
                        }}
                      >
                        <td style={{ padding: "14px 16px", verticalAlign: "top" }}>
                          <div style={{ fontWeight: 600, color: "#17202A", marginBottom: 3 }}>
                            {formatDate(leave.startDate)} — {formatDate(leave.endDate)}
                          </div>
                          <div style={{ fontSize: 12, color: "#667085", lineHeight: 1.4, maxWidth: 300 }}>
                            {leave.reason}
                          </div>
                          {leave.remarks && (
                            <div
                              style={{
                                marginTop: 6,
                                fontSize: 11.5,
                                color: "#C0392B",
                                backgroundColor: "#FEF2F2",
                                padding: "4px 8px",
                                borderRadius: 4,
                                display: "inline-block",
                              }}
                            >
                              Review Note: {leave.remarks}
                            </div>
                          )}
                        </td>

                        <td style={{ padding: "14px 14px", verticalAlign: "top", color: "#667085", whiteSpace: "nowrap" }}>
                          {formatDate(leave.createdAt)}
                        </td>

                        <td style={{ padding: "14px 14px", verticalAlign: "top" }}>
                          <StatusBadge status={leave.status} size="sm" />
                          {leave.decidedBy && (
                            <div style={{ fontSize: 11, color: "#667085", marginTop: 4 }}>
                              by {leave.decidedBy.name.split(" ")[0]}
                            </div>
                          )}
                        </td>

                        <td style={{ padding: "14px 16px", verticalAlign: "top", textAlign: "right" }}>
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
