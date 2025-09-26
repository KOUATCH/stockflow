// ===== SERVER ACTIONS =====
// File: lib/actions/pos-terminal-actions.ts
"use server"

import { db } from "@/prisma/db"
import { revalidatePath } from "next/cache"

export interface TerminalInfo {
  id: string
  name: string
  terminalNumber: string
  isActive: boolean
  hasCashDrawer: boolean
  locationId: string
  location: {
    name: string
    code: string
  }
  currentSessionId?: string
  currentSession?: {
    id: string
    sessionNumber: string
    userId: string
    user: {
      firstName: string
      lastName: string
    }
    status: string
    startTime: Date
    openingBalance: number
  }
}

export interface SessionInfo {
  id: string
  sessionNumber: string
  status: "ACTIVE" | "SUSPENDED" | "CLOSED" | "RECONCILED"
  startTime: Date
  endTime?: Date
  terminalId: string
  terminal: {
    name: string
    terminalNumber: string
  }
  userId: string
  user: {
    firstName: string
    lastName: string
    email: string
  }
  openingBalance: number
  closingBalance?: number
  expectedBalance?: number
  variance?: number
  totalSales: number
  transactionCount: number
}

// Get all terminals for a location
export async function getTerminals(
  locationId: string,
  organizationId: string
): Promise<{ success: boolean; terminals?: TerminalInfo[]; error?: string }> {
  try {
    const terminals = await db.pOSStation.findMany({
      where: {
        locationId,
        organizationId,
      },
      include: {
        location: {
          select: {
            name: true,
            code: true,
          },
        },
        currentSession: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: {
        terminalNumber: 'asc',
      },
    })

    const terminalInfo: TerminalInfo[] = terminals.map(terminal => ({
      id: terminal.id,
      name: terminal.name,
      terminalNumber: terminal.terminalNumber,
      isActive: terminal.isActive,
      hasCashDrawer: terminal.hasCashDrawer,
      locationId: terminal.locationId,
      location: terminal.location,
      currentSessionId: terminal.currentSessionId ?? undefined,
      currentSession: terminal.currentSession ? {
        id: terminal.currentSession.id,
        sessionNumber: terminal.currentSession.sessionNumber,
        userId: terminal.currentSession.userId,
        user: {
          firstName: terminal.currentSession.user.firstName !== null ? terminal.currentSession.user.firstName : "",
          lastName: terminal.currentSession.user.lastName !== null ? terminal.currentSession.user.lastName : "",
        },
        status: terminal.currentSession.status,
        startTime: terminal.currentSession.startTime,
        openingBalance: terminal.currentSession.openingBalance,
      } : undefined,
    }))

    return { success: true, terminals: terminalInfo }
  } catch (error) {
    console.error("Error fetching terminals:", error)
    return { success: false, error: "Failed to fetch terminals" }
  }
}

// Get available terminals (not in use)
export async function getAvailableTerminals(
  locationId: string,
  organizationId: string
): Promise<{ success: boolean; terminals?: TerminalInfo[]; error?: string }> {
  try {
    const terminals = await db.pOSStation.findMany({
      where: {
        locationId,
        organizationId,
        isActive: true,
        currentSessionId: null,
      },
      include: {
        location: {
          select: {
            name: true,
            code: true,
          },
        },
      },
      orderBy: {
        terminalNumber: 'asc',
      },
    })

    const terminalInfo: TerminalInfo[] = terminals.map(terminal => ({
      id: terminal.id,
      name: terminal.name,
      terminalNumber: terminal.terminalNumber,
      isActive: terminal.isActive,
      hasCashDrawer: terminal.hasCashDrawer,
      locationId: terminal.locationId,
      location: terminal.location,
    }))

    return { success: true, terminals: terminalInfo }
  } catch (error) {
    console.error("Error fetching available terminals:", error)
    return { success: false, error: "Failed to fetch available terminals" }
  }
}

// Auto-detect terminal by hostname/IP (for hardware-bound setups)
export async function detectTerminal(
  locationId: string,
  organizationId: string,
  identifier: string // hostname, IP, or device ID
): Promise<{ success: boolean; terminal?: TerminalInfo; error?: string }> {
  try {
    // For this example, we'll match by terminal name containing the identifier
    const terminal = await db.pOSStation.findFirst({
      where: {
        locationId,
        organizationId,
        isActive: true,
        OR: [
          { name: { contains: identifier, mode: 'insensitive' } },
          { terminalNumber: { contains: identifier, mode: 'insensitive' } },
        ],
      },
      include: {
        location: {
          select: {
            name: true,
            code: true,
          },
        },
        currentSession: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    })

    if (!terminal) {
      return { success: false, error: "Terminal not found for this device" }
    }

    const terminalInfo: TerminalInfo = {
      id: terminal.id,
      name: terminal.name,
      terminalNumber: terminal.terminalNumber,
      isActive: terminal.isActive,
      hasCashDrawer: terminal.hasCashDrawer,
      locationId: terminal.locationId,
      location: terminal.location,
      currentSessionId: terminal.currentSessionId ?? undefined,
      currentSession: terminal.currentSession ? {
        id: terminal.currentSession.id,
        sessionNumber: terminal.currentSession.sessionNumber,
        userId: terminal.currentSession.userId,
        user: {
          firstName: terminal.currentSession.user.firstName !== null ? terminal.currentSession.user.firstName : "",
          lastName: terminal.currentSession.user.lastName !== null ? terminal.currentSession.user.lastName : "",
        },
        status: terminal.currentSession.status,
        startTime: terminal.currentSession.startTime,
        openingBalance: terminal.currentSession.openingBalance,
      } : undefined,
    }

    return { success: true, terminal: terminalInfo }
  } catch (error) {
    console.error("Error detecting terminal:", error)
    return { success: false, error: "Failed to detect terminal" }
  }
}

// Get current user's active session
export async function getUserActiveSession(
  userId: string
): Promise<{ success: boolean; session?: SessionInfo; error?: string }> {
  try {
    const session = await db.pOSSession.findFirst({
      where: {
        userId,
        status: "ACTIVE",
      },
      include: {
        terminal: {
          select: {
            name: true,
            terminalNumber: true,
          },
        },
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    })

    if (!session) {
      return { success: true, session: undefined }
    }

    const sessionInfo: SessionInfo = {
      id: session.id,
      sessionNumber: session.sessionNumber,
      status: session.status,
      startTime: session.startTime,
      endTime: session.endTime ?? undefined,
      terminalId: session.terminalId,
      terminal: session.terminal,
      userId: session.userId,
      user: {
        firstName: session.user.firstName ?? "",
        lastName: session.user.lastName ?? "",
        email: session.user.email,
      },
      openingBalance: session.openingBalance,
      closingBalance: session.closingBalance !== null ? session.closingBalance : undefined,
      expectedBalance: session.expectedBalance !== null ? session.expectedBalance : undefined,
      variance: session.variance !== null ? session.variance : undefined,
      totalSales: session.totalSales,
      transactionCount: session.transactionCount,
    }

    return { success: true, session: sessionInfo }
  } catch (error) {
    console.error("Error fetching user active session:", error)
    return { success: false, error: "Failed to fetch active session" }
  }
}

// Get terminal status
export async function getTerminalStatus(
  terminalId: string
): Promise<{ success: boolean; terminal?: TerminalInfo; error?: string }> {
  try {
    const terminal = await db.pOSStation.findUnique({
      where: { id: terminalId },
      include: {
        location: {
          select: {
            name: true,
            code: true,
          },
        },
        currentSession: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    })

    if (!terminal) {
      return { success: false, error: "Terminal not found" }
    }

    const terminalInfo: TerminalInfo = {
      id: terminal.id,
      name: terminal.name,
      terminalNumber: terminal.terminalNumber,
      isActive: terminal.isActive,
      hasCashDrawer: terminal.hasCashDrawer,
      locationId: terminal.locationId,
      location: terminal.location,
      currentSessionId: terminal.currentSessionId ?? undefined,
      currentSession: terminal.currentSession ? {
        id: terminal.currentSession.id,
        sessionNumber: terminal.currentSession.sessionNumber,
        userId: terminal.currentSession.userId,
        user: {
          firstName: terminal.currentSession.user.firstName !== null ? terminal.currentSession.user.firstName : "",
          lastName: terminal.currentSession.user.lastName !== null ? terminal.currentSession.user.lastName : "",
        },
        status: terminal.currentSession.status,
        startTime: terminal.currentSession.startTime,
        openingBalance: terminal.currentSession.openingBalance,
      } : undefined,
    }

    return { success: true, terminal: terminalInfo }
  } catch (error) {
    console.error("Error fetching terminal status:", error)
    return { success: false, error: "Failed to fetch terminal status" }
  }
}

// Force close session (admin function)
export async function forceCloseSession(
  sessionId: string,
  adminUserId: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await db.pOSSession.findUnique({
      where: { id: sessionId },
      include: {
        terminal: true,
      },
    })

    if (!session) {
      return { success: false, error: "Session not found" }
    }

    await db.pOSSession.update({
      where: { id: sessionId },
      data: {
        status: "CLOSED",
        endTime: new Date(),
        notes: `Force closed by admin: ${reason}`,
      },
    })

    // Clear terminal's current session
    await db.pOSStation.update({
      where: { id: session.terminalId },
      data: {
        currentSessionId: null,
      },
    })

    revalidatePath("/pos")
    return { success: true }
  } catch (error) {
    console.error("Error force closing session:", error)
    return { success: false, error: "Failed to force close session" }
  }
}

// ===== TANSTACK QUERY HOOKS =====
// File: lib/hooks/use-pos-terminal.ts

"use client"


import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { closePosSession, openPosSession } from "../cashSystem/cash-drawer/cashDrawerAllActions"

// Get all terminals for location
export function useTerminals(locationId: string, organizationId: string) {
  return useQuery({
    queryKey: ["terminals", locationId, organizationId],
    queryFn: async () => {
      const result = await getTerminals(locationId, organizationId)
      if (!result.success) {
        throw new Error(result.error)
      }
      return result.terminals!
    },
    enabled: !!locationId && !!organizationId,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
  })
}

// Get available terminals
export function useAvailableTerminals(locationId: string, organizationId: string) {
  return useQuery({
    queryKey: ["available-terminals", locationId, organizationId],
    queryFn: async () => {
      const result = await getAvailableTerminals(locationId, organizationId)
      if (!result.success) {
        throw new Error(result.error)
      }
      return result.terminals!
    },
    enabled: !!locationId && !!organizationId,
    staleTime: 10000, // 10 seconds
    refetchInterval: 30000, // Refetch every 30 seconds
  })
}

// Auto-detect terminal
export function useDetectTerminal(
  locationId: string, 
  organizationId: string,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ["detect-terminal", locationId, organizationId],
    queryFn: async () => {
      // Get device identifier (hostname, IP, etc.)
      const identifier = window?.location?.hostname || "unknown"
      
      const result = await detectTerminal(locationId, organizationId, identifier)
      if (!result.success) {
        throw new Error(result.error)
      }
      return result.terminal!
    },
    enabled: enabled && !!locationId && !!organizationId,
    retry: 1,
    staleTime: 300000, // 5 minutes (terminals don't change often)
  })
}

// Get user's active session
export function useActiveSession(userId: string) {
  return useQuery({
    queryKey: ["active-session", userId],
    queryFn: async () => {
      const result = await getUserActiveSession(userId)
      if (!result.success) {
        throw new Error(result.error)
      }
      return result.session
    },
    enabled: !!userId,
    staleTime: 5000, // 5 seconds
    refetchInterval: 10000, // Refetch every 10 seconds
  })
}

// Get terminal status
export function useTerminalStatus(terminalId: string) {
  return useQuery({
    queryKey: ["terminal-status", terminalId],
    queryFn: async () => {
      const result = await getTerminalStatus(terminalId)
      if (!result.success) {
        throw new Error(result.error)
      }
      return result.terminal!
    },
    enabled: !!terminalId,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
  })
}

// Start POS session mutation
export function useStartSession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      terminalId: string
      userId: string
      locationId: string
      organizationId: string
      openingBalance: number
    }) => {
      const result = await openPosSession(
        data.terminalId,
        data.userId,
        data.locationId,
        data.organizationId,
        data.openingBalance
      )
      if (!result.success) {
        throw new Error(result.error)
      }
      return result.sessionId!
    },
    onSuccess: (sessionId, variables) => {
      toast.success("Session started successfully")
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["terminals"] })
      queryClient.invalidateQueries({ queryKey: ["available-terminals"] })
      queryClient.invalidateQueries({ queryKey: ["active-session", variables.userId] })
      queryClient.invalidateQueries({ queryKey: ["terminal-status", variables.terminalId] })
    },
    onError: (error) => {
      toast.error(`Failed to start session: ${error.message}`)
    },
  })
}

