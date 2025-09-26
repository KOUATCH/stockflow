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

import { NotificationSystem } from "@/components/synchro/NotificationSystem"
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
import { formatCurrency } from "@/lib/formatCurrency"
// import type { CartItem, Customer } from "@/types"
import {
  AlertTriangle,
  Banknote,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
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
} from "lucide-react"

import { useNotification } from "@/hooks/session-pos-sync/useNotifications"
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
  Wallet,
  Zap,
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
  const iconKey = Object.keys(CATEGORY_ICONS).find((key) => categoryName.toLowerCase().includes(key.toLowerCase())) as
    | keyof typeof CATEGORY_ICONS
    | undefined
  return CATEGORY_ICONS[iconKey ?? "default"] || CATEGORY_ICONS.default
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

export function ModernizedPOSTerminal({
  organizationId,
  locationId,
  terminalId,
  userId,
}: pOSStationProps): ReactElement {
  return POSTerminalFinal({ organizationId, locationId, terminalId, userId })
}

export function POSTerminalFinal({ organizationId, locationId, terminalId, userId }: pOSStationProps): ReactElement {
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
    cashDrawerTransactions?: Array<{
      id: string
      cashDrawer: {
        id: string
        currentBalance: number
        isOpen: boolean
        lastActivity?: Date
      }
    }>
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

  const notification = useNotification()

  const [isItemLoading, setIsItemLoading] = useState<string | null>(null)
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false)

  useEffect(() => {
    if (locationId && locationId !== selectedLocationId) {
      setSelectedLocationId(locationId)
    }
  }, [locationId, selectedLocationId])

  // Update available terminals when location changes
  useEffect(() => {
    if (!organizationId) return // Guard clause instead of early return

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
  }, [selectedLocationId, selectedTerminalId, organizationId])

  const {
    data: itemsData,
    error,
    isLoading: itemsLoading,
    refetch: refetchItems,
  } = useOrgItemsWithInventoryLevelsLocation(organizationId, selectedLocationId, {
    enabled: !!organizationId && !!selectedLocationId,
  })

  useEffect(() => {
    if (error && organizationId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: itemsData?.message || "Failed to load items.",
      })
    }
  }, [error, itemsData?.message, toast, organizationId])

  const items = itemsData?.data || []

  useEffect(() => {
    if (items.length > 0 && organizationId) {
      const favoriteItems = items.slice(0, 10).map((item) => item.id)
      setFavorites(favoriteItems)
    }
  }, [items, organizationId])

  useEffect(() => {
    if (selectedLocationId && organizationId) {
      console.log(`Location changed to: ${selectedLocationId}, refetching items...`)
      // Clear existing cache for all locations
      queryClient.removeQueries({ queryKey: ["items-with-inventory"] })
      // Invalidate and refetch for new location
      queryClient.invalidateQueries({
        queryKey: ["items-with-inventory", organizationId, selectedLocationId],
        exact: true,
      })
    }
  }, [selectedLocationId, organizationId, queryClient])

  useEffect(() => {
    if (selectedLocationId && organizationId && refetchItems) {
      console.log(`Triggering manual refetch for location: ${selectedLocationId}`)
      refetchItems()
    }
  }, [selectedLocationId, organizationId, refetchItems])

  useEffect(() => {
    if (selectedLocationId && cart.length > 0 && organizationId) {
      console.log(`Clearing cart due to location change from ${locationId} to ${selectedLocationId}`)
      clearCart()
      toast({
        title: "Location Changed",
        description: "Cart cleared due to location change. Items are now filtered for the new location.",
      })
    }
  }, [selectedLocationId, organizationId]) // Removed cart dependency to prevent infinite loops

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

  // Carousel navigation functions
  const scrollCarousel = (direction: "left" | "right") => {
    if (!carouselRef.current) return

    const itemWidth = 200 // Approximate width of each category card
    const scrollAmount = direction === "left" ? -itemWidth * 2 : itemWidth * 2

    carouselRef.current.scrollBy({
      left: scrollAmount,
      behavior: "smooth",
    })
  }

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

  useEffect(() => {
    if (!organizationId) return // Guard clause instead of early return

    // setCurrentSession()

    setCashDrawerStatus({
      isOpen: true,
      currentBalance: 200.0,
      lastActivity: new Date(),
    })
  }, [organizationId])

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

  const addToCart = (item: any) => {
    setIsItemLoading(item.id)

    // Simulate loading for better UX
    setTimeout(() => {
      const existingItem = cart.find((cartItem) => cartItem.itemId === item.id)

      if (existingItem) {
        setCart(
          cart.map((cartItem) =>
            cartItem.itemId === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem,
          ),
        )
        notification.info("Item Updated", `${item.name} quantity increased`)
      } else {
        const cartItem: CartItem = {
          id: item.id,
          itemId: item.id,
          name: item.name,
          price: item.sellingPrice,
          quantity: 1,
          sku: item.sku,
          discount: 0,
          // category: item.category?.title || "Uncategorized",
          taxRate: item.taxRate?.rate ?? 8.75,
          taxAmount: (item.sellingPrice * (item.taxRate?.rate ?? 8.75)) / 100,
          lineTotal: item.sellingPrice,
          imageUrl: item.thumbnail,
        }
        setCart([...cart, cartItem])
        notification.success("Item Added", `${item.name} added to cart`)
      }

      // Add to recent items
      setRecentItems((prev) => {
        const filtered = prev.filter((id) => id !== item.id)
        return [item.id, ...filtered].slice(0, 10)
      })

      setIsItemLoading(null)
      setShowSuccessAnimation(true)
      setTimeout(() => setShowSuccessAnimation(false), 1000)
    }, 300)
  }

  const processPayment = async () => {
    if (!currentSession) {
      notification.error("Session Required", "Please start a POS session first")
      return
    }

    if (cart.length === 0) {
      notification.warning("Empty Cart", "Please add items to cart before processing payment")
      return
    }

    try {
      setIsProcessing(true)
      setPaymentProgress(10)

      // Create sale first
      const saleData = {
        organizationId,
        locationId: selectedLocationId,
        terminalId: selectedTerminalId,
        userId,
        customerId: selectedCustomer?.id,
        lines: cart.map((item) => ({
          itemId: item.id,
          quantity: item.quantity,
          unitPrice: item.price,
          discount: 0,
          taxRate: 0.1, // 10% tax rate
          taxAmount: item.price * item.quantity * 0.1,
          lineTotal: item.price * item.quantity * 1.1,
        })),
        subtotal: calculateSubtotal(),
        taxAmount: calculateTax(),
        discount: calculateDiscount(),
        totalAmount: calculateTotal(),
        payments: [
          {
            method: paymentMethod.toString(),
            amount: calculateTotal(),
          },
        ],
        sessionId: currentSession.id,
      }

      setPaymentProgress(30)
      const saleResult = await createSaleMutation.mutateAsync(saleData)

      if (saleResult.success) {
        setPaymentProgress(60)

        const paymentData = {
          salesOrderId: saleResult.data.id,
          amount: calculateTotal(),
          method: paymentMethod, // Convert enum to string
          status: "completed" as const,
          organizationId,
          locationId: selectedLocationId,
          terminalId: selectedTerminalId,
          processedById: userId,
          sessionId: currentSession.id,
        }

        await createPaymentMutation.mutateAsync(paymentData)

        // Update inventory
        const inventoryUpdates = cart.map((item) => ({
          itemId: item.itemId,
          locationId: selectedLocationId,
          quantityChange: -item.quantity,
          organizationId, // Add organizationId as required by InventoryUpdate
        }))

        await updateInventoryMutation.mutateAsync(inventoryUpdates)

        // Create inventory transactions
        const transactions = cart.map((item) => ({
          itemId: item.itemId,
          locationId: selectedLocationId,
          organizationId,
          type: "sale" as const,
          quantity: item.quantity,
          unitCost: item.price,
          totalCost: item.price * item.quantity,
          referenceId: saleResult.data.id,
          referenceType: "salesOrder", // or the appropriate reference type string
          createdById: userId,
          serialNumbers: [], // or provide actual serial numbers if available
          userId,
        }))

        await createTransactionsMutation.mutateAsync(transactions)

        // Success notification with action
        notification.success("Sale Completed!", `Transaction total: ${formatCurrency(calculateTotal())}`, {
          duration: 8000,
          action: {
            label: "Print Receipt",
            onClick: () => setIsReceiptPreviewOpen(true),
          },
        })

        // Reset cart and close dialogs
        setCart([])
        setIsPaymentDialogOpen(false)
        setCashTendered("")
        setSelectedCustomer(null)
        setDiscountPercent(0)
        setSplitPayment(false)

        // Update session stats
        if (currentSession) {
          setCurrentSession((prev) =>
            prev
              ? {
                ...prev,
                totalSales: prev.totalSales + calculateTotal(),
                transactionCount: prev.transactionCount + 1,
              }
              : null,
          )
        }
      } else {
        throw new Error(saleResult?.error || "Sale creation failed")
      }
    } catch (error) {
      console.error("Payment processing failed:", error)
      notification.error("Payment Failed", error instanceof Error ? error.message : "An unexpected error occurred", {
        duration: 10000,
      })
    } finally {
      setIsProcessing(false)
      setPaymentProgress(0)
    }
  }

  const removeFromCart = (cartItemId: string) => {
    const item = cart.find((item) => item.id === cartItemId)
    setCart(cart.filter((item) => item.id !== cartItemId))

    if (item) {
      notification.info("Item Removed", `${item.name} removed from cart`)
    }
  }

  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId)
      return
    }

    const item = cart.find((item) => item.id === cartItemId)
    setCart(cart.map((item) => (item.id === cartItemId ? { ...item, quantity } : item)))

    if (item) {
      notification.info("Quantity Updated", `${item.name} quantity set to ${quantity}`)
    }
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

  useEffect(() => {
    const initializeSession = async () => {
      if (!organizationId) return // Guard clause instead of early return

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
          const newSessionResult = await createPOSSession({
            terminalId: selectedTerminalId,
            userId,
            locationId: selectedLocationId,
            organizationId,
            openingBalance: 200.0,
          })

          if (newSessionResult.success && newSessionResult.data) {
            const session = newSessionResult.data
            // setCurrentSession({})

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

    if (selectedTerminalId && userId && selectedLocationId && organizationId) {
      initializeSession()
    }
  }, [selectedTerminalId, userId, selectedLocationId, organizationId, toast])

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

  if (!organizationId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="p-4 rounded-full bg-red-100 inline-block mb-4">
            <AlertTriangle className="h-16 w-16 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Organization Required</h2>
          <p className="text-gray-600">User organization not found. Please contact support.</p>
        </div>
      </div>
    )
  }

  const toggleFavorite = (itemId: string) => {
    setFavorites((prevFavorites) => {
      if (prevFavorites.includes(itemId)) {
        return prevFavorites.filter((id) => id !== itemId)
      } else {
        return [...prevFavorites, itemId]
      }
    })
  }

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 space-y-6 transition-colors duration-300 ${isDarkMode ? "dark" : ""
        }`}
    >
      <NotificationSystem
        notifications={notification.notifications}
        onRemove={notification.removeNotification}
        soundEnabled={notification.soundEnabled}
        onToggleSound={notification.toggleSound}
      />

      {showSuccessAnimation && (
        <div className="fixed inset-0 pointer-events-none z-40 flex items-center justify-center">
          <div className="bg-green-500 text-white p-8 rounded-full animate-ping">
            <CheckCircle className="h-16 w-16" />
          </div>
        </div>
      )}

      {/* Header Section */}
      {/* <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-heading font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg">
              <Zap className="h-8 w-8" />
            </div>
            POS Terminal
          </h1>
          <p className="text-muted-foreground text-lg mt-1">Process sales and manage transactions QQQQQZX</p>
          {currentSession && (
            <div className="flex items-center gap-4 mt-3">
              <Badge variant="outline" className="flex items-center gap-2 px-3 py-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Session: {currentSession.startTime.toLocaleTimeString()} - #{currentSession.sessionNumber}
              </Badge>
              <Badge variant={cashDrawerStatus.isOpen ? "default" : "destructive"} className="flex items-center gap-2 px-3 py-1">
                <Wallet className="h-4 w-4" />
                Cash Drawer: {cashDrawerStatus.isOpen ? "Open" : "Closed"}
              </Badge>
              <Badge variant="secondary" className="px-3 py-1 font-medium">
                Balance: {formatCurrency(Number(cashDrawerStatus.currentBalance.toFixed(2)))}
              </Badge>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCustomerDisplay(!showCustomerDisplay)}
            className="flex items-center gap-2 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all"
          >
            <Eye className="h-4 w-4" />
            Customer Display
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all"
          >
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <div className="text-right bg-white/80 backdrop-blur-sm rounded-lg px-4 py-2 shadow-sm">
            <div className="text-lg font-semibold text-foreground">{currentTime.toLocaleTimeString()}</div>
            <div className="text-sm text-muted-foreground">{currentTime.toLocaleDateString()}</div>
          </div>
        </div>
      </div> */}

      <div className="flex items-center justify-between bg-red-700/10 p-4 rounded-lg shadow-md">
        <div>
          <h1 className="text-4xl font-heading font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg">
              <Zap className="h-8 w-8" />
            </div>
            POS Terminal
          </h1>
          <p className="text-muted-foreground text-lg mt-1">
            Process sales and manage transactions Cash system Terminal Final POSTF
          </p>
          {currentSession && (
            <div className="flex items-center gap-4 mt-3">
              <Badge variant="outline" className="flex items-center gap-2 px-3 py-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Session: {currentSession.startTime.toLocaleTimeString()} - #{currentSession.sessionNumber}
              </Badge>
              <Badge
                variant={cashDrawerStatus.isOpen ? "default" : "destructive"}
                className="flex items-center gap-2 px-3 py-1"
              >
                <Wallet className="h-4 w-4" />
                Cash Drawer: {cashDrawerStatus.isOpen ? "Open" : "Closed"}
              </Badge>
              <Badge variant="secondary" className="px-3 py-1 font-medium">
                Balance: {formatCurrency(Number(cashDrawerStatus.currentBalance.toFixed(2)))}
              </Badge>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCustomerDisplay(!showCustomerDisplay)}
            className="flex items-center gap-2 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all"
          >
            <Eye className="h-4 w-4" />
            Customer Display
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all"
          >
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <div className="text-right bg-white/80 backdrop-blur-sm rounded-lg px-4 py-2 shadow-sm">
            <div className="text-lg font-semibold text-foreground">{currentTime.toLocaleTimeString()}</div>
            <div className="text-sm text-muted-foreground">{currentTime.toLocaleDateString()}</div>
          </div>
        </div>
      </div>

      {/* Stats Card */}
      <Card className="bg-gradient-to-r from-emerald-500 via-emerald-600 to-blue-600 border-0 shadow-xl text-white overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-blue-500/20 backdrop-blur-3xl"></div>
        <CardContent className="p-2 relative z-10">
          <div className="grid grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-xl font-bold mb-1">${currentSession?.totalSales.toFixed(2) || "0.00"}</div>
              <div className="text-emerald-100 font-medium">Session Sales</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold mb-1">{currentSession?.transactionCount || 0}</div>
              <div className="text-emerald-100 font-medium">Transactions</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold mb-1">${salesStats.avgTransaction.toFixed(2)}</div>
              <div className="text-emerald-100 font-medium">Avg Transaction</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold mb-1">{formatCurrency(cashDrawerStatus.currentBalance)}</div>
              <div className="text-emerald-100 font-medium">Cash Balance</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {!currentSession && (
        <Alert className="border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 shadow-md">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          <AlertDescription className="text-amber-800 font-medium">
            No active POS session. Please start a session to process transactions.
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <Search className="h-4 w-4 text-blue-600" />
                  Product Search
                  <Badge variant="secondary" className="ml-auto">
                    <Keyboard className="h-3 w-3 mr-1" />
                    Ctrl+F
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Category Carousel Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-lg font-semibold text-gray-800">Browse Categories</Label>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="px-3 py-1">
                          {Array.isArray(categories) ? categories.length : 0} categories
                        </Badge>
                        <div className="flex gap-1">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0 bg-white shadow-sm"
                            onClick={() => scrollCarousel("left")}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0 bg-white shadow-sm"
                            onClick={() => scrollCarousel("right")}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Category Carousel */}
                    <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 p-4">
                      <div
                        ref={carouselRef}
                        className="flex gap-4 overflow-x-auto scroll-smooth pb-2 scrollbar-hide"
                        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                      >
                        {/* All Items Card */}
                        <div
                          className={`flex-shrink-0 w-15 group cursor-pointer transition-all duration-300 hover:scale-105 ${selectedCategory === "all" ? "transform scale-105" : ""
                            }`}
                          onClick={() => setSelectedCategory("all")}
                        >
                          <div
                            className={`p-1 rounded-lg border-2 transition-all duration-300 ${selectedCategory === "all"
                              ? "border-blue-500 bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg"
                              : "border-gray-200 bg-white/80 backdrop-blur-sm hover:border-blue-300 hover:shadow-md"
                              }`}
                          >
                            <div className="flex flex-col items-center text-center">
                              <div
                                className={`p-3 rounded-full mb-3 ${selectedCategory === "all"
                                  ? "bg-white/20"
                                  : "bg-gradient-to-br from-blue-500 to-blue-600"
                                  }`}
                              >
                                <Grid3X3
                                  className={`h-4 w-4 ${selectedCategory === "all" ? "text-white" : "text-white"}`}
                                />
                              </div>
                              <h3
                                className={`font-semibold text-sm mb-2 ${selectedCategory === "all" ? "text-white" : "text-gray-800"
                                  }`}
                              >
                                All Items
                              </h3>
                              <Badge
                                variant={selectedCategory === "all" ? "secondary" : "outline"}
                                className="bg-white/20 text-xs"
                              >
                                {items?.length || 0} items
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {/* Dynamic Category Cards */}
                        {categoriesArray.map((category) => {
                          const cat = category as { id: string; title: string }
                          const IconComponent = getCategoryIcon(String(cat.title || ""))
                          const categoryItemCount = items?.filter((item) => item?.category?.id === cat.id).length || 0
                          const isSelected = selectedCategory === cat.id

                          return (
                            <div
                              key={cat.id}
                              className={`flex-shrink-0 w-15 group cursor-pointer transition-all duration-300 hover:scale-105 ${isSelected ? "transform scale-105" : ""
                                }`}
                              onClick={() => setSelectedCategory(cat.id)}
                            >
                              <div
                                className={`p-2 rounded-xl border-2 transition-all duration-300 ${isSelected
                                  ? "border-emerald-500 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg"
                                  : "border-gray-200 bg-white/80 backdrop-blur-sm hover:border-emerald-300 hover:shadow-md"
                                  }`}
                              >
                                <div className="flex flex-col items-center text-center">
                                  <div
                                    className={`p-3 rounded-full mb-3 ${isSelected ? "bg-white/20" : "bg-gradient-to-br from-emerald-500 to-emerald-600"
                                      }`}
                                  >
                                    <IconComponent className={`h-4 w-4 ${isSelected ? "text-white" : "text-white"}`} />
                                  </div>
                                  <h3
                                    className={`font-semibold text-sm mb-2 ${isSelected ? "text-white" : "text-gray-800"
                                      }`}
                                  >
                                    {cat.title}
                                  </h3>
                                  <Badge variant={isSelected ? "secondary" : "outline"} className="bg-white/20 text-xs">
                                    {categoryItemCount} items
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          )
                        })}

                        {/* Special Categories */}
                        <div
                          className={`flex-shrink-0 w-15 group cursor-pointer transition-all duration-300 hover:scale-105 ${selectedCategory === "favorites" ? "transform scale-105" : ""
                            }`}
                          onClick={() => setSelectedCategory("favorites")}
                        >
                          <div
                            className={`p-3 rounded-xl border-2 transition-all duration-300 ${selectedCategory === "favorites"
                              ? "border-yellow-500 bg-gradient-to-br from-yellow-500 to-orange-500 text-white shadow-lg"
                              : "border-gray-200 bg-white/80 backdrop-blur-sm hover:border-yellow-300 hover:shadow-md"
                              }`}
                          >
                            <div className="flex flex-col items-center text-center">
                              <div
                                className={`p-3 rounded-full mb-3 ${selectedCategory === "favorites"
                                  ? "bg-white/20"
                                  : "bg-gradient-to-br from-yellow-500 to-orange-500"
                                  }`}
                              >
                                <Star
                                  className={`h-4 w-4 ${selectedCategory === "favorites" ? "text-white" : "text-white"
                                    }`}
                                />
                              </div>
                              <h3
                                className={`font-semibold text-sm mb-2 ${selectedCategory === "favorites" ? "text-white" : "text-gray-800"
                                  }`}
                              >
                                Favorites
                              </h3>
                              <Badge
                                variant={selectedCategory === "favorites" ? "secondary" : "outline"}
                                className="bg-white/20 text-xs"
                              >
                                {favorites.length} items
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <div
                          className={`flex-shrink-0 w-15 group cursor-pointer transition-all duration-300 hover:scale-105 ${selectedCategory === "recent" ? "transform scale-105" : ""
                            }`}
                          onClick={() => setSelectedCategory("recent")}
                        >
                          <div
                            className={`p-3 rounded-xl border-2 transition-all duration-300 ${selectedCategory === "recent"
                              ? "border-purple-500 bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg"
                              : "border-gray-200 bg-white/80 backdrop-blur-sm hover:border-purple-300 hover:shadow-md"
                              }`}
                          >
                            <div className="flex flex-col items-center text-center">
                              <div
                                className={`p-3 rounded-full mb-3 ${selectedCategory === "recent"
                                  ? "bg-white/20"
                                  : "bg-gradient-to-br from-purple-500 to-purple-600"
                                  }`}
                              >
                                <Clock
                                  className={`h-4 w-4 ${selectedCategory === "recent" ? "text-white" : "text-white"}`}
                                />
                              </div>
                              <h3
                                className={`font-semibold text-sm mb-2 ${selectedCategory === "recent" ? "text-white" : "text-gray-800"
                                  }`}
                              >
                                Recent
                              </h3>
                              <Badge
                                variant={selectedCategory === "recent" ? "secondary" : "outline"}
                                className="bg-white/20 text-xs"
                              >
                                {recentItems.length} items
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2 bg-white/80 backdrop-blur-sm hover:shadow-md transition-all"
                      onClick={() => setDiscountPercent(discountPercent > 0 ? 0 : 10)}
                    >
                      <Percent className="h-4 w-4" />
                      {discountPercent > 0 ? `${discountPercent}% OFF` : "Add Discount"}
                    </Button>
                  </div>

                  {/* Search Section */}
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="search-input"
                        placeholder="Search by name, SKU, or scan barcode..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-12 h-12 bg-white/80 backdrop-blur-sm border-gray-200 shadow-sm focus:shadow-md transition-all"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      className="px-4 bg-white/80 backdrop-blur-sm hover:shadow-md transition-all"
                    >
                      <Scan className="h-5 w-5" />
                    </Button>
                  </div>

                  {/* Current Category Display */}
                  {selectedCategory !== "all" && selectedCategory !== "favorites" && selectedCategory !== "recent" && (
                    <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                      {(() => {
                        const cat = categoriesArray.find((cat) => cat.id === selectedCategory)
                        if (cat) {
                          const IconComponent = getCategoryIcon(cat?.title ?? "")
                          return (
                            <>
                              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
                                <IconComponent className="h-4 w-4 text-white" />
                              </div>
                              <span className="font-semibold text-lg text-blue-800">Showing {cat?.title || ""}</span>
                              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                {filteredItems?.length || 0} items
                              </Badge>
                            </>
                          )
                        }
                        return null
                      })()}
                    </div>
                  )}

                  {/* Items Grid */}
                  <div className="grid grid-cols-4 gap-4 max-h-96 overflow-y-auto pr-2">
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
                            className={`group relative flex flex-col p-4 rounded-xl border-2 hover:shadow-xl cursor-pointer transition-all duration-300 hover:scale-105 bg-white/80 backdrop-blur-sm ${isLowStock ? "border-orange-300 bg-gradient-to-br from-orange-50 to-orange-100" : ""
                              } ${isOutOfStock
                                ? "border-red-300 bg-gradient-to-br from-red-50 to-red-100 opacity-60 cursor-not-allowed"
                                : "border-gray-200 hover:border-emerald-300"
                              }`}
                            onClick={() => !isOutOfStock && addToCart(item)}
                          >
                            <div className="relative mb-3">
                              <div className="w-full h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                                {item.thumbnail ? (
                                  <img
                                    src={item.thumbnail || "/placeholder.svg"}
                                    alt={item.name}
                                    className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                  />
                                ) : (
                                  <ImageIcon className="h-10 w-10 text-gray-400" />
                                )}
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute top-2 right-2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 backdrop-blur-sm hover:bg-white"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toggleFavorite(item.id)
                                }}
                              >
                                <Star
                                  className={`h-4 w-4 ${isFavorite ? "text-yellow-500 fill-current" : "text-gray-400"}`}
                                />
                              </Button>
                            </div>

                            <div className="flex-1 mb-4">
                              <div className="font-semibold text-card-foreground text-sm leading-tight mb-2">
                                {item.name}
                              </div>
                              <div className="text-xs text-muted-foreground mb-2">SKU: {item.sku}</div>
                              <div className="flex items-center gap-2 mb-2">
                                <div
                                  className={`text-xs font-medium ${isLowStock ? "text-orange-600" : isOutOfStock ? "text-red-600" : "text-emerald-600"
                                    }`}
                                >
                                  Stock: {stockLevel}
                                </div>
                                {isLowStock && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs px-2 py-0 text-orange-600 border-orange-300 bg-orange-50"
                                  >
                                    Low
                                  </Badge>
                                )}
                              </div>
                              <Progress value={Math.min((stockLevel / 20) * 100, 100)} className="h-2 mb-3" />
                            </div>

                            <div className="flex flex-col items-center gap-3">
                              <div className="font-bold text-emerald-600 text-xl">
                                ${item?.sellingPrice?.toFixed(2)}
                              </div>
                              <Button
                                type="button"
                                size="sm"
                                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 shadow-md transition-all"
                                disabled={isOutOfStock}
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                {isOutOfStock ? "Out of Stock" : "Add"}
                              </Button>
                            </div>
                          </div>
                        )
                      })
                    ) : (
                      <div className="col-span-4 flex flex-col items-center justify-center py-12 text-center">
                        <div className="p-4 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 mb-4">
                          <PackageIcon className="h-16 w-16 text-gray-400" />
                        </div>
                        <p className="text-gray-600 font-semibold text-lg mb-2">No items found</p>
                        <p className="text-sm text-muted-foreground max-w-md">
                          {selectedCategory === "all"
                            ? "Try adjusting your search terms or check if items are available in this location"
                            : "Try selecting a different category or adjust your search"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50 border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <ShoppingCart className="h-4 w-4 text-emerald-600" />
                    Cart ({cart.length})
                    {cart.length > 0 && (
                      <Badge className="bg-emerald-500 text-white px-3 py-1">${calculateTotal().toFixed(2)}</Badge>
                    )}
                  </CardTitle>
                  {cart.length > 0 && (
                    <Button type="button" variant="ghost" size="sm" onClick={clearCart}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 justify-start bg-white/80 backdrop-blur-sm hover:shadow-md transition-all"
                      onClick={() => setIsCustomerDialogOpen(true)}
                    >
                      <User className="mr-2 h-4 w-4" />
                      {selectedCustomer ? selectedCustomer.name : "Select Customer"}
                    </Button>
                  </div>
                  <Separator />

                  {isProcessing && (
                    <div className="space-y-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                      <div className="flex items-center gap-3 text-sm font-medium text-blue-800">
                        <Volume2 className="h-5 w-5 animate-pulse" />
                        Processing payment...
                      </div>
                      <Progress value={paymentProgress} className="h-3" />
                    </div>
                  )}

                  <ScrollArea className="h-64">
                    <div className="space-y-3">
                      {cart.map((item) => (
                        <div
                          key={item.id}
                          className="p-4 rounded-xl border border-gray-200 bg-white/60 backdrop-blur-sm hover:shadow-md transition-all"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="font-semibold text-card-foreground text-sm">{item.name}</div>
                              <div className="text-xs text-muted-foreground">{item.sku}</div>
                            </div>
                            <Button type="button" variant="ghost" size="sm" onClick={() => removeFromCart(item.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-2">
                              <Label className="text-xs font-medium">Qty:</Label>
                              <Input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => updateQuantity(item.id, Number.parseInt(e.target.value) || 1)}
                                className="w-18 h-8 text-center bg-white"
                              />
                            </div>
                            <div className="text-sm font-bold text-emerald-600">${item.lineTotal.toFixed(2)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>

                  {cart.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <div className="p-4 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 inline-block mb-4">
                        <ShoppingCart className="h-16 w-16 opacity-50" />
                      </div>
                      <p className="font-semibold text-lg mb-2">Cart is empty</p>
                      <p className="text-sm">Add items to start a transaction</p>
                    </div>
                  )}

                  {cart.length > 0 && (
                    <>
                      <Separator />
                      <div className="space-y-3 bg-gradient-to-r from-emerald-50 to-green-50 p-4 rounded-xl border border-emerald-200">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">Subtotal:</span>
                          <span>${calculateSubtotal().toFixed(2)}</span>
                        </div>
                        {discountPercent > 0 && (
                          <div className="flex justify-between text-sm text-green-600">
                            <span className="font-medium">Discount ({discountPercent}%):</span>
                            <span>-${calculateDiscount().toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">Tax:</span>
                          <span>${calculateTax().toFixed(2)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-bold text-xl">
                          <span>Total:</span>
                          <span className="text-emerald-600">${calculateTotal().toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Button
                          type="submit"
                          className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all h-12 text-lg font-semibold"
                          disabled={isProcessing || !currentSession || cart.length === 0}
                        >
                          <CreditCard className="mr-3 h-5 w-5" />
                          {isProcessing ? "Processing..." : "Complete Sale"}
                          <Badge className="ml-3 bg-white/20 text-white">Ctrl+Enter</Badge>
                        </Button>

                        <div className="grid grid-cols-2 gap-3">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setSplitPayment(!splitPayment)}
                            className="flex items-center gap-2 bg-white/80 backdrop-blur-sm hover:shadow-md transition-all"
                          >
                            <Split className="h-4 w-4" />
                            Split Pay
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setIsReceiptPreviewOpen(true)}
                            className="flex items-center gap-2 bg-white/80 backdrop-blur-sm hover:shadow-md transition-all"
                          >
                            <Receipt className="h-4 w-4" />
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

      {/* Customer Display */}
      {showCustomerDisplay && (
        <Card className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white border-0 shadow-2xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-3xl font-bold">Customer Display</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6 pb-8">
            <div className="text-6xl font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
              ${calculateTotal().toFixed(2)}
            </div>
            <div className="text-2xl font-medium text-blue-200">Total Amount</div>
            {cart.length > 0 && (
              <div className="space-y-3 max-w-md mx-auto">
                <Separator className="bg-white/20" />
                <div className="text-lg font-medium text-blue-200 mb-4">Recent Items</div>
                {cart.slice(-3).map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center text-base bg-white/10 backdrop-blur-sm rounded-lg p-3"
                  >
                    <span className="text-white font-medium">
                      {item.name} x{item.quantity}
                    </span>
                    <span className="text-emerald-400 font-bold">${item.lineTotal.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Customer Dialog */}
      {/* Customer Dialog */}
      <Dialog open={isCustomerDialogOpen} onOpenChange={setIsCustomerDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl">Select Customer</DialogTitle>
            <DialogDescription>Choose a customer for this transaction</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            <div className="space-y-3">
              {customersArray?.map((customer) => (
                <div
                  key={customer.id}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md ${selectedCustomer?.id === customer.id
                    ? "border-emerald-500 bg-gradient-to-r from-emerald-50 to-green-50"
                    : "border-gray-200 hover:border-emerald-300 bg-white"
                    }`}
                  onClick={() => {
                    setSelectedCustomer(customer)
                    setIsCustomerDialogOpen(false)
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-gradient-to-br from-blue-500 to-blue-600">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{customer.name}</div>
                      {customer.phone && <div className="text-sm text-muted-foreground">{customer.phone}</div>}
                    </div>
                    {selectedCustomer?.id === customer.id && (
                      <CheckCircle className="h-5 w-5 text-emerald-500 ml-auto" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl">Process Payment</DialogTitle>
            <DialogDescription>
              Complete the transaction for{" "}
              <span className="font-bold text-emerald-600">{formatCurrency(calculateTotal())}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="space-y-4">
              <Label className="text-base font-semibold">Payment Method</Label>
              <div className="grid grid-cols-3 gap-3">
                <Button
                  type="button"
                  variant={paymentMethod === PaymentMethod.CASH ? "default" : "outline"}
                  onClick={() => setPaymentMethod(PaymentMethod.CASH)}
                  className={`flex items-center gap-2 h-16 ${paymentMethod === PaymentMethod.CASH
                    ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white"
                    : ""
                    }`}
                >
                  <Banknote className="h-5 w-5" />
                  <span className="font-medium">Cash</span>
                </Button>
                <Button
                  type="button"
                  variant={paymentMethod === PaymentMethod.CARD ? "default" : "outline"}
                  onClick={() => setPaymentMethod(PaymentMethod.CARD)}
                  className={`flex items-center gap-2 h-16 ${paymentMethod === PaymentMethod.CARD ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white" : ""
                    }`}
                >
                  <CreditCard className="h-5 w-5" />
                  <span className="font-medium">Card</span>
                </Button>
                <Button
                  type="button"
                  variant={paymentMethod === PaymentMethod.DIGITAL ? "default" : "outline"}
                  onClick={() => setPaymentMethod(PaymentMethod.DIGITAL)}
                  className={`flex items-center gap-2 h-16 ${paymentMethod === PaymentMethod.DIGITAL
                    ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white"
                    : ""
                    }`}
                >
                  <Smartphone className="h-5 w-5" />
                  <span className="font-medium">Digital</span>
                </Button>
              </div>
            </div>

            {paymentMethod === PaymentMethod.CASH && (
              <div className="space-y-3">
                <Label htmlFor="cashTendered" className="text-base font-semibold">
                  Cash
                </Label>
                <Input
                  id="cashTendered"
                  type="number"
                  step="0.01"
                  min={calculateTotal()}
                  value={cashTendered}
                  onChange={(e) => setCashTendered(e.target.value)}
                  placeholder={calculateTotal().toFixed(2)}
                  className="h-12 text-lg"
                />
                {Number.parseFloat(cashTendered) > 0 && (
                  <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                    <div className="text-lg font-bold text-green-700">Change: ${calculateChange().toFixed(2)}</div>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-3 bg-gradient-to-r from-gray-50 to-slate-50 p-4 rounded-xl border border-gray-200">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Subtotal:</span>
                <span>${calculateSubtotal().toFixed(2)}</span>
              </div>
              {discountPercent > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span className="font-medium">Discount ({discountPercent}%):</span>
                  <span>-${calculateDiscount().toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="font-medium">Tax:</span>
                <span>${calculateTax().toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span className="text-emerald-600">${calculateTotal().toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsPaymentDialogOpen(false)}
                className="flex-1 h-12"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={processPayment}
                disabled={
                  isProcessing ||
                  (paymentMethod === PaymentMethod.CASH && Number.parseFloat(cashTendered) < calculateTotal())
                }
                className="flex-1 h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700"
              >
                {isProcessing ? "Processing..." : "Complete Payment"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}

export default ModernizedPOSTerminal
