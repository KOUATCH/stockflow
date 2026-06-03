// @ts-nocheck
"use server"

import type { Prisma } from "@prisma/client"
import { revalidatePath, revalidateTag } from "next/cache"

import { getAuthenticatedUser } from "@/lib/auth-server"
import { can, type Action } from "@/lib/permissions"
import { db } from "@/prisma/db"
import type {
  ItemSupplierLink,
  PaginatedSuppliersResponse,
  RecentPOItem,
  SupplierDTO,
  SupplierFilters,
  SupplierInput,
  SupplierItemStatsMap,
} from "@/types/suppliersSystemTypes"

// function assertOrg(organizationId?: string) {
//   if (!organizationId) throw new Error("Organization ID is required")
// }

function validateSupplierInput(input: SupplierInput) {
  if (!input.name || input.name.trim().length < 2) throw new Error("Supplier name is required")
  if (input.email && !/^\S+@\S+\.\S+$/.test(input.email)) throw new Error("Invalid email format")
  if (input.paymentTerms != null && input.paymentTerms < 0) throw new Error("Payment terms must be >= 0")
  if (input.creditLimit != null && input.creditLimit < 0) throw new Error("Credit limit must be >= 0")
}

/* List with filters */
export async function getSuppliers(filters: SupplierFilters): Promise<PaginatedSuppliersResponse> {
  assertOrg(filters.organizationId)
  const page = Math.max(1, filters.page || 1)
  const limit = Math.min(100, Math.max(1, filters.limit || 20))
  const skip = (page - 1) * limit
  const where: Prisma.SupplierWhereInput = { organizationId: filters.organizationId }
  if (typeof filters.active === "boolean") where.isActive = filters.active
  if (filters.search?.trim()) {
    const q = filters.search.trim()
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { code: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { phone: { contains: q, mode: "insensitive" } },
     
    ]
  }
  const sortBy = (filters.sortBy || "name") as "name" | "createdAt" | "updatedAt" | "code"
  const sortOrder: Prisma.SortOrder = (filters.sortOrder as Prisma.SortOrder) || "asc"
  const orderBy = { [sortBy]: sortOrder } as Prisma.SupplierOrderByWithRelationInput

  const [rows, total] = await Promise.all([
    db.supplier.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      select: {
        id: true,
        name: true,
        code: true,
        contactPerson: true,
        email: true,
        phone: true,
        address: true,
        city: true,
        state: true,
        zipCode: true,
        country: true,
        taxId: true,
        paymentTerms: true,
        creditLimit: true,
        notes: true,
        isActive: true,
        organizationId: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    db.supplier.count({ where }),
  ])
  const totalPages = Math.ceil(total / limit)
  return {
    data: rows as unknown as SupplierDTO[],
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
      pageStart: rows.length ? skip + 1 : 0,
    },
    filters: { ...filters, page, limit },
  }
}

/* Get one */
export async function getSupplier(id: string, organizationId: string): Promise<SupplierDTO> {
  assertOrg(organizationId)
  const sup = await db.supplier.findFirst({
    where: { id, organizationId },
  })
  if (!sup) throw new Error("Supplier not found")
  return sup as unknown as SupplierDTO
}

/* Create/Update/Delete with role guards */
export async function createSupplier(input: SupplierInput): Promise<SupplierDTO> {
  const user = await getAuthenticatedUser()
  if (!can(user as any, "supplier:create" as Action)) throw new Error("Not authorized")
  assertOrg(input.organizationId)
  validateSupplierInput(input)
  const created = await db.supplier.create({
    data: {
      ...input,
      isActive: input.isActive ?? true,
      paymentTerms: input.paymentTerms ?? 30,
    },
  })
  revalidateTag("suppliers")
  revalidateTag(`suppliers-${input.organizationId}`)
  revalidatePath("/dashboard/suppliers")
  return created as unknown as SupplierDTO
}

export async function updateSupplier(id: string, input: SupplierInput): Promise<SupplierDTO> {
  const user = await getAuthenticatedUser()
  if (!can(user as any, "supplier:update" as Action)) throw new Error("Not authorized")
  assertOrg(input.organizationId)
  validateSupplierInput(input)
  const exists = await db.supplier.findFirst({
    where: { id, organizationId: input.organizationId },
    select: { id: true },
  })
  if (!exists) throw new Error("Supplier not found")
  const updated = await db.supplier.update({
    where: { id },
    data: {
      ...input,
      isActive: input.isActive ?? true,
    },
  })
  revalidateTag("suppliers")
  revalidateTag(`suppliers-${input.organizationId}`)
  revalidatePath("/dashboard/suppliers")
  return updated as unknown as SupplierDTO
}

