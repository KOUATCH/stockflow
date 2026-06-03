# Bilingual EN/FR Migration — Final Status

> All 11 tracked tasks committed (commit range: `1a7bdf5` → `3dcfa78`).
> This document is the post-migration source of truth: what landed,
> what's deliberately not in scope, and the known follow-up issues
> that came in flight but weren't on the i18n task list.

## Status at a glance

| Area | Status | Notes |
|---|---|---|
| Prisma schema (bilingual columns) | DONE | EN/FR pairs on Item, Category, Unit, TaxRate, ExpenseCategory, Brand, Role. `Locale` enum + `preferredLocale` on User/Org/Customer. |
| Live DB | DONE | All bilingual columns populated; Brand migrated via `scripts/brand-bilingual-backfill.ts` (24/24 rows). |
| Service layer (5 domains) | DONE | Unit, TaxRate, Category, Item, Brand: services + zod + tests bilingual. |
| Action layer (6 directories) | DONE | `actions/<domain>/*` clean for Unit, TaxRate, Category, Brand, Item. `actions/itemsShow/` triaged (7 orphans deleted, 9 active actions wrapped over services/). `actions/inventory/` and `actions/analytics/` bilingual. |
| Forms (5 entity domains) | DONE | Unit, TaxRate, Category, Brand: create + table-edit with EN+FR input pairs. Item: 3 active forms (`ModernCreateItemForm`, `ModernItemFormForEditing`, `ItemForm2`) fully bilingual; 16 orphan/broken item files deleted in `7ccb967`. |
| `next-intl` install + URL routing | DONE | Routes under `app/[locale]/`. `localePrefix: "as-needed"` → default-locale URLs stay unprefixed (`/dashboard/items`), French gets `/fr/dashboard/items`. |
| Middleware chaining | DONE | `createIntlMiddleware` runs first for non-API paths; security/auth/perms run after on a locale-stripped path. `/api/*` skips next-intl entirely. |
| Locale switcher | DONE | `components/global/LocaleSwitcher.tsx` rendered in dashboard navbar; persists to `STOCKFLOW_LOCALE` cookie + `User.preferredLocale` (DB). |
| Auth session carries locale | DONE | `session.user.preferredLocale` populated in credentials + GitHub + Google OAuth + JWT refresh path. |
| Message catalogs | SEEDED | `messages/{en,fr}.json` ~200 keys each (common, errors, nav, bilingual, units, taxRates, categories, brands, items, emails, validation, notifications). French hand-translated. |
| Zod validation i18n | DONE | `vmsg()` + `installZodErrorMap()` infrastructure; `ZodI18nBridge` in `components/Providers.tsx` wires next-intl into resolver. `validations/*.ts` + `lib/validations/*.ts` converted. |
| Email templates | DONE | All 3 templates (`verify-email`, `reset-password`, `user-invite`) read from catalog via `getTranslations({ locale })`. Each accepts a `locale` prop so admin-triggered emails translate for the recipient. |
| Notification helpers | DONE | `notify.formSuccess/formError/operationStart/operationComplete` route through `notifyResolver` wired by `NotifyI18nBridge` in Providers.tsx. |
| Excel exports | DONE (active surfaces) | Bilingual entity tables emit separate `Name (EN)` / `Name (FR)` columns. |
| PDF exports | NOT AUDITED | No PDF generation surfaces found in scope. If you add one, use `lib/i18n/formatters.ts` server-side with the recipient's `preferredLocale`. |
| Locale-aware formatters | DONE | `lib/i18n/formatters.ts` (standalone) + `hooks/useFormatters.ts` (client hook). ~95% of `toLocaleString` / `Intl.NumberFormat` callsites converted; 22 orphan files deleted as part of the sweep. |
| RTL readiness | DONE | `<html dir={dir}>` driven by `LOCALE_DIRECTION` map. 191 files swept from physical → logical Tailwind utilities (`ml-* → ms-*`, etc.). Adding Arabic = one line in `i18n/routing.ts` + a `messages/ar.json`. |

