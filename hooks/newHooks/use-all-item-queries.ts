"use client"

import { db } from "@/prisma/db"
import { CompleteItemResponse } from "@/types/item"
import { useQuery } from "@tanstack/react-query"


// Mock API function
const getOrgItems = async (orgId: string): Promise<CompleteItemResponse> => {
  if (!orgId) {
    throw new Error("Organization ID is required")
  }
  const orgItems =  await db.item.findMany({
    where: {
      organizationId: orgId,
    },
    orderBy: {
      name: "asc",
    },
  })

  return {
    success: true,
    data:orgItems,
    error: null,
  }
}

export const useOrgItems = (organizationId: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ["orgItems", organizationId],
    queryFn: () => getOrgItems(organizationId),
    staleTime: 5 * 60 * 1000,
    enabled: !!organizationId && (options?.enabled ?? true),
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}
