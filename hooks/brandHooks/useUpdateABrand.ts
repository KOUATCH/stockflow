import { brandAPI } from "@/services/brandAPI"
import { UpdateBrandPayload } from "@/types/brand"
import { UpdateModelData } from "@/types/item"
import { useBrandMutation } from "./useBrandMutation"

export function useUpdateABrand() {
  return useBrandMutation(
    async ({ id, data }: UpdateModelData<UpdateBrandPayload>) => {
      return await brandAPI.updateBrand(id, data)
    },
    "New Brand  updated successfully",
    "Failed to update brand stock",
  )
}


