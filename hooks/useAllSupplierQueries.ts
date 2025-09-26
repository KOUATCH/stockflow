"use client"

import { createSupplier, deleteSupplier } from "@/actions/supplierSystem/supplierSystemActions"
import { getOrgSuppliers } from "@/services/supplierAPI"
import { SupplierDTO } from "@/types/suppliersSystemTypes"
// import createActionSupplier from "@/actions/suppliers/createActionSupplier"
// import deleteSupplier from "@/actions/suppliers/deleteSupplier"
// import getOrgSuppliers from "@/actions/suppliers/getOrgSuppliers"
// import updateSupplierBasicInfoById from "@/actions/suppliers/updateSupplierBasicInfoById"
// import updateSupplierById from "@/actions/suppliers/updateSupplierById"
// import updateSupplierDetailsById from "@/actions/suppliers/updateSupplierDetailsById"
// import updateSupplierRelationsById from "@/actions/suppliers/updateSupplierRelationsById"
// import type {
//   SupplierCreateDTO,
//   SupplierDTO,
//   UpdateSupplierBasicInfoPayload,
//   UpdateSupplierDetailsPayload,
//   UpdateSupplierPayload,
//   UpdateSupplierRelationsPayload,
// } from "@/types/supplier"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"
import { toast } from "sonner"

// Query keys for caching
export const SupplierKeys = {
  all: ["suppliers"] as const,
  lists: () => [...SupplierKeys.all, "list"] as const,
  list: (filters: any) => [...SupplierKeys.lists(), { filters }] as const,
  filteredList: (dateFilter: any, searchQuery: string) =>
    [...SupplierKeys.lists(), { dateFilter, searchQuery }] as const,
  details: () => [...SupplierKeys.all, "detail"] as const,
  detail: (id: string) => [...SupplierKeys.details(), id] as const,
  orgSuppliers: (organizationId: string) => [...SupplierKeys.all, "org", organizationId] as const,
  briefOrgSuppliers: (organizationId: string) => [...SupplierKeys.all, "briefOrg", organizationId] as const,
}

export const useOrgSuppliersNew = (organizationId: string, options?: { enabled?: boolean }) => {
  const query = useQuery({
    queryKey: SupplierKeys.orgSuppliers(organizationId),
    queryFn: async () => {
      if (!organizationId) {
        throw new Error("Organization ID is required")
      }
      return await getOrgSuppliers(organizationId)
    },
    enabled: !!organizationId && (options?.enabled ?? true),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })

  useEffect(() => {
    if (query.error) {
      console.error("Failed to fetch organization suppliers:", query.error)
      toast.error("Failed to load suppliers. Please try again.")
    }
  }, [query.error])

  useEffect(() => {
    if (query.isSuccess && query.data) {
      console.log("Successfully loaded suppliers:", query.data?.data?.length || 0)
    }
  }, [query.isSuccess, query.data])

  return query
}

export function useCreateSupplier() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: SupplierCreateDTO) => await createSupplier(data),
    onSuccess: (_data, variables) => {
      toast.success("Supplier added successfully")
      if (variables.organizationId) {
        queryClient.invalidateQueries({ queryKey: SupplierKeys.orgSuppliers(variables.organizationId) })
      } else {
        queryClient.invalidateQueries({ queryKey: SupplierKeys.lists() })
      }
    },
    onError: (error: Error) => {
      toast.error("Failed to add Supplier", {
        description: error.message || "Unknown error occurred",
      })
    },
  })
}

