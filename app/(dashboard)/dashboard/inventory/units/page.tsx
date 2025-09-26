// app/dashboard/units/page.tsx (Server Component)
import UnitFormForEditing from "@/components/dashboard/units/UnitFormForEditing";
import { TableLoading } from "@/components/ui/data-table";
import { AuthenticatedUser, getAuthenticatedUser } from "@/config/useAuth";
import { getOrgUnits } from "@/services/unitAPI";
import { Suspense } from "react";


export default async function UnitsPage() {
  // Fetch data on the server
  const user: AuthenticatedUser = await getAuthenticatedUser();
  const userOrgId: string = user?.organizationId;
  const initialUnits = await getOrgUnits(userOrgId);
  const { data: unitsData, success } = initialUnits;

  return (
    <Suspense fallback={<TableLoading title="Item data" />}>
      <UnitFormForEditing
        title="Unit Management"
        organizationId={userOrgId}
        initialData={unitsData ?? []}
        editingId={""}
      />
    </Suspense>

  );
}