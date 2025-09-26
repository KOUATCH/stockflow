"use client"

import type React from "react"

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
import { useToast } from "@/hooks/use-toast"
import { useOrgCategories } from "@/hooks/useAllCategoriesQueries"
import { useOrgItemsNew } from "@/hooks/useAllItemQueries"
import { useOrgLocationsNew } from "@/hooks/useAllLocationsQueries"
import {
  Calculator,
  Clock,
  CreditCard,
  DollarSign,
  Eye,
  ImageIcon,
  Keyboard,
  MapPin,
  Mic,
  Moon,
  Percent,
  Plus,
  Receipt,
  Scan,
  Search,
  ShoppingCart,
  Split,
  Star,
  Sun,
  Trash2,
  User,
  Volume2,
  Zap,
} from "lucide-react"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"

interface CartItem {
  id: string
  name: string
  sku: string
  price: number
  quantity: number
  discount: number
  taxRate: number
  categoryId: string | null
}

interface Customer {
  id: string
  name: string
  email?: string
  phone?: string
}

interface Category {
  id: string
  name: string
  icon: string
}

interface Location {
  id: string
  name: string
  address: string
}

const mockCategories: Category[] = [
  { id: "all", name: "All Products", icon: "📱" },
  { id: "smartphones", name: "Smartphones", icon: "📱" },
  { id: "laptops", name: "Laptops", icon: "💻" },
  { id: "tablets", name: "Tablets", icon: "📱" },
  { id: "accessories", name: "Accessories", icon: "🎧" },
  { id: "wearables", name: "Wearables", icon: "⌚" },
]

const mockLocations: Location[] = [
  { id: "1", name: "Main Store", address: "123 Main St, Downtown" },
  { id: "2", name: "Mall Branch", address: "456 Mall Ave, Shopping Center" },
  { id: "3", name: "Warehouse", address: "789 Industrial Blvd, Warehouse District" },
]

const mockItems = [
  { id: "1", name: "iPhone 15 Pro 256GB", sku: "IPH15P-256", price: 1099, stock: 5, categoryId: "smartphones" },
  { id: "2", name: "Samsung Galaxy S24 128GB", sku: "SGS24-128", price: 799, stock: 8, categoryId: "smartphones" },
  { id: "3", name: "MacBook Air M3 512GB", sku: "MBA-M3-512", price: 1399, stock: 12, categoryId: "laptops" },
  { id: "4", name: "AirPods Pro 3rd Gen", sku: "APP-GEN3", price: 249, stock: 3, categoryId: "accessories" },
  { id: "5", name: "iPad Air 11-inch", sku: "IPA-AIR-11", price: 599, stock: 15, categoryId: "tablets" },
  { id: "6", name: "Apple Watch Series 9", sku: "AWS9-45", price: 399, stock: 20, categoryId: "wearables" },
  { id: "7", name: "Dell XPS 13", sku: "DELL-XPS13", price: 1199, stock: 7, categoryId: "laptops" },
  { id: "8", name: "Samsung Galaxy Tab S9", sku: "SGT-S9", price: 729, stock: 10, categoryId: "tablets" },
]

const mockCustomers: Customer[] = [
  { id: "1", name: "John Doe", email: "john@example.com", phone: "+1234567890" },
  { id: "2", name: "Jane Smith", email: "jane@example.com", phone: "+1234567891" },
  { id: "3", name: "Bob Johnson", phone: "+1234567892" },
]

