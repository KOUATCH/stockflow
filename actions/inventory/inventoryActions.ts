"use server"

import { getAuthenticatedUser } from "@/lib/auth-server"
import {
  AdjustmentStatus,
  type CreateItemRequest,
  type CreateStockAdjustmentRequest,
  type CreateStockTransferRequest,
  type InventoryFilters,
  type InventoryLevelWithRelations,
  type InventoryResponse,
  // type InventoryTransaction,
  type InventoryTransactionWithRelations,
  type Item,
  type ItemWithRelations,
  type ReserveInventoryRequest,
  type StockAdjustment,
  type StockAdjustmentWithRelations,
  type StockTransfer,
  type StockTransferWithRelations,
  type TransactionFilters,
  TransactionType,
  TransferStatus,
  type UpdateInventoryLevelRequest,
} from "@/types/inventoryTypes"
// import { InventoryStatsResponse } from "./AllInventoryActionsOriginal"

export interface InventoryLevel {
  id: string
  itemId: string
  locationId: string
  quantityOnHand: number
  quantityReserved: number
  quantityAvailable: number
  quantityInTransit: number
  quantityOnOrder: number
  unitCost: number
  totalValue: number
  reorderPoint: number
  maxStockLevel: number
  item: {
    id: string
    name: string
    sku: string
    category: string
    unit: string
  }
  location: {
    id: string
    name: string
    type: string
  }
}

export interface InventoryTransaction {
  id: string
  inventoryLevelId: string
  type: string
  quantity: number
  unitCost: number
  totalCost: number
  referenceType: string
  referenceId: string
  itemId: string
  createdAt: Date
  organizationId: string
  createdById: string | null
  referenceNumber?: string | null
  batchNumber?: string | null
  serialNumbers?: number | null
  expiryDate?: string | null
  balanceAfter?: number | null
  item: {
    name: string
  }
}

export interface InventoryStats {
  totalItems: number | undefined;
  totalValue: number | undefined;
  lowStockItems: number | undefined;
  outOfStockItems: number | undefined;
  totalTransactions: any;
  recentTransactions: InventoryTransaction[]
}

export interface InventoryTransactionResponse {
  success: boolean
  data?: InventoryTransaction[]
  error?: string | null
}

export interface InventoryLevelsResponse {
  success: boolean
  data?: InventoryLevel[]
  error?: string | null
}

export interface InventoryStatsResponse {
  success: boolean
  data?: InventoryStats
  error?: string | null
}

