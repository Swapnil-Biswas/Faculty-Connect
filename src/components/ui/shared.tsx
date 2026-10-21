"use client";

import { useEffect, useRef, type ReactNode } from "react";

/* Bauhaus shared UI primitives */

export function Spinner({ label = "Loading" }: { label?: string }) {
  return (
    <div className="loading-row" role="status" aria-live="polite">
      <span className="spinner" aria-hidden="true" />
      <span style={{ fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em" }}>
        {label}…
      </span>
    </div>
  );
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body?: string;
  action?: ReactNode;
}) {
  return (
    <div
      style={{
        padding: "36px 24px",
        textAlign: "center",
        backgroundColor: "#FFFFFF",
        border: "3px solid #121212",
        boxShadow: "4px 4px 0px 0px #121212",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          backgroundColor: "#F0C020",
          border: "2px solid #121212",
          boxShadow: "2px 2px 0px 0px #121212",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 6,
        }}
        aria-hidden="true"
      >
        <div
          style={{
            width: 0,
            height: 0,
            borderLeft: "7px solid transparent",
            borderRight: "7px solid transparent",
            borderBottom: "12px solid #121212",
          }}
        />
      </div>
      <div
        style={{
          fontSize: 16,
          fontWeight: 900,
          textTransform: "uppercase",
          letterSpacing: "-0.01em",
          color: "#121212",
        }}
      >
        {title}
      </div>
      {body && (
        <div
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: "#424245",
            maxWidth: 420,
            lineHeight: 1.5,
          }}
        >
          {body}
        </div>
      )}
      {action && <div style={{ marginTop: 8 }}>{action}</div>}
    </div>
  );
}

export function FormError({ children }: { children: ReactNode }) {
  if (!children) return null;
  return (
    <div
      role="alert"
      style={{
        backgroundColor: "rgba(208, 32, 32, 0.1)",
        border: "2px solid #D02020",
        padding: "10px 14px",
        color: "#D02020",
        fontSize: "12.5px",
        fontWeight: 800,
        textTransform: "uppercase",
        letterSpacing: "0.04em",
      }}
    >
      {children}
    </div>
  );
}

export function FormSuccess({ children }: { children: ReactNode }) {
  if (!children) return null;
  return (
    <div
      role="status"
      style={{
        backgroundColor: "rgba(16, 64, 192, 0.1)",
        border: "2px solid #1040C0",
        padding: "10px 14px",
        color: "#1040C0",
        fontSize: "12.5px",
        fontWeight: 800,
        textTransform: "uppercase",
        letterSpacing: "0.04em",
      }}
    >
      {children}
    </div>
  );
}

export function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="field">
      <label className="field-label">
        {label} {required && <span style={{ color: "#D02020" }}>*</span>}
      </label>
      {children}
      {hint && <span className="field-hint">{hint}</span>}
    </div>
  );
}

export function Badge({
  children,
  variant = "default",
  dot = false,
}: {
  children: ReactNode;
  variant?: "default" | "dark" | "published" | "draft" | "completed";
  dot?: boolean;
}) {
  const getColors = () => {
    switch (variant) {
      case "dark":
        return { bg: "#121212", text: "#FFFFFF" };
      case "published":
      case "completed":
        return { bg: "#1040C0", text: "#FFFFFF" };
      case "draft":
        return { bg: "#F0C020", text: "#121212" };
      default:
        return { bg: "#F0F0F0", text: "#121212" };
    }
  };

  const colors = getColors();

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "2px 8px",
        fontSize: "11px",
        fontWeight: 800,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        border: "1.5px solid #121212",
        boxShadow: "2px 2px 0px 0px #121212",
        backgroundColor: colors.bg,
        color: colors.text,
      }}
    >
      {dot && (
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            backgroundColor: "#D02020",
          }}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}

export function RoleChip({ role }: { role: string }) {
  const roleNorm = role.toLowerCase();
  const label =
    roleNorm === "hod"
      ? "HOD"
      : roleNorm === "cluster_lead"
        ? "Cluster Lead"
        : roleNorm === "admin"
          ? "Admin"
          : roleNorm.charAt(0).toUpperCase() + roleNorm.slice(1);

  const bg =
    roleNorm === "admin"
      ? "#D02020"
      : roleNorm === "hod"
        ? "#F0C020"
        : roleNorm === "cluster_lead"
          ? "#1040C0"
          : "#FFFFFF";

  const color = roleNorm === "hod" || roleNorm === "faculty" ? "#121212" : "#FFFFFF";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "2px 8px",
        fontSize: "11px",
        fontWeight: 800,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        border: "1.5px solid #121212",
        boxShadow: "2px 2px 0px 0px #121212",
        backgroundColor: bg,
        color: color,
      }}
    >
      {label}
    </span>
  );
}

export function Modal({
  open,
  onClose,
  title,
  eyebrow,
  sub,
  large,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  eyebrow?: string;
  sub?: string;
  large?: boolean;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      className="modal-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={`modal ${large ? "modal-lg" : ""}`} role="dialog" aria-modal="true" ref={ref}>
        <button
          className="modal-close"
          onClick={onClose}
          aria-label="Close dialog"
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            width: 32,
            height: 32,
            backgroundColor: "#F0C020",
            border: "2px solid #121212",
            boxShadow: "2px 2px 0px 0px #121212",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#121212" strokeWidth="3" strokeLinecap="square">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        {eyebrow && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 10.5,
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              backgroundColor: "#F0C020",
              color: "#121212",
              border: "1.5px solid #121212",
              padding: "2px 8px",
              marginBottom: 8,
            }}
          >
            {eyebrow}
          </div>
        )}
        {title && (
          <h2
            style={{
              fontSize: 22,
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: "-0.02em",
              color: "#121212",
              margin: "4px 0 6px 0",
            }}
          >
            {title}
          </h2>
        )}
        {sub && (
          <p
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: "#424245",
              margin: "0 0 18px 0",
              lineHeight: 1.5,
            }}
          >
            {sub}
          </p>
        )}
        {children}
      </div>
    </div>
  );
}

export function Avatar({
  name,
  src,
  large,
}: {
  name: string;
  src?: string | null;
  large?: boolean;
}) {
  const initials = name
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <span
      className={`avatar ${large ? "avatar-lg" : ""}`}
      style={{
        borderRadius: "50%",
        border: "2px solid #121212",
        boxShadow: "2px 2px 0px 0px #121212",
        backgroundColor: "#121212",
        color: "#FFFFFF",
        fontWeight: 800,
        textTransform: "uppercase",
      }}
      aria-hidden="true"
    >
      {src ? <img src={src} alt="" style={{ borderRadius: "50%" }} /> : initials || "?"}
    </span>
  );
}

export function Tabs({
  tabs,
  active,
  onChange,
}: {
  tabs: { id: string; label: string; count?: number }[];
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="tabs" role="tablist">
      {tabs.map((t) => (
        <button
          key={t.id}
          role="tab"
          aria-selected={active === t.id}
          className={`tab ${active === t.id ? "is-active" : ""}`}
          onClick={() => onChange(t.id)}
        >
          {t.label}
          {typeof t.count === "number" && <span className="tab-count">{t.count}</span>}
        </button>
      ))}
    </div>
  );
}
