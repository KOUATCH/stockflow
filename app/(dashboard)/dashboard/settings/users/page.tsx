import getOrgRoles from "@/actions/roles/getOrgRoles";
import { getOrgInvites } from "@/actions/users/getOrgInvites";
import getOrgUsers from "@/actions/users/getOrgUsers";
import DataTable from "@/components/DataTableComponents/DataTable";
import UserInvitationForm from "@/components/Forms/users/userInvitationForm";
import InviteTableWithSearch from "@/components/dashboard/Tables/Invites";
import ModalTableHeader from "@/components/dashboard/Tables/ModalTableheader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAuthenticatedUser } from "@/config/useAuth";
import { columns } from "./columns";

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
    <div className="p-8">

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
        <ModalTableHeader
          title="User invitation"
          linkTitle="Invite user"
          href="#"
          data={orgUsers}
          model="user"
          modalForm={<UserInvitationForm roles={userRoles} organizationId={organizationId} organizationName={organizationName} email={email} name={""} />} />
        <TabsContent value="users" className="space-y-8">
          <DataTable data={orgUsers} columns={columns} />
        </TabsContent>
        <TabsContent value="invites" className="space-y-8">
          <div className="max-w-2xl py-6">
            <InviteTableWithSearch data={orgInvites} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
export default page