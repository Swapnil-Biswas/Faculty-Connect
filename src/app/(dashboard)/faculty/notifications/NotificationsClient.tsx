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
    color: "#38BDF8",
    bg: "rgba(14, 165, 233, 0.1)",
    border: "rgba(14, 165, 233, 0.3)",
    category: "tasks",
  },
  TASK_COMPLETED: {
    label: "TASK COMPLETED",
    icon: <Check size={15} />,
    color: "#4ADE80",
    bg: "rgba(34, 197, 94, 0.1)",
    border: "rgba(34, 197, 94, 0.3)",
    category: "tasks",
  },
  TASK_OVERDUE: {
    label: "TASK OVERDUE",
    icon: <AlertTriangle size={15} />,
    color: "#FB7185",
    bg: "rgba(244, 63, 94, 0.1)",
    border: "rgba(244, 63, 94, 0.35)",
    category: "tasks",
  },
  LEAVE_APPLIED: {
    label: "LEAVE APPLIED",
    icon: <Calendar size={15} />,
    color: "#FCD34D",
    bg: "rgba(245, 158, 11, 0.1)",
    border: "rgba(245, 158, 11, 0.3)",
    category: "leave",
  },
  LEAVE_APPROVED: {
    label: "LEAVE APPROVED",
    icon: <CheckCheck size={15} />,
    color: "#4ADE80",
    bg: "rgba(34, 197, 94, 0.1)",
    border: "rgba(34, 197, 94, 0.3)",
    category: "leave",
  },
  LEAVE_REJECTED: {
    label: "LEAVE DECLINED",
    icon: <AlertTriangle size={15} />,
    color: "#FB7185",
    bg: "rgba(244, 63, 94, 0.1)",
    border: "rgba(244, 63, 94, 0.35)",
    category: "leave",
  },
  STARS_AWARDED: {
    label: "POINTS CREDITED",
    icon: <Star size={15} />,
    color: "#FFD700",
    bg: "rgba(255, 215, 0, 0.1)",
    border: "rgba(255, 215, 0, 0.35)",
    category: "recognition",
  },
  BADGE_EARNED: {
    label: "BADGE UNLOCKED",
    icon: <Award size={15} />,
    color: "#A78BFA",
    bg: "rgba(129, 140, 248, 0.1)",
    border: "rgba(129, 140, 248, 0.3)",
    category: "recognition",
  },
  EVALUATION_RECEIVED: {
    label: "EVALUATION LOGGED",
    icon: <Sparkles size={15} />,
    color: "#38BDF8",
    bg: "rgba(14, 165, 233, 0.1)",
    border: "rgba(14, 165, 233, 0.3)",
    category: "recognition",
  },
  ROLE_CHANGED: {
    label: "SYSTEM NOTICE",
    icon: <Bell size={15} />,
    color: "#94A3B8",
    bg: "rgba(100, 116, 139, 0.1)",
    border: "rgba(100, 116, 139, 0.25)",
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
          marginBottom: 24,
          flexWrap: "wrap",
        }}
      >
        {/* Category Tabs */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {[
            { id: "all", label: "ALL", count: notifications.length },
            { id: "unread", label: "UNREAD", count: unreadCount, isUrgent: unreadCount > 0 },
            { id: "tasks", label: "TASKS", count: notifications.filter((n) => EVENT_CONFIG[n.eventType]?.category === "tasks").length },
            { id: "leave", label: "LEAVE", count: notifications.filter((n) => EVENT_CONFIG[n.eventType]?.category === "leave").length },
            { id: "recognition", label: "RECOGNITION", count: notifications.filter((n) => EVENT_CONFIG[n.eventType]?.category === "recognition").length },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  height: 34,
                  padding: "0 12px",
                  borderRadius: 6,
                  fontSize: 11.5,
                  fontFamily: "var(--font-mono)",
                  fontWeight: isActive ? 700 : 500,
                  border: isActive ? "1px solid #FFD700" : "1px solid rgba(255, 255, 255, 0.08)",
                  backgroundColor: isActive ? "rgba(255, 215, 0, 0.1)" : "rgba(255, 255, 255, 0.02)",
                  color: isActive ? "#FFD700" : "#94A3B8",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  transition: "all 0.15s ease",
                }}
              >
                <span>{tab.label}</span>
                <span
                  style={{
                    fontSize: 10,
                    padding: "1px 5px",
                    borderRadius: 4,
                    backgroundColor: isActive
                      ? "rgba(255, 215, 0, 0.25)"
                      : tab.isUrgent
                      ? "rgba(244, 63, 94, 0.2)"
                      : "rgba(255, 255, 255, 0.06)",
                    color: isActive
                      ? "#FFD700"
                      : tab.isUrgent
                      ? "#FB7185"
                      : "#64748B",
                    fontWeight: 700,
                  }}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Bulk Action: Mark All Read */}
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAll}
            disabled={isPending}
            className="btn-outline"
            style={{
              height: 34,
              padding: "0 14px",
              fontSize: 11.5,
              fontFamily: "var(--font-mono)",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <CheckCheck size={14} color="#38BDF8" />
            <span>MARK ALL READ</span>
          </button>
        )}
      </div>

      {/* Notification List Container */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="NO NOTIFICATIONS RECORDED"
          description={
            activeTab === "unread"
              ? "All your notifications have been marked as read. New institutional alerts will appear here in real time."
              : "No notification records found in this category."
          }
        />
      ) : (
        <div className="tech-card" style={{ padding: 0, overflow: "hidden" }}>
          {filtered.map((item, idx) => {
            const config = EVENT_CONFIG[item.eventType] || {
              label: item.eventType.replace("_", " "),
              icon: <Bell size={15} />,
              color: "#94A3B8",
              bg: "rgba(100, 116, 139, 0.1)",
              border: "rgba(100, 116, 139, 0.25)",
              category: "system",
            };

            return (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 14,
                  padding: "16px 22px",
                  borderBottom: idx < filtered.length - 1 ? "1px solid rgba(255, 255, 255, 0.04)" : "none",
                  backgroundColor: item.isRead ? "transparent" : "rgba(255, 215, 0, 0.03)",
                  borderLeft: item.isRead ? "3px solid transparent" : "3px solid #FFD700",
                  transition: "background-color 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = item.isRead ? "rgba(255, 255, 255, 0.02)" : "rgba(255, 215, 0, 0.06)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = item.isRead ? "transparent" : "rgba(255, 215, 0, 0.03)";
                }}
              >
                {/* Event Category Icon */}
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 6,
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
                        letterSpacing: "0.05em",
                        color: config.color,
                      }}
                    >
                      {config.label}
                    </span>
                    <span style={{ fontSize: 10, color: "#475569" }}>//</span>
                    <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "#64748B", display: "inline-flex", alignItems: "center", gap: 4 }}>
                      <Clock size={11} />
                      {formatDate(item.createdAt)}
                    </span>
                    {!item.isRead && (
                      <span className="glyph-chip glyph-chip-gold" style={{ fontSize: 9.5, padding: "1px 5px" }}>
                        NEW
                      </span>
                    )}
                  </div>

                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: item.isRead ? 500 : 700,
                      color: item.isRead ? "#94A3B8" : "#F8FAFC",
                      lineHeight: 1.35,
                      marginBottom: 3,
                    }}
                  >
                    {item.title}
                  </div>

                  <div style={{ fontSize: 12.5, color: "#94A3B8", lineHeight: 1.45 }}>
                    {item.message}
                  </div>

                  {/* Deep Link Action */}
                  {item.deepLink && (
                    <div style={{ marginTop: 8 }}>
                      <Link
                        href={item.deepLink}
                        onClick={() => !item.isRead && handleMarkOne(item.id)}
                        style={{
                          fontSize: 11.5,
                          fontFamily: "var(--font-mono)",
                          fontWeight: 600,
                          color: "#FFD700",
                          textDecoration: "none",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <span>VIEW EVENT DETAILS</span>
                        <ArrowRight size={12} />
                      </Link>
                    </div>
                  )}
                </div>

                {/* Right Actions: Mark as Read & Delete */}
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                  {!item.isRead && (
                    <button
                      onClick={() => handleMarkOne(item.id)}
                      title="Mark as read"
                      style={{
                        height: 28,
                        padding: "0 10px",
                        fontSize: 11,
                        fontFamily: "var(--font-mono)",
                        fontWeight: 600,
                        backgroundColor: "rgba(255, 255, 255, 0.04)",
                        border: "1px solid rgba(255, 255, 255, 0.12)",
                        borderRadius: 4,
                        color: "#F8FAFC",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        transition: "all 0.15s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "#FFD700";
                        e.currentTarget.style.color = "#FFD700";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.12)";
                        e.currentTarget.style.color = "#F8FAFC";
                      }}
                    >
                      <Check size={11} />
                      <span>READ</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(item.id)}
                    title="Delete notification"
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 4,
                      border: "none",
                      backgroundColor: "transparent",
                      color: "#64748B",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "#F43F5E";
                      e.currentTarget.style.backgroundColor = "rgba(244, 63, 94, 0.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "#64748B";
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    <Trash2 size={14} />
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
