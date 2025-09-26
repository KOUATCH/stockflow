// Imports
import createCategory from "@/actions/categories/createCategory";
import { deleteCategory } from "@/actions/categories/deleteCategory";
import getCategoryById from "@/actions/categories/getCategoryById";
import getOrgCategories from "@/actions/categories/getOrgCategories";
import newUpdateCategoryById from "@/actions/categories/newUpdateCategoryById";

import { CategoryCreateDTO, UpdateCategoryPayload } from "@/types/category";

// Centralized API object for all Category-related server actions
export const categoryAPI = {
  /**
   * Fetch all categories for an organization
   */
  getAllOrgCategories: async (organizationId: string) => {
    const response = await getOrgCategories(organizationId);
    if (!response.success) {
      throw new Error(response.error || "Failed to fetch categories");
    }
    return response.data;
  },

  /**
   * Fetch a single category by its ID
   */
  getCategoryById: async (id: string) => {
    const response = await getCategoryById(id);
    if (!response?.success) {
      throw new Error(response?.error || "Failed to fetch category");
    }
    return response.data;
  },

  /**
   * Fetch brief category data for an organization
   */
  getBriefCategoriesByOrgId: async (orgId: string) => {
    const response = await getOrgCategories(orgId);
    if (!response.success) {
      throw new Error(response.error || "Failed to fetch brief category data");
    }
    return response.data;
  },

  /**
   * Create a new category
   */
  createCategory: async (data: CategoryCreateDTO) => {
    const response = await createCategory(data);
    if (!response?.success || !response.data) {
      throw new Error(response.error || "Failed to create category");
    }
    return response.data;
  },

  /**
   * Update an existing category
   */
  updateCategory: async (id: string, data: UpdateCategoryPayload) => {
    const response = await newUpdateCategoryById(id, data);
    if (!response.success) {
      throw new Error(response.error || "Failed to update category");
    }
    return response.data;
  },

  /**
   * Delete a category by ID
   */
  deleteCategory: async (id: string) => {
    const response = await deleteCategory(id);
    if (!response?.success || !response.data) {
      throw new Error(response.error || "Failed to delete category");
    }
    return true;
  },
};

// Optional: Export getOrgCategories separately if needed elsewhere
export { getOrgCategories };

