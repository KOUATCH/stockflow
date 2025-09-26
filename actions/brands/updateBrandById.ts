"use server";

import { db } from "@/prisma/db";
import { UpdateBrandPayload } from "@/types/brand";
import { revalidatePath } from "next/cache";

const updatebrandById = async (id: string, data: UpdateBrandPayload) => {
  try {
    // Use a transaction for atomic operations
    return await db.$transaction(async (tx) => {
      const brand = await tx.brand.findUnique({
        where: { id },
      });
  
      if (!brand) {
        throw new Error("brand not found");
      }
      await tx.brand.update({
        where: { id },
        data: { ...data }
      })
      revalidatePath("/inventory/brands");
      return {
        data: brand,
        success: true,
        error: null,
      }
     })
    } catch (error) {
      console.error("Error fetching brand:", error);
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : "Failed to update brand",
      };
    }
  }

export default updatebrandById