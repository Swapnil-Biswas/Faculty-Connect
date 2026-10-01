"use client";

import { useActionState } from "react";
import { updateTaskStatus } from "@/actions/tasks";
import { TaskStatus } from "@prisma/client";

interface UpdateTaskStatusFormProps {
  taskId: string;
  currentStatus: TaskStatus;
}

const NEXT_STATUSES: Partial<Record<TaskStatus, TaskStatus[]>> = {
  OPEN: [TaskStatus.IN_PROGRESS],
  IN_PROGRESS: [TaskStatus.COMPLETED],
  OVERDUE: [TaskStatus.IN_PROGRESS, TaskStatus.COMPLETED],
};

export function UpdateTaskStatusForm({ taskId, currentStatus }: UpdateTaskStatusFormProps) {
  const [state, formAction, isPending] = useActionState(updateTaskStatus, { success: false });

  const nextStatuses = NEXT_STATUSES[currentStatus] ?? [];
  if (nextStatuses.length === 0) {
    return (
      <span style={{ fontSize: 12, color: "#667085", fontStyle: "italic" }}>
        No actions
      </span>
    );
  }

  return (
    <form action={formAction} style={{ display: "inline-block", textAlign: "right" }}>
      <input type="hidden" name="taskId" value={taskId} />

      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 6 }}>
        <select
          name="status"
          style={{
            height: 32,
            fontSize: 12,
            padding: "4px 8px",
            border: "1px solid #E4E7EC",
            borderRadius: 4,
            backgroundColor: "#FFFFFF",
            color: "#17202A",
            minWidth: 140,
          }}
          defaultValue={nextStatuses[0]}
          required
        >
          {nextStatuses.map((s) => (
            <option key={s} value={s}>
              Mark as {s.replace("_", " ")}
            </option>
          ))}
        </select>

        <button
          type="submit"
          disabled={isPending}
          className="btn-primary"
          style={{
            height: 32,
            padding: "0 12px",
            fontSize: 12,
            fontWeight: 500,
            whiteSpace: "nowrap",
          }}
        >
          {isPending ? "Updating..." : "Update"}
        </button>
      </div>

      {state.error && (
        <div style={{ fontSize: 11, color: "#C0392B", marginTop: 4 }}>
          {state.error}
        </div>
      )}
    </form>
  );
}
