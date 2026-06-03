"use client"

import { notify } from "@/lib/notifications/notify"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { recordReceivablePayment } from "@/actions/finance/accounts-receivable-actions"
import { useClientAuth } from "@/hooks/useClientAuth"
import { useNotifications } from "@/components/notifications/NotificationProvider"
import PaymentReceiptDialog from "@/components/finance/PaymentReceiptDialog"
import { CreditCard, DollarSign, Calendar, AlertCircle, CheckCircle, Receipt } from "lucide-react"
interface ReceivablePaymentDialogProps {
  receivable: {
    id: string
    invoiceNumber: string
    customerName: string
    totalAmount: number
    outstandingAmount: number
    dueDate: string
    status: string
  }
  trigger?: React.ReactNode
  onPaymentSuccess?: () => void
}

export function ReceivablePaymentDialog({ receivable, trigger, onPaymentSuccess }: ReceivablePaymentDialogProps) {
  const { organizationId } = useClientAuth()
  const { paymentReceived, invoicePaidInFull, receiptGenerated, paymentFailed } = useNotifications()
  const [open, setOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false)
  const [receiptData, setReceiptData] = useState<any>(null)
  const [formData, setFormData] = useState({
    amount: receivable.outstandingAmount.toString(),
    paymentMethod: "CASH" as "CASH" | "DIGITAL" | "CARD",
    paymentDate: new Date().toISOString().split('T')[0],
    checkNumber: "",
    referenceNumber: "",
    notes: "",
    discountTaken: "0"
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Improved organization validation
    if (!organizationId) {
      notify.error("Organization not found. Please refresh the page and try again.")
      console.error("Organization ID missing from user session")
      return
    }

    const amount = parseFloat(formData.amount)
    const discountTaken = parseFloat(formData.discountTaken)

    // Enhanced validation
    if (isNaN(amount) || amount <= 0) {
      notify.error("Please enter a valid payment amount")
      return
    }

    if (amount > receivable.outstandingAmount) {
      notify.error(`Payment amount cannot exceed outstanding balance of $${receivable.outstandingAmount.toLocaleString()}`)
      return
    }

    if (discountTaken > 0 && discountTaken > (receivable.outstandingAmount - amount)) {
      notify.error("Discount amount is too high for remaining balance")
      return
    }

    setIsProcessing(true)

    try {
      console.log("Processing receivable payment:", {
        receivableId: receivable.id,
        amount,
        organizationId,
        paymentMethod: formData.paymentMethod
      })

      const result = await recordReceivablePayment({
        receivableId: receivable.id,
        amount,
        paymentDate: new Date(formData.paymentDate),
        paymentMethod: formData.paymentMethod,
        checkNumber: formData.checkNumber || undefined,
        referenceNumber: formData.referenceNumber || undefined,
        notes: formData.notes || undefined,
        discountTaken,
        organizationId
      })

      console.log("Receivable payment result:", result)

      if (result.success && result.receiptData) {
        // Determine if invoice is fully paid
        const remainingBalance = result.receiptData.invoice.outstandingAmount - amount
        const isFullyPaid = remainingBalance <= 0

        // Show appropriate notification
        if (isFullyPaid) {
          invoicePaidInFull(receivable.invoiceNumber, receivable.customerName)
        } else {
          paymentReceived(amount, receivable.customerName, receivable.invoiceNumber)
        }

        // Generate receipt notification
        receiptGenerated(result.receiptData.paymentNumber, amount)

        setReceiptData(result.receiptData)
        setOpen(false)
        onPaymentSuccess?.()

        // Show receipt dialog
        setTimeout(() => {
          setReceiptDialogOpen(true)
        }, 300)

        // Reset form
        setFormData({
          amount: "0",
          paymentMethod: "CASH",
          paymentDate: new Date().toISOString().split('T')[0],
          checkNumber: "",
          referenceNumber: "",
          notes: "",
          discountTaken: "0"
        })

        notify.success("Payment recorded successfully!")
      } else {
        const errorMessage = result.error || "Unknown error occurred"
        console.error("Receivable payment failed:", errorMessage)
        paymentFailed(errorMessage, amount, formData.referenceNumber)
        notify.error(`Payment failed: ${errorMessage}`)
      }
    } catch (error) {
      console.error("Receivable payment processing error:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      notify.error(`Failed to process payment: ${errorMessage}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "OVERDUE":
        return "bg-red-100 text-red-800 border-red-200"
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "SENT":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" className="bg-green-600 hover:bg-green-700">
            <CreditCard className="w-4 h-4 mr-2" />
            Record Payment
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Record Customer Payment - {receivable.invoiceNumber}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Invoice Summary */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Customer</p>
                  <p className="font-semibold">{receivable.customerName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <Badge className={getStatusColor(receivable.status)}>
                    {receivable.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Due Date</p>
                  <p className="font-semibold flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(receivable.dueDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Outstanding Amount</p>
                  <p className="text-xl font-bold text-green-600">
                    ${receivable.outstandingAmount.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Payment Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  max={receivable.outstandingAmount}
                  required
                />
                <p className="text-xs text-gray-500">
                  Maximum: ${receivable.outstandingAmount.toLocaleString()}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="discountTaken">Early Payment Discount</Label>
                <Input
                  id="discountTaken"
                  type="number"
                  step="0.01"
                  value={formData.discountTaken}
                  onChange={(e) => setFormData({ ...formData, discountTaken: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Payment Method *</Label>
                <Select
                  value={formData.paymentMethod}
                  onValueChange={(value: "CASH" | "DIGITAL" | "CARD") =>
                    setFormData({ ...formData, paymentMethod: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">Cash</SelectItem>
                    <SelectItem value="CARD">Card/Bank Transfer</SelectItem>
                    <SelectItem value="DIGITAL">Digital Payment</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentDate">Payment Date *</Label>
                <Input
                  id="paymentDate"
                  type="date"
                  value={formData.paymentDate}
                  onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                  required
                />
              </div>

              {formData.paymentMethod === "CARD" && (
                <div className="space-y-2">
                  <Label htmlFor="checkNumber">Check/Reference Number</Label>
                  <Input
                    id="checkNumber"
                    value={formData.checkNumber}
                    onChange={(e) => setFormData({ ...formData, checkNumber: e.target.value })}
                    placeholder="Enter check or reference number"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="referenceNumber">Internal Reference</Label>
                <Input
                  id="referenceNumber"
                  value={formData.referenceNumber}
                  onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                  placeholder="Internal tracking number"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Payment Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes about this payment..."
                rows={3}
              />
            </div>

            {/* Payment Summary */}
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-green-800">Payment Summary</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-green-600">Total Received</p>
                    <p className="text-xl font-bold text-green-800">
                      ${(parseFloat(formData.amount || "0") + parseFloat(formData.discountTaken || "0")).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Remaining Balance:</span>
                    <span className="ml-2 font-semibold">
                      ${(receivable.outstandingAmount - parseFloat(formData.amount || "0") - parseFloat(formData.discountTaken || "0")).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">New Status:</span>
                    <span className="ml-2 font-semibold">
                      {(receivable.outstandingAmount - parseFloat(formData.amount || "0") - parseFloat(formData.discountTaken || "0")) <= 0 ? "PAID" : "PARTIALLY_PAID"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isProcessing || !formData.amount || parseFloat(formData.amount) <= 0}
                className="flex-1"
              >
                {isProcessing ? (
                  "Processing..."
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Record Payment
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>

    {/* Receipt Dialog */}
    {receiptData && (
      <PaymentReceiptDialog
        open={receiptDialogOpen}
        onOpenChange={setReceiptDialogOpen}
        receiptData={receiptData}
      />
    )}
  </>
  )
}