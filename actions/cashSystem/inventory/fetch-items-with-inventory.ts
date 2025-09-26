"use server"

import type { FetchItemsParams, FetchItemsResponse, ItemWithInventory } from "@/lib/types"
import { db } from "@/prisma/db"

export async function fetchItemsWithInventoryLevels({
  locationId,
  organizationId,
  categoryId,
  brandId,
  isActive = true,
  trackInventory,
  search,
  skip = 0,
  take = 50,
  orderBy = "name",
  orderDirection = "asc",
}: FetchItemsParams): Promise<FetchItemsResponse> {
  try {
    // Validate required parameters
    if (!locationId || !organizationId) {
      throw new Error("locationId and organizationId are required")
    }

    const filteredItems = db.mockData.items.filter((item) => {
      if (item.organizationId !== organizationId) return false
      if (item.isActive !== isActive) return false
      if (categoryId && item.categoryId !== categoryId) return false
      if (brandId && item.brandId !== brandId) return false
      if (trackInventory !== undefined && item.trackInventory !== trackInventory) return false

      // Search functionality
      if (search) {
        const searchLower = search.toLowerCase()
        return (
          item.name.toLowerCase().includes(searchLower) ||
          item.sku.toLowerCase().includes(searchLower) ||
          (item.barcode && item.barcode.toLowerCase().includes(searchLower)) ||
          (item.description && item.description.toLowerCase().includes(searchLower))
        )
      }

      return true
    })

    filteredItems.sort((a, b) => {
      let aValue: any, bValue: any

      if (orderBy === "quantityOnHand") {
        const aInventory = db.mockData.inventoryLevels.find(
          (inv) => inv.itemId === a.id && inv.locationId === locationId,
        )
        const bInventory = db.mockData.inventoryLevels.find(
          (inv) => inv.itemId === b.id && inv.locationId === locationId,
        )
        aValue = aInventory?.quantityOnHand || 0
        bValue = bInventory?.quantityOnHand || 0
      } else {
        aValue = a[orderBy as keyof typeof a]
        bValue = b[orderBy as keyof typeof b]
      }

      if (orderDirection === "desc") {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      } else {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      }
    })

    const totalCount = filteredItems.length
    const paginatedItems = filteredItems.slice(skip, skip + take)

    // Transform the data to match our interface
    const transformedItems: ItemWithInventory[] = paginatedItems.map((item) => {
      const category = db.mockData.categories.find((c) => c.id === item.categoryId)
      const brand = db.mockData.brands.find((b) => b.id === item.brandId)
      const unit = db.mockData.units.find((u) => u.id === item.unitId)
      const taxRate = db.mockData.taxRates.find((t) => t.id === item.taxRateId)
      const inventoryLevel = db.mockData.inventoryLevels.find(
        (inv) => inv.itemId === item.id && inv.locationId === locationId,
      )
      const location = db.mockData.locations.find((l) => l.id === locationId)

      return {
        id: item.id,
        name: item.name,
        slug: item.slug,
        sku: item.sku,
        barcode: item.barcode,
        description: item.description,
        imageUrls: item.imageUrls,
        thumbnail: item.thumbnail,
        dimensions: item.dimensions,
        weight: item.weight,
        costPrice: item.costPrice,
        sellingPrice: item.sellingPrice,
        trackInventory: item.trackInventory,
        minStockLevel: item.minStockLevel,
        maxStockLevel: item.maxStockLevel,
        reorderLevel: item.reorderLevel,
        reorderQuantity: item.reorderQuantity,
        isActive: item.isActive,
        isDiscontinued: item.isDiscontinued,
        category: category
          ? {
              id: category.id,
              title: category.title,
              slug: category.slug,
            }
          : null,
        brand: brand
          ? {
              id: brand.id,
              brandName: brand.brandName,
              slug: brand.slug,
            }
          : null,
        unit: unit
          ? {
              id: unit.id,
              name: unit.name,
              symbol: unit.symbol,
            }
          : null,
        taxRate: taxRate
          ? {
              id: taxRate.id,
              taxRateName: taxRate.taxRateName,
              rate: taxRate.rate,
            }
          : null,
        inventoryLevel:
          inventoryLevel && location
            ? {
                id: inventoryLevel.id,
                quantityOnHand: inventoryLevel.quantityOnHand,
                quantityReserved: inventoryLevel.quantityReserved,
                quantityAvailable: inventoryLevel.quantityOnHand - inventoryLevel.quantityReserved,
                quantityInTransit: inventoryLevel.quantityInTransit,
                quantityOnOrder: inventoryLevel.quantityOnOrder,
                reorderPoint: inventoryLevel.reorderPoint,
                averageCost: inventoryLevel.averageCost,
                totalValue: inventoryLevel.quantityOnHand * inventoryLevel.averageCost,
                location: {
                  id: location.id,
                  name: location.name,
                  type: location.type,
                },
                lastTransactionAt: inventoryLevel.lastTransactionAt,
              }
            : null,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      }
    })

    const hasMore = skip + take < totalCount

    return {
      items: transformedItems,
      totalCount,
      hasMore,
    }
  } catch (error) {
    console.error("Error fetching items with inventory levels:", error)
    throw new Error("Failed to fetch items with inventory levels")
  }
}