export async function upsertSupplier(input: Partial<SupplierInput> & { id?: string; organizationId: string }) {
  if (input.id) return updateSupplier(input.id, input as SupplierInput)
  return createSupplier(input as SupplierInput)
}

export async function toggleSupplierActive(params: { id: string; organizationId: string; isActive: boolean }) {
  const user = await getAuthenticatedUser()
  if (!can(user as any, "supplier:update" as Action)) throw new Error("Not authorized")
  assertOrg(params.organizationId)
  const updated = await db.supplier.update({
    where: { id: params.id },
    data: { isActive: params.isActive },
    select: { id: true, isActive: true, organizationId: true },
  })
  revalidateTag("suppliers")
  revalidateTag(`suppliers-${params.organizationId}`)
  revalidatePath("/dashboard/suppliers")
  return updated
}

export async function deleteSupplier(id: string, organizationId: string) {
  const user = await getAuthenticatedUser()
  if (!can(user as any, "supplier:delete" as Action)) throw new Error("Not authorized")
  assertOrg(organizationId)
  const linked = await db.purchaseOrder.count({ where: { supplierId: id, organizationId } })
  if (linked > 0) throw new Error("Cannot delete supplier: it is referenced by purchase orders")
  await db.supplier.delete({ where: { id } })
  revalidateTag("suppliers")
  revalidateTag(`suppliers-${organizationId}`)
  revalidatePath("/dashboard/suppliers")
  return { success: true }
}

