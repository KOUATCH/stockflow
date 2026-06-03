# Enterprise Readiness Roadmap

> Looking back at the bilingual EN/FR migration that just landed
> (27 commits, `1a7bdf5` → `82d8316`), and looking forward at what
> the codebase needs to be considered enterprise-grade.

This document is part status report, part proposal. It calls out the
gap between "feature-complete" and "production-grade enterprise" and
sequences the work that closes it.

---

## Part 1 — What landed (i18n migration recap)

A 27-commit migration turned the codebase from monolingual English into
a fully bilingual EN/FR application with RTL-readiness for a future
third locale.

| Domain | What changed | Reference |
|---|---|---|
| Schema | `nameEn/nameFr`, `titleEn/titleFr`, `descriptionEn/descriptionFr` pairs on Item, Category, Unit, TaxRate, ExpenseCategory, Brand, Role. `Locale` enum + `preferredLocale` on User/Org/Customer. | `prisma/schema.prisma` |
| DB | Live migration: Brand `brandName` → `nameEn/nameFr` with idempotent backfill (24/24 rows). | `scripts/brand-bilingual-backfill.ts` |
| Services + actions | 6 domain slices fully bilingual end-to-end. | `services/<domain>/`, `actions/<domain>/` |
| Forms | Every wired entity form has EN-required + FR-optional input pairs. | `components/{units,brands,categories,tax-rates,dashboard/items,inventory/Modern*}` |
| i18n routing | `next-intl` URL-segment routing live (`/dashboard/items` for EN default, `/fr/dashboard/items` for FR). Middleware chains intl + security. | `app/[locale]/`, `middleware.ts`, `i18n/*` |
| Locale switcher | Dashboard navbar; persists to cookie + DB. | `components/global/LocaleSwitcher.tsx` |
| Auth session | `session.user.preferredLocale` flows through credentials + GitHub + Google OAuth + JWT refresh. | `lib/auth.ts`, `next-auth.d.ts` |
| Translations | ~200 catalog keys per language, hand-translated French (forms, errors, nav, validation, emails, notifications). | `messages/{en,fr}.json` |
| Validation | Bilingual zod via `vmsg()` + global `installZodErrorMap()`. | `lib/i18n/zod-messages.ts` |
| Emails | All 3 templates accept recipient `locale` prop, read from catalog. | `components/email-templates/*` |
| Formatters | ~95% of `toLocaleString` / `Intl.NumberFormat` callsites converted. | `lib/i18n/formatters.ts`, `hooks/useFormatters.ts` |
| RTL readiness | 191-file sweep: physical Tailwind utilities → logical (`ml-*` → `ms-*`). | `docs/TAILWIND_LOGICAL_PROPERTIES.md` |
| Cleanup | 38 orphan files deleted (duplicate forms, broken stubs, dead reports). | various |

Full per-commit breakdown: [`docs/BILINGUAL_MIGRATION_STATUS.md`](BILINGUAL_MIGRATION_STATUS.md).

---

## Part 2 — Honest current state

The migration is done. But the migration also surfaced the surrounding
state of the codebase. Here's what's actually true on `master` today,
unvarnished.

### Strengths

- **Modern stack**: Next.js 15.1, React 19, Prisma 6, TanStack Query 5, Tailwind 3.4, `tsconfig.strict: true`.
- **Multi-tenant aware**: every server action calls `requireOrg()` and scopes Prisma queries by `organizationId`. Schema has compound indexes on `(organizationId, …)` hot paths.
- **Sensible security baseline in middleware**: rate limiting, security headers, audit logging, JWT-based auth, permission-gated routes.
- **Observability bones**: Sentry wired (`@sentry/nextjs`), pino logger, Inngest for background jobs.
- **Bilingual-by-construction**: the data layer + UI layer + routing all model locale as a first-class concern. New code can't accidentally ship monolingual without effort.

### Weaknesses — flag-by-flag

