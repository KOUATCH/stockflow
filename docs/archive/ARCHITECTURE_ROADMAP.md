# StockFlow Architecture Roadmap

**Date:** 2026-05-06  
**Status:** Active — items will be checked off as completed  
**Context:** This follows the services layer refactor (see `REFACTOR_REPORT.md`). The system now has `services/` → `actions/` → `hooks/` → UI. These are the next-priority improvements.

---

## Priority Order at a Glance

| # | Item | Effort | Impact | Status |
|---|---|---|---|---|
| 1 | Zod validation at every action boundary | Medium | Prevents corrupt data entering the DB | ✅ Done — schemas in `services/*/` schemas files, wired into all core actions |
| 2 | Standardize auth to one pattern | Low | Closes silent auth-bypass risk | ✅ Done — all actions now use `getAuthenticatedUser()` |
| 3 | Validated environment config (`lib/env.ts`) | Low | Catches missing vars at build time | ✅ Done — `lib/env.ts` with Zod, throws at boot if invalid |
| 4 | Error boundaries per route group | Low | Stops full-page crashes | ✅ Done — `error.tsx` + `loading.tsx` for inventory, sales, customers, pos, settings, analytics, purchase-orders |
| 5 | Delete 40+ duplicate action files | Medium | Eliminates silent maintenance liabilities | ✅ Done — 15 dead files deleted, active importers redirected |
| 6 | API route auth + standardized response shape | Medium | Closes currently-unprotected endpoints | ✅ Done — `lib/api/response.ts` + `guard.ts`, all routes now auth-guarded |
| 7 | POS / CashSystem service extraction | High | Largest remaining monolith | ✅ Done — `services/pos/pos-order.service.ts`, `services/pos/pos-session.service.ts`, `services/cash-drawer/cash-drawer.service.ts`; all three action files thinned |
| 8 | Structured logging (`lib/logger.ts`) | Low | Enables production debugging | ✅ Done — `lib/logger.ts` with JSON output + log-level filtering |
| 9 | Vitest test suite for the services layer | Medium | Regression safety net | ✅ Done — 57 tests across 5 files, all passing |

---

## 1 — Zod Validation at Every Action Boundary

### Problem
95% of server actions accept raw, unvalidated input. A caller can pass any shape of data and it reaches the database. The audit found no `z.parse` or `z.safeParse` in:

- `actions/brands/createBrands.ts`
- `actions/locations/createLocation.ts`
- `actions/units/createActionUnit.ts`
- `actions/inventory/adjust-stock.ts`
- `actions/users/createUser.ts`
- and ~95 more

Only 5 files use Zod today: `customerActionsFinal.ts`, `sales-actions.ts`, `newSalesOrder.ts`, `createSalesOrder.ts`, `item-lookups.ts`.

### Why this matters
- Silent data corruption: a `sellingPrice` of `"abc"` becomes `NaN` in the DB
- No client-facing field-level errors (just generic "something went wrong")
- Impossible to trust service layer inputs without upstream validation

### Solution

**Step 1** — One schema file per service domain:

```
services/brand/brand.schemas.ts
services/category/category.schemas.ts
services/item/item.schemas.ts
services/location/location.schemas.ts
services/unit/unit.schemas.ts
services/tax-rate/tax-rate.schemas.ts
```

**Step 2** — Schema content (brand as template):

```ts
// services/brand/brand.schemas.ts
import { z } from "zod"

export const BrandCreateSchema = z.object({
  brandName: z.string().min(2, "Name must be at least 2 characters").max(100).trim(),
})

export const BrandUpdateSchema = z.object({
  brandName: z.string().min(2).max(100).trim().optional(),
  slug: z.string().optional(),
})

export type BrandCreateInput = z.infer<typeof BrandCreateSchema>
export type BrandUpdateInput = z.infer<typeof BrandUpdateSchema>
```

