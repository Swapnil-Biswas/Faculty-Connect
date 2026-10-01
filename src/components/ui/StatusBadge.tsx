import React from "react";
import {
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  PlayCircle,
  MinusCircle,
  FileText,
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
    icon: React.ComponentType<{ size?: number; color?: string; style?: React.CSSProperties }>;
  }
> = {
  COMPLETED: {
    label: "Completed",
    color: "#198754",
    bg: "#F0FDF4",
    border: "#BBF7D0",
    icon: Check,
  },
  APPROVED: {
    label: "Approved",
    color: "#198754",
    bg: "#F0FDF4",
    border: "#BBF7D0",
    icon: CheckCircle2,
  },
  ACTIVE: {
    label: "Active",
    color: "#198754",
    bg: "#F0FDF4",
    border: "#BBF7D0",
    icon: CheckCircle2,
  },
  PENDING: {
    label: "Pending",
    color: "#B7791F",
    bg: "#FEFCE8",
    border: "#FEF08A",
    icon: Clock,
  },
  OPEN: {
    label: "Open",
    color: "#2F6FED",
    bg: "#EFF6FF",
    border: "#BFDBFE",
    icon: Clock,
  },
  IN_PROGRESS: {
    label: "In Progress",
    color: "#2F6FED",
    bg: "#EFF6FF",
    border: "#BFDBFE",
    icon: PlayCircle,
  },
  OVERDUE: {
    label: "Overdue",
    color: "#C0392B",
    bg: "#FEF2F2",
    border: "#FECDCA",
    icon: AlertTriangle,
  },
  REJECTED: {
    label: "Rejected",
    color: "#C0392B",
    bg: "#FEF2F2",
    border: "#FECDCA",
    icon: XCircle,
  },
  CANCELLED: {
    label: "Cancelled",
    color: "#667085",
    bg: "#F2F4F7",
    border: "#E4E7EC",
    icon: MinusCircle,
  },
  INACTIVE: {
    label: "Inactive",
    color: "#667085",
    bg: "#F2F4F7",
    border: "#E4E7EC",
    icon: MinusCircle,
  },
  DRAFT: {
    label: "Draft",
    color: "#667085",
    bg: "#F2F4F7",
    border: "#E4E7EC",
    icon: FileText,
  },
};

export function StatusBadge({
  status,
  label,
  size = "md",
  showIcon = true,
  className = "",
}: StatusBadgeProps) {
  const normKey = (status || "").toUpperCase().replace(/[\s-]/g, "_");
  const config = STATUS_CONFIG[normKey] || {
    label: status ? status.replace(/_/g, " ") : "Unknown",
    color: "#667085",
    bg: "#F2F4F7",
    border: "#E4E7EC",
    icon: MinusCircle,
  };

  const displayText = label || config.label;
  const IconComponent = config.icon;
  const isSm = size === "sm";

  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: isSm ? 3 : 5,
        padding: isSm ? "2px 6px" : "3px 8px",
        borderRadius: 4,
        fontSize: isSm ? 11 : 12,
        fontWeight: 500,
        lineHeight: 1.2,
        color: config.color,
        backgroundColor: config.bg,
        border: `1px solid ${config.border}`,
        whiteSpace: "nowrap",
      }}
    >
      {showIcon && <IconComponent size={isSm ? 12 : 13} color={config.color} />}
      <span>{displayText}</span>
    </span>
  );
}
