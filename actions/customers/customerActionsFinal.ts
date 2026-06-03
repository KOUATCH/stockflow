"use server"

import { randomUUID } from "crypto"

import { getCustomer, getCustomers as getAuthenticatedCustomers } from "@/actions/customers/customerAction2"
import type { ServerActionResult } from "@/lib/error-handling/types"
import { db } from "@/prisma/db"
import type { Customer, CustomerWithStats } from "@/types/customerTypes"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const CustomerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  code: z.string().optional().nullable(),
  email: z.string().email("Invalid email address").optional().nullable().or(z.literal("")),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  taxId: z.string().optional().nullable(),
  creditLimit: z.number().min(0).optional().nullable(),
  paymentTerms: z.number().min(0).optional().nullable(),
  notes: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
})

export type CustomerState = {
  errors?: {
    name?: string[]
    email?: string[]
    phone?: string[]
    creditLimit?: string[]
    paymentTerms?: string[]
  }
  message?: string | null
}

type DecimalLike = { toNumber?: () => number; toString: () => string } | number | string | null | undefined

function toNumber(value: DecimalLike): number {
  if (value == null) return 0
  if (typeof value === "number") return value
  if (typeof value === "string") return Number(value) || 0
  if (typeof value.toNumber === "function") return value.toNumber()
  return Number(value.toString()) || 0
}

function emptyToNull(value: FormDataEntryValue | string | null | undefined): string | null {
  const text = typeof value === "string" ? value.trim() : ""
  return text ? text : null
}

function readCustomerForm(formData: FormData) {
  return CustomerSchema.parse({
    name: formData.get("name"),
    code: emptyToNull(formData.get("code")),
    email: emptyToNull(formData.get("email")),
    phone: emptyToNull(formData.get("phone")),
    address: emptyToNull(formData.get("address")),
    taxId: emptyToNull(formData.get("taxId")),
    creditLimit: formData.get("creditLimit") ? Number(formData.get("creditLimit")) : null,
    paymentTerms: formData.get("paymentTerms") ? Number(formData.get("paymentTerms")) : null,
    notes: emptyToNull(formData.get("notes")),
    isActive: formData.get("isActive") === "true",
  })
}

function revalidateCustomerPaths(): void {
  revalidatePath("/[locale]/dashboard/customers", "page")
  revalidatePath("/[locale]/dashboard/customers/[id]", "page")
}

async function nextCustomerCode(organizationId: string): Promise<string> {
  const customerCount = await db.customer.count({
    where: { organizationId },
  })

  return `CUST-${String(customerCount + 1).padStart(4, "0")}`
}

export async function createCustomer(
  organizationId: string,
  formData: FormData,
  _prevState?: CustomerState
): Promise<ServerActionResult<Customer>> {
  if (!organizationId) {
    throw new Error("Organization ID is required")
  }

  const data = readCustomerForm(formData)
  const now = new Date()

  const customer = await db.customer.create({
    data: {
      id: randomUUID(),
      name: data.name.trim(),
      code: data.code || await nextCustomerCode(organizationId),
      email: data.email || null,
      phone: data.phone || null,
      address: data.address || null,
      taxId: data.taxId || null,
      creditLimit: data.creditLimit,
      paymentTerms: data.paymentTerms ?? 30,
      notes: data.notes || null,
      isActive: data.isActive,
      organizationId,
      updatedAt: now,
    },
  })

  revalidateCustomerPaths()

  return { success: true, data: await mapCustomer(customer.id, organizationId) }
}

export async function updateCustomer(
  id: string,
  organizationId: string,
  _prevState: CustomerState,
  formData: FormData
): Promise<ServerActionResult<Customer>> {
  if (!id) {
    throw new Error("Customer ID is required")
  }

  if (!organizationId) {
    throw new Error("Organization ID is required")
  }

  const data = readCustomerForm(formData)
  const updated = await db.customer.updateMany({
    where: {
      id,
      organizationId,
      deletedAt: null,
    },
    data: {
      name: data.name.trim(),
      code: data.code,
      email: data.email || null,
      phone: data.phone || null,
      address: data.address || null,
      taxId: data.taxId || null,
      creditLimit: data.creditLimit,
      paymentTerms: data.paymentTerms,
      notes: data.notes || null,
      isActive: data.isActive,
      updatedAt: new Date(),
    },
  })

  if (updated.count === 0) {
    throw new Error("Customer not found or update failed")
  }

  revalidateCustomerPaths()

  return { success: true, data: await mapCustomer(id, organizationId) }
}

