"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Filter } from "lucide-react";

const ACTION_LABELS: Record<string, string> = {
  ALL: "All Logged Actions",
  TASK_CREATED: "Task Created",
  TASK_UPDATED: "Task Updated",
  TASK_COMPLETED: "Task Completed",
  LEAVE_APPLIED: "Leave Applied",
  LEAVE_APPROVED: "Leave Approved",
  LEAVE_REJECTED: "Leave Rejected",
  EVALUATION_SUBMITTED: "Evaluation Submitted",
  USER_ROLE_UPDATED: "Role Updated",
  CLUSTER_CREATED: "Cluster Created",
};

export function HodAuditFilters({
  actionTypes,
  currentAction,
}: {
  actionTypes: string[];
  currentAction?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleChange(val: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (val && val !== "ALL") {
      params.set("action", val);
    } else {
      params.delete("action");
    }
    router.push(`/hod/audit?${params.toString()}`);
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: "#667085",
          display: "flex",
          alignItems: "center",
          gap: 5,
        }}
      >
        <Filter size={13} /> ACTION FILTER:
      </span>
      <select
        value={currentAction ?? "ALL"}
        onChange={(e) => handleChange(e.target.value)}
        style={{
          fontSize: 12.5,
          fontWeight: 500,
          padding: "6px 12px",
          height: 36,
          backgroundColor: "#FFFFFF",
          border: "1px solid #E4E7EC",
          borderRadius: 6,
          color: "#17202A",
          cursor: "pointer",
          outline: "none",
        }}
      >
        {actionTypes.map((a) => (
          <option key={a} value={a}>
            {ACTION_LABELS[a] || a.replace(/_/g, " ")}
          </option>
        ))}
      </select>
    </div>
  );
}
