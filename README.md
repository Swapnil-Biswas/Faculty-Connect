# Faculty Connect

> **Intelligent Academic Data Synchronization Platform** — *Enter Once, Use Everywhere*

Faculty Connect centralizes all academic data entry and propagates it to reports, accreditation systems, and management dashboards — eliminating duplicate entry and creating a single source of truth for department operations.

---

## What's Built

| Layer | What's included |
|---|---|
| **Auth** | NextAuth v5 (Credentials provider), JWT sessions, light/dark/system theme |
| **RBAC** | 4-tier hierarchy (Admin → HOD → Cluster Head → Faculty), enforced in `proxy.ts` edge middleware AND server-side on every dashboard |
| **Prisma Schema** | Full schema with all entities — users, tasks, leave, publications, notifications, audit, badges, webhooks, scoring |
| **Server Actions** | 11 action modules covering all CRUD operations (tasks, leave, clusters, publications, notifications, scoring, webhooks, jobs, leaderboard, evaluations, admin) |
| **Sync Engine** | `src/services/syncEngine.ts` — event-bus pattern, fan-out to notifications + audit ledger |
| **Recognition Engine** | `src/services/recognition.ts` — points ledger, badge awards, nightly leaderboard scoring |
| **Dashboards** | Faculty · Cluster Head · HOD · Admin — fully typed Server Components with interactive Client islands |
| **Landing Page** | Full public-facing landing with Hero, Features, About, Events, Projects, Resources, Partners, Team, and Footer sections |
| **Notification System** | Bell icon with unread count, notification panel, mark-as-read, notification rules (admin-configurable) |
| **Accreditation / Export** | NBA/NAAC SSR dossier generation, department-level export (HOD role) |
| **Jobs Dashboard** | Admin-managed maintenance jobs, email digest dispatcher, scheduling UI |
| **Webhooks** | Admin-configurable outbound webhooks for system events |
| **Design System** | Full CSS token system, dual-mode palette, glassmorphism cards, gradient buttons, GSAP + Lenis animations |
| **Seed Script** | `scripts/seed.ts` — bootstraps Admin, ScoringConfig, NotificationRules, Badges, and optional demo data |
| **Embedded DB** | `scripts/start-db.ts` — embedded PostgreSQL for zero-config local dev |

---

## Tech Stack

- **Next.js 16.3** (App Router, React Server Components, Turbopack)
- **React 19** + **TypeScript** — strict, zero type errors
- **Prisma 5.22** + PostgreSQL (embedded via `embedded-postgres` for local dev)
- **NextAuth v5** (Auth.js beta) — Credentials provider, JWT strategy
- **Tailwind CSS v4** + custom CSS design system (`globals.css`)
- **GSAP 3** + **Lenis** — scroll animations and smooth scrolling
- **Lucide React** — icon system
- **React Hook Form** + **Zod** — form validation
- **bcryptjs** — password hashing
- **date-fns** — date formatting utilities
- **concurrently** — runs DB + Next.js dev server in parallel

---

## Quick Start

### 1. Configure Environment

Copy `.env.example` to `.env` and fill in the values:

```bash
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/faculty_connect"

# NextAuth — generate with: openssl rand -base64 32
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# App Config (shown in UI)
NEXT_PUBLIC_DEPARTMENT_NAME="Department of Computer Engineering"
NEXT_PUBLIC_INSTITUTION_NAME="Your Institution"
NEXT_PUBLIC_APP_NAME="Faculty Connect"
```

### 2. Push Schema to DB

```bash
npm run db:push
```

### 3. Seed Admin + Demo Data

```bash
# Seed Admin only
npm run seed

# Seed Admin + demo cluster/faculty (for local dev)
SEED_DEMO=true npm run seed
```

### 4. Run Dev Server

```bash
npm run dev
# Starts embedded PostgreSQL + Next.js dev server concurrently
# → http://localhost:3000
```

### Demo Credentials (after `SEED_DEMO=true`)

