"use server";
import { inventoryAction } from "@/lib/error-handling";
import type { ServerActionResult } from "@/lib/error-handling/types";
import { db } from "@/prisma/db";

export const getSimpleOrgItems = inventoryAction(
  async (orgId: string): Promise<ServerActionResult<any[]>> => {
    console.log('getSimpleOrgItems called with orgId:', orgId);

    // Validate orgId
    if (!orgId) {
      throw new Error("Organization ID is required");
    }

    // Simple query to fetch items
    const items = await db.item.findMany({
      where: {
        organizationId: orgId,
        isActive: true,
      },
      select: {
        id: true,
        nameEn: true,
        nameFr: true,
        sku: true,
        costPrice: true,
        sellingPrice: true,
        isActive: true,
        createdAt: true,
        organizationId: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10, // Limit to first 10 items for testing
    });

    console.log('Found items:', items.length);
    console.log('Sample items:', items.slice(0, 2));

    return {
      data: items.map((item) => ({ ...item, name: item.nameEn })),
      success: true
    };
  },
  {
    actionName: 'getSimpleOrgItems',
    component: 'InventoryManagement',
    businessContext: {
      domain: 'inventory',
      operation: 'read',
      resourceType: 'item'
    }
  }
)