// ===== ITEMS =====
export async function getItems(
  organizationId: string,
  filters?: InventoryFilters,
): Promise<InventoryResponse<ItemWithRelations[]>> {
  try {
    // Mock implementation - replace with actual database query
    const mockItems: ItemWithRelations[] = [
      {
        id: "item_1",
        name: "Laptop Computer",
        slug: "laptop-computer",
        sku: "LAP001",
        barcode: "123456789012",
        description: "High-performance laptop computer",
        imageUrls: "/modern-laptop-workspace.png",
        thumbnail: "/modern-laptop-workspace.png",
        upc: "123456789012",
        ean: null,
        mpn: "LAP001",
        isbn: null,
        dimensions: "35x25x2 cm",
        weight: 2.5,
        color: "Silver",
        size: "15 inch",
        costPrice: 800,
        sellingPrice: 1200,
        msrp: 1400,
        trackInventory: true,
        trackSerialNumbers: true,
        trackBatches: false,
        trackExpiry: false,
        minStockLevel: 5,
        maxStockLevel: 50,
        reorderLevel: 10,
        reorderQuantity: 20,
        isActive: true,
        isDiscontinued: false,
        organizationId,
        categoryId: "cat_1",
        brandId: "brand_1",
        unitId: "unit_1",
        taxRateId: "tax_1",
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-15"),
        category: { id: "cat_1", name: "Electronics" },
        brand: { id: "brand_1", name: "TechBrand" },
        unit: { id: "unit_1", name: "Each", abbreviation: "ea" },
      },
      {
        id: "item_2",
        name: "Office Chair",
        slug: "office-chair",
        sku: "CHR001",
        barcode: "123456789013",
        description: "Ergonomic office chair",
        imageUrls: "/ergonomic-office-chair.png",
        thumbnail: "/ergonomic-office-chair.png",
        upc: "123456789013",
        ean: null,
        mpn: "CHR001",
        isbn: null,
        dimensions: "60x60x120 cm",
        weight: 15,
        color: "Black",
        size: "Standard",
        costPrice: 150,
        sellingPrice: 250,
        msrp: 300,
        trackInventory: true,
        trackSerialNumbers: false,
        trackBatches: false,
        trackExpiry: false,
        minStockLevel: 3,
        maxStockLevel: 20,
        reorderLevel: 5,
        reorderQuantity: 10,
        isActive: true,
        isDiscontinued: false,
        organizationId,
        categoryId: "cat_2",
        brandId: "brand_2",
        unitId: "unit_1",
        taxRateId: "tax_1",
        createdAt: new Date("2024-01-02"),
        updatedAt: new Date("2024-01-16"),
        category: { id: "cat_2", name: "Furniture" },
        brand: { id: "brand_2", name: "OfficePro" },
        unit: { id: "unit_1", name: "Each", abbreviation: "ea" },
      },
    ]

    // Apply filters
    let filteredItems = mockItems
    if (filters?.search) {
      const search = filters.search.toLowerCase()
      filteredItems = filteredItems.filter(
        (item) =>
          item.name.toLowerCase().includes(search) ||
          item.sku.toLowerCase().includes(search) ||
          item.description?.toLowerCase().includes(search),
      )
    }
    if (filters?.categoryId) {
      filteredItems = filteredItems.filter((item) => item.categoryId === filters.categoryId)
    }
    if (filters?.brandId) {
      filteredItems = filteredItems.filter((item) => item.brandId === filters.brandId)
    }

    return { success: true, data: filteredItems }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch items",
      data: [],
    }
  }
}

export async function getItem(id: string): Promise<InventoryResponse<ItemWithRelations | null>> {
  try {
    const items = await getItems("org_1") // Mock organization ID
    const item = items.data.find((item) => item.id === id)
    return { success: true, data: item || null }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch item",
      data: null,
    }
  }
}

export async function createItem(organizationId: string, data: CreateItemRequest): Promise<InventoryResponse<Item>> {
  try {
    const newItem: Item = {
      id: `item_${Date.now()}`,
      name: data.name,
      slug: data.name.toLowerCase().replace(/\s+/g, "-"),
      sku: data.sku,
      barcode: data.barcode || null,
      description: data.description || null,
      imageUrls: "/diverse-products-still-life.png",
      thumbnail: null,
      upc: null,
      ean: null,
      mpn: null,
      isbn: null,
      dimensions: null,
      weight: null,
      color: null,
      size: null,
      costPrice: data.costPrice,
      sellingPrice: data.sellingPrice,
      msrp: null,
      trackInventory: data.trackInventory ?? true,
      trackSerialNumbers: false,
      trackBatches: false,
      trackExpiry: false,
      minStockLevel: data.minStockLevel ?? 0,
      maxStockLevel: null,
      reorderLevel: data.reorderLevel ?? 0,
      reorderQuantity: null,
      isActive: true,
      isDiscontinued: false,
      organizationId,
      categoryId: data.categoryId || null,
      brandId: data.brandId || null,
      unitId: data.unitId || null,
      taxRateId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    return { success: true, data: newItem }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create item",
      data: {} as Item,
    }
  }
}

// ===== INVENTORY LEVELS =====
export async function getInventoryLevels(
  organizationId: string,
  filters?: InventoryFilters,
): Promise<InventoryResponse<InventoryLevelWithRelations[]>> {
  try {

    // Apply filters
    let filteredLevels = mockLevels
    if (filters?.locationId) {
      filteredLevels = filteredLevels.filter((level) => level.locationId === filters.locationId)
    }
    if (filters?.lowStock) {
      filteredLevels = filteredLevels.filter((level) => level.quantityAvailable <= 10)
    }
    if (filters?.outOfStock) {
      filteredLevels = filteredLevels.filter((level) => level.quantityAvailable <= 0)
    }

    return { success: true, data: filteredLevels }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch inventory levels",
      data: [],
    }
  }
}

