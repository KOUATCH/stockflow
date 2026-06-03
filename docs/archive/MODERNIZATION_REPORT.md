# StockFlow Codebase Modernization & Cleanup Report

**Date:** 2026-05-15
**Scope:** End-to-end audit, security hardening (multi-tenant isolation), modernization to a canonical services/actions pattern, large-scale dead-code purge, and type-system tightening.
**Related doc:** [SYSTEM_EVALUATION.md](./SYSTEM_EVALUATION.md) — the underlying audit that drove this work.

---

## 1. Headline numbers

| Metric | Start of session | End of session | Δ |
|---|---|---|---|
| Action files | 179 | **126** | **−53 (−30%)** |
| Component files | ~413 | **320** | **−93 (−23%)** |
| Unscoped server actions (multi-tenant leak) | 77 | **6** (all intentional skips) | **−92%** |
| Total `any` occurrences (actions/components/services/hooks/lib/app) | 385 | **290** | **−25%** |
| Files containing `any` | ~140 | **108** | **−23%** |
| `any` in `services/` layer | 9 | **0** | **−100%** |
| Service test files | 5 | **7** | **+2** |
| Service tests passing | 35 | **93/93** | **+58 tests** |
| Sidebar entries pointing at non-existent routes | 1 (`/purchaseOrders`) | **0** | fixed |
| Broken imports post-purge | n/a | **0** | clean |

---

## 2. Work delivered

### 2.1 Audit & roadmap
Produced [`docs/SYSTEM_EVALUATION.md`](./SYSTEM_EVALUATION.md) — an honest evaluation covering:
- What the codebase does well (Prisma schema with 46 models / 117 indexes / soft-deletes / optimistic locking, modern Next 15 + RSC stack, middleware doing real work)
- Critical issues (secrets-on-disk in `.env`, multi-tenant isolation gaps, 0-byte ghost files, broken nested route trees, no CSRF)
- Major problems (duplicate code dominating the codebase, three competing return-shape conventions, near-zero test coverage, 82% client components, console-wrapper logger, no background-job runner)
- A five-phase roadmap to "enterprise-grade"

### 2.2 Multi-tenant isolation — the security fix
The most consequential change this session.

**The problem:** 77 of 179 action files had **no `organizationId` scoping**. An authenticated user from Org A could pass an Org B resource ID (e.g. `deleteBrand("brand-id-from-org-B")`) and the action would happily delete it. This was a **live cross-tenant data-access vulnerability**.

**Worse:** the bug ran two layers deep. Even where actions delegated to the `services/` layer, the service-level methods (`updateBrand(id)`, `deleteCategory(id)`, `deleteItem(id)`, etc.) themselves did `findUnique({where:{id}})` without checking `organizationId`.

**The fix:**
1. **New helper:** [`services/_shared/require-org.ts`](../services/_shared/require-org.ts) — central `requireOrg(): Promise<{user, userId, orgId}>` that throws on missing session/organisation. Caught by every action's outer `try/catch` and returned via `err()`.
2. **Service layer rewritten** to take `orgId` as the first parameter and use `findFirst({where: {id, organizationId: orgId}})` — cross-tenant access now returns "Not found" (does not leak existence).
3. **Action layer rewritten** to call `requireOrg()` and pass `orgId` to the service.
4. **Cross-tenant guard tests added** to every migrated entity's service test (Brand, Category, Item, Customer, Supplier — 32 new test cases verifying that Org A cannot see/modify/delete Org B resources).

**Entities migrated end-to-end (13 entities, plus 1 barrel-file false-positive):**

| Entity | Files touched | Test coverage |
|---|---|---|
| Brand | 5 action files + service + service-test | 12 tests (including 4 cross-tenant guards) |
| Categories | 4 action files + service + service-test | 14 tests |
| Items/itemsShow | 12 action files + service + service-test | 11 tests |
| item-suppliers | 5 action files (scoped through parent `item.organizationId`) | — |
| Locations | 7 action files (incl. inlining a generic update helper with a tenant leak) | — |
| Organisation | 4 action files (locked down — mostly dead misnamed code, flagged for deletion) | — |
| Products | 4 action files (dead code referencing non-existent `db.product`, locked down) | — |
| Roles | 6 action files | — |
| Savings | 6 action files (dead — no `Saving` model in schema, locked down) | — |
| Stock | 2 action files (mock-data placeholders, `requireOrg()` at every entry) | — |
| TaxRate | 3 action files | — |
| Units | 5 action files | — |
| Users | 5 action files (excl. pre-auth flows: `sendResetLink`, `verifyOtp`, `updateUserPassword`) | — |
| Inventory barrel | 1 file (clarifying comment — was a false positive) | — |

