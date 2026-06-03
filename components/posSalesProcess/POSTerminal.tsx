"use client"

import {
  createPOSSession,
  createSale,
  getActivePOSSession
} from "@/actions/posSalesProcess/posActions"

import type { Customer } from "@/lib/cashSystem/db"
import type { CartItem } from "@/lib/cashSystem/types"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import React from "react"
import type { ReactElement } from "react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

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

import { useNotifications } from "@/components/notifications/NotificationProvider"
import { useCustomers } from "@/hooks/posSalesProcess/usePOSHooks"
import { useOrgCategories } from "@/hooks/useAllCategoriesqueries"
import { useOrgItemsWithInventoryLevelsLocation } from "@/hooks/useAllItemQueries"
import { useAuth } from "@/hooks/useAuth"
import ReceiptPreviewDialog from "@/components/receipts/ReceiptPreviewDialog"
import SalesReceiptModal from "@/components/receipts/SalesReceiptModal"
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


import { cn } from "@/lib/utils"

// Constants
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

const PAYMENT_PROCESSING_CONSTANTS = {
  PROGRESS_INTERVAL: 200,
  MAX_PROGRESS_BEFORE_COMPLETION: 90,
  PROGRESS_INCREMENT: 10,
  ITEM_LOADING_DELAY: 300,
  SUCCESS_ANIMATION_DURATION: 1000,
} as const

const STOCK_THRESHOLDS = {
  LOW_STOCK: 5,
  OUT_OF_STOCK: 0,
} as const

const getCategoryIcon = (categoryName: string) => {
  const iconKey = Object.keys(CATEGORY_ICONS).find((key) => categoryName.toLowerCase().includes(key.toLowerCase())) as
    | keyof typeof CATEGORY_ICONS
    | undefined
  return CATEGORY_ICONS[iconKey ?? "default"] || CATEGORY_ICONS.default
}

// Enums and Types
enum PaymentMethod {
  CASH = "CASH",
  CARD = "CARD",
  DIGITAL = "DIGITAL",
}

enum POSSessionStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

interface SessionData {
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
}

interface CashDrawerStatus {
  isOpen: boolean
  currentBalance: number
  lastActivity?: Date
}

interface POSStationProps {
  organizationId: string
  locationId: string
  stationId: string
  userId: string
}

export function ModernizedPOSTerminal({
  organizationId,
  locationId,
  stationId,
  userId,
}: POSStationProps): ReactElement {
  return POSTerminalFinal({ organizationId, locationId, stationId, userId })
}

