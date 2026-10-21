import React from "react";
import Link from "next/link";

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
  dotMatrixText?: string;
  dotMatrixFontSize?: number;
  showDotMatrix?: boolean;
}

export function PageHeader({
  breadcrumbs,
  title,
  subtitle,
  eyebrow,
  ghost,
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
        marginBottom: 28,
        paddingBottom: 18,
        borderBottom: "4px solid #121212",
      }}
    >
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav
          aria-label="Breadcrumb"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 11.5,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            color: "#121212",
            marginBottom: 4,
          }}
        >
          {breadcrumbs.map((b, i) => {
            const isLast = i === breadcrumbs.length - 1;
            return (
              <React.Fragment key={i}>
                {i > 0 && <span style={{ color: "#D02020", fontWeight: 900 }}>/</span>}
                {isLast || !b.href ? (
                  <span
                    style={{
                      color: isLast ? "#D02020" : "#121212",
                    }}
                  >
                    {b.label}
                  </span>
                ) : (
                  <Link
                    href={b.href}
                    style={{
                      color: "#121212",
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
                fontSize: 10.5,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#121212",
                backgroundColor: "#F0C020",
                border: "2px solid #121212",
                boxShadow: "3px 3px 0px 0px #121212",
                padding: "2px 8px",
                marginBottom: 10,
              }}
            >
              <span>{eyebrow}</span>
            </div>
          )}

          <h1
            className="page-title"
            style={{
              fontSize: 32,
              fontWeight: 900,
              textTransform: "uppercase",
              color: "#121212",
              lineHeight: 1.05,
              margin: 0,
              letterSpacing: "-0.03em",
            }}
          >
            {title} {ghost && <span style={{ color: "#D02020" }}>{ghost}</span>}
          </h1>

          {subtitle && (
            <p
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: "#424245",
                margin: "8px 0 0 0",
                lineHeight: 1.5,
                maxWidth: 800,
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
              gap: 10,
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

export default PageHeader;
