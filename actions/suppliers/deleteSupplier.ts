


'use server'

import { db } from '@/prisma/db'
// import { db } from '@/prisma/db'
// import { supplierInclude } from '@/lib/suppliers/includes'
import {
  type SupplierResponse
} from '@/types/supplier'
import { Prisma } from '@prisma/client'
import { revalidatePath, revalidateTag } from 'next/cache'


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

    return { success: true, message: 'Supplier deleted successfully', data: null }
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