## Architectural invariants

Any new code must follow these. Existing work assumes them.

1. **Bilingual columns are a pair, not a JSON map.** `nameEn` is required; `nameFr` is `String?` and falls back to `nameEn` at render via `getLocalizedName(row, locale)`.
2. **Decimals serialize to string at the service boundary.** Prisma `Decimal` → `.toString()` in the `toDTO` mapper. Don't ship `Decimal` instances over the wire.
3. **Soft delete via `deletedAt`** where the column exists (Item, Category, Brand). Service `delete*` functions set `deletedAt + isActive=false` via `update`, not `db.<x>.delete()`.
4. **Locale resolution priority**: URL segment → cookie → user pref → org default → `"en"`.
5. **URL-segment routing is live**: routes live under `app/[locale]/`. Default locale (EN) URLs have no prefix.
6. **Bilingual helpers** live in `types/bilingual.ts`: `getLocalizedField`, `getLocalizedName`, `getLocalizedTitle`, `getLocalizedDescription`, `bilingualWrite`, `fromPrismaLocale`, `toPrismaLocale`.
7. **Formatters**: client components use `useFormatters()` from `@/hooks/useFormatters`. Server components / email templates / actions use the standalone functions from `@/lib/i18n/formatters` and pass `locale` explicitly (typically `await getLocale()` from `next-intl/server`).
8. **Tailwind**: use logical utilities — `ms-*`, `me-*`, `ps-*`, `pe-*`, `start-*`, `end-*`, `text-start`, `text-end`, `border-s/e`, `rounded-s/e`. Physical utilities are tolerated only when no logical equivalent exists (e.g. `slide-in-from-left-N` animations, `left-full` positioning).
9. **Navigation**: prefer `Link`/`redirect`/`usePathname`/`useRouter` from `@/i18n/navigation` (real next-intl primitives) over the bare `next/link` / `next/navigation`. The default-locale URLs work either way; the locale-aware imports carry the FR prefix correctly.

---

## What's NOT in scope (and what to do if you want it)

These were deliberately left as-is.

### Adding a third locale (e.g. Spanish, Arabic)

1. Add `"es"` (or `"ar"`) to `SUPPORTED_LOCALES` in `types/bilingual.ts`.
2. Update `LOCALE_DIRECTION` in `i18n/routing.ts` (`ltr` or `rtl`).
3. Add `messages/es.json` (copy `en.json` and translate).
4. If the DB needs the third language for entity names, you'd schema a `nameEs` / `descriptionEs` column or refactor to a JSONB `translations` map. The current pair-column design only supports two languages.
5. For RTL: the `<html dir>` already flips; the Tailwind sweep has already converted ~95% of physical utilities to logical equivalents. Spot-check the layout after enabling.

### URL-segment routing for `/api/*`

API routes don't carry locale in the URL. If you want them to (e.g. for content-language headers), wrap each route handler with `getLocale()` from `next-intl/server` and emit the header. Not urgent — clients can pass `Accept-Language` or `?locale=fr` query params.

### Migrating all `next/link` callsites to `@/i18n/navigation`

The default-locale (EN) URLs work unchanged because the middleware doesn't add a prefix for EN. Only navigations *between* locales currently rely on the locale-aware `Link`. For full correctness across user-initiated locale switches, sweep `import Link from "next/link"` → `import { Link } from "@/i18n/navigation"` codebase-wide. Mechanical, ~100+ files. Defer until a user reports a wrong-locale link.

### PDF export i18n

No PDF generation exists. If you add one (e.g. invoice receipts via `@react-pdf/renderer`), pass the recipient's `preferredLocale` and use the standalone formatters.

---

## Known pre-existing breakages (NOT introduced by the migration)

These showed up during the migration but predate it. Fix in dedicated, focused commits — they are not i18n-related.

### Missing module declarations — RESOLVED

All four entries from this section landed in a follow-up commit. 749 → 640
total tsc errors; the resolved 109 were all import-resolution failures.

