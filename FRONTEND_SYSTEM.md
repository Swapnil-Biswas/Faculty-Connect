# BMSIT Dot Matrix & Academic OS Design System (Frontend Reference)

> **Context Preservation Document**: This document permanently records the design language, aesthetic guidelines, component architecture, CSS tokens, and layout patterns derived from `https://bmsitcodingclub.space/` and the original `frontend/` reference repository. Keep this file in the project even after `frontend/` is removed.

---

## 1. Aesthetic Philosophy

- **Strict Light Mode Canvas**: Background is `#ffffff` (or `rgba(255, 255, 255, 0.95)` with backdrop blur for sticky chrome). No dark blacks (`#07090E`, `#0E121B`) or dark themes.
- **Charcoal Typography**: Apple-grade high-contrast charcoal text (`#1d1d1f` primary, `#6e6e73` secondary/muted, `#86868b` tertiary).
- **Hairline Borders**: `#e8e8ed` or `rgba(0, 0, 0, 0.08)` crisp 1px borders.
- **Dot Matrix Headers**: 5x7 Dot Matrix ASCII bitmap font rendered dynamically onto HTML5 Canvas with spring physics and mouse cursor magnetic distortion.
- **3D Fibonacci Dot Sphere**: Interactive 3D point cloud of 150 points with golden-angle Fibonacci distribution rotating in space, projecting programming glyphs (`{`, `}`, `<`, `>`, `0`, `1`, `f`, `n`, etc.) snapped to a dot matrix grid.
- **Terminal & Industrial Telemetry**: Live status LED pulses, live ticking clocks (`HH:MM:SS`), glyph divider strips (Nothing Phone / Braun inspired), and Apple-style scroll progress indicators.

---

## 2. Core Color & Design Tokens (`src/app/globals.css`)

```css
:root {
  --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  --font-mono: "Geist Mono", "JetBrains Mono", "SF Mono", Consolas, monospace;

  /* Neutrals */
  --white: #ffffff;
  --black: #000000;
  --foreground: #1d1d1f;
  --background: #ffffff;
  --surface: #ffffff;
  --surface-raised: #fbfbfd;
  --surface-overlay: rgba(255, 255, 255, 0.92);

  /* Grey scale */
  --grey-50:  #f5f5f7;
  --grey-100: #e8e8ed;
  --grey-200: #d2d2d7;
  --grey-300: #b0b0b8;
  --grey-400: #86868b;
  --grey-500: #6e6e73;
  --grey-600: #515154;
  --grey-700: #333336;
  --grey-800: #1d1d1f;
  --grey-900: #0a0a0c;

  /* Accents */
  --accent: #1d1d1f;
  --accent-rgb: 29, 29, 31;
  --accent-hover: #000000;
  --border: #e8e8ed;
  --border-strong: #d2d2d7;
  --border-light: #f5f5f7;

  /* Status Colors */
  --color-green: #16a34a;
  --color-blue: #0284c7;
  --color-purple: #7c3aed;
  --color-amber: #d97706;
  --color-red: #dc2626;

  /* Dimensions */
  --header-height: 64px;
  --max-width: 1200px;
  --max-width-wide: 1360px;
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
}
```

---

## 3. Dot Matrix Canvas Component (`src/components/ui/DotMatrixCanvas.tsx`)

### 5x7 Bitmap Font Dictionary
Letters A–Z, numbers 0–9, and punctuation marks (`.`, `:`, `-`, `+`, `/`, `&`) are encoded as 7-byte arrays representing 5 bits per row:
```typescript
const FONT_5X7: Record<string, number[]> = {
  A: [0x0e, 0x11, 0x11, 0x1f, 0x11, 0x11, 0x11],
  B: [0x1e, 0x11, 0x11, 0x1e, 0x11, 0x11, 0x1e],
  C: [0x0e, 0x11, 0x10, 0x10, 0x10, 0x11, 0x0e],
  // ... full alphabet & digits
  ".": [0x00, 0x00, 0x00, 0x00, 0x00, 0x0c, 0x0c],
  " ": [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
};
```

### Proportional Spacing & Spring Physics
- Each character is auto-trimmed horizontally (omits leading/trailing blank columns) so letter-spacing looks optically balanced.
- Interactive mouse physics: when the cursor is within 55px radius, dots repel with a spring easing algorithm (`easeSpeed = 0.12`).
- Responsive scaling: uses `(canvas.parentElement?.clientWidth || w)` to prevent 0px canvas collapse on initial mount.

---

## 4. 3D Fibonacci Dot Matrix Sphere (`src/components/ui/DotMatrixPattern.tsx`)

