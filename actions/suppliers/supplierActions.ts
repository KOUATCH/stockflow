'use server'

import { supplierInclude } from '@/lib/supplier/include'
import { db } from '@/prisma/db'
// import { db } from '@/lib/db'
// import { supplierInclude } from '@/lib/suppliers/includes'
import type {
  CreateSupplierDTO,
  LinkItemsToSupplierDTO,
  PaginatedSuppliersResponse,
  SortOrder,
  SupplierFilters,
  SupplierResponse,
  SupplierSortBy,
  SupplierWithRelations,
  UnlinkItemFromSupplierDTO,
  UpdateSupplierDTO,
} from '@/types/supplier'
import { Prisma, PurchaseOrderStatus } from '@prisma/client'
import { revalidatePath, revalidateTag } from 'next/cache'

// Helpers

const allowedSortKeys = new Set<SupplierSortBy>(['createdAt', 'updatedAt', 'name', 'code', 'isActive'])

function normalizeSort(sortBy?: SupplierSortBy, sortOrder?: SortOrder) {
  const key: SupplierSortBy = allowedSortKeys.has(sortBy ?? 'createdAt') ? (sortBy as SupplierSortBy) : 'createdAt'
  const order: SortOrder = sortOrder === 'asc' || sortOrder === 'desc' ? sortOrder : 'desc'
  return { key, order }
}

function buildSearchFilter(q: string): Prisma.SupplierWhereInput[] {
  const contains = (field: string) => ({ contains: field, mode: 'insensitive' as const })
  return [
    { name: contains(q) },
    { code: contains(q) },
    { contactPerson: contains(q) },
    { email: contains(q) },
    { phone: contains(q) },
    { taxId: contains(q) },
   
  ]
}

function sanitizeEmail(email?: string | null) {
  if (!email) return null
  const trimmed = email.trim()
  // naive check
  if (!/^\S+@\S+\.\S+$/.test(trimmed)) {
    throw new Error('Invalid supplier email format')
  }
  return trimmed
}

function sanitizeOptionalString(s?: string | null) {
  if (s == null) return null
  const v = s.trim()
  return v.length ? v : null
}

// Actions

/**
 * List suppliers with pagination, search, and sorting.
 */
export async function getSuppliers(filters: SupplierFilters): Promise<PaginatedSuppliersResponse> {
  try {
    if (!filters?.organizationId) throw new Error('Organization ID is required')

    const page = Math.max(1, Number(filters.page || 1))
    const limit = Math.min(100, Math.max(1, Number(filters.limit || 20)))
    const skip = (page - 1) * limit

    const where: Prisma.SupplierWhereInput = { organizationId: filters.organizationId }
    if (typeof filters.isActive === 'boolean') where.isActive = filters.isActive

    if (filters.search?.trim()) {
      where.OR = buildSearchFilter(filters.search.trim())
    }

    const { key: sortBy, order: sortOrder } = normalizeSort(filters.sortBy, filters.sortOrder)
    const orderBy: Prisma.SupplierOrderByWithRelationInput = { [sortBy]: sortOrder }

    const [suppliers, totalCount] = await Promise.all([
      db.supplier.findMany({
        where,
        include: supplierInclude,
        orderBy,
        skip,
        take: limit,
      }),
      db.supplier.count({ where }),
    ])

    const totalPages = Math.max(1, Math.ceil(totalCount / limit))
    const pageStart = totalCount === 0 ? 0 : skip + 1
    const pageEnd = totalCount === 0 ? 0 : Math.min(skip + limit, totalCount)

    return {
      data: suppliers as SupplierWithRelations[],
      pagination: { page, limit, total: totalCount, totalPages, hasNext: page < totalPages, hasPrev: page > 1, pageStart, pageEnd },
      filters: { ...filters, page, limit },
    }
  } catch (error) {
    console.error('Error fetching suppliers:', error)
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch suppliers. Please try again.')
  }
}

/**
 * Fetch one supplier by ID (optionally scoped by organization).
 */
export async function getSupplier(id: string, organizationId?: string): Promise<SupplierWithRelations> {
  try {
    if (!id) throw new Error('Supplier ID is required')
    const where: Prisma.SupplierWhereInput = { id }
    if (organizationId) where.organizationId = organizationId

    const supplier = await db.supplier.findFirst({
      where,
      include: supplierInclude,
    })
    if (!supplier) {
      throw new Error('Supplier not found')
    }
    return supplier as SupplierWithRelations
  } catch (error) {
    console.error('Error fetching supplier:', error)
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch supplier')
  }
}

