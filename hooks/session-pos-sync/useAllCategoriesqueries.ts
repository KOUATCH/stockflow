import { mockCategories } from "@/lib/cashSystem/db"

// Mock API function to get categories
const fetchCategories = async (organizationId: string) => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  // Filter categories by organization
  const categories = mockCategories.filter((cat) => cat.organizationId === organizationId)

  return {
    success: true,
    data: categories,
    message: "Categories fetched successfully",
  }
}

export function useOrgCategories(organizationId: string) {
  return {
    data: {
      success: true,
      data: mockCategories.filter((cat) => cat.organizationId === organizationId),
      message: "Categories fetched successfully",
    },
    isLoading: false,
    error: null,
  }
}

// Alternative hook name for compatibility
export function useAllCategoriesQueries(organizationId: string) {
  return useOrgCategories(organizationId)
}
