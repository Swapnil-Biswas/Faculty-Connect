"use client";

import { useRouter, useSearchParams } from "next/navigation";

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
      <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "#6E6E73" }}>FILTER:</span>
      <select
        value={currentAction ?? "ALL"}
        className="select"
        style={{ fontSize: 12, padding: "6px 12px", height: 34, width: "auto" }}
        onChange={(e) => handleChange(e.target.value)}
      >
        {actionTypes.map((a) => (
          <option key={a} value={a}>
            {a.replace(/_/g, " ")}
          </option>
        ))}
      </select>
    </div>
  );
}