**Important security finding flagged by this work:**
`getAllMembers()`, `getCurrentUsersCount()` previously returned/counted **ALL users globally** (no org filter). After this fix they correctly scope to the calling user's organisation.

**Net result:** 77 → 6 unscoped action files. The remaining 6 are intentional (pre-auth password-recovery flows, stub files with no DB access, and a re-export of an already-secured action).

### 2.3 Canonical pattern enforced
The `services/_shared/action-response` `{ok, err}` shape is now the documented and enforced canonical return shape. Every modernised action follows the same skeleton:

```ts
"use server"

export async function actionName(data: unknown) {
  try {
    const { orgId } = await requireOrg()
    const parsed = SomeSchema.safeParse(data)
    if (!parsed.success) return err(parsed.error.flatten().fieldErrors)
    const result = await SomeService.method(orgId, parsed.data)
    revalidatePath("/dashboard/whatever")
    return ok(result)
  } catch (e) {
    return err(e)
  }
}
```

This is the pattern used in `actions/brands/createBrands.ts`, `actions/customers/createCustomer.ts`, `actions/suppliers/createSupplier.ts`, etc.

### 2.4 New `services/` modules built this session

**`services/customer/`** — new entity, replacing the rejected `actions/customers-system.ts` (which had no auth, no Zod, hand-rolled response shape):
- `customer.schemas.ts` — Zod schemas (`CustomerCreateSchema`, `CustomerUpdateSchema`, `CustomerListParamsSchema`)
- `customer.service.ts` — full CRUD + paginated list, soft-delete via `deletedAt`, auto-generated `CUST-NNNN` codes, code uniqueness scoped per-org
- `customer.service.test.ts` — 13 tests covering create/update/delete/getById with cross-tenant guards
- 5 modern action files in `actions/customers/`: `createCustomer`, `updateCustomerById`, `deleteCustomer`, `getCustomerById`, `getOrgCustomers`

**`services/supplier/`** — new entity, replacing the legacy 498-line monolith `actions/supplierSystem/supplierSystemActions.ts`:
- `supplier.schemas.ts` — Zod schemas including search params
- `supplier.service.ts` — full CRUD + `setSupplierActive` + `searchSuppliersLite`, soft-delete, PO-link block on delete, auto-generated `SUP-NNNN` codes
- `supplier.service.test.ts` — 16 tests including PO-block, cross-tenant guards, search scoping
- 7 modern action files in `actions/suppliers/`: `createSupplier`, `updateSupplier`, `deleteSupplier`, `getSupplierById`, `getOrgSuppliers`, `setSupplierActive`, `searchSuppliersLite`

### 2.5 Blogs — fully purged
Originally rated "wrong" in the audit (returned raw arrays/nulls). First modernised to `ok()/err()` shape with `requireOrg()`, then on a follow-up the user requested full removal of the feature.

**Removed:**
- `app/(dashboard)/dashboard/blogs/` (route folder)
- `components/dashboard/blogs/` (3 components)
- `actions/blogs.ts`
- ModernNavigation "Content Studio" card
- `config/sidebar.ts` Blogs entry
- `config/permissions.ts` blogs permission block + legacy permissions array

**Why:** no `Blog` or `BlogCategory` Prisma model existed — the feature was permanently stubbed. Carrying it added noise without value.

### 2.6 Prisma client regenerated
The schema had `deletedAt` and `preferredLocale` on `Customer` (and `Supplier`), but the generated client was stale and didn't expose those fields. Running `npx prisma generate` brought them in sync. This unblocked the soft-delete and locale-aware logic in the new services.

---

## 3. Dead-code purge

The audit identified ~80–94 legacy action files plus a chaotic web of duplicate component directories. After dependency tracing and user approval, these were obliterated.

### 3.1 Routes deleted
| Route | Why |
|---|---|
| `app/(dashboard)/dashboard/app/` | A complete second route hierarchy (`api/`, `inventory/`, `purchases/`, `reports/`, `sales/`, `settings/`) nested inside a route group — accidental, contained a near-duplicate `items/route.ts` |
| `app/(dashboard)/dashboard/newPosSession/` | Dead duplicate POS route, contained `pageaa22.tsx` |
| `app/(dashboard)/dashboard/session-pos-sync/` | Dead duplicate POS-sync route |
| `app/(dashboard)/dashboard/cashSystem/` | Dead duplicate cash-system route |
| `app/(dashboard)/dashboard/posStation/` | Unlinked POS-station config route |
| `app/(dashboard)/dashboard/purchaseOrderWorkflow/` | Dead duplicate, contained `pcdszxage.tsx` (typo file) |
| `app/(dashboard)/dashboard/recentInventory/` | Dead duplicate of `/inventory/` |
| `app/(dashboard)/dashboard/items/new-manager/` | Dead duplicate of item-create flow |
| `app/(dashboard)/dashboard/blogs/` | Feature removed entirely (no schema model) |

