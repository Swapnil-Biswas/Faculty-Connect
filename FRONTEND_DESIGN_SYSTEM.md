# BMSIT Coding Club & Faculty-Connect Design System Specification

> **Archive Notice**: This document serves as the permanent specification and design guidelines for the Faculty-Connect platform, inspired directly by the BMSIT Coding Club developer platform (`https://bmsitcodingclub.space/`). This ensures 100% preservation of visual identity, component APIs, design tokens, and aesthetic rules even after temporary reference directories are removed.

---

## 1. Aesthetic Identity & Philosophy

The Faculty-Connect user interface fuses **three distinct aesthetic movements**:
1. **BMSIT Coding Club Cyber-Developer Aesthetic**: High-contrast dark obsidian canvas, monospaced metadata, subtle grid overlays, glyph rhythm dividers (`+ — + — +`), and golden accentuation.
2. **Nothing OS / Nothing Phone Industrial Minimalism**: LED dot-matrix arrays (5x7 matrix character renderers, Fibonacci coordinate code spheres, blinking hardware status LEDs, pill tabs, and monospaced telemetry).
3. **Apple Terminal & Command Center Precision**: Border hairline illumination (1px glass borders with 10%–25% alpha), ghost text-stroke typography, spring-eased micro-transitions (`cubic-bezier(0.16, 1, 0.3, 1)`), and smooth top-edge scroll progress indicators.

---

## 2. Color Palette & Design Tokens

### 2.1 CSS Variables (`:root` / `.dark`)

```css
:root, .dark {
  /* Obsidian Space Canvas */
  --bg-base: 228 28% 5%;             /* #07090E → Ultra-dark terminal obsidian */
  --bg-surface: 225 24% 9%;          /* #0E121B → Elevated card container */
  --bg-elevated: 224 22% 13%;        /* #141A26 → Modal / active surface */
  --bg-subtle: 223 20% 16%;          /* #1A2230 → Hover / selected state */

  /* Text & Foreground Hierarchy */
  --text-primary: 210 40% 98%;       /* #F8FAFC → Crisp high-contrast white */
  --text-secondary: 217 19% 72%;     /* #A1ADC0 → Clean technical grey */
  --text-muted: 217 15% 52%;         /* #6B7A90 → Monospace tags / meta / glyphs */

  /* Neutral Grey Scale (BMSIT Coding Club Spec) */
  --white: #ffffff;
  --off-white: #fafafa;
  --grey-50: #f5f5f7;
  --grey-100: #e8e8ed;
  --grey-200: #d2d2d7;
  --grey-300: #b0b0b5;
  --grey-400: #86868b;
  --grey-500: #6e6e73;
  --grey-600: #424245;
  --grey-700: #2d2d2d;
  --grey-800: #1d1d1f;
  --grey-900: #0a0a0a;

  /* BMSIT Brand & Accent Colors */
  --color-primary: 48 100% 50%;      /* #FFD700 → BMSIT Academic Gold */
  --color-primary-light: 48 100% 65%;/* #FFE247 */
  --color-secondary: 199 89% 48%;    /* #0EA5E9 → Cyber / Telemetry Blue */
  --color-accent: 250 92% 70%;       /* #818CF8 → Electric Indigo */

  /* System Status Indicators */
  --color-success: 142 71% 45%;      /* #22C55E → Online / Approved */
  --color-warning: 38 92% 50%;       /* #F59E0B → Pending / Alert */
  --color-danger: 350 89% 60%;       /* #F43F5E → Critical / Rejected */
  --color-info: 199 89% 48%;         /* #38BDF8 → Dispatch / Info */

  /* Hairline Borders */
  --border: 220 18% 18%;             /* rgba(255, 255, 255, 0.08) */
  --border-strong: 220 20% 26%;      /* rgba(255, 255, 255, 0.18) */
  --border-gold: 48 100% 50%;        /* #FFD700 */

  /* Physics & Transitions */
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --transition-fast: 150ms cubic-bezier(0.16, 1, 0.3, 1);
  --transition-base: 300ms cubic-bezier(0.16, 1, 0.3, 1);
}
```

---

## 3. Typography Matrix

### 3.1 Font Families
- **Display & Heading**: `'Inter'`, `-apple-system`, `BlinkMacSystemFont`, `sans-serif`
  - Weight: 700 / 800 / 900
  - Tracking: `-0.035em` tight kerning
- **Body & Interface**: `'Inter'`, `'Plus Jakarta Sans'`, `sans-serif`
  - Weight: 400 / 500 / 600
- **Technical & Monospace**: `'Fira Code'`, `ui-monospace`, `Menlo`, `monospace`
  - Weight: 500 / 600 / 700
  - Tracking: `0.10em` – `0.18em` uppercase

