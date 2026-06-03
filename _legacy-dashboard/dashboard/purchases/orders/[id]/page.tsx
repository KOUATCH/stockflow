"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  DollarSign,
  Download,
  Edit,
  Eye,
  FileText,
  MapPin,
  Package,
  Phone,
  Mail,
  RefreshCw,
  Truck,
  User,
  AlertCircle,
  XCircle,
  Star,
  ShoppingCart,
  AlertTriangle,
  PackageCheck,
  Printer,
  Copy,
  Settings,
  History,
  MoreHorizontal,
  Share2,
  Archive
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function EnhancedOrderDetailsPage() {
  const params = useParams();
  const orderId = params.id;

  // Enhanced mock order data with modern structure
  const mockOrderData = {
    id: orderId,
    orderNumber: "PO-2024-001",
    orderDate: new Date("2024-11-15"),
    status: "shipped",
    paymentStatus: "pending",
    priority: "high",
    total: 15420.50,
    subtotal: 13661.00,
    tax: 1234.50,
    discount: 500.00,
    shippingCost: 125.00,
    items: 8,
    receivedItems: 0,
    invoiceNumber: "INV-2024-001",
    notes: "Urgent delivery required for project deadline",
    createdBy: "John Smith",
    approvedBy: "Jane Doe",
    createdAt: new Date("2024-11-15"),
    updatedAt: new Date("2024-11-18"),
    expectedDelivery: new Date("2024-11-25"),
    actualDelivery: null,
    paymentDueDate: new Date("2024-12-15"),
    orderType: "standard",
    trackingNumber: "TRK123456789",
    supplier: {
      id: "supplier_123",
      name: "TechCorp Solutions Ltd.",
      code: "TC001",
      email: "sales@techcorp.com",
      phone: "+1-555-123-4567",
      address: "123 Innovation Drive, San Francisco, CA 94102",
      contactPerson: "Michael Johnson",
      rating: 4.8
    },
    deliveryAddress: {
      street: "456 Business Plaza",
      city: "San Francisco",
      state: "CA",
      zipCode: "94105",
      country: "USA"
    },
    timeline: [
      {
        id: 1,
        title: "Order Created",
        description: "Purchase order was created and saved as draft",
        status: "completed",
        date: new Date("2024-11-15T09:00:00"),
        user: "John Smith"
      },
      {
        id: 2,
        title: "Order Approved",
        description: "Order was approved by manager",
        status: "completed",
        date: new Date("2024-11-15T14:30:00"),
        user: "Jane Doe"
      },
      {
        id: 3,
        title: "Sent to Supplier",
        description: "Purchase order was sent to supplier",
        status: "completed",
        date: new Date("2024-11-16T10:00:00"),
        user: "System"
      },
      {
        id: 4,
        title: "Order Confirmed",
        description: "Supplier confirmed order and provided tracking",
        status: "completed",
        date: new Date("2024-11-17T16:45:00"),
        user: "TechCorp Solutions"
      },
      {
        id: 5,
        title: "In Transit",
        description: "Items have been shipped and are in transit",
        status: "current",
        date: new Date("2024-11-18T08:00:00"),
        user: "Shipping Carrier"
      },
      {
        id: 6,
        title: "Delivery",
        description: "Expected delivery to warehouse",
        status: "pending",
        date: new Date("2024-11-25T10:00:00"),
        user: "Warehouse Team"
      }
    ]
  };

  const order = mockOrderData;
  const progressPercentage = order.status === "completed" ? 100 :
                             order.status === "shipped" ? 80 :
                             order.status === "approved" ? 60 :
                             order.status === "pending" ? 40 : 20;

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { color: "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-900 dark:text-gray-300", icon: Edit },
      pending: { color: "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-300", icon: Clock },
      approved: { color: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900 dark:text-blue-300", icon: CheckCircle },
      shipped: { color: "bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900 dark:text-indigo-300", icon: Truck },
      received: { color: "bg-green-100 text-green-700 border-green-200 dark:bg-green-900 dark:text-green-300", icon: PackageCheck },
      cancelled: { color: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900 dark:text-red-300", icon: XCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    const IconComponent = config.icon;

    return (
      <Badge variant="outline" className={`flex items-center gap-1 text-sm font-medium ${config.color}`}>
        <IconComponent className="w-4 h-4" />
        {status.replace('_', ' ').replace(/\\b\\w/g, l => l.toUpperCase())}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      low: { color: "bg-slate-100 text-slate-700 border-slate-200", icon: TrendingUp },
      medium: { color: "bg-blue-100 text-blue-700 border-blue-200", icon: TrendingUp },
      high: { color: "bg-orange-100 text-orange-700 border-orange-200", icon: AlertTriangle },
      urgent: { color: "bg-red-100 text-red-700 border-red-200", icon: AlertTriangle }
    };

    const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.medium;
    const IconComponent = config.icon;

    return (
      <Badge variant="outline" className={`flex items-center gap-1 text-sm font-medium ${config.color}`}>
        <IconComponent className="w-4 h-4" />
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  return (
    <div className="flex h-screen bg-background">
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background">
          <div className="container mx-auto px-6 py-8 max-w-7xl">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-6">
                <Link href="/dashboard/purchases/orders">
                  <Button variant="outline" size="sm" className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Orders
                  </Button>
                </Link>
                <div className="h-6 w-px bg-slate-200 dark:bg-slate-700"></div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                    <ShoppingCart className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{order.orderNumber}</h1>
                    <p className="text-slate-600 dark:text-slate-400">Purchase Order Details</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusBadge(order.status)}
                  {getPriorityBadge(order.priority)}
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-500" />
                    Supplier Rating: {order.supplier.rating}
                  </Badge>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2">
                        <MoreHorizontal className="h-4 w-4" />
                        Actions
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>Order Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/purchases/orders/${order.id}/edit`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Order
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/purchases/orders/${order.id}/invoice`}>
                          <FileText className="mr-2 h-4 w-4" />
                          View Invoice
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Printer className="mr-2 h-4 w-4" />
                        Print Order
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Download className="mr-2 h-4 w-4" />
                        Download PDF
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Share2 className="mr-2 h-4 w-4" />
                        Share Order
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Copy className="mr-2 h-4 w-4" />
                        Duplicate Order
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Archive className="mr-2 h-4 w-4" />
                        Archive Order
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                    <Edit className="h-4 w-4" />
                    Edit Order
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Order Progress */}
                <Card className="border-slate-200 dark:border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Truck className="h-5 w-5 text-blue-600" />
                      Order Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-400">Progress</span>
                        <span className="font-medium text-slate-900 dark:text-white">{progressPercentage}%</span>
                      </div>
                      <Progress value={progressPercentage} className="h-3" />
                    </div>

                    <div className="space-y-4">
                      {order.timeline.map((step, index) => (
                        <div key={step.id} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              step.status === "completed" ? "bg-green-100 dark:bg-green-900/20" :
                              step.status === "current" ? "bg-blue-100 dark:bg-blue-900/20" :
                              "bg-slate-100 dark:bg-slate-800"
                            }`}>
                              {step.status === "completed" ? (
                                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                              ) : step.status === "current" ? (
                                <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                              ) : (
                                <div className="w-3 h-3 rounded-full bg-slate-400"></div>
                              )}
                            </div>
                            {index < order.timeline.length - 1 && (
                              <div className="w-px h-8 bg-slate-200 dark:bg-slate-700 mt-2"></div>
                            )}
                          </div>
                          <div className="flex-1 pb-8">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-slate-900 dark:text-white">{step.title}</h4>
                              <span className="text-xs text-slate-500 dark:text-slate-400">
                                {formatDate(step.date)}
                              </span>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                              {step.description}
                            </p>
                            <span className="text-xs text-slate-500 dark:text-slate-400">by {step.user}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Items Quick View */}
                <Card className="border-slate-200 dark:border-slate-700">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5 text-green-600" />
                        Order Items ({order.items})
                      </CardTitle>
                      <Link href={`/dashboard/purchases/orders/${order.id}/items`}>
                        <Button variant="outline" size="sm" className="gap-2">
                          <Eye className="h-4 w-4" />
                          View All Items
                        </Button>
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                          <div className="text-2xl font-bold text-slate-900 dark:text-white">{order.items}</div>
                          <div className="text-sm text-slate-600 dark:text-slate-400">Total Items</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{order.receivedItems}</div>
                          <div className="text-sm text-green-600 dark:text-green-400">Received</div>
                        </div>
                        <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{order.items - order.receivedItems}</div>
                          <div className="text-sm text-orange-600 dark:text-orange-400">Pending</div>
                        </div>
                        <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formatCurrency(order.total)}</div>
                          <div className="text-sm text-blue-600 dark:text-blue-400">Total Value</div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Link href={`/dashboard/purchases/orders/${order.id}/items`} className="flex-1">
                          <Button variant="outline" className="w-full gap-2">
                            <Package className="h-4 w-4" />
                            Manage Items
                          </Button>
                        </Link>
                        <Link href={`/dashboard/purchases/orders/${order.id}/receive-items`} className="flex-1">
                          <Button variant="outline" className="w-full gap-2">
                            <PackageCheck className="h-4 w-4" />
                            Receive Items
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Financial Summary */}
                <Card className="border-slate-200 dark:border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      Financial Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Subtotal</span>
                        <span className="font-medium">{formatCurrency(order.subtotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Tax</span>
                        <span className="font-medium">{formatCurrency(order.tax)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Shipping</span>
                        <span className="font-medium">{formatCurrency(order.shippingCost)}</span>
                      </div>
                      {order.discount > 0 && (
                        <div className="flex justify-between text-green-600 dark:text-green-400">
                          <span>Discount</span>
                          <span className="font-medium">-{formatCurrency(order.discount)}</span>
                        </div>
                      )}
                      <Separator />
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span>{formatCurrency(order.total)}</span>
                      </div>
                    </div>

                    <div className="pt-4">
                      <Badge variant="outline" className={`w-full justify-center py-2 ${
                        order.paymentStatus === "paid" ? "text-green-700 border-green-200 bg-green-50" :
                        order.paymentStatus === "pending" ? "text-orange-700 border-orange-200 bg-orange-50" :
                        "text-red-700 border-red-200 bg-red-50"
                      }`}>
                        <CreditCard className="w-4 h-4 mr-2" />
                        Payment {order.paymentStatus}
                      </Badge>
                    </div>

                    <div className="pt-2 space-y-2">
                      <Link href={`/dashboard/purchases/orders/${order.id}/invoice`} className="block">
                        <Button variant="outline" size="sm" className="w-full gap-2">
                          <FileText className="h-4 w-4" />
                          View Invoice
                        </Button>
                      </Link>
                      <Button variant="outline" size="sm" className="w-full gap-2">
                        <Download className="h-4 w-4" />
                        Download Receipt
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Supplier Information */}
                <Card className="border-slate-200 dark:border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-blue-600" />
                      Supplier Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{order.supplier.name}</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-slate-400" />
                          <span className="text-slate-600 dark:text-slate-400">{order.supplier.contactPerson}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-slate-400" />
                          <span className="text-slate-600 dark:text-slate-400">{order.supplier.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-slate-400" />
                          <span className="text-slate-600 dark:text-slate-400">{order.supplier.phone}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-slate-400 mt-0.5" />
                          <span className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                            {order.supplier.address}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 space-y-2">
                      <Button variant="outline" size="sm" className="w-full gap-2">
                        <Mail className="h-4 w-4" />
                        Contact Supplier
                      </Button>
                      <Button variant="outline" size="sm" className="w-full gap-2">
                        <Eye className="h-4 w-4" />
                        View Supplier Profile
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Delivery Information */}
                <Card className="border-slate-200 dark:border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Truck className="h-5 w-5 text-indigo-600" />
                      Delivery Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar className="h-4 w-4 text-slate-400" />
                          <span className="text-sm font-medium text-slate-900 dark:text-white">Expected</span>
                        </div>
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          {formatDate(order.expectedDelivery)}
                        </span>
                      </div>

                      {order.trackingNumber && (
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Package className="h-4 w-4 text-slate-400" />
                            <span className="text-sm font-medium text-slate-900 dark:text-white">Tracking</span>
                          </div>
                          <code className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                            {order.trackingNumber}
                          </code>
                        </div>
                      )}

                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <MapPin className="h-4 w-4 text-slate-400" />
                          <span className="text-sm font-medium text-slate-900 dark:text-white">Delivery Address</span>
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          <div>{order.deliveryAddress.street}</div>
                          <div>
                            {order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.zipCode}
                          </div>
                          <div>{order.deliveryAddress.country}</div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4">
                      <Link href={`/dashboard/purchases/orders/${order.id}/track`} className="block">
                        <Button variant="outline" size="sm" className="w-full gap-2">
                          <Truck className="h-4 w-4" />
                          Track Shipment
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}