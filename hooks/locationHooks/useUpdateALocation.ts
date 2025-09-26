import { locationAPI } from "@/services/locationAPI"
import { UpdateModelData } from "@/types/item"
import { LocationDTO } from "@/types/location"
import { useLocationMutation } from "./useLocationMutation"

export function useUpdateALocation() {
  return useLocationMutation(
    async ({ id, data }: UpdateModelData<LocationDTO>) => {
      return await locationAPI.updateALocation(id, data)
    },
    "New Location  updated successfully",
    "Failed to update location stock",
  )
}

