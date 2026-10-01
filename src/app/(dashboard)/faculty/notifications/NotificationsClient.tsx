"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  Bell, Check, CheckCheck, Trash2, ExternalLink, Filter,
  CheckSquare, Calendar, Star, Award, ShieldAlert, Sparkles
} from "lucide-react";
import { markNotificationAsRead, markAllNotificationsAsRead, deleteNotification } from "@/actions/notifications";
import { formatDate } from "@/lib/utils";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  eventType: string;
  isRead: boolean;
  deepLink: string | null;
  createdAt: string;
}

interface Props {
  initialNotifications: NotificationItem[];
}

const TYPE_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode; category: string }> = {
  TASK_ASSIGNED: { label: "Task Assigned", color: "hsl(var(--color-primary))", icon: <CheckSquare size={16} />, category: "tasks" },
  TASK_COMPLETED: { label: "Task Completed", color: "hsl(var(--color-success))", icon: <Check size={16} />, category: "tasks" },
  TASK_OVERDUE: { label: "Task Overdue", color: "hsl(var(--color-danger))", icon: <ShieldAlert size={16} />, category: "tasks" },
  LEAVE_APPLIED: { label: "Leave Applied", color: "hsl(var(--color-info))", icon: <Calendar size={16} />, category: "leave" },
  LEAVE_APPROVED: { label: "Leave Approved", color: "hsl(var(--color-success))", icon: <CheckCheck size={16} />, category: "leave" },
  LEAVE_REJECTED: { label: "Leave Rejected", color: "hsl(var(--color-danger))", icon: <ShieldAlert size={16} />, category: "leave" },
  STARS_AWARDED: { label: "Stars Awarded", color: "#F59E0B", icon: <Star size={16} />, category: "recognition" },
  BADGE_EARNED: { label: "Badge Earned", color: "#EC4899", icon: <Award size={16} />, category: "recognition" },
  EVALUATION_RECEIVED: { label: "Evaluation", color: "#3B82F6", icon: <Sparkles size={16} />, category: "recognition" },
  ROLE_CHANGED: { label: "System", color: "#8B5CF6", category: "system", icon: <Bell size={16} /> },
};

