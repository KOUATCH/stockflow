import { updateRecordById } from "@/lib/update/genericUpdateFunctiion"
import { LocationDTO, UpdateLocationPayload } from "@/types/location"

export const createUpdateRecord = <T, U>(model: string, revalidationPath?: string) => {
  return (id: string, data: U) => updateRecordById<T, U>(model, id, data, revalidationPath)
}
export const newLocationUpdateById = createUpdateRecord<LocationDTO, UpdateLocationPayload>("location", "/locations")