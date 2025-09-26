"use client"

import {
  createInventoryTransactions,
  createPayment,
  createPOSSession,
  createSale,
  getActivePOSSession,
  updateInventoryLevels,
} from "@/actions/pos/POSActionFinal"

import { useToast } from "@/hooks/use-toast"
import type { Customer } from "@/lib/cashSystem/db"
import type { CartItem } from "@/lib/cashSystem/types"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import type React from "react"
import type { ReactElement } from "react"
import { useEffect, useMemo, useRef, useState } from "react"

// import type { CartItem, Customer } from "@/types"
import { Heart } from "lucide-react"

import { useOrgCategories } from "@/hooks/useAllCategoriesqueries"
import { useOrgItemsWithInventoryLevelsLocation } from "@/hooks/useAllItemQueries"
import { useCustomers } from "@/hooks/useCustomers"
import {
  BookOpen,
  Briefcase,
  Car,
  Coffee,
  Gift,
  Home,
  Leaf,
  PackageIcon,
  Shirt,
  Sparkles,
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

// Mock locations and terminals data - replace with actual data fetching
const MOCK_LOCATIONS = [
  { id: "loc-1", name: "Main Store", address: "123 Main St" },
  { id: "loc-2", name: "Mall Branch", address: "456 Mall Ave" },
  { id: "loc-3", name: "Downtown", address: "789 Downtown Blvd" },
]

const MOCK_TERMINALS = {
  "loc-1": [
    { id: "term-1", name: "Terminal 1", status: "active" },
    { id: "term-2", name: "Terminal 2", status: "active" },
    { id: "term-3", name: "Terminal 3", status: "inactive" },
  ],
  "loc-2": [
    { id: "term-4", name: "Mall Terminal 1", status: "active" },
    { id: "term-5", name: "Mall Terminal 2", status: "active" },
  ],
  "loc-3": [{ id: "term-6", name: "Downtown Terminal 1", status: "active" }],
}

interface pOSStationProps {
  organizationId: string
  locationId: string
  terminalId: string
  userId: string
}

export function pOSStationFinal({ organizationId, locationId, terminalId, userId }: pOSStationProps): ReactElement {
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

  // New state for location and terminal selection
  const [selectedLocationId, setSelectedLocationId] = useState<string>(locationId)
  const [selectedTerminalId, setSelectedTerminalId] = useState<string>(terminalId)
  const [availableTerminals, setAvailableTerminals] = useState<any[]>([])

  // Carousel state
  const [carouselIndex, setCarouselIndex] = useState(0)
  const carouselRef = useRef<HTMLDivElement>(null)

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

  const { toast } = useToast()
  const queryClient = useQueryClient()

  const {
    data: itemsData,
    error,
    isLoading: itemsLoading,
    refetch: refetchItems,
  } = useOrgItemsWithInventoryLevelsLocation(organizationId, selectedLocationId, {
    enabled: !!organizationId && !!selectedLocationId,
  })

  const categoriesData = useOrgCategories(organizationId)
  const categories = categoriesData?.data?.data || []

  const categoriesArray = useMemo(() => {
    return Array.isArray(categories) ? categories : categories || []
  }, [categories])

  const customersData = useCustomers(organizationId)
  const customers = customersData?.data || []

  const customersArray = useMemo(() => {
    return Array.isArray(customers) ? customers : customers || []
  }, [customers])

  const createSaleMutation = useMutation<any, unknown, any>({
    mutationFn: createSale,
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

  // Update available terminals when location changes
  useEffect(() => {
    const terminals = MOCK_TERMINALS[selectedLocationId as keyof typeof MOCK_TERMINALS] || []
    setAvailableTerminals(terminals)

    // Auto-select first active terminal if current terminal is not available
    const currentTerminalExists = terminals.find((t) => t.id === selectedTerminalId)
    if (!currentTerminalExists) {
      const firstActiveTerminal = terminals.find((t) => t.status === "active")
      if (firstActiveTerminal) {
        setSelectedTerminalId(firstActiveTerminal.id)
      }
    }
  }, [selectedLocationId, selectedTerminalId])

  const items = itemsData?.data || []

  const initializeSession = async () => {
    try {
      const existingSessionResult = await getActivePOSSession(selectedTerminalId)

      if (existingSessionResult.success && existingSessionResult.data) {
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

        const cashDrawer = session.cashDrawerTransactions?.[0]?.cashDrawer
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
        const newSessionResult = await createPOSSession({
          terminalId: selectedTerminalId,
          userId,
          locationId: selectedLocationId,
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
            transactionCount: 0,
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

  useEffect(() => {
    if (items.length > 0) {
      const favoriteItems = items.slice(0, 10).map((item) => item.id)
      setFavorites(favoriteItems)
    }
  }, [items])

  // Effect to refetch items when location changes
  useEffect(() => {
    if (selectedLocationId && organizationId) {
      console.log(`Refetching items for location: ${selectedLocationId}`)
      queryClient.invalidateQueries({ queryKey: ["items-with-inventory", organizationId, selectedLocationId] })
    }
  }, [selectedLocationId, organizationId, queryClient])

  useEffect(() => {
    if (selectedLocationId && organizationId) {
      console.log(`Refetching items for location: ${selectedLocationId}`)
      refetchItems()
    }
  }, [selectedLocationId, organizationId, refetchItems])

  // Effect to clear cart when location changes
  useEffect(() => {
    if (selectedLocationId && cart.length > 0) {
      clearCart()
      toast({
        title: "Location Changed",
        description: "Cart cleared due to location change. Items are now filtered for the new location.",
      })
    }
  }, [selectedLocationId])

  useEffect(() => {
    if (!organizationId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "User organization not found.",
      })
    }
  }, [organizationId])

  useEffect(() => {
    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: itemsData?.message || "Failed to load items.",
      })
    }
  }, [error])

  useEffect(() => {
    if (selectedTerminalId && userId && selectedLocationId && organizationId) {
      initializeSession()
    }
  }, [selectedTerminalId, userId, selectedLocationId, organizationId])

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

      const saleData = {
        sessionId: currentSession.id,
        terminalId: selectedTerminalId,
        customerId: selectedCustomer?.id,
        userId,
        locationId: selectedLocationId,
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
        payments: [paymentData],
        notes: selectedCustomer ? `Customer: ${selectedCustomer.name}` : undefined,
      }

      const saleResult = await createSaleMutation.mutateAsync(saleData)

      if (!saleResult.success) {
        throw new Error(saleResult.error || "Failed to create sale")
      }

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

      if (paymentMethod === PaymentMethod.CASH) {
        setCashDrawerStatus((prev) => ({
          ...prev,
          currentBalance: prev.currentBalance + saleTotal - calculateChange(),
          lastActivity: new Date(),
        }))
      }

      clearCart()
      setIsPaymentDialogOpen(false)
      setCashTendered("")

      toast({
        title: "Sale Completed Successfully!",
        description: `Sale ID: ${saleResult.saleId} - Total: $${calculateTotal().toFixed(2)}`,
      })

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
    setRecentItems((prev) => {
      const filtered = prev.filter((id) => id !== item.id)
      return [item.id, ...filtered].slice(0, 10)
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

  const startNewSession = async () => {
    try {
      await createSessionMutation.mutateAsync({
        terminalId: selectedTerminalId,
        userId,
        locationId: selectedLocationId,
        organizationId,
        openingBalance: 200.0,
      })
    } catch (error) {
      console.error("Failed to start new session:", error)
    }
  }

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 space-y-6 transition-colors duration-300 ${isDarkMode ? "dark" : ""}`}
    >
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">POS Terminal Enhanced</h2>
        <p className="text-gray-600">Enhanced POS terminal with session management coming soon...</p>
      </div>
    </div>
  )
}

export default pOSStationFinal
