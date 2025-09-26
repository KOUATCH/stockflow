import type { Prisma } from '@prisma/client'

export type SupplierSortBy =
  | 'createdAt'
  | 'updatedAt'
  | 'name'
  | 'code'
  | 'isActive'

export type SortOrder = 'asc' | 'desc'

export type     SupplierFilters = {
  organizationId: string | undefined
  page?: number
  limit?: number
  search?: string
  isActive?: boolean
  sortBy?: SupplierSortBy
  sortOrder?: SortOrder
}

export type PaginationMetadata = {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
  pageStart: number
  pageEnd: number
}

export type PaginatedSuppliersResponse = {
  data: SupplierWithRelations[]
  pagination: PaginationMetadata
  filters: SupplierFilters
}

export type SupplierResponse<T> = {
  success: boolean
  error: string | null
  data: T
}

// Full supplier shape with related counts and item links
export type SupplierWithRelations = Prisma.SupplierGetPayload<{
  include: {
    _count: {
      select: {
        purchaseOrders: true
        supplierItems: true
      }
    }
    supplierItems: {
      include: {
        item: {
          select: {
            id: true
            name: true
            sku: true
            costPrice: true
            isActive: true
          }
        }
      }
    }
  }
}>

// Full supplier shape with related counts and item links
export type SimpleSupplierWithRelations = Prisma.SupplierGetPayload<{
  include: {
    id:true,
    supplierItems: {
      include: {
        item: {
          select: {
            id: true
            name: true
            sku: true
            costPrice: true
            isActive: true
          }
        }
      }
    }
  }
}>

// DTOs
export type CreateSupplierDTO = {
  organizationId: string
  name: string
  code?: string | null
  contactPerson?: string | null
  email?: string | null
  phone?: string | null
  address?: string | null
  city?: string | null
  state?: string | null
  zipCode?: string | null
  country?: string | null
  taxId?: string | null
  paymentTerms?: number | null // days
  creditLimit?: number | null
  notes?: string | null
  isActive?: boolean | null
}

export type UpdateSupplierDTO = {
  id: string
  organizationId: string
  name?: string
  code?: string | null
  contactPerson?: string | null
  email?: string | null
  phone?: string | null
  address?: string | null
  city?: string | null
  state?: string | null
  zipCode?: string | null
  country?: string | null
  taxId?: string | null
  paymentTerms?: number | null
  creditLimit?: number | null
  notes?: string | null
  isActive?: boolean | null
}

// ItemSupplier link DTOs
export type SupplierItemUpsert = {
  itemId: string
  supplierSku?: string | null
  supplierName?: string | null
  isPreferred?: boolean | null
  leadTimeDays?: number | null
  minOrderQuantity?: number | null
  unitCost?: number | null
  notes?: string | null
}

export type LinkItemsToSupplierDTO = {
  supplierId: string
  organizationId: string
  items: SupplierItemUpsert[]
}

export type UnlinkItemFromSupplierDTO = {
  supplierId: string
  organizationId: string
  itemId: string
}

// Helpers

export const allowedSortKeys = new Set<SupplierSortBy>(['createdAt', 'updatedAt', 'name', 'code', 'isActive'])

export function normalizeSort(sortBy?: SupplierSortBy, sortOrder?: SortOrder) {
  const key: SupplierSortBy = allowedSortKeys.has(sortBy ?? 'createdAt') ? (sortBy as SupplierSortBy) : 'createdAt'
  const order: SortOrder = sortOrder === 'asc' || sortOrder === 'desc' ? sortOrder : 'desc'
  return { key, order }
}

export function buildSupplierSearchFilter(q: string): Prisma.SupplierWhereInput[] {
  const contains = (field: string) => ({ contains: field, mode: 'insensitive' as const })
  return [
    { name: contains(q) },
    { code: contains(q) },
    { contactPerson: contains(q) },
    { email: contains(q) },
    { phone: contains(q) },
    { taxId: contains(q) },
    { city: contains(q) },
    { state: contains(q) },
    { country: contains(q) },
  ]
}

export function sanitizeEmail(email?: string | null) {
  if (!email) return null
  const trimmed = email.trim()
  // naive check
  if (!/^\S+@\S+\.\S+$/.test(trimmed)) {
    throw new Error('Invalid supplier email format')
  }
  return trimmed
}

export function sanitizeOptionalString(s?: string | null) {
  if (s == null) return null
  const v = s.trim()
  return v.length ? v : null
}


export type Pagination = {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
  pageStart: number
  pageEnd: number
}

export type SupplierDTO = {
  id: string
  name: string
  code?: string | null
  contactPerson?: string | null
  email?: string | null
  phone?: string | null
  address?: string | null
  city?: string | null
  state?: string | null
  zipCode?: string | null
  country?: string | null
  taxId?: string | null
  paymentTerms?: number | null
  creditLimit?: number | null
  notes?: string | null
  isActive: boolean
  organizationId: string
  createdAt: string | Date
  updatedAt: string | Date
}
