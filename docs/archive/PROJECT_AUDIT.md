# StockFlow — Complete Project Audit & Enterprise Roadmap

> **Audit Date:** 2026-05-02  
> **Audited By:** Claude Code (claude-sonnet-4-6)  
> **Overall Score: 5.4 / 10** — Solid foundation, significant technical debt before enterprise-ready.

---

## Table of Contents

1. [Stack Overview](#stack-overview)
2. [Critical Red Flags](#critical-red-flags)
3. [Architecture Red Flags](#architecture-red-flags)
4. [Code Quality Issues](#code-quality-issues)
5. [Performance & Scalability Gaps](#performance--scalability-gaps)
6. [Enterprise Roadmap](#enterprise-roadmap)
7. [What Is Already Good](#what-is-already-good)
8. [Score Summary](#score-summary)

---h

## Stack Overview

| Layer         | Technology                 | Version         |
| ------------- | -------------------------- | --------------- |
| Framework     | Next.js (App Router)       | 15.1.4          |
| Language      | TypeScript                 | 5               |
| Database      | PostgreSQL + Prisma ORM    | 6.16.3          |
| Auth          | NextAuth.js + Clerk (dual) | 4.24.11         |
| Styling       | Tailwind CSS               | 3.4.1           |
| UI Components | Radix UI + shadcn/ui       | —               |
| Server State  | TanStack React Query       | 5.76.0          |
| Tables        | TanStack React Table       | 8.20.6          |
| Global State  | Zustand                    | 5.0.8           |
| Forms         | React Hook Form + Zod      | 7.54.2 / 3.24.1 |
| Charts        | Recharts                   | 2.15.1          |
| File Upload   | UploadThing                | 7.4.4           |
| Email         | Resend                     | 4.1.1           |
| Notifications | Sonner + react-hot-toast   | —               |

**Prisma Schema:** 1,430 lines · 27 models · 27+ indexes  
**Total Server Actions:** 40+ files across `actions/`  
**Total Custom Hooks:** 50+ files in `hooks/`

---

## Critical Red Flags

### 🚨 1. Live Credentials Committed to Git

The `.env` file was committed to the repository and contains **live production secrets**:

- PostgreSQL password for database `dbakesman`
- `UPLOADTHING_SECRET: sk_live_*` (live key, not test)
- `RESEND_API_KEY`, `CLERK_SECRET_KEY`, `NEXTAUTH_SECRET`, `AUTH_SECRET`
- Gmail account credentials

**These are compromised the moment anyone clones the repo.**

**Remediation steps — do these immediately:**

1. Rotate every credential: DB password, all API keys, OAuth secrets, email password
2. Run [BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/) to purge `.env` from git history
3. Add `.env`, `.env.local`, `.env*.local` to `.gitignore` permanently
4. Create `.env.example` with placeholder values only — commit that instead

---

### 🚨 2. Dual Authentication Conflict

Both **NextAuth.js 4** and **Clerk** are installed and partially configured simultaneously. Two systems protecting the same routes with different session models creates an auth bypass risk. One must be removed entirely.

**Recommended:** Keep NextAuth.js (already has Prisma adapter and full implementation). Remove Clerk and its dependency.

---

### 🚨 3. Three Password Hashing Libraries

Multiple password hashing libraries were installed historically. Users registered at different times may have passwords hashed with different algorithms, leading to inconsistent verification behavior.

**Remediation:** Audit which library each auth path calls. Consolidate to Argon2id only. Add a reset or migration path for existing legacy hashes.

---

## Architecture Red Flags

### 🔴 4. Massive Duplicate Implementations

Every core module has 2–4 parallel implementations. Every bug fix must be applied multiple times. Every new feature risks being built on the wrong version.

| Module                    | Duplicate Paths                                                                                                                                                     |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Inventory Components**  | `components/inventory/` + `components/newInventory/` + `components/oldInventory/` + `components/recentInventory/`                                                   |
| **Purchase Orders**       | `components/purchase-orders/` + `components/purchase-orders1/` + `components/purchaseOrderWorkflow/`                                                                |
| **Cash Drawer Actions**   | `actions/cash-drawer/cashDrawerActions.ts` + `actions/cashSystem/cash-drawer/cashDrawerActionsLatest.ts` + `actions/cashSystem/cash-drawer/cashDrawerAllActions.ts` |
| **POS Session**           | `newPOSSession/` + `posStation/` + `session-pos-sync/`                                                                                                              |
| **Server Actions (root)** | `analytics.ts` + `actions/analytics/` + `actions/cashSystem/reports/`                                                                                               |

**This is the single highest-ROI cleanup task.**

---

### 🔴 5. Dead Config Files

These files serve no purpose and create confusion:

| File                        | Issue                                          |
| --------------------------- | ---------------------------------------------- |
| `nextx.config22.ts`         | Clearly a draft — delete                       |
| `next.config.ts`            | Minimal duplicate of `next.config.js` — delete |
| `componentssssssxxzzz.json` | Dead shadcn config variant — delete            |
| `componentsxyz.json`        | Dead shadcn config variant — delete            |
| `componentszzzz.json`       | Dead shadcn config variant — delete            |
| `app/not-found-orig.tsx`    | Dead backup of not-found page — delete         |

---

### 🔴 6. Zero Test Coverage

No `*.test.ts`, `*.spec.ts`, or `__tests__/` files exist anywhere in the project.

For a system handling **financial transactions** (cash drawer opens, sales orders, payments, inventory adjustments), a silent bug can corrupt revenue data with nothing to catch it.

**Minimum required:**

- Unit tests for every server action that touches money
- Integration tests for the POS checkout flow
- E2E tests for the complete sales order lifecycle

---

## Code Quality Issues

### 🟠 7. Broken TypeScript Configuration

`tsconfig.json` contains malformed `include` paths that silently skip type-checking for those files:

```
"app/(dashboard)/dashboard/inventory/items/page.Createtsx"  // should be .tsx
"components/system/sales/pOSStation.ztsx"                   // should be .tsx
```

Additionally, `tailwind.config.ts` accidentally contains TypeScript `compilerOptions` (they belong in `tsconfig.json` only).

---

### 🟠 8. No ESLint

Only Prettier is installed. Without ESLint there is no enforcement of:

- No `any` types (at least one found in `tailwind.config.ts`)
- No unused variables or imports
- No missing `useEffect` dependency arrays
- No `console.log`/`console.error` leaking into production builds

---

### 🟠 9. Bloated Hook and Action Files

These files violate single-responsibility and inflate the client bundle:

| File                                       | Size      | Problem                       |
| ------------------------------------------ | --------- | ----------------------------- |
| `hooks/useAllItemQueries.ts`               | 31 KB     | One file for all item queries |
| `hooks/useRecentPurchaseOrderQueries.ts`   | 30 KB     | Same pattern                  |
| `hooks/useAllBrandQueries.ts`              | 16 KB     | Same pattern                  |
| `actions/inventory/allInventoryActions.ts` | 649 lines | Monolithic action file        |
| `lib/asyncActions.tsx`                     | 17 KB     | Mixed concerns                |

---

### 🟠 10. Inconsistent Naming Conventions

| Category          | Mixed Names Found                                                                               |
| ----------------- | ----------------------------------------------------------------------------------------------- |
| Type files        | `inventoryTypes.ts` vs `inventory.ts` (both in `/types/`)                                       |
| Hooks             | `use-inventory.ts` vs `useInventoryQueries.ts` vs `useAllItemQueries.ts`                        |
| POS actions       | `pos-actions.ts`, `pos-session-actions.ts`, `pos-station-actions.ts`, `pos-terminal-actions.ts` |
| Config duplicates | `next.config.js` vs `next.config.ts` vs `nextx.config22.ts`                                     |

---

### 🟡 11. console.error in Production

Server actions use `console.error` as their error reporting mechanism. Sentry is configured in `.env` but never called. Production errors are going nowhere visible — you are flying blind.

---

## Performance & Scalability Gaps

### 🟡 12. No Pagination on Data Fetches

Hook names like `useAllItemQueries`, `useAllBrandQueries`, and `getAllCategories` suggest full-table fetches. For a retailer with thousands of SKUs, this will:

- Crash browsers (too much DOM)
- Time out API routes
- Saturate database connections

All list queries need cursor-based or offset pagination.

---

### 🟡 13. No Structured Logging

No log levels, request IDs, or correlation IDs. Debugging a production incident means grepping unstructured stdout. Add a structured logger (`pino` or `winston`) with request correlation.

---

### 🟡 14. No CI/CD Pipeline

No GitHub Actions, Vercel preview checks, or automated quality gates. Every push goes to production unverified.

---

## Enterprise Roadmap

### Phase 1 — Stop the Bleeding (Days 1–3)

| #   | Task                                                                                | Priority   |
| --- | ----------------------------------------------------------------------------------- | ---------- |
| 1   | Rotate all compromised credentials (DB, API keys, OAuth, email)                     | 🚨 Blocker |
| 2   | Purge `.env` from git history using BFG Repo-Cleaner                                | 🚨 Blocker |
| 3   | Add `.env*` to `.gitignore`, create `.env.example`                                  | 🚨 Blocker |
| 4   | Decide NextAuth OR Clerk — fully remove the other                                   | Critical   |
| 5   | Consolidate password hashing to `argon2` only                                       | Critical   |
| 6   | Delete all dead files (nextx.config22.ts, 3x components\*.json, not-found-orig.tsx) | High       |

---

### Phase 2 — Consolidate Duplicates (Week 1–2)

| #   | Task                             | Approach                                                                                                    |
| --- | -------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| 7   | Merge inventory components       | Audit `newInventory/`, cherry-pick best code into `inventory/`, delete `oldInventory/` + `recentInventory/` |
| 8   | Consolidate purchase orders      | Keep `purchase-orders/`, merge unique parts from `purchaseOrderWorkflow/`, delete `purchase-orders1/`       |
| 9   | Unify cash drawer server actions | Keep `cashSystem/cash-drawer/`, merge into one canonical file, delete root `cash-drawer/`                   |
| 10  | Unify POS session                | Pick `posStation/` as canonical, migrate all consumers, delete `newPOSSession/` + `session-pos-sync/`       |
| 11  | Fix `tsconfig.json`              | Remove `.Createtsx` and `.ztsx` typo entries; remove tailwind config from `tsconfig`                        |

---

### Phase 3 — Tooling & Quality Gate (Week 2–3)

| #   | Task                         | Tool                                                                                 |
| --- | ---------------------------- | ------------------------------------------------------------------------------------ |
| 12  | Add ESLint                   | `eslint-config-next` + `@typescript-eslint` + `eslint-plugin-react-hooks`            |
| 13  | Add pre-commit hooks         | Husky + lint-staged (lint → typecheck on staged files)                               |
| 14  | Add unit + integration tests | Vitest + React Testing Library                                                       |
| 15  | Write financial action tests | `createSalesOrder`, cash drawer open/close, `createPayment`                          |
| 16  | Add E2E tests                | Playwright — POS checkout flow, inventory adjustment, purchase order cycle           |
| 17  | Wire Sentry                  | `Sentry.captureException` in all server action catch blocks + React Error Boundaries |

---

### Phase 4 — Performance & Architecture (Month 1)

| #   | Task                                         | Approach                                                                                     |
| --- | -------------------------------------------- | -------------------------------------------------------------------------------------------- |
| 18  | Paginate all list queries                    | Cursor-based pagination in Prisma; `useInfiniteQuery` on the client                          |
| 19  | Split large hook files                       | `useItemListQuery.ts`, `useItemDetailQuery.ts`, `useItemMutations.ts` — one concern per file |
| 20  | Replace `console.error` with Sentry          | `captureException(error)` + structured return values                                         |
| 21  | Add React Error Boundaries per route segment | Isolate crash domains so one module failure doesn't take down the whole dashboard            |
| 22  | Standardize naming conventions               | All hooks: `useXxxQuery.ts` / `useXxxMutation.ts`; all actions: `xxxActions.ts`              |
| 23  | Set up CI/CD pipeline                        | GitHub Actions: lint → typecheck → test → build → deploy                                     |

---

### Phase 5 — Enterprise Features (Month 2+)

| #   | Task                             | Business Value                                                                     |
| --- | -------------------------------- | ---------------------------------------------------------------------------------- |
| 24  | Audit log model in Prisma        | Track all inventory changes, payments, adjustments with who/when/what              |
| 25  | Optimistic UI updates in POS     | Instant feedback — critical for high-volume cashier workflows                      |
| 26  | OpenAPI spec for REST API routes | Auto-generate client SDKs, enable third-party integrations                         |
| 27  | Background job queue             | Long reports and bulk imports via BullMQ or Trigger.dev — no more request timeouts |
| 28  | Multi-currency support           | Explicit currency fields in schema + formatting layer                              |
| 29  | Keyboard-first POS navigation    | Enterprise POS requirement — cashiers use keyboard, not mouse                      |
| 30  | Web Vitals monitoring            | `@vercel/analytics` + Lighthouse CI — track LCP, FID, CLS regressions              |
| 31  | Design token system              | Extract all colors/spacing/radii from Tailwind config into CSS custom properties   |
| 32  | Feature flag system              | Gradual rollout of new inventory or POS modules                                    |

---

## What Is Already Good

These are solid — don't refactor them without a clear reason:

- **Prisma schema** — well-designed: 27 models, proper indexes, cascading deletes, enums for all status fields
- **Security headers** in `next.config.js` — CSP, HSTS, X-Frame-Options, Referrer-Policy all configured
- **Rate limiting** in `middleware.ts` — 50+ routes protected with granular permission checks
- **React Query** — correct server-state caching abstraction, used consistently
- **Zod + React Hook Form** — form validation is solid throughout
- **Radix UI + shadcn** — accessible, themeable component foundation
- **Server action error pattern** — `try/catch → return { success, error }` is consistent across actions
- **JWT session config** — 8-hour sessions, `httpOnly`, `sameSite: strict`, HTTPS-only in production
- **Organization-based multi-tenancy** — correctly scoped in schema and queries

---

## Score Summary

| Category         | Current      | After All Phases |
| ---------------- | ------------ | ---------------- |
| Security         | 3 / 10       | 9 / 10           |
| Testing          | 0 / 10       | 8 / 10           |
| Code Quality     | 5 / 10       | 9 / 10           |
| Architecture     | 5 / 10       | 9 / 10           |
| Performance      | 5 / 10       | 8 / 10           |
| DevOps / Tooling | 4 / 10       | 9 / 10           |
| Documentation    | 6 / 10       | 9 / 10           |
| **Overall**      | **5.4 / 10** | **8.7 / 10**     |

---

> The most urgent single action is **rotating the exposed credentials** — everything else is technical debt, but the live secrets are an active security incident.
