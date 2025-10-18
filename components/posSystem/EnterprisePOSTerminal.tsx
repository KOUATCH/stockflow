"use client"

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import {
  ShoppingCart,
  Scan,
  CreditCard,
  Banknote,
  Receipt,
  User,
  Search,
  Plus,
  Minus,
  Trash2,
  Settings,
  Clock,
  MapPin,
  Wifi,
  WifiOff,
  Battery,
  Volume2,
  VolumeX,
  Monitor,
  Smartphone,
  Printer,
  Gift,
  Percent,
  Star,
  Heart,
  Eye,
  Grid3X3,
  Package,
  Tag,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RotateCcw,
  Save,
  Upload,
  Download,
  RefreshCw,
  Zap,
  Shield,
  Lock,
  Unlock,
  Camera,
  Mic,
  MicOff,
  Sun,
  Moon,
  Maximize,
  Minimize,
  Home,
  ArrowLeft,
  ArrowRight,
  ChevronUp,
  ChevronDown,
  MoreVertical,
  Filter,
  SortAsc,
  BarChart3,
  TrendingUp,
  DollarSign
} from 'lucide-react'

import { formatCurrency } from '@/actions/posSystem/utils/pos-utils'
import { createTransaction, processPayment } from '@/actions/posSystem/core/pos-transaction-engine'
import { useToast } from '@/hooks/use-toast'
import type {
  POSTransaction,
  POSTransactionItem,
  CreateTransactionData,
  PaymentMethod,
  POSTerminalConfig
} from '@/actions/posSystem/types/pos-system-types'

interface CartItem {
  id: string
  itemId: string
  name: string
  sku: string
  barcode?: string
  price: number
  cost?: number
  quantity: number
  unitPrice: number
  discountAmount: number
  taxAmount: number
  lineTotal: number
  category?: string
  brand?: string
  imageUrl?: string
  metadata?: Record<string, any>
}

interface Customer {
  id: string
  name: string
  email?: string
  phone?: string
  loyaltyNumber?: string
  priceLevel?: string
  loyaltyDiscount?: number
  points?: number
}

interface Location {
  id: string
  name: string
  address: string
  city: string
  state: string
  timezone: string
  currency: string
}

interface EnterprisePOSTerminalProps {
  sessionId: string
  terminalId: string
  locationId: string
  organizationId: string
  userId: string
  location: Location
  terminalConfig: POSTerminalConfig
  onTransactionComplete?: (transaction: POSTransaction) => void
}