### 3.2 Ghost Outline Typography
Signature BMSIT Coding Club typography style for headers:
```css
.page-title {
  font-family: var(--font-display, 'Inter', sans-serif);
  font-size: 34px;
  font-weight: 800;
  letter-spacing: -0.035em;
  color: #F8FAFC;
}

.page-title .ghost {
  color: transparent;
  -webkit-text-stroke: 1.2px rgba(255, 215, 0, 0.65);
  font-style: italic;
  margin-left: 6px;
}
```

---

## 4. Key Interactive Components

### 4.1 `DotMatrixCanvas` (`src/components/ui/DotMatrixCanvas.tsx`)
- Renders text in a **5x7 dot-matrix font** with custom canvas coordinates.
- Mouse hover triggers spring physics repulsion: dots push away from the cursor within radius `hoverRadius` and spring back smoothly.
- **Props**:
  - `text`: string to render (uppercase)
  - `fontSize`: base size
  - `color`: dot color (default `#FFD700` or `#F8FAFC`)
  - `animate`: staggered reveal animation boolean

### 4.2 `Ticker` (`src/components/ui/Ticker.tsx`)
- Continuous, silky infinite-scrolling marquee bar.
- Uses `@keyframes tickerScroll` with linear timing.
- Separators: `◆`, `|`, `✦`, `+`.
- Edge gradients (`::before` / `::after`) create seamless fade in/out on both ends.

### 4.3 `GlyphDivider` (`src/components/ui/GlyphDivider.tsx`)
- Industrial LED glyph rhythm strip:
  - Sequence: `[long-bar] [dot] [dot] [tiny-dot] [dot] [LABEL] [dot] [tiny-dot] [dot] [dot] [long-bar]`
  - Used between sections, under page headers, or above table views.

### 4.4 `ScrollProgress` (`src/components/ui/ScrollProgress.tsx`)
- Fixed 2px bar at the very top of the viewport (`top: 0, left: 0, right: 0`).
- Dynamically calculates `scrollTop / (scrollHeight - innerHeight) * 100%`.
- Apple/Nothing subtle gold or cyan accent.

### 4.5 `EmptyState` (`src/components/ui/EmptyState.tsx`)
- Centered container with dashed 1.5px border.
- 5 pulsing dot glyphs (`.empty-glyph span`) staggered by `0.2s` using `@keyframes glyphPulse`.
- Clean title + muted monospace subtitle + optional CTA button.

### 4.6 `Tabs` (`src/components/ui/Tabs.tsx`)
- Pill-shaped tab container with `border-radius: 100px`.
- Active tab has solid elevated surface (`#FFD700` or `#1E293B`) with high contrast text.
- Optional numeric count bubble (`tab-count`).

---

## 5. React Server Components (RSC) Rules & Best Practices

> **CRITICAL RULE**: Next.js 16+ Turbopack strictly prohibits passing JavaScript event handlers (`onMouseEnter`, `onMouseLeave`, `onClick`, `onMouseDown`) inside Server Components (`page.tsx` files without `"use client"`).

### 5.1 Hover States in Server Components
**Always** use native CSS classes instead of inline event handlers:
- **Cards**: Use `className="cyber-card-hover"`
- **Table Rows**: Use `className="cyber-row-hover"`
- **Links / Anchors**: Use `className="cyber-link-hover"`

### 5.2 Client Components
When buttons, inputs, modal triggers, or tab switches require `onClick` or state changes:
- Keep the page file as a Server Component for data fetching.
- Extract the interactive widget into a separate client file with `"use client"` at line 1 (e.g. `AssignTaskModal.tsx`, `Tabs.tsx`).

---

## 6. Layout & Grid Standards

### 6.1 Viewport Shell
- **Root Background**: `#07090E` with subtle radial glows and grid pattern (`.bg-tech-grid`).
- **Sidebar Width**: 254px fixed left with gold logo badge, active route indicator (`border-left: 2px solid #FFD700`), and role badge.
- **Topbar**: 64px sticky header with live hardware telemetry, system clock, notification dropdown bell with badge, and user avatar.
- **Content Padding**: `28px 36px` on desktop, `16px 20px` on mobile.

### 6.2 Data Tables
- Encapsulate in `className="table-wrap"` with `overflow-x: auto` and `border: 1px solid rgba(255, 255, 255, 0.08)`.
- Headers `<th>`: `font-family: var(--font-mono)`, `font-size: 10.5px`, `letter-spacing: 0.14em`, uppercase, `color: #64748B`.
- Rows `<tr>`: `className="cyber-row-hover"` with `border-bottom: 1px solid rgba(255, 255, 255, 0.04)`.
