"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, X, Check, Activity } from "lucide-react";
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

// Cyber event color palette
const EVENT_COLORS: Record<string, string> = {
  TASK_ASSIGNED: "#38BDF8",        // Cyber Cyan
  TASK_OVERDUE: "#F43F5E",         // Critical Red
  LEAVE_APPROVED: "#22C55E",       // Online Green
  LEAVE_REJECTED: "#F43F5E",       // Critical Red
  STARS_AWARDED: "#FFD700",        // BMSIT Gold
  BADGE_EARNED: "#FFD700",         // BMSIT Gold
  EVALUATION_RECEIVED: "#818CF8",  // Electric Indigo
  ROLE_CHANGED: "#38BDF8",         // Cyber Cyan
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

  const deptName = process.env.NEXT_PUBLIC_DEPARTMENT_NAME ?? "Dept. of Computer Science & Engineering";

  return (
    <header
      role="banner"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 30,
        height: 60,
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid var(--grey-100, #E8E8ED)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 28px",
      }}
    >
      {/* Left: BMSIT Coding Club Live Telemetry Ribbon */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div className="hero-status-row" style={{ margin: 0, fontSize: 11 }}>
          <span className="hero-status-led" />
          <span className="hero-status-label" style={{ fontWeight: 600, color: "var(--grey-800, #1D1D1F)" }}>SYSTEM ONLINE</span>
          <span className="hero-status-divider">·</span>
          <span className="hero-status-label">BMSIT // {deptName.includes("Computer") ? "CSE" : "INSTITUTE"}</span>
          <span className="hero-status-divider">·</span>
          <span className="hero-status-label" style={{ fontWeight: 600, color: "var(--grey-800, #1D1D1F)" }}>AY 2026-27</span>
        </div>
      </div>

      {/* Right: Notification control & user identity */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        {/* Monospace Quick Status Chip */}
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "var(--grey-600, #424245)",
            padding: "4px 10px",
            borderRadius: 6,
            background: "var(--grey-50, #F5F5F7)",
            border: "1px solid var(--grey-200, #D2D2D7)",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <Activity size={12} color="#0284c7" />
          <span>AUTONOMOUS VTU</span>
        </div>

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
              borderRadius: 8,
              border: "1px solid " + (showNotif ? "var(--grey-800, #1D1D1F)" : "var(--grey-200, #D2D2D7)"),
              backgroundColor: showNotif ? "var(--grey-100, #E8E8ED)" : "var(--white, #FFFFFF)",
              color: "var(--grey-800, #1D1D1F)",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            <Bell size={17} />
            {unread > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: -3,
                  right: -3,
                  backgroundColor: "var(--grey-900, #0A0A0A)",
                  color: "#FFFFFF",
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  fontWeight: 700,
                  height: 16,
                  minWidth: 16,
                  padding: "0 4px",
                  borderRadius: 8,
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
                top: 46,
                width: 390,
                backgroundColor: "#FFFFFF",
                border: "1px solid var(--grey-200, #D2D2D7)",
                borderRadius: 14,
                boxShadow: "0 20px 50px -12px rgba(0, 0, 0, 0.15)",
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
                  borderBottom: "1px solid var(--grey-100, #E8E8ED)",
                  backgroundColor: "var(--grey-50, #F5F5F7)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 11, color: "var(--grey-800, #1D1D1F)", letterSpacing: "0.06em" }}>
                    // NOTIFICATIONS
                  </span>
                  {unread > 0 && (
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 10,
                        fontWeight: 700,
                        backgroundColor: "var(--grey-800, #1D1D1F)",
                        color: "#FFFFFF",
                        padding: "1px 6px",
                        borderRadius: 4,
                      }}
                    >
                      {unread} NEW
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {unread > 0 && (
                    <button
                      onClick={markAllRead}
                      style={{
                        fontSize: 11,
                        fontFamily: "var(--font-mono)",
                        color: "var(--grey-600, #424245)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        padding: 0,
                      }}
                    >
                      <Check size={12} /> MARK READ
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
                      color: "var(--grey-400, #86868B)",
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
                  <div style={{ padding: "36px 16px", textAlign: "center" }}>
                    <Bell size={28} style={{ color: "var(--grey-300, #B0B0B5)", margin: "0 auto 8px" }} />
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--grey-700, #2D2D2D)", fontFamily: "var(--font-mono)" }}>
                      ALL CAUGHT UP
                    </div>
                    <div style={{ fontSize: 12, color: "var(--grey-500, #6E6E73)", marginTop: 4 }}>
                      No unread academic notices or alerts.
                    </div>
                  </div>
                ) : (
                  localNotifs.slice(0, 20).map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleNotificationClick(n.id, n.isRead)}
                      className="cyber-row-hover"
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 12,
                        padding: "12px 16px",
                        borderBottom: "1px solid var(--grey-100, #E8E8ED)",
                        backgroundColor: n.isRead ? "transparent" : "var(--grey-50, #F5F5F7)",
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
                            ? "var(--grey-300, #B0B0B5)"
                            : (EVENT_COLORS[n.eventType] ?? "#0284c7"),
                          boxShadow: n.isRead ? "none" : `0 0 6px ${EVENT_COLORS[n.eventType] ?? "#0284c7"}`,
                          flexShrink: 0,
                          marginTop: 5,
                        }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: n.isRead ? 500 : 700,
                            color: n.isRead ? "var(--grey-500, #6E6E73)" : "var(--grey-900, #0A0A0A)",
                            marginBottom: 2,
                          }}
                        >
                          {n.title}
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            color: "var(--grey-600, #424245)",
                            lineHeight: 1.4,
                            marginBottom: 4,
                          }}
                        >
                          {n.message}
                        </div>
                        <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--grey-400, #86868B)" }}>
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
                    borderTop: "1px solid var(--grey-100, #E8E8ED)",
                    backgroundColor: "var(--grey-50, #F5F5F7)",
                    textAlign: "center",
                  }}
                >
                  <Link
                    href="/faculty/notifications"
                    onClick={() => setShowNotif(false)}
                    style={{
                      fontSize: 11,
                      fontFamily: "var(--font-mono)",
                      color: "var(--grey-800, #1D1D1F)",
                      textDecoration: "none",
                      fontWeight: 600,
                      letterSpacing: "0.04em",
                    }}
                  >
                    VIEW ALL NOTIFICATIONS →
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Identity Chip */}
        {session?.user && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              paddingLeft: 12,
              borderLeft: "1px solid var(--grey-200, #D2D2D7)",
            }}
          >
            <div
              className="avatar"
              style={{
                width: 32,
                height: 32,
                backgroundColor: "var(--grey-800, #1D1D1F)",
                color: "#FFFFFF",
                fontSize: 11,
                fontWeight: 700,
                fontFamily: "var(--font-mono)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "50%",
                flexShrink: 0,
              }}
            >
              {getInitials(session.user.name ?? "User")}
            </div>
            <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.2 }}>
              <span
                style={{
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: "var(--grey-900, #0A0A0A)",
                  maxWidth: 130,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {session.user.name}
              </span>
              <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--grey-500, #6E6E73)", letterSpacing: "0.04em" }}>
                {getRoleLabel(session.user.role)}
              </span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}