import { updateItemSupplier } from "@/actions/item-suppliers/updateItemSupplier"
import type {
  BriefItemSupplierDTO,
  CreateItemSupplierDTO,
  ItemSupplierDTO,
  UpdateItemSupplierDTO,
} from "@/types/itemSuppliers"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000" // Fallback to a default if not set

export const itemSupplierAPI = {
  getItemSuppliers: async (filters: any): Promise<ItemSupplierDTO[]> => {
    const queryParams = new URLSearchParams(filters).toString()
    const url = `${API_BASE_URL}/item-suppliers?${queryParams}`
    const res = await fetch(url)

    if (!res.ok) {
      throw new Error(`Failed to fetch item suppliers: ${res.status} - ${res.statusText}`)
    }

    return (await res.json()) as ItemSupplierDTO[]
  },

  getItemSupplier: async (id: string): Promise<ItemSupplierDTO> => {
    const res = await fetch(`${API_BASE_URL}/item-suppliers/${id}`)

    if (!res.ok) {
      throw new Error(`Failed to fetch item supplier: ${res.status} - ${res.statusText}`)
    }

    return (await res.json()) as ItemSupplierDTO
  },

  getAllOrgItemSuppliers: async (organizationId: string): Promise<BriefItemSupplierDTO[]> => {
    const res = await fetch(`${API_BASE_URL}/organizations/${organizationId}/item-suppliers`)

    if (!res.ok) {
      throw new Error(`Failed to fetch organization item suppliers: ${res.status} - ${res.statusText}`)
    }

    return (await res.json()) as BriefItemSupplierDTO[]
  },

  getItemSuppliersByItemId: async (itemId: string): Promise<ItemSupplierDTO[]> => {
    const res = await fetch(`${API_BASE_URL}/items/${itemId}/item-suppliers`)

    if (!res.ok) {
      throw new Error(`Failed to fetch item suppliers for item: ${res.status} - ${res.statusText}`)
    }

    return (await res.json()) as ItemSupplierDTO[]
  },

  createItemSupplier: async (data: CreateItemSupplierDTO): Promise<ItemSupplierDTO> => {
    const res = await fetch(`${API_BASE_URL}/item-suppliers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const errorBody = await res.json()
      throw new Error(
        `Failed to create item supplier: ${res.status} - ${res.statusText} - ${errorBody?.message || "No message"}`,
      )
    }

    return (await res.json()) as ItemSupplierDTO
  },
  /**
   * Update item details
   */
  updateItemSupplier: async ( data: UpdateItemSupplierDTO) => {
    const response = await updateItemSupplier(data);
    if (!response.success) {
      throw new Error(response.error || "Failed to update item supplier");
    }
    return response.data;
  },


  deleteItemSupplier: async (id: string): Promise<void> => {
    const res = await fetch(`${API_BASE_URL}/item-suppliers/${id}`, {
      method: "DELETE",
    })

    if (!res.ok) {
      throw new Error(`Failed to delete item supplier: ${res.status} - ${res.statusText}`)
    }
  },
}

