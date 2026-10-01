import React from "react";

interface MetricBlockProps {
  label: string;
  value: string | number;
  context?: string;
  trendType?: "positive" | "warning" | "danger" | "neutral";
  icon?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function MetricBlock({
  label,
  value,
  context,
  trendType = "neutral",
  icon,
  className = "",
  style = {},
}: MetricBlockProps) {
  const trendColors = {
    positive: "#22C55E",
    warning: "#F59E0B",
    danger: "#F43F5E",
    neutral: "#94A3B8",
  };

  return (
    <div
      className={`tech-card ${className}`}
      style={{
        backgroundColor: "#0E121B",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: 10,
        padding: "16px 18px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        minHeight: 100,
        boxShadow: "0 4px 14px -2px rgba(0, 0, 0, 0.5)",
        position: "relative",
        overflow: "hidden",
        transition: "all 0.2s ease",
        ...style,
      }}
    >
      {/* Corner crosshair accent */}
      <div 
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: 24,
          height: 24,
          borderRight: "1px solid rgba(255, 215, 0, 0.2)",
          borderTop: "1px solid rgba(255, 215, 0, 0.2)",
          pointerEvents: "none"
        }}
      />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <span
          style={{
            fontSize: 10.5,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            color: "#64748B",
            fontFamily: "var(--font-mono)",
          }}
        >
          {label}
        </span>
        {icon && (
          <div
            style={{
              color: "#FFD700",
              opacity: 0.9,
              display: "flex",
              alignItems: "center",
            }}
          >
            {icon}
          </div>
        )}
      </div>

      <div>
        <div
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: "#F8FAFC",
            lineHeight: 1.1,
            fontFamily: "var(--font-mono)",
            letterSpacing: "-0.02em",
          }}
        >
          {value}
        </div>

        {context && (
          <div
            style={{
              fontSize: 11.5,
              fontWeight: 500,
              fontFamily: "var(--font-mono)",
              color: trendColors[trendType],
              marginTop: 6,
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            {context}
          </div>
        )}
      </div>
    </div>
  );
}
