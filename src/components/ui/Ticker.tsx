"use client";

import React from "react";

interface TickerProps {
  items: string[];
  speed?: number;
  className?: string;
  separator?: string;
}

export function Ticker({
  items,
  speed = 40,
  className = "",
  separator = "◆",
}: TickerProps) {
  const doubled = [...items, ...items, ...items, ...items];
  return (
    <div className={`ticker ${className}`} aria-hidden="true">
      <div
        className="ticker-track"
        style={{ animationDuration: `${Math.max(20, items.length * speed)}s` }}
      >
        {doubled.map((item, i) => (
          <span key={i} className="ticker-item">
            <span className="ticker-text">{item}</span>
            <span className="ticker-sep">{separator}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export default Ticker;
