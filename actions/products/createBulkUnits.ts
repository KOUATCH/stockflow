import { UnitProps } from "@/types/types";
import { createUnit } from "@/actions/units/getUnitsAction";

const createBulkUnits= async(units: UnitProps[])=> {
  try {
    for (const unit of units) {
      await createUnit(unit);
    }
     return {
        error: null,
        status: 200,
        data: units,
      };
  } catch (error) {
    console.log(error);
  }
}
export default createBulkUnits
