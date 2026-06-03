"use client"

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { UnitCreateDTO, UpdateUnitPayload } from '@/types/unit'

// Import server actions
import createActionUnit from "@/actions/units/createActionUnit"
import deleteUnit from "@/actions/units/deleteUnit"
import getOrgUnits from "@/actions/units/getOrgUnits"
import getUnitById from "@/actions/units/getUnitById"
import updateUnitByIdNew from "@/actions/units/updateUnitById"

// Query hooks
export function useOrgUnits(organizationId: string) {
  return useQuery({
    queryKey: ['orgUnits', organizationId],
    queryFn: async () => {
      const response = await getOrgUnits(organizationId)
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch units')
      }
      return response.data
    },
    enabled: !!organizationId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1
  })
}

export function useUnit(id: string) {
  return useQuery({
    queryKey: ['unit', id],
    queryFn: async () => {
      const response = await getUnitById(id)
      if (!response?.success) {
        throw new Error(response?.error || 'Failed to fetch unit')
      }
      return response.data
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1
  })
}

// Mutation hooks
export function useCreateUnit() {
  const queryClient = useQueryClient()

  return useMutation({
    meta: { operation: 'create', entity: 'Unit' },
    mutationFn: async (data: UnitCreateDTO) => {
      const response = await createActionUnit(data)
      if (!response?.success || !response.data) {
        throw new Error(response.error || 'Failed to create unit')
      }
      return response.data
    },
    onSuccess: (data) => {
      // Invalidate and refetch units for the organization
      queryClient.invalidateQueries({ queryKey: ['orgUnits', data?.organizationId] })
      queryClient.invalidateQueries({ queryKey: ['orgUnits'] })
    }
  })
}

export function useUpdateUnit() {
  const queryClient = useQueryClient()

  return useMutation({
    meta: { operation: 'update', entity: 'Unit' },
    mutationFn: async ({ id, data }: { id: string; data: UpdateUnitPayload }) => {
      const response = await updateUnitByIdNew(id, data)
      if (!response.success) {
        throw new Error(response.error || 'Failed to update unit')
      }
      return response.data
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch specific unit and organization units
      queryClient.invalidateQueries({ queryKey: ['unit', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['orgUnits', data?.organizationId] })
      queryClient.invalidateQueries({ queryKey: ['orgUnits'] })
    }
  })
}

export function useDeleteUnit() {
  const queryClient = useQueryClient()

  return useMutation({
    meta: { operation: 'delete', entity: 'Unit' },
    mutationFn: async (id: string) => {
      const response = await deleteUnit(id)
      if (!response?.success || !response.data) {
        throw new Error(response.error || 'Failed to delete unit')
      }
      return true
    },
    onSuccess: (_, id) => {
      // Invalidate and refetch units
      queryClient.invalidateQueries({ queryKey: ['unit', id] })
      queryClient.invalidateQueries({ queryKey: ['orgUnits'] })
    }
  })
}

// Utility hooks
export function useAllOrgUnits(organizationId: string) {
  return useOrgUnits(organizationId)
}

export function useBriefUnitsByOrgId(orgId: string) {
  return useOrgUnits(orgId)
}