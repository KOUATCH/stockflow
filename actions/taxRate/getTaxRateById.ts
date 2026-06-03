"use server"

import { getAuthenticatedUser } from "@/config/useAuth"
import { getTaxRate } from "@/services/tax-rate/tax-rate.service"

export const getTaxRateById = async (id: string) => {
  try {
    const user = await getAuthenticatedUser()

    if (!user?.organizationId) {
      return {
        success: false,
        data: null,
        error: "Organization is required",
      }
    }

    const taxRate = await getTaxRate(user.organizationId, id)

    if (!taxRate) {
      return {
        success: false,
        data: null,
        error: "Tax rate not found",
      }
    }

    return {
      success: true,
      data: taxRate,
      error: null,
    }
  } catch (error) {
    return {
      data: null,
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch tax rate",
    }
  }
}

export default getTaxRateById
