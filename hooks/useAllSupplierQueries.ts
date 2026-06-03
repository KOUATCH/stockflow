"use client"

import { useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query"
import { useEffect } from "react"

import { createSupplier } from "@/actions/suppliers/createSupplier"
import { deleteSupplier } from "@/actions/suppliers/deleteSupplier"
import { updateSupplier } from "@/actions/suppliers/updateSupplier"
import { getOrgSuppliersClientSafe } from "@/actions/suppliers/clientSafeSuppliersActions"
import { notify } from "@/lib/notifications/notify"
import type {
  CreateSupplierDTO,
  SupplierDTO,
  UpdateSupplierBasicInfoPayload,
  UpdateSupplierDTO,
  UpdateSupplierDetailsPayload,
  UpdateSupplierPayload,
  UpdateSupplierRelationsPayload,
} from "@/types/supplier"

export const SupplierKeys = {
  all: ["suppliers"] as const,
  lists: () => [...SupplierKeys.all, "list"] as const,
  list: (filters: unknown) => [...SupplierKeys.lists(), { filters }] as const,
  filteredList: (dateFilter: unknown, searchQuery: string) =>
    [...SupplierKeys.lists(), { dateFilter, searchQuery }] as const,
  details: () => [...SupplierKeys.all, "detail"] as const,
  detail: (id: string) => [...SupplierKeys.details(), id] as const,
  orgSuppliers: (organizationId: string) => [...SupplierKeys.all, "org", organizationId] as const,
  briefOrgSuppliers: (organizationId: string) => [...SupplierKeys.all, "briefOrg", organizationId] as const,
}

type WrappedSupplierUpdate<T extends UpdateSupplierPayload = UpdateSupplierPayload> = {
  id: string
  data: T
}

type SupplierUpdateInput =
  | UpdateSupplierDTO
  | WrappedSupplierUpdate
  | (UpdateSupplierPayload & { id: string })

type DeleteSupplierInput =
  | string
  | {
      id: string
      organizationId?: string
    }

function isWrappedUpdate(input: SupplierUpdateInput): input is WrappedSupplierUpdate {
  return typeof input === "object" && input !== null && "data" in input
}

function findOrganizationIdInData(value: unknown, supplierId: string): string | undefined {
  if (!value) return undefined

  if (Array.isArray(value)) {
    for (const item of value) {
      const organizationId = findOrganizationIdInData(item, supplierId)
      if (organizationId) return organizationId
    }
    return undefined
  }

  if (typeof value !== "object") return undefined

  const record = value as Record<string, unknown>
  if (record.id === supplierId && typeof record.organizationId === "string") {
    return record.organizationId
  }

  for (const key of ["data", "suppliers", "items"]) {
    const organizationId = findOrganizationIdInData(record[key], supplierId)
    if (organizationId) return organizationId
  }

  return undefined
}

function findSupplierOrganizationId(queryClient: QueryClient, supplierId: string): string | undefined {
  const supplierQueries = queryClient.getQueryCache().findAll({ queryKey: SupplierKeys.all })
  for (const query of supplierQueries) {
    const organizationId = findOrganizationIdInData(query.state.data, supplierId)
    if (organizationId) return organizationId
  }
  return undefined
}

function normalizeUpdateInput(
  input: SupplierUpdateInput,
  queryClient: QueryClient
): UpdateSupplierDTO {
  const data = isWrappedUpdate(input) ? input.data : input
  const id = isWrappedUpdate(input) ? input.id : input.id
  const organizationId = data.organizationId ?? findSupplierOrganizationId(queryClient, id)

  if (!id) {
    throw new Error("Supplier ID is required")
  }

  if (!organizationId) {
    throw new Error("Organization ID is required to update supplier")
  }

  return {
    ...data,
    id,
    organizationId,
  }
}

function normalizeDeleteInput(
  input: DeleteSupplierInput,
  queryClient: QueryClient
): { id: string; organizationId?: string } {
  const id = typeof input === "string" ? input : input.id
  const organizationId =
    typeof input === "string" ? findSupplierOrganizationId(queryClient, input) : input.organizationId

  return { id, organizationId }
}

export const useOrgSuppliersNew = (organizationId: string, options?: { enabled?: boolean }) => {
  const query = useQuery({
    queryKey: SupplierKeys.orgSuppliers(organizationId),
    queryFn: async () => {
      if (!organizationId) {
        throw new Error("Organization ID is required")
      }
      const response = await getOrgSuppliersClientSafe(organizationId)
      if (!response.success) {
        throw new Error(response.error || "Failed to fetch suppliers")
      }
      return response
    },
    enabled: !!organizationId && (options?.enabled ?? true),
    staleTime: 5 * 60 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })

  useEffect(() => {
    if (query.error) {
      notify.error("Failed to load suppliers. Please try again.")
    }
  }, [query.error])

  return query
}

export const useOrgSuppliers = useOrgSuppliersNew

export function useCreateSupplier() {
  const queryClient = useQueryClient()

  return useMutation({
    meta: {
      operation: "create",
      entity: "Supplier",
      suppressSuccessNotification: true,
      suppressErrorNotification: true,
    },
    mutationFn: async (data: CreateSupplierDTO) => {
      const response = await createSupplier(data)
      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to add Supplier")
      }
      return response.data as SupplierDTO
    },
    onSuccess: (data, variables) => {
      notify.success("Supplier added successfully")
      queryClient.invalidateQueries({ queryKey: SupplierKeys.orgSuppliers(data.organizationId) })
      queryClient.invalidateQueries({ queryKey: SupplierKeys.briefOrgSuppliers(data.organizationId) })
      queryClient.invalidateQueries({ queryKey: SupplierKeys.lists() })
      if (variables.organizationId !== data.organizationId) {
        queryClient.invalidateQueries({ queryKey: SupplierKeys.orgSuppliers(variables.organizationId) })
      }
    },
    onError: (error: Error) => {
      notify.error("Failed to add Supplier", {
        description: error.message || "Unknown error occurred",
      })
    },
  })
}

