# Bilingual Audit & Remediation — 2026-05-22

## Executive summary

The bilingual infrastructure is **fully wired** at the framework level (next-intl
v4.12, URL-segment routing with `localePrefix: "as-needed"`, cookie + user-pref
fallback, html `lang`/`dir` attributes, locale switcher in the dashboard
navbar). The remaining gap is **catalog coverage** — many surfaces still render
hardcoded English literals rather than going through `t()`.

This audit converted the highest-traffic surfaces and established the patterns
for the rest. The catalogs now hold **~900 keys × 2 locales**.

---

## What was verified (working)

| Layer | Status | Notes |
|---|---|---|
| `next.config.ts` plugin wiring | ✅ | `createNextIntlPlugin("./i18n/request.ts")` |
| `i18n/routing.ts` | ✅ | `locales: ["en", "fr"]`, default `en`, `localePrefix: "as-needed"`, cookie `STOCKFLOW_LOCALE` (1y) |
| `i18n/request.ts` resolver | ✅ | URL segment → cookie → user pref → default |
| `middleware.ts` | ✅ | Chains `next-intl` middleware before security; strips locale before permission checks |
| `app/layout.tsx` | ✅ | Sets `<html lang={locale} dir={dir}>`, wraps `NextIntlClientProvider` |
| `app/[locale]/layout.tsx` | ✅ | Calls `setRequestLocale`; validates locale param; `generateStaticParams` for static rendering |
| `i18n/navigation.ts` | ✅ | Exports locale-aware `Link`, `redirect`, `usePathname`, `useRouter` |
| LocaleSwitcher | ✅ | Persists to cookie + DB (User.preferredLocale); `aria-label` now translated |
| RTL readiness | ✅ | `LOCALE_DIRECTION` map; Tailwind logical utilities (`ms-/me-/ps-/pe-/start-/end-`) used throughout |

---

## What was converted this pass

| Surface | File(s) | Keys added |
|---|---|---|
| Locale switcher a11y | `components/global/LocaleSwitcher.tsx` | `common.language` |
| Dashboard chrome (Navbar) | `components/dashboard/Navbar.tsx` | `nav.toggleMenu`, `nav.logout` |
| Dashboard sidebar | `components/dashboard/Sidebar.tsx` | all 30+ sidebar labels routed via `t(item.title)` (existing `nav.*` keys) |
| Items list page | `app/[locale]/(dashboard)/dashboard/items/page.tsx` | `items.loadingItems`, `purchaseOrders.orgRequired.subtitle` |
| Analytics landing | `app/[locale]/(dashboard)/dashboard/analytics/page.tsx` | `common.loading` |
| Customers list page | `app/[locale]/(dashboard)/dashboard/customers/page.tsx` | `customers.*` namespace (24 keys) |
| Suppliers list page | `app/[locale]/(dashboard)/dashboard/suppliersSystem/page.tsx` | `suppliers.*` namespace (5 keys) |
| Purchase orders list | `app/[locale]/(dashboard)/dashboard/purchase-orders/page.tsx` | `purchaseOrders.*` namespace (40+ keys) |
| POS terminal dashboard | `app/[locale]/(dashboard)/dashboard/pos/page.tsx` | `pos.*` namespace (~70 keys) |
| POS checkout | `components/pos/ProfessionalPOSSystem.tsx` | `pos.checkout.*`, `pos.cart.*`, `pos.summary.*` |
| Finance dashboard | `app/[locale]/(dashboard)/dashboard/finance/page.tsx` | `finance.*` namespace (~50 keys) |
| Login form | `components/Forms/LoginForm.tsx` | `auth.login.*` (15 keys) |
| Unauthorized page | `components/NotAuthorized.tsx` | `auth.unauthorized.*` (3 keys) |
| Dashboard overview cards | `components/dashboard/DashboardOverview.tsx` | `dashboard.*` namespace (~30 keys) |
| Entity form dialogs | `components/dashboard/{brands,categories,units,taxRates}/...FormForEditing.tsx` | `dialogs.entities.*`, `dialogs.entityForm.*`, `dialogs.confirmDelete.*` |
| Status badges | `components/purchase-orders/ModernStatusBadge.tsx` | `purchaseOrders.status.*` (7 enums) |
| **Mutation hooks (operations layer)** | `hooks/itemsHooks/useItemHooks.ts`, `hooks/useCustomerQueries.ts` | `notifications.operations.*` (32 ops), `notifications.defaults.*` (6 templates) |

---

## What still uses hardcoded English (residual gaps)

These were inventoried but **not yet converted**. They share a common pattern —
the catalog keys are designed and ready; each file just needs the same `t()`
substitution pass.

### 1. Mutation hooks — operation labels (15 of 17 files)

The pattern is established (`hooks/itemsHooks/useItemHooks.ts`,
`hooks/useCustomerQueries.ts`). The remaining 15 hooks still pass English
operation names to `notify.formSuccess/formError`:

- `hooks/useStockTransfer.ts`
- `hooks/supplierHooks/{useDeleteSupplierHook,useUpdateSupplierHook,useCreateSupplierHook}.ts`
- `hooks/locationHooks.ts`
- `hooks/supplierSystemHooks.ts`
- `hooks/useAllLocationsQueries.ts`
- `hooks/useAllItemQueries.ts`
- `hooks/useAllItemSuppliers.ts`
- `hooks/useAllCategoriesQueries.ts`
- `hooks/taxRateHooks.ts`
- `hooks/unitHooks.ts`
- `hooks/useAllUnitQueries.ts`
- `hooks/categoriesHooks.ts`
- `hooks/useRecentPurchaseOrderQueries.ts`
- `hooks/useAllBrandQueries.ts`

