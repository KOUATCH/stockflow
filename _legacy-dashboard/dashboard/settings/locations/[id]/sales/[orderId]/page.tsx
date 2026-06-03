import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAuthenticatedUser } from "@/config/useAuth";
import { getOrgLocationsClientSafe } from "@/actions/locations/clientSafeLocationActions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  CreditCard,
  DollarSign,
  Mail,
  MapPin,
  Package,
  Phone,
  ShoppingCart,
  Star,
  User
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface SalesOrderDetailsPageProps {
  params: Promise<{ id: string; orderId: string }> | { id: string; orderId: string };
}

export default async function SalesOrderDetailsPage(props: SalesOrderDetailsPageProps) {
  const params = 'id' in props.params ? props.params : await props.params;
  const locationId = params.id;
  const orderId = params.orderId;

  const user = await getAuthenticatedUser();
  const userOrg = user?.organizationId;

  if (!userOrg) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        <div className="container py-8">
          <div className="max-w-md mx-auto text-center py-16">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-3">Organization Required</h3>
            <p className="text-muted-foreground">No organization found for the current user.</p>
          </div>
        </div>
      </div>
    );
  }

  const locationsResponse = await getOrgLocationsClientSafe(userOrg);
  const location = locationsResponse.data?.find(loc => loc.id === locationId);

  if (!location) {
    notFound();
  }

  // Mock sales order data - in a real app this would come from your database
  const mockSalesOrder = {
    id: orderId,
    customerName: "John Smith",
    customerEmail: "john.smith@email.com",
    customerPhone: "+1 (555) 123-4567",
    customerAddress: "123 Main St, Anytown, AN 12345",
    total: 245.99,
    subtotal: 225.45,
    tax: 20.54,
    status: "completed",
    paymentMethod: "credit_card",
    paymentStatus: "paid",
    createdAt: new Date("2024-12-30T10:30:00"),
    items: [
      {
        id: "1",
        name: "Premium Coffee Beans",
        sku: "COF-001",
        quantity: 2,
        unitPrice: 15.99,
        totalPrice: 31.98,
        taxRate: 8.25
      },
      {
        id: "2",
        name: "Wireless Headphones",
        sku: "ELE-002",
        quantity: 1,
        unitPrice: 89.99,
        totalPrice: 89.99,
        taxRate: 8.25
      },
      {
        id: "3",
        name: "Artisan Chocolate",
        sku: "FOD-005",
        quantity: 10,
        unitPrice: 12.99,
        totalPrice: 129.90,
        taxRate: 8.25
      }
    ]
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-700 border-green-200">Completed</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Pending</Badge>;
      case "cancelled":
        return <Badge className="bg-red-100 text-red-700 border-red-200">Cancelled</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-100 text-green-700 border-green-200">Paid</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Pending</Badge>;
      case "failed":
        return <Badge className="bg-red-100 text-red-700 border-red-200">Failed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4">
            <Link href={`/dashboard/settings/locations/${locationId}/sales`}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Sales
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Sales Order #{orderId}
                  </h1>
                  {location.isDefault && (
                    <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
                      <Star className="w-3 h-3 mr-1" />
                      Default
                    </Badge>
                  )}
                </div>
                <p className="text-slate-600 dark:text-slate-400">
                  Order details for {location.name}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    Order Summary
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(mockSalesOrder.status)}
                    {getPaymentBadge(mockSalesOrder.paymentStatus)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      Order ID
                    </label>
                    <p className="text-lg font-semibold text-slate-900 dark:text-white">
                      {mockSalesOrder.id}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      Order Date
                    </label>
                    <p className="text-lg font-semibold text-slate-900 dark:text-white">
                      {formatDate(mockSalesOrder.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      Payment Method
                    </label>
                    <div className="flex items-center gap-2 mt-1">
                      <CreditCard className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-700 dark:text-slate-300 capitalize">
                        {mockSalesOrder.paymentMethod.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      Location
                    </label>
                    <div className="flex items-center gap-2 mt-1">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-700 dark:text-slate-300">
                        {location.name}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Order Items ({mockSalesOrder.items.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-700">
                        <th className="text-left py-3 px-2 font-medium text-slate-600 dark:text-slate-400">Item</th>
                        <th className="text-center py-3 px-2 font-medium text-slate-600 dark:text-slate-400">Qty</th>
                        <th className="text-right py-3 px-2 font-medium text-slate-600 dark:text-slate-400">Unit Price</th>
                        <th className="text-right py-3 px-2 font-medium text-slate-600 dark:text-slate-400">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockSalesOrder.items.map((item) => (
                        <tr key={item.id} className="border-b border-slate-100 dark:border-slate-800">
                          <td className="py-4 px-2">
                            <div>
                              <div className="font-medium text-slate-900 dark:text-white">
                                {item.name}
                              </div>
                              <div className="text-sm text-slate-600 dark:text-slate-400">
                                SKU: {item.sku}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-2 text-center font-medium text-slate-900 dark:text-white">
                            {item.quantity}
                          </td>
                          <td className="py-4 px-2 text-right font-medium text-slate-900 dark:text-white">
                            {formatCurrency(item.unitPrice)}
                          </td>
                          <td className="py-4 px-2 text-right font-semibold text-slate-900 dark:text-white">
                            {formatCurrency(item.totalPrice)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Order Totals */}
                <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <div className="space-y-2 max-w-xs ml-auto">
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Subtotal:</span>
                      <span className="font-medium text-slate-900 dark:text-white">
                        {formatCurrency(mockSalesOrder.subtotal)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Tax:</span>
                      <span className="font-medium text-slate-900 dark:text-white">
                        {formatCurrency(mockSalesOrder.tax)}
                      </span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t border-slate-200 dark:border-slate-700 pt-2">
                      <span className="text-slate-900 dark:text-white">Total:</span>
                      <span className="text-slate-900 dark:text-white">
                        {formatCurrency(mockSalesOrder.total)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Customer Name
                  </label>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {mockSalesOrder.customerName}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      {mockSalesOrder.customerEmail}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      {mockSalesOrder.customerPhone}
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      {mockSalesOrder.customerAddress}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Status */}
            <Card>
              <CardHeader>
                <CardTitle>Order Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400 block mb-2">
                    Order Status
                  </label>
                  {getStatusBadge(mockSalesOrder.status)}
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400 block mb-2">
                    Payment Status
                  </label>
                  {getPaymentBadge(mockSalesOrder.paymentStatus)}
                </div>
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Financial Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Items Count</span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {mockSalesOrder.items.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Subtotal</span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {formatCurrency(mockSalesOrder.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Tax</span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {formatCurrency(mockSalesOrder.tax)}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t border-slate-200 dark:border-slate-700 pt-2">
                  <span className="text-slate-900 dark:text-white">Total</span>
                  <span className="text-slate-900 dark:text-white">
                    {formatCurrency(mockSalesOrder.total)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href={`/dashboard/settings/locations/${locationId}/sales/${orderId}/receipt`} className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Package className="w-4 h-4 mr-2" />
                    Print Receipt
                  </Button>
                </Link>
                <Button variant="outline" className="w-full justify-start">
                  <Mail className="w-4 h-4 mr-2" />
                  Email Customer
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="w-4 h-4 mr-2" />
                  View History
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}