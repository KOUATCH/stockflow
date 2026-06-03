"use server"

import { createManagedTaxRate } from "@/actions/taxRate/tax-rate-management-actions"
import type { TaxRateManagementInput } from "@/actions/taxRate/tax-rate-management-actions"
import { getAuthenticatedUser } from "@/config/useAuth"
import type { TaxRateCreateDTO } from "@/types/taxRates"

function normalizeTaxRateInput(data: TaxRateCreateDTO): TaxRateManagementInput {
  return {
    nameEn: data.nameEn ?? data.taxRateName ?? data.name ?? "",
    nameFr: data.nameFr ?? null,
    rate: Number(data.rate ?? 0),
    type: (data.type as TaxRateManagementInput["type"]) ?? "SALES",
    isActive: data.isActive ?? true,
  }
}

const createTaxRate = async (data: TaxRateCreateDTO) => {
  try {
    const user = await getAuthenticatedUser()

    if (!user?.organizationId) {
      return {
        error: "Organization is required",
        success: false,
        data: null,
      }
    }

    const result = await createManagedTaxRate(user.organizationId, normalizeTaxRateInput(data))

    return {
      error: result.error ?? null,
      success: result.success,
      data: result.data ?? null,
    }
  } catch (error) {
    console.error("Error creating taxRate:", error)
    return {
      error: error instanceof Error ? error.message : "Something went wrong, please try again",
      success: false,
      data: null,
    }
  }
}

export default createTaxRate
