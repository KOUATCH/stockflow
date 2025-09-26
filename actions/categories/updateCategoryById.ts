"use server";

import { db } from "@/prisma/db";
import { CategoryCreateDTO } from "@/types/category";
import { revalidatePath } from "next/cache";


const updateCategoryById=async (id: string, data: CategoryCreateDTO) =>{
  try {
    const category = await db.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new Error("Category not found");
    }
 await db.category.update({
  where:{id},
  data:{...data}
 })
     revalidatePath("/dashboard/inventory/categories");
    return { success: true, data: category };
  } catch (error) {
    console.error("Error fetching category:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch category",
    };
  }
}
export default updateCategoryById