"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useOrgItemsNew } from "@/hooks/useAllItemQueries"
import { useOrgLocationsNew } from "@/hooks/useAllLocationsQueries"
import { useCustomers } from "@/hooks/useCustomerQueries"
import { useSalesActions } from "@/hooks/useSalesQueries"
// import { formatCurrency } from "@/lib/utils"
// import type { ItemDTO } from "@/types/item"
import type { CustomerDTO } from "@/types/salesTypes"
import {
  Calculator,
  CreditCard,
  DollarSign,
  Minus,
  Package,
  Plus,
  Receipt,
  Search,
  ShoppingCart,
  Trash2,
  User,
  X,
} from "lucide-react"
import { useSession } from "next-auth/react"
import { useCallback, useState } from "react"
import { toast } from "sonner"

interface CartItem {
  id: string
  item: ItemDTO
  quantity: number
  unitPrice: number
  discount: number
  taxRate: number
  total: number
}

interface CartSummary {
  subtotal: number
  taxAmount: number
  discount: number
  total: number
  itemCount: number
}

export function POSSystem() {
  const { data: session } = useSession()
  const orgId = session?.user?.organizationId || ""

  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDTO | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<string>("")
  const [paymentMethod, setPaymentMethod] = useState<string>("cash")
  const [searchTerm, setSearchTerm] = useState("")
  const [customerSearchTerm, setCustomerSearchTerm] = useState("")
  const [showCustomerSearch, setShowCustomerSearch] = useState(false)

  // Fetch data
  const { data: itemsResponse } = useOrgItemsNew(orgId, { enabled: !!orgId })
  const { data: locationsResponse } = useOrgLocationsNew(orgId, { enabled: !!orgId })
  const { data: customersResponse } = useCustomers({
    organizationId: orgId,
    search: customerSearchTerm,
    limit: 10,
  })

  const { createSalesOrder, isCreating } = useSalesActions()

  const items = itemsResponse?.data || []
  const locations = locationsResponse?.data || []
  const customers = customersResponse?.data || []

  // Filter items based on search
  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Calculate cart summary
  const cartSummary: CartSummary = cart.reduce(
    (summary, cartItem) => {
      const itemSubtotal = cartItem.quantity * cartItem.unitPrice
      const itemTax = (itemSubtotal * cartItem.taxRate) / 100
      const itemDiscount = cartItem.discount
      const itemTotal = itemSubtotal + itemTax - itemDiscount

      return {
        subtotal: summary.subtotal + itemSubtotal,
        taxAmount: summary.taxAmount + itemTax,
        discount: summary.discount + itemDiscount,
        total: summary.total + itemTotal,
        itemCount: summary.itemCount + cartItem.quantity,
      }
    },
    { subtotal: 0, taxAmount: 0, discount: 0, total: 0, itemCount: 0 },
  )

  // Add item to cart
  const addToCart = useCallback((item: ItemDTO) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.item.id === item.id)

      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.item.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem,
        )
      }

      const newCartItem: CartItem = {
        id: `cart_${Date.now()}_${Math.random()}`,
        item,
        quantity: 1,
        unitPrice: item.sellingPrice || 0,
        discount: 0,
        taxRate: item.tax || 0,
        total: item.sellingPrice || 0,
      }

      return [...prevCart, newCartItem]
    })
    toast.success(`${item.name} added to cart`)
  }, [])

  // Update cart item quantity
  const updateQuantity = useCallback((cartItemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(cartItemId)
      return
    }

    setCart((prevCart) =>
      prevCart.map((cartItem) => (cartItem.id === cartItemId ? { ...cartItem, quantity: newQuantity } : cartItem)),
    )
  }, [])

  // Update cart item price
  const updatePrice = useCallback((cartItemId: string, newPrice: number) => {
    setCart((prevCart) =>
      prevCart.map((cartItem) =>
        cartItem.id === cartItemId ? { ...cartItem, unitPrice: Math.max(0, newPrice) } : cartItem,
      ),
    )
  }, [])

  // Update cart item discount
  const updateDiscount = useCallback((cartItemId: string, newDiscount: number) => {
    setCart((prevCart) =>
      prevCart.map((cartItem) =>
        cartItem.id === cartItemId ? { ...cartItem, discount: Math.max(0, newDiscount) } : cartItem,
      ),
    )
  }, [])

  // Remove item from cart
  const removeFromCart = useCallback((cartItemId: string) => {
    setCart((prevCart) => prevCart.filter((cartItem) => cartItem.id !== cartItemId))
  }, [])

  // Clear cart
  const clearCart = useCallback(() => {
    setCart([])
    setSelectedCustomer(null)
    setPaymentMethod("cash")
  }, [])

  // Process sale
  const processSale = useCallback(async () => {
    if (cart.length === 0) {
      toast.error("Cart is empty")
      return
    }

    if (!selectedLocation) {
      toast.error("Please select a location")
      return
    }

    if (!selectedCustomer) {
      toast.error("Please select a customer")
      return
    }

    const orderLines = cart.map((cartItem) => ({
      itemId: cartItem.item.id,
      quantity: cartItem.quantity,
      unitPrice: cartItem.unitPrice,
      taxRate: cartItem.taxRate,
      discount: cartItem.discount,
    }))

    createSalesOrder(
      {
        customerId: selectedCustomer.id,
        locationId: selectedLocation,
        paymentMethod,
        notes: `POS Sale - ${new Date().toLocaleString()}`,
        organizationId: orgId,
        createdById: session?.user?.id || "",
        orderLines,
      },
      {
        onSuccess: (response) => {
          toast.success("Sale completed successfully!")
          clearCart()
          // Here you could print receipt or show receipt modal
        },
      },
    )
  }, [cart, selectedLocation, selectedCustomer, paymentMethod, orgId, session?.user?.id, createSalesOrder, clearCart])

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Left Panel - Product Selection */}
      <div className="flex-1 flex flex-col bg-white border-r">
        {/* Header */}
        <div className="p-4 border-b bg-white">
          <h1 className="text-2xl font-bold mb-4">Point of Sale</h1>

          {/* Search and Location */}
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products by name or SKU..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select Location" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((location) => (
                  <SelectItem key={location.id} value={location.id}>
                    {location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-auto p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredItems.map((item) => (
              <Card
                key={item.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => addToCart(item)}
              >
                <CardContent className="p-4">
                  <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                    <Package className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="font-medium text-sm mb-1 line-clamp-2">{item.name}</h3>
                  <p className="text-xs text-muted-foreground mb-2">{item.sku}</p>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-green-600">{formatCurrency(item.sellingPrice || 0)}</span>
                    <Badge variant={item.quantity > 0 ? "default" : "destructive"} className="text-xs">
                      {item.quantity}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No products found</h3>
              <p className="text-muted-foreground">Try adjusting your search terms</p>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Cart and Checkout */}
      <div className="w-96 flex flex-col bg-white">
        {/* Cart Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Cart ({cartSummary.itemCount})
            </h2>
            {cart.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearCart}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Customer Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Customer</label>
            {selectedCustomer ? (
              <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">{selectedCustomer.name}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedCustomer(null)}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <div className="relative">
                <Input
                  placeholder="Search customers..."
                  value={customerSearchTerm}
                  onChange={(e) => {
                    setCustomerSearchTerm(e.target.value)
                    setShowCustomerSearch(true)
                  }}
                  onFocus={() => setShowCustomerSearch(true)}
                />
                {showCustomerSearch && customers.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white border rounded-lg shadow-lg z-10 max-h-48 overflow-auto">
                    {customers.map((customer) => (
                      <div
                        key={customer.id}
                        className="p-2 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                        onClick={() => {
                          setSelectedCustomer(customer)
                          setCustomerSearchTerm("")
                          setShowCustomerSearch(false)
                        }}
                      >
                        <div className="font-medium">{customer.name}</div>
                        {customer.email && <div className="text-xs text-muted-foreground">{customer.email}</div>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-auto">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-medium mb-2">Cart is empty</h3>
              <p className="text-sm text-muted-foreground">Add products to start a sale</p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {cart.map((cartItem) => (
                <Card key={cartItem.id} className="p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{cartItem.item.name}</h4>
                      <p className="text-xs text-muted-foreground">{cartItem.item.sku}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromCart(cartItem.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2 mb-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(cartItem.id, cartItem.quantity - 1)}
                      className="h-8 w-8 p-0"
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <Input
                      type="number"
                      min="1"
                      value={cartItem.quantity}
                      onChange={(e) => updateQuantity(cartItem.id, Number.parseInt(e.target.value) || 1)}
                      className="w-16 h-8 text-center"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(cartItem.id, cartItem.quantity + 1)}
                      className="h-8 w-8 p-0"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>

                  {/* Price and Discount */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="text-muted-foreground">Price</label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={cartItem.unitPrice}
                        onChange={(e) => updatePrice(cartItem.id, Number.parseFloat(e.target.value) || 0)}
                        className="h-7 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-muted-foreground">Discount</label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={cartItem.discount}
                        onChange={(e) => updateDiscount(cartItem.id, Number.parseFloat(e.target.value) || 0)}
                        className="h-7 text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-2 pt-2 border-t">
                    <span className="text-xs text-muted-foreground">
                      {cartItem.quantity} × {formatCurrency(cartItem.unitPrice)}
                    </span>
                    <span className="font-medium">
                      {formatCurrency(
                        cartItem.quantity * cartItem.unitPrice +
                        (cartItem.quantity * cartItem.unitPrice * cartItem.taxRate) / 100 -
                        cartItem.discount,
                      )}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Cart Summary and Checkout */}
        {cart.length > 0 && (
          <div className="border-t bg-gray-50 p-4 space-y-4">
            {/* Summary */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatCurrency(cartSummary.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax:</span>
                <span>{formatCurrency(cartSummary.taxAmount)}</span>
              </div>
              {cartSummary.discount > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Discount:</span>
                  <span>-{formatCurrency(cartSummary.discount)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>{formatCurrency(cartSummary.total)}</span>
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label className="text-sm font-medium mb-2 block">Payment Method</label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Cash
                    </div>
                  </SelectItem>
                  <SelectItem value="card">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Card
                    </div>
                  </SelectItem>
                  <SelectItem value="bank_transfer">
                    <div className="flex items-center gap-2">
                      <Calculator className="h-4 w-4" />
                      Bank Transfer
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Checkout Button */}
            <Button
              onClick={processSale}
              disabled={isCreating || !selectedCustomer || !selectedLocation}
              className="w-full h-12 text-lg font-semibold"
              size="lg"
            >
              {isCreating ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
              ) : (
                <Receipt className="h-5 w-5 mr-2" />
              )}
              {isCreating ? "Processing..." : `Complete Sale - ${formatCurrency(cartSummary.total)}`}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
