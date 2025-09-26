"use server";
import { getAuthenticatedUser } from "@/config/useAuth";
import { db } from "@/prisma/db";
import { InventoryAlerts, InventoryLevelResponse, InventoryStats, InventoryStatsResponse, ItemCategory, LocationType, TransactionType } from "@/types/inventory";
import { revalidatePath } from "next/cache";

// Mock database - replace with actual Prisma client
const mockInventoryData = [
  {
    id: "inv-1",
    itemId: "item-1",
    locationId: "loc-1",
    quantityOnHand: 25,
    quantityReserved: 5,
    quantityAvailable: 20,
    unitCost: 150.0,
    totalValue: 3750.0,
    reorderPoint: 10,
    maxStockLevel: 50,
    item: {
      id: "item-1",
      name: "Office Chairs",
      sku: "OFC-001",
      category: ItemCategory.FURNITURE,
      unit: "EACH",
    },
    location: {
      id: "loc-1",
      name: "Main Warehouse",
      type: LocationType.WAREHOUSE,
    },
  },
  {
    id: "inv-2",
    itemId: "item-2",
    locationId: "loc-1",
    quantityOnHand: 45,
    quantityReserved: 10,
    quantityAvailable: 35,
    unitCost: 30.0,
    totalValue: 1350.0,
    reorderPoint: 20,
    maxStockLevel: 100,
    item: {
      id: "item-2",
      name: "Desk Lamps",
      sku: "DLM-001",
      category: ItemCategory.ELECTRONICS,
      unit: "EACH",
    },
    location: {
      id: "loc-1",
      name: "Main Warehouse",
      type: LocationType.WAREHOUSE,
    },
  },
];

const mockInventoryTransactions = [
  {
    id: "txn-1",
    inventoryLevelId: "inv-1",
    type: TransactionType.PURCHASE_RECEIPT,
    quantity: 5,
    unitCost: 150.0,
    totalCost: 750.0,
    referenceType: "PURCHASE_ORDER",
    referenceId: "po-1",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    item: {
      name: "Office Chairs",
    },
  },
];

