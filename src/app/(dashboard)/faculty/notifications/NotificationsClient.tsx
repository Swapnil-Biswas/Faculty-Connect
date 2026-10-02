"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  CheckSquare,
  Calendar,
  Star,
  Award,
  AlertTriangle,
  Clock,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import {
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "@/actions/notifications";
import { EmptyState } from "@/components/ui/EmptyState";
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

const EVENT_CONFIG: Record<
  string,
  { label: string; icon: React.ReactNode; color: string; bg: string; border: string; category: string }
> = {
  TASK_ASSIGNED: {
    label: "TASK ASSIGNED",
    icon: <CheckSquare size={15} />,
    color: "#0284C7",
    bg: "#F0F9FF",
    border: "#BAE6FD",
    category: "tasks",
  },
  TASK_COMPLETED: {
    label: "TASK COMPLETED",
    icon: <Check size={15} />,
    color: "#16A34A",
    bg: "#F0FDF4",
    border: "#BBF7D0",
    category: "tasks",
  },
  TASK_OVERDUE: {
    label: "TASK OVERDUE",
    icon: <AlertTriangle size={15} />,
    color: "#E11D48",
    bg: "#FFF1F2",
    border: "#FECDD3",
    category: "tasks",
  },
  LEAVE_APPLIED: {
    label: "LEAVE APPLIED",
    icon: <Calendar size={15} />,
    color: "#D97706",
    bg: "#FFFBEB",
    border: "#FDE68A",
    category: "leave",
  },
  LEAVE_APPROVED: {
    label: "LEAVE APPROVED",
    icon: <CheckCheck size={15} />,
    color: "#16A34A",
    bg: "#F0FDF4",
    border: "#BBF7D0",
    category: "leave",
  },
  LEAVE_REJECTED: {
    label: "LEAVE DECLINED",
    icon: <AlertTriangle size={15} />,
    color: "#E11D48",
    bg: "#FFF1F2",
    border: "#FECDD3",
    category: "leave",
  },
  STARS_AWARDED: {
    label: "POINTS CREDITED",
    icon: <Star size={15} />,
    color: "#B45309",
    bg: "#FEFCE8",
    border: "#FEF08A",
    category: "recognition",
  },
  BADGE_UNLOCKED: {
    label: "BADGE EARNED",
    icon: <Award size={15} />,
    color: "#7C3AED",
    bg: "#F5F3FF",
    border: "#DDD6FE",
    category: "recognition",
  },
  SYSTEM_ANNOUNCEMENT: {
    label: "ANNOUNCEMENT",
    icon: <Sparkles size={15} />,
    color: "#1D1D1F",
    bg: "#F5F5F7",
    border: "#E8E8ED",
    category: "system",
  },
};

export function NotificationsClient({ initialNotifications }: Props) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [activeTab, setActiveTab] = useState<"all" | "unread" | "tasks" | "leave" | "recognition">("all");
  const [isPending, startTransition] = useTransition();

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filtered = notifications.filter((n) => {
    if (activeTab === "unread") return !n.isRead;
    if (activeTab === "tasks") return EVENT_CONFIG[n.eventType]?.category === "tasks";
    if (activeTab === "leave") return EVENT_CONFIG[n.eventType]?.category === "leave";
    if (activeTab === "recognition") return EVENT_CONFIG[n.eventType]?.category === "recognition";
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
      {/* Controls & Filter Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          marginBottom: 20,
          flexWrap: "wrap",
        }}
      >
        {/* Category Tabs */}
        <div className="tabs" style={{ marginBottom: 0 }}>
          {[
            { id: "all", label: "ALL", count: notifications.length },
            { id: "unread", label: "UNREAD", count: unreadCount },
            { id: "tasks", label: "TASKS", count: notifications.filter((n) => EVENT_CONFIG[n.eventType]?.category === "tasks").length },
            { id: "leave", label: "LEAVE", count: notifications.filter((n) => EVENT_CONFIG[n.eventType]?.category === "leave").length },
            { id: "recognition", label: "RECOGNITION", count: notifications.filter((n) => EVENT_CONFIG[n.eventType]?.category === "recognition").length },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`tab ${isActive ? "is-active" : ""}`}
              >
                <span>{tab.label}</span>
                <span className="tab-count">{tab.count}</span>
              </button>
            );
          })}
        </div>

        {/* Bulk Action: Mark All Read */}
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAll}
            disabled={isPending}
            className="btn-secondary btn-sm"
            style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            <CheckCheck size={14} />
            <span>MARK ALL READ</span>
          </button>
        )}
      </div>

      {/* Notification List Container */}
      {filtered.length === 0 ? (
        <div className="card" style={{ padding: 48 }}>
          <EmptyState
            title="NO NOTIFICATIONS RECORDED"
            description={
              activeTab === "unread"
                ? "All your notifications have been marked as read. New institutional alerts will appear here in real time."
                : "No notification records found in this category."
            }
          />
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          {filtered.map((item, idx) => {
            const config = EVENT_CONFIG[item.eventType] || {
              label: item.eventType.replace("_", " "),
              icon: <Bell size={15} />,
              color: "#6E6E73",
              bg: "#F5F5F7",
              border: "#E8E8ED",
              category: "system",
            };

            return (
              <div
                key={item.id}
                className="cyber-row-hover"
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 14,
                  padding: "16px 22px",
                  borderBottom: idx < filtered.length - 1 ? "1px solid #E8E8ED" : "none",
                  backgroundColor: item.isRead ? "#FFFFFF" : "#FAFAFA",
                  borderLeft: item.isRead ? "3px solid transparent" : "3px solid #1D1D1F",
                }}
              >
                {/* Event Category Icon */}
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    backgroundColor: config.bg,
                    border: `1px solid ${config.border}`,
                    color: config.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                >
                  {config.icon}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 4,
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 10.5,
                        fontWeight: 700,
                        fontFamily: "var(--font-mono)",
                        letterSpacing: "0.06em",
                        color: config.color,
                      }}
                    >
                      {config.label}
                    </span>
                    <span style={{ fontSize: 10, color: "#D2D2D7" }}>//</span>
                    <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "#86868B", display: "inline-flex", alignItems: "center", gap: 4 }}>
                      <Clock size={11} />
                      {formatDate(item.createdAt)}
                    </span>
                    {!item.isRead && (
                      <span className="badge badge-dark" style={{ fontSize: 9, padding: "2px 6px" }}>
                        NEW
                      </span>
                    )}
                  </div>

                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: item.isRead ? 500 : 700,
                      color: "#1D1D1F",
                      lineHeight: 1.35,
                      marginBottom: 3,
                    }}
                  >
                    {item.title}
                  </div>

                  <div style={{ fontSize: 13, color: "#6E6E73", lineHeight: 1.5 }}>
                    {item.message}
                  </div>

                  {/* Deep Link Action */}
                  {item.deepLink && (
                    <div style={{ marginTop: 8 }}>
                      <Link
                        href={item.deepLink}
                        onClick={() => !item.isRead && handleMarkOne(item.id)}
                        className="cyber-link-hover"
                        style={{
                          fontSize: 11.5,
                          fontFamily: "var(--font-mono)",
                          fontWeight: 600,
                          color: "#1D1D1F",
                          textDecoration: "none",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        VIEW DETAILS <ArrowRight size={11} />
                      </Link>
                    </div>
                  )}
                </div>

                {/* Right Item Actions */}
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                  {!item.isRead && (
                    <button
                      onClick={() => handleMarkOne(item.id)}
                      title="Mark as read"
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 6,
                        backgroundColor: "#F5F5F7",
                        border: "1px solid #E8E8ED",
                        color: "#6E6E73",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <Check size={13} />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(item.id)}
                    title="Delete notification"
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 6,
                      backgroundColor: "transparent",
                      border: "1px solid transparent",
                      color: "#86868B",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <Trash2 size={13} />
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
