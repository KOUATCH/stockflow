import { mockCustomers } from "@/lib/cashSystem/db"

// Mock API function to get customers
const fetchCustomers = async (organizationId: string) => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 400))

  // In a real app, you'd filter by organization
  // For now, return all mock customers
  return {
    success: true,
    data: mockCustomers,
    message: "Customers fetched successfully",
  }
}

export function useCustomers(organizationId: string) {
  return {
    data: {
      success: true,
      data: mockCustomers,
      message: "Customers fetched successfully",
    },
    isLoading: false,
    error: null,
  }
}

// Hook to get a specific customer
export function useCustomer(customerId: string) {
  const customer = mockCustomers.find((c) => c.id === customerId)

  return {
    data: customer
      ? {
          success: true,
          data: customer,
          message: "Customer fetched successfully",
        }
      : null,
    isLoading: false,
    error: customer ? null : new Error("Customer not found"),
  }
}

// Hook to search customers
export function useCustomerSearch(searchTerm: string, organizationId: string) {
  const filteredCustomers = mockCustomers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone?.includes(searchTerm),
  )

  return {
    data: {
      success: true,
      data: filteredCustomers,
      message: "Customer search completed",
    },
    isLoading: false,
    error: null,
  }
}
