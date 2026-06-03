# StockFlow — Infrastructure Hardening Report

**Date:** 2026-05-16
**Scope:** Picks up where [`MODERNIZATION_REPORT.md`](./MODERNIZATION_REPORT.md) left off. Covers the second round of work: major dead-code purges, type-system tightening, performance refactors, observability infrastructure (logger / Sentry / health / audit / queue), email pipeline migration, and schema-drift cleanup.
**Related docs:** [`SYSTEM_EVALUATION.md`](./SYSTEM_EVALUATION.md) (original audit) → [`MODERNIZATION_REPORT.md`](./MODERNIZATION_REPORT.md) (multi-tenant + services migration) → **this file**.

---

## 1. Headline numbers

| Metric | Start of this round | End | Δ |
|---|---|---|---|
| Action files | 150 | **126** | **−24** |
| Component files | ~320 | **220 client + ~100 server** | RSC sweep + duplicate purge |
| Client components (`"use client"`) | 340 | **222** | **−35%** |
| Total `any` occurrences | 385 → 343 (post-purge) | **290** | **−25%** from baseline |
| Files containing `any` | ~140 | **108** | **−23%** |
| `any` in `services/` | 9 | **0** | enforced via ESLint |
| Server-side `console.*` calls | 214 | **0** | swept to pino logger |
| Client-side `console.error/warn` | 73 | **0** | swept to pino + Sentry |
| Mutation actions wired with audit events | 0 (broken auth-only) | **27 entity mutations + 7 PO/POS financial events** | **34 audit points** |
| Service tests | 35 | **93** | **+58 tests** (all cross-tenant guards) |
| Live Resend callsites blocking request thread | 3 | **0** | migrated to Inngest |
| Broken imports post-purge | n/a | **0** | verified clean |

---

## 2. Major dead-code purges

### 2.1 Blog feature — fully obliterated
The audit identified `actions/blogs.ts` as returning raw arrays/nulls. First modernised to `ok()/err()`, then on user request **removed entirely** because no `Blog`/`BlogCategory` Prisma model existed (permanent stub).

Removed: `app/(dashboard)/dashboard/blogs/`, `components/dashboard/blogs/`, `actions/blogs.ts`, the ModernNavigation "Content Studio" card, the `config/sidebar.ts` Blogs entry, the `config/permissions.ts` blogs permission block, and the legacy `blogs.*` entries.

### 2.2 POS chain — full purge

| Removed | What it was |
|---|---|
| `app/(dashboard)/dashboard/newPosSession/` (with `pageaa22.tsx`) | Dead duplicate POS route |
| `app/(dashboard)/dashboard/session-pos-sync/` | Dead POS-sync route |
| `app/(dashboard)/dashboard/cashSystem/` | Dead duplicate cash route |
| `app/(dashboard)/dashboard/posStation/` | Unlinked POS-station route |
| `components/cashSystem/` (incl. 4 POS terminal duplicates) | Dead UI |
| `components/newPOSSession/` | Dead UI |
| `components/synchro/` (incl. 2 more POS terminal duplicates) | Dead UI |
| `components/posStation/` | Dead UI |
| `components/system/sales/PosTerminal{,Recent,z}.tsx` | 3 more POS terminal duplicates |
| `actions/cashSystem/` | Dead actions (referenced non-existent `db.product`/`db.sales`/`db.mockData`) |
| `actions/newPOSSession/` | Dead actions |
| `actions/posStation/` | Dead actions |
| `actions/pos/` (3 parallel `*POSAction*` files) | Dead duplicates |
| `lib/cashSystem/`, `lib/newPOSSession/` | Dead libs |

The live POS surface is exactly **one** path: `/dashboard/pos` → `components/pos/ProfessionalPOSSystem.tsx`.

### 2.3 Other duplicate purges

**Routes removed:** `/dashboard/purchaseOrderWorkflow/` (contained `pcdszxage.tsx`), `/dashboard/recentInventory/`, `/dashboard/items/new-manager/`.

**Component dirs removed:** `components/purchaseOrderWorkflow/`, `components/purchases/`, `components/settings/`, `components/sales-system/`, `components/system/`, `components/dashboard/newLocation/`, `components/newItemForms/`.

