"use server"

import type { ReceiptData } from "@/types/payments"

type ActionResult<T = unknown> = {
  success: boolean
  data?: T
  error?: string
  message?: string
}

const LEGACY_PAYMENTS_DISABLED =
  "Legacy ClientOrder receipt workflow is disabled. Use canonical POS receipt delivery instead."

export async function generateReceiptData(
  _paymentId: string,
  _organizationId: string
): Promise<ActionResult<ReceiptData>> {
  return {
    success: false,
    error: LEGACY_PAYMENTS_DISABLED,
  }
}

export async function generateReceiptsForOrder(
  _orderId: string,
  _organizationId: string
): Promise<ActionResult<ReceiptData[]>> {
  return {
    success: true,
    data: [],
    message: LEGACY_PAYMENTS_DISABLED,
  }
}

export async function getPaymentSummary(_organizationId: string): Promise<ActionResult> {
  return {
    success: true,
    data: {
      totalPayments: 0,
      totalAmount: 0,
      pendingPayments: 0,
      pendingAmount: 0,
      completedPayments: 0,
      completedAmount: 0,
      refundedPayments: 0,
      refundedAmount: 0,
      paymentsByMethod: [],
    },
    message: LEGACY_PAYMENTS_DISABLED,
  }
}
