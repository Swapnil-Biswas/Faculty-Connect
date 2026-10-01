"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, X, Check } from "lucide-react";
import { useSession } from "next-auth/react";
import { formatDate, getInitials, getRoleLabel } from "@/lib/utils";
import { markNotificationAsRead, markAllNotificationsAsRead } from "@/actions/notifications";
import Link from "next/link";

interface Notification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  eventType: string;
}

interface TopbarProps {
  title?: string;
  notifications?: Notification[];
}

// Institutional semantic event mapping (no purple/pink)
const EVENT_COLORS: Record<string, string> = {
  TASK_ASSIGNED: "#2F6FED",        // Info Blue
  TASK_OVERDUE: "#C0392B",         // Error Red
  LEAVE_APPROVED: "#198754",       // Success Green
  LEAVE_REJECTED: "#C0392B",       // Error Red
  STARS_AWARDED: "#B7791F",        // Warning Ochre / Merit Amber
  BADGE_EARNED: "#B7791F",         // Warning Ochre / Merit Amber
  EVALUATION_RECEIVED: "#2F6FED",  // Info Blue
  ROLE_CHANGED: "#2F6FED",         // Info Blue
};

export function Topbar({ title, notifications = [] }: TopbarProps) {
  const { data: session } = useSession();
  const [showNotif, setShowNotif] = useState(false);
  const [localNotifs, setLocalNotifs] = useState(notifications);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalNotifs(notifications);
  }, [notifications]);

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

  async function markAllRead() {
    setLocalNotifs((prev) => prev.map((n) => ({ ...n, isRead: true })));
    await markAllNotificationsAsRead();
  }

  async function handleNotificationClick(id: string, isRead: boolean) {
    if (!isRead) {
      setLocalNotifs((prev) =>
        prev.map((x) => (x.id === id ? { ...x, isRead: true } : x))
      );
      await markNotificationAsRead(id);
    }
  }

  const deptName = process.env.NEXT_PUBLIC_DEPARTMENT_NAME ?? "Department of Computer Science & Engineering";

  return (
    <header
      role="banner"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 30,
        height: 60,
        backgroundColor: "#FFFFFF",
        borderBottom: "1px solid #E4E7EC",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 28px",
      }}
    >
      {/* Left: Visually quiet academic context */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "#17202A",
            letterSpacing: "-0.01em",
          }}
        >
          {deptName}
        </span>
        <span
          style={{
            fontSize: 11,
            color: "#667085",
            backgroundColor: "#F7F8FA",
            border: "1px solid #E4E7EC",
            borderRadius: 4,
            padding: "2px 8px",
            fontWeight: 500,
          }}
        >
          Institutional Portal
        </span>
      </div>

      {/* Right: Notification control & user identity */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {/* Notification Bell */}
        <div ref={panelRef} style={{ position: "relative" }}>
          <button
            id="notification-bell"
            onClick={() => setShowNotif((v) => !v)}
            aria-label={`${unread} unread notifications`}
            aria-expanded={showNotif}
            style={{
              position: "relative",
              width: 36,
              height: 36,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 6,
              border: "1px solid #E4E7EC",
              backgroundColor: showNotif ? "#F7F8FA" : "#FFFFFF",
              color: "#17202A",
              cursor: "pointer",
              transition: "background-color 0.15s ease",
            }}
          >
            <Bell size={17} color="#17202A" />
            {unread > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: -4,
                  right: -4,
                  backgroundColor: "#C0392B",
                  color: "#FFFFFF",
                  fontSize: 10,
                  fontWeight: 600,
                  height: 16,
                  minWidth: 16,
                  padding: "0 4px",
                  borderRadius: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "2px solid #FFFFFF",
                }}
              >
                {unread > 99 ? "99+" : unread}
              </span>
            )}
          </button>

          {showNotif && (
            <div
              role="dialog"
              aria-label="Notifications"
              style={{
                position: "absolute",
                right: 0,
                top: 44,
                width: 380,
                backgroundColor: "#FFFFFF",
                border: "1px solid #E4E7EC",
                borderRadius: 8,
                boxShadow: "0 10px 25px -5px rgba(16, 24, 40, 0.08), 0 4px 6px -2px rgba(16, 24, 40, 0.04)",
                zIndex: 50,
                overflow: "hidden",
              }}
            >
              {/* Header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 16px",
                  borderBottom: "1px solid #E4E7EC",
                  backgroundColor: "#F7F8FA",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontWeight: 600, fontSize: 13, color: "#17202A" }}>
                    Notifications
                  </span>
                  {unread > 0 && (
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        backgroundColor: "#EFF6FF",
                        color: "#2F6FED",
                        padding: "1px 6px",
                        borderRadius: 10,
                      }}
                    >
                      {unread} new
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {unread > 0 && (
                    <button
                      onClick={markAllRead}
                      style={{
                        fontSize: 12,
                        color: "#2F6FED",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontWeight: 500,
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        padding: 0,
                      }}
                    >
                      <Check size={12} /> Mark all read
                    </button>
                  )}
                  <button
                    onClick={() => setShowNotif(false)}
                    aria-label="Close notifications"
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 2,
                      color: "#667085",
                      display: "flex",
                    }}
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>

              {/* Notifications list */}
              <div style={{ maxHeight: 360, overflowY: "auto" }}>
                {localNotifs.length === 0 ? (
                  <div style={{ padding: "32px 16px", textAlign: "center" }}>
                    <Bell size={28} style={{ color: "#98A2B3", margin: "0 auto 8px" }} />
                    <div style={{ fontSize: 13, fontWeight: 500, color: "#17202A" }}>
                      All caught up
                    </div>
                    <div style={{ fontSize: 12, color: "#667085", marginTop: 2 }}>
                      No unread academic notices or alerts.
                    </div>
                  </div>
                ) : (
                  localNotifs.slice(0, 20).map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleNotificationClick(n.id, n.isRead)}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 12,
                        padding: "12px 16px",
                        borderBottom: "1px solid #F2F4F7",
                        backgroundColor: n.isRead ? "#FFFFFF" : "#F7F8FA",
                        cursor: "pointer",
                        transition: "background-color 0.15s ease",
                      }}
                    >
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          backgroundColor: n.isRead
                            ? "transparent"
                            : (EVENT_COLORS[n.eventType] ?? "#2F6FED"),
                          flexShrink: 0,
                          marginTop: 5,
                        }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: n.isRead ? 500 : 600,
                            color: "#17202A",
                            marginBottom: 2,
                          }}
                        >
                          {n.title}
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            color: "#667085",
                            lineHeight: 1.4,
                            marginBottom: 4,
                          }}
                        >
                          {n.message}
                        </div>
                        <div style={{ fontSize: 11, color: "#98A2B3" }}>
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
                    borderTop: "1px solid #E4E7EC",
                    backgroundColor: "#FFFFFF",
                    textAlign: "center",
                  }}
                >
                  <Link
                    href="/faculty/notifications"
                    onClick={() => setShowNotif(false)}
                    style={{
                      fontSize: 12,
                      color: "#2F6FED",
                      textDecoration: "none",
                      fontWeight: 600,
                    }}
                  >
                    View All Notifications →
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Minimal User Profile Area */}
        {session?.user && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              paddingLeft: 12,
              borderLeft: "1px solid #E4E7EC",
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                backgroundColor: "#173B67",
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                fontWeight: 600,
                flexShrink: 0,
              }}
            >
              {getInitials(session.user.name ?? "User")}
            </div>
            <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.2 }}>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#17202A",
                  maxWidth: 130,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {session.user.name}
              </span>
              <span style={{ fontSize: 11, color: "#667085" }}>
                {getRoleLabel(session.user.role)}
              </span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}