**Loose-file removals:** `actions/newInventory-system.ts`, `actions/sales-analytics.ts`, `actions/sales-system.ts`, `actions/customers-system.ts`, `actions/item/createInput.ts`, `actions/itemsShow/createOldItem.ts`, `actions/categories/getBriefOrgItems.ts`, `actions/customers/customerActionsFinal.ts`, `actions/suppliers/{getSuppliersByOrgId, supplierActions, getSuppliersSummary, linkItemsToSupplier, supplierKeys, unlinkItemFromSupplier}.ts`, `components/sales/{IntegratedDailySalesDashboard, sales-orders, customers-management}.tsx`, `app/(dashboard)/dashboard/inventory/items/oldPageNew.tsx`, `app/(dashboard)/dashboard/inventory/pagezzzx.tsx`, `app/(dashboard)/dashboard/items/secondPageFo.tsx`, `app/(dashboard)/dashboard/settings/locations/öldpage.tsx` (umlaut "öld"), `app/(dashboard)/dashboard/inventory/units/firstpage.tsx`, two `others/BasicInfoTabFinal.tsx` orphans.

**Config fallout fixed:**
- `config/sidebar.ts` — fixed broken `/dashboard/purchaseOrders` entry → `/dashboard/purchase-orders`
- `components/dashboard/ModernNavigation.tsx` — removed Content Studio card + `"blogs.read"` permission string
- `config/permissions.ts` — removed blog permission set and legacy `blogs.*` entries

### 2.4 `actions/inventory/inventoryMovementActions.ts` — deleted
Referenced non-existent `db.inventory` and `db.transfer` models (the schema uses `InventoryLevel` and `StockTransfer`). Would have errored at runtime. Zero importers.

---

## 3. Type-system tightening

### 3.1 `tsconfig.json` strict flags added
- `noImplicitOverride: true` — requires `override` keyword on subclass methods. Caught 2 real cases in `config/error-boundary.tsx`; fixed with proper `override` + correct `ErrorInfo` type import.
- `noFallthroughCasesInSwitch: true` — catches missing `break` statements.
- `forceConsistentCasingInFileNames: true` — Windows / case-insensitive FS safety.

**Deliberately deferred** (dedicated migrations needed): `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`.

### 3.2 `eslint.config.mjs` — `no-explicit-any` enforced in `services/`
Removed the apologetic `// Too many anys to block as errors today` comment. Default `warn` retained for the migration path; **stricter override for `services/**/*.ts(x)`: `"@typescript-eslint/no-explicit-any": "error"`**. `services/` is now zero-`any`, so the rule enforces it going forward.

### 3.3 `any` reduction
- Started: **385 occurrences across ~140 files**
- After dead-code purge: 290 occurrences across 108 files (−25%)
- `services/purchase-order/purchase-order.service.ts` hand-cleaned: **9 → 0** `any` casts (replaced `(line.item as any)?.name` with proper `line.item.nameEn` access, revealing and fixing a hidden schema-access bug)

### 3.4 Logger types widened
The new pino-backed logger's TS signature initially rejected `logger.error("msg", error)` where `error` was an `Error` instance (not a `Record<string, unknown>`). Widened to accept anything; added `normalizeCtx()` helper that promotes `Error` instances into `{ err: { name, message, stack } }` payload for pino — and Sentry forwarding still picks them up via the `arg2 instanceof Error` path.

---

## 4. Performance refactors

### 4.1 N+1 query patterns — fixed in hot paths
The audit originally flagged 7 files with `for (...) { await prisma.* }` patterns. **6 of the 7 were deleted in the dead-code purges** (`salesActions.ts`, `POSActionFinal.ts`, `newPOSActions.ts`, `sales-system.ts`, two `cashSystem/sales/*` variants). The remaining `inventoryMovementActions.ts` was also dead code (non-existent Prisma models) and was deleted.

Active N+1s discovered and fixed:

| File | Before | After |
|---|---|---|
| `services/pos/pos-order.service.ts` (lines, inventory updates) | 3N queries per sale (N×`salesOrderLine.create` + N×`inventoryLevel.findFirst` + N×`update`) | 1× `salesOrderLine.createMany` + 1× `inventoryLevel.findMany` for all items + N×`update` |
| `services/pos/pos-order.service.ts` (cash payments) | Per-cash-payment: 1×`pOSSession.findUnique` + 1× drawer update + 1× transaction create | Session lookup hoisted once; payments bulked via `createMany`; drawer/transaction updated once with net cash |
| `services/inventory/inventory.service.ts` `adjustStock` | 3N queries per batch adjustment | 1× `findMany` + 1× `createManyAndReturn` (Prisma 6 / Postgres) + N×`update` |

