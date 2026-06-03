# Bilingual Visibility Implementation Report

**Date:** 2026-05-21  
**Status:** Partially complete — 11 of 15 tasks done

---

## Problem

The full i18n infrastructure (next-intl, `[locale]` routing, `LocaleSwitcher`, `en.json`/`fr.json`) was built but disconnected from the UI. Three root causes:

1. `LocaleSwitcher` was only mounted in `components/dashboard/Navbar.tsx` — invisible on public/landing pages
2. All 7 landing-page components used hardcoded English strings instead of `useTranslations()`
3. `components/dashboard/Sidebar.tsx` rendered literal `title` strings from `config/sidebar.ts` instead of translated nav keys

---

## Changes Made

### Message Files

| File | Change |
|---|---|
| `messages/en.json` | Extended `nav` with 24 new keys (roles, locations, stockTransfers, etc.); added full `landing` namespace (nav, hero, metrics, features, howItWorks, pricing, faq, cta) |
| `messages/fr.json` | Same structure — complete French translations for all new keys |

### Public Site

| File | Change |
|---|---|
| `components/frontend/site-header.tsx` | Added `<LocaleSwitcher />` between nav and auth buttons; switched all `next/link` → locale-aware `Link` from `@/i18n/navigation`; wired all nav labels, CTA text, and dropdown strings to `useTranslations("landing.nav")` |
| `components/frontend/stockflow-hero.tsx` | `useTranslations("landing.hero")` — pill, headline, subheading, CTAs, trust badges, floating stat card labels |
| `components/frontend/metrics-bar.tsx` | `useTranslations("landing.metrics")` — moved `metrics` array inside component so labels are reactive |
| `components/frontend/stockflow-features.tsx` | `useTranslations("landing.features")` — badge, headlines, all 8 feature titles and descriptions |
| `components/frontend/how-it-works.tsx` | `useTranslations("landing.howItWorks")` — badge, headline, all 3 step titles and descriptions |
| `components/frontend/stockflow-pricing.tsx` | `useTranslations("landing.pricing")` — all plan names, descriptions, feature lists, CTAs, "Most Popular" badge; `Link` locale-aware |
| `components/frontend/stockflow-faq.tsx` | `useTranslations("landing.faq")` — badge, headline, all 8 Q&A pairs |
| `components/frontend/stockflow-cta.tsx` | `useTranslations("landing.cta")` — badge, headlines, body, both CTAs; `Link` locale-aware |

### Dashboard Navigation

| File | Change |
|---|---|
| `config/sidebar.ts` | All `title` string values changed from display strings (e.g. `"Dashboard"`) to camelCase translation keys (e.g. `"dashboard"`) that map to `nav.*` in the message files. Removed unused `Book` import. |

---

## Remaining Work

These 4 tasks are defined in the plan at `docs/superpowers/plans/2026-05-21-bilingual-visibility.md` (Tasks 11–13):

### Task 11 — Wire `Sidebar.tsx` and `Navbar.tsx`

**`components/dashboard/Sidebar.tsx`:**
```tsx
// Add import:
import { useTranslations } from "next-intl";

// Inside Sidebar component:
const t = useTranslations("nav");

// Replace {item.title} → {t(item.title)}
// Replace {menuItem.title} → {t(menuItem.title)}
// Replace "Live Website" → {t("liveWebsite")}
```

**`components/dashboard/Navbar.tsx`:**
```tsx
// Add import:
import { useTranslations } from "next-intl";

// Inside Navbar component:
const t = useTranslations("nav");

// Replace the hardcoded "Logout" button text:
// <Button onClick={handleLogout} size="sm" className="w-full">
//   {t("logout")}
// </Button>
```

### Task 12 — Wire `ModernBrandForm.tsx`

```tsx
import { useTranslations } from "next-intl";

// Inside component:
const tBrands = useTranslations("brands");
const tBi    = useTranslations("bilingual");
const tCommon = useTranslations("common");

// Replace:
// "Brand Management"     → tBrands("title")
// "Create New Brand"     → tBrands("createTitle")
// "Brand Name"           → tBrands("name")
// "Preview"              → tBrands("preview")
// "Name (English)"       → tBi("nameEn")
// "Name (French)"        → tBi("nameFr")
// "Description (English)"→ tBi("descriptionEn")
// "Description (French)" → tBi("descriptionFr")
// "Optional. Falls back…"→ tBi("frenchOptional")
// "Save" / "Save Changes"→ tCommon("save") / tCommon("saveChanges")
// "Cancel"               → tCommon("cancel")
```

### Task 13 — Wire `CategoryFormForEditing.tsx` and `TaxRateFormForEditing.tsx`

**Category form:**
```tsx
const tCat    = useTranslations("categories");
const tBi     = useTranslations("bilingual");
const tCommon = useTranslations("common");
// "Category Management" → tCat("title")
// "Create New Category" → tCat("createTitle")
// "Category Name"       → tCat("name")
// "Common Categories"   → tCat("commonCategories")
// "Preview"             → tCat("preview")
// bilingual field labels → tBi(...)
// Save/Cancel           → tCommon(...)
```

**Tax rate form:**
```tsx
const tTax    = useTranslations("taxRates");
const tCommon = useTranslations("common");
// "Tax Rate Management" → tTax("title")
// "Create New Tax Rate" → tTax("createTitle")
// "Tax Rate Name"       → tTax("name")
// "Rate (%)"            → tTax("rate")
// "Percentage rate…"    → tTax("rateHint")
// "Common Tax Rates"    → tTax("commonRates")
// "Preview"             → tTax("preview")
// Save/Cancel           → tCommon(...)
```

---

## How to Verify

1. Run `node -e "JSON.parse(require('fs').readFileSync('messages/en.json','utf8'))"` — no errors
2. Run `node -e "JSON.parse(require('fs').readFileSync('messages/fr.json','utf8'))"` — no errors
3. Start dev server: `npm run dev`
4. Open `http://localhost:3000` — site header shows a **globe + EN** button
5. Click **FR** — page reloads; hero, metrics, features, pricing, FAQ, CTA all render in French
6. Navigate to `/dashboard` — sidebar labels switch with locale (once Task 11 is done)
7. Open `/fr` — URL-segment locale routing confirmed working

---

## Architecture Notes

- `LocaleSwitcher` (at `components/global/LocaleSwitcher.tsx`) persists the locale choice to both the `STOCKFLOW_LOCALE` cookie and `User.preferredLocale` in the database via `setLocaleAction`.
- The default locale (`en`) has no URL prefix; `/fr/...` gets the `/fr` prefix — controlled by `localePrefix: "as-needed"` in `i18n/routing.ts`.
- All landing page `Link` components now import from `@/i18n/navigation` (locale-aware) instead of `next/link`, so internal links carry the active locale automatically.
- The `config/sidebar.ts` `title` fields are now translation keys, not display strings — they must match a key in the `nav` namespace of both message files.
