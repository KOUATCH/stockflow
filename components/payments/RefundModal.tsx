"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { RefundForm } from "./RefundForm"
import { PaymentRefundFormData, OrderPaymentWithDetails } from "@/types/payments"

interface RefundModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  payment: OrderPaymentWithDetails | null
  onSubmit: (data: PaymentRefundFormData) => void
  isLoading?: boolean
}

export function RefundModal({
  open,
  onOpenChange,
  payment,
  onSubmit,
  isLoading = false,
}: RefundModalProps) {
  if (!payment) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Process Refund</DialogTitle>
          <DialogDescription>
            Issue a refund for Payment {payment.paymentNumber}
          </DialogDescription>
        </DialogHeader>

        <RefundForm
          paymentAmount={payment.amount}
          paymentMethod={payment.method}
          paymentNumber={payment.paymentNumber}
          orderNumber={payment.order?.orderNumber || "N/A"}
          customerName={payment.order?.customerName || "N/A"}
          onSubmit={(data) => {
            onSubmit(data)
            if (!isLoading) {
              onOpenChange(false)
            }
          }}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  )
}