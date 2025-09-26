
'use server'

import { db } from '@/prisma/db'
// import { db } from '@/lib/db'
// import { supplierInclude } from '@/lib/suppliers/includes'
import { PurchaseOrderStatus } from '@prisma/client'
// import { db } from '@/lib/db'
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