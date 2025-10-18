"use client"

import { useNotifications } from "@/components/notifications/NotificationProvider"
import { useOrgCategories } from "@/hooks/useAllCategoriesqueries"
import { useCustomers } from "@/hooks/useCustomers"
import { useQueryClient } from "@tanstack/react-query"
import { useSessionManagement } from "@/hooks/sessions"
import type React from "react"
import type { ReactElement } from "react"
import { useMemo, useRef, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Customer } from "@/lib/cashSystem/db"
import { formatCurrency } from "@/lib/formatCurrency"
import type { CartItem, ItemWithInventory } from "@/types/newPOSSession/types"
import {
  BookOpen,
  Briefcase,
  Car,
  Cast,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Coffee,
  CreditCard,
  Eye,
  Gift,
  Grid3X3,
  Heart,
  Home,
  ImageIcon,
  Leaf,
  Moon,
  Package,
  Percent,
  Plus,
  Scan,
  Search,
  Shirt,
  ShoppingCart,
  Smartphone,
  Sparkles,
  Star,
  Sun,
  Tag,
  Trash2,
  Wallet,
  Zap,
} from "lucide-react"

enum PaymentMethod {
  CASH = "CASH",
  CARD = "CARD",
  DIGITAL = "DIGITAL",
}

// Removed enum - using types from unified session system

interface pOSStationProps {
  organizationId: string
  locationId: string
  terminalId: string
  userId: string
}

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

