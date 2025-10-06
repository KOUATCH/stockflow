'use server'

import { auth } from "@/auth";
import { db } from "@/prisma/db";
import { InventoryLevelResponse, InventoryTransactionResponse } from "@/types/inventory";

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
            code: true,
            type: true
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