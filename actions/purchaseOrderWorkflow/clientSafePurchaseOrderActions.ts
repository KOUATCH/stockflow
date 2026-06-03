"use server"

import { getOrgPurchaseOrders } from "./purchaseOrderSystemAction"

export async function getOrgPurchaseOrdersClientSafe(organizationId?: string) {
  const result = await getOrgPurchaseOrders(organizationId)

  return {
    success: result.success,
    data: result.success ? result.data : [],
    error: result.success ? null : result.error ?? "Failed to fetch purchase orders",
  }
}

export async function getOrgPurchaseOrdersByLocationClientSafe(organizationId?: string, locationId?: string) {
  const result = await getOrgPurchaseOrders(organizationId)

  if (!result.success) {
    return {
      success: false,
      data: [],
      error: result.error ?? "Failed to fetch purchase orders",
    }
  }

  return {
    success: true,
    data: locationId ? result.data.filter((purchaseOrder) => purchaseOrder.location?.id === locationId) : result.data,
    error: null,
  }
}
