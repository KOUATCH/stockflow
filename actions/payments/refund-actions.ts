"use server"

import type { RefundStatus } from "@prisma/client"
import type { PaymentRefundFormData } from "@/types/payments"

type ActionResult<T = unknown> = {
  success: boolean
  data?: T
  error?: string
  message?: string
}

const LEGACY_PAYMENTS_DISABLED =
  "Legacy ClientOrder refund workflow is disabled. Use canonical POS refunds instead."

const disabled = <T = unknown>(): ActionResult<T> => ({
  success: false,
  error: LEGACY_PAYMENTS_DISABLED,
})

export async function createRefund(
  _paymentId: string,
  _refundData: PaymentRefundFormData,
  _organizationId: string,
  _userId: string
): Promise<ActionResult> {
  return disabled()
}

export async function updateRefundStatus(
  _refundId: string,
  _status: RefundStatus,
  _organizationId: string,
  _userId: string,
  _processorResponse?: string
): Promise<ActionResult> {
  return disabled()
}

export async function getPaymentRefunds(
  _paymentId: string,
  _organizationId: string
): Promise<ActionResult> {
  return {
    success: true,
    data: [],
    message: LEGACY_PAYMENTS_DISABLED,
  }
}

export async function getRefunds(
  _organizationId: string,
  _filters: {
    status?: RefundStatus[]
    dateFrom?: Date
    dateTo?: Date
    amountMin?: number
    amountMax?: number
  } = {},
  page: number = 1,
  limit: number = 10
): Promise<ActionResult> {
  return {
    success: true,
    data: {
      refunds: [],
      pagination: {
        current: page,
        total: 0,
        count: 0,
        limit,
      },
    },
    message: LEGACY_PAYMENTS_DISABLED,
  }
}
