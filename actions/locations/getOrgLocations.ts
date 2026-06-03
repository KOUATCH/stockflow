// In your server action file
"use server";
import { listLocations } from "@/services/location/location.service";
import { LocationResponse } from "@/types/location";

export const getOrgLocations = async (orgId: string): Promise<LocationResponse> => {
  try {
    const locations = await listLocations(orgId);
    
    return {
      success: true,
      error: null,
      data: locations,
    };  
  } catch (error) {
    console.error("Error fetching locations:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      data: [],
    };
  }
}
