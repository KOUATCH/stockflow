"use client"

import { sendReceiptAction } from "@/actions/pos/receipt.actions"
import { useMutation, useQueryClient } from "@tanstack/react-query"

type SendReceiptVariables = {
  salesOrderId: string
  channel: "PRINT" | "EMAIL" | "SMS" | "WHATSAPP" | "NONE"
  destination?: string
  locale?: "EN" | "FR"
}

export const posReceiptKeys = {
  all: ["pos", "receipts"] as const,
  detail: (salesOrderId: string) => [...posReceiptKeys.all, salesOrderId] as const,
}

export function useSendReceipt() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (variables: SendReceiptVariables) => sendReceiptAction(variables),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: posReceiptKeys.all })
      queryClient.invalidateQueries({ queryKey: posReceiptKeys.detail(variables.salesOrderId) })
      queryClient.invalidateQueries({ queryKey: ["salesOrders", variables.salesOrderId] })
    },
  })
}
