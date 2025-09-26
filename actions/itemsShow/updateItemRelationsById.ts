"use server";

import { db } from "@/prisma/db";
import { UpdateItemRelationsPayload } from "@/types/itemTypes";
import { revalidatePath } from "next/cache";



const updateItemRelationsById = async (id: string, data: UpdateItemRelationsPayload) => {
  try {
    // Use a transaction for atomic operations
    return await db.$transaction(async (tx) => {
      const item = await tx.item.findUnique({
        where: { id },
      });
  
      if (!item) {
        throw new Error("Item not found");
      }
      await tx.item.update({
        where: { id },
        data: { ...data }
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

export default updateItemRelationsById