| Signal | Value | Implication |
|---|---|---|
| `tsc --noEmit` error count | **749** | The build passes (`next build` does its own thing), but type safety is theatre. Refactors are dangerous because errors hide regressions. |
| Test files in repo | **8** (mostly the bilingual service tests I added) | Effectively no test coverage. Every change is hand-tested. |
| Prisma migrations directory | **does not exist** | Project uses `prisma db push`. There's no audit trail of schema changes, no rollback path, and no way to coordinate schema changes across environments. |
| `.github/workflows/` | **does not exist** | No CI. Lint/typecheck/test runs only on developer machines. |
| Pre-existing orphan + broken files | **dozens (documented)** | Several modules import nonexistent files (`@/hooks/useCustomerQueries`, `@/hooks/useAllItemSuppliers`, `Crystal` icon from lucide). |
| Decimal arithmetic bugs | **multiple files** | Prisma `Decimal` is being added to `number` in analytics aggregates. Numbers look fine for small values but lose precision and may NaN at scale. |
| Database secrets in repo | `TEST_CREDENTIALS.md` (gitignored) + `.env` (gitignored), but they exist on developer machines | Acceptable for dev. For prod-grade: needs documented secret rotation. |
| Schema cleanup notes from the WIP commit (`1a7bdf5`) | **partial — services/ layer was introduced mid-migration** | The "no services layer" memory I inherited was stale; services/ now exists but isn't yet uniformly the entry point. |

### The big number: 749 TypeScript errors

This is the single most important signal. The bilingual migration deliberately did not "fix everything" — it scoped to bilingual concerns and tracked the rest as pre-existing breakages in [`BILINGUAL_MIGRATION_STATUS.md`](BILINGUAL_MIGRATION_STATUS.md). Most of those 749 errors fall into 5 categories:

1. **Missing modules** (~25 files) — `@/hooks/useCustomerQueries`, `@/hooks/useAllItemSuppliers`, `@/hooks/cashDrawer/useAllCashDrawerHooks`, `@/lib/utils` `formatCurrency`, etc. Author the file or fix the import.
2. **Implicit `any`** (~150 errors) — callback parameters in scattered components that aren't typed. Add type annotations.
3. **Type drift from the schema rewrite** (~50 errors) — `taxRate.taxRateName` references in supplier forms, paginated-response unwrap mismatches, Item relations that no longer exist.
4. **Decimal arithmetic** (~30 errors) — money fields are now `Prisma.Decimal` but old code treats them as `number`.
5. **Library overload mismatches** (~20 errors) — Recharts `<Bar fill={callback}>`, lucide-react typo (`Crystal`).

The rest are scattered: undefined narrowing, duplicate object keys, unused imports.

**None block runtime today** (Next.js builds and runs), but every one is a latent bug or invariant that won't be enforced on the next refactor.

---

## Part 3 — Proposed roadmap to enterprise-grade

Sequenced by impact + risk, not by visibility. Headline number for each
section is rough effort: S (≤1 day), M (1–3 days), L (week+).

### Tier 1 — Foundation (do these first; everything else is built on them)

