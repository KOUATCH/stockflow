"use client"

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { LocationDTO } from '@/types/location'

// Import server actions
import createLocation from "@/actions/locations/createLocation"
import deleteLocation from "@/actions/locations/deleteLocation"
import getLocationById from "@/actions/locations/getLocationById"
import { getOrgLocations } from "@/actions/locations/getOrgLocations"
import updateLocationById from "@/actions/locations/updateLocationById"

// Query hooks
export function useLocations(organizationId?: string) {
  return useQuery({
    queryKey: ['locations', organizationId],
    queryFn: async () => {
      if (organizationId) {
        const response = await getOrgLocations(organizationId)
        if (!response.success) {
          throw new Error(response.error || 'Failed to fetch locations')
        }
        return response.data
      }
      return []
    },
    enabled: !!organizationId,
    staleTime: 1000 * 60 * 10, // 10 minutes - locations don't change often
    retry: 1
  })
}

export function useOrgLocations(organizationId: string) {
  return useQuery({
    queryKey: ['orgLocations', organizationId],
    queryFn: async () => {
      const response = await getOrgLocations(organizationId)
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch locations')
      }
      return response.data
    },
    enabled: !!organizationId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1
  })
}

export function useLocation(id: string) {
  return useQuery({
    queryKey: ['location', id],
    queryFn: async () => {
      const response = await getLocationById(id)
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch location')
      }
      return response.data
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1
  })
}

// Get the default/primary location for an organization
export function useDefaultLocation(organizationId?: string) {
  const { data: locations, ...rest } = useOrgLocations(organizationId || '')

  return {
    ...rest,
    data: locations?.find(location => location.isDefault) || locations?.[0] || null
  }
}

// Mutation hooks
export function useCreateLocation() {
  const queryClient = useQueryClient()

  return useMutation({
    meta: { operation: 'create', entity: 'Location' },
    mutationFn: async (data: LocationDTO) => {
      const response = await createLocation(data)
      if (!response.success) {
        throw new Error(response.error || 'Failed to create location')
      }
      return response.data
    },
    onSuccess: (data) => {
      // Invalidate and refetch locations for the organization
      queryClient.invalidateQueries({ queryKey: ['orgLocations', data?.organizationId] })
      queryClient.invalidateQueries({ queryKey: ['locations'] })
    }
  })
}

export function useUpdateLocation() {
  const queryClient = useQueryClient()

  return useMutation({
    meta: { operation: 'update', entity: 'Location' },
    mutationFn: async ({ id, data }: { id: string; data: LocationDTO }) => {
      const response = await updateLocationById(id, data)
      if (!response.success) {
        throw new Error(response.error || 'Failed to update location')
      }
      return response.data
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch specific location and organization locations
      queryClient.invalidateQueries({ queryKey: ['location', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['orgLocations', data?.organizationId] })
      queryClient.invalidateQueries({ queryKey: ['locations'] })
    }
  })
}

export function useDeleteLocation() {
  const queryClient = useQueryClient()

  return useMutation({
    meta: { operation: 'delete', entity: 'Location' },
    mutationFn: async (id: string) => {
      const response = await deleteLocation(id)
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete location')
      }
      return true
    },
    onSuccess: (_, id) => {
      // Invalidate and refetch locations
      queryClient.invalidateQueries({ queryKey: ['location', id] })
      queryClient.invalidateQueries({ queryKey: ['orgLocations'] })
      queryClient.invalidateQueries({ queryKey: ['locations'] })
    }
  })
}

// Utility hooks
export function useActiveLocations(organizationId?: string) {
  const { data: locations, ...rest } = useLocations(organizationId)

  return {
    ...rest,
    data: locations?.filter(location => location.id) || []
  }
}

export function useAllOrgLocations(organizationId: string) {
  return useOrgLocations(organizationId)
}

export function useBriefLocationsByOrgId(orgId: string) {
  return useOrgLocations(orgId)
}
