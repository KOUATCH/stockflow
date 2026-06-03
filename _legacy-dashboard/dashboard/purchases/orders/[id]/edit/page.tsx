"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  DollarSign,
  Edit,
  MapPin,
  Package,
  Phone,
  Mail,
  Plus,
  Save,
  Search,
  Star,
  Trash2,
  User,
  X,
  AlertCircle,
  ShoppingCart,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useNotifications } from "@/components/notifications/NotificationProvider";
import { usePurchaseOrder, useUpdatePurchaseOrder, useAddItemToPurchaseOrder, useRemoveItemFromPurchaseOrder } from "@/hooks/usePurchaseOrders";
import { useAvailableProducts } from "@/hooks/useItems";

// Types for the data structures
interface OrderItem {
  id: string;
  name: string;
  sku: string;
  description?: string;
  category?: string;
  brand?: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  status: string;
  itemId?: string; // Reference to the actual Item
}

interface Supplier {
  id: string;
  name: string;
  code?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
}

interface PurchaseOrder {
  id: string;
  orderNumber: string;
  orderDate: Date;
  status: string;
  paymentStatus: string;
  priority: string;
  orderType: string;
  expectedDelivery?: Date;
  notes?: string;
  supplier: Supplier;
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  items: OrderItem[];
  financials: {
    subtotal: number;
    discount: number;
    discountPercentage: number;
    tax: number;
    taxRate: number;
    shippingCost: number;
    total: number;
  };
}

interface AvailableProduct {
  id: string;
  name: string;
  sku: string;
  description?: string;
  category?: string;
  brand?: string;
  unitPrice: number;
  stockQuantity: number;
  isActive: boolean;
}

interface NewItemForm {
  productId: string;
  quantity: number;
}

const priorityOptions = [
  { value: "low", label: "Low", color: "bg-green-100 text-green-700" },
  { value: "medium", label: "Medium", color: "bg-yellow-100 text-yellow-700" },
  { value: "high", label: "High", color: "bg-orange-100 text-orange-700" },
  { value: "urgent", label: "Urgent", color: "bg-red-100 text-red-700" }
];

const statusOptions = [
  { value: "draft", label: "Draft" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" }
];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
};

