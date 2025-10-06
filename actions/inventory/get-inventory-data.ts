'use server'

import { getAuthenticatedUser } from "@/lib/auth-server";
import { db } from "@/prisma/db";
import { InventoryLevelResponse, InventoryTransactionResponse } from "@/types/inventory";

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
            name: true,
            sku: true,
            slug: true,
            imageUrls: true,
            costPrice: true,
            sellingPrice: true,
            thumbnail: true,
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
        { item: { name: 'asc' } },
        { location: { name: 'asc' } },
      ],
    });

    return {
      success: true,
      data: levels,
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
            name: true,
            sku: true,
          },
        },
        location: {
          select: {
            name: true,
          },
        },
        createdBy: {
          select: {
            name: true,
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
      data: transactions,
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
            name: true,
            sku: true,
            slug: true,
            imageUrls: true,
            minStockLevel: true,
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
      data: lowStockItems,
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
