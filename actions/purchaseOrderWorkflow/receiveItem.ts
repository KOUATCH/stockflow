"use server"

import { receiveItems as receivePurchaseOrderItems } from "./purchaseOrderSystemAction"
import { requireOrg } from "@/services/_shared/require-org"

export async function receiveItems({
  purchaseOrderId,
  locationId,
  lines,
}: {
  purchaseOrderId: string
  locationId: string
  lines: { lineId: string; quantity: number }[]
}) {
  const { orgId, userId } = await requireOrg()
  const result = await receivePurchaseOrderItems({
    id: purchaseOrderId,
    organizationId: orgId,
    receivedBy: userId,
    locationId,
    items: lines.map((line) => ({
      lineId: line.lineId,
      receivedQuantity: line.quantity,
      acceptedQuantity: line.quantity,
      rejectedQuantity: 0,
    })),
  })

  if (!result.success) {
    throw new Error(result.error ?? "Failed to receive items")
  }

  return { success: true, receipt: result.data }
}
