import React from "react";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={className}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 24px",
        textAlign: "center",
        backgroundColor: "#FFFFFF",
        border: "1px solid #E4E7EC",
        borderRadius: 8,
        position: "relative",
      }}
    >
      {Icon && (
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 8,
            backgroundColor: "#F2F4F7",
            border: "1px solid #E4E7EC",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 14,
            color: "#173B67",
          }}
        >
          <Icon size={20} />
        </div>
      )}

      <h3
        style={{
          fontSize: 15,
          fontWeight: 600,
          color: "#17202A",
          margin: "0 0 6px 0",
        }}
      >
        {title}
      </h3>

      {description && (
        <p
          style={{
            fontSize: 13,
            color: "#667085",
            margin: "0 0 16px 0",
            maxWidth: 400,
            lineHeight: 1.5,
          }}
        >
          {description}
        </p>
      )}

      {action && <div>{action}</div>}
    </div>
  );
}
