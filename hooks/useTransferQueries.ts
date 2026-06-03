"use client"

import {
  createLocationTransfer,
  approveTransfer,
  getTransfers,
} from "@/actions/inventory/inventoryMovementActions"
import type { CreateTransferPayload, TransferStatus } from "@/types/inventoryMovementTypes"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useNotifications } from "@/components/notifications/NotificationProvider"

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
  const { formSuccess, formError } = useNotifications()

  return useMutation({
    meta: { operation: 'create', entity: 'Transfer' },
    mutationFn: (data: CreateTransferPayload) => createLocationTransfer(data),
    onSuccess: (response, variables) => {
      formSuccess("Create Transfer", response.message || "Transfer created and is ready for approval")
      queryClient.invalidateQueries({ queryKey: TransferKeys.all })
      queryClient.invalidateQueries({ queryKey: ["inventory"] })
    },
    onError: (error: Error) => {
      formError("Create Transfer", error.message || "Failed to create transfer")
    },
  })
}

/**
 * Hook to approve a transfer
 */
export function useApproveTransfer() {
  const queryClient = useQueryClient()
  const { formSuccess, formError } = useNotifications()

  return useMutation({
    meta: { operation: 'approve', entity: 'Transfer' },
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
      formSuccess("Approve Transfer", response.message || "Transfer approved and is ready for execution")
      queryClient.invalidateQueries({ queryKey: TransferKeys.all })
      queryClient.invalidateQueries({ queryKey: TransferKeys.detail(variables.transferId, variables.organizationId) })
      queryClient.invalidateQueries({ queryKey: ["inventory"] })
    },
    onError: (error: Error) => {
      formError("Approve Transfer", error.message || "Failed to approve transfer")
    },
  })
}
