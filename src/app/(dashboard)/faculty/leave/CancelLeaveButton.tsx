"use client";

import { useTransition } from "react";
import { cancelLeave } from "@/actions/leave";
import { useRouter } from "next/navigation";

export function CancelLeaveButton({ leaveId }: { leaveId: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleCancel() {
    if (!confirm("Are you sure you want to cancel this leave application?")) return;
    startTransition(async () => {
      const res = await cancelLeave(leaveId);
      if (res.success) router.refresh();
      else alert(res.error || "Failed to cancel leave request.");
    });
  }

  return (
    <button
      onClick={handleCancel}
      disabled={isPending}
      className="btn-outline"
      style={{
        padding: "4px 10px",
        fontSize: 12,
        color: "#C0392B",
        borderColor: "#FECDCA",
        backgroundColor: "#FFFFFF",
        cursor: isPending ? "not-allowed" : "pointer",
        opacity: isPending ? 0.6 : 1,
      }}
    >
      {isPending ? "Cancelling..." : "Cancel"}
    </button>
  );
}
