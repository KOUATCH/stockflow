"use client"

import EnhancedCategoriesManagement from "@/components/inventory/EnhancedCategoriesManagement"
import type { CategoryDTO } from "@/types/category"

interface CategoriesPageClientProps {
  initialData: CategoryDTO[]
  organizationId: string
  basePath?: string
}

export default function CategoriesPageClient({
  initialData,
  organizationId,
  basePath = "/dashboard/inventory/categories",
}: CategoriesPageClientProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <EnhancedCategoriesManagement
          data={initialData}
          organizationId={organizationId}
          basePath={basePath}
        />
      </div>
    </div>
  )
}
