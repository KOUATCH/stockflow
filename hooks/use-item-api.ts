"use client"

// Note: This file uses legacy itemAPI patterns. Consider migrating to server actions.
// For now, creating a simple error class to maintain compatibility.
import { useCallback, useEffect } from "react"

// Legacy API Error class for compatibility
class ItemAPIError extends Error {
  code: string
  statusCode?: number
  originalError?: unknown

  constructor(message: string, code: string, statusCode?: number, originalError?: unknown) {
    super(message)
    this.name = 'ItemAPIError'
    this.code = code
    this.statusCode = statusCode
    this.originalError = originalError
  }
}

// Hook for handling API errors consistently
export const useItemAPIError = () => {
  const handleError = useCallback((error: unknown) => {
    if (error instanceof ItemAPIError) {
      console.error(`ItemAPI Error [${error.code}]:`, error.message, error.originalError)
      return {
        message: error.message,
        code: error.code,
        statusCode: error.statusCode,
      }
    }

    console.error("Unknown error:", error)
    return {
      message: "An unexpected error occurred",
      code: "UNKNOWN_ERROR",
    }
  }, [])

  return { handleError }
}

// Hook for cache management - simplified for server actions
export const useItemAPICache = () => {
  const clearCache = useCallback((pattern?: string) => {
    // Note: With server actions, caching is handled differently
    console.log('Cache clear requested for pattern:', pattern)
  }, [])

  const getCacheSize = useCallback(() => {
    // Note: With server actions, cache size is not directly accessible
    return 0
  }, [])

  return {
    clearCache,
    getCacheSize,
  }
}

// Hook for prefetching data - simplified for server actions
export const useItemAPIPrefetch = () => {
  const prefetchOrgItems = useCallback((organizationId: string) => {
    // Note: With server actions, prefetching is handled by React Query
    console.log('Prefetch requested for organizationId:', organizationId)
  }, [])

  return { prefetchOrgItems }
}
