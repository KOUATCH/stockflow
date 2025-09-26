

// import { LocationDTO, BriefLocationResponse, UpdateLocationPayload } from "@/types/Location";

import createLocation from "@/actions/locations/createLocation";
import deleteLocation from "@/actions/locations/deleteLocation";
import getLocationById from "@/actions/locations/getLocationById";
import { getOrgLocations } from "@/actions/locations/getOrgLocations";
// import getOrgLocation from "@/actions/locations/getOrgLocation";
import updateLocationById from "@/actions/locations/updateLocationById";
import { LocationDTO } from "@/types/location";

// Centralized API object for all Location-related server actions
export const locationAPI = {
  // Fetch all Locations
  getAllOrgLocations: async (organizationId:string) => {
   
    const response = await getOrgLocations(organizationId);
    if (!response.success) {
      throw new Error(response.error || "Failed to fetch Locations");
    }
    return response.data;
  },

  // Get a single Location by ID
  getSingleLocationById: async (id: string) => {
    const response = await getLocationById(id);
    if (!response.success) {
      throw new Error(response.error || "Failed to fetch Location");
    }
    return response.data;
  },

  // Get all organization Locations
  getBriefLocationsByOrgId: async (orgId:string) => {
    const response = await getOrgLocations(orgId);
    if (response.success === false) {
      throw new Error(response.error || "Failed to fetch organization Locations");
    }
    return response.data;
  },


  // Create a new Location
  createNewLocation: async (data: LocationDTO) => {
    const response = await createLocation(data);
    if (!response.success) {
      throw new Error(response.error || "Failed to create Location");
    }
    return response.data;
  },

  // Update an existing Location
  updateALocation: async (id: string, data: LocationDTO) => {
    const response = await updateLocationById(id, data);
    if (!response.success) {
      throw new Error(response.error || "Failed to update Location");
    }
    return response.data;
  },
  
  // Delete a Location
  deleteALocation: async (id: string) => {
    const response = await deleteLocation(id);
    if (!response.success) {
      throw new Error(response.error || "Failed to delete Location");
    }
    return true;
  },
}

export { getOrgLocations };

