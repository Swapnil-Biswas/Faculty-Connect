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

export function StatCard({ label, value, trend, icon, iconBg, glowColor, className }: StatCardProps) {
  return (
    <div className={cn("stat-card", className)}>
      {glowColor && (
        <div
          className="stat-card-glow"
          style={{ background: glowColor }}
          aria-hidden="true"
        />
      )}

      <div
        className="stat-card-icon"
        style={{ background: iconBg ?? "hsl(var(--color-primary) / 0.1)", color: "hsl(var(--color-primary))" }}
      >
        {icon}
      </div>

      <div className="stat-card-value">{value}</div>
      <div className="stat-card-label">{label}</div>

      {trend != null && (
        <div
          className={cn(
            "stat-card-trend",
            trend.value > 0 ? "trend-up" : trend.value < 0 ? "trend-down" : ""
          )}
          style={{ display: "flex", alignItems: "center", gap: 4 }}
        >
          {trend.value > 0 ? (
            <TrendingUp size={13} />
          ) : trend.value < 0 ? (
            <TrendingDown size={13} />
          ) : (
            <Minus size={13} />
          )}
          {trend.label}
        </div>
      )}
    </div>
  );
}