**Test impact:** 14/14 POS tests pass after the refactor (mocks updated for `createMany`/`findMany`).

### 4.2 RSC sweep — 19 components converted from client to server
- Started: 241 client components.
- Detected 26 candidates with a strict heuristic that excludes any file importing client-only libs (`recharts`, `framer-motion`, `@radix-ui`, `@uploadthing`, `next-themes`, `sonner`, `react-hook-form`, `@tanstack/react-query`, etc.).
- Filtered out files receiving RHF-style props (`register`, `control`).
- Converted **19** confirmed-safe pure-presentational components (analytics cards, finance KPI dashboards, alerts cards, reports, `FormFooter`, `CustomDataTable`, etc.).
- Ended: **222 client components** (down from 340 over the full session).

---

## 5. Observability infrastructure (the big one)

### 5.1 Logger — `lib/logger.ts` replaced with pino-backed implementation

**What replaced what:** the prior 24-line `console.log` + `JSON.stringify` wrapper was upgraded to a production-grade structured logger.

**Capabilities:**
- Real log levels (`debug`/`info`/`warn`/`error`/`fatal`) — filtered by `LOG_LEVEL` env var
- **Structured JSON output in prod** (Axiom/Datadog/Logtail/CloudWatch ingest unchanged); **pretty-printed colorized in dev**
- **Automatic secret redaction** at every depth (`*.password`, `*.token`, `*.apiKey`, `*.secret`, `*.authorization`, `*.cookie`, headers)
- **Child loggers**: `logger.child({ requestId, orgId, userId }).info(...)` propagates context once instead of repeating it
- **API-compatible** with both legacy `(msg, ctx)` and pino-native `(obj, msg)` shapes
- **`logger.error()` / `logger.fatal()` auto-forward to Sentry** when `SENTRY_DSN` is set — no manual `Sentry.captureException()` at call sites

### 5.2 Sentry — `@sentry/nextjs` v10 wired with conditional activation
- `sentry.server.config.ts`, `sentry.client.config.ts`, `sentry.edge.config.ts` — three runtime configs
- `instrumentation.ts` — Next 15 startup hook, routes errors to `captureRequestError` (renamed from `onRequestError` in v10)
- `next.config.ts` wrapped with `withSentryConfig` **only when `SENTRY_AUTH_TOKEN` is set** so dev/CI builds without credentials still succeed
- Six Sentry env vars documented in `.env.example`

**Smart defaults:** prod trace sample rate 10% server / 5% edge / 100% dev; `replaysOnErrorSampleRate: 0.1`, `replaysSessionSampleRate: 0` (no PII session-replay by default); filters out `NEXT_REDIRECT`/`NEXT_NOT_FOUND`/`ResizeObserver` noise.

### 5.3 Health endpoints — `/api/health` + `/api/ready`
- **`/api/health`** ([app/api/health/route.ts](../app/api/health/route.ts)) — liveness probe. Returns 200 + `{status, uptime, ts}`. No DB hit.
- **`/api/ready`** ([app/api/ready/route.ts](../app/api/ready/route.ts)) — readiness probe. Runs `SELECT 1`; returns 200 with latency or **503** if DB is down.

Both whitelisted in `middleware.ts` so they bypass auth. The audit's "buried health endpoint" at `app/(dashboard)/dashboard/app/api/health/route.ts` was already deleted earlier.

### 5.4 Inngest — background job runner
**Why Inngest** (vs BullMQ): no Redis worker process to operate, integrates as a single Next.js API route, built-in retries/idempotency/observability, free tier covers small SaaS.

