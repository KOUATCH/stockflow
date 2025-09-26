"use client"

import {
  deleteItemSupplierLink,
  getRecentPOItemsForSupplier,
  getSupplier,
  getSupplierItemLinks,
  searchItemsLite,
  updateSupplier,
  upsertItemSupplierBulk,
} from "@/app/actions/suppliers.actions"
import QueryProvider from "@/components/providers/query-provider"
import SupplierForm from "@/components/suppliers/supplier-form"
import { getAuthenticatedUser } from "@/config/useAuth"
import { can } from "@/lib/permissions"
import { redirect } from "next/navigation"

export default async function EditSupplierPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: Record<string, string | string[] | undefined>
}) {
  const organizationId = (searchParams.organizationId as string)
  const user = await getAuthenticatedUser()
  if (!can(user as any, "supplier:update")) redirect(`/dashboard/supplierSystem?organizationId=${organizationId}`)

  const supplier = await getSupplier(params.id, organizationId)
  const links = await getSupplierItemLinks({ supplierId: supplier.id, organizationId })

  async function onSave(input: any) {
    "use server"
    await updateSupplier(supplier.id, input)
    redirect(`/dashboard/supplierSystem/${supplier.id}?organizationId=${organizationId}`)
  }

  async function itemSearch(q: string) {
    "use server"
    return searchItemsLite({ organizationId, q, limit: 10 })
  }

  async function upsertLinks(rows: Array<any>) {
    "use server"
    await upsertItemSupplierBulk({ supplierId: supplier.id, organizationId, rows })
  }

  async function deleteLink(id: string) {
    "use server"
    await deleteItemSupplierLink({ id, organizationId })
  }

  async function linkRecent(months: number) {
    "use server"
    const items = await getRecentPOItemsForSupplier({ supplierId: supplier.id, organizationId, months, limit: 100 })
    return items
  }

  return (
    <main className="container mx-auto max-w-4xl p-4">
      <h1 className="mb-4 text-2xl font-semibold">Edit {supplier.name}</h1>
      <QueryProvider>
        <SupplierForm
          mode="edit"
          organizationId={organizationId}
          onSubmit={onSave as any}
          initial={supplier as any}
          initialItemLinks={links as any}
          itemSearchAction={itemSearch}
          upsertItemSuppliersAction={upsertLinks as any}
          deleteItemSupplierAction={deleteLink as any}
          linkRecentPOItemsAction={linkRecent as any}
        />
      </QueryProvider>
    </main>
  )
}
