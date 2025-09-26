"use client"
import { keepPreviousData, useQuery } from "@tanstack/react-query";
// Import Server Actions from a "use server" module
import { getSuppliersByOrgId } from "@/actions/suppliers/getSuppliersByOrgId";
import { SupplierKeys } from "@/types/queryKeys";
import type { SupplierResponse, SupplierWithRelations } from "@/types/supplier";
import { toast } from "sonner";

/**
 * Hook to fetch suppliers with optional filters
 * Handles undefined filters gracefully by disabling the query
 */
const useGetOrgSuppliersHook = (organizationId: string, options?: { enabled?: boolean }) => {
  return useQuery<SupplierResponse<SupplierWithRelations[]>>({
    queryKey: SupplierKeys.orgSuppliers(organizationId),
    queryFn: async () => {
      if (!organizationId) {
        throw new Error("Organization ID is required")
      }
      try {
        const result = await getSuppliersByOrgId(organizationId)
        if (!result.success) {
          throw new Error(result.error || "Failed to fetch suppliers")
        }
        return result
      } catch (error) {
        console.error("Failed to fetch organization suppliers:", error)
        toast.error("Failed to load suppliers. Please try again.")
        throw error // Re-throw to let React Query handle it
      }
    },
    // enabled: Boolean(organizationId),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    enabled: !!organizationId && (options?.enabled ?? true),

    retry: (failureCount, error) => {
      // Don't retry if it's a validation error (missing organizationId)
      if (error.message.includes("Organization ID is required")) {
        return false
      }
      return failureCount < 2
    },
  })
}

export default useGetOrgSuppliersHook
