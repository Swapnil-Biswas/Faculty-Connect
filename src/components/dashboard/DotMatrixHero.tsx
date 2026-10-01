"use client";

import React from "react";
import { DotMatrixCanvas } from "@/components/ui/DotMatrixCanvas";
import { DotMatrixPattern } from "@/components/ui/DotMatrixPattern";

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
  color1 = "#FFD700",
  color2 = "#38BDF8",
  className = "",
}: DotMatrixHeroProps) {
  return (
    <div
      className={`tech-card ${className}`}
      style={{
        padding: "24px 28px",
        marginBottom: 24,
        background: "linear-gradient(135deg, rgba(14, 18, 27, 0.95) 0%, rgba(7, 9, 14, 0.98) 100%)",
        border: "1px solid rgba(255, 215, 0, 0.2)",
        borderRadius: 14,
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 8px 32px -4px rgba(0, 0, 0, 0.5)",
      }}
    >
      {/* Background ambient corner glow */}
      <div
        style={{
          position: "absolute",
          top: -60,
          right: -60,
          width: 240,
          height: 240,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255, 215, 0, 0.12) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto",
          gap: 24,
          alignItems: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Left: Dot Matrix Title & Telemetry */}
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 14,
            }}
          >
            <span className="tech-led led-green" />
            <span
              style={{
                fontFamily: "var(--font-mono, monospace)",
                fontSize: 10.5,
                fontWeight: 600,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "#FFD700",
              }}
            >
              {eyebrow}
            </span>
          </div>

          {/* 5x7 Dot Matrix Display */}
          <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 12 }}>
            <DotMatrixCanvas
              text={titleLine1}
              fontSize={44}
              color={color1}
            />
            <DotMatrixCanvas
              text={titleLine2}
              fontSize={44}
              color={color2}
            />
          </div>

          <p
            style={{
              fontSize: 13,
              color: "#94A3B8",
              margin: 0,
              maxWidth: 480,
              lineHeight: 1.5,
              fontFamily: "var(--font-sans, sans-serif)",
            }}
          >
            {tagline}
          </p>

          {/* Optional inline quick metrics */}
          {stats && stats.length > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 18,
                marginTop: 18,
                paddingTop: 14,
                borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                flexWrap: "wrap",
              }}
            >
              {stats.map((s, idx) => (
                <div key={idx} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <span
                    style={{
                      fontFamily: "var(--font-mono, monospace)",
                      fontSize: 18,
                      fontWeight: 700,
                      color: s.color || "#F8FAFC",
                      lineHeight: 1.1,
                    }}
                  >
                    {s.value}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-mono, monospace)",
                      fontSize: 9.5,
                      fontWeight: 600,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: "#64748B",
                    }}
                  >
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Interactive 3D Dot Matrix Fibonacci Sphere */}
        <div
          style={{
            width: 240,
            height: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <DotMatrixPattern
            style={{ width: 240, height: 200 }}
            color="#FFD700"
            accentColor="#38BDF8"
          />
        </div>
      </div>
    </div>
  );
}

export default DotMatrixHero;
