"use client"

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Loader2,
  MapPin,
  Package,
  Receipt,
  Truck,
  User,
  AlertCircle,
} from 'lucide-react'
import { DatePicker } from '@/components/ui/date-picker'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { createOrderDelivery } from '@/actions/orders/deliveryActions'
import { useNotifications } from '@/components/notifications/NotificationProvider'
import {
  ORDER_STATUS_COLORS,
  formatCurrency,
  getOrderStatusLabel,
  ExtendedClientOrder
} from '@/types/orders'

interface DeliveryItem {
  orderLineId: string
  itemName: string
  itemSku: string
  orderedQuantity: number
  alreadyDelivered: number
  deliverableQuantity: number
  quantityToDeliver: number
  unitPrice: number
  notes?: string
}

interface OrderDeliveryClientProps {
  order: ExtendedClientOrder
  organizationId: string
  currentUserId: string
}

export function OrderDeliveryClient({
  order,
  organizationId,
  currentUserId,
}: OrderDeliveryClientProps) {
  const router = useRouter()
  const notifications = useNotifications()

  const [isLoading, setIsLoading] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [createdDelivery, setCreatedDelivery] = useState<{ deliveryNumber: string; id: string } | null>(null)

  // Form state
  const [deliveryDate, setDeliveryDate] = useState<Date>(new Date())
  const [deliveryAddress, setDeliveryAddress] = useState(order.customerAddress || '')
  const [recipientName, setRecipientName] = useState(order.customerName)
  const [recipientPhone, setRecipientPhone] = useState(order.customerPhone || '')
  const [deliveryNotes, setDeliveryNotes] = useState('')
  const [deliveryFee, setDeliveryFee] = useState<number>(0)

  // Initialize delivery items
  const [deliveryItems, setDeliveryItems] = useState<DeliveryItem[]>(
    order.orderLines.map(line => {
      const alreadyDelivered = line.deliveredQuantity || 0
      const deliverableQuantity = line.quantity - alreadyDelivered

      return {
        orderLineId: line.id,
        itemName: line.itemName,
        itemSku: line.itemSku,
        orderedQuantity: line.quantity,
        alreadyDelivered,
        deliverableQuantity,
        quantityToDeliver: deliverableQuantity, // Default to deliver all remaining
        unitPrice: line.unitPrice,
        notes: undefined
      }
    }).filter(item => item.deliverableQuantity > 0) // Only show items that can be delivered
  )

  // Calculate delivery summary
  const deliverySummary = useMemo(() => {
    const totalItems = deliveryItems.reduce((sum, item) => sum + item.quantityToDeliver, 0)
    const totalValue = deliveryItems.reduce((sum, item) => sum + (item.quantityToDeliver * item.unitPrice), 0)
    const isPartialDelivery = deliveryItems.some(item => item.quantityToDeliver < item.deliverableQuantity)

    return {
      totalItems,
      totalValue,
      isPartialDelivery
    }
  }, [deliveryItems])

  const handleQuantityChange = (orderLineId: string, quantity: number) => {
    setDeliveryItems(prev => prev.map(item =>
      item.orderLineId === orderLineId
        ? { ...item, quantityToDeliver: Math.max(0, Math.min(quantity, item.deliverableQuantity)) }
        : item
    ))
  }

  const handleSelectAll = () => {
    setDeliveryItems(prev => prev.map(item => ({
      ...item,
      quantityToDeliver: item.deliverableQuantity
    })))
  }

  const handleDeselectAll = () => {
    setDeliveryItems(prev => prev.map(item => ({
      ...item,
      quantityToDeliver: 0
    })))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!recipientName.trim()) {
      notifications.formError(
        "Delivery Creation",
        "Recipient name is required",
        "Please enter the recipient name"
      )
      return
    }

    const itemsToDeliver = deliveryItems.filter(item => item.quantityToDeliver > 0)

    if (itemsToDeliver.length === 0) {
      notifications.formError(
        "Delivery Creation",
        "No items selected",
        "Please select at least one item to deliver"
      )
      return
    }

    if (!deliveryAddress.trim()) {
      notifications.formError(
        "Delivery Creation",
        "Delivery address is required",
        "Please enter the delivery address"
      )
      return
    }

    setIsLoading(true)

    try {
      const deliveryData = {
        orderId: order.id,
        deliveryDate,
        deliveryAddress,
        recipientName,
        recipientPhone: recipientPhone || undefined,
        deliveryNotes: deliveryNotes || undefined,
        deliveryFee,
        isPartialDelivery: deliverySummary.isPartialDelivery,
        organizationId,
        deliveredById: currentUserId,
        deliveryItems: itemsToDeliver.map(item => ({
          orderLineId: item.orderLineId,
          quantityDelivered: item.quantityToDeliver,
          notes: item.notes
        }))
      }

      const result = await createOrderDelivery(deliveryData)

      if (result.success && result.data) {
        notifications.success(
          "Delivery Created",
          `Delivery ${result.data.deliveryNumber} created successfully`
        )

        setCreatedDelivery({
          deliveryNumber: result.data.deliveryNumber,
          id: result.data.id
        })

        setShowSuccessDialog(true)
      } else {
        notifications.formError(
          "Delivery Creation",
          result.error || "Failed to create delivery",
          "Please check the form data and try again"
        )
      }
    } catch (error) {
      console.error('Error creating delivery:', error)
      notifications.formError(
        "Delivery Creation",
        "An unexpected error occurred",
        "Please try again or contact support if the problem persists"
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
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
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 shadow-lg shadow-blue-500/25">
            <Truck className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Create Delivery
            </h1>
            <p className="text-muted-foreground mt-1">
              Create a delivery for Order {order.orderNumber}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Summary */}
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order Number</span>
                  <span className="font-mono font-medium">{order.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Customer</span>
                  <span className="font-medium">{order.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge className={ORDER_STATUS_COLORS[order.status]}>
                    {getOrderStatusLabel(order.status)}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order Total</span>
                  <span className="font-medium">{formatCurrency(order.totalAmount)}</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Existing Deliveries</div>
                {order.deliveries && order.deliveries.length > 0 ? (
                  <div className="space-y-2">
                    {order.deliveries.map((delivery) => (
                      <div key={delivery.id} className="flex justify-between items-center py-2 px-3 bg-muted/50 rounded-lg">
                        <div>
                          <div className="font-mono text-sm">{delivery.deliveryNumber}</div>
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(delivery.deliveryDate), 'MMM dd, yyyy')}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {delivery.deliveryItems?.reduce((sum, item) => sum + item.quantityDelivered, 0)} items
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">No previous deliveries</div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Delivery Details */}
          <Card className="lg:col-span-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-indigo-600" />
                Delivery Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="deliveryDate">Delivery Date *</Label>
                  <DatePicker
                    date={deliveryDate}
                    onDateChange={(date) => date && setDeliveryDate(date)}
                    placeholder="Select delivery date"
                    className="w-full"
                  />
                </div>
                <div>
                  <Label htmlFor="deliveryFee">Delivery Fee</Label>
                  <Input
                    id="deliveryFee"
                    type="number"
                    min="0"
                    step="0.01"
                    value={deliveryFee}
                    onChange={(e) => setDeliveryFee(parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="recipientName">Recipient Name *</Label>
                  <Input
                    id="recipientName"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="Enter recipient name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="recipientPhone">Recipient Phone</Label>
                  <Input
                    id="recipientPhone"
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    placeholder="+1234567890"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="deliveryAddress">Delivery Address *</Label>
                <Textarea
                  id="deliveryAddress"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Enter delivery address"
                  rows={3}
                  required
                />
              </div>

              <div>
                <Label htmlFor="deliveryNotes">Delivery Notes</Label>
                <Textarea
                  id="deliveryNotes"
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  placeholder="Any special delivery instructions..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Items to Deliver */}
          <Card className="lg:col-span-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-indigo-600" />
                  Items to Deliver ({deliveryItems.filter(item => item.quantityToDeliver > 0).length}/{deliveryItems.length})
                </CardTitle>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={handleSelectAll}>
                    Select All
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={handleDeselectAll}>
                    Clear All
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Item</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Ordered</TableHead>
                      <TableHead>Delivered</TableHead>
                      <TableHead>Available</TableHead>
                      <TableHead>Deliver Qty</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead>Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {deliveryItems.map((item) => (
                      <TableRow key={item.orderLineId}>
                        <TableCell>{item.itemName}</TableCell>
                        <TableCell className="font-mono text-sm">{item.itemSku}</TableCell>
                        <TableCell>{item.orderedQuantity}</TableCell>
                        <TableCell>{item.alreadyDelivered}</TableCell>
                        <TableCell className="font-medium">{item.deliverableQuantity}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            max={item.deliverableQuantity}
                            value={item.quantityToDeliver}
                            onChange={(e) => handleQuantityChange(item.orderLineId, parseInt(e.target.value) || 0)}
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(item.quantityToDeliver * item.unitPrice)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Summary */}
          <Card className="lg:col-span-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border shadow-lg">
            <CardHeader>
              <CardTitle>Delivery Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{deliverySummary.totalItems}</div>
                  <div className="text-sm text-muted-foreground">Items to Deliver</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{formatCurrency(deliverySummary.totalValue)}</div>
                  <div className="text-sm text-muted-foreground">Delivery Value</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {deliverySummary.isPartialDelivery ? 'Partial' : 'Complete'}
                  </div>
                  <div className="text-sm text-muted-foreground">Delivery Type</div>
                </div>
              </div>

              {deliveryFee > 0 && (
                <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Delivery Fee</span>
                    <span className="font-bold">{formatCurrency(deliveryFee)}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2 pt-2 border-t">
                    <span className="font-semibold">Total (including fee)</span>
                    <span className="font-bold text-lg">{formatCurrency(deliverySummary.totalValue + deliveryFee)}</span>
                  </div>
                </div>
              )}

              <div className="mt-6 flex justify-between items-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || deliverySummary.totalItems === 0 || !recipientName.trim() || !deliveryAddress.trim()}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating Delivery...
                    </>
                  ) : (
                    <>
                      <Truck className="w-4 h-4 mr-2" />
                      Create Delivery
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>

      {/* Success Dialog */}
      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent className="max-w-lg">
          <AlertDialogHeader>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <AlertDialogTitle className="text-xl">Delivery Created Successfully!</AlertDialogTitle>
                <AlertDialogDescription className="text-muted-foreground">
                  Your delivery has been scheduled and is ready for processing.
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>

          {createdDelivery && (
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 p-6 rounded-lg border">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <span className="font-medium text-muted-foreground">Delivery Number</span>
                    <p className="font-mono font-bold text-lg">{createdDelivery.deliveryNumber}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="font-medium text-muted-foreground">Delivery Date</span>
                    <p className="font-semibold">{format(deliveryDate, 'MMM dd, yyyy')}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="font-medium text-muted-foreground">Items</span>
                    <p className="font-bold text-lg">{deliverySummary.totalItems}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="font-medium text-muted-foreground">Value</span>
                    <p className="font-semibold">{formatCurrency(deliverySummary.totalValue)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                  <Truck className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100">Next Steps:</h4>
                    <ul className="mt-2 space-y-1 text-sm text-blue-800 dark:text-blue-200">
                      <li>• Prepare items for delivery</li>
                      <li>• Coordinate with delivery team</li>
                      <li>• Update delivery status as needed</li>
                      <li>• Confirm delivery completion</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          <AlertDialogFooter className="gap-3">
            <AlertDialogCancel
              onClick={() => {
                setShowSuccessDialog(false)
                // Stay on delivery page for another delivery
              }}
            >
              Create Another
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                router.push(`/dashboard/orders/${order.id}`)
              }}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              View Order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}