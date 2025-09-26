

// Centralized API object for all Supplier-related server actions
export const supplierAPI = {
  /**
   * Fetch all Suppliers for a given organization
   */
  getAllOrgSuppliers: async (organizationId: string) => {
    const response = await getOrgSuppliers(organizationId);
    if (!response.success) {
      throw new Error(response.error || "Failed to fetch Suppliers");
    }
    return response.data;
  },

  /**
   * Fetch a single Supplier by its ID
   */
  getSingleSupplierById: async (id: string) => {
    const response = await getSupplierById(id);
    if (!response?.success) {
      throw new Error(response?.error || "Failed to fetch Supplier");
    }
    return response.data;
  },

  /**
   * Fetch brief Suppliers for a given organization
   */
  getSuppliersByOrgId: async (orgId: string) => {
    const response = await getOrgSuppliers(orgId);
    if (!response.success) {
      throw new Error(response.error || "Failed to fetch organization Suppliers");
    }
    return response.data;
  },

  /**
   * Create a new Supplier
   */
  createSupplier: async (data: SupplierCreateDTO) => {
    const response = await createActionSupplier(data);
    if (!response?.success || !response.data) {
      throw new Error(response.error || "Failed to create Supplier");
    }
    return response.data;
  },

  /**
   * Update an existing Supplier by ID
   */
  updateSupplier: async (id: string, data: UpdateSupplierPayload) => {
    const response = await updateSupplierByIdNew(id, data);
    if (!response.success) {
      throw new Error(response.error || "Failed to update Supplier");
    }
    return response.data;
  },

  /**
   * Delete a Supplier by IDa
   */
  deleteSupplier: async (id: string) => {
    const response = await deleteSupplier(id);
    if (!response?.success || !response.data) {
      throw new Error(response.error || "Failed to delete Supplier");
    }
    return true;
  },

 updateSupplierBasicInfo: async (id: string, data: UpdateSupplierBasicInfoPayload) => {
    const response = await updateSupplierBasicInfoById(id, data);
    if (!response.success) {
      throw new Error(response.error || "Failed to update supplier basic info");
    }
    return response.data;
  },

  /**
   * Update supplier details
   */
  updateSupplierRelations: async (id: string, data: UpdateSupplierRelationsPayload) => {
    const response = await updateSupplierRelationsById(id, data);
    if (!response.success) {
      throw new Error(response.error || "Failed to update supplier details");
    }
    return response.data;
  },

  /**
   * Update supplier details
   */
  updateSupplierDetails: async (id: string, data: UpdateSupplierDetailsPayload) => {
    const response = await updateSupplierDetailsById(id, data);
    if (!response.success) {
      throw new Error(response.error || "Failed to update supplier details");
    }
    return response.data;
  },
}
// Export individual actions if needed elsewhere
export { getOrgSuppliers };