// API functions with fallback mock data
async function fetchPurchaseOrder(id: string): Promise<PurchaseOrder | null> {
  try {
    console.log('Attempting to fetch purchase order from API...');
    // Intentionally throw error to test fallback data
    throw new Error('Forcing fallback for debugging');
    const response = await fetch(`/api/purchases/orders/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch purchase order');
    }

    const data = await response.json();
    console.log('API returned data:', data);
    return data;
  } catch (error) {
    console.warn('API failed, using fallback mock data:', error);
    // Return mock data as fallback
    const fallbackData = {
      id: id,
      orderNumber: "PO-2024-001",
      orderDate: new Date("2024-11-15"),
      status: "processing",
      paymentStatus: "pending",
      priority: "high",
      orderType: "standard",
      expectedDelivery: new Date("2024-11-25"),
      notes: "Urgent delivery required for project deadline",
      supplier: {
        id: "supplier_123",
        name: "TechCorp Solutions Ltd.",
        code: "TC001",
        email: "sales@techcorp.com",
        phone: "+1-555-123-4567"
      },
      deliveryAddress: {
        street: "456 Business Plaza",
        city: "San Francisco",
        state: "CA",
        zipCode: "94105",
        country: "USA"
      },
      items: [
        {
          id: "item_1",
          name: "Wireless Bluetooth Headphones",
          sku: "WBH-001",
          description: "Premium wireless headphones with noise cancellation",
          category: "Electronics",
          brand: "TechAudio",
          quantity: 25,
          unitPrice: 45.50,
          lineTotal: 1137.50,
          status: "confirmed",
          itemId: "product_1"
        },
        {
          id: "item_2",
          name: "USB-C Charging Cable",
          sku: "USB-C-001",
          description: "High-speed USB-C to USB-A charging cable",
          category: "Accessories",
          brand: "FastCharge",
          quantity: 100,
          unitPrice: 12.99,
          lineTotal: 1299.00,
          status: "confirmed",
          itemId: "product_2"
        },
        {
          id: "item_3",
          name: "Laptop Stand Adjustable",
          sku: "LSA-001",
          description: "Ergonomic adjustable aluminum laptop stand",
          category: "Accessories",
          brand: "ErgoTech",
          quantity: 15,
          unitPrice: 89.00,
          lineTotal: 1335.00,
          status: "pending",
          itemId: "product_3"
        }
      ],
      financials: {
        subtotal: 3771.50,
        discount: 131.50,
        discountPercentage: 3.5,
        tax: 318.50,
        taxRate: 8.75,
        shippingCost: 125.00,
        total: 4083.50
      }
    };
    console.log('Returning fallback purchase order data:', fallbackData);
    return fallbackData;
  }
}

async function fetchAvailableProducts(): Promise<AvailableProduct[]> {
  try {
    console.log('Attempting to fetch available products from API...');
    // Intentionally throw error to test fallback data
    throw new Error('Forcing products fallback for debugging');
    const response = await fetch('/api/items?active=true', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch available products');
    }

    const data = await response.json();
    console.log('API returned products:', data);
    return data.items || [];
  } catch (error) {
    console.warn('Products API failed, using fallback mock data:', error);
    // Return mock data as fallback
    const fallbackProducts = [
      {
        id: "prod_1",
        name: "4K Webcam HD",
        sku: "WC-4K-001",
        description: "Professional 4K webcam for video conferencing",
        category: "Electronics",
        brand: "VideoPro",
        unitPrice: 129.99,
        stockQuantity: 50,
        isActive: true
      },
      {
        id: "prod_2",
        name: "Mechanical Keyboard RGB",
        sku: "KB-RGB-001",
        description: "Gaming mechanical keyboard with RGB lighting",
        category: "Electronics",
        brand: "KeyMaster",
        unitPrice: 159.00,
        stockQuantity: 30,
        isActive: true
      },
      {
        id: "prod_3",
        name: "Monitor Stand Dual",
        sku: "MS-DUAL-001",
        description: "Dual monitor stand for two 27-inch displays",
        category: "Accessories",
        brand: "DisplayPro",
        unitPrice: 89.99,
        stockQuantity: 25,
        isActive: true
      },
      {
        id: "prod_4",
        name: "USB Hub 4-Port",
        sku: "UH-4P-001",
        description: "Compact 4-port USB 3.0 hub",
        category: "Accessories",
        brand: "ConnectTech",
        unitPrice: 24.99,
        stockQuantity: 100,
        isActive: true
      }
    ];
    console.log('Returning fallback products data:', fallbackProducts);
    return fallbackProducts;
  }
}

async function updatePurchaseOrder(id: string, orderData: PurchaseOrder): Promise<boolean> {
  try {
    const response = await fetch(`/api/purchases/orders/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        orderNumber: orderData.orderNumber,
        status: orderData.status,
        priority: orderData.priority,
        expectedDelivery: orderData.expectedDelivery,
        notes: orderData.notes,
        deliveryAddress: orderData.deliveryAddress,
        items: orderData.items.map(item => ({
          itemId: item.itemId || item.id,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          status: item.status
        })),
        subtotal: orderData.financials.subtotal,
        tax: orderData.financials.tax,
        taxRate: orderData.financials.taxRate,
        shippingCost: orderData.financials.shippingCost,
        discount: orderData.financials.discount,
        discountPercentage: orderData.financials.discountPercentage,
        total: orderData.financials.total
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to update purchase order');
    }

    return true;
  } catch (error) {
    console.error('Error updating purchase order:', error);
    return false;
  }
}