### 3.2 Component directories deleted
- `components/cashSystem/` (incl. 4 POS terminal duplicates)
- `components/newPOSSession/`
- `components/synchro/` (incl. 2 more POS terminal duplicates)
- `components/posStation/`
- `components/purchaseOrderWorkflow/`
- `components/purchases/`
- `components/settings/`
- `components/sales-system/`
- `components/system/`
- `components/dashboard/newLocation/`
- `components/newItemForms/`
- `components/dashboard/blogs/`

### 3.3 Lib directories deleted
- `lib/cashSystem/` (16 `any` uses, 0 importers)
- `lib/newPOSSession/` (18 `any` uses, 0 importers)

### 3.4 Action directories deleted
- `actions/cashSystem/` (incl. files referencing non-existent `db.product`/`db.sales`/`db.mockData`)
- `actions/newPOSSession/`
- `actions/posStation/`
- `actions/pos/` (3 parallel `*POSAction*` implementations)
- `actions/products/` (referenced non-existent `db.product` model)
- `actions/recentInventory/`
- `actions/session-pos-sync/`
- `actions/sales-analyses/` (5 files of sales duplicates)
- `actions/posTerminal/`
- `actions/organisation/` (5 misnamed dead files)
- `actions/sessions and terminals/` (file path with literal spaces — junk)
- `actions/supplierSystem/` (replaced by new `services/supplier/` chain)

### 3.5 Loose-file deletions
- `actions/blogs.ts`, `actions/newInventory-system.ts`, `actions/sales-analytics.ts`, `actions/sales-system.ts`, `actions/customers-system.ts`
- `actions/item/createInput.ts` (broken re-export to non-existent module)
- `actions/itemsShow/createOldItem.ts`
- `actions/categories/getBriefOrgItems.ts`
- `actions/customers/customerActionsFinal.ts` (FormData-based legacy pattern)
- `actions/suppliers/{getSuppliersByOrgId, supplierActions, getSuppliersSummary, linkItemsToSupplier, supplierKeys, unlinkItemFromSupplier}.ts`
- `actions/pos-actions.ts`, `actions/posStation/pos-actions.ts`, `actions/posStation/posStationActions.ts` (3 duplicate POS actions deleted earlier in session)
- `components/sales/{IntegratedDailySalesDashboard,sales-orders,customers-management}.tsx`
- `components/system/sales/PosTerminal{,Recent,z}.tsx` (3 more POS terminal duplicates)
- `app/(dashboard)/dashboard/inventory/items/oldPageNew.tsx`
- `app/(dashboard)/dashboard/inventory/pagezzzx.tsx`
- `app/(dashboard)/dashboard/items/secondPageFo.tsx`
- `app/(dashboard)/dashboard/settings/locations/öldpage.tsx` (note the umlaut "öld")
- `app/(dashboard)/dashboard/inventory/units/firstpage.tsx`
- `app/(dashboard)/dashboard/inventory/items/[id]/others/BasicInfoTabFinal.tsx`
- `app/(dashboard)/dashboard/settings/locations/[id]/edit/others/BasicInfoTabFinal.tsx`
- The 0-byte concatenated-path ghost file `E:retailifycomponentsnotificationsNotificationProvider.tsx` (deleted earlier in session)

### 3.6 Config fixes from purge fallout
- `config/sidebar.ts` — fixed broken `/dashboard/purchaseOrders` entry → `/dashboard/purchase-orders`
- `components/dashboard/ModernNavigation.tsx` — removed "Content Studio" (blogs) card and the `"blogs.read"` permission string
- `config/permissions.ts` — removed `blogs` permission set and legacy `blogs.*` entries

---

## 4. Type-system tightening

### 4.1 `tsconfig.json` — new strict flags

Added:
- `noImplicitOverride: true` — requires `override` keyword on subclass methods. Caught 2 real cases in `config/error-boundary.tsx`. Fixed with proper `override` + correct `ErrorInfo` type import.
- `noFallthroughCasesInSwitch: true` — catches missing `break` statements in switch cases (silent bug source).
- `forceConsistentCasingInFileNames: true` — Windows / case-insensitive filesystem safety.

