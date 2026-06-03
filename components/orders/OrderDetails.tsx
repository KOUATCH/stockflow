"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  Edit,
  FileText,
  History,
  MapPin,
  Package,
  Phone,
  Receipt,
  Truck,
  User,
  Mail,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import {
  ExtendedClientOrder,
  ORDER_STATUS_COLORS,
  PAYMENT_STATUS_COLORS,
  formatCurrency,
  formatOrderNumber,
  getOrderStatusLabel,
  getPaymentStatusLabel,
  calculateOrderProgress,
  PAYMENT_METHOD_LABELS,
  DELIVERY_METHOD_LABELS,
  ORDER_TYPE_LABELS
} from '@/types/orders'
import Link from 'next/link'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'

interface OrderDetailsProps {
  order: ExtendedClientOrder
  organizationId: string
  currentUserId: string
}

export function OrderDetails({ order, organizationId, currentUserId }: OrderDetailsProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')

  const formatDate = (date: Date | string) => {
    return format(new Date(date), 'MMM dd, yyyy HH:mm')
  }

  const formatDateOnly = (date: Date | string) => {
    return format(new Date(date), 'MMM dd, yyyy')
  }

  const totalAdvancePayments = order.payments.filter(p => p.isAdvancePayment).reduce((sum, p) => sum + p.amount, 0)
  const totalBalancePayments = order.payments.filter(p => !p.isAdvancePayment).reduce((sum, p) => sum + p.amount, 0)
  const totalPaid = order.payments.reduce((sum, p) => sum + p.amount, 0)
  const progress = calculateOrderProgress(order)

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
              Back to Orders
            </Button>
          </div>

          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-700 shadow-lg shadow-indigo-500/25">
                <Receipt className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {formatOrderNumber(order.orderNumber)}
                </h1>
                <p className="text-muted-foreground mt-1">
                  Order for {order.customerName} • {formatDateOnly(order.orderDate)}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Badge className={ORDER_STATUS_COLORS[order.status]} variant="outline">
                {getOrderStatusLabel(order.status)}
              </Badge>
              <Badge className={PAYMENT_STATUS_COLORS[order.paymentStatus]} variant="outline">
                {getPaymentStatusLabel(order.paymentStatus)}
              </Badge>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                    <p className="text-2xl font-bold text-foreground">{formatCurrency(order.totalAmount)}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Amount Paid</p>
                    <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalPaid)}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg">
                    <CreditCard className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Balance Due</p>
                    <p className="text-2xl font-bold text-red-600">{formatCurrency(order.balanceAmount)}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 shadow-lg">
                    <AlertCircle className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Progress</p>
                    <p className="text-2xl font-bold text-indigo-600">{progress}%</p>
                  </div>
                  <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <TabsList className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="items">Items ({order.orderLines.length})</TabsTrigger>
              <TabsTrigger value="payments">Payments ({order.payments.length})</TabsTrigger>
              <TabsTrigger value="deliveries">Deliveries ({order.deliveries?.length || 0})</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <div className="flex gap-3 flex-wrap">
              {order.balanceAmount > 0 && (
                <Link href={`/dashboard/orders/${order.id}/payment`}>
                  <Button variant="outline">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Add Payment
                  </Button>
                </Link>
              )}
              {['CONFIRMED', 'PROCESSING', 'READY_FOR_PICKUP', 'PARTIALLY_DELIVERED'].includes(order.status) && (
                <Link href={`/dashboard/orders/${order.id}/delivery`}>
                  <Button variant="outline">
                    <Truck className="w-4 h-4 mr-2" />
                    Create Delivery
                  </Button>
                </Link>
              )}
              {['DRAFT', 'PENDING'].includes(order.status) && (
                <Link href={`/dashboard/orders/${order.id}/edit`}>
                  <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Order
                  </Button>
                </Link>
              )}
              <Button variant="outline" onClick={() => window.print()}>
                <FileText className="w-4 h-4 mr-2" />
                Print Order
              </Button>
            </div>
          </div>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Customer Information */}
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5 text-indigo-600" />
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="font-semibold text-lg">{order.customerName}</p>
                  </div>
                  {order.customerEmail && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <p className="text-sm">{order.customerEmail}</p>
                    </div>
                  )}
                  {order.customerPhone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <p className="text-sm">{order.customerPhone}</p>
                    </div>
                  )}
                  {order.customerAddress && (
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <p className="text-sm">{order.customerAddress}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Order Information */}
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-indigo-600" />
                    Order Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Order Type:</span>
                    <Badge variant="outline">{ORDER_TYPE_LABELS[order.orderType]}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery Method:</span>
                    <Badge variant="outline">{DELIVERY_METHOD_LABELS[order.deliveryMethod]}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Order Date:</span>
                    <span className="font-medium">{formatDate(order.orderDate)}</span>
                  </div>
                  {order.expectedDate && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Expected Date:</span>
                      <span className="font-medium">{formatDate(order.expectedDate)}</span>
                    </div>
                  )}
                  {order.completedDate && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Completed Date:</span>
                      <span className="font-medium">{formatDate(order.completedDate)}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Payment Summary */}
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-indigo-600" />
                    Payment Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span className="font-medium">{formatCurrency(order.subtotal)}</span>
                  </div>
                  {order.taxAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tax:</span>
                      <span className="font-medium">{formatCurrency(order.taxAmount)}</span>
                    </div>
                  )}
                  {order.discountAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Discount:</span>
                      <span className="font-medium text-green-600">-{formatCurrency(order.discountAmount)}</span>
                    </div>
                  )}
                  {order.shippingAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping:</span>
                      <span className="font-medium">{formatCurrency(order.shippingAmount)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>{formatCurrency(order.totalAmount)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-blue-600">
                    <span>Advance Paid:</span>
                    <span className="font-medium">{formatCurrency(totalAdvancePayments)}</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>Balance Paid:</span>
                    <span className="font-medium">{formatCurrency(totalBalancePayments)}</span>
                  </div>
                  <div className="flex justify-between text-red-600 font-medium">
                    <span>Amount Due:</span>
                    <span>{formatCurrency(order.balanceAmount)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Notes and Instructions */}
            {(order.notes || order.specialInstructions || order.internalNotes) && (
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-indigo-600" />
                    Notes & Instructions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {order.notes && (
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground mb-2">Customer Notes:</h4>
                      <p className="text-sm bg-muted/50 p-3 rounded-lg">{order.notes}</p>
                    </div>
                  )}
                  {order.specialInstructions && (
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground mb-2">Special Instructions:</h4>
                      <p className="text-sm bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800">
                        {order.specialInstructions}
                      </p>
                    </div>
                  )}
                  {order.internalNotes && (
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground mb-2">Internal Notes:</h4>
                      <p className="text-sm bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                        {order.internalNotes}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="items" className="space-y-6">
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-indigo-600" />
                  Order Items
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="font-semibold">Item</TableHead>
                        <TableHead className="font-semibold">SKU</TableHead>
                        <TableHead className="font-semibold">Qty</TableHead>
                        <TableHead className="font-semibold">Unit Price</TableHead>
                        <TableHead className="font-semibold">Total</TableHead>
                        <TableHead className="font-semibold">Delivered</TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {order.orderLines.map((line) => (
                        <TableRow key={line.id} className="hover:bg-muted/50">
                          <TableCell>
                            <div className="font-medium">{line.itemName}</div>
                            {line.notes && (
                              <div className="text-sm text-muted-foreground mt-1">{line.notes}</div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="font-mono text-sm">{line.itemSku}</div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{line.quantity}</div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{formatCurrency(line.unitPrice)}</div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{formatCurrency(line.totalAmount)}</div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{line.deliveredQuantity}</div>
                          </TableCell>
                          <TableCell>
                            {line.deliveredQuantity >= line.quantity ? (
                              <Badge className="bg-green-100 text-green-700 border-green-200">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Delivered
                              </Badge>
                            ) : line.deliveredQuantity > 0 ? (
                              <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
                                <Clock className="w-3 h-3 mr-1" />
                                Partial
                              </Badge>
                            ) : (
                              <Badge className="bg-gray-100 text-gray-700 border-gray-200">
                                <Package className="w-3 h-3 mr-1" />
                                Pending
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-indigo-600" />
                    Payment History
                  </CardTitle>
                  <Link href={`/dashboard/orders/${order.id}/payment`}>
                    <Button size="sm">
                      Add Payment
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {order.payments.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="font-semibold">Payment #</TableHead>
                          <TableHead className="font-semibold">Date</TableHead>
                          <TableHead className="font-semibold">Method</TableHead>
                          <TableHead className="font-semibold">Type</TableHead>
                          <TableHead className="font-semibold">Amount</TableHead>
                          <TableHead className="font-semibold">Reference</TableHead>
                          <TableHead className="font-semibold">Processed By</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {order.payments.map((payment) => (
                          <TableRow key={payment.id} className="hover:bg-muted/50">
                            <TableCell>
                              <div className="font-mono text-sm font-medium">{payment.paymentNumber}</div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">{formatDate(payment.paymentDate)}</div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {PAYMENT_METHOD_LABELS[payment.paymentMethod]}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={payment.isAdvancePayment
                                ? "bg-blue-100 text-blue-700 border-blue-200"
                                : "bg-green-100 text-green-700 border-green-200"
                              }>
                                {payment.isAdvancePayment ? "Advance" : "Balance"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">{formatCurrency(payment.amount)}</div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm text-muted-foreground">
                                {payment.reference || "N/A"}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">{payment.processedBy.name || payment.processedBy.email}</div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-muted-foreground mb-2">No payments yet</h3>
                    <p className="text-sm text-muted-foreground mb-6">
                      Add the first payment to start tracking payment history
                    </p>
                    <Link href={`/dashboard/orders/${order.id}/payment`}>
                      <Button>
                        <CreditCard className="w-4 h-4 mr-2" />
                        Add Payment
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="deliveries" className="space-y-6">
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="w-5 h-5 text-indigo-600" />
                    Delivery History
                  </CardTitle>
                  <Link href={`/dashboard/orders/${order.id}/delivery`}>
                    <Button size="sm">
                      Create Delivery
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {order.deliveries && order.deliveries.length > 0 ? (
                  <div className="space-y-6">
                    {order.deliveries.map((delivery) => (
                      <Card key={delivery.id} className="border">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{delivery.deliveryNumber}</CardTitle>
                            <Badge className={delivery.isPartialDelivery
                              ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                              : "bg-green-100 text-green-700 border-green-200"
                            }>
                              {delivery.isPartialDelivery ? "Partial Delivery" : "Full Delivery"}
                            </Badge>
                          </div>
                          <CardDescription>
                            Delivered on {formatDate(delivery.deliveryDate)} by {delivery.deliveredBy.name || delivery.deliveredBy.email}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            {delivery.deliveryAddress && (
                              <div>
                                <p className="text-sm font-medium text-muted-foreground mb-1">Delivery Address:</p>
                                <p className="text-sm">{delivery.deliveryAddress}</p>
                              </div>
                            )}
                            {delivery.recipientName && (
                              <div>
                                <p className="text-sm font-medium text-muted-foreground mb-1">Recipient:</p>
                                <p className="text-sm">{delivery.recipientName}</p>
                                {delivery.recipientPhone && (
                                  <p className="text-sm text-muted-foreground">{delivery.recipientPhone}</p>
                                )}
                              </div>
                            )}
                          </div>

                          {delivery.deliveryItems.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium text-muted-foreground mb-2">Delivered Items:</h4>
                              <div className="space-y-2">
                                {delivery.deliveryItems.map((item) => (
                                  <div key={item.id} className="flex justify-between items-center text-sm bg-muted/50 p-2 rounded">
                                    <span>{item.orderLine.item.name}</span>
                                    <span className="font-medium">Qty: {item.quantityDelivered}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {delivery.deliveryNotes && (
                            <div className="mt-4">
                              <p className="text-sm font-medium text-muted-foreground mb-1">Delivery Notes:</p>
                              <p className="text-sm bg-muted/50 p-2 rounded">{delivery.deliveryNotes}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Truck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-muted-foreground mb-2">No deliveries yet</h3>
                    <p className="text-sm text-muted-foreground mb-6">
                      Create the first delivery to start tracking delivery history
                    </p>
                    <Link href={`/dashboard/orders/${order.id}/delivery`}>
                      <Button>
                        <Truck className="w-4 h-4 mr-2" />
                        Create Delivery
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5 text-indigo-600" />
                  Order History
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="p-6">
                  <div className="space-y-4">
                    {order.statusHistory.map((history, index) => (
                      <div key={history.id} className="flex items-start gap-4">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          index === 0 ? 'bg-indigo-600' : 'bg-muted-foreground'
                        }`} />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-medium">
                              {history.fromStatus ? (
                                `Changed from ${getOrderStatusLabel(history.fromStatus)} to ${getOrderStatusLabel(history.toStatus)}`
                              ) : (
                                `Order ${getOrderStatusLabel(history.toStatus)}`
                              )}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(history.changedAt)}
                            </p>
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">
                            By: {history.changedBy.name || history.changedBy.email}
                          </p>
                          {history.reason && (
                            <p className="text-sm text-muted-foreground">
                              Reason: {history.reason}
                            </p>
                          )}
                          {history.notes && (
                            <p className="text-sm bg-muted/50 p-2 rounded mt-2">
                              {history.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}