/**
 * Create a new supplier.
 */
export async function createSupplier(payload: CreateSupplierDTO): Promise<SupplierResponse<SupplierWithRelations>> {
  try {
    if (!payload) throw new Error('Supplier data is required')
    if (!payload.organizationId) throw new Error('Organization ID is required')
    if (!payload.name || !payload.name.trim()) throw new Error('Supplier name is required')

    const code = sanitizeOptionalString(payload.code || undefined)
    const email = sanitizeEmail(payload.email ?? null)

    // Enforce unique code per organization when provided
    if (code) {
      const existing = await db.supplier.findFirst({
        where: { organizationId: payload.organizationId, code },
        select: { id: true },
      })
      if (existing) throw new Error('A supplier with this code already exists in your organization')
    }

    const created = await db.supplier.create({
      data: {
        organizationId: payload.organizationId,
        name: payload.name.trim(),
        code,
        contactPerson: sanitizeOptionalString(payload.contactPerson ?? null),
        email,
        phone: sanitizeOptionalString(payload.phone ?? null),
        address: sanitizeOptionalString(payload.address ?? null),
        taxId: sanitizeOptionalString(payload.taxId ?? null),
        paymentTerms: payload.paymentTerms ?? 30,
        creditLimit: payload.creditLimit ?? null,
        notes: sanitizeOptionalString(payload.notes ?? null),
        isActive: payload.isActive ?? true,
      },
      include: supplierInclude,
    })

    revalidateTag('suppliers')
    revalidateTag(`suppliers-${payload.organizationId}`)
    revalidatePath('/dashboard/suppliers')

    return {
      success: true,
      error: 'Supplier created successfully',
      data: created as SupplierWithRelations,
    }
  } catch (error) {
    // When used with useActionState, consider returning error values instead of throwing for expected failures [^1].
    console.error('Error creating supplier:', error)
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        // unique constraint (e.g., code unique, email unique)
        throw new Error('A supplier with this unique field already exists')
      }
      throw new Error(`Database error: ${error.message}`)
    }
    throw new Error(error instanceof Error ? error.message : 'Failed to create supplier. Please try again.')
  }
}

/**
 * Update an existing supplier.
 */
export async function updateSupplier(payload: UpdateSupplierDTO): Promise<SupplierResponse<SupplierWithRelations>> {
  try {
    if (!payload?.id) throw new Error('Supplier ID is required')
    if (!payload?.organizationId) throw new Error('Organization ID is required')

    const existing = await db.supplier.findFirst({
      where: { id: payload.id, organizationId: payload.organizationId },
      select: { id: true, code: true, organizationId: true },
    })
    if (!existing) throw new Error("Supplier not found or you don't have permission to update it")

    const code = sanitizeOptionalString(payload.code ?? undefined)
    const email = sanitizeEmail(payload.email ?? null)

    // Enforce unique code per organization when changing code
    if (code) {
      const codeClash = await db.supplier.findFirst({
        where: { organizationId: payload.organizationId, code, NOT: { id: payload.id } },
        select: { id: true },
      })
      if (codeClash) throw new Error('Another supplier with this code already exists in your organization')
    }

    const updated = await db.supplier.update({
      where: { id: payload.id },
      data: {
        name: payload.name?.trim(),
        code,
        contactPerson: sanitizeOptionalString(payload.contactPerson ?? undefined),
        email,
        phone: sanitizeOptionalString(payload.phone ?? undefined),
        address: sanitizeOptionalString(payload.address ?? undefined),
        taxId: sanitizeOptionalString(payload.taxId ?? undefined),
        paymentTerms: payload.paymentTerms ?? undefined,
        creditLimit: payload.creditLimit ?? undefined,
        notes: sanitizeOptionalString(payload.notes ?? undefined),
        isActive: typeof payload.isActive === 'boolean' ? payload.isActive : undefined,
      },
      include: supplierInclude,
    })

    revalidateTag('suppliers')
    revalidateTag(`suppliers-${payload.organizationId}`)
    revalidateTag(`supplier-${payload.id}`)
    revalidatePath('/dashboard/suppliers')
    revalidatePath(`/dashboard/suppliers/${payload.id}`)

    return {
      success: true,
      error: 'Supplier updated successfully',
      data: updated as SupplierWithRelations,
    }
  } catch (error) {
    console.error('Error updating supplier:', error)
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') throw new Error('Supplier not found')
      if (error.code === 'P2002') throw new Error('A supplier with this unique field already exists')
      throw new Error(`Database error: ${error.message}`)
    }
    throw new Error(error instanceof Error ? error.message : 'Failed to update supplier. Please try again.')
  }
}