**Deliberately deferred** (would generate hundreds of new errors in one pass — belongs in dedicated migrations):
- `noUncheckedIndexedAccess` — every array/object index access becomes `T | undefined`. Very high value (it catches real null bugs) but disruptive.
- `exactOptionalPropertyTypes` — distinguishes `prop?: T` from `prop?: T | undefined`. Disruptive in this codebase.

### 4.2 `eslint.config.mjs` — `no-explicit-any` enforced in services/

**Before:**
```js
// Too many anys to block as errors today — warn instead
"@typescript-eslint/no-explicit-any": "warn",
```

**After:**
- Removed the apologetic comment.
- Default remains `warn` for the legacy migration path.
- **New stricter override** for `services/**/*.ts` and `services/**/*.tsx`: `"@typescript-eslint/no-explicit-any": "error"`.
- Verified `services/` is **zero-any** (down from 9 — all in `services/purchase-order/purchase-order.service.ts`), so the rule enforces it going forward without retro-breaking anything.

### 4.3 `any` reduction
- Started: 385 occurrences across ~140 files
- Dead-code purge dropped: 290 occurrences across 108 files (−25%)
- `services/purchase-order/purchase-order.service.ts` hand-cleaned: 9 → 0 `any` casts. Replaced `(line.item as any)?.name` with proper `line.item.nameEn` (revealed and fixed broken `as any` casts that were silencing real schema field access).