| Missing import | Status | Notes |
|---|---|---|
| `@/hooks/useCustomerQueries` | DONE | Authored with 6 hooks (useCustomers, useCustomer, useCustomerOrders, useCreateCustomer, useUpdateCustomer, useDeleteCustomer). `useCustomerOrders` is a STUB until a server action exists; returns zero stats. |
| `@/hooks/useAllItemSuppliers` | DONE | `useUpdateItemSupplier` wired over the existing action. |
| `@/hooks/cashDrawer/useAllCashDrawerHooks` | DONE (stubs) | 9 hooks authored as stubs — the cash-drawer service only exposes `addCash`/`removeCash`/`getSummary`, so the dashboards render empty state until the 9 missing server actions are authored. Stub shapes are permissive across what every consumer reads. |
| `@/lib/utils` `formatCurrency` export | DONE | 6 broken import sites swapped to `@/lib/formatCurrency`. 5 of those files were also zero-importer orphans and got deleted. |

Also surfaced and resolved during this work:
- `@/hooks/useAllLocationsQueries` was missing — authored (`useOrgLocationsNew` + `useUpdateLocationBasicInfo`).
- `@/hooks/useInventoryMovementQueries` was missing — authored (`useInventoryTransactions` flat-arrayed over the existing action; `useStockMovementSummary` as STUB).
- `useOrgItemsNew` had two incompatible call signatures (positional `(orgId, page, ...)` vs options-object `(orgId, { enabled })`) — widened to accept both.
- 8 orphan inventory/cash-drawer components deleted in the same commit.

### Type drift / schema-rewrite leftovers — RESOLVED

All 7 entries below have been resolved. Net tsc error count dropped
from 749 → 470 across the punch-list work.

| Symptom | Resolution |
|---|---|
| `Property 'taxRateName' does not exist on type 'TaxRate'` | The two `SupplierFormForEditing*.tsx` files were zero-importer orphans — deleted. Lingering occurrences in `types/types.ts` and `types/newPOSSession/types.ts` renamed to `nameEn`/`nameFr`. |
| Decimal arithmetic on string-serialized money | Added a `toN()` helper (returns 0 for null/undefined, calls `.toString() → Number()` for Decimal). Swept across 10 files: `actions/analytics/financial-reports.ts`, `actions/supplierSystem/supplierSystemActions.ts`, `components/ui/groups/inventory/ItemManagement.tsx`, `lib/analytics/pos/{create-sale,pos-session}.ts`, `lib/inventory/update-inventory-levels.ts`, `prisma/seed.ts`, `services/{cash-drawer,inventory,pos,purchase-order}.*.service.ts`. Final TS2363+TS2365 count: 0. |
| `<Bar fill={callback}>` no overload match | `CashFlowChart.tsx` switched to `<Cell>` child pattern. `ProfitMarginChart.tsx` ReferenceLine label position `"topLeft"` → `"insideTopLeft"`. |
| `'Crystal' is not a member of 'lucide-react'` | Renamed to `Sparkles` in `FinancialForecastingDashboard.tsx`. |
| Duplicate object property in literal | The file (`components/inventory/stockAdjustments/stockAdjustmentActions.ts`) was zero-importer — deleted. |
| `notification.duration` possibly undefined | Added `?? 1` guard in the divisor in `EnhancedNotificationSystem.tsx`. |
| `mockLevels` referenced but not defined | The 788-line file (`actions/inventory/inventoryActions.ts`) was zero-importer stub against mock data — deleted. |

Additional cleanup landed in the same commit:
- Consumer-side bug fixes: `setIsOpenDialogOpen`/`setIsCloseDialogOpen` typos in `ComprehensiveCashDrawerDashboard.tsx` redirected to the wired `setOperationDialogOpen`; `transaction.user` null-safety in `CashDrawerManagement.tsx`; `itemsResponse?.data` mis-treated as an array in `StockMovementDashboard.tsx`.
- 9 more missing-module hook files authored (usePermissions, useNotifications alias, usePOSQueries, useStockTransfer, useDailySalesReporting, locationHooks, supplierSystemHooks, 4 supplierHooks). Most are STUBS where no server action exists — they unblock the build and let pages render an empty state.
- 18 more zero-importer orphan files deleted across components/Forms, components/dashboard/suppliers, components/inventory, app/.../suppliersSystem/[id], etc.
- ~20 implicit-any callback params typed (a local `POLineLike` alias in `ModernPurchaseOrderDetailPage.tsx` covers 13 of them).

