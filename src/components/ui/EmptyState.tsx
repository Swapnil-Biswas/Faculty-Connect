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
      className={`tech-card ${className}`}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 24px",
        textAlign: "center",
        backgroundColor: "#0E121B",
        border: "1px dashed rgba(255, 255, 255, 0.12)",
        borderRadius: 12,
        position: "relative",
      }}
    >
      {Icon ? (
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 10,
            backgroundColor: "rgba(255, 215, 0, 0.08)",
            border: "1px solid rgba(255, 215, 0, 0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 14,
            color: "#FFD700",
            boxShadow: "0 0 16px rgba(255, 215, 0, 0.1)",
          }}
        >
          <Icon size={22} />
        </div>
      ) : (
        <div className="empty-glyph" style={{ display: "flex", gap: 6, marginBottom: 18 }} aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
      )}

      <h3
        style={{
          fontSize: 15,
          fontWeight: 700,
          color: "#F8FAFC",
          fontFamily: "var(--font-mono)",
          margin: "0 0 6px 0",
          letterSpacing: "-0.01em",
        }}
      >
        {title}
      </h3>

      {description && (
        <p
          style={{
            fontSize: 13,
            color: "#94A3B8",
            margin: "0 0 16px 0",
            maxWidth: 360,
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
