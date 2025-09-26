export interface Customer {
  id: string
  name: string
  code: string | null
  email: string | null
  phone: string | null
  address: string | null
  taxId: string | null
  creditLimit: number | null
  paymentTerms: number
  notes: string | null
  isActive: boolean
  organizationId: string
  createdAt: Date
  updatedAt: Date
}

export interface CustomerWithStats extends Customer {
  totalOrders: number
  totalRevenue: number
  lastOrderDate: Date | null
}
