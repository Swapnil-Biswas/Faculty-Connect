# Faculty Connect

> **Intelligent Academic Data Synchronization Platform** — *Enter Once, Use Everywhere*

Faculty Connect centralizes all academic data entry and propagates it to reports, accreditation systems, and management dashboards — eliminating duplicate entry and creating a single source of truth.

---

## Phase 1 — What's Built

| Layer | What's included |
|---|---|
| **Auth** | NextAuth v5 (Credentials provider), JWT sessions, dual-mode (light/dark/system) |
| **RBAC** | 4-tier hierarchy (Admin → HOD → Cluster Head → Faculty), enforced in `proxy.ts` edge middleware AND server-side on every dashboard |
| **Prisma Schema** | All 18 entities defined, Prisma Client v5.22 generated |
| **Sync Engine** | `src/services/syncEngine.ts` — event-bus pattern, fan-out to notifications + ledger |
| **Dashboards** | Faculty · Cluster Head · HOD · Admin — fully typed Server Components |
| **Notification System** | Bell icon with unread count, panel, read/mark-all-read (in-app) |
| **Design System** | Full CSS token system, dual-mode palette, glassmorphism cards, gradient buttons, role/status badges |
| **Admin Seed Script** | `scripts/seed.ts` — bootstraps Admin, ScoringConfig, NotificationRules, Badges |

---

## Tech Stack

- **Next.js 16.3** (App Router, React Server Components, Turbopack)
- **TypeScript** — strict, zero type errors
- **Prisma 5.22** + PostgreSQL
- **NextAuth v5** (Auth.js beta) — Credentials provider, JWT strategy
- **Tailwind CSS** + custom CSS design system
- **Redis + BullMQ** — queues for Phase 2+ (schema ready, jobs not yet wired)
- **bcryptjs** — password hashing

---

## Quick Start

### 1. Configure Database
```bash
# Edit .env with your PostgreSQL connection string
DATABASE_URL="postgresql://user:pass@localhost:5432/faculty_connect"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"
```

### 2. Push Schema to DB
```bash
cd faculty-connect
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
# → http://localhost:3000
```

### Demo Credentials (after SEED_DEMO=true)
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
│   ├── (auth)/login/        # Login page — split glassmorphism layout
│   ├── (dashboard)/         # Role-scoped dashboards (Server Components)
│   │   ├── faculty/         # Faculty dashboard
│   │   ├── cluster/         # Cluster Head dashboard
│   │   ├── hod/             # HOD dashboard
│   │   └── admin/           # Admin dashboard
│   ├── api/auth/[...nextauth]/ # NextAuth route handler
│   ├── layout.tsx           # Root layout with Providers
│   └── providers.tsx        # SessionProvider + ThemeProvider
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx      # Role-adaptive nav sidebar
│   │   └── Topbar.tsx       # Sticky topbar with bell + theme toggle
│   └── ui/
│       ├── StatCard.tsx     # Animated metric cards
│       └── RoleBadge.tsx    # Colored role pills
├── lib/
│   ├── auth.ts              # NextAuth full config (Prisma adapter + callbacks)
│   ├── auth.config.ts       # Edge-safe config (used by proxy.ts)
│   ├── db.ts                # Prisma singleton
│   └── utils.ts             # cn(), formatDate(), getInitials(), etc.
├── services/
│   └── syncEngine.ts        # Sync Engine — audit, notifications, points
├── types/
│   └── next-auth.d.ts       # Session type augmentations
└── proxy.ts                 # Edge RBAC middleware (Next.js 16 proxy)

prisma/
└── schema.prisma            # Full schema — 18 models, all Phase 1-5 entities

scripts/
└── seed.ts                  # Admin bootstrap + demo data seeder
```

---

## RBAC Enforcement

Security is enforced at **two layers** (never trust UI alone):

1. **Edge (proxy.ts)** — blocks unauthorized routes before the request even hits the server
2. **Server Components** — every dashboard re-verifies `session.user.role` and scopes DB queries accordingly

| Route | Allowed Roles |
|---|---|
| `/faculty/*` | All roles |
| `/cluster/*` | CLUSTER_HEAD, HOD, ADMIN |
| `/hod/*` | HOD, ADMIN |
| `/admin/*` | ADMIN only |

---

## Phase Roadmap

| Phase | Status | Scope |
|---|---|---|
| 1 | ✅ **Done** | Auth, RBAC, Schema, Sync Engine, Admin seed, Dashboards |
| 2 | ✅ **Done** | Task management CRUD + CL/leave workflow + audit logging |
| 3 | ✅ **Done** | Recognition engine (ledger + config) + nightly leaderboard job |
| 4 | ✅ **Done** | Notifications polish + all dashboard features filled + cluster & research hubs |
| 5 | 🔜 **Next** | External NBA/NAAC connectors, automated email delivery & webhooks |

---

## Admin Notes

- Admin is provisioned **only via seed** — never via self-registration
- Every Admin action writes to `AuditLog` with before/after state
- Impersonation is logged with `isImpersonated: true` + `impersonatorId`
- All deletes are soft deletes (`deletedAt` timestamp), never hard deletes
- `ScoringConfig` is versioned — historical scores remain explainable when weights change