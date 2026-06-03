"use server"

import { updateManagedTaxRate } from "@/actions/taxRate/tax-rate-management-actions"
import type { TaxRateManagementInput } from "@/actions/taxRate/tax-rate-management-actions"
import { getAuthenticatedUser } from "@/config/useAuth"
import type { UpdateTaxRatePayload } from "@/types/taxRates"

function normalizeTaxRateInput(data: UpdateTaxRatePayload): TaxRateManagementInput {
  return {
    nameEn: data.nameEn ?? data.taxRateName ?? data.name ?? "",
    nameFr: data.nameFr ?? null,
    rate: Number(data.rate ?? 0),
    type: (data.type as TaxRateManagementInput["type"]) ?? "SALES",
    isActive: data.isActive ?? true,
  }
}

const updateTaxRateByIdNew = async (id: string, data: UpdateTaxRatePayload) => {
  try {
    const user = await getAuthenticatedUser()

    if (!user?.organizationId) {
      return {
        success: false,
        data: null,
        error: "Organization is required",
      }
    }

    const result = await updateManagedTaxRate(user.organizationId, id, normalizeTaxRateInput(data))

    return {
      data: result.data ?? null,
      success: result.success,
      error: result.error ?? null,
    }
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
