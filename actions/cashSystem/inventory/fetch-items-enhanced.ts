"use server"

import { db } from "@/prisma/db"

export interface ItemWithInventory {
  id: string
  name: string
  slug: string
  sku: string
  barcode: string | null
  description: string | null
  imageUrls: string
  thumbnail: string | null

  // Physical properties
  dimensions: string | null
  weight: number | null

  // Pricing
  costPrice: number
  sellingPrice: number

  // Inventory settings
  trackInventory: boolean
  minStockLevel: number
  maxStockLevel: number | null
  reorderLevel: number
  reorderQuantity: number | null

  // Status
  isActive: boolean
  isDiscontinued: boolean

  // Relationships
  category: {
    id: string
    title: string
    slug: string
  } | null
  brand: {
    id: string
    brandName: string
    slug: string
  } | null
  unit: {
    id: string
    name: string
    symbol: string
  } | null
  taxRate: {
    id: string
    taxRateName: string
    rate: number
  } | null

  // Inventory level for the specific location
  inventoryLevel: {
    id: string
    quantityOnHand: number
    quantityReserved: number
    quantityAvailable: number
    quantityInTransit: number
    quantityOnOrder: number
    reorderPoint: number
    averageCost: number
    totalValue: number
    location: {
      id: string
      name: string
      type: string
    }
    lastTransactionAt: Date | null
  } | null

  createdAt: Date
  updatedAt: Date
}

export interface FetchItemsParams {
  locationId: string
  organizationId: string
  // Optional filters
  categoryId?: string
  brandId?: string
  isActive?: boolean
  trackInventory?: boolean
  search?: string
  // Pagination
  skip?: number
  take?: number
  // Sorting
  orderBy?: "name" | "sku" | "createdAt" | "updatedAt" | "quantityOnHand"
  orderDirection?: "asc" | "desc"
}

export interface FetchItemsResponse {
  items: ItemWithInventory[]
  totalCount: number
  hasMore: boolean
}

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

    // Build the where clause
    const whereClause: any = {
      organizationId,
      isActive,
      ...(categoryId && { categoryId }),
      ...(brandId && { brandId }),
      ...(trackInventory !== undefined && { trackInventory }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { sku: { contains: search, mode: "insensitive" } },
          { barcode: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      }),
    }

    // Build the orderBy clause
    let orderByClause: any = {}

    if (orderBy === "quantityOnHand") {
      // Special handling for inventory level ordering
      orderByClause = {
        inventoryLevels: {
          _count: orderDirection,
        },
      }
    } else {
      orderByClause = {
        [orderBy]: orderDirection,
      }
    }

    // Execute the query with count
    const items = db.items.filter((item) => {
      if (item.organizationId !== organizationId) return false
      if (item.isActive !== isActive) return false
      if (categoryId && item.categoryId !== categoryId) return false
      if (brandId && item.brandId !== brandId) return false
      if (trackInventory !== undefined && item.trackInventory !== trackInventory) return false

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

    // Apply sorting
    items.sort((a, b) => {
      const aValue = a[orderBy as keyof typeof a]
      const bValue = b[orderBy as keyof typeof b]

      if (orderDirection === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

    const totalCount = items.length
    const paginatedItems = items.slice(skip, skip + take)

    // Transform items to include inventory levels
    const transformedItems: ItemWithInventory[] = paginatedItems.map((item) => {
      const inventoryLevel = db.inventoryLevels.find(
        (level) => level.itemId === item.id && level.locationId === locationId,
      )

      const location = db.locations.find((loc) => loc.id === locationId)
      const category = item.categoryId ? db.categories.find((cat) => cat.id === item.categoryId) : null
      const brand = item.brandId ? db.brands.find((br) => br.id === item.brandId) : null
      const unit = item.unitId ? db.units.find((u) => u.id === item.unitId) : null
      const taxRate = item.taxRateId ? db.taxRates.find((tr) => tr.id === item.taxRateId) : null

      return {
        ...item,
        category: category
          ? {
              id: category.id,
              title: category.name,
              slug: category.slug,
            }
          : null,
        brand: brand
          ? {
              id: brand.id,
              brandName: brand.name,
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
              taxRateName: taxRate.name,
              rate: taxRate.rate,
            }
          : null,
        inventoryLevel:
          inventoryLevel && location
            ? {
                id: inventoryLevel.id,
                quantityOnHand: inventoryLevel.quantityOnHand,
                quantityReserved: inventoryLevel.quantityReserved,
                quantityAvailable: inventoryLevel.quantityAvailable,
                quantityInTransit: inventoryLevel.quantityInTransit,
                quantityOnOrder: inventoryLevel.quantityOnOrder,
                reorderPoint: inventoryLevel.reorderPoint,
                averageCost: inventoryLevel.averageCost,
                totalValue: inventoryLevel.totalValue,
                location: {
                  id: location.id,
                  name: location.name,
                  type: location.type,
                },
                lastTransactionAt: inventoryLevel.lastTransactionAt,
              }
            : null,
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
    const item = db.items.find((item) => item.id === itemId && item.organizationId === organizationId)

    if (!item) {
      return null
    }

    const inventoryLevel = db.inventoryLevels.find(
      (level) => level.itemId === itemId && level.locationId === locationId,
    )

    const location = db.locations.find((loc) => loc.id === locationId)
    const category = item.categoryId ? db.categories.find((cat) => cat.id === item.categoryId) : null
    const brand = item.brandId ? db.brands.find((br) => br.id === item.brandId) : null
    const unit = item.unitId ? db.units.find((u) => u.id === item.unitId) : null
    const taxRate = item.taxRateId ? db.taxRates.find((tr) => tr.id === item.taxRateId) : null

    return {
      ...item,
      category: category
        ? {
            id: category.id,
            title: category.name,
            slug: category.slug,
          }
        : null,
      brand: brand
        ? {
            id: brand.id,
            brandName: brand.name,
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
            taxRateName: taxRate.name,
            rate: taxRate.rate,
          }
        : null,
      inventoryLevel:
        inventoryLevel && location
          ? {
              id: inventoryLevel.id,
              quantityOnHand: inventoryLevel.quantityOnHand,
              quantityReserved: inventoryLevel.quantityReserved,
              quantityAvailable: inventoryLevel.quantityAvailable,
              quantityInTransit: inventoryLevel.quantityInTransit,
              quantityOnOrder: inventoryLevel.quantityOnOrder,
              reorderPoint: inventoryLevel.reorderPoint,
              averageCost: inventoryLevel.averageCost,
              totalValue: inventoryLevel.totalValue,
              location: {
                id: location.id,
                name: location.name,
                type: location.type,
              },
              lastTransactionAt: inventoryLevel.lastTransactionAt,
            }
          : null,
    }
  } catch (error) {
    console.error("Error fetching item with inventory level:", error)
    throw new Error("Failed to fetch item with inventory level")
  }
}
