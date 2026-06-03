"use server"

import {
  createInventoryTransactions as createInventoryTransactionsForPOS,
  createPayment as createPaymentForPOS,
  createPOSSession as createPOSSessionForPOS,
  createSale as createSaleForPOS,
  getActivePOSSession as getActivePOSSessionForPOS,
  updateInventoryLevels as updateInventoryLevelsForPOS,
} from "@/actions/posSalesProcess/posActions"

type CompatiblePOSSessionInput = {
  stationId?: string
  terminalId?: string
  userId: string
  locationId: string
  organizationId: string
  openingBalance?: number
}

export async function createSale(data: Parameters<typeof createSaleForPOS>[0], userId: string) {
  return createSaleForPOS(data, userId)
}

export async function createPayment(data: Parameters<typeof createPaymentForPOS>[0], userId: string) {
  return createPaymentForPOS(data, userId)
}

export async function updateInventoryLevels(data: Parameters<typeof updateInventoryLevelsForPOS>[0]) {
  return updateInventoryLevelsForPOS(data)
}

export async function createInventoryTransactions(data: Parameters<typeof createInventoryTransactionsForPOS>[0]) {
  return createInventoryTransactionsForPOS(data)
}

export async function getActivePOSSession(stationId: string) {
  return getActivePOSSessionForPOS(stationId)
}

export async function createPOSSession(data: CompatiblePOSSessionInput) {
  const stationId = data.stationId ?? data.terminalId

  if (!stationId) {
    return {
      success: false,
      error: "Terminal ID is required",
    }
  }

  return createPOSSessionForPOS({
    stationId,
    userId: data.userId,
    locationId: data.locationId,
    organizationId: data.organizationId,
    openingBalance: data.openingBalance,
  })
}
