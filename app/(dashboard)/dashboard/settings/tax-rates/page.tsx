// app/dashboard/TaxRates/page.tsx (Server Component)
// import TaxRateFormForEditing from "@/components/dashboard/TaxRates/TaxRateFormForEditing";
import getOrgTaxRates from "@/actions/taxRate/getOrgTaxRates";
import TaxRateFormForEditing from "@/components/dashboard/taxRates/TaxRateFormForEditing";
import { TableLoading } from "@/components/ui/data-table";
import { AuthenticatedUser, getAuthenticatedUser } from "@/config/useAuth";
// import { getOrgTaxRates } from "@/services/TaxRateAPI";
import { Suspense } from "react";


export default async function TaxRatesPage() {
  // Fetch data on the server
  const user: AuthenticatedUser = await getAuthenticatedUser();
  const userOrgId: string = user?.organizationId;
  const initialTaxRates = await getOrgTaxRates(userOrgId);
  const { data: TaxRatesData } = initialTaxRates;

  return (
    <Suspense fallback={<TableLoading title="Item data" />}>
      <TaxRateFormForEditing
        title="TaxRate Management"
        organizationId={userOrgId}
        initialData={(TaxRatesData ?? []).map(tr => ({
          ...tr,
          organizationId: tr.organizationId ?? "",
          updatedAt: tr.updatedAt ?? tr.createdAt // fallback if updatedAt is missing
        }))}
        editingId={""}
      />
    </Suspense>

  );
}