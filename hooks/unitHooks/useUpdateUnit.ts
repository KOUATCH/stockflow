import { unitAPI } from "@/services/unitAPI"
import { UpdateModelData } from "@/types/item"
import { UpdateUnitPayload } from "@/types/unit"
import { useUnitMutation } from "./useUnitMutation"

export function useUpdateUnit() {
  return useUnitMutation(
    async ({ id, data }: UpdateModelData<UpdateUnitPayload>) => {
      return await unitAPI.updateUnit(id, data)
    },
    "New Unit  updated successfully",
    "Failed to update unit stock",
  )
}
