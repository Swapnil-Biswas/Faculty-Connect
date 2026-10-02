import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { Shield, Clock, User, Filter, AlertCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";

import { HodAuditFilters } from "./HodAuditFilters";

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
    <div style={{ padding: "28px 32px", display: "flex", flexDirection: "column", gap: 24 }}>
      {/* 1. Page Header with BMSIT Dot Matrix */}
      <PageHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/hod" },
          { label: "Audit Ledger" },
        ]}
        eyebrow="HOD // SECURITY & COMPLIANCE"
        dotMatrixText="AUDIT"
        dotMatrixFontSize={36}
        title="Department Audit Trail"
        ghost="ledger."
        subtitle="Immutable log of key departmental decisions, approvals, task reassignments, and administrative actions."
        actions={<HodAuditFilters actionTypes={actionTypes} currentAction={action} />}
      />

      {/* Logs Table */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div
          style={{
            padding: "16px 24px",
            borderBottom: "1px solid #E8E8ED",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#FAFAFA",
          }}
        >
          <span className="section-eyebrow">// TRANSACTION TIMELINE</span>
          <span className="badge badge-dark">{logs.length} Logged Events</span>
        </div>

        {logs.length === 0 ? (
          <div style={{ padding: 48, textAlign: "center" }}>
            <Shield size={36} style={{ color: "#B0B0B5", margin: "0 auto 8px" }} />
            <div style={{ fontSize: 14, fontWeight: 700, color: "#1D1D1F" }}>No audit log entries recorded</div>
          </div>
        ) : (
          <div className="table-wrap" style={{ border: "none", borderRadius: 0 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Actor</th>
                  <th>Action</th>
                  <th>Entity Target</th>
                  <th>Security Context</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: 11.5, color: "#6E6E73", whiteSpace: "nowrap" }}>
                      {formatDate(log.timestamp)}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: "#1D1D1F", fontSize: 13 }}>
                        {log.actor?.name ?? "System"}
                      </div>
                      <div style={{ fontSize: 11, color: "#86868B", fontFamily: "var(--font-mono)" }}>
                        {log.actor?.role ?? "AUTOMATED"}
                      </div>
                    </td>
                    <td>
                      <span className="badge">
                        {log.action.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "#1D1D1F" }}>
                      {log.entityType ? `${log.entityType}#${log.entityId ?? "—"}` : "—"}
                    </td>
                    <td style={{ fontSize: 11.5, fontFamily: "var(--font-mono)", color: "#86868B" }}>
                      IP: {log.ipAddress ?? "127.0.0.1"}
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
