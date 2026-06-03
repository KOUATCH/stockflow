import getOrgRoles from "@/actions/roles/getOrgRoles";
import EnhancedRolesManagement from "@/components/inventory/EnhancedRolesManagement";
import { getAuthenticatedUser } from "@/config/useAuth";
import { Suspense } from "react";
import { TableLoading } from "@/components/ui/data-table";

const page = async () => {
  const user = await getAuthenticatedUser()
  const organizationId = user?.organizationId ?? ""
  const res = await getOrgRoles(organizationId);
  const roles = res.data || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <Suspense fallback={<TableLoading title="Roles data" />}>
          <EnhancedRolesManagement data={roles} organizationId={organizationId} />
        </Suspense>
      </div>
    </div>
  );
}
export default page