"use client"

import {
  getOrgPurchaseOrdersByLocationClientSafe,
  getOrgPurchaseOrdersClientSafe,
} from "@/actions/purchaseOrderWorkflow/clientSafePurchaseOrderActions"
import {
  approvePurchaseOrder,
  cancelPurchaseOrder,
  closePurchaseOrder,
  submitPurchaseOrder,
} from "@/actions/purchaseOrderWorkflow/purchaseOrderSystemAction"
import type { PurchaseOrderStatus, PurchaseOrderWithRelations } from "@/types/purchase-orders-system-types"
import { useCallback, useEffect, useState } from "react"

const getPurchaseOrders = async (organizationId: string, locationId?: string) => {
  const result = locationId
    ? await getOrgPurchaseOrdersByLocationClientSafe(organizationId, locationId)
    : await getOrgPurchaseOrdersClientSafe(organizationId)

  if (!result.success) {
    throw new Error(result.error || "Failed to fetch purchase orders")
  }

  return result.data
}

export function useWorkflowData(organizationId: string, locationId: string | null) {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrderWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPurchaseOrders = useCallback(async () => {
    if (!organizationId) {
      setLoading(false)
      setPurchaseOrders([])
      return
    }

    try {
      setLoading(true)
      setError(null)
      const orders = await getPurchaseOrders(organizationId, locationId || undefined)
      setPurchaseOrders(orders.filter((order) => order.id && order.orderNumber))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch purchase orders")
      setPurchaseOrders([])
    } finally {
      setLoading(false)
    }
  }, [organizationId, locationId])

  const updateOrderStatus = useCallback(
    async (orderId: string, newStatus: PurchaseOrderStatus, reason?: string) => {
      if (!organizationId) {
        throw new Error("Organization ID is required")
      }

      const result =
        newStatus === "SUBMITTED"
          ? await submitPurchaseOrder(orderId, organizationId)
          : newStatus === "APPROVED"
            ? await approvePurchaseOrder(orderId, organizationId, "system-user")
            : newStatus === "CANCELLED"
              ? await cancelPurchaseOrder(orderId, organizationId, reason)
              : newStatus === "COMPLETED"
                ? await closePurchaseOrder(orderId, organizationId)
                : null

      if (!result?.success) {
        throw new Error(result?.error || "This purchase order status change is not supported from this workflow")
      }

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
    },
    [organizationId],
  )

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
