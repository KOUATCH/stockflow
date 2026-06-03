"use server"

import {
  createManagedTaxRate,
  deleteManagedTaxRate,
  getTaxRateManagementData,
  updateManagedTaxRate,
} from "@/actions/taxRate/tax-rate-management-actions"
import type { TaxRateManagementInput } from "@/actions/taxRate/tax-rate-management-actions"

export interface TaxRateDTO {
  id: string
  name: string
  nameEn: string
  nameFr?: string | null
  taxRateName: string
  rate: string
  type: string
  isActive: boolean
  organizationId: string
  createdAt: Date
  updatedAt: Date
}

type LegacyTaxRateInput = {
  id?: string
  organizationId: string
  name?: string
  nameEn?: string
  nameFr?: string | null
  taxRateName?: string
  rate?: number | string
  type?: string
  isActive?: boolean
}

function normalizeTaxRateInput(data: LegacyTaxRateInput): TaxRateManagementInput {
  return {
    nameEn: data.nameEn ?? data.taxRateName ?? data.name ?? "",
    nameFr: data.nameFr ?? null,
    rate: Number(data.rate ?? 0),
    type: (data.type as TaxRateManagementInput["type"]) ?? "SALES",
    isActive: data.isActive ?? true,
  }
}

export async function getOrgTaxRates(organizationId: string): Promise<{
  success: boolean
  data?: TaxRateDTO[]
  error?: string
}> {
  const result = await getTaxRateManagementData(organizationId)

  if (!result.success || !result.data) {
    return {
      success: false,
      error: result.error || "Failed to fetch tax rates",
      data: [],
    }
  }

  return {
    success: true,
    data: result.data.taxRates.map((taxRate) => ({
      ...taxRate,
      rate: taxRate.rate,
    })),
  }
}

export async function createTaxRate(data: LegacyTaxRateInput): Promise<{
  success: boolean
  data?: TaxRateDTO
  error?: string
}> {
  const result = await createManagedTaxRate(data.organizationId, normalizeTaxRateInput(data))

  return {
    success: result.success,
    data: result.data,
    error: result.error,
  }
}

export async function updateTaxRate(data: LegacyTaxRateInput & { id: string }): Promise<{
  success: boolean
  data?: TaxRateDTO
  error?: string
}> {
  const result = await updateManagedTaxRate(data.organizationId, data.id, normalizeTaxRateInput(data))

  return {
    success: result.success,
    data: result.data,
    error: result.error,
  }
}

export async function deleteTaxRate(data: {
  id: string
  organizationId: string
}): Promise<{
  success: boolean
  data?: { id: string; mode: "deleted" | "deactivated" }
  error?: string
}> {
  const result = await deleteManagedTaxRate(data.organizationId, data.id)

  return {
    success: result.success,
    data: result.data,
    error: result.error,
  }
}
