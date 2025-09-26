'use server'

import { supplierInclude } from '@/lib/supplier/include'
import { db } from '@/prisma/db'
// import { db } from '@/lib/db'
// import { supplierInclude } from '@/lib/suppliers/includes'
import type {
  SupplierWithRelations
} from '@/types/supplier'
import { Prisma } from '@prisma/client'

/**
 * Fetch one supplier by ID (optionally scoped by organization).
 */
export async function getSupplierById(id: string, organizationId?: string): Promise<SupplierWithRelations> {
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
