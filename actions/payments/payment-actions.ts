"use server"

import type {
  OrderPaymentStatus,
  PaymentFilters,
  PaymentFormData,
} from "@/types/payments"

type ActionResult<T = unknown> = {
  success: boolean
  data?: T
  error?: string
  message?: string
}

const LEGACY_PAYMENTS_DISABLED =
  "Legacy ClientOrder payment workflow is disabled. Use canonical POS tenders and sales payments instead."

const disabled = <T = unknown>(): ActionResult<T> => ({
  success: false,
  error: LEGACY_PAYMENTS_DISABLED,
})

export async function getOrderPayments(
  _orderId: string,
  _organizationId: string
): Promise<ActionResult> {
  return {
    success: true,
    data: [],
    message: LEGACY_PAYMENTS_DISABLED,
  }
}

export async function getPaymentById(
  _paymentId: string,
  _organizationId: string
): Promise<ActionResult> {
  return disabled()
}

export async function createPayment(
  _orderId: string,
  _paymentData: PaymentFormData,
  _organizationId: string,
  _userId: string
): Promise<ActionResult> {
  return disabled()
}

export async function updatePaymentStatus(
  _paymentId: string,
  _status: OrderPaymentStatus,
  _organizationId: string,
  _userId: string
): Promise<ActionResult> {
  return disabled()
}

export async function getPayments(
  _organizationId: string,
  _filters: PaymentFilters = {},
  page: number = 1,
  limit: number = 10
): Promise<ActionResult> {
  return {
    success: true,
    data: {
      payments: [],
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

export async function getPaymentAnalytics(_organizationId: string): Promise<ActionResult> {
  return {
    success: true,
    data: {
      totalPayments: 0,
      totalAmount: 0,
      recentPayments: [],
      paymentsByMethod: [],
    },
    message: LEGACY_PAYMENTS_DISABLED,
  }
}
