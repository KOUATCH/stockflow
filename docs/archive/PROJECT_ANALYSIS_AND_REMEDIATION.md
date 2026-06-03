# StockFlow — Project Analysis & Remediation Plan

> Snapshot taken after the i18n migration + 4-round type-error cleanup
> (commit range `1a7bdf5` → `cc232b1`). 704 source files. 264 components.
> 114 actions. 32 hooks. 470 outstanding TypeScript errors. 8 test files.
>
> This document is opinionated and ranked by severity. Companion docs:
> `BILINGUAL_MIGRATION_STATUS.md`, `ENTERPRISE_READINESS_ROADMAP.md`,
> `TAILWIND_LOGICAL_PROPERTIES.md`.

---

## TL;DR

StockFlow is **architecturally modern, multi-tenant aware, and bilingual** —
all the hard structural decisions are good. It's also **untested,
unmigrated, and half-finished in critical places** (POS, cash drawer,
stock transfer, daily sales). Type safety is enabled but unenforced.

The fastest path to enterprise readiness is *not* "add more features."
It's: **stop the bleeding** (CI, migrations, RLS) → **back the stubs with
real code** (POS, cash drawer, stock transfers) → **add tests around the
money paths** → **polish**. Roughly 6–10 weeks of focused work to a state
where you'd let an outside team work on it without supervision.

---

## The Good — strengths to preserve and build on

### Architecture

- **Modern stack, no legacy ghosts.** Next.js 15.1, React 19, TypeScript 5
  (strict mode), Prisma 6, TanStack Query 5, Tailwind 3.4. Nothing in the
  dependency tree screams "5 years overdue."
- **Multi-tenant aware throughout.** Every Prisma index that matters
  starts with `organizationId`. Every server action begins with
  `requireOrg()`. The schema has 50+ compound indexes on
  `(organizationId, …)` hot paths.
- **Bilingual EN/FR by construction.** Schema, services, actions, forms,
  URL routing, validation, emails, formatters, RTL. Adding Arabic later
  is a config change, not a migration.
- **Services layer pattern is taking hold.** `services/<domain>/{
  schemas, service, service.test}.ts` is the right shape: validation +
  data layer + tests colocated, called by thin server-action wrappers.
- **shadcn-style component library.** Owned, modifiable, accessible.
  Not a black-box dependency.

### Security baseline

- **Real middleware**: rate limiting, security headers (CSP, HSTS,
  X-Frame-Options, Permissions-Policy), CSRF-aware cookies, audit log
  on every business mutation, NextAuth JWT with proper expiration.
- **Per-route permission gating** via `routePermissions` table in
  middleware + per-action `requireOrg()`.
- **Password hashing with Argon2id** — no legacy hashers, no plaintext.
  Account lockout after failed attempts.

### Observability bones

- `@sentry/nextjs` wired with sourcemaps + release tagging
  (conditional on `SENTRY_AUTH_TOKEN`).
- `pino` + `pino-pretty` structured logger.
- `instrumentation.ts` exists (OpenTelemetry-ready, currently stub).
- `/api/health` + `/api/ready` health-check endpoints already in the
  public-routes list.

### Bilingual end-to-end (the work that just landed)

- 25 commits, 200+ catalog keys, URL-segment routing, locale
  switcher persisted to cookie + DB, hand-translated French.
- 191-file Tailwind sweep means adding RTL = one config line.
- `lib/i18n/{formatters,zod-messages}.ts` + `hooks/useFormatters.ts`
  prevent backsliding via grep-able patterns.

---

## The Bad — systemic weaknesses

### Type safety is theatre

- `tsconfig.strict: true` is on. **470 errors are tolerated.**
- The build passes (`next build` does its own check pass that ignores
  some errors). Lint passes (`max-warnings 0`) because the errors
  aren't ESLint warnings.
- Real bugs hide here: drift between Prisma `include` shapes and
  consumer reads, Decimal/number coercion gaps, `Property X does not
  exist` everywhere.

### No tests on the money paths

- **8 test files in the whole repo.** Most are services I added during
  the bilingual migration (brand, category, item).
- Zero tests on: POS sales, payment processing, inventory transactions,
  cash drawer reconciliation, purchase orders.
- This is a retail point-of-sale system. The untested code is the
  code that handles money.

### No schema migration history

- `prisma/migrations/` does not exist. The project uses `prisma db push`
  for every change.
- The Brand `brandName → nameEn/nameFr` migration was *already*
  irreversible — only safe because I wrote a backfill script first.
- Every future schema change risks dropping a column without backfill,
  with no audit trail of what changed when.

### No CI

- `.github/workflows/` does not exist. Every check (lint, typecheck,
  test, build) runs only on developer machines.