export function useDeleteSupplier() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, organizationId }: { id: string; organizationId?: string }) => await deleteSupplier(id),
    onMutate: async ({ id, organizationId }) => {
      const queryKeys: Array<readonly unknown[]> = [SupplierKeys.lists()]
      if (organizationId) {
        queryKeys.push(SupplierKeys.orgSuppliers(organizationId))
        queryKeys.push(SupplierKeys.briefOrgSuppliers(organizationId))
      }

      await Promise.all(queryKeys.map((key) => queryClient.cancelQueries({ queryKey: key })))

      const previousData = new Map()

      const removeSupplierFromData = (oldData: any) => {
        if (!oldData) return oldData
        if (Array.isArray(oldData)) {
          return oldData.filter((supplier: { id: string }) => supplier.id !== id)
        }
        if (oldData.data && Array.isArray(oldData.data)) {
          return {
            ...oldData,
            data: oldData.data.filter((supplier: { id: string }) => supplier.id !== id),
            total: Math.max(0, (oldData.total || oldData.data.length) - 1),
          }
        }
        if (oldData.suppliers && Array.isArray(oldData.suppliers)) {
          return {
            ...oldData,
            suppliers: oldData.suppliers.filter((supplier: { id: string }) => supplier.id !== id),
            total: Math.max(0, (oldData.total || oldData.suppliers.length) - 1),
          }
        }
        return oldData
      }

      queryKeys.forEach((key) => {
        const data = queryClient.getQueryData(key)
        if (data) {
          previousData.set(JSON.stringify(key), data)
          queryClient.setQueryData(key, removeSupplierFromData)
        }
      })
      return { previousData, queryKeys }
    },
    onSuccess: () => {
      toast.success("Supplier deleted successfully")
    },
    onError: (error: Error, _variables, context) => {
      toast.error("Failed to delete Supplier", {
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
      queryClient.invalidateQueries({ queryKey: SupplierKeys.lists() })
      if (organizationId) {
        queryClient.invalidateQueries({ queryKey: SupplierKeys.orgSuppliers(organizationId) })
        queryClient.invalidateQueries({ queryKey: SupplierKeys.briefOrgSuppliers(organizationId) })
      }
    },
  })
}

export function useUpdateSupplier() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateSupplierPayload }) => updateSupplierById(id, data),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: SupplierKeys.detail(variables.id) })
      await queryClient.cancelQueries({ queryKey: SupplierKeys.lists() })
      if (variables.data.organizationId) {
        await queryClient.cancelQueries({ queryKey: SupplierKeys.orgSuppliers(variables.data.organizationId) })
      }

      const previousSupplierDetail = queryClient.getQueryData(SupplierKeys.detail(variables.id))
      const previousSuppliersList = queryClient.getQueryData(SupplierKeys.lists())
      const previousOrgSuppliers = variables.data.organizationId
        ? queryClient.getQueryData(SupplierKeys.orgSuppliers(variables.data.organizationId))
        : undefined

      queryClient.setQueryData(SupplierKeys.detail(variables.id), (oldData: SupplierDTO | undefined) => {
        return { ...oldData, ...variables.data }
      })
      queryClient.setQueryData(SupplierKeys.lists(), (oldData: SupplierDTO[] | undefined) => {
        if (!oldData) return [variables.data as SupplierDTO]
        return oldData.map((supplier) => (supplier.id === variables.id ? { ...supplier, ...variables.data } : supplier))
      })
      if (variables.data.organizationId) {
        queryClient.setQueryData(
          SupplierKeys.orgSuppliers(variables.data.organizationId),
          (oldData: { data: SupplierDTO[] } | undefined) => {
            if (!oldData) return { data: [variables.data as SupplierDTO] }
            return {
              ...oldData,
              data: oldData.data.map((supplier) =>
                supplier.id === variables.id ? { ...supplier, ...variables.data } : supplier,
              ),
            }
          },
        )
      }
      return { previousSupplierDetail, previousSuppliersList, previousOrgSuppliers }
    },
    onError: (error, variables, context) => {
      toast.error("Failed to update Supplier", {
        description: error.message || "Unknown error occurred",
      })
      if (context?.previousSupplierDetail) {
        queryClient.setQueryData(SupplierKeys.detail(variables.id), context.previousSupplierDetail)
      }
      if (context?.previousSuppliersList) {
        queryClient.setQueryData(SupplierKeys.lists(), context.previousSuppliersList)
      }
      if (context?.previousOrgSuppliers && variables.data.organizationId) {
        queryClient.setQueryData(SupplierKeys.orgSuppliers(variables.data.organizationId), context.previousOrgSuppliers)
      }
    },
    onSuccess: (updatedSupplier, variables) => {
      toast.success("Supplier updated successfully")
      queryClient.setQueryData(SupplierKeys.detail(variables.id), (oldData: SupplierDTO | undefined) => {
        return { ...oldData, ...updatedSupplier }
      })
      queryClient.setQueryData(SupplierKeys.lists(), (oldData: SupplierDTO[] | undefined) => {
        if (!oldData) return [updatedSupplier]
        return oldData.map((supplier) => (supplier.id === variables.id ? updatedSupplier : supplier))
      })
      if (updatedSupplier?.data?.organizationId) {
        queryClient.setQueryData(
          SupplierKeys.orgSuppliers(updatedSupplier?.data?.organizationId),
          (oldData: { data: SupplierDTO[] } | undefined) => {
            if (!oldData) return { data: [updatedSupplier] }
            return {
              ...oldData,
              data: oldData.data.map((supplier) => (supplier.id === updatedSupplier?.data?.id ? updatedSupplier : supplier)),
            }
          },
        )
      }
    },
  })
}

