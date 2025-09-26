import {
  createPosStation,
  deletePosStation,
  getLocationsByOrganization,
  getOrganizations,
  getPosStationById,
  getPosStations,
  updatePosStation,
} from "@/actions/posStation/posStationActions";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Query keys
export const posStationKeys = {
  all: ["pos-stations"] as const,
  lists: () => [...posStationKeys.all, "list"] as const,
  list: (organizationId?: string) => [...posStationKeys.lists(), { organizationId }] as const,
  details: () => [...posStationKeys.all, "detail"] as const,
  detail: (id: string) => [...posStationKeys.details(), id] as const,
}

export const organizationKeys = {
  all: ["organizations"] as const,
  lists: () => [...organizationKeys.all, "list"] as const,
}

export const locationKeys = {
  all: ["locations"] as const,
  lists: () => [...locationKeys.all, "list"] as const,
  list: (organizationId: string) => [...locationKeys.lists(), { organizationId }] as const,
}

// Hooks for POS Stations
export function usePosStations(organizationId?: string) {
  return useQuery({
    queryKey: posStationKeys.list(organizationId),
    queryFn: () => getPosStations(organizationId),
    select: (data) => (data.success ? data.data : []),
  })
}

export function usePosStation(id: string) {
  return useQuery({
    queryKey: posStationKeys.detail(id),
    queryFn: () => getPosStationById(id),
    select: (data) => (data.success ? data.data : null),
    enabled: !!id,
  })
}

export function useCreatePosStation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createPosStation,
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: posStationKeys.lists() })
        toast.success("POS station created successfully")
      } else {
        toast.error(data.error || "Failed to create POS station")
      }
    },
    onError: (error) => {
      toast.error("Failed to create POS station")
      console.error("Create POS station error:", error)
    },
  })
}

export function useUpdatePosStation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updatePosStation,
    onSuccess: (data, variables) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: posStationKeys.lists() })
        queryClient.invalidateQueries({ queryKey: posStationKeys.detail(variables.id) })
        toast.success("POS station updated successfully")
      } else {
        toast.error(data.error || "Failed to update POS station")
      }
    },
    onError: (error) => {
      toast.error("Failed to update POS station")
      console.error("Update POS station error:", error)
    },
  })
}

export function useDeletePosStation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deletePosStation,
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: posStationKeys.lists() })
        toast.success("POS station deleted successfully")
      } else {
        toast.error(data.error || "Failed to delete POS station")
      }
    },
    onError: (error) => {
      toast.error("Failed to delete POS station")
      console.error("Delete POS station error:", error)
    },
  })
}

// Hooks for Organizations
export function useOrganizations() {
  return useQuery({
    queryKey: organizationKeys.lists(),
    queryFn: getOrganizations,
    select: (data) => (data.success ? data.data : []),
  })
}

// Hooks for Locations
export function useLocationsByOrganization(organizationId: string) {
  return useQuery({
    queryKey: locationKeys.list(organizationId),
    queryFn: () => getLocationsByOrganization(organizationId),
    select: (data) => (data.success ? data.data : []),
    enabled: !!organizationId,
  })
}
