import createSupplier from "@/actions/suppliers/createSupplier"
import QueryProvider from "@/components/providers/query-provider"
import SupplierForm from "@/components/suppliersSystemComponents/supplier-form"
import { getAuthenticatedUser } from "@/config/useAuth"
import { localizePath, pickLocale } from "@/i18n/routing"
import { hasPermission, PERMISSIONS } from "@/lib/permissions"
import { redirect } from "next/navigation"

export default async function NewSupplierPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale: rawLocale } = await params
  const locale = pickLocale(rawLocale)
  const user = await getAuthenticatedUser()
  if (!hasPermission(user.permissions, PERMISSIONS.CREATE_SUPPLIERS)) redirect(localizePath("/dashboard/suppliersSystem", locale))

  async function onCreate(input: any) {
    "use server"
    await createSupplier(input)
    redirect(localizePath("/dashboard/suppliersSystem", locale))
  }

  return (
    <main className="container mx-auto max-w-4xl p-4">
      <h1 className="mb-4 text-2xl font-semibold">New Supplier</h1>
      <QueryProvider>
        <SupplierForm mode="create" organizationId={user.organizationId} onSubmit={onCreate as any} />
      </QueryProvider>
    </main>
  )
}
