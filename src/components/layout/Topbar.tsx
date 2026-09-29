"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, Sun, Moon, Monitor, X, Check } from "lucide-react";
import { useTheme } from "next-themes";
import { formatDate } from "@/lib/utils";

interface Notification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  eventType: string;
}

interface TopbarProps {
  title: string;
  notifications?: Notification[];
}

const EVENT_COLORS: Record<string, string> = {
  TASK_ASSIGNED: "#7C3AED",
  TASK_OVERDUE: "#EF4444",
  LEAVE_APPROVED: "#22C55E",
  LEAVE_REJECTED: "#EF4444",
  STARS_AWARDED: "#F59E0B",
  BADGE_EARNED: "#EC4899",
  EVALUATION_RECEIVED: "#3B82F6",
  ROLE_CHANGED: "#8B5CF6",
};

export function Topbar({ title, notifications = [] }: TopbarProps) {
  const { theme, setTheme } = useTheme();
  const [showNotif, setShowNotif] = useState(false);
  const [localNotifs, setLocalNotifs] = useState(notifications);
  const panelRef = useRef<HTMLDivElement>(null);

  const unread = localNotifs.filter((n) => !n.isRead).length;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setShowNotif(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function markAllRead() {
    setLocalNotifs((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }

  const themeIcon =
    theme === "dark" ? <Moon size={18} /> : theme === "light" ? <Sun size={18} /> : <Monitor size={18} />;

  const nextTheme = theme === "dark" ? "light" : theme === "light" ? "system" : "dark";

  return (
    <header className="topbar" role="banner">
      <h1 className="topbar-title">{title}</h1>

      <div className="topbar-actions">
        {/* Theme toggle */}
        <button
          id="theme-toggle"
          onClick={() => setTheme(nextTheme)}
          className="btn-ghost"
          aria-label={`Switch to ${nextTheme} theme`}
          title={`Current: ${theme} — click to switch`}
        >
          {themeIcon}
        </button>

        {/* Notification bell */}
        <div ref={panelRef} style={{ position: "relative" }}>
          <button
            id="notification-bell"
            className="notif-bell"
            onClick={() => setShowNotif((v) => !v)}
            aria-label={`${unread} unread notifications`}
            aria-expanded={showNotif}
          >
            <Bell size={20} />
            {unread > 0 && (
              <span className="notif-badge">{unread > 99 ? "99+" : unread}</span>
            )}
          </button>

          {showNotif && (
            <div className="notif-panel" role="dialog" aria-label="Notifications">
              {/* Header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "14px 16px",
                  borderBottom: "1px solid hsl(var(--border))",
                  gap: 8,
                }}
              >
                <span
                  style={{
                    flex: 1,
                    fontWeight: 700,
                    fontSize: 14,
                    color: "hsl(var(--text-primary))",
                  }}
                >
                  Notifications {unread > 0 && <span style={{ color: "hsl(var(--color-primary))" }}>({unread})</span>}
                </span>
                {unread > 0 && (
                  <button
                    onClick={markAllRead}
                    style={{
                      fontSize: 12,
                      color: "hsl(var(--color-primary))",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <Check size={12} /> Mark all read
                  </button>
                )}
                <button onClick={() => setShowNotif(false)} className="btn-ghost" style={{ padding: 4 }}>
                  <X size={16} />
                </button>
              </div>

              {/* Notifications list */}
              <div style={{ maxHeight: 380, overflowY: "auto" }}>
                {localNotifs.length === 0 ? (
                  <div className="empty-state" style={{ padding: "32px 16px" }}>
                    <Bell size={32} style={{ opacity: 0.3, marginBottom: 8 }} />
                    <div className="empty-state-title">All caught up!</div>
                    <div className="empty-state-desc">No notifications yet.</div>
                  </div>
                ) : (
                  localNotifs.slice(0, 20).map((n) => (
                    <div
                      key={n.id}
                      className={`notif-item ${n.isRead ? "" : "unread"}`}
                      onClick={() =>
                        setLocalNotifs((prev) =>
                          prev.map((x) => (x.id === n.id ? { ...x, isRead: true } : x))
                        )
                      }
                    >
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: n.isRead ? "transparent" : (EVENT_COLORS[n.eventType] ?? "hsl(var(--color-primary))"),
                          flexShrink: 0,
                          marginTop: 6,
                        }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: n.isRead ? 500 : 700,
                            color: "hsl(var(--text-primary))",
                            marginBottom: 2,
                          }}
                        >
                          {n.title}
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            color: "hsl(var(--text-secondary))",
                            lineHeight: 1.4,
                            marginBottom: 4,
                          }}
                        >
                          {n.message}
                        </div>
                        <div style={{ fontSize: 11, color: "hsl(var(--text-muted))" }}>
                          {formatDate(n.createdAt)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {localNotifs.length > 0 && (
                <div
                  style={{
                    padding: "10px 16px",
                    borderTop: "1px solid hsl(var(--border))",
                    textAlign: "center",
                  }}
                >
                  <a
                    href="/faculty/notifications"
                    style={{
                      fontSize: 13,
                      color: "hsl(var(--color-primary))",
                      textDecoration: "none",
                      fontWeight: 600,
                    }}
                  >
                    View all notifications →
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}