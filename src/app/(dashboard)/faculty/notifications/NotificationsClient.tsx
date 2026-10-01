"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  ExternalLink,
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
  { label: string; icon: React.ReactNode; color: string; bg: string; category: string }
> = {
  TASK_ASSIGNED: {
    label: "Task Assignment",
    icon: <CheckSquare size={16} />,
    color: "#2F6FED",
    bg: "#EFF6FF",
    category: "tasks",
  },
  TASK_COMPLETED: {
    label: "Task Completed",
    icon: <Check size={16} />,
    color: "#198754",
    bg: "#F0FDF4",
    category: "tasks",
  },
  TASK_OVERDUE: {
    label: "Task Overdue",
    icon: <AlertTriangle size={16} />,
    color: "#C0392B",
    bg: "#FEF2F2",
    category: "tasks",
  },
  LEAVE_APPLIED: {
    label: "Leave Application",
    icon: <Calendar size={16} />,
    color: "#B7791F",
    bg: "#FEFCE8",
    category: "leave",
  },
  LEAVE_APPROVED: {
    label: "Leave Approved",
    icon: <CheckCheck size={16} />,
    color: "#198754",
    bg: "#F0FDF4",
    category: "leave",
  },
  LEAVE_REJECTED: {
    label: "Leave Rejected",
    icon: <AlertTriangle size={16} />,
    color: "#C0392B",
    bg: "#FEF2F2",
    category: "leave",
  },
  STARS_AWARDED: {
    label: "Points Credited",
    icon: <Star size={16} />,
    color: "#173B67",
    bg: "#EFF6FF",
    category: "recognition",
  },
  BADGE_EARNED: {
    label: "Badge Unlocked",
    icon: <Award size={16} />,
    color: "#7E22CE",
    bg: "#F3E8FF",
    category: "recognition",
  },
  EVALUATION_RECEIVED: {
    label: "Evaluation Submitted",
    icon: <Sparkles size={16} />,
    color: "#2F6FED",
    bg: "#EFF6FF",
    category: "recognition",
  },
  ROLE_CHANGED: {
    label: "System Notice",
    icon: <Bell size={16} />,
    color: "#667085",
    bg: "#F2F4F7",
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
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {[
            { id: "all", label: "All", count: notifications.length },
            { id: "unread", label: "Unread", count: unreadCount, isUrgent: unreadCount > 0 },
            { id: "tasks", label: "Tasks", count: notifications.filter((n) => EVENT_CONFIG[n.eventType]?.category === "tasks").length },
            { id: "leave", label: "Leave", count: notifications.filter((n) => EVENT_CONFIG[n.eventType]?.category === "leave").length },
            { id: "recognition", label: "Recognition", count: notifications.filter((n) => EVENT_CONFIG[n.eventType]?.category === "recognition").length },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  height: 32,
                  padding: "0 12px",
                  borderRadius: 4,
                  fontSize: 12.5,
                  fontWeight: isActive ? 600 : 500,
                  border: isActive ? "1px solid #173B67" : "1px solid #E4E7EC",
                  backgroundColor: isActive ? "#173B67" : "#FFFFFF",
                  color: isActive ? "#FFFFFF" : "#667085",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <span>{tab.label}</span>
                <span
                  style={{
                    fontSize: 11,
                    padding: "0 5px",
                    borderRadius: 10,
                    backgroundColor: isActive
                      ? "rgba(255, 255, 255, 0.2)"
                      : tab.isUrgent
                      ? "#FEF2F2"
                      : "#F2F4F7",
                    color: isActive
                      ? "#FFFFFF"
                      : tab.isUrgent
                      ? "#C0392B"
                      : "#667085",
                    fontWeight: 600,
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
              height: 32,
              padding: "0 12px",
              fontSize: 12,
              fontWeight: 500,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <CheckCheck size={14} />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      {/* Notification List Container */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications in this view"
          description={
            activeTab === "unread"
              ? "All your notifications have been marked as read. New institutional alerts will appear here."
              : "No notification records found in this category."
          }
        />
      ) : (
        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E4E7EC",
            borderRadius: 6,
            overflow: "hidden",
            boxShadow: "0 1px 2px 0 rgba(16, 24, 40, 0.04)",
          }}
        >
          {filtered.map((item, idx) => {
            const config = EVENT_CONFIG[item.eventType] || {
              label: item.eventType.replace("_", " "),
              icon: <Bell size={16} />,
              color: "#667085",
              bg: "#F2F4F7",
              category: "system",
            };

            return (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 14,
                  padding: "16px 20px",
                  borderBottom: idx < filtered.length - 1 ? "1px solid #F2F4F7" : "none",
                  backgroundColor: item.isRead ? "#FFFFFF" : "#EFF6FF",
                  borderLeft: item.isRead ? "3px solid transparent" : "3px solid #2F6FED",
                  transition: "background-color 0.15s ease",
                }}
              >
                {/* Event Category Icon */}
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 4,
                    backgroundColor: config.bg,
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
                        fontSize: 11,
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.03em",
                        color: config.color,
                      }}
                    >
                      {config.label}
                    </span>
                    <span style={{ fontSize: 11, color: "#98A2B3" }}>•</span>
                    <span style={{ fontSize: 12, color: "#667085", display: "inline-flex", alignItems: "center", gap: 3 }}>
                      <Clock size={11} />
                      {formatDate(item.createdAt)}
                    </span>
                    {!item.isRead && (
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          backgroundColor: "#BFDBFE",
                          color: "#173B67",
                          padding: "1px 6px",
                          borderRadius: 4,
                        }}
                      >
                        NEW
                      </span>
                    )}
                  </div>

                  <div
                    style={{
                      fontSize: 13.5,
                      fontWeight: item.isRead ? 500 : 600,
                      color: "#17202A",
                      lineHeight: 1.35,
                      marginBottom: 3,
                    }}
                  >
                    {item.title}
                  </div>

                  <div style={{ fontSize: 13, color: "#667085", lineHeight: 1.45 }}>
                    {item.message}
                  </div>

                  {/* Deep Link Action */}
                  {item.deepLink && (
                    <div style={{ marginTop: 8 }}>
                      <Link
                        href={item.deepLink}
                        onClick={() => !item.isRead && handleMarkOne(item.id)}
                        style={{
                          fontSize: 12,
                          fontWeight: 500,
                          color: "#2F6FED",
                          textDecoration: "none",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                        className="hover:underline"
                      >
                        <span>View Details</span>
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
                        padding: "0 8px",
                        fontSize: 11.5,
                        backgroundColor: "#FFFFFF",
                        border: "1px solid #E4E7EC",
                        borderRadius: 4,
                        color: "#17202A",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <Check size={12} />
                      <span>Read</span>
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
                      color: "#667085",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    className="hover:text-red-600"
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