/* Lightweight supplier search for comboboxes */
export async function searchSuppliersLite(params: { organizationId: string; q: string; limit?: number }) {
  const { organizationId, q, limit = 10 } = params
  assertOrg(organizationId)
  const where: Prisma.SupplierWhereInput = {
    organizationId,
    isActive: true,
    OR: q
      ? [
          { name: { contains: q, mode: "insensitive" } },
          { code: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
        ]
      : undefined,
  }
  const suppliers = await db.supplier.findMany({
    where,
    take: limit,
    orderBy: { name: "asc" },
    select: { id: true, name: true, code: true, email: true },
  })
  return suppliers
}

/* Item search for ItemSupplier editor */
export async function searchItemsLite(params: { organizationId: string; q: string; limit?: number }) {
  const { organizationId, q, limit = 10 } = params
  assertOrg(organizationId)
  const where: Prisma.ItemWhereInput = {
    organizationId,
    isActive: true,
    OR: q
      ? [
          { name: { contains: q, mode: "insensitive" } },
          { sku: { contains: q, mode: "insensitive" } },
          { barcode: { contains: q, mode: "insensitive" } },
        ]
      : undefined,
  }
  const items = await db.item.findMany({
    where,
    take: limit,
    orderBy: { name: "asc" },
    select: { id: true, name: true, sku: true, costPrice: true, sellingPrice: true },
  })
  return items
}

/* ItemSupplier links */
export async function getSupplierItemLinks(params: { supplierId: string; organizationId: string }) {
  const { supplierId, organizationId } = params
  assertOrg(organizationId)
  const links = await db.itemSupplier.findMany({
    where: { supplierId, item: { organizationId } },
    orderBy: { createdAt: "desc" },
    include: { item: { select: { id: true, name: true, sku: true } } },
  })
  return links as unknown as ItemSupplierLink[]
}

export async function upsertItemSupplierBulk(params: {
  supplierId: string
  organizationId: string
  rows: Array<{
    id?: string
    itemId: string
    supplierSku?: string | null
    supplierName?: string | null
    isPreferred?: boolean
    leadTimeDays?: number | null
    minOrderQuantity?: number | null
    unitCost?: number | null
    notes?: string | null
  }>
}) {
  const user = await getAuthenticatedUser()
  if (!can(user as any, "supplier:update" as Action)) throw new Error("Not authorized")
  const { supplierId, organizationId, rows } = params
  assertOrg(organizationId)

  await db.$transaction(async (tx) => {
    for (const r of rows) {
      // Ensure item belongs to org
      const item = await tx.item.findFirst({ where: { id: r.itemId, organizationId }, select: { id: true } })
      if (!item) throw new Error("Item not found in organization")
      if (r.id) {
        await tx.itemSupplier.update({
          where: { id: r.id },
          data: {
            supplierSku: r.supplierSku ?? null,
            supplierName: r.supplierName ?? null,
            isPreferred: r.isPreferred ?? false,
            leadTimeDays: r.leadTimeDays ?? null,
            minOrderQuantity: r.minOrderQuantity ?? null,
            unitCost: r.unitCost ?? null,
            notes: r.notes ?? null,
          },
        })
      } else {
        // upsert via unique [itemId, supplierId]
        const existing = await tx.itemSupplier.findFirst({ where: { itemId: r.itemId, supplierId } })
        if (existing) {
          await tx.itemSupplier.update({
            where: { id: existing.id },
            data: {
              supplierSku: r.supplierSku ?? null,
              supplierName: r.supplierName ?? null,
              isPreferred: r.isPreferred ?? existing.isPreferred,
              leadTimeDays: r.leadTimeDays ?? existing.leadTimeDays,
              minOrderQuantity: r.minOrderQuantity ?? existing.minOrderQuantity,
              unitCost: r.unitCost ?? existing.unitCost,
              notes: r.notes ?? existing.notes,
            },
          })
        } else {
          await tx.itemSupplier.create({
            data: {
              itemId: r.itemId,
              supplierId,
              supplierSku: r.supplierSku ?? null,
              supplierName: r.supplierName ?? null,
              isPreferred: r.isPreferred ?? false,
              leadTimeDays: r.leadTimeDays ?? null,
              minOrderQuantity: r.minOrderQuantity ?? null,
              unitCost: r.unitCost ?? null,
              notes: r.notes ?? null,
            },
          })
        }
      }
    }
  })

  revalidateTag("suppliers")
  revalidateTag(`suppliers-${organizationId}`)
  revalidatePath(`/dashboard/suppliers/${supplierId}`)
  revalidatePath(`/dashboard/suppliers/${supplierId}/edit`)
  return { success: true }
}

export async function deleteItemSupplierLink(params: { id: string; organizationId: string }) {
  const user = await getAuthenticatedUser()
  if (!can(user as any, "supplier:update" as Action)) throw new Error("Not authorized")
  const { id, organizationId } = params
  assertOrg(organizationId)
  const link = await db.itemSupplier.findFirst({
    where: { id },
    include: { item: { select: { organizationId: true } } },
  })
  if (!link || link.item.organizationId !== organizationId) throw new Error("Link not found")
  await db.itemSupplier.delete({ where: { id } })
  revalidateTag("suppliers")
  return { success: true }
}

/* Supplier detail analytics and recent POs */
export async function getSupplierDetail(params: { id: string; organizationId: string }) {
  const { id, organizationId } = params
  assertOrg(organizationId)
  const supplier = await db.supplier.findFirst({ where: { id, organizationId } })
  if (!supplier) throw new Error("Supplier not found")

  // Recent purchase orders
  const recentPOs = await db.purchaseOrder.findMany({
    where: { supplierId: id, organizationId },
    select: { id: true, orderNumber: true, orderDate: true, status: true, total: true, expectedDeliveryDate: true },
    orderBy: { orderDate: "desc" },
    take: 10,
  })

  // Monthly spend (last 18 months)
  const since = new Date()
  since.setMonth(since.getMonth() - 17)
  const orders = await db.purchaseOrder.findMany({
    where: { supplierId: id, organizationId, orderDate: { gte: since } },
    select: { orderDate: true, total: true },
    orderBy: { orderDate: "asc" },
  })
  const monthKey = (d: Date) => `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`
  const monthly: Record<string, { total: number; count: number }> = {}
  let totalSpend = 0
  for (const o of orders) {
    totalSpend += o.total || 0
    const k = monthKey(o.orderDate)
    monthly[k] ||= { total: 0, count: 0 }
    monthly[k].total += o.total || 0
    monthly[k].count += 1
  }

  // Top items by PO spend
  const topItemAgg = await db.purchaseOrderLine.groupBy({
    by: ["itemId"],
    where: { purchaseOrder: { supplierId: id, organizationId } },
    _sum: { lineTotal: true },
    orderBy: { _sum: { lineTotal: "desc" } },
    take: 5,
  })
  const itemIds = topItemAgg.map((x) => x.itemId)
  const items = itemIds.length
    ? await db.item.findMany({ where: { id: { in: itemIds } }, select: { id: true, name: true, sku: true } })
    : []
  const topItems = topItemAgg.map((x) => ({
    itemId: x.itemId,
    name: items.find((i) => i.id === x.itemId)?.name || "Unknown",
    sku: items.find((i) => i.id === x.itemId)?.sku || "",
    total: x._sum.lineTotal || 0,
  }))

  return { supplier, recentPOs, analytics: { monthly, totalSpend, topItems } }
}

/* Stats per item: last order date and weighted avg unit cost based on PO lines */
export async function getSupplierItemStats(params: {
  supplierId: string
  organizationId: string
  itemIds?: string[]
}) {
  const { supplierId, organizationId, itemIds } = params
  assertOrg(organizationId)
  const whereLines: Prisma.PurchaseOrderLineWhereInput = {
    purchaseOrder: { supplierId, organizationId },
    ...(itemIds && itemIds.length ? { itemId: { in: itemIds } } : {}),
  }
  const lines = await db.purchaseOrderLine.findMany({
    where: whereLines,
    select: {
      itemId: true,
      orderedQuantity: true,
      unitCost: true,
      purchaseOrder: { select: { orderDate: true } },
    },
  })
  const map: SupplierItemStatsMap = {}
  for (const l of lines) {
    const key = l.itemId
    const qty = l.orderedQuantity || 0
    if (!map[key]) map[key] = { avgUnitCost: null, lastOrderDate: null }
    const prev = map[key]
    // weighted sum
    const prevSum = (prev.avgUnitCost ?? 0) * (prev as any).__qtySum || 0
    const prevQty = (prev as any).__qtySum || 0
    const nextQty = prevQty + qty
    const nextSum = prevSum + (l.unitCost || 0) * qty
    const nextAvg = nextQty > 0 ? nextSum / nextQty : null
    map[key].avgUnitCost = nextAvg
    ;(map[key] as any).__qtySum = nextQty
    const od = l.purchaseOrder?.orderDate ? new Date(l.purchaseOrder.orderDate) : null
    if (od && (!prev.lastOrderDate || od > prev.lastOrderDate)) map[key].lastOrderDate = od
  }
  // cleanup helpers
  for (const k of Object.keys(map)) {
    delete (map[k] as any).__qtySum
  }
  return map
}

/* Recent PO items for quick-linking (with stats) */
export async function getRecentPOItemsForSupplier(params: {
  supplierId: string
  organizationId: string
  months?: number
  limit?: number
}): Promise<RecentPOItem[]> {
  const { supplierId, organizationId, months = 6, limit = 100 } = params
  assertOrg(organizationId)
  const since = new Date()
  since.setMonth(since.getMonth() - months)

  const recentLines = await db.purchaseOrderLine.findMany({
    where: {
      purchaseOrder: { supplierId, organizationId, orderDate: { gte: since } },
    },
    select: {
      itemId: true,
      orderedQuantity: true,
      unitCost: true,
      purchaseOrder: { select: { orderDate: true } },
      item: { select: { id: true, name: true, sku: true } },
    },
    orderBy: { purchaseOrder: { orderDate: "desc" } },
    take: 1000, // enough to compute stats; we'll slice by unique items below
  })

  const perItem: Record<
    string,
    { itemId: string; name: string; sku?: string; qtySum: number; costSum: number; lastOrderDate: Date | null }
  > = {}
  for (const l of recentLines) {
    const id = l.itemId
    perItem[id] ||= {
      itemId: id,
      name: l.item?.name || "Unknown",
      sku: l.item?.sku || "",
      qtySum: 0,
      costSum: 0,
      lastOrderDate: null,
    }
    perItem[id].qtySum += l.orderedQuantity || 0
    perItem[id].costSum += (l.unitCost || 0) * (l.orderedQuantity || 0)
    const od = l.purchaseOrder?.orderDate ? new Date(l.purchaseOrder.orderDate) : null
    if (od && (!perItem[id].lastOrderDate || od > perItem[id].lastOrderDate)) perItem[id].lastOrderDate = od
  }

  const items = Object.values(perItem)
    .sort((a, b) => (b.lastOrderDate?.getTime() || 0) - (a.lastOrderDate?.getTime() || 0))
    .slice(0, limit)
    .map<RecentPOItem>((x) => ({
      itemId: x.itemId,
      name: x.name,
      sku: x.sku,
      lastOrderDate: x.lastOrderDate || null,
      avgUnitCost: x.qtySum > 0 ? x.costSum / x.qtySum : null,
    }))

  return items
}
