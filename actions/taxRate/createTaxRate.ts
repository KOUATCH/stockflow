"use server"
import { getAuthenticatedUser } from "@/config/useAuth"
import { db } from "@/prisma/db"
import type { TaxRateCreateDTO } from "@/types/taxRates"
import { revalidatePath } from "next/cache"

const createTaxRate = async (data: TaxRateCreateDTO) => {
  try {
    return await db.$transaction(async (tx) => {
      const user = await getAuthenticatedUser()
      if (!user || !user.organizationId) {
        return {
          error: `User not found`,
          success: false,
          data: null,
        }
      }

      const taxRateData = {
        ...data,
        organizationId: user.organizationId,
      }

      const existingTaxRate = await tx.taxRate.findUnique({
        where: {
          organizationId_taxRateName: {
            taxRateName: data.taxRateName,
            organizationId: user.organizationId,
          },
        },
      })

      if (existingTaxRate) {
        return {
          error: `This taxRate ${data?.taxRateName} has already been created`,
          success: false,
          data: null,
        }
      }

      const newtaxRate = await tx.taxRate.create({
        data: taxRateData,
      })

      revalidatePath("/inventory/taxRates")

      return {
        error: null,
        success: true,
        data: newtaxRate,
      }
    })
  } catch (error) {
    console.error("Error creating taxRate:", error)
    return {
      error: `Something went wrong, Please try again`,
      success: false,
      data: null,
    }
  }
}

export default createTaxRate
