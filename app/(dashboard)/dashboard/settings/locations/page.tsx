

import { getOrgLocations } from "@/actions/locations/getOrgLocations";
import LocationFormWithEditing from "@/components/ui/groups/LocationFormWithEditing";
import { getAuthenticatedUser } from "@/config/useAuth";

export default async function ItemsPage() {
  const user = await getAuthenticatedUser();
  const orgId = user?.organizationId;

  const locations = await getOrgLocations(orgId);
  const locationsData = locations && locations?.data;
  return (
    <div className="container mx-auto py-8">
      <LocationFormWithEditing
        title={"Organization Locations"}
        editingId={""}
        organizationId={orgId}
        initialLocationData={locationsData || []}
      />
    </div>
  )
}
