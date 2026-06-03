"use client"

import React, { useState, useEffect, useMemo } from 'react'
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
  CreditCard,
  Loader2,
  MapPin,
  Package,
  Plus,
  Receipt,
  Search,
  Trash2,
  User,
  X
} from 'lucide-react'
import { DatePicker } from '@/components/ui/date-picker'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { OrderType, DeliveryMethod, OrderPaymentMethod } from '@/types/orders'
import { createOrder } from '@/actions/orders/orderActions'
import { getCustomersForOrder, getItemsForOrder } from '@/actions/orders/getOrderFormData'
import { getLocations } from '@/actions/locations/locationActions'
import { useNotifications } from '@/components/notifications/NotificationProvider'
import {
  ORDER_TYPE_LABELS,
  DELIVERY_METHOD_LABELS,
  PAYMENT_METHOD_LABELS,
  formatCurrency
} from '@/types/orders'

interface Customer {
  id: string
  name: string
  email?: string
  phone?: string
  address?: string
}

interface Location {
  id: string
  name: string
  code: string
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

interface CreateOrderFormProps {
  organizationId: string
  currentUserId: string
}

export function CreateOrderForm({ organizationId, currentUserId }: CreateOrderFormProps) {
  const router = useRouter()
  const notifications = useNotifications()

  // Form state
  const [isLoading, setIsLoading] = useState(false)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [orderLines, setOrderLines] = useState<OrderLine[]>([])
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [createdOrder, setCreatedOrder] = useState<{ orderNumber: string; id: string } | null>(null)

  // Form data
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [selectedLocationId, setSelectedLocationId] = useState<string>('')
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerAddress, setCustomerAddress] = useState('')
  const [orderType, setOrderType] = useState<OrderType>(OrderType.STANDARD)
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>(DeliveryMethod.PICKUP)
  const [expectedDate, setExpectedDate] = useState<Date | undefined>(undefined)
  const [notes, setNotes] = useState('')
  const [specialInstructions, setSpecialInstructions] = useState('')

