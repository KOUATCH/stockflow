"use server";

import { db } from "@/prisma/db";
import { UpdateTaxRatePayload } from "@/types/taxRates";
import { revalidatePath } from "next/cache";

const updateTaxRateById = async (id: string, data: UpdateTaxRatePayload) => {
  try {
    // Use a transaction for atomic operations
    return await db.$transaction(async (tx) => {
      const TaxRate = await tx.taxRate.findUnique({
        where: { id },
      });
  
      if (!TaxRate) {
        throw new Error("TaxRate not found");
      }
      // Exclude 'id' from the update data to avoid type errors
      const { id: _id, ...updateData } = data;
      await tx.taxRate.update({
        where: { id },
        data: updateData
      })
      revalidatePath("/inventory/TaxRates");
      return {
        data: TaxRate,
        success: true,
        error: null,
      }
     })
    } catch (error) {
      console.error("Error fetching TaxRate:", error);
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : "Failed to update TaxRate",
      };
    }
  }

export default updateTaxRateById