"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Download,
  Filter,
  Check,
  X,
  ChevronRight,
  Shield,
  FileCode,
  Globe,
  User,
  AlertTriangle,
} from "lucide-react";
import { formatDate, getInitials } from "@/lib/utils";

export interface SerializedAuditLog {
  id: string;
  actorId: string;
  action: string;
  entityType: string;
  entityId: string;
  beforeState: Record<string, any> | null;
  afterState: Record<string, any> | null;
  isImpersonated: boolean;
  impersonatorId: string | null;
  ipAddress: string | null;
  timestamp: string;
  actor: {
    id: string;
    name: string;
    email: string;
  };
}

export const ACTION_METADATA: Record<
  string,
  {
    label: string;
    category: string;
    color: string;
    backgroundColor: string;
    borderColor: string;
  }
> = {
  // Identity & Access Management
  USER_CREATED: {
    label: "User Created",
    category: "Identity & Access",
    color: "#166534",
    backgroundColor: "#F0FDF4",
    borderColor: "#BBF7D0",
  },
  USER_ROLE_UPDATED: {
    label: "Role Updated",
    category: "Identity & Access",
    color: "#175CD3",
    backgroundColor: "#EFF8FF",
    borderColor: "#B2DDFF",
  },
  USER_SOFT_DELETED: {
    label: "User Deactivated",
    category: "Identity & Access",
    color: "#B42318",
    backgroundColor: "#FEF3F2",
    borderColor: "#FECDCA",
  },
  USER_ASSIGNED_TO_CLUSTER: {
    label: "Cluster Assigned",
    category: "Identity & Access",
    color: "#6941C6",
    backgroundColor: "#F9F5FF",
    borderColor: "#E9D7FE",
  },

  // Task Operations
  TASK_CREATED: {
    label: "Task Created",
    category: "Task Operations",
    color: "#0E7090",
    backgroundColor: "#ECFEFF",
    borderColor: "#A5F3FC",
  },
  TASK_STATUS_UPDATED: {
    label: "Task Updated",
    category: "Task Operations",
    color: "#B54708",
    backgroundColor: "#FFFAEB",
    borderColor: "#FEDF89",
  },
  TASK_DELETED: {
    label: "Task Deleted",
    category: "Task Operations",
    color: "#B42318",
    backgroundColor: "#FEF3F2",
    borderColor: "#FECDCA",
  },

  // Leave Management
  LEAVE_APPLIED: {
    label: "Leave Applied",
    category: "Leave Workflow",
    color: "#175CD3",
    backgroundColor: "#EFF8FF",
    borderColor: "#B2DDFF",
  },
  LEAVE_APPROVED: {
    label: "Leave Approved",
    category: "Leave Workflow",
    color: "#166534",
    backgroundColor: "#F0FDF4",
    borderColor: "#BBF7D0",
  },
  LEAVE_REJECTED: {
    label: "Leave Rejected",
    category: "Leave Workflow",
    color: "#B42318",
    backgroundColor: "#FEF3F2",
    borderColor: "#FECDCA",
  },
  LEAVE_CANCELLED: {
    label: "Leave Cancelled",
    category: "Leave Workflow",
    color: "#475467",
    backgroundColor: "#F2F4F7",
    borderColor: "#E4E7EC",
  },

  // Academic Clusters
  CLUSTER_CREATED: {
    label: "Cluster Created",
    category: "Academic Clusters",
    color: "#6941C6",
    backgroundColor: "#F9F5FF",
    borderColor: "#E9D7FE",
  },
  CLUSTER_UPDATED: {
    label: "Cluster Updated",
    category: "Academic Clusters",
    color: "#3538CD",
    backgroundColor: "#EEF4FF",
    borderColor: "#C7D7FE",
  },
  CLUSTER_DELETED: {
    label: "Cluster Deleted",
    category: "Academic Clusters",
    color: "#B42318",
    backgroundColor: "#FEF3F2",
    borderColor: "#FECDCA",
  },

  // Research & Publications
  PUBLICATION_CREATED: {
    label: "Publication Created",
    category: "Research",
    color: "#087443",
    backgroundColor: "#EDFDF5",
    borderColor: "#A6F4C5",
  },
  PUBLICATION_DELETED: {
    label: "Publication Deleted",
    category: "Research",
    color: "#B42318",
    backgroundColor: "#FEF3F2",
    borderColor: "#FECDCA",
  },

  // Evaluations & Recognition
  EVALUATION_CREATED: {
    label: "Evaluation Created",
    category: "Evaluations",
    color: "#027A48",
    backgroundColor: "#ECFDF3",
    borderColor: "#A6F4C5",
  },
  EVALUATION_SUBMITTED: {
    label: "Evaluation Submitted",
    category: "Evaluations",
    color: "#027A48",
    backgroundColor: "#ECFDF3",
    borderColor: "#A6F4C5",
  },
  SCORING_CONFIG_UPDATED: {
    label: "Scoring Calibrated",
    category: "Governance & Rules",
    color: "#7839EE",
    backgroundColor: "#F4EBFF",
    borderColor: "#D6BBFB",
  },
  LEADERBOARD_SNAPSHOT_CREATED: {
    label: "Leaderboard Snapshot",
    category: "Recognition",
    color: "#B54708",
    backgroundColor: "#FFFAEB",
    borderColor: "#FEDF89",
  },
  FACULTY_OF_MONTH_AWARDED: {
    label: "Honoree Awarded",
    category: "Recognition",
    color: "#B54708",
    backgroundColor: "#FFFAEB",
    borderColor: "#FEDF89",
  },

  // Operations & System
  NOTIFICATION_RULE_UPDATED: {
    label: "Rule Calibrated",
    category: "Governance & Rules",
    color: "#026AA2",
    backgroundColor: "#F0F9FF",
    borderColor: "#B9E6FE",
  },
  JOB_MANUALLY_DISPATCHED: {
    label: "Job Dispatched",
    category: "System Operations",
    color: "#175CD3",
    backgroundColor: "#EFF8FF",
    borderColor: "#B2DDFF",
  },
  WEBHOOK_TEST_DISPATCHED: {
    label: "Webhook Dispatched",
    category: "System Operations",
    color: "#5925DC",
    backgroundColor: "#F4F3FF",
    borderColor: "#D9D6FE",
  },
};

