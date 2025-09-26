

"use server";
import { db } from "@/prisma/db";


export async function deleteCategory(id: string) {

  try {
    // Use a transaction for atomic operations
    return await db.$transaction(async (tx) => {

      const category = await tx.category.findUnique({
        where: { id },
      })

      if (!category) {
        return {
          error: `Something went wrong, Please try again`,
          success: true,
          data: null,
        };
      }
      const deletedCategory = await db.category.delete({
        where: {
          id,
        },
      });

      return {
        success: true,
        error: null,
        data: deletedCategory
      };

    })
  } catch (error) {
    console.error("Error deleting category:", error);
    return {
      error: `Something went wrong, Please try again`,
      success: false,
      data: null,
    };
  }
}

