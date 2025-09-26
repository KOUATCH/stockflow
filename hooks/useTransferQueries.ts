"use client"

import {
  createLocationTransfer,
  approveTransfer,
  getTransfers,
} from "@/actions/inventory/inventoryMovementActions"
import type { CreateTransferPayload, TransferStatus } from "@/types/inventoryMovementTypes"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

// ============================================================================
// QUERY KEYS
// ============================================================================
export const TransferKeys = {
  all: ["transfers"] as const,
  lists: () => [...TransferKeys.all, "list"] as const,
  list: (organizationId: string, filters?: any) => [...TransferKeys.lists(), organizationId, filters] as const,
  details: () => [...TransferKeys.all, "detail"] as const,
  detail: (id: string, organizationId: string) => [...TransferKeys.details(), id, organizationId] as const,
}

// ============================================================================
// QUERY HOOKS
// ============================================================================

/**
 * Hook to fetch transfers with filters
 */
export function useTransfers(
  organizationId: string | undefined,
  filters?: {
    search?: string
    status?: TransferStatus
    fromLocationId?: string
    toLocationId?: string
    page?: number
    limit?: number
  },
) {
  return useQuery({
    queryKey: TransferKeys.list(organizationId!, filters),
    queryFn: () => getTransfers(organizationId!, filters),
    enabled: !!organizationId,
    placeholderData: (previousData) => previousData,
  })
}

/**
 * Hook to fetch a single transfer
 */
export function useTransfer(transferId: string | undefined, organizationId: string | undefined) {
  return useQuery({
    queryKey: TransferKeys.detail(transferId!, organizationId!),
    queryFn: async () => {
      const response = await getTransfers(organizationId!, { limit: 1 })
      return response.data.find(t => t.id === transferId) || null
    },
    enabled: !!transferId && !!organizationId,
  })
}

// ============================================================================
// MUTATION HOOKS
// ============================================================================

/**
 * Hook to create a new transfer
 */
export function useCreateTransfer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateTransferPayload) => createLocationTransfer(data),
    onSuccess: (response, variables) => {
      toast.success(response.message || "Transfer created successfully")
      queryClient.invalidateQueries({ queryKey: TransferKeys.all })
      queryClient.invalidateQueries({ queryKey: ["inventory"] })
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create transfer")
    },
  })
}

/**
 * Hook to approve a transfer
 */
export function useApproveTransfer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      transferId,
      organizationId,
      approvedById,
    }: {
      transferId: string
      organizationId: string
      approvedById: string
    }) => approveTransfer(transferId, organizationId, approvedById),
    onSuccess: (response, variables) => {
      toast.success(response.message || "Transfer approved successfully")
      queryClient.invalidateQueries({ queryKey: TransferKeys.all })
      queryClient.invalidateQueries({ queryKey: TransferKeys.detail(variables.transferId, variables.organizationId) })
      queryClient.invalidateQueries({ queryKey: ["inventory"] })
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to approve transfer")
    },
  })
}
