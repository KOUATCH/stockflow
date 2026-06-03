import { notFound } from "next/navigation"

import { getCategoryById, getOrgCategories } from "@/actions/categories/getCategoriesAction"
import { ModernCategoryForm } from "@/components/categories/ModernCategoryForm"
import { getAuthenticatedUser, checkPermission } from "@/config/useAuth"
import { PERMISSIONS } from "@/lib/permissions"

interface CategoryEditPageProps {
  params: Promise<{ id: string }> | { id: string }
}

export default async function CategoryEditPage({ params }: CategoryEditPageProps) {
  await checkPermission(PERMISSIONS.UPDATE_CATEGORIES)

  const { id } = await Promise.resolve(params)
  const user = await getAuthenticatedUser()

  if (!user?.organizationId) {
    notFound()
  }

  const [categoryResult, categoriesResult] = await Promise.all([
    getCategoryById(id, user.organizationId),
    getOrgCategories(user.organizationId),
  ])

  if (!categoryResult.success || !categoryResult.data) {
    notFound()
  }

  return (
    <ModernCategoryForm
      mode="edit"
      organizationId={user.organizationId}
      initialData={categoryResult.data}
      categories={categoriesResult.data ?? []}
    />
  )
}
