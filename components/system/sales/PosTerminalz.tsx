"use client"

import { useNotifications } from "@/components/notifications/NotificationProvider"
import { useCustomers } from "@/hooks/useCustomerQueries"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import type React from "react"
import type { ReactElement } from "react"
import { useEffect, useState } from "react"

import { createPayment, createSale } from "@/actions/cashSystem/sales/sales-actions"
import type { ItemWithInventory } from "@/actions/inventory/itemWithInventoryFetch"
import { createInventoryTransactions, updateInventoryLevels } from "@/actions/newPOSSession/pos/POSActionFinal"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useItemsWithInventory } from "@/hooks/inventoryHooks/useInventoryWithIinventoryHooks"
import { useOrgCategories } from "@/hooks/useAllCategoriesqueries"
import { useOrgLocationsNew } from "@/hooks/useAllLocationsQueries"
import { CartItem } from "@/lib/cashSystem/types"
import { BriefCategoryPayload } from "@/types/category"
import { Customer } from "@/types/customerTypes"
import {
  AlertTriangle,
  Cast as Cash,
  CheckCircle,
  CreditCard,
  Eye,
  Heart,
  Keyboard,
  Moon,
  Package,
  Receipt,
  Search,
  ShoppingCart,
  Smartphone,
  Split,
  Sun,
  Trash2,
  User,
  Volume2,
  Wallet,
  Zap,
} from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
// Declare PaymentMethod and POSSessionStatus variables
enum PaymentMethod {
  CASH = "CASH",
  CARD = "CARD",
  DIGITAL = "DIGITAL",
}

enum POSSessionStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

interface pOSStationProps {
  organizationId: string
  locationId: string
  terminalId: string
  userId: string
}

