"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { OrderPaymentWithDetails } from "@/types/payments"
import { OrderPaymentMethod, OrderPaymentStatus } from "@prisma/client"
import {
  CreditCard,
  DollarSign,
  Building,
  Smartphone,
  Receipt,
  CheckSquare,
  CheckCircle,
  AlertCircle,
  RotateCcw as RefundIcon,
  X,
  Calendar,
  User,
  Hash,
  FileText,
  Download
} from "lucide-react"
import { format } from "date-fns"

interface PaymentDetailsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  payment: OrderPaymentWithDetails | null
  onGenerateReceipt?: () => void
  onProcessRefund?: () => void
}

export function PaymentDetailsModal({
  open,
  onOpenChange,
  payment,
  onGenerateReceipt,
  onProcessRefund,
}: PaymentDetailsModalProps) {
  if (!payment) return null

  const getStatusBadge = (status: OrderPaymentStatus) => {
    const configs = {
      COMPLETED: { variant: "default" as const, icon: CheckCircle, label: "Completed", color: "text-green-600" },
      PENDING: { variant: "secondary" as const, icon: AlertCircle, label: "Pending", color: "text-yellow-600" },
      PARTIALLY_PAID: { variant: "secondary" as const, icon: AlertCircle, label: "Partial", color: "text-blue-600" },
      FULLY_PAID: { variant: "default" as const, icon: CheckCircle, label: "Paid", color: "text-green-600" },
      REFUNDED: { variant: "destructive" as const, icon: RefundIcon, label: "Refunded", color: "text-red-600" },
      CANCELLED: { variant: "outline" as const, icon: X, label: "Cancelled", color: "text-gray-600" },
    }

    const config = configs[status] || { variant: "outline" as const, icon: AlertCircle, label: status, color: "text-gray-600" }
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const getMethodBadge = (method: OrderPaymentMethod) => {
    const configs = {
      CASH: { variant: "success" as const, icon: DollarSign, label: "Cash" },
      CREDIT_CARD: { variant: "default" as const, icon: CreditCard, label: "Credit Card" },
      DEBIT_CARD: { variant: "default" as const, icon: CreditCard, label: "Debit Card" },
      BANK_TRANSFER: { variant: "secondary" as const, icon: Building, label: "Bank Transfer" },
      MOBILE_MONEY: { variant: "secondary" as const, icon: Smartphone, label: "Mobile Money" },
      CHEQUE: { variant: "outline" as const, icon: Receipt, label: "Cheque" },
      STORE_CREDIT: { variant: "outline" as const, icon: CheckSquare, label: "Store Credit" },
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Payment Details</span>
            {getStatusBadge(payment.status)}
          </DialogTitle>
          <DialogDescription>
            Payment {payment.paymentNumber} • {payment.order?.orderNumber || "No Order"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Payment Overview */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Payment Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="text-2xl font-bold text-green-600">${payment.amount.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Method</p>
                  <div className="mt-1">
                    {getMethodBadge(payment.method)}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">{format(new Date(payment.paymentDate), "MMM dd, yyyy")}</p>
                  <p className="text-sm text-muted-foreground">{format(new Date(payment.paymentDate), "HH:mm")}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <div className="mt-1">
                    {getStatusBadge(payment.status)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Information */}
          {payment.order && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Order Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Order Number</p>
                    <p className="font-medium">{payment.order.orderNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Customer</p>
                    <p className="font-medium">{payment.order.customerName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Order Total</p>
                    <p className="font-medium">${payment.order.totalAmount.toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payment Details */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Transaction Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Payment Number</p>
                      <p className="font-mono text-sm">{payment.paymentNumber}</p>
                    </div>
                  </div>

                  {payment.processedBy && (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Processed By</p>
                        <p className="text-sm font-medium">{payment.processedBy.name}</p>
                        <p className="text-xs text-muted-foreground">{payment.processedBy.email}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Created</p>
                      <p className="text-sm">{format(new Date(payment.createdAt), "PPp")}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {/* Method-specific details */}
                  {(payment.method === "CREDIT_CARD" || payment.method === "DEBIT_CARD") && (
                    <>
                      {payment.cardType && (
                        <div>
                          <p className="text-sm text-muted-foreground">Card Type</p>
                          <p className="text-sm font-medium">{payment.cardType}</p>
                        </div>
                      )}
                      {payment.cardLast4 && (
                        <div>
                          <p className="text-sm text-muted-foreground">Card Number</p>
                          <p className="text-sm font-mono">**** **** **** {payment.cardLast4}</p>
                        </div>
                      )}
                      {payment.transactionId && (
                        <div>
                          <p className="text-sm text-muted-foreground">Transaction ID</p>
                          <p className="text-sm font-mono">{payment.transactionId}</p>
                        </div>
                      )}
                      {payment.authorizationCode && (
                        <div>
                          <p className="text-sm text-muted-foreground">Authorization Code</p>
                          <p className="text-sm font-mono">{payment.authorizationCode}</p>
                        </div>
                      )}
                    </>
                  )}

                  {payment.method === "CASH" && (
                    <>
                      {payment.cashTendered && (
                        <div>
                          <p className="text-sm text-muted-foreground">Cash Tendered</p>
                          <p className="text-sm font-medium">${payment.cashTendered.toFixed(2)}</p>
                        </div>
                      )}
                      {payment.changeGiven && (
                        <div>
                          <p className="text-sm text-muted-foreground">Change Given</p>
                          <p className="text-sm font-medium">${payment.changeGiven.toFixed(2)}</p>
                        </div>
                      )}
                    </>
                  )}

                  {payment.method === "CHEQUE" && payment.checkNumber && (
                    <div>
                      <p className="text-sm text-muted-foreground">Check Number</p>
                      <p className="text-sm font-medium">{payment.checkNumber}</p>
                    </div>
                  )}

                  {payment.referenceNumber && (
                    <div>
                      <p className="text-sm text-muted-foreground">Reference Number</p>
                      <p className="text-sm font-mono">{payment.referenceNumber}</p>
                    </div>
                  )}
                </div>
              </div>

              {payment.notes && (
                <>
                  <Separator />
                  <div className="flex items-start gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Notes</p>
                      <p className="text-sm">{payment.notes}</p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {onGenerateReceipt && (
              <Button
                onClick={onGenerateReceipt}
                variant="outline"
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                Generate Receipt
              </Button>
            )}

            {onProcessRefund && payment.status === "COMPLETED" && (
              <Button
                onClick={onProcessRefund}
                variant="outline"
                className="flex-1"
              >
                <RefundIcon className="h-4 w-4 mr-2" />
                Process Refund
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
