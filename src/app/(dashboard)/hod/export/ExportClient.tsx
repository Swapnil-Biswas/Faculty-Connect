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
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: 18 }}>
        {exportOptions.map((opt) => {
          const isDone = downloaded[opt.id];

          return (
            <div
              key={opt.id}
              className="card"
              style={{
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: 16,
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: `${opt.color}15`,
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
                    <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>{opt.title}</h3>
                    <div style={{ fontSize: 12, color: "hsl(var(--text-muted))" }}>
                      {opt.count} {opt.unit} available
                    </div>
                  </div>
                </div>

                <p style={{ fontSize: 13, color: "hsl(var(--text-secondary))", lineHeight: 1.5, margin: 0 }}>
                  {opt.desc}
                </p>
              </div>

              <div
                style={{
                  paddingTop: 14,
                  borderTop: "1px solid hsl(var(--border))",
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  onClick={opt.action}
                  className={isDone ? "btn-outline" : "btn-gradient"}
                  style={{
                    fontSize: 13,
                    padding: "8px 16px",
                    gap: 6,
                    background: isDone ? "hsl(var(--color-success) / 0.1)" : undefined,
                    color: isDone ? "hsl(var(--color-success))" : undefined,
                    borderColor: isDone ? "hsl(var(--color-success) / 0.3)" : undefined,
                  }}
                >
                  {isDone ? (
                    <>
                      <Check size={16} />
                      Downloaded!
                    </>
                  ) : (
                    <>
                      <Download size={16} />
                      Export to CSV
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
