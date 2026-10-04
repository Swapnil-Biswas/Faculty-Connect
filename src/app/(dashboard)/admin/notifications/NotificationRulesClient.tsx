"use client";

import { useState, useTransition } from "react";
import { updateNotificationRule } from "@/actions/notifications";
import {
  Bell,
  CheckSquare,
  Calendar,
  Star,
  Award,
  ShieldAlert,
  Sparkles,
  Trophy,
  Check,
  UserCheck,
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

interface EventMeta {
  label: string;
  desc: string;
  icon: React.ReactNode;
  hasThreshold?: boolean;
  thresholdLabel?: string;
  thresholdHelp?: string;
}

const META: Record<string, EventMeta> = {
  TASK_ASSIGNED: {
    label: "Task Assigned",
    desc: "Alert faculty when a Cluster Head assigns a new task deliverable to them.",
    icon: <CheckSquare size={18} />,
  },
  TASK_COMPLETED: {
    label: "Task Completed",
    desc: "Notify assigner and cluster leadership when a faculty member completes a deliverable.",
    icon: <Check size={18} />,
  },
  TASK_OVERDUE: {
    label: "Task Overdue Warning",
    desc: "Trigger high-priority alert when a task passes its deadline without completion.",
    icon: <ShieldAlert size={18} />,
  },
  LEAVE_APPLIED: {
    label: "Leave Application Submitted",
    desc: "Alert Cluster Head and HOD when faculty requests casual or duty leave.",
    icon: <Calendar size={18} />,
  },
  LEAVE_APPROVED: {
    label: "Leave Approved",
    desc: "Inform faculty when their pending leave application has been approved.",
    icon: <Check size={18} />,
  },
  LEAVE_REJECTED: {
    label: "Leave Rejected",
    desc: "Notify faculty if their leave application is rejected, including decision remarks.",
    icon: <ShieldAlert size={18} />,
  },
  STARS_AWARDED: {
    label: "Stars & Points Awarded",
    desc: "Celebrate recognition points earned through task velocity or evaluation scores.",
    icon: <Star size={18} />,
  },
  BADGE_EARNED: {
    label: "Badge / Achievement Unlocked",
    desc: "Notify faculty when gamified milestone criteria and merit badges are unlocked.",
    icon: <Award size={18} />,
  },
  EVALUATION_RECEIVED: {
    label: "Evaluation Recorded",
    desc: "Send score report notification when Cluster Head submits an evaluation.",
    icon: <Sparkles size={18} />,
  },
  FACULTY_OF_MONTH: {
    label: "Faculty of the Month Spotlight",
    desc: "Congratulate and notify faculty selected as Faculty of the Month for the preceding period.",
    icon: <Award size={18} />,
  },
  ROLE_CHANGED: {
    label: "Role & Permission Changed",
    desc: "Security alert when user role or cluster topology assignment is altered by Admin.",
    icon: <UserCheck size={18} />,
  },
  LEADERBOARD_REFRESHED: {
    label: "Leaderboard Recomputed",
    desc: "Configures top-N threshold alerting for leaderboard ranking updates.",
    icon: <Trophy size={18} />,
    hasThreshold: true,
    thresholdLabel: "Notify Top N Faculty",
    thresholdHelp: "Applies when leaderboard rankings are recalculated.",
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
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
        gap: 18,
      }}
    >
      {rules.map((rule) => {
        const meta = META[rule.eventType] ?? {
          label: rule.eventType.replace(/_/g, " "),
          desc: "System automated notification rule trigger.",
          icon: <Bell size={18} />,
        };

        const isSaved = savedStatus[rule.eventType];

        return (
          <div
            key={rule.eventType}
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E4E7EC",
              borderTop: rule.enabled ? "3px solid #173B67" : "3px solid #E4E7EC",
              borderRadius: 10,
              padding: "20px 22px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: 16,
              boxShadow: "0 1px 3px rgba(16, 24, 40, 0.04)",
              opacity: rule.enabled ? 1 : 0.82,
              transition: "all 0.15s ease",
            }}
          >
            {/* Top row: Icon, Label, Event Code, Switch */}
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 12,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 8,
                      backgroundColor: "#F0F4F8",
                      border: "1px solid #D0D7DE",
                      color: "#173B67",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {meta.icon}
                  </div>
                  <div>
                    <h3
                      style={{
                        fontSize: 14.5,
                        fontWeight: 700,
                        color: "#17202A",
                        margin: 0,
                        lineHeight: 1.25,
                      }}
                    >
                      {meta.label}
                    </h3>
                    <code
                      style={{
                        fontSize: 11,
                        color: "#667085",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      {rule.eventType}
                    </code>
                  </div>
                </div>

                {/* Accessible Institutional Switch */}
                <button
                  type="button"
                  role="switch"
                  aria-checked={rule.enabled}
                  aria-label={`Toggle notifications for ${meta.label}`}
                  disabled={isPending}
                  onClick={() => handleToggle(rule.eventType, rule.enabled, rule.threshold)}
                  style={{
                    width: 44,
                    height: 24,
                    borderRadius: 24,
                    backgroundColor: rule.enabled ? "#173B67" : "#E4E7EC",
                    position: "relative",
                    border: "none",
                    cursor: isPending ? "not-allowed" : "pointer",
                    transition: "background-color 0.2s ease",
                    padding: 0,
                    flexShrink: 0,
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      top: 3,
                      left: rule.enabled ? 23 : 3,
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      backgroundColor: "#FFFFFF",
                      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.2)",
                      transition: "left 0.2s ease",
                    }}
                  />
                </button>
              </div>

              <p
                style={{
                  fontSize: 12.5,
                  color: "#667085",
                  lineHeight: 1.45,
                  margin: 0,
                }}
              >
                {meta.desc}
              </p>
            </div>

            {/* Threshold config where applicable */}
            {meta.hasThreshold && (
              <div
                style={{
                  backgroundColor: "#F7F8FA",
                  padding: "10px 14px",
                  borderRadius: 6,
                  border: "1px solid #E4E7EC",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#17202A" }}>
                    {meta.thresholdLabel}
                  </div>
                  {meta.thresholdHelp && (
                    <div style={{ fontSize: 11, color: "#667085", marginTop: 2 }}>
                      {meta.thresholdHelp}
                    </div>
                  )}
                </div>
                <input
                  type="number"
                  min={1}
                  max={50}
                  aria-label={meta.thresholdLabel}
                  style={{
                    width: 64,
                    padding: "4px 8px",
                    fontSize: 13,
                    fontWeight: 600,
                    textAlign: "center",
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #D0D7DE",
                    borderRadius: 6,
                    color: "#17202A",
                  }}
                  value={rule.threshold ?? 5}
                  onChange={(e) =>
                    handleThresholdChange(rule.eventType, e.target.value, rule.enabled)
                  }
                />
              </div>
            )}

            {/* Footer status & save confirmation */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingTop: 12,
                borderTop: "1px solid #F2F4F7",
                fontSize: 12,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ color: "#667085" }}>Status:</span>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    fontSize: 11.5,
                    fontWeight: 600,
                    padding: "2px 7px",
                    borderRadius: 4,
                    backgroundColor: rule.enabled ? "#F0FDF4" : "#F2F4F7",
                    color: rule.enabled ? "#166534" : "#667085",
                    border: `1px solid ${rule.enabled ? "#BBF7D0" : "#E4E7EC"}`,
                  }}
                >
                  {rule.enabled ? "● Active" : "Disabled"}
                </span>
              </div>

              {isSaved && (
                <span
                  style={{
                    color: "#166534",
                    backgroundColor: "#F0FDF4",
                    border: "1px solid #BBF7D0",
                    padding: "2px 8px",
                    borderRadius: 4,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    fontSize: 11.5,
                    fontWeight: 600,
                  }}
                >
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
