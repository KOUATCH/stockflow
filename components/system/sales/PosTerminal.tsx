// components/pos-terminal.tsx
"use client"

import type React from "react"

import { createPayment, createSale } from "@/actions/cashSystem/sales/sales-actions"
import {
  createInventoryTransactions,
  updateInventoryLevels,
} from "@/actions/newPOSSession/pos/POSActionFinal"

import { useNotifications } from "@/components/notifications/NotificationProvider"
import { useOrgLocationsNew } from "@/hooks/useAllLocationsQueries"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"

import type { ItemWithInventory } from "@/actions/inventory/itemWithInventoryFetch"
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
import { useCustomers } from "@/hooks/useCustomerQueries"
import type { BriefCategoryPayload } from "@/types/category"
import {
  BookOpen,
  Briefcase,
  Calculator,
  Car,
  Clock,
  Coffee,
  CreditCard,
  DollarSign,
  Eye,
  Gift,
  Grid3X3,
  Heart,
  Home,
  ImageIcon,
  Keyboard,
  Leaf,
  MapPin,
  Moon,
  Package,
  Percent,
  Plus,
  Receipt,
  Scan,
  Search,
  Shirt,
  ShoppingCart,
  Sparkles,
  Split,
  Star,
  Sun,
  Tag,
  Trash2,
  User,
  Volume2,
  Zap,
} from "lucide-react"
import { useAuth } from "@/hooks/useAuth"

// Define the Customer type
interface Customer {
  id: string
  name: string
  email?: string
  phone?: string
}

// Define the CartItem type
interface CartItem {
  itemId: any
  id: string
  name: string
  sku: string
  price: number
  quantity: number
  discount: number
  taxRate: number
  categoryId: string | null | undefined
}

// Example mock customers for selection dialog

