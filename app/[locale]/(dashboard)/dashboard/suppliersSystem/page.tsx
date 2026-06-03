import QueryProvider from "@/components/providers/query-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus } from "lucide-react"
import { localizePath, pickLocale } from "@/i18n/routing"
import { getTranslations } from "next-intl/server"
import Link from "next/link"

import { deleteSupplier, getSuppliers, toggleSupplierActive } from "@/actions/supplierSystem/supplierSystemActions"
import SupplierTableClient from "@/components/suppliersSystemComponents/supplier-table-client"
import { getAuthenticatedUser } from "@/config/useAuth"
import { hasPermission, PERMISSIONS } from "@/lib/permissions"
import type { SupplierFilters } from "@/types/suppliersSystemTypes"

export default async function SuppliersPage({
  searchParams,
  params,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
  params: Promise<{ locale: string }>
}) {
  const resolvedSearchParams = await searchParams
  const { locale: rawLocale } = await params
  const locale = pickLocale(rawLocale)
  const t = await getTranslations("suppliers")
  const organizationId = (resolvedSearchParams.organizationId as string)
  const user = await getAuthenticatedUser()
  const filters: SupplierFilters = {
    organizationId,
    page: Number(resolvedSearchParams.page || 1),
    limit: Number(resolvedSearchParams.limit || 20),
    search: (resolvedSearchParams.search as string) || undefined,
    active:
      (resolvedSearchParams.active as string) === "true"
        ? true
        : (resolvedSearchParams.active as string) === "false"
          ? false
          : undefined,
    sortBy: (resolvedSearchParams.sortBy as any) || "name",
    sortOrder: (resolvedSearchParams.sortOrder as any) || "asc",
  }

  const { data } = await getSuppliers(filters)

  return (
    <main className="container mx-auto max-w-7xl space-y-6 p-4">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("page.title")}</h1>
          <p className="text-sm text-slate-600">{t("page.subtitle")}</p>
        </div>
        {hasPermission(user.permissions, PERMISSIONS.CREATE_SUPPLIERS) && (
          <Button asChild className="bg-teal-600 hover:bg-teal-700">
            <Link href={localizePath(`/dashboard/suppliersSystem/new?organizationId=${organizationId}`, locale)}>
              <Plus className="me-2 h-4 w-4" /> {t("page.newCta")}
            </Link>
          </Button>
        )}
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-slate-500">{t("tips.title")}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-600 whitespace-pre-line">
            {t("tips.body")}
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
