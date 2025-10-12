"use client"

import { createInventoryTransactions, createPayment, createPOSSession, createSale, getActivePOSSession, updateInventoryLevels } from "@/actions/pos/POSActionFinal"

import { useNotifications } from "@/components/notifications/NotificationProvider"
import { Customer } from "@/lib/cashSystem/db"
import { CartItem } from "@/lib/cashSystem/types"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import type React from "react"
import type { ReactElement } from "react"
import { useEffect, useMemo, useState } from "react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
// import type { CartItem, Customer } from "@/types"
import {
  AlertTriangle,
  Banknote,
  CheckCircle,
  CreditCard,
  Eye,
  Heart,
  Keyboard,
  Moon,
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

import { useOrgCategories } from "@/hooks/useAllCategoriesqueries"
import { useOrgItemsWithInventoryLevelsLocation } from "@/hooks/useAllItemQueries"
import { useCustomers } from "@/hooks/useCustomers"
import {
  BookOpen,
  Briefcase,
  Car,
  Clock,
  Coffee,
  Gift,
  Grid3X3,
  Home,
  ImageIcon,
  Leaf,
  PackageIcon,
  Percent,
  Plus,
  Scan,
  Shirt,
  Sparkles,
  Star,
  Tag,
  ZapIcon,
} from "lucide-react"

const CATEGORY_ICONS = {
  Electronics: PackageIcon,
  Clothing: Shirt,
  Fried: Coffee,
  Books: BookOpen,
  Sports: ZapIcon,
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

export function pOSStation({ organizationId, locationId, terminalId, userId }: pOSStationProps): ReactElement {
  const [cart, setCart] = useState<CartItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
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
  const [discountPercent, setDiscountPercent] = useState(0)
  const [splitPayment, setSplitPayment] = useState(false)
  const [paymentProgress, setPaymentProgress] = useState(0)
  const [showCustomerDisplay, setShowCustomerDisplay] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isReceiptPreviewOpen, setIsReceiptPreviewOpen] = useState(false)

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


  const notifications = useNotifications()
  const queryClient = useQueryClient()
  //   const authSession = useSession()
  // const user= authSession.data?.user
  // const userOrgId = user?.organizationId
  if (!organizationId) {
    toast({
      variant: "destructive",
      title: "Error",
      description: "User organization not found.",
    })
    return <></>
  }

  // const { data: itemsData, error } = useOrgItemsWithInventoryLevelsLocation(organizationId, locationId)
  const {
    data: itemsData,
    error,
    isLoading: itemsLoading,
    refetch: refetchItems
  } = useOrgItemsWithInventoryLevelsLocation(organizationId, locationId, {
    enabled: !!organizationId && !!locationId
  })
  if (error) {
    toast({
      variant: "destructive",
      title: "Error",
      description: itemsData?.message || "Failed to load items.",
    })
  }
  const items = itemsData?.data || []

  useEffect(() => {
    if (items.length > 0) {
      const favoriteItems = items.slice(0, 10).map((item) => item.id)
      setFavorites(favoriteItems)
    }
  }, [items])

  // Effect to refetch items when location changes
  useEffect(() => {
    if (locationId && organizationId) {
      console.log(`Refetching items for location: ${locationId}`)
      // Invalidate queries to force refetch
      queryClient.invalidateQueries({ queryKey: ["items-with-inventory", organizationId, locationId] })
    }
  }, [locationId, organizationId, queryClient])

  // Add effect to refetch when location changes
  useEffect(() => {
    if (locationId && organizationId) {
      console.log(`Refetching items for location: ${locationId}`)
      refetchItems()
    }
  }, [locationId, organizationId, refetchItems])

  // Effect to clear cart when location changes (prevents inventory conflicts)
  useEffect(() => {
    if (locationId && cart.length > 0) {
      clearCart()
      toast({
        title: "Location Changed",
        description: "Cart cleared due to location change. Items are now filtered for the new location.",
      })
    }
  }, [locationId])

  const categoriesData = useOrgCategories(organizationId)
  const categories = categoriesData?.data?.data || []

  const categoriesArray = useMemo(() => {
    return Array.isArray(categories) ? categories : categories || [];
  }, [categories]);



  const customersData = useCustomers(organizationId)
  const customers = customersData?.data || []

  const customersArray = useMemo(() => {
    return Array.isArray(customers) ? customers : customers || [];
  }, [customers]);

  const createSaleMutation = useMutation<any, unknown, any>({
    mutationFn: createSale, // Use createSale instead of createSale1
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales-orders"] })
      queryClient.invalidateQueries({ queryKey: ["inventory-levels"] })
      queryClient.invalidateQueries({ queryKey: ["items-with-inventory"] })
    },
    onError: (error) => {
      console.error("Sale creation failed:", error)
      toast({
        variant: "destructive",
        title: "Sale Failed",
        description: "Failed to create sale. Please try again.",
      })
    },
  })

  // const createSalesOrderMutation = useMutation<any, unknown, any>({
  //   mutationFn: createSale1,
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ["sales-orders"] })
  //     queryClient.invalidateQueries({ queryKey: ["inventory-levels"] })
  //   },
  //   onError: (error) => {
  //     console.error("Sales order creation failed:", error)
  //     toast({
  //       variant: "destructive",
  //       title: "Sales Order Failed",
  //       description: "Failed to create sales order. Please try again.",
  //     })
  //   },
  // })

  const createPaymentMutation = useMutation({
    mutationFn: createPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] })
    },
    onError: (error) => {
      console.error("Payment creation failed:", error)
      toast({
        variant: "destructive",
        title: "Payment Failed",
        description: "Failed to process payment. Please try again.",
      })
    },
  })

  const updateInventoryMutation = useMutation({
    mutationFn: updateInventoryLevels,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory-levels"] })
      queryClient.invalidateQueries({ queryKey: ["items-with-inventory"] })
    },
  })

  const createTransactionsMutation = useMutation({
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

  const filteredItems = useMemo(() => {
    if (!items) return []

    const filtered = items.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase())

      let matchesCategory = true
      if (selectedCategory === "favorites") {
        matchesCategory = favorites.includes(item.id)
      } else if (selectedCategory === "recent") {
        matchesCategory = recentItems.includes(item.id)
      } else if (selectedCategory !== "all") {
        matchesCategory = item?.category?.id === selectedCategory
      }

      return matchesSearch && matchesCategory && item.isActive
    })

    return filtered
  }, [items, searchTerm, selectedCategory, favorites, recentItems])

  // const processPayment = async () => {
  //   if (!currentSession) {
  //     toast({
  //       variant: "destructive",
  //       title: "No Active Session",
  //       description: "Please start a POS session before processing payments.",
  //     })
  //     return
  //   }

  //   if (!cashDrawerStatus.isOpen && paymentMethod === PaymentMethod.CASH) {
  //     toast({
  //       variant: "destructive",
  //       title: "Cash Drawer Closed",
  //       description: "Please open the cash drawer before processing cash payments.",
  //     })
  //     return
  //   }

  //   setIsProcessing(true)
  //   setPaymentProgress(0)

  //   try {
  //     const inventoryCheck = validateInventory()
  //     if (!inventoryCheck.valid) {
  //       toast({
  //         variant: "destructive",
  //         title: "Inventory Error",
  //         description: inventoryCheck.message,
  //       })
  //       setIsProcessing(false)
  //       return
  //     }

  //     toast({
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

  //     // Create sales order with enhanced data
  //     const salesOrderResult = await createSaleMutation.mutateAsync({
  //       customerId: selectedCustomer?.id ?? "cust-1",
  //       locationId,
  //       organizationId,
  //       createdById: userId,
  //       terminalId,
  //       sessionId: currentSession.id,
  //       orderNumber: `SO-${Date.now()}`,
  //       lines: cart.map((item) => ({
  //         itemId: item.itemId,
  //         quantity: item.quantity,
  //         unitPrice: item.price,
  //         discount: item.discount,
  //         taxRate: item.taxRate,
  //         taxAmount: (item.price * item.quantity * item.taxRate) / 100,
  //         lineTotal: item.lineTotal,
  //       })),
  //       subtotal: calculateSubtotal(),
  //       taxAmount: calculateTax(),
  //       discount: calculateDiscount(),
  //       total: calculateTotal(),
  //     })

  //     if (!salesOrderResult.success) {
  //       throw new Error(salesOrderResult.error || "Failed to create sales order")
  //     }

  //     const salesOrder = salesOrderResult.data
  //     if (!salesOrder) {
  //       throw new Error("Sales order data is missing after creation.")
  //     }

  //     // Create payment with enhanced method-specific data
  //     const paymentData: any = {
  //       amount: calculateTotal(),
  //       method: paymentMethod,
  //       salesOrderId: salesOrder.id,
  //       processedById: userId,
  //     }

  //     if (paymentMethod === PaymentMethod.CASH) {
  //       paymentData.cashTendered = Number.parseFloat(cashTendered) || calculateTotal()
  //       paymentData.changeGiven = calculateChange()
  //     } else if (paymentMethod === PaymentMethod.CARD) {
  //       paymentData.cardType = "VISA"
  //       paymentData.cardLast4 = "1234"
  //       paymentData.transactionId = `TXN-${Date.now()}`
  //       paymentData.authorizationCode = `AUTH-${Date.now()}`
  //     } else if (paymentMethod === PaymentMethod.DIGITAL) {
  //       paymentData.digitalWalletType = "Apple Pay"
  //       paymentData.digitalTransactionId = `DIG-${Date.now()}`
  //     }

  //     const paymentResult = await createPaymentMutation.mutateAsync(paymentData)

  //     if (!paymentResult.success) {
  //       throw new Error(paymentResult.error || "Failed to create payment")
  //     }

  //     // Update inventory levels
  //     const inventoryUpdates = cart.map((item) => ({
  //       itemId: item.itemId,
  //       locationId,
  //       quantityChange: item.quantity,
  //       organizationId,
  //     }))

  //     const inventoryResult = await updateInventoryMutation.mutateAsync(inventoryUpdates)
  //     if (!inventoryResult.success) {
  //       throw new Error(inventoryResult.error || "Failed to update inventory")
  //     }

  //     // Create inventory transactions
  //     const inventoryTransactions = cart.map((item) => {
  //       const itemData = items?.find((i) => i.id === item.itemId)
  //       const unitCost = itemData?.costPrice || 0

  //       return {
  //         itemId: item.itemId,
  //         locationId,
  //         type: "SALE",
  //         quantity: -item.quantity,
  //         unitCost: unitCost,
  //         totalCost: unitCost * item.quantity,
  //         referenceType: "SALES_ORDER",
  //         referenceId: salesOrder.id,
  //         organizationId,
  //         createdById: userId,
  //         serialNumbers: [],
  //       }
  //     })

  //     const transactionsResult = await createTransactionsMutation.mutateAsync(inventoryTransactions)
  //     if (!transactionsResult.success) {
  //       throw new Error(transactionsResult.error || "Failed to create inventory transactions")
  //     }

  //     // Update session totals
  //     const saleTotal = calculateTotal()
  //     setCurrentSession((prev) =>
  //       prev
  //         ? {
  //           ...prev,
  //           totalSales: prev.totalSales + saleTotal,
  //           transactionCount: prev.transactionCount + 1,
  //           cashTotal: paymentMethod === PaymentMethod.CASH ? prev.cashTotal + saleTotal : prev.cashTotal,
  //           cardTotal: paymentMethod === PaymentMethod.CARD ? prev.cardTotal + saleTotal : prev.cardTotal,
  //           digitalTotal: paymentMethod === PaymentMethod.DIGITAL ? prev.digitalTotal + saleTotal : prev.digitalTotal,
  //         }
  //         : null,
  //     )

  //     // Update cash drawer balance for cash payments
  //     if (paymentMethod === PaymentMethod.CASH) {
  //       setCashDrawerStatus((prev) => ({
  //         ...prev,
  //         currentBalance: prev.currentBalance + saleTotal,
  //         lastActivity: new Date(),
  //       }))
  //     }

  //     // Clear cart and close dialog
  //     clearCart()
  //     setIsPaymentDialogOpen(false)
  //     setCashTendered("")

  //     toast({
  //       title: "Sale Completed Successfully!",
  //       description: `Receipt #${salesOrder.orderNumber} - Total: $${calculateTotal().toFixed(2)}`,
  //     })

  //     // Check for low stock items
  //     const lowStockItems = items?.filter((item) => {
  //       const inventory = item.inventoryLevels?.[0]
  //       return inventory && inventory.quantityAvailable <= item.minStockLevel && inventory.quantityAvailable > 0
  //     })

  //     if (lowStockItems && lowStockItems.length > 0) {
  //       toast({
  //         title: "Low Stock Alert",
  //         description: `${lowStockItems.length} item(s) are running low on stock.`,
  //         variant: "destructive",
  //       })
  //     }
  //   } catch (error) {
  //     console.error("Payment processing error:", error)
  //     toast({
  //       variant: "destructive",
  //       title: "Payment Failed",
  //       description: error instanceof Error ? error.message : "An unexpected error occurred",
  //     })
  //   } finally {
  //     setIsProcessing(false)
  //     setPaymentProgress(0)
  //   }
  // }
  // Updated processPayment function
  const processPayment = async () => {
    if (!currentSession) {
      toast({
        variant: "destructive",
        title: "No Active Session",
        description: "Please start a POS session before processing payments.",
      })
      return
    }

    if (!cashDrawerStatus.isOpen && paymentMethod === PaymentMethod.CASH) {
      toast({
        variant: "destructive",
        title: "Cash Drawer Closed",
        description: "Please open the cash drawer before processing cash payments.",
      })
      return
    }

    setIsProcessing(true)
    setPaymentProgress(0)

    try {
      const inventoryCheck = validateInventory()
      if (!inventoryCheck.valid) {
        toast({
          variant: "destructive",
          title: "Inventory Error",
          description: inventoryCheck.message,
        })
        setIsProcessing(false)
        return
      }

      toast({
        title: "Processing Payment",
        description: "Please wait while we process your transaction...",
      })

      const progressInterval = setInterval(() => {
        setPaymentProgress((prev) => {
          if (prev >= 100) {
            clearInterval(progressInterval)
            return 100
          }
          return prev + 10
        })
      }, 200)

      // Prepare payment data based on payment method
      const paymentData: any = {
        method: paymentMethod,
        amount: calculateTotal(),
      }

      if (paymentMethod === PaymentMethod.CASH) {
        paymentData.referenceNumber = `CASH-${Date.now()}`
      } else if (paymentMethod === PaymentMethod.CARD) {
        paymentData.cardType = "VISA"
        paymentData.cardLastFour = "1234"
        paymentData.authorizationCode = `AUTH-${Date.now()}`
        paymentData.referenceNumber = `CARD-${Date.now()}`
      }

      // Create sale with all required data including payments
      const saleData = {
        sessionId: currentSession.id,
        terminalId,
        customerId: selectedCustomer?.id, // This can be undefined, handled in createSale
        userId,
        locationId,
        organizationId,
        lines: cart.map((item) => ({
          itemId: item.itemId,
          quantity: item.quantity,
          unitPrice: item.price,
          discount: item.discount || 0,
          taxRate: item.taxRate,
          taxAmount: (item.price * item.quantity * item.taxRate) / 100,
          lineTotal: item.lineTotal,
        })),
        subtotal: calculateSubtotal(),
        taxAmount: calculateTax(),
        discount: calculateDiscount(),
        totalAmount: calculateTotal(),
        payments: [paymentData], // This is the required payments array
        notes: selectedCustomer ? `Customer: ${selectedCustomer.name}` : undefined,
      }

      const saleResult = await createSaleMutation.mutateAsync(saleData)

      if (!saleResult.success) {
        throw new Error(saleResult.error || "Failed to create sale")
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
          currentBalance: prev.currentBalance + saleTotal - calculateChange(),
          lastActivity: new Date(),
        }))
      }

      // Clear cart and close dialog
      clearCart()
      setIsPaymentDialogOpen(false)
      setCashTendered("")

      toast({
        title: "Sale Completed Successfully!",
        description: `Sale ID: ${saleResult.saleId} - Total: $${calculateTotal().toFixed(2)}`,
      })

      // Check for low stock items
      const lowStockItems = items?.filter((item) => {
        const inventory = item.inventoryLevels?.[0]
        return inventory && inventory.quantityAvailable <= item.minStockLevel && inventory.quantityAvailable > 0
      })

      if (lowStockItems && lowStockItems.length > 0) {
        toast({
          title: "Low Stock Alert",
          description: `${lowStockItems.length} item(s) are running low on stock.`,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Payment processing error:", error)
      toast({
        variant: "destructive",
        title: "Payment Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
      })
    } finally {
      setIsProcessing(false)
      setPaymentProgress(0)
    }
  }
  const toggleFavorite = (itemId: string) => {
    setFavorites((prev) => (prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]))
  }

  const addToCart = (item: any) => {
    // Add to recent items
    setRecentItems((prev) => {
      const filtered = prev.filter((id) => id !== item.id)
      return [item.id, ...filtered].slice(0, 10) // Keep last 10 recent items
    })

    const existingItem = cart.find((cartItem) => cartItem.itemId === item.id)
    const currentQuantityInCart = existingItem ? existingItem.quantity : 0
    const availableStock = item.inventoryLevels?.[0]?.quantityAvailable ?? 0

    if (currentQuantityInCart >= availableStock && availableStock > 0) {
      toast({
        variant: "destructive",
        title: "Insufficient Stock",
        description: `Cannot add more ${item.name}. Only ${availableStock} in stock.`,
      })
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
          imageUrl: item.thumbnail,
        },
      ])
    }

    toast({
      title: "Item Added",
      description: `${item.name} added to cart`,
    })
  }

  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId)
      return
    }

    const cartItem = cart.find((item) => item.id === cartItemId)
    if (!cartItem) return

    const item = items?.find((i) => i.id === cartItem.itemId)
    const availableStock = item?.inventoryLevels?.[0]?.quantityAvailable ?? 0

    if (item && quantity > availableStock && availableStock > 0) {
      toast({
        variant: "destructive",
        title: "Insufficient Stock",
        description: `Cannot set quantity to ${quantity}. Only ${availableStock} in stock.`,
      })
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
      const availableStock = item?.inventoryLevels?.[0]?.quantityAvailable ?? 0

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
      toast({
        variant: "destructive",
        title: "Empty Cart",
        description: "Please add items to cart before processing payment.",
      })
      return
    }
    setIsPaymentDialogOpen(true)
  }
  // Update the useEffect that initializes the session
  useEffect(() => {
    const initializeSession = async () => {
      try {
        // First, check if there's already an active session
        const existingSessionResult = await getActivePOSSession(terminalId)

        if (existingSessionResult.success && existingSessionResult.data) {
          // Use existing session
          const session = existingSessionResult.data
          setCurrentSession({
            id: session.id,
            sessionNumber: session.sessionNumber,
            status: session.status as POSSessionStatus,
            startTime: new Date(session.startTime),
            openingBalance: session.openingBalance,
            totalSales: session.totalSales,
            transactionCount: session.transactionCount,
            cashTotal: session.cashTotal || 0,
            cardTotal: session.cardTotal || 0,
            digitalTotal: session.digitalTotal || 0,
          })

          // Set cash drawer status from the session
          const cashDrawer = session.cashDrawerTransactions[0]?.cashDrawer
          if (cashDrawer) {
            setCashDrawerStatus({
              isOpen: cashDrawer.isOpen,
              currentBalance: cashDrawer.currentBalance,
              lastActivity: new Date(),
            })
          }

          toast({
            title: "Session Restored",
            description: `Continuing session ${session.sessionNumber}`,
          })
        } else {
          // Create new session
          const newSessionResult = await createPOSSession({
            terminalId,
            userId,
            locationId,
            organizationId,
            openingBalance: 200.0,
          })

          if (newSessionResult.success && newSessionResult.data) {
            const session = newSessionResult.data
            setCurrentSession({
              id: session.id,
              sessionNumber: session.sessionNumber,
              status: session.status as POSSessionStatus,
              startTime: new Date(session.startTime),
              openingBalance: session.openingBalance,
              totalSales: session.totalSales,
              transactionCount: session.transactionCount,
              cashTotal: 0,
              cardTotal: 0,
              digitalTotal: 0,
            })

            setCashDrawerStatus({
              isOpen: true,
              currentBalance: session.openingBalance,
              lastActivity: new Date(),
            })

            toast({
              title: "New Session Started",
              description: `Session ${session.sessionNumber} created successfully`,
            })
          } else {
            toast({
              variant: "destructive",
              title: "Session Error",
              description: newSessionResult.error || "Failed to create POS session",
            })
          }
        }
      } catch (error) {
        console.error("Failed to initialize session:", error)
        toast({
          variant: "destructive",
          title: "Session Error",
          description: "Failed to initialize POS session",
        })
      }
    }

    // Only initialize if we have the required props
    if (terminalId && userId && locationId && organizationId) {
      initializeSession()
    }
  }, [terminalId, userId, locationId, organizationId]) // Dependencies ensure session is recreated if these change

  // Also add a session management mutation
  const createSessionMutation = useMutation({
    mutationFn: createPOSSession,
    onSuccess: (result) => {
      if (result.success && result.data) {
        const session = result.data
        setCurrentSession({
          id: session.id,
          sessionNumber: session.sessionNumber,
          status: session.status as POSSessionStatus,
          startTime: new Date(session.startTime),
          openingBalance: session.openingBalance,
          totalSales: session.totalSales,
          transactionCount: session.transactionCount,
          cashTotal: 0,
          cardTotal: 0,
          digitalTotal: 0,
        })
      }
    },
    onError: (error) => {
      console.error("Session creation failed:", error)
      toast({
        variant: "destructive",
        title: "Session Failed",
        description: "Failed to create POS session",
      })
    },
  })

  // Add a function to manually start a new session if needed
  const startNewSession = async () => {
    try {
      await createSessionMutation.mutateAsync({
        terminalId,
        userId,
        locationId,
        organizationId,
        openingBalance: 200.0,
      })
    } catch (error) {
      console.error("Failed to start new session:", error)
    }
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
          <p className="text-muted-foreground">Process sales and manage transactions  cash sys POS-T</p>
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
                  <div className="space-y-3 border-b border-border pb-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-semibold">Select Category</Label>
                      <Badge variant="secondary" className="ml-auto">
                        {(Array.isArray(categories) ? categories.length : 0)} categories
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
                        {categoriesArray.map((category => {
                          const cat = category as { id: string; title: string }
                          const IconComponent = getCategoryIcon(String(cat.title || ""))
                          const categoryItemCount =
                            items?.filter((item) => item?.category?.id === cat.id).length || 0

                          return (
                            <Button
                              key={cat.id}
                              type="button"
                              variant={selectedCategory === cat.id ? "default" : "outline"}
                              size="sm"
                              className="flex items-center gap-2 whitespace-nowrap transition-all hover:scale-105"
                              onClick={() => setSelectedCategory(cat.id)}
                            >
                              <IconComponent className="h-4 w-4" />
                              {cat.title}
                              <Badge variant="secondary" className="ml-1">
                                {categoryItemCount}
                              </Badge>
                            </Button>
                          )
                        }))}
                      </div>
                    </ScrollArea>
                  </div>

                  <div className="flex gap-2 mb-4">
                    <Button
                      type="button"
                      variant={selectedCategory === "favorites" ? "default" : "outline"}
                      size="sm"
                      className="flex items-center gap-2 bg-transparent"
                      onClick={() => setSelectedCategory("favorites")}
                    >
                      <Star className="h-4 w-4" />
                      Favorites ({favorites.length})
                    </Button>
                    <Button
                      type="button"
                      variant={selectedCategory === "recent" ? "default" : "outline"}
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
                        const cat = categoriesArray.find((cat) => cat.id === selectedCategory)
                        if (cat) {
                          const IconComponent = getCategoryIcon(cat?.title ?? "")
                          return (
                            <>
                              <IconComponent className="h-5 w-5 text-primary" />
                              <span className="font-medium">Showing {cat?.title || ""}</span>
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
                        const inventory = item.inventoryLevels?.[0]
                        const stockLevel = inventory?.quantityAvailable ?? 0
                        const isLowStock = stockLevel <= 5 && stockLevel > 0
                        const isOutOfStock = stockLevel === 0
                        const isFavorite = favorites.includes(item.id)

                        return (
                          <div
                            key={item.id}
                            className={`group relative flex flex-col p-3 rounded-lg border border-border hover:shadow-lg cursor-pointer transition-all duration-300 hover:scale-105 ${isLowStock ? "border-orange-200 bg-orange-50/50" : ""
                              } ${isOutOfStock ? "border-red-200 bg-red-50/50 opacity-50 cursor-not-allowed" : ""}`}
                            onClick={() => !isOutOfStock && addToCart(item)}
                          >
                            <div className="relative mb-2">
                              <div className="w-full h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-md flex items-center justify-center overflow-hidden">
                                {item.thumbnail ? (
                                  <img
                                    src={item.thumbnail || "/placeholder.svg"}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <ImageIcon className="h-8 w-8 text-gray-400" />
                                )}
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toggleFavorite(item.id)
                                }}
                              >
                                <Star
                                  className={`h-3 w-3 ${isFavorite ? "text-yellow-500 fill-current" : "text-gray-400"}`}
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
                                  className={`text-xs ${isLowStock ? "text-orange-600 font-medium" : "text-muted-foreground"
                                    } ${isOutOfStock ? "text-red-600 font-medium" : ""}`}
                                >
                                  Stock: {stockLevel}
                                </div>
                                {isLowStock && (
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
                              <div className="font-bold text-primary text-lg">${item?.sellingPrice?.toFixed(2)}</div>
                              <Button
                                type="button"
                                size="sm"
                                className="w-full transition-all hover:bg-emerald-600"
                                disabled={isOutOfStock}
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                {isOutOfStock ? "Out of Stock" : "Add"}
                              </Button>
                            </div>
                          </div>
                        )
                      })
                    ) : (
                      <div className="col-span-4 flex flex-col items-center justify-center py-8 text-center">
                        <PackageIcon className="h-12 w-12 text-muted-foreground mb-3" />
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
              {customersArray?.map((customer) => (
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
                  <div className="font-medium text-foreground">{customer.name}</div>
                  {customer.phone && <div className="text-sm text-muted-foreground">{customer.phone}</div>}
                </div>
              ))}
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
                  <Banknote className="h-4 w-4" />
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

export { pOSStation as pOSStationRecent }
export default pOSStation