  // Dialog states
  const [showCustomerDialog, setShowCustomerDialog] = useState(false)
  const [showItemDialog, setShowItemDialog] = useState(false)
  const [customerSearch, setCustomerSearch] = useState('')
  const [itemSearch, setItemSearch] = useState('')
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())

  // Load customers and items data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [customersResult, itemsResult] = await Promise.all([
          getCustomersForOrder(organizationId),
          getItemsForOrder(organizationId)
        ])

        if (customersResult.success) {
          setCustomers(customersResult.data)
        } else {
          console.error('Failed to load customers:', customersResult.error)
          notifications.warning(
            "Customer Data",
            "Failed to load customer data. You can still enter customer details manually."
          )
        }

        if (itemsResult.success) {
          setItems(itemsResult.data)
        } else {
          console.error('Failed to load items:', itemsResult.error)
          notifications.warning(
            "Items Data",
            "Failed to load items data. Please try again or contact support."
          )
        }

        // Load locations separately with error handling
        try {
          const locationsResult = await getLocations()
          if (locationsResult && Array.isArray(locationsResult)) {
            setLocations(locationsResult)
            // Set default location if available
            if (locationsResult.length > 0) {
              setSelectedLocationId(locationsResult[0].id)
            }
          }
        } catch (locationError) {
          console.error('Failed to load locations:', locationError)
          notifications.warning(
            "Locations Data",
            "Failed to load locations data. Please try again or contact support."
          )
        }
      } catch (error) {
        console.error('Error loading data:', error)
        notifications.warning(
          "Data Loading Warning",
          "Some data may not be available. You can still create orders manually."
        )
      }
    }

    loadData()
  }, [organizationId, notifications])

  const filteredCustomers = useMemo(() => {
    if (!customerSearch) return customers
    return customers.filter(customer =>
      customer.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      customer.email?.toLowerCase().includes(customerSearch.toLowerCase()) ||
      customer.phone?.includes(customerSearch)
    )
  }, [customers, customerSearch])

  const filteredItems = useMemo(() => {
    if (!itemSearch) return items
    return items.filter(item =>
      item.name.toLowerCase().includes(itemSearch.toLowerCase()) ||
      item.sku.toLowerCase().includes(itemSearch.toLowerCase())
    )
  }, [items, itemSearch])

  const subtotal = useMemo(() => {
    const total = orderLines.reduce((sum, line) => sum + line.subtotal, 0)
    return Math.round(total * 100) / 100
  }, [orderLines])

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer)
    setCustomerName(customer.name)
    setCustomerEmail(customer.email || '')
    setCustomerPhone(customer.phone || '')
    setCustomerAddress(customer.address || '')
    setShowCustomerDialog(false)
  }

  const handleToggleItemSelection = (itemId: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(itemId)) {
        newSet.delete(itemId)
      } else {
        newSet.add(itemId)
      }
      return newSet
    })
  }

  const handleAddSelectedItems = () => {
    const itemsToAdd = items.filter(item => selectedItems.has(item.id))

    setOrderLines(prev => {
      const newLines = [...prev]

      itemsToAdd.forEach(item => {
        const existingLineIndex = newLines.findIndex(line => line.itemId === item.id)

        if (existingLineIndex >= 0) {
          // Item already exists, increase quantity
          newLines[existingLineIndex] = {
            ...newLines[existingLineIndex],
            quantity: newLines[existingLineIndex].quantity + 1,
            subtotal: Math.round((newLines[existingLineIndex].quantity + 1) * newLines[existingLineIndex].unitPrice * 100) / 100
          }
        } else {
          // New item, add to order
          const roundedPrice = Math.round(item.sellingPrice * 100) / 100
          const newLine: OrderLine = {
            id: Math.random().toString(36).substr(2, 9),
            itemId: item.id,
            itemName: item.name,
            itemSku: item.sku,
            unitPrice: roundedPrice,
            quantity: 1,
            subtotal: roundedPrice
          }
          newLines.push(newLine)
        }
      })

      return newLines
    })

    // Reset selection and close dialog
    setSelectedItems(new Set())
    setShowItemDialog(false)
  }

  const handleQuantityChange = (lineId: string, quantity: number) => {
    // Handle NaN and ensure we have a valid positive number
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
    // Handle NaN, negative values, and ensure we have a valid number
    if (isNaN(price) || price < 0) return

    // Round to 2 decimal places to prevent floating point precision issues
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!customerName.trim()) {
      notifications.formError(
        "Order Creation",
        "Customer name is required",
        "Please enter a customer name to continue"
      )
      return
    }

    if (!selectedLocationId) {
      notifications.formError(
        "Order Creation",
        "Location is required",
        "Please select a location for inventory tracking"
      )
      return
    }

    if (orderLines.length === 0) {
      notifications.formError(
        "Order Creation",
        "At least one item is required",
        "Please add items to the order before creating"
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
        "Order Creation",
        "Invalid item details",
        "Please ensure all items have valid quantities and prices before creating the order"
      )
      return
    }

    setIsLoading(true)

    // Show operation start notification
    const loadingNotificationId = notifications.operationStart("Order Creation")

    try {
      const orderData = {
        customerId: selectedCustomer?.id || null, // Will create customer if null
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
        locationId: selectedLocationId,
        createdById: currentUserId,
        orderLines: orderLines.map(line => ({
          itemId: line.itemId,
          itemName: line.itemName,
          itemSku: line.itemSku,
          unitPrice: line.unitPrice,
          quantity: line.quantity,
          notes: line.notes,
          specialRequirements: line.specialRequirements
        }))
      }

      const result = await createOrder(orderData)

      if (result.success && result.data) {
        // Show success notification using the notification provider
        notifications.clientOrderCreated(
          result.data.orderNumber,
          customerName,
          subtotal
        )

        // Store created order info for success dialog
        setCreatedOrder({
          orderNumber: result.data.orderNumber,
          id: result.data.id
        })

        // Show success dialog
        setShowSuccessDialog(true)
      } else {
        notifications.formError(
          "Order Creation",
          result.error || "Failed to create order",
          "Please check the form data and try again"
        )
      }
    } catch (error) {
      console.error('Error creating order:', error)
      notifications.formError(
        "Order Creation",
        "An unexpected error occurred",
        "Please try again or contact support if the problem persists"
      )
    } finally {
      // Remove loading notification
      notifications.removeNotification(loadingNotificationId)
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
            Back to Orders
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-700 shadow-lg shadow-indigo-500/25">
            <Receipt className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Create New Order
            </h1>
            <p className="text-muted-foreground mt-1">
              Create a new client order with advance payment options
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
              <CardDescription>
                Select an existing customer or enter new customer details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Dialog open={showCustomerDialog} onOpenChange={setShowCustomerDialog}>
                  <DialogTrigger asChild>
                    <Button type="button" variant="outline" className="flex-shrink-0">
                      <Search className="w-4 h-4 mr-2" />
                      Select Customer
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Select Customer</DialogTitle>
                      <DialogDescription>
                        Search and select an existing customer
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
                        setCustomerName('')
                        setCustomerEmail('')
                        setCustomerPhone('')
                        setCustomerAddress('')
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
                    minDate={new Date()} // Prevent selecting past dates
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

              <div>
                <Label>Location *</Label>
                <Select value={selectedLocationId} onValueChange={setSelectedLocationId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem key={location.id} value={location.id}>
                        {location.name} ({location.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="text-lg font-semibold">
                Order Total: {formatCurrency(subtotal)}
              </div>
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
                              <TableHead className="w-12">Select</TableHead>
                              <TableHead>Item</TableHead>
                              <TableHead>SKU</TableHead>
                              <TableHead>Price</TableHead>
                              <TableHead>Stock</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredItems.map((item) => (
                              <TableRow
                                key={item.id}
                                className={`cursor-pointer hover:bg-muted/50 ${
                                  selectedItems.has(item.id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                                }`}
                                onClick={() => handleToggleItemSelection(item.id)}
                              >
                                <TableCell>
                                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                                    selectedItems.has(item.id)
                                      ? 'bg-blue-600 border-blue-600'
                                      : 'border-gray-300 dark:border-gray-600'
                                  }`}>
                                    {selectedItems.has(item.id) && (
                                      <CheckCircle className="w-3 h-3 text-white" />
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>{item.name}</TableCell>
                                <TableCell className="font-mono text-sm">{item.sku}</TableCell>
                                <TableCell>{formatCurrency(item.sellingPrice)}</TableCell>
                                <TableCell>{item.quantityOnHand || 0}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>

                      {selectedItems.size > 0 && (
                        <div className="flex items-center justify-between pt-4 border-t">
                          <div className="text-sm text-muted-foreground">
                            {selectedItems.size} item{selectedItems.size !== 1 ? 's' : ''} selected
                          </div>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedItems(new Set())}
                            >
                              Clear Selection
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              onClick={handleAddSelectedItems}
                            >
                              Add {selectedItems.size} Item{selectedItems.size !== 1 ? 's' : ''}
                            </Button>
                          </div>
                        </div>
                      )}
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
                  <h3 className="text-lg font-semibold text-muted-foreground mb-2">No items added</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Add items to create your order
                  </p>
                  <Button type="button" onClick={() => {
                    setSelectedItems(new Set())
                    setShowItemDialog(true)
                  }}>
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
                      onClick={() => router.back()}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isLoading || !customerName.trim() || orderLines.length === 0 || !selectedLocationId}
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creating Order...
                        </>
                      ) : (
                        <>
                          <Receipt className="w-4 h-4 mr-2" />
                          Create Order
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
                <AlertDialogTitle className="text-xl">Order Created Successfully!</AlertDialogTitle>
                <AlertDialogDescription className="text-muted-foreground">
                  Your client order has been created and is ready for processing.
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>

          {createdOrder && (
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 p-6 rounded-lg border">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <span className="font-medium text-muted-foreground">Order Number</span>
                    <p className="font-mono font-bold text-lg">{createdOrder.orderNumber}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="font-medium text-muted-foreground">Customer</span>
                    <p className="font-semibold">{customerName}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="font-medium text-muted-foreground">Total Amount</span>
                    <p className="font-bold text-lg">{formatCurrency(subtotal)}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="font-medium text-muted-foreground">Items Count</span>
                    <p className="font-semibold">{orderLines.length} item{orderLines.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                  <Receipt className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100">Next Steps:</h4>
                    <ul className="mt-2 space-y-1 text-sm text-blue-800 dark:text-blue-200">
                      <li>• Review order details and confirm with customer</li>
                      <li>• Process advance payment if applicable</li>
                      <li>• Prepare items for delivery or pickup</li>
                      <li>• Update order status as it progresses</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          <AlertDialogFooter className="gap-3">
            <AlertDialogCancel
              onClick={() => {
                // Reset form for new order
                setOrderLines([])
                setSelectedCustomer(null)
                setSelectedLocationId(locations.length > 0 ? locations[0].id : '')
                setCustomerName('')
                setCustomerEmail('')
                setCustomerPhone('')
                setCustomerAddress('')
                setNotes('')
                setSpecialInstructions('')
                setExpectedDate(undefined)
                setCreatedOrder(null)
              }}
            >
              Create Another Order
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (createdOrder) {
                  router.push(`/dashboard/orders/${createdOrder.id}`)
                } else {
                  router.push("/dashboard/orders")
                }
              }}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              View Order Details
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
