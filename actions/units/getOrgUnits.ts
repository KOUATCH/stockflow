"use server"

import { listUnits } from "@/services/unit/unit.service"
import type { UnitResponse } from "@/types/unit"

const getOrgUnits = async (orgId: string): Promise<UnitResponse> => {
  try {
    if (!orgId) {
      return {
        success: false,
        error: "Organization ID is required",
        data: [],
      }
    }

    const units = await listUnits(orgId)

    return {
      success: true,
      error: null,
      data: units,
    }
  } catch (error) {
    console.error("Error fetching units:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      data: [],
    }
  }
}

export default getOrgUnits
