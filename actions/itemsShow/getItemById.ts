"use server";
import { db } from "@/prisma/db";
import { inventoryAction } from "@/lib/error-handling";
import type { ServerActionResult } from "@/lib/error-handling/types";


export const getItemById = inventoryAction(
  async (id: string): Promise<ServerActionResult<any>> => {
  try {
    const item = await db.item.findUnique({
      where: {
        id,
      },
      include: {
        inventoryLevels: true,
        category: true,
        brand: true,
        unit: true,
      },
    });
    return {
      success: true,
      data: item
    };
  } catch (error) {
    throw error;
  }
  },
  {
    actionName: 'getItemById',
    component: 'InventoryManagement',
    businessContext: {
      domain: 'inventory',
      operation: 'read',
      resourceType: 'item'
    }
  }
);
