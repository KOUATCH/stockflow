"use server"

import { db } from "@/prisma/db"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { LocationType } from "@prisma/client"

export interface Location {
  id: string
  name: string
  code?: string
  type?: string
}

export async function getLocations(): Promise<Location[]> {
  try {
    const session = await auth()

    if (!session?.user) {
      throw new Error("Unauthorized")
    }

    const locations = await db.location.findMany({
      where: {
        organizationId: session.user.organizationId,
        isActive: true
      },
      select: {
        id: true,
        name: true,
        code: true,
        type: true,
        isActive: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    const transformedLocations: Location[] = locations.map(location => ({
      id: location.id,
      name: location.name,
      code: location.code,
      type: location.type
    }))

    return transformedLocations

  } catch (error: any) {
    console.error("Error fetching locations:", error)
    throw new Error("Failed to fetch locations")
  }
}

export async function getLocation(id: string): Promise<Location | null> {
  try {
    const session = await auth()

    if (!session?.user) {
      throw new Error("Unauthorized")
    }

    const location = await db.location.findUnique({
      where: {
        id: id,
        organizationId: session.user.organizationId
      },
      select: {
        id: true,
        name: true,
        code: true,
        type: true,
        isActive: true
      }
    })

    if (!location || !location.isActive) {
      return null
    }

    return {
      id: location.id,
      name: location.name,
      code: location.code,
      type: location.type
    }

  } catch (error: any) {
    console.error("Error fetching location:", error)
    throw new Error("Failed to fetch location")
  }
}

export interface CreateLocationData {
  name: string
  code?: string
  type?: string
  address?: string
  phone?: string
  email?: string
  managerId?: string
  allowNegativeStock?: boolean
  requiresApproval?: boolean
  isDefault?: boolean
}

function generateLocationCode(name: string) {
  const base = name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 24)

  return `${base || "LOC"}-${Date.now().toString(36).toUpperCase()}`
}

export async function createLocation(data: CreateLocationData) {
  try {
    const session = await auth()

    if (!session?.user?.organizationId) {
      return { success: false, error: "Unauthorized" }
    }

    const location = await db.location.create({
      data: {
        name: data.name,
        code: data.code?.trim() || generateLocationCode(data.name),
        type: (data.type as LocationType | undefined) ?? LocationType.WAREHOUSE,
        address: data.address ?? null,
        phone: data.phone ?? null,
        email: data.email ?? null,
        managerId: data.managerId ?? null,
        allowNegativeStock: data.allowNegativeStock ?? false,
        requiresApproval: data.requiresApproval ?? false,
        isDefault: data.isDefault ?? false,
        organizationId: session.user.organizationId,
        isActive: true
      }
    })

    return { success: true, data: location }
  } catch (error: any) {
    console.error("Error creating location:", error)
    return { success: false, error: "Failed to create location" }
  }
}

export async function updateLocation(id: string, data: Partial<CreateLocationData>) {
  try {
    const session = await auth()

    if (!session?.user?.organizationId) {
      return { success: false, error: "Unauthorized" }
    }

    const location = await db.location.update({
      where: {
        id: id,
        organizationId: session.user.organizationId
      },
      data: {
        name: data.name,
        code: data.code,
        type: data.type as LocationType | undefined,
        address: data.address,
        phone: data.phone,
        email: data.email,
        managerId: data.managerId,
        allowNegativeStock: data.allowNegativeStock,
        requiresApproval: data.requiresApproval,
        isDefault: data.isDefault,
        updatedAt: new Date()
      }
    })

    // Revalidate relevant paths
    revalidatePath("/dashboard/settings/locations")
    revalidatePath(`/dashboard/settings/locations/${id}`)
    revalidatePath(`/dashboard/settings/locations/${id}/edit`)

    return { success: true, data: location }
  } catch (error: any) {
    console.error("Error updating location:", error)
    return { success: false, error: "Failed to update location" }
  }
}

export async function deleteLocation(id: string) {
  try {
    const session = await auth()

    if (!session?.user) {
      return { success: false, error: "Unauthorized" }
    }

    // Soft delete by setting isActive to false
    const location = await db.location.update({
      where: {
        id: id,
        organizationId: session.user.organizationId
      },
      data: {
        isActive: false,
        updatedAt: new Date()
      }
    })

    return { success: true, data: location }
  } catch (error: any) {
    console.error("Error deleting location:", error)
    return { success: false, error: "Failed to delete location" }
  }
}
