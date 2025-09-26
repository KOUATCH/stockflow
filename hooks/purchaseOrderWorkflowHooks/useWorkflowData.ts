"use client"

import {
  getOrgPurchaseOrderBYLocationId,
  getOrgPurchaseOrders,
} from "@/actions/purchaseOrderWorkflow/purchaseOrderWorkflowActions"
import type { PurchaseOrderStatus, PurchaseOrderWithRelations } from "@/types/purchase-orders-system-types"
import { useCallback, useEffect, useState } from "react"
// Mock server actions - replace with real implementations

const mockGetPurchaseOrders = async (OrganizationId: string) => {
  const purchaseOrders = await getOrgPurchaseOrders(OrganizationId)
  console.log({ purchaseOrders })
  return purchaseOrders.data
}
//  const getUserID = async()=>{

//  const { data: session } =await useSession()
//  const user = session?.user
//  const orgId = user?.organizationId || ""
//    return orgId
//   }
const mockUpdatePurchaseOrderStatus = async (
  id: string,
  status: PurchaseOrderStatus,
  reason?: string,
): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 500))
  console.log(`[v0] Updated PO ${id} to status ${status}`, reason ? `Reason: ${reason}` : "")
}


export function useWorkflowData(organizationId: string, locationId: string | null) {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrderWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPurchaseOrders = useCallback(async () => {
    if (!organizationId) {
      console.log("[DEBUG] No organizationId provided, skipping fetch")
      setLoading(false)
      setPurchaseOrders([])
      return
    }

    try {
      setLoading(true)
      setError(null)

      console.log("[DEBUG] Fetching purchase orders:", {
        organizationId,
        locationId,
        hasOrgId: !!organizationId,
        hasLocationId: !!locationId,
      })

      let response
      
      if (locationId) {
        response = await getOrgPurchaseOrderBYLocationId(organizationId, locationId)
      } else {
        response = await getOrgPurchaseOrders(organizationId)
      }

      console.log("[DEBUG] API Response:", {
        response,
        success: response?.success,
        dataLength: response?.data?.length || 0,
        hasData: !!response?.data,
        isArray: Array.isArray(response?.data),
      })

      if (response?.success && Array.isArray(response.data)) {
        const validOrders = response.data.filter((order: PurchaseOrderWithRelations) => {
          const isValid = order && order.id && order.orderNumber
          if (!isValid) {
            console.warn("[DEBUG] Invalid order filtered out:", order)
          }
          return isValid
        })

        console.log("[DEBUG] Processed orders:", {
          originalCount: response.data.length,
          validCount: validOrders.length,
        })

        setPurchaseOrders(validOrders)
      } else {
        console.warn("[DEBUG] No valid data received:", response)
        setPurchaseOrders([])
        if (response?.error) {
          setError(response.error)
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch purchase orders"
      console.error("[DEBUG] Fetch error:", err)
      setError(errorMessage)
      setPurchaseOrders([])
    } finally {
      setLoading(false)
    }
  }, [organizationId, locationId])

  const updateOrderStatus = useCallback(async (orderId: string, newStatus: PurchaseOrderStatus, reason?: string) => {
    try {
      await mockUpdatePurchaseOrderStatus(orderId, newStatus, reason)

      // Optimistically update local state
      setPurchaseOrders((prev) =>
        prev.map((order) =>
          order.id === orderId
            ? {
                ...order,
                status: newStatus,
                updatedAt: new Date(),
                ...(newStatus === "APPROVED" && { approvedAt: new Date() }),
              }
            : order,
        ),
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update order status")
      throw err
    }
  }, [])

  useEffect(() => {
    fetchPurchaseOrders()
  }, [fetchPurchaseOrders])

  return {
    purchaseOrders,
    loading,
    error,
    refetch: fetchPurchaseOrders,
    updateOrderStatus,
  }
}
// export function useWorkflowData(organizationId: string, locationId: string | null) {
//   const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrderWithRelations[]>([])
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState<string | null>(null)

//   const fetchPurchaseOrders = useCallback(async () => {
//     try {
//       setLoading(true)
//       setError(null)

//       console.log("[v0] Fetching purchase orders:", {
//         organizationId,
//         locationId,
//         hasOrgId: !!organizationId,
//         hasLocationId: !!locationId,
//       })

//       const response = await getOrgPurchaseOrderBYLocationId(organizationId || "", locationId || "")

//       console.log("[v0] API Response:", {
//         response,
//         responseType: typeof response,
//         isArray: Array.isArray(response),
//         hasData: !!response?.data,
//         dataLength: response?.data?.length || 0,
//       })

//       let orders: PurchaseOrderWithRelations[] = []

//       if (response?.data && Array.isArray(response.data)) {
//         orders = response.data
//       } else if (Array.isArray(response)) {
//         orders = response
//       } else if (response && typeof response === "object" && response.data) {
//         orders = Array.isArray(response.data) ? response.data : [response.data]
//       } else {
//         console.warn("[v0] Unexpected response format:", response)
//         orders = []
//       }

//       const validOrders = orders.filter((order) => {
//         const isValid = order && order.id && order.orderNumber
//         if (!isValid) {
//           console.warn("[v0] Invalid order filtered out:", order)
//         }
//         return isValid
//       })

//       console.log("[v0] Processed orders:", {
//         originalCount: orders.length,
//         validCount: validOrders.length,
//         sampleOrders: validOrders.slice(0, 2).map((po) => ({
//           id: po.id,
//           orderNumber: po.orderNumber,
//           status: po.status,
//           locationId: po.locationId,
//         })),
//       })

//       setPurchaseOrders(validOrders)
//     } catch (err) {
//       const errorMessage = err instanceof Error ? err.message : "Failed to fetch purchase orders"
//       console.error("[v0] Fetch error:", err)
//       setError(errorMessage)
//       setPurchaseOrders([]) // Ensure we set empty array on error
//     } finally {
//       setLoading(false)
//     }
//   }, [organizationId, locationId]) // Added locationId to dependencies

//   const updateOrderStatus = useCallback(async (orderId: string, newStatus: PurchaseOrderStatus, reason?: string) => {
//     try {
//       await mockUpdatePurchaseOrderStatus(orderId, newStatus, reason)

//       // Optimistically update local state
//       setPurchaseOrders((prev) =>
//         prev.map((order) =>
//           order.id === orderId
//             ? {
//                 ...order,
//                 status: newStatus,
//                 updatedAt: new Date(),
//                 ...(newStatus === "APPROVED" && { approvedAt: new Date() }),
//               }
//             : order,
//         ),
//       )
//     } catch (err) {
//       setError(err instanceof Error ? err.message : "Failed to update order status")
//       throw err
//     }
//   }, [])

//   useEffect(() => {
//     fetchPurchaseOrders()
//   }, [fetchPurchaseOrders])

//   return {
//     purchaseOrders,
//     loading,
//     error,
//     refetch: fetchPurchaseOrders,
//     updateOrderStatus,
//   }
// }
