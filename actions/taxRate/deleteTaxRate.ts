"use server"

import { deleteManagedTaxRate } from "@/actions/taxRate/tax-rate-management-actions"
import { getAuthenticatedUser } from "@/config/useAuth"

const deleteTaxRate = async (id: string) => {
  try {
    const user = await getAuthenticatedUser()

    if (!user?.organizationId) {
      return {
        error: "Organization is required",
        success: false,
        data: null,
      }
    }

    const result = await deleteManagedTaxRate(user.organizationId, id)

    return {
      success: result.success,
      error: result.error ?? null,
      data: result.data ?? null,
    }
  } catch (error) {
    console.error("Error deleting TaxRate:", error)
    return {
      error: error instanceof Error ? error.message : "Something went wrong, please try again",
      success: false,
      data: null,
    }
  }
}

export default deleteTaxRate
