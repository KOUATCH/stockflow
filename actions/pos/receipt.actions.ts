"use server"

import { revalidateTag } from "next/cache"
import { err, ok } from "@/services/_shared/action-response"
import { requireOrg } from "@/services/_shared/require-org"
import { getSalesReceipt, sendReceipt } from "@/services/pos/receipt.service"
import { salesReceiptLookupSchema, sendReceiptSchema } from "@/services/pos/pos.schemas"

export async function getSalesReceiptAction(input: unknown) {
  try {
    const { orgId } = await requireOrg()
    const parsed = salesReceiptLookupSchema.parse(input)
    const receipt = await getSalesReceipt({
      ...parsed,
      organizationId: orgId,
    })

    return ok(receipt)
  } catch (error) {
    return err(error)
  }
}

export async function sendReceiptAction(input: unknown) {
  try {
    const { userId, orgId } = await requireOrg()
    const parsed = sendReceiptSchema.parse(input)
    const result = await sendReceipt({
      ...parsed,
      organizationId: orgId,
      userId,
    })

    revalidateTag("pos-receipts")
    revalidateTag(`pos-receipt-${parsed.salesOrderId}`)

    return ok(result)
  } catch (error) {
    return err(error)
  }
}