export default function EnterprisePOSTerminal({
  sessionId,
  terminalId,
  locationId,
  organizationId,
  userId,
  location,
  terminalConfig,
  onTransactionComplete
}: EnterprisePOSTerminalProps) {
  const { toast } = useToast()

  // State Management
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [currentTransaction, setCurrentTransaction] = useState<POSTransaction | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [isOffline, setIsOffline] = useState(false)
  const [terminalStatus, setTerminalStatus] = useState<'ACTIVE' | 'INACTIVE' | 'MAINTENANCE'>('ACTIVE')

  // Modal States
  const [showPayment, setShowPayment] = useState(false)
  const [showCustomerSearch, setShowCustomerSearch] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showTransactionHistory, setShowTransactionHistory] = useState(false)

  // Payment State
  const [paymentMethods, setPaymentMethods] = useState<Array<{
    method: PaymentMethod
    amount: number
    reference?: string
  }>>([])

  // Mock Data (replace with actual API calls)
  const [items, setItems] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [recentTransactions, setRecentTransactions] = useState<POSTransaction[]>([])

  // Load initial data
  useEffect(() => {
    loadInitialData()
    checkNetworkStatus()
    const interval = setInterval(checkNetworkStatus, 30000) // Check every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const loadInitialData = async () => {
    try {
      // Load items, categories, customers
      // This would be replaced with actual API calls
      setItems([])
      setCategories([])
      setCustomers([])
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load initial data",
        variant: "destructive"
      })
    }
  }

  const checkNetworkStatus = () => {
    setIsOffline(!navigator.onLine)
  }

  // Cart Management
  const addItemToCart = useCallback((item: any, quantity: number = 1) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.itemId === item.id)

      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.itemId === item.id
            ? {
                ...cartItem,
                quantity: cartItem.quantity + quantity,
                lineTotal: (cartItem.quantity + quantity) * cartItem.unitPrice
              }
            : cartItem
        )
      } else {
        const newCartItem: CartItem = {
          id: `cart_${Date.now()}_${Math.random()}`,
          itemId: item.id,
          name: item.name,
          sku: item.sku,
          barcode: item.barcode,
          price: item.price,
          cost: item.cost,
          quantity,
          unitPrice: item.price,
          discountAmount: 0,
          taxAmount: 0,
          lineTotal: quantity * item.price,
          category: item.category?.name,
          brand: item.brand?.name,
          imageUrl: item.imageUrl,
          metadata: {}
        }
        return [...prevCart, newCartItem]
      }
    })
  }, [])

  const updateCartItemQuantity = useCallback((cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeCartItem(cartItemId)
      return
    }

    setCart(prevCart =>
      prevCart.map(item =>
        item.id === cartItemId
          ? {
              ...item,
              quantity,
              lineTotal: quantity * item.unitPrice - item.discountAmount + item.taxAmount
            }
          : item
      )
    )
  }, [])

  const removeCartItem = useCallback((cartItemId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== cartItemId))
  }, [])

  const clearCart = useCallback(() => {
    setCart([])
    setSelectedCustomer(null)
  }, [])

  // Calculations
  const cartTotals = useMemo(() => {
    const subtotal = cart.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
    const discountAmount = cart.reduce((sum, item) => sum + item.discountAmount, 0)
    const taxAmount = cart.reduce((sum, item) => sum + item.taxAmount, 0)
    const totalAmount = subtotal - discountAmount + taxAmount

    return {
      subtotal,
      discountAmount,
      taxAmount,
      totalAmount,
      itemCount: cart.reduce((sum, item) => sum + item.quantity, 0)
    }
  }, [cart])

  // Transaction Processing
  const processTransaction = async () => {
    if (cart.length === 0) {
      toast({
        title: "Error",
        description: "Cart is empty",
        variant: "destructive"
      })
      return
    }

    setIsProcessing(true)
    try {
      const transactionData: CreateTransactionData = {
        sessionId,
        terminalId,
        locationId,
        organizationId,
        userId,
        customerId: selectedCustomer?.id,
        items: cart.map(item => ({
          itemId: item.itemId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discountAmount: item.discountAmount,
          taxAmount: item.taxAmount,
          metadata: item.metadata
        })),
        notes: '',
        terminalInfo: {
          terminalConfig,
          timestamp: new Date().toISOString()
        },
        customerInfo: selectedCustomer ? {
          customerId: selectedCustomer.id,
          loyaltyNumber: selectedCustomer.loyaltyNumber,
          priceLevel: selectedCustomer.priceLevel
        } : undefined,
        employeeInfo: {
          userId,
          timestamp: new Date().toISOString()
        }
      }

      const result = await createTransaction(transactionData)

      if (result.success && result.transaction) {
        setCurrentTransaction(result.transaction)
        setShowPayment(true)
      } else {
        throw new Error(result.error || 'Failed to create transaction')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process transaction",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const processPayment = async () => {
    if (!currentTransaction) return

    const totalPayment = paymentMethods.reduce((sum, payment) => sum + payment.amount, 0)

    if (totalPayment < currentTransaction.totalAmount) {
      toast({
        title: "Error",
        description: "Insufficient payment amount",
        variant: "destructive"
      })
      return
    }

    setIsProcessing(true)
    try {
      const result = await processPayment(
        currentTransaction.id,
        paymentMethods.map(payment => ({
          method: payment.method,
          amount: payment.amount,
          referenceNumber: payment.reference,
          metadata: {}
        }))
      )

      if (result.success && result.transaction) {
        toast({
          title: "Success",
          description: "Payment processed successfully"
        })

        // Reset state
        clearCart()
        setCurrentTransaction(null)
        setPaymentMethods([])
        setShowPayment(false)

        // Callback
        onTransactionComplete?.(result.transaction)
      } else {
        throw new Error(result.error || 'Failed to process payment')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process payment",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Barcode Scanning
  const handleBarcodeSearch = useCallback((barcode: string) => {
    const item = items.find(item => item.barcode === barcode || item.sku === barcode)
    if (item) {
      addItemToCart(item)
      toast({
        title: "Item Added",
        description: `${item.name} added to cart`
      })
    } else {
      toast({
        title: "Item Not Found",
        description: `No item found with barcode ${barcode}`,
        variant: "destructive"
      })
    }
  }, [items, addItemToCart])

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.ctrlKey) {
        switch (event.key) {
          case 'p':
            event.preventDefault()
            if (cart.length > 0) processTransaction()
            break
          case 'c':
            event.preventDefault()
            clearCart()
            break
          case 'f':
            event.preventDefault()
            setShowCustomerSearch(true)
            break
        }
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [cart, processTransaction, clearCart])

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 flex flex-col">
      {/* Header Bar */}
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50 px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
              <Monitor className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                StockFlow Enterprise POS
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Terminal {terminalId.slice(-6)} • {location.name}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Network Status */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800">
            {isOffline ? (
              <WifiOff className="w-4 h-4 text-red-500" />
            ) : (
              <Wifi className="w-4 h-4 text-green-500" />
            )}
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {isOffline ? 'Offline' : 'Online'}
            </span>
          </div>

          {/* Terminal Status */}
          <Badge variant={terminalStatus === 'ACTIVE' ? 'default' : 'secondary'}>
            {terminalStatus}
          </Badge>

          {/* Session Info */}
          <div className="text-right">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Session: {sessionId.slice(-8)}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {new Date().toLocaleTimeString()}
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(true)}
            className="bg-white/80 dark:bg-slate-800/80"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Product Grid */}
        <div className="flex-1 flex flex-col bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm">
          {/* Search and Categories */}
          <div className="p-6 border-b border-slate-200/50 dark:border-slate-700/50">
            <div className="flex gap-4 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  placeholder="Search products or scan barcode..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && searchTerm) {
                      handleBarcodeSearch(searchTerm)
                      setSearchTerm('')
                    }
                  }}
                  className="pl-10 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg"
                />
              </div>
              <Button
                onClick={() => handleBarcodeSearch(searchTerm)}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg"
              >
                <Scan className="w-4 h-4 mr-2" />
                Scan
              </Button>
            </div>

            {/* Category Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              <Button
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('all')}
                className="whitespace-nowrap"
              >
                All Items
              </Button>
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="whitespace-nowrap"
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          <ScrollArea className="flex-1 p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {items.map((item) => (
                <Card
                  key={item.id}
                  className="cursor-pointer hover:shadow-lg transition-all duration-200 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg hover:scale-[1.02]"
                  onClick={() => addItemToCart(item)}
                >
                  <CardContent className="p-4">
                    <div className="aspect-square bg-slate-100 dark:bg-slate-700 rounded-lg mb-3 flex items-center justify-center">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <Package className="w-8 h-8 text-slate-400" />
                      )}
                    </div>
                    <h3 className="font-medium text-sm text-slate-900 dark:text-white truncate">
                      {item.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      SKU: {item.sku}
                    </p>
                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400 mt-1">
                      {formatCurrency(item.price, location.currency)}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Cart Sidebar */}
        <div className="w-96 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-l border-slate-200/50 dark:border-slate-700/50 flex flex-col shadow-2xl">
          {/* Cart Header */}
          <div className="p-6 border-b border-slate-200/50 dark:border-slate-700/50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg">
                  <ShoppingCart className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Shopping Cart
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {cartTotals.itemCount} items
                  </p>
                </div>
              </div>
              {cart.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearCart}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* Customer Selection */}
            <div className="space-y-2">
              <Button
                variant="outline"
                onClick={() => setShowCustomerSearch(true)}
                className="w-full justify-start bg-white/80 dark:bg-slate-800/80"
              >
                <User className="w-4 h-4 mr-2" />
                {selectedCustomer ? selectedCustomer.name : 'Select Customer'}
              </Button>
              {selectedCustomer && (
                <div className="text-xs text-slate-600 dark:text-slate-400 px-2">
                  {selectedCustomer.loyaltyNumber && (
                    <p>Loyalty: {selectedCustomer.loyaltyNumber}</p>
                  )}
                  {selectedCustomer.phone && (
                    <p>Phone: {selectedCustomer.phone}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Cart Items */}
          <ScrollArea className="flex-1 p-6">
            {cart.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 dark:text-slate-400">Cart is empty</p>
                <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">
                  Scan or select items to add them to cart
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <Card key={item.id} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-md">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center flex-shrink-0">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <Package className="w-6 h-6 text-slate-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm text-slate-900 dark:text-white truncate">
                            {item.name}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {formatCurrency(item.unitPrice, location.currency)}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}
                              className="w-8 h-8 p-0"
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="w-12 text-center text-sm font-medium">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                              className="w-8 h-8 p-0"
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeCartItem(item.id)}
                              className="w-8 h-8 p-0 ml-auto text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-slate-900 dark:text-white">
                            {formatCurrency(item.lineTotal, location.currency)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Cart Totals and Checkout */}
          {cart.length > 0 && (
            <div className="p-6 border-t border-slate-200/50 dark:border-slate-700/50 bg-white/95 dark:bg-slate-900/95">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Subtotal:</span>
                  <span className="font-medium">
                    {formatCurrency(cartTotals.subtotal, location.currency)}
                  </span>
                </div>
                {cartTotals.discountAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Discount:</span>
                    <span className="font-medium text-green-600">
                      -{formatCurrency(cartTotals.discountAmount, location.currency)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Tax:</span>
                  <span className="font-medium">
                    {formatCurrency(cartTotals.taxAmount, location.currency)}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-blue-600 dark:text-blue-400">
                    {formatCurrency(cartTotals.totalAmount, location.currency)}
                  </span>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <Button
                  onClick={processTransaction}
                  disabled={isProcessing || cart.length === 0}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg h-12 text-lg font-semibold"
                >
                  {isProcessing ? (
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <CreditCard className="w-5 h-5 mr-2" />
                  )}
                  Checkout
                </Button>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setShowTransactionHistory(true)}
                  >
                    <Clock className="w-4 h-4 mr-1" />
                    History
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <Save className="w-4 h-4 mr-1" />
                    Hold
                  </Button>
                </div>
              </div>

              {/* Quick Shortcuts */}
              <div className="mt-4 text-xs text-slate-500 dark:text-slate-400 space-y-1">
                <p>Shortcuts: Ctrl+P (Checkout), Ctrl+C (Clear), Ctrl+F (Customer)</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      <Dialog open={showPayment} onOpenChange={setShowPayment}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Process Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {currentTransaction && (
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {formatCurrency(currentTransaction.totalAmount, location.currency)}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Total Amount Due
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-16 flex flex-col gap-1"
                onClick={() => {
                  setPaymentMethods([{
                    method: 'CASH',
                    amount: currentTransaction?.totalAmount || 0
                  }])
                  processPayment()
                }}
              >
                <Banknote className="w-6 h-6" />
                <span className="text-sm">Cash</span>
              </Button>
              <Button
                variant="outline"
                className="h-16 flex flex-col gap-1"
                onClick={() => {
                  setPaymentMethods([{
                    method: 'CARD',
                    amount: currentTransaction?.totalAmount || 0
                  }])
                  processPayment()
                }}
              >
                <CreditCard className="w-6 h-6" />
                <span className="text-sm">Card</span>
              </Button>
              <Button
                variant="outline"
                className="h-16 flex flex-col gap-1"
              >
                <Gift className="w-6 h-6" />
                <span className="text-sm">Gift Card</span>
              </Button>
              <Button
                variant="outline"
                className="h-16 flex flex-col gap-1"
              >
                <Smartphone className="w-6 h-6" />
                <span className="text-sm">Digital</span>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Customer Search Modal */}
      <Dialog open={showCustomerSearch} onOpenChange={setShowCustomerSearch}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Select Customer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Search customers..."
              className="w-full"
            />
            <ScrollArea className="h-64">
              {customers.map((customer) => (
                <div
                  key={customer.id}
                  className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer rounded-lg border mb-2"
                  onClick={() => {
                    setSelectedCustomer(customer)
                    setShowCustomerSearch(false)
                  }}
                >
                  <p className="font-medium">{customer.name}</p>
                  {customer.phone && (
                    <p className="text-sm text-slate-600 dark:text-slate-400">{customer.phone}</p>
                  )}
                  {customer.loyaltyNumber && (
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                      Loyalty: {customer.loyaltyNumber}
                    </p>
                  )}
                </div>
              ))}
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}