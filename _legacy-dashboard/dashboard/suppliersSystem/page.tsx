import QueryProvider from "@/components/providers/query-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus } from "lucide-react"
import Link from "next/link"

import { deleteSupplier, getSuppliers, toggleSupplierActive } from "@/actions/supplierSystem/supplierSystemActions"
import SupplierTableClient from "@/components/suppliersSystemComponents/supplier-table-client"
import { getAuthenticatedUser } from "@/config/useAuth"
import { can } from "@/lib/permissions"
import type { SupplierFilters } from "@/types/suppliersSystemTypes"

export default async function SuppliersPage({
  searchParams,
}: { searchParams: Record<string, string | string[] | undefined> }) {
  const organizationId = (searchParams.organizationId as string)
  const user = await getAuthenticatedUser()
  const filters: SupplierFilters = {
    organizationId,
    page: Number(searchParams.page || 1),
    limit: Number(searchParams.limit || 20),
    search: (searchParams.search as string) || undefined,
    active:
      (searchParams.active as string) === "true"
        ? true
        : (searchParams.active as string) === "false"
          ? false
          : undefined,
    sortBy: (searchParams.sortBy as any) || "name",
    sortOrder: (searchParams.sortOrder as any) || "asc",
  }

  const { data } = await getSuppliers(filters)

  return (
    <main className="container mx-auto max-w-7xl space-y-6 p-4">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Suppliers</h1>
          <p className="text-sm text-slate-600">Manage suppliers and purchasing partners.</p>
        </div>
        {can(user as any, "supplier:create") && (
          <Button asChild className="bg-teal-600 hover:bg-teal-700">
            <Link href={`/dashboard/supplierSystem/new?organizationId=${organizationId}`}>
              <Plus className="mr-2 h-4 w-4" /> New Supplier
            </Link>
          </Button>
        )}
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-slate-500">Quick Tips</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-600">
            - Search with name, code, email, city. <br />- Toggle active to hide inactive suppliers in PO forms.
          </CardContent>
        </Card>
      </section>

      <QueryProvider>
        <SupplierTableClient
          rows={data}
          filters={filters}
          toggleAction={toggleSupplierActive}
          deleteAction={deleteSupplier}
        />
      </QueryProvider>
    </main>
  )
}
