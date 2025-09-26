"use server";

import { db } from "@/prisma/db";
import { revalidatePath } from "next/cache";

import { UpdateUnitPayload } from "@/types/unit";


const updateUnitById = async (id: string, data: UpdateUnitPayload) => {
  try {
    // Use a transaction for atomic operations
    return await db.$transaction(async (tx) => {
      const unit = await tx.unit.findUnique({
        where: { id },
      });
  
      if (!unit) {
        throw new Error("Unit not found");
      }
      await tx.unit.update({
        where: { id },
        data: { ...data }
      })
      revalidatePath("/inventory/units");
      return {
        data: unit,
        success: true,
        error: null,
      }
     })
    } catch (error) {
      console.error("Error fetching unit:", error);
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : "Failed to update unit",
      };
    }
  }

export default updateUnitById