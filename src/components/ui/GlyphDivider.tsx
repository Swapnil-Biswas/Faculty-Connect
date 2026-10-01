"use client";

import React from "react";

interface GlyphDividerProps {
  label?: string;
  variant?: "default" | "compact";
  className?: string;
}

export function GlyphDivider({
  label,
  variant = "default",
  className = "",
}: GlyphDividerProps) {
  return (
    <div
      className={`glyph-divider ${variant === "compact" ? "glyph-divider-compact" : ""} ${className}`}
      aria-hidden="true"
    >
      <div className="glyph-row">
        <span className="glyph-dot glyph-long" />
        <span className="glyph-dot" />
        <span className="glyph-dot" />
        <span className="glyph-dot glyph-tiny" />
        <span className="glyph-dot" />
        {label && <span className="glyph-label">{label}</span>}
        <span className="glyph-dot" />
        <span className="glyph-dot glyph-tiny" />
        <span className="glyph-dot" />
        <span className="glyph-dot" />
        <span className="glyph-dot glyph-long" />
      </div>
    </div>
  );
}

export default GlyphDivider;
