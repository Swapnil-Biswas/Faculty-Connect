"use client";

import { useState } from "react";
import { Download, FileSpreadsheet, Users, CheckSquare, Calendar, Award, FolderGit2, Check } from "lucide-react";

interface ExportDataProps {
  data: {
    faculty: Record<string, any>[];
    tasks: Record<string, any>[];
    leaves: Record<string, any>[];
    evaluations: Record<string, any>[];
    clusters: Record<string, any>[];
  };
}

export function ExportClient({ data }: ExportDataProps) {
  const [downloaded, setDownloaded] = useState<Record<string, boolean>>({});

  function downloadCSV(filename: string, rows: Record<string, any>[]) {
    if (!rows || rows.length === 0) {
      alert("No data available to export in this category.");
      return;
    }

    const headers = Object.keys(rows[0]);
    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        headers
          .map((h) => {
            const val = row[h] == null ? "" : String(row[h]);
            return `"${val.replace(/"/g, '""')}"`;
          })
          .join(",")
      ),
    ].join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloaded((prev) => ({ ...prev, [filename]: true }));
    setTimeout(() => {
      setDownloaded((prev) => ({ ...prev, [filename]: false }));
    }, 2500);
  }

  const exportOptions = [
    {
      id: "faculty_master",
      title: "Faculty Master Directory",
      desc: "Comprehensive roster with user roles, official designations, emails, and joining dates for NBA Criterion 5.",
      count: data.faculty.length,
      unit: "faculty members",
      icon: <Users size={22} />,
      color: "hsl(var(--color-primary))",
      action: () => downloadCSV("faculty_master_directory", data.faculty),
    },
    {
      id: "task_ledger",
      title: "Task Management & Progress Records",
      desc: "Complete history of tasks assigned, priorities, deadlines, assigners, assignees, and completion dates.",
      count: data.tasks.length,
      unit: "task records",
      icon: <CheckSquare size={22} />,
      color: "hsl(var(--color-success))",
      action: () => downloadCSV("department_task_ledger", data.tasks),
    },
    {
      id: "leave_records",
      title: "Leave Applications & Sanctions Log",
      desc: "Audit trail of all faculty leave applications, start/end dates, approval statuses, and deciders.",
      count: data.leaves.length,
      unit: "leave requests",
      icon: <Calendar size={22} />,
      color: "hsl(var(--color-info))",
      action: () => downloadCSV("faculty_leave_records", data.leaves),
    },
    {
      id: "evaluations_report",
      title: "Faculty Evaluations & Appraisals",
      desc: "Evaluations recorded by Cluster Heads across quality, contribution, initiative, and overall rating.",
      count: data.evaluations.length,
      unit: "evaluation logs",
      icon: <Award size={22} />,
      color: "#F59E0B",
      action: () => downloadCSV("faculty_evaluations_report", data.evaluations),
    },
    {
      id: "cluster_summary",
      title: "Clusters & Leadership Mapping",
      desc: "Cluster groupings, assigned Cluster Heads, and current active faculty distribution.",
      count: data.clusters.length,
      unit: "clusters",
      icon: <FolderGit2 size={22} />,
      color: "#8B5CF6",
      action: () => downloadCSV("cluster_leadership_summary", data.clusters),
    },
  ];

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: 20 }}>
        {exportOptions.map((opt) => {
          const isDone = downloaded[opt.id];

          return (
            <div
              key={opt.id}
              style={{
                background: "#0E121B",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: 12,
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: 20,
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
                transition: "border-color 0.2s ease, transform 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.18)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 14 }}>
                  <div
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: 10,
                      background: "rgba(255, 255, 255, 0.03)",
                      border: `1px solid ${opt.color}35`,
                      color: opt.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {opt.icon}
                  </div>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 4px 0", color: "#F8FAFC" }}>{opt.title}</h3>
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        fontFamily: "var(--font-mono)",
                        fontSize: 11,
                        color: opt.color,
                        background: "rgba(255, 255, 255, 0.03)",
                        padding: "2px 8px",
                        borderRadius: 4,
                        border: "1px solid rgba(255, 255, 255, 0.06)",
                      }}
                    >
                      <span>●</span> {opt.count} {opt.unit} verified
                    </div>
                  </div>
                </div>

                <p style={{ fontSize: 13, color: "#94A3B8", lineHeight: 1.6, margin: 0 }}>
                  {opt.desc}
                </p>
              </div>

              <div
                style={{
                  paddingTop: 16,
                  borderTop: "1px solid rgba(255, 255, 255, 0.06)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "#64748B" }}>
                  FORMAT: RFC 4180
                </span>
                <button
                  onClick={opt.action}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 12,
                    fontFamily: "var(--font-mono)",
                    fontWeight: 700,
                    padding: "9px 16px",
                    borderRadius: 8,
                    cursor: "pointer",
                    background: isDone
                      ? "rgba(34, 197, 94, 0.15)"
                      : "linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(245, 158, 11, 0.05) 100%)",
                    color: isDone ? "#22C55E" : "#F59E0B",
                    border: isDone
                      ? "1px solid rgba(34, 197, 94, 0.35)"
                      : "1px solid rgba(245, 158, 11, 0.3)",
                    boxShadow: isDone ? "none" : "0 0 12px rgba(245, 158, 11, 0.15)",
                    transition: "all 0.2s ease",
                  }}
                >
                  {isDone ? (
                    <>
                      <Check size={14} /> EXPORTED (.CSV)
                    </>
                  ) : (
                    <>
                      <Download size={14} /> EXPORT TO CSV
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
