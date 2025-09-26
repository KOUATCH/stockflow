// Imports
import createActionBrand from "@/actions/brands/createActionBrand";
import deleteBrand from "@/actions/brands/deleteBrand";
import getBrandById from "@/actions/brands/getBrandById";
import getOrgBrands from "@/actions/brands/getOrgBrands";
import updateBrandById from "@/actions/brands/updateBrandById";

import { BrandCreateDTO, UpdateBrandPayload } from "@/types/brand";

// Centralized API object for all Brand-related server actions
export const brandAPI = {
  /**
   * Fetch all brands for an organization
   */
  getAllOrgBrands: async (organizationId: string) => {
    const response = await getOrgBrands(organizationId);
    if (!response.success) {
      throw new Error(response.error || "Failed to fetch brands");
    }
    return response.data;
  },

  /**
   * Fetch a single brand by its ID
   */
  getSingleBrandById: async (id: string) => {
    const response = await getBrandById(id);
    if (!response.success) {
      throw new Error(response.error || "Failed to fetch brand");
    }
    return response.data;
  },

  /**
   * Fetch brief brand data for an organization
   */
  getBriefBrandsByOrgId: async (orgId: string) => {
    const response = await getOrgBrands(orgId);
    if (!response.success) {
      throw new Error(response.error || "Failed to fetch brief brand data");
    }
    return response.data;
  },

  /**
   * Create a new brand
   */
  createNewBrand: async (data: BrandCreateDTO) => {
    const response = await createActionBrand(data);
    if (!response.success) {
      throw new Error(response.error || "Failed to create brand");
    }
    return response.data;
  },

  /**
   * Update an existing brand
   */
  updateBrand: async (id: string, data: UpdateBrandPayload) => {
    const response = await updateBrandById(id, data);
    if (!response.success) {
      throw new Error(response.error || "Failed to update brand");
    }
    return response.data;
  },

  /**
   * Delete a brand by ID
   */
  deleteBrand: async (id: string) => {
    const response = await deleteBrand(id);
    if (!response.success) {
      throw new Error(response.error || "Failed to delete brand");
    }
    return true;
  },
};

// Optional: Export getOrgBrands separately if needed elsewhere
export { getOrgBrands };