### 4.4 Pre-existing TypeScript debt (NOT introduced this session)
A full `tsc --noEmit` reports ~1,299 pre-existing errors across the codebase (unrelated to this session's changes). Top categories:
- TS7006 (255): parameter implicitly `any`
- TS2339 (242): property does not exist on type
- TS2322 (153): type X not assignable to type Y
- TS2353 (119): object literal has unknown property
- TS2307 (92): cannot find module

These reflect long-standing issues — chiefly: stale Prisma `standardInclude` shapes (referencing `name` on Item which actually has `nameEn`/`nameFr`), Decimal/number arithmetic mismatches in PO/sales math, missing exports like `AuthenticatedUser`/`checkPermission` from `@/config/useAuth`, missing hook files like `@/hooks/useAllItemSuppliers`. Each warrants a focused PR.

---

## 5. Verification

**All passes:**
- ✅ Service tests: **93/93 passing** (up from 35 — added 58 new tests, mostly cross-tenant guards)
- ✅ ESLint on `services/`: **0 errors** (3 unused-var warnings only)
- ✅ Broken-imports sweep post-purge: **0 broken imports**
- ✅ No new TypeScript errors introduced by any of this session's changes

**Cross-checked by recovery incident:** during the multi-tenant migration I accidentally ran `git stash -u --keep-index` which (with no staged content) stashed all uncommitted work, reverting every file. Caught from system reminders showing the file contents reverted, ran `git stash pop`, everything came back cleanly. No data lost; flagged as a lesson in the original report.

---

## 6. What's still on the table

The audit's Phase 1 (consolidation) is roughly halfway done. Concrete next steps in order of value:

### High value, tractable
1. **Modernise the remaining ~35 active legacy action files** following the same Brand/Customer/Supplier template:
   - `actions/users/` (6 files: createUser, getAllUsers, getOrgUsers, getOrgInvites, createInvitedUser, sendInvite) — user/invite flow
   - `actions/inventory/` (10 files; `services/inventory/` already exists)
   - `actions/taxRate/{createTaxRate, deleteTaxRate, updateTaxRateByIdNew}.ts`
   - `actions/units/deleteUnit.ts`
   - `actions/roles/{createRole, getOrgRoles}.ts` — needs new `services/role/`
   - `actions/categories/{getAllCategories, newUpdateCategoryById}.ts`
   - `actions/locations/createLocation.ts`
   - `actions/item/` (7 files; varying states)
   - `actions/analytics/{financial-reports, get-sales-analytics}.ts`

2. **Address the stale `standardInclude` in `services/purchase-order/purchase-order.service.ts`** — references Item.name (which doesn't exist; should be `nameEn`). This is masking real runtime errors and contributes a chunk of the pre-existing TS error count.

3. **Move ESLint `no-explicit-any` from `warn` to `error` per-directory** as each is cleaned. Suggested order: `services/` (done) → `actions/services-backed` → `app/` → `actions/` → `components/`.

### Medium value, larger lift
4. **`actions/suppliers/[id]/edit/page.tsx` and `[id]/page.tsx`** in `/dashboard/suppliersSystem/` — pre-existing broken imports (`@/actions/supplierSystemActions` typo, missing `hooks/supplierSystemHooks`, missing `@/components/supplierSystem/supplier-analytics`). Either fix the broken chain or delete the supplier-detail and supplier-edit pages and re-create them properly.

5. **Inventory module** — still has duplicate code (`components/inventory/`, `components/Forms/inventory/`, `components/ui/groups/inventory/`, `components/dashboard/items/`). Needs a focused consolidation pass.

6. **`actions/inventory/inventory.ts` etc.** — 10 files, mostly thick. Many would benefit from being broken into one-file-per-action.

### High value, dedicated pass
7. **Enable `noUncheckedIndexedAccess` in `tsconfig.json`** and fix the surfaced errors. This catches a real class of bugs (`array[i]` returning undefined that the code doesn't handle).

8. **Migrate to `@sentry/nextjs`** + `pino` structured logging. The current `lib/logger.ts` is a 24-line `console.*` wrapper.

9. **Background-job runner** (recommend Inngest given the Next.js stack). Long-running flows (PO receipt, daily sales report, email sending) run synchronously inside server actions today.

10. **Real Sentry / observability** — the audit found `SENTRY_DSN=""` placeholder and no error tracking wired up.

### Critical and unaddressed
11. **Rotate every credential in `.env`.** The `UPLOADTHING_TOKEN` (sk_live), `RESEND_API_KEY`, `EMAIL_SERVER_PASSWORD` (personal Gmail), `AUTH_SECRET`, and `DB_PASSWORD` should be considered compromised. Move them to a secret manager (Doppler, Infisical, Vercel/Netlify env, or AWS Secrets Manager).

---

## 7. Architectural patterns now established

These are the patterns to copy when adding new entities:

### 7.1 Directory layout
```
services/<entity>/
  ├─ <entity>.schemas.ts       ← Zod schemas + inferred types
  ├─ <entity>.service.ts       ← pure DB layer, takes orgId first arg
  └─ <entity>.service.test.ts  ← cross-tenant guard tests required

actions/<entity>/
  ├─ create<Entity>.ts         ← requireOrg() + Zod parse + service call
  ├─ update<Entity>ById.ts
  ├─ delete<Entity>.ts
  ├─ get<Entity>ById.ts
  └─ getOrg<Entities>.ts       ← paginated list
```

### 7.2 The action skeleton
```ts
"use server"

import { err, ok } from "@/services/_shared/action-response"
import { requireOrg } from "@/services/_shared/require-org"
import { EntityCreateSchema } from "@/services/entity/entity.schemas"
import * as EntityService from "@/services/entity/entity.service"
import { revalidatePath } from "next/cache"

export async function createEntity(data: unknown) {
  try {
    const { orgId } = await requireOrg()
    const parsed = EntityCreateSchema.safeParse(data)
    if (!parsed.success) return err(parsed.error.flatten().fieldErrors)
    const result = await EntityService.createEntity(orgId, parsed.data)
    revalidatePath("/dashboard/entities")
    return ok(result)
  } catch (e) {
    return err(e)
  }
}
```

### 7.3 The service skeleton
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

### 7.4 The cross-tenant guard test pattern
```ts
it("refuses to return an entity from another org", async () => {
  vi.mocked(db.entity.findFirst).mockResolvedValue(null)
  await expect(getEntityById("org-2", "entity-1")).rejects.toThrow("Entity not found")
})
```

Every entity that gets a service needs this test for `getById`, `update`, and `delete`.

---

## 8. Risk and reversibility

Everything in this report is in git (working tree, pre-commit). Reversible via `git checkout <file>` or `git restore`. The `requireOrg()` helper and the new `services/{customer,supplier}/` directories are pure additions. The deletions are documented above in §3 — recoverable from git history if any prove premature.

The one significant deletion the user may want to reconsider is `actions/supplierSystem/supplierSystemActions.ts` (498 lines) — its advanced functions (`getSupplierDetail`, `getSupplierItemLinks`, `getSupplierItemStats`, `upsertItemSupplierBulk`, `getRecentPOItemsForSupplier`) handled item-supplier link management and supplier-detail analytics not yet reimplemented. They were only called by pre-existing-broken pages (`/dashboard/suppliersSystem/[id]/page.tsx` had `@/actions/supplierSystemActions` typo path, not even importing the real module). If/when supplier-detail UI is rebuilt, these functions should be ported into `services/supplier/` first.
