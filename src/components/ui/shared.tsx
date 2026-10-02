"use client";

import { useEffect, useRef, type ReactNode } from "react";

/* Small shared primitives from BMSIT Coding Club so every page/form looks identical. */

export function Spinner({ label = "Loading" }: { label?: string }) {
  return (
    <div className="loading-row" role="status" aria-live="polite">
      <span className="spinner" aria-hidden="true" />
      <span>{label}…</span>
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
    <div className="empty">
      <div className="empty-glyph" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>
      <div className="empty-title">{title}</div>
      {body && <div className="empty-body">{body}</div>}
      {action}
    </div>
  );
}

export function FormError({ children }: { children: ReactNode }) {
  if (!children) return null;
  return (
    <div className="form-error" role="alert">
      {children}
    </div>
  );
}

export function FormSuccess({ children }: { children: ReactNode }) {
  if (!children) return null;
  return (
    <div className="form-success" role="status">
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
        {label} {required && <span className="req">*</span>}
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
  const cls =
    variant === "dark"
      ? "badge badge-dark"
      : variant === "published"
        ? "badge status-published"
        : variant === "draft"
          ? "badge status-draft"
          : variant === "completed"
            ? "badge status-completed"
            : "badge";
  return (
    <span className={cls}>
      {dot && <span className="badge-dot" aria-hidden="true" />}
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
  return <span className={`role-chip role-${roleNorm}`}>{label}</span>;
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
        <button className="modal-close" onClick={onClose} aria-label="Close dialog">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        {eyebrow && <span className="modal-eyebrow">{eyebrow}</span>}
        {title && <h2 className="modal-title">{title}</h2>}
        {sub && <p className="modal-sub">{sub}</p>}
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
    <span className={`avatar ${large ? "avatar-lg" : ""}`} aria-hidden="true">
      {src ? <img src={src} alt="" /> : initials || "?"}
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
