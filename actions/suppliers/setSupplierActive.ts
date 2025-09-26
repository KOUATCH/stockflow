

'use server'

import { supplierInclude } from '@/lib/supplier/include'
import { db } from '@/prisma/db'
// import { db } from '@/lib/db'
// import { supplierInclude } from '@/lib/suppliers/includes'
import {
  type SupplierResponse,
  type SupplierWithRelations
} from '@/types/supplier'
import { Prisma } from '@prisma/client'
import { revalidatePath, revalidateTag } from 'next/cache'

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

    return { success: true, message: `Supplier ${isActive ? 'activated' : 'deactivated'} successfully`, data: updated as SupplierWithRelations }
  } catch (error) {
    console.error('Error toggling supplier active flag:', error)
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') throw new Error('Supplier not found')
      throw new Error(`Database error: ${error.message}`)
    }
    throw new Error(error instanceof Error ? error.message : 'Failed to update supplier status. Please try again.')
  }
}
