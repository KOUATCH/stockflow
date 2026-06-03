"use server"

import type { UpdateBrandPayload } from "@/types/brand"
import { updateBrand } from "./getBrandsAction"

export async function updateBrandById(id: string, data: UpdateBrandPayload) {
  return updateBrand(id, data)
}

export default updateBrandById
