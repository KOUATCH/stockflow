"use server";

import { db } from "@/prisma/db";
import { revalidatePath } from "next/cache";

import { UpdateItemDetailsPayload } from "@/types/itemTypes";


const updateItemDetailsById = async (id: string, data: UpdateItemDetailsPayload) => {
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
      await tx.item.update({
        where: { id },
        data: updateData
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

export default updateItemDetailsById