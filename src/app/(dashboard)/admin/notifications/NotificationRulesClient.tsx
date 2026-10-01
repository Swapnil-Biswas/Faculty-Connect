"use client";

import { useState, useTransition } from "react";
import { updateNotificationRule } from "@/actions/notifications";
import {
  Bell, CheckSquare, Calendar, Star, Award, ShieldAlert,
  Sparkles, Trophy, Save, RefreshCw, Check
} from "lucide-react";

interface RuleItem {
  eventType: string;
  enabled: boolean;
  threshold: number | null;
  updatedAt: string | null;
}

interface Props {
  initialRules: RuleItem[];
}

const META: Record<string, { label: string; desc: string; icon: React.ReactNode; color: string; hasThreshold?: boolean; thresholdLabel?: string }> = {
  TASK_ASSIGNED: {
    label: "Task Assigned",
    desc: "Alert faculty when a Cluster Head assigns a new task to them.",
    icon: <CheckSquare size={18} />,
    color: "#7C3AED",
  },
  TASK_COMPLETED: {
    label: "Task Completed",
    desc: "Notify assigner when a faculty member marks their task as completed.",
    icon: <Check size={18} />,
    color: "#10B981",
  },
  TASK_OVERDUE: {
    label: "Task Overdue Warning",
    desc: "Trigger high-priority alert when a task passes its deadline without completion.",
    icon: <ShieldAlert size={18} />,
    color: "#EF4444",
  },
  LEAVE_APPLIED: {
    label: "Leave Application Submitted",
    desc: "Alert Cluster Head and HOD when faculty requests casual or duty leave.",
    icon: <Calendar size={18} />,
    color: "#06B6D4",
  },
  LEAVE_APPROVED: {
    label: "Leave Approved",
    desc: "Inform faculty when their pending leave application has been approved.",
    icon: <Check size={18} />,
    color: "#10B981",
  },
  LEAVE_REJECTED: {
    label: "Leave Rejected",
    desc: "Notify faculty if their leave application is rejected, including remarks.",
    icon: <ShieldAlert size={18} />,
    color: "#EF4444",
  },
  STARS_AWARDED: {
    label: "Stars & Points Awarded",
    desc: "Celebrate recognition points earned through task velocity or evaluation.",
    icon: <Star size={18} />,
    color: "#F59E0B",
  },
  BADGE_EARNED: {
    label: "Badge / Achievement Unlocked",
    desc: "Notify faculty when gamified milestone criteria are achieved.",
    icon: <Award size={18} />,
    color: "#EC4899",
  },
  EVALUATION_RECEIVED: {
    label: "Evaluation Recorded",
    desc: "Send score report notification when Cluster Head submits an evaluation.",
    icon: <Sparkles size={18} />,
    color: "#3B82F6",
  },
  ROLE_CHANGED: {
    label: "Role / Permission Change",
    desc: "Security alert when user role or cluster assignment is altered by Admin.",
    icon: <Bell size={18} />,
    color: "#8B5CF6",
  },
  LEADERBOARD_REFRESHED: {
    label: "Leaderboard Recomputed",
    desc: "Alert top-ranking faculty members when weekly/monthly ranks are recalculated.",
    icon: <Trophy size={18} />,
    color: "#F59E0B",
    hasThreshold: true,
    thresholdLabel: "Notify Top N Faculty",
  },
};

