"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { PaymentRefundFormData } from "@/types/payments"
import { RotateCcw as RefundIcon, AlertTriangle, DollarSign, CreditCard } from "lucide-react"
import { OrderPaymentMethod } from "@prisma/client"

const refundSchema = z.object({
  amount: z.number().positive("Refund amount must be greater than zero"),
  reason: z.string().min(1, "Refund reason is required"),
  notes: z.string().optional(),
})

interface RefundFormProps {
  paymentAmount: number
  paymentMethod: OrderPaymentMethod
  paymentNumber: string
  orderNumber: string
  customerName: string
  onSubmit: (data: PaymentRefundFormData) => void
  isLoading?: boolean
}

export function RefundForm({
  paymentAmount,
  paymentMethod,
  paymentNumber,
  orderNumber,
  customerName,
  onSubmit,
  isLoading = false,
}: RefundFormProps) {
  const form = useForm<PaymentRefundFormData>({
    resolver: zodResolver(refundSchema),
    defaultValues: {
      amount: paymentAmount,
      reason: "",
      notes: "",
    },
  })

  const watchedAmount = form.watch("amount")
  const isPartialRefund = watchedAmount < paymentAmount

  const refundReasons = [
    "Customer request",
    "Defective product",
    "Wrong item shipped",
    "Order cancellation",
    "Duplicate payment",
    "Service not provided",
    "Billing error",
    "Merchant error",
    "Other",
  ]

  const getMethodBadge = (method: OrderPaymentMethod) => {
    const configs = {
      CASH: { variant: "success" as const, icon: DollarSign, label: "Cash" },
      CREDIT_CARD: { variant: "default" as const, icon: CreditCard, label: "Credit Card" },
      DEBIT_CARD: { variant: "default" as const, icon: CreditCard, label: "Debit Card" },
      BANK_TRANSFER: { variant: "secondary" as const, icon: CreditCard, label: "Bank Transfer" },
      MOBILE_MONEY: { variant: "secondary" as const, icon: CreditCard, label: "Mobile Money" },
      CHEQUE: { variant: "outline" as const, icon: CreditCard, label: "Cheque" },
      STORE_CREDIT: { variant: "outline" as const, icon: CreditCard, label: "Store Credit" },
      OTHER: { variant: "outline" as const, icon: CreditCard, label: "Other" },
    }

    const config = configs[method] || { variant: "outline" as const, icon: CreditCard, label: method }
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefundIcon className="h-5 w-5" />
          Process Refund
        </CardTitle>
        <CardDescription>
          Issue a refund for payment {paymentNumber}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Payment Summary */}
        <div className="p-4 bg-muted/50 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Payment Details</span>
            {getMethodBadge(paymentMethod)}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Payment #</p>
              <p className="font-medium">{paymentNumber}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Order #</p>
              <p className="font-medium">{orderNumber}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Customer</p>
              <p className="font-medium">{customerName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Payment Amount</p>
              <p className="font-medium text-green-600">${paymentAmount.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Refund Warning */}
        <div className="flex items-start gap-3 p-4 border border-orange-200 bg-orange-50 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-orange-800">Refund Notice</h4>
            <p className="text-sm text-orange-700">
              This action will initiate a refund process. Depending on the payment method,
              it may take 3-5 business days for the refund to appear in the customer's account.
            </p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Refund Amount */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Refund Amount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormDescription>
                    Maximum refund amount: ${paymentAmount.toFixed(2)}
                    {isPartialRefund && (
                      <span className="text-orange-600 ml-2">
                        (Partial refund: ${(paymentAmount - watchedAmount).toFixed(2)} remaining)
                      </span>
                    )}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Refund Reason */}
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Refund Reason</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select refund reason" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {refundReasons.map((reason) => (
                        <SelectItem key={reason} value={reason}>
                          {reason}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Additional Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional details about the refund reason..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide any additional context or details about this refund.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 flex-1"
              >
                {isLoading ? "Processing Refund..." : `Issue Refund - $${watchedAmount?.toFixed(2) || "0.00"}`}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
