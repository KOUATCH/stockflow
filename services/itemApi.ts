// Imports
import createActionItem from "@/actions/itemsShow/createActionItem";
import deleteItem from "@/actions/itemsShow/deleteItem";
import getItemById from "@/actions/itemsShow/getItemById";
import getOrgItems from "@/actions/itemsShow/getOrgItems";
import updateItemBasicInfoById from "@/actions/itemsShow/updateItemBasicInfoById";
import updateItemById from "@/actions/itemsShow/updateItemById";
import updateItemDetailsById from "@/actions/itemsShow/updateItemItemDetailsById";
import updateItemPricingById from "@/actions/itemsShow/updateItemPricingById";
import updateItemRelationsById from "@/actions/itemsShow/updateItemRelationsById";
import updateItemStockById from "@/actions/itemsShow/updateItemStockById";

import type {
    ItemCreateDTO,
    UpdateItemBasicInfoPayload,
    UpdateItemDetailsPayload,
    UpdateItemPayload,
    UpdateItemPricingPayload,
    UpdateItemRelationsPayload,
    UpdateItemStockPayload,
} from "@/types/item";

// Centralized API object for all Item-related server actions
export const itemAPI = {
  /**
   * Fetch all items for an organization
   */
  getAllOrgItems: async (organizationId: string) => {
    const response = await getOrgItems(organizationId);
    if (!response.success) {
      throw new Error(response.error || "Failed to fetch items");
    }
    return response.data;
  },

  /**
   * Fetch a single item by its ID
   */
  getItemById: async (id: string) => {
    const response = await getItemById(id);
    if (!response.success) {
      throw new Error(response.error || "Failed to fetch item");
    }
    return response.data;
  },

  /**
   * Fetch brief item data for an organization
   */
  getBriefItemsByOrgId: async (orgId: string) => {
    const response = await getOrgItems(orgId);
    if (!response.success) {
      throw new Error(response.error || "Failed to fetch brief item data");
    }
    return response.data;
  },

  /**
   * Create a new item
   */
  createAPIItem: async (data: ItemCreateDTO , organizationId:string) => {
    const response = await createActionItem(data);
    if (!response.success) {
      throw new Error(response.error || "Failed to create item");
    }
    return response.data;
  },

  /**
   * Update full item data
   */
  updateItem: async (id: string, data: UpdateItemPayload) => {
    const response = await updateItemById(id, data);
    if (!response.success) {
      throw new Error(response.error || "Failed to update item");
    }
    return response.data;
  },

  // --- Partial Update Methods ---

  /**
   * Update item basic info
   */
  updateItemBasicInfo: async (id: string, data: UpdateItemBasicInfoPayload) => {
    const response = await updateItemBasicInfoById(id, data);
    if (!response.success) {
      throw new Error(response.error || "Failed to update item basic info");
    }
    return response.data;
  },

  /**
   * Update item details
   */
  updateItemDetails: async (id: string, data: UpdateItemDetailsPayload) => {
    const response = await updateItemDetailsById(id, data);
    if (!response.success) {
      throw new Error(response.error || "Failed to update item details");
    }
    return response.data;
  },

  /**
   * Update item stock
   */
  updateItemStock: async (id: string, data: UpdateItemStockPayload) => {
    const response = await updateItemStockById(id, data);
    if (!response.success) {
      throw new Error(response.error || "Failed to update item stock");
    }
    return response.data;
  },

  /**
   * Update item pricing
   */
  updateItemPricing: async (id: string, data: UpdateItemPricingPayload) => {
    const response = await updateItemPricingById(id, data);
    if (!response.success) {
      throw new Error(response.error || "Failed to update item pricing");
    }
    return response.data;
  },

  /**
   * Update item relations
   */
  updateItemRelations: async (id: string, data: UpdateItemRelationsPayload) => {
    const response = await updateItemRelationsById(id, data);
    if (!response.success) {
      throw new Error(response.error || "Failed to update item relations");
    }
    return response.data;
  },

  /**
   * Delete an item
   */
  deleteItem: async (id: string) => {
    const response = await deleteItem(id);
    if (!response.success) {
      throw new Error(response.error || "Failed to delete item");
    }
    return true;
  },
};