export function pOSStation({ organizationId, locationId, terminalId, userId }: pOSStationProps): ReactElement {
  // Unified session management
  const {
    currentSession,
    isSessionActive,
    sessionLoading,
    startSession,
    endSession,
    sessionDuration
  } = useSessionManagement({
    stationId: terminalId,
    organizationId,
    enableAutoRefetch: true,
    refetchInterval: 30000
  })

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
  const [isReceiptPreviewOpen, setIsReceiptPreviewOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [discountPercent, setDiscountPercent] = useState(0)
  const [splitPayment, setSplitPayment] = useState(false)
  const [paymentProgress, setPaymentProgress] = useState(0)
  const [showCustomerDisplay, setShowCustomerDisplay] = useState(false)
  const [isSessionDialogOpen, setIsSessionDialogOpen] = useState(false)
  const [openingBalance, setOpeningBalance] = useState("100")
  // Carousel state
  const [carouselIndex, setCarouselIndex] = useState(0)
  const carouselRef = useRef<HTMLDivElement>(null)

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

  const [items, setItems] = useState<ItemWithInventory[]>([])

  // const [customers, setCustomers] = useState<Customer[]>([])

  const notifications = useNotifications()
  const queryClient = useQueryClient()

  // Session management functions
  const handleStartSession = async () => {
    try {
      const balance = parseFloat(openingBalance) || 100
      await startSession(balance, userId, locationId, organizationId)
      setIsSessionDialogOpen(false)
      notifications.success("Session Started", `POS session started with opening balance: ${formatCurrency(balance)}`)
    } catch (error) {
      console.error("Failed to start session:", error)
      notifications.error("Session Error", "Failed to start session. Please try again.")
    }
  }

  const handleEndSession = async () => {
    try {
      const closingBalance = currentSession?.openingBalance || 0
      await endSession(closingBalance)
      setIsSessionDialogOpen(false)
      notifications.success("Session Ended", `POS session closed with balance: ${formatCurrency(closingBalance)}`)
    } catch (error) {
      console.error("Failed to end session:", error)
      notifications.error("Session Error", "Failed to end session. Please try again.")
    }
  }

  // ... existing mutations and effects ...

  const filteredItems = items?.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.barcode?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || item?.category?.id === selectedCategory
    return matchesSearch && matchesCategory && item.isActive
  })

  // ... existing functions ...

  const addToCart = (item: ItemWithInventory) => {
    // ... existing implementation ...
    const existingItem = cart.find((cartItem) => cartItem.itemId === item.id)
    const currentQuantityInCart = existingItem ? existingItem.quantity : 0
    const availableStock = item.inventoryLevels?.[0]?.quantityAvailable ?? 0

    if (currentQuantityInCart >= availableStock && availableStock > 0) {
      notifications.error("Insufficient Stock", `Cannot add more ${item.name}. Only ${availableStock} in stock.`)
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

    setRecentItems((prev) => {
      const filtered = prev.filter((id) => id !== item.id)
      return [item.id, ...filtered].slice(0, 5)
    })

    notifications.success("Item Added", `${item.name} added to cart`)
  }

  const removeFromCart = (itemId: string) => {
    setCart(cart.filter((item) => item.itemId !== itemId))
  }

  const updateCartQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId)
      return
    }

    const item = items.find((i) => i.id === itemId)
    if (!item) return

    const availableStock = item.inventoryLevels?.[0]?.quantityAvailable ?? 0
    if (newQuantity > availableStock) {
      notifications.error("Insufficient Stock", `Cannot add more ${item.name}. Only ${availableStock} in stock.`)
      return
    }

    setCart(
      cart.map((cartItem) =>
        cartItem.itemId === itemId
          ? {
            ...cartItem,
            quantity: newQuantity,
            lineTotal: cartItem.price * newQuantity,
            taxAmount: (cartItem.price * newQuantity * cartItem.taxRate) / 100,
          }
          : cartItem,
      ),
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (cart.length === 0) {
      notifications.error("Empty Cart", "Please add items to cart before processing payment.")
      return
    }
    setIsPaymentDialogOpen(true)
  }

  const cartSubtotal = cart.reduce((sum, item) => sum + item.lineTotal, 0)
  const cartTaxTotal = cart.reduce((sum, item) => sum + item.taxAmount, 0)
  const cartTotal = cartSubtotal + cartTaxTotal

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

  // Carousel navigation functions
  const scrollCarousel = (direction: 'left' | 'right') => {
    if (!carouselRef.current) return

    const itemWidth = 200 // Approximate width of each category card
    const scrollAmount = direction === 'left' ? -itemWidth * 2 : itemWidth * 2

    carouselRef.current.scrollBy({
      left: scrollAmount,
      behavior: 'smooth'
    })
  }
  return (
    <div className={`p-6 space-y-6 transition-colors duration-300 ${isDarkMode ? "dark" : ""}`}>
      {/* Header Section */}
      {/* <div className="flex items-center justify-between">
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
          <Button variant="outline" size="sm" onClick={() => setIsDarkMode(!isDarkMode)}>
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <div className="text-right">
            <div className="text-lg font-medium text-foreground">{currentTime.toLocaleTimeString()}</div>
            <div className="text-sm text-muted-foreground">{currentTime.toLocaleDateString()}</div>
          </div>
        </div>
      </div> */}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-heading font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg">
              <Zap className="h-8 w-8" />
            </div>
            POS Terminal
          </h1>
          <p className="text-muted-foreground text-lg mt-1">Process sales and manage transactions</p>

          {/* Session Status Display */}
          <div className="flex items-center gap-4 mt-3">
            {isSessionActive && currentSession ? (
              <>
                <Badge variant="outline" className="flex items-center gap-2 px-3 py-1">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Session: {new Date(currentSession.startTime).toLocaleTimeString()} - #{currentSession.sessionNumber}
                </Badge>
                <Badge variant="secondary" className="px-3 py-1 font-medium">
                  Duration: {sessionDuration}h
                </Badge>
                <Badge variant="secondary" className="px-3 py-1 font-medium">
                  Sales: {formatCurrency(currentSession.totalSales || 0)}
                </Badge>
              </>
            ) : (
              <Badge variant="destructive" className="flex items-center gap-2 px-3 py-1">
                <Clock className="h-4 w-4" />
                No Active Session
              </Badge>
            )}

            {/* Session Management Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSessionDialogOpen(true)}
              disabled={sessionLoading}
            >
              {isSessionActive ? "End Session" : "Start Session"}
            </Button>
          </div>
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



      {/* Main Content */}
      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <Card className="bg-card border-border shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-card-foreground">
                  <Search className="h-5 w-5" />
                  Product Search
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Category Selection */}
                  <div className="space-y-4 border-b border-border pb-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-card-foreground">Browse Categories</h3>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {categories?.length || 0} categories
                        </Badge>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <ScrollArea className="w-full whitespace-nowrap">
                      <div className="flex gap-4 pb-2">
                        {/* All Items Card */}
                        <div
                          className={`flex-shrink-0 w-24 h-24 rounded-xl cursor-pointer transition-all duration-200 hover:scale-105 ${selectedCategory === "all"
                            ? "bg-blue-500 text-white shadow-lg"
                            : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                            }`}
                          onClick={() => setSelectedCategory("all")}
                        >
                          <div className="flex flex-col items-center justify-center h-full p-2">
                            <Grid3X3 className="h-6 w-6 mb-1" />
                            <span className="text-xs font-medium text-center leading-tight">All Items</span>
                            <span className="text-xs opacity-80">{items?.length || 0} items</span>
                          </div>
                        </div>

                        {/* Category Cards */}
                        {categories?.map((category) => {
                          const IconComponent = getCategoryIcon(category.title)
                          const categoryItemCount =
                            items?.filter((item) => item?.category?.id === category.id).length || 0

                          return (
                            <div
                              key={category.id}
                              className={`flex-shrink-0 w-24 h-24 rounded-xl cursor-pointer transition-all duration-200 hover:scale-105 ${selectedCategory === category.id
                                ? "bg-green-500 text-white shadow-lg"
                                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                                }`}
                              onClick={() => setSelectedCategory(category.id)}
                            >
                              <div className="flex flex-col items-center justify-center h-full p-2">
                                <IconComponent className="h-6 w-6 mb-1" />
                                <span className="text-xs font-medium text-center leading-tight">{category.title}</span>
                                <span className="text-xs opacity-80">{categoryItemCount} items</span>
                              </div>
                            </div>
                          )
                        })}

                        {/* Favorites Card */}
                        <div
                          className="flex-shrink-0 w-24 h-24 rounded-xl cursor-pointer transition-all duration-200 hover:scale-105 bg-orange-100 hover:bg-orange-200 text-orange-700"
                          onClick={() => {
                            // Handle favorites filter
                            notifications.info("Favorites", "Showing favorite items")
                          }}
                        >
                          <div className="flex flex-col items-center justify-center h-full p-2">
                            <Star className="h-6 w-6 mb-1" />
                            <span className="text-xs font-medium text-center leading-tight">Favorites</span>
                            <span className="text-xs opacity-80">{favorites.length} items</span>
                          </div>
                        </div>

                        {/* Recent Items Card */}
                        <div
                          className="flex-shrink-0 w-24 h-24 rounded-xl cursor-pointer transition-all duration-200 hover:scale-105 bg-teal-100 hover:bg-teal-200 text-teal-700"
                          onClick={() => {
                            // Handle recent items filter
                            notifications.info("Recent Items", "Showing recently used items")
                          }}
                        >
                          <div className="flex flex-col items-center justify-center h-full p-2">
                            <Clock className="h-6 w-6 mb-1" />
                            <span className="text-xs font-medium text-center leading-tight">Recent</span>
                            <span className="text-xs opacity-80">{recentItems.length} items</span>
                          </div>
                        </div>
                      </div>
                    </ScrollArea>

                    {/* Add Discount Button */}
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2 text-orange-600 border-orange-200 hover:bg-orange-50 bg-transparent"
                        onClick={() => {
                          // Handle discount functionality
                          notifications.info("Add Discount", "Discount functionality coming soon")
                        }}
                      >
                        <Percent className="h-4 w-4" />
                        Add Discount
                      </Button>
                    </div>
                  </div>

                  {/* Search Input */}
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

                  {/* Items Grid */}
                  <div className="grid grid-cols-4 gap-3 max-h-96 overflow-y-auto pr-2">
                    {filteredItems && filteredItems.length > 0 ? (
                      filteredItems.map((item) => {
                        let stockLevel = 0
                        if (item.inventoryLevels) {
                          if (Array.isArray(item.inventoryLevels)) {
                            stockLevel = item.inventoryLevels[0]?.quantityOnHand ?? 0
                          } else if (
                            typeof item.inventoryLevels === "object" &&
                            item.inventoryLevels !== null &&
                            "quantityOnHand" in item.inventoryLevels
                          ) {
                            stockLevel = (item.inventoryLevels as { quantityOnHand?: number }).quantityOnHand ?? 0
                          }
                        }

                        const maxStock = item.inventoryLevels?.[0]?.reorderPoint
                          ? item.inventoryLevels[0].reorderPoint * 3
                          : 100
                        const stockPercentage = Math.min((stockLevel / maxStock) * 100, 100)
                        const getStockColor = () => {
                          if (stockLevel === 0) return "bg-red-500"
                          if (stockLevel <= 5) return "bg-orange-500"
                          if (stockLevel <= item.minStockLevel) return "bg-yellow-500"
                          return "bg-green-500"
                        }
                        const getStockBgColor = () => {
                          if (stockLevel === 0) return "bg-red-100"
                          if (stockLevel <= 5) return "bg-orange-100"
                          if (stockLevel <= item.minStockLevel) return "bg-yellow-100"
                          return "bg-green-100"
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
                              {/* Favorite Toggle Button */}
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  const isFavorite = favorites.includes(item.id)
                                  if (isFavorite) {
                                    setFavorites(favorites.filter((id) => id !== item.id))
                                  } else {
                                    setFavorites([...favorites, item.id])
                                  }
                                }}
                              >
                                <Heart
                                  className={`h-3 w-3 ${favorites.includes(item.id) ? "fill-red-500 text-red-500" : "text-gray-400"}`}
                                />
                              </Button>
                            </div>
                            <div className="flex-1 mb-3">
                              <div className="font-medium text-card-foreground text-sm leading-tight mb-1">
                                {item.name}
                              </div>
                              <div className="text-xs text-muted-foreground mb-1">SKU: {item.sku}</div>
                              <div className="flex items-center gap-1 mb-1">
                                <div className="text-xs text-muted-foreground">Stock: {stockLevel}</div>
                              </div>
                              <div className="mb-2">
                                <div className={`w-full h-1.5 ${getStockBgColor()} rounded-full overflow-hidden`}>
                                  <div
                                    className={`h-full ${getStockColor()} rounded-full transition-all duration-300`}
                                    style={{ width: `${stockPercentage}%` }}
                                  />
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  {stockLevel === 0
                                    ? "Out of Stock"
                                    : stockLevel <= 5
                                      ? "Low Stock"
                                      : stockLevel <= item.minStockLevel
                                        ? "Reorder Soon"
                                        : "In Stock"}
                                </div>
                              </div>
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
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cart Section */}
          <div className="space-y-4">
            <Card className="bg-card border-border shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-card-foreground">
                  <ShoppingCart className="h-5 w-5" />
                  Cart ({cart.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cart.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Cart is empty</p>
                    </div>
                  ) : (
                    <>
                      <ScrollArea className="h-64">
                        <div className="space-y-2">
                          {cart.map((item) => (
                            <div
                              key={item.id}
                              className="p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors"
                            >
                              <div className="space-y-2">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="font-medium text-card-foreground text-sm">{item.name}</div>
                                    <div className="text-xs text-muted-foreground">{item.sku}</div>
                                    <div className="text-xs text-muted-foreground">${item.price.toFixed(2)} each</div>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeFromCart(item.itemId)}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>

                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => updateCartQuantity(item.itemId, item.quantity - 1)}
                                      className="h-6 w-6 p-0"
                                    >
                                      -
                                    </Button>
                                    <Input
                                      type="number"
                                      min="1"
                                      value={item.quantity}
                                      onChange={(e) => {
                                        const newQuantity = Number.parseInt(e.target.value) || 1
                                        if (newQuantity > 0) {
                                          updateCartQuantity(item.itemId, newQuantity)
                                        }
                                      }}
                                      className="h-6 w-12 text-center text-sm font-medium p-1 border-0 bg-transparent"
                                      onFocus={(e) => e.target.select()}
                                    />
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => updateCartQuantity(item.itemId, item.quantity + 1)}
                                      className="h-6 w-6 p-0"
                                    >
                                      +
                                    </Button>
                                  </div>
                                  <div className="text-right">
                                    <div className="font-semibold text-sm">${item.lineTotal.toFixed(2)}</div>
                                    <div className="text-xs text-muted-foreground">
                                      Tax: ${item.taxAmount.toFixed(2)}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>

                      <div className="border-t border-border pt-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Subtotal:</span>
                          <span className="font-medium">${cartSubtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Tax:</span>
                          <span className="font-medium">${cartTaxTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold border-t border-border pt-2">
                          <span>Total:</span>
                          <span className="text-emerald-600">${cartTotal.toFixed(2)}</span>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 shadow-lg"
                        disabled={isProcessing || !isSessionActive}
                      >
                        <CreditCard className="mr-2 h-4 w-4" />
                        {isProcessing ? "Processing..." : `Complete Sale - $${cartTotal.toFixed(2)}`}
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>

      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Payment</DialogTitle>
            <DialogDescription>Complete the transaction</DialogDescription>
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
                  <Cast className="h-4 w-4" />
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

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setIsPaymentDialogOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => {
                  /* processPayment */
                }}
                disabled={isProcessing}
                className="flex-1"
              >
                {isProcessing ? "Processing..." : "Complete Payment"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Session Management Dialog */}
      <Dialog open={isSessionDialogOpen} onOpenChange={setIsSessionDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isSessionActive ? "End Session" : "Start New Session"}
            </DialogTitle>
            <DialogDescription>
              {isSessionActive
                ? "Close the current POS session and calculate the final balance."
                : "Start a new POS session with an opening cash balance."
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {isSessionActive ? (
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  Current Session: #{currentSession?.sessionNumber}
                </div>
                <div className="text-sm text-muted-foreground">
                  Opening Balance: {formatCurrency(currentSession?.openingBalance || 0)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Total Sales: {formatCurrency(currentSession?.totalSales || 0)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Duration: {sessionDuration} hours
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="openingBalance">Opening Balance</Label>
                <Input
                  id="openingBalance"
                  type="number"
                  step="0.01"
                  value={openingBalance}
                  onChange={(e) => setOpeningBalance(e.target.value)}
                  placeholder="100.00"
                />
              </div>
            )}

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsSessionDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={isSessionActive ? handleEndSession : handleStartSession}
                disabled={sessionLoading}
                className="flex-1"
              >
                {sessionLoading ? "Processing..." : (isSessionActive ? "End Session" : "Start Session")}
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
