import createActionTaxRate from "@/actions/taxRate/createActionTaxRate";
import deleteTaxRate from "@/actions/taxRate/deleteTaxRate";
import getOrgTaxRates from "@/actions/taxRate/getOrgTaxRates";
import getTaxRateById from "@/actions/taxRate/getTaxRateById";
import updateTaxRateByIdNew from "@/actions/taxRate/updateTaxRateByIdNew";
import {
  TaxRateCreateDTO,
  UpdateTaxRatePayload,
} from "@/types/taxRates";

// import createActionTaxRate from "@/actions/taxRates/createNewTaxRate";
// import deleteTaxRate from "@/actions/taxRates/deleteTaxRate";
// import getOrgTaxRates from "@/actions/taxRates/getOrgTaxRates";
// import getTaxRateById from "@/actions/taxRates/getTaxRateById";
// import updateTaxRateByIdNew from "@/actions/taxRates/updateTaxRateByIdNew";

// // Centralized API object for all TaxRate-related server actions
export const taxRateAPI = {
  /**
   * Fetch all TaxRates for a given organization
   */
  getAllOrgTaxRates: async (organizationId: string) => {
    const response = await getOrgTaxRates(organizationId);
    if (!response.success) {
      throw new Error(response.error || "Failed to fetch TaxRates");
    }
    return response.data;
  },

  /**
   * Fetch a single TaxRate by its ID
   */
  getSingleTaxRateById: async (id: string) => {
    const response = await getTaxRateById(id);
    if (!response?.success) {
      throw new Error(response?.error || "Failed to fetch TaxRate");
    }
    return response.data;
  },

  /**
   * Fetch brief TaxRates for a given organization
   */
  getBriefTaxRatesByOrgId: async (orgId: string) => {
    const response = await getOrgTaxRates(orgId);
    if (!response.success) {
      throw new Error(response.error || "Failed to fetch organization TaxRates");
    }
    return response.data;
  },

  /**
   * Create a new TaxRate
   */
  createNewTaxRate: async (data: TaxRateCreateDTO) => {
    const response = await createActionTaxRate(data);
    if (!response?.success || !response.data) {
      throw new Error(response.error || "Failed to create TaxRate");
    }
    return response.data;
  },

  /**
   * Update an existing TaxRate by ID
   */
  updateTaxRate: async (id: string, data: UpdateTaxRatePayload) => {
    const response = await updateTaxRateByIdNew(id, data);
    if (!response.success) {
      throw new Error(response.error || "Failed to update TaxRate");
    }
    return response.data;
  },

  /**
   * Delete a TaxRate by IDa
   */
  deleteTaxRate: async (id: string) => {
    const response = await deleteTaxRate(id);
    if (!response?.success || !response.data) {
      throw new Error(response.error || "Failed to delete TaxRate");
    }
    return true;
  },
};

// Export individual actions if needed elsewhere
export { getOrgTaxRates };

