import { UnitCreateDTO } from "@/types/unit";
import createUnit from "./createUnit22";


const createBulkunits=async(units: UnitCreateDTO[])=> {
  try {
    for (const unit of units) {
      await createUnit(unit);
    }
     return {
        success: true,
        error: null,
        data: units,
      };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : "Failed to fetch units",
    };
  }
}
export default createBulkunits