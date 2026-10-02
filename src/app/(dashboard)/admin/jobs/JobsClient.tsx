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
  Server,
  ShieldCheck,
  Mail,
} from "lucide-react";
import {
  runOverdueTaskCheck,
  runLeaderboardSnapshot,
  runMonthlyAwardComputation,
  runEmailDigestJob,
  runComplianceIntegrityCheck,
  JobResult,
} from "@/actions/jobs";

interface JobLog {
  id: string;
  name: string;
  timestamp: string;
  success: boolean;
  message: string;
  details?: Record<string, any>;
}

export function JobsClient() {
  const [logs, setLogs] = useState<JobLog[]>([]);
  const [runningJob, setRunningJob] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleRun = (jobKey: string, jobName: string, actionFn: () => Promise<JobResult>) => {
    setRunningJob(jobKey);
    startTransition(async () => {
      try {
        const result = await actionFn();
        setLogs((prev) => [
          {
            id: Math.random().toString(36).substring(7),
            name: jobName,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
            success: result.success,
            message: result.message,
            details: result.details,
          },
          ...prev.slice(0, 19),
        ]);
      } catch (err: any) {
        setLogs((prev) => [
          {
            id: Math.random().toString(36).substring(7),
            name: jobName,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
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
      description: "Scans active tasks, flags past-deadline items as OVERDUE, and delivers high-priority alerts to assignees.",
      cronSchedule: "0 0 * * * (Every midnight)",
      icon: <Clock size={20} color="#d97706" />,
      action: () => runOverdueTaskCheck(),
    },
    {
      key: "leaderboard_snapshot",
      name: "Monthly Leaderboard Snapshot",
      description: "Generates immutable points ledger historical records and freezes rankings for the current calendar period.",
      cronSchedule: "0 1 1 * * (1st of every month)",
      icon: <Award size={20} color="var(--grey-800)" />,
      action: () => runLeaderboardSnapshot(),
    },
    {
      key: "faculty_of_month",
      name: "Faculty of the Month Evaluator",
      description: "Applies tie-breaking rules and points weighting to designate the departmental Faculty of the Month.",
      cronSchedule: "0 2 1 * * (1st of every month)",
      icon: <Zap size={20} color="#7c3aed" />,
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
      description: "Compiles weekly summary reports of pending tasks, leave queues, and research publications for HOD & Cluster Heads.",
      cronSchedule: "0 8 * * 1 (Every Monday 8 AM)",
      icon: <Mail size={20} color="#0284c7" />,
      action: () => runEmailDigestJob("WEEKLY_HOD_SUMMARY"),
    },
    {
      key: "compliance_check",
      name: "NBA / NAAC Compliance Validator",
      description: "Verifies publication indexing, FSR ratios, and syllabus coverage criteria against current academic year targets.",
      cronSchedule: "0 3 * * 0 (Every Sunday 3 AM)",
      icon: <ShieldCheck size={20} color="#16a34a" />,
      action: () => runComplianceIntegrityCheck(),
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Jobs Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: 20 }}>
        {jobDefinitions.map((job) => {
          const isCurrentRunning = runningJob === job.key && isPending;
          return (
            <div
              key={job.key}
              className="card card-hover"
              style={{
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: 18,
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 14 }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 10,
                      background: "var(--grey-50)",
                      border: "1px solid var(--grey-200)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {job.icon}
                  </div>
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 4px 0", color: "var(--grey-900)" }}>{job.name}</h3>
                    <span style={{ fontSize: 11, color: "var(--grey-500)", fontFamily: "var(--font-mono)" }}>
                      // {job.cronSchedule}
                    </span>
                  </div>
                </div>

                <p className="card-muted" style={{ margin: 0 }}>
                  {job.description}
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderTop: "1px solid var(--grey-100)",
                  paddingTop: 16,
                }}
              >
                <span className="badge">
                  ● DAEMON READY
                </span>
                <button
                  type="button"
                  onClick={() => handleRun(job.key, job.name, job.action)}
                  disabled={isPending}
                  className="btn-primary btn-sm"
                  style={{ cursor: isPending ? "not-allowed" : "pointer" }}
                >
                  {isCurrentRunning ? (
                    <>
                      <RefreshCw size={12} className="spin" style={{ marginRight: 6 }} /> EXECUTING...
                    </>
                  ) : (
                    <>
                      <Play size={12} style={{ marginRight: 6 }} /> RUN NOW
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Execution Audit Log Stream */}
      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, borderBottom: "1px solid var(--grey-100)", paddingBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Server size={18} color="var(--grey-800)" />
            <div>
              <span className="section-eyebrow" style={{ marginBottom: 2 }}>
                // TERMINAL CONSOLE
              </span>
              <h2 style={{ fontSize: 16, fontWeight: 700, margin: "2px 0 0", color: "var(--grey-900)" }}>
                Maintenance Job Telemetry Stream
              </h2>
            </div>
          </div>
          {logs.length > 0 && (
            <button
              type="button"
              onClick={() => setLogs([])}
              className="btn-secondary btn-sm"
            >
              CLEAR CONSOLE
            </button>
          )}
        </div>

        {logs.length === 0 ? (
          <div className="empty">
            <Clock size={28} style={{ margin: "0 auto 10px", color: "var(--grey-400)" }} />
            <div className="empty-title">Ready for job dispatch</div>
            <div className="empty-body">Click &quot;RUN NOW&quot; on any job above to trigger immediate background sweep.</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {logs.map((log) => (
              <div
                key={log.id}
                style={{
                  padding: "14px 18px",
                  borderRadius: 10,
                  border: `1px solid ${
                    log.success ? "rgba(22, 163, 74, 0.25)" : "rgba(220, 38, 38, 0.25)"
                  }`,
                  background: log.success ? "rgba(22, 163, 74, 0.04)" : "rgba(220, 38, 38, 0.04)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {log.success ? (
                      <CheckCircle2 size={16} color="#16a34a" />
                    ) : (
                      <AlertCircle size={16} color="#dc2626" />
                    )}
                    <span style={{ fontWeight: 700, fontSize: 13.5, color: "var(--grey-900)" }}>{log.name}</span>
                  </div>
                  <span style={{ fontSize: 11, color: "var(--grey-500)", fontFamily: "var(--font-mono)" }}>
                    {log.timestamp}
                  </span>
                </div>

                <p style={{ margin: 0, fontSize: 13, color: "var(--grey-700)", fontFamily: "var(--font-mono)" }}>
                  {log.message}
                </p>

                {log.details && (
                  <pre
                    style={{
                      margin: "4px 0 0",
                      padding: "10px 14px",
                      borderRadius: 8,
                      background: "var(--grey-50)",
                      fontSize: 11,
                      fontFamily: "var(--font-mono)",
                      color: "var(--grey-800)",
                      overflowX: "auto",
                      border: "1px solid var(--grey-200)",
                    }}
                  >
                    {JSON.stringify(log.details, null, 2)}
                  </pre>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
