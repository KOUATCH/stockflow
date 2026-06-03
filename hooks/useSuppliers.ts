"use client"

import { useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query"

import { createSupplier } from "@/actions/suppliers/createSupplier"
import { deleteSupplier } from "@/actions/suppliers/deleteSupplier"
import { getSupplierById } from "@/actions/suppliers/getSupplierById"
import { getSuppliersByOrgId } from "@/actions/suppliers/getSuppliersByOrgId"
import { updateSupplier } from "@/actions/suppliers/updateSupplier"
import type {
  CreateSupplierDTO,
  SupplierDTO,
  UpdateSupplierBasicInfoPayload,
  UpdateSupplierDTO,
  UpdateSupplierDetailsPayload,
  UpdateSupplierPayload,
  UpdateSupplierRelationsPayload,
} from "@/types/supplier"

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
  const supplierQueries = queryClient.getQueryCache().findAll()
  for (const query of supplierQueries) {
    const organizationId = findOrganizationIdInData(query.state.data, supplierId)
    if (organizationId) return organizationId
  }
  return undefined
}

function normalizeUpdateInput(input: SupplierUpdateInput, queryClient: QueryClient): UpdateSupplierDTO {
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

export function useOrgSuppliers(organizationId: string) {
  return useQuery({
    queryKey: ["orgSuppliers", organizationId],
    queryFn: async () => {
      const response = await getSuppliersByOrgId(organizationId)
      if (!response.success) {
        throw new Error(response.error || "Failed to fetch suppliers")
      }
      return response.data
    },
    enabled: !!organizationId,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  })
}

export function useSupplier(id: string) {
  return useQuery({
    queryKey: ["supplier", id],
    queryFn: async () => getSupplierById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  })
}

export function useCreateSupplier() {
  const queryClient = useQueryClient()

  return useMutation({
    meta: { operation: "create", entity: "Supplier" },
    mutationFn: async (data: CreateSupplierDTO) => {
      const response = await createSupplier(data)
      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to create supplier")
      }
      return response.data as SupplierDTO
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["orgSuppliers", data.organizationId] })
      queryClient.invalidateQueries({ queryKey: ["orgSuppliers"] })
    },
  })
}

export function useUpdateSupplier() {
  const queryClient = useQueryClient()

  return useMutation({
    meta: { operation: "update", entity: "Supplier" },
    mutationFn: async (input: SupplierUpdateInput) => {
      const payload = normalizeUpdateInput(input, queryClient)
      const response = await updateSupplier(payload)
      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to update supplier")
      }
      return response.data as SupplierDTO
    },
    onSuccess: (data, variables) => {
      const payload = normalizeUpdateInput(variables, queryClient)
      queryClient.invalidateQueries({ queryKey: ["supplier", payload.id] })
      queryClient.invalidateQueries({ queryKey: ["orgSuppliers", data.organizationId] })
      queryClient.invalidateQueries({ queryKey: ["orgSuppliers"] })
    },
  })
}

export function useUpdateSupplierBasicInfo() {
  return useUpdateSupplier()
}

export function useUpdateSupplierDetails() {
  return useUpdateSupplier()
}

export function useUpdateSupplierRelations() {
  return useUpdateSupplier()
}

export function useDeleteSupplier() {
  const queryClient = useQueryClient()

  return useMutation({
    meta: { operation: "delete", entity: "Supplier" },
    mutationFn: async (input: DeleteSupplierInput) => {
      const { id, organizationId } = normalizeDeleteInput(input, queryClient)
      if (!organizationId) {
        throw new Error("Organization ID is required to delete supplier")
      }
      const response = await deleteSupplier(id, organizationId)
      if (!response.success) {
        throw new Error(response.error || "Failed to delete supplier")
      }
      return true
    },
    onSuccess: (_, variables) => {
      const { id, organizationId } = normalizeDeleteInput(variables, queryClient)
      queryClient.invalidateQueries({ queryKey: ["supplier", id] })
      queryClient.invalidateQueries({ queryKey: ["orgSuppliers"] })
      if (organizationId) {
        queryClient.invalidateQueries({ queryKey: ["orgSuppliers", organizationId] })
      }
    },
  })
}

export function useAllOrgSuppliers(organizationId: string) {
  return useOrgSuppliers(organizationId)
}

export function useSuppliersByOrgId(orgId: string) {
  return useOrgSuppliers(orgId)
}
