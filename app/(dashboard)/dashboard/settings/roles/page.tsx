import getOrgRoles from "@/actions/roles/getOrgRoles";
import DataTable from "@/components/DataTableComponents/DataTable";
import TableHeader from "@/components/dashboard/Tables/TableHeader";
import { getAuthenticatedUser } from "@/config/useAuth";
import { columns } from "./columns";

const page = async () => {

  const user = await getAuthenticatedUser()
  const organizationId = user?.organizationId ?? ""
  const res = await getOrgRoles(organizationId);
  const roles = res.data || [];
  return (
    <div>
      <TableHeader
        title="Roles"
        model="role"
        linkTitle="Add Role"
        href="/dashboard/settings/roles/new"
        data={roles}
        showImport={false}
      />
      {/* <CustomDataTable categories={categories} /> */}
      <DataTable columns={columns} data={roles} />
    </div>
  );
}
export default page