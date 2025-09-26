import { TaxRateCreateDTO } from "@/types/taxRates";
import createTaxRate from "./createTaxRate";


const createBulkTaxRates=async(TaxRates: TaxRateCreateDTO[])=> {
  try {
    for (const TaxRate of TaxRates) {
      await createTaxRate(TaxRate);
    }
     return {
        success: true,
        error: null,
        data: TaxRates,
      };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : "Failed to fetch TaxRates",
    };
  }
}
export default createBulkTaxRates