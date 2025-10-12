
'use server'

import { supplierInclude } from '@/lib/supplier/include'
import { db } from '@/prisma/db'
// import { db } from '@/prisma/db'
// import { supplierInclude } from '@/lib/suppliers/includes'
import {
  LinkItemsToSupplierDTO,
  type SupplierResponse,
  type SupplierWithRelations
} from '@/types/supplier'
import { Prisma } from '@prisma/client'
import { revalidatePath, revalidateTag } from 'next/cache'
// import { db } from '@/prisma/db'
// import { supplierInclude } from '@/lib/suppliers/includes'


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
      message: 'Items linked to supplier successfully',
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
