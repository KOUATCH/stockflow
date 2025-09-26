"use server"

import { generateUniqueTerminalNumberUUID } from '@/lib/generateTerminalNumber'
import type { CreatePosStationInput, UpdatePosStationInput } from "@/lib/validations/pos-station"
import { posStationSchema, updatePosStationSchema } from "@/lib/validations/pos-station"
import { db } from "@/prisma/db"
import { revalidatePath } from "next/cache"

export interface PosStationWithRelations {
  status: string
  id: string
  terminalNumber: string
  name: string
  isActive: boolean
  hasCashDrawer: boolean
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

// async function generateUniqueTerminalNumber(): Promise<string> {
//   let terminalNumber: string
//   let isUnique = false

//   while (!isUnique) {
//     // Generate format: POS-XXXXXX-XXXX (where X is a random digit)
//     const prefix = "POS"
//     const part1 = Math.random().toString().slice(2, 8).padStart(6, "0")
//     const part2 = Math.random().toString().slice(2, 6).padStart(4, "0")
//     terminalNumber = `${prefix}-${part1}-${part2}`

//     // Check if this terminal number already exists
//     const existing = await db.pOSStation.findUnique({
//       where: { terminalNumber },
//     })

//     if (!existing) {
//       isUnique = true
//     }
//   }
  
//   // terminalNumber = await generateUniqueTerminalNumber()
//   // console.log({ terminalNumber })
//    return terminalNumber
// }

export async function createPosStation(
  input: CreatePosStationInput,
): Promise<{ success: boolean; data?: PosStationWithRelations; error?: string }> {
  try {
    const terminalNumber = await generateUniqueTerminalNumberUUID(
      {
        findUnique: ({ where: { terminalNumber } }) =>
          db.pOSStation.findUnique({ where: { terminalNumber } }),
      },
      {
        prefix: 'POS',
        maxAttempts: 5,
      }
    )

    console.log({ terminalNumber  })
    const inputWithTerminalNumber = { ...input, terminalNumber }

    // Validate input with generated terminal number
    const validatedInput = posStationSchema.parse(inputWithTerminalNumber)

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
      data: {
        terminalNumber: validatedInput.terminalNumber!,
        name: validatedInput.name,
        isActive: validatedInput.isActive,
        hasCashDrawer: validatedInput.hasCashDrawer,
        locationId: validatedInput.locationId,
        organizationId: validatedInput.organizationId,
        // Add any other required fields here if needed
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
    })

    revalidatePath("/pos/terminals")
    return { success: true, data: terminal as PosStationWithRelations }
  } catch (error) {
    console.error("Error creating POS terminal:", error)
    return { success: false, error: "Failed to create terminal" }
  }
}

export async function updatePosStation(
  input: UpdatePosStationInput,
): Promise<{ success: boolean; data?: PosStationWithRelations; error?: string }> {
  try {
    const validatedInput = updatePosStationSchema.parse(input)
    const { id, ...updateData } = validatedInput

    // Check if terminal exists
    const existingStation = await db.pOSStation.findUnique({
      where: { id },
    })

    if (!existingStation) {
      return { success: false, error: "Station not found" }
    }

    // Check if terminal number already exists (if being updated)
    if (updateData.terminalNumber) {
      const duplicateStation = await db.pOSStation.findFirst({
        where: {
          terminalNumber: updateData.terminalNumber,
          id: { not: id },
        },
      })

      if (duplicateStation) {
        return { success: false, error: "Station number already exists" }
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
    return { success: true, data: terminal as PosStationWithRelations }
  } catch (error) {
    console.error("Error updating POS terminal:", error)
    return { success: false, error: "Failed to update terminal" }
  }
}

export async function deletePosStation(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if terminal exists
    const existingStation = await db.pOSStation.findUnique({
      where: { id },
      include: {
        currentSession: true,
      },
    })

    if (!existingStation) {
      return { success: false, error: "Station not found" }
    }

    // Check if terminal has an active session
    if (existingStation.currentSession) {
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

export async function getPosStation(
  id: string,
): Promise<{ success: boolean; data?: PosStationWithRelations; error?: string }> {
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

    if (!terminal) {
      return { success: false, error: "Station not found" }
    }

    return { success: true, data: terminal as PosStationWithRelations }
  } catch (error) {
    console.error("Error getting POS terminal:", error)
    return { success: false, error: "Failed to fetch terminal" }
  }
}

export async function getPosStations(
  organizationId?: string,
  locationId?: string,
): Promise<{ success: boolean; data?: PosStationWithRelations[]; error?: string }> {
  try {
    // Real Prisma database
    const terminals = await db.pOSStation.findMany({
      where: {
        ...(organizationId && { organizationId }),
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

    return { success: true, data: terminals as PosStationWithRelations[] }
  } catch (error) {
    console.error("Error getting POS terminals:", error)
    return { success: false, error: "Failed to fetch terminals" }
  }
}

export async function getLocationsByOrganization(
  organizationId: string,
): Promise<{ success: boolean; data?: Array<{ id: string; name: string }>; error?: string }> {
  try {
    // Real Prisma database
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

    return { success: true, data: locations }
  } catch (error) {
    console.error("Error getting locations:", error)
    return { success: false, error: "Failed to fetch locations" }
  }
}

export async function getOrganizations(): Promise<{
  success: boolean
  data?: Array<{ id: string; name: string }>
  error?: string
}> {
  try {
    // Real Prisma database
    const organizations = await db.organization.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    })

    return { success: true, data: organizations }
  } catch (error) {
    console.error("Error getting organizations:", error)
    return { success: false, error: "Failed to fetch organizations" }
  }
}

export async function getPosStationById(id: string) {
  return getPosStation(id)
}
