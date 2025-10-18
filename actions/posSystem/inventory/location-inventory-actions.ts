"use server"

import { auth } from "@/auth"
import { prisma } from "@/prisma/db"
import { revalidatePath } from "next/cache"
import { checkPermission, checkAnyPermission } from "@/config/useAuth"
import { PERMISSIONS } from "@/lib/permissions"

export interface LocationInventoryItem {
  id: string
  itemId: string
  locationId: string
  name: string
  sku: string
  barcode?: string
  price: number
  cost?: number
  categoryId: string
  categoryName: string
  brandId?: string
  brandName?: string
  imageUrl?: string
  description?: string

  // Location-specific inventory data
  currentStock: number
  availableStock: number // currentStock - reserved
  reservedStock: number
  reorderPoint: number
  maxStock: number
  minStock: number

  // Location-specific pricing
  locationPrice?: number // Override default price for this location
  promotionalPrice?: number
  promotionStartDate?: Date
  promotionEndDate?: Date

  // Status
  isActive: boolean
  isDiscontinued: boolean
  lastRestocked?: Date
  lastSold?: Date
}

export interface LocationInventoryFilters {
  categoryId?: string
  brandId?: string
  searchTerm?: string
  inStock?: boolean
  lowStock?: boolean
  isActive?: boolean
  priceRange?: {
    min: number
    max: number
  }
}

export async function getLocationInventory(
  locationId: string,
  filters?: LocationInventoryFilters
): Promise<LocationInventoryItem[]> {
  try {
    // Check permissions
    await checkAnyPermission([
      PERMISSIONS.READ_ITEMS,
      PERMISSIONS.OPERATE_POS,
      PERMISSIONS.VIEW_INVENTORY_REPORTS
    ])

    const session = await auth()
    if (!session?.user?.organizationId) {
      throw new Error("Unauthorized")
    }

    // Build where clause based on filters
    const whereClause: any = {
      locationId: locationId,
      item: {
        organizationId: session.user.organizationId,
        isActive: filters?.isActive !== undefined ? filters.isActive : true
      }
    }

    // Add additional filters
    if (filters?.categoryId) {
      whereClause.item.categoryId = filters.categoryId
    }

    if (filters?.brandId) {
      whereClause.item.brandId = filters.brandId
    }

    if (filters?.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase()
      whereClause.item.OR = [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { sku: { contains: searchTerm, mode: 'insensitive' } },
        { barcode: { contains: searchTerm, mode: 'insensitive' } }
      ]
    }

    // Add stock filters
    if (filters?.inStock === true) {
      whereClause.quantityAvailable = { gt: 0 }
    } else if (filters?.inStock === false) {
      whereClause.quantityAvailable = { lte: 0 }
    }

    if (filters?.lowStock === true) {
      // Use raw SQL for this comparison since Prisma doesn't support field comparisons directly
      whereClause.AND = [
        {
          OR: [
            { quantityOnHand: { lte: 5 } }, // Fallback for items without reorder point
            { reorderPoint: { gt: 0 } } // Will be further filtered in application logic
          ]
        }
      ]
    }

    // Get inventory levels with item details
    const inventoryLevels = await prisma.inventoryLevel.findMany({
      where: whereClause,
      include: {
        item: {
          include: {
            category: true,
            brand: true
          }
        }
      },
      orderBy: {
        item: {
          name: 'asc'
        }
      }
    })

    // Convert to our expected format
    const locationInventory: LocationInventoryItem[] = inventoryLevels.map(level => {
      const item = level.item
      const effectivePrice = item.sellingPrice

      return {
        id: level.id,
        itemId: item.id,
        locationId: level.locationId,
        name: item.name,
        sku: item.sku,
        barcode: item.barcode || undefined,
        price: effectivePrice,
        cost: item.costPrice || undefined,
        categoryId: item.categoryId || '',
        categoryName: item.category?.title || 'Uncategorized',
        brandId: item.brandId || undefined,
        brandName: item.brand?.brandName || undefined,
        imageUrl: item.imageUrls || undefined,
        description: item.description || undefined,

        // Location-specific inventory data
        currentStock: level.quantityOnHand,
        availableStock: level.quantityAvailable,
        reservedStock: level.quantityReserved,
        reorderPoint: level.reorderPoint,
        maxStock: item.maxStockLevel || 0,
        minStock: item.minStockLevel,

        // Status
        isActive: item.isActive,
        isDiscontinued: item.isDiscontinued,
        lastRestocked: level.lastCountDate,
        lastSold: level.lastTransactionAt
      }
    })

    // Apply filters that require application logic
    let filteredInventory = locationInventory

    // Apply low stock filter after fetching data
    if (filters?.lowStock === true) {
      filteredInventory = filteredInventory.filter(item =>
        item.currentStock <= item.reorderPoint
      )
    }

    // Apply price range filter
    if (filters?.priceRange) {
      filteredInventory = filteredInventory.filter(item => {
        const price = item.price
        return price >= filters.priceRange!.min && price <= filters.priceRange!.max
      })
    }

    return filteredInventory
  } catch (error) {
    console.error("Error fetching location inventory:", error)
    throw new Error("Failed to fetch location inventory")
  }
}

