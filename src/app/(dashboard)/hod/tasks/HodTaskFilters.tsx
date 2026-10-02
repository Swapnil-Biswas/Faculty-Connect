"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Filter, X } from "lucide-react";

interface HodTaskFiltersProps {
  clusters: { id: string; name: string }[];
  currentCluster?: string;
  currentStatus?: string;
  currentPriority?: string;
}

export function HodTaskFilters({
  clusters,
  currentCluster = "",
  currentStatus = "",
  currentPriority = "",
}: HodTaskFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "ALL") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/hod/tasks?${params.toString()}`);
  }

  function resetFilters() {
    router.push("/hod/tasks");
  }

  const hasActiveFilters = Boolean(currentCluster || currentStatus || currentPriority);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        flexWrap: "wrap",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontSize: 12,
          fontWeight: 600,
          color: "#667085",
        }}
      >
        <Filter size={14} />
        <span>FILTER:</span>
      </div>

      {/* Cluster Select */}
      <select
        value={currentCluster}
        onChange={(e) => updateFilter("cluster", e.target.value)}
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
        }}
      >
        <option value="">All Clusters</option>
        {clusters.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      {/* Status Select */}
      <select
        value={currentStatus}
        onChange={(e) => updateFilter("status", e.target.value)}
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
        }}
      >
        <option value="">All Statuses</option>
        <option value="OPEN">Open</option>
        <option value="IN_PROGRESS">In Progress</option>
        <option value="COMPLETED">Completed</option>
        <option value="OVERDUE">Overdue</option>
      </select>

      {/* Priority Select */}
      <select
        value={currentPriority}
        onChange={(e) => updateFilter("priority", e.target.value)}
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
        }}
      >
        <option value="">All Priorities</option>
        <option value="LOW">Low</option>
        <option value="MEDIUM">Medium</option>
        <option value="HIGH">High</option>
        <option value="CRITICAL">Critical</option>
      </select>

      {hasActiveFilters && (
        <button
          onClick={resetFilters}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            fontSize: 12,
            fontWeight: 500,
            padding: "6px 10px",
            height: 36,
            backgroundColor: "transparent",
            border: "1px solid #E4E7EC",
            borderRadius: 6,
            color: "#667085",
            cursor: "pointer",
          }}
        >
          <X size={13} />
          Reset
        </button>
      )}
    </div>
  );
}
