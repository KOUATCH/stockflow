'use server'
import { inventoryAction } from "@/lib/error-handling";
import type { ServerActionResult } from "@/lib/error-handling/types";
import { revalidatePath } from "next/cache";
import { db } from "@/prisma/db";
import { TransactionType, ItemCreateWithInventoryDTO } from "@/types/inventory";
import { getAuthenticatedUser } from "@/config/useAuth";

const DEFAULT_IMAGE_URL = "https://14J7oh8kso.ufs.sh/f/HLxTbDBCDLwfAXaapcezIN7vwylKf1PXSCqAuseUG0gx8mhd";

export const createItemWithInventory = inventoryAction(
  async (data: ItemCreateWithInventoryDTO & { organizationId?: string, userId?: string }): Promise<ServerActionResult<any>> => {
    const user = await getAuthenticatedUser();
    const organizationId = data.organizationId ?? user?.organizationId;

    if (!organizationId) {
      throw new Error("Organization not found");
    }

    const {
      locationId,
      initialQuantity = 0,
      unitCost,
      batchNumber,
      expiryDate,
      notes,
      organizationId: _organizationId,
      userId: _userId,
      ...itemData
    } = data;

    // Generate missing fields
    const sku = itemData.sku || `SKU-${Date.now()}`;
    const slug = itemData.slug || itemData.nameEn.toLowerCase().replace(/\s+/g, '-');

    const formattedItemData = {
      ...itemData,
      sku,
      slug,
      organizationId,
      costPrice: Number(itemData.costPrice ?? 0),
      sellingPrice: Number(itemData.sellingPrice ?? 0),
      imageUrls: itemData.imageUrls ? [itemData.imageUrls] : [DEFAULT_IMAGE_URL],
    };

    const result = await db.$transaction(async (tx) => {
      // Check if item already exists
      const existingItem = await tx.item.findUnique({
        where: {
          organizationId_sku: {
            organizationId,
            sku: sku,
          },
        },
      });

      if (existingItem) {
        throw new Error(`Item with SKU "${sku}" already exists for this organization`);
      }

      // Create the item
      const newItem = await tx.item.create({
        data: formattedItemData,
      });

      // Create initial inventory level if locationId is provided
      if (locationId) {
        const inventoryLevel = await tx.inventoryLevel.create({
          data: {
            itemId: newItem.id,
            locationId,
            quantityOnHand: initialQuantity,
            quantityAvailable: initialQuantity,
            averageCost: unitCost || formattedItemData.costPrice,
            totalValue: (unitCost || formattedItemData.costPrice) * initialQuantity,
            lastTransactionAt: new Date(),
          },
        });

        // Create initial inventory transaction if quantity > 0
        if (initialQuantity > 0) {
          await tx.inventoryTransaction.create({
            data: {
              type: TransactionType.INITIAL_STOCK,
              quantity: initialQuantity,
              unitCost: unitCost || formattedItemData.costPrice,
              totalCost: (unitCost || formattedItemData.costPrice) * initialQuantity,
              notes: notes || `Initial stock for ${newItem.nameEn}`,
              itemId: newItem.id,
              locationId,
            organizationId,
            createdById: data.userId ?? user?.id,
              batchNumber,
              expiryDate,
              serialNumbers: [],
              balanceAfter: initialQuantity,
            },
          });
        }

        return {
          item: newItem,
          inventoryLevel,
        };
      }

      return {
        item: newItem,
        inventoryLevel: null,
      };
    });

    revalidatePath("/inventory/items");
    revalidatePath("/inventory/levels");

    return {
      success: true,
      data: result,
    };
  },
  {
    actionName: 'createItemWithInventory',
    component: 'InventoryManagement',
    businessContext: {
      domain: 'inventory',
      operation: 'create',
      resourceType: 'item'
    }
  }
)