export function useDeleteSupplier() {
  const queryClient = useQueryClient()

  return useMutation({
    meta: {
      operation: "delete",
      entity: "Supplier",
      suppressSuccessNotification: true,
      suppressErrorNotification: true,
    },
    mutationFn: async (input: DeleteSupplierInput) => {
      const { id, organizationId } = normalizeDeleteInput(input, queryClient)
      if (!organizationId) {
        throw new Error("Organization ID is required to delete supplier")
      }

      const response = await deleteSupplier(id, organizationId)
      if (!response.success) {
        throw new Error(response.error || "Failed to delete Supplier")
      }
      return response.data
    },
    onMutate: async (input) => {
      const { id, organizationId } = normalizeDeleteInput(input, queryClient)
      const queryKeys: Array<readonly unknown[]> = [SupplierKeys.lists()]

      if (organizationId) {
        queryKeys.push(SupplierKeys.orgSuppliers(organizationId))
        queryKeys.push(SupplierKeys.briefOrgSuppliers(organizationId))
      }

      await Promise.all(queryKeys.map((key) => queryClient.cancelQueries({ queryKey: key })))

      const previousData = new Map<string, unknown>()
      const removeSupplierFromData = (oldData: unknown): unknown => {
        if (!oldData) return oldData
        if (Array.isArray(oldData)) {
          return oldData.filter((supplier: { id?: string }) => supplier.id !== id)
        }
        if (typeof oldData !== "object") return oldData

        const record = oldData as Record<string, unknown>
        if (Array.isArray(record.data)) {
          return {
            ...record,
            data: record.data.filter((supplier: { id?: string }) => supplier.id !== id),
          }
        }
        if (Array.isArray(record.suppliers)) {
          return {
            ...record,
            suppliers: record.suppliers.filter((supplier: { id?: string }) => supplier.id !== id),
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

      return { previousData, queryKeys, organizationId }
    },
    onSuccess: () => {
      notify.success("Supplier deleted successfully")
    },
    onError: (error: Error, _variables, context) => {
      notify.error("Failed to delete Supplier", {
        description: error.message || "Unknown error occurred",
      })
      context?.queryKeys.forEach((key) => {
        const previousValue = context.previousData.get(JSON.stringify(key))
        if (previousValue) {
          queryClient.setQueryData(key, previousValue)
        }
      })
    },
    onSettled: (_data, _error, _variables, context) => {
      queryClient.invalidateQueries({ queryKey: SupplierKeys.lists() })
      if (context?.organizationId) {
        queryClient.invalidateQueries({ queryKey: SupplierKeys.orgSuppliers(context.organizationId) })
        queryClient.invalidateQueries({ queryKey: SupplierKeys.briefOrgSuppliers(context.organizationId) })
      }
    },
  })
}

export function useUpdateSupplier() {
  const queryClient = useQueryClient()

  return useMutation({
    meta: {
      operation: "update",
      entity: "Supplier",
      suppressSuccessNotification: true,
      suppressErrorNotification: true,
    },
    mutationFn: async (input: SupplierUpdateInput) => {
      const payload = normalizeUpdateInput(input, queryClient)
      const response = await updateSupplier(payload)
      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to update Supplier")
      }
      return response.data as SupplierDTO
    },
    onSuccess: (updatedSupplier, variables) => {
      const payload = normalizeUpdateInput(variables, queryClient)
      notify.success("Supplier updated successfully")
      queryClient.setQueryData(SupplierKeys.detail(payload.id), updatedSupplier)
      queryClient.invalidateQueries({ queryKey: SupplierKeys.detail(payload.id) })
      queryClient.invalidateQueries({ queryKey: SupplierKeys.lists() })
      queryClient.invalidateQueries({ queryKey: SupplierKeys.orgSuppliers(payload.organizationId) })
      queryClient.invalidateQueries({ queryKey: SupplierKeys.briefOrgSuppliers(payload.organizationId) })
    },
    onError: (error: Error) => {
      notify.error("Failed to update Supplier", {
        description: error.message || "Unknown error occurred",
      })
    },
  })
}

export function useUpdateSupplierBasicInfo() {
  return useUpdateSupplier() as ReturnType<
    () => ReturnType<typeof useMutation<SupplierDTO, Error, WrappedSupplierUpdate<UpdateSupplierBasicInfoPayload> | UpdateSupplierBasicInfoPayload>>
  >
}

export function useUpdateSupplierDetails() {
  return useUpdateSupplier() as ReturnType<
    () => ReturnType<typeof useMutation<SupplierDTO, Error, WrappedSupplierUpdate<UpdateSupplierDetailsPayload> | UpdateSupplierDetailsPayload>>
  >
}

export function useUpdateSupplierRelations() {
  return useUpdateSupplier() as ReturnType<
    () => ReturnType<typeof useMutation<SupplierDTO, Error, WrappedSupplierUpdate<UpdateSupplierRelationsPayload> | UpdateSupplierRelationsPayload>>
  >
}
