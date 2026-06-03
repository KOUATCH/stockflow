"use server"

import { supplierInclude } from "@/lib/supplier/include"
import { db } from "@/prisma/db"
import type { SupplierResponse, SupplierWithRelations } from "@/types/supplier"
// import { db } from '@/prisma/db'
// import { supplierInclude } from '@/lib/suppliers/includes'
import type { Prisma } from "@prisma/client"

function itemDisplayName(item: { nameEn?: string | null; nameFr?: string | null; sku?: string | null }) {
  return item.nameEn ?? item.nameFr ?? item.sku ?? "Unnamed item"
}

function mapSupplierWithItemNames(
  supplier: Prisma.SupplierGetPayload<{ include: typeof supplierInclude }>
): SupplierWithRelations {
  return {
    ...supplier,
    supplierItems: supplier.supplierItems.map((supplierItem) => ({
      ...supplierItem,
      item: {
        ...supplierItem.item,
        name: itemDisplayName(supplierItem.item),
      },
    })),
  }
}

/**
 * Fetch suppliers by organization ID.
 */
export async function getSuppliersByOrgId(organizationId?: string): Promise<SupplierResponse<SupplierWithRelations[]>> {
  try {
    if (!organizationId) throw new Error("organization ID is required")
    const where: Prisma.SupplierWhereInput = { organizationId }
    if (organizationId) where.organizationId = organizationId

    const suppliers = await db.supplier.findMany({
      where,
      include: supplierInclude,
    })
    if (!suppliers) {
      throw new Error("Suppliers not found")
    }
    return {
      data: suppliers.map(mapSupplierWithItemNames),
      success: true,
      error: null,
    }
  } catch (error) {
    console.error("Error fetching supplier:", error)
    return {
      data: [],
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch supplier",
    }
  }
}