// Close POS session mutation
export function useCloseSession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      sessionId: string
      actualBalance: number
      notes?: string
    }) => {
      const result = await closePosSession(
        data.sessionId,
        data.actualBalance,
        data.notes
      )
      if (!result.success) {
        throw new Error(result.error)
      }
      return result
    },
    onSuccess: () => {
      toast.success("Session closed successfully")
      
      // Invalidate all session-related queries
      queryClient.invalidateQueries({ queryKey: ["terminals"] })
      queryClient.invalidateQueries({ queryKey: ["available-terminals"] })
      queryClient.invalidateQueries({ queryKey: ["active-session"] })
      queryClient.invalidateQueries({ queryKey: ["terminal-status"] })
    },
    onError: (error) => {
      toast.error(`Failed to close session: ${error.message}`)
    },
  })
}

// Force close session (admin)
export function useForceCloseSession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      sessionId: string
      adminUserId: string
      reason: string
    }) => {
      const result = await forceCloseSession(
        data.sessionId,
        data.adminUserId,
        data.reason
      )
      if (!result.success) {
        throw new Error(result.error)
      }
      return result
    },
    onSuccess: () => {
      toast.success("Session force closed")
      
      // Invalidate all queries
      queryClient.invalidateQueries()
    },
    onError: (error) => {
      toast.error(`Failed to force close session: ${error.message}`)
    },
  })
}

