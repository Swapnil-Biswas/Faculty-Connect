import React from "react";
import {
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  PlayCircle,
  Check,
} from "lucide-react";

export type StatusType =
  | "OPEN"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "OVERDUE"
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED"
  | "ACTIVE"
  | "INACTIVE"
  | "DRAFT"
  | "UNREAD"
  | string;

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  size?: "sm" | "md";
  showIcon?: boolean;
  className?: string;
}

const STATUS_CONFIG: Record<
  string,
  {
    label: string;
    color: string;
    bg: string;
    border: string;
    glyph: string;
    icon: React.ComponentType<{ size?: number; color?: string; style?: React.CSSProperties }>;
  }
> = {
  COMPLETED: {
    label: "Completed",
    color: "#4ADE80",
    bg: "rgba(34, 197, 94, 0.1)",
    border: "rgba(34, 197, 94, 0.3)",
    glyph: "◆",
    icon: Check,
  },
  APPROVED: {
    label: "Approved",
    color: "#4ADE80",
    bg: "rgba(34, 197, 94, 0.1)",
    border: "rgba(34, 197, 94, 0.3)",
    glyph: "◆",
    icon: CheckCircle2,
  },
  ACTIVE: {
    label: "Active",
    color: "#4ADE80",
    bg: "rgba(34, 197, 94, 0.1)",
    border: "rgba(34, 197, 94, 0.3)",
    glyph: "◆",
    icon: CheckCircle2,
  },
  PENDING: {
    label: "Pending",
    color: "#FCD34D",
    bg: "rgba(245, 158, 11, 0.1)",
    border: "rgba(245, 158, 11, 0.3)",
    glyph: "◈",
    icon: Clock,
  },
  OPEN: {
    label: "Open",
    color: "#38BDF8",
    bg: "rgba(14, 165, 233, 0.1)",
    border: "rgba(14, 165, 233, 0.3)",
    glyph: "▣",
    icon: Clock,
  },
  IN_PROGRESS: {
    label: "In Progress",
    color: "#38BDF8",
    bg: "rgba(14, 165, 233, 0.1)",
    border: "rgba(14, 165, 233, 0.3)",
    glyph: "▣",
    icon: PlayCircle,
  },
  OVERDUE: {
    label: "Overdue",
    color: "#FB7185",
    bg: "rgba(244, 63, 94, 0.1)",
    border: "rgba(244, 63, 94, 0.35)",
    glyph: "▲",
    icon: AlertTriangle,
  },
  REJECTED: {
    label: "Rejected",
    color: "#FB7185",
    bg: "rgba(244, 63, 94, 0.1)",
    border: "rgba(244, 63, 94, 0.35)",
    glyph: "✕",
    icon: XCircle,
  },
  CANCELLED: {
    label: "Cancelled",
    color: "#94A3B8",
    bg: "rgba(100, 116, 139, 0.1)",
    border: "rgba(100, 116, 139, 0.25)",
    glyph: "—",
    icon: XCircle,
  },
  INACTIVE: {
    label: "Inactive",
    color: "#94A3B8",
    bg: "rgba(100, 116, 139, 0.1)",
    border: "rgba(100, 116, 139, 0.25)",
    glyph: "—",
    icon: Clock,
  },
  DRAFT: {
    label: "Draft",
    color: "#A78BFA",
    bg: "rgba(129, 140, 248, 0.1)",
    border: "rgba(129, 140, 248, 0.3)",
    glyph: "◇",
    icon: Clock,
  },
  UNREAD: {
    label: "Unread",
    color: "#FFD700",
    bg: "rgba(255, 215, 0, 0.1)",
    border: "rgba(255, 215, 0, 0.35)",
    glyph: "●",
    icon: Clock,
  },
};

export function StatusBadge({
  status,
  label,
  size = "md",
  showIcon = true,
  className = "",
}: StatusBadgeProps) {
  const normKey = (status || "").toUpperCase().replace(/[-\s]/g, "_");
  const cfg = STATUS_CONFIG[normKey] || {
    label: status,
    color: "#94A3B8",
    bg: "rgba(255, 255, 255, 0.05)",
    border: "rgba(255, 255, 255, 0.1)",
    glyph: "●",
    icon: Clock,
  };

  const IconComp = cfg.icon;
  const displayText = label || cfg.label;

  const isSm = size === "sm";

  return (
    <span
      className={`status-badge ${className}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: isSm ? 4 : 5,
        padding: isSm ? "2px 7px" : "3px 9px",
        borderRadius: 4,
        fontSize: isSm ? 10.5 : 11.5,
        fontWeight: 600,
        fontFamily: "var(--font-mono)",
        letterSpacing: "0.04em",
        color: cfg.color,
        backgroundColor: cfg.bg,
        border: `1px solid ${cfg.border}`,
        whiteSpace: "nowrap",
        lineHeight: 1.2,
      }}
    >
      <span style={{ fontSize: isSm ? 8 : 9, opacity: 0.85 }}>{cfg.glyph}</span>
      {showIcon && <IconComp size={isSm ? 11 : 12} />}
      <span>{displayText}</span>
    </span>
  );
}
