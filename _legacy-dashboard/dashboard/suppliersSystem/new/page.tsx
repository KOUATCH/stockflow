import QueryProvider from "@/components/providers/query-provider"
import SupplierForm from "@/components/suppliersSystemComponents/supplier-form"
import { getAuthenticatedUser } from "@/config/useAuth"
import { can } from "@/lib/permissions"
import { redirect } from "next/navigation"
import { onCreate } from "./actions"

export default async function NewSupplierPage({
  searchParams,
}: { searchParams: Record<string, string | string[] | undefined> }) {
  const organizationId = (searchParams.organizationId as string)
  const user = await getAuthenticatedUser()
  if (!can(user as any, "supplier:create")) redirect(`/dashboard/suppliersSystem?organizationId=${organizationId}`)

  const handleCreate = async (input: any) => {
    await onCreate(organizationId, input)
  }

  return (
    <main className="container mx-auto max-w-4xl p-4">
      <h1 className="mb-4 text-2xl font-semibold">New Supplier</h1>
      <QueryProvider>
        <SupplierForm mode="create" organizationId={organizationId} onSubmit={handleCreate as any} />
      </QueryProvider>
    </main>
  )
}
