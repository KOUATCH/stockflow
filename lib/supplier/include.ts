import { Prisma } from '@prisma/client'

export const supplierInclude = {
  _count: {
    select: {
      purchaseOrders: true,
      supplierItems: true,
    },
  },
  supplierItems: {
    include: {
      item: {
        select: {
          id: true,
          name: true,
          sku: true,
          costPrice: true,
          isActive: true,
        },
      },
    },
  },
} satisfies Prisma.SupplierInclude

export function purchaseOrderQueryKey(id: string, organizationId?: string) {
  return ["purchase-order", id, organizationId] as const
}