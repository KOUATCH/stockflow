import { Suspense } from "react"
import { AlertTriangle, FolderOpen } from "lucide-react"

import getOrgCategories from "@/actions/categories/getOrgCategories"
import CategoriesPageClient from "@/components/dashboard/categories/CategoriesPageClient"
import { getAuthenticatedUser, checkPermission } from "@/config/useAuth"
import { pickLocale } from "@/i18n/routing"
import { PERMISSIONS } from "@/lib/permissions"

type CategoriesPageProps = {
  params: Promise<{ locale: string }>
}

export default async function CategoriesPage({ params }: CategoriesPageProps) {
  await checkPermission(PERMISSIONS.READ_CATEGORIES)

  const { locale: rawLocale } = await params
  const locale = pickLocale(rawLocale)
  const user = await getAuthenticatedUser()
  const organizationId = user?.organizationId
  const basePath = `/${locale}/dashboard/inventory/categories`

  if (!organizationId) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-md px-4 py-16 text-center">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <AlertTriangle className="h-7 w-7 text-muted-foreground" />
          </div>
          <h1 className="mb-2 text-xl font-semibold text-foreground">Organization Required</h1>
          <p className="text-sm text-muted-foreground">No organization found for the current user.</p>
        </div>
      </div>
    )
  }

  const initialCategories = await getOrgCategories(organizationId)
  const initialCategoryData = initialCategories.data ?? []

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md border bg-muted">
            <FolderOpen className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-normal text-foreground">Category Catalog</h1>
            <p className="text-sm text-muted-foreground">
              Manage bilingual category records, hierarchy, and item assignments.
            </p>
          </div>
        </div>

        <Suspense fallback={<div className="rounded-md border p-6 text-sm text-muted-foreground">Loading categories...</div>}>
          <CategoriesPageClient
            initialData={initialCategoryData}
            organizationId={organizationId}
            basePath={basePath}
          />
        </Suspense>
      </div>
    </div>
  )
}
