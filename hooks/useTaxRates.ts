"use client"

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { TaxRateCreateDTO, UpdateTaxRatePayload } from '@/types/taxRates'

// Import server actions
import { getOrgTaxRates } from "@/actions/taxes/getTaxRatesAction"
import createActionTaxRate from "@/actions/taxRate/createActionTaxRate"
import deleteTaxRate from "@/actions/taxRate/deleteTaxRate"
import getTaxRateById from "@/actions/taxRate/getTaxRateById"
import updateTaxRateByIdNew from "@/actions/taxRate/updateTaxRateByIdNew"

// Query hooks
export function useOrgTaxRates(organizationId: string) {
  return useQuery({
    queryKey: ['orgTaxRates', organizationId],
    queryFn: async () => {
      const response = await getOrgTaxRates(organizationId)
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch tax rates')
      }
      return response.data
    },
    enabled: !!organizationId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1
  })
}

export function useTaxRate(id: string) {
  return useQuery({
    queryKey: ['taxRate', id],
    queryFn: async () => {
      const response = await getTaxRateById(id)
      if (!response?.success) {
        throw new Error(response?.error || 'Failed to fetch tax rate')
      }
      return response.data
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1
  })
}

// Mutation hooks
export function useCreateTaxRate() {
  const queryClient = useQueryClient()

  return useMutation({
    meta: { operation: 'create', entity: 'Tax Rate' },
    mutationFn: async (data: TaxRateCreateDTO) => {
      const response = await createActionTaxRate(data)
      if (!response?.success || !response.data) {
        throw new Error(response.error || 'Failed to create tax rate')
      }
      return response.data
    },
    onSuccess: (data) => {
      // Invalidate and refetch tax rates for the organization
      queryClient.invalidateQueries({ queryKey: ['orgTaxRates', data?.organizationId] })
      queryClient.invalidateQueries({ queryKey: ['orgTaxRates'] })
    }
  })
}

export function useUpdateTaxRate() {
  const queryClient = useQueryClient()

  return useMutation({
    meta: { operation: 'update', entity: 'Tax Rate' },
    mutationFn: async ({ id, data }: { id: string; data: UpdateTaxRatePayload }) => {
      const response = await updateTaxRateByIdNew(id, data)
      if (!response.success) {
        throw new Error(response.error || 'Failed to update tax rate')
      }
      return response.data
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch specific tax rate and organization tax rates
      queryClient.invalidateQueries({ queryKey: ['taxRate', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['orgTaxRates', data?.organizationId] })
      queryClient.invalidateQueries({ queryKey: ['orgTaxRates'] })
    }
  })
}

export function useDeleteTaxRate() {
  const queryClient = useQueryClient()

  return useMutation({
    meta: { operation: 'delete', entity: 'Tax Rate' },
    mutationFn: async (id: string) => {
      const response = await deleteTaxRate(id)
      if (!response?.success || !response.data) {
        throw new Error(response.error || 'Failed to delete tax rate')
      }
      return true
    },
    onSuccess: (_, id) => {
      // Invalidate and refetch tax rates
      queryClient.invalidateQueries({ queryKey: ['taxRate', id] })
      queryClient.invalidateQueries({ queryKey: ['orgTaxRates'] })
    }
  })
}

// Utility hooks
export function useAllOrgTaxRates(organizationId: string) {
  return useOrgTaxRates(organizationId)
}

export function useBriefTaxRatesByOrgId(orgId: string) {
  return useOrgTaxRates(orgId)
}

export function useNewTaxRate() {
  return useCreateTaxRate()
}