export function useUpdateSupplierBasicInfo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateSupplierBasicInfoPayload }) =>
      updateSupplierBasicInfoById(id, data),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: SupplierKeys.detail(variables.id) })
      await queryClient.cancelQueries({ queryKey: SupplierKeys.lists() })
      if (variables.data.organizationId) {
        await queryClient.cancelQueries({ queryKey: SupplierKeys.orgSuppliers(variables.data.organizationId) })
      }

      const previousSupplierDetail = queryClient.getQueryData(SupplierKeys.detail(variables.id))
      const previousSuppliersList = queryClient.getQueryData(SupplierKeys.lists())
      const previousOrgSuppliers = variables.data.organizationId
        ? queryClient.getQueryData(SupplierKeys.orgSuppliers(variables.data.organizationId))
        : undefined

      queryClient.setQueryData(SupplierKeys.detail(variables.id), (oldData: SupplierDTO | undefined) => {
        return { ...oldData, ...variables.data }
      })
      queryClient.setQueryData(SupplierKeys.lists(), (oldData: SupplierDTO[] | undefined) => {
        if (!oldData) return [variables.data as SupplierDTO]
        return oldData.map((supplier) => (supplier.id === variables.id ? { ...supplier, ...variables.data } : supplier))
      })
      if (variables.data.organizationId) {
        queryClient.setQueryData(
          SupplierKeys.orgSuppliers(variables.data.organizationId),
          (oldData: { data: SupplierDTO[] } | undefined) => {
            if (!oldData) return { data: [variables.data as SupplierDTO] }
            return {
              ...oldData,
              data: oldData.data.map((supplier) =>
                supplier.id === variables.id ? { ...supplier, ...variables.data } : supplier,
              ),
            }
          },
        )
      }
      return { previousSupplierDetail, previousSuppliersList, previousOrgSuppliers }
    },
    onError: (error, variables, context) => {
      toast.error("Failed to update supplier basic info", {
        description: error.message || "Unknown error occurred",
      })
      if (context?.previousSupplierDetail) {
        queryClient.setQueryData(SupplierKeys.detail(variables.id), context.previousSupplierDetail)
      }
      if (context?.previousSuppliersList) {
        queryClient.setQueryData(SupplierKeys.lists(), context.previousSuppliersList)
      }
      if (context?.previousOrgSuppliers && variables.data.organizationId) {
        queryClient.setQueryData(SupplierKeys.orgSuppliers(variables.data.organizationId), context.previousOrgSuppliers)
      }
    },
    onSuccess: (updatedSupplier, variables) => {
      toast.success("Supplier basic info updated successfully")
      queryClient.setQueryData(SupplierKeys.detail(variables.id), (oldData: SupplierDTO | undefined) => {
        return { ...oldData, ...updatedSupplier }
      })
      queryClient.setQueryData(SupplierKeys.lists(), (oldData: SupplierDTO[] | undefined) => {
        if (!oldData) return [updatedSupplier]
        return oldData.map((supplier) => (supplier.id === variables.id ? updatedSupplier : supplier))
      })
      if (updatedSupplier?.data?.organizationId) {
        queryClient.setQueryData(
          SupplierKeys.orgSuppliers(updatedSupplier?.data?.organizationId),
          (oldData: { data: SupplierDTO[] } | undefined) => {
            if (!oldData) return { data: [updatedSupplier] }
            return {
              ...oldData,
              data: oldData.data.map((supplier) => (supplier.id === updatedSupplier?.data?.id? updatedSupplier : supplier)),
            }
          },
        )
      }
    },
  })
}

