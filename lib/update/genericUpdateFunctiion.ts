// import { db } from "@/lib/db"
import { db } from "@/prisma/db"
import { revalidatePath } from "next/cache"

// Generic update function
export const updateRecordById = async <T, U>(
  model: string,
  id: string,
  data: U,
  revalidationPath?: string,
): Promise<{
  data: T | null
  success: boolean
  error: string | null
}> => {
  try {
    // Use a transaction for atomic operations
    return await db.$transaction(async (tx) => {
      // Dynamically access the model
      const modelAccess = (tx as any)[model]

      if (!modelAccess) {
        throw new Error(`Model '${model}' not found`)
      }

      const record = await modelAccess.findUnique({
        where: { id },
      })

      if (!record) {
        throw new Error(`${model.charAt(0).toUpperCase() + model.slice(1)} not found`)
      }

      const updatedRecord = await modelAccess.update({
        where: { id },
        data: { ...data },
      })

      // Revalidate path if provided
      if (revalidationPath) {
        revalidatePath(revalidationPath)
      }

      return {
        data: updatedRecord,
        success: true,
        error: null,
      }
    })
  } catch (error) {
    console.error(`Error updating ${model}:`, error)
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : `Failed to update ${model}`,
    }
  }
}

// Type-safe wrapper function generator
export const createUpdateFunction = <T, U>(model: string, revalidationPath?: string) => {
  return (id: string, data: U) => updateRecordById<T, U>(model, id, data, revalidationPath)
}
