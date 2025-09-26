"use server"

import { db } from "@/prisma/db"
import type { Customer } from "@prisma/client"
import { revalidatePath } from "next/cache"

// Create customer
export async function createCustomer(data: Omit<Customer, "id" | "createdAt" | "updatedAt">) {
  try {
    // Generate customer code if not provided
    if (!data.code) {
      const customerCount = await db.customer.count({
        where: { organizationId: data.organizationId },
      })
      data.code = `CUST-${String(customerCount + 1).padStart(4, "0")}`
    }

    const customer = await db.customer.create({
      data,
    })

    revalidatePath("/customers")
    return { success: true, data: customer }
  } catch (error) {
    console.error("Error creating customer:", error)
    return { success: false, error: "Failed to create customer" }
  }
}

// Update customer
export async function updateCustomer(id: string, data: Partial<Customer>) {
  try {
    const customer = await db.customer.update({
      where: { id },
      data,
    })

    revalidatePath("/customers")
    revalidatePath(`/customers/${id}`)
    return { success: true, data: customer }
  } catch (error) {
    console.error("Error updating customer:", error)
    return { success: false, error: "Failed to update customer" }
  }
}

// Get customers
export async function getCustomers(params: {
  organizationId: string
  page?: number
  limit?: number
  search?: string
  isActive?: boolean
}) {
  try {
    const { organizationId, page = 1, limit = 20, search, isActive } = params

    const where = {
      organizationId,
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
