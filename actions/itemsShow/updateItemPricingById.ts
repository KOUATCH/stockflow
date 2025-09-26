"use server";

import { db } from "@/prisma/db";
import { revalidatePath } from "next/cache";

import { UpdateItemPricingPayload } from "@/types/itemTypes";


const updateItemPricingById = async (id: string, data: UpdateItemPricingPayload) => {
  try {
    // Use a transaction for atomic operations
    return await db.$transaction(async (tx) => {
      const item = await tx.item.findUnique({
        where: { id },
      });
  
      if (!item) {
        throw new Error("Item not found");
      }
      // Exclude 'id' from data before updating
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

export default updateItemPricingById