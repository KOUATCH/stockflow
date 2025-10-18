import CategoryFormForEditing from "@/components/dashboard/categories/CategoryFormForEditing";
import { TableLoading } from "@/components/ui/data-table";
import { AuthenticatedUser, getAuthenticatedUser, checkPermission } from "@/config/useAuth";
import { getOrgCategories } from "@/services/categoryAPI";
import { PERMISSIONS } from "@/lib/permissions";
import { Suspense } from "react";


export default async function CategoriesPage() {
  // Check permission first
  await checkPermission(PERMISSIONS.READ_CATEGORIES);

  // Fetch data on the server
  const user: AuthenticatedUser = await getAuthenticatedUser();
  const userOrgId: string = user?.organizationId;
  const initialCategories = await getOrgCategories(userOrgId);
  const { data: categoriesData, success } = initialCategories;

  return (
    <Suspense fallback={<TableLoading title="Item data" />}>
      <CategoryFormForEditing
        title="Category Management"
        organizationId={userOrgId}
        initialData={(categoriesData ?? []).map(cat => ({
          ...cat,
          description: cat.description === undefined ? null : cat.description
        }))}
        editingId={""}
      />
    </Suspense>

  );
}