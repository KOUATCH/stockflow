"use client"

import { getOrgPurchaseOrderBYLocationId, getOrgPurchaseOrders } from "@/actions/purchaseOrderWorkflow/purchaseOrderWorkflowActions";
import type { PurchaseOrderStatus, PurchaseOrderWithRelations } from "@/types/purchase-orders-system-types";
import { useCallback, useEffect, useState } from "react";
// Mock server actions - replace with real implementations

const mockGetPurchaseOrders = async (OrganizationId:string)=> {
 
const purchaseOrders =  await  getOrgPurchaseOrders(OrganizationId)
console.log({purchaseOrders})
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

export function   useWorkflowData(organizationId:string, locationId:string | null) {
  
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrderWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPurchaseOrders = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await getOrgPurchaseOrderBYLocationId(organizationId || "", locationId || "")
      const orders: PurchaseOrderWithRelations[] = Array.isArray(response)
        ? response
        : response
        ? [response]
        : []
      setPurchaseOrders(orders)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch purchase orders")
    } finally {
      setLoading(false)
    }
  }, [organizationId])

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