**Files:**
- `lib/inngest/client.ts` — typed `Inngest` instance + `StockFlowEvent` discriminated-union catalogue (`purchase-order/received`, `report/daily-sales.requested`, `email/send`)
- `lib/inngest/functions/send-email.ts` — transactional email sender wrapping Resend. Retries 3×, concurrency capped at 20. Accepts pre-rendered `html` (preferred) or template ID.
- `lib/inngest/functions/daily-sales-report.ts` — daily-sales aggregator with `step.run(...)` checkpoints, idempotency key `orgId-locationId-date`, concurrency capped at 5
- `lib/inngest/functions/index.ts` — function registry
- `app/api/inngest/route.ts` — webhook handler (`GET`/`POST`/`PUT` via `serve` from `inngest/next`)
- `actions/analytics/requestDailySalesReport.ts` — example server action that emits the event and returns `{ jobId }` immediately

**Configuration:**
- `middleware.ts` — added `/api/inngest` to public paths (HMAC-verified by SDK, not by session)
- `.env.example` — `INNGEST_EVENT_KEY`, `INNGEST_SIGNING_KEY`, `RESEND_FROM_EMAIL` documented

**Local dev:** `npx inngest-cli@latest dev` alongside `npm run dev`; auto-discovers the route handler.

---

## 6. Audit log — rebuilt and integrated

### 6.1 The hidden bug found and fixed
The pre-existing `lib/security/audit-log.ts` was writing to fields that **do not exist** on the actual `AuditLog` Prisma model (`type`, `severity`, `timestamp`, `details`, `metadata`, `resource`, `ip`, `userAgent`). The actual model has `entityType`, `entityId`, `action`, `changes`, `userId`, `ipAddress`, `userAgent`, `organizationId`, `createdAt`. **Every DB write in that file would throw at runtime**; the try/catch was silently swallowing it. None of the 18 auth/permission/admin-action audit calls were actually persisting.

### 6.2 New helper — `lib/audit/record-event.ts`
```ts
await recordAuditEvent({
  entityType: "Brand",
  entityId: brand.id,
  action: "CREATE" | "UPDATE" | "DELETE" | "VOID" | "APPROVE" | "RESTORE",
  orgId,
  userId,
  before?: {...},   // computed → minimal diff (only changed keys)
  after?: {...},
  // OR explicit:
  changes?: {...},
})
```

Properties:
- **Never throws** — audit failure must never roll back a business write
- Auto-pulls IP/user-agent from `headers()` (gracefully no-ops outside request context, e.g. background jobs)
- **Minimal diff** — for UPDATEs, only keys whose values actually changed go into `AuditLog.changes` (keeps rows small for wide entities)
- PII redaction is a caller responsibility (strip passwords/tokens before passing)

### 6.3 `lib/security/audit-log.ts` rewritten
Preserved the public API (`logSecurityEvent`, `SecurityEventType`, `SecurityEventSeverity`, `getSecurityEvents`) so the 18 call-sites in `lib/auth.ts`, `middleware.ts`, `lib/security/user-invitation.ts` don't have to change. Internally maps the conceptual event onto the real schema:
- `entityType: "User"`, `entityId: userId ?? "unknown"`
- `action: SecurityEventType` (e.g. `"LOGIN_FAILED"`)
- `changes: { severity, details, metadata, resource }`

Routes every event through the pino logger (so it lands in the structured log stream + Sentry regardless of whether the DB write succeeds). Persists to `AuditLog` only when `organizationId` is known (pre-auth events land in logs only).

Brute-force checker rewritten to query the real `action` field instead of the non-existent `type`. `getSecurityEvents` rewritten to filter on real fields.

### 6.4 27 mutation actions wired
| Entity | Files wired | Actions |
|---|---|---|
| Brand | createBrands, createActionBrand, updateBrandById, deleteBrand | CREATE / UPDATE / DELETE |
| Category | createCategory, updateCategoryById, deleteCategory | CREATE / UPDATE / DELETE |
| Customer | createCustomer, updateCustomerById, deleteCustomer | CREATE / UPDATE / DELETE |
| Supplier | createSupplier, updateSupplier, deleteSupplier | CREATE / UPDATE / DELETE |
| Item | createActionItem, create-item-with-inventory, deleteItem, 5× update*Item* files | CREATE / UPDATE × 5 variants / DELETE |
| Location | createLocation, updateLocationById, deleteLocation | CREATE / UPDATE / DELETE |
| Unit | createActionUnit, updateUnitById, deleteUnit | CREATE / UPDATE / DELETE |
| TaxRate | createTaxRate, createActionTaxRate, deleteTaxRate | CREATE × 2 / DELETE |
| Role | createRole, updateRole, deleteRole | CREATE / UPDATE / DELETE |
| User | deleteUser | DELETE (PII-redacted payload) |
| ItemSupplier | updateItemSupplier | UPDATE |
| User-role assignment | updateUserRole | UPDATE with roleChange diff |

