"use server"

import { createManagedUnit } from "@/actions/units/unit-management-actions"
import type { UnitManagementInput } from "@/actions/units/unit-management-actions"

type CreateUnitInput = {
  nameEn: string
  nameFr?: string | null
  symbol: string
  organizationId: string
  type?: string
  baseUnit?: string | null
  conversionRate?: number | string | null
  isActive?: boolean
}

const UNIT_TYPES = new Set(["QUANTITY", "WEIGHT", "VOLUME", "LENGTH", "AREA", "TIME"])

const createActionUnit = async (data: CreateUnitInput) => {
  if (!data?.organizationId || !data?.nameEn || !data?.symbol) {
    return {
      success: false,
      error: "Unit name, symbol, and organization are required",
      data: null,
    }
  }

  const conversionRate =
    data.conversionRate === undefined || data.conversionRate === null || data.conversionRate === ""
      ? null
      : typeof data.conversionRate === "string"
      ? Number(data.conversionRate)
      : data.conversionRate
  const type = UNIT_TYPES.has(data.type ?? "")
    ? (data.type as UnitManagementInput["type"])
    : "QUANTITY"

  const result = await createManagedUnit(data.organizationId, {
    nameEn: data.nameEn,
    nameFr: data.nameFr ?? null,
    symbol: data.symbol,
    type,
    baseUnit: data.baseUnit ?? null,
    conversionRate,
    isActive: data.isActive ?? true,
  })

  return {
    success: result.success,
    error: result.error ?? null,
    data: result.data ?? null,
  }
}

export default createActionUnit
