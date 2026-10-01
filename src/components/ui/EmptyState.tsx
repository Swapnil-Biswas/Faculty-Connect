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
        padding: "40px 24px",
        textAlign: "center",
        backgroundColor: "#FFFFFF",
        border: "1px solid #E4E7EC",
        borderRadius: 6,
      }}
    >
      {Icon && (
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            backgroundColor: "#F2F4F7",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 12,
            color: "#667085",
          }}
        >
          <Icon size={22} />
        </div>
      )}

      <h3
        style={{
          fontSize: 15,
          fontWeight: 600,
          color: "#17202A",
          margin: "0 0 4px 0",
        }}
      >
        {title}
      </h3>

      {description && (
        <p
          style={{
            fontSize: 13,
            color: "#667085",
            maxWidth: 380,
            margin: "0 0 16px 0",
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
