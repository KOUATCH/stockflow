"use client"

import { itemAPI, ItemAPIError } from "@/services/itemApi"
import { useCallback, useEffect } from "react"

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

// Hook for cache management
export const useItemAPICache = () => {
  const clearCache = useCallback((pattern?: string) => {
    itemAPI.clearCache(pattern)
  }, [])

  const getCacheSize = useCallback(() => {
    return itemAPI.getCacheSize()
  }, [])

  // Clear cache on unmount or when specified
  useEffect(() => {
    return () => {
      // Optional: Clear cache on component unmount
      // itemAPI.clearCache()
    }
  }, [])

  return {
    clearCache,
    getCacheSize,
  }
}

// Hook for prefetching data
export const useItemAPIPrefetch = () => {
  const prefetchOrgItems = useCallback((organizationId: string) => {
    itemAPI.prefetchOrgItems(organizationId)
  }, [])

  return { prefetchOrgItems }
}
