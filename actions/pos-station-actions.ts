"use server"

import { db } from "@/prisma/db"
import { posStationSchema, updatePosStationSchema } from "@/lib/validations/pos-station"
import { revalidatePath } from "next/cache"
import type { CreatePosStationInput, UpdatePosStationInput } from "@/lib/validations/pos-station"

// Generate unique terminal number
async function generateTerminalNumber(): Promise<string> {
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  const terminalNumber = `POS-${timestamp}-${random}`

  // Check if terminal number already exists
  const existing = await db.pOSStation.findUnique({
    where: { terminalNumber },
  })

  if (existing) {
    // Recursively generate a new number if collision occurs
    return generateTerminalNumber()
  }

  return terminalNumber
}

export async function createPosStation(input: CreatePosStationInput) {
  try {
    // Validate input
    const validatedInput = posStationSchema.parse(input)

    // Check if organization exists
    const organization = await db.organization.findUnique({
      where: { id: validatedInput.organizationId },
    })

    if (!organization) {
      return {
        success: false,
        error: "Organization not found",
      }
    }

    // Check if location exists and belongs to the organization
    const location = await db.location.findFirst({
      where: {
        id: validatedInput.locationId,
        organizationId: validatedInput.organizationId,
      },
    })

    if (!location) {
      return {
        success: false,
        error: "Location not found or does not belong to the specified organization",
      }
    }

    // Generate unique terminal number
    const terminalNumber = await generateTerminalNumber()

    // Create POS station
    const posStation = await db.pOSStation.create({
      data: {
        ...validatedInput,
        terminalNumber,
      },
      include: {
        location: {
          select: { id: true, name: true },
        },
        organization: {
          select: { id: true, name: true },
        },
        currentSession: {
          select: { id: true, sessionNumber: true, status: true },
        },
      },
    })

    revalidatePath("/pos-stations")

    return {
      success: true,
      data: posStation,
    }
  } catch (error) {
    console.error("Error creating POS station:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create POS station",
    }
  }
}

export async function getPosStations(organizationId?: string) {
  try {
    const posStations = await db.pOSStation.findMany({
      where: organizationId ? { organizationId } : undefined,
      include: {
        location: {
          select: { id: true, name: true },
        },
        organization: {
          select: { id: true, name: true },
        },
        currentSession: {
          select: { id: true, sessionNumber: true, status: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return {
      success: true,
      data: posStations,
    }
  } catch (error) {
    console.error("Error fetching POS stations:", error)
    return {
      success: false,
      error: "Failed to fetch POS stations",
    }
  }
}

export async function getPosStationById(id: string) {
  try {
    const posStation = await db.pOSStation.findUnique({
      where: { id },
      include: {
        location: {
          select: { id: true, name: true },
        },
        organization: {
          select: { id: true, name: true },
        },
        currentSession: {
          select: { id: true, sessionNumber: true, status: true },
        },
      },
    })

    if (!posStation) {
      return {
        success: false,
        error: "POS station not found",
      }
    }

    return {
      success: true,
      data: posStation,
    }
  } catch (error) {
    console.error("Error fetching POS station:", error)
    return {
      success: false,
      error: "Failed to fetch POS station",
    }
  }
}

export async function updatePosStation(input: UpdatePosStationInput) {
  try {
    // Validate input
    const validatedInput = updatePosStationSchema.parse(input)
    const { id, ...updateData } = validatedInput

    // Check if POS station exists
    const existingStation = await db.pOSStation.findUnique({
      where: { id },
    })

    if (!existingStation) {
      return {
        success: false,
        error: "POS station not found",
      }
    }

    // If updating location, verify it belongs to the organization
    if (updateData.locationId && updateData.organizationId) {
      const location = await db.location.findFirst({
        where: {
          id: updateData.locationId,
          organizationId: updateData.organizationId,
        },
      })

      if (!location) {
        return {
          success: false,
          error: "Location not found or does not belong to the specified organization",
        }
      }
    }

    // Update POS station
    const updatedStation = await db.pOSStation.update({
      where: { id },
      data: updateData,
      include: {
        location: {
          select: { id: true, name: true },
        },
        organization: {
          select: { id: true, name: true },
        },
        currentSession: {
          select: { id: true, sessionNumber: true, status: true },
        },
      },
    })

    revalidatePath("/pos-stations")
    revalidatePath(`/pos-stations/${id}`)

    return {
      success: true,
      data: updatedStation,
    }
  } catch (error) {
    console.error("Error updating POS station:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update POS station",
    }
  }
}

export async function deletePosStation(id: string) {
  try {
    // Check if POS station exists
    const existingStation = await db.pOSStation.findUnique({
      where: { id },
      include: {
        sessions: { take: 1 },
        salesOrders: { take: 1 },
      },
    })

    if (!existingStation) {
      return {
        success: false,
        error: "POS station not found",
      }
    }

    // Check if station has active sessions or sales orders
    if (existingStation.sessions.length > 0 || existingStation.salesOrders.length > 0) {
      return {
        success: false,
        error: "Cannot delete POS station with existing sessions or sales orders. Deactivate it instead.",
      }
    }

    // Delete POS station
    await db.pOSStation.delete({
      where: { id },
    })

    revalidatePath("/pos-stations")

    return {
      success: true,
      message: "POS station deleted successfully",
    }
  } catch (error) {
    console.error("Error deleting POS station:", error)
    return {
      success: false,
      error: "Failed to delete POS station",
    }
  }
}

export async function getOrganizations() {
  try {
    const organizations = await db.organization.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    })

    return {
      success: true,
      data: organizations,
    }
  } catch (error) {
    console.error("Error fetching organizations:", error)
    return {
      success: false,
      error: "Failed to fetch organizations",
    }
  }
}

export async function getLocationsByOrganization(organizationId: string) {
  try {
    const locations = await db.location.findMany({
      where: { organizationId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    })

    return {
      success: true,
      data: locations,
    }
  } catch (error) {
    console.error("Error fetching locations:", error)
    return {
      success: false,
      error: "Failed to fetch locations",
    }
  }
}
