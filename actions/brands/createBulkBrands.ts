import { BrandCreateDTO } from "@/types/brand";
import createbrands from "./createBrands";


const createBulkbrands=async(brands: BrandCreateDTO[])=> {
  try {
    for (const brand of brands) {
      await createbrands(brand);
    }
     return {
        success: true,
        error: null,
        data: brands,
      };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : "Failed to fetch brands",
    };
  }
}
export default createBulkbrands