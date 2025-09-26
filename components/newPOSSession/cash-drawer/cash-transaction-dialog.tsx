"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DollarSign, Plus, Minus, AlertTriangle, Info } from "lucide-react"

const cashTransactionSchema = z.object({
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  reason: z.string().min(1, "Reason is required"),
  description: z.string().optional(),
})

type CashTransactionForm = z.infer<typeof cashTransactionSchema>

interface CashTransactionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  type: "CASH_IN" | "CASH_OUT"
  sessionId: string
  onSuccess: (amount: number, reason: string, notes?: string) => void
}

const CASH_IN_REASONS = [
  { value: "starting_float", label: "Starting Float", description: "Initial cash for the shift" },
  { value: "bank_deposit_return", label: "Bank Deposit Return", description: "Cash returned from bank" },
  { value: "petty_cash_replenishment", label: "Petty Cash Replenishment", description: "Adding petty cash funds" },
  { value: "change_fund_addition", label: "Change Fund Addition", description: "Adding change for transactions" },
  { value: "till_correction", label: "Till Correction", description: "Correcting cash count error" },
  { value: "customer_payment", label: "Customer Payment", description: "Direct customer cash payment" },
  { value: "other", label: "Other", description: "Custom reason" },
]

const CASH_OUT_REASONS = [
  { value: "bank_deposit", label: "Bank Deposit", description: "Depositing cash to bank" },
  { value: "petty_cash_withdrawal", label: "Petty Cash Withdrawal", description: "Taking cash for expenses" },
  { value: "change_fund_removal", label: "Change Fund Removal", description: "Removing excess change" },
  { value: "till_correction", label: "Till Correction", description: "Correcting cash count error" },
  { value: "expense_payment", label: "Expense Payment", description: "Paying business expense" },
  { value: "customer_refund", label: "Customer Refund", description: "Cash refund to customer" },
  { value: "safe_drop", label: "Safe Drop", description: "Moving cash to safe" },
  { value: "other", label: "Other", description: "Custom reason" },
]

export function CashTransactionDialog({ open, onOpenChange, type, sessionId, onSuccess }: CashTransactionDialogProps) {
  const [customReason, setCustomReason] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const { toast } = useToast()

  const form = useForm<CashTransactionForm>({
    resolver: zodResolver(cashTransactionSchema),
    defaultValues: {
      amount: 0,
      reason: "",
      description: "",
    },
  })

  const reasons = type === "CASH_IN" ? CASH_IN_REASONS : CASH_OUT_REASONS
  const selectedReason = form.watch("reason")
  const selectedAmount = form.watch("amount")
  const isCustomReason = selectedReason === "other"

  const selectedReasonData = reasons.find((r) => r.value === selectedReason)

  const onSubmit = async (data: CashTransactionForm) => {
    const finalReason = isCustomReason ? customReason : selectedReasonData?.label || data.reason

    if (isCustomReason && !customReason.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please specify a custom reason",
      })
      return
    }

    if (data.amount <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid Amount",
        description: "Amount must be greater than zero",
      })
      return
    }

    setIsProcessing(true)

    try {
      await onSuccess(data.amount, finalReason, data.description)
      form.reset()
      setCustomReason("")
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Transaction Failed",
        description: "Failed to process cash transaction. Please try again.",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClose = () => {
    form.reset()
    setCustomReason("")
    onOpenChange(false)
  }

  // Quick amount buttons
  const quickAmounts = type === "CASH_IN" ? [20, 50, 100, 200, 500] : [20, 50, 100, 200]

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {type === "CASH_IN" ? (
              <div className="p-2 rounded-full bg-green-100">
                <Plus className="h-4 w-4 text-green-600" />
              </div>
            ) : (
              <div className="p-2 rounded-full bg-red-100">
                <Minus className="h-4 w-4 text-red-600" />
              </div>
            )}
            {type === "CASH_IN" ? "Add Cash to Drawer" : "Remove Cash from Drawer"}
          </DialogTitle>
          <DialogDescription>
            {type === "CASH_IN"
              ? "Add cash to the drawer and specify the reason for the transaction."
              : "Remove cash from the drawer and specify the reason for the transaction."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Amount Section */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">Amount</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          type="number"
                          step="0.01"
                          min="0.01"
                          placeholder="0.00"
                          className="pl-9 text-lg"
                          {...field}
                          onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 0)}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Quick Amount Buttons */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Quick amounts:</p>
                <div className="flex flex-wrap gap-2">
                  {quickAmounts.map((amount) => (
                    <Button
                      key={amount}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => form.setValue("amount", amount)}
                      className="h-8"
                    >
                      ${amount}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Reason Section */}
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">Reason</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a reason" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {reasons.map((reason) => (
                        <SelectItem key={reason.value} value={reason.value}>
                          <div>
                            <div className="font-medium">{reason.label}</div>
                            <div className="text-xs text-muted-foreground">{reason.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Selected Reason Info */}
            {selectedReasonData && !isCustomReason && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-3">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">{selectedReasonData.label}</p>
                      <p className="text-xs text-blue-700">{selectedReasonData.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Custom Reason Input */}
            {isCustomReason && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Custom Reason</label>
                <Input
                  placeholder="Enter custom reason"
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                />
              </div>
            )}

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any additional details about this transaction..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Transaction Summary */}
            {selectedAmount > 0 && selectedReasonData && (
              <Card className="bg-muted/30">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Transaction Summary</span>
                      <Badge variant={type === "CASH_IN" ? "default" : "destructive"}>
                        {type === "CASH_IN" ? "Addition" : "Removal"}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Amount:</span>
                      <span className={`font-medium ${type === "CASH_IN" ? "text-green-600" : "text-red-600"}`}>
                        {type === "CASH_OUT" ? "-" : "+"}${selectedAmount.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Reason:</span>
                      <span className="font-medium">
                        {isCustomReason ? customReason || "Custom" : selectedReasonData.label}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Warning for large amounts */}
            {selectedAmount > 500 && (
              <Card className="border-orange-200 bg-orange-50">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 text-orange-700">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm font-medium">Large Amount Warning</span>
                  </div>
                  <p className="text-xs text-orange-600 mt-1">
                    This is a large cash transaction. Please ensure proper authorization and documentation.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={handleClose} className="flex-1 bg-transparent">
                Cancel
              </Button>
              <Button
                type="submit"
                className={`flex-1 ${
                  type === "CASH_IN" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
                }`}
                disabled={isProcessing || selectedAmount <= 0 || !selectedReason}
              >
                {isProcessing ? "Processing..." : type === "CASH_IN" ? "Add Cash" : "Remove Cash"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
