"use server";

import { db } from "@/prisma/db";
import { revalidatePath } from "next/cache";

// Get inventory levels for an organization
export async function getInventoryLevels(organizationId: string) {
  try {

    const inventoryLevels = await db.inventory.findMany({
      where: {
        item: {
          organizationId: organizationId
        }
      },
      include: {
        item: {
          select: {
            id: true,
            name: true,
            sku: true,
            description: true,
          }
        },
        location: {
          select: {
            id: true,
            name: true,
          }
        }
      },
      orderBy: [
        { item: { name: "asc" } },
        { location: { name: "asc" } }
      ]
    });

    return {
      success: true,
      data: inventoryLevels,
    };
  } catch (error) {
    console.error("Error fetching inventory levels:", error);
    return {
      success: false,
      error: "Failed to fetch inventory levels",
    };
  }
}

// Get inventory transactions for an organization
export async function getInventoryTransactions(organizationId: string) {
  try {

    const transactions = await db.inventoryTransaction.findMany({
      where: {
        item: {
          organizationId: organizationId
        }
      },
      include: {
        item: {
          select: {
            id: true,
            name: true,
            sku: true,
          }
        },
        location: {
          select: {
            id: true,
            name: true,
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      },
      orderBy: { createdAt: "desc" },
      take: 100 // Limit to recent 100 transactions
    });

    return {
      success: true,
      data: transactions,
    };
  } catch (error) {
    console.error("Error fetching inventory transactions:", error);
    return {
      success: false,
      error: "Failed to fetch inventory transactions",
    };
  }
}

// Reserve inventory for items
export async function reserveInventory(reservations: {
  itemId: string;
  locationId: string;
  quantity: number;
}[], userId: string) {
  try {

    const results = [];

    for (const reservation of reservations) {
      // Check current inventory level
      const inventory = await db.inventory.findUnique({
        where: {
          itemId_locationId: {
            itemId: reservation.itemId,
            locationId: reservation.locationId,
          }
        }
      });

      if (!inventory) {
        results.push({
          itemId: reservation.itemId,
          locationId: reservation.locationId,
          success: false,
          error: "Inventory record not found",
        });
        continue;
      }

      if (inventory.availableQuantity < reservation.quantity) {
        results.push({
          itemId: reservation.itemId,
          locationId: reservation.locationId,
          success: false,
          error: "Insufficient inventory available",
        });
        continue;
      }

      // Reserve the inventory
      await db.inventory.update({
        where: {
          itemId_locationId: {
            itemId: reservation.itemId,
            locationId: reservation.locationId,
          }
        },
        data: {
          availableQuantity: inventory.availableQuantity - reservation.quantity,
          reservedQuantity: inventory.reservedQuantity + reservation.quantity,
        }
      });

      // Create inventory transaction record
      await db.inventoryTransaction.create({
        data: {
          itemId: reservation.itemId,
          locationId: reservation.locationId,
          type: "RESERVE",
          quantity: reservation.quantity,
          reason: "Inventory reserved for order",
          userId: userId,
        }
      });

      results.push({
        itemId: reservation.itemId,
        locationId: reservation.locationId,
        success: true,
        quantity: reservation.quantity,
      });
    }

    revalidatePath("/dashboard/inventory");

    return {
      success: true,
      data: results,
    };
  } catch (error) {
    console.error("Error reserving inventory:", error);
    return {
      success: false,
      error: "Failed to reserve inventory",
    };
  }
}

// Release reserved inventory
export async function releaseInventory(reservations: {
  itemId: string;
  locationId: string;
  quantity: number;
}[], userId: string) {
  try {

    const results = [];

    for (const reservation of reservations) {
      // Check current inventory level
      const inventory = await db.inventory.findUnique({
        where: {
          itemId_locationId: {
            itemId: reservation.itemId,
            locationId: reservation.locationId,
          }
        }
      });

      if (!inventory) {
        results.push({
          itemId: reservation.itemId,
          locationId: reservation.locationId,
          success: false,
          error: "Inventory record not found",
        });
        continue;
      }

      if (inventory.reservedQuantity < reservation.quantity) {
        results.push({
          itemId: reservation.itemId,
          locationId: reservation.locationId,
          success: false,
          error: "Not enough reserved inventory to release",
        });
        continue;
      }

      // Release the inventory
      await db.inventory.update({
        where: {
          itemId_locationId: {
            itemId: reservation.itemId,
            locationId: reservation.locationId,
          }
        },
        data: {
          availableQuantity: inventory.availableQuantity + reservation.quantity,
          reservedQuantity: inventory.reservedQuantity - reservation.quantity,
        }
      });

      // Create inventory transaction record
      await db.inventoryTransaction.create({
        data: {
          itemId: reservation.itemId,
          locationId: reservation.locationId,
          type: "RELEASE",
          quantity: reservation.quantity,
          reason: "Reserved inventory released",
          userId: userId,
        }
      });

      results.push({
        itemId: reservation.itemId,
        locationId: reservation.locationId,
        success: true,
        quantity: reservation.quantity,
      });
    }

    revalidatePath("/dashboard/inventory");

    return {
      success: true,
      data: results,
    };
  } catch (error) {
    console.error("Error releasing inventory:", error);
    return {
      success: false,
      error: "Failed to release inventory",
    };
  }
}