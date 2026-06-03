"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  DollarSign,
  FileText,
  Package,
  Plus,
  Receipt,
  User,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { OrderPaymentStatus, OrderPaymentMethod } from '@prisma/client'
import { createOrderPayment } from '@/actions/orders/orderActions'
import { PaymentModal } from './PaymentModal'
import { PaymentFormData } from '@/types/payments'
import { useNotifications } from '@/components/notifications/NotificationProvider'
import {
  PAYMENT_STATUS_COLORS,
  PAYMENT_METHOD_LABELS,
  formatCurrency
} from '@/types/orders'
import { ExtendedClientOrder } from '@/types/orders'

interface OrderPaymentClientProps {
  order: ExtendedClientOrder
  organizationId: string
  userId: string
}

export function OrderPaymentClient({
  order,
  organizationId,
  userId,
}: OrderPaymentClientProps) {
  const router = useRouter()
  const notifications = useNotifications()

  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [orderData, setOrderData] = useState(order)

  // Update order data when the prop changes (after refresh)
  useEffect(() => {
    setOrderData(order)
  }, [order])

  const totalPaid = orderData.payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0
  const balanceAmount = orderData.totalAmount - totalPaid

  const handlePayment = async (paymentData: PaymentFormData) => {
    setIsLoading(true)

    try {
      const result = await createOrderPayment({
        orderId: orderData.id,
        paymentMethod: paymentData.method,
        amount: paymentData.amount,
        reference: paymentData.referenceNumber,
        notes: paymentData.notes,
        isAdvancePayment: balanceAmount > paymentData.amount,
        organizationId,
        processedById: userId
      })

      if (result.success) {
        notifications.success(
          "Payment Processed",
          `Payment of ${formatCurrency(paymentData.amount)} recorded successfully`
        )

        // Update local state with new payment data
        if (result.data) {
          const newPayment = result.data
          setOrderData(prevOrder => {
            const updatedPayments = [...(prevOrder.payments || []), newPayment]
            const newTotalPaid = updatedPayments.reduce((sum, p) => sum + p.amount, 0)

            let newPaymentStatus = prevOrder.paymentStatus
            if (newTotalPaid >= prevOrder.totalAmount) {
              newPaymentStatus = 'FULLY_PAID' as any
            } else if (newTotalPaid > 0) {
              newPaymentStatus = 'PARTIALLY_PAID' as any
            }

            return {
              ...prevOrder,
              payments: updatedPayments,
              paymentStatus: newPaymentStatus,
              balanceAmount: prevOrder.totalAmount - newTotalPaid
            }
          })
        }

        // Also refresh the page to ensure server-side data is updated
        router.refresh()
        setShowPaymentModal(false)
      } else {
        notifications.error(
          "Payment Failed",
          result.error || "Failed to process payment"
        )
      }
    } catch (error) {
      console.error('Error processing payment:', error)
      notifications.error(
        "Payment Error",
        "An unexpected error occurred while processing payment"
      )
    } finally {
      setIsLoading(false)
    }
  }

  const getPaymentStatusBadge = (status: OrderPaymentStatus) => {
    const colorClass = PAYMENT_STATUS_COLORS[status] || 'bg-gray-100 text-gray-700 border-gray-200'
    const label = status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())

    return (
      <Badge variant="outline" className={colorClass}>
        {label}
      </Badge>
    )
  }

  const getPaymentMethodLabel = (method: OrderPaymentMethod) => {
    return PAYMENT_METHOD_LABELS[method] || method
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Order
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 via-emerald-600 to-teal-700 shadow-lg shadow-green-500/25">
              <CreditCard className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Payment Management
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage payments for Order {orderData.orderNumber}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Summary */}
          <Card className="lg:col-span-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600" />
                Order Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Order Number</div>
                  <div className="font-mono font-medium">{orderData.orderNumber}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Customer</div>
                  <div className="font-medium">{orderData.customerName}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Order Date</div>
                  <div>{format(new Date(orderData.orderDate), 'MMM d, yyyy')}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Payment Status</div>
                  <div>{getPaymentStatusBadge(orderData.paymentStatus)}</div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Order Items</div>
                <div className="space-y-2">
                  {orderData.orderLines.map((line) => (
                    <div key={line.id} className="flex justify-between items-center py-2 px-3 bg-muted/50 rounded-lg">
                      <div>
                        <div className="font-medium">{line.itemName}</div>
                        <div className="text-sm text-muted-foreground">SKU: {line.itemSku}</div>
                      </div>
                      <div className="text-right">
                        <div>{line.quantity} × {formatCurrency(line.unitPrice)}</div>
                        <div className="font-medium">{formatCurrency(line.subtotal)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Summary */}
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                Payment Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order Total</span>
                  <span className="font-medium">{formatCurrency(orderData.totalAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Paid</span>
                  <span className="font-medium text-green-600">{formatCurrency(totalPaid)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Balance Due</span>
                  <span className={balanceAmount > 0 ? 'text-orange-600' : 'text-green-600'}>
                    {formatCurrency(balanceAmount)}
                  </span>
                </div>
              </div>

              <Separator />

              {balanceAmount > 0 && (
                <Button
                  onClick={() => setShowPaymentModal(true)}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Payment
                </Button>
              )}

              {balanceAmount <= 0 && (
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="text-green-800 dark:text-green-200 font-medium">
                    Order Fully Paid
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment History */}
          <Card className="lg:col-span-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-purple-600" />
                Payment History ({orderData.payments?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {orderData.payments && orderData.payments.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Payment #</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Reference</TableHead>
                        <TableHead>Processed By</TableHead>
                        <TableHead>Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orderData.payments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell className="font-mono font-medium">
                            {payment.paymentNumber}
                          </TableCell>
                          <TableCell>
                            {format(new Date(payment.paymentDate), 'MMM d, yyyy h:mm a')}
                          </TableCell>
                          <TableCell>
                            {getPaymentMethodLabel(payment.paymentMethod)}
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatCurrency(payment.amount)}
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {payment.reference || '-'}
                          </TableCell>
                          <TableCell>
                            {payment.processedBy?.name || 'System'}
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {payment.notes || '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Receipt className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-muted-foreground mb-2">No payments recorded</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    No payments have been made for this order yet
                  </p>
                  {balanceAmount > 0 && (
                    <Button onClick={() => setShowPaymentModal(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Record First Payment
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Payment Modal */}
        <PaymentModal
          open={showPaymentModal}
          onOpenChange={setShowPaymentModal}
          orderTotal={orderData.totalAmount}
          paidAmount={totalPaid}
          orderNumber={orderData.orderNumber}
          customerName={orderData.customerName}
          onSubmit={handlePayment}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}