**Step 3** — Action uses `safeParse`, returns field errors on failure:

```ts
// actions/brands/createBrands.ts
const parsed = BrandCreateSchema.safeParse(data)
if (!parsed.success) return err(parsed.error.flatten().fieldErrors)
const brand = await BrandService.createBrand(user.organizationId, parsed.data)
```

**Step 4** — Service input types come from `z.infer<>`, not hand-written interfaces. Types stay in sync with validation automatically.

### Files to create
- `services/brand/brand.schemas.ts`
- `services/category/category.schemas.ts`
- `services/item/item.schemas.ts`
- `services/location/location.schemas.ts`
- `services/unit/unit.schemas.ts`
- `services/tax-rate/tax-rate.schemas.ts`
- `services/supplier/supplier.schemas.ts`
- `services/purchase-order/purchase-order.schemas.ts`

### Files to update
Every thin action adapter that currently accepts raw typed input.

---

## 2 — Standardize Auth to One Pattern

### Problem
Two auth patterns are in use simultaneously:

**Pattern A — `getAuthenticatedUser()` (correct)**
```ts
// config/useAuth.ts — redirects on failure, no null check needed
const user = await getAuthenticatedUser()
```
Used in: `createBrands.ts`, `createCategory.ts`, `createLocation.ts`, +12 more

**Pattern B — `getServerSession()` direct (risky)**
```ts
const session = await getServerSession(authOptions)
if (!session?.user?.organizationId) return err("...")
```
Used in: `createActionBrand.ts`, `createActionItem.ts`, `adjust-stock.ts`, `createActionUnit.ts`, `createActionTaxRate.ts`, `create-item-with-inventory.ts`

Pattern B requires a manual null check every time. If a developer forgets it, the action proceeds unauthenticated. Pattern B also requires importing `authOptions` at every call site.

### Solution

Convert all 6 Pattern B files to Pattern A. `getAuthenticatedUser()` already exists and handles both cases (redirect if no session, return user if valid). No new code needed — only replacing the import and removing the manual check.

### Files to update
- `actions/brands/createActionBrand.ts` — already converted during services refactor ✓
- `actions/itemsShow/createActionItem.ts`
- `actions/inventory/adjust-stock.ts`
- `actions/units/createActionUnit.ts`
- `actions/taxRate/createActionTaxRate.ts`
- `actions/itemsShow/create-item-with-inventory.ts`

---

## 3 — Validated Environment Config

### Problem
25+ files access `process.env.*` directly with no validation:

```ts
// actions/users/createUser.ts:12
const resend = new Resend(process.env.RESEND_API_KEY)

// actions/users/sendInvite.ts:10
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
```

If `RESEND_API_KEY` is missing, the Resend client is constructed with `undefined` — this fails silently at construction and throws deep inside an email transaction, not at startup where it is easy to diagnose.

No validation of:
- Required variables at startup
- Variable format/type (`DATABASE_URL` must be a valid URL)
- Env-specific constraints (`NEXTAUTH_SECRET` must be ≥32 chars)

### Solution

```ts
// lib/env.ts
import { z } from "zod"

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid URL"),

  // Auth
  NEXTAUTH_SECRET: z.string().min(32, "NEXTAUTH_SECRET must be at least 32 characters"),
  NEXTAUTH_URL: z.string().url(),

  // Email
  RESEND_API_KEY: z.string().startsWith("re_", "Invalid Resend API key format"),

  // App
  NEXT_PUBLIC_BASE_URL: z.string().url(),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
})

export const env = envSchema.parse(process.env)
// Throws at import time if any required var is missing or malformed.
// Build fails; production never starts with a broken config.
```

Every file replaces `process.env.RESEND_API_KEY` with `import { env } from "@/lib/env"` → `env.RESEND_API_KEY`. TypeScript now knows the type is `string`, not `string | undefined`.

