import { updateRecordById } from "@/lib/update/genericUpdateFunctiion"
import { BrandDTO, UpdateBrandPayload } from "@/types/brand"

export const createUpdateRecord = <T, U>(model: string, revalidationPath?: string) => {
  return (id: string, data: U) => updateRecordById<T, U>(model, id, data, revalidationPath)
}
export const newUpdateBrandById = createUpdateRecord<BrandDTO, UpdateBrandPayload>("brand", "/brands")