export function POSTerminalFinal({ organizationId, locationId, stationId, userId }: POSStationProps): ReactElement {

  // const { data: sessionData } = useSession()
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
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false)
  const [completedSaleData, setCompletedSaleData] = useState<any>(null)
  const [lastSaleData, setLastSaleData] = useState<any>(null)

  const [selectedLocationId, setSelectedLocationId] = useState<string>(locationId)
  const [selectedstationId, setSelectedstationId] = useState<string>(stationId)
  const [availableTerminals, setAvailableTerminals] = useState<any[]>([])

  // Carousel state
  const [carouselIndex, setCarouselIndex] = useState(0)
  const carouselRef = useRef<HTMLDivElement>(null)

  const [currentSession, setCurrentSession] = useState<SessionData | null>(null)

  const [cashDrawerStatus, setCashDrawerStatus] = useState<CashDrawerStatus>({
    isOpen: false,
    currentBalance: 0,
  })

  const [salesStats, setSalesStats] = useState({
    todaySales: 2450.75,
    transactionCount: 18,
    avgTransaction: 136.15,
  })

  const queryClient = useQueryClient()
  const notifications = useNotifications()
  const { success, error, warning, info, operationStart, operationComplete } = notifications

  const [isItemLoading, setIsItemLoading] = useState<string | null>(null)
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false)

  useEffect(() => {
    if (locationId && locationId !== selectedLocationId) {
      setSelectedLocationId(locationId)
    }
  }, [locationId, selectedLocationId])

  const { user: sessionData } = useAuth()
  const isMissingSessionOrganization = !sessionData?.organizationId
  const {
    data: itemsDBData,
    error: itemsDBError,
    isLoading: itemsDBLoading,
    refetch: refetchDBItems,
  } = useOrgItemsWithInventoryLevelsLocation(organizationId, selectedLocationId, {
    enabled: !!organizationId && !!selectedLocationId,
  })


  useEffect(() => {
    if (itemsDBError && organizationId) {
      console.error("Failed to load items:", itemsDBError)
      error("Failed to Load Items", itemsDBData?.message || "Failed to load items.")
    }
  }, [itemsDBError, itemsDBData?.message, error, organizationId])

  const items = itemsDBData?.data || []

  useEffect(() => {
    if (items.length > 0 && organizationId) {
      const favoriteItems = items.slice(0, 10).map((item: any) => item.id)
      setFavorites(favoriteItems)
    }
  }, [items, organizationId])

  useEffect(() => {
    if (selectedLocationId && organizationId) {
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
    if (selectedLocationId && organizationId && refetchDBItems) {
      refetchDBItems()
    }
  }, [selectedLocationId, organizationId, refetchDBItems])

  const clearCart = useCallback(() => {
    setCart([])
    setSelectedCustomer(null)
    setDiscountPercent(0)
  }, [])

  const previousLocationId = useRef(selectedLocationId)

  useEffect(() => {
    if (selectedLocationId !== previousLocationId.current && cart.length > 0 && organizationId) {
      clearCart()
      info("Location Changed", "Cart cleared due to location change. Items are now filtered for the new location.")
    }
    previousLocationId.current = selectedLocationId
  }, [selectedLocationId, organizationId, info, clearCart])

  const categoriesData = useOrgCategories(organizationId)
  const categories = categoriesData?.data?.data || []

  const categoriesArray = useMemo(() => {
    return Array.isArray(categories) ? categories : categories || []
  }, [categories])

  const customersData = useCustomers(organizationId)
  const customers = customersData?.data?.data || []

  const customersArray = useMemo(() => {
    return Array.isArray(customers) ? customers : customers || []
  }, [customers])

  // Debug customers data
  console.log("🛒 POSTerminal Customers debug:", {
    organizationId,
    customersData,
    customers,
    customersArray,
    customersDataLoading: customersData?.isLoading,
    customersDataError: customersData?.error
  })

  // Carousel navigation functions
  const scrollCarousel = useCallback((direction: "left" | "right") => {
    if (!carouselRef.current) return

    const itemWidth = 200 // Approximate width of each category card
    const scrollAmount = direction === "left" ? -itemWidth * 2 : itemWidth * 2

    carouselRef.current.scrollBy({
      left: scrollAmount,
      behavior: "smooth",
    })
  }, [])

  const createSaleMutation = useMutation<any, unknown, any>({
    meta: { operation: 'create', entity: 'Sale' , suppressSuccessNotification: true, suppressErrorNotification: true },
    mutationFn: (data: any) => createSale(data, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales-orders"] })
      queryClient.invalidateQueries({ queryKey: ["inventory-levels"] })
      queryClient.invalidateQueries({ queryKey: ["items-with-inventory"] })
    },
    onError: (err) => {
      error("Sales Failed", "Failed to create sales. Please try again.")
    },
  })

  useEffect(() => {
    if (!organizationId) return // Guard clause instead of early return

    // setCurrentSession({
    //   id: session.id,
    //   sessionNumber: session.sessionNumber,
    //   status: session.status as POSSessionStatus,
    //   startTime: new Date(session.startTime),
    //   openingBalance: session.openingBalance,
    //   totalSales: session.totalSales,
    //   transactionCount: session.transactionCount,
    //   cashTotal: 0,
    //   cardTotal: 0,
    //   digitalTotal: 0,
    // })

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

    const filtered = items.filter((item: any) => {
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

  const addToCart = useCallback((item: any) => {
    setIsItemLoading(item.id)

    // Simulate loading for better UX
    setTimeout(() => {
      const existingItem = cart.find((cartItem) => cartItem.itemId === item.id)

      const taxRate = item.taxRate?.rate ?? 8.75
      const lineTotal = item.sellingPrice * (existingItem ? existingItem.quantity + 1 : 1)

      if (existingItem) {
        setCart(
          cart.map((cartItem) =>
            cartItem.itemId === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem,
          ),
        )
        info("Item Updated", `${item.name} quantity increased`)
      } else {
        const cartItem: CartItem = {
          id: item.id,
          itemId: item.id,
          name: item.name,
          price: item.sellingPrice,
          quantity: 1,
          sku: item.sku,
          discount: item.discount || 0,
          taxRate: taxRate,
          taxAmount: (item.sellingPrice * taxRate) / 100,
          lineTotal: lineTotal,
          imageUrl: item.thumbnail,
        }
        setCart([...cart, cartItem])
        success("Item Added", `${item.name} added to cart`)
      }

      // Add to recent items
      setRecentItems((prev) => {
        const filtered = prev.filter((id) => id !== item.id)
        return [item.id, ...filtered].slice(0, 10)
      })

      setIsItemLoading(null)
      setShowSuccessAnimation(true)
      setTimeout(() => setShowSuccessAnimation(false), PAYMENT_PROCESSING_CONSTANTS.SUCCESS_ANIMATION_DURATION)
    }, PAYMENT_PROCESSING_CONSTANTS.ITEM_LOADING_DELAY)
  }, [cart, info, success])

  const removeFromCart = useCallback((cartItemId: string) => {
    const item = cart.find((item) => item.id === cartItemId)
    setCart(cart.filter((item) => item.id !== cartItemId))

    if (item) {
      info("Item Removed", `${item.name} removed from cart`)
    }
  }, [cart, info])

  const updateQuantity = useCallback((cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId)
      return
    }

    const cartItem = cart.find((item) => item.id === cartItemId)
    if (!cartItem) return

    const item = items?.find((i: any) => i.id === cartItem.itemId)
    const availableStock = item?.inventoryLevels?.[0]?.quantityAvailable ?? 0

    if (item && quantity > availableStock && availableStock > 0) {
      warning("Stock Limit Reached", `Only ${availableStock} of ${item.name} available in stock.`)
      setCart(
        cart.map((item) =>
          item.id === cartItemId
            ? {
              ...item,
              quantity: availableStock,
              lineTotal: item.price * availableStock,
              taxAmount: (item.price * availableStock * item.taxRate) / 100,
            }
            : item,
        ),
      )
      return
    } else if (item && availableStock === 0) {
      error("Out of Stock", `${item.name} is out of stock.`)
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
  }, [cart, items, removeFromCart, warning, error])

  const calculateSubtotal = useCallback(() => {
    return cart.reduce((sum, item) => sum + item.lineTotal, 0)
  }, [cart])

  const calculateDiscount = useCallback(() => {
    return (calculateSubtotal() * discountPercent) / 100
  }, [calculateSubtotal, discountPercent])

  const calculateTax = useCallback(() => {
    return cart.reduce((sum, item) => sum + item.taxAmount, 0)
  }, [cart])

  const calculateTotal = useCallback(() => {
    return calculateSubtotal() - calculateDiscount() + calculateTax()
  }, [calculateSubtotal, calculateDiscount, calculateTax])

  const calculateChange = useCallback(() => {
    const tendered = Number.parseFloat(cashTendered) || 0
    return Math.max(0, tendered - calculateTotal())
  }, [cashTendered, calculateTotal])

  const validateInventory = useCallback(() => {
    for (const cartItem of cart) {
      const item = items?.find((i: any) => i.id === cartItem.itemId)
      const availableStock = item?.inventoryLevels?.[0]?.quantityAvailable ?? 0

      if (cartItem.quantity > availableStock) {
        return {
          valid: false,
          message: `Insufficient stock for ${item?.name}. Available: ${availableStock}, Required: ${cartItem.quantity}`,
        }
      }
    }
    return { valid: true, message: "" }
  }, [cart, items])

  const validatePayment = useCallback(() => {
    if (!currentSession) {
      return { valid: false, message: "No active POS session" }
    }
    if (cart.length === 0) {
      return { valid: false, message: "Cart is empty" }
    }
    if (!selectedCustomer?.id) {
      return { valid: false, message: "No customer selected" }
    }
    if (paymentMethod === PaymentMethod.CASH) {
      const cashAmount = Number.parseFloat(cashTendered) || 0
      if (cashAmount < calculateTotal()) {
        return { valid: false, message: "Insufficient cash tendered" }
      }
    }
    return validateInventory()
  }, [currentSession, cart.length, selectedCustomer?.id, paymentMethod, cashTendered, calculateTotal, validateInventory])

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (cart.length === 0) {
      warning("Empty Cart", "Please add items to cart before processing payment.")
      return
    }
    if (!selectedCustomer) {
      error("Customer Required", "Please select a customer before completing the sale.")
      return
    }
    setIsPaymentDialogOpen(true)
  }, [cart.length, selectedCustomer, warning, error])

  useEffect(() => {
    const initializeSession = async () => {
      if (!organizationId || currentSession) {
        console.log("Skipping session initialization:", { organizationId: !!organizationId, hasSession: !!currentSession })
        return // Don't initialize if we already have a session or missing org ID
      }

      try {
        console.log("Attempting to get active session for terminal:", selectedstationId)
        const existingSessionResult = await getActivePOSSession(selectedstationId)
        console.log("Session retrieval result:", existingSessionResult)

        if (existingSessionResult.success && existingSessionResult.data) {
          const session = existingSessionResult.data
          console.log("Found existing session:", session)
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

          success("Session Restored", `Continuing session ${session.sessionNumber}`)
        } else {
          console.log("No existing session found, creating new session with params:", {
            stationId: selectedstationId,
            userId: userId || "",
            locationId: selectedLocationId,
            organizationId,
            openingBalance: 200.0,
          })
          const newSessionResult = await createPOSSession({
            stationId: selectedstationId,
            userId: userId || "",
            locationId: selectedLocationId,
            organizationId,
            openingBalance: 200.0,
          })

          if (newSessionResult.success && newSessionResult.data) {
            const session = newSessionResult.data
            console.log("Session created successfully:", session)

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

            setCashDrawerStatus({
              isOpen: true,
              currentBalance: session.openingBalance,
              lastActivity: new Date(),
            })

            success("New Session Started", `Session ${session.sessionNumber} created successfully`)
          } else {
            console.error("Session creation failed:", newSessionResult.error)
            error("Session Error", newSessionResult.error || "Failed to create POS session")
          }
        }
      } catch (err) {
        error("Session Error", "Failed to initialize POS session")
      }
    }

    if (selectedstationId && userId && selectedLocationId && organizationId) {
      initializeSession()
    }
  }, [selectedstationId, userId, selectedLocationId, organizationId, success, error])

  const createSessionMutation = useMutation({
    meta: { operation: 'create', entity: 'Session' , suppressSuccessNotification: true, suppressErrorNotification: true },
    mutationFn: createPOSSession,
    onSuccess: (result: any) => {
      if (result?.success && result?.data) {
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
    onError: (err) => {
      error("Session Failed", "Failed to create POS session")
    },
  })

  const isMissingOrganization = !organizationId

  const toggleFavorite = useCallback((itemId: string) => {
    setFavorites((prevFavorites) => {
      if (prevFavorites.includes(itemId)) {
        return prevFavorites.filter((id) => id !== itemId)
      } else {
        return [...prevFavorites, itemId]
      }
    })
  }, [])

  // Event handlers with useCallback
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }, [])

  const handleCashTenderedChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setCashTendered(e.target.value)
  }, [])

  const handleQuantityChange = useCallback((itemId: string, value: string) => {
    updateQuantity(itemId, Number.parseInt(value) || 1)
  }, [updateQuantity])

  const handleCategorySelect = useCallback((categoryId: string) => {
    setSelectedCategory(categoryId)
  }, [])

  const handlePaymentMethodSelect = useCallback((method: PaymentMethod) => {
    setPaymentMethod(method)
  }, [])

  const handleCustomerSelect = useCallback((customer: Customer) => {
    setSelectedCustomer(customer)
    setIsCustomerDialogOpen(false)
  }, [])

  const handleDiscountToggle = useCallback(() => {
    setDiscountPercent(discountPercent > 0 ? 0 : 10)
  }, [discountPercent])

  // Update the processPayment function:
  const processPayment = useCallback(async () => {
    const validation = validatePayment()
    if (!validation.valid) {
      if (validation.message.includes("stock")) {
        warning("Inventory Issue", validation.message)
      } else {
        error("Payment Validation Failed", validation.message)
      }
      return
    }
    setIsProcessing(true)
    setPaymentProgress(0)

    try {
      operationStart("Payment Processing")

      // Simulate payment progress
      const progressInterval = setInterval(() => {
        setPaymentProgress((prev) => {
          if (prev >= PAYMENT_PROCESSING_CONSTANTS.MAX_PROGRESS_BEFORE_COMPLETION) {
            clearInterval(progressInterval)
            return PAYMENT_PROCESSING_CONSTANTS.MAX_PROGRESS_BEFORE_COMPLETION
          }
          return prev + PAYMENT_PROCESSING_CONSTANTS.PROGRESS_INCREMENT
        })
      }, PAYMENT_PROCESSING_CONSTANTS.PROGRESS_INTERVAL)


      // FIXED: Updated saleData structure to match backend interface
      const saleData = {
        organizationId, // Moved to top level as expected by backend
        locationId: selectedLocationId,
        stationId: selectedstationId,
        createdById: userId,
        customerId: selectedCustomer?.id || undefined, // Handle optional customer
        sessionId: currentSession?.id,
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
        payments: [
          {
            method: paymentMethod,
            amount: calculateTotal(),
          },
        ],
        notes: undefined, // Optional notes
      }


      // FIXED: Call createSale with proper parameters and error handling
      const saleResult = await createSaleMutation.mutateAsync(saleData)


      if (!saleResult?.success) {
        const errorMessage = saleResult?.error || "Failed to create sales - unknown error"
        error("Sales Failed", errorMessage)
        throw new Error(errorMessage)
      }

      if (!saleResult?.data?.id) {
        error("Sales Failed", "Sales creation failed - no sales ID returned")
        throw new Error("Sales creation failed - no sales ID returned")
      }

      const salesId = saleResult.data?.id || saleResult.saleId

      clearInterval(progressInterval)
      setPaymentProgress(100)

      // Prepare receipt data
      const receiptData = {
        id: salesId,
        receiptNumber: `RCP-${Date.now()}`,
        transactionDate: new Date(),
        customer: selectedCustomer,
        lines: cart.map((item) => ({
          itemId: item.itemId,
          name: item.name,
          sku: item.sku,
          quantity: item.quantity,
          unitPrice: item.price,
          discount: item.discount || 0,
          taxRate: item.taxRate,
          taxAmount: (item.price * item.quantity * item.taxRate) / 100,
          lineTotal: item.lineTotal,
        })),
        subtotal: calculateSubtotal(),
        discountAmount: calculateDiscount(),
        taxAmount: calculateTax(),
        totalAmount: calculateTotal(),
        payments: [
          {
            method: paymentMethod,
            amount: calculateTotal(),
          },
        ],
        cashTendered: paymentMethod === PaymentMethod.CASH ? Number.parseFloat(cashTendered) : undefined,
        changeGiven: paymentMethod === PaymentMethod.CASH ? calculateChange() : undefined,
        notes: selectedCustomer ? `Customer: ${selectedCustomer.name}` : undefined,
      }

      // Store last sale data for receipt
      setLastSaleData(receiptData)

      // Prepare sale data for digital receipt modal
      const digitalReceiptData = {
        saleId: salesId,
        customerName: selectedCustomer?.name,
        customerEmail: selectedCustomer?.email,
        customerPhone: selectedCustomer?.phone,
        items: cart.map(item => ({
          name: item.name,
          sku: item.sku || `SKU-${item.itemId}`,
          quantity: item.quantity,
          unitPrice: item.price,
          totalPrice: item.lineTotal
        })),
        subtotal: calculateSubtotal(),
        tax: calculateTax(),
        total: calculateTotal(),
        paymentMethod: paymentMethod.toString(),
        cashier: "Current User", // Replace with actual user name
        terminal: selectedstationId,
        createdAt: new Date()
      };

      // Set data and show digital receipt modal
      setCompletedSaleData(digitalReceiptData);
      setIsReceiptModalOpen(true);

      // Success notification with action
      success("Sales Completed!", `Transaction total: ${formatCurrency(calculateTotal())}`, {
        duration: 8000,
        action: {
          label: "View Receipt",
          onClick: () => setIsReceiptModalOpen(true),
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

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred"
      error("Payment Failed", errorMessage, {
        duration: 10000,
      })
    } finally {
      setIsProcessing(false)
      refetchDBItems?.()
      setPaymentProgress(0)
    }
  }, [
    validatePayment,
    warning,
    error,
    operationStart,
    organizationId,
    selectedLocationId,
    selectedstationId,
    userId,
    selectedCustomer?.id,
    currentSession,
    cart,
    calculateSubtotal,
    calculateTax,
    calculateDiscount,
    calculateTotal,
    paymentMethod,
    createSaleMutation,
    success,
    refetchDBItems,
  ])

  if (isMissingSessionOrganization || isMissingOrganization) {
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

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50 p-4 space-y-4 transition-colors duration-300 ${isDarkMode ? "dark bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800" : ""
        }`}
    >

      {showSuccessAnimation && (
        <div className="fixed inset-0 pointer-events-none z-40 flex items-center justify-center">
          <div className="bg-green-500 text-white p-8 rounded-full animate-ping">
            <CheckCircle className="h-16 w-16" />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 p-4 rounded-lg shadow-md border border-emerald-200/60">
        <div>
          <h1 className="text-4xl font-heading font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg">
              <Zap className="h-8 w-8" />
            </div>
            POS Terminal
          </h1>
          <p className="text-muted-foreground text-lg mt-1">
            Process sales and manage transactions with modern efficiency
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
      <Card className="bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-600 border-0 shadow-xl text-white overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-cyan-500/20 backdrop-blur-3xl"></div>
        <CardContent className="p-2 relative z-10">
          <div className="grid grid-cols-6 gap-4">
            <div className="text-center">
              <div className="text-xl font-bold mb-1">${currentSession?.totalSales.toFixed(2) || "0.00"}</div>
              <div className="text-teal-100 font-medium">Session Sales</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold mb-1">{currentSession?.transactionCount || 0}</div>
              <div className="text-teal-100 font-medium">Transactions</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold mb-1">${salesStats.avgTransaction.toFixed(2)}</div>
              <div className="text-teal-100 font-medium">Avg Transaction</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold mb-1">{formatCurrency(cashDrawerStatus.currentBalance)}</div>
              <div className="text-teal-100 font-medium">Cash Balance</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold mb-1">{cart.length}</div>
              <div className="text-teal-100 font-medium">Cart Items</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold mb-1">{formatCurrency(calculateSubtotal())}</div>
              <div className="text-teal-100 font-medium">Current Sale</div>
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
        <div className="grid gap-4 lg:grid-cols-5">
          <div className="lg:col-span-4 space-y-6">
            <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-2xl">
              <CardHeader className="bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 border-b border-white/20">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <Search className="h-4 w-4 text-emerald-600" />
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
                    <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 p-4 backdrop-blur-sm border border-white/20 shadow-lg">
                      <div
                        ref={carouselRef}
                        className="flex gap-4 overflow-x-auto scroll-smooth pb-2 scrollbar-hide"
                        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                      >
                        {/* All Items Card */}
                        <div
                          className={cn(
                            "flex-shrink-0 w-15 group cursor-pointer transition-all duration-300 hover:scale-105",
                            selectedCategory === "all" && "transform scale-105",
                          )}
                          onClick={() => handleCategorySelect("all")}
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
                          const categoryItemCount = items?.filter((item: any) => item?.category?.id === cat.id).length || 0
                          const isSelected = selectedCategory === cat.id

                          return (
                            <div
                              key={cat.id}
                              className={cn(
                                "flex-shrink-0 w-15 group cursor-pointer transition-all duration-300 hover:scale-105",
                                isSelected && "transform scale-105",
                              )}
                              onClick={() => handleCategorySelect(cat.id)}
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
                          className={cn(
                            "flex-shrink-0 w-15 group cursor-pointer transition-all duration-300 hover:scale-105",
                            selectedCategory === "favorites" && "transform scale-105",
                          )}
                          onClick={() => handleCategorySelect("favorites")}
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
                          className={cn(
                            "flex-shrink-0 w-15 group cursor-pointer transition-all duration-300 hover:scale-105",
                            selectedCategory === "recent" && "transform scale-105",
                          )}
                          onClick={() => handleCategorySelect("recent")}
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
                      onClick={handleDiscountToggle}
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
                        onChange={handleSearchChange}
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
                    <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 rounded-xl border border-emerald-200/60 backdrop-blur-sm shadow-lg">
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
                  <div className="grid grid-cols-6 gap-3 max-h-[500px] overflow-y-auto pr-2">
                    {filteredItems && filteredItems.length > 0 ? (
                      filteredItems.map((item: any) => {
                        const inventory = item.inventoryLevels?.[0]
                        const stockLevel = inventory?.quantityAvailable ?? 0
                        const isLowStock = stockLevel <= STOCK_THRESHOLDS.LOW_STOCK && stockLevel > STOCK_THRESHOLDS.OUT_OF_STOCK
                        const isOutOfStock = stockLevel === STOCK_THRESHOLDS.OUT_OF_STOCK
                        const isFavorite = favorites.includes(item.id)

                        return (
                          <div
                            key={item.id}
                            className={cn(
                              "group relative flex flex-col p-4 rounded-xl border-2 hover:shadow-xl cursor-pointer transition-all duration-300 hover:scale-105 bg-white/80 backdrop-blur-sm",
                              isLowStock && "border-orange-300 bg-gradient-to-br from-orange-50 to-orange-100",
                              isOutOfStock
                                ? "border-red-300 bg-gradient-to-br from-red-50 to-red-100 opacity-60 cursor-not-allowed"
                                : "border-gray-200 hover:border-emerald-300",
                            )}
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
            <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-2xl">
              <CardHeader className="bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 border-b border-white/20">
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
                                onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                                className="w-12 h-8 text-center bg-white"
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
                        {cart.length > 0 && !selectedCustomer && (
                          <div className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
                            <div className="flex items-center gap-2 text-amber-800">
                              <User className="h-4 w-4" />
                              <span className="text-sm font-medium">Please select a customer to complete the sale</span>
                            </div>
                          </div>
                        )}
                        {!currentSession && (
                          <div className="p-3 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg border border-red-200">
                            <div className="flex items-center gap-2 text-red-800">
                              <AlertTriangle className="h-4 w-4" />
                              <span className="text-sm font-medium">No active POS session. Please start a session to process transactions.</span>
                            </div>
                          </div>
                        )}
                        {/* Debug info - remove in production */}
                        <div className="p-2 bg-gray-100 rounded text-xs">
                          Debug: Processing: {isProcessing ? 'true' : 'false'} | Session: {currentSession ? 'active' : 'none'} | Cart: {cart.length} items | Customer: {selectedCustomer ? selectedCustomer.name : 'none'}
                        </div>
                        <Button
                          type="submit"
                          className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all h-12 text-lg font-semibold"
                          disabled={isProcessing || !currentSession || cart.length === 0 || !selectedCustomer}
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
                            onClick={() => {
                              // Create preview data with current cart
                              const previewData = {
                                id: `PREVIEW-${Date.now()}`,
                                receiptNumber: `PREVIEW-${Date.now()}`,
                                transactionDate: new Date(),
                                customer: selectedCustomer,
                                lines: cart.map((item) => ({
                                  itemId: item.itemId,
                                  name: item.name,
                                  sku: item.sku,
                                  quantity: item.quantity,
                                  unitPrice: item.price,
                                  discount: item.discount || 0,
                                  taxRate: item.taxRate,
                                  taxAmount: (item.price * item.quantity * item.taxRate) / 100,
                                  lineTotal: item.lineTotal,
                                })),
                                subtotal: calculateSubtotal(),
                                discountAmount: calculateDiscount(),
                                taxAmount: calculateTax(),
                                totalAmount: calculateTotal(),
                                payments: [
                                  {
                                    method: paymentMethod,
                                    amount: calculateTotal(),
                                  },
                                ],
                                cashTendered: paymentMethod === PaymentMethod.CASH && cashTendered ? Number.parseFloat(cashTendered) : undefined,
                                changeGiven: paymentMethod === PaymentMethod.CASH && cashTendered ? calculateChange() : undefined,
                                notes: selectedCustomer ? `Customer: ${selectedCustomer.name}` : "Receipt Preview",
                              }
                              setLastSaleData(previewData)
                              setIsReceiptPreviewOpen(true)
                            }}
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
        <Card className="bg-gradient-to-r from-emerald-600 via-teal-700 to-cyan-800 text-white border-0 shadow-2xl backdrop-blur-xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-3xl font-bold">Customer Display</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6 pb-8">
            <div className="text-6xl font-bold bg-gradient-to-r from-white via-emerald-100 to-teal-200 bg-clip-text text-transparent">
              ${calculateTotal().toFixed(2)}
            </div>
            <div className="text-2xl font-medium text-teal-200">Total Amount</div>
            {cart.length > 0 && (
              <div className="space-y-3 max-w-md mx-auto">
                <Separator className="bg-white/20" />
                <div className="text-lg font-medium text-teal-200 mb-4">Recent Items</div>
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
        <DialogContent className="max-w-2xl">
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
                  onClick={() => handleCustomerSelect(customer)}
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
        <DialogContent className="max-w-2xl">
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
                  onClick={() => handlePaymentMethodSelect(PaymentMethod.CASH)}
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
                  onClick={() => handlePaymentMethodSelect(PaymentMethod.CARD)}
                  className={`flex items-center gap-2 h-16 ${paymentMethod === PaymentMethod.CARD ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white" : ""
                    }`}
                >
                  <CreditCard className="h-5 w-5" />
                  <span className="font-medium">Card</span>
                </Button>
                <Button
                  type="button"
                  variant={paymentMethod === PaymentMethod.DIGITAL ? "default" : "outline"}
                  onClick={() => handlePaymentMethodSelect(PaymentMethod.DIGITAL)}
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
                  onChange={handleCashTenderedChange}
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

      {/* Receipt Preview Dialog */}
      {lastSaleData && (
        <ReceiptPreviewDialog
          open={isReceiptPreviewOpen}
          onOpenChange={setIsReceiptPreviewOpen}
          receiptData={lastSaleData}
          organizationData={{
            name: sessionData?.organization?.name || "StockFlow Business",
            address: "123 Business Street, Suite 100, Business City, BC 12345",
            phone: "(555) 123-4567",
            taxId: "TAX-123456789"
          }}
          locationData={{
            name: "Main Store"
          }}
          terminalId={selectedstationId}
          cashierName={sessionData?.firstName ? `${sessionData.firstName} ${sessionData.lastName || ''}`.trim() : "Cashier"}
          sessionNumber={currentSession?.sessionNumber}
        />
      )}

      {/* Digital Receipt Modal */}
      {isReceiptModalOpen && completedSaleData && (
        <SalesReceiptModal
          isOpen={isReceiptModalOpen}
          onClose={() => setIsReceiptModalOpen(false)}
          saleData={completedSaleData}
          businessInfo={{
            name: "StockFlow Retail",
            address: "123 Business Avenue, Suite 100",
            city: "Business City, BC 12345",
            phone: "+1 (555) 123-BUSI",
            email: "contact@stockflow.com",
            website: "www.stockflow.com",
            taxId: "TAX123456789"
          }}
          locationInfo={{
            name: sessionData?.organization?.name || "Main Store Location",
            address: "456 Store Street",
            city: "Store City, SC 67890",
            phone: "+1 (555) 456-STORE"
          }}
        />
      )}

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

// Named export for consistency with import usage
export const POSTerminal = ModernizedPOSTerminal

export default ModernizedPOSTerminal
