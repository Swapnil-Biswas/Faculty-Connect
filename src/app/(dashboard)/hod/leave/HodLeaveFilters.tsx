"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Filter } from "lucide-react";

interface HodLeaveFiltersProps {
  clusters: { id: string; name: string }[];
  currentCluster?: string;
  currentStatus: string;
  counts: {
    PENDING: number;
    APPROVED: number;
    REJECTED: number;
    ALL: number;
  };
}

export function HodLeaveFilters({
  clusters,
  currentCluster = "",
  currentStatus = "PENDING",
  counts,
}: HodLeaveFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateStatus(status: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (status && status !== "ALL") {
      params.set("status", status);
    } else {
      params.delete("status");
    }
    router.push(`/hod/leave?${params.toString()}`);
  }

  function updateCluster(clusterId: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (clusterId) {
      params.set("cluster", clusterId);
    } else {
      params.delete("cluster");
    }
    router.push(`/hod/leave?${params.toString()}`);
  }

  const tabs = [
    { key: "PENDING", label: "Pending Reviews", count: counts.PENDING, urgent: counts.PENDING > 0 },
    { key: "APPROVED", label: "Approved", count: counts.APPROVED },
    { key: "REJECTED", label: "Rejected", count: counts.REJECTED },
    { key: "ALL", label: "All Decisions", count: counts.ALL },
  ];

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        flexWrap: "wrap",
      }}
    >
      {/* Status Filter Tabs */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          backgroundColor: "#F2F4F7",
          padding: 4,
          borderRadius: 8,
        }}
      >
        {tabs.map((tab) => {
          const isActive = (currentStatus || "PENDING") === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => updateStatus(tab.key)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                fontSize: 12.5,
                fontWeight: isActive ? 600 : 500,
                color: isActive ? "#17202A" : "#667085",
                backgroundColor: isActive ? "#FFFFFF" : "transparent",
                border: "none",
                borderRadius: 6,
                boxShadow: isActive ? "0 1px 3px rgba(0, 0, 0, 0.05)" : "none",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              <span>{tab.label}</span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  padding: "1px 6px",
                  borderRadius: 10,
                  backgroundColor:
                    tab.urgent && tab.key === "PENDING"
                      ? "rgba(183, 121, 31, 0.15)"
                      : isActive
                      ? "#F2F4F7"
                      : "rgba(0,0,0,0.05)",
                  color: tab.urgent && tab.key === "PENDING" ? "#B7791F" : "#667085",
                }}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Cluster Select */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: "#667085",
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <Filter size={13} /> Cluster:
        </span>
        <select
          value={currentCluster}
          onChange={(e) => updateCluster(e.target.value)}
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
          <option value="">All Academic Clusters</option>
          {clusters.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