async function addItemToOrder(orderId: string, itemId: string, quantity: number, unitPrice: number): Promise<boolean> {
  try {
    const response = await fetch(`/api/purchases/orders/${orderId}/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        itemId,
        quantity,
        unitPrice,
        status: 'pending'
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to add item to order');
    }

    return true;
  } catch (error) {
    console.error('Error adding item to order:', error);
    return false;
  }
}

async function removeItemFromOrder(orderId: string, itemId: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/purchases/orders/${orderId}/items/${itemId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to remove item from order');
    }

    return true;
  } catch (error) {
    console.error('Error removing item from order:', error);
    return false;
  }
}

export default function EditOrderPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  const notifications = useNotifications();

  // State management
  const [orderData, setOrderData] = useState<PurchaseOrder | null>(null);
  const [availableProducts, setAvailableProducts] = useState<AvailableProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);

  // Debug: Log dialog state changes
  useEffect(() => {
    console.log("Add Item Dialog State:", isAddItemDialogOpen);
  }, [isAddItemDialogOpen]);
  const [newItemForm, setNewItemForm] = useState<NewItemForm>({
    productId: "",
    quantity: 1
  });
  const [searchTerm, setSearchTerm] = useState("");

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [order, products] = await Promise.all([
          fetchPurchaseOrder(orderId),
          fetchAvailableProducts()
        ]);

        if (!order) {
          notifications.error("Order Not Found", "The purchase order you're looking for could not be found.");
          router.push("/dashboard/purchases/orders");
          return;
        }

        console.log("Loaded order data:", order);
        console.log("Loaded available products:", products);
        setOrderData(order);
        setAvailableProducts(products);
      } catch (error) {
        console.error('Error loading data:', error);
        notifications.error("Loading Failed", "Failed to load order data. Please try refreshing the page.");
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      loadData();
    }
  }, [orderId, router]);

  // Filter available products based on search
  const filteredProducts = availableProducts.filter(product =>
    product.isActive && (
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.brand && product.brand.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  );

  // Recalculate totals when items change
  useEffect(() => {
    if (!orderData) return;

    const subtotal = orderData.items.reduce((sum, item) => sum + item.lineTotal, 0);
    const discount = subtotal * (orderData.financials.discountPercentage / 100);
    const taxableAmount = subtotal - discount + orderData.financials.shippingCost;
    const tax = taxableAmount * (orderData.financials.taxRate / 100);
    const total = subtotal - discount + tax + orderData.financials.shippingCost;

    setOrderData(prev => prev ? {
      ...prev,
      financials: {
        ...prev.financials,
        subtotal,
        discount,
        tax,
        total
      }
    } : null);
  }, [orderData?.items, orderData?.financials.discountPercentage, orderData?.financials.taxRate, orderData?.financials.shippingCost]);

  const handleSave = async () => {
    if (!orderData) return;

    setSaving(true);
    try {
      const success = await updatePurchaseOrder(orderId, orderData);
      if (success) {
        setHasUnsavedChanges(false);
        notifications.purchaseOrderUpdated(orderData.orderNumber, "Order details, items, and financial information");
      } else {
        notifications.formError("Purchase Order Update", "Unable to save changes. Please try again.");
      }
    } catch (error) {
      console.error('Error saving order:', error);
      notifications.formError("Purchase Order Update", "An unexpected error occurred while saving changes.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      if (window.confirm("You have unsaved changes. Are you sure you want to cancel?")) {
        router.push(`/dashboard/purchases/orders/${orderId}`);
      }
    } else {
      router.push(`/dashboard/purchases/orders/${orderId}`);
    }
  };

  const updateField = (field: string, value: any) => {
    if (!orderData) return;
    setOrderData(prev => prev ? { ...prev, [field]: value } : null);
    setHasUnsavedChanges(true);
  };

  const updateDeliveryAddress = (field: string, value: string) => {
    if (!orderData) return;
    setOrderData(prev => prev ? {
      ...prev,
      deliveryAddress: { ...prev.deliveryAddress, [field]: value }
    } : null);
    setHasUnsavedChanges(true);
  };

  const updateItemQuantity = (itemId: string, quantity: number) => {
    if (!orderData) return;
    setOrderData(prev => prev ? {
      ...prev,
      items: prev.items.map(item =>
        item.id === itemId
          ? { ...item, quantity, lineTotal: quantity * item.unitPrice }
          : item
      )
    } : null);
    setHasUnsavedChanges(true);
  };

  const updateItemPrice = (itemId: string, unitPrice: number) => {
    if (!orderData) return;
    setOrderData(prev => prev ? {
      ...prev,
      items: prev.items.map(item =>
        item.id === itemId
          ? { ...item, unitPrice, lineTotal: item.quantity * unitPrice }
          : item
      )
    } : null);
    setHasUnsavedChanges(true);
  };

  const removeItem = async (itemId: string) => {
    if (!orderData) return;

    if (window.confirm("Are you sure you want to remove this item?")) {
      try {
        const success = await removeItemFromOrder(orderId, itemId);
        if (success) {
          setOrderData(prev => prev ? {
            ...prev,
            items: prev.items.filter(item => item.id !== itemId)
          } : null);
          setHasUnsavedChanges(true);
          const removedItem = orderData.items.find(item => item.id === itemId);
          if (removedItem) {
            notifications.itemRemovedFromOrder(removedItem.name, orderData.orderNumber);
          }
        } else {
          notifications.error("Removal Failed", "Failed to remove item from order. Please try again.");
        }
      } catch (error) {
        console.error('Error removing item:', error);
        notifications.error("Removal Failed", "An unexpected error occurred while removing the item.");
      }
    }
  };

  const addNewItem = async () => {
    if (!orderData || !newItemForm.productId || newItemForm.quantity <= 0) {
      notifications.warning("Invalid Selection", "Please select a product and enter a valid quantity.");
      return;
    }

    const selectedProduct = availableProducts.find(p => p.id === newItemForm.productId);
    if (!selectedProduct) {
      notifications.error("Product Not Found", "The selected product could not be found.");
      return;
    }

    try {
      const success = await addItemToOrder(
        orderId,
        selectedProduct.id,
        newItemForm.quantity,
        selectedProduct.unitPrice
      );

      if (success) {
        const newItem: OrderItem = {
          id: `item_${Date.now()}`,
          name: selectedProduct.name,
          sku: selectedProduct.sku,
          description: selectedProduct.description,
          category: selectedProduct.category,
          brand: selectedProduct.brand,
          quantity: newItemForm.quantity,
          unitPrice: selectedProduct.unitPrice,
          lineTotal: newItemForm.quantity * selectedProduct.unitPrice,
          status: "pending",
          itemId: selectedProduct.id
        };

        setOrderData(prev => prev ? {
          ...prev,
          items: [...prev.items, newItem]
        } : null);

        setHasUnsavedChanges(true);
        setIsAddItemDialogOpen(false);
        setNewItemForm({ productId: "", quantity: 1 });
        setSearchTerm("");
        notifications.itemAddedToOrder(selectedProduct.name, newItemForm.quantity, orderData.orderNumber);
      } else {
        notifications.error("Addition Failed", "Failed to add item to order. Please try again.");
      }
    } catch (error) {
      console.error('Error adding item:', error);
      notifications.error("Addition Failed", "An unexpected error occurred while adding the item.");
    }
  };

  const updateFinancialField = (field: string, value: number) => {
    if (!orderData) return;
    setOrderData(prev => prev ? {
      ...prev,
      financials: { ...prev.financials, [field]: value }
    } : null);
    setHasUnsavedChanges(true);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                Loading Order Details
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Please wait while we fetch the order information...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (!orderData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                Order Not Found
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                The purchase order you're looking for could not be found.
              </p>
              <Link href="/dashboard/purchases/orders">
                <Button className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Orders
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Link href={`/dashboard/purchases/orders/${params.id}`}>
                <Button variant="outline" size="sm" className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Order Details
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                  <Edit className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                    Edit Purchase Order
                  </h1>
                  <p className="text-slate-600 dark:text-slate-400">
                    {orderData.orderNumber} • {orderData.supplier.name}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancel} className="gap-2">
                <X className="w-4 h-4" />
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="gap-2 bg-blue-600 hover:bg-blue-700"
                disabled={!hasUnsavedChanges || saving}
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>

          {hasUnsavedChanges && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-600" />
                <span className="text-orange-800 font-medium">You have unsaved changes</span>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Left and Center Columns */}
          <div className="lg:col-span-2 space-y-8">
            {/* Basic Information */}
            <Card className="border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-blue-600" />
                  Order Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="orderNumber">Order Number</Label>
                    <Input
                      id="orderNumber"
                      value={orderData.orderNumber}
                      disabled
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Order Status</Label>
                    <Select
                      value={orderData.status}
                      onValueChange={(value) => updateField('status', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={orderData.priority}
                      onValueChange={(value) => updateField('priority', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {priorityOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${option.color}`}></span>
                              {option.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expectedDelivery">Expected Delivery</Label>
                    <Input
                      id="expectedDelivery"
                      type="date"
                      value={orderData.expectedDelivery ? new Date(orderData.expectedDelivery).toISOString().split('T')[0] : ''}
                      onChange={(e) => updateField('expectedDelivery', new Date(e.target.value))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Order Notes</Label>
                  <Textarea
                    id="notes"
                    value={orderData.notes || ''}
                    onChange={(e) => updateField('notes', e.target.value)}
                    placeholder="Add any special instructions or notes for this order..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Delivery Address */}
            <Card className="border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-indigo-600" />
                  Delivery Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="street">Street Address</Label>
                  <Input
                    id="street"
                    value={orderData.deliveryAddress.street}
                    onChange={(e) => updateDeliveryAddress('street', e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={orderData.deliveryAddress.city}
                      onChange={(e) => updateDeliveryAddress('city', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={orderData.deliveryAddress.state}
                      onChange={(e) => updateDeliveryAddress('state', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      value={orderData.deliveryAddress.zipCode}
                      onChange={(e) => updateDeliveryAddress('zipCode', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={orderData.deliveryAddress.country}
                      onChange={(e) => updateDeliveryAddress('country', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card className="border-slate-200 dark:border-slate-700">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-green-600" />
                    Order Items ({orderData.items.length})
                  </CardTitle>
                  <Dialog open={isAddItemDialogOpen} onOpenChange={setIsAddItemDialogOpen}>
                    <Button
                      className="gap-2 bg-green-600 hover:bg-green-700"
                      onClick={() => {
                        console.log("Add Item button clicked - setting dialog to true");
                        setIsAddItemDialogOpen(true);
                      }}
                    >
                      <Plus className="w-4 h-4" />
                      Add Item
                    </Button>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Add Item to Order</DialogTitle>
                        <DialogDescription>
                          Search for and select a product to add to this purchase order
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-4">
                        {/* Search */}
                        <div className="space-y-2">
                          <Label>Search Products</Label>
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                            <Input
                              placeholder="Search by name, SKU, or brand..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="pl-10"
                            />
                          </div>
                        </div>

                        {/* Product Selection */}
                        <div className="space-y-2">
                          <Label>Select Product</Label>
                          <div className="max-h-60 overflow-y-auto border rounded-lg p-2">
                            {console.log("Filtered Products:", filteredProducts)}
                            {filteredProducts.length > 0 ? (
                              <div className="space-y-2">
                                {filteredProducts.map((product) => {
                                  console.log("Rendering product:", product.name, product);
                                  return (
                                  <div
                                    key={product.id}
                                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                                      newItemForm.productId === product.id
                                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                                    }`}
                                    onClick={() => setNewItemForm(prev => ({ ...prev, productId: product.id }))}
                                  >
                                    <div className="flex justify-between items-start">
                                      <div className="flex-1">
                                        <h4 className="font-semibold text-slate-900 dark:text-white">
                                          {product.name}
                                        </h4>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">
                                          SKU: {product.sku}
                                          {product.brand && ` • ${product.brand}`}
                                        </p>
                                        {product.description && (
                                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                            {product.description}
                                          </p>
                                        )}
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                          Stock: {product.stockQuantity} available
                                        </p>
                                      </div>
                                      <div className="text-right">
                                        <div className="font-semibold text-slate-900 dark:text-white">
                                          {formatCurrency(product.unitPrice)}
                                        </div>
                                        <div className="text-xs text-slate-500">per unit</div>
                                      </div>
                                    </div>
                                  </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <div className="text-center py-8 text-slate-500">
                                {searchTerm ? "No products found matching your search" : "Start typing to search products"}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Quantity */}
                        <div className="space-y-2">
                          <Label htmlFor="quantity">Quantity</Label>
                          <Input
                            id="quantity"
                            type="number"
                            min="1"
                            max={newItemForm.productId ? availableProducts.find(p => p.id === newItemForm.productId)?.stockQuantity : undefined}
                            value={newItemForm.quantity}
                            onChange={(e) => setNewItemForm(prev => ({
                              ...prev,
                              quantity: parseInt(e.target.value) || 1
                            }))}
                          />
                        </div>

                        {/* Total Preview */}
                        {newItemForm.productId && (
                          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-slate-600 dark:text-slate-400">Line Total:</span>
                              <span className="font-semibold text-slate-900 dark:text-white">
                                {formatCurrency(
                                  (availableProducts.find(p => p.id === newItemForm.productId)?.unitPrice || 0) * newItemForm.quantity
                                )}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddItemDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={addNewItem} className="bg-green-600 hover:bg-green-700" disabled={!newItemForm.productId}>
                          Add Item
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {console.log("Order Data Items:", orderData.items)}
                {orderData.items && orderData.items.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-slate-200 dark:border-slate-700">
                          <TableHead className="bg-slate-50 dark:bg-slate-900/50">Product</TableHead>
                          <TableHead className="bg-slate-50 dark:bg-slate-900/50">SKU</TableHead>
                          <TableHead className="bg-slate-50 dark:bg-slate-900/50 w-24">Quantity</TableHead>
                          <TableHead className="bg-slate-50 dark:bg-slate-900/50 w-32">Unit Price</TableHead>
                          <TableHead className="bg-slate-50 dark:bg-slate-900/50">Line Total</TableHead>
                          <TableHead className="bg-slate-50 dark:bg-slate-900/50">Status</TableHead>
                          <TableHead className="bg-slate-50 dark:bg-slate-900/50 w-20">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orderData.items.map((item) => {
                          console.log("Rendering item:", item.name, item.sku, item);
                          return (
                          <TableRow key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                            <TableCell>
                              <div>
                                <p className="font-medium text-slate-900 dark:text-white">{item.name || 'No Name Available'}</p>
                                {item.brand && (
                                  <p className="text-sm text-slate-600 dark:text-slate-400">{item.brand}</p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                                {item.sku}
                              </code>
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => updateItemQuantity(item.id, parseInt(e.target.value) || 0)}
                                className="w-20"
                                min="0"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                value={item.unitPrice}
                                onChange={(e) => updateItemPrice(item.id, parseFloat(e.target.value) || 0)}
                                className="w-24"
                                min="0"
                                step="0.01"
                              />
                            </TableCell>
                            <TableCell>
                              <span className="font-semibold">{formatCurrency(item.lineTotal)}</span>
                            </TableCell>
                            <TableCell>
                              <Badge variant={item.status === 'confirmed' ? 'default' : 'secondary'}>
                                {item.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeItem(item.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <ShoppingCart className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                      No items in this order
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                      Add items to this purchase order to get started
                    </p>
                    <Button
                      onClick={() => {
                        console.log("Add First Item button clicked - setting dialog to true");
                        setIsAddItemDialogOpen(true);
                      }}
                      className="gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Your First Item
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Right Column */}
          <div className="space-y-6">
            {/* Supplier Information */}
            <Card className="border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 w-5 text-blue-600" />
                  Supplier Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white">{orderData.supplier.name}</h4>
                  {orderData.supplier.code && (
                    <p className="text-sm text-slate-600 dark:text-slate-400">{orderData.supplier.code}</p>
                  )}
                </div>
                <div className="space-y-2">
                  {orderData.supplier.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-600 dark:text-slate-400">{orderData.supplier.email}</span>
                    </div>
                  )}
                  {orderData.supplier.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-600 dark:text-slate-400">{orderData.supplier.phone}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Financial Summary */}
            <Card className="border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  Financial Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Subtotal</span>
                    <span className="text-slate-900 dark:text-white font-medium">
                      {formatCurrency(orderData.financials.subtotal)}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="discountPercentage" className="text-sm">Discount (%)</Label>
                      <Input
                        id="discountPercentage"
                        type="number"
                        className="w-20 h-8"
                        value={orderData.financials.discountPercentage}
                        onChange={(e) => updateFinancialField('discountPercentage', parseFloat(e.target.value) || 0)}
                        min="0"
                        max="100"
                        step="0.1"
                      />
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-600 dark:text-green-400">Discount Amount</span>
                      <span className="text-green-600 dark:text-green-400 font-medium">
                        -{formatCurrency(orderData.financials.discount)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="shippingCost" className="text-sm">Shipping</Label>
                      <Input
                        id="shippingCost"
                        type="number"
                        className="w-24 h-8"
                        value={orderData.financials.shippingCost}
                        onChange={(e) => updateFinancialField('shippingCost', parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="taxRate" className="text-sm">Tax Rate (%)</Label>
                      <Input
                        id="taxRate"
                        type="number"
                        className="w-20 h-8"
                        value={orderData.financials.taxRate}
                        onChange={(e) => updateFinancialField('taxRate', parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Tax Amount</span>
                      <span className="text-slate-900 dark:text-white font-medium">
                        {formatCurrency(orderData.financials.tax)}
                      </span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between font-semibold text-lg">
                    <span className="text-slate-900 dark:text-white">Total</span>
                    <span className="text-slate-900 dark:text-white">
                      {formatCurrency(orderData.financials.total)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Actions */}
            <Card className="border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full gap-2">
                  <Plus className="w-4 h-4" />
                  Duplicate Order
                </Button>
                <Button variant="outline" className="w-full gap-2">
                  <Mail className="w-4 h-4" />
                  Send to Supplier
                </Button>
                <Button variant="outline" className="w-full gap-2 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300">
                  <X className="w-4 h-4" />
                  Cancel Order
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}