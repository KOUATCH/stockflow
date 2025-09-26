import type { Item } from "@/lib/cashSystem/types"

// Mock items data
const mockItems: Item[] = [
  {
    id: "item-1",
    name: "Wireless Headphones",
    sku: "WH-001",
    description: "Premium wireless headphones with noise cancellation",
    sellingPrice: 199.99,
    costPrice: 120.0,
    categoryId: "cat-1",
    category: {
      id: "cat-1",
      title: "Electronics",
    },
    taxRate: {
      id: "tax-1",
      rate: 8.75,
    },
    inventoryLevels: [
      {
        id: "inv-1",
        itemId: "item-1",
        locationId: "loc_1",
        quantityAvailable: 25,
        quantityReserved: 2,
        quantityOnOrder: 10,
        minStockLevel: 5,
        maxStockLevel: 50,
        lastUpdated: new Date(),
      },
    ],
    thumbnail: "/wireless-headphones.png",
    isActive: true,
    minStockLevel: 5,
  },
  {
    id: "item-2",
    name: "Coffee Mug",
    sku: "MUG-001",
    description: "Ceramic coffee mug with company logo",
    sellingPrice: 12.99,
    costPrice: 6.5,
    categoryId: "cat-3",
    category: {
      id: "cat-3",
      title: "Food & Beverages",
    },
    taxRate: {
      id: "tax-1",
      rate: 8.75,
    },
    inventoryLevels: [
      {
        id: "inv-2",
        itemId: "item-2",
        locationId: "loc_1",
        quantityAvailable: 50,
        quantityReserved: 0,
        quantityOnOrder: 0,
        minStockLevel: 10,
        maxStockLevel: 100,
        lastUpdated: new Date(),
      },
    ],
    thumbnail: "/simple-coffee-mug.png",
    isActive: true,
    minStockLevel: 10,
  },
  {
    id: "item-3",
    name: "T-Shirt",
    sku: "TS-001",
    description: "Cotton t-shirt in various sizes",
    sellingPrice: 24.99,
    costPrice: 12.0,
    categoryId: "cat-2",
    category: {
      id: "cat-2",
      title: "Clothing",
    },
    taxRate: {
      id: "tax-1",
      rate: 8.75,
    },
    inventoryLevels: [
      {
        id: "inv-3",
        itemId: "item-3",
        locationId: "loc_1",
        quantityAvailable: 30,
        quantityReserved: 5,
        quantityOnOrder: 20,
        minStockLevel: 15,
        maxStockLevel: 75,
        lastUpdated: new Date(),
      },
    ],
    thumbnail: "/plain-white-tshirt.png",
    isActive: true,
    minStockLevel: 15,
  },
  {
    id: "item-4",
    name: "Notebook",
    sku: "NB-001",
    description: "Spiral-bound notebook for notes",
    sellingPrice: 8.99,
    costPrice: 4.5,
    categoryId: "cat-4",
    category: {
      id: "cat-4",
      title: "Books",
    },
    taxRate: {
      id: "tax-1",
      rate: 8.75,
    },
    inventoryLevels: [
      {
        id: "inv-4",
        itemId: "item-4",
        locationId: "loc_1",
        quantityAvailable: 100,
        quantityReserved: 0,
        quantityOnOrder: 0,
        minStockLevel: 20,
        maxStockLevel: 200,
        lastUpdated: new Date(),
      },
    ],
    thumbnail: "/open-notebook-desk.png",
    isActive: true,
    minStockLevel: 20,
  },
  {
    id: "item-5",
    name: "Smartphone Case",
    sku: "SC-001",
    description: "Protective case for smartphones",
    sellingPrice: 29.99,
    costPrice: 15.0,
    categoryId: "cat-1",
    category: {
      id: "cat-1",
      title: "Electronics",
    },
    taxRate: {
      id: "tax-1",
      rate: 8.75,
    },
    inventoryLevels: [
      {
        id: "inv-5",
        itemId: "item-5",
        locationId: "loc_1",
        quantityAvailable: 40,
        quantityReserved: 3,
        quantityOnOrder: 15,
        minStockLevel: 10,
        maxStockLevel: 80,
        lastUpdated: new Date(),
      },
    ],
    thumbnail: "/stylish-smartphone-case.png",
    isActive: true,
    minStockLevel: 10,
  },
  {
    id: "item-6",
    name: "Energy Drink",
    sku: "ED-001",
    description: "Refreshing energy drink",
    sellingPrice: 3.99,
    costPrice: 2.0,
    categoryId: "cat-3",
    category: {
      id: "cat-3",
      title: "Food & Beverages",
    },
    taxRate: {
      id: "tax-1",
      rate: 8.75,
    },
    inventoryLevels: [
      {
        id: "inv-6",
        itemId: "item-6",
        locationId: "loc_1",
        quantityAvailable: 75,
        quantityReserved: 0,
        quantityOnOrder: 50,
        minStockLevel: 25,
        maxStockLevel: 150,
        lastUpdated: new Date(),
      },
    ],
    thumbnail: "/vibrant-energy-drink.png",
    isActive: true,
    minStockLevel: 25,
  },
]

// Mock API function to get items with inventory levels
const fetchItemsWithInventory = async (organizationId: string, locationId: string) => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Filter items by location (in a real app, this would be more complex)
  const items = mockItems.map((item) => ({
    ...item,
    inventoryLevels: item.inventoryLevels?.filter((inv) => inv.locationId === locationId) || [],
  }))

  return {
    success: true,
    data: items,
    message: "Items with inventory fetched successfully",
  }
}

export function useOrgItemsWithInventoryLevelsLocation(
  organizationId: string,
  locationId: string,
  options?: { enabled?: boolean },
) {
  const items = mockItems.map((item) => ({
    ...item,
    inventoryLevels: item.inventoryLevels?.filter((inv) => inv.locationId === locationId) || [],
  }))

  return {
    data: {
      success: true,
      data: items,
      message: "Items with inventory fetched successfully",
    },
    isLoading: false,
    error: null,
  }
}

// Alternative hook names for compatibility
export function useAllItemQueries(organizationId: string, locationId: string) {
  return useOrgItemsWithInventoryLevelsLocation(organizationId, locationId)
}

export function useOrgItems(organizationId: string) {
  return {
    data: {
      success: true,
      data: mockItems,
      message: "Items fetched successfully",
    },
    isLoading: false,
    error: null,
  }
}
