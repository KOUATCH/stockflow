"use client"

import { useQuery } from "@tanstack/react-query"
// import { getOrgLocations } from "@/services/locationAPI"
import { LocationResponse } from "@/types/location"

// Mock API function
const getOrgLocations = async (orgId: string): Promise<LocationResponse> => {
  if (!orgId) {
    throw new Error("Organization ID is required")
  }
  const locationsRes = await  getOrgLocations(orgId)
  if (!locationsRes.success) {
    throw new Error(locationsRes.error || "Failed to fetch locations")
  }
  const locationsData = locationsRes.data || []
  return {
    success: true,
    data:locationsData ,
    error: null,
  }
}

export const useOrgLocations = (organizationId: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ["orgLocations", organizationId],
    queryFn: () => getOrgLocations(organizationId),
    staleTime: 5 * 60 * 1000,
    enabled: !!organizationId && (options?.enabled ?? true),
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}
