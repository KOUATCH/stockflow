'use server'

import { supplierInclude } from '@/lib/supplier/include'
import { db } from '@/prisma/db'
// import { db } from '@/prisma/db'
// import { supplierInclude } from '@/lib/suppliers/includes'
import {
  UnlinkItemFromSupplierDTO,
  type SupplierResponse,
  type SupplierWithRelations
} from '@/types/supplier'
import { Prisma } from '@prisma/client'
import { revalidatePath, revalidateTag } from 'next/cache'
// import { db } from '@/prisma/db'
// import { supplierInclude } from '@/lib/suppliers/includes'


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

    return { success: true, message: 'Item unlinked from supplier', data: result as SupplierWithRelations }
  } catch (error) {
    console.error('Error unlinking item from supplier:', error)
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') throw new Error('Supplier or item link not found')
      throw new Error(`Database error: ${error.message}`)
    }
    throw new Error(error instanceof Error ? error.message : 'Failed to unlink item. Please try again.')
  }
}