The remaining 470 tsc errors are concentrated in TS2339 (property doesn't exist — type drift between Prisma `include` shapes and consumer reads, mostly around POSSession + sales-analytics) and TS2353 (excess properties on Prisma object literals). Each is a deeper per-file refactor; none represent missing modules or broken arithmetic.

### Pre-existing orphan items (already deleted in this migration)

Tracked here so anyone resurrecting old branches knows these are intentionally gone:
- `components/Forms/inventory/ItemFormModal.tsx`, `NewItemForm.tsx`
- `components/dashboard/items/ItemFormForEditing.tsx`, `ItemManagement.tsx`
- `components/inventory/{CreateItemForm,item/CreateItemInput.ts,item/create-item-form,item/itemCreateForm}.tsx`
- `components/ui/groups/{BrandItemListing,ItemListingWithEditing}.tsx`
- `components/ui/groups/inventory/{ItemForm,ItemManagementSimple,ItemStats,ItemTableColumns}.tsx`
- `components/{DataTableColumns/SavingsSummary,dashboard/DashboardMain,inventory/{InventoryOverview,inventoryManagementDashboard},pos/POSSystem}.tsx`
- `components/ui/groups/{LastUnifiedSupplierFormForEditing,LocationListingWithEditing,SupplierEditingForm,SupplierFormEditing,SupplierListingWithEditing,UnifiedSupplierFormRevised}.tsx`
- `components/analytics/reports/*` (duplicate of `components/reports/*`)
- `app/(dashboard)/dashboard/analytics/reports/*-report.tsx` (duplicate)
- `actions/inventory/{fetchItemsWithInventoryLevels,getInventoryStats,mutateInventory}.ts`
- `actions/analytics/get-sales-analytics.ts` + `lib/analytics/analytics/get-sales-analytics{,-original}.ts`
- `actions/itemsShow/{updateItemStockById,updateItemRelationsById,updateItemPricingById,updateItemItemDetailsById,updateItemBasicInfoById,getItemById,createBulkItems}.ts`
- Two `oldPage.tsx` files + `basicz-infox-tabq.tsx` + `item-update-form.tsx`

---

## File index — i18n infrastructure

| Purpose | Path |
|---|---|
| Bilingual helpers (locale type, getLocalizedName/Title/Description) | `types/bilingual.ts` |
| Locale config (cookie name, direction map, routing) | `i18n/routing.ts` |
| next-intl per-request config | `i18n/request.ts` |
| Locale-aware navigation primitives | `i18n/navigation.ts` |
| Plugin wiring | `next.config.ts` (`createNextIntlPlugin("./i18n/request.ts")`) |
| English catalog | `messages/en.json` |
| French catalog | `messages/fr.json` |
| Locale switcher UI | `components/global/LocaleSwitcher.tsx` |
| Persist locale (cookie + DB) | `actions/users/setLocale.ts` |
| Zod validation message helper | `lib/i18n/zod-messages.ts` |
| Locale-aware Intl formatters (server) | `lib/i18n/formatters.ts` |
| Locale-aware Intl formatters (client hook) | `hooks/useFormatters.ts` |
| Session type extension | `next-auth.d.ts` |
| Brand DB backfill script | `scripts/brand-bilingual-backfill.ts` |
| DB schema/data inspectors | `scripts/check-db-schema.ts`, `scripts/check-db-data.ts` |
| Locale-segment layout (param validation + setRequestLocale) | `app/[locale]/layout.tsx` |
| Locale-stripping in middleware | `middleware.ts` (chained with `createIntlMiddleware`) |

---

## Commit map (chronological)

| Commit | What |
|---|---|
| `1a7bdf5` | Snapshot of WIP services-layer refactor + bilingual schema |
| `a66b112` | Unit vertical slice — pilot |
| `b162edc` | TaxRate vertical slice |
| `e0cd086` | Category vertical slice |
| `230fc20` | Item core (types/services/actions) |
| `28fac4c` | Brand rename + DB migration |
| `16a8247` | next-intl install (cookie-based, no URL segment yet) |
| `26400fe` | Phases 3-6 infrastructure |
| `2dbb75b` | Initial migration status doc |
| `eab54b1` | Task 1 — LocaleSwitcher in header |
| `6d39c3a` | Task 2 — session.preferredLocale wiring |
| `c2c25ae` | Task 3 — Item forms surgical bilingual updates |
| `d595ff6` | Task 4 — actions/itemsShow/ triage |
| `2e9de23` | Task 5 — inventory + analytics bilingual |
| `6b75d37` | Task 6 — zod schemas via vmsg() |
| `865301f` | Task 7 — email templates bound to catalog |
| `1157ab0` | Task 8 — notification helpers via resolver |
| `48dee7a` | Task 9 — useFormatters() hook + first conversions |
| `a9dffe1` | Task 10 — navigation infra staged |
| `3f21f25` | Task 11 — Tailwind logical pattern doc + LocaleSwitcher example |
| `7ccb967` | Task 3 follow-up — delete 16 orphans + rewrite wired item forms |
| `56ce01c` | Task 9 prep — delete 22 orphans + centralize lib helpers + 4 reports |
| `bb3e034` | Task 9 sweep — 29 files converted |
| `3ea9f4a` | Task 10 — URL-segment routing active (route move + middleware) |
| `3dcfa78` | Task 11 — 191-file Tailwind logical sweep |

---

## Verification commands

Useful when picking up follow-up work:

```bash
# Type-check the whole repo.
npx tsc --noEmit

# Filter to a specific slice (replace pattern as needed).
npx tsc --noEmit 2>&1 | grep -E "components/customers/"

# Inspect live DB column shape for any table.
npx ts-node --project tsconfig.seed.json --transpile-only scripts/check-db-schema.ts

# Inspect bilingual data presence (which rows have nameFr / titleFr).
npx ts-node --project tsconfig.seed.json --transpile-only scripts/check-db-data.ts

# Brand backfill is idempotent — safe to re-run on any environment that
# still has the brandName column (e.g. a fresh clone of an older branch).
npx ts-node --project tsconfig.seed.json --transpile-only scripts/brand-bilingual-backfill.ts

# Sanity-check that no physical Tailwind utilities crept back in
# (excluding animation/positioning utilities that have no logical
# equivalent).
grep -rE 'className=.*\b(ml|mr|pl|pr)-[0-9]' components/ app/ 2>/dev/null \
  | grep -v graphify | grep -v node_modules

# Sanity-check that no raw Intl callsites crept back in.
grep -rE 'new Intl\.NumberFormat|toLocaleDateString' components/ app/ lib/ 2>/dev/null \
  | grep -v graphify | grep -v node_modules | grep -v '/i18n/' | grep -v '/hooks/useFormatters'
```

---

## How to roll back

The migration is a linear sequence of commits, so reverting individual commits is risky (Brand schema rename can't be cleanly reverted because the DB column was dropped). Instead:

- **Single-feature revert**: prefer reverting a specific commit (e.g. just Task 11) with `git revert <sha>`.
- **Locale switcher / cookie**: removing `LocaleSwitcher` and middleware leaves the codebase in EN-only mode but still bilingual-data-aware. Safe.
- **Schema rollback**: the Brand `brandName` → `nameEn/nameFr` migration is irreversible without a separate down-migration. The data was preserved (24 rows copied), but rolling back means writing a down-migration that adds `brandName` back and copies `nameEn` into it.

See the commit map above for what's atomic and what isn't.