export function NotificationsClient({ initialNotifications }: Props) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [activeTab, setActiveTab] = useState<"all" | "unread" | "tasks" | "leave" | "recognition">("all");
  const [isPending, startTransition] = useTransition();

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filtered = notifications.filter((n) => {
    if (activeTab === "unread") return !n.isRead;
    if (activeTab === "tasks") return TYPE_CONFIG[n.eventType]?.category === "tasks";
    if (activeTab === "leave") return TYPE_CONFIG[n.eventType]?.category === "leave";
    if (activeTab === "recognition") return TYPE_CONFIG[n.eventType]?.category === "recognition";
    return true;
  });

  const handleMarkAll = () => {
    startTransition(async () => {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      await markAllNotificationsAsRead();
    });
  };

  const handleMarkOne = (id: string) => {
    startTransition(async () => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      await markNotificationAsRead(id);
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      await deleteNotification(id);
    });
  };

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 24,
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div>
          <h1 className="page-title">Notification Center</h1>
          <p className="page-subtitle">
            Stay updated with tasks, leave applications, recognition stars, and announcements.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAll}
            disabled={isPending}
            className="btn-outline"
            style={{ fontSize: 13, gap: 6 }}
          >
            <CheckCheck size={16} />
            Mark all read ({unreadCount})
          </button>
        )}
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: 8,
          borderBottom: "1px solid hsl(var(--border))",
          marginBottom: 20,
          overflowX: "auto",
          paddingBottom: 2,
        }}
      >
        {[
          { key: "all", label: "All", count: notifications.length },
          { key: "unread", label: "Unread", count: unreadCount },
          { key: "tasks", label: "Tasks", count: notifications.filter((n) => TYPE_CONFIG[n.eventType]?.category === "tasks").length },
          { key: "leave", label: "Leave", count: notifications.filter((n) => TYPE_CONFIG[n.eventType]?.category === "leave").length },
          { key: "recognition", label: "Recognition", count: notifications.filter((n) => TYPE_CONFIG[n.eventType]?.category === "recognition").length },
        ].map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              style={{
                background: "transparent",
                border: "none",
                borderBottom: isActive ? "2px solid hsl(var(--color-primary))" : "2px solid transparent",
                padding: "8px 14px",
                fontSize: 13.5,
                fontWeight: isActive ? 700 : 500,
                color: isActive ? "hsl(var(--color-primary))" : "hsl(var(--text-secondary))",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                transition: "all 0.15s ease",
              }}
            >
              {tab.label}
              <span
                style={{
                  fontSize: 11,
                  padding: "1px 6px",
                  borderRadius: 100,
                  background: isActive ? "hsl(var(--color-primary) / 0.15)" : "hsl(var(--bg-subtle))",
                  color: isActive ? "hsl(var(--color-primary))" : "hsl(var(--text-muted))",
                  fontWeight: 600,
                }}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Notifications List */}
      {filtered.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "64px 20px" }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "hsl(var(--bg-subtle))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              color: "hsl(var(--text-muted))",
            }}
          >
            <Bell size={28} />
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>No notifications found</h3>
          <p style={{ color: "hsl(var(--text-muted))", fontSize: 13, maxWidth: 360, margin: "0 auto" }}>
            {activeTab === "unread"
              ? "You're all caught up! No unread notifications at this time."
              : "There are no notifications in this category yet."}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map((item) => {
            const config = TYPE_CONFIG[item.eventType] ?? {
              label: item.eventType,
              color: "hsl(var(--color-primary))",
              icon: <Bell size={16} />,
            };

            return (
              <div
                key={item.id}
                className="card"
                style={{
                  padding: "16px 20px",
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  transition: "all 0.15s ease",
                  borderLeft: item.isRead ? "1px solid hsl(var(--border))" : `4px solid ${config.color}`,
                  background: item.isRead ? "hsl(var(--bg-surface))" : "hsl(var(--color-primary) / 0.03)",
                }}
              >
                {/* Event Icon */}
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    background: `${config.color}15`,
                    color: config.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {config.icon}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                        color: config.color,
                      }}
                    >
                      {config.label}
                    </span>
                    <span style={{ fontSize: 11, color: "hsl(var(--text-muted))" }}>•</span>
                    <span style={{ fontSize: 11.5, color: "hsl(var(--text-muted))" }}>
                      {formatDate(item.createdAt)}
                    </span>
                    {!item.isRead && (
                      <span
                        style={{
                          fontSize: 10,
                          padding: "1px 6px",
                          borderRadius: 10,
                          background: "hsl(var(--color-primary))",
                          color: "white",
                          fontWeight: 700,
                        }}
                      >
                        NEW
                      </span>
                    )}
                  </div>

                  <h3
                    style={{
                      fontSize: 14.5,
                      fontWeight: item.isRead ? 600 : 700,
                      color: "hsl(var(--text-primary))",
                      marginBottom: 4,
                    }}
                  >
                    {item.title}
                  </h3>
                  <p
                    style={{
                      fontSize: 13,
                      color: "hsl(var(--text-secondary))",
                      lineHeight: 1.5,
                      margin: 0,
                    }}
                  >
                    {item.message}
                  </p>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                  {item.deepLink && (
                    <Link
                      href={item.deepLink}
                      className="btn-outline"
                      style={{
                        fontSize: 12,
                        padding: "6px 12px",
                        gap: 4,
                        textDecoration: "none",
                      }}
                      onClick={() => !item.isRead && handleMarkOne(item.id)}
                    >
                      <span>View</span>
                      <ExternalLink size={12} />
                    </Link>
                  )}

                  {!item.isRead && (
                    <button
                      onClick={() => handleMarkOne(item.id)}
                      className="btn-ghost"
                      title="Mark as read"
                      aria-label="Mark as read"
                      style={{ padding: 8 }}
                    >
                      <Check size={16} />
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="btn-ghost"
                    title="Delete notification"
                    aria-label="Delete notification"
                    style={{ padding: 8, color: "hsl(var(--text-muted))" }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
