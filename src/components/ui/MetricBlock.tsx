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
    positive: "#198754",
    warning: "#B7791F",
    danger: "#C0392B",
    neutral: "#667085",
  };

  return (
    <div
      className={className}
      style={{
        backgroundColor: "#FFFFFF",
        border: "1px solid #E4E7EC",
        borderRadius: 6,
        padding: "16px 18px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        minHeight: 96,
        boxShadow: "0 1px 2px 0 rgba(16, 24, 40, 0.04)",
        ...style,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 6,
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            color: "#667085",
          }}
        >
          {label}
        </span>
        {icon && (
          <div
            style={{
              color: "#173B67",
              opacity: 0.85,
            }}
          >
            {icon}
          </div>
        )}
      </div>

      <div>
        <div
          style={{
            fontSize: 26,
            fontWeight: 700,
            color: "#17202A",
            lineHeight: 1.15,
            fontFamily: "Inter, sans-serif",
            letterSpacing: "-0.01em",
          }}
        >
          {value}
        </div>

        {context && (
          <div
            style={{
              fontSize: 12,
              fontWeight: 500,
              color: trendColors[trendType],
              marginTop: 4,
            }}
          >
            {context}
          </div>
        )}
      </div>
    </div>
  );
}
