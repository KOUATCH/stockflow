"use client"

import { getOrgSuppliersClientSafe } from "@/actions/suppliers/clientSafeSuppliersActions"
import { useQuery } from "@tanstack/react-query"

export interface SupplierDTO {
  id: string
  organizationId: string | null
  name: string
  contactPerson?: string | null
  email?: string | null
  phone?: string | null
  address?: string | null
  taxId?: string | null
  paymentTerms?: number | null
  notes?: string | null
  isActive?: boolean
  createdAt: string | Date
}

export interface SupplierResponse {
  success: boolean
  data: SupplierDTO[]
  error?: string | null
}

// Mock API function - replace with your actual API call
export const useGetOrgSuppliers = async (orgId: string): Promise<SupplierResponse> => {
  if (!orgId) {
    throw new Error("Organization ID is required")
  }
const orgSuppliers = await getOrgSuppliersClientSafe(orgId)
  if (!orgSuppliers.success) {
    throw new Error(orgSuppliers.error || "Failed to fetch suppliers")
  }
  const  orgSuppliersData = orgSuppliers.data || []
  // Mock data - replace with actual API call
  return {
    success: true,
    data:orgSuppliersData,
    error: null,
  }
}

export const useOrgSuppliers = (organizationId: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ["orgSuppliers", organizationId],
    queryFn: () => getOrgSuppliersClientSafe(organizationId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!organizationId && (options?.enabled ?? true),
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}
