"use server"

import { db } from "@/prisma/db"
import type { UpdateTaxRatePayload } from "@/types/taxRates"
import { revalidatePath } from "next/cache"

const updateTaxRateByIdNew = async (id: string, data: UpdateTaxRatePayload) => {
  try {
    return await db.$transaction(async (tx) => {
      const existingTaxRate = await tx.taxRate.findUnique({
        where: { id },
      })

      if (!existingTaxRate) {
        return {
          error: "TaxRate not found",
          success: false,
          data: null,
        }
      }

      const { id: _id, createdAt, ...rest } = data
      // Remove organizationId if it's null, as Prisma expects undefined for optional fields
      // Ensure organizationId is undefined if null to satisfy Prisma types
      const updateFields = {
        ...rest,
        ...(rest.organizationId === null
          ? { organizationId: undefined }
          : { organizationId: rest.organizationId }),
      }

      const updatedTaxRate = await tx.taxRate.update({
        where: { id },
        data: updateFields,
      })

      revalidatePath("/inventory/taxRates")

      return {
        data: updatedTaxRate, // Return updated data instead of old data
        success: true,
        error: null,
      }
    })
  } catch (error) {
    console.error("Error updating taxRate:", error)
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : "Failed to update taxRate",
    }
  }
}

export default updateTaxRateByIdNew
