"use server"

import { revalidatePath } from "next/cache"

import type {
  CreateDeliveryFormData,
  DeliveryAnalytics,
  DeliveryDashboardData,
  DeliveryFilters,
  DeliveryPriority,
  DeliveryTrackingUpdate,
  ExtendedOrderDelivery,
  UpdateDeliveryFormData,
} from "@/types/delivery"
import { DeliveryStatus } from "@/types/delivery"

const DELIVERY_SCHEMA_UNAVAILABLE =
  "Delivery persistence is not available in the current Prisma schema. Add delivery tables before enabling write operations."

const DELIVERY_REVALIDATION_PATHS = [
  "/[locale]/dashboard/deliveries",
  "/[locale]/dashboard/orders",
] as const

type DeliveryActionResult<T> = {
  success: boolean
  data?: T
  error?: string
  message?: string
}

function revalidateDeliveryPaths() {
  for (const path of DELIVERY_REVALIDATION_PATHS) {
    revalidatePath(path, "page")
  }
}

function emptyStatusCounts(): Record<DeliveryStatus, number> {
  return Object.values(DeliveryStatus).reduce((acc, status) => {
    acc[status] = 0
    return acc
  }, {} as Record<DeliveryStatus, number>)
}

function emptyPriorityCounts(): Record<DeliveryPriority, number> {
  const priorities = ["LOW", "MEDIUM", "HIGH", "URGENT"] as DeliveryPriority[]
  return priorities.reduce((acc, priority) => {
    acc[priority] = 0
    return acc
  }, {} as Record<DeliveryPriority, number>)
}

function buildEmptyAnalytics(): DeliveryAnalytics {
  return {
    totalDeliveries: 0,
    deliveriesByStatus: emptyStatusCounts(),
    deliveriesByPriority: emptyPriorityCounts(),
    averageDeliveryTime: 0,
    onTimeDeliveryRate: 0,
    failedDeliveryRate: 0,
    totalDistanceCovered: 0,
    totalDeliveryFees: 0,
    driverPerformance: [],
    peakDeliveryTimes: [],
    deliveryHeatmap: [],
  }
}

function buildEmptyDashboard(): DeliveryDashboardData {
  return {
    todaysDeliveries: {
      total: 0,
      completed: 0,
      pending: 0,
      inTransit: 0,
      failed: 0,
    },
    upcomingDeliveries: [],
    activeDrivers: [],
    deliveryMetrics: {
      onTimeRate: 0,
      averageDeliveryTime: 0,
      customerSatisfaction: 0,
      totalRevenue: 0,
    },
    recentFailures: [],
  }
}

// Generate unique delivery number
export async function generateDeliveryNumber(_organizationId: string): Promise<string> {
  const today = new Date()
  const year = today.getFullYear()
  const month = (today.getMonth() + 1).toString().padStart(2, "0")
  const day = today.getDate().toString().padStart(2, "0")
  const sequence = Date.now().toString().slice(-4)

  return `DEL${year}${month}${day}${sequence}`
}

// Create comprehensive delivery
export async function createComprehensiveDelivery(
  data: CreateDeliveryFormData,
  organizationId: string,
  _createdById: string
): Promise<DeliveryActionResult<ExtendedOrderDelivery>> {
  try {
    if (!organizationId || !data.orderId) {
      return {
        success: false,
        error: "Organization and order are required",
      }
    }

    if (!data.deliveryItems.length) {
      return {
        success: false,
        error: "At least one delivery item is required",
      }
    }

    revalidateDeliveryPaths()
    return {
      success: false,
      error: DELIVERY_SCHEMA_UNAVAILABLE,
    }
  } catch (error) {
    console.error("Error creating delivery:", error)
    return {
      success: false,
      error: "Failed to create delivery",
    }
  }
}

// Update delivery status with tracking
export async function updateDeliveryStatus(
  deliveryId: string,
  statusUpdate: UpdateDeliveryFormData,
  organizationId: string,
  _updatedById: string
): Promise<DeliveryActionResult<ExtendedOrderDelivery>> {
  try {
    if (!deliveryId || !organizationId || !statusUpdate.status) {
      return {
        success: false,
        error: "Delivery, organization, and status are required",
      }
    }

    revalidateDeliveryPaths()
    return {
      success: false,
      error: DELIVERY_SCHEMA_UNAVAILABLE,
    }
  } catch (error) {
    console.error("Error updating delivery status:", error)
    return {
      success: false,
      error: "Failed to update delivery status",
    }
  }
}

// Get deliveries with comprehensive data
export async function getDeliveries(
  organizationId: string,
  _filters?: DeliveryFilters
): Promise<{ success: boolean; data?: ExtendedOrderDelivery[]; error?: string }> {
  try {
    if (!organizationId) {
      return {
        success: false,
        error: "Organization is required",
      }
    }

    return {
      success: true,
      data: [],
    }
  } catch (error) {
    console.error("Error fetching deliveries:", error)
    return {
      success: false,
      error: "Failed to fetch deliveries",
    }
  }
}

// Get delivery tracking history
export async function getDeliveryTracking(
  deliveryId: string,
  organizationId: string
): Promise<{ success: boolean; data?: DeliveryTrackingUpdate[]; error?: string }> {
  try {
    if (!deliveryId || !organizationId) {
      return {
        success: false,
        error: "Delivery and organization are required",
      }
    }

    return {
      success: true,
      data: [],
    }
  } catch (error) {
    console.error("Error fetching delivery tracking:", error)
    return {
      success: false,
      error: "Failed to fetch delivery tracking",
    }
  }
}

// Get delivery analytics
export async function getDeliveryAnalytics(
  organizationId: string,
  _dateFrom?: Date,
  _dateTo?: Date
): Promise<{ success: boolean; data?: DeliveryAnalytics; error?: string }> {
  try {
    if (!organizationId) {
      return {
        success: false,
        error: "Organization is required",
      }
    }

    return {
      success: true,
      data: buildEmptyAnalytics(),
    }
  } catch (error) {
    console.error("Error fetching delivery analytics:", error)
    return {
      success: false,
      error: "Failed to fetch delivery analytics",
    }
  }
}

// Get delivery dashboard data
export async function getDeliveryDashboard(
  organizationId: string
): Promise<{ success: boolean; data?: DeliveryDashboardData; error?: string }> {
  try {
    if (!organizationId) {
      return {
        success: false,
        error: "Organization is required",
      }
    }

    return {
      success: true,
      data: buildEmptyDashboard(),
    }
  } catch (error) {
    console.error("Error fetching delivery dashboard:", error)
    return {
      success: false,
      error: "Failed to fetch delivery dashboard",
    }
  }
}

// Reschedule delivery
export async function rescheduleDelivery(
  deliveryId: string,
  newDate: Date,
  reason: string,
  organizationId: string,
  _updatedById: string
): Promise<DeliveryActionResult<ExtendedOrderDelivery>> {
  try {
    if (!deliveryId || !organizationId || !newDate || !reason) {
      return {
        success: false,
        error: "Delivery, date, reason, and organization are required",
      }
    }

    revalidateDeliveryPaths()
    return {
      success: false,
      error: DELIVERY_SCHEMA_UNAVAILABLE,
    }
  } catch (error) {
    console.error("Error rescheduling delivery:", error)
    return {
      success: false,
      error: "Failed to reschedule delivery",
    }
  }
}