### 6.5 Financial mutations — POS sale + 6 PO transitions
**POS** (`services/pos/pos-order.service.ts` `createSale`): emits audit AFTER the transaction commits. Captures: `orderNumber`, customer/location/terminal/session IDs, subtotal/tax/discount/total, line count, payment methods, change amount.

**PO** (`actions/inventory/canActions.ts`): 6 mutations wired
| Function | Audit action |
|---|---|
| `createPurchaseOrder` | CREATE |
| `submitPurchaseOrder` | UPDATE (event: SUBMIT) |
| `approvePurchaseOrder` | APPROVE |
| `cancelPurchaseOrder` | VOID (with reason) |
| `deletePurchaseOrder` | DELETE |
| `receiveItems` | UPDATE (event: GOODS_RECEIVED, with receipt number + per-line received quantities) |

All audits run **after** cache invalidation, so a failed audit can't roll back business state.

### 6.6 Bulk wrappers — intentionally not wired
`createBulkBrands`, `createBulkCategories`, etc. delegate to single-item creators that already record audit events. Adding bulk-level audit would duplicate.

### 6.7 Dead-flagged paths — intentionally skipped
`actions/savings/*`, `actions/organisation/*`, `actions/products/*` reference non-existent Prisma models (no `Saving`, no `Product` — file naming is misleading). Wiring audit into broken code wasn't worth the noise.

---

## 7. Email pipeline — Resend → Inngest

