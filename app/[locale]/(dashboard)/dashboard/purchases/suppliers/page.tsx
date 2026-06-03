// app/dashboard/suppliers/page.tsx (Server Component)
import getOrgSuppliers from "@/actions/suppliers/getOrgSuppliers";
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

  const initialSuppliers = await getOrgSuppliers({
    page: 1,
    pageSize: 50,
  });
  const suppliersData = initialSuppliers.success ? (initialSuppliers.data?.data ?? []) : [];
  const taxRateDataRes = (await getOrgTaxRates(userOrgId)) || {};
  const taxRates = taxRateDataRes.data || []; // Ensure items is an array, even if empty

  return (
    <div className="container py-8">
      <Suspense fallback={<TableLoading title="Item data" />}>

        <UnifiedSupplierForm
          title={""}
          editingId={""}
          organizationId={userOrgId}
          // SupplierDTO from services/supplier (Prisma) has `email: string | null`,
          // the legacy form expects `email: string | undefined`. Cast bridges the
          // gap until the form is migrated off legacy types.
          initialSupplierData={suppliersData as unknown as Parameters<typeof UnifiedSupplierForm>[0]["initialSupplierData"]}
          initialTaxRateData={taxRates}
        />
      </Suspense>
    </div>

  );
}
