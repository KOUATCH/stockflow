"use server";

import { db } from "@/prisma/db";
import { revalidatePath } from "next/cache";

// Define or import the ItemCreateDTO type
import { ItemCreateDTO } from "@/types/item";

const updateItemById=async (id: string, data: ItemCreateDTO) =>{
  try {
    const item = await db.item.findUnique({
      where: { id },
    });

    if (!item) {
      throw new Error("Item not found");
    }
 await db.item.update({
  where:{id},
  data:{...data}
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