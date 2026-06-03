"use client"

import { useQuery } from "@tanstack/react-query"
import { getItems } from "@/actions/items"

export function useItems() {
  return useQuery({
    queryKey: ["items"],
    queryFn: () => getItems(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}
