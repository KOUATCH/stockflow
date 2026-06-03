# Strategic Next Steps — Path to Enterprise-Grade

**Date:** 2026-05-22
**Author:** Based on multi-session audit covering bilingual migration, schema drift, mutation hooks, dashboard chrome, and pre-existing tsc errors.
**Audience:** Project owner + future maintainers.

---

## TL;DR

> Spend the next two sessions getting the codebase **type-clean** and **CI-gated**, then turn on **Postgres RLS** — those three moves convert your impressive demo into a defensible enterprise product, and they make every subsequent improvement (bilingual sweep, real services, design system) safe to ship.

---

## The diagnosis

You currently have impressive surface area but fragile foundations. Three patterns repeat across every directory I touched in this session:

1. **Infrastructure half-built** — RLS, CI, migrations, real services missing.
2. **Types drifting** — 639 `tsc` errors across the codebase.
3. **Strings half-translated** — ~60 % catalog coverage; the remaining 40 % is mechanical replacement against an established pattern.

Sprinting on more features against this base will compound the debt. Below is what looks done vs. what is actually risky.

### Looks done vs. actually risky

| What looks done | What's actually risky |
|---|---|
| Multi-tenant `requireOrg()` + `where: { organizationId }` everywhere | One forgotten `where` clause = cross-tenant data leak. **No Postgres RLS** as a safety net. |
| Prisma schema with bilingual columns | **No migrations folder** — using `prisma db push`. Means no rollback, no history, no team workflow. |
| ~470 → ~150 tsc errors trimmed over earlier work | **639 errors still global** (item-suppliers, inventoryAlerts, etc.). CI cannot pass = no merge gate possible. |
| Finance, POS, Cash Drawer dashboards rendered | **All run on mock data.** Real `getCustomerOrders`, POS session actions, financial aggregates don't exist. |
| Notification i18n bridge for suffixes | 15 mutation hooks still pass English operation names. |
| Sentry SDK imported in `next.config.ts` | No alert routing, no error budget, no source maps verified. |
| Multilingual catalog wired (`next-intl` + URL routing) | Catalog covers ~60 % of surfaces; heavy PO forms (3,669 lines), POS receipt detail, landing sections still hardcoded. |
| Dashboard chrome with LocaleSwitcher | Auth chrome was bare until this session — gap is now closed but pattern shows surfaces can be missed. |
| shadcn-style component library | Many components use ad-hoc gradients/shadows/radii — no design tokens, no `<MetricCard>` / `<PanelHeader>` primitives. |
| Authentication (NextAuth credentials + GitHub + Google) | No password rotation, no 2FA, no rate limiting on `signIn` documented end-to-end. |

---

## The 6-step sequence

### Step 1 — Type-safety bankruptcy day *(1–2 sessions)*

**Goal:** Eliminate the 639 `tsc --noEmit` errors so CI can gate on green.

**Action plan:**

1. Cluster the errors:
   - **Item include drift** (`actions/item-suppliers/*.ts`, possibly inventory actions) — `name` → `nameEn / nameFr`. Same pattern fixed on `purchase-orders/page.tsx`. ~10 files.
   - **Decimal arithmetic** — `toN()` coercion sweep where it was missed.
   - **Implicit `any`** in callbacks (`(item: any) =>` etc.).
   - **Missing exports** like `InventoryAlerts`, `leadTime` field drift on `ItemSupplier`.
2. Burn down one cluster per commit; verify with `npx tsc --noEmit` after each.
3. Add a `tsc:ci` npm script and wire it into the CI gate in step 2.

**Definition of done:** `npx tsc --noEmit` exits with code 0.

---

### Step 2 — CI/CD pipeline + Prisma Migrate baseline *(1 session)*

**Goal:** Make every PR mechanically reviewable; make schema changes version-controlled.

**Action plan:**

1. **CI** — GitHub Actions workflow with:
   - `npm ci`
   - `npm run lint`
   - `npx tsc --noEmit`
   - `npx prisma validate`
   - `npm run build`
   - Eventually `npm test` once tests exist.