**1.1 — Zero out the 749 type errors. (L)**
Until `tsc --noEmit` is green, no other claim about quality holds. Concrete steps:
- Author the 4 missing hooks files (`useCustomerQueries`, `useAllItemSuppliers`, `useAllCashDrawerHooks`, etc.). Pattern is the same as `useAllUnitQueries.ts`.
- Annotate the ~150 implicit `any` parameters (most are 3-line fixes).
- Bulk-fix the Decimal arithmetic with a helper: `function n(d: Prisma.Decimal | number | string): number`.
- Update supplier forms to use `taxRate.nameEn`.
- Replace the Crystal icon (it's a typo).

Then turn on `eslint --max-warnings 0` in CI (the script already exists) to keep it green.

**1.2 — Switch from `prisma db push` to `prisma migrate`. (M)**
The DB shape diverging from the schema file with no audit trail is a production landmine. Steps:
- Baseline a migration from current schema: `npx prisma migrate dev --create-only --name baseline`
- Review the SQL, commit it.
- Set up `prisma migrate deploy` in the deploy pipeline.
- Document the workflow in `CONTRIBUTING.md`.

This unlocks safe schema evolution and rollbacks.

**1.3 — Add CI/CD via GitHub Actions. (M)**
Today every check is "did the developer remember to run it locally". Minimum pipeline:
- `npm ci`
- `npm run lint`
- `npx tsc --noEmit`
- `npm test` (will be near-empty until Tier 2)
- `npm run build`
- On PR: post a comment with bundle size delta.

A single `.github/workflows/ci.yml` with two jobs (`lint-typecheck` + `build-test`).

### Tier 2 — Test coverage + safety nets

**2.1 — Unit tests on services layer. (M)**
The 5 bilingual domains have ~5 test files. Pattern is established (`services/category/category.service.test.ts`, `services/brand/brand.service.test.ts`). Replicate for:
- `services/item/item.service.ts` (already has one — extend)
- `services/customer/` if it exists
- `services/inventory/` (action layer; needs unit tests)
- POS session + payment flow (highest risk path)

Target: 60% line coverage on `services/` and `actions/`.

**2.2 — Integration tests on the bilingual data flow. (M)**
Spin up a test DB (e.g. via Testcontainers or `@databases/pg-test`). Smoke tests:
- Create an item with `nameEn` only — verify FR falls back to EN in `getLocalizedName`.
- Switch locale via the API — verify subsequent server-rendered pages show FR.
- Email template renders with FR strings when `locale: "fr"` passed.

**2.3 — Playwright E2E for the golden path. (L)**
At least these flows:
1. Login → switch to FR → see French navbar.
2. Create item with EN+FR names → verify list shows correct name per locale.
3. Login as cashier → process a POS sale → verify receipt formatting.

### Tier 3 — Security + multi-tenant hardening

**3.1 — Postgres row-level security (RLS). (L)**
Today multi-tenancy is enforced at the application layer (`requireOrg()` in every action). A single missed `where: { organizationId }` is a tenant-bleeding bug. RLS makes the database refuse to leak data:

```sql
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
CREATE POLICY items_org_isolation ON items
  USING (organization_id = current_setting('app.current_org_id')::text);
```

Then a Prisma middleware sets `SET LOCAL app.current_org_id = ...` per request. Defense in depth.

**3.2 — Secrets management. (S)**
- Move dev secrets to `.env.local` (gitignored, already is).
- Documented prod secret rotation in `SECURITY.md`.
- Dependabot enabled (or Renovate).
- `npm audit` runs in CI; fails on `high`+ severity.

**3.3 — Permission audit. (M)**
The `routePermissions` table in `middleware.ts` is hand-maintained. Audit:
- Every dashboard route has an entry (or falls through to `dashboard.read` default).
- Every action server function calls a permission check (currently inconsistent — some do `requireOrg()` only).
- Permissions are documented (e.g. what does `tax.settings.access` actually gate?).

### Tier 4 — Observability + operability

**4.1 — Structured logging contract. (S)**
Pino is wired but log shape is ad-hoc. Define:
- Every log line has `service`, `env`, `requestId`, `userId`, `orgId`.
- Log levels documented (when is `warn` vs `error`?).
- `lib/logger.ts` exposes `child(context)` for request-scoped logging.

**4.2 — Metrics + tracing. (M)**
Sentry covers errors but not perf. Add:
- OpenTelemetry instrumentation (`instrumentation.ts` is already a stub).
- Custom metrics for business KPIs: sales per minute, item-create latency, locale-switch rate.
- A Grafana / Vercel observability dashboard if you have one.

**4.3 — Health checks + readiness probes. (S)**
`/api/health` and `/api/ready` already exist (per `middleware.ts` public routes list). Confirm:
- `/api/health` → process alive (always 200 if responding).
- `/api/ready` → DB reachable + cache reachable + critical deps healthy.

### Tier 5 — Performance + modernization

**5.1 — Bundle analysis. (S)**
Add `@next/bundle-analyzer`. Look for the usual suspects:
- Lucide icons being whole-bundled instead of tree-shaken.
- Recharts in main bundle vs lazy-loaded.
- next-intl message catalog size (~200 keys × 2 languages = 50KB — fine, but verify).

**5.2 — Caching strategy. (M)**
- Inventory list, item lookups, dashboard cards — figure out which are `cache: "force-cache"` candidates vs request-scoped.
- Tag-based revalidation for write paths (e.g. `revalidateTag("items")` after item update). Some actions already use this; standardize.
- Edge runtime for hot read paths (where Prisma allows — via `@prisma/extension-accelerate`, which is already installed).

**5.3 — React 19 / Next 15 features audit. (M)**
- Server Actions for form submissions (mostly done, some forms still use `mutate` against a fetch).
- `useOptimistic` for high-touch UI (POS cart, inventory adjustments).
- PPR (Partial Prerendering) — turn on `experimental.ppr` and audit which pages benefit.
- Turbopack: `next dev:turbopack` script exists; promote to default after verifying.

**5.4 — Migrate NextAuth → Auth.js v5. (M)**
The library is rebranding; v5 ships with cleaner App Router APIs and React 19 support. Not urgent — current setup works — but the migration path gets harder the longer it's deferred.

### Tier 6 — Developer experience + docs

**6.1 — Architecture documentation. (M)**
Existing `docs/` has reports but no "start here" doc for new contributors:
- One-page system overview (auth flow, request lifecycle, data flow).
- ADRs (Architecture Decision Records) for the big calls: bilingual pair-columns vs JSONB, services layer split, next-intl URL routing, etc.
- A `CONTRIBUTING.md` with the migration / test / commit workflow.

**6.2 — Storybook for the design system. (L)**
The `components/ui/` library is already shadcn-based — adding Storybook is a few-hour investment with high payoff for new devs and QA.

**6.3 — Onboarding checklist. (S)**
A `docs/ONBOARDING.md` for new contributors: how to set up, where to start, common pitfalls (e.g. don't `db push` without thinking).

### Tier 7 — Product surface polish (lowest urgency, real impact)

**7.1 — Translate the remaining UI strings. (L, ongoing)**
~95% of forms have catalog keys. The remaining 5% are in less-touched surfaces (POS receipt, reports tabs, error pages). Sweep them as you touch each page. Don't do a "translate everything at once" pass — it'll regress.

**7.2 — Translate seed data. (S)**
The comprehensive seed populates `nameFr = nameEn` for brands and `nameFr = "${brand.nameEn} ${productName}"` for items. For a demo, generate proper French product names (use real translation API or a curated list).

**7.3 — `next/link` → `@/i18n/navigation` migration. (L)**
~100+ files use bare `next/link`. The default-locale (EN) URLs work either way, so this is correctness for FR users navigating internally. Mechanical sweep when convenient.

---

## Part 4 — Suggested next session

If we did one focused session next, **Tier 1.1 (zero out type errors)** is the highest-leverage pick because:

1. It unblocks every subsequent quality measure (CI, tests, refactor confidence).
2. The errors are concentrated in 5 categories — fixable mechanically with some judgment.
3. Once green, ratcheting CI to enforce it locks in the gain forever.

Concrete first commit:

- Run `npx tsc --noEmit 2>&1 | tee /tmp/ts-errors.txt`
- Triage by category (missing module, implicit any, schema drift, decimal, lib overload).
- Fix the smallest category first (lib overloads + Crystal icon — under an hour).
- Then the missing modules (author the stub hooks).
- Then implicit anys (mostly `(item: any)` → `(item: ItemDTO)`).
- Then schema drift (sweep `taxRateName` etc.).
- Then Decimal arithmetic with a single `toN()` helper.

Estimated total: one focused day to get from 749 → 0. From there, CI enforcement is one config file.

After Tier 1.1, the natural follow-up is **Tier 1.2 (Prisma Migrate baseline)** because it has zero overlap with the type fixes and is the second-highest-leverage win.

---

## Part 5 — Non-recommendations

A few things this report deliberately does NOT recommend:

- **Microservices / monorepo split.** The codebase is mid-sized and well-bounded. Splitting it adds operational cost without solving a real problem.
- **Replacing TanStack Query.** It's fine. The hooks layer is consistent and well-typed (once the type errors are gone).
- **Replacing Prisma.** Same reasoning.
- **Rewriting the components/ui design system.** It's shadcn — modify it, don't replace it.
- **Adopting a heavyweight i18n editor (Crowdin, Lokalise).** The JSON catalogs are small; a translator can edit them directly. Revisit if the catalog grows past ~500 keys.
- **Rewriting the POS in React Native.** Out of scope for a web admin.

The point of an enterprise-readiness roadmap isn't to add more — it's to make what's already there bulletproof.
