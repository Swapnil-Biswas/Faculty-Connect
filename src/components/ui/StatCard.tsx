"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  trend?: { value: number; label: string };
  icon: React.ReactNode;
  iconBg?: string;
  glowColor?: string;
  className?: string;
}

export function StatCard({ label, value, trend, icon, iconBg, className }: StatCardProps) {
  return (
    <div
      className={cn("card", className)}
      style={{
        backgroundColor: "#FFFFFF",
        border: "3px solid #121212",
        borderRadius: 0,
        padding: "20px",
        boxShadow: "6px 6px 0px 0px #121212",
        position: "relative",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 0,
            border: "2px solid #121212",
            background: iconBg ?? "#F0C020",
            color: "#121212",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "2px 2px 0px 0px #121212",
          }}
        >
          {icon}
        </div>

        {trend != null && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase",
              padding: "2px 6px",
              border: "1.5px solid #121212",
              backgroundColor: trend.value > 0 ? "#DCFCE7" : "#FEE2E2",
              color: trend.value > 0 ? "#166534" : "#991B1B",
            }}
          >
            {trend.value > 0 ? (
              <TrendingUp size={12} />
            ) : trend.value < 0 ? (
              <TrendingDown size={12} />
            ) : (
              <Minus size={12} />
            )}
            {trend.label}
          </div>
        )}
      </div>

      <div style={{ fontSize: 32, fontWeight: 900, color: "#121212", lineHeight: 1.1, letterSpacing: "-0.02em" }}>
        {value}
      </div>
      <div style={{ fontSize: 11.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#121212", marginTop: 4 }}>
        {label}
      </div>
    </div>
  );
}