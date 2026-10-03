import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { Shield } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { HodAuditFilters } from "./HodAuditFilters";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Audit Ledger — HOD Console",
};

function getActionBadgeStyle(action: string) {
  switch (action) {
    case "TASK_COMPLETED":
    case "LEAVE_APPROVED":
      return {
        color: "#198754",
        backgroundColor: "rgba(25, 135, 84, 0.08)",
        borderColor: "rgba(25, 135, 84, 0.25)",
      };
    case "TASK_UPDATED":
    case "USER_ROLE_UPDATED":
      return {
        color: "#B7791F",
        backgroundColor: "rgba(183, 121, 31, 0.08)",
        borderColor: "rgba(183, 121, 31, 0.25)",
      };
    case "LEAVE_REJECTED":
      return {
        color: "#C0392B",
        backgroundColor: "rgba(192, 57, 43, 0.08)",
        borderColor: "rgba(192, 57, 43, 0.25)",
      };
    case "TASK_CREATED":
    case "LEAVE_APPLIED":
    case "EVALUATION_SUBMITTED":
    case "CLUSTER_CREATED":
    default:
      return {
        color: "#2F6FED",
        backgroundColor: "rgba(47, 111, 237, 0.08)",
        borderColor: "rgba(47, 111, 237, 0.25)",
      };
  }
}

export default async function HodAuditPage({
  searchParams,
}: {
  searchParams: Promise<{ action?: string }>;
}) {
  const session = await auth();
  if (!session?.user || !["HOD", "ADMIN"].includes(session.user.role)) {
    redirect("/login");
  }

  const { action } = await searchParams;

  const whereClause: any = {};
  if (action && action !== "ALL") {
    whereClause.action = action;
  }

  const logs = await db.auditLog.findMany({
    where: whereClause,
    include: {
      actor: { select: { id: true, name: true, email: true, role: true } },
    },
    orderBy: { timestamp: "desc" },
    take: 50,
  });

  const actionTypes = [
    "ALL",
    "TASK_CREATED",
    "TASK_UPDATED",
    "TASK_COMPLETED",
    "LEAVE_APPLIED",
    "LEAVE_APPROVED",
    "LEAVE_REJECTED",
    "EVALUATION_SUBMITTED",
    "USER_ROLE_UPDATED",
    "CLUSTER_CREATED",
  ];

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
          { label: "Audit Ledger" },
        ]}
        title="Audit Ledger"
        subtitle="Chronological institutional transaction record and administrative decision trail."
        showDotMatrix={false}
        actions={<HodAuditFilters actionTypes={actionTypes} currentAction={action} />}
      />

      {/* 2. Audit Logs Table */}
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
            padding: "16px 20px",
            borderBottom: "1px solid #E4E7EC",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
            backgroundColor: "#FFFFFF",
          }}
        >
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: "#17202A", margin: 0 }}>
              Department Audit Trail
            </h2>
            <p style={{ fontSize: 13, color: "#667085", margin: "2px 0 0 0" }}>
              Immutable transaction timeline showing the last 50 recorded governance events.
            </p>
          </div>
          <span
            style={{
              fontSize: 12,
              fontWeight: 500,
              padding: "4px 10px",
              backgroundColor: "#F2F4F7",
              color: "#17202A",
              borderRadius: 6,
              border: "1px solid #E4E7EC",
            }}
          >
            {logs.length} Logged Events
          </span>
        </div>

        {logs.length === 0 ? (
          <div style={{ padding: "48px 24px", textAlign: "center" }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 8,
                backgroundColor: "#F2F4F7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 12px",
                color: "#667085",
              }}
            >
              <Shield size={22} />
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#17202A" }}>
              No audit log entries recorded
            </div>
            <div style={{ fontSize: 13, color: "#667085", marginTop: 4 }}>
              No governance actions match the selected filter criteria.
            </div>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #E4E7EC", backgroundColor: "#F7F8FA" }}>
                  <th
                    style={{
                      padding: "12px 18px",
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#667085",
                      whiteSpace: "nowrap",
                    }}
                  >
                    TIMESTAMP
                  </th>
                  <th
                    style={{
                      padding: "12px 18px",
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#667085",
                    }}
                  >
                    ACTOR
                  </th>
                  <th
                    style={{
                      padding: "12px 18px",
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#667085",
                    }}
                  >
                    ACTION
                  </th>
                  <th
                    style={{
                      padding: "12px 18px",
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#667085",
                    }}
                  >
                    ENTITY TARGET
                  </th>
                  <th
                    style={{
                      padding: "12px 18px",
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#667085",
                    }}
                  >
                    SECURITY CONTEXT
                  </th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => {
                  const badgeStyle = getActionBadgeStyle(log.action);
                  return (
                    <tr
                      key={log.id}
                      style={{
                        borderBottom: "1px solid #F2F4F7",
                        transition: "background-color 0.15s ease",
                      }}
                    >
                      <td
                        style={{
                          padding: "14px 18px",
                          fontSize: 12.5,
                          color: "#667085",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {formatDate(log.timestamp)}
                      </td>
                      <td style={{ padding: "14px 18px" }}>
                        <div style={{ fontWeight: 600, color: "#17202A", fontSize: 13.5 }}>
                          {log.actor?.name ?? "System"}
                        </div>
                        <div style={{ fontSize: 12, color: "#667085" }}>
                          {log.actor?.role ?? "AUTOMATED"}
                        </div>
                      </td>
                      <td style={{ padding: "14px 18px" }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "3px 8px",
                            fontSize: 11.5,
                            fontWeight: 600,
                            borderRadius: 4,
                            border: `1px solid ${badgeStyle.borderColor}`,
                            backgroundColor: badgeStyle.backgroundColor,
                            color: badgeStyle.color,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {log.action.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td style={{ padding: "14px 18px" }}>
                        <div style={{ fontSize: 13, color: "#17202A" }}>
                          <span>{log.entityType ?? "System"}</span>{" "}
                          {log.entityId && (
                            <span
                              style={{
                                fontFamily: "var(--font-mono)",
                                fontSize: 12,
                                color: "#667085",
                              }}
                            >
                              #{log.entityId}
                            </span>
                          )}
                        </div>
                      </td>
                      <td
                        style={{
                          padding: "14px 18px",
                          fontSize: 12,
                          fontFamily: "var(--font-mono)",
                          color: "#667085",
                        }}
                      >
                        IP: {log.ipAddress ?? "127.0.0.1"}
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
  );
}
