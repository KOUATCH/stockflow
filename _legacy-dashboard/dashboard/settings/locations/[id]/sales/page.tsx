import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAuthenticatedUser } from "@/config/useAuth";
import { getOrgLocationsClientSafe } from "@/actions/locations/clientSafeLocationActions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  Calendar,
  CreditCard,
  DollarSign,
  Download,
  Eye,
  Filter,
  Mail,
  MapPin,
  Package,
  Plus,
  RefreshCw,
  Search,
  ShoppingCart,
  Star,
  TrendingUp,
  User,
  Users
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface LocationSalesPageProps {
  params: Promise<{ id: string }> | { id: string };
}

// Mock sales data - in a real app this would come from your database
const mockSalesData = [
  {
    id: "SO-001",
    customerName: "John Smith",
    customerEmail: "john.smith@email.com",
    total: 245.99,
    itemCount: 3,
    status: "completed",
    paymentMethod: "credit_card",
    createdAt: new Date("2024-12-30T10:30:00"),
    items: [
      { name: "Premium Coffee Beans", quantity: 2, price: 31.98 },
      { name: "Wireless Headphones", quantity: 1, price: 89.99 },
      { name: "Artisan Chocolate", quantity: 10, price: 129.90 }
    ]
  },
  {
    id: "SO-002",
    customerName: "Sarah Johnson",
    customerEmail: "sarah.j@email.com",
    total: 67.48,
    itemCount: 2,
    status: "pending",
    paymentMethod: "cash",
    createdAt: new Date("2024-12-30T14:15:00"),
    items: [
      { name: "Bluetooth Speaker", quantity: 1, price: 45.99 },
      { name: "Organic Green Tea", quantity: 3, price: 25.50 }
    ]
  },
  {
    id: "SO-003",
    customerName: "Mike Wilson",
    customerEmail: "mike.w@email.com",
    total: 158.97,
    itemCount: 1,
    status: "completed",
    paymentMethod: "debit_card",
    createdAt: new Date("2024-12-29T16:45:00"),
    items: [
      { name: "Wireless Headphones", quantity: 1, price: 89.99 },
      { name: "Premium Coffee Beans", quantity: 2, price: 31.98 },
      { name: "Artisan Chocolate", quantity: 3, price: 38.97 }
    ]
  },
  {
    id: "SO-004",
    customerName: "Emily Brown",
    customerEmail: "emily.brown@email.com",
    total: 91.99,
    itemCount: 2,
    status: "completed",
    paymentMethod: "credit_card",
    createdAt: new Date("2024-12-29T11:20:00"),
    items: [
      { name: "Bluetooth Speaker", quantity: 2, price: 91.98 }
    ]
  },
  {
    id: "SO-005",
    customerName: "David Lee",
    customerEmail: "david.lee@email.com",
    total: 189.45,
    itemCount: 4,
    status: "cancelled",
    paymentMethod: "credit_card",
    createdAt: new Date("2024-12-28T13:10:00"),
    items: [
      { name: "Premium Coffee Beans", quantity: 3, price: 47.97 },
      { name: "Organic Green Tea", quantity: 5, price: 42.50 },
      { name: "Artisan Chocolate", quantity: 8, price: 103.92 }
    ]
  }
];