### Files to update
- `actions/users/createUser.ts`
- `actions/users/sendInvite.ts`
- `actions/users/sendResetLink.ts`
- `actions/users/updateUserPassword.ts`
- `actions/users/getCurrentUserCount.ts`
- `components/email-templates/verify-email.tsx`
- Any other `process.env.*` access site

---

## 4 — Error Boundaries Per Route Group

### Problem
Zero `error.tsx` files exist anywhere in `app/`. One unhandled server component exception takes down the entire page. The user sees a blank screen or Next.js generic error page with no recovery path and no context.

Also only 5 `loading.tsx` files exist, so most routes show no loading state during server-side data fetching.

### Missing error boundaries (all major routes)
- `app/(dashboard)/dashboard/inventory/`
- `app/(dashboard)/dashboard/sales/`
- `app/(dashboard)/dashboard/pos/`
- `app/(dashboard)/dashboard/customers/`
- `app/(dashboard)/dashboard/reports/`
- `app/(dashboard)/dashboard/settings/`
- `app/(dashboard)/dashboard/purchase-orders/`

### Solution

One `error.tsx` per route group. Next.js App Router automatically catches any thrown error within that segment and renders the boundary instead, keeping the rest of the shell alive.

```tsx
// app/(dashboard)/dashboard/inventory/error.tsx
"use client"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function InventoryError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => { console.error(error) }, [error])

  return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <p className="text-muted-foreground">Something went wrong loading inventory.</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  )
}
```

Also add `loading.tsx` to every route that lacks one — a skeleton or spinner shown while server components fetch data.

---

## 5 — Delete 40+ Duplicate Action Files

### Problem
The codebase evolved without a delete step. Multiple implementations exist for the same operations. A bug fixed in one file is not fixed in the others.

### Confirmed duplicates

**Brand**
| Keep | Delete |
|---|---|
| `actions/brands/createBrands.ts` | `actions/brands/createActionBrand.ts` (same logic, different auth pattern) |
| `actions/brands/updateBrandById.ts` | `actions/brands/newBrandUpdateById.ts` (generic wrapper, unused) |

**Items** — two entire folders doing the same thing
| Keep | Delete |
|---|---|
| `actions/itemsShow/*.ts` | `actions/item/*.ts` (7 files: `createItemAction.ts`, `updateItemBasicInfo.ts`, `updateItemDetailsAction.ts`, `updateItemPricingAction.ts`, `updateItemRelationsAction.ts`, `updateItemStockAction.ts`, `items.ts`) |
| `actions/itemsShow/getOrgItemsWithInventoryLevels.ts` | `actions/itemsShow/getOrgItems.ts`, `actions/itemsShow/getOrgItemsDTO.ts` |

**Customers** — three competing implementations
| Keep | Delete |
|---|---|
| `actions/customers/customerActionsFinal.ts` | `actions/customers/customerActions.ts`, `actions/customers/customerAction2.ts` |

**POS** — three competing implementations (~2,400 LOC)
| Keep | Delete |
|---|---|
| `actions/pos/POSActionFinal.ts` (to be extracted to service) | `actions/pos/newPOSActions.ts`, `actions/pos/posActions.ts` |

**Inventory** — proliferation of similar files
| Keep | Delete |
|---|---|
| `actions/inventory/inventoryActions.ts` | `actions/inventory/inventoryActionss.ts` (typo), `actions/inventory/AllInventoryActionsOriginal.ts`, `actions/inventory/rawInventoryActions.ts` |
| `actions/inventory/inventoryMovementActions.ts` | `actions/recentInventory/inventoryMovementActions.ts` (identical file in wrong location) |

**Cash drawer**
| Keep | Delete |
|---|---|
| `actions/cashSystem/cash-drawer/cash-drawer-actions.ts` | `actions/newPOSSession/cash-drawer/cash-drawer-actions.ts` |

### Process
For each pair: grep all `import` statements across the codebase to find which file is actually referenced, keep that one, update any imports pointing to the deleted file, then delete.

