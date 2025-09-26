// Database type definitions and mock data

export interface Customer {
  id: string
  name: string
  email?: string
  phone?: string
  address?: string
  loyaltyPoints?: number
  createdAt: Date
  updatedAt: Date
}

export interface Organization {
  id: string
  name: string
  type: string
  settings?: Record<string, any>
}

export interface Location {
  id: string
  name: string
  type: string
  address?: string
  organizationId: string
  organization?: Organization
}

export interface Terminal {
  id: string
  name: string
  locationId: string
  status: "active" | "inactive"
  ipAddress?: string
  lastActivity?: Date
}

export interface Category {
  id: string
  title: string
  description?: string
  parentId?: string
  organizationId: string
}

// Mock data for development
export const mockCustomers: Customer[] = [
  {
    id: "cust-1",
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1-555-0123",
    loyaltyPoints: 150,
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
  },
  {
    id: "cust-2",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    phone: "+1-555-0456",
    loyaltyPoints: 75,
    createdAt: new Date("2024-01-20"),
    updatedAt: new Date("2024-01-20"),
  },
  {
    id: "cust-3",
    name: "Bob Johnson",
    phone: "+1-555-0789",
    loyaltyPoints: 200,
    createdAt: new Date("2024-01-25"),
    updatedAt: new Date("2024-01-25"),
  },
]

export const mockCategories: Category[] = [
  {
    id: "cat-1",
    title: "Electronics",
    description: "Electronic devices and accessories",
    organizationId: "org-1",
  },
  {
    id: "cat-2",
    title: "Clothing",
    description: "Apparel and fashion items",
    organizationId: "org-1",
  },
  {
    id: "cat-3",
    title: "Food & Beverages",
    description: "Food items and drinks",
    organizationId: "org-1",
  },
  {
    id: "cat-4",
    title: "Books",
    description: "Books and educational materials",
    organizationId: "org-1",
  },
]