- Nothing prevents pushing broken code to master. (And given the 470
  type errors, broken code has been pushed.)

### Half-finished features

These have UI + hooks but **no real server actions backing them**:

| Feature | Surface | Backing |
|---|---|---|
| Cash drawer | 4 dashboards, 9 hooks | Only `addCash/removeCash/getSummary` in the service. 8/9 hooks are stubs. |
| POS sessions | Full POS page wired | 7 hooks all stub. No `startSession`/`closeSession`/`getSummary` actions. |
| Stock transfers | Detail + list + form pages | 5 hooks all stub. No transfer actions or service. |
| Daily sales reporting | Sales dashboard | 1 hook stub. No report aggregation or finalization actions. |
| Customer orders | Customer detail page | `useCustomerOrders` stub. Page shows zeros. |
| Stock movement summary | Movements dashboard | `useStockMovementSummary` stub. |

The UIs render but the buttons don't do anything. A user clicking
"Start Session" or "Reconcile Drawer" gets a toast saying "not
implemented yet" — sitting under polished real-looking dashboards.

### Architectural inconsistencies

- **`Modern*` parallel implementations.** Several domains have both a
  `XForm.tsx` and a `ModernXForm.tsx`. Only the Modern ones are wired.
  The old ones survived as zero-importer orphans for months and were
  swept during this cleanup.
- **Two action directory styles**: `actions/<domain>/` (canonical) vs
  scattered top-level files (`actions/savings`, `actions/analytics.ts`).
  The cleanup pass deleted some duplicates but the dichotomy persists.
- **Services layer partial.** Bilingual domains (Unit, TaxRate,
  Category, Item, Brand) have full services. POS, cash-drawer,
  supplier, inventory either don't have services or have stubs.
- **Three "duration" / "report" tracking models** for similar concepts
  in cash-drawer / POS / daily-sales — same dashboards re-implementing
  similar shapes with subtly different field names.

### Application-layer-only tenant isolation

- Multi-tenancy is enforced by `where: { organizationId }` in every
  query and `requireOrg()` in every action.
- One missed `where` clause = data leak across tenants.
- **No Postgres row-level security**. No `SET LOCAL app.current_org_id`
  pattern. A SQL injection or a developer oversight could expose
  another tenant's data.

### Code-quality smell

- `console.log` scattered in 80+ files (debug leftovers, not migrated
  to `pino`).
- Typos like `"user Server"` instead of `"use server"` (lurking among
  the deleted orphan files).
- Comments like `// TODO: Replace with actual user ID` next to
  `userId: 'user_123'` in the POS flow (in a stub).
- Inconsistent naming: `brandName` vs `nameEn`, `taxRateName` vs
  `nameEn`, plus `createUnit22` (a versioned filename).
- Routes living at both `app/(dashboard)/dashboard/items/` AND
  `app/(dashboard)/dashboard/inventory/items/` (legacy mirror).

---

## The Urgent — must address before production scale

Ordered by **time-to-disaster** if ignored.

### 1. Production database is at risk

**Problem:** `prisma db push` against a populated DB drops columns
silently. The Brand rename was already a near-miss — only safe because
of an idempotent backfill script.

**Risk:** Next schema change in production silently loses customer data.
No rollback path.

**Fix (this week):**
- `mkdir prisma/migrations` and baseline: `npx prisma migrate diff
  --from-empty --to-schema-datamodel prisma/schema.prisma --script >
  prisma/migrations/0001_baseline/migration.sql`.
- Switch deploy pipeline from `db push` to `prisma migrate deploy`.
- Document in `CONTRIBUTING.md` that schema changes go through
  `prisma migrate dev`.

### 2. No CI gate

**Problem:** Any developer can push code that doesn't compile, doesn't
lint, doesn't pass tests (such as they are). 470 type errors exist.

**Risk:** Every PR review has to manually re-verify what should be
automated.

**Fix (this week):**
- Add `.github/workflows/ci.yml`: install → lint → typecheck → test →
  build. Run on every PR. Fail the PR if any step fails.
- Make `npx tsc --noEmit` actually pass. Either fix the 470 errors
  (multi-week effort) **or** ratchet — checkpoint the current error
  count, fail CI only if it *increases*.

### 3. Tenant isolation depends on developer discipline

**Problem:** Every multi-tenant query relies on a developer
remembering `where: { organizationId }`. One miss = data leak.

**Risk:** Compliance failure, customer trust loss, GDPR/CCPA exposure.

