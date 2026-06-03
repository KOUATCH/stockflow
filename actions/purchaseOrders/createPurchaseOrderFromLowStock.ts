"use server";

import { db } from "@/prisma/db";
import { revalidatePath } from "next/cache";

interface CreatePurchaseOrderData {
  itemIds: string[];
  supplierId?: string;
  locationId?: string;
  notes?: string;
  urgentDelivery?: boolean;
}

const toNumber = (value: unknown): number => {
  if (value == null) return 0;
  if (typeof value === "number") return value;
  if (typeof value === "bigint") return Number(value);
  if (typeof value === "string") return Number(value) || 0;
  if (typeof value === "object" && "toNumber" in value && typeof value.toNumber === "function") {
    return value.toNumber();
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const createPurchaseOrderFromLowStock = async (
  organizationId: string,
  data: CreatePurchaseOrderData
) => {
  try {
    // Get items with their preferred suppliers and calculate quantities needed
    const items = await db.item.findMany({
      where: {
        id: { in: data.itemIds },
        organizationId,
      },
      include: {
        inventoryLevels: true,
        supplierItems: {
          include: {
            supplier: true,
          },
          where: {
            isPreferred: true,
          },
        },
        unit: true,
      },
    });

    if (items.length === 0) {
      return {
        success: false,
        error: "No items found",
        data: null,
      };
    }

    // Generate order number
    const orderNumber = `PO-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Calculate total amount and prepare order lines
    let totalAmount = 0;
    const orderLines = [];

    for (const item of items) {
      const currentStock = toNumber(item.inventoryLevels[0]?.quantityOnHand);
      const reorderPoint =
        toNumber(item.inventoryLevels[0]?.reorderPoint) || toNumber(item.minStockLevel) || 10;
      const quantityNeeded = Math.max(reorderPoint - currentStock, 1);

      // Use preferred supplier or the provided supplier
      const preferredSupplier = item.supplierItems[0];
      const unitCost = toNumber(preferredSupplier?.unitCost) || toNumber(item.costPrice);
      const lineTotal = quantityNeeded * unitCost;

      totalAmount += lineTotal;

      orderLines.push({
        itemId: item.id,
        orderedQuantity: quantityNeeded,
        unitCost,
        lineTotal,
        notes: `Auto-generated from low stock alert. Current: ${currentStock}, Reorder point: ${reorderPoint}`,
      });
    }

    const supplierId = data.supplierId || items[0].supplierItems[0]?.supplierId;
    if (!supplierId) {
      return {
        success: false,
        error: "A supplier is required to create a purchase order",
        data: null,
      };
    }

    const location =
      data.locationId
        ? await db.location.findFirst({
            where: {
              id: data.locationId,
              organizationId,
              deletedAt: null,
            },
            select: { id: true },
          })
        : await db.location.findFirst({
            where: {
              organizationId,
              deletedAt: null,
              isActive: true,
            },
            orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
            select: { id: true },
          });

    if (!location) {
      return {
        success: false,
        error: "A location is required to create a purchase order",
        data: null,
      };
    }

    // Create the purchase order
    const purchaseOrder = await db.purchaseOrder.create({
      data: {
        orderNumber,
        organizationId,
        supplierId,
        locationId: location.id,
        status: "SUBMITTED",
        orderDate: new Date(),
        expectedDeliveryDate: data.urgentDelivery
          ? new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days for urgent
          : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days normal
        subtotal: totalAmount,
        taxAmount: totalAmount * 0.1, // 10% tax
        total: totalAmount * 1.1,
        notes: `${data.notes || ""}\n\nGenerated from low stock analysis on ${new Date().toISOString()}`.trim(),
        lines: {
          create: orderLines,
        },
      },
      include: {
        lines: {
          include: {
            item: {
              include: {
                unit: true,
              },
            },
          },
        },
        supplier: true,
      },
    });

    revalidatePath("/dashboard/purchases/orders");
    revalidatePath("/dashboard/inventory/stock/low-stock");

    return {
      success: true,
      data: purchaseOrder,
      error: null,
    };
  } catch (error) {
    console.error("Error creating purchase order from low stock:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create purchase order",
      data: null,
    };
  }
};