export function NotificationRulesClient({ initialRules }: Props) {
  const [rules, setRules] = useState(initialRules);
  const [savedStatus, setSavedStatus] = useState<Record<string, boolean>>({});
  const [isPending, startTransition] = useTransition();

  const handleToggle = (eventType: string, currentEnabled: boolean, threshold: number | null) => {
    const nextEnabled = !currentEnabled;
    setRules((prev) =>
      prev.map((r) => (r.eventType === eventType ? { ...r, enabled: nextEnabled } : r))
    );

    const fd = new FormData();
    fd.append("eventType", eventType);
    fd.append("enabled", String(nextEnabled));
    if (threshold != null) fd.append("threshold", String(threshold));

    startTransition(async () => {
      await updateNotificationRule({ success: false }, fd);
      setSavedStatus((prev) => ({ ...prev, [eventType]: true }));
      setTimeout(() => {
        setSavedStatus((prev) => ({ ...prev, [eventType]: false }));
      }, 2000);
    });
  };

  const handleThresholdChange = (eventType: string, val: string, enabled: boolean) => {
    const num = val === "" ? null : parseInt(val, 10);
    setRules((prev) =>
      prev.map((r) => (r.eventType === eventType ? { ...r, threshold: num } : r))
    );

    const fd = new FormData();
    fd.append("eventType", eventType);
    fd.append("enabled", String(enabled));
    if (num != null) fd.append("threshold", String(num));

    startTransition(async () => {
      await updateNotificationRule({ success: false }, fd);
      setSavedStatus((prev) => ({ ...prev, [eventType]: true }));
      setTimeout(() => {
        setSavedStatus((prev) => ({ ...prev, [eventType]: false }));
      }, 2000);
    });
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 18 }}>
      {rules.map((rule) => {
        const meta = META[rule.eventType] ?? {
          label: rule.eventType,
          desc: "System automated notification rule trigger.",
          icon: <Bell size={18} />,
          color: "hsl(var(--color-primary))",
        };

        const isSaved = savedStatus[rule.eventType];

        return (
          <div
            key={rule.eventType}
            className="card"
            style={{
              padding: "20px 22px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: 16,
              borderTop: `3px solid ${rule.enabled ? meta.color : "hsl(var(--border))"}`,
              opacity: rule.enabled ? 1 : 0.7,
              transition: "all 0.2s ease",
            }}
          >
            {/* Top row */}
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: `${meta.color}15`,
                      color: meta.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {meta.icon}
                  </div>
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>{meta.label}</h3>
                    <code style={{ fontSize: 11, color: "hsl(var(--text-muted))" }}>{rule.eventType}</code>
                  </div>
                </div>

                {/* Toggle switch */}
                <label
                  style={{
                    position: "relative",
                    display: "inline-block",
                    width: 44,
                    height: 24,
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={rule.enabled}
                    onChange={() => handleToggle(rule.eventType, rule.enabled, rule.threshold)}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span
                    style={{
                      position: "absolute",
                      cursor: "pointer",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: rule.enabled ? meta.color : "hsl(var(--border-strong))",
                      transition: "0.2s",
                      borderRadius: 24,
                    }}
                  >
                    <span
                      style={{
                        position: "absolute",
                        height: 18,
                        width: 18,
                        left: rule.enabled ? 22 : 3,
                        bottom: 3,
                        backgroundColor: "white",
                        transition: "0.2s",
                        borderRadius: "50%",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                      }}
                    />
                  </span>
                </label>
              </div>

              <p style={{ fontSize: 13, color: "hsl(var(--text-secondary))", lineHeight: 1.5, margin: 0 }}>
                {meta.desc}
              </p>
            </div>

            {/* Threshold config if applicable */}
            {meta.hasThreshold && (
              <div
                style={{
                  background: "hsl(var(--bg-subtle))",
                  padding: "10px 14px",
                  borderRadius: "var(--radius-sm)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <span style={{ fontSize: 12, fontWeight: 600 }}>{meta.thresholdLabel}</span>
                <input
                  type="number"
                  min={1}
                  max={50}
                  className="form-input"
                  style={{ width: 70, padding: "4px 8px", fontSize: 13, textAlign: "center" }}
                  value={rule.threshold ?? 5}
                  onChange={(e) => handleThresholdChange(rule.eventType, e.target.value, rule.enabled)}
                />
              </div>
            )}

            {/* Footer status */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingTop: 10,
                borderTop: "1px solid hsl(var(--border))",
                fontSize: 11.5,
                color: "hsl(var(--text-muted))",
              }}
            >
              <span>Status: <strong style={{ color: rule.enabled ? "hsl(var(--color-success))" : "inherit" }}>{rule.enabled ? "Active" : "Disabled"}</strong></span>
              {isSaved && (
                <span style={{ color: "hsl(var(--color-success))", display: "flex", alignItems: "center", gap: 4, fontWeight: 600 }}>
                  <Check size={12} /> Saved
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