// Additional helper function to fetch a single item with inventory
export async function fetchItemWithInventoryLevel(
  itemId: string,
  locationId: string,
  organizationId: string,
): Promise<ItemWithInventory | null> {
  try {
    const item = await db.item.findFirst({
      where: {
        id: itemId,
        organizationId,
      },
      include: {
        category: true,
        brand: true,
        unit: true,
        taxRate: true,
        inventoryLevels: {
          where: { locationId },
        },
      },
    })

    if (!item) {
      return null
    }

    return {
      id: item.id,
      name: item.name,
      slug: item.slug,
      sku: item.sku,
      barcode: item.barcode,
      description: item.description,
      imageUrls: item.imageUrls,
      thumbnail: item.thumbnail,
      dimensions: item.dimensions,
      weight: item.weight,
      costPrice: item.costPrice,
      sellingPrice: item.sellingPrice,
      trackInventory: item.trackInventory,
      minStockLevel: item.minStockLevel,
      maxStockLevel: item.maxStockLevel,
      reorderLevel: item.reorderLevel,
      reorderQuantity: item.reorderQuantity,
      isActive: item.isActive,
      isDiscontinued: item.isDiscontinued,
      category: item.category,
      brand: item.brand,
      unit: item.unit,
      taxRate: item.taxRate,
      inventoryLevel: item.inventoryLevels.length > 0 ? item.inventoryLevels[0] : null,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }
  } catch (error) {
    console.error("Error fetching item with inventory level:", error)
    throw new Error("Failed to fetch item with inventory level")
  }
}

export async function updateInventoryLevels(
  updates: Array<{
    itemId: string
    locationId: string
    quantityChange: number
  }>,
) {
  try {
    for (const update of updates) {
      const inventoryLevel = db.mockData.inventoryLevels.find(
        (inv) => inv.itemId === update.itemId && inv.locationId === update.locationId,
      )

      if (inventoryLevel) {
        inventoryLevel.quantityOnHand += update.quantityChange
        inventoryLevel.quantityAvailable = inventoryLevel.quantityOnHand - inventoryLevel.quantityReserved
        inventoryLevel.totalValue = inventoryLevel.quantityOnHand * inventoryLevel.averageCost
        inventoryLevel.lastTransactionAt = new Date()
      }
    }

    return { success: true }
  } catch (error) {
    console.error("Error updating inventory levels:", error)
    throw new Error("Failed to update inventory levels")
  }
}

export async function createInventoryTransactions(
  transactions: Array<{
    itemId: string
    locationId: string
    transactionType: string
    quantity: number
    reference: string
    notes?: string
  }>,
) {
  try {
    for (const transaction of transactions) {
      const newTransaction = {
        id: `inv_trans_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        itemId: transaction.itemId,
        locationId: transaction.locationId,
        transactionType: transaction.transactionType,
        quantity: transaction.quantity,
        reference: transaction.reference,
        notes: transaction.notes,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      db.mockData.inventoryTransactions.push(newTransaction)
    }

    return { success: true }
  } catch (error) {
    console.error("Error creating inventory transactions:", error)
    throw new Error("Failed to create inventory transactions")
  }
}
