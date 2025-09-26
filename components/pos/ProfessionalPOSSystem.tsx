"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ShoppingCart, CreditCard, DollarSign, Trash2, Plus, Minus, Search, User, Receipt, Calculator, Banknote, Smartphone, Building2, Clock, TrendingUp, Package, Star, History, Settings, AlertCircle, CheckCircle, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CartItem, POSCart, PaymentMethod, CustomerDTO, ItemDTO } from '@/types/posTypes'

interface ProfessionalPOSSystemProps {
  organizationId: string
  locationId: string
  terminalId: string
  sessionId?: string
  onSessionStart?: (sessionId: string) => void
  onSessionEnd?: () => void
}

export default function ProfessionalPOSSystem({
  organizationId,
  locationId,
  terminalId,
  sessionId,
  onSessionStart,
  onSessionEnd
}: ProfessionalPOSSystemProps) {
  // State management
  const [cart, setCart] = useState<POSCart>({
    items: [],
    subTotal: 0,
    taxAmount: 0,
    discount: 0,
    total: 0,
    itemCount: 0
  })
  
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDTO | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [activeTab, setActiveTab] = useState('categories')
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH')
  const [cashTendered, setCashTendered] = useState<string>('')
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [paymentSuccess, setPaymentSuccess] = useState(false)

  // Mock data - replace with actual API calls
  const [items] = useState<ItemDTO[]>([
    {
      id: '1',
      name: 'Premium Coffee Beans',
      sku: 'COF-001',
      description: 'Arabica coffee beans from Colombia',
      category: 'Beverages',
      sellingPrice: 24.99,
      costPrice: 12.50,
      quantity: 150,
      isActive: true,
      isTaxable: true,
      organizationId
    },
    {
      id: '2',
      name: 'Organic Green Tea',
      sku: 'TEA-001',
      description: 'Premium organic green tea leaves',
      category: 'Beverages',
      sellingPrice: 18.99,
      costPrice: 9.50,
      quantity: 200,
      isActive: true,
      isTaxable: true,
      organizationId
    },
    {
      id: '3',
      name: 'Chocolate Croissant',
      sku: 'BAK-001',
      description: 'Fresh baked chocolate croissant',
      category: 'Bakery',
      sellingPrice: 4.99,
      costPrice: 2.25,
      quantity: 50,
      isActive: true,
      isTaxable: true,
      organizationId
    },
    {
      id: '4',
      name: 'Blueberry Muffin',
      sku: 'BAK-002',
      description: 'Fresh blueberry muffin with streusel topping',
      category: 'Bakery',
      sellingPrice: 3.99,
      costPrice: 1.80,
      quantity: 75,
      isActive: true,
      isTaxable: true,
      organizationId
    },
    {
      id: '5',
      name: 'Wireless Headphones',
      sku: 'ELE-001',
      description: 'Bluetooth wireless headphones with noise cancellation',
      category: 'Electronics',
      sellingPrice: 199.99,
      costPrice: 120.00,
      quantity: 25,
      isActive: true,
      isTaxable: true,
      organizationId
    }
  ])

  const [customers] = useState<CustomerDTO[]>([
    {
      id: '1',
      name: 'John Smith',
      email: 'john.smith@email.com',
      phone: '+1-555-0123',
      address: '123 Main St, City, State 12345',
      isActive: true,
      organizationId,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      phone: '+1-555-0456',
      address: '456 Oak Ave, City, State 12345',
      isActive: true,
      organizationId,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ])

  // Computed values
  const categories = useMemo(() => {
    const cats = Array.from(new Set(items.map(item => item.category).filter(Boolean)))
    return ['all', ...cats]
  }, [items])

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.sku.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
      return matchesSearch && matchesCategory && item.isActive
    })
  }, [items, searchQuery, selectedCategory])

  const favoriteItems = useMemo(() => {
    return items.filter(item => item.isActive).slice(0, 8) // Mock favorites
  }, [items])

  const recentItems = useMemo(() => {
    return items.filter(item => item.isActive).slice(0, 6) // Mock recent items
  }, [items])

  const taxRate = 0.08 // 8% tax rate
  const changeAmount = useMemo(() => {
    const tendered = parseFloat(cashTendered) || 0
    return Math.max(0, tendered - cart.total)
  }, [cashTendered, cart.total])

  // Cart operations
  const addToCart = (item: ItemDTO, quantity: number = 1) => {
    setCart(prevCart => {
      const existingItemIndex = prevCart.items.findIndex(cartItem => cartItem.itemId === item.id)
      let newItems: CartItem[]

      if (existingItemIndex >= 0) {
        newItems = [...prevCart.items]
        newItems[existingItemIndex] = {
          ...newItems[existingItemIndex],
          quantity: newItems[existingItemIndex].quantity + quantity,
          total: (newItems[existingItemIndex].quantity + quantity) * newItems[existingItemIndex].price
        }
      } else {
        const newCartItem: CartItem = {
          id: `cart-${Date.now()}-${item.id}`,
          itemId: item.id,
          name: item.name,
          sku: item.sku,
          price: item.sellingPrice,
          quantity,
          taxRate: item.isTaxable ? taxRate : 0,
          discount: 0,
          total: item.sellingPrice * quantity,
          category: item.category
        }
        newItems = [...prevCart.items, newCartItem]
      }

      return calculateCartTotals(newItems)
    })
  }

  const updateCartItemQuantity = (cartItemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(cartItemId)
      return
    }

    setCart(prevCart => {
      const newItems = prevCart.items.map(item =>
        item.id === cartItemId
          ? { ...item, quantity: newQuantity, total: item.price * newQuantity }
          : item
      )
      return calculateCartTotals(newItems)
    })
  }

  const removeFromCart = (cartItemId: string) => {
    setCart(prevCart => {
      const newItems = prevCart.items.filter(item => item.id !== cartItemId)
      return calculateCartTotals(newItems)
    })
  }

  const clearCart = () => {
    setCart({
      items: [],
      subTotal: 0,
      taxAmount: 0,
      discount: 0,
      total: 0,
      itemCount: 0
    })
    setSelectedCustomer(null)
  }

  const calculateCartTotals = (items: CartItem[]): POSCart => {
    const subTotal = items.reduce((sum, item) => sum + item.total, 0)
    const taxAmount = items.reduce((sum, item) => sum + (item.total * item.taxRate), 0)
    const discount = items.reduce((sum, item) => sum + item.discount, 0)
    const total = subTotal + taxAmount - discount
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

    return {
      items,
      subTotal,
      taxAmount,
      discount,
      total,
      itemCount
    }
  }

  // Payment processing
  const processPayment = async () => {
    if (!sessionId) {
      setPaymentError('No active POS session')
      return
    }

    if (cart.items.length === 0) {
      setPaymentError('Cart is empty')
      return
    }

    if (paymentMethod === 'CASH' && parseFloat(cashTendered) < cart.total) {
      setPaymentError('Insufficient cash tendered')
      return
    }

    setIsProcessingPayment(true)
    setPaymentError(null)

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock successful payment
      setPaymentSuccess(true)
      
      // Clear cart after successful payment
      setTimeout(() => {
        clearCart()
        setIsPaymentModalOpen(false)
        setPaymentSuccess(false)
        setCashTendered('')
      }, 2000)

    } catch (error) {
      setPaymentError('Payment processing failed. Please try again.')
    } finally {
      setIsProcessingPayment(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto p-4 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Professional POS System
              </h1>
              <p className="text-slate-600 mt-1">Terminal: {terminalId} | Session: {sessionId || 'No active session'}</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant={sessionId ? "default" : "secondary"} className="px-3 py-1">
                <Clock className="w-4 h-4 mr-1" />
                {sessionId ? 'Active Session' : 'No Session'}
              </Badge>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Product Selection Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search and Filters */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      placeholder="Search products by name or SKU..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-white/50 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-full sm:w-48 bg-white/50 border-slate-200">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category === 'all' ? 'All Categories' : category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
            </Card>

            {/* Product Tabs */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <CardHeader className="pb-2">
                  <TabsList className="grid w-full grid-cols-3 bg-slate-100/50">
                    <TabsTrigger value="categories" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                      <Package className="w-4 h-4 mr-2" />
                      Categories
                    </TabsTrigger>
                    <TabsTrigger value="favorites" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                      <Star className="w-4 h-4 mr-2" />
                      Favorites
                    </TabsTrigger>
                    <TabsTrigger value="recent" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                      <History className="w-4 h-4 mr-2" />
                      Recent
                    </TabsTrigger>
                  </TabsList>
                </CardHeader>

                <CardContent>
                  <TabsContent value="categories" className="mt-0">
                    <ScrollArea className="h-96">
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {filteredItems.map(item => (
                          <Card
                            key={item.id}
                            className="cursor-pointer hover:shadow-md transition-all duration-200 border-slate-200 hover:border-blue-300 bg-gradient-to-br from-white to-slate-50"
                            onClick={() => addToCart(item)}
                          >
                            <CardContent className="p-3">
                              <div className="aspect-square bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg mb-2 flex items-center justify-center">
                                <Package className="w-8 h-8 text-blue-600" />
                              </div>
                              <h3 className="font-semibold text-sm text-slate-800 truncate">{item.name}</h3>
                              <p className="text-xs text-slate-500 truncate">{item.sku}</p>
                              <div className="flex items-center justify-between mt-2">
                                <span className="font-bold text-blue-600">${item.sellingPrice.toFixed(2)}</span>
                                <Badge variant={item.quantity > 10 ? "default" : "destructive"} className="text-xs">
                                  {item.quantity}
                                </Badge>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="favorites" className="mt-0">
                    <ScrollArea className="h-96">
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {favoriteItems.map(item => (
                          <Card
                            key={item.id}
                            className="cursor-pointer hover:shadow-md transition-all duration-200 border-slate-200 hover:border-blue-300 bg-gradient-to-br from-white to-slate-50"
                            onClick={() => addToCart(item)}
                          >
                            <CardContent className="p-3">
                              <div className="aspect-square bg-gradient-to-br from-amber-100 to-orange-100 rounded-lg mb-2 flex items-center justify-center">
                                <Star className="w-8 h-8 text-amber-600" />
                              </div>
                              <h3 className="font-semibold text-sm text-slate-800 truncate">{item.name}</h3>
                              <p className="text-xs text-slate-500 truncate">{item.sku}</p>
                              <div className="flex items-center justify-between mt-2">
                                <span className="font-bold text-blue-600">${item.sellingPrice.toFixed(2)}</span>
                                <Badge variant={item.quantity > 10 ? "default" : "destructive"} className="text-xs">
                                  {item.quantity}
                                </Badge>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="recent" className="mt-0">
                    <ScrollArea className="h-96">
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {recentItems.map(item => (
                          <Card
                            key={item.id}
                            className="cursor-pointer hover:shadow-md transition-all duration-200 border-slate-200 hover:border-blue-300 bg-gradient-to-br from-white to-slate-50"
                            onClick={() => addToCart(item)}
                          >
                            <CardContent className="p-3">
                              <div className="aspect-square bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg mb-2 flex items-center justify-center">
                                <History className="w-8 h-8 text-green-600" />
                              </div>
                              <h3 className="font-semibold text-sm text-slate-800 truncate">{item.name}</h3>
                              <p className="text-xs text-slate-500 truncate">{item.sku}</p>
                              <div className="flex items-center justify-between mt-2">
                                <span className="font-bold text-blue-600">${item.sellingPrice.toFixed(2)}</span>
                                <Badge variant={item.quantity > 10 ? "default" : "destructive"} className="text-xs">
                                  {item.quantity}
                                </Badge>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                </CardContent>
              </Tabs>
            </Card>
          </div>

          {/* Cart and Checkout Panel */}
          <div className="space-y-6">
            {/* Customer Selection */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <User className="w-5 h-5 mr-2 text-blue-600" />
                  Customer
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedCustomer ? (
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div>
                      <p className="font-semibold text-slate-800">{selectedCustomer.name}</p>
                      <p className="text-sm text-slate-600">{selectedCustomer.email}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedCustomer(null)}
                      className="text-slate-500 hover:text-slate-700"
                    >
                      <XCircle className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <Dialog open={isCustomerModalOpen} onOpenChange={setIsCustomerModalOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-slate-600">
                        <Plus className="w-4 h-4 mr-2" />
                        Select Customer
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Select Customer</DialogTitle>
                        <DialogDescription>
                          Choose a customer for this transaction
                        </DialogDescription>
                      </DialogHeader>
                      <ScrollArea className="h-64">
                        <div className="space-y-2">
                          {customers.map(customer => (
                            <Card
                              key={customer.id}
                              className="cursor-pointer hover:bg-blue-50 transition-colors"
                              onClick={() => {
                                setSelectedCustomer(customer)
                                setIsCustomerModalOpen(false)
                              }}
                            >
                              <CardContent className="p-3">
                                <p className="font-semibold">{customer.name}</p>
                                <p className="text-sm text-slate-600">{customer.email}</p>
                                <p className="text-sm text-slate-500">{customer.phone}</p>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </ScrollArea>
                    </DialogContent>
                  </Dialog>
                )}
              </CardContent>
            </Card>

            {/* Shopping Cart */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center justify-between">
                  <div className="flex items-center">
                    <ShoppingCart className="w-5 h-5 mr-2 text-blue-600" />
                    Cart ({cart.itemCount})
                  </div>
                  {cart.items.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearCart}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {cart.items.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p>Your cart is empty</p>
                    <p className="text-sm">Add items to get started</p>
                  </div>
                ) : (
                  <ScrollArea className="h-64">
                    <div className="space-y-3">
                      {cart.items.map(item => (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-slate-800 truncate">{item.name}</p>
                            <p className="text-xs text-slate-500">{item.sku}</p>
                            <p className="text-sm font-bold text-blue-600">${item.price.toFixed(2)} each</p>
                          </div>
                          <div className="flex items-center gap-2 ml-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}
                              className="w-8 h-8 p-0"
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="w-8 text-center font-semibold">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                              className="w-8 h-8 p-0"
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFromCart(item.id)}
                              className="w-8 h-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>

            {/* Order Summary */}
            {cart.items.length > 0 && (
              <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-indigo-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <Calculator className="w-5 h-5 mr-2 text-blue-600" />
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span>${cart.subTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Tax ({(taxRate * 100).toFixed(0)}%):</span>
                    <span>${cart.taxAmount.toFixed(2)}</span>
                  </div>
                  {cart.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount:</span>
                      <span>-${cart.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-lg font-bold text-slate-800">
                    <span>Total:</span>
                    <span>${cart.total.toFixed(2)}</span>
                  </div>
                  
                  {/* Payment Button */}
                  <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        className="w-full mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
                        size="lg"
                        disabled={!sessionId}
                      >
                        <CreditCard className="w-5 h-5 mr-2" />
                        Process Payment
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle className="flex items-center">
                          <CreditCard className="w-5 h-5 mr-2 text-blue-600" />
                          Process Payment
                        </DialogTitle>
                        <DialogDescription>
                          Total Amount: <span className="font-bold text-lg">${cart.total.toFixed(2)}</span>
                        </DialogDescription>
                      </DialogHeader>

                      {paymentSuccess ? (
                        <div className="text-center py-6">
                          <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
                          <h3 className="text-lg font-semibold text-green-700 mb-2">Payment Successful!</h3>
                          <p className="text-slate-600">Transaction completed successfully</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {paymentError && (
                            <Alert className="border-red-200 bg-red-50">
                              <AlertCircle className="h-4 w-4 text-red-600" />
                              <AlertDescription className="text-red-700">
                                {paymentError}
                              </AlertDescription>
                            </Alert>
                          )}

                          <div>
                            <Label htmlFor="paymentMethod">Payment Method</Label>
                            <Select value={paymentMethod} onValueChange={(value: PaymentMethod) => setPaymentMethod(value)}>
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="CASH">
                                  <div className="flex items-center">
                                    <Banknote className="w-4 h-4 mr-2" />
                                    Cash
                                  </div>
                                </SelectItem>
                                <SelectItem value="CREDIT_CARD">
                                  <div className="flex items-center">
                                    <CreditCard className="w-4 h-4 mr-2" />
                                    Credit Card
                                  </div>
                                </SelectItem>
                                <SelectItem value="DEBIT_CARD">
                                  <div className="flex items-center">
                                    <CreditCard className="w-4 h-4 mr-2" />
                                    Debit Card
                                  </div>
                                </SelectItem>
                                <SelectItem value="DIGITAL_WALLET">
                                  <div className="flex items-center">
                                    <Smartphone className="w-4 h-4 mr-2" />
                                    Digital Wallet
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {paymentMethod === 'CASH' && (
                            <div>
                              <Label htmlFor="cashTendered">Cash Tendered</Label>
                              <Input
                                id="cashTendered"
                                type="number"
                                step="0.01"
                                min="0"
                                value={cashTendered}
                                onChange={(e) => setCashTendered(e.target.value)}
                                placeholder="0.00"
                                className="mt-1"
                              />
                              {parseFloat(cashTendered) > cart.total && (
                                <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                                  <p className="text-sm text-green-700">
                                    Change: <span className="font-bold">${changeAmount.toFixed(2)}</span>
                                  </p>
                                </div>
                              )}
                            </div>
                          )}

                          <DialogFooter className="gap-2">
                            <Button
                              variant="outline"
                              onClick={() => setIsPaymentModalOpen(false)}
                              disabled={isProcessingPayment}
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={processPayment}
                              disabled={isProcessingPayment}
                              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                            >
                              {isProcessingPayment ? (
                                <>
                                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                  Processing...
                                </>
                              ) : (
                                <>
                                  <DollarSign className="w-4 h-4 mr-2" />
                                  Complete Payment
                                </>
                              )}
                            </Button>
                          </DialogFooter>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>

                  {!sessionId && (
                    <Alert className="mt-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        No active POS session. Please start a session to process payments.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
