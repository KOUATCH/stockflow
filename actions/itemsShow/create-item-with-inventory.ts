'use server'

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { db } from "@/prisma/db";
import { TransactionType, ItemCreateWithInventoryDTO } from "@/types/inventory";

// Import your auth options - adjust this path based on your project structure
// Try one of these imports based on where your auth config is located:
// import { authOptions } from "@/lib/auth";
// import { authOptions } from "@/config/auth";
// import { authOptions } from "../../lib/auth";

// For now, I'll create a function to get the session without importing authOptions
// You can replace this with your actual authOptions import
async function getAuthSession() {
  // Replace this with: return await getServerSession(authOptions);
  // For now, we'll use a basic session check
  const session = await getServerSession();
  return session;
}

const DEFAULT_IMAGE_URL = "https://14J7oh8kso.ufs.sh/f/HLxTbDBCDLwfAXaapcezIN7vwylKf1PXSCqAuseUG0gx8mhd";

export async function createItemWithInventory(data: ItemCreateWithInventoryDTO) {
  const session = await getAuthSession();
  
  if (!session?.user?.organizationId) {
    return {
      success: false,
      error: "User not authenticated or missing organization",
      data: null,
    };
  }

  const {
    locationId,
    initialQuantity = 0,
    unitCost,
    batchNumber,
    expiryDate,
    notes,
    ...itemData
  } = data;

  // Generate missing fields
  const sku = itemData.sku || `SKU-${Date.now()}`;
  const slug = itemData.slug || itemData.name.toLowerCase().replace(/\s+/g, '-');

  const formattedItemData = {
    ...itemData,
    sku,
    slug,
    organizationId: session.user.organizationId,
    costPrice: Number(itemData.costPrice ?? 0),
    sellingPrice: Number(itemData.sellingPrice ?? 0),
    imageUrls: Array.isArray(itemData.imageUrls) ? itemData.imageUrls[0] || DEFAULT_IMAGE_URL : DEFAULT_IMAGE_URL,
  };

  try {
    const result = await db.$transaction(async (tx) => {
      // Check if item already exists
      const existingItem = await tx.item.findUnique({
        where: {
          organizationId_sku: {
            organizationId: session.user.organizationId,
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
              notes: notes || `Initial stock for ${newItem.name}`,
              itemId: newItem.id,
              locationId,
              organizationId: session.user.organizationId,
              createdById: session.user.id,
              batchNumber,
              expiryDate,
              serialNumbers: [],
              balanceAfter: initialQuantity,
            },
          });
        }

        return {
          success: true,
          data: {
            item: newItem,
            inventoryLevel,
          },
          error: null,
        };
      }

      return {
        success: true,
        data: {
          item: newItem,
          inventoryLevel: null,
        },
        error: null,
      };
    });

    revalidatePath("/inventory/items");
    revalidatePath("/inventory/levels");
    return result;
  } catch (error) {
    console.error("Error creating item with inventory:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      data: null,
    };
  }
}
