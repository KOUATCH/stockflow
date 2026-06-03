"use server";

import { db } from "@/prisma/db";
import { revalidatePath } from "next/cache";

// Get inventory levels for an organization
export async function getInventoryLevels(organizationId: string) {
  try {

    const inventoryLevels = await db.inventoryLevel.findMany({
      where: {
        item: {
          organizationId: organizationId
        }
      },
      include: {
        item: {
          select: {
            id: true,
            nameEn: true,
            sku: true,
            descriptionEn: true,
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
        { item: { nameEn: "asc" } },
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
            nameEn: true,
            sku: true,
          }
        },
        location: {
          select: {
            id: true,
            name: true,
          }
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
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
      const inventory = await db.inventoryLevel.findUnique({
        where: {
          itemId_locationId: {
            itemId: reservation.itemId,
            locationId: reservation.locationId,
          }
        },
        include: {
          item: {
            select: {
              organizationId: true,
            },
          },
        },
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

      if (Number(inventory.quantityAvailable) < reservation.quantity) {
        results.push({
          itemId: reservation.itemId,
          locationId: reservation.locationId,
          success: false,
          error: "Insufficient inventory available",
        });
        continue;
      }

      // Reserve the inventory
      await db.inventoryLevel.update({
        where: {
          itemId_locationId: {
            itemId: reservation.itemId,
            locationId: reservation.locationId,
          }
        },
        data: {
          quantityAvailable: { decrement: reservation.quantity },
          quantityReserved: { increment: reservation.quantity },
          lastTransactionAt: new Date(),
          version: { increment: 1 },
        }
      });

      // Create inventory transaction record
      await db.inventoryTransaction.create({
        data: {
          itemId: reservation.itemId,
          locationId: reservation.locationId,
          organizationId: inventory.item.organizationId,
          type: "RESERVATION",
          quantity: reservation.quantity,
          notes: "Inventory reserved for order",
          createdById: userId,
          balanceAfter: inventory.quantityOnHand,
          serialNumbers: [],
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
      const inventory = await db.inventoryLevel.findUnique({
        where: {
          itemId_locationId: {
            itemId: reservation.itemId,
            locationId: reservation.locationId,
          }
        },
        include: {
          item: {
            select: {
              organizationId: true,
            },
          },
        },
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

      if (Number(inventory.quantityReserved) < reservation.quantity) {
        results.push({
          itemId: reservation.itemId,
          locationId: reservation.locationId,
          success: false,
          error: "Not enough reserved inventory to release",
        });
        continue;
      }

      // Release the inventory
      await db.inventoryLevel.update({
        where: {
          itemId_locationId: {
            itemId: reservation.itemId,
            locationId: reservation.locationId,
          }
        },
        data: {
          quantityAvailable: { increment: reservation.quantity },
          quantityReserved: { decrement: reservation.quantity },
          lastTransactionAt: new Date(),
          version: { increment: 1 },
        }
      });

      // Create inventory transaction record
      await db.inventoryTransaction.create({
        data: {
          itemId: reservation.itemId,
          locationId: reservation.locationId,
          organizationId: inventory.item.organizationId,
          type: "RESERVATION_RELEASE",
          quantity: reservation.quantity,
          notes: "Reserved inventory released",
          createdById: userId,
          balanceAfter: inventory.quantityOnHand,
          serialNumbers: [],
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
