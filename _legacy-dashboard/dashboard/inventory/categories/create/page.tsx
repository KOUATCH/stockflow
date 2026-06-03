import getOrgCategories from "@/actions/categories/getOrgCategories"
import { ModernCategoryForm } from "@/components/categories/ModernCategoryForm"
import { getAuthenticatedUser, checkPermission } from "@/config/useAuth"
import { PERMISSIONS } from "@/lib/permissions"

export default async function CreateCategoryPage() {
  await checkPermission(PERMISSIONS.CREATE_CATEGORIES)

  const user = await getAuthenticatedUser()
  const organizationId = user.organizationId
  const categoriesResult = await getOrgCategories(organizationId)

  return (
    <ModernCategoryForm
      organizationId={organizationId}
      categories={categoriesResult.data ?? []}
    />
  )
}
