"use client";

import React from "react";

export interface TabItem {
  id: string;
  label: string;
  count?: number;
}

interface TabsProps {
  tabs: TabItem[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
}

export function Tabs({ tabs, active, onChange, className = "" }: TabsProps) {
  return (
    <div className={`tabs ${className}`} role="tablist">
      {tabs.map((t) => {
        const isActive = active === t.id;
        return (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={`tab ${isActive ? "is-active" : ""}`}
            onClick={() => onChange(t.id)}
          >
            {t.label}
            {typeof t.count === "number" && (
              <span className="tab-count">{t.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default Tabs;
