import createLocation from "@/actions/locations/createLocation"
import deleteLocation from "@/actions/locations/deleteLocation"
import { getOrgLocations } from "@/actions/locations/getOrgLocations"
import updateLocationById from "@/actions/locations/updateLocationById"
import type { LocationDTO } from "@/types/location"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

// Query keys for caching
export const LocationKeys = {
  all: ["locations"] as const,
  lists: () => [...LocationKeys.all, "list"] as const,
  list: (filters: any) => [...LocationKeys.lists(), { filters }] as const,
  filteredList: (dateFilter: any, searchQuery: string) =>
    [...LocationKeys.lists(), { dateFilter, searchQuery }] as const,
  details: () => [...LocationKeys.all, "detail"] as const,
  detail: (id: string) => [...LocationKeys.details(), id] as const,
  orgLocations: (organizationId: string) => [...LocationKeys.all, "org", organizationId] as const,
  briefOrgLocations: (organizationId: string) => [...LocationKeys.all, "briefOrg", organizationId] as const,
}

export const useOrgLocationsNew = (organizationId: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: LocationKeys.orgLocations(organizationId),
    queryFn: async () => {
      if (!organizationId) {
        throw new Error("Organization ID is required")
      }
      try {
        const result = await getOrgLocations(organizationId)
        return result
      } catch (error) {
        console.error("Failed to fetch organization locations:", error)
        toast.error("Failed to load locations. Please try again.")
        throw error // Re-throw to let React Query handle it
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!organizationId && (options?.enabled ?? true),
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}

export function useCreateALocation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: LocationDTO) => await createLocation(data),
    onSuccess: (_data, variables) => {
      toast.success("Location added successfully")
      if (variables.organizationId) {
        queryClient.invalidateQueries({ queryKey: LocationKeys.orgLocations(variables.organizationId) })
      } else {
        queryClient.invalidateQueries({ queryKey: LocationKeys.lists() })
      }
    },
    onError: (error: Error) => {
      toast.error("Failed to add Location", {
        description: error.message || "Unknown error occurred",
      })
    },
  })
}

export function useDeleteLocation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, organizationId }: { id: string; organizationId?: string }) => await deleteLocation(id),
    onMutate: async ({ id, organizationId }) => {
      const queryKeys: Array<readonly unknown[]> = [LocationKeys.lists()]
      if (organizationId) {
        queryKeys.push(LocationKeys.orgLocations(organizationId))
        queryKeys.push(LocationKeys.briefOrgLocations(organizationId))
      }

      await Promise.all(queryKeys.map((key) => queryClient.cancelQueries({ queryKey: key })))

      const previousData = new Map()

      const removeLocationFromData = (oldData: any) => {
        if (!oldData) return oldData
        if (Array.isArray(oldData)) {
          return oldData.filter((location: { id: string }) => location.id !== id)
        }
        if (oldData.data && Array.isArray(oldData.data)) {
          return {
            ...oldData,
            data: oldData.data.filter((location: { id: string }) => location.id !== id),
            total: Math.max(0, (oldData.total || oldData.data.length) - 1),
          }
        }
        if (oldData.locations && Array.isArray(oldData.locations)) {
          return {
            ...oldData,
            locations: oldData.locations.filter((location: { id: string }) => location.id !== id),
            total: Math.max(0, (oldData.total || oldData.locations.length) - 1),
          }
        }
        return oldData
      }

      queryKeys.forEach((key) => {
        const data = queryClient.getQueryData(key)
        if (data) {
          previousData.set(JSON.stringify(key), data)
          queryClient.setQueryData(key, removeLocationFromData)
        }
      })
      return { previousData, queryKeys }
    },
    onSuccess: () => {
      toast.success("Location deleted successfully")
    },
    onError: (error: Error, _variables, context) => {
      toast.error("Failed to delete Location", {
        description: error.message || "Unknown error occurred",
      })
      if (context?.previousData && context?.queryKeys) {
        context.queryKeys.forEach((key) => {
          const keyString = JSON.stringify(key)
          const previousValue = context.previousData.get(keyString)
          if (previousValue) {
            queryClient.setQueryData(key, previousValue)
          }
        })
      }
    },
    onSettled: (_data, _error, { organizationId }) => {
      queryClient.invalidateQueries({ queryKey: LocationKeys.lists() })
      if (organizationId) {
        queryClient.invalidateQueries({ queryKey: LocationKeys.orgLocations(organizationId) })
        queryClient.invalidateQueries({ queryKey: LocationKeys.briefOrgLocations(organizationId) })
      }
    },
  })
}

