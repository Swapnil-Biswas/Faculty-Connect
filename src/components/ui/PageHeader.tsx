import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  breadcrumbs?: BreadcrumbItem[];
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  breadcrumbs,
  title,
  subtitle,
  actions,
  className = "",
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
            fontSize: 12,
            color: "#667085",
            marginBottom: 2,
          }}
        >
          {breadcrumbs.map((b, i) => {
            const isLast = i === breadcrumbs.length - 1;
            return (
              <React.Fragment key={i}>
                {i > 0 && <ChevronRight size={12} color="#98A2B3" />}
                {isLast || !b.href ? (
                  <span
                    style={{
                      fontWeight: isLast ? 600 : 400,
                      color: isLast ? "#17202A" : "#667085",
                    }}
                  >
                    {b.label}
                  </span>
                ) : (
                  <Link
                    href={b.href}
                    style={{
                      color: "#667085",
                      textDecoration: "none",
                    }}
                    className="hover:text-primary"
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
          <h1
            style={{
              fontSize: 24,
              fontWeight: 600,
              color: "#17202A",
              lineHeight: 1.25,
              margin: 0,
              letterSpacing: "-0.015em",
            }}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              style={{
                fontSize: 13,
                color: "#667085",
                lineHeight: 1.5,
                margin: "4px 0 0 0",
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