export function useUpdateSupplierDetails() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateSupplierDetailsPayload }) =>
      updateSupplierDetailsById(id, data),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: SupplierKeys.detail(variables.id) })
      await queryClient.cancelQueries({ queryKey: SupplierKeys.lists() })
      if (variables.data.email) {
        await queryClient.cancelQueries({ queryKey: SupplierKeys.orgSuppliers(variables.data.email) })
      }

      const previousSupplierDetail = queryClient.getQueryData(SupplierKeys.detail(variables.id))
      const previousSuppliersList = queryClient.getQueryData(SupplierKeys.lists())
      const previousOrgSuppliers = variables.data.email
        ? queryClient.getQueryData(SupplierKeys.orgSuppliers(variables.data.email))
        : undefined

      queryClient.setQueryData(SupplierKeys.detail(variables.id), (oldData: SupplierDTO | undefined) => {
        return { ...oldData, ...variables.data }
      })
      queryClient.setQueryData(SupplierKeys.lists(), (oldData: SupplierDTO[] | undefined) => {
        if (!oldData) return [variables.data as SupplierDTO]
        return oldData.map((supplier) => (supplier.id === variables.id ? { ...supplier, ...variables.data } : supplier))
      })
      if (variables.data.email) {
        queryClient.setQueryData(
          SupplierKeys.orgSuppliers(variables.data.email),
          (oldData: { data: SupplierDTO[] } | undefined) => {
            if (!oldData) return { data: [variables.data as SupplierDTO] }
            return {
              ...oldData,
              data: oldData.data.map((supplier) =>
                supplier.id === variables.id ? { ...supplier, ...variables.data } : supplier,
              ),
            }
          },
        )
      }
      return { previousSupplierDetail, previousSuppliersList, previousOrgSuppliers }
    },
    onError: (error, variables, context) => {
      toast.error("Failed to update supplier details", {
        description: error.message || "Unknown error occurred",
      })
      if (context?.previousSupplierDetail) {
        queryClient.setQueryData(SupplierKeys.detail(variables.id), context.previousSupplierDetail)
      }
      if (context?.previousSuppliersList) {
        queryClient.setQueryData(SupplierKeys.lists(), context.previousSuppliersList)
      }
      if (context?.previousOrgSuppliers && variables.data.email) {
        queryClient.setQueryData(SupplierKeys.orgSuppliers(variables.data.email), context.previousOrgSuppliers)
      }
    },
    onSuccess: (updatedSupplier, variables) => {
      toast.success("Supplier details updated successfully")
      queryClient.setQueryData(SupplierKeys.detail(variables.id), (oldData: SupplierDTO | undefined) => {
        return { ...oldData, ...updatedSupplier }
      })
      queryClient.setQueryData(SupplierKeys.lists(), (oldData: SupplierDTO[] | undefined) => {
        if (!oldData) return [updatedSupplier]
        return oldData.map((supplier) => (supplier.id === variables.id ? updatedSupplier : supplier))
      })
      if (updatedSupplier?.data?.organizationId) {
        queryClient.setQueryData(
          SupplierKeys.orgSuppliers(updatedSupplier?.data?.organizationId),
          (oldData: { data: SupplierDTO[] } | undefined) => {
            if (!oldData) return { data: [updatedSupplier] }
            return {
              ...oldData,
              data: oldData.data.map((supplier) => (supplier.id === updatedSupplier?.data?.id? updatedSupplier : supplier)),
            }
          },
        )
      }
    },
  })
}

