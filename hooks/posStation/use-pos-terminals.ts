"use client"

import {
  createPosStation,
  deletePosStation,
  getLocations,
  getOrganizations,
  getPosStation,
  getPosStations,
  updatePosStation,
} from "@/actions/posStation/pos-terminal-actions"
import type { CreatePosStationInput, UpdatePosStationInput } from "@/lib/validations/pos-terminal"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

// Query keys
export const pOSStationKeys = {
  all: ["pos-terminals"] as const,
  lists: () => [...pOSStationKeys.all, "list"] as const,
  list: (organizationId: string, locationId?: string) =>
    [...pOSStationKeys.lists(), { organizationId, locationId }] as const,
  details: () => [...pOSStationKeys.all, "detail"] as const,
  detail: (id: string) => [...pOSStationKeys.details(), id] as const,
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

// Hooks for POS Terminals
export function usePosStations(organizationId: string, locationId?: string) {
  return useQuery({
    queryKey: pOSStationKeys.list(organizationId, locationId),
    queryFn: () => getPosStations(organizationId, locationId),
    enabled: !!organizationId,
  })
}

export function usePosStation(id: string) {
  return useQuery({
    queryKey: pOSStationKeys.detail(id),
    queryFn: () => getPosStation(id),
    enabled: !!id,
  })
}

export function useCreatePosStation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreatePosStationInput) => createPosStation(input),
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Terminal created successfully")
        queryClient.invalidateQueries({ queryKey: pOSStationKeys.lists() })
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
        toast.success("Terminal updated successfully")
        queryClient.invalidateQueries({ queryKey: pOSStationKeys.lists() })
        queryClient.invalidateQueries({ queryKey: pOSStationKeys.detail(variables.id) })
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
        toast.success("Terminal deleted successfully")
        queryClient.invalidateQueries({ queryKey: pOSStationKeys.lists() })
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
    queryFn: () => getLocations(organizationId),
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