export function useUpdateALocation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: LocationDTO }) => await updateLocationById(id, data),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: LocationKeys.detail(variables.id) })
      await queryClient.cancelQueries({ queryKey: LocationKeys.lists() })
      if (variables.data.organizationId) {
        await queryClient.cancelQueries({ queryKey: LocationKeys.orgLocations(variables.data.organizationId) })
      }

      const previousLocationDetail = queryClient.getQueryData(LocationKeys.detail(variables.id))
      const previousLocationsList = queryClient.getQueryData(LocationKeys.lists())
      const previousOrgLocations = variables.data.organizationId
        ? queryClient.getQueryData(LocationKeys.orgLocations(variables.data.organizationId))
        : undefined

      queryClient.setQueryData(LocationKeys.detail(variables.id), (oldData: LocationDTO | undefined) => {
        return { ...oldData, ...variables.data }
      })
      queryClient.setQueryData(LocationKeys.lists(), (oldData: LocationDTO[] | undefined) => {
        if (!oldData) return [variables.data]
        return oldData.map((location) => (location.id === variables.id ? { ...location, ...variables.data } : location))
      })
      if (variables.data.organizationId) {
        queryClient.setQueryData(
          LocationKeys.orgLocations(variables.data.organizationId),
          (oldData: { data: LocationDTO[] } | undefined) => {
            if (!oldData) return { data: [variables.data] }
            return {
              ...oldData,
              data: oldData.data.map((location) =>
                location.id === variables.id ? { ...location, ...variables.data } : location,
              ),
            }
          },
        )
      }
      return { previousLocationDetail, previousLocationsList, previousOrgLocations }
    },
    onError: (error, variables, context) => {
      toast.error("Failed to update Location", {
        description: error.message || "Unknown error occurred",
      })
      if (context?.previousLocationDetail) {
        queryClient.setQueryData(LocationKeys.detail(variables.id), context.previousLocationDetail)
      }
      if (context?.previousLocationsList) {
        queryClient.setQueryData(LocationKeys.lists(), context.previousLocationsList)
      }
      if (context?.previousOrgLocations && variables.data.organizationId) {
        queryClient.setQueryData(LocationKeys.orgLocations(variables.data.organizationId), context.previousOrgLocations)
      }
    },
    onSuccess: (updatedLocation, variables) => {
      toast.success("Location updated successfully")
      queryClient.setQueryData(LocationKeys.detail(variables.id), (oldData: LocationDTO | undefined) => {
        return { ...oldData, ...updatedLocation }
      })
      queryClient.setQueryData(LocationKeys.lists(), (oldData: LocationDTO[] | undefined) => {
        if (!oldData) return [updatedLocation]
        return oldData.map((location) => (location.id === variables.id ? updatedLocation : location))
      })
      if (updatedLocation?.data?.organizationId) {
        queryClient.setQueryData(
          LocationKeys.orgLocations(updatedLocation?.data?.organizationId),
          (oldData: { data: LocationDTO[] } | undefined) => {
            if (!oldData) return { data: [updatedLocation] }
            return {
              ...oldData,
              data: oldData.data.map((location) =>
                location.id === updatedLocation?.data?.id ? updatedLocation : location,
              ),
            }
          },
        )
      }
    },
  })
}

export function useUpdateLocationBasicInfo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: LocationDTO }) => updateLocationById(id, data),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: LocationKeys.detail(variables.id) })
      await queryClient.cancelQueries({ queryKey: LocationKeys.lists() })
      if (variables.data.organizationId) {
        await queryClient.cancelQueries({ queryKey: LocationKeys.orgLocations(variables.data.organizationId) })
      }

      const previousLocationDetail = queryClient.getQueryData(LocationKeys.detail(variables.id))
      const previousLocationsList = queryClient.getQueryData(LocationKeys.lists())
      const previousOrgLocations = variables.data.organizationId
        ? queryClient.getQueryData(LocationKeys.orgLocations(variables.data.organizationId))
        : undefined

      queryClient.setQueryData(LocationKeys.detail(variables.id), (oldData: LocationDTO | undefined) => {
        return { ...oldData, ...variables.data }
      })
      queryClient.setQueryData(LocationKeys.lists(), (oldData: LocationDTO[] | undefined) => {
        if (!oldData) return [variables.data]
        return oldData.map((location) => (location.id === variables.id ? { ...location, ...variables.data } : location))
      })
      if (variables.data.organizationId) {
        queryClient.setQueryData(
          LocationKeys.orgLocations(variables.data.organizationId),
          (oldData: { data: LocationDTO[] } | undefined) => {
            if (!oldData) return { data: [variables.data] }
            return {
              ...oldData,
              data: oldData.data.map((location) =>
                location.id === variables.id ? { ...location, ...variables.data } : location,
              ),
            }
          },
        )
      }
      return { previousLocationDetail, previousLocationsList, previousOrgLocations }
    },
    onError: (error, variables, context) => {
      toast.error("Failed to update location basic info", {
        description: error.message || "Unknown error occurred",
      })
      if (context?.previousLocationDetail) {
        queryClient.setQueryData(LocationKeys.detail(variables.id), context.previousLocationDetail)
      }
      if (context?.previousLocationsList) {
        queryClient.setQueryData(LocationKeys.lists(), context.previousLocationsList)
      }
      if (context?.previousOrgLocations && variables.data.organizationId) {
        queryClient.setQueryData(LocationKeys.orgLocations(variables.data.organizationId), context.previousOrgLocations)
      }
    },
    onSuccess: (updatedLocation, variables) => {
      toast.success("Location basic info updated successfully")
      queryClient.setQueryData(LocationKeys.detail(variables.id), (oldData: LocationDTO | undefined) => {
        return { ...oldData, ...updatedLocation }
      })
      queryClient.setQueryData(LocationKeys.lists(), (oldData: LocationDTO[] | undefined) => {
        if (!oldData) return [updatedLocation]
        return oldData.map((location) => (location.id === variables.id ? updatedLocation : location))
      })
      if (updatedLocation?.data?.organizationId) {
        queryClient.setQueryData(
          LocationKeys.orgLocations(updatedLocation?.data?.organizationId),
          (oldData: { data: LocationDTO[] } | undefined) => {
            if (!oldData) return { data: [updatedLocation] }
            return {
              ...oldData,
              data: oldData.data.map((location) =>
                location.id === updatedLocation?.data?.id ? updatedLocation : location,
              ),
            }
          },
        )
      }
    },
  })
}

