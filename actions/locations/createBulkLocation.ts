import { LocationDTO } from "@/types/location";
import createlocations from "./createLocation";


const createBulkLocation=async(locations: LocationDTO[])=> {
  try {
    for (const location of locations) {
      await createlocations(location);
    }
     return {
        success: true,
        error: null,
        data: locations,
      };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : "Failed to fetch locations",
    };
  }
}
export default createBulkLocation