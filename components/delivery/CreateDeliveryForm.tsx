"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Package,
  MapPin,
  User,
  Calendar,
  Clock,
  Truck,
  FileText,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Search
} from 'lucide-react'
import { DatePicker } from '@/components/ui/date-picker'
import {
  DeliveryPriority,
  DeliveryVehicleType,
  CreateDeliveryFormData
} from '@/types/delivery'
import { createComprehensiveDelivery } from '@/actions/delivery/deliverySystemActions'
import { getOrders } from '@/actions/orders/orderActions'
import { useNotifications } from '@/components/notifications/NotificationProvider'

interface CreateDeliveryFormProps {
  organizationId: string
  currentUserId: string
  orderId?: string
  onDeliveryCreated?: (deliveryId: string) => void
  onCancel?: () => void
}

interface OrderForDelivery {
  id: string
  orderNumber: string
  customerName: string
  customerPhone?: string
  customerAddress?: string
  orderLines: {
    id: string
    itemName: string
    itemSku: string
    quantity: number
    deliveredQuantity: number
    unitPrice: number
  }[]
}

export function CreateDeliveryForm({
  organizationId,
  currentUserId,
  orderId,
  onDeliveryCreated,
  onCancel
}: CreateDeliveryFormProps) {
  const notifications = useNotifications()

  // State management
  const [isLoading, setIsLoading] = useState(false)
  const [orders, setOrders] = useState<OrderForDelivery[]>([])
  const [selectedOrder, setSelectedOrder] = useState<OrderForDelivery | null>(null)
  const [showOrderSearch, setShowOrderSearch] = useState(!orderId)

  // Form data
  const [deliveryDate, setDeliveryDate] = useState<Date>(new Date())
  const [estimatedDeliveryTime, setEstimatedDeliveryTime] = useState<Date | undefined>()
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [recipientName, setRecipientName] = useState('')
  const [recipientPhone, setRecipientPhone] = useState('')
  const [deliveryNotes, setDeliveryNotes] = useState('')
  const [priority, setPriority] = useState<DeliveryPriority>(DeliveryPriority.MEDIUM)
  const [specialInstructions, setSpecialInstructions] = useState('')
  const [requiresSignature, setRequiresSignature] = useState(false)
  const [requiresProofOfDelivery, setRequiresProofOfDelivery] = useState(false)
  const [vehicleType, setVehicleType] = useState<DeliveryVehicleType | undefined>()

  // Delivery items state
  const [deliveryItems, setDeliveryItems] = useState<{
    orderLineId: string
    quantityToDeliver: number
    specialHandling?: string
    notes?: string
  }[]>([])

  // Load orders
  useEffect(() => {
    const loadOrders = async () => {
      try {
        const result = await getOrders(organizationId, {
          status: 'CONFIRMED' // Only confirmed orders can be delivered
        })

        if (result.success && result.data) {
          const ordersForDelivery: OrderForDelivery[] = ((result.data ?? []) as OrderForDelivery[])
            .filter((order: OrderForDelivery) =>
              order.orderLines.some((line: OrderForDelivery["orderLines"][number]) => line.quantity > line.deliveredQuantity)
            )
            .map((order: OrderForDelivery): OrderForDelivery => ({
              id: order.id,
              orderNumber: order.orderNumber,
              customerName: order.customerName,
              customerPhone: order.customerPhone,
              customerAddress: order.customerAddress,
              orderLines: order.orderLines
                .filter((line: OrderForDelivery["orderLines"][number]) => line.quantity > line.deliveredQuantity)
                .map((line: OrderForDelivery["orderLines"][number]) => ({
                  id: line.id,
                  itemName: line.itemName,
                  itemSku: line.itemSku,
                  quantity: line.quantity,
                  deliveredQuantity: line.deliveredQuantity,
                  unitPrice: line.unitPrice
                }))
            }))

          setOrders(ordersForDelivery)

          // Auto-select order if orderId provided
          if (orderId) {
            const order = ordersForDelivery.find((o: OrderForDelivery) => o.id === orderId)
            if (order) {
              handleOrderSelect(order)
            }
          }
        }
      } catch (error) {
        console.error('Error loading orders:', error)
        notifications.error('Loading Error', 'Failed to load orders')
      }
    }

    loadOrders()
  }, [organizationId, orderId])

  const handleOrderSelect = (order: OrderForDelivery) => {
    setSelectedOrder(order)
    setRecipientName(order.customerName)
    setRecipientPhone(order.customerPhone || '')
    setDeliveryAddress(order.customerAddress || '')

    // Initialize delivery items with remaining quantities
    const items = order.orderLines.map(line => ({
      orderLineId: line.id,
      quantityToDeliver: line.quantity - line.deliveredQuantity,
      specialHandling: undefined,
      notes: undefined
    }))
    setDeliveryItems(items)
    setShowOrderSearch(false)
  }

  const handleQuantityChange = (orderLineId: string, quantity: number) => {
    setDeliveryItems(prev => prev.map(item =>
      item.orderLineId === orderLineId
        ? { ...item, quantityToDeliver: Math.max(0, quantity) }
        : item
    ))
  }

  const handleItemNotesChange = (orderLineId: string, notes: string) => {
    setDeliveryItems(prev => prev.map(item =>
      item.orderLineId === orderLineId
        ? { ...item, notes }
        : item
    ))
  }

  const handleSpecialHandlingChange = (orderLineId: string, handling: string) => {
    setDeliveryItems(prev => prev.map(item =>
      item.orderLineId === orderLineId
        ? { ...item, specialHandling: handling }
        : item
    ))
  }

  const handleSubmit = async () => {
    if (!selectedOrder) {
      notifications.formError('Delivery Creation', 'Order required', 'Please select an order')
      return
    }

    if (!deliveryAddress.trim()) {
      notifications.formError('Delivery Creation', 'Address required', 'Please enter a delivery address')
      return
    }

    if (!recipientName.trim()) {
      notifications.formError('Delivery Creation', 'Recipient required', 'Please enter recipient name')
      return
    }

    if (deliveryItems.length === 0 || deliveryItems.every(item => item.quantityToDeliver === 0)) {
      notifications.formError('Delivery Creation', 'Items required', 'Please select items to deliver')
      return
    }

    try {
      setIsLoading(true)

      const deliveryData: CreateDeliveryFormData = {
        orderId: selectedOrder.id,
        deliveryDate,
        deliveryAddress: deliveryAddress.trim(),
        recipientName: recipientName.trim(),
        recipientPhone: recipientPhone.trim(),
        deliveryNotes,
        priority,
        estimatedDeliveryTime,
        specialInstructions,
        requiresSignature,
        requiresProofOfDelivery,
        vehicleType,
        deliveryItems: deliveryItems.filter(item => item.quantityToDeliver > 0)
      }

      const result = await createComprehensiveDelivery(
        deliveryData,
        organizationId,
        currentUserId
      )

      if (result.success && result.data) {
        notifications.success(
          'Delivery Created',
          `Delivery ${result.data.deliveryNumber} created successfully`
        )

        if (onDeliveryCreated) {
          onDeliveryCreated(result.data.id)
        }
      } else {
        notifications.error('Creation Failed', result.error || 'Failed to create delivery')
      }
    } catch (error) {
      console.error('Error creating delivery:', error)
      notifications.error('Creation Error', 'An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const getTotalItems = () => {
    return deliveryItems.reduce((sum, item) => sum + item.quantityToDeliver, 0)
  }

  const getTotalValue = () => {
    if (!selectedOrder) return 0
    return deliveryItems.reduce((sum, item) => {
      const orderLine = selectedOrder.orderLines.find(line => line.id === item.orderLineId)
      return sum + (orderLine ? orderLine.unitPrice * item.quantityToDeliver : 0)
    }, 0)
  }

  if (showOrderSearch) {
    return (
      <Dialog open onOpenChange={() => onCancel?.()}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Select Order for Delivery</DialogTitle>
            <DialogDescription>
              Choose an order to create a delivery for
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                className="pl-8"
              />
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Pending Delivery</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-sm">{order.orderNumber}</TableCell>
                      <TableCell>{order.customerName}</TableCell>
                      <TableCell>{order.orderLines.length} items</TableCell>
                      <TableCell>
                        {order.orderLines.reduce((sum, line) =>
                          sum + (line.quantity - line.deliveredQuantity), 0
                        )} items
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={() => handleOrderSelect(order)}
                        >
                          Select
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {orders.length === 0 && (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Orders Available</h3>
                <p className="text-muted-foreground">
                  No confirmed orders with pending deliveries found.
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="w-5 h-5" />
            Create Delivery
          </CardTitle>
          <CardDescription>
            Create a new delivery for order {selectedOrder?.orderNumber}
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Delivery Information */}
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Delivery Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Delivery Date *</Label>
                <DatePicker
                  date={deliveryDate}
                  onDateChange={(date) => date && setDeliveryDate(date)}
                  placeholder="Select delivery date"
                  minDate={new Date()}
                />
              </div>
              <div>
                <Label>Estimated Time</Label>
                <DatePicker
                  date={estimatedDeliveryTime}
                  onDateChange={setEstimatedDeliveryTime}
                  placeholder="Select estimated time"
                  showTimeSelect
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Delivery Address *</Label>
              <Textarea
                id="address"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="Enter complete delivery address"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="recipient">Recipient Name *</Label>
                <Input
                  id="recipient"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Name of recipient"
                />
              </div>
              <div>
                <Label htmlFor="phone">Recipient Phone</Label>
                <Input
                  id="phone"
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  placeholder="Phone number"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Options */}
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Delivery Options
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Priority</Label>
                <Select value={priority} onValueChange={(value) => setPriority(value as DeliveryPriority)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(DeliveryPriority).map((p) => (
                      <SelectItem key={p} value={p}>
                        {p.charAt(0) + p.slice(1).toLowerCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Vehicle Type</Label>
                <Select value={vehicleType || ''} onValueChange={(value) => setVehicleType(value as DeliveryVehicleType)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select vehicle type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(DeliveryVehicleType).map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0) + type.slice(1).toLowerCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Delivery Notes</Label>
              <Textarea
                id="notes"
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                placeholder="Any special delivery instructions..."
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="instructions">Special Instructions</Label>
              <Textarea
                id="instructions"
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="Special handling or delivery instructions..."
                rows={2}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="signature"
                  checked={requiresSignature}
                  onCheckedChange={(checked) => setRequiresSignature(checked === true)}
                />
                <Label htmlFor="signature">Requires recipient signature</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="proof"
                  checked={requiresProofOfDelivery}
                  onCheckedChange={(checked) => setRequiresProofOfDelivery(checked === true)}
                />
                <Label htmlFor="proof">Requires proof of delivery</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Items */}
        <Card className="lg:col-span-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Items to Deliver
              </CardTitle>
              <div className="text-sm text-muted-foreground">
                {getTotalItems()} items • ${getTotalValue().toFixed(2)} total value
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {selectedOrder && selectedOrder.orderLines.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Item</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Ordered</TableHead>
                      <TableHead>Delivered</TableHead>
                      <TableHead>Remaining</TableHead>
                      <TableHead>To Deliver</TableHead>
                      <TableHead>Special Handling</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedOrder.orderLines.map((line) => {
                      const deliveryItem = deliveryItems.find(item => item.orderLineId === line.id)
                      const remaining = line.quantity - line.deliveredQuantity

                      return (
                        <TableRow key={line.id}>
                          <TableCell className="font-medium">{line.itemName}</TableCell>
                          <TableCell className="font-mono text-sm">{line.itemSku}</TableCell>
                          <TableCell>{line.quantity}</TableCell>
                          <TableCell>{line.deliveredQuantity}</TableCell>
                          <TableCell className="font-medium">{remaining}</TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              max={remaining}
                              value={deliveryItem?.quantityToDeliver || 0}
                              onChange={(e) => handleQuantityChange(line.id, parseInt(e.target.value) || 0)}
                              className="w-20"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              placeholder="Special handling..."
                              value={deliveryItem?.specialHandling || ''}
                              onChange={(e) => handleSpecialHandlingChange(line.id, e.target.value)}
                              className="w-32"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              placeholder="Item notes..."
                              value={deliveryItem?.notes || ''}
                              onChange={(e) => handleItemNotesChange(line.id, e.target.value)}
                              className="w-32"
                            />
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Items</h3>
                <p className="text-muted-foreground">
                  No items available for delivery.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <Card className="lg:col-span-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-lg">Create Delivery</h3>
                <p className="text-muted-foreground">
                  {getTotalItems()} items • Total value: ${getTotalValue().toFixed(2)}
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={onCancel} disabled={isLoading}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading || getTotalItems() === 0}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Create Delivery
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