export async function updateInventoryLevel(
  data: UpdateInventoryLevelRequest,
): Promise<InventoryResponse<InventoryTransaction>> {
  try {

    const user = await getAuthenticatedUser()
    const userOrgId = user.organizationId

    const transaction: InventoryTransaction = {
      id: `trans_${Date.now()}`,
      type: data.type,
      quantity: data.quantity,
      unitCost: data.unitCost || 0,
      totalCost: (data.unitCost || 0) * Math.abs(data.quantity),
      createdAt: new Date(),
      itemId: data.itemId,
      organizationId: userOrgId,
      createdById: data.createdById || null,
      referenceType: "PURCHASE_ORDER",
      referenceNumber: data.referenceNumber || null,
      batchNumber: null,
      expiryDate: null,
      inventoryLevelId: data.inventoryLevelId,
      balanceAfter: 100,
      referenceId: "",
      item: {
        name: ""
      }
    }

    return { success: true, data: transaction }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update inventory level",
      data: {} as InventoryTransaction,
    }
  }
}

export async function reserveInventory(
  data: ReserveInventoryRequest,
): Promise<InventoryResponse<InventoryTransaction[]>> {
  try {
    const transactions: InventoryTransaction[] = data.reservations.map((reservation, index) => ({
      id: `trans_${Date.now()}_${index}`,
      type: TransactionType.RESERVATION,
      quantity: -reservation.quantity,
      unitCost: 0,
      totalCost: 0,
      notes: "Inventory reserved",
      createdAt: new Date(),
      itemId: reservation.itemId,
      locationId: reservation.locationId,
      organizationId: data.organizationId,
      inventoryLevelId: reservation.inventoryLevelId, // Ensure this is present
      createdById: null,
      referenceType: "PURCHASE_ORDER",
      referenceId: "poli9809s",
      referenceNumber: null,
      batchNumber: null,
      serialNumbers: null,
      expiryDate: null,
      balanceAfter: 100, // Mock balance
      item: {
        name: "" // Provide at least the required property for item
      }
    }))

    return { success: true, data: transactions }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to reserve inventory",
      data: [],
    }
  }
}

export async function releaseInventory(
  data: ReserveInventoryRequest,
): Promise<InventoryResponse<InventoryTransaction[]>> {
  try {
    const transactions: InventoryTransaction[] = data.reservations.map((reservation, index) => ({
      id: `trans_${Date.now()}_${index}`,
      type: TransactionType.RESERVATION_RELEASE,
      quantity: reservation.quantity,
      unitCost: 0,
      totalCost: 0,
      notes: "Inventory reservation released",
      createdAt: new Date(),
      itemId: reservation.itemId,
      locationId: reservation.locationId,
      organizationId: data.organizationId,
      createdById: null,
      referenceType: "SALES",
      referenceId: "soiu9809s",
      referenceNumber: null,
      batchNumber: null,
      serialNumbers: null,
      expiryDate: null,
      inventoryLevelId: reservation.inventoryLevelId,
      item: {
        name: ""
      },
      balanceAfter: 100, // Mock balance
    }))

    return { success: true, data: transactions }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to release inventory",
      data: [],
    }
  }
}

