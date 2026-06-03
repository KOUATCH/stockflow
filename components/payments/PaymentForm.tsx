"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { PaymentFormData } from "@/types/payments"
import { OrderPaymentMethod } from "@prisma/client"
import { CreditCard, DollarSign, Building, Smartphone, Receipt, CheckSquare } from "lucide-react"

const paymentSchema = z.object({
  amount: z.number().positive("Amount must be greater than zero"),
  method: z.nativeEnum(OrderPaymentMethod, { required_error: "Payment method is required" }),
  checkNumber: z.string().optional(),
  referenceNumber: z.string().optional(),
  notes: z.string().optional(),
  transactionId: z.string().optional(),
  authorizationCode: z.string().optional(),
  cardType: z.string().optional(),
  cardLast4: z.string().optional().refine((val) => {
    if (!val) return true
    return /^\d{4}$/.test(val)
  }, "Last 4 digits must be exactly 4 numbers"),
  digitalWalletType: z.string().optional(),
  digitalTransactionId: z.string().optional(),
  cashTendered: z.number().optional(),
}).refine((data) => {
  // If cash payment, require cash tendered
  if (data.method === "CASH") {
    return data.cashTendered !== undefined && data.cashTendered >= data.amount
  }
  return true
}, {
  message: "Cash tendered must be provided and >= payment amount for cash payments",
  path: ["cashTendered"]
}).refine((data) => {
  // If card payment, require card type and last 4
  if (data.method === "CREDIT_CARD" || data.method === "DEBIT_CARD") {
    return data.cardType && data.cardLast4
  }
  return true
}, {
  message: "Card type and last 4 digits are required for card payments",
  path: ["cardType"]
}).refine((data) => {
  // If cheque payment, require check number
  if (data.method === "CHEQUE") {
    return data.checkNumber
  }
  return true
}, {
  message: "Check number is required for cheque payments",
  path: ["checkNumber"]
})

interface PaymentFormProps {
  orderTotal: number
  paidAmount: number
  onSubmit: (data: PaymentFormData) => void
  isLoading?: boolean
  defaultAmount?: number
}

export function PaymentForm({
  orderTotal,
  paidAmount,
  onSubmit,
  isLoading = false,
  defaultAmount,
}: PaymentFormProps) {
  const remainingBalance = orderTotal - paidAmount
  const [selectedMethod, setSelectedMethod] = useState<OrderPaymentMethod>("CASH")

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: defaultAmount || remainingBalance,
      method: "CASH" as OrderPaymentMethod,
      notes: "",
    },
  })

  const watchedAmount = form.watch("amount")
  const watchedCashTendered = form.watch("cashTendered")
  const changeGiven = selectedMethod === "CASH" && watchedCashTendered && watchedAmount
    ? Math.max(0, watchedCashTendered - watchedAmount)
    : 0

  const handleSubmit = (data: PaymentFormData) => {
    const finalData: PaymentFormData = {
      ...data,
      changeGiven: selectedMethod === "CASH" ? changeGiven : undefined,
    }
    onSubmit(finalData)
  }

  const getMethodIcon = (method: OrderPaymentMethod) => {
    const iconMap = {
      CASH: DollarSign,
      CREDIT_CARD: CreditCard,
      DEBIT_CARD: CreditCard,
      BANK_TRANSFER: Building,
      MOBILE_MONEY: Smartphone,
      CHEQUE: Receipt,
      STORE_CREDIT: CheckSquare,
      OTHER: CreditCard,
    }
    return iconMap[method] || CreditCard
  }

  const paymentMethods = [
    { value: "CASH", label: "Cash", icon: DollarSign },
    { value: "CREDIT_CARD", label: "Credit Card", icon: CreditCard },
    { value: "DEBIT_CARD", label: "Debit Card", icon: CreditCard },
    { value: "BANK_TRANSFER", label: "Bank Transfer", icon: Building },
    { value: "MOBILE_MONEY", label: "Mobile Money", icon: Smartphone },
    { value: "CHEQUE", label: "Cheque", icon: Receipt },
    { value: "STORE_CREDIT", label: "Store Credit", icon: CheckSquare },
    { value: "OTHER", label: "Other", icon: CreditCard },
  ]

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Process Payment
        </CardTitle>
        <CardDescription>
          Record a payment for this order
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Order Summary */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Order Total</p>
            <p className="text-lg font-semibold">${orderTotal.toFixed(2)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Paid Amount</p>
            <p className="text-lg font-semibold text-green-600">${paidAmount.toFixed(2)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Balance Due</p>
            <p className="text-lg font-semibold text-orange-600">${remainingBalance.toFixed(2)}</p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Amount */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Amount</FormLabel>
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
                    Maximum amount: ${remainingBalance.toFixed(2)}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Payment Method */}
            <FormField
              control={form.control}
              name="method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Method</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value as OrderPaymentMethod)
                      setSelectedMethod(value as OrderPaymentMethod)
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {paymentMethods.map((method) => {
                        const Icon = method.icon
                        return (
                          <SelectItem key={method.value} value={method.value}>
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              {method.label}
                            </div>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Conditional Fields Based on Payment Method */}
            {selectedMethod === "CASH" && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="cashTendered"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cash Tendered</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {changeGiven > 0 && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-green-800">Change to Give:</span>
                      <span className="text-lg font-bold text-green-600">${changeGiven.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {(selectedMethod === "CREDIT_CARD" || selectedMethod === "DEBIT_CARD") && (
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="cardType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Card Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select card type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="VISA">Visa</SelectItem>
                          <SelectItem value="MASTERCARD">Mastercard</SelectItem>
                          <SelectItem value="AMEX">American Express</SelectItem>
                          <SelectItem value="DISCOVER">Discover</SelectItem>
                          <SelectItem value="OTHER">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cardLast4"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last 4 Digits</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="1234"
                          maxLength={4}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="transactionId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Transaction ID</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="Transaction ID"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="authorizationCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Authorization Code</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="Auth code"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {selectedMethod === "CHEQUE" && (
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="checkNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Check Number</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="Check number"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="referenceNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reference Number</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="Reference number"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {(selectedMethod === "BANK_TRANSFER" || selectedMethod === "MOBILE_MONEY") && (
              <FormField
                control={form.control}
                name="referenceNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reference Number</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Transaction reference number"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional notes about this payment..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 flex-1"
              >
                {isLoading ? "Processing..." : `Process Payment - $${watchedAmount?.toFixed(2) || "0.00"}`}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}