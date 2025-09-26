"use server";

import { db } from "@/prisma/db";
import { UpdateCategoryPayload } from "@/types/category";
import { revalidatePath } from "next/cache";

const NewUpdateCategoryById = async (id: string, data: UpdateCategoryPayload) => {
  try {
    // Use a transaction for atomic operations
    return await db.$transaction(async (tx) => {
      const category = await tx.category.findUnique({
        where: { id },
      });
  
      if (!category) {
        throw new Error("Category not found");
      }
      // Exclude 'id' from the update data to avoid type errors
      const { id: _id, organizationId, ...updateData } = data;

      // Convert nulls to undefined for fields that must not be null
      // Serialize imageUrls array to JSON string if present
      const safeUpdateData = {
        ...updateData,
         title: updateData.title ?? undefined,
        imageUrl: Array.isArray(updateData.imageUrl)
          ? JSON.stringify(updateData.imageUrl)
          : updateData.imageUrl ?? undefined,
      };
      // If organizationId is provided, connect it to the category
      await tx.category.update({
        where: { id },
        data: {
          ...safeUpdateData,
          // Use connect to change the organization relationship
          ...(organizationId && {
            organization: {
              connect: { id: organizationId },
            },
          }),
        }
      })
      revalidatePath("/inventory/categories");
      return {
        data: category,
        success: true,
        error: null,
      }
     })
    } catch (error) {
      console.error("Error fetching category:", error);
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : "Failed to update category",
      };
    }
  }

export default NewUpdateCategoryById