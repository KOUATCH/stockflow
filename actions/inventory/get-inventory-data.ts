'use server'

import { getAuthenticatedUser } from "@/lib/auth-server";
import { db } from "@/prisma/db";
import { InventoryLevelResponse, InventoryTransactionResponse } from "@/types/inventory";

function toNumber(value: any): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value) || 0;
  if (typeof value.toNumber === "function") return value.toNumber();
  return Number(value) || 0;
}

function mapInventoryLevel(level: any) {
  return {
    ...level,
    quantityOnHand: toNumber(level.quantityOnHand),
    quantityReserved: toNumber(level.quantityReserved),
    quantityAvailable: toNumber(level.quantityAvailable),
    quantityInTransit: toNumber(level.quantityInTransit),
    quantityOnOrder: toNumber(level.quantityOnOrder),
    averageCost: toNumber(level.averageCost),
    totalValue: toNumber(level.totalValue),
    reorderPoint: toNumber(level.reorderPoint),
    unitCost: toNumber(level.averageCost),
    maxStockLevel: toNumber(level.item?.maxStockLevel),
    item: level.item
      ? {
          ...level.item,
          name: level.item.nameEn ?? level.item.nameFr ?? "",
          costPrice: toNumber(level.item.costPrice),
          sellingPrice: toNumber(level.item.sellingPrice),
        }
      : undefined,
  };
}

function mapInventoryTransaction(transaction: any) {
  return {
    ...transaction,
    type: transaction.type as any,
    quantity: toNumber(transaction.quantity),
    unitCost: toNumber(transaction.unitCost),
    totalCost: toNumber(transaction.totalCost),
    balanceAfter: toNumber(transaction.balanceAfter),
    referenceType: transaction.referenceType as any,
    item: transaction.item
      ? {
          name: transaction.item.nameEn ?? transaction.item.nameFr ?? "",
          sku: transaction.item.sku ?? "",
        }
      : undefined,
    location: transaction.location
      ? {
          name: transaction.location.name ?? "",
          code: transaction.location.code ?? "",
        }
      : undefined,
    createdBy: transaction.createdBy
      ? {
          name:
            [transaction.createdBy.firstName, transaction.createdBy.lastName].filter(Boolean).join(" ") ||
            transaction.createdBy.email ||
            null,
        }
      : undefined,
  };
}

export async function getInventoryLevels(locationId?: string): Promise<InventoryLevelResponse> {
  try {
    const user = await getAuthenticatedUser();

    if (!user.organizationId) {
      return { success: false, error: "Not authenticated", data: undefined };
    }

    const levels = await db.inventoryLevel.findMany({
      where: {
        item: {
          organizationId: user.organizationId,
        },
        ...(locationId && { locationId }),
      },
      include: {
        item: {
          select: {
            id: true,
            nameEn: true,
            nameFr: true,
            sku: true,
            slug: true,
            imageUrls: true,
            costPrice: true,
            sellingPrice: true,
            thumbnail: true,
            maxStockLevel: true,
            organizationId: true,
            createdAt: true,
          },
        },
        location: {
          select: {
            id: true,
            name: true,
            code:true,
            type:true
          },
        },
      },
      orderBy: [
        { item: { nameEn: 'asc' } },
        { location: { name: 'asc' } },
      ],
    });

    return {
      success: true,
      data: levels.map(mapInventoryLevel),
      error: null,
    };
  } catch (error) {
    console.error("Error fetching inventory levels:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      data: undefined,
    };
  }
}

export async function getInventoryTransactions(
  itemId?: string,
  locationId?: string,
  limit: number = 50
): Promise<InventoryTransactionResponse> {
  try {
    const user = await getAuthenticatedUser();

    if (!user.organizationId) {
      return { success: false, error: "Not authenticated", data: undefined };
    }

    const transactions = await db.inventoryTransaction.findMany({
      where: {
        organizationId: user.organizationId,
        ...(itemId && { itemId }),
        ...(locationId && { locationId }),
      },
      include: {
        item: {
          select: {
            nameEn: true,
            nameFr: true,
            sku: true,
          },
        },
        location: {
          select: {
            name: true,
            code: true,
          },
        },
        createdBy: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    return {
      success: true,
      data: transactions.map(mapInventoryTransaction),
      error: null,
    };
  } catch (error) {
    console.error("Error fetching inventory transactions:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      data: undefined,
    };
  }
}

export async function getLowStockItems(threshold: number = 10) {
  try {
    const user = await getAuthenticatedUser();

    if (!user.organizationId) {
      return { success: false, error: "Not authenticated", data: undefined };
    }

    const lowStockItems = await db.inventoryLevel.findMany({
      where: {
        item: {
          organizationId: user.organizationId,
        },
        quantityAvailable: {
          lte: threshold,
        },
      },
      include: {
        item: {
          select: {
            id: true,
            nameEn: true,
            nameFr: true,
            sku: true,
            slug: true,
            imageUrls: true,
            minStockLevel: true,
            maxStockLevel: true,
            thumbnail: true,
            organizationId: true,
            createdAt: true,
            costPrice: true,
            sellingPrice: true,
          },
        },
        location: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        quantityAvailable: 'asc',
      },
    });

    return {
      success: true,
      data: lowStockItems.map(mapInventoryLevel),
      error: null,
    };
  } catch (error) {
    console.error("Error fetching low stock items:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      data: undefined,
    };
  }
}

export async function getLocations() {
  try {
    const user = await getAuthenticatedUser();

    if (!user.organizationId) {
      return { success: false, error: "Not authenticated", data: undefined };
    }

    const locations = await db.location.findMany({
      where: {
        organizationId: user.organizationId,
      },
      select: {
        id: true,
        name: true,
        code: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return {
      success: true,
      data: locations,
      error: null,
    };
  } catch (error) {
    console.error("Error fetching locations:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      data: undefined,
    };
  }
}
