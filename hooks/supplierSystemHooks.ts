"use client"

import type { SupplierDTO, SupplierInput } from "@/types/suppliersSystemTypes"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useMemo, useState } from "react"

function useDebounced<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value)
  useMemo(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

export function useSupplierSearch({
  q,
  searchAction,
}: {
  q: string
  searchAction: (q: string) => Promise<Array<{ id: string; name: string; code?: string | null; email?: string | null }>>
}) {
  const debounced = useDebounced(q)
  return useQuery({
    queryKey: ["supplier-search", debounced],
    queryFn: () => searchAction(debounced),
    staleTime: 30_000,
    enabled: true,
  })
}

export function useToggleSupplierActive(
  toggleAction: (params: { id: string; organizationId: string; isActive: boolean }) => Promise<any>,
) {
  const qc = useQueryClient()
  return useMutation({
    meta: { operation: 'toggle', entity: 'Supplier Active' },
    mutationFn: toggleAction,
    onSuccess: async (_data, variables) => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["suppliers", variables.organizationId] }),
        qc.invalidateQueries({ queryKey: ["supplier", variables.id] }),
      ])
    },
  })
}

export function useDeleteSupplier(deleteAction: (id: string, organizationId: string) => Promise<any>) {
  const qc = useQueryClient()
  return useMutation({
    meta: { operation: 'delete', entity: 'Supplier' },
    mutationFn: ({ id, organizationId }: { id: string; organizationId: string }) => deleteAction(id, organizationId),
    onSuccess: async (_d, vars) => {
      await qc.invalidateQueries({ queryKey: ["suppliers", vars.organizationId] })
    },
  })
}

export function useUpsertSupplier(
  upsertAction: (input: Partial<SupplierInput> & { id?: string; organizationId: string }) => Promise<SupplierDTO>,
) {
  const qc = useQueryClient()
  return useMutation({
    meta: { operation: 'update', entity: 'Supplier' },
    mutationFn: upsertAction,
    onSuccess: async (d) => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["suppliers", d.organizationId] }),
        qc.invalidateQueries({ queryKey: ["supplier", d.id] }),
      ])
    },
  })
}
