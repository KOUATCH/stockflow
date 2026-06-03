"use server";
import { inventoryAction } from "@/lib/error-handling";
import type { ServerActionResult } from "@/lib/error-handling/types";
import { db } from "@/prisma/db";
import { ItemDTO } from "@/types/itemTypes";

const toNumber = (value: unknown): number => {
  if (value && typeof value === "object" && "toNumber" in value && typeof value.toNumber === "function") {
    return value.toNumber();
  }
  return Number(value ?? 0);
};

const mapItemDTO = (item: any): ItemDTO => ({
  ...item,
  costPrice: toNumber(item.costPrice),
  sellingPrice: toNumber(item.sellingPrice),
  weight: item.weight == null ? null : toNumber(item.weight),
  minStockLevel: item.minStockLevel == null ? null : toNumber(item.minStockLevel),
  maxStockLevel: item.maxStockLevel == null ? null : toNumber(item.maxStockLevel),
  imageUrls: Array.isArray(item.imageUrls) ? item.imageUrls.join(",") : item.imageUrls ?? "",
  name: item.nameEn ?? item.nameFr ?? "",
  description: item.descriptionEn ?? item.descriptionFr ?? "",
});

export const getOrgItemsDTO = inventoryAction(
  async (orgId: string): Promise<ServerActionResult<ItemDTO[]>> => {
    // Fetch items for the organization
    const items = await db.item.findMany({
      where: {
        organizationId: orgId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!items || items.length === 0) {
      throw new Error("No items found for this organization");
    }

    return {
      success: true,
      data: items.map(mapItemDTO)
    };
  },
  {
    actionName: 'getOrgItemsDTO',
    component: 'InventoryManagement',
    businessContext: {
      domain: 'inventory',
      operation: 'read',
      resourceType: 'item'
    }
  }
)
