"use server"

import { auth } from "@/auth"
import { db } from "@/prisma/db"

/**
 * Client-safe customer actions that don't use getAuthenticatedUser()
 */

export async function getOrgCustomersClientSafe(organizationId?: string) {
  try {
    const session = await auth()

    if (!session?.user) {
      return { success: false, error: "Not authenticated", data: [] }
    }

    const userOrgId = organizationId || session.user.organizationId

    if (!userOrgId) {
      return { success: false, error: "No organization ID", data: [] }
    }

    const customers = await db.customer.findMany({
      where: {
        organizationId: userOrgId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        city: true,
        state: true,
        zipCode: true,
        country: true,
        dateOfBirth: true,
        gender: true,
        notes: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        // Include related data if needed
        _count: {
          select: {
            sales: true,
          },
        },
      },
    })

    return {
      success: true,
      data: customers,
      error: null
    }
  } catch (error) {
    console.error("Error fetching customers:", error)
    return {
      success: false,
      error: "Failed to fetch customers",
      data: []
    }
  }
}

export async function getCustomerByIdClientSafe(customerId: string, organizationId?: string) {
  try {
    const session = await auth()

    if (!session?.user) {
      return { success: false, error: "Not authenticated", data: null }
    }

    const userOrgId = organizationId || session.user.organizationId

    if (!userOrgId) {
      return { success: false, error: "No organization ID", data: null }
    }

    const customer = await db.customer.findFirst({
      where: {
        id: customerId,
        organizationId: userOrgId,
      },
      include: {
        sales: {
          select: {
            id: true,
            saleNumber: true,
            total: true,
            status: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 10, // Last 10 sales
        },
        _count: {
          select: {
            sales: true,
          },
        },
      },
    })

    if (!customer) {
      return { success: false, error: "Customer not found", data: null }
    }

    return {
      success: true,
      data: customer,
      error: null
    }
  } catch (error) {
    console.error("Error fetching customer:", error)
    return {
      success: false,
      error: "Failed to fetch customer",
      data: null
    }
  }
}