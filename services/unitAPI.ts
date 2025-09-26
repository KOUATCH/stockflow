import {
  UnitCreateDTO,
  UpdateUnitPayload,
} from "@/types/unit";

import createActionUnit from "@/actions/units/createActionUnit";
import deleteUnit from "@/actions/units/deleteUnit";
import getOrgUnits from "@/actions/units/getOrgUnits";
import getUnitById from "@/actions/units/getUnitById";
import updateUnitByIdNew from "@/actions/units/updateUnitById";

// Centralized API object for all Unit-related server actions
export const unitAPI = {
  /**
   * Fetch all Units for a given organization
   */
  getAllOrgUnits: async (organizationId: string) => {
    const response = await getOrgUnits(organizationId);
    if (!response.success) {
      throw new Error(response.error || "Failed to fetch Units");
    }
    return response.data;
  },

  /**
   * Fetch a single Unit by its ID
   */
  getSingleUnitById: async (id: string) => {
    const response = await getUnitById(id);
    if (!response?.success) {
      throw new Error(response?.error || "Failed to fetch Unit");
    }
    return response.data;
  },

  /**
   * Fetch brief Units for a given organization
   */
  getBriefUnitsByOrgId: async (orgId: string) => {
    const response = await getOrgUnits(orgId);
    if (!response.success) {
      throw new Error(response.error || "Failed to fetch organization Units");
    }
    return response.data;
  },

  /**
   * Create a new Unit
   */
  createUnit: async (data: UnitCreateDTO) => {
    const response = await createActionUnit(data);
    if (!response?.success || !response.data) {
      throw new Error(response.error || "Failed to create Unit");
    }
    return response.data;
  },

  /**
   * Update an existing Unit by ID
   */
  updateUnit: async (id: string, data: UpdateUnitPayload) => {
    const response = await updateUnitByIdNew(id, data);
    if (!response.success) {
      throw new Error(response.error || "Failed to update Unit");
    }
    return response.data;
  },

  /**
   * Delete a Unit by IDa
   */
  deleteUnit: async (id: string) => {
    const response = await deleteUnit(id);
    if (!response?.success || !response.data) {
      throw new Error(response.error || "Failed to delete Unit");
    }
    return true;
  },
};

// Export individual actions if needed elsewhere
export { getOrgUnits };