export function getActionStyle(action: string) {
  if (ACTION_METADATA[action]) {
    return ACTION_METADATA[action];
  }
  return {
    label: action.replace(/_/g, " "),
    category: "General",
    color: "#344054",
    backgroundColor: "#F2F4F7",
    borderColor: "#E4E7EC",
  };
}

interface AuditLedgerClientProps {
  logs: SerializedAuditLog[];
  total: number;
  page: number;
  totalPages: number;
  currentFilters: {
    action?: string;
    entity?: string;
    actor?: string;
  };
}

export function AuditLedgerClient({
  logs,
  total,
  page,
  totalPages,
  currentFilters,
}: AuditLedgerClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedAction, setSelectedAction] = useState(currentFilters.action || "");
  const [selectedEntity, setSelectedEntity] = useState(currentFilters.entity || "");
  const [actorSearch, setActorSearch] = useState(currentFilters.actor || "");
  const [inspectingLog, setInspectingLog] = useState<SerializedAuditLog | null>(null);
  const [exported, setExported] = useState(false);

  const handleApplyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (selectedAction) params.set("action", selectedAction);
    if (selectedEntity) params.set("entity", selectedEntity);
    if (actorSearch.trim()) params.set("actor", actorSearch.trim());
    params.set("page", "1");
    router.push(`/admin/audit?${params.toString()}`);
  };

  const handleClearFilters = () => {
    setSelectedAction("");
    setSelectedEntity("");
    setActorSearch("");
    router.push("/admin/audit");
  };

  const handleExportCSV = () => {
    if (logs.length === 0) {
      alert("No audit logs available to export.");
      return;
    }

    const headers = [
      "Log ID",
      "Timestamp",
      "Actor Name",
      "Actor Email",
      "Action",
      "Category",
      "Entity Type",
      "Entity ID",
      "IP Address",
      "Impersonated",
      "Impersonator ID",
      "Before State",
      "After State",
    ];

    const rows = logs.map((log) => {
      const style = getActionStyle(log.action);
      return [
        log.id,
        log.timestamp,
        log.actor.name,
        log.actor.email,
        log.action,
        style.category,
        log.entityType,
        log.entityId,
        log.ipAddress || "—",
        log.isImpersonated ? "YES" : "NO",
        log.impersonatorId || "—",
        log.beforeState ? JSON.stringify(log.beforeState) : "",
        log.afterState ? JSON.stringify(log.afterState) : "",
      ];
    });

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row
          .map((val) => `"${String(val).replace(/"/g, '""')}"`)
          .join(",")
      ),
    ].join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `security_audit_ledger_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExported(true);
    setTimeout(() => setExported(false), 2500);
  };

  const actionCategories = [
    {
      label: "Identity & Access",
      actions: ["USER_CREATED", "USER_ROLE_UPDATED", "USER_SOFT_DELETED", "USER_ASSIGNED_TO_CLUSTER"],
    },
    {
      label: "Task Operations",
      actions: ["TASK_CREATED", "TASK_STATUS_UPDATED", "TASK_DELETED"],
    },
    {
      label: "Leave Workflow",
      actions: ["LEAVE_APPLIED", "LEAVE_APPROVED", "LEAVE_REJECTED", "LEAVE_CANCELLED"],
    },
    {
      label: "Academic Clusters",
      actions: ["CLUSTER_CREATED", "CLUSTER_UPDATED", "CLUSTER_DELETED"],
    },
    {
      label: "Research & Publications",
      actions: ["PUBLICATION_CREATED", "PUBLICATION_DELETED"],
    },
    {
      label: "Evaluations & Governance",
      actions: [
        "EVALUATION_CREATED",
        "SCORING_CONFIG_UPDATED",
        "LEADERBOARD_SNAPSHOT_CREATED",
        "FACULTY_OF_MONTH_AWARDED",
        "NOTIFICATION_RULE_UPDATED",
      ],
    },
    {
      label: "System Operations",
      actions: ["JOB_MANUALLY_DISPATCHED", "WEBHOOK_TEST_DISPATCHED"],
    },
  ];

  const entityOptions = [
    "User",
    "Task",
    "LeaveApplication",
    "Cluster",
    "Publication",
    "Evaluation",
    "ScoringConfig",
    "NotificationRule",
    "SystemJob",
    "Webhook",
  ];

  const hasActiveFilters = Boolean(
    currentFilters.action || currentFilters.entity || currentFilters.actor
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* 1. Structured Filter Bar */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #E4E7EC",
          borderRadius: 12,
          padding: "18px 22px",
          boxShadow: "0 1px 3px rgba(16, 24, 40, 0.04)",
        }}
      >
        <form
          onSubmit={handleApplyFilters}
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: 14,
            flexWrap: "wrap",
          }}
        >
          {/* Action Select */}
          <div style={{ flex: 1, minWidth: 200 }}>
            <label
              htmlFor="action-select"
              style={{
                display: "block",
                fontSize: 12,
                fontWeight: 600,
                color: "#344054",
                marginBottom: 6,
              }}
            >
              Action Filter
            </label>
            <select
              id="action-select"
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                height: 38,
                borderRadius: 6,
                border: "1px solid #D0D5DD",
                fontSize: 13,
                color: "#17202A",
                backgroundColor: "#FFFFFF",
                boxSizing: "border-box",
                outline: "none",
              }}
            >
              <option value="">All Actions ({Object.keys(ACTION_METADATA).length}+ mapped)</option>
              {actionCategories.map((cat) => (
                <optgroup key={cat.label} label={cat.label}>
                  {cat.actions.map((act) => (
                    <option key={act} value={act}>
                      {ACTION_METADATA[act]?.label || act}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* Entity Type Select */}
          <div style={{ flex: 1, minWidth: 160 }}>
            <label
              htmlFor="entity-select"
              style={{
                display: "block",
                fontSize: 12,
                fontWeight: 600,
                color: "#344054",
                marginBottom: 6,
              }}
            >
              Target Entity
            </label>
            <select
              id="entity-select"
              value={selectedEntity}
              onChange={(e) => setSelectedEntity(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                height: 38,
                borderRadius: 6,
                border: "1px solid #D0D5DD",
                fontSize: 13,
                color: "#17202A",
                backgroundColor: "#FFFFFF",
                boxSizing: "border-box",
                outline: "none",
              }}
            >
              <option value="">All Entities</option>
              {entityOptions.map((ent) => (
                <option key={ent} value={ent}>
                  {ent}
                </option>
              ))}
            </select>
          </div>

          {/* Actor Search Input */}
          <div style={{ flex: 1.5, minWidth: 200 }}>
            <label
              htmlFor="actor-search"
              style={{
                display: "block",
                fontSize: 12,
                fontWeight: 600,
                color: "#344054",
                marginBottom: 6,
              }}
            >
              Actor Search
            </label>
            <input
              id="actor-search"
              type="text"
              value={actorSearch}
              onChange={(e) => setActorSearch(e.target.value)}
              placeholder="Search by name or email…"
              style={{
                width: "100%",
                padding: "8px 12px",
                height: 38,
                borderRadius: 6,
                border: "1px solid #D0D5DD",
                fontSize: 13,
                color: "#17202A",
                backgroundColor: "#FFFFFF",
                boxSizing: "border-box",
                outline: "none",
              }}
            />
          </div>

          {/* Filter Action Buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              type="submit"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                height: 38,
                padding: "0 16px",
                backgroundColor: "#173B67",
                color: "#FFFFFF",
                border: "none",
                borderRadius: 6,
                fontSize: 12.5,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              <Search size={13} />
              <span>Filter</span>
            </button>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  height: 38,
                  padding: "0 12px",
                  backgroundColor: "#FFFFFF",
                  color: "#475467",
                  border: "1px solid #D0D5DD",
                  borderRadius: 6,
                  fontSize: 12.5,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                <X size={13} />
                <span>Clear</span>
              </button>
            )}
          </div>
        </form>
      </div>

      {/* 2. Structured Ledger Table Card */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #E4E7EC",
          borderRadius: 12,
          overflow: "hidden",
          boxShadow: "0 1px 3px rgba(16, 24, 40, 0.04)",
        }}
      >
        {/* Table Toolbar */}
        <div
          style={{
            padding: "16px 22px",
            borderBottom: "1px solid #E4E7EC",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "#17202A" }}>
              Security Audit Trail
            </h2>
            <p style={{ fontSize: 13, color: "#667085", margin: "3px 0 0 0" }}>
              Immutable transaction timeline showing {total.toLocaleString()} total indexed events.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              type="button"
              onClick={handleExportCSV}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                borderRadius: 6,
                backgroundColor: "#FFFFFF",
                border: "1px solid #D0D5DD",
                color: "#344054",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              {exported ? (
                <>
                  <Check size={13} color="#166534" />
                  <span style={{ color: "#166534" }}>Exported CSV</span>
                </>
              ) : (
                <>
                  <Download size={13} />
                  <span>Export CSV</span>
                </>
              )}
            </button>

            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                padding: "4px 10px",
                backgroundColor: "#F2F4F7",
                color: "#17202A",
                borderRadius: 6,
                border: "1px solid #E4E7EC",
              }}
            >
              {logs.length} on this page
            </span>
          </div>
        </div>

        {/* Ledger Table */}
        {logs.length === 0 ? (
          <div style={{ padding: "50px 20px", textAlign: "center" }}>
            <Shield size={36} style={{ color: "#98A2B3", margin: "0 auto 10px" }} />
            <div style={{ fontSize: 14, fontWeight: 600, color: "#17202A" }}>
              No audit events found
            </div>
            <div style={{ fontSize: 13, color: "#667085", marginTop: 4 }}>
              Try adjusting your action, entity, or actor filters to see matching events.
            </div>
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
                  <th style={{ padding: "12px 20px" }}>Timestamp</th>
                  <th style={{ padding: "12px 16px" }}>Actor</th>
                  <th style={{ padding: "12px 16px" }}>Action</th>
                  <th style={{ padding: "12px 16px" }}>Entity Target</th>
                  <th style={{ padding: "12px 16px" }}>IP / Security Context</th>
                  <th style={{ padding: "12px 20px", textAlign: "right" }}>Payload State</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, idx) => {
                  const style = getActionStyle(log.action);
                  const hasPayload = Boolean(log.beforeState || log.afterState);

                  return (
                    <tr
                      key={log.id}
                      style={{
                        borderBottom:
                          idx < logs.length - 1 ? "1px solid #F2F4F7" : "none",
                        backgroundColor: log.isImpersonated
                          ? "rgba(192, 57, 43, 0.02)"
                          : undefined,
                      }}
                    >
                      {/* Timestamp */}
                      <td
                        style={{
                          padding: "14px 20px",
                          whiteSpace: "nowrap",
                          fontFamily: "var(--font-mono)",
                          fontSize: 12,
                          color: "#475467",
                        }}
                      >
                        {formatDate(log.timestamp)}
                        <span
                          style={{
                            display: "block",
                            fontSize: 11,
                            color: "#98A2B3",
                          }}
                        >
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      </td>

                      {/* Actor */}
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: "50%",
                              backgroundColor: "#F2F4F7",
                              border: "1px solid #E4E7EC",
                              color: "#17202A",
                              fontSize: 11,
                              fontWeight: 700,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            {getInitials(log.actor.name)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: "#17202A" }}>
                              {log.actor.name}
                            </div>
                            <div style={{ fontSize: 11.5, color: "#667085" }}>
                              {log.actor.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Action */}
                      <td style={{ padding: "14px 16px" }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "2px 8px",
                            borderRadius: 4,
                            fontSize: 11.5,
                            fontWeight: 600,
                            fontFamily: "var(--font-mono)",
                            backgroundColor: style.backgroundColor,
                            color: style.color,
                            border: `1px solid ${style.borderColor}`,
                          }}
                        >
                          {log.action}
                        </span>
                        <span
                          style={{
                            display: "block",
                            fontSize: 11,
                            color: "#667085",
                            marginTop: 2,
                          }}
                        >
                          {style.category}
                        </span>
                      </td>

                      {/* Entity Target */}
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ fontWeight: 600, color: "#17202A" }}>
                          {log.entityType}
                        </div>
                        <div
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: 11,
                            color: "#667085",
                          }}
                        >
                          #{log.entityId.slice(0, 10)}…
                        </div>
                      </td>

                      {/* IP / Security Context */}
                      <td style={{ padding: "14px 16px" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            flexWrap: "wrap",
                          }}
                        >
                          <span
                            style={{
                              fontFamily: "var(--font-mono)",
                              fontSize: 11.5,
                              color: log.ipAddress ? "#344054" : "#98A2B3",
                            }}
                          >
                            {log.ipAddress || "Internal"}
                          </span>

                          {log.isImpersonated && (
                            <span
                              style={{
                                fontSize: 10,
                                fontWeight: 700,
                                color: "#B42318",
                                backgroundColor: "#FEF3F2",
                                border: "1px solid #FECDCA",
                                padding: "1px 6px",
                                borderRadius: 4,
                              }}
                            >
                              IMPERSONATED
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Payload State / Inspect Button */}
                      <td style={{ padding: "14px 20px", textAlign: "right" }}>
                        {hasPayload ? (
                          <button
                            type="button"
                            onClick={() => setInspectingLog(log)}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                              padding: "4px 10px",
                              borderRadius: 6,
                              backgroundColor: "#FFFFFF",
                              border: "1px solid #D0D5DD",
                              color: "#173B67",
                              fontSize: 11.5,
                              fontWeight: 600,
                              cursor: "pointer",
                              transition: "all 0.15s ease",
                            }}
                          >
                            <FileCode size={12} />
                            <span>Inspect Diff</span>
                          </button>
                        ) : (
                          <span style={{ fontSize: 11.5, color: "#98A2B3" }}>—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div
            style={{
              padding: "14px 22px",
              borderTop: "1px solid #E4E7EC",
              backgroundColor: "#F7F8FA",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <span
              style={{
                fontSize: 12.5,
                color: "#667085",
                fontFamily: "var(--font-mono)",
              }}
            >
              Page {page} of {totalPages} ({total.toLocaleString()} total events)
            </span>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {page > 1 ? (
                <Link
                  href={`/admin/audit?page=${page - 1}${
                    currentFilters.action ? `&action=${currentFilters.action}` : ""
                  }${
                    currentFilters.entity ? `&entity=${currentFilters.entity}` : ""
                  }${currentFilters.actor ? `&actor=${currentFilters.actor}` : ""}`}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 6,
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #D0D5DD",
                    color: "#344054",
                    fontSize: 12,
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  ← Previous
                </Link>
              ) : (
                <span
                  style={{
                    padding: "6px 12px",
                    borderRadius: 6,
                    backgroundColor: "#F2F4F7",
                    border: "1px solid #E4E7EC",
                    color: "#98A2B3",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  ← Previous
                </span>
              )}

              {page < totalPages ? (
                <Link
                  href={`/admin/audit?page=${page + 1}${
                    currentFilters.action ? `&action=${currentFilters.action}` : ""
                  }${
                    currentFilters.entity ? `&entity=${currentFilters.entity}` : ""
                  }${currentFilters.actor ? `&actor=${currentFilters.actor}` : ""}`}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 6,
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #D0D5DD",
                    color: "#344054",
                    fontSize: 12,
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  Next →
                </Link>
              ) : (
                <span
                  style={{
                    padding: "6px 12px",
                    borderRadius: 6,
                    backgroundColor: "#F2F4F7",
                    border: "1px solid #E4E7EC",
                    color: "#98A2B3",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  Next →
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 3. State Diff Inspector Modal / Drawer */}
      {inspectingLog && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(16, 24, 40, 0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: 20,
          }}
          onClick={() => setInspectingLog(null)}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 12,
              border: "1px solid #E4E7EC",
              maxWidth: 720,
              width: "100%",
              maxHeight: "85vh",
              overflowY: "auto",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              padding: 24,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                borderBottom: "1px solid #F2F4F7",
                paddingBottom: 16,
                marginBottom: 20,
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 12,
                      fontWeight: 700,
                      color: "#173B67",
                      backgroundColor: "#F0F4F8",
                      border: "1px solid #D0DCE8",
                      padding: "2px 8px",
                      borderRadius: 4,
                    }}
                  >
                    {inspectingLog.action}
                  </span>
                  <span style={{ fontSize: 12, color: "#667085" }}>
                    · {formatDate(inspectingLog.timestamp)}{" "}
                    {new Date(inspectingLog.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "#17202A" }}>
                  State Transition Payload Inspector
                </h3>
                <p style={{ fontSize: 12.5, color: "#667085", margin: "2px 0 0" }}>
                  Dispatched by {inspectingLog.actor.name} ({inspectingLog.actor.email}) on{" "}
                  {inspectingLog.entityType} #{inspectingLog.entityId.slice(0, 12)}…
                </p>
              </div>

              <button
                type="button"
                onClick={() => setInspectingLog(null)}
                style={{
                  backgroundColor: "#F2F4F7",
                  border: "none",
                  borderRadius: 6,
                  width: 30,
                  height: 30,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "#475467",
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Context Meta Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: 12,
                backgroundColor: "#F7F8FA",
                border: "1px solid #E4E7EC",
                borderRadius: 8,
                padding: "12px 16px",
                marginBottom: 20,
                fontSize: 12,
              }}
            >
              <div>
                <span style={{ color: "#667085", display: "block" }}>Log ID:</span>
                <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600, color: "#17202A" }}>
                  {inspectingLog.id}
                </span>
              </div>
              <div>
                <span style={{ color: "#667085", display: "block" }}>IP Address:</span>
                <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600, color: "#17202A" }}>
                  {inspectingLog.ipAddress || "Internal System"}
                </span>
              </div>
              <div>
                <span style={{ color: "#667085", display: "block" }}>Security Session:</span>
                <span style={{ fontWeight: 600, color: inspectingLog.isImpersonated ? "#B42318" : "#166534" }}>
                  {inspectingLog.isImpersonated
                    ? `Impersonated (${inspectingLog.impersonatorId || "Unknown"})`
                    : "Standard Direct Session"}
                </span>
              </div>
            </div>

            {/* Diff View */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Before State */}
              {inspectingLog.beforeState && (
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#B42318",
                      marginBottom: 6,
                    }}
                  >
                    <span>− Previous State (beforeState)</span>
                  </div>
                  <pre
                    style={{
                      backgroundColor: "#FEF3F2",
                      border: "1px solid #FECDCA",
                      borderRadius: 6,
                      padding: "12px 14px",
                      fontSize: 12,
                      fontFamily: "var(--font-mono)",
                      color: "#912018",
                      overflowX: "auto",
                      margin: 0,
                    }}
                  >
                    {JSON.stringify(inspectingLog.beforeState, null, 2)}
                  </pre>
                </div>
              )}

              {/* After State */}
              {inspectingLog.afterState && (
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#027A48",
                      marginBottom: 6,
                    }}
                  >
                    <span>+ Result State (afterState)</span>
                  </div>
                  <pre
                    style={{
                      backgroundColor: "#F0FDF4",
                      border: "1px solid #BBF7D0",
                      borderRadius: 6,
                      padding: "12px 14px",
                      fontSize: 12,
                      fontFamily: "var(--font-mono)",
                      color: "#05603A",
                      overflowX: "auto",
                      margin: 0,
                    }}
                  >
                    {JSON.stringify(inspectingLog.afterState, null, 2)}
                  </pre>
                </div>
              )}

              {!inspectingLog.beforeState && !inspectingLog.afterState && (
                <div style={{ padding: "20px", textAlign: "center", color: "#667085", fontSize: 13 }}>
                  No state delta payload recorded for this event.
                </div>
              )}
            </div>

            {/* Close Button */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 24 }}>
              <button
                type="button"
                onClick={() => setInspectingLog(null)}
                style={{
                  padding: "8px 16px",
                  borderRadius: 6,
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #D0D5DD",
                  color: "#344054",
                  fontSize: 12.5,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
