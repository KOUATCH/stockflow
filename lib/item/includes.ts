import type { Prisma } from '@prisma/client'

export const itemStandardInclude = {
  brand: {
    select: {
      id: true,
      brandName: true,
    },
  },
  category: {
    select: {
      id: true,
      title: true,
    },
  },
  unit: {
    select: {
      id: true,
      name: true,
    },
  },
  taxRate: {
    select: {
      id: true,
      taxRateName: true,
      rate: true,
    },
  },
} satisfies Prisma.ItemInclude

// Centralized include for consistent PO shape
export const purchaseOrderInclude = {
  supplier: {
    select: { id: true, name: true, email: true, phone: true, contactPerson: true },
  },
  location: {
    select: { id: true, name: true, address: true },
  },
  createdBy: {
    select: { id: true, name: true, email: true },
  },
  approvedBy: {
    select: { id: true, name: true, email: true },
  },
  lines: {
    select: {
      id: true,
      itemId: true,
      orderedQuantity: true,
      receivedQuantity: true,
      unitCost: true,
      discount: true,
      taxRate: true,
      taxAmount: true,
      lineTotal: true,
      notes: true,
      item: {
        select: {
          id: true,
          name: true,
          sku: true,
        },
      },
    },
  },
} satisfies Prisma.PurchaseOrderInclude