**Fix (next sprint):**
- Add Postgres RLS on every multi-tenant table:
  ```sql
  ALTER TABLE items ENABLE ROW LEVEL SECURITY;
  CREATE POLICY items_org ON items
    USING (organization_id = current_setting('app.current_org_id', true));
  ```
- Add a Prisma middleware that runs `SET LOCAL app.current_org_id` from
  the session at the start of every request.
- Defense in depth — the application-layer check stays, the DB now
  refuses to leak even if the application misses.

### 4. POS / financial code is untested

**Problem:** Code that handles money has zero automated tests.

**Risk:** Pricing bugs, payment double-charges, inventory miscounts,
cash drawer variance disputes — all manifest in production with no
guardrail.

**Fix (next 2 sprints):**
- Unit tests for `services/pos/pos-session.service.ts`,
  `services/cash-drawer/cash-drawer.service.ts`, and the payment
  processing path. Pattern is already established in
  `services/brand/brand.service.test.ts`.
- One Playwright happy-path E2E: login → cashier session start →
  scan item → take payment → close session → reconcile.
- Don't aim for 80% coverage. Aim for "every transition that touches
  money has a test."

### 5. Half-finished UIs lie to users

**Problem:** Users see "Start POS Session", "Reconcile Drawer",
"Generate Report" buttons that look real but toast an error.

**Risk:** Loss of credibility when shown to a customer. Plus actual
business needs aren't being met.

**Fix (3–4 sprints, the bulk of remaining work):**
- Author the real server actions backing each stub:
  - `services/pos/*` — 7 missing methods (start/close session,
    summary, daily reports).
  - `services/cash-drawer/*` — 8 missing methods.
  - `services/stock-transfer/*` — full module (doesn't exist).
  - `services/customer/getOrders` — single method.
  - `services/inventory/stockMovementSummary` — aggregate query.
- Once each ships, swap the stub in the corresponding hook for a
  real call. Hook signatures and shapes are already documented so
  the consumer doesn't change.

---

## The Useful — improvements worth doing eventually

Not urgent, real impact.

### Observability + ops

- Wire `instrumentation.ts` to OpenTelemetry. Sentry traces are good but
  business-metric traces (sales/min, item-create p95, locale-switch
  rate) need OTel.
- Define a structured-log contract: every entry has
  `service, env, requestId, userId, orgId`. Add `logger.child(ctx)`
  per request.
- Make `/api/ready` actually verify DB + cache + critical dependencies,
  not just respond 200.

### Performance

- `@prisma/extension-accelerate` is installed but not enabled. Turn it
  on for hot read paths (inventory list, item lookups).
- Bundle analysis: `@next/bundle-analyzer` shows Lucide imports often
  bundle the whole library; force per-icon imports. Recharts is
  usually a payload culprit too — lazy-load chart routes.
- Consider Next.js PPR (Partial Prerendering) for the dashboard
  routes — they're a perfect fit (static shell + dynamic
  per-user data).

### Developer experience

- ADRs: at least the big calls (bilingual pair-columns vs JSONB,
  services-layer split, URL-segment routing, RLS-or-not).
- Storybook for `components/ui/` — shadcn-based design system is great
  for it.
- `CONTRIBUTING.md` with the migration / test / commit workflow.
- Onboarding doc that doesn't require reading 8 other doc files.

### Modernization

- NextAuth → Auth.js v5 (the same library, but v5 ships with cleaner
  App Router APIs).
- React 19 features audit:
  - `useOptimistic` for high-touch UI (POS cart, inventory adjustments).
  - Server Actions for the remaining `fetch`-based forms.
  - `useFormStatus` instead of manual `isPending` state.
- Auth.js + NextAuth's `useSession` is fine for now; revisit when v5
  has been stable for 12 months.

### Product polish

- Remaining UI strings (~5%) into the catalog. POS receipts, error
  pages, less-touched report tabs.
- Real French product names in the seed data (currently `nameFr =
  nameEn` for most rows).
- `next/link` → `@/i18n/navigation` codebase-wide sweep — needed for
  locale-aware deep links to work for FR users.

---

## Proposed remediation plan

### Tier 0 — This week (under 5 days)

These three unblock everything else and reduce the worst risks.

1. **`prisma migrate baseline` + switch deploy to `migrate deploy`.**
   (1 day) — closes the data-loss risk.
2. **CI workflow with type-error ratcheting.** (1 day) — closes the
   broken-code-on-master risk.
3. **Postgres RLS on all multi-tenant tables + Prisma middleware to
   `SET LOCAL app.current_org_id`.** (2–3 days) — closes the
   tenant-leak risk.

After Tier 0: schema changes are safe, CI prevents regressions, DB
refuses cross-tenant reads even if a developer slips.

### Tier 1 — Next 2–3 weeks

