"use server"

import { getAuthenticatedUser } from "@/config/useAuth"
import { db } from "@/prisma/db"

const deleteTaxRate = async (id: string) => {
  try {
    // Use a transaction for atomic operations
    return await db.$transaction(async (tx) => {
      const user = await getAuthenticatedUser()
      // Check if the user is authenticated and has an organizationId
      if (!user || !user.organizationId) {
        return {
          error: `User not found`,
          success: false,
          data: null,
        }
      }
      //check if the TaxRate already exists
      const existingTaxRate = await tx.taxRate.findUnique({
        where: {
          id: id,
          organizationId: user.organizationId,
        },
      })

      if (!existingTaxRate) {
        return {
          error: `Something went wrong, TaxRate not found`,
          success: false,
          data: null,
        }
      }

      const deletedTaxRate = await tx.taxRate.delete({
        where: {
          id: id,
        },
      })

      return {
        success: true,
        error: null,
        data: deletedTaxRate,
      }
    })
  } catch (error) {
    console.error("Error deleting TaxRate:", error)
    return {
      error: `Something went wrong, Please try again`,
      success: false,
      data: null,
    }
  }
}
export default deleteTaxRate