- Uses Fibonacci spherical lattice distribution:
  ```typescript
  const lat = Math.acos(1 - 2 * (i + 0.5) / numPoints);
  const lon = Math.PI * (1 + Math.sqrt(5)) * i; // Golden angle
  ```
- 3D to 2D projection rotates points around X and Y axes based on mouse drag or slow auto-rotation.
- Project coordinates snap to a 20px dot grid, showing characters when a 3D point occupies the cell, binary noise `0` / `1` when near the mouse, and subtle background dots (`baseRadius * 0.35`) elsewhere.

---

## 5. Page Layout Architecture

### Landing Page (`src/app/page.tsx`)
1. `<ScrollProgress />` — Apple-style top scrollbar indicator.
2. `<Header />` — Sticky glassmorphism header with logo, navigation anchors, and "SIGN IN" CTA.
3. `<Hero />` — System status bar with live clock, 3-line DotMatrixCanvas titles, subtitle, CTA buttons, teaser badge, and interactive 3D DotMatrixPattern sphere.
4. `<StatsBar />` — Animated counters with ease-out quart interpolation.
5. `<About />` — Mission and institutional pillars with figure photography and dot matrix accents.
6. `<Events />` — Ticker marquee, GlyphDivider, milestone cards, live countdown timers.
7. `<Projects />` — Category filters, research project cards, tags, investigator meta.
8. `<Team />` — Department council cards with initials avatar, designations, and hairline dividers.
9. `<Resources />` — Accreditation repository tabs (NBA, NAAC, NIRF, VTU) with binary bit glyph indicators.
10. `<Domains />` — 6 academic cluster chips with unicode glyphs.
11. `<Partners />` — Institutional accreditation cards (NBA Tier-1, NAAC A+, VTU, AICTE).
12. `<JoinUs />` — Interactive 18x6 `JoinGlyphGrid` canvas wave grid and SSO CTA.
13. `<Footer />` — 50-glyph strip, portal links, and autonomous copyright notice.

### Dashboard Layout (`src/app/(dashboard)/layout.tsx`)
- Container: `.app-layout` (`display: flex; min-height: 100vh; background: #ffffff;`)
- Sidebar: `.sidebar` (`width: 260px; border-right: 1px solid #e8e8ed; background: #ffffff;`)
- Topbar: `.topbar` (`height: 64px; border-bottom: 1px solid #e8e8ed; background: rgba(255, 255, 255, 0.95);`)
- Main Content: `.page-content` (`flex: 1; padding: 28px 32px; background: #ffffff;`)

---

## 6. Common UI Components & Patterns

| Component | Path | Key Role |
| :--- | :--- | :--- |
| `PageHeader` | `src/components/ui/PageHeader.tsx` | Standard breadcrumb, eyebrow (`// MODULE`), 5x7 `DotMatrixCanvas` title, subtitle, and action buttons. |
| `StatCard` | `src/components/ui/StatCard.tsx` | Metric cards with label, large value, trend indicator, and micro dot decoration. |
| `EmptyState` | `src/components/ui/EmptyState.tsx` | Empty state with 5-glyph strip, title, body, and action button. |
| `StatusBadge` | `src/components/ui/StatusBadge.tsx` | Color-coded status badges (`verified`, `pending`, `rejected`, `active`). |
| `RoleBadge` | `src/components/ui/RoleBadge.tsx` | Role chips (`FACULTY`, `CLUSTER_LEAD`, `HOD`, `ADMIN`). |
| `GlyphDivider`| `src/components/ui/GlyphDivider.tsx`| Nothing Phone-inspired LED-style sequence divider with center text label. |
| `Ticker` | `src/components/ui/Ticker.tsx` | High-performance marquee ticker for updates and status broadcasts. |
| `RevealOnScroll`| `src/components/ui/RevealOnScroll.tsx`| IntersectionObserver-driven smooth fade-and-translate entry animations. |

---

## 7. Rules for Future Modifications

1. **Never switch to dark backgrounds**: Maintain `#ffffff` canvas across all pages.
2. **Never pass interactive event handlers to Server Components in Next.js 16**: Use CSS hover utility classes (`.cyber-card-hover`, `.cyber-row-hover`, `.cyber-link-hover`) or make the component `"use client"`.
3. **Always use CSS variables and tokens**: Do not hardcode arbitrary HSL or RGB values. Use `var(--foreground)`, `var(--border)`, `var(--grey-500)`, `var(--radius-md)`.
4. **Preserve Dot Matrix Canvas Titles**: Every primary dashboard subpage should feature a `PageHeader` with `dotMatrixText` for visual cohesion.
