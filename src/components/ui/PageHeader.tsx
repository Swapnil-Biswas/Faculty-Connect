import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { DotMatrixCanvas } from "./DotMatrixCanvas";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  breadcrumbs?: BreadcrumbItem[];
  title: string;
  subtitle?: string;
  eyebrow?: string;
  ghost?: string;
  actions?: React.ReactNode;
  className?: string;
  showDotMatrix?: boolean;
  dotMatrixText?: string;
  dotMatrixFontSize?: number;
}

export function PageHeader({
  breadcrumbs,
  title,
  subtitle,
  eyebrow,
  ghost,
  actions,
  className = "",
  showDotMatrix = true,
  dotMatrixText,
  dotMatrixFontSize = 36,
}: PageHeaderProps) {
  return (
    <div
      className={className}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        marginBottom: 24,
      }}
    >
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav
          aria-label="Breadcrumb"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 11,
            fontFamily: "var(--font-mono)",
            color: "#6E6E73",
            marginBottom: 2,
            letterSpacing: "0.04em",
          }}
        >
          {breadcrumbs.map((b, i) => {
            const isLast = i === breadcrumbs.length - 1;
            return (
              <React.Fragment key={i}>
                {i > 0 && <ChevronRight size={11} color="#D2D2D7" />}
                {isLast || !b.href ? (
                  <span
                    style={{
                      fontWeight: isLast ? 600 : 400,
                      color: isLast ? "#1D1D1F" : "#6E6E73",
                    }}
                  >
                    {b.label}
                  </span>
                ) : (
                  <Link
                    href={b.href}
                    className="cyber-link-hover"
                    style={{
                      color: "#6E6E73",
                      textDecoration: "none",
                    }}
                  >
                    {b.label}
                  </Link>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      )}

      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: 1, minWidth: 260 }}>
          {eyebrow && (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "#86868B",
                marginBottom: 6,
              }}
            >
              <span
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  backgroundColor: "#16A34A",
                  display: "inline-block",
                }}
              />
              <span>{eyebrow}</span>
            </div>
          )}

          {showDotMatrix && (
            <div
              style={{
                marginBottom: 8,
                maxWidth: "100%",
                overflowX: "auto",
                scrollbarWidth: "none",
              }}
            >
              <DotMatrixCanvas
                text={dotMatrixText || title}
                fontSize={dotMatrixFontSize}
                color="#1D1D1F"
              />
            </div>
          )}

          <h1
            className="page-title"
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: "#1D1D1F",
              lineHeight: 1.25,
              margin: 0,
              letterSpacing: "-0.01em",
            }}
          >
            {title} {ghost && <span className="ghost">{ghost}</span>}
          </h1>

          {subtitle && (
            <p
              style={{
                fontSize: 13,
                color: "#6E6E73",
                margin: "4px 0 0 0",
                lineHeight: 1.45,
              }}
            >
              {subtitle}
            </p>
          )}
        </div>

        {actions && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
