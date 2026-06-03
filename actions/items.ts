"use server";

import { db } from "@/prisma/db";
import { revalidatePath } from "next/cache";

function normalizeItemMutationData(itemData: any) {
  const { name, description, imageUrls, ...rest } = itemData;
  const data = { ...rest };

  if (!data.nameEn && name) {
    data.nameEn = name;
  }

  if (!data.descriptionEn && description) {
    data.descriptionEn = description;
  }

  if (imageUrls !== undefined) {
    data.imageUrls = Array.isArray(imageUrls) ? imageUrls : [imageUrls];
  }

  return data;
}

const itemRelationsInclude = {
  category: true,
  brand: true,
  unit: true,
} as const;

function mapLegacyItemShape(item: any) {
  return {
    ...item,
    name: item.nameEn ?? item.nameFr ?? "",
    description: item.descriptionEn ?? item.descriptionFr ?? null,
    categories: item.category,
    brands: item.brand,
    units: item.unit,
  };
}

// Get all items for an organization
export async function getItems() {
  try {

    const items = await db.item.findMany({
      orderBy: {
        nameEn: "desc",
      },
      include: itemRelationsInclude,
    });

    return {
      success: true,
      data: items.map(mapLegacyItemShape),
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
        nameEn: "desc",
      },
      include: itemRelationsInclude,
    });

    return {
      success: true,
      data: items.map(mapLegacyItemShape),
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
        nameEn: true,
        nameFr: true,
        sku: true,
        costPrice: true,
        sellingPrice: true,
        minStockLevel: true,
        categoryId: true,
        brandId: true,
      },
      orderBy: {
        nameEn: "asc",
      },
    });

    return {
      success: true,
      data: items.map((item) => ({
        ...item,
        name: item.nameEn,
        buyingPrice: item.costPrice,
        qty: item.minStockLevel,
      })),
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
      data: normalizeItemMutationData(itemData),
      include: itemRelationsInclude,
    });

    revalidatePath("/dashboard/inventory/items");

    return {
      success: true,
      data: mapLegacyItemShape(newItem),
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
      data: normalizeItemMutationData(itemData),
      include: itemRelationsInclude,
    });

    revalidatePath("/dashboard/inventory/items");

    return {
      success: true,
      data: mapLegacyItemShape(updatedItem),
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
