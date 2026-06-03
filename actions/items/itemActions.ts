"use server"

import { db } from "@/prisma/db"
import { getAuthenticatedUser } from "@/lib/auth-server"

export interface AvailableProduct {
  id: string
  name: string
  sku: string
  description?: string
  category?: string
  brand?: string
  unitPrice: number
  stockQuantity: number
  isActive: boolean
}

export async function getAvailableProducts(activeOnly: boolean = true): Promise<AvailableProduct[]> {
  try {
    const user = await getAuthenticatedUser()

    if (!user) {
      throw new Error("Unauthorized")
    }

    const items = await db.item.findMany({
      where: {
        organizationId: user.organizationId,
        isActive: activeOnly ? true : undefined
      },
      select: {
        id: true,
        nameEn: true,
        sku: true,
        descriptionEn: true,
        sellingPrice: true,
        isActive: true,
        category: {
          select: {
            titleEn: true
          }
        },
        brand: {
          select: {
            nameEn: true
          }
        },
        inventoryLevels: {
          select: {
            quantityOnHand: true
          },
          take: 1
        }
        // Exclude imageUrls to avoid schema inconsistency
        // imageUrls: true
      },
      orderBy: {
        nameEn: 'asc'
      }
    })

    const transformedItems: AvailableProduct[] = items.map(item => ({
      id: item.id,
      name: item.nameEn,
      sku: item.sku,
      description: item.descriptionEn ?? undefined,
      category: item.category?.titleEn,
      brand: item.brand?.nameEn,
      unitPrice: Number(item.sellingPrice),
      stockQuantity: Number(item.inventoryLevels[0]?.quantityOnHand ?? 0),
      isActive: item.isActive
    }))

    return transformedItems

  } catch (error: any) {
    console.error("Error fetching available products:", error)
    throw new Error("Failed to fetch available products")
  }
}

export async function getItem(id: string): Promise<AvailableProduct | null> {
  try {
    const user = await getAuthenticatedUser()

    if (!user) {
      throw new Error("Unauthorized")
    }

    const item = await db.item.findUnique({
      where: {
        id: id,
        organizationId: user.organizationId
      },
      select: {
        id: true,
        nameEn: true,
        sku: true,
        descriptionEn: true,
        sellingPrice: true,
        isActive: true,
        category: {
          select: {
            titleEn: true
          }
        },
        brand: {
          select: {
            nameEn: true
          }
        },
        inventoryLevels: {
          select: {
            quantityOnHand: true
          },
          take: 1
        }
        // Exclude imageUrls to avoid schema inconsistency
        // imageUrls: true
      }
    })

    if (!item) {
      return null
    }

    return {
      id: item.id,
      name: item.nameEn,
      sku: item.sku,
      description: item.descriptionEn ?? undefined,
      category: item.category?.titleEn,
      brand: item.brand?.nameEn,
      unitPrice: Number(item.sellingPrice),
      stockQuantity: Number(item.inventoryLevels[0]?.quantityOnHand ?? 0),
      isActive: item.isActive
    }

  } catch (error: any) {
    console.error("Error fetching item:", error)
    throw new Error("Failed to fetch item")
  }
}
