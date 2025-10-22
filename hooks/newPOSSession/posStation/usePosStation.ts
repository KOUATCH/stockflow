"use client"

import {
  createPosStation,
  deletePosStation,
  getLocationsByOrganization,
  getOrganizations,
  getPosStationById,
  getPosStations,
  updatePosStation,
} from "@/actions/posSalesProcess/posActions"
import { useNotifications } from "@/components/notifications/NotificationProvider"
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
export function usePosStations(organizationId?: string) {
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
  const { success, error } = useNotifications()

  return useMutation({
    mutationFn: (input: CreatePosStationInput) => createPosStation(input),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: posStationKeys.lists() })
        success(
          "Station Created",
          `POS Station "${result.data?.name}" created successfully with terminal number ${result.data?.terminalNumber}`
        )
      } else {
        error(
          "Creation Failed",
          result.error || "Failed to create POS station"
        )
      }
    },
    onError: (err) => {
      error("Creation Failed", "Failed to create POS station")
      console.error("Create POS station error:", err)
    },
  })
}

export function useUpdatePosStation() {
  const queryClient = useQueryClient()
  const { success, error } = useNotifications()

  return useMutation({
    mutationFn: (input: UpdatePosStationInput) => updatePosStation(input),
    onSuccess: (result, variables) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: posStationKeys.lists() })
        queryClient.invalidateQueries({ queryKey: posStationKeys.detail(variables.id) })
        success(
          "Station Updated",
          `POS Station "${result.data?.name}" updated successfully`
        )
      } else {
        error(
          "Update Failed",
          result.error || "Failed to update POS station"
        )
      }
    },
    onError: (err) => {
      error("Update Failed", "Failed to update POS station")
      console.error("Update POS station error:", err)
    },
  })
}

export function useDeletePosStation() {
  const queryClient = useQueryClient()
  const { success, error } = useNotifications()

  return useMutation({
    mutationFn: (id: string) => deletePosStation(id),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: posStationKeys.lists() })
        success("Station Deleted", "POS Station deleted successfully")
      } else {
        error(
          "Deletion Failed",
          result.error || "Failed to delete POS station"
        )
      }
    },
    onError: (err) => {
      error("Deletion Failed", "Failed to delete POS station")
      console.error("Delete POS station error:", err)
    },
  })
}
