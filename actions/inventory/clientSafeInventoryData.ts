'use server'

import { auth } from "@/auth";
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

export async function getInventoryLevelsClientSafe(
  organizationId?: string,
  locationId?: string
): Promise<InventoryLevelResponse> {
  try {
    const session = await auth();

    if (!session?.user) {
      return { success: false, error: "Not authenticated", data: undefined };
    }

    const userOrgId = organizationId || session.user.organizationId;

    if (!userOrgId) {
      return { success: false, error: "No organization ID", data: undefined };
    }

    const levels = await db.inventoryLevel.findMany({
      where: {
        item: {
          organizationId: userOrgId,
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
            code: true,
            type: true
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

export async function getInventoryTransactionsClientSafe(
  organizationId?: string,
  itemId?: string,
  locationId?: string,
  limit: number = 50
): Promise<InventoryTransactionResponse> {
  try {
    const session = await auth();

    if (!session?.user) {
      return { success: false, error: "Not authenticated", data: undefined };
    }

    const userOrgId = organizationId || session.user.organizationId;

    if (!userOrgId) {
      return { success: false, error: "No organization ID", data: undefined };
    }

    const transactions = await db.inventoryTransaction.findMany({
      where: {
        organizationId: userOrgId,
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

export async function getLowStockItemsClientSafe(
  organizationId?: string,
  threshold: number = 10
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return { success: false, error: "Not authenticated", data: undefined };
    }

    const userOrgId = organizationId || session.user.organizationId;

    if (!userOrgId) {
      return { success: false, error: "No organization ID", data: undefined };
    }

    const lowStockItems = await db.inventoryLevel.findMany({
      where: {
        item: {
          organizationId: userOrgId,
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

export async function getLocationsClientSafe(organizationId?: string) {
  try {
    const session = await auth();

    if (!session?.user) {
      return { success: false, error: "Not authenticated", data: undefined };
    }

    const userOrgId = organizationId || session.user.organizationId;

    if (!userOrgId) {
      return { success: false, error: "No organization ID", data: undefined };
    }

    const locations = await db.location.findMany({
      where: {
        organizationId: userOrgId,
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
