"use client";

import { useState, useTransition } from "react";
import {
  Clock,
  Play,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Mail,
  Award,
  ShieldCheck,
  AlertTriangle,
  Server,
  Zap,
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
      icon: <Clock size={20} className="text-amber-500" />,
      action: () => runOverdueTaskCheck(),
    },
    {
      key: "leaderboard_snapshot",
      name: "Monthly Leaderboard Snapshot",
      description: "Generates immutable points ledger historical records and freezes rankings for the current calendar period.",
      cronSchedule: "0 1 1 * * (1st of every month)",
      icon: <Award size={20} className="text-indigo-500" />,
      action: () => runLeaderboardSnapshot(),
    },
    {
      key: "faculty_of_month",
      name: "Faculty of the Month Evaluator",
      description: "Applies tie-breaking rules and points weighting to designate the departmental Faculty of the Month.",
      cronSchedule: "0 2 1 * * (1st of every month)",
      icon: <Zap size={20} className="text-purple-500" />,
      action: () => {
        const now = new Date();
        const prevMonth = now.getMonth() === 0 ? 12 : now.getMonth();
        const year = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
        return runMonthlyAwardComputation(prevMonth, year);
      },
    },
    {
      key: "daily_email_digest",
      name: "Daily Task Notification Digest",
      description: "Assembles daily summary notifications and delivers pending task alerts to all assigned faculty.",
      cronSchedule: "0 8 * * * (Daily at 8:00 AM)",
      icon: <Mail size={20} className="text-sky-500" />,
      action: () => runEmailDigestJob("DAILY_TASK_DIGEST"),
    },
    {
      key: "weekly_summary",
      name: "Weekly Department Performance Digest",
      description: "Aggregates weekly task velocities, completed milestones, and pending leave counts into HOD summary.",
      cronSchedule: "0 9 * * 1 (Mondays at 9:00 AM)",
      icon: <Server size={20} className="text-emerald-500" />,
      action: () => runEmailDigestJob("WEEKLY_HOD_SUMMARY"),
    },
    {
      key: "compliance_audit",
      name: "NBA/NAAC Accreditation Integrity Audit",
      description: "Validates teacher-student ratios, Cadre distribution (1:2:6), and publication DOI indexing.",
      cronSchedule: "0 3 * * 0 (Sundays at 3:00 AM)",
      icon: <ShieldCheck size={20} className="text-teal-500" />,
      action: () => runComplianceIntegrityCheck(),
    },
  ];

  return (
    <div>
      {/* Jobs Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: 20, marginBottom: 32 }}>
        {jobDefinitions.map((job) => {
          const isCurrentRunning = runningJob === job.key && isPending;
          return (
            <div
              key={job.key}
              className="card"
              style={{
                padding: "22px 24px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: 16,
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 12,
                        background: "hsl(var(--color-primary) / 0.1)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {job.icon}
                    </div>
                    <div>
                      <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>{job.name}</h3>
                      <span style={{ fontSize: 11.5, color: "hsl(var(--text-muted))" }}>{job.cronSchedule}</span>
                    </div>
                  </div>
                </div>

                <p style={{ fontSize: 13, color: "hsl(var(--text-secondary))", lineHeight: 1.5, margin: 0 }}>
                  {job.description}
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderTop: "1px solid hsl(var(--border))",
                  paddingTop: 14,
                }}
              >
                <span className="role-badge" style={{ background: "hsl(var(--color-primary) / 0.1)", color: "hsl(var(--color-primary))", fontSize: 11 }}>
                  Automated Job
                </span>
                <button
                  type="button"
                  onClick={() => handleRun(job.key, job.name, job.action)}
                  disabled={isPending}
                  className="btn btn-primary"
                  style={{
                    padding: "6px 14px",
                    fontSize: 12.5,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    cursor: isPending ? "not-allowed" : "pointer",
                  }}
                >
                  {isCurrentRunning ? (
                    <>
                      <RefreshCw size={14} className="spin" /> Executing...
                    </>
                  ) : (
                    <>
                      <Play size={14} /> Run Now
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Execution Audit Log Stream */}
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Server size={18} style={{ color: "hsl(var(--color-primary))" }} />
            <h2 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>Maintenance Job Run Console</h2>
          </div>
          {logs.length > 0 && (
            <button
              type="button"
              onClick={() => setLogs([])}
              className="btn btn-secondary"
              style={{ padding: "4px 10px", fontSize: 12 }}
            >
              Clear Log
            </button>
          )}
        </div>

        {logs.length === 0 ? (
          <div
            style={{
              padding: "36px 20px",
              textAlign: "center",
              color: "hsl(var(--text-muted))",
              background: "hsl(var(--surface-sunken))",
              borderRadius: "var(--radius-md)",
            }}
          >
            <Clock size={28} style={{ margin: "0 auto 8px", opacity: 0.4 }} />
            <p style={{ margin: 0, fontSize: 13.5 }}>No manual executions in this session yet.</p>
            <p style={{ margin: "4px 0 0", fontSize: 12 }}>Click &quot;Run Now&quot; on any job above to trigger immediate execution.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {logs.map((log) => (
              <div
                key={log.id}
                style={{
                  padding: "12px 16px",
                  borderRadius: "var(--radius-md)",
                  border: `1px solid ${
                    log.success ? "hsl(var(--color-success) / 0.3)" : "hsl(var(--color-danger) / 0.3)"
                  }`,
                  background: log.success ? "hsl(var(--color-success) / 0.05)" : "hsl(var(--color-danger) / 0.05)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {log.success ? (
                      <CheckCircle2 size={16} style={{ color: "hsl(var(--color-success))" }} />
                    ) : (
                      <AlertCircle size={16} style={{ color: "hsl(var(--color-danger))" }} />
                    )}
                    <span style={{ fontWeight: 700, fontSize: 13.5 }}>{log.name}</span>
                  </div>
                  <span style={{ fontSize: 11.5, color: "hsl(var(--text-muted))" }}>{log.timestamp}</span>
                </div>

                <p style={{ margin: 0, fontSize: 13, color: "hsl(var(--text-secondary))" }}>{log.message}</p>

                {log.details && (
                  <pre
                    style={{
                      margin: "4px 0 0",
                      padding: "8px 12px",
                      borderRadius: "var(--radius-sm)",
                      background: "hsl(var(--surface-sunken))",
                      fontSize: 11.5,
                      overflowX: "auto",
                      border: "1px solid hsl(var(--border))",
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
