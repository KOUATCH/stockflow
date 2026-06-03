"use server"

import { revalidatePath } from "next/cache"
import { getAuthenticatedUser } from "@/config/useAuth"
import { updateUnit } from "@/services/unit/unit.service"
import { UnitUpdateSchema } from "@/services/unit/unit.schemas"
import type { UpdateUnitPayload } from "@/types/unit"

const updateUnitById = async (id: string, data: UpdateUnitPayload & { name?: string }) => {
  try {
    const user = await getAuthenticatedUser()

    if (!user?.organizationId) {
      return {
        success: false,
        data: null,
        error: "Organization is required",
      }
    }

    const parsed = UnitUpdateSchema.safeParse({
      nameEn: data.nameEn ?? data.name,
      nameFr: data.nameFr,
      symbol: data.symbol,
    })

    if (!parsed.success) {
      return {
        success: false,
        data: null,
        error: parsed.error.issues.map((issue) => issue.message).join("; ") || "Invalid unit input",
      }
    }

    const updated = await updateUnit(user.organizationId, id, parsed.data)

    revalidatePath("/dashboard/inventory/units")
    revalidatePath("/[locale]/dashboard/inventory/units", "page")

    return {
      data: updated,
      success: true,
      error: null,
    }
  } catch (error) {
    console.error("Error updating unit:", error)
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : "Failed to update unit",
    }
  }
}

export default updateUnitById
