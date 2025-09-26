"use client"

import { useQuery } from "@tanstack/react-query"
import { getLocations } from "@/actions/locationActions"

export function useLocations() {
  return useQuery({
    queryKey: ["locations"],
    queryFn: () => getLocations(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}
