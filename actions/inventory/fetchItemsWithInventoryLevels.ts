"use server"

import { db } from "@/prisma/db"
import type { Prisma } from "@prisma/client"

export interface ItemWithInventory {
  id: string
  name: string
  slug: string
  sku: string
  barcode: string | null
  description: string | null
  imageUrls: string
  thumbnail: string | null
  dimensions: string | null
  weight: number | null
  costPrice: number
  sellingPrice: number
  trackInventory: boolean
  minStockLevel: number
  maxStockLevel: number | null
  reorderLevel: number
  reorderQuantity: number | null
  isActive: boolean
  isDiscontinued: boolean
  category: { id: string; title: string; slug: string } | null
  brand: { id: string; brandName: string; slug: string } | null
  unit: { id: string; name: string; symbol: string } | null
  taxRate: { id: string; taxRateName: string; rate: number; taxType: string } | null
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
    location: { id: string; name: string; type: string }
    lastTransactionAt: Date | null
  } | null
  createdAt: Date
  updatedAt: Date
}

export interface FetchItemsParams {
  locationId: string
  organizationId: string
  categoryId?: string
  brandId?: string
  isActive?: boolean
  trackInventory?: boolean
  search?: string
  skip?: number
  take?: number
  orderBy?: "name" | "sku" | "createdAt" | "updatedAt" | "quantityOnHand"
  orderDirection?: "asc" | "desc"
}

export interface FetchItemsResponse {
  items: ItemWithInventory[]
  totalCount: number
  hasMore: boolean
}

const itemInventoryInclude = (locationId: string) =>
  ({
    category: { select: { id: true, titleEn: true, slug: true } },
    brand: { select: { id: true, nameEn: true, slug: true } },
    unit: { select: { id: true, nameEn: true, symbol: true } },
    taxRate: { select: { id: true, nameEn: true, rate: true, type: true } },
    inventoryLevels: {
      where: { locationId },
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
        lastTransactionAt: true,
        location: { select: { id: true, name: true, type: true } },
      },
    },
  }) satisfies Prisma.ItemInclude

function toNumber(value: unknown): number {
  return Number(value ?? 0)
}

function mapItemWithInventory(item: Prisma.ItemGetPayload<{ include: ReturnType<typeof itemInventoryInclude> }>): ItemWithInventory {
  const inventoryLevel = item.inventoryLevels[0] ?? null

  return {
    id: item.id,
    name: item.nameEn,
    slug: item.slug,
    sku: item.sku,
    barcode: item.barcode,
    description: item.descriptionEn,
    imageUrls: item.imageUrls.join(","),
    thumbnail: item.thumbnail,
    dimensions: item.dimensions,
    weight: item.weight === null ? null : toNumber(item.weight),
    costPrice: toNumber(item.costPrice),
    sellingPrice: toNumber(item.sellingPrice),
    trackInventory: item.trackInventory,
    minStockLevel: toNumber(item.minStockLevel),
    maxStockLevel: item.maxStockLevel === null ? null : toNumber(item.maxStockLevel),
    reorderLevel: toNumber(item.reorderLevel),
    reorderQuantity: item.reorderQuantity === null ? null : toNumber(item.reorderQuantity),
    isActive: item.isActive,
    isDiscontinued: item.isDiscontinued,
    category: item.category ? { id: item.category.id, title: item.category.titleEn, slug: item.category.slug } : null,
    brand: item.brand ? { id: item.brand.id, brandName: item.brand.nameEn, slug: item.brand.slug } : null,
    unit: item.unit ? { id: item.unit.id, name: item.unit.nameEn, symbol: item.unit.symbol } : null,
    taxRate: item.taxRate
      ? {
          id: item.taxRate.id,
          taxRateName: item.taxRate.nameEn,
          rate: toNumber(item.taxRate.rate),
          taxType: item.taxRate.type,
        }
      : null,
    inventoryLevel: inventoryLevel
      ? {
          id: inventoryLevel.id,
          quantityOnHand: toNumber(inventoryLevel.quantityOnHand),
          quantityReserved: toNumber(inventoryLevel.quantityReserved),
          quantityAvailable: toNumber(inventoryLevel.quantityAvailable),
          quantityInTransit: toNumber(inventoryLevel.quantityInTransit),
          quantityOnOrder: toNumber(inventoryLevel.quantityOnOrder),
          reorderPoint: toNumber(inventoryLevel.reorderPoint),
          averageCost: toNumber(inventoryLevel.averageCost),
          totalValue: toNumber(inventoryLevel.totalValue),
          location: {
            id: inventoryLevel.location.id,
            name: inventoryLevel.location.name,
            type: inventoryLevel.location.type,
          },
          lastTransactionAt: inventoryLevel.lastTransactionAt,
        }
      : null,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }
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
  if (!locationId || !organizationId) {
    throw new Error("locationId and organizationId are required")
  }

  const where: Prisma.ItemWhereInput = {
    organizationId,
    isActive,
    deletedAt: null,
    ...(categoryId ? { categoryId } : {}),
    ...(brandId ? { brandId } : {}),
    ...(trackInventory !== undefined ? { trackInventory } : {}),
    ...(search
      ? {
          OR: [
            { nameEn: { contains: search, mode: "insensitive" } },
            { nameFr: { contains: search, mode: "insensitive" } },
            { sku: { contains: search, mode: "insensitive" } },
            { barcode: { contains: search, mode: "insensitive" } },
            { descriptionEn: { contains: search, mode: "insensitive" } },
            { descriptionFr: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  }

  const orderByClause: Prisma.ItemOrderByWithRelationInput =
    orderBy === "quantityOnHand"
      ? { inventoryLevels: { _count: orderDirection } }
      : { [orderBy === "name" ? "nameEn" : orderBy]: orderDirection }

  const [items, totalCount] = await Promise.all([
    db.item.findMany({
      where,
      include: itemInventoryInclude(locationId),
      orderBy: orderByClause,
      skip,
      take,
    }),
    db.item.count({ where }),
  ])

  return {
    items: items.map(mapItemWithInventory),
    totalCount,
    hasMore: skip + take < totalCount,
  }
}

export async function fetchItemWithInventoryLevel(
  itemId: string,
  locationId: string,
  organizationId: string,
): Promise<ItemWithInventory | null> {
  const item = await db.item.findFirst({
    where: { id: itemId, organizationId, deletedAt: null },
    include: itemInventoryInclude(locationId),
  })

  return item ? mapItemWithInventory(item) : null
}
