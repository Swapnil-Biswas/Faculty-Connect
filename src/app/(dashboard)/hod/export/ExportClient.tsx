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
      icon: <Users size={20} />,
      action: () => downloadCSV("faculty_master_directory", data.faculty),
    },
    {
      id: "task_ledger",
      title: "Task Management & Progress Records",
      desc: "Complete history of tasks assigned, priorities, deadlines, assigners, assignees, and completion dates.",
      count: data.tasks.length,
      unit: "task records",
      icon: <CheckSquare size={20} />,
      action: () => downloadCSV("department_task_ledger", data.tasks),
    },
    {
      id: "leave_records",
      title: "Leave Applications & Sanctions Log",
      desc: "Audit trail of all faculty leave applications, start/end dates, approval statuses, and deciders.",
      count: data.leaves.length,
      unit: "leave requests",
      icon: <Calendar size={20} />,
      action: () => downloadCSV("faculty_leave_records", data.leaves),
    },
    {
      id: "evaluations_report",
      title: "Faculty Evaluations & Appraisals",
      desc: "Evaluations recorded by Cluster Heads across quality, contribution, initiative, and overall rating.",
      count: data.evaluations.length,
      unit: "evaluation logs",
      icon: <Award size={20} />,
      action: () => downloadCSV("faculty_evaluations_report", data.evaluations),
    },
    {
      id: "cluster_summary",
      title: "Clusters & Leadership Mapping",
      desc: "Cluster groupings, assigned Cluster Heads, and current active faculty distribution.",
      count: data.clusters.length,
      unit: "clusters",
      icon: <FolderGit2 size={20} />,
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
              className="card card-hover"
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: 20,
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 14 }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: "#1D1D1F",
                      color: "#FFFFFF",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {opt.icon}
                  </div>
                  <div>
                    <h3 className="card-title" style={{ margin: "0 0 4px 0" }}>{opt.title}</h3>
                    <span className="badge">
                      <span className="badge-dot" />
                      {opt.count} {opt.unit} verified
                    </span>
                  </div>
                </div>

                <p className="card-muted" style={{ margin: 0 }}>
                  {opt.desc}
                </p>
              </div>

              <div
                style={{
                  paddingTop: 16,
                  borderTop: "1px solid #E8E8ED",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "#86868B" }}>
                  FORMAT: RFC 4180
                </span>
                <button
                  onClick={opt.action}
                  className={isDone ? "btn-secondary btn-sm" : "btn-primary btn-sm"}
                  style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
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
