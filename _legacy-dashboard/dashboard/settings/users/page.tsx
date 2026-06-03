import getOrgRoles from "@/actions/roles/getOrgRoles";
import { getOrgInvites } from "@/actions/users/getOrgInvites";
import getOrgUsers from "@/actions/users/getOrgUsers";
import EnhancedUsersManagement from "@/components/inventory/EnhancedUsersManagement";
import InviteTableWithSearch from "@/components/dashboard/Tables/Invites";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAuthenticatedUser } from "@/config/useAuth";
import { Suspense } from "react";
import { TableLoading } from "@/components/ui/data-table";

const page = async () => {

  const user = await getAuthenticatedUser()
  const organizationId = user?.organizationId ?? ""
  const res = await getOrgRoles(organizationId);
  const rolesData = res.data || [];
  const userRoles = rolesData.map((role) => {
    return {
      label: role.name,
      value: role.id
    }
  }
  )
  const organizationName = user?.organizationName ?? ""
  const email = user?.email ?? ""
  const orgUsers = await getOrgUsers(organizationId) || [];

  const orgInvites = await getOrgInvites(organizationId) || []
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <Tabs defaultValue="users" className="space-y-8">
          <TabsList className="inline-flex h-auto w-full justify-start gap-4 rounded-none border-b bg-transparent p-0 flex-wrap">
            {["users", "invites"].map((feature) => {
              return (
                <TabsTrigger
                  key={feature}
                  value={feature}
                  className="inline-flex items-center gap-2 border-b-2 border-transparent px-8 pb-3 pt-2 data-[state=active]:border-primary capitalize"
                >
                  {feature.split("-").join(" ")}
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value="users" className="space-y-8">
            <Suspense fallback={<TableLoading title="Users data" />}>
              <EnhancedUsersManagement data={orgUsers} organizationId={organizationId} />
            </Suspense>
          </TabsContent>

          <TabsContent value="invites" className="space-y-8">
            <div className="max-w-2xl py-6">
              <InviteTableWithSearch data={orgInvites} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
export default page