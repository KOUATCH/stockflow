'use server'

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

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
    // lastCountDate: Date | null
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
  orderBy?: 'name' | 'sku' | 'createdAt' | 'updatedAt' | 'quantityOnHand'
  orderDirection?: 'asc' | 'desc'
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
  orderBy = 'name',
  orderDirection = 'asc'
}: FetchItemsParams): Promise<FetchItemsResponse> {
  try {
    // Validate required parameters
    if (!locationId || !organizationId) {
      throw new Error('locationId and organizationId are required')
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
          { name: { contains: search, mode: 'insensitive' } },
          { sku: { contains: search, mode: 'insensitive' } },
          { barcode: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ]
      })
    }

    // Build the orderBy clause
    let orderByClause: any = {}
    
    if (orderBy === 'quantityOnHand') {
      // Special handling for inventory level ordering
      orderByClause = {
        inventoryLevels: {
          _count: orderDirection
        }
      }
    } else {
      orderByClause = {
        [orderBy]: orderDirection
      }
    }

    // Execute the query with count
    const [items, totalCount] = await Promise.all([
      prisma.item.findMany({
        where: whereClause,
        include: {
          category: {
            select: {
              id: true,
              title: true,
              slug: true
            }
          },
          brand: {
            select: {
              id: true,
              brandName: true,
              slug: true
            }
          },
          unit: {
            select: {
              id: true,
              name: true,
              symbol: true,
              type: true
            }
          },
          taxRate: {
            select: {
              id: true,
              taxRateName: true,
              rate: true,
              type: true
            }
          },
          inventoryLevels: {
            where: {
              locationId
            },
            select: {
              id: true,
              quantityOnHand: true,
              quantityReserved: true,
              quantityAvailable: true,
              quantityInTransit: true,
              quantityOnOrder: true,
              reorderPoint: true,
              averageCost: true,
              totalValue: true,
              lastCountDate: true,
              lastTransactionAt: true,
              locationId: true,
              location: {
                select: {
                  id: true,
                  name: true,
                  type: true
                }
              }
            }
          }
        },
        orderBy: orderByClause,
        skip,
        take
      }),
      prisma.item.count({
        where: whereClause
      })
    ])

    // Transform the data to match our interface
    const transformedItems: ItemWithInventory[] = items.map(item => ({
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
      color: item.color,
      size: item.size,
      costPrice: item.costPrice,
      sellingPrice: item.sellingPrice,
      msrp: item.msrp,
      trackInventory: item.trackInventory,
      trackSerialNumbers: item.trackSerialNumbers,
      trackBatches: item.trackBatches,
      trackExpiry: item.trackExpiry,
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
      updatedAt: item.updatedAt
    }))

    const hasMore = skip + take < totalCount

    return {
      items: transformedItems,
      totalCount,
      hasMore
    }

  } catch (error) {
    console.error('Error fetching items with inventory levels:', error)
    throw new Error('Failed to fetch items with inventory levels')
  } finally {
    await prisma.$disconnect()
  }
}

// Additional helper function to fetch a single item with inventory
export async function fetchItemWithInventoryLevel(
  itemId: string,
  locationId: string,
  organizationId: string
): Promise<ItemWithInventory | null> {
  try {
    const item = await prisma.item.findFirst({
      where: {
        id: itemId,
        organizationId
      },
      include: {
        category: {
          select: {
            id: true,
            title: true,
            slug: true
          }
        },
        brand: {
          select: {
            id: true,
            brandName: true,
            slug: true
          }
        },
        unit: {
          select: {
            id: true,
            name: true,
            symbol: true,
            type: true
          }
        },
        taxRate: {
          select: {
            id: true,
            taxRateName: true,
            rate: true,
            type: true
          }
        },
        inventoryLevels: {
          where: {
            locationId
          },
          select: {
            id: true,
            quantityOnHand: true,
            quantityReserved: true,
            quantityAvailable: true,
            quantityInTransit: true,
            quantityOnOrder: true,
            reorderPoint: true,
            averageCost: true,
            totalValue: true,
            lastCountDate: true,
            lastTransactionAt: true,
            location: {
              select: {
                id: true,
                name: true,
                type: true
              }
            }
          }
        }
      }
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
      updatedAt: item.updatedAt
    }

  } catch (error) {
    console.error('Error fetching item with inventory level:', error)
    throw new Error('Failed to fetch item with inventory level')
  } finally {
    await prisma.$disconnect()
  }
}