### 7.1 Event schema upgrade
`email/send` event now accepts:
- `html?: string` — **pre-rendered HTML** (preferred path; producers call `@react-email/components`'s `render()` on their template tree)
- `template?` + `payload?` — fallback for non-React templates

### 7.2 3 live callsites migrated
- `actions/users/sendInvite.ts` — `UserInvitation` template → Inngest event
- `actions/users/sendResetLink.ts` — `ResetPasswordEmail` template → Inngest event
- `actions/users/createUser.ts` — `VerifyEmail` template → Inngest event

Each now returns `{ jobId: inngestResult.ids[0] }` immediately instead of holding the request open. Failure modes: Inngest's built-in retries (3×, concurrency 20).

### 7.3 Dead Resend imports cleaned up
`actions/users/getOrgInvites.ts` and `actions/users/updateUserPassword.ts` had `import { Resend } from "resend"` + `new Resend(...)` constants that were never used. Removed.

**The only `new Resend(...)` instantiation in the codebase is now `lib/inngest/functions/send-email.ts`** (where it belongs).

---

## 8. `console.*` → `logger.*` sweep

### 8.1 Server-side (82 files)
Mass mechanical rewrite via `sed` across `actions/`, `lib/security/`, `lib/audit/`, `lib/analytics/`, `lib/inngest/`, `app/api/`. Mapping:
- `console.log` → `logger.info`
- `console.error` → `logger.error` (auto-forwarded to Sentry)
- `console.warn` → `logger.warn`
- `console.info` → `logger.info`
- `console.debug` → `logger.debug`

`import { logger } from "@/lib/logger"` automatically inserted into each touched file. Server-side `console.*` in those dirs went from **214 → 0**.

### 8.2 Middleware — edge-safe structured JSON
Middleware runs on the edge runtime where pino's thread transports aren't available. The one `console.error` in the rate-limit error path now emits a structured JSON line directly (level/time/service/runtime/msg/error fields) — same format pino emits in prod, parseable by any log shipper.

### 8.3 Client-side (39 files)
Converted `console.error` and `console.warn` → `logger.error` / `logger.warn` across 39 client components. `console.log` (debug noise) deliberately left for a separate hygiene pass.

Why error/warn but not log:
- `logger.error` auto-forwards to Sentry. Every `console.error("...", error)` in a client `catch` block is now Sentry-captured.
- `console.log` calls are typically intentional dev aids; killing them en masse risks losing breadcrumbs.

`@/lib/logger` works in browsers via pino's built-in browser bundle (pino auto-routes to a tiny console wrapper when bundled for browsers). The `pino-pretty` transport is referenced as a string literal so it tree-shakes cleanly out of client bundles.

---

## 9. Security fixes

### 9.1 `next.config.ts` env-block client leak — fixed
Removed `env: { NEXTAUTH_SECRET, NEXTAUTH_URL }` block. Anything in that block gets inlined into the **client bundle** at build time. `NEXTAUTH_SECRET` is the JWT signing key — never should have been exposed. NextAuth reads both from `process.env` server-side automatically.

### 9.2 Multi-tenant isolation (carryover from MODERNIZATION_REPORT.md)
Earlier in the session: 77 → 6 unscoped action files. The remaining 6 are intentional skips (pre-auth password-recovery flows, the `getOrgLocations` re-export, and a stub).

---

## 10. Schema drift — partial fix

### 10.1 Fixed in this round
- `services/purchase-order/purchase-order.service.ts` — `standardInclude` no longer selects nonexistent `Item.name`/`description`; now selects `nameEn`/`nameFr`/`descriptionEn`/`descriptionFr`.
- `actions/inventory/canActions.ts` — same `standardInclude` fix + the nested `item.select` block inside `receiveItems`.

### 10.2 Honest scope call — deferred
The schema drift is much wider than just Item.nameEn:
- **`User` has `firstName`/`lastName`, no `name`** — affects code in ~30 files (analytics, reports, dashboard tables that show "Created by", audit displays)
- `Role.nameEn` (not `name`)
- `TaxRate.nameEn` (not `taxRateName`)
- `Category.titleEn` (not `title`)
- `Item.nameEn` callsites **outside** the PO chain

Fixing properly is either:
- A field-rename across ~30 files (`user?.name` → `[firstName, lastName].filter(Boolean).join(" ")`)
- A Prisma extension adding `name` as a computed property

Either is a focused PR of its own. Half-fixing would ship visual regressions. **Deferred to a dedicated "i18n field migration" pass.**

---

## 11. Verification across the round

- **Tests: 93/93 service tests passing** (was 35 — +58 new tests, mostly cross-tenant guards on customer/supplier services)
- **Type errors: zero new regressions** in any file touched this round. The ~1,300 remaining `tsc --noEmit` errors are all pre-existing schema drift (User/Role/TaxRate/Category/Item bilingual fields) in code I deliberately did not change.
- **ESLint on `services/`: 0 errors, 3 unused-var warnings** (the `no-explicit-any: error` rule enforces the zero-`any` state going forward)
- **Broken imports post-purge: 0** — verified by `grep -rE "from.*@/<deleted-path>"` after every deletion batch

---

## 12. Architectural patterns established

These are the patterns to copy when adding new entities:

### 12.1 Directory layout
```
services/<entity>/
  ├─ <entity>.schemas.ts       ← Zod schemas + inferred types
  ├─ <entity>.service.ts       ← pure DB layer, orgId-first signatures
  └─ <entity>.service.test.ts  ← cross-tenant guard tests required

actions/<entity>/
  ├─ create<Entity>.ts         ← requireOrg + Zod + service call + recordAuditEvent
  ├─ update<Entity>ById.ts
  ├─ delete<Entity>.ts
  ├─ get<Entity>ById.ts
  └─ getOrg<Entities>.ts       ← paginated list (no audit needed for reads)
```

### 12.2 The action skeleton (now with audit)
```ts
"use server"

import { recordAuditEvent } from "@/lib/audit/record-event"
import { err, ok } from "@/services/_shared/action-response"
import { requireOrg } from "@/services/_shared/require-org"
import { EntityCreateSchema } from "@/services/entity/entity.schemas"
import * as EntityService from "@/services/entity/entity.service"
import { revalidatePath } from "next/cache"

export async function createEntity(data: unknown) {
  try {
    const { orgId, userId } = await requireOrg()
    const parsed = EntityCreateSchema.safeParse(data)
    if (!parsed.success) return err(parsed.error.flatten().fieldErrors)
    const result = await EntityService.createEntity(orgId, parsed.data)
    await recordAuditEvent({
      entityType: "Entity",
      entityId: result.id,
      action: "CREATE",
      orgId,
      userId,
      after: result as unknown as Record<string, unknown>,
    })
    revalidatePath("/dashboard/entities")
    return ok(result)
  } catch (e) {
    return err(e)
  }
}
```

### 12.3 The service skeleton
```ts
export async function getEntityById(orgId: string, id: string): Promise<EntityDTO> {
  const entity = await db.entity.findFirst({
    where: { id, organizationId: orgId, deletedAt: null },
  })
  if (!entity) throw new Error("Entity not found")
  return entity as EntityDTO
}
```

Always `findFirst({where: {id, organizationId: orgId}})` — never `findUnique({where: {id}})`. Generic "Not found" on cross-tenant access (no existence leak).

### 12.4 Background jobs — the Inngest skeleton
```ts
// 1. Declare the event in lib/inngest/client.ts
export type StockFlowEvent = ... | {
  name: "my-thing/happened"
  data: { orgId: string; ... }
}

// 2. Write the function in lib/inngest/functions/my-thing.ts
export const myThing = inngest.createFunction(
  { id: "my-thing", retries: 2, triggers: [{ event: "my-thing/happened" }] },
  async ({ event, step }) => {
    const data = await step.run("fetch", () => db.something.findMany(...))
    return await step.run("process", () => doExpensiveWork(data))
  }
)

// 3. Register in lib/inngest/functions/index.ts

// 4. Emit from a server action
await inngest.send({ name: "my-thing/happened", data: { orgId } })
return ok({ jobId: result.ids[0] }) // returns immediately
```

### 12.5 Sending email
```ts
import { render } from "@react-email/components"
import { inngest } from "@/lib/inngest/client"
import MyTemplate from "@/components/email-templates/my-template"

const html = await render(MyTemplate({ ...props }))
await inngest.send({
  name: "email/send",
  data: { to, subject, html },
})
// returns immediately; Resend retry/observability is handled by the Inngest function
```

---

## 13. What's genuinely still on the table

1. **Bilingual schema drift migration** — `User.firstName/lastName`, `Role.nameEn`, `TaxRate.nameEn`, `Category.titleEn`, `Item.nameEn` (in callsites outside the PO chain). ~30 files across analytics/dashboards/forms. Recommend a single focused PR.

2. **`Decimal` arithmetic** in PO/sales math — Prisma 6's `Decimal` rejects direct `+`/`*`/`-`. Needs `decimal.js` ops or `Number()` coercion at boundaries.

3. **Client-side `console.log` cleanup** — debug noise across 86 components. Either delete or migrate to `logger.debug`.

4. **`createInvitedUser.ts`** doesn't currently send an email (Resend was commented out). Either wire to the new Inngest `email/send` flow or remove the dead import block.

5. **POS line-item / payment audit events** — `createSale` currently emits one audit row per sale. For ledger-grade audit you'd want a child event per line + per payment.

6. **Credential rotation** — the original audit's CRITICAL item. The `.env` on disk still has live `AUTH_SECRET`, `UPLOADTHING_TOKEN` (sk_live), `RESEND_API_KEY`, personal Gmail SMTP password. The env-block client leak is now plugged, but rotation needs to happen externally.

7. **Migrate other long-running flows to Inngest** — the infrastructure is in place; flows like daily-report generation, bulk imports, expensive analytics rebuilds should follow the pattern.

8. **Sentry sourcemaps in CI** — `withSentryConfig` only wraps the build when `SENTRY_AUTH_TOKEN` is set. The CI/CD pipeline needs the token added for sourcemap upload + release tagging.

---

## 14. Risk and reversibility

Everything in this report is in the git working tree. Reversible via `git checkout <file>` or `git restore`. The `lib/audit/`, `lib/inngest/`, Sentry configs, instrumentation hook, health/ready routes, and the new pino logger are pure additions. The deletions are documented in §2; the inverse list is straightforward to reconstruct from git history.

Three notable hidden-bug findings unblocked by this work:
- **`lib/security/audit-log.ts`** was writing to a non-existent schema shape — every audit DB call was silently throwing. Now fixed.
- **Item, Role, TaxRate, Category schemas are bilingual** but most code references the legacy single-language field names. Documented in §10.
- **`next.config.ts` env block** was leaking `NEXTAUTH_SECRET` into the client bundle. Plugged.
