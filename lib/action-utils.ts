import { revalidateTag } from "next/cache"

// Enhanced error types for server actions
export class ServerActionError extends Error {
  constructor(
    message: string,
    public code?: string,
    public field?: string,
    public statusCode?: number,
  ) {
    super(message)
    this.name = "ServerActionError"
  }
}

// Generic action response type
export interface ActionResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  code?: string
  field?: string
}

// Success response helper
export const createSuccessResponse = <T>(data: T): ActionResponse<T> => ({
  success: true,
  data,
})

// Error response helper
export const createErrorResponse = (
  error: string,
  code?: string,
  field?: string
): ActionResponse => ({
  success: false,
  error,
  code,
  field,
})

// Generic action wrapper with error handling
export const withActionHandler = <T extends any[], R>(
  action: (...args: T) => Promise<R>
) => {
  return async (...args: T): Promise<ActionResponse<R>> => {
    try {
      const result = await action(...args)
      return createSuccessResponse(result)
    } catch (error) {
      console.error("Server action error:", error)

      if (error instanceof ServerActionError) {
        return createErrorResponse(error.message, error.code, error.field)
      }

      if (error instanceof Error) {
        return createErrorResponse(error.message, "UNKNOWN_ERROR")
      }

      return createErrorResponse("An unexpected error occurred", "UNKNOWN_ERROR")
    }
  }
}

// Validation helper
export const validateRequired = (value: any, fieldName: string) => {
  if (!value || (typeof value === "string" && !value.trim())) {
    throw new ServerActionError(
      `${fieldName} is required`,
      "VALIDATION_ERROR",
      fieldName
    )
  }
}

// Cache management utilities
export const invalidateItemCaches = (organizationId?: string, itemId?: string) => {
  // Revalidate specific tags
  revalidateTag("items")
  
  if (organizationId) {
    revalidateTag(`org-items-${organizationId}`)
    revalidateTag(`brief-org-items-${organizationId}`)
  }
  
  if (itemId) {
    revalidateTag(`item-${itemId}`)
  }
}

// Batch operation helper
export const executeBatch = async <T, R>(
  items: T[],
  operation: (item: T) => Promise<R>,
  batchSize: number = 5
): Promise<R[]> => {
  const results: R[] = []
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)
    const batchResults = await Promise.allSettled(
      batch.map(operation)
    )
    
    batchResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        results.push(result.value)
      } else {
        throw new ServerActionError(
          `Batch operation failed at index ${i + index}: ${result.reason}`,
          "BATCH_ERROR"
        )
      }
    })
  }
  
  return results
}
