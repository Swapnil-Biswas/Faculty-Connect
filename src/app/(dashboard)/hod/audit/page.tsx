import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Shield, Clock, User, Filter, AlertCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function HodAuditPage({
  searchParams,
}: {
  searchParams: Promise<{ action?: string }>;
}) {
  const session = await auth();
  if (!session?.user || !["HOD", "ADMIN"].includes(session.user.role)) {
    redirect("/dashboard");
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
    <div className="page-content">
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 28,
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div>
          <h1 className="page-title">Department Audit Trail</h1>
          <p className="page-subtitle">
            Immutable log of key departmental decisions, approvals, task reassignments, and administrative actions.
          </p>
        </div>

        {/* Action filter */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Filter size={16} style={{ color: "hsl(var(--text-muted))" }} />
          <form method="get">
            <select
              name="action"
              defaultValue={action ?? "ALL"}
              className="form-input"
              style={{ fontSize: 13, padding: "6px 12px" }}
              onChange={(e) => e.target.form?.submit()}
            >
              {actionTypes.map((a) => (
                <option key={a} value={a}>
                  {a.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </form>
        </div>
      </div>

      {/* Logs Table */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div className="table-wrapper">
          <table>
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
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", color: "hsl(var(--text-muted))", padding: 36 }}>
                    No audit log records found for this filter.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id}>
                    <td style={{ whiteSpace: "nowrap", fontSize: 12.5, color: "hsl(var(--text-secondary))" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <Clock size={13} style={{ color: "hsl(var(--text-muted))" }} />
                        <span>{formatDate(log.timestamp.toISOString())}</span>
                      </div>
                    </td>

                    <td>
                      <div style={{ fontWeight: 600 }}>{log.actor.name}</div>
                      <div style={{ fontSize: 11, color: "hsl(var(--text-muted))" }}>{log.actor.role}</div>
                    </td>

                    <td>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: "3px 8px",
                          borderRadius: 6,
                          background: log.action.includes("DELETE") || log.action.includes("REJECT")
                            ? "hsl(var(--color-danger) / 0.12)"
                            : log.action.includes("APPROVE") || log.action.includes("CREATE")
                            ? "hsl(var(--color-success) / 0.12)"
                            : "hsl(var(--color-primary) / 0.12)",
                          color: log.action.includes("DELETE") || log.action.includes("REJECT")
                            ? "hsl(var(--color-danger))"
                            : log.action.includes("APPROVE") || log.action.includes("CREATE")
                            ? "hsl(var(--color-success))"
                            : "hsl(var(--color-primary))",
                        }}
                      >
                        {log.action}
                      </span>
                    </td>

                    <td>
                      <span style={{ fontWeight: 500 }}>{log.entityType}</span>
                      <span style={{ fontSize: 11, color: "hsl(var(--text-muted))", marginLeft: 6 }}>
                        #{log.entityId.slice(0, 10)}
                      </span>
                    </td>

                    <td style={{ fontSize: 12, color: "hsl(var(--text-secondary))" }}>
                      {log.isImpersonated ? (
                        <span style={{ color: "hsl(var(--color-warning))", fontWeight: 600 }}>
                          ⚠️ Impersonated
                        </span>
                      ) : (
                        <span>Verified Direct Session</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