export function useUpdateLocationOthers() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: LocationDTO }) => updateLocationById(id, data),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: LocationKeys.detail(variables.id) })
      await queryClient.cancelQueries({ queryKey: LocationKeys.lists() })
      if (variables.data.organizationId) {
        await queryClient.cancelQueries({ queryKey: LocationKeys.orgLocations(variables.data.organizationId) })
      }

      const previousLocationDetail = queryClient.getQueryData(LocationKeys.detail(variables.id))
      const previousLocationsList = queryClient.getQueryData(LocationKeys.lists())
      const previousOrgLocations = variables.data.organizationId
        ? queryClient.getQueryData(LocationKeys.orgLocations(variables.data.organizationId))
        : undefined

      queryClient.setQueryData(LocationKeys.detail(variables.id), (oldData: LocationDTO | undefined) => {
        return { ...oldData, ...variables.data }
      })
      queryClient.setQueryData(LocationKeys.lists(), (oldData: LocationDTO[] | undefined) => {
        if (!oldData) return [variables.data]
        return oldData.map((location) => (location.id === variables.id ? { ...location, ...variables.data } : location))
      })
      if (variables.data.organizationId) {
        queryClient.setQueryData(
          LocationKeys.orgLocations(variables.data.organizationId),
          (oldData: { data: LocationDTO[] } | undefined) => {
            if (!oldData) return { data: [variables.data] }
            return {
              ...oldData,
              data: oldData.data.map((location) =>
                location.id === variables.id ? { ...location, ...variables.data } : location,
              ),
            }
          },
        )
      }
      return { previousLocationDetail, previousLocationsList, previousOrgLocations }
    },
    onError: (error, variables, context) => {
      toast.error("Failed to update location details", {
        description: error.message || "Unknown error occurred",
      })
      if (context?.previousLocationDetail) {
        queryClient.setQueryData(LocationKeys.detail(variables.id), context.previousLocationDetail)
      }
      if (context?.previousLocationsList) {
        queryClient.setQueryData(LocationKeys.lists(), context.previousLocationsList)
      }
      if (context?.previousOrgLocations && variables.data.organizationId) {
        queryClient.setQueryData(LocationKeys.orgLocations(variables.data.organizationId), context.previousOrgLocations)
      }
    },
    onSuccess: (updatedLocation, variables) => {
      toast.success("Location basic info updated successfully")
      queryClient.setQueryData(LocationKeys.detail(variables.id), (oldData: LocationDTO | undefined) => {
        return { ...oldData, ...updatedLocation }
      })
      queryClient.setQueryData(LocationKeys.lists(), (oldData: LocationDTO[] | undefined) => {
        if (!oldData) return [updatedLocation]
        return oldData.map((location) => (location.id === variables.id ? updatedLocation : location))
      })
      if (updatedLocation?.data?.organizationId) {
        queryClient.setQueryData(
          LocationKeys.orgLocations(updatedLocation?.data?.organizationId),
          (oldData: { data: LocationDTO[] } | undefined) => {
            if (!oldData) return { data: [updatedLocation] }
            return {
              ...oldData,
              data: oldData.data.map((location) =>
                location.id === updatedLocation?.data?.id ? updatedLocation : location,
              ),
            }
          },
        )
      }
    },
  })
}
