"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
  Edit,
  Loader2,
  Package,
  Plus,
  Receipt,
  Search,
  Trash2,
  User,
  X,
  Save,
  AlertCircle
} from 'lucide-react'
import { DatePicker } from '@/components/ui/date-picker'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { OrderType, DeliveryMethod } from '@/types/orders'
import { updateOrder } from '@/actions/orders/updateOrderActions'
import { useNotifications } from '@/components/notifications/NotificationProvider'
import {
  ORDER_TYPE_LABELS,
  DELIVERY_METHOD_LABELS,
  formatCurrency,
  ExtendedClientOrder
} from '@/types/orders'

interface Customer {
  id: string
  name: string
  email?: string
  phone?: string
  address?: string
}

interface Item {
  id: string
  name: string
  sku: string
  sellingPrice: number
  quantityOnHand?: number
}

interface OrderLine {
  id: string
  itemId: string
  itemName: string
  itemSku: string
  unitPrice: number
  quantity: number
  subtotal: number
  notes?: string
  specialRequirements?: string
}

interface EditOrderClientProps {
  order: ExtendedClientOrder
  customers: Customer[]
  items: Item[]
  organizationId: string
  currentUserId: string
}

export function EditOrderClient({
  order,
  customers,
  items,
  organizationId,
  currentUserId,
}: EditOrderClientProps) {
  const router = useRouter()
  const notifications = useNotifications()

  const [isLoading, setIsLoading] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [showUnsavedChangesDialog, setShowUnsavedChangesDialog] = useState(false)
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null)

  // Form state
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    customers.find(c => c.id === order.customerId) || null
  )
  const [customerName, setCustomerName] = useState(order.customerName)
  const [customerEmail, setCustomerEmail] = useState(order.customerEmail || '')
  const [customerPhone, setCustomerPhone] = useState(order.customerPhone || '')
  const [customerAddress, setCustomerAddress] = useState(order.customerAddress || '')
  const [orderType, setOrderType] = useState<OrderType>(order.orderType)
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>(order.deliveryMethod)
  const [expectedDate, setExpectedDate] = useState<Date | undefined>(
    order.expectedDate ? new Date(order.expectedDate) : undefined
  )
  const [notes, setNotes] = useState(order.notes || '')
  const [specialInstructions, setSpecialInstructions] = useState(order.specialInstructions || '')

  // Order lines state
  const [orderLines, setOrderLines] = useState<OrderLine[]>(
    order.orderLines.map(line => ({
      id: line.id,
      itemId: line.itemId,
      itemName: line.itemName,
      itemSku: line.itemSku,
      unitPrice: line.unitPrice,
      quantity: line.quantity,
      subtotal: line.subtotal,
      notes: line.notes || undefined,
      specialRequirements: line.specialRequirements || undefined
    }))
  )

  // Dialog states
  const [showCustomerDialog, setShowCustomerDialog] = useState(false)
  const [showItemDialog, setShowItemDialog] = useState(false)
  const [customerSearch, setCustomerSearch] = useState('')
  const [itemSearch, setItemSearch] = useState('')

  // Track changes for unsaved warning
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Calculate subtotal
  const subtotal = orderLines.reduce((sum, line) => sum + line.subtotal, 0)

  // Track form changes
  useEffect(() => {
    const hasChanges =
      customerName !== order.customerName ||
      customerEmail !== (order.customerEmail || '') ||
      customerPhone !== (order.customerPhone || '') ||
      customerAddress !== (order.customerAddress || '') ||
      orderType !== order.orderType ||
      deliveryMethod !== order.deliveryMethod ||
      expectedDate?.getTime() !== (order.expectedDate ? new Date(order.expectedDate).getTime() : undefined) ||
      notes !== (order.notes || '') ||
      specialInstructions !== (order.specialInstructions || '') ||
      JSON.stringify(orderLines) !== JSON.stringify(order.orderLines.map(line => ({
        id: line.id,
        itemId: line.itemId,
        itemName: line.itemName,
        itemSku: line.itemSku,
        unitPrice: line.unitPrice,
        quantity: line.quantity,
        subtotal: line.subtotal,
        notes: line.notes || undefined,
        specialRequirements: line.specialRequirements || undefined
      })))

    setHasUnsavedChanges(hasChanges)
  }, [customerName, customerEmail, customerPhone, customerAddress, orderType, deliveryMethod, expectedDate, notes, specialInstructions, orderLines, order])

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer)
    setCustomerName(customer.name)
    setCustomerEmail(customer.email || '')
    setCustomerPhone(customer.phone || '')
    setCustomerAddress(customer.address || '')
    setShowCustomerDialog(false)
  }

  const handleAddItem = (item: Item) => {
    const existingLine = orderLines.find(line => line.itemId === item.id)

    if (existingLine) {
      setOrderLines(prev => prev.map(line =>
        line.itemId === item.id
          ? {
              ...line,
              quantity: line.quantity + 1,
              subtotal: Math.round((line.quantity + 1) * line.unitPrice * 100) / 100
            }
          : line
      ))
    } else {
      const roundedPrice = Math.round(item.sellingPrice * 100) / 100
      const newLine: OrderLine = {
        id: `new-${Math.random().toString(36).substr(2, 9)}`,
        itemId: item.id,
        itemName: item.name,
        itemSku: item.sku,
        unitPrice: roundedPrice,
        quantity: 1,
        subtotal: roundedPrice
      }
      setOrderLines(prev => [...prev, newLine])
    }

    setShowItemDialog(false)
  }

  const handleQuantityChange = (lineId: string, quantity: number) => {
    if (isNaN(quantity) || quantity <= 0) return

    setOrderLines(prev => prev.map(line =>
      line.id === lineId
        ? {
            ...line,
            quantity,
            subtotal: Math.round(quantity * line.unitPrice * 100) / 100
          }
        : line
    ))
  }

  const handlePriceChange = (lineId: string, price: number) => {
    if (isNaN(price) || price < 0) return

    const roundedPrice = Math.round(price * 100) / 100

    setOrderLines(prev => prev.map(line =>
      line.id === lineId
        ? {
            ...line,
            unitPrice: roundedPrice,
            subtotal: Math.round(line.quantity * roundedPrice * 100) / 100
          }
        : line
    ))
  }

  const handleRemoveLine = (lineId: string) => {
    setOrderLines(prev => prev.filter(line => line.id !== lineId))
  }

  const handleNavigateWithUnsavedCheck = (path: string) => {
    if (hasUnsavedChanges) {
      setPendingNavigation(path)
      setShowUnsavedChangesDialog(true)
    } else {
      router.push(path)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!customerName.trim()) {
      notifications.formError(
        "Order Update",
        "Customer name is required",
        "Please enter a customer name to continue"
      )
      return
    }

    if (orderLines.length === 0) {
      notifications.formError(
        "Order Update",
        "At least one item is required",
        "Please add items to the order before updating"
      )
      return
    }

    // Validate order lines for valid prices and quantities
    const invalidLines = orderLines.filter(line =>
      isNaN(line.unitPrice) || line.unitPrice < 0 ||
      isNaN(line.quantity) || line.quantity <= 0 ||
      isNaN(line.subtotal) || line.subtotal < 0
    )

    if (invalidLines.length > 0) {
      notifications.formError(
        "Order Update",
        "Invalid item details",
        "Please ensure all items have valid quantities and prices before updating the order"
      )
      return
    }

    setIsLoading(true)

    try {
      const orderData = {
        id: order.id,
        customerId: selectedCustomer?.id || null,
        customerName,
        customerEmail: customerEmail || undefined,
        customerPhone: customerPhone || undefined,
        customerAddress: customerAddress || undefined,
        orderType,
        deliveryMethod,
        expectedDate: expectedDate || undefined,
        notes: notes || undefined,
        specialInstructions: specialInstructions || undefined,
        organizationId,
        updatedById: currentUserId,
        orderLines: orderLines.map(line => ({
          id: line.id.startsWith('new-') ? undefined : line.id,
          itemId: line.itemId,
          itemName: line.itemName,
          itemSku: line.itemSku,
          unitPrice: line.unitPrice,
          quantity: line.quantity,
          notes: line.notes,
          specialRequirements: line.specialRequirements
        }))
      }

      const result = await updateOrder(orderData)

      if (result.success) {
        notifications.success(
          "Order Updated",
          `Order ${order.orderNumber} has been updated successfully`
        )

        setShowSuccessDialog(true)
        setHasUnsavedChanges(false)
      } else {
        notifications.formError(
          "Order Update",
          result.error || "Failed to update order",
          "Please check the form data and try again"
        )
      }
    } catch (error) {
      console.error('Error updating order:', error)
      notifications.formError(
        "Order Update",
        "An unexpected error occurred",
        "Please try again or contact support if the problem persists"
      )
    } finally {
      setIsLoading(false)
    }
  }

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    customer.email?.toLowerCase().includes(customerSearch.toLowerCase()) ||
    customer.phone?.includes(customerSearch)
  )

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(itemSearch.toLowerCase()) ||
    item.sku.toLowerCase().includes(itemSearch.toLowerCase())
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleNavigateWithUnsavedCheck(`/dashboard/orders/${order.id}`)}
            className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Order
          </Button>
          {hasUnsavedChanges && (
            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
              <AlertCircle className="w-3 h-3 mr-1" />
              Unsaved Changes
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 via-orange-600 to-red-700 shadow-lg shadow-amber-500/25">
            <Edit className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
              Edit Order {order.orderNumber}
            </h1>
            <p className="text-muted-foreground mt-1">
              Modify order details and line items
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Customer Information */}
          <Card className="lg:col-span-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-indigo-600" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Dialog open={showCustomerDialog} onOpenChange={setShowCustomerDialog}>
                  <DialogTrigger asChild>
                    <Button type="button" variant="outline" className="flex-shrink-0">
                      <Search className="w-4 h-4 mr-2" />
                      Change Customer
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Select Customer</DialogTitle>
                      <DialogDescription>
                        Search and select a different customer
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input
                        placeholder="Search customers..."
                        value={customerSearch}
                        onChange={(e) => setCustomerSearch(e.target.value)}
                      />
                      <div className="max-h-60 overflow-y-auto space-y-2">
                        {filteredCustomers.map((customer) => (
                          <div
                            key={customer.id}
                            className="p-3 rounded-lg border hover:bg-muted cursor-pointer"
                            onClick={() => handleCustomerSelect(customer)}
                          >
                            <div className="font-medium">{customer.name}</div>
                            {customer.email && (
                              <div className="text-sm text-muted-foreground">{customer.email}</div>
                            )}
                            {customer.phone && (
                              <div className="text-sm text-muted-foreground">{customer.phone}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                {selectedCustomer && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    {selectedCustomer.name}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => {
                        setSelectedCustomer(null)
                      }}
                    />
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customerName">Customer Name *</Label>
                  <Input
                    id="customerName"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter customer name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="customerEmail">Email</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="customer@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="customerPhone">Phone</Label>
                  <Input
                    id="customerPhone"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+1234567890"
                  />
                </div>
                <div>
                  <Label htmlFor="expectedDate">Expected Delivery Date</Label>
                  <DatePicker
                    date={expectedDate}
                    onDateChange={setExpectedDate}
                    placeholder="Select expected delivery date"
                    minDate={new Date()}
                    className="w-full"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="customerAddress">Address</Label>
                <Textarea
                  id="customerAddress"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="Enter customer address"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Order Settings */}
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-indigo-600" />
                Order Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Order Type</Label>
                <Select value={orderType} onValueChange={(value) => setOrderType(value as OrderType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ORDER_TYPE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Delivery Method</Label>
                <Select value={deliveryMethod} onValueChange={(value) => setDeliveryMethod(value as DeliveryMethod)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(DELIVERY_METHOD_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="text-lg font-semibold">
                Order Total: {formatCurrency(subtotal)}
              </div>

              {subtotal !== order.totalAmount && (
                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                  <div className="text-amber-800 dark:text-amber-200 text-sm">
                    <strong>Original:</strong> {formatCurrency(order.totalAmount)}
                    <br />
                    <strong>New:</strong> {formatCurrency(subtotal)}
                    <br />
                    <strong>Difference:</strong> {formatCurrency(subtotal - order.totalAmount)}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card className="lg:col-span-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-indigo-600" />
                  Order Items ({orderLines.length})
                </CardTitle>
                <Dialog open={showItemDialog} onOpenChange={setShowItemDialog}>
                  <DialogTrigger asChild>
                    <Button type="button">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Item
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Add Item</DialogTitle>
                      <DialogDescription>
                        Search and select items to add to the order
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input
                        placeholder="Search items..."
                        value={itemSearch}
                        onChange={(e) => setItemSearch(e.target.value)}
                      />
                      <div className="max-h-60 overflow-y-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Item</TableHead>
                              <TableHead>SKU</TableHead>
                              <TableHead>Price</TableHead>
                              <TableHead>Stock</TableHead>
                              <TableHead>Action</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredItems.map((item) => (
                              <TableRow key={item.id}>
                                <TableCell>{item.name}</TableCell>
                                <TableCell className="font-mono text-sm">{item.sku}</TableCell>
                                <TableCell>{formatCurrency(item.sellingPrice)}</TableCell>
                                <TableCell>{item.quantityOnHand || 0}</TableCell>
                                <TableCell>
                                  <Button
                                    type="button"
                                    size="sm"
                                    onClick={() => handleAddItem(item)}
                                  >
                                    Add
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {orderLines.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Item</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead>Qty</TableHead>
                        <TableHead>Unit Price</TableHead>
                        <TableHead>Subtotal</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orderLines.map((line) => (
                        <TableRow key={line.id}>
                          <TableCell>{line.itemName}</TableCell>
                          <TableCell className="font-mono text-sm">{line.itemSku}</TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="1"
                              value={line.quantity}
                              onChange={(e) => {
                                const value = parseInt(e.target.value)
                                if (!isNaN(value) && value > 0) {
                                  handleQuantityChange(line.id, value)
                                }
                              }}
                              className="w-20"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={line.unitPrice.toFixed(2)}
                              onChange={(e) => {
                                const value = parseFloat(e.target.value)
                                if (!isNaN(value) && value >= 0) {
                                  handlePriceChange(line.id, value)
                                }
                              }}
                              className="w-24"
                            />
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatCurrency(line.subtotal)}
                          </TableCell>
                          <TableCell>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveLine(line.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-muted-foreground mb-2">No items in order</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Add items to this order
                  </p>
                  <Button type="button" onClick={() => setShowItemDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Item
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes and Instructions */}
          <Card className="lg:col-span-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border shadow-lg">
            <CardHeader>
              <CardTitle>Notes & Instructions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="notes">Customer Notes</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any notes from the customer..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="specialInstructions">Special Instructions</Label>
                  <Textarea
                    id="specialInstructions"
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    placeholder="Special handling instructions..."
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Actions */}
          <div className="lg:col-span-3">
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border shadow-lg">
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-2xl font-bold">
                      Order Total: {formatCurrency(subtotal)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {orderLines.length} item{orderLines.length !== 1 ? 's' : ''} • {orderLines.reduce((sum, line) => sum + line.quantity, 0)} total quantity
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleNavigateWithUnsavedCheck(`/dashboard/orders/${order.id}`)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isLoading || !customerName.trim() || orderLines.length === 0 || !hasUnsavedChanges}
                      className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Updating Order...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Update Order
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
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
                <AlertDialogTitle className="text-xl">Order Updated Successfully!</AlertDialogTitle>
                <AlertDialogDescription className="text-muted-foreground">
                  Order {order.orderNumber} has been updated with your changes.
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>

          <AlertDialogFooter className="gap-3">
            <AlertDialogCancel
              onClick={() => {
                setShowSuccessDialog(false)
                // Stay on edit page
              }}
            >
              Edit More
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                router.push(`/dashboard/orders/${order.id}`)
              }}
              className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
            >
              View Order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Unsaved Changes Dialog */}
      <AlertDialog open={showUnsavedChangesDialog} onOpenChange={setShowUnsavedChangesDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes that will be lost if you leave this page. Do you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingNavigation(null)}>
              Stay Here
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingNavigation) {
                  router.push(pendingNavigation)
                }
                setPendingNavigation(null)
                setShowUnsavedChangesDialog(false)
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Leave Without Saving
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