export function useUpdateSupplierRelations() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateSupplierRelationsPayload }) =>
      updateSupplierRelationsById(id, data),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: SupplierKeys.detail(variables.id) })
      await queryClient.cancelQueries({ queryKey: SupplierKeys.lists() })
      if (variables.data.id) {
        await queryClient.cancelQueries({ queryKey: SupplierKeys.orgSuppliers(variables.data.id) })
      }

      const previousSupplierDetail = queryClient.getQueryData(SupplierKeys.detail(variables.id))
      const previousSuppliersList = queryClient.getQueryData(SupplierKeys.lists())
      const previousOrgSuppliers = variables.data.id
        ? queryClient.getQueryData(SupplierKeys.orgSuppliers(variables.data.id))
        : undefined

      queryClient.setQueryData(SupplierKeys.detail(variables.id), (oldData: SupplierDTO | undefined) => {
        return { ...oldData, ...variables.data }
      })
      queryClient.setQueryData(SupplierKeys.lists(), (oldData: SupplierDTO[] | undefined) => {
        if (!oldData) return [variables.data as SupplierDTO]
        return oldData.map((supplier) => (supplier.id === variables.id ? { ...supplier, ...variables.data } : supplier))
      })
      if (variables.data.id) {
        queryClient.setQueryData(
          SupplierKeys.orgSuppliers(variables.data.id),
          (oldData: { data: SupplierDTO[] } | undefined) => {
            if (!oldData) return { data: [variables.data as SupplierDTO] }
            return {
              ...oldData,
              data: oldData.data.map((supplier) =>
                supplier.id === variables.id ? { ...supplier, ...variables.data } : supplier,
              ),
            }
          },
        )
      }
      return { previousSupplierDetail, previousSuppliersList, previousOrgSuppliers }
    },
    onError: (error, variables, context) => {
      toast.error("Failed to update supplier relations", {
        description: error.message || "Unknown error occurred",
      })
      if (context?.previousSupplierDetail) {
        queryClient.setQueryData(SupplierKeys.detail(variables.id), context.previousSupplierDetail)
      }
      if (context?.previousSuppliersList) {
        queryClient.setQueryData(SupplierKeys.lists(), context.previousSuppliersList)
      }
      if (context?.previousOrgSuppliers && variables.data.id) {
        queryClient.setQueryData(SupplierKeys.orgSuppliers(variables.data.id), context.previousOrgSuppliers)
      }
    },
    onSuccess: (updatedSupplier, variables) => {
      toast.success("Supplier relations updated successfully")
      queryClient.setQueryData(SupplierKeys.detail(variables.id), (oldData: SupplierDTO | undefined) => {
        return { ...oldData, ...updatedSupplier }
      })
      queryClient.setQueryData(SupplierKeys.lists(), (oldData: SupplierDTO[] | undefined) => {
        if (!oldData) return [updatedSupplier]
        return oldData.map((supplier) => (supplier.id === variables.id ? updatedSupplier : supplier))
      })
      if (updatedSupplier?.data?.organizationId) {
        queryClient.setQueryData(
          SupplierKeys.orgSuppliers(updatedSupplier?.data?.organizationId),
          (oldData: { data: SupplierDTO[] } | undefined) => {
            if (!oldData) return { data: [updatedSupplier] }
            return {
              ...oldData,
              data: oldData.data.map((supplier) => (supplier.id === updatedSupplier?.data?.id? updatedSupplier : supplier)),
            }
          },
        )
      }
    },
  })
}