// ===== INVENTORY TRANSACTIONS =====
export async function getInventoryTransactions(
  organizationId: string,
  filters?: TransactionFilters,
): Promise<InventoryResponse<InventoryTransactionWithRelations[]>> {
  try {
    const mockTransactions: InventoryTransactionWithRelations[] = [
      {
        id: "trans_1",
        type: TransactionType.PURCHASE_RECEIPT,
        quantity: 10,
        unitCost: 800,
        totalCost: 8000,
        notes: "Initial stock receipt",
        createdAt: new Date("2024-01-15"),
        itemId: "item_1",
        locationId: "loc_1",
        organizationId,
        createdById: "user_1",
        referenceType: null,
        referenceId: null,
        referenceNumber: "PO-001",
        batchNumber: null,
        serialNumbers: [],
        expiryDate: null,
        balanceAfter: 25,
        item: {
          id: "item_1",
          name: "Laptop Computer",
          sku: "LAP001",
        },
        location: {
          id: "loc_1",
          name: "Main Warehouse",
        },
        createdBy: {
          id: "user_1",
          name: "John Doe",
        },
      },
      {
        id: "trans_2",
        type: TransactionType.SALE,
        quantity: -2,
        unitCost: 800,
        totalCost: -1600,
        notes: "Sale to customer",
        createdAt: new Date("2024-01-16"),
        itemId: "item_1",
        locationId: "loc_1",
        organizationId,
        createdById: "user_1",
        referenceType: null,
        referenceId: null,
        referenceNumber: "SO-001",
        batchNumber: null,
        serialNumbers: [],
        expiryDate: null,
        balanceAfter: 23,
        item: {
          id: "item_1",
          name: "Laptop Computer",
          sku: "LAP001",
        },
        location: {
          id: "loc_1",
          name: "Main Warehouse",
        },
        createdBy: {
          id: "user_1",
          name: "John Doe",
        },
      },
    ]

    // Apply filters
    let filteredTransactions = mockTransactions
    if (filters?.itemId) {
      filteredTransactions = filteredTransactions.filter((trans) => trans.itemId === filters.itemId)
    }
    if (filters?.locationId) {
      filteredTransactions = filteredTransactions.filter((trans) => trans.locationId === filters.locationId)
    }
    if (filters?.type) {
      filteredTransactions = filteredTransactions.filter((trans) => trans.type === filters.type)
    }

    return { success: true, data: filteredTransactions }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch inventory transactions",
      data: [],
    }
  }
}


export async function getInventoryStats(): Promise<InventoryStatsResponse> {
  try {
    const user = await getAuthenticatedUser()
    const userOrgId = user.organizationId
    console.log(`[v0] Getting inventory stats for org:", ${userOrgId}`)

    const inventoryLevels = await getInventoryLevels(userOrgId)
    const invenLevelData = inventoryLevels.data
    const totalItems = invenLevelData?.length
    const totalValue = invenLevelData?.reduce((sum, level) => sum + level.totalValue, 0)
    const lowStockItems = invenLevelData?.filter(
      (level) => level.quantityAvailable <= level.quantityReserved && level.quantityAvailable > 0,
    ).length
    const outOfStockItems = invenLevelData?.filter((level) => level.quantityAvailable === 0).length

    const stats = {
      totalItems,
      totalValue,
      lowStockItems,
      outOfStockItems,
      totalTransactions: 0, // or provide actual value if available
      recentTransactions: [], // or provide actual recent transactions if available
    }

    console.log("[v0] Calculated inventory stats:", stats)
    return {
      data: stats,
      success: true,
      error: null
    }
  } catch (error) {
    console.error("Error fetching inventory stats:", error)
    throw error
  }
}

// export async function getInventoryTransactions(
//   organizationId: string, limit: number, options: {
//     limit?: number;
//     itemId?: string;
//     locationId?: string;
//     type?: string;
//   } = {},
// ): Promise<InventoryTransaction[]> {
//   try {
//     const user = await getAuthenticatedUser()
//     const userOrgId = user.organizationId

//     console.log("[v0] Getting inventory transactions for org:", userOrgId, "with options:", options)

//     const { limit = 10, itemId, locationId, type } = options

//     // Simulate API delay
//     await new Promise((resolve) => setTimeout(resolve, 200))
//     const invenTranx = await db.inventoryTransaction.findMany({
//       where: {
//         organizationId: userOrgId,
//         ...(itemId && { itemId }),
//         ...(locationId && { locationId }),
//         ...(type && { type: type as any }), // Cast to enum or use the correct enum type here
//       },
//       take: limit,
//       orderBy: {
//         createdAt: "desc",
//       },
//     })

//     let filteredTransactions = invenTranx

//     // Apply filters
//     if (itemId) {
//       const inventoryLevel = invenTranx.find((inv) => inv.itemId === itemId)
//       if (inventoryLevel) {
//         filteredTransactions = filteredTransactions.filter((txn) => txn. === inventoryLevel.id)
//       }
//     }

//     if (locationId) {
//       const inventoryLevels = invenTranx.filter((inv) => inv.locationId === locationId)
//       const levelIds = inventoryLevels.map((inv) => inv.id)
//       filteredTransactions = filteredTransactions.filter((txn) => levelIds.includes(txn.inventoryLevelId))
//     }

//     if (type) {
//       filteredTransactions = filteredTransactions.filter((txn) => txn.type === type)
//     }