2. **Migrate baseline** — `prisma migrate dev --name baseline_2026_05` so the existing schema becomes the first migration. Every future change becomes a reviewable diff.
3. **Branch protection** on `main`: require green CI + 1 review + linear history.

**Definition of done:** A failing `tsc` or schema drift blocks merge.

**Why this is the highest-leverage non-feature change you can ship.**

---

### Step 3 — Postgres Row-Level Security *(1–2 sessions)*

**Goal:** Replace defense-in-userland (`where: { organizationId }`) with defense-in-database.

**Action plan:**

1. Enable RLS on every multi-tenant table (`Item`, `Brand`, `Category`, `Unit`, `TaxRate`, `Supplier`, `Customer`, `Location`, `PurchaseOrder`, etc.).
2. Set `app.current_org_id` GUC via `prisma.$executeRaw` in a `withOrgContext()` wrapper invoked at the start of every server action.
3. Policy template:
   ```sql
   CREATE POLICY tenant_isolation ON "Item"
     USING (organization_id = current_setting('app.current_org_id')::uuid);
   ```
4. Audit logging: emit a Sentry breadcrumb when a query returns 0 rows due to RLS (should be rare; if frequent, indicates a missing org-context call).

**Why this matters:** every query becomes scoped automatically. The class of bugs where a forgotten `where` clause leaks cross-tenant data ceases to exist.

**Definition of done:** Manually attempting a cross-tenant query (via `psql` without setting the GUC) returns zero rows on every protected table.

---

### Step 4 — Replace mocks with real services *(2–3 sessions)*

**Goal:** Turn the demo dashboards into functional product.

**8 known stub hooks** (from `docs/PROJECT_ANALYSIS_AND_REMEDIATION.md`):

| Hook | Backed by | Currently |
|---|---|---|
| `useCustomerOrders` | `getCustomerOrders` action | Returns empty stub |
| `useCashDrawerSummary` | `getCashDrawerSummary` action | Stub |
| `useCashDrawerTransactions` | `getCashDrawerTransactions` action | Stub |
| `useActiveSession` | `getActivePOSSession` action | Stub |
| `useStartPOSSession` | `startPOSSession` action | Mock mutation |
| `useClosePOSSession` | `closePOSSession` action | Mock mutation |
| `useStockTransfer` | `createStockTransfer` action | Stub |
| `useStockMovementSummary` | `getStockMovementSummary` action | Stub |

**Each needs:**
- Strict zod input validation via `vmsg()` (bilingual error messages).
- `requireOrg()` boundary (redundant after RLS but kept belt-and-braces).
- Decimal arithmetic via `toN()`.
- Soft-delete awareness (`deletedAt: null` filter).

**Definition of done:** Finance dashboard renders real revenue data from `SalesOrder`+`Payment` aggregates; POS dashboard shows real terminal/session state.

---

### Step 5 — Finish the bilingual sweep *(1 session)*

**With types green and CI gating regressions, this becomes mechanical.**

**Residual surfaces** (per `docs/BILINGUAL_AUDIT_2026-05.md`):

- **15 mutation hooks** — apply Pattern C (catalog keys already exist):
  ```ts
  const t = useTranslations("notifications")
  const op = t("operations.<entity>Creation")
  notify.formSuccess(op, t("defaults.createSuccess", { entity }))
  ```
- **Auth pages** — `RegisterForm`, `ChangePasswordForm`, `forgot-password`, `reset-password`, `verify`, `user-invite` — `auth.*` namespace already populated.
- **Heavy PO forms** (3 components, ~3,700 lines combined). Convert once; ModernCreate and ModernEdit share most structure.
- **Landing-page sections** — hero pill, features bullets, CTA card text.
- **Domain tables** — `CustomerTable`, `SupplierTable`, inventory tables (`"order"|"orders"` and `"avg"` postfixes).

**Definition of done:** `grep` for hardcoded JSX strings in `app/[locale]` and `components/` returns only acceptable cases (proper nouns, brand names, code identifiers).

---

### Step 6 — Design system consolidation + observability *(1–2 sessions)*