export async function deleteCustomer(id: string, organizationId: string): Promise<ServerActionResult<void>> {
  if (!id) {
    throw new Error("Customer ID is required")
  }

  if (!organizationId) {
    throw new Error("Organization ID is required")
  }

  const salesOrders = await db.salesOrder.count({
    where: {
      customerId: id,
      organizationId,
      deletedAt: null,
    },
  })

  if (salesOrders > 0) {
    throw new Error("Cannot delete customer with existing sales orders")
  }

  await db.customer.updateMany({
    where: {
      id,
      organizationId,
      deletedAt: null,
    },
    data: {
      deletedAt: new Date(),
      isActive: false,
      updatedAt: new Date(),
    },
  })

  revalidateCustomerPaths()

  return { success: true, data: undefined }
}

export async function toggleCustomerStatus(
  id: string,
  organizationId: string,
  isActive: boolean
): Promise<ServerActionResult<Customer>> {
  if (!id) {
    throw new Error("Customer ID is required")
  }

  if (!organizationId) {
    throw new Error("Organization ID is required")
  }

  const updated = await db.customer.updateMany({
    where: {
      id,
      organizationId,
      deletedAt: null,
    },
    data: {
      isActive,
      updatedAt: new Date(),
    },
  })

  if (updated.count === 0) {
    throw new Error("Customer not found or update failed")
  }

  revalidateCustomerPaths()

  return { success: true, data: await mapCustomer(id, organizationId) }
}

export async function getCustomerById(id: string, organizationId: string): Promise<ServerActionResult<Customer | null>> {
  return getCustomer(id, organizationId)
}

export async function getCustomers(
  organizationId: string,
  query = "",
  page = 1,
  limit = 10
): Promise<ServerActionResult<{
  customers: CustomerWithStats[]
  totalCount: number
  totalPages: number
  currentPage: number
}>> {
  if (!organizationId) {
    return {
      success: true,
      data: {
        customers: [],
        totalCount: 0,
        totalPages: 0,
        currentPage: page,
      },
    }
  }

  const skip = (page - 1) * limit
  const where = {
    organizationId,
    deletedAt: null,
    ...(query && {
      OR: [
        { name: { contains: query, mode: "insensitive" as const } },
        { email: { contains: query, mode: "insensitive" as const } },
        { phone: { contains: query, mode: "insensitive" as const } },
        { code: { contains: query, mode: "insensitive" as const } },
      ],
    }),
  }

  const [customers, totalCount] = await Promise.all([
    db.customer.findMany({
      where,
      include: {
        salesOrders: {
          select: {
            id: true,
            total: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
      skip,
      take: limit,
      orderBy: {
        name: "asc",
      },
    }),
    db.customer.count({ where }),
  ])

  const data = customers.map((customer): CustomerWithStats => {
    const totalOrders = customer.salesOrders.length
    const totalRevenue = customer.salesOrders.reduce((sum, order) => sum + toNumber(order.total), 0)

    return {
      id: customer.id,
      name: customer.name,
      code: customer.code,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      taxId: customer.taxId,
      creditLimit: customer.creditLimit == null ? null : toNumber(customer.creditLimit),
      paymentTerms: customer.paymentTerms ?? 30,
      notes: customer.notes,
      isActive: customer.isActive,
      organizationId: customer.organizationId,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
      totalOrders,
      totalRevenue,
      totalOrderValue: totalRevenue,
      averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
      lastOrderDate: customer.salesOrders[0]?.createdAt ?? null,
    }
  })

  return {
    success: true,
    data: {
      customers: data,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
    },
  }
}

async function mapCustomer(id: string, organizationId: string): Promise<Customer> {
  const customer = await db.customer.findFirst({
    where: {
      id,
      organizationId,
      deletedAt: null,
    },
  })

  if (!customer) {
    throw new Error("Customer not found")
  }

  return {
    id: customer.id,
    name: customer.name,
    code: customer.code,
    email: customer.email,
    phone: customer.phone,
    address: customer.address,
    taxId: customer.taxId,
    creditLimit: customer.creditLimit == null ? null : toNumber(customer.creditLimit),
    paymentTerms: customer.paymentTerms ?? 30,
    notes: customer.notes,
    isActive: customer.isActive,
    organizationId: customer.organizationId,
    createdAt: customer.createdAt,
    updatedAt: customer.updatedAt,
  }
}

export { getAuthenticatedCustomers }
