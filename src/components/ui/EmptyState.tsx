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
        border: "3px solid #121212",
        borderRadius: 0,
        boxShadow: "4px 4px 0px 0px #121212",
        position: "relative",
      }}
    >
      {Icon && (
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 0,
            backgroundColor: "#F0C020",
            border: "2px solid #121212",
            boxShadow: "2px 2px 0px 0px #121212",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 14,
            color: "#121212",
          }}
        >
          <Icon size={22} strokeWidth={2.5} />
        </div>
      )}

      <h3
        style={{
          fontSize: 16,
          fontWeight: 900,
          textTransform: "uppercase",
          letterSpacing: "-0.01em",
          color: "#121212",
          margin: "0 0 6px 0",
        }}
      >
        {title}
      </h3>

      {description && (
        <p
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: "#424245",
            margin: "0 0 16px 0",
            maxWidth: 420,
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

export default EmptyState;
