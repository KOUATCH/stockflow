"use server"

import type { CreatepOSStationInput, UpdatepOSStationInput } from "@/lib/validations/pos-terminal"
import { pOSStationSchema, updatepOSStationSchema } from "@/lib/validations/pos-terminal"
import { db } from "@/prisma/db"
import { revalidatePath } from "next/cache"

export interface pOSStationWithRelations {
  id: string
  terminalNumber: string
  name: string
  isActive: boolean
  hasCashDrawer: boolean
  hasReceiptPrinter: boolean
  hasBarcodeScanner: boolean
  hasCardReader: boolean
  locationId: string
  organizationId: string
  currentSessionId: string | null
  createdAt: Date
  updatedAt: Date
  location: {
    id: string
    name: string
  }
  organization: {
    id: string
    name: string
  }
  currentSession: {
    id: string
    sessionNumber: string
    status: string
  } | null
}

export async function createpOSStation(
  input: CreatepOSStationInput,
): Promise<{ success: boolean; data?: pOSStationWithRelations; error?: string }> {
  try {
    const validatedInput = pOSStationSchema.parse(input)

    // Check if terminal number already exists
    const existingTerminal = await db.pOSStation.findUnique({
      where: { terminalNumber: validatedInput.terminalNumber },
    })

    if (existingTerminal) {
      return { success: false, error: "Terminal number already exists" }
    }

    // Verify location and organization exist
    const [location, organization] = await Promise.all([
      db.location.findUnique({ where: { id: validatedInput.locationId } }),
      db.organization.findUnique({ where: { id: validatedInput.organizationId } }),
    ])

    if (!location) {
      return { success: false, error: "Location not found" }
    }

    if (!organization) {
      return { success: false, error: "Organization not found" }
    }

    const terminal = await db.pOSStation.create({
      data: validatedInput,
      include: {
        location: {
          select: {
            id: true,
            name: true,
          },
        },
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
        currentSession: {
          select: {
            id: true,
            sessionNumber: true,
            status: true,
          },
        },
      },
    })

    revalidatePath("/pos/terminals")
    return { success: true, data: terminal as pOSStationWithRelations }
  } catch (error) {
    console.error("Error creating POS terminal:", error)
    return { success: false, error: "Failed to create terminal" }
  }
}

export async function updatepOSStation(
  input: UpdatepOSStationInput,
): Promise<{ success: boolean; data?: pOSStationWithRelations; error?: string }> {
  try {
    const validatedInput = updatepOSStationSchema.parse(input)
    const { id, ...updateData } = validatedInput

    // Check if terminal exists
    const existingTerminal = await db.pOSStation.findUnique({
      where: { id },
    })

    if (!existingTerminal) {
      return { success: false, error: "Terminal not found" }
    }

    // Check if terminal number already exists (if being updated)
    if (updateData.terminalNumber) {
      const duplicateTerminal = await db.pOSStation.findFirst({
        where: {
          terminalNumber: updateData.terminalNumber,
          id: { not: id },
        },
      })

      if (duplicateTerminal) {
        return { success: false, error: "Terminal number already exists" }
      }
    }

    const terminal = await db.pOSStation.update({
      where: { id },
      data: updateData,
      include: {
        location: {
          select: {
            id: true,
            name: true,
          },
        },
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
        currentSession: {
          select: {
            id: true,
            sessionNumber: true,
            status: true,
          },
        },
      },
    })

    revalidatePath("/pos/terminals")
    return { success: true, data: terminal as pOSStationWithRelations }
  } catch (error) {
    console.error("Error updating POS terminal:", error)
    return { success: false, error: "Failed to update terminal" }
  }
}

export async function deletepOSStation(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if terminal exists
    const existingTerminal = await db.pOSStation.findUnique({
      where: { id },
      include: {
        currentSession: true,
      },
    })

    if (!existingTerminal) {
      return { success: false, error: "Terminal not found" }
    }

    // Check if terminal has an active session
    if (existingTerminal.currentSession) {
      return { success: false, error: "Cannot delete terminal with active session" }
    }

    await db.pOSStation.delete({
      where: { id },
    })

    revalidatePath("/pos/terminals")
    return { success: true }
  } catch (error) {
    console.error("Error deleting POS terminal:", error)
    return { success: false, error: "Failed to delete terminal" }
  }
}

export async function getpOSStation(id: string): Promise<pOSStationWithRelations | null> {
  try {
    const terminal = await db.pOSStation.findUnique({
      where: { id },
      include: {
        location: {
          select: {
            id: true,
            name: true,
          },
        },
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
        currentSession: {
          select: {
            id: true,
            sessionNumber: true,
            status: true,
          },
        },
      },
    })

    return terminal as pOSStationWithRelations | null
  } catch (error) {
    console.error("Error getting POS terminal:", error)
    return null
  }
}

export async function getpOSStations(
  organizationId: string,
  locationId?: string,
): Promise<pOSStationWithRelations[]> {
  try {
    const terminals = await db.pOSStation.findMany({
      where: {
        organizationId,
        ...(locationId && { locationId }),
      },
      include: {
        location: {
          select: {
            id: true,
            name: true,
          },
        },
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
        currentSession: {
          select: {
            id: true,
            sessionNumber: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return terminals as pOSStationWithRelations[]
  } catch (error) {
    console.error("Error getting POS terminals:", error)
    return []
  }
}

export async function getLocations(organizationId: string) {
  try {
    const locations = await db.location.findMany({
      where: { organizationId },
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    })

    return locations
  } catch (error) {
    console.error("Error getting locations:", error)
    return []
  }
}

export async function getOrganizations() {
  try {
    const organizations = await db.organization.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    })

    return organizations
  } catch (error) {
    console.error("Error getting organizations:", error)
    return []
  }
}
