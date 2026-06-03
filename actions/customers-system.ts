"use server"

import { randomUUID } from "crypto"

import { db } from "@/prisma/db"
import type { Customer, Prisma } from "@prisma/client"
import { revalidatePath } from "next/cache"

type CustomerCreateInput = Omit<Customer, "id" | "createdAt" | "updatedAt">

function revalidateCustomerPaths(id?: string): void {
  revalidatePath("/[locale]/dashboard/customers", "page")

  if (id) {
    revalidatePath("/[locale]/dashboard/customers/[id]", "page")
  }
}

async function nextCustomerCode(organizationId: string): Promise<string> {
  const customerCount = await db.customer.count({
    where: { organizationId },
  })

  return `CUST-${String(customerCount + 1).padStart(4, "0")}`
}

export async function createCustomer(data: CustomerCreateInput) {
  try {
    const now = new Date()
    const customer = await db.customer.create({
      data: {
        ...data,
        id: randomUUID(),
        code: data.code || await nextCustomerCode(data.organizationId),
        updatedAt: now,
      },
    })

    revalidateCustomerPaths(customer.id)
    return { success: true, data: customer }
  } catch (error) {
    console.error("Error creating customer:", error)
    return { success: false, error: "Failed to create customer" }
  }
}

export async function updateCustomer(id: string, data: Partial<Customer>) {
  try {
    const updated = await db.customer.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    })

    revalidateCustomerPaths(id)
    return { success: true, data: updated }
  } catch (error) {
    console.error("Error updating customer:", error)
    return { success: false, error: "Failed to update customer" }
  }
}

export async function getCustomers(params: {
  organizationId: string
  page?: number
  limit?: number
  search?: string
  isActive?: boolean
}) {
  try {
    const { organizationId, page = 1, limit = 20, search, isActive } = params

    const where: Prisma.CustomerWhereInput = {
      organizationId,
      deletedAt: null,
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { phone: { contains: search, mode: "insensitive" } },
          { code: { contains: search, mode: "insensitive" } },
        ],
      }),
      ...(isActive !== undefined && { isActive }),
    }

    const [customers, total] = await Promise.all([
      db.customer.findMany({
        where,
        orderBy: { name: "asc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.customer.count({ where }),
    ])

    return {
      success: true,
      data: customers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }
  } catch (error) {
    console.error("Error fetching customers:", error)
    return { success: false, error: "Failed to fetch customers" }
  }
}