| Role | Email | Password |
|---|---|---|
| Admin | admin@facultyconnect.edu | Admin@123 |
| HOD | hod@facultyconnect.edu | Hod@123 |
| Cluster Head | ch@facultyconnect.edu | Ch@123 |
| Faculty | ananya@facultyconnect.edu | Faculty@123 |

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/
│   │   └── login/                    # Login page — split glassmorphism layout
│   ├── (dashboard)/
│   │   ├── layout.tsx                # Dashboard shell — Sidebar + Topbar
│   │   ├── dashboard/                # Role-redirect landing (→ /faculty, /cluster, etc.)
│   │   │
│   │   ├── faculty/                  # Faculty role dashboard
│   │   │   ├── page.tsx              # Faculty home — stats, tasks, recent activity
│   │   │   ├── tasks/                # My tasks + status update form
│   │   │   ├── leave/                # Apply for leave, cancel pending requests
│   │   │   ├── publications/         # Submit & view research publications
│   │   │   ├── leaderboard/          # Department leaderboard view
│   │   │   ├── stars/                # Recognition stars received
│   │   │   └── notifications/        # Notification inbox (NotificationsClient)
│   │   │
│   │   ├── cluster/                  # Cluster Head role dashboard
│   │   │   ├── page.tsx              # Cluster home — member stats, pending actions
│   │   │   ├── tasks/                # Assign & manage cluster tasks
│   │   │   ├── leave/                # Approve / reject leave (DecideLeaveForm)
│   │   │   ├── roster/               # Cluster member roster
│   │   │   ├── evaluations/          # Faculty evaluations (CreateEvaluationModal)
│   │   │   ├── leaderboard/          # Cluster-scoped leaderboard
│   │   │   └── analytics/            # Cluster-level performance analytics
│   │   │
│   │   ├── hod/                      # HOD role dashboard
│   │   │   ├── page.tsx              # HOD home — department overview stats
│   │   │   ├── tasks/                # Department-wide task management
│   │   │   ├── leave/                # Department leave approvals (HodDecideLeaveForm)
│   │   │   ├── clusters/             # Cluster overview
│   │   │   ├── leaderboard/          # Department leaderboard + refresh button
│   │   │   ├── analytics/            # Department analytics deep-dive
│   │   │   ├── scoring/              # Scoring config management (ScoringConfigForm)
│   │   │   ├── accreditation/        # NBA/NAAC SSR dossier (AccreditationClient)
│   │   │   ├── audit/                # Department audit log (HodAuditFilters)
│   │   │   ├── export/               # Data export (ExportClient)
│   │   │   └── faculty-of-month/     # Run Faculty-of-Month recognition job
│   │   │
│   │   └── admin/                    # Admin role dashboard
│   │       ├── page.tsx              # Admin home — system-wide stats
│   │       ├── users/                # User management (CreateUserForm, UserActionsMenu)
│   │       ├── clusters/             # Cluster management (ClusterManagerClient)
│   │       ├── scoring/              # Global scoring config
│   │       ├── badges/               # Badge catalog management (BadgesClient)
│   │       ├── notifications/        # Notification rules (NotificationRulesClient)
│   │       ├── jobs/                 # Maintenance & digest jobs (JobsClient)
│   │       ├── webhooks/             # Outbound webhook config (WebhooksClient)
│   │       └── audit/                # Full system audit ledger (AuditLedgerClient)
│   │
│   ├── api/
│   │   ├── auth/[...nextauth]/       # NextAuth route handler
│   │   └── video/                    # Video streaming route
│   │
│   ├── layout.tsx                    # Root layout with Providers
│   ├── page.tsx                      # Public landing page
│   ├── providers.tsx                 # SessionProvider + ThemeProvider
│   └── globals.css                   # Full CSS design system (tokens, components, themes)
│
├── actions/                          # Next.js Server Actions (all mutations go here)
│   ├── admin.ts                      # User CRUD, impersonation, system settings
│   ├── clusters.ts                   # Cluster create/update/assign faculty
│   ├── evaluations.ts                # Faculty evaluation submit/update
│   ├── jobs.ts                       # Trigger maintenance jobs, email digest, FoM
│   ├── leaderboard.ts                # Refresh leaderboard, score recalculation
│   ├── leave.ts                      # Apply, cancel, approve, reject leave
│   ├── notifications.ts              # Mark read, mark all read, notification rules CRUD
│   ├── publications.ts               # Submit, update, delete publications
│   ├── scoring.ts                    # Update scoring config weights
│   ├── tasks.ts                      # Assign, update status, delete tasks
│   └── webhooks.ts                   # Webhook endpoint CRUD + test fire
│
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx               # Role-adaptive collapsible navigation sidebar
│   │   └── Topbar.tsx                # Sticky topbar — bell, notification panel, theme toggle, user menu
│   ├── dashboard/
│   │   └── DotMatrixHero.tsx         # Animated dot-matrix hero for dashboards
│   ├── landing/                      # Public landing page sections
│   │   ├── Header.tsx                # Sticky nav header with smooth scroll
│   │   ├── Hero.tsx                  # Hero section with animated headline
│   │   ├── Features.tsx              # Platform feature highlights
│   │   ├── About.tsx                 # Department about section
│   │   ├── Domains.tsx               # Research domains grid
│   │   ├── Events.tsx                # Upcoming events carousel
│   │   ├── Projects.tsx              # Research projects showcase
│   │   ├── Resources.tsx             # Resources and downloads
│   │   ├── Partners.tsx              # Partner institutions
│   │   ├── Team.tsx                  # Team member cards
│   │   ├── JoinUs.tsx                # CTA / recruitment section
│   │   └── Footer.tsx                # Footer with links
│   ├── providers/
│   │   └── SmoothScroll.tsx          # Lenis smooth scroll provider
│   ├── scoring/
│   │   └── ScoringConfigForm.tsx     # Reusable scoring weights form
│   └── ui/                           # Primitive UI components
│       ├── StatCard.tsx              # Animated metric stat cards
│       ├── StatsBar.tsx              # Horizontal stats bar
│       ├── MetricBlock.tsx           # Compact metric display block
│       ├── PageHeader.tsx            # Page title + breadcrumb header
│       ├── RoleBadge.tsx             # Colored role pill badges
│       ├── StatusBadge.tsx           # Status indicator badges (PENDING, APPROVED, etc.)
│       ├── EmptyState.tsx            # Empty state placeholder with icon
│       ├── Tabs.tsx                  # Tab switcher component
│       ├── SubmitButton.tsx          # Loading-aware form submit button
│       ├── MagneticButton.tsx        # GSAP magnetic hover button
│       ├── DotMatrixCanvas.tsx       # Canvas dot-matrix animation
│       ├── DotMatrixPattern.tsx      # SVG dot-matrix pattern component
│       ├── RevealOnScroll.tsx        # Intersection Observer scroll reveal
│       ├── ScrollProgress.tsx        # Page scroll progress indicator
│       ├── Ticker.tsx                # Horizontal scrolling ticker
│       ├── GlyphDivider.tsx          # Decorative section divider
│       ├── Cursor.tsx                # Custom cursor component
│       └── shared.tsx                # Shared modal, table, form primitives
│
├── lib/
│   ├── auth.ts                       # NextAuth full config (Prisma adapter + session callbacks)
│   ├── auth.config.ts                # Edge-safe config (used by proxy.ts middleware)
│   ├── audit.ts                      # Audit log write helpers
│   ├── db.ts                         # Prisma client singleton
│   └── utils.ts                      # cn(), formatDate(), getInitials(), etc.
│
├── services/
│   ├── syncEngine.ts                 # Event bus — fan-out to notifications + audit on data changes
│   └── recognition.ts               # Points ledger, badge award engine, leaderboard scoring
│
├── types/
│   └── next-auth.d.ts               # Session type augmentations (role, id, etc.)
│
└── proxy.ts                         # Edge RBAC middleware (Next.js Middleware API)

