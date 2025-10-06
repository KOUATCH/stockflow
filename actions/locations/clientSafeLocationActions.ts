"use server"

import { auth } from "@/auth"
import { db } from "@/prisma/db"

/**
 * Client-safe location actions that don't use getAuthenticatedUser()
 */

export async function getOrgLocationsClientSafe(organizationId?: string) {
  try {
    const session = await auth()

    if (!session?.user) {
      return { success: false, error: "Not authenticated", data: [] }
    }

    const userOrgId = organizationId || session.user.organizationId

    if (!userOrgId) {
      return { success: false, error: "No organization ID", data: [] }
    }

    const locations = await db.location.findMany({
      where: {
        organizationId: userOrgId,
      },
      orderBy: {
        name: 'asc',
      },
      select: {
        id: true,
        name: true,
        address: true,
        city: true,
        state: true,
        zipCode: true,
        country: true,
        phone: true,
        email: true,
        isActive: true,
        locationType: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            inventoryLevels: true,
            purchaseOrders: true,
            sales: true,
          },
        },
      },
    })

    return {
      success: true,
      data: locations,
      error: null
    }
  } catch (error) {
    console.error("Error fetching locations:", error)
    return {
      success: false,
      error: "Failed to fetch locations",
      data: []
    }
  }
}

export async function getLocationByIdClientSafe(locationId: string, organizationId?: string) {
  try {
    const session = await auth()

    if (!session?.user) {
      return { success: false, error: "Not authenticated", data: null }
    }

    const userOrgId = organizationId || session.user.organizationId

    if (!userOrgId) {
      return { success: false, error: "No organization ID", data: null }
    }

    const location = await db.location.findFirst({
      where: {
        id: locationId,
        organizationId: userOrgId,
      },
      include: {
        inventoryLevels: {
          include: {
            item: {
              select: {
                id: true,
                name: true,
                sku: true,
              },
            },
          },
          take: 10, // Latest inventory levels
          orderBy: {
            updatedAt: 'desc',
          },
        },
        _count: {
          select: {
            inventoryLevels: true,
            purchaseOrders: true,
            sales: true,
          },
        },
      },
    })

    if (!location) {
      return { success: false, error: "Location not found", data: null }
    }

    return {
      success: true,
      data: location,
      error: null
    }
  } catch (error) {
    console.error("Error fetching location:", error)
    return {
      success: false,
      error: "Failed to fetch location",
      data: null
    }
  }
}