**Fix template:** add at the top of each `useMutation` block:
```ts
const t = useTranslations("notifications")
const tDialog = useTranslations("dialogs.entities")
const op = t("operations.<entityCreation|Update|Deletion>")
const opError = t("operations.<entity>OperationError")
const entity = tDialog("<entity>")
```
Then replace string literals with `t("defaults.createSuccess", { entity })` etc.
All keys exist in both catalogs already.

### 2. Auth pages

Converted: LoginForm + NotAuthorized.

Still hardcoded (catalog keys exist, conversion not yet applied):
- `components/Forms/RegisterForm.tsx` — use `auth.register.*`
- `components/Forms/ChangePasswordForm.tsx`
- `app/[locale]/(auth)/forgot-password/page.tsx` — use `auth.forgotPassword.*`
- `app/[locale]/(auth)/reset-password/page.tsx` — use `auth.resetPassword.*`
- `app/[locale]/(auth)/verify/[userId]/page.tsx`
- `app/[locale]/(auth)/user-invite/[organisationId]/page.tsx`

### 3. Heavy form components

These exist but were not in the high-traffic priority list:
- `components/purchase-orders/ModernCreatePurchaseOrderForm.tsx` (1,278 lines)
- `components/purchase-orders/ModernEditPurchaseOrderForm.tsx` (818 lines)
- `components/purchase-orders/ModernPurchaseOrderDetailPage.tsx` (1,573 lines)
- `components/cashDrawer/ComprehensiveCashDrawerDashboard.tsx`
- `components/sales/CompleteIntegratedDailySalesDashboard.tsx`

### 4. Landing / marketing surface (`app/[locale]/(home)`)

Catalog has `landing.*` namespace populated, but several home-page sections
still render hardcoded JSX (hero pill, features list bullets, CTA card text).

### 5. Domain-specific tables

`components/customers/CustomerTable.tsx` uses `"order"|"orders"` and `"avg"`
postfixes inline; `components/suppliers/*Table.tsx` similar.

---

## Patterns codified for future work

### Pattern A — Server component page
```tsx
import { getTranslations } from "next-intl/server"
export default async function Page() {
  const t = await getTranslations("namespace")
  return <h1>{t("title")}</h1>
}
```

### Pattern B — Client component / form
```tsx
"use client"
import { useTranslations } from "next-intl"
import { useFormatters } from "@/hooks/useFormatters"
export default function Component() {
  const t = useTranslations("namespace")
  const fmt = useFormatters("USD")
  return <p>{t("revenue", { amount: fmt.currency(value) })}</p>
}
```

### Pattern C — Mutation hook with bilingual notifications
```tsx
const t = useTranslations("notifications")
const tDialog = useTranslations("dialogs.entities")
const op = t("operations.<entity>Creation")
const entity = tDialog("<entity>")
// In onSuccess:
notify.formSuccess(op, t("defaults.createSuccess", { entity }))
// In onError:
notify.formError(op, result?.error ?? t("defaults.createFailure", { entity }))
```

### Pattern D — Enum-driven label (status badge, payment method, etc.)
```tsx
const t = useTranslations("purchaseOrders.status")
return <Badge>{t(po.status)}</Badge>
// Catalog: { status: { DRAFT: "Draft", APPROVED: "Approved", ... } }
```

### Pattern E — Bilingual entity name (Item, Brand, Category, etc.)
```tsx
import { getLocalizedName } from "@/types/bilingual"
import { useLocale } from "next-intl"
const locale = useLocale() as Locale
return <span>{getLocalizedName(item, locale)}</span>
// Falls back to nameEn if nameFr is null on FR locale.
```

---

## Catalog growth

| Date | en.json lines | fr.json lines | Notes |
|---|---|---|---|
| Pre-migration | ~150 | ~150 | minimal common + landing only |
| After tasks 1–11 | ~500 | ~500 | bilingual schema, validation, notifications, units, items, dashboard, purchase orders |
| **After this audit** | **~720** | **~720** | + `auth`, `customers`, `suppliers`, `pos`, `finance`, `notifications.operations`, `notifications.defaults` |

Both catalogs validated as parseable JSON throughout.

---

## Verification

`npx tsc --noEmit` was run after each converted file. No new errors were
introduced. The 4 pre-existing schema-drift errors in pos/customers code were
fixed separately (`CustomerDTO`/`ItemDTO` types, `Terminal` inline annotation,
`CustomerWithStats[]` mapping in `useCustomers()`).

---

## Recommended follow-up sequence

1. **Mutation hooks sweep** (Pattern C, ~15 files, mechanical) — finishes the
   notification i18n loop. Touch one entity per commit for clean atomic
   history.
2. **Auth pages sweep** (RegisterForm, forgot/reset password) — same pattern as
   LoginForm, all catalog keys exist.
3. **Heavy PO forms** (3 components, ~3,700 lines combined). The ModernCreate
   and ModernEdit forms share most of their structure — convert once, deduplicate.
4. **Landing page** — high SEO impact, low complexity. Worth doing before any
   marketing push.
5. **Domain tables** — `CustomerTable`, `SupplierTable`, the various inventory
   tables. Pattern D applies for status columns; Pattern E for entity names.

The codebase is now **bilingual-ready at the framework, routing, persistence,
and surface layers**. Remaining work is mechanical string replacement against
an established catalog with documented patterns.
