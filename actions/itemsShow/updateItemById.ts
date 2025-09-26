"use server";

import { db } from "@/prisma/db";
import { UpdateItemPayload } from "@/types/item";
import { revalidatePath } from "next/cache";

const updateItemById = async (id: string, data: UpdateItemPayload) => {
  try {
    // Use a transaction for atomic operations
    return await db.$transaction(async (tx) => {
      const item = await tx.item.findUnique({
        where: { id },
      });
  
      if (!item) {
        throw new Error("Item not found");
      }
      // Exclude 'id' from the update data to avoid type errors
      const { id: _id, ...updateData } = data;

      // Convert nulls to undefined for fields that must not be null
      // Serialize imageUrls array to JSON string if present
      const safeUpdateData = {
        ...updateData,
        name: updateData.name ?? undefined,
        thumbnail: updateData.thumbnail ?? undefined,
        imageUrls: Array.isArray(updateData.imageUrls)
          ? JSON.stringify(updateData.imageUrls)
          : updateData.imageUrls ?? undefined,
      };

      await tx.item.update({
        where: { id },
        data: safeUpdateData
      })
      revalidatePath("/inventory/items");
      return {
        data: item,
        success: true,
        error: null,
      }
     })
    } catch (error) {
      console.error("Error fetching item:", error);
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : "Failed to update item",
      };
    }
  }

export default updateItemById