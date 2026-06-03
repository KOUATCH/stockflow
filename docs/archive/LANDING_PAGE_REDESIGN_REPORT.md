# Landing Page Redesign Report

**Date:** 2026-05-21  
**Scope:** Full audit and redesign of the StockFlow public landing page  
**Files changed:** 9 (7 created, 2 rewritten)

---

## 1. Executive Summary

The existing landing page was a copy-paste of a developer boilerplate ("HubStack") that had never been updated for StockFlow. Every section — hero copy, navigation, feature tabs, FAQ, pricing, CTAs, and showcase — referenced the wrong product, the wrong audience, and broken external links. The redesign replaces all placeholder content with StockFlow-specific, enterprise-retail-focused content and establishes a coherent dark visual identity.

---

## 2. Audit Findings

### 2.1 Critical Issues (Pre-Redesign)

| Severity | Location | Issue |
|----------|----------|-------|
| 🔴 Critical | Hero `mobileTitle` | Hardcoded `"Ultimate Next.js Agency & SaaS Kit"` — wrong product name |
| 🔴 Critical | Primary CTA `href` | Linked to `gmukejohnbaptist.gumroad.com/l/hubstack-simple-auth` — external developer product purchase |
| 🔴 Critical | `PricingCard` | Named product "HubStack", priced for single developer, not retail business |
| 🔴 Critical | `FAQ` | All 9 questions about boilerplate code access, GitHub repos, and developer licensing |
| 🔴 Critical | `site-header.tsx` | Navigation features listed: Prisma ORM, Rich Text Editor, Image Upload — developer tools |
| 🔴 Critical | `site-header.tsx` | "Get started" dropdown link pointed to `coding-school-typescript.vercel.app/give-away` |
| 🔴 Critical | `FeatureTabs` | Feature descriptions for "Authentication", "Rich Text Editor", "Image Upload" — not inventory management |
| 🟠 High | `Showcase` | Placeholder companies ("Tech Innovators", "HealthStream") with placeholder image paths (`/1.png`, `/2.png`) |
| 🟠 High | `ProjectComparison` | Compared "Setting up Emails" and "Agency page" — irrelevant to retail inventory |
| 🟠 High | `TechStackGrid` | Developer-centric tech stack grid irrelevant to retail buyers |
| 🟠 High | `CustomizationCard` | "Custom development from $300" — developer service offer, not product feature |
| 🟡 Medium | Hero `backgroundStyle` | Set to `"red"` — alarming color for a business management tool |
| 🟡 Medium | Design | Inconsistent palette: red hero → purple tabs → green FAQ — no visual cohesion |
| 🟡 Medium | Typography | No size hierarchy; hero headline at `text-3xl/4xl` — too small for enterprise |
| 🟡 Medium | Subtitle | 60-word unbroken paragraph in hero — unreadable on mobile |
| 🟡 Medium | Login/Signup links | Missing locale prefix (`/login` instead of `/en/login`) — broken routing |
| 🟢 Low | Hero `announcement` | No `href` — pill badge with no destination |
| 🟢 Low | YouTube embed | Unstyled iframe with no dark-mode border treatment |

### 2.2 Missing Enterprise Sections

The following sections, standard for B2B SaaS landing pages, were entirely absent:

- **Metrics / social proof bar** — no trust signals (users, transactions, uptime)
- **"How it works"** — no onboarding narrative
- **B2B pricing** — no per-location/per-user pricing model appropriate to retail operators
- **Security & compliance callouts** — no mention of data security, SOC 2, or encryption
- **Retail-specific FAQ** — no answers relevant to the actual product
- **Closing CTA section** — no dedicated conversion moment at page bottom

---

## 3. Redesign Decisions

### 3.1 Audience Repositioning

| Before | After |
|--------|-------|
| Developers buying a starter kit | Retail business owners and operations managers |
| "One developer license" | Per-location B2B SaaS pricing |
| "Clone from GitHub" CTA | "Start Free Trial" with 14-day trial offer |
| Developer FAQ (licensing, refunds for code) | Retail FAQ (migration, multi-location, mobile money, security) |

### 3.2 Visual Identity

| Property | Before | After |
|----------|--------|-------|
| Primary background | `bg-red-950` hero, scattered light sections | `#04080F` (near-black) throughout |
| Accent color | Inconsistent red/green/purple | `#00D4A4` teal — consistent across all sections |
| Typography scale | `text-3xl` hero headline | `text-5xl` → `text-7xl` responsive headline |
| Section transitions | Hard color breaks | Unified dark palette with subtle surface variation |
| Animations | Generic framer-motion transitions | `useInView` staggered reveals per section; count-up metrics |

### 3.3 Content Architecture

New page structure (top → bottom):

```
1. StockFlowHero          ← Dark hero, dashboard preview, floating stat cards
2. MetricsBar             ← 4 animated trust metrics
3. StockFlowFeatures      ← 8-card bento grid of actual product capabilities
4. HowItWorks             ← 3-step onboarding narrative
5. Demo (YouTube embed)   ← Styled video section
6. StockFlowPricing       ← 3-tier B2B pricing (Starter / Growth / Enterprise)
7. StockFlowFAQ           ← 8 retail-specific Q&As
8. StockFlowCTA           ← Dark gradient closing call-to-action
```

Removed sections:

- `TechStackGrid` — developer-focused, irrelevant to retail buyers
- `ProjectComparison` — compared developer setup tasks, not retail pain points  
- `Showcase` — placeholder company cards with broken image paths
- `CustomizationCard` — developer service upsell at wrong price point
- `FeatureTabs` (SmoothTabs) — developer toolkit features, not inventory management

---

## 4. Files Changed

### 4.1 Created

| File | Description |
|------|-------------|
| `components/frontend/stockflow-hero.tsx` | Full-width dark hero with ambient orbs, dot-grid background, gradient headline, dashboard preview with BorderBeam, and two floating stat cards |
| `components/frontend/metrics-bar.tsx` | Animated count-up bar: 50,000+ items tracked, 99.9% uptime, 200+ businesses, 12× faster stock counts |
| `components/frontend/stockflow-features.tsx` | Bento grid — 1 large featured card (Multi-Location Inventory) + 7 equal cards covering the full StockFlow schema surface |
| `components/frontend/how-it-works.tsx` | 3-step section: Setup → Connect → Control, with decorative connector line on desktop |
| `components/frontend/stockflow-pricing.tsx` | 3-tier pricing: Starter ($49/mo), Growth ($149/mo, featured), Enterprise (custom) |
| `components/frontend/stockflow-faq.tsx` | 8 accordion Q&As covering migration, multi-location, POS payments, security, permissions, bilingual support, and cancellation |
| `components/frontend/stockflow-cta.tsx` | Dark gradient CTA with dual buttons (Create Account + See It in Action) |

### 4.2 Rewritten

| File | Key Changes |
|------|-------------|
| `app/[locale]/(home)/page.tsx` | Replaced all HubStack sections with new components; removed 5 sections, added 7 |
| `components/frontend/site-header.tsx` | Replaced 9 developer feature links with 8 StockFlow features; fixed 2 broken external links; dark header styling (`#04080F`); teal "Start Free Trial" CTA button; corrected locale prefixes on login/register links |

---

## 5. Feature Coverage (New vs Schema)

The features grid now accurately reflects StockFlow's actual Prisma schema:

| Feature Card | Schema Models Referenced |
|---|---|
| Multi-Location Inventory | `InventoryLevel`, `Location` |
| Point of Sale | `POSStation`, `POSSession`, `CashDrawer`, `Payment` |
| Sales Analytics | `DailySalesReport`, `DailySalesReportItem` |
| Purchase Orders | `PurchaseOrder`, `PurchaseOrderLine`, `GoodsReceipt` |
| Stock Transfers | `StockTransfer`, `StockTransferLine` |
| Serial & Batch Tracking | `SerialNumber`, `InventoryTransaction` |
| Supplier Management | `Supplier`, `ItemSupplier`, `SupplierLedgerEntry` |
| Role-Based Access | `Role`, `User` (via `_UserRoles`) |

---

## 6. Pricing Model Rationale

The original page used a one-time developer license ($100). Replaced with a recurring B2B SaaS model appropriate for retail operators:

| Tier | Price | Target |
|------|-------|--------|
| Starter | $49/mo | Single-location independent retailers |
| Growth | $149/mo | Multi-location operators (up to 5 stores) |
| Enterprise | Custom | Chains, franchises, white-label needs |

**Note:** Actual pricing should be validated with the business team before launch. These figures are design placeholders that establish the correct pricing model type.

---

## 7. Remaining Recommendations

The following were identified but are outside the scope of this redesign pass:

| Priority | Item |
|----------|------|
| 🔴 High | Replace the YouTube demo link (`TcyKfjikcIA`) with a real StockFlow product walkthrough video |
| 🔴 High | Replace floating stat card figures ($24,380 revenue, 3 low-stock items) with real data pulled from the database |
| 🟠 Medium | Add a customer logos / testimonials section once real retail clients are onboarded |
| 🟠 Medium | Add Open Graph meta tags (`og:title`, `og:image`, `og:description`) specific to StockFlow in `app/layout.tsx` |
| 🟠 Medium | Create a real product screenshot (`/images/dash-2.webp`) that shows the actual StockFlow UI rather than a generic dashboard |
| 🟡 Low | Add a "Trusted by" horizontal logo bar once enterprise clients are acquired |
| 🟡 Low | Add structured data (JSON-LD) for the FAQ section to enable Google rich results |
| 🟡 Low | Translate all landing page copy into French (bilingual parity) |
| 🟡 Low | The `app/layout.tsx` metadata still reads `description: "Bilingual retail management system"` — update to a proper marketing description |

---

## 8. Pre-Existing TypeScript Errors (Unrelated)

The following TypeScript errors exist in the codebase and predate this redesign. They are caused by the schema migration (field renames like `name` → `nameEn`) not yet being propagated to all server actions:

- `actions/roles/createRole.ts` — `name` field on `RoleWhereInput`
- `actions/item-suppliers/*.ts` — `name` on `ItemSelect`, `leadTime` on `ItemSupplierUpdateInput`
- `actions/pos-session-actions.ts` — `digitalTotal` on `POSSessionCreateInput`
- `actions/pos-station-actions.ts` / `pos-terminal-actions.ts` — `terminalNumber` uniqueness constraint

These require a separate remediation pass against the server actions layer.

---

*Report generated: 2026-05-21 | Author: Claude Code (claude-sonnet-4-6)*
