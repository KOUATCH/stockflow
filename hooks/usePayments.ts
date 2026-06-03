import { notify } from "@/lib/notifications/notify"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  getOrderPayments,
  getPaymentById,
  createPayment,
  updatePaymentStatus,
  getPayments,
  getPaymentAnalytics,
} from "@/actions/payments/payment-actions"
import {
  createRefund,
  updateRefundStatus,
  getPaymentRefunds,
  getRefunds,
} from "@/actions/payments/refund-actions"
import {
  generateReceiptData,
  generateReceiptsForOrder,
  getPaymentSummary,
} from "@/actions/payments/receipt-actions"
import type {
  OrderPaymentStatus,
  PaymentFilters,
  PaymentFormData,
  PaymentRefundFormData,
} from "@/types/payments"
import { RefundStatus } from "@prisma/client"

// Hook for fetching order payments
export const useOrderPayments = (orderId: string, organizationId: string) => {
  return useQuery({
    queryKey: ["orderPayments", orderId, organizationId],
    queryFn: () => getOrderPayments(orderId, organizationId),
    enabled: !!orderId && !!organizationId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    refetchOnWindowFocus: false,
  })
}

// Hook for fetching single payment
export const usePayment = (paymentId: string, organizationId: string) => {
  return useQuery({
    queryKey: ["payment", paymentId, organizationId],
    queryFn: () => getPaymentById(paymentId, organizationId),
    enabled: !!paymentId && !!organizationId,
  })
}

// Hook for fetching payments with filters
export const usePayments = (
  organizationId: string,
  filters: PaymentFilters = {},
  page: number = 1,
  limit: number = 10
) => {
  return useQuery({
    queryKey: ["payments", organizationId, filters, page, limit],
    queryFn: () => getPayments(organizationId, filters, page, limit),
    enabled: !!organizationId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    refetchOnWindowFocus: false,
  })
}

// Hook for fetching payment analytics
export const usePaymentAnalytics = (organizationId: string) => {
  return useQuery({
    queryKey: ["paymentAnalytics", organizationId],
    queryFn: () => getPaymentAnalytics(organizationId),
    enabled: !!organizationId,
  })
}

// Hook for fetching payment refunds
export const usePaymentRefunds = (paymentId: string, organizationId: string) => {
  return useQuery({
    queryKey: ["paymentRefunds", paymentId, organizationId],
    queryFn: () => getPaymentRefunds(paymentId, organizationId),
    enabled: !!paymentId && !!organizationId,
  })
}

// Hook for creating a payment
export const useCreatePayment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    meta: { operation: 'create', entity: 'Payment', suppressSuccessNotification: true, suppressErrorNotification: true },
    mutationFn: ({
      orderId,
      paymentData,
      organizationId,
      userId,
    }: {
      orderId: string
      paymentData: PaymentFormData
      organizationId: string
      userId: string
    }) => createPayment(orderId, paymentData, organizationId, userId),
    onSuccess: (result, variables) => {
      if (result.success) {
        notify.success(result.message || "Payment processed successfully")

        // Invalidate related queries
        queryClient.invalidateQueries({ queryKey: ["orderPayments", variables.orderId] })
        queryClient.invalidateQueries({ queryKey: ["payments", variables.organizationId] })
        queryClient.invalidateQueries({ queryKey: ["paymentAnalytics", variables.organizationId] })
        queryClient.invalidateQueries({ queryKey: ["orders", variables.organizationId] })
      } else {
        notify.error(result.error || "Failed to process payment")
      }
    },
    onError: (error) => {
      console.error("Payment creation error:", error)
      notify.error("Failed to process payment")
    },
  })
}

// Hook for updating payment status
export const useUpdatePaymentStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    meta: { operation: 'update', entity: 'Payment Status', suppressSuccessNotification: true, suppressErrorNotification: true },
    mutationFn: ({
      paymentId,
      status,
      organizationId,
      userId,
    }: {
      paymentId: string
      status: OrderPaymentStatus
      organizationId: string
      userId: string
    }) => updatePaymentStatus(paymentId, status, organizationId, userId),
    onSuccess: (result, variables) => {
      if (result.success) {
        notify.success(result.message || "Payment status updated successfully")

        // Invalidate related queries
        queryClient.invalidateQueries({ queryKey: ["payment", variables.paymentId] })
        queryClient.invalidateQueries({ queryKey: ["payments", variables.organizationId] })
        queryClient.invalidateQueries({ queryKey: ["paymentAnalytics", variables.organizationId] })
        queryClient.invalidateQueries({ queryKey: ["orderPayments"] })
      } else {
        notify.error(result.error || "Failed to update payment status")
      }
    },
    onError: (error) => {
      console.error("Payment status update error:", error)
      notify.error("Failed to update payment status")
    },
  })
}