// ===== USAGE EXAMPLES =====

// Example Component: Terminal Selector
/*
"use client"

import { useAvailableTerminals, useDetectTerminal, useStartSession } from "@/lib/hooks/use-pos-terminal"
import { useUser } from "@/lib/hooks/use-user"
import { useState } from "react"

export function TerminalSelector({ locationId, organizationId }: { 
  locationId: string, 
  organizationId: string 
}) {
  const { user } = useUser()
  const [selectedTerminal, setSelectedTerminal] = useState<string>("")
  const [openingBalance, setopeningBalance] = useState<number>(0)

  // Try to auto-detect terminal first
  const { data: detectedTerminal, isLoading: detecting } = useDetectTerminal(
    locationId, 
    organizationId
  )

  // Get available terminals for manual selection
  const { data: availableTerminals, isLoading: loadingTerminals } = useAvailableTerminals(
    locationId, 
    organizationId
  )

  const startSession = useStartSession()

  const handleStartSession = () => {
    const terminalId = detectedTerminal?.id || selectedTerminal
    if (!terminalId || !user) return

    startSession.mutate({
      terminalId,
      userId: user.id,
      locationId,
      organizationId,
      openingBalance: openingBalance,
    })
  }

  if (detecting || loadingTerminals) {
    return <div>Loading terminals...</div>
  }

  return (
    <div className="space-y-4">
      {detectedTerminal ? (
        <div>
          <h3>Detected Terminal: {detectedTerminal.name}</h3>
          <p>Terminal #{detectedTerminal.terminalNumber}</p>
        </div>
      ) : (
        <div>
          <label>Select Terminal:</label>
          <select 
            value={selectedTerminal} 
            onChange={(e) => setSelectedTerminal(e.target.value)}
          >
            <option value="">Choose terminal...</option>
            {availableTerminals?.map(terminal => (
              <option key={terminal.id} value={terminal.id}>
                {terminal.name} (#{terminal.terminalNumber})
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label>Opening Cash Amount:</label>
        <input 
          type="number" 
          value={openingBalance} 
          onChange={(e) => setopeningBalance(Number(e.target.value))}
          step="0.01"
        />
      </div>

      <button 
        onClick={handleStartSession}
        disabled={(!detectedTerminal && !selectedTerminal) || startSession.isPending}
      >
        {startSession.isPending ? "Starting..." : "Start Session"}
      </button>
    </div>
  )
}
*/