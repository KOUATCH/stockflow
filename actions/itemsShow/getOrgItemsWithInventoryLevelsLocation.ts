"use server";
import { db } from "@/prisma/db";
import { ItemWithInventoryLevelsPayload } from "@/types/itemTypes";

const getOrgItemsWithInventoryLevelsLocation = async (orgId: string, locationId: string) => {
  try {
    // Validate orgId
    if (!orgId) {
      throw new Error("Organization ID is required");
    }

    // Fetch items for the organization
    const items: ItemWithInventoryLevelsPayload[] = await db.item.findMany({
      where: {
        organizationId: orgId,
        isActive: true, // Optional: filter for active items only
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        name: true,
        slug: true,
        costPrice: true,
        sellingPrice: true,
        createdAt: true,
        updatedAt: true,
        imageUrls: true,
        thumbnail: true,
        organizationId: true,
        isActive: true,
        isDiscontinued: true,
        sku: true,
        minStockLevel: true,
        brand: {
          select: {
            id: true,
            brandName: true,
          }
        },
        category: {
          select: {
            id: true,
            title: true,
          }
        },
        inventoryLevels: {
            where:{
              locationId
            },
             select: {
            id: true,
            quantityOnHand: true,
            quantityReserved: true,
            quantityAvailable: true,
            quantityInTransit: true,
            quantityOnOrder: true,
            reorderPoint: true,
            totalValue: true,
          },
        },
      },
    });

    // Check if items array is empty (more appropriate than checking !items)
    if (items.length === 0) {
      return { 
        data: [], 
        success: true, 
        error: null,
        message: "No items found for this organization" 
      };
    }

    return { 
      data: items, 
      success: true,
       error: null,
       message: "Items fetched successfully"
    };
  } catch (error) {
    console.error("Error fetching items with inventory levels:", error);
    return {
      data: null,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
};

export default getOrgItemsWithInventoryLevelsLocation;