/**
 * Delete supplier (blocks when related purchase orders exist).
 */
export async function deleteSupplier(
  id: string,
  organizationId: string
): Promise<SupplierResponse<null>> {
  try {
    if (!id) throw new Error('Supplier ID is required')
    if (!organizationId) throw new Error('Organization ID is required')

    const supplier = await db.supplier.findFirst({
      where: { id, organizationId },
      select: { id: true, name: true },
    })
    if (!supplier) throw new Error("Supplier not found or you don't have permission to delete it")

    // Block deletion when any purchase orders exist (usually FKs prevent delete)
    const poCount = await db.purchaseOrder.count({
      where: { supplierId: id },
    })
    if (poCount > 0) {
      throw new Error(
        'Cannot delete supplier because related purchase orders exist. Reassign or delete them first.'
      )
    }

    await db.supplier.delete({ where: { id } })

    revalidateTag('suppliers')
    revalidateTag(`suppliers-${organizationId}`)
    revalidateTag(`supplier-${id}`)
    revalidatePath('/dashboard/suppliers')

    return { success: true, error: 'Supplier deleted successfully', data: null }
  } catch (error) {
    console.error('Error deleting supplier:', error)
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') throw new Error('Supplier not found')
      if (error.code === 'P2003')
        throw new Error(
          'Cannot delete supplier due to related records. Remove or reassign them first.'
        )
      throw new Error(`Database error: ${error.message}`)
    }
    throw new Error(error instanceof Error ? error.message : 'Failed to delete supplier. Please try again.')
  }
}

/**
 * Toggle supplier active status.
 */
export async function setSupplierActive(
  id: string,
  organizationId: string,
  isActive: boolean
): Promise<SupplierResponse<SupplierWithRelations>> {
  try {
    if (!id) throw new Error('Supplier ID is required')
    if (!organizationId) throw new Error('Organization ID is required')

    const updated = await db.supplier.update({
      where: { id },
      data: { isActive },
      include: supplierInclude,
    })

    if (!updated || updated.organizationId !== organizationId) {
      throw new Error("Supplier not found or you don't have permission to update it")
    }

    revalidateTag('suppliers')
    revalidateTag(`suppliers-${organizationId}`)
    revalidateTag(`supplier-${id}`)
    revalidatePath('/dashboard/suppliers')

    return { success: true, error: `Supplier ${isActive ? 'activated' : 'deactivated'} successfully`, data: updated as SupplierWithRelations }
  } catch (error) {
    console.error('Error toggling supplier active flag:', error)
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') throw new Error('Supplier not found')
      throw new Error(`Database error: ${error.message}`)
    }
    throw new Error(error instanceof Error ? error.message : 'Failed to update supplier status. Please try again.')
  }
}

/**
 * Upsert links between a supplier and items (ItemSupplier).
 */