export interface LocalInventoryLevel {
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

export interface LocalInventoryTransaction {
  id: string
  type: string
  quantity: number
  unitCost: number
  totalCost: number
  referenceType: string
  referenceId: string
  itemId: string
  createdAt: Date
  item: {
    name: string
  }
}

export interface LocalInventoryStats {
  totalItems: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  totalTransactions: number;
  recentTransactions: LocalInventoryTransaction[]
}

export interface InventoryTransactionResponse {
  success: boolean
  data?: LocalInventoryTransaction[]
  error?: string | null
}

export interface InventoryLevelsResponse {
  success: boolean
  data?: LocalInventoryLevel[]
  error?: string | null
}

export interface LocalInventoryStatsResponse {
  success: boolean
  data?: LocalInventoryStats
  error?: string | null
}

export async function getInventoryLevels(locationId?: string): Promise<InventoryLevelResponse> {
  try {
    const user = await getAuthenticatedUser();
    if (!user?.organizationId) {
      return {
        success: false,
        error: 'User not authenticated or missing organization'
      };
    }

    const getOrgInventoryLevels = await db.inventoryLevel.findMany({
      where: {
        locationId
      },
      include: {
        item: true,
        location: true,
      }
    });

    console.log("[v0] Found inventory levels:", getOrgInventoryLevels.length);
    
    // Map DB results to InventoryLevel type
    const mappedInventoryLevels = getOrgInventoryLevels.map((level: any) => ({
      id: level.id,
      itemId: level.itemId,
      locationId: level.locationId,
      quantityOnHand: level.quantityOnHand,
      quantityReserved: level.quantityReserved,
      quantityAvailable: level.quantityAvailable,
      quantityInTransit: level.quantityInTransit ?? 0,
      quantityOnOrder: level.quantityOnOrder ?? 0,
      unitCost: level.unitCost ?? 0,
      totalValue: level.totalValue ?? 0,
      reorderPoint: level.reorderPoint ?? 0,
      maxStockLevel: level.maxStockLevel ?? 0,
      item: level.item
        ? {
            id: level.item.id,
            name: level.item.name,
            sku: level.item.sku,
            category: level.item.category,
            unit: level.item.unit,
          }
        : { id: "", name: "", sku: "", category: "", unit: "" },
      location: level.location
        ? {
            id: level.location.id,
            name: level.location.name,
            type: level.location.type,
          }
        : { id: "", name: "", type: "" },
    }));

    return {
      success: true,
      data: mappedInventoryLevels,
      error: null
    };

  } catch (error) {
    console.error("Error fetching inventory levels:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
}

export async function getInventoryStats(): Promise<InventoryStatsResponse> {
  try {
    const user = await getAuthenticatedUser();
    if (!user?.organizationId) {
      return {
        success: false,
        error: 'User not authenticated'
      };
    }

    const inventoryLevelsResponse = await getInventoryLevels();
    if (!inventoryLevelsResponse.success || !inventoryLevelsResponse.data) {
      return {
        success: false,
        error: 'Failed to fetch inventory levels for stats'
      };
    }

    const levels = inventoryLevelsResponse.data;
    
    // Get recent transactions
    const recentTransactions = await db.inventoryTransaction.findMany({
      where: {
        organizationId: user.organizationId
      },
      take: 5,
      orderBy: {
        createdAt: "desc"
      },
      include: {
        item: {
          select: { id: true, name: true, sku: true }
        }
      }
    });

    const stats: InventoryStats = {
      totalItems: levels.length,
      totalValue: levels.reduce((sum, level) => sum + level.totalValue, 0),
      lowStockItems: levels.filter(level => 
        level.quantityAvailable <= level.reorderPoint && level.quantityAvailable > 0
      ).length,
      outOfStockItems: levels.filter(level => level.quantityAvailable === 0).length,
      overStockItems: levels.filter(level => 
        level.quantityAvailable > level.maxStockLevel && level.maxStockLevel > 0
      ).length,
      totalTransactions: recentTransactions.length,
      recentTransactions: recentTransactions.map((txn: any) => ({
        id: txn.id,
        inventoryLevelId: txn.inventoryLevelId,
        itemId: txn.itemId,
        locationId: txn.locationId,
        organizationId: txn.organizationId,
        type: txn.type as TransactionType,
        quantity: txn.quantity,
        unitCost: txn.unitCost,
        totalCost: txn.totalCost,
        referenceType: txn.referenceType,
        referenceId: txn.referenceId,
        notes: txn.notes,
        createdAt: txn.createdAt,
        updatedAt: txn.updatedAt,
        item: txn.item ? {
          id: txn.item.id,
          name: txn.item.name,
          sku: txn.item.sku
        } : undefined
      }))
    };

    console.log("[v0] Calculated inventory stats:", stats);
    return {
      success: true,
      data: stats
    };
  } catch (error) {
    console.error("Error fetching inventory stats:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
}

export async function getInventoryTransactions(
  options: {
    limit?: number;
    itemId?: string;
    locationId?: string;
    type?: TransactionType;
  } = {},
): Promise<InventoryTransactionResponse> {
  try {
    const user = await getAuthenticatedUser();
    if (!user?.organizationId) {
      return {
        success: false,
        error: 'User not authenticated'
      };
    }

    const { limit = 10, itemId, locationId, type } = options;

    console.log("[v0] Getting inventory transactions for org:", user.organizationId, "with options:", options);

    const transactions = await db.inventoryTransaction.findMany({
      where: {
        organizationId: user.organizationId,
        ...(itemId && { itemId }),
        ...(locationId && { locationId }),
        ...(type && { type }),
      },
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        item: {
          select: { id: true, name: true, sku: true }
        },
        location: {
          select: { id: true, name: true, type: true }
        }
      }
    });

    console.log("[v0] Found transactions:", transactions.length);
    
    // Map to LocalInventoryTransaction type
    const mappedTransactions: LocalInventoryTransaction[] = transactions.map((txn: any) => ({
      id: txn.id,
      type: txn.type,
      quantity: txn.quantity,
      unitCost: txn.unitCost,
      totalCost: txn.totalCost,
      referenceType: txn.referenceType ?? "",
      referenceId: txn.referenceId ?? "",
      itemId: txn.itemId,
      createdAt: txn.createdAt,
      item: {
        name: txn.item?.name ?? "",
      },
    }));

    return {
      success: true,
      data: mappedTransactions
    };
  } catch (error) {
    console.error("Error fetching inventory transactions:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
}

export async function updateInventoryLevel(
  inventoryLevelId: string,
  updates: {
    quantityOnHand?: number;
    quantityReserved?: number;
    unitCost?: number;
    reorderPoint?: number;
    maxStockLevel?: number;
  },
): Promise<{ success: boolean; data?: LocalInventoryLevel; error?: string }> {
  try {
    const updated = await db.inventoryLevel.update({
      where: { id: inventoryLevelId },
      data: {
        ...updates,
        quantityAvailable: updates.quantityOnHand !== undefined && updates.quantityReserved !== undefined
          ? updates.quantityOnHand - updates.quantityReserved
          : undefined,
        totalValue: updates.quantityOnHand !== undefined && updates.unitCost !== undefined
          ? updates.quantityOnHand * updates.unitCost
          : undefined
      },
      include: {
        item: {
          select: {
            id: true,
            name: true,
            sku: true,
            category: true,
            unit: true
          }
        },
        location: true
      }
    });

    const mappedInventoryLevel: LocalInventoryLevel = {
      id: updated.id,
      itemId: updated.itemId,
      locationId: updated.locationId,
      quantityOnHand: updated.quantityOnHand,
      quantityReserved: updated.quantityReserved,
      quantityAvailable: updated.quantityAvailable,
      quantityInTransit: updated.quantityInTransit,
      quantityOnOrder: updated.quantityOnOrder,
      unitCost: updated.unitCost,
      totalValue: updated.totalValue,
      reorderPoint: updated.reorderPoint,
      maxStockLevel: updated.maxStockLevel,
      item: {
        id: updated.item.id,
        name: updated.item.name,
        sku: updated.item.sku,
      
      },
      location: {
        id: updated.location.id,
        name: updated.location.name,
        type: updated.location.type,
      }
    };

    revalidatePath("/dashboard/inventory");
    revalidatePath("/");

    return {
      success: true,
      data: mappedInventoryLevel
    };
  } catch (error) {
    console.error("Error updating inventory level:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
}

export async function createInventoryTransaction(
  inventoryLevelId: string,
  transaction: {
    type: TransactionType;
    quantity: number;
    unitCost: number;
    referenceType?: string;
    referenceId?: string;
    notes?: string;
  },
): Promise<{ success: boolean; data?: LocalInventoryTransaction; error?: string }> {
  try {
    const user = await getAuthenticatedUser();
    if (!user?.organizationId) {
      return {
        success: false,
        error: 'User not authenticated'
      };
    }

    const inventoryLevel = await db.inventoryLevel.findUnique({
      where: { id: inventoryLevelId },
      include: { item: true }
    });

    if (!inventoryLevel) {
      return {
        success: false,
        error: 'Inventory level not found'
      };
    }

    const newTransaction = await db.inventoryTransaction.create({
      data: {
        // inventoryLevelId,
        itemId: inventoryLevel.itemId,
        locationId: inventoryLevel.locationId,
        organizationId: user.organizationId,
        ...transaction,
        totalCost: transaction.quantity * transaction.unitCost
      },
      include: {
        item: {
          select: { id: true, name: true, sku: true }
        }
      }
    });

    const mappedTransaction: LocalInventoryTransaction = {
      id: newTransaction.id,
      type: newTransaction.type,
      quantity: newTransaction.quantity,
      unitCost: newTransaction.unitCost,
      totalCost: newTransaction.totalCost,
      referenceType: newTransaction.referenceType ?? "",
      referenceId: newTransaction.referenceId ?? "",
      itemId: newTransaction.itemId,
      createdAt: newTransaction.createdAt,
      item: {
        name: newTransaction.item?.name ?? inventoryLevel.item.name,
      },
    };

    revalidatePath("/dashboard/inventory");
    revalidatePath("/");

    return {
      success: true,
      data: mappedTransaction
    };
  } catch (error) {
    console.error("Error creating inventory transaction:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
}

export async function getLowStockItems(threshold = 10): Promise<InventoryLevelsResponse> {
  try {
    const user = await getAuthenticatedUser();
    if (!user?.organizationId) {
      return {
        success: false,
        error: 'User not authenticated'
      };
    }

    const inventoryLevelsResponse = await getInventoryLevels();
    if (!inventoryLevelsResponse.success || !inventoryLevelsResponse.data) {
      return inventoryLevelsResponse;
    }

    const lowStockItems = inventoryLevelsResponse.data.filter(
      item => item.quantityAvailable <= threshold && item.quantityAvailable > 0
    );

    return {
      success: true,
      data: lowStockItems
    };
  } catch (error) {
    console.error("Error fetching low stock items:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
}

export async function bulkUpdateInventoryLevels(
  updates: Array<{
    inventoryLevelId: string;
    updates: {
      quantityOnHand?: number;
      quantityReserved?: number;
      unitCost?: number;
      reorderPoint?: number;
      maxStockLevel?: number;
    };
  }>,
): Promise<{ success: boolean; data?: LocalInventoryLevel[]; error?: string }> {
  try {
    const user = await getAuthenticatedUser();
    if (!user?.organizationId) {
      return {
        success: false,
        error: 'User not authenticated'
      };
    }

    const updatedItems: LocalInventoryLevel[] = [];

    for (const { inventoryLevelId, updates: itemUpdates } of updates) {
      const result = await updateInventoryLevel(inventoryLevelId, itemUpdates);
      if (result.success && result.data) {
        updatedItems.push(result.data);
      } else {
        throw new Error(result.error || 'Failed to update inventory level');
      }
    }

    revalidatePath("/dashboard/inventory");
    revalidatePath("/");

    return {
      success: true,
      data: updatedItems
    };
  } catch (error) {
    console.error("Error bulk updating inventory levels:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
}

export async function getInventoryAlerts(): Promise<{ success: boolean; data?: InventoryAlerts; error?: string }> {
  try {
    const user = await getAuthenticatedUser();
    if (!user?.organizationId) {
      return {
        success: false,
        error: 'User not authenticated'
      };
    }

    const inventoryLevelsResponse = await getInventoryLevels();
    if (!inventoryLevelsResponse.success || !inventoryLevelsResponse.data) {
      return {
        success: false,
        error: 'Failed to fetch inventory levels'
      };
    }

    const levels = inventoryLevelsResponse.data;

    const alerts: InventoryAlerts = {
      lowStock: levels.filter(level => 
        level.quantityAvailable <= level.reorderPoint && level.quantityAvailable > 0
      ),
      outOfStock: levels.filter(level => level.quantityAvailable === 0),
      overStock: levels.filter(level => 
        level.quantityAvailable > level.maxStockLevel && level.maxStockLevel > 0
      )
    };

    return {
      success: true,
      data: alerts
    };
  } catch (error) {
    console.error("Error fetching inventory alerts:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
  }