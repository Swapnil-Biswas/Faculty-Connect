"use client";

import { useState } from "react";
import { Download, Check, FileSpreadsheet, Users, CheckSquare, Calendar, Award, FolderGit2, ShieldCheck } from "lucide-react";

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
      id: "faculty_master_directory",
      title: "Faculty Master Directory",
      desc: "Complete faculty roster with user roles, official academic designations, institutional emails, and joining dates.",
      count: data.faculty.length,
      unit: "faculty members",
      icon: <Users size={16} color="#173B67" />,
      action: () => downloadCSV("faculty_master_directory", data.faculty),
    },
    {
      id: "department_task_ledger",
      title: "Task Management & Deliverables Ledger",
      desc: "Complete record of departmental deliverables, priority levels, assignment hierarchy, deadlines, and completion timestamps.",
      count: data.tasks.length,
      unit: "task records",
      icon: <CheckSquare size={16} color="#173B67" />,
      action: () => downloadCSV("department_task_ledger", data.tasks),
    },
    {
      id: "faculty_leave_records",
      title: "Leave Applications & Sanctions Log",
      desc: "Chronological log of faculty leave requests, date spans, approval statuses, cluster associations, and approving authorities.",
      count: data.leaves.length,
      unit: "leave requests",
      icon: <Calendar size={16} color="#173B67" />,
      action: () => downloadCSV("faculty_leave_records", data.leaves),
    },
    {
      id: "faculty_evaluations_report",
      title: "Faculty Appraisals & Evaluations Report",
      desc: "Evaluation assessments recorded by Cluster Heads across quality, contribution, initiative, and overall rating benchmarks.",
      count: data.evaluations.length,
      unit: "evaluation logs",
      icon: <Award size={16} color="#173B67" />,
      action: () => downloadCSV("faculty_evaluations_report", data.evaluations),
    },
    {
      id: "cluster_leadership_summary",
      title: "Cluster Organization & Leadership Mapping",
      desc: "Academic cluster groupings, assigned Cluster Heads, and current active faculty distribution roster.",
      count: data.clusters.length,
      unit: "clusters",
      icon: <FolderGit2 size={16} color="#173B67" />,
      action: () => downloadCSV("cluster_leadership_summary", data.clusters),
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Institutional Table Container */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #E4E7EC",
          borderRadius: 8,
          overflow: "hidden",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.02)",
        }}
      >
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid #E4E7EC",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
            backgroundColor: "#FFFFFF",
          }}
        >
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: "#17202A", margin: 0 }}>
              Institutional Data Export Ledger
            </h2>
            <p style={{ fontSize: 13, color: "#667085", margin: "2px 0 0 0" }}>
              Select a departmental dataset to generate an RFC 4180 compliant CSV archive.
            </p>
          </div>
          <span
            style={{
              fontSize: 12,
              fontWeight: 500,
              padding: "4px 10px",
              backgroundColor: "#F2F4F7",
              color: "#17202A",
              borderRadius: 6,
              border: "1px solid #E4E7EC",
            }}
          >
            {exportOptions.length} Verified Datasets
          </span>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #E4E7EC", backgroundColor: "#F7F8FA" }}>
                <th
                  style={{
                    padding: "12px 20px",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#667085",
                  }}
                >
                  DATASET
                </th>
                <th
                  style={{
                    padding: "12px 20px",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#667085",
                    whiteSpace: "nowrap",
                  }}
                >
                  SCOPE & RECORDS
                </th>
                <th
                  style={{
                    padding: "12px 20px",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#667085",
                    textAlign: "center",
                    width: 90,
                  }}
                >
                  FORMAT
                </th>
                <th
                  style={{
                    padding: "12px 20px",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#667085",
                    textAlign: "right",
                    minWidth: 170,
                  }}
                >
                  ACTION
                </th>
              </tr>
            </thead>
            <tbody>
              {exportOptions.map((opt) => {
                const isDone = downloaded[opt.id];

                return (
                  <tr
                    key={opt.id}
                    style={{
                      borderBottom: "1px solid #F2F4F7",
                      transition: "background-color 0.15s ease",
                    }}
                  >
                    <td style={{ padding: "16px 20px" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 6,
                            backgroundColor: "#F2F4F7",
                            border: "1px solid #E4E7EC",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            marginTop: 2,
                          }}
                        >
                          {opt.icon}
                        </div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: "#17202A", marginBottom: 3 }}>
                            {opt.title}
                          </div>
                          <div style={{ fontSize: 13, color: "#667085", lineHeight: 1.45, maxWidth: 640 }}>
                            {opt.desc}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: "16px 20px", whiteSpace: "nowrap" }}>
                      <span
                        style={{
                          fontSize: 12.5,
                          fontWeight: 500,
                          color: "#17202A",
                          backgroundColor: "#F7F8FA",
                          padding: "4px 8px",
                          borderRadius: 6,
                          border: "1px solid #E4E7EC",
                        }}
                      >
                        {opt.count} {opt.unit}
                      </span>
                    </td>

                    <td style={{ padding: "16px 20px", textAlign: "center" }}>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          padding: "3px 8px",
                          backgroundColor: "#F2F4F7",
                          color: "#667085",
                          borderRadius: 4,
                          border: "1px solid #E4E7EC",
                        }}
                      >
                        CSV
                      </span>
                    </td>

                    <td style={{ padding: "16px 20px", textAlign: "right" }}>
                      <button
                        onClick={opt.action}
                        disabled={isDone}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "7px 14px",
                          fontSize: 12.5,
                          fontWeight: 600,
                          borderRadius: 6,
                          cursor: isDone ? "default" : "pointer",
                          transition: "all 0.15s ease",
                          border: isDone ? "1px solid rgba(25, 135, 84, 0.3)" : "none",
                          backgroundColor: isDone ? "rgba(25, 135, 84, 0.1)" : "#173B67",
                          color: isDone ? "#198754" : "#FFFFFF",
                        }}
                      >
                        {isDone ? (
                          <>
                            <Check size={14} /> EXPORTED (.CSV)
                          </>
                        ) : (
                          <>
                            <Download size={14} /> Export CSV
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Institutional Compliance Notice */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "14px 18px",
          backgroundColor: "#FFFFFF",
          border: "1px solid #E4E7EC",
          borderRadius: 8,
          fontSize: 12.5,
          color: "#667085",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.02)",
        }}
      >
        <ShieldCheck size={18} color="#173B67" style={{ flexShrink: 0 }} />
        <span>
          All exported files are formatted in strict compliance with RFC 4180 standard quotation and UTF-8 encoding.
          Timestamps in downloaded files are resolved dynamically to the current administrative snapshot date.
        </span>
      </div>
    </div>
  );
}