prisma/
└── schema.prisma                    # Full Prisma schema — all models and relations

scripts/
├── seed.ts                          # Admin bootstrap + demo data seeder
└── start-db.ts                      # Embedded PostgreSQL startup script
```

---

## API Routes

| Method | Route | Description |
|---|---|---|
| `GET/POST` | `/api/auth/[...nextauth]` | NextAuth session, sign-in, sign-out handlers |
| `GET` | `/api/video` | Video file streaming route |

> All data mutations use **Next.js Server Actions** (`src/actions/`) rather than REST API routes. Server Actions are called directly from Client Components and Server Components with full type-safety and built-in CSRF protection.

---

## Server Actions

| Action File | Operations |
|---|---|
| `admin.ts` | Create/update/delete users, role changes, impersonation |
| `clusters.ts` | Create cluster, update cluster, assign/remove faculty members |
| `evaluations.ts` | Submit faculty evaluation, update evaluation score |
| `jobs.ts` | Trigger maintenance jobs, run email digest, run faculty-of-month |
| `leaderboard.ts` | Refresh leaderboard scores, recalculate points |
| `leave.ts` | Apply for leave, cancel request, approve/reject (Cluster Head/HOD) |
| `notifications.ts` | Mark notification read, mark all read, CRUD notification rules |
| `publications.ts` | Submit publication, update, delete, change status |
| `scoring.ts` | Update scoring config weights, create new config version |
| `tasks.ts` | Assign task, update task status, delete task, filter tasks |
| `webhooks.ts` | Create/update/delete webhook endpoints, send test event |

---

## RBAC Enforcement

Security is enforced at **two layers** (never trust UI alone):

1. **Edge Middleware (`proxy.ts`)** — blocks unauthorized routes before the request hits the server
2. **Server Components** — every dashboard re-verifies `session.user.role` and scopes DB queries accordingly
3. **Server Actions** — every mutation re-checks the session role before executing

| Route Prefix | Allowed Roles |
|---|---|
| `/faculty/*` | FACULTY, CLUSTER_HEAD, HOD, ADMIN |
| `/cluster/*` | CLUSTER_HEAD, HOD, ADMIN |
| `/hod/*` | HOD, ADMIN |
| `/admin/*` | ADMIN only |

---

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start embedded PostgreSQL + Next.js dev server (Turbopack) |
| `npm run dev:next` | Start only the Next.js dev server (requires external DB) |
| `npm run db:start` | Start only the embedded PostgreSQL |
| `npm run db:push` | Push Prisma schema changes to the database |
| `npm run db:studio` | Open Prisma Studio (DB browser) |
| `npm run seed` | Run the admin + optional demo data seeder |
| `npm run build` | Build the production bundle |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |

---

## Phase Roadmap

| Phase | Status | Scope |
|---|---|---|
| 1 | ✅ **Done** | Auth, RBAC, Schema, Sync Engine, Admin seed, Dashboards |
| 2 | ✅ **Done** | Task management CRUD + CL/leave workflow + audit logging |
| 3 | ✅ **Done** | Recognition engine (ledger + config) + nightly leaderboard job |
| 4 | ✅ **Done** | Notifications polish + all dashboard features + cluster & research hubs |
| 5 | ✅ **Done** | NBA/NAAC SSR Dossier, automated maintenance jobs, email digest dispatcher & webhooks |
| 6 | ✅ **Done** | Public landing page, publications hub, faculty evaluations, embedded DB, smooth scroll + animations |

---

## Admin Notes

- Admin is provisioned **only via seed** — never via self-registration
- Every Admin action writes to `AuditLog` with before/after state
- Impersonation is logged with `isImpersonated: true` + `impersonatorId`
- All deletes are soft deletes (`deletedAt` timestamp), never hard deletes
- `ScoringConfig` is versioned — historical scores remain explainable when weights change
- Embedded PostgreSQL (`embedded-postgres`) is used for local dev — no Docker required
- Webhooks fire on system events and include HMAC signatures for payload verification

---

## License

MIT © Faculty Connect Contributors