---

## 6 — API Route Auth + Standardized Response Shape

### Problem
8 API routes exist under `app/api/` with three different response shapes and **no authentication on any of them**. Any unauthenticated request can read organizational data.

**Response shape inconsistency examples:**
```ts
// app/api/v1/items/route.ts
{ data: items, total: 50, page: 1, limit: 50, totalPages: 5 }

// app/api/v1/organisations/route.ts
// Returns array directly — no wrapper object

// app/(dashboard)/dashboard/app/api/health/route.ts
{ status: "healthy", timestamp: "...", database: {...} }
```

**Auth gap:** None of the 8 routes call `getServerSession` or validate a token before returning data.

**Broken route:** `app/api/v1/organisations/route.ts` error handler returns a plain object instead of a `Response` — the caller receives `[object Object]`.

### Solution

**Shared API utilities:**

```ts
// lib/api/response.ts
export function apiOk<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status })
}
export function apiErr(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status })
}
```

```ts
// lib/api/guard.ts
export async function requireApiSession() {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")
  return session.user
}
```

Every route becomes a consistent 5-line pattern:
```ts
export async function GET(req: Request) {
  try {
    const user = await requireApiSession()
    const data = await SomeService.list(user.organizationId)
    return apiOk(data)
  } catch (e) {
    return apiErr(e instanceof Error ? e.message : "Internal error", 500)
  }
}
```

### Files to update
- `app/api/v1/items/route.ts`
- `app/api/v1/organisations/route.ts`
- `app/api/v1/organisations/[id]/briefItems/route.ts`
- `app/api/v1/organisations/[id]/items/route.ts`
- `app/(dashboard)/dashboard/app/api/inventory/transactions/route.ts`
- `app/(dashboard)/dashboard/app/api/items/route.ts`

---

## 7 — POS / CashSystem Service Extraction

### Problem
The largest remaining monolith. Three competing POS implementations total ~2,400 LOC in server action files with no services layer extraction:

| File | Lines | Concern |
|---|---|---|
| `actions/pos/POSActionFinal.ts` | ~684 | Order lifecycle, payment |
| `actions/pos/newPOSActions.ts` | ~869 | Duplicate |
| `actions/pos/posActions.ts` | ~844 | Duplicate |
| `actions/cashSystem/sales/createSalesOrder.ts` | ~842 | Inventory allocation, payment, receipts |
| `actions/cashSystem/cash-drawer/cash-drawer-actions.ts` | ~744 | Session, cash flow, reconciliation |

Each file embeds 10–25 inline interfaces, all business logic, and all Next.js framework calls in the same function.

### Target service structure

```
services/pos/
  pos-order.service.ts          — order creation, line items, totals
  pos-session.service.ts        — open/close session, active session lookup
services/cash-drawer/
  cash-drawer.service.ts        — open drawer, record movement, reconcile
services/sales/
  sales-order.service.ts        — sales order lifecycle
  inventory-allocation.service.ts — stock reservation and deduction
```

Same pattern as brands/categories: services throw, actions catch and wrap, no db access in actions.

### Execution order
1. Extract `pos-session.service.ts` first (simplest, least entangled)
2. Extract `cash-drawer.service.ts`
3. Extract `sales-order.service.ts` + `inventory-allocation.service.ts`
4. Extract `pos-order.service.ts`
5. Consolidate the three POS action files into one set of thin adapters
6. Delete the two duplicate POS action files

---

## 8 — Structured Logging

### Problem
557 `console.log` / `console.error` calls across action files. No timestamps, no request IDs, no user context. A production error log shows:

```
Error creating Brand: [object Error]
```

With no indication of which org, which user, which request, or when.

### Solution

