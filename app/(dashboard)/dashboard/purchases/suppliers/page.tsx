// app/dashboard/suppliers/page.tsx (Server Component)
import { getSuppliers } from "@/actions/suppliers/supplierActions";
import getOrgTaxRates from "@/actions/taxRate/getOrgTaxRates";
import { TableLoading } from "@/components/ui/data-table";
import UnifiedSupplierForm from "@/components/ui/groups/UnifiedSupplierForm";
import { AuthenticatedUser, getAuthenticatedUser } from "@/config/useAuth";
import { Suspense } from "react";


export default async function SuppliersPage() {
  // Fetch data on the server
  const user: AuthenticatedUser = await getAuthenticatedUser();
  const userOrgId: string = user?.organizationId;

  if (!userOrgId) {
    throw new Error("Organization ID is required to list suppliers");
  }

  const initialSuppliers = await getSuppliers({
    organizationId: userOrgId,
    page: 1,
    limit: 50,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const suppliersData = initialSuppliers.data
  const taxRateDataRes = (await getOrgTaxRates(userOrgId)) || {};
  const taxRates = taxRateDataRes.data || []; // Ensure items is an array, even if empty

  return (
    <div className="container py-8">
      <Suspense fallback={<TableLoading title="Item data" />}>

        <UnifiedSupplierForm
          title={""}
          editingId={""}
          organizationId={userOrgId}
          initialSupplierData={suppliersData}
          initialTaxRateData={taxRates}
        />
      </Suspense>
    </div>

  );
}