4. **Get to zero tsc errors, then make CI enforce it absolutely.** This
   is multi-week even after the cleanup work that landed. The
   remaining 470 errors are concentrated in type drift between
   Prisma `include` shapes and consumer reads — fix the Prisma side
   to match what consumers actually use (and consumers to match what
   Prisma actually returns).
5. **Tests on services layer.** Target 60% coverage on `services/`,
   100% on the money paths (POS, payment, inventory transaction,
   cash drawer).
6. **One Playwright E2E: cashier session happy path.**

### Tier 2 — Next 4–6 weeks (the bulk)

7. **Author real server actions backing every stub.** Per the
   "Half-finished features" table. Each one is a focused sub-task:
   - Cash drawer service expansion (8 methods).
   - POS session service expansion (7 methods).
   - Stock transfer service from scratch.
   - Customer orders service.
   - Inventory aggregates (stock movement summary, etc.).
8. **Refactor consumer pages once real shapes exist.** The TS2339
   errors will resolve themselves as the actual return shapes match.

### Tier 3 — Next 4 weeks (polish + modernization)

9. OpenTelemetry instrumentation, structured logging contract.
10. Bundle audit + lazy-loading hot routes.
11. ADRs + Storybook + CONTRIBUTING.md.
12. Auth.js v5 migration (low risk, do it now while the API surface is
    small).

### Tier 4 — Ongoing (don't block on)

- Remaining UI translations.
- `next/link` → `@/i18n/navigation` sweep.
- Real French seed data.
- React 19 features audit + adoption.
- Performance perf budget per route in CI.

---

## What I'd start with Monday

If I had one focused day, I'd do **Tier 0 step 1** — Prisma baseline +
migrations workflow. It's the highest-leverage single change: closes
the data-loss risk forever, and unlocks safe schema iteration for
everything in Tier 1+.

```bash
# Baseline the current schema as the first migration.
npx prisma migrate diff \
  --from-empty \
  --to-schema-datamodel prisma/schema.prisma \
  --script > prisma/migrations/0001_baseline/migration.sql

# Mark the baseline as applied on the current DB (production reads).
npx prisma migrate resolve --applied 0001_baseline

# Verify shadow DB works (creates + tears down a clone to validate
# the next migration before applying).
npx prisma migrate dev --name verify-baseline-shadow-works
```

Then update `package.json`:
```diff
- "dev": " prisma generate  && next dev ",
+ "dev": "prisma generate && next dev",
  "build": "prisma generate  && next build",
+ "migrate": "prisma migrate dev",
+ "migrate:deploy": "prisma migrate deploy"
```

Update the deploy pipeline to run `migrate:deploy` before starting the
app. Document in `CONTRIBUTING.md` that schema changes go through
`migrate dev`, never `db push`.

That's day one. Tier 0 step 2 (CI) is day two. Tier 0 step 3 (RLS) is
the rest of the week.

---

## What this analysis is NOT

- **Not a code review.** Individual functions aren't critiqued. The
  problems are systemic, not per-file.
- **Not a redesign.** The architecture is good; the gap is in
  finishing what's started.
- **Not a "rewrite it all" pitch.** Replacing Prisma, TanStack Query,
  NextAuth, or shadcn solves nothing. They're fine. The gap is
  elsewhere.
- **Not exhaustive.** I haven't audited the email-rendering pipeline,
  the Inngest job definitions, or the Sentry alerting config. Those
  may have their own issues. Sample more before deciding.

---

## Stoplight

| Area | State |
|---|---|
| Architecture | 🟢 Good — modern, multi-tenant, bilingual |
| Security baseline | 🟢 Good — middleware, audit, rate limit, auth |
| Type safety | 🟡 At-risk — strict on, 470 errors tolerated |
| Tests | 🔴 Critical — 8 test files, money paths untested |
| Schema migrations | 🔴 Critical — no history, `db push` only |
| CI/CD | 🔴 Critical — no automated checks |
| Multi-tenant defense | 🟡 At-risk — application-layer only |
| Feature completeness | 🟡 At-risk — POS / cash drawer / transfers stubbed |
| i18n / RTL | 🟢 Good — complete, RTL-ready |
| Code quality | 🟡 At-risk — orphans, console.logs, naming inconsistency |
| Observability | 🟢 Adequate — Sentry + pino baseline, OTel TBD |
| Performance | ⚪ Unmeasured — no bundle analysis or perf budget |
| DX / docs | 🟡 At-risk — 5 docs but no onboarding entry point |

Six weeks of focused work to flip every 🔴 + 🟡 to 🟢. The 🔴s alone
are 1–2 weeks. After that, you've got a real enterprise codebase.