// Hook for creating a refund
export const useCreateRefund = () => {
  const queryClient = useQueryClient()

  return useMutation({
    meta: { operation: 'create', entity: 'Refund', suppressSuccessNotification: true, suppressErrorNotification: true },
    mutationFn: ({
      paymentId,
      refundData,
      organizationId,
      userId,
    }: {
      paymentId: string
      refundData: PaymentRefundFormData
      organizationId: string
      userId: string
    }) => createRefund(paymentId, refundData, organizationId, userId),
    onSuccess: (result, variables) => {
      if (result.success) {
        notify.success(result.message || "Refund initiated successfully")

        // Invalidate related queries
        queryClient.invalidateQueries({ queryKey: ["paymentRefunds", variables.paymentId] })
        queryClient.invalidateQueries({ queryKey: ["payment", variables.paymentId] })
        queryClient.invalidateQueries({ queryKey: ["payments", variables.organizationId] })
        queryClient.invalidateQueries({ queryKey: ["refunds", variables.organizationId] })
      } else {
        notify.error(result.error || "Failed to process refund")
      }
    },
    onError: (error) => {
      console.error("Refund creation error:", error)
      notify.error("Failed to process refund")
    },
  })
}

// Hook for updating refund status
export const useUpdateRefundStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    meta: { operation: 'update', entity: 'Refund Status', suppressSuccessNotification: true, suppressErrorNotification: true },
    mutationFn: ({
      refundId,
      status,
      organizationId,
      userId,
      processorResponse,
    }: {
      refundId: string
      status: RefundStatus
      organizationId: string
      userId: string
      processorResponse?: string
    }) => updateRefundStatus(refundId, status, organizationId, userId, processorResponse),
    onSuccess: (result, variables) => {
      if (result.success) {
        notify.success(result.message || "Refund status updated successfully")

        // Invalidate related queries
        queryClient.invalidateQueries({ queryKey: ["refunds", variables.organizationId] })
        queryClient.invalidateQueries({ queryKey: ["paymentRefunds"] })
        queryClient.invalidateQueries({ queryKey: ["payments", variables.organizationId] })
      } else {
        notify.error(result.error || "Failed to update refund status")
      }
    },
    onError: (error) => {
      console.error("Refund status update error:", error)
      notify.error("Failed to update refund status")
    },
  })
}

// Hook for fetching refunds with filters
export const useRefunds = (
  organizationId: string,
  filters: {
    status?: RefundStatus[]
    dateFrom?: Date
    dateTo?: Date
    amountMin?: number
    amountMax?: number
  } = {},
  page: number = 1,
  limit: number = 10
) => {
  return useQuery({
    queryKey: ["refunds", organizationId, filters, page, limit],
    queryFn: () => getRefunds(organizationId, filters, page, limit),
    enabled: !!organizationId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    refetchOnWindowFocus: false,
  })
}

// Hook for generating receipt data
export const useReceiptData = (paymentId: string, organizationId: string) => {
  return useQuery({
    queryKey: ["receiptData", paymentId, organizationId],
    queryFn: () => generateReceiptData(paymentId, organizationId),
    enabled: !!paymentId && !!organizationId && paymentId !== "",
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    refetchOnWindowFocus: false,
  })
}

// Hook for generating receipts for an order
export const useOrderReceipts = (orderId: string, organizationId: string) => {
  return useQuery({
    queryKey: ["orderReceipts", orderId, organizationId],
    queryFn: () => generateReceiptsForOrder(orderId, organizationId),
    enabled: !!orderId && !!organizationId,
  })
}

// Hook for payment summary
export const usePaymentSummary = (organizationId: string) => {
  return useQuery({
    queryKey: ["paymentSummary", organizationId],
    queryFn: () => getPaymentSummary(organizationId),
    enabled: !!organizationId,
  })
}
