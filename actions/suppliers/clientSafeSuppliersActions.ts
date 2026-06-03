"use server"

import { auth } from "@/auth"
import { db } from "@/prisma/db"

/**
 * Client-safe supplier actions that don't use getAuthenticatedUser()
 */

export async function getOrgSuppliersClientSafe(organizationId?: string) {
  try {
    const session = await auth()

    if (!session?.user) {
      return { success: false, error: "Not authenticated", data: [] }
    }

    const userOrgId = organizationId || session.user.organizationId

    if (!userOrgId) {
      return { success: false, error: "No organization ID", data: [] }
    }

    const suppliers = await db.supplier.findMany({
      where: {
        organizationId: userOrgId,
      },
      orderBy: {
        name: 'asc',
      },
      select: {
        id: true,
        name: true,
        code: true,
        contactPerson: true,
        email: true,
        phone: true,
        address: true,
        city: true,
        state: true,
        zipCode: true,
        country: true,
        taxId: true,
        paymentTerms: true,
        creditLimit: true,
        notes: true,
        isActive: true,
        organizationId: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            purchaseOrders: true,
            supplierItems: true,
            ledgerEntries: true,
          },
        },
      },
    })

    return {
      success: true,
      data: suppliers.map((supplier) => ({
        ...supplier,
        _count: {
          ...supplier._count,
          payables: supplier._count.ledgerEntries,
        },
      })),
      error: null
    }
  } catch (error) {
    console.error("Error fetching suppliers:", error)
    return {
      success: false,
      error: "Failed to fetch suppliers",
      data: []
    }
  }
}

export async function getSupplierByIdClientSafe(supplierId: string, organizationId?: string) {
  try {
    const session = await auth()

    if (!session?.user) {
      return { success: false, error: "Not authenticated", data: null }
    }

    const userOrgId = organizationId || session.user.organizationId

    if (!userOrgId) {
      return { success: false, error: "No organization ID", data: null }
    }

    const supplier = await db.supplier.findFirst({
      where: {
        id: supplierId,
        organizationId: userOrgId,
      },
      include: {
        purchaseOrders: {
          take: 10,
          orderBy: {
            createdAt: 'desc',
          },
        },
        supplierItems: {
          include: {
            item: {
              select: {
                id: true,
                nameEn: true,
                nameFr: true,
                sku: true,
              },
            },
          },
          take: 10,
        },
        _count: {
          select: {
            purchaseOrders: true,
            supplierItems: true,
            ledgerEntries: true,
          },
        },
      },
    })

    if (!supplier) {
      return { success: false, error: "Supplier not found", data: null }
    }

    return {
      success: true,
      data: {
        ...supplier,
        supplierItems: supplier.supplierItems.map((supplierItem) => ({
          ...supplierItem,
          item: {
            ...supplierItem.item,
            name: supplierItem.item.nameEn ?? supplierItem.item.nameFr ?? "",
          },
        })),
        _count: {
          ...supplier._count,
          payables: supplier._count.ledgerEntries,
        },
      },
      error: null
    }
  } catch (error) {
    console.error("Error fetching supplier:", error)
    return {
      success: false,
      error: "Failed to fetch supplier",
      data: null
    }
  }
}
