import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { formatDate, getInitials } from "@/lib/utils";
import { HodDecideLeaveForm } from "./HodDecideLeaveForm";
import { HodLeaveFilters } from "./HodLeaveFilters";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Calendar, Clock, CheckCircle2, XCircle, AlertTriangle, Layers, User } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Department Leave — HOD Console" };

export default async function HodLeavePage({
  searchParams,
}: {
  searchParams: Promise<{ cluster?: string; status?: string }>;
}) {
  const session = await auth();
  if (!session || !["HOD", "ADMIN"].includes(session.user.role)) {
    redirect("/login");
  }

  const params = await searchParams;
  const clusterFilter = params.cluster;
  const statusFilter = params.status ?? "PENDING";

  const [clusters, leaves, counts] = await Promise.all([
    db.cluster.findMany({
      where: { deletedAt: null },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    db.leaveApplication.findMany({
      where: {
        ...(clusterFilter ? { clusterId: clusterFilter } : {}),
        ...(statusFilter && statusFilter !== "ALL" ? { status: statusFilter as never } : {}),
      },
      include: {
        applicant: { select: { id: true, name: true, designation: true, email: true } },
        cluster: { select: { id: true, name: true } },
        decidedBy: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 60,
    }),
    Promise.all([
      db.leaveApplication.count({ where: { status: "PENDING" } }),
      db.leaveApplication.count({ where: { status: "APPROVED" } }),
      db.leaveApplication.count({ where: { status: "REJECTED" } }),
      db.leaveApplication.count(),
    ]).then(([pending, approved, rejected, all]) => ({
      PENDING: pending,
      APPROVED: approved,
      REJECTED: rejected,
      ALL: all,
    })),
  ]);

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", paddingBottom: 48 }}>
      {/* 1. Page Header */}
      <PageHeader
        breadcrumbs={[
          { label: "HOD_CONSOLE", href: "/hod" },
          { label: "LEAVE_PIPELINE" },
        ]}
        eyebrow="// FACULTY GOVERNANCE · LEAVE PIPELINE"
        title="Department Leave Approvals"
        subtitle="Review, audit, and approve faculty leave applications across all academic clusters."
        showDotMatrix={false}
      />

      {/* 2. Top Metric Bar */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 12,
          marginBottom: 24,
        }}
      >
        <div
          style={{
            backgroundColor: counts.PENDING > 0 ? "rgba(183, 121, 31, 0.05)" : "#FFFFFF",
            border: `1px solid ${counts.PENDING > 0 ? "rgba(183, 121, 31, 0.3)" : "#E4E7EC"}`,
            borderRadius: 8,
            padding: "14px 18px",
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: counts.PENDING > 0 ? "#B7791F" : "#667085",
              fontFamily: "var(--font-mono)",
            }}
          >
            PENDING REVIEWS
          </span>
          <span
            style={{
              fontSize: 26,
              fontWeight: 700,
              color: counts.PENDING > 0 ? "#B7791F" : "#17202A",
              fontFamily: "var(--font-mono)",
            }}
          >
            {counts.PENDING}
          </span>
        </div>

        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E4E7EC",
            borderRadius: 8,
            padding: "14px 18px",
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          <span style={{ fontSize: 11, fontWeight: 600, color: "#667085", fontFamily: "var(--font-mono)" }}>
            APPROVED THIS TERM
          </span>
          <span style={{ fontSize: 26, fontWeight: 700, color: "#198754", fontFamily: "var(--font-mono)" }}>
            {counts.APPROVED}
          </span>
        </div>

        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E4E7EC",
            borderRadius: 8,
            padding: "14px 18px",
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          <span style={{ fontSize: 11, fontWeight: 600, color: "#667085", fontFamily: "var(--font-mono)" }}>
            REJECTED
          </span>
          <span style={{ fontSize: 26, fontWeight: 700, color: "#C0392B", fontFamily: "var(--font-mono)" }}>
            {counts.REJECTED}
          </span>
        </div>

        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E4E7EC",
            borderRadius: 8,
            padding: "14px 18px",
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          <span style={{ fontSize: 11, fontWeight: 600, color: "#667085", fontFamily: "var(--font-mono)" }}>
            TOTAL APPLICATIONS
          </span>
          <span style={{ fontSize: 26, fontWeight: 700, color: "#17202A", fontFamily: "var(--font-mono)" }}>
            {counts.ALL}
          </span>
        </div>
      </div>

      {/* 3. Interactive Filters Bar */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #E4E7EC",
          borderRadius: 8,
          padding: "12px 16px",
          marginBottom: 16,
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.02)",
        }}
      >
        <HodLeaveFilters
          clusters={clusters}
          currentCluster={clusterFilter}
          currentStatus={statusFilter}
          counts={counts}
        />
      </div>

      {/* 4. Leave Queue Content */}
      {statusFilter === "PENDING" ? (
        /* Prominent Pending Review Cards */
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {leaves.length === 0 ? (
            <div
              style={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #E4E7EC",
                borderRadius: 8,
                padding: "48px 24px",
              }}
            >
              <EmptyState
                title="All Leave Reviews Complete"
                description="There are currently no pending leave requests awaiting departmental review."
                icon={CheckCircle2}
              />
            </div>
          ) : (
            leaves.map((l) => {
              const start = new Date(l.startDate);
              const end = new Date(l.endDate);
              const days = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);

              return (
                <div
                  key={l.id}
                  style={{
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E4E7EC",
                    borderRadius: 8,
                    padding: 18,
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: 20,
                    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.02)",
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 14, minWidth: 280, flex: 1 }}>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        backgroundColor: "#173B67",
                        color: "#FFFFFF",
                        fontSize: 13,
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {getInitials(l.applicant.name)}
                    </div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: "#17202A" }}>
                          {l.applicant.name}
                        </span>
                        {l.applicant.designation && (
                          <span style={{ fontSize: 12, color: "#667085" }}>
                            · {l.applicant.designation}
                          </span>
                        )}
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            fontSize: 11,
                            fontWeight: 500,
                            color: "#173B67",
                            backgroundColor: "rgba(23, 59, 103, 0.06)",
                            padding: "2px 7px",
                            borderRadius: 4,
                          }}
                        >
                          <Layers size={10} />
                          {l.cluster.name}
                        </span>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          fontSize: 12,
                          color: "#17202A",
                          margin: "6px 0",
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        <Calendar size={13} color="#667085" />
                        <span>
                          {formatDate(l.startDate)} → {formatDate(l.endDate)}
                        </span>
                        <span
                          style={{
                            backgroundColor: "rgba(183, 121, 31, 0.1)",
                            color: "#B7791F",
                            fontWeight: 600,
                            padding: "1px 6px",
                            borderRadius: 4,
                            fontSize: 11,
                          }}
                        >
                          {days} {days === 1 ? "day" : "days"}
                        </span>
                      </div>

                      <div
                        style={{
                          fontSize: 13,
                          color: "#475467",
                          lineHeight: 1.45,
                          backgroundColor: "#F8FAFC",
                          padding: "8px 12px",
                          borderRadius: 6,
                          border: "1px solid #F2F4F7",
                          marginTop: 4,
                        }}
                      >
                        <span style={{ fontWeight: 600, color: "#17202A" }}>Reason: </span>
                        {l.reason}
                      </div>
                    </div>
                  </div>

                  {/* Decision Form */}
                  <div style={{ flexShrink: 0 }}>
                    <HodDecideLeaveForm leaveId={l.id} />
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* History & Decided Applications Table */
        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E4E7EC",
            borderRadius: 8,
            overflow: "hidden",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.02)",
          }}
        >
          <div
            style={{
              padding: "14px 18px",
              borderBottom: "1px solid #E4E7EC",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: "#F8FAFC",
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 600, color: "#17202A" }}>
              Leave Applications ({leaves.length})
            </span>
            <span style={{ fontSize: 11.5, fontFamily: "var(--font-mono)", color: "#667085" }}>
              Status: {statusFilter}
            </span>
          </div>

          {leaves.length === 0 ? (
            <div style={{ padding: "48px 24px" }}>
              <EmptyState
                title="No Applications Recorded"
                description={`No applications found with status "${statusFilter}".`}
                icon={Calendar}
              />
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #E4E7EC", backgroundColor: "#F8FAFC" }}>
                    <th
                      style={{
                        padding: "10px 16px",
                        fontSize: 11,
                        fontWeight: 600,
                        color: "#667085",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      FACULTY MEMBER
                    </th>
                    <th
                      style={{
                        padding: "10px 16px",
                        fontSize: 11,
                        fontWeight: 600,
                        color: "#667085",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      CLUSTER
                    </th>
                    <th
                      style={{
                        padding: "10px 16px",
                        fontSize: 11,
                        fontWeight: 600,
                        color: "#667085",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      DATES & DURATION
                    </th>
                    <th
                      style={{
                        padding: "10px 16px",
                        fontSize: 11,
                        fontWeight: 600,
                        color: "#667085",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      STATUS
                    </th>
                    <th
                      style={{
                        padding: "10px 16px",
                        fontSize: 11,
                        fontWeight: 600,
                        color: "#667085",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      DECIDED BY
                    </th>
                    <th
                      style={{
                        padding: "10px 16px",
                        fontSize: 11,
                        fontWeight: 600,
                        color: "#667085",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      REASON / REMARKS
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {leaves.map((l) => {
                    const start = new Date(l.startDate);
                    const end = new Date(l.endDate);
                    const days = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);

                    return (
                      <tr
                        key={l.id}
                        style={{
                          borderBottom: "1px solid #F2F4F7",
                          transition: "background-color 0.15s ease",
                        }}
                      >
                        <td style={{ padding: "12px 16px" }}>
                          <div style={{ fontSize: 13.5, fontWeight: 600, color: "#17202A" }}>
                            {l.applicant.name}
                          </div>
                          <div style={{ fontSize: 11.5, color: "#667085" }}>
                            {l.applicant.designation ?? l.applicant.email}
                          </div>
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                              fontSize: 11.5,
                              fontWeight: 500,
                              color: "#173B67",
                              backgroundColor: "rgba(23, 59, 103, 0.06)",
                              padding: "2px 7px",
                              borderRadius: 4,
                            }}
                          >
                            <Layers size={10} />
                            {l.cluster.name}
                          </span>
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <div style={{ fontSize: 12.5, color: "#17202A", fontFamily: "var(--font-mono)" }}>
                            {formatDate(l.startDate)} → {formatDate(l.endDate)}
                          </div>
                          <div style={{ fontSize: 11, color: "#667085" }}>
                            {days} {days === 1 ? "day" : "days"}
                          </div>
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <StatusBadge status={l.status} size="sm" />
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          {l.decidedBy ? (
                            <div>
                              <div style={{ fontSize: 12.5, fontWeight: 600, color: "#17202A" }}>
                                {l.decidedBy.name}
                              </div>
                              {l.decidedAt && (
                                <div style={{ fontSize: 11, color: "#667085", fontFamily: "var(--font-mono)" }}>
                                  {formatDate(l.decidedAt)}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span style={{ fontSize: 12, color: "#98A2B3" }}>—</span>
                          )}
                        </td>
                        <td style={{ padding: "12px 16px", maxWidth: 260 }}>
                          <div style={{ fontSize: 12.5, color: "#17202A" }}>
                            {l.reason}
                          </div>
                          {l.remarks && (
                            <div style={{ fontSize: 11.5, color: "#667085", fontStyle: "italic", marginTop: 2 }}>
                              Note: {l.remarks}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
