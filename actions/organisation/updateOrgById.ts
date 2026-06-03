"use server";

import { db } from "@/prisma/db";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

// Define or import the ItemCreateDTO type
import { ItemCreateDTO } from "@/types/item";

const updateItemById=async (id: string, data: ItemCreateDTO) =>{
  try {
    const { name, description, imageUrls, ...rest } = data as ItemCreateDTO & {
      name?: string;
      description?: string;
      imageUrls?: string | string[];
    };
    const updateData: Prisma.ItemUpdateInput = {};
    const nameEn = rest.nameEn || name;
    const descriptionEn = rest.descriptionEn || description;

    if (nameEn !== undefined) updateData.nameEn = nameEn;
    if (rest.nameFr !== undefined) updateData.nameFr = rest.nameFr;
    if (descriptionEn !== undefined) updateData.descriptionEn = descriptionEn;
    if (rest.descriptionFr !== undefined) updateData.descriptionFr = rest.descriptionFr;
    if (rest.slug !== undefined) updateData.slug = rest.slug;
    if (rest.sku !== undefined) updateData.sku = rest.sku;
    if (rest.costPrice !== undefined) updateData.costPrice = rest.costPrice;
    if (rest.sellingPrice !== undefined) updateData.sellingPrice = rest.sellingPrice;
    if (rest.thumbnail !== undefined) updateData.thumbnail = rest.thumbnail;

    if (imageUrls !== undefined) {
      updateData.imageUrls = Array.isArray(imageUrls) ? imageUrls : [imageUrls];
    }

    const item = await db.item.findUnique({
      where: { id },
    });

    if (!item) {
      throw new Error("Item not found");
    }
 await db.item.update({
  where:{id},
  data:updateData
 })
     revalidatePath("/inventory/items");
    return { success: true, data: item };
  } catch (error) {
    console.error("Error fetching item:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch item",
    };
  }
}
export default updateItemById
