

import updateLocationById from "@/actions/locations/updateLocationById";
import { LocationDTO } from "@/types/location";
import { LocationKeys2 } from "@/types/queryKeys";
import { useEntityMutation } from "./useEntityMutation";

const updateLocation = async ({
  id,
  data,
}: {
  id: string
  data: Partial<LocationDTO>
}): Promise<LocationDTO | null> => {
  const result = await updateLocationById(id, data as LocationDTO)

  if (!result.success) {
    throw new Error(result.error ?? "Failed to update location")
  }

  return result.data as LocationDTO | null
}

const useUpdateLocation = () =>
  useEntityMutation<LocationDTO>(
    updateLocation,
    {
      detail: LocationKeys2.detail,
      list: LocationKeys2.lists,
      orgList: LocationKeys2.orgLocations,
    },
    "Location updated successfully",
    "Failed to update location"
  );

export default useUpdateLocation;
