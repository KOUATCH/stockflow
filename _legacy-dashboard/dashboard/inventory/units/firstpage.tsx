import getOrgUnits from "@/actions/units/getOrgUnits";
import ModalTableHeader from "@/components/dashboard/Tables/ModalTableheader";
import DataTable from "@/components/DataTableComponents/DataTable";
import NewUnitForm from "@/components/Forms/inventory/NewUnitForm";
import { getAuthenticatedUser } from "@/config/useAuth";
import { columns } from "./columns";

const page = async () => {

  const user = await getAuthenticatedUser()
  const organizationId = user?.organizationId ?? ""
  const userPermissions = user?.permissions ?? []
  const hasPermission = userPermissions.includes('units.read')
  if (!hasPermission) {
    return (
      <div className="flex items-center justify-center h-screen">
        <h1 className="text-2xl font-bold">You do not have the permission to view this page.</h1>
      </div>
    )
  }

  const orgUnitsData = await getOrgUnits(organizationId);
  const orgUnits = Array.isArray(orgUnitsData)
    ? orgUnitsData.map(unit => ({
      ...unit,
      organizationId: unit.organizationId ?? ""
    }))
    : [];
  if (!orgUnits) { return null }
  return (
    <div className="p-8">
      <ModalTableHeader
        title="Unit"
        linkTitle="#"
        href="#"
        data={orgUnits}
        model="unit"
        modalForm={<NewUnitForm organizationId={organizationId} />}
      />
      <DataTable data={orgUnits} columns={columns} />

    </div>
  );
}
export default page