"use server"

import { getAuthenticatedUser } from "@/config/useAuth"
import { listCategories } from "@/services/category/category.service"

export async function getAllCategories() {
  try {
    const user = await getAuthenticatedUser()
    const result = await listCategories(user.organizationId)
    return result.data
  } catch (error) {
    console.error("Error fetching categories:", error)
    return []
  }
}
