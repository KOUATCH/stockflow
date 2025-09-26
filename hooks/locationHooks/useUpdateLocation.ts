

import updateLocationById from "@/actions/locations/updateLocationById";
import { LocationDTO } from "@/types/location";
import { LocationKeys2 } from "@/types/queryKeys";
import { useEntityMutation } from "./useEntityMutation";

const useUpdateLocation = () =>
  useEntityMutation<LocationDTO>(
    updateLocationById,
    {
      detail: LocationKeys2.detail,
      list: LocationKeys2.lists,
      orgList: LocationKeys2.orgLocations,
    },
    "Location updated successfully",
    "Failed to update location"
  );

export default useUpdateLocation;
