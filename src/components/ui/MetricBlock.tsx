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
    positive: "#16A34A",
    warning: "#D97706",
    danger: "#E11D48",
    neutral: "#6E6E73",
  };

  return (
    <div
      className={`tech-card ${className}`}
      style={{
        backgroundColor: "#FFFFFF",
        border: "1px solid #E8E8ED",
        borderRadius: 10,
        padding: "16px 18px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        minHeight: 100,
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
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
          width: 20,
          height: 20,
          borderRight: "1px solid #E8E8ED",
          borderTop: "1px solid #E8E8ED",
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
            color: "#6E6E73",
            fontFamily: "var(--font-mono)",
          }}
        >
          {label}
        </span>
        {icon && (
          <div
            style={{
              color: "#1D1D1F",
              opacity: 0.8,
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
            color: "#1D1D1F",
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
