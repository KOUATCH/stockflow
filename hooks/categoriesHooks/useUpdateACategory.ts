import { categoryAPI } from "@/services/categoryAPI"
import { UpdateCategoryPayload } from "@/types/category"
import { UpdateModelData } from "@/types/item"
import { useCategoryMutation } from "./useCategoryMutation"

export function useUpdateACategory() {
  return useCategoryMutation(
    async ({ id, data }: UpdateModelData<UpdateCategoryPayload>) => {
      return await categoryAPI.updateACategory(id, data)
    },
    "Item category updated successfully",
    "Failed to update item category",
  )
}
