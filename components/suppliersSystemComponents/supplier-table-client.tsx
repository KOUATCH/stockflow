"use client"

import { useDeleteSupplier, useToggleSupplierActive } from "@/hooks/supplierSystemHooks"
import type { SupplierDTO, SupplierFilters } from "@/types/suppliersSystemTypes"
import { SupplierTable } from "./supplier-table"

export default function SupplierTableClient({
  rows,
  filters,
  toggleAction,
  deleteAction,
}: {
  rows: SupplierDTO[]
  filters: SupplierFilters
  toggleAction: (params: { id: string; organizationId: string; isActive: boolean }) => Promise<any>
  deleteAction: (id: string, organizationId: string) => Promise<any>
}) {
  const toggleMutation = useToggleSupplierActive(toggleAction)
  const deleteMutation = useDeleteSupplier(deleteAction)

  return (
    <SupplierTable
      rows={rows}
      filters={filters}
      onToggleActive={(id, isActive) =>
        toggleMutation.mutateAsync({ id, organizationId: filters.organizationId, isActive })
      }
      onDelete={(id) => deleteMutation.mutateAsync({ id, organizationId: filters.organizationId })}
    />
  )
}
