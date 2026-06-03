"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { PaymentForm } from "./PaymentForm"
import { PaymentFormData } from "@/types/payments"

interface PaymentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  orderTotal: number
  paidAmount: number
  orderNumber: string
  customerName: string
  onSubmit: (data: PaymentFormData) => void
  isLoading?: boolean
}

export function PaymentModal({
  open,
  onOpenChange,
  orderTotal,
  paidAmount,
  orderNumber,
  customerName,
  onSubmit,
  isLoading = false,
}: PaymentModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Process Payment</DialogTitle>
          <DialogDescription>
            Process a payment for Order {orderNumber} - {customerName}
          </DialogDescription>
        </DialogHeader>

        <PaymentForm
          orderTotal={orderTotal}
          paidAmount={paidAmount}
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