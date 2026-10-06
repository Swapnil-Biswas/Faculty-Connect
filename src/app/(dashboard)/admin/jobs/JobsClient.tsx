"use client";

import { useState, useTransition } from "react";
import {
  Clock,
  Play,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Award,
  Zap,
  ShieldCheck,
  Mail,
  Calendar,
  ChevronDown,
  ChevronUp,
  RotateCcw,
} from "lucide-react";
import {
  runOverdueTaskCheck,
  runLeaderboardSnapshot,
  runMonthlyAwardComputation,
  runEmailDigestJob,
  runComplianceIntegrityCheck,
  JobResult,
} from "@/actions/jobs";

interface LastRunInfo {
  timestamp: string;
  label: string;
  actorName?: string;
  isManual?: boolean;
}

interface JobLog {
  id: string;
  name: string;
  timestamp: string;
  durationMs: number;
  success: boolean;
  message: string;
  details?: Record<string, any>;
}

interface JobsClientProps {
  initialLastRuns: Record<string, LastRunInfo | null>;
}

export function JobsClient({ initialLastRuns }: JobsClientProps) {
  const [logs, setLogs] = useState<JobLog[]>([]);
  const [runningJob, setRunningJob] = useState<string | null>(null);
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());
  const [lastRuns, setLastRuns] = useState<Record<string, LastRunInfo | null>>(initialLastRuns);
  const [isPending, startTransition] = useTransition();

  const toggleDetails = (logId: string) => {
    setExpandedLogs((prev) => {
      const next = new Set(prev);
      if (next.has(logId)) {
        next.delete(logId);
      } else {
        next.add(logId);
      }
      return next;
    });
  };

  const handleRun = (jobKey: string, jobName: string, actionFn: () => Promise<JobResult>) => {
    if (isPending || runningJob !== null) return;

    setRunningJob(jobKey);
    const startTime = performance.now();

    startTransition(async () => {
      try {
        const result = await actionFn();
        const durationMs = Math.round(performance.now() - startTime);
        const timeString = new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });

        setLogs((prev) => [
          {
            id: Math.random().toString(36).substring(7),
            name: jobName,
            timestamp: timeString,
            durationMs,
            success: result.success,
            message: result.message,
            details: result.details,
          },
          ...prev.slice(0, 19),
        ]);

        if (result.success) {
          setLastRuns((prev) => ({
            ...prev,
            [jobKey]: {
              timestamp: "Just now",
              label: "Manual run by you",
              isManual: true,
            },
          }));
        }
      } catch (err: any) {
        const durationMs = Math.round(performance.now() - startTime);
        const timeString = new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });

        setLogs((prev) => [
          {
            id: Math.random().toString(36).substring(7),
            name: jobName,
            timestamp: timeString,
            durationMs,
            success: false,
            message: err.message || "Execution failed",
          },
          ...prev.slice(0, 19),
        ]);
      } finally {
        setRunningJob(null);
      }
    });
  };

  const jobDefinitions = [
    {
      key: "overdue_tasks",
      name: "Nightly Overdue Task Sweeper",
      category: "Task Operations",
      description:
        "Scans active tasks, flags past-deadline items as OVERDUE, and delivers high-priority alerts to assignees.",
      humanSchedule: "Daily · 00:00 (Midnight)",
      cronSchedule: "0 0 * * *",
      icon: <Clock size={18} color="#D97706" />,
      action: () => runOverdueTaskCheck(),
    },
    {
      key: "leaderboard_snapshot",
      name: "Monthly Leaderboard Snapshot",
      category: "Recognition & Scoring",
      description:
        "Generates immutable points ledger historical records and freezes rankings for the current calendar period.",
      humanSchedule: "Monthly · 1st of month at 01:00",
      cronSchedule: "0 1 1 * *",
      icon: <Award size={18} color="#173B67" />,
      action: () => runLeaderboardSnapshot(),
    },
    {
      key: "faculty_of_month",
      name: "Faculty of the Month Evaluator",
      category: "Recognition & Awards",
      description:
        "Applies tie-breaking rules and points weighting to designate the departmental Faculty of the Month.",
      humanSchedule: "Monthly · 1st of month at 02:00",
      cronSchedule: "0 2 1 * *",
      icon: <Zap size={18} color="#7C3AED" />,
      action: () => {
        const now = new Date();
        const prevMonth = now.getMonth() === 0 ? 12 : now.getMonth();
        const year = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
        return runMonthlyAwardComputation(prevMonth, year);
      },
    },
    {
      key: "email_digest",
      name: "Weekly Departmental Digest",
      category: "Communications",
      description:
        "Compiles weekly summary reports of pending tasks, leave queues, and research publications for HOD & Cluster Heads.",
      humanSchedule: "Weekly · Mondays at 08:00",
      cronSchedule: "0 8 * * 1",
      icon: <Mail size={18} color="#0284C7" />,
      action: () => runEmailDigestJob("WEEKLY_HOD_SUMMARY"),
    },
    {
      key: "compliance_check",
      name: "NBA / NAAC Compliance Validator",
      category: "Accreditation & SSR",
      description:
        "Verifies publication indexing, FSR ratios, and syllabus coverage criteria against current academic year targets.",
      humanSchedule: "Weekly · Sundays at 03:00",
      cronSchedule: "0 3 * * 0",
      icon: <ShieldCheck size={18} color="#16A34A" />,
      action: () => runComplianceIntegrityCheck(),
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* 5 Standard Job Cards Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
          gap: 20,
        }}
      >
        {jobDefinitions.map((job) => {
          const isCurrentRunning = runningJob === job.key && isPending;
          const lastRun = lastRuns[job.key];

          return (
            <div
              key={job.key}
              style={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #E4E7EC",
                borderRadius: 12,
                padding: "22px 24px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: 16,
                boxShadow: "0 1px 3px rgba(16, 24, 40, 0.04)",
              }}
            >
              <div>
                {/* Header: Icon, Title & Category */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: 12,
                    marginBottom: 10,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 8,
                        backgroundColor: "#F7F8FA",
                        border: "1px solid #E4E7EC",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {job.icon}
                    </div>
                    <div>
                      <h2
                        style={{
                          fontSize: 15,
                          fontWeight: 700,
                          margin: 0,
                          color: "#17202A",
                          lineHeight: 1.3,
                        }}
                      >
                        {job.name}
                      </h2>
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: "#475467",
                      backgroundColor: "#F2F4F7",
                      border: "1px solid #E4E7EC",
                      padding: "2px 8px",
                      borderRadius: 4,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {job.category}
                  </span>
                </div>

                {/* Description */}
                <p
                  style={{
                    fontSize: 13,
                    color: "#667085",
                    lineHeight: 1.5,
                    margin: "0 0 16px 0",
                  }}
                >
                  {job.description}
                </p>

                {/* Schedule Container */}
                <div
                  style={{
                    backgroundColor: "#F7F8FA",
                    border: "1px solid #E4E7EC",
                    borderRadius: 8,
                    padding: "10px 12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 10,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Calendar size={13} color="#667085" />
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#344054",
                      }}
                    >
                      {job.humanSchedule}
                    </span>
                  </div>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      color: "#667085",
                      backgroundColor: "#FFFFFF",
                      border: "1px solid #E4E7EC",
                      padding: "1px 6px",
                      borderRadius: 4,
                    }}
                  >
                    {job.cronSchedule}
                  </span>
                </div>

                {/* Real Last Run Telemetry */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    marginTop: 12,
                    fontSize: 11.5,
                    color: "#667085",
                  }}
                >
                  <Clock size={12} color="#98A2B3" />
                  {lastRun ? (
                    <span>
                      Last execution:{" "}
                      <strong style={{ color: "#17202A", fontWeight: 600 }}>
                        {lastRun.timestamp}
                      </strong>{" "}
                      <span style={{ color: "#98A2B3" }}>({lastRun.label})</span>
                    </span>
                  ) : (
                    <span style={{ color: "#98A2B3" }}>No recorded execution</span>
                  )}
                </div>
              </div>

              {/* Card Footer: Status & Run Button */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderTop: "1px solid #F2F4F7",
                  paddingTop: 16,
                }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    fontSize: 11.5,
                    fontWeight: 600,
                    padding: "2px 8px",
                    borderRadius: 4,
                    backgroundColor: "#F0FDF4",
                    color: "#166534",
                    border: "1px solid #BBF7D0",
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      backgroundColor: "#16A34A",
                      display: "inline-block",
                    }}
                  />
                  Scheduled
                </span>

                <button
                  type="button"
                  onClick={() => handleRun(job.key, job.name, job.action)}
                  disabled={isPending}
                  aria-label={`Run ${job.name} now`}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "7px 14px",
                    borderRadius: 6,
                    fontSize: 12.5,
                    fontWeight: 600,
                    color: "#FFFFFF",
                    backgroundColor: isCurrentRunning ? "#475467" : "#173B67",
                    border: "none",
                    cursor: isPending ? "not-allowed" : "pointer",
                    transition: "all 0.15s ease",
                    boxShadow: "0 1px 2px rgba(16, 24, 40, 0.05)",
                  }}
                >
                  {isCurrentRunning ? (
                    <>
                      <RefreshCw size={12} className="spin" />
                      <span>Executing...</span>
                    </>
                  ) : (
                    <>
                      <Play size={12} />
                      <span>Run Now</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Session Execution Telemetry Stream */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #E4E7EC",
          borderRadius: 12,
          padding: 24,
          boxShadow: "0 1px 3px rgba(16, 24, 40, 0.04)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 18,
            borderBottom: "1px solid #F2F4F7",
            paddingBottom: 14,
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <h2
              style={{
                fontSize: 16,
                fontWeight: 700,
                margin: 0,
                color: "#17202A",
              }}
            >
              Session Execution Telemetry
            </h2>
            <p
              style={{
                fontSize: 13,
                color: "#667085",
                margin: "4px 0 0 0",
              }}
            >
              Live chronological stream of manually dispatched routines in the current browser session. Durable records are persisted to the Security Audit Log.
            </p>
          </div>

          {logs.length > 0 && (
            <button
              type="button"
              onClick={() => setLogs([])}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
                color: "#344054",
                backgroundColor: "#FFFFFF",
                border: "1px solid #E4E7EC",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              <RotateCcw size={12} />
              <span>Clear Session Logs</span>
            </button>
          )}
        </div>

        {logs.length === 0 ? (
          <div
            style={{
              padding: "36px 20px",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Clock size={28} style={{ color: "#98A2B3", marginBottom: 10 }} />
            <div style={{ fontSize: 14, fontWeight: 600, color: "#17202A" }}>
              Ready for manual execution
            </div>
            <div style={{ fontSize: 13, color: "#667085", marginTop: 4 }}>
              Click &quot;Run Now&quot; on any automation card above to trigger an immediate background sweep.
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {logs.map((log) => {
              const isExpanded = expandedLogs.has(log.id);

              return (
                <div
                  key={log.id}
                  style={{
                    padding: "14px 18px",
                    borderRadius: 8,
                    border: `1px solid ${
                      log.success ? "#BBF7D0" : "rgba(192, 57, 43, 0.25)"
                    }`,
                    borderLeft: `3px solid ${log.success ? "#198754" : "#C0392B"}`,
                    backgroundColor: log.success
                      ? "rgba(25, 135, 84, 0.02)"
                      : "rgba(192, 57, 43, 0.02)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: 8,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      {log.success ? (
                        <CheckCircle2 size={16} color="#198754" />
                      ) : (
                        <AlertCircle size={16} color="#C0392B" />
                      )}
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: 13.5,
                          color: "#17202A",
                        }}
                      >
                        {log.name}
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          padding: "1px 6px",
                          borderRadius: 4,
                          backgroundColor: log.success ? "#F0FDF4" : "#FEF2F2",
                          color: log.success ? "#166534" : "#991B1B",
                          border: `1px solid ${log.success ? "#BBF7D0" : "#FECACA"}`,
                        }}
                      >
                        {log.success ? "Success" : "Failed"}
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          fontFamily: "var(--font-mono)",
                          color: "#667085",
                          backgroundColor: "#F2F4F7",
                          padding: "1px 6px",
                          borderRadius: 4,
                        }}
                      >
                        {log.durationMs}ms
                      </span>
                    </div>

                    <span
                      style={{
                        fontSize: 12,
                        color: "#667085",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      {log.timestamp}
                    </span>
                  </div>

                  <p
                    style={{
                      margin: 0,
                      fontSize: 13,
                      color: "#344054",
                      lineHeight: 1.45,
                    }}
                  >
                    {log.message}
                  </p>

                  {log.details && (
                    <div>
                      <button
                        type="button"
                        onClick={() => toggleDetails(log.id)}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          fontSize: 11.5,
                          fontWeight: 600,
                          color: "#2F6FED",
                          backgroundColor: "transparent",
                          border: "none",
                          padding: 0,
                          cursor: "pointer",
                          marginTop: 4,
                        }}
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp size={12} />
                            <span>Hide Payload Details</span>
                          </>
                        ) : (
                          <>
                            <ChevronDown size={12} />
                            <span>Show Payload Details</span>
                          </>
                        )}
                      </button>

                      {isExpanded && (
                        <pre
                          style={{
                            margin: "8px 0 0",
                            padding: "10px 14px",
                            borderRadius: 6,
                            backgroundColor: "#F7F8FA",
                            border: "1px solid #E4E7EC",
                            fontSize: 11.5,
                            fontFamily: "var(--font-mono)",
                            color: "#17202A",
                            overflowX: "auto",
                          }}
                        >
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
