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
    positive: "#D02020",
    warning: "#D02020",
    danger: "#D02020",
    neutral: "#121212",
  };

  return (
    <div
      className={`card ${className}`}
      style={{
        backgroundColor: "#FFFFFF",
        border: "3px solid #121212",
        borderRadius: 0,
        padding: "18px 20px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        minHeight: 110,
        boxShadow: "6px 6px 0px 0px #121212",
        position: "relative",
        overflow: "hidden",
        transition: "transform 0.15s ease-out, box-shadow 0.15s ease-out",
        ...style,
      }}
    >
      {/* Bauhaus geometric corner accent (Square or Circle in Primary Color) */}
      <div 
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          width: 10,
          height: 10,
          borderRadius: 0,
          backgroundColor: trendType === "positive" ? "#D02020" : trendType === "warning" ? "#F0C020" : "#1040C0",
          border: "1.5px solid #121212",
          pointerEvents: "none"
        }}
      />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 8,
          paddingRight: 16,
        }}
      >
        <span
          style={{
            fontSize: 11.5,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "#121212",
            fontFamily: "var(--font-body)",
          }}
        >
          {label}
        </span>
        {icon && (
          <div
            style={{
              color: "#121212",
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
            fontSize: 32,
            fontWeight: 900,
            color: "#121212",
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            fontFamily: "var(--font-display)",
          }}
        >
          {value}
        </div>

        {context && (
          <div
            style={{
              fontSize: 11.5,
              fontWeight: 600,
              color: "#424245",
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
