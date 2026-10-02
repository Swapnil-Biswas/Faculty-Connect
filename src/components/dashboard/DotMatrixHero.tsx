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
  color1 = "#1d1d1f",
  color2 = "#424245",
  className = "",
}: DotMatrixHeroProps) {
  return (
    <div
      className={`tech-card ${className}`}
      style={{
        padding: "24px 28px",
        marginBottom: 24,
        background: "#ffffff",
        border: "1px solid #e8e8ed",
        borderRadius: 14,
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 2px 12px rgba(0, 0, 0, 0.04)",
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
          background: "radial-gradient(circle, rgba(0, 0, 0, 0.025) 0%, transparent 70%)",
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
                color: "#6e6e73",
              }}
            >
              {eyebrow}
            </span>
          </div>

          {/* 5x7 Dot Matrix Display */}
          <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 12 }}>
            <DotMatrixCanvas
              text={titleLine1}
              fontSize={48}
              color={color1}
            />
            <DotMatrixCanvas
              text={titleLine2}
              fontSize={48}
              color={color2}
            />
          </div>

          <p
            style={{
              fontSize: 13,
              color: "#6e6e73",
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
                borderTop: "1px solid #e8e8ed",
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
                      color: s.color || "#1d1d1f",
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
                      color: "#86868b",
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
            color="#1d1d1f"
            accentColor="#0284c7"
          />
        </div>
      </div>
    </div>
  );
}

export default DotMatrixHero;