export function POSStation({ organizationId }: { organizationId?: string }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedLocation, setSelectedLocation] = useState<string>("1")
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "CARD" | "DIGITAL">("CASH")
  const [cashTendered, setCashTendered] = useState("")
  const [currentTime, setCurrentTime] = useState(new Date())
  const [items, setItems] = useState<ItemWithInventory[]>([])
  const [category, setCategory] = useState<BriefCategoryPayload[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [favorites, setFavorites] = useState<string[]>(["1", "4", "6"])
  const [recentItems, setRecentItems] = useState<string[]>([])
  const [isReceiptPreviewOpen, setIsReceiptPreviewOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [discountPercent, setDiscountPercent] = useState(0)
  const [splitPayment, setSplitPayment] = useState(false)
  const [paymentProgress, setPaymentProgress] = useState(0)
  const [showCustomerDisplay, setShowCustomerDisplay] = useState(false)
  const [salesStats, setSalesStats] = useState({
    todaySales: 2450.75,
    transactionCount: 18,
    avgTransaction: 136.15,
  })
  const { error, success, warning, info, cashOperation } = useNotifications()
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const queryClient = useQueryClient()
  const { user } = useAuth()
  // Get organization ID from session or props
  const orgId = organizationId || user?.organizationId || ""
  console.log("User Organization ID:", orgId)
  const customers = useCustomers()
  const customersData = customers?.data || []

  //   const {
  //     data: itemResponse,
  //     isLoading: itemsLoading,
  //     error: itemsError,
  //     refetch: refetchItems,
  //   } = useOrgItemsWithInventoryLevelsLocation(orgId, selectedLocation)
  //
  const {
    data: locationResponse,
    isLoading: locationsLoading,
    error: locationsError,
    refetch: refetchLocations,
  } = useOrgLocationsNew(orgId, { enabled: !!orgId })

  const locationsData = locationResponse?.data
  console.log(locationResponse)
  // const {
  //   data: itemResponse,
  //   isLoading: itemsLoading,
  //   error: itemsError,
  //   refetch: refetchItems,
  // } = useOrgItemsWithInventoryLevelsLocation(orgId, selectedLocation)

  const { data, isLoading, error: itemsError } = useItemsWithInventory({
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
  } = useOrgCategories(orgId)

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

  const filteredItems = items?.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || item?.category?.id === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Add mutations for server actions

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
    meta: { operation: 'create', entity: 'Payment' },
    mutationFn: createPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] })
    },
  })

  const updateInventoryMutation = useMutation({
    meta: { operation: 'update', entity: 'Inventory' },
    mutationFn: updateInventoryLevels,
    onSuccess: () => {
      // Invalidate and refetch items to update inventory levels
      queryClient.invalidateQueries({
        queryKey: ["orgItemsWithInventoryLevels", organizationId],
      })
    },
  })

  const createTransactionsMutation = useMutation({
    meta: { operation: 'create', entity: 'Transactions' },
    mutationFn: createInventoryTransactions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory-transactions"] })
    },
  })

  const CATEGORY_ICONS = {
    Electronics: Package,
    Clothing: Shirt,
    Fried: Coffee,
    Books: BookOpen,
    Sports: Zap,
    Home: Home,
    Baked: Sparkles,
    Toys: Gift,
    Automotive: Car,
    Decorated: Heart,
    Juices: Leaf,
    Office: Briefcase,
    default: Tag,
  } as const

  const getCategoryIcon = (categoryName: string) => {
    const iconKey = Object.keys(CATEGORY_ICONS).find((key) =>
      categoryName.toLowerCase().includes(key.toLowerCase()),
    ) as keyof typeof CATEGORY_ICONS
    return CATEGORY_ICONS[iconKey] || CATEGORY_ICONS.default
  }

  // ... (existing functions)

  // const processPayment = async () => {
  //   setIsProcessing(true)
  //   setPaymentProgress(0)

  //   try {
  //     const inventoryCheck = validateInventory()
  //     if (!inventoryCheck.valid) {
  //       notify({
  //         variant: "destructive",
  //         title: "Inventory Error",
  //         description: inventoryCheck.message,
  //       })
  //       setIsProcessing(false)
  //       return
  //     }

  //     notify({
  //       title: "Processing Payment",
  //       description: "Please wait while we process your transaction...",
  //     })

  //     const progressInterval = setInterval(() => {
  //       setPaymentProgress((prev) => {
  //         if (prev >= 100) {
  //           clearInterval(progressInterval)
  //           return 100
  //         }
  //         return prev + 10
  //       })
  //     }, 200)

  //     // 2. Fix sales order creation call
  //     const salesOrderResult = await createSalesOrderMutation.mutateAsync({
  //       customerId: selectedCustomer?.id ?? "", // Provide empty string for walk-in customers
  //       locationId: selectedLocation,
  //       organizationId: orgId,
  //       userId: user?.id || "",
  //       // orderNumber: `SO-${Date.now()}`,
  //       items: cart.map((item) => ({
  //         itemId: item.id,
  //         quantity: item.quantity,
  //         unitPrice: item.price,
  //         discount: item.discount,
  //         taxRate: item.taxRate,
  //         taxAmount: (item.price * item.quantity * item.taxRate) / 100,
  //         lineTotal: item.price * item.quantity,
  //       })),
  //       subtotal: calculateSubtotal(),
  //       taxAmount: calculateTax(),
  //       discountAmount: calculateDiscount(),
  //       totalAmount: calculateTotal(),
  //       sessionId: "default-session", // Replace with actual session ID if available
  //       terminalId: "default-terminal", // Replace with actual terminal ID if available
  //       payments: [], // Add payment info if needed, or leave as empty array
  //     })

  //     if (!salesOrderResult.success) {
  //       throw new Error(salesOrderResult.error || "Failed to create sales order")
  //     }

  //     const salesOrder = salesOrderResult?.saleId

  //     if (!salesOrder) {
  //       throw new Error("Sales order data is missing after creation.")
  //     }

  //     // 3. Fix payment creation call
  //     const paymentResult = await createPaymentMutation.mutateAsync({
  //       amount: calculateTotal(),
  //       method: paymentMethod, // Use proper enum value
  //       salesOrderId: salesOrder,
  //       userId: user?.id || "",
  //       ...(paymentMethod === "CARD" && {
  //         cardType: "VISA",
  //         cardLast4: "1234",
  //         transactionId: `TXN-${Date.now()}`,
  //         authorizationCode: `AUTH-${Date.now()}`,
  //       }),
  //     })

  //     if (!paymentResult.success) {
  //       throw new Error(paymentResult.error || "Failed to create payment")
  //     }

  //     // Update inventory levels
  //     const inventoryUpdates = cart.map((item) => ({
  //       itemId: item.id,
  //       locationId: selectedLocation,
  //       quantityChange: item.quantity, // Positive quantity for decrement operation
  //       organizationId: orgId,
  //     }))

  //     const inventoryResult = await updateInventoryMutation.mutateAsync(inventoryUpdates)

  //     if (!inventoryResult.success) {
  //       throw new Error(inventoryResult.error || "Failed to update inventory")
  //     }

  //     // 4. Fix inventory transactions with proper enum types
  //     const inventoryTransactions = cart.map((item) => {
  //       const newItemData = items?.find((i) => i.id === item.id)
  //       const unitCost = newItemData?.costPrice || 0

  //       return {
  //         itemId: item.id,
  //         locationId: selectedLocation,
  //         type: "SALE" as TransactionType, // Proper enum type
  //         quantity: -item.quantity, // Negative for outbound
  //         unitCost: unitCost,
  //         totalCost: unitCost * item.quantity,
  //         referenceType: "SALES_ORDER" as TransactionReferenceType, // Proper enum type
  //         referenceId: salesOrder.id,
  //         organizationId: orgId,
  //         createdById: user?.id || "",
  //         serialNumbers: [],
  //       }
  //     })

  //     const transactionsResult = await createTransactionsMutation.mutateAsync(inventoryTransactions)

  //     if (!transactionsResult.success) {
  //       throw new Error(transactionsResult.error || "Failed to create inventory transactions")
  //     }

  //     // Clear cart and close dialog
  //     clearCart()
  //     setIsPaymentDialogOpen(false)
  //     setCashTendered("")

  //     notify({
  //       title: "Sale Completed Successfully!",
  //       description: `Receipt #${salesOrder.orderNumber} - Total: $${calculateTotal().toFixed(2)}`,
  //     })

  //     // Check for low stock items
  //     const updatedItems = items
  //     const lowStockItems = updatedItems?.filter((item) => {
  //       let stock = 0
  //       if (Array.isArray(item.inventoryLevel)) {
  //         stock = item.inventoryLevel[0]?.quantityOnHand ?? 0
  //       } else if (
  //         item.inventoryLevel &&
  //         typeof item.inventoryLevel === "object" &&
  //         "quantityOnHand" in item.inventoryLevel
  //       ) {
  //         stock = item.inventoryLevel.quantityOnHand ?? 0
  //       }
  //       return stock <= 5 && stock > 0
  //     })

  //     if (lowStockItems && lowStockItems.length > 0) {
  //       setTimeout(() => {
  //         notify({
  //           title: "Low Stock Alert",
  //           description: `${lowStockItems.length} item(s) are running low on stock`,
  //         })
  //       }, 2000)
  //     }

  //     setTimeout(() => {
  //       setIsReceiptPreviewOpen(true)
  //     }, 1000)
  //   } catch (error) {
  //     console.error("Error processing payment:", error)
  //     notify({
  //       variant: "destructive",
  //       title: "Payment Failed",
  //       description: error instanceof Error ? error.message : "Error processing payment. Please try again.",
  //     })
  //   } finally {
  //     setIsProcessing(false)
  //     setPaymentProgress(0)
  //   }
  // }

  const processPayment = async () => {
    // if (!currentSession) {
    //   notify({
    //     variant: "destructive",
    //     title: "No Active Session",
    //     description: "Please start a POS session before processing payments.",
    //   })
    //   return
    // }

    // if (!cashDrawerStatus.isOpen && paymentMethod === PaymentMethod.CASH) {
    //   notify({
    //     variant: "destructive",
    //     title: "Cash Drawer Closed",
    //     description: "Please open the cash drawer before processing cash payments.",
    //   })
    //   return
    // }

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
        locationId: selectedLocation,
        organizationId: orgId,
        userId: user?.id || "",
        terminalId: "terminal-1",
        sessionId: "session-1",
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
        processedById: user?.id || "",
      }

      if (paymentMethod === "CASH") {
        paymentData.cashTendered = Number.parseFloat(cashTendered) || calculateTotal()
        paymentData.changeGiven = calculateChange()
      } else if (paymentMethod === "CARD") {
        paymentData.cardType = "VISA"
        paymentData.cardLast4 = "1234"
        paymentData.transactionId = `TXN-${Date.now()}`
        paymentData.authorizationCode = `AUTH-${Date.now()}`
      } else if (paymentMethod === "DIGITAL") {
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
        locationId: selectedLocation,
        quantityChange: item.quantity,
        organizationId: orgId,
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
          locationId: selectedLocation,
          type: "SALE",
          quantity: -item.quantity,
          unitCost: unitCost,
          totalCost: unitCost * item.quantity,
          referenceType: "SALES_ORDER",
          referenceId: salesOrder,
          organizationId: orgId,
          createdById: user?.id || "",
          serialNumbers: [],
        }
      })

      const transactionsResult = await createTransactionsMutation.mutateAsync(inventoryTransactions)
      if (!transactionsResult.success) {
        throw new Error(transactionsResult.error || "Failed to create inventory transactions")
      }

      // Update session totals
      // const saleTotal = calculateTotal()
      // setCurrentSession((prev) =>
      //   prev
      //     ? {
      //       ...prev,
      //       totalSales: prev.totalSales + saleTotal,
      //       transactionCount: prev.transactionCount + 1,
      //       cashTotal: paymentMethod === "CASH" ? prev.cashTotal + saleTotal : prev.cashTotal,
      //       cardTotal: paymentMethod === "CARD" ? prev.cardTotal + saleTotal : prev.cardTotal,
      //       digitalTotal: paymentMethod === "DIGITAL" ? prev.digitalTotal + saleTotal : prev.digitalTotal,
      //     }
      //     : null,
      // )

      // Update cash drawer balance for cash payments
      // if (paymentMethod === "CASH") {
      //   setCashDrawerStatus((prev) => ({
      //     ...prev,
      //     currentBalance: prev.currentBalance + saleTotal,
      //     lastActivity: new Date(),
      //   }))
      // }

      // Clear cart and close dialog
      clearCart()
      setIsPaymentDialogOpen(false)
      setCashTendered("")

      success("Sale Completed Successfully!", `Receipt #${salesOrderResult?.orderNumber} - Total: $${calculateTotal().toFixed(2)}`)

      // Check for low stock items
      const lowStockItems = items?.filter((item) => {
        const inventory = item.inventoryLevels?.[0]
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

  // 6. Fix customer selection to handle null values
  const handleCustomerSelection = (customer: any) => {
    setSelectedCustomer({
      id: customer.id,
      name: customer.name,
      email: customer.email || undefined,
      phone: customer.phone || undefined,
    })
    setIsCustomerDialogOpen(false)
  }

  const addToCart = (item: NonNullable<typeof items>[number]) => {
    const existingItem = cart.find((cartItem) => cartItem.id === item.id)
    const currentQuantityInCart = existingItem ? existingItem.quantity : 0

    const availableStock =
      Array.isArray(item.inventoryLevel) && item.inventoryLevel.length > 0
        ? (item.inventoryLevel[0]?.quantityOnHand ?? 0)
        : 0

    if (currentQuantityInCart >= availableStock && availableStock > 0) {
      error("Insufficient Stock", `Cannot add more ${item.name}. Only ${availableStock} in stock.`)
      return
    }

    if (existingItem) {
      setCart(
        cart.map((cartItem) => (cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem)),
      )
    } else {
      setCart([
        ...cart,
        {
          id: item.id,
          name: item.name,
          sku: item.sku,
          price: item.sellingPrice,
          quantity: 1,
          discount: 0,
          taxRate: 8.5,
          categoryId: item.category?.id || null,
        },
      ])
    }

    setRecentItems((prev) => {
      const filtered = prev.filter((id) => id !== item.id)
      return [item.id, ...filtered].slice(0, 5)
    })

    success("Item Added", `${item.name} added to cart`)
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id)
      return
    }

    const item = items?.find((i) => i.id === id)
    let availableStock = 0
    if (item?.inventoryLevel) {
      if (Array.isArray(item.inventoryLevel)) {
        availableStock = item.inventoryLevel[0]?.quantityOnHand ?? 0
      } else if (typeof item.inventoryLevel === "object" && "quantityOnHand" in item.inventoryLevel) {
        availableStock = item.inventoryLevel.quantityOnHand ?? 0
      }
    }

    if (item && quantity > availableStock && availableStock > 0) {
      error("Insufficient Stock", `Cannot set quantity to ${quantity}. Only ${availableStock} in stock.`)
      return
    }

    setCart(cart.map((item) => (item.id === id ? { ...item, quantity } : item)))
  }

  const removeFromCart = (id: string) => {
    setCart(cart.filter((item) => item.id !== id))
  }

  const clearCart = () => {
    setCart([])
    setSelectedCustomer(null)
  }

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }

  const calculateDiscount = () => {
    return (calculateSubtotal() * discountPercent) / 100
  }

  const calculateTax = () => {
    const subtotalAfterDiscount = calculateSubtotal() - calculateDiscount()
    return cart.reduce((sum, item) => {
      const itemSubtotal = item.price * item.quantity - item.discount * item.quantity
      return sum + (itemSubtotal * item.taxRate) / 100
    }, 0)
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
      const item = items?.find((i) => i.id === cartItem.id)
      if (item) {
        let availableStock = 0
        if (Array.isArray(item.inventoryLevel)) {
          availableStock = item.inventoryLevel[0]?.quantityOnHand ?? 0
        } else if (
          item.inventoryLevel &&
          typeof item.inventoryLevel === "object" &&
          "quantityOnHand" in item.inventoryLevel
        ) {
          availableStock = item.inventoryLevel.quantityOnHand ?? 0
        }
        if (cartItem.quantity > availableStock) {
          return {
            valid: false,
            message: `Insufficient stock for ${item.name}. Available: ${availableStock}, Requested: ${cartItem.quantity}`,
          }
        }
      }
    }
    return { valid: true, message: "" }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (cart.length === 0) {
      error("Empty Cart", "Please add items to cart before checkout.")
      return
    }

    // Validate inventory before opening payment dialog
    const inventoryCheck = validateInventory()
    if (!inventoryCheck.valid) {
      error("Inventory Error", inventoryCheck.message)
      return
    }

    setIsPaymentDialogOpen(true)
  }

  // const toggleVoiceCommand = () => {
  //   setIsVoiceActive(!isVoiceActive)
  //   if (!isVoiceActive) {
  //     notify({
  //       title: "Voice Commands Active",
  //       description: "Say 'add [product name]' or 'checkout' to use voice commands",
  //     })
  //     setTimeout(() => setIsVoiceActive(false), 5000)
  //   }
  // }

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
          <div className="flex items-center gap-4 ml-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {locationData?.map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      <div>
                        <div className="font-medium">{location.name}</div>
                        <div className="text-xs text-muted-foreground">{location.address}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="text-right">
              <div className="text-lg font-medium text-foreground">{currentTime.toLocaleTimeString()}</div>
              <div className="text-sm text-muted-foreground">{currentTime.toLocaleDateString()}</div>
            </div>
          </div>
        </div>
      </div>

      <Card className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-200">
        <CardContent className="p-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-700">${salesStats.todaySales.toFixed(2)}</div>
              <div className="text-sm text-emerald-600">Today's Sales</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-700">{salesStats.transactionCount}</div>
              <div className="text-sm text-emerald-600">Transactions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-700">${salesStats.avgTransaction.toFixed(2)}</div>
              <div className="text-sm text-emerald-600">Avg Transaction</div>
            </div>
          </div>
        </CardContent>
      </Card>

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
                  <div className="space-y-3 border-b border-border pb-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-semibold">Select Category</Label>
                      <Badge variant="secondary" className="ml-auto">
                        {categoryData?.length || 0} categories
                      </Badge>
                    </div>
                    <ScrollArea className="w-full whitespace-nowrap">
                      <div className="flex gap-3 pb-2">
                        <Button
                          type="button"
                          variant={selectedCategory === "all" ? "default" : "outline"}
                          size="sm"
                          className="flex items-center gap-2 whitespace-nowrap transition-all hover:scale-105"
                          onClick={() => setSelectedCategory("all")}
                        >
                          <Grid3X3 className="h-4 w-4" />
                          All Items
                          <Badge variant="secondary" className="ml-1">
                            {items?.length || 0}
                          </Badge>
                        </Button>
                        {categoryData?.map((category) => {
                          const IconComponent = getCategoryIcon(category.title)
                          const categoryItemCount =
                            items?.filter((item) => item?.category?.id === category.id).length || 0

                          return (
                            <Button
                              key={category.id}
                              type="button"
                              variant={selectedCategory === category.id ? "default" : "outline"}
                              size="sm"
                              className="flex items-center gap-2 whitespace-nowrap transition-all hover:scale-105"
                              onClick={() => setSelectedCategory(category.id)}
                            >
                              <IconComponent className="h-4 w-4" />
                              {category.title}
                              <Badge variant="secondary" className="ml-1">
                                {categoryItemCount}
                              </Badge>
                            </Button>
                          )
                        })}
                      </div>
                    </ScrollArea>
                  </div>

                  <div className="flex gap-2 mb-4">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2 bg-transparent"
                      onClick={() => setSelectedCategory("favorites")}
                    >
                      <Star className="h-4 w-4" />
                      Favorites ({favorites.length})
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2 bg-transparent"
                      onClick={() => setSelectedCategory("recent")}
                    >
                      <Clock className="h-4 w-4" />
                      Recent ({recentItems.length})
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2 bg-transparent"
                      onClick={() => setDiscountPercent(discountPercent > 0 ? 0 : 10)}
                    >
                      <Percent className="h-4 w-4" />
                      {discountPercent > 0 ? `${discountPercent}% OFF` : "Add Discount"}
                    </Button>
                  </div>

                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="search-input"
                        placeholder="Search by name, SKU, or scan barcode..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    <Button type="button" variant="outline" size="icon" className="hover:bg-emerald-50 bg-transparent">
                      <Scan className="h-4 w-4" />
                    </Button>
                  </div>

                  {selectedCategory !== "all" && selectedCategory !== "favorites" && selectedCategory !== "recent" && (
                    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                      {(() => {
                        const category = categoryData?.find((cat) => cat.id === selectedCategory)
                        if (category) {
                          const IconComponent = getCategoryIcon(category.title)
                          return (
                            <>
                              <IconComponent className="h-5 w-5 text-primary" />
                              <span className="font-medium">Showing {category.title}</span>
                              <Badge variant="secondary">{filteredItems?.length || 0} items</Badge>
                            </>
                          )
                        }
                        return null
                      })()}
                    </div>
                  )}

                  <div className="grid grid-cols-4 gap-3 max-h-96 overflow-y-auto pr-2">
                    {filteredItems && filteredItems.length > 0 ? (
                      filteredItems.map((item) => {
                        let stockLevel = 0
                        if (item.inventoryLevel) {
                          if (Array.isArray(item.inventoryLevel)) {
                            stockLevel = item.inventoryLevel[0]?.quantityOnHand ?? 0
                          } else if (
                            typeof item.inventoryLevel === "object" &&
                            "quantityOnHand" in item.inventoryLevel
                          ) {
                            stockLevel = item.inventoryLevel.quantityOnHand ?? 0
                          }
                        }
                        return (
                          <div
                            key={item.id}
                            className={`group relative flex flex-col p-3 rounded-lg border border-border hover:shadow-lg cursor-pointer transition-all duration-300 hover:scale-105 ${stockLevel <= 5 ? "border-orange-200 bg-orange-50/50" : ""
                              } ${stockLevel === 0 ? "border-red-200 bg-red-50/50 opacity-50 cursor-not-allowed" : ""}`}
                            onClick={() => stockLevel > 0 && addToCart(item)}
                          >
                            <div className="relative mb-2">
                              <div className="w-full h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-md flex items-center justify-center">
                                <ImageIcon className="h-8 w-8 text-gray-400" />
                              </div>
                              {favorites.includes(item.id) && (
                                <Star className="absolute top-1 right-1 h-4 w-4 text-yellow-500 fill-current" />
                              )}
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute top-1 left-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toggleFavorite(item.id)
                                }}
                              >
                                <Star
                                  className={`h-3 w-3 ${favorites.includes(item.id) ? "text-yellow-500 fill-current" : "text-gray-400"}`}
                                />
                              </Button>
                            </div>
                            <div className="flex-1 mb-3">
                              <div className="font-medium text-card-foreground text-sm leading-tight mb-1">
                                {item.name}
                              </div>
                              <div className="text-xs text-muted-foreground mb-1">SKU: {item.sku}</div>
                              <div className="flex items-center gap-1 mb-1">
                                <div
                                  className={`text-xs ${stockLevel <= 5 ? "text-orange-600 font-medium" : "text-muted-foreground"} ${stockLevel === 0 ? "text-red-600 font-medium" : ""}`}
                                >
                                  Stock: {stockLevel}
                                </div>
                                {stockLevel <= 5 && stockLevel > 0 && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs px-1 py-0 text-orange-600 border-orange-200"
                                  >
                                    Low
                                  </Badge>
                                )}
                              </div>
                              <Progress value={Math.min((stockLevel / 20) * 100, 100)} className="h-1 mb-2" />
                            </div>
                            <div className="flex flex-col items-center gap-2">
                              <div className="font-bold text-primary text-lg">${item?.sellingPrice}</div>
                              <Button
                                type="button"
                                size="sm"
                                className="w-full transition-all hover:bg-emerald-600"
                                disabled={stockLevel === 0}
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                {stockLevel === 0 ? "Out of Stock" : "Add"}
                              </Button>
                            </div>
                          </div>
                        )
                      })
                    ) : (
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
                            <div className="text-sm font-medium text-primary">
                              ${(item.price * item.quantity).toFixed(2)}
                            </div>
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
                            <span>-${((calculateSubtotal() * discountPercent) / 100).toFixed(2)}</span>
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
                          disabled={isProcessing}
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
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
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
              {customersData.map((customer) => (
                <div
                  key={customer.id}
                  className="p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer"
                  onClick={() => handleCustomerSelection(customer)}
                >
                  <div className="font-medium text-card-foreground">{customer.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {customer.email && <span>{customer.email} • </span>}
                    {customer.phone}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 bg-transparent"
                onClick={() => setIsCustomerDialogOpen(false)}
              >
                Cancel
              </Button>

              <Button
                className="flex-1"
                onClick={() => {
                  setSelectedCustomer(null) // This is now properly typed as null
                  setIsCustomerDialogOpen(false)
                }}
              >
                Walk-in Customer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Process Payment</DialogTitle>
            <DialogDescription>Complete the transaction</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-200">
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-700">${calculateTotal().toFixed(2)}</div>
                <div className="text-sm text-emerald-600">Total Amount</div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  type="button"
                  variant={paymentMethod === "CASH" ? "default" : "outline"}
                  onClick={() => setPaymentMethod("CASH")}
                  className="flex flex-col gap-1 h-16"
                >
                  <DollarSign className="h-5 w-5" />
                  <span className="text-xs">Cash</span>
                </Button>
                <Button
                  type="button"
                  variant={paymentMethod === "CARD" ? "default" : "outline"}
                  onClick={() => setPaymentMethod("CARD")}
                  className="flex flex-col gap-1 h-16"
                >
                  <CreditCard className="h-5 w-5" />
                  <span className="text-xs">Card</span>
                </Button>
                <Button
                  type="button"
                  variant={paymentMethod === "DIGITAL" ? "default" : "outline"}
                  onClick={() => setPaymentMethod("DIGITAL")}
                  className="flex flex-col gap-1 h-16"
                >
                  <Calculator className="h-5 w-5" />
                  <span className="text-xs">Digital</span>
                </Button>
              </div>
            </div>
            {paymentMethod === "CASH" && (
              <div className="space-y-2">
                <Label htmlFor="cashTendered">Cash Tendered</Label>
                <Input
                  id="cashTendered"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={cashTendered}
                  onChange={(e) => setCashTendered(e.target.value)}
                  className="text-lg text-center"
                />
                {cashTendered && (
                  <div className="p-3 rounded bg-gradient-to-r from-green-50 to-green-100 border border-green-200">
                    <div className="flex justify-between text-lg font-medium">
                      <span>Change:</span>
                      <span className="text-green-700">${calculateChange().toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 bg-transparent"
                onClick={() => setIsPaymentDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700"
                onClick={processPayment}
                disabled={
                  isProcessing ||
                  (paymentMethod === "CASH" && (!cashTendered || Number.parseFloat(cashTendered) < calculateTotal()))
                }
              >
                <Receipt className="mr-2 h-4 w-4" />
                {isProcessing ? "Processing..." : "Complete Sale"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isReceiptPreviewOpen} onOpenChange={setIsReceiptPreviewOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Receipt Preview</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 font-mono text-sm">
            <div className="text-center border-b pb-2">
              <div className="font-bold">TECH STORE</div>
              <div className="text-xs">123 Main St, Downtown</div>
              <div className="text-xs">{currentTime.toLocaleString()}</div>
            </div>
            <div className="space-y-1">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between text-xs">
                  <div>
                    <div>{item.name}</div>
                    <div className="text-muted-foreground">
                      {item.quantity} x ${item.price}
                    </div>
                  </div>
                  <div>${(item.price * item.quantity).toFixed(2)}</div>
                </div>
              ))}
            </div>
            <div className="border-t pt-2 space-y-1">
              <div className="flex justify-between text-xs">
                <span>Subtotal:</span>
                <span>${calculateSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Tax:</span>
                <span>${calculateTax().toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Total:</span>
                <span>${calculateTotal().toFixed(2)}</span>
              </div>
            </div>
            <div className="text-center text-xs text-muted-foreground border-t pt-2">Thank you for your business!</div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
  // ... (rest of the component)
}

export { POSStation as pOSStation }