export function pOSStation({ organizationId }: { organizationId: string }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedLocation, setSelectedLocation] = useState<string>("1")
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "digital">("cash")
  const [cashTendered, setCashTendered] = useState("")
  const [currentTime, setCurrentTime] = useState(new Date())
  // const [items, setItems] = useState(mockItems)
  const [isProcessing, setIsProcessing] = useState(false)
  const [favorites, setFavorites] = useState<string[]>(["1", "4", "6"])
  const [recentItems, setRecentItems] = useState<string[]>([])
  const [isReceiptPreviewOpen, setIsReceiptPreviewOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isVoiceActive, setIsVoiceActive] = useState(false)
  const [discountPercent, setDiscountPercent] = useState(0)
  const [splitPayment, setSplitPayment] = useState(false)
  const [paymentProgress, setPaymentProgress] = useState(0)
  const [showCustomerDisplay, setShowCustomerDisplay] = useState(false)
  const [salesStats, setSalesStats] = useState({
    todaySales: 2450.75,
    transactionCount: 18,
    avgTransaction: 136.15,
  })
  const { toast } = useToast()

  const session = useSession()

  const user = session?.data?.user
  const orgId = organizationId || user?.organizationId || ""
  console.log("User Organization ID:", orgId)

  const {
    data: itemResponse,
    isLoading: itemsLoading,
    error: itemsError,
    refetch: refetchItems,
  } = useOrgItemsNew(orgId, { enabled: !!orgId })

  const {
    data: locationResponse,
    isLoading: locationsLoading,
    error: locationsError,
    refetch: refetchLocations,
  } = useOrgLocationsNew(orgId, { enabled: !!orgId })

  const {
    data: categoryResponse,
    isLoading: categoriesLoading,
    error: categoriesError,
    refetch: refetchCategories,
  } = useOrgCategories(orgId)

  const locationsData = locationResponse?.data
  console.log({ locationsData })

  // console.log({ locationResponse, itemResponse, categoryResponse })

  const itemData = itemResponse?.data

  const categoryData = categoryResponse?.data
  console.log({ itemData, categoryData })
  const locationData = locationResponse?.data

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "f":
            e.preventDefault()
            document.getElementById("search-input")?.focus()
            break
          case "Enter":
            e.preventDefault()
            if (cart.length > 0) handleSubmit(e as any)
            break
          case "Escape":
            e.preventDefault()
            clearCart()
            break
        }
      }
    }
    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [cart])

  const filteredItems = itemData?.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || item.categoryId === selectedCategory
    return matchesSearch && matchesCategory
  })

  const addToCart = (item: NonNullable<typeof itemData>[number]) => {
    const existingItem = cart.find((cartItem) => cartItem.id === item.id)
    const currentQuantityInCart = existingItem ? existingItem.quantity : 0

    const availableStock = item.inventoryLevels?.[0]?.quantityOnHand ?? 0

    if (currentQuantityInCart >= availableStock && availableStock > 0) {
      toast({
        variant: "destructive",
        title: "Insufficient Stock",
        description: `Cannot add more ${item.name}. Only ${availableStock} in stock.`,
      })
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
          categoryId: item.categoryId,
        },
      ])
    }

    // if (audioRef.current) {
    //   audioRef.current.currentTime = 0
    //   audioRef.current.play().catch(() => { })
    // }

    setRecentItems((prev) => {
      const filtered = prev.filter((id) => id !== item.id)
      return [item.id, ...filtered].slice(0, 5)
    })

    toast({
      title: "Item Added",
      description: `${item.name} added to cart`,
    })
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id)
      return
    }

    const item = itemData?.find((i) => i.id === id)
    const availableStock = item?.inventoryLevels?.[0]?.quantityOnHand ?? 0

    if (item && quantity > availableStock && availableStock > 0) {
      toast({
        variant: "destructive",
        title: "Insufficient Stock",
        description: `Cannot set quantity to ${quantity}. Only ${availableStock} in stock.`,
      })
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
      const item = itemData?.find((i) => i.id === cartItem.id)
      if (item) {
        const availableStock = item.inventoryLevels?.[0]?.quantityOnHand ?? 0
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
      toast({
        variant: "destructive",
        title: "Empty Cart",
        description: "Please add items to cart before checkout.",
      })
      return
    }

    // Validate inventory before opening payment dialog
    const inventoryCheck = validateInventory()
    if (!inventoryCheck.valid) {
      toast({
        variant: "destructive",
        title: "Inventory Error",
        description: inventoryCheck.message,
      })
      return
    }

    setIsPaymentDialogOpen(true)
  }

  const processPayment = async () => {
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

      const updatedItems = itemData
        ? itemData.map((item) => {
          const cartItem = cart.find((ci) => ci.id === item.id)
          if (cartItem && item.inventoryLevels?.[0]) {
            const currentStock = item.inventoryLevels[0].quantityOnHand
            const newStock = currentStock - cartItem.quantity
            console.log(`[v0] Updating ${item.name}: ${currentStock} -> ${newStock}`)
            return {
              ...item,
              inventoryLevels: [
                {
                  ...item.inventoryLevels[0],
                  quantityOnHand: newStock,
                  quantityAvailable: newStock - (item.inventoryLevels[0].quantityReserved || 0),
                },
              ],
            }
          }
          return item
        })
        : []

      const inventoryTransactions = cart.map((cartItem) => ({
        itemId: cartItem.id,
        type: "SALE",
        quantity: -cartItem.quantity,
        locationId: selectedLocation,
        reference: `SALE-${Date.now()}`,
        timestamp: new Date().toISOString(),
        notes: `POS Sale - ${cartItem.name}`,
      }))

      console.log("[v0] Created inventory transactions:", inventoryTransactions)

      const receiptNumber = `SALE-${Date.now()}`

      clearCart()
      setIsPaymentDialogOpen(false)
      setCashTendered("")

      toast({
        title: "Sale Completed Successfully!",
        description: `Receipt #${receiptNumber} - Total: $${calculateTotal().toFixed(2)}`,
      })

      const lowStockItems = updatedItems?.filter((item) => {
        const stock = item.inventoryLevels?.[0]?.quantityOnHand ?? 0
        return stock <= 5 && stock > 0
      })

      if (lowStockItems.length > 0) {
        setTimeout(() => {
          toast({
            title: "Low Stock Alert",
            description: `${lowStockItems.length} item(s) are running low on stock`,
          })
        }, 2000)
      }

      setTimeout(() => {
        setIsReceiptPreviewOpen(true)
      }, 1000)
    } catch (error) {
      console.error("[v0] Error processing payment:", error)
      toast({
        variant: "destructive",
        title: "Payment Failed",
        description: "Error processing payment. Please try again.",
      })
    } finally {
      setIsProcessing(false)
      setPaymentProgress(0)
    }
  }

  const toggleVoiceCommand = () => {
    setIsVoiceActive(!isVoiceActive)
    if (!isVoiceActive) {
      toast({
        title: "Voice Commands Active",
        description: "Say 'add [product name]' or 'checkout' to use voice commands",
      })
      setTimeout(() => setIsVoiceActive(false), 5000)
    }
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
          <Button
            variant="outline"
            size="sm"
            onClick={toggleVoiceCommand}
            className={`flex items-center gap-2 ${isVoiceActive ? "bg-red-100 text-red-700" : ""}`}
          >
            <Mic className={`h-4 w-4 ${isVoiceActive ? "animate-pulse" : ""}`} />
            Voice
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
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Categories</Label>
                    <ScrollArea className="w-full whitespace-nowrap">
                      <div className="flex gap-2 pb-2">
                        {categoryData?.map((category) => (
                          <Button
                            key={category.id}
                            type="button"
                            variant={selectedCategory === category.id ? "default" : "outline"}
                            size="sm"
                            className="flex items-center gap-2 whitespace-nowrap transition-all hover:scale-105"
                            onClick={() => setSelectedCategory(category.id)}
                          >
                            <span>{category.title}</span>
                            {category.title}
                          </Button>
                        ))}
                      </div>
                    </ScrollArea>
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
                  <div className="grid grid-cols-4 gap-3 max-h-96 overflow-y-auto pr-2">
                    {filteredItems &&
                      filteredItems.map((item) => {
                        const stockLevel = item.inventoryLevels?.[0]?.quantityOnHand ?? 0
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
                      })}
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
              {mockCustomers.map((customer) => (
                <div
                  key={customer.id}
                  className="p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer"
                  onClick={() => {
                    setSelectedCustomer(customer)
                    setIsCustomerDialogOpen(false)
                  }}
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
                  setSelectedCustomer(null)
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
                  variant={paymentMethod === "cash" ? "default" : "outline"}
                  onClick={() => setPaymentMethod("cash")}
                  className="flex flex-col gap-1 h-16"
                >
                  <DollarSign className="h-5 w-5" />
                  <span className="text-xs">Cash</span>
                </Button>
                <Button
                  type="button"
                  variant={paymentMethod === "card" ? "default" : "outline"}
                  onClick={() => setPaymentMethod("card")}
                  className="flex flex-col gap-1 h-16"
                >
                  <CreditCard className="h-5 w-5" />
                  <span className="text-xs">Card</span>
                </Button>
                <Button
                  type="button"
                  variant={paymentMethod === "digital" ? "default" : "outline"}
                  onClick={() => setPaymentMethod("digital")}
                  className="flex flex-col gap-1 h-16"
                >
                  <Calculator className="h-5 w-5" />
                  <span className="text-xs">Digital</span>
                </Button>
              </div>
            </div>
            {paymentMethod === "cash" && (
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
                  (paymentMethod === "cash" && (!cashTendered || Number.parseFloat(cashTendered) < calculateTotal()))
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
      {/* import React, { useState, useEffect } from "react" */}
    </div>
  )
}