**Design system:**
- Extract the gradient / shadow / radius vocabulary you've been using ad-hoc into Tailwind theme tokens.
- Build a shared `<MetricCard>`, `<PanelHeader>`, `<EmptyState>`, `<PageHeader>` primitive so future surfaces look consistent for free.
- Document the design language in `docs/DESIGN_SYSTEM.md`.

**Observability:**
- Verify Sentry source maps upload (test by throwing in production build).
- Add `@sentry/nextjs` server-side tracing on the heavy server actions (PO submit, payment process, stock transfer).
- Route alerts to Slack/email + define an error budget (e.g. < 5 errors / 1k requests).

**Accessibility:**
- Run `axe-core` in CI.
- Audit for `aria-label`-less icon buttons (there are still many).
- Verify color contrast on the gradient backgrounds (especially the green-on-green emerald-50 → teal-50 PO panel).

**Tests:**
- First test coverage: server actions for the 8 ex-stub hooks from Step 4.
- Vitest + `@testing-library/react` for the form components.
- Playwright for the critical user journeys (login → create item → make sale → see in PO dashboard).

---

## What I'd ship this week vs this quarter

| Timeline | Steps | Outcome |
|---|---|---|
| **This week** | Steps 1 (type bankruptcy) + 2 (CI + migrate baseline) | Codebase becomes mechanically reviewable. |
| **This month** | Steps 3 (RLS) + 4 (real services) | Codebase becomes defensible + functional. |
| **This quarter** | Steps 5 (bilingual finish) + 6 (design system + observability + first test coverage) | Codebase becomes enterprise-grade. |

---

## Why this ordering (the rationale)

- **Steps 1–2 unlock everything else.** You can't safely refactor (i18n sweep, mock replacement) without CI catching regressions, and you can't run CI without `tsc` passing.
- **Step 3 (RLS) is your single biggest security win** and is safer to do *after* types are clean — RLS policies will fail noisily on missing `organization_id` references, and a green compiler makes those fixes obvious.
- **Step 4 (real services) makes the app "real."** Doing it before steps 1–2 means every PR risks regressing without anyone noticing.
- **Steps 5–6 are mechanical pattern application** — pure wins once the foundation supports them.

---

## Inventory of work already done (context)

For the next maintainer, here's what this session and prior sessions have completed:

- ✅ Bilingual schema migration (nameEn/nameFr on Item, Unit, TaxRate, Category, Brand, ExpenseCategory, Role) end-to-end.
- ✅ `next-intl` v4.12 wired with URL-segment routing (`localePrefix: "as-needed"`).
- ✅ `setLocaleAction` server action; cookie + user pref + URL fallback chain.
- ✅ Locale switcher placed on dashboard navbar, site header (landing), and now auth layout.
- ✅ Catalog grown from ~150 to ~844 keys × 2 locales.
- ✅ Bilingual hooks for dashboard overview, dialogs, purchase orders list, POS terminal + checkout, customers, suppliers, finance dashboard, login form, unauthorized page.
- ✅ Notification i18n bridge for suffixes + `notifications.operations.*` + `notifications.defaults.*` namespaces.
- ✅ Two reference mutation hooks (`useItemHooks`, `useCustomerQueries`) converted to Pattern C.
- ✅ Pre-existing schema drift fixed: `CustomerDTO/ItemDTO` exports, `Terminal` inline-annotation drift, `CustomerWithStats[]` shape mapping.
- ✅ Documentation: `BILINGUAL_MIGRATION_STATUS.md`, `BILINGUAL_AUDIT_2026-05.md`, `TAILWIND_LOGICAL_PROPERTIES.md`, `ENTERPRISE_READINESS_ROADMAP.md`, `PROJECT_ANALYSIS_AND_REMEDIATION.md`, and this report.

---

## The one-sentence answer

> Get the codebase type-clean and CI-gated, then turn on Postgres RLS — those three moves convert your impressive demo into a defensible enterprise product, and they make every subsequent improvement safe to ship.

---

## Concrete first task

Start Step 1 with `actions/item-suppliers/`. Six files, all the same `name` → `nameEn` Prisma-include drift pattern I fixed on the PO page. ~30 minutes of mechanical work that clears the biggest cluster of the 639 errors and unblocks the path to CI.