export function POSStation({ organizationId, locationId, terminalId, userId }: pOSStationProps): ReactElement {
  const [cart, setCart] = useState<CartItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  // Define SimpleCustomer type if not already imported

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH)
  const [cashTendered, setCashTendered] = useState("")
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isProcessing, setIsProcessing] = useState(false)
  const [favorites, setFavorites] = useState<string[]>([])
  const [recentItems, setRecentItems] = useState<string[]>([])
  const [isReceiptPreviewOpen, setIsReceiptPreviewOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [discountPercent, setDiscountPercent] = useState(0)
  const [splitPayment, setSplitPayment] = useState(false)
  const [paymentProgress, setPaymentProgress] = useState(0)
  const [showCustomerDisplay, setShowCustomerDisplay] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<string>("1")
  const [items, setItems] = useState<ItemWithInventory[]>([])
  const [category, setCategory] = useState<BriefCategoryPayload[]>([])
  // const [salesStats, setSalesStats] = useState({
  //   todaySales: 2450.75,
  //   transactionCount: 18,
  //   avgTransaction: 136.15,
  // })
  // Notifications handled by NotificationProvider
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [currentSession, setCurrentSession] = useState<{
    id: string
    sessionNumber: string
    status: POSSessionStatus
    startTime: Date
    openingBalance: number
    totalSales: number
    transactionCount: number
    cashTotal: number
    cardTotal: number
    digitalTotal: number
  } | null>(null)

  const [cashDrawerStatus, setCashDrawerStatus] = useState<{
    isOpen: boolean
    currentBalance: number
    lastActivity?: Date
  }>({
    isOpen: false,
    currentBalance: 0,
  })

  const [salesStats, setSalesStats] = useState({
    todaySales: 2450.75,
    transactionCount: 18,
    avgTransaction: 136.15,
  })

  const { user } = useAuth()
  // Get organization ID from session or props
  const orgId = organizationId || user?.organizationId || ""
  console.log("User Organization ID:", orgId)
  const customers = useCustomers()
  const customersData = customers?.data || []
  const newUserId = user?.id || ""

  const {
    data: locationResponse,
    isLoading: locationsLoading,
    error: locationsError,
    refetch: refetchLocations,
  } = useOrgLocationsNew(orgId, { enabled: !!orgId })

  const locationsData = locationResponse?.data
  console.log(locationResponse)


  const { data, isLoading, error } = useItemsWithInventory({
    locationId: selectedLocation,
    organizationId: orgId,
    trackInventory: true,
    categoryId: selectedCategory === "all" ? undefined : selectedCategory,
  })
  const itemsWithInventoryData = data?.items

  // Auto-select first location if none selected and locations are available
  useEffect(() => {
    if (!selectedLocation && Array.isArray(locationsData) && locationsData.length > 0 && !locationsLoading) {
      console.log(locationsData[0])
      // setSelectedLocation(locationsData[0]?.id)
      setSelectedLocation(locationsData[0]?.id)
    }
  }, [locationsData, selectedLocation, locationsLoading])

  const {
    data: categoryResponse,
    isLoading: categoriesLoading,
    error: categoriesError,
    refetch: refetchCategories,
  } = useOrgCategories(orgId, { initialData: [] })

  console.log({ selectedLocation })
  console.log({ items })
  const categoryData = categoryResponse?.data
  const locationData = locationResponse?.data

  // Update recent items when items data changes
  useEffect(() => {
    if (Array.isArray(itemsWithInventoryData) && itemsWithInventoryData.length > 0) {
      // setItems(itemsData?.slice(0, 5).map((item) => item.id))
      setItems(itemsWithInventoryData ?? [])
    }
  }, [itemsWithInventoryData, isLoading, locationData])

  const { success, error, warning, info } = useNotifications()
  const queryClient = useQueryClient()

  const createSalesOrderMutation = useMutation({
    meta: { operation: 'create', entity: 'Sales Order' , suppressSuccessNotification: true, suppressErrorNotification: true },
    mutationFn: createSale,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales-orders"] })
      queryClient.invalidateQueries({ queryKey: ["inventory-levels"] })
    },
    onError: (error) => {
      console.error("Sales order creation failed:", error)
      error("Sales Order Failed", "Failed to create sales order. Please try again.")
    },
  })

  const createPaymentMutation = useMutation({
    meta: { operation: 'create', entity: 'Payment' , suppressSuccessNotification: true, suppressErrorNotification: true },
    mutationFn: createPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] })
    },
    onError: (error) => {
      console.error("Payment creation failed:", error)
      error("Payment Failed", "Failed to process payment. Please try again.")
    },
  })

  const updateInventoryMutation = useMutation({
    meta: { operation: 'update', entity: 'Inventory' },
    mutationFn: updateInventoryLevels,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory-levels"] })
      queryClient.invalidateQueries({ queryKey: ["items-with-inventory"] })
    },
  })

  const createTransactionsMutation = useMutation({
    meta: { operation: 'create', entity: 'Transactions' },
    mutationFn: createInventoryTransactions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory-transactions"] })
    },
  })

  useEffect(() => {
    // Initialize mock session
    setCurrentSession({
      id: `session-${Date.now()}`,
      sessionNumber: `SES-${new Date().toISOString().slice(0, 10)}-001`,
      status: POSSessionStatus.ACTIVE,
      startTime: new Date(),
      openingBalance: 200.0,
      totalSales: 0,
      transactionCount: 0,
      cashTotal: 0,
      cardTotal: 0,
      digitalTotal: 0,
    })

    setCashDrawerStatus({
      isOpen: true,
      currentBalance: 200.0,
      lastActivity: new Date(),
    })
  }, [])

  // Update current time
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const filteredItems = items?.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.barcode?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || item?.category?.id === selectedCategory
    return matchesSearch && matchesCategory && item.isActive
  })

  const processPayment = async () => {
    if (!currentSession) {
      warning("No Active Session", "Please start a POS session before processing payments.")
      return
    }

    if (!cashDrawerStatus.isOpen && paymentMethod === PaymentMethod.CASH) {
      warning("Cash Drawer Closed", "Please open the cash drawer before processing cash payments.")
      return
    }

    setIsProcessing(true)
    setPaymentProgress(0)

    try {
      const inventoryCheck = validateInventory()
      if (!inventoryCheck.valid) {
        error("Inventory Error", inventoryCheck.message)
        setIsProcessing(false)
        return
      }

      info("Processing Payment", "Please wait while we process your transaction...")

      const progressInterval = setInterval(() => {
        setPaymentProgress((prev) => {
          if (prev >= 100) {
            clearInterval(progressInterval)
            return 100
          }
          return prev + 10
        })
      }, 200)

      // Create sales order with enhanced data
      const salesOrderResult = await createSalesOrderMutation.mutateAsync({
        customerId: selectedCustomer?.id ?? "cust-1",
        locationId,
        organizationId,
        userId,
        terminalId,
        sessionId: currentSession.id,
        items: cart.map((item) => ({
          itemId: item.itemId,
          quantity: item.quantity,
          unitPrice: item.price,
          discount: item.discount,
          taxAmount: (item.price * item.quantity * item.taxRate) / 100,
        })),
        subtotal: calculateSubtotal(),
        discountAmount: calculateDiscount(),
        taxAmount: calculateTax(),
        totalAmount: calculateTotal(),
        payments: []
      })

      if (!salesOrderResult.success) {
        throw new Error(salesOrderResult.error || "Failed to create sales order")
      }

      const salesOrder = salesOrderResult?.saleId
      if (!salesOrder) {
        throw new Error("Sales order data is missing after creation.")
      }

      // Create payment with enhanced method-specific data
      const paymentData: any = {
        amount: calculateTotal(),
        method: paymentMethod,
        salesOrderId: salesOrder,
        processedById: userId,
      }

      if (paymentMethod === PaymentMethod.CASH) {
        paymentData.cashTendered = Number.parseFloat(cashTendered) || calculateTotal()
        paymentData.changeGiven = calculateChange()
      } else if (paymentMethod === PaymentMethod.CARD) {
        paymentData.cardType = "VISA"
        paymentData.cardLast4 = "1234"
        paymentData.transactionId = `TXN-${Date.now()}`
        paymentData.authorizationCode = `AUTH-${Date.now()}`
      } else if (paymentMethod === PaymentMethod.DIGITAL) {
        paymentData.digitalWalletType = "Apple Pay"
        paymentData.digitalTransactionId = `DIG-${Date.now()}`
      }

      const paymentResult = await createPaymentMutation.mutateAsync(paymentData)

      if (!paymentResult.success) {
        throw new Error(paymentResult.error || "Failed to create payment")
      }

      // Update inventory levels
      const inventoryUpdates = cart.map((item) => ({
        itemId: item.itemId,
        locationId,
        quantityChange: item.quantity,
        organizationId,
      }))

      const inventoryResult = await updateInventoryMutation.mutateAsync(inventoryUpdates)
      if (!inventoryResult.success) {
        throw new Error(inventoryResult.error || "Failed to update inventory")
      }

      // Create inventory transactions
      const inventoryTransactions = cart.map((item) => {
        const itemData = items?.find((i) => i.id === item.itemId)
        const unitCost = itemData?.costPrice || 0

        return {
          itemId: item.itemId,
          locationId,
          type: "SALE",
          quantity: -item.quantity,
          unitCost: unitCost,
          totalCost: unitCost * item.quantity,
          referenceType: "SALES_ORDER",
          referenceId: salesOrder,
          organizationId,
          createdById: userId,
          serialNumbers: [],
        }
      })

      const transactionsResult = await createTransactionsMutation.mutateAsync(inventoryTransactions)
      if (!transactionsResult.success) {
        throw new Error(transactionsResult.error || "Failed to create inventory transactions")
      }

      // Update session totals
      const saleTotal = calculateTotal()
      setCurrentSession((prev) =>
        prev
          ? {
            ...prev,
            totalSales: prev.totalSales + saleTotal,
            transactionCount: prev.transactionCount + 1,
            cashTotal: paymentMethod === PaymentMethod.CASH ? prev.cashTotal + saleTotal : prev.cashTotal,
            cardTotal: paymentMethod === PaymentMethod.CARD ? prev.cardTotal + saleTotal : prev.cardTotal,
            digitalTotal: paymentMethod === PaymentMethod.DIGITAL ? prev.digitalTotal + saleTotal : prev.digitalTotal,
          }
          : null,
      )

      // Update cash drawer balance for cash payments
      if (paymentMethod === PaymentMethod.CASH) {
        setCashDrawerStatus((prev) => ({
          ...prev,
          currentBalance: prev.currentBalance + saleTotal,
          lastActivity: new Date(),
        }))
      }

      // Clear cart and close dialog
      clearCart()
      setIsPaymentDialogOpen(false)
      setCashTendered("")

      success("Sale Completed Successfully!", `Receipt #${salesOrderResult?.orderNumber} - Total: $${calculateTotal().toFixed(2)}`)

      // Check for low stock items
      const lowStockItems = items?.filter((item) => {
        const inventory = item.inventoryLevel
        return inventory && inventory.quantityAvailable <= item.minStockLevel && inventory.quantityAvailable > 0
      })

      if (lowStockItems && lowStockItems.length > 0) {
        warning("Low Stock Alert", `${lowStockItems.length} item(s) are running low on stock.`)
      }
    } catch (error) {
      console.error("Payment processing error:", error)
      error("Payment Failed", error instanceof Error ? error.message : "An unexpected error occurred")
    } finally {
      setIsProcessing(false)
      setPaymentProgress(0)
    }
  }

  const addToCart = (item: ItemWithInventory) => {
    const existingItem = cart.find((cartItem) => cartItem.itemId === item.id)
    const currentQuantityInCart = existingItem ? existingItem.quantity : 0
    const availableStock = Array.isArray(item?.inventoryLevel) && item.inventoryLevel.length > 0
      ? item.inventoryLevel[0]?.quantityAvailable ?? 0
      : 0

    if (currentQuantityInCart >= availableStock && availableStock > 0) {
      warning("Insufficient Stock", `Cannot add more ${item.name}. Only ${availableStock} in stock.`)
      return
    }

    const taxRate = item.taxRate?.rate ?? 8.75
    const lineTotal = item.sellingPrice * (existingItem ? existingItem.quantity + 1 : 1)

    if (existingItem) {
      setCart(
        cart.map((cartItem) =>
          cartItem.itemId === item.id
            ? {
              ...cartItem,
              quantity: cartItem.quantity + 1,
              lineTotal: item.sellingPrice * (cartItem.quantity + 1),
            }
            : cartItem,
        ),
      )
    } else {
      setCart([
        ...cart,
        {
          id: `cart-${Date.now()}`,
          itemId: item.id,
          name: item.name,
          sku: item.sku,
          price: item.sellingPrice,
          quantity: 1,
          discount: 0,
          taxRate,
          taxAmount: (item.sellingPrice * taxRate) / 100,
          lineTotal: item.sellingPrice,
          imageUrl: item.thumbnail ?? undefined,
        },
      ])
    }

    setRecentItems((prev) => {
      const filtered = prev.filter((id) => id !== item.id)
      return [item.id, ...filtered].slice(0, 5)
    })

    success("Item Added", `${item.name} added to cart`)
  }

  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId)
      return
    }

    const cartItem = cart.find((item) => item.id === cartItemId)
    if (!cartItem) return

    const item = items?.find((i) => i.id === cartItem.itemId)
    const availableStock =
      Array.isArray(item?.inventoryLevel) && item.inventoryLevel.length > 0
        ? item.inventoryLevel[0]?.quantityAvailable ?? 0
        : 0

    if (item && quantity > availableStock && availableStock > 0) {
      warning("Insufficient Stock", `Cannot set quantity to ${quantity}. Only ${availableStock} in stock.`)
      return
    }

    setCart(
      cart.map((item) =>
        item.id === cartItemId
          ? {
            ...item,
            quantity,
            lineTotal: item.price * quantity,
            taxAmount: (item.price * quantity * item.taxRate) / 100,
          }
          : item,
      ),
    )
  }

  const removeFromCart = (cartItemId: string) => {
    setCart(cart.filter((item) => item.id !== cartItemId))
  }

  const clearCart = () => {
    setCart([])
    setSelectedCustomer(null)
    setDiscountPercent(0)
  }

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + item.lineTotal, 0)
  }

  const calculateDiscount = () => {
    return (calculateSubtotal() * discountPercent) / 100
  }

  const calculateTax = () => {
    return cart.reduce((sum, item) => sum + item.taxAmount, 0)
  }

  const calculateTotal = () => {
    return calculateSubtotal() - calculateDiscount() + calculateTax()
  }

  const calculateChange = () => {
    const tendered = Number.parseFloat(cashTendered) || 0
    return Math.max(0, tendered - calculateTotal())
  }

  const validateInventory = () => {
    for (const cartItem of cart) {
      const item = items?.find((i) => i.id === cartItem.itemId)
      const availableStock =
        Array.isArray(item?.inventoryLevel) && item.inventoryLevel.length > 0
          ? item.inventoryLevel[0]?.quantityAvailable ?? 0
          : 0

      if (cartItem.quantity > availableStock) {
        return {
          valid: false,
          message: `Insufficient stock for ${item?.name}. Available: ${availableStock}, Required: ${cartItem.quantity}`,
        }
      }
    }
    return { valid: true, message: "" }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (cart.length === 0) {
      warning("Empty Cart", "Please add items to cart before processing payment.")
      return
    }
    setIsPaymentDialogOpen(true)
  }

  const toggleFavorite = (itemId: string) => {
    setFavorites((prev) => (prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]))
  }

  return (
    <div className={`p-6 space-y-6 transition-colors duration-300 ${isDarkMode ? "dark" : ""}`}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
              <Zap className="h-6 w-6" />
            </div>
            POS Terminal
          </h1>
          <p className="text-muted-foreground">Process sales and manage transactions</p>
          {currentSession && (
            <div className="flex items-center gap-4 mt-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3 text-green-500" />
                Session: {currentSession.sessionNumber}
              </Badge>
              <Badge variant={cashDrawerStatus.isOpen ? "default" : "destructive"} className="flex items-center gap-1">
                <Wallet className="h-3 w-3" />
                Cash Drawer: {cashDrawerStatus.isOpen ? "Open" : "Closed"}
              </Badge>
              <Badge variant="secondary">Balance: ${cashDrawerStatus.currentBalance.toFixed(2)}</Badge>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCustomerDisplay(!showCustomerDisplay)}
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            Customer Display
          </Button>
          <Button variant="outline" size="sm" onClick={() => setIsDarkMode(!isDarkMode)}>
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <div className="text-right">
            <div className="text-lg font-medium text-foreground">{currentTime.toLocaleTimeString()}</div>
            <div className="text-sm text-muted-foreground">{currentTime.toLocaleDateString()}</div>
          </div>
        </div>
      </div>

      <Card className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-200">
        <CardContent className="p-4">
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-700">
                ${currentSession?.totalSales.toFixed(2) || "0.00"}
              </div>
              <div className="text-sm text-emerald-600">Session Sales</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-700">{currentSession?.transactionCount || 0}</div>
              <div className="text-sm text-emerald-600">Transactions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-700">${salesStats.avgTransaction.toFixed(2)}</div>
              <div className="text-sm text-emerald-600">Avg Transaction</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-700">${cashDrawerStatus.currentBalance.toFixed(2)}</div>
              <div className="text-sm text-emerald-600">Cash Balance</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {!currentSession && (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            No active POS session. Please start a session to process transactions.
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <Card className="bg-card border-border shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-card-foreground">
                  <Search className="h-5 w-5" />
                  Product Search
                  <Badge variant="secondary" className="ml-auto">
                    <Keyboard className="h-3 w-3 mr-1" />
                    Ctrl+F
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        placeholder="Search by name, SKU, or barcode..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categoryData && categoryData?.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-4 gap-3 max-h-96 overflow-y-auto">
                    {filteredItems?.map((item) => {
                      const inventory = item?.inventoryLevel ?? null
                      const isLowStock = inventory && inventory.quantityAvailable <= item.minStockLevel && inventory.quantityAvailable > 0
                      const isOutOfStock = inventory && inventory.quantityAvailable <= 0
                      const isFavorite = favorites.includes(item.id)

                      return (
                        <Card
                          key={item.id}
                          className={`cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-105 relative ${isOutOfStock ? "opacity-50" : ""
                            }`}
                          onClick={() => !isOutOfStock && addToCart(item)}
                        >
                          <CardContent className="p-3">
                            <div className="aspect-square mb-2 relative">
                              <img
                                src={item.thumbnail || "/placeholder.svg?height=80&width=80"}
                                alt={item.name}
                                className="w-full h-full object-cover rounded-md"
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                className="absolute top-1 right-1 h-6 w-6 p-0"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toggleFavorite(item.id)
                                }}
                              >
                                <Heart className={`h-3 w-3 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
                              </Button>
                              {isLowStock && !isOutOfStock && (
                                <Badge className="absolute bottom-1 left-1 text-xs bg-amber-500">Low Stock</Badge>
                              )}
                              {isOutOfStock && (
                                <Badge className="absolute bottom-1 left-1 text-xs bg-red-500">Out of Stock</Badge>
                              )}
                            </div>
                            <div className="space-y-1">
                              <h3 className="font-medium text-sm leading-tight">{item.name}</h3>
                              <p className="text-xs text-muted-foreground">{item.sku}</p>
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-emerald-600">${item.sellingPrice.toFixed(2)}</span>
                                <span className="text-xs text-muted-foreground">
                                  Stock: {inventory?.quantityAvailable ?? 0}
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                    {filteredItems?.length === 0 && (
                      <div className="col-span-4 flex flex-col items-center justify-center py-8 text-center">
                        <Package className="h-12 w-12 text-muted-foreground mb-3" />
                        <p className="text-muted-foreground font-medium">No items found</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedCategory === "all"
                            ? "Try adjusting your search terms"
                            : "Try selecting a different category"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="bg-card border-border shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-card-foreground">
                    <ShoppingCart className="h-5 w-5" />
                    Cart ({cart.length})
                    {cart.length > 0 && (
                      <Badge className="bg-emerald-100 text-emerald-700">${calculateTotal().toFixed(2)}</Badge>
                    )}
                  </CardTitle>
                  {cart.length > 0 && (
                    <Button type="button" variant="ghost" size="sm" onClick={clearCart}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 justify-start bg-transparent hover:bg-emerald-50"
                      onClick={() => setIsCustomerDialogOpen(true)}
                    >
                      <User className="mr-2 h-4 w-4" />
                      {selectedCustomer ? selectedCustomer.name : "Select Customer"}
                    </Button>
                  </div>
                  <Separator />

                  {isProcessing && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Volume2 className="h-4 w-4 animate-pulse" />
                        Processing payment...
                      </div>
                      <Progress value={paymentProgress} className="h-2" />
                    </div>
                  )}

                  <ScrollArea className="h-64">
                    <div className="space-y-2">
                      {cart.map((item) => (
                        <div
                          key={item.id}
                          className="p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="font-medium text-card-foreground text-sm">{item.name}</div>
                              <div className="text-xs text-muted-foreground">{item.sku}</div>
                            </div>
                            <Button type="button" variant="ghost" size="sm" onClick={() => removeFromCart(item.id)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-2">
                              <Label className="text-xs">Qty:</Label>
                              <Input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => updateQuantity(item.id, Number.parseInt(e.target.value) || 1)}
                                className="w-16 h-8 text-center"
                              />
                            </div>
                            <div className="text-sm font-medium text-primary">${item.lineTotal.toFixed(2)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>

                  {cart.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Cart is empty</p>
                      <p className="text-xs mt-1">Add items to start a transaction</p>
                    </div>
                  )}

                  {cart.length > 0 && (
                    <>
                      <Separator />
                      <div className="space-y-2 bg-muted/30 p-3 rounded-lg">
                        <div className="flex justify-between text-sm">
                          <span>Subtotal:</span>
                          <span>${calculateSubtotal().toFixed(2)}</span>
                        </div>
                        {discountPercent > 0 && (
                          <div className="flex justify-between text-sm text-green-600">
                            <span>Discount ({discountPercent}%):</span>
                            <span>-${calculateDiscount().toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm">
                          <span>Tax:</span>
                          <span>${calculateTax().toFixed(2)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-bold text-lg">
                          <span>Total:</span>
                          <span className="text-emerald-600">${calculateTotal().toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Button
                          type="submit"
                          className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 shadow-lg"
                          disabled={isProcessing || !currentSession}
                        >
                          <CreditCard className="mr-2 h-4 w-4" />
                          {isProcessing ? "Processing..." : "Complete Sale"}
                          <Badge className="ml-2 bg-white/20">Ctrl+Enter</Badge>
                        </Button>

                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setSplitPayment(!splitPayment)}
                            className="flex items-center gap-1"
                          >
                            <Split className="h-3 w-3" />
                            Split Pay
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setIsReceiptPreviewOpen(true)}
                            className="flex items-center gap-1"
                          >
                            <Receipt className="h-3 w-3" />
                            Preview
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>

      {showCustomerDisplay && (
        <Card className="bg-gradient-to-r from-blue-900 to-blue-800 text-white">
          <CardHeader>
            <CardTitle className="text-center text-2xl">Customer Display</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <div className="text-4xl font-bold">${calculateTotal().toFixed(2)}</div>
              <div className="text-lg">Total Amount</div>
              {cart.length > 0 && (
                <div className="space-y-2">
                  {cart.slice(-3).map((item) => (
                    <div key={item.id} className="flex justify-between text-sm opacity-80">
                      <span>
                        {item.name} x{item.quantity}
                      </span>
                      <span>${item.lineTotal.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={isCustomerDialogOpen} onOpenChange={setIsCustomerDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Customer</DialogTitle>
            <DialogDescription>Choose a customer for this transaction</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              {customersData.length > 0 ? customersData.map((customer) => (
                <div
                  key={customer.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${selectedCustomer?.id === customer.id
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-border hover:bg-muted/50"
                    }`}
                  onClick={() => {
                    setSelectedCustomer(customer)
                    setIsCustomerDialogOpen(false)
                  }}
                >
                  <div className="font-medium">{customer.name}</div>
                  {customer.email && <div className="text-sm text-muted-foreground">{customer.email}</div>}
                  {customer.phone && <div className="text-sm text-muted-foreground">{customer.phone}</div>}
                </div>
              )) : (
                <div className="p-3 text-sm text-muted-foreground">No customers found</div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Payment</DialogTitle>
            <DialogDescription>Complete the transaction for ${calculateTotal().toFixed(2)}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  type="button"
                  variant={paymentMethod === PaymentMethod.CASH ? "default" : "outline"}
                  onClick={() => setPaymentMethod(PaymentMethod.CASH)}
                  className="flex items-center gap-2"
                >
                  <Cash className="h-4 w-4" />
                  Cash
                </Button>
                <Button
                  type="button"
                  variant={paymentMethod === PaymentMethod.CARD ? "default" : "outline"}
                  onClick={() => setPaymentMethod(PaymentMethod.CARD)}
                  className="flex items-center gap-2"
                >
                  <CreditCard className="h-4 w-4" />
                  Card
                </Button>
                <Button
                  type="button"
                  variant={paymentMethod === PaymentMethod.DIGITAL ? "default" : "outline"}
                  onClick={() => setPaymentMethod(PaymentMethod.DIGITAL)}
                  className="flex items-center gap-2"
                >
                  <Smartphone className="h-4 w-4" />
                  Digital
                </Button>
              </div>
            </div>

            {paymentMethod === PaymentMethod.CASH && (
              <div className="space-y-2">
                <Label htmlFor="cashTendered">Cash Tendered</Label>
                <Input
                  id="cashTendered"
                  type="number"
                  step="0.01"
                  min={calculateTotal()}
                  value={cashTendered}
                  onChange={(e) => setCashTendered(e.target.value)}
                  placeholder={calculateTotal().toFixed(2)}
                />
                {Number.parseFloat(cashTendered) > 0 && (
                  <div className="text-sm text-muted-foreground">Change: ${calculateChange().toFixed(2)}</div>
                )}
              </div>
            )}

            <div className="space-y-2 bg-muted/30 p-3 rounded-lg">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>${calculateSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax:</span>
                <span>${calculateTax().toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold">
                <span>Total:</span>
                <span>${calculateTotal().toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setIsPaymentDialogOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button
                type="button"
                onClick={processPayment}
                disabled={
                  isProcessing ||
                  (paymentMethod === PaymentMethod.CASH && Number.parseFloat(cashTendered) < calculateTotal())
                }
                className="flex-1"
              >
                {isProcessing ? "Processing..." : "Complete Payment"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// export { POSStation as pOSStationRecent }
export { POSStation as pOSStation }
export default POSStation