export async function getLocationCategories(locationId: string) {
  try {
    // Check permissions
    await checkAnyPermission([
      PERMISSIONS.READ_CATEGORIES,
      PERMISSIONS.READ_ITEMS,
      PERMISSIONS.OPERATE_POS
    ])

    const session = await auth()
    if (!session?.user?.organizationId) {
      throw new Error("Unauthorized")
    }

    // Get categories that have items in this location
    const categoriesWithItems = await prisma.category.findMany({
      where: {
        organizationId: session.user.organizationId,
        isActive: true,
        items: {
          some: {
            inventoryLevels: {
              some: {
                locationId: locationId
              }
            }
          }
        }
      },
      include: {
        _count: {
          select: {
            items: {
              where: {
                inventoryLevels: {
                  some: {
                    locationId: locationId
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        title: 'asc'
      }
    })

    return categoriesWithItems.map(category => ({
      id: category.id,
      name: category.title,
      itemCount: category._count.items
    }))
  } catch (error) {
    console.error("Error fetching location categories:", error)
    throw new Error("Failed to fetch location categories")
  }
}

export async function updateLocationStock(
  locationId: string,
  itemId: string,
  adjustment: number,
  reason: string
): Promise<boolean> {
  try {
    // Check permissions
    await checkPermission(PERMISSIONS.MANAGE_INVENTORY_LEVELS)

    const session = await auth()
    if (!session?.user?.organizationId) {
      throw new Error("Unauthorized")
    }

    // Update inventory level
    await prisma.inventoryLevel.upsert({
      where: {
        itemId_locationId: {
          itemId: itemId,
          locationId: locationId
        }
      },
      update: {
        quantityOnHand: {
          increment: adjustment
        },
        quantityAvailable: {
          increment: adjustment
        },
        lastTransactionAt: new Date()
      },
      create: {
        itemId: itemId,
        locationId: locationId,
        quantityOnHand: Math.max(0, adjustment),
        quantityAvailable: Math.max(0, adjustment),
        lastTransactionAt: new Date()
      }
    })

    // Create inventory transaction record
    await prisma.inventoryTransaction.create({
      data: {
        type: adjustment > 0 ? 'ADJUSTMENT_IN' : 'ADJUSTMENT_OUT',
        quantity: Math.abs(adjustment),
        notes: reason,
        itemId: itemId,
        locationId: locationId,
        organizationId: session.user.organizationId,
        createdById: session.user.id,
        balanceAfter: 0, // Will be calculated by trigger
        referenceType: 'MANUAL'
      }
    })

    revalidatePath(`/dashboard/pos-system`)
    return true
  } catch (error) {
    console.error("Error updating location stock:", error)
    throw new Error("Failed to update location stock")
  }
}

export async function reserveLocationStock(
  locationId: string,
  itemId: string,
  quantity: number,
  sessionId: string
): Promise<boolean> {
  try {
    const session = await auth()
    if (!session?.user?.organizationId) {
      throw new Error("Unauthorized")
    }

    // Mock implementation - would reserve stock in database
    console.log(`Reserving ${quantity} units of item ${itemId} at location ${locationId} for session ${sessionId}`)

    return true
  } catch (error) {
    console.error("Error reserving location stock:", error)
    throw new Error("Failed to reserve location stock")
  }
}

export async function releaseLocationStock(
  locationId: string,
  itemId: string,
  quantity: number,
  sessionId: string
): Promise<boolean> {
  try {
    const session = await auth()
    if (!session?.user?.organizationId) {
      throw new Error("Unauthorized")
    }

    // Mock implementation - would release reserved stock in database
    console.log(`Releasing ${quantity} units of item ${itemId} at location ${locationId} for session ${sessionId}`)

    return true
  } catch (error) {
    console.error("Error releasing location stock:", error)
    throw new Error("Failed to release location stock")
  }
}