"use server";

import { db } from "@/prisma/db";
import { revalidatePath } from "next/cache";

// Get all items for an organization
export async function getItems() {
  try {

    const items = await db.item.findMany({
      orderBy: {
        name: "desc",
      },
      include: {
        category: true,
        brand: true,
        location: true,
        unit: true,
      }
    });

    return {
      success: true,
      data: items,
    };
  } catch (error) {
    console.error("Error fetching items:", error);
    return {
      success: false,
      error: "Failed to fetch items",
    };
  }
}

// Get items by organization ID
export async function getItemsByOrganization(organizationId: string) {
  try {

    const items = await db.item.findMany({
      where: {
        organizationId,
      },
      orderBy: {
        name: "desc",
      },
      include: {
        category: true,
        brand: true,
        location: true,
        unit: true,
      }
    });

    return {
      success: true,
      data: items,
    };
  } catch (error) {
    console.error("Error fetching items by organization:", error);
    return {
      success: false,
      error: "Failed to fetch items for organization",
    };
  }
}

// Get brief items (minimal data)
export async function getBriefItems(organizationId?: string) {
  try {

    const whereClause = organizationId ? { organizationId } : {};

    const items = await db.item.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        sku: true,
        buyingPrice: true,
        sellingPrice: true,
        qty: true,
        categoryId: true,
        brandId: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return {
      success: true,
      data: items,
    };
  } catch (error) {
    console.error("Error fetching brief items:", error);
    return {
      success: false,
      error: "Failed to fetch brief items",
    };
  }
}

// Create a new item
export async function createItem(itemData: any) {
  try {

    const newItem = await db.item.create({
      data: itemData,
      include: {
        category: true,
        brand: true,
        location: true,
        unit: true,
      }
    });

    revalidatePath("/dashboard/inventory/items");

    return {
      success: true,
      data: newItem,
    };
  } catch (error) {
    console.error("Error creating item:", error);
    return {
      success: false,
      error: "Failed to create item",
    };
  }
}

// Update an item
export async function updateItem(itemId: string, itemData: any) {
  try {

    const updatedItem = await db.item.update({
      where: { id: itemId },
      data: itemData,
      include: {
        category: true,
        brand: true,
        location: true,
        unit: true,
      }
    });

    revalidatePath("/dashboard/inventory/items");

    return {
      success: true,
      data: updatedItem,
    };
  } catch (error) {
    console.error("Error updating item:", error);
    return {
      success: false,
      error: "Failed to update item",
    };
  }
}

// Delete an item
export async function deleteItem(itemId: string) {
  try {

    await db.item.delete({
      where: { id: itemId },
    });

    revalidatePath("/dashboard/inventory/items");

    return {
      success: true,
      message: "Item deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting item:", error);
    return {
      success: false,
      error: "Failed to delete item",
    };
  }
}