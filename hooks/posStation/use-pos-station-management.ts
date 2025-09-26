"use client"

import {
  createPosStation,
  deletePosStation,
  getLocationsByOrganization,
  getOrganizations,
  getPosStationById,
  getPosStations,
  updatePosStation,
} from "@/actions/posStation/pos-station-actions"
import { toast } from "@/hooks/posStation/use-toast"
import type { CreatePosStationInput, UpdatePosStationInput } from "@/lib/validations/pos-station"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

// Query keys
export const posStationKeys = {
  all: ["pos-stations"] as const,
  lists: () => [...posStationKeys.all, "list"] as const,
  list: (organizationId?: string) => [...posStationKeys.lists(), { organizationId }] as const,
  details: () => [...posStationKeys.all, "detail"] as const,
  detail: (id: string) => [...posStationKeys.details(), id] as const,
  organizations: ["organizations"] as const,
  locations: (organizationId: string) => ["locations", organizationId] as const,
}

// Hooks for fetching data
export function usePosStations(organizationId?: string, p0?: { enabled: boolean }) {
  return useQuery({
    queryKey: posStationKeys.list(organizationId),
    queryFn: () => getPosStations(organizationId),
    select: (data) => data.data || [],
  })
}

export function usePosStation(id: string) {
  return useQuery({
    queryKey: posStationKeys.detail(id),
    queryFn: () => getPosStationById(id),
    select: (data) => data.data,
    enabled: !!id,
  })
}

export function useOrganizations() {
  return useQuery({
    queryKey: posStationKeys.organizations,
    queryFn: getOrganizations,
    select: (data) => data.data || [],
  })
}

export function useLocationsByOrganization(organizationId: string) {
  return useQuery({
    queryKey: posStationKeys.locations(organizationId),
    queryFn: () => getLocationsByOrganization(organizationId),
    select: (data) => data.data || [],
    enabled: !!organizationId,
  })
}

// Mutation hooks
export function useCreatePosStation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreatePosStationInput) => createPosStation(input),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: posStationKeys.lists() })
        toast({
          title: "Success",
          description: `POS Station "${result.data?.name}" created successfully with terminal number ${result.data?.terminalNumber}`,
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create POS station",
          variant: "destructive",
        })
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create POS station",
        variant: "destructive",
      })
      console.error("Create POS station error:", error)
    },
  })
}

export function useUpdatePosStation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdatePosStationInput) => updatePosStation(input),
    onSuccess: (result, variables) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: posStationKeys.lists() })
        queryClient.invalidateQueries({ queryKey: posStationKeys.detail(variables.id) })
        toast({
          title: "Success",
          description: `POS Station "${result.data?.name}" updated successfully`,
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update POS station",
          variant: "destructive",
        })
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update POS station",
        variant: "destructive",
      })
      console.error("Update POS station error:", error)
    },
  })
}

export function useDeletePosStation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deletePosStation(id),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: posStationKeys.lists() })
        toast({
          title: "Success",
          description: "POS Station deleted successfully",
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete POS station",
          variant: "destructive",
        })
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete POS station",
        variant: "destructive",
      })
      console.error("Delete POS station error:", error)
    },
  })
}