```ts
// lib/logger.ts
type LogContext = Record<string, unknown>

function formatEntry(level: string, msg: string, ctx?: LogContext) {
  return JSON.stringify({ level, msg, ts: new Date().toISOString(), ...ctx })
}

export const logger = {
  info:  (msg: string, ctx?: LogContext) => console.log(formatEntry("info", msg, ctx)),
  warn:  (msg: string, ctx?: LogContext) => console.warn(formatEntry("warn", msg, ctx)),
  error: (msg: string, ctx?: LogContext) => console.error(formatEntry("error", msg, ctx)),
}
```

Usage in services (where context is available):
```ts
// services/brand/brand.service.ts
import { logger } from "@/lib/logger"

export async function createBrand(orgId: string, input: BrandCreateInput) {
  logger.info("brand.create", { orgId, brandName: input.brandName })
  // ...
}
```

The JSON format is machine-parseable by Vercel Log Drain, Datadog, or any log aggregator. Later, swap `console.log` for Pino without touching any call site — the logger is the only thing that changes.

---

## 9 — Vitest Test Suite for the Services Layer

### Problem
Zero test files exist. 0% code coverage. The services layer introduced in the refactor is pure TypeScript with no Next.js dependencies — it is the easiest part of the codebase to test and the most important (it contains all business rules).

### Why the services layer specifically
- No `"use server"` directive → no Next.js test harness needed
- No HTTP, no React → pure function calls with mocked Prisma
- Contains all critical business rules: uniqueness checks, cascade guards, slug generation, inventory allocation

### Setup

```ts
// vitest.config.ts
import { defineConfig } from "vitest/config"
import path from "path"

export default defineConfig({
  test: { environment: "node" },
  resolve: {
    alias: { "@": path.resolve(__dirname, ".") },
  },
})
```

### Example test (brand service)

```ts
// services/brand/brand.service.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("@/prisma/db", () => ({
  db: {
    brand: {
      findFirst: vi.fn(),
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}))

import { db } from "@/prisma/db"
import { createBrand, deleteBrand } from "./brand.service"

describe("createBrand", () => {
  beforeEach(() => vi.clearAllMocks())

  it("throws when brand name already exists", async () => {
    vi.mocked(db.brand.findFirst).mockResolvedValue({ id: "1", brandName: "Nike" } as never)
    await expect(createBrand("org-1", { brandName: "Nike" })).rejects.toThrow("already exists")
  })

  it("creates brand when name is unique", async () => {
    vi.mocked(db.brand.findFirst).mockResolvedValue(null)
    vi.mocked(db.brand.create).mockResolvedValue({ id: "2", brandName: "Adidas" } as never)
    const result = await createBrand("org-1", { brandName: "Adidas" })
    expect(result.brandName).toBe("Adidas")
  })
})

describe("deleteBrand", () => {
  it("throws when brand does not exist", async () => {
    vi.mocked(db.brand.findUnique).mockResolvedValue(null)
    await expect(deleteBrand("non-existent")).rejects.toThrow("Brand not found")
  })
})
```

### Priority test targets
1. `services/brand/brand.service.ts` — uniqueness, not-found guard
2. `services/category/category.service.ts` — slug generation, uniqueness
3. `services/item/item.service.ts` — SKU uniqueness, cascade guard (salesCount), inventory seeding
4. `services/pos/pos-order.service.ts` — order totals, inventory deduction (when created)
5. `services/_shared/pagination.ts` — `buildPagination`, `buildPaginatedResult` edge cases

---

## Implementation Notes

- Items 1–4 can run in parallel — they are fully independent
- Item 5 (duplicates) requires tracing imports before deleting; do not delete without grep-confirming no other file imports the target
- Item 7 (POS) is the most complex; extract one service at a time, test before moving to the next
- Schemas from Item 1 should be created before Item 7 so the POS services start validated from day one
- Item 9 (tests) should be written alongside Item 7, not after — test each service immediately after extracting it

---

*Report generated: 2026-05-06. Update the Status column as items are completed.*