//     const result = filteredTransactions.slice(0, limit)
//     console.log("[v0] Found transactions:", result.length)
//     return result
//   } catch (error) {
//     console.error("Error fetching inventory transactions:", error)
//     throw error
//   }
// }

// ===== STOCK ADJUSTMENTS =====
export async function getStockAdjustments(
  organizationId: string,
): Promise<InventoryResponse<StockAdjustmentWithRelations[]>> {
  try {
    const mockAdjustments: StockAdjustmentWithRelations[] = [
      {
        id: "adj_1",
        adjustmentNumber: "ADJ-001",
        type: "CYCLE_COUNT" as any,
        reason: "Monthly cycle count",
        status: AdjustmentStatus.COMPLETED,
        adjustmentDate: new Date("2024-01-10"),
        notes: "Routine inventory count",
        locationId: "loc_1",
        organizationId,
        createdById: "user_1",
        approvedById: "user_2",
        approvedAt: new Date("2024-01-11"),
        createdAt: new Date("2024-01-10"),
        updatedAt: new Date("2024-01-11"),
        location: {
          id: "loc_1",
          name: "Main Warehouse",
        },
        createdBy: {
          id: "user_1",
          name: "John Doe",
        },
        approvedBy: {
          id: "user_2",
          name: "Jane Smith",
        },
      },
    ]

    return { success: true, data: mockAdjustments }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch stock adjustments",
      data: [],
    }
  }
}

export async function createStockAdjustment(
  data: CreateStockAdjustmentRequest,
): Promise<InventoryResponse<StockAdjustment>> {
  try {
    const adjustment: StockAdjustment = {
      id: `adj_${Date.now()}`,
      adjustmentNumber: `ADJ-${Date.now()}`,
      type: data.type,
      reason: data.reason,
      status: AdjustmentStatus.DRAFT,
      adjustmentDate: new Date(),
      notes: data.notes || null,
      locationId: data.locationId,
      organizationId: "org_1", // Mock organization ID
      createdById: null,
      approvedById: null,
      approvedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    return { success: true, data: adjustment }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create stock adjustment",
      data: {} as StockAdjustment,
    }
  }
}

// ===== STOCK TRANSFERS =====
export async function getStockTransfers(
  organizationId: string,
): Promise<InventoryResponse<StockTransferWithRelations[]>> {
  try {
    const mockTransfers: StockTransferWithRelations[] = [
      {
        id: "transfer_1",
        transferNumber: "TRF-001",
        status: TransferStatus.COMPLETED,
        transferDate: new Date("2024-01-12"),
        expectedDate: new Date("2024-01-13"),
        actualDate: new Date("2024-01-13"),
        notes: "Transfer to retail location",
        fromLocationId: "loc_1",
        toLocationId: "loc_2",
        organizationId,
        createdById: "user_1",
        approvedById: "user_2",
        approvedAt: new Date("2024-01-12"),
        createdAt: new Date("2024-01-12"),
        updatedAt: new Date("2024-01-13"),
        fromLocation: {
          id: "loc_1",
          name: "Main Warehouse",
        },
        toLocation: {
          id: "loc_2",
          name: "Retail Store",
        },
        createdBy: {
          id: "user_1",
          name: "John Doe",
        },
        approvedBy: {
          id: "user_2",
          name: "Jane Smith",
        },
      },
    ]

    return { success: true, data: mockTransfers }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch stock transfers",
      data: [],
    }
  }
}

export async function createStockTransfer(data: CreateStockTransferRequest): Promise<InventoryResponse<StockTransfer>> {
  try {
    const transfer: StockTransfer = {
      id: `transfer_${Date.now()}`,
      transferNumber: `TRF-${Date.now()}`,
      status: TransferStatus.DRAFT,
      transferDate: new Date(),
      expectedDate: data.expectedDate || null,
      actualDate: null,
      notes: data.notes || null,
      fromLocationId: data.fromLocationId,
      toLocationId: data.toLocationId,
      organizationId: "org_1", // Mock organization ID
      createdById: null,
      approvedById: null,
      approvedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    return { success: true, data: transfer }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create stock transfer",
      data: {} as StockTransfer,
    }
  }
}