export async function linkItemsToSupplier(
  payload: LinkItemsToSupplierDTO
): Promise<SupplierResponse<SupplierWithRelations>> {
  try {
    if (!payload?.supplierId) throw new Error('Supplier ID is required')
    if (!payload?.organizationId) throw new Error('Organization ID is required')
    if (!Array.isArray(payload.items) || payload.items.length === 0) {
      throw new Error('At least one item link is required')
    }

    const supplier = await db.supplier.findFirst({
      where: { id: payload.supplierId, organizationId: payload.organizationId },
      select: { id: true, organizationId: true },
    })
    if (!supplier) throw new Error("Supplier not found or you don't have permission to modify it")

    const itemIds = payload.items.map((i) => i.itemId)
    const items = await db.item.findMany({
      where: { id: { in: itemIds }, organizationId: payload.organizationId },
      select: { id: true },
    })
    if (items.length !== itemIds.length) {
      const existing = new Set(items.map((i) => i.id))
      const missing = itemIds.filter((id) => !existing.has(id))
      throw new Error(`Item(s) not found in your organization: ${missing.join(', ')}`)
    }

    await db.$transaction(async (tx) => {
      for (const link of payload.items) {
        await tx.itemSupplier.upsert({
          where: {
            itemId_supplierId: {
              itemId: link.itemId,
              supplierId: payload.supplierId,
            },
          },
          create: {
            itemId: link.itemId,
            supplierId: payload.supplierId,
            supplierSku: link.supplierSku ?? null,
            supplierName: link.supplierName ?? null,
            isPreferred: link.isPreferred ?? false,
            leadTimeDays: link.leadTimeDays ?? null,
            minOrderQuantity: link.minOrderQuantity ?? null,
            unitCost: link.unitCost ?? null,
            notes: link.notes ?? null,
          },
          update: {
            supplierSku: link.supplierSku ?? undefined,
            supplierName: link.supplierName ?? undefined,
            isPreferred: typeof link.isPreferred === 'boolean' ? link.isPreferred : undefined,
            leadTimeDays: link.leadTimeDays ?? undefined,
            minOrderQuantity: link.minOrderQuantity ?? undefined,
            unitCost: link.unitCost ?? undefined,
            notes: link.notes ?? undefined,
          },
        })
      }
    })

    const result = await db.supplier.findUnique({
      where: { id: payload.supplierId },
      include: supplierInclude,
    })

    revalidateTag('suppliers')
    revalidateTag(`suppliers-${payload.organizationId}`)
    revalidateTag(`supplier-${payload.supplierId}`)
    revalidatePath('/dashboard/suppliers')
    revalidatePath(`/dashboard/suppliers/${payload.supplierId}`)

    return {
      success: true,
      error: 'Items linked to supplier successfully',
      data: result as SupplierWithRelations,
    }
  } catch (error) {
    console.error('Error linking items to supplier:', error)
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') throw new Error('Supplier or item not found')
      if (error.code === 'P2003') throw new Error('Referenced record not found')
      throw new Error(`Database error: ${error.message}`)
    }
    throw new Error(error instanceof Error ? error.message : 'Failed to link items to supplier. Please try again.')
  }
}

/**
 * Unlink an item from a supplier (removes ItemSupplier row).
 */
export async function unlinkItemFromSupplier(
  payload: UnlinkItemFromSupplierDTO
): Promise<SupplierResponse<SupplierWithRelations>> {
  try {
    if (!payload?.supplierId) throw new Error('Supplier ID is required')
    if (!payload?.organizationId) throw new Error('Organization ID is required')
    if (!payload?.itemId) throw new Error('Item ID is required')

    const supplier = await db.supplier.findFirst({
      where: { id: payload.supplierId, organizationId: payload.organizationId },
      select: { id: true },
    })
    if (!supplier) throw new Error("Supplier not found or you don't have permission to modify it")

    await db.itemSupplier.delete({
      where: {
        itemId_supplierId: {
          itemId: payload.itemId,
          supplierId: payload.supplierId,
        },
      },
    })

    const result = await db.supplier.findUnique({
      where: { id: payload.supplierId },
      include: supplierInclude,
    })

    revalidateTag('suppliers')
    revalidateTag(`suppliers-${payload.organizationId}`)
    revalidateTag(`supplier-${payload.supplierId}`)
    revalidatePath('/dashboard/suppliers')
    revalidatePath(`/dashboard/suppliers/${payload.supplierId}`)

    return { success: true, error: 'Item unlinked from supplier', data: result as SupplierWithRelations }
  } catch (error) {
    console.error('Error unlinking item from supplier:', error)
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') throw new Error('Supplier or item link not found')
      throw new Error(`Database error: ${error.message}`)
    }
    throw new Error(error instanceof Error ? error.message : 'Failed to unlink item. Please try again.')
  }
}

/**
 * Summary for suppliers (optional helper).
 * - total suppliers
 * - active vs inactive
 * - suppliers with preferred items
 * - suppliers with open purchase orders
 */
export async function getSuppliersSummary(organizationId: string) {
  try {
    if (!organizationId) throw new Error('Organization ID is required')

    const [total, active, inactive, withPreferred, withOpenPOs] = await Promise.all([
      db.supplier.count({ where: { organizationId } }),
      db.supplier.count({ where: { organizationId, isActive: true } }),
      db.supplier.count({ where: { organizationId, isActive: false } }),
      db.itemSupplier.count({ where: { supplier: { organizationId }, isPreferred: true } }),
      db.supplier.count({
        where: {
          organizationId,
          purchaseOrders: {
            some: {
              status: { notIn: [PurchaseOrderStatus.CANCELLED, PurchaseOrderStatus.COMPLETED] },
            },
          },
        },
      }),
    ])

    return {
      total,
      active,
      inactive,
      withPreferredItems: withPreferred,
      withOpenPurchaseOrders: withOpenPOs,
    }
  } catch (error) {
    console.error('Error fetching suppliers summary:', error)
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch suppliers summary')
  }
}
