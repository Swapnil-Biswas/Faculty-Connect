"use client";

import React from "react";

interface HeroStat {
  label: string;
  value: string | number;
  color?: string;
}

interface DotMatrixHeroProps {
  titleLine1: string;
  titleLine2: string;
  eyebrow?: string;
  tagline?: string;
  stats?: HeroStat[];
  color1?: string;
  color2?: string;
  className?: string;
}

export function DotMatrixHero({
  titleLine1,
  titleLine2,
  eyebrow = "// 01 NODE · BMSIT CSE ACADEMIC OS",
  tagline = "Autonomous Academic Synchronization & Merit Appraisal Engine",
  stats,
  className = "",
}: DotMatrixHeroProps) {
  return (
    <div
      className={`bauhaus-hero-banner ${className}`}
      style={{
        padding: "28px 32px",
        marginBottom: 28,
        background: "#FFFFFF",
        border: "4px solid #121212",
        borderRadius: 0,
        position: "relative",
        overflow: "hidden",
        boxShadow: "8px 8px 0px 0px #121212",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto",
          gap: 28,
          alignItems: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Left: Constructivist Title & Meta */}
        <div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 14,
              backgroundColor: "#F0C020",
              border: "2px solid #121212",
              boxShadow: "3px 3px 0px 0px #121212",
              padding: "4px 10px",
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: "#D02020",
              }}
            />
            <span
              style={{
                fontSize: 11,
                fontWeight: 900,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#121212",
              }}
            >
              {eyebrow}
            </span>
          </div>

          {/* Constructivist Display Headlines */}
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 0.95, marginBottom: 12 }}>
            <span
              style={{
                fontSize: 44,
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: "-0.03em",
                color: "#121212",
              }}
            >
              {titleLine1}
            </span>
            <span
              style={{
                fontSize: 44,
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: "-0.03em",
                color: "#1040C0",
              }}
            >
              {titleLine2}
            </span>
          </div>

          <p
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: "#424245",
              margin: 0,
              maxWidth: 540,
              lineHeight: 1.5,
            }}
          >
            {tagline}
          </p>

          {/* Quick Metrics Grid */}
          {stats && stats.length > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "stretch",
                gap: 12,
                marginTop: 20,
                paddingTop: 16,
                borderTop: "3px solid #121212",
                flexWrap: "wrap",
              }}
            >
              {stats.map((s, idx) => {
                const borderAccent =
                  idx % 3 === 0 ? "#D02020" : idx % 3 === 1 ? "#1040C0" : "#F0C020";
                return (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                      padding: "8px 14px",
                      background: "#F0F0F0",
                      border: "2px solid #121212",
                      borderTop: `4px solid ${borderAccent}`,
                      boxShadow: "3px 3px 0px 0px #121212",
                      minWidth: 110,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 22,
                        fontWeight: 900,
                        color: "#121212",
                        lineHeight: 1,
                      }}
                    >
                      {s.value}
                    </span>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        color: "#424245",
                      }}
                    >
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Bauhaus Geometric Art Composition */}
        <div
          style={{
            width: 180,
            height: 180,
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
          aria-hidden="true"
        >
          {/* Blue background square */}
          <div
            style={{
              position: "absolute",
              width: 120,
              height: 120,
              background: "#1040C0",
              border: "3px solid #121212",
              boxShadow: "4px 4px 0px 0px #121212",
              top: 10,
              left: 10,
            }}
          />
          {/* Yellow circle overlapping */}
          <div
            style={{
              position: "absolute",
              width: 110,
              height: 110,
              borderRadius: "50%",
              background: "#F0C020",
              border: "3px solid #121212",
              boxShadow: "4px 4px 0px 0px #121212",
              bottom: 10,
              right: 10,
            }}
          />
          {/* Red 45deg rotated diamond */}
          <div
            style={{
              position: "absolute",
              width: 56,
              height: 56,
              background: "#D02020",
              border: "3px solid #121212",
              transform: "rotate(45deg)",
              boxShadow: "3px 3px 0px 0px #121212",
            }}
          />
          {/* Center stark white square with triangle */}
          <div
            style={{
              position: "absolute",
              width: 28,
              height: 28,
              background: "#FFFFFF",
              border: "2px solid #121212",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 0,
                height: 0,
                borderLeft: "6px solid transparent",
                borderRight: "6px solid transparent",
                borderBottom: "10px solid #121212",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default DotMatrixHero;
