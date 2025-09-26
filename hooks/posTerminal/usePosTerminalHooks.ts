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
import type { CreatePosStationInput, UpdatePosStationInput } from "@/validations/posStationTypes"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

// Query keys
export const posStationKeys = {
  all: ["pos-terminals"] as const,
  lists: () => [...posStationKeys.all, "list"] as const,
  list: (organizationId: string, locationId?: string) =>
    [...posStationKeys.lists(), { organizationId, locationId }] as const,
  details: () => [...posStationKeys.all, "detail"] as const,
  detail: (id: string) => [...posStationKeys.details(), id] as const,
}

export const locationKeys = {
  all: ["locations"] as const,
  lists: () => [...locationKeys.all, "list"] as const,
  list: (organizationId: string) => [...locationKeys.lists(), { organizationId }] as const,
}

export const organizationKeys = {
  all: ["organizations"] as const,
  lists: () => [...organizationKeys.all, "list"] as const,
}

// Hooks for POS Stations
export function usePosStations(organizationId: string, locationId?: string) {
  return useQuery({
    queryKey: posStationKeys.list(organizationId, locationId),
    queryFn: () => getPosStations(organizationId, locationId),
    enabled: !!organizationId,
  })
}

export function usePosStation(id: string) {
  return useQuery({
    queryKey: posStationKeys.detail(id),
    queryFn: () => getPosStationById(id),
    enabled: !!id,
  })
}

export function useCreatePosStation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreatePosStationInput) => createPosStation(input),
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Station created successfully")
        queryClient.invalidateQueries({ queryKey: posStationKeys.lists() })
      } else {
        toast.error(result.error || "Failed to create terminal")
      }
    },
    onError: () => {
      toast.error("Failed to create terminal")
    },
  })
}

export function useUpdatePosStation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdatePosStationInput) => updatePosStation(input),
    onSuccess: (result, variables) => {
      if (result.success) {
        toast.success("Station updated successfully")
        queryClient.invalidateQueries({ queryKey: posStationKeys.lists() })
        queryClient.invalidateQueries({ queryKey: posStationKeys.detail(variables.id) })
      } else {
        toast.error(result.error || "Failed to update terminal")
      }
    },
    onError: () => {
      toast.error("Failed to update terminal")
    },
  })
}

export function useDeletePosStation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deletePosStation(id),
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Station deleted successfully")
        queryClient.invalidateQueries({ queryKey: posStationKeys.lists() })
      } else {
        toast.error(result.error || "Failed to delete terminal")
      }
    },
    onError: () => {
      toast.error("Failed to delete terminal")
    },
  })
}

// Hooks for Locations
export function useLocations(organizationId: string) {
  return useQuery({
    queryKey: locationKeys.list(organizationId),
    queryFn: () => getLocationsByOrganization (organizationId),
    enabled: !!organizationId,
  })
}

// Hooks for Organizations
export function useOrganizations() {
  return useQuery({
    queryKey: organizationKeys.lists(),
    queryFn: () => getOrganizations(),
  })
}
