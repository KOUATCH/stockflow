import {
  getSupplier,
  getSupplierItemLinks,
} from "@/app/actions/suppliers.actions"
import QueryProvider from "@/components/providers/query-provider"
import SupplierForm from "@/components/suppliersSystemComponents/supplier-form"
import { getAuthenticatedUser } from "@/config/useAuth"
import { can } from "@/lib/permissions"
import { redirect } from "next/navigation"
import { onSave, itemSearch, upsertLinks, deleteLink, linkRecent } from "./actions"

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

  const handleSave = async (input: any) => {
    await onSave(supplier.id, organizationId, input)
  }

  const handleItemSearch = async (q: string) => {
    return itemSearch(organizationId, q)
  }

  const handleUpsertLinks = async (rows: Array<any>) => {
    await upsertLinks(supplier.id, organizationId, rows)
  }

  const handleDeleteLink = async (id: string) => {
    await deleteLink(organizationId, id)
  }

  const handleLinkRecent = async (months: number) => {
    return linkRecent(supplier.id, organizationId, months)
  }

  return (
    <main className="container mx-auto max-w-4xl p-4">
      <h1 className="mb-4 text-2xl font-semibold">Edit {supplier.name}</h1>
      <QueryProvider>
        <SupplierForm
          mode="edit"
          organizationId={organizationId}
          onSubmit={handleSave as any}
          initial={supplier as any}
          initialItemLinks={links as any}
          itemSearchAction={handleItemSearch}
          upsertItemSuppliersAction={handleUpsertLinks as any}
          deleteItemSupplierAction={handleDeleteLink as any}
          linkRecentPOItemsAction={handleLinkRecent as any}
        />
      </QueryProvider>
    </main>
  )
}
