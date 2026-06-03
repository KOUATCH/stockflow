"use server"

import { auth } from "@/auth"
import { db } from "@/prisma/db"

const toNumber = (value: unknown): number => {
  if (value && typeof value === "object" && "toNumber" in value && typeof value.toNumber === "function") {
    return value.toNumber()
  }
  return Number(value ?? 0)
}

/**
 * Client-safe location actions that don't use getAuthenticatedUser()
 */

export async function getOrgLocationsClientSafe(organizationId?: string) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated", data: [] }
    }

    const user = await db.user.findFirst({
      where: {
        isActive: true,
        OR: [
          { id: session.user.id },
          ...(session.user.email ? [{ email: session.user.email }] : []),
        ],
      },
      select: {
        organizationId: true,
        roles: {
          select: {
            permissions: true,
          },
        },
      },
    })

    if (!user) {
      return { success: false, error: "Not authenticated", data: [] }
    }

    const permissions = new Set([
      ...(session.user.permissions ?? []),
      ...user.roles.flatMap((role) => role.permissions ?? []),
    ])
    const userOrgId = organizationId || user.organizationId

    if (!userOrgId) {
      return { success: false, error: "No organization ID", data: [] }
    }

    if (userOrgId !== user.organizationId && !permissions.has("*")) {
      return { success: false, error: "You do not have access to this organization", data: [] }
    }

    const locations = await db.location.findMany({
      where: {
        organizationId: userOrgId,
        deletedAt: null,
      },
      orderBy: {
        name: 'asc',
      },
      select: {
        id: true,
        name: true,
        code: true,
        type: true,
        address: true,
        phone: true,
        email: true,
        isActive: true,
        isDefault: true,
        organizationId: true,
        managerId: true,
        allowNegativeStock: true,
        requiresApproval: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            inventoryLevels: true,
            purchaseOrders: true,
            salesOrders: true,
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

    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated", data: null }
    }

    const user = await db.user.findFirst({
      where: {
        isActive: true,
        OR: [
          { id: session.user.id },
          ...(session.user.email ? [{ email: session.user.email }] : []),
        ],
      },
      select: {
        organizationId: true,
        roles: {
          select: {
            permissions: true,
          },
        },
      },
    })

    if (!user) {
      return { success: false, error: "Not authenticated", data: null }
    }

    const permissions = new Set([
      ...(session.user.permissions ?? []),
      ...user.roles.flatMap((role) => role.permissions ?? []),
    ])
    const userOrgId = organizationId || user.organizationId

    if (!userOrgId) {
      return { success: false, error: "No organization ID", data: null }
    }

    if (userOrgId !== user.organizationId && !permissions.has("*")) {
      return { success: false, error: "You do not have access to this organization", data: null }
    }

    const location = await db.location.findFirst({
      where: {
        id: locationId,
        organizationId: userOrgId,
        deletedAt: null,
      },
      include: {
        inventoryLevels: {
          include: {
            item: {
              select: {
                id: true,
                nameEn: true,
                nameFr: true,
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
            salesOrders: true,
          },
        },
      },
    })

    if (!location) {
      return { success: false, error: "Location not found", data: null }
    }

    return {
      success: true,
      data: {
        ...location,
        inventoryLevels: location.inventoryLevels.map((level) => ({
          ...level,
          quantityOnHand: toNumber(level.quantityOnHand),
          quantityReserved: toNumber(level.quantityReserved),
          quantityAvailable: toNumber(level.quantityAvailable),
          quantityInTransit: toNumber(level.quantityInTransit),
          quantityOnOrder: toNumber(level.quantityOnOrder),
          reorderPoint: toNumber(level.reorderPoint),
          averageCost: toNumber(level.averageCost),
          totalValue: toNumber(level.totalValue),
          item: {
            ...level.item,
            name: level.item.nameEn ?? level.item.nameFr ?? "",
          },
        })),
      },
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
