// app/dashboard/brands/page.tsx (Server Component)
import BrandFormForEditing from "@/components/dashboard/brands/BrandFormForEditing";
import { TableLoading } from "@/components/ui/data-table";
import { AuthenticatedUser, getAuthenticatedUser } from "@/config/useAuth";
import { getOrgBrands } from "@/services/brandAPI";
import { Suspense } from "react";


export default async function BrandsPage() {
  // Fetch data on the server
  const user: AuthenticatedUser = await getAuthenticatedUser();
  const userOrgId: string = user?.organizationId;
  const initialBrands = await getOrgBrands(userOrgId);
  const { data: brandsData, success } = initialBrands;

  return (
    <Suspense fallback={<TableLoading title="Item data" />}>
      <BrandFormForEditing
        title="Brand Management"
        organizationId={userOrgId}
        initialData={brandsData ?? []}
        editingId={""}
      />
    </Suspense>

  );
}