export default async function LocationSalesPage(props: LocationSalesPageProps) {
  const params = 'id' in props.params ? props.params : await props.params;
  const locationId = params.id;

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

  const totalSales = mockSalesData.length;
  const completedSales = mockSalesData.filter(sale => sale.status === "completed").length;
  const pendingSales = mockSalesData.filter(sale => sale.status === "pending").length;
  const cancelledSales = mockSalesData.filter(sale => sale.status === "cancelled").length;
  const totalRevenue = mockSalesData
    .filter(sale => sale.status === "completed")
    .reduce((sum, sale) => sum + sale.total, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-700 border-green-200">
            Completed
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
            Pending
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className="bg-red-100 text-red-700 border-red-200">
            Cancelled
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            Unknown
          </Badge>
        );
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case "credit_card":
      case "debit_card":
        return <CreditCard className="w-4 h-4" />;
      case "cash":
        return <DollarSign className="w-4 h-4" />;
      default:
        return <CreditCard className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4">
            <Link href={`/dashboard/settings/locations/${locationId}`}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Location
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Sales - {location.name}
                  </h1>
                  {location.isDefault && (
                    <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
                      <Star className="w-3 h-3 mr-1" />
                      Default
                    </Badge>
                  )}
                </div>
                <p className="text-slate-600 dark:text-slate-400">
                  Sales orders and revenue tracking for this location
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sales Overview Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
          <Card className="group relative overflow-hidden bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10"></div>
            <div className="absolute top-3 right-3 p-2 rounded-full bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
              <ShoppingCart className="w-4 h-4 text-blue-600" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                Total Sales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                {totalSales}
              </div>
              <div className="flex items-center gap-1">
                <BarChart3 className="w-3 h-3 text-blue-500" />
                <p className="text-xs text-slate-600 dark:text-slate-400">All orders</p>
              </div>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10"></div>
            <div className="absolute top-3 right-3 p-2 rounded-full bg-green-500/10 group-hover:bg-green-500/20 transition-colors">
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                {completedSales}
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <p className="text-xs text-slate-600 dark:text-slate-400">Successful</p>
              </div>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-orange-500/10"></div>
            <div className="absolute top-3 right-3 p-2 rounded-full bg-yellow-500/10 group-hover:bg-yellow-500/20 transition-colors">
              <Calendar className="w-4 h-4 text-yellow-600" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                {pendingSales}
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                <p className="text-xs text-slate-600 dark:text-slate-400">In progress</p>
              </div>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-pink-500/10"></div>
            <div className="absolute top-3 right-3 p-2 rounded-full bg-red-500/10 group-hover:bg-red-500/20 transition-colors">
              <AlertTriangle className="w-4 h-4 text-red-600" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                Cancelled
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                {cancelledSales}
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <p className="text-xs text-slate-600 dark:text-slate-400">Cancelled</p>
              </div>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10"></div>
            <div className="absolute top-3 right-3 p-2 rounded-full bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors">
              <DollarSign className="w-4 h-4 text-purple-600" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                {formatCurrency(totalRevenue)}
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-purple-500" />
                <p className="text-xs text-slate-600 dark:text-slate-400">Total earned</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sales Management */}
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Sales Orders
                </CardTitle>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Total Revenue: <span className="font-semibold">{formatCurrency(totalRevenue)}</span> • {totalSales} orders
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button size="sm" className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  New Sale
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search by customer name or order ID..."
                  className="pl-10"
                />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="all">
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Payment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  <SelectItem value="credit_card">Credit Card</SelectItem>
                  <SelectItem value="debit_card">Debit Card</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="today">
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Enhanced Sales Table */}
            <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 dark:bg-slate-800">
                    <tr>
                      <th className="text-left py-4 px-6 font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wide text-xs">
                        Order Details
                      </th>
                      <th className="text-left py-4 px-6 font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wide text-xs">
                        Customer
                      </th>
                      <th className="text-center py-4 px-6 font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wide text-xs">
                        Items & Value
                      </th>
                      <th className="text-center py-4 px-6 font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wide text-xs">
                        Payment
                      </th>
                      <th className="text-center py-4 px-6 font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wide text-xs">
                        Status
                      </th>
                      <th className="text-center py-4 px-6 font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wide text-xs">
                        Date & Time
                      </th>
                      <th className="text-center py-4 px-6 font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wide text-xs">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {mockSalesData.map((sale, index) => (
                      <tr
                        key={sale.id}
                        className={`group transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-cyan-50/50 dark:hover:from-blue-900/20 dark:hover:to-cyan-900/20 ${
                          index % 2 === 0 ? "bg-white dark:bg-slate-950" : "bg-slate-50/30 dark:bg-slate-900/30"
                        }`}
                      >
                        <td className="py-6 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all">
                              <ShoppingCart className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <Link
                                href={`/dashboard/settings/locations/${locationId}/sales/${sale.id}`}
                                className="font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors text-lg group-hover:underline"
                              >
                                {sale.id}
                              </Link>
                              <div className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                                Order #{sale.id.split('-').pop()}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-6 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                              {sale.customerName.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900 dark:text-white">
                                {sale.customerName}
                              </div>
                              <div className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {sale.customerEmail}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-6 px-6">
                          <div className="text-center space-y-1">
                            <div className="flex items-center justify-center gap-2">
                              <Package className="w-4 h-4 text-slate-400" />
                              <span className="font-bold text-slate-900 dark:text-white text-lg">
                                {sale.itemCount}
                              </span>
                              <span className="text-xs text-slate-500 dark:text-slate-400">
                                {sale.itemCount === 1 ? 'item' : 'items'}
                              </span>
                            </div>
                            <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                              {formatCurrency(sale.total)}
                            </div>
                          </div>
                        </td>
                        <td className="py-6 px-6">
                          <div className="flex flex-col items-center gap-2">
                            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-full px-3 py-1">
                              {getPaymentMethodIcon(sale.paymentMethod)}
                              <span className="text-sm font-medium text-slate-700 dark:text-slate-300 capitalize">
                                {sale.paymentMethod.replace('_', ' ')}
                              </span>
                            </div>
                            <Badge
                              variant="outline"
                              className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                            >
                              Paid
                            </Badge>
                          </div>
                        </td>
                        <td className="py-6 px-6 text-center">
                          <div className="flex justify-center">
                            {getStatusBadge(sale.status)}
                          </div>
                        </td>
                        <td className="py-6 px-6">
                          <div className="text-center space-y-1">
                            <div className="font-semibold text-slate-900 dark:text-white flex items-center justify-center gap-1">
                              <Calendar className="w-4 h-4 text-slate-400" />
                              {new Intl.DateTimeFormat("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "2-digit"
                              }).format(sale.createdAt)}
                            </div>
                            <div className="text-sm text-slate-600 dark:text-slate-400">
                              {new Intl.DateTimeFormat("en-US", {
                                hour: "2-digit",
                                minute: "2-digit"
                              }).format(sale.createdAt)}
                            </div>
                          </div>
                        </td>
                        <td className="py-6 px-6">
                          <div className="flex items-center justify-center gap-2">
                            <Link href={`/dashboard/settings/locations/${locationId}/sales/${sale.id}`}>
                              <Button
                                size="sm"
                                variant="outline"
                                className="bg-white hover:bg-blue-50 border-blue-200 text-blue-600 hover:text-blue-700 shadow-sm hover:shadow-md transition-all"
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </Button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Actions */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-slate-900 dark:text-white">
                    Sales Analytics
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    View detailed sales reports
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Analytics
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-slate-900 dark:text-white">
                    Customer Management
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Manage customer relationships
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  <Users className="w-4 h-4 mr-2" />
                  Customers
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-slate-900 dark:text-white">
                    POS Terminal
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Process new sales
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  POS
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}