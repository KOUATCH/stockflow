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
  Building2,
  Download,
  Filter,
  MapPin,
  Package,
  Plus,
  RefreshCw,
  Search,
  Star,
  TrendingDown,
  TrendingUp,
  Warehouse
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface LocationInventoryPageProps {
  params: Promise<{ id: string }> | { id: string };
}

// Mock inventory data - in a real app this would come from your database
const mockInventoryData = [
  {
    id: "1",
    itemName: "Premium Coffee Beans",
    sku: "COF-001",
    category: "Beverages",
    currentStock: 125,
    minimumStock: 50,
    maximumStock: 200,
    unitCost: 15.99,
    totalValue: 1998.75,
    lastUpdated: new Date("2024-12-30"),
    status: "in_stock"
  },
  {
    id: "2",
    itemName: "Wireless Headphones",
    sku: "ELE-002",
    category: "Electronics",
    currentStock: 8,
    minimumStock: 10,
    maximumStock: 50,
    unitCost: 89.99,
    totalValue: 719.92,
    lastUpdated: new Date("2024-12-29"),
    status: "low_stock"
  },
  {
    id: "3",
    itemName: "Organic Green Tea",
    sku: "TEA-003",
    category: "Beverages",
    currentStock: 0,
    minimumStock: 20,
    maximumStock: 100,
    unitCost: 8.50,
    totalValue: 0,
    lastUpdated: new Date("2024-12-28"),
    status: "out_of_stock"
  },
  {
    id: "4",
    itemName: "Bluetooth Speaker",
    sku: "ELE-004",
    category: "Electronics",
    currentStock: 35,
    minimumStock: 15,
    maximumStock: 60,
    unitCost: 45.99,
    totalValue: 1609.65,
    lastUpdated: new Date("2024-12-30"),
    status: "in_stock"
  },
  {
    id: "5",
    itemName: "Artisan Chocolate",
    sku: "FOD-005",
    category: "Food",
    currentStock: 2,
    minimumStock: 10,
    maximumStock: 40,
    unitCost: 12.99,
    totalValue: 25.98,
    lastUpdated: new Date("2024-12-29"),
    status: "low_stock"
  }
];

export default async function LocationInventoryPage(props: LocationInventoryPageProps) {
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

  const totalItems = mockInventoryData.length;
  const inStockItems = mockInventoryData.filter(item => item.status === "in_stock").length;
  const lowStockItems = mockInventoryData.filter(item => item.status === "low_stock").length;
  const outOfStockItems = mockInventoryData.filter(item => item.status === "out_of_stock").length;
  const totalValue = mockInventoryData.reduce((sum, item) => sum + item.totalValue, 0);

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

  const getStatusBadge = (status: string, currentStock: number, minimumStock: number) => {
    switch (status) {
      case "in_stock":
        return (
          <Badge className="bg-green-100 text-green-700 border-green-200">
            In Stock
          </Badge>
        );
      case "low_stock":
        return (
          <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
            Low Stock
          </Badge>
        );
      case "out_of_stock":
        return (
          <Badge className="bg-red-100 text-red-700 border-red-200">
            Out of Stock
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
              <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Inventory - {location.name}
                  </h1>
                  {location.isDefault && (
                    <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
                      <Star className="w-3 h-3 mr-1" />
                      Default
                    </Badge>
                  )}
                </div>
                <p className="text-slate-600 dark:text-slate-400">
                  Inventory levels and stock management for this location
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Inventory Overview Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <Card className="group relative overflow-hidden bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10"></div>
            <div className="absolute top-3 right-3 p-2 rounded-full bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
              <Package className="w-4 h-4 text-blue-600" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                Total Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                {totalItems}
              </div>
              <div className="flex items-center gap-1">
                <Warehouse className="w-3 h-3 text-blue-500" />
                <p className="text-xs text-slate-600 dark:text-slate-400">Unique products</p>
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
                In Stock
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                {inStockItems}
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <p className="text-xs text-slate-600 dark:text-slate-400">Available items</p>
              </div>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-orange-500/10"></div>
            <div className="absolute top-3 right-3 p-2 rounded-full bg-yellow-500/10 group-hover:bg-yellow-500/20 transition-colors">
              <TrendingDown className="w-4 h-4 text-yellow-600" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                Low Stock
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                {lowStockItems}
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                <p className="text-xs text-slate-600 dark:text-slate-400">Need restocking</p>
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
                Out of Stock
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                {outOfStockItems}
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <p className="text-xs text-slate-600 dark:text-slate-400">Urgent attention</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Inventory Management */}
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Inventory Items
                </CardTitle>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Total Value: <span className="font-semibold">{formatCurrency(totalValue)}</span> • {totalItems} items
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
                <Button size="sm" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Stock
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
                  placeholder="Search by item name or SKU..."
                  className="pl-10"
                />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="beverages">Beverages</SelectItem>
                  <SelectItem value="electronics">Electronics</SelectItem>
                  <SelectItem value="food">Food</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="all">
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="in_stock">In Stock</SelectItem>
                  <SelectItem value="low_stock">Low Stock</SelectItem>
                  <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Inventory Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left py-3 px-4 font-medium text-slate-600 dark:text-slate-400">Item</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-600 dark:text-slate-400">Category</th>
                    <th className="text-center py-3 px-4 font-medium text-slate-600 dark:text-slate-400">Current Stock</th>
                    <th className="text-center py-3 px-4 font-medium text-slate-600 dark:text-slate-400">Min/Max</th>
                    <th className="text-right py-3 px-4 font-medium text-slate-600 dark:text-slate-400">Unit Cost</th>
                    <th className="text-right py-3 px-4 font-medium text-slate-600 dark:text-slate-400">Total Value</th>
                    <th className="text-center py-3 px-4 font-medium text-slate-600 dark:text-slate-400">Status</th>
                    <th className="text-center py-3 px-4 font-medium text-slate-600 dark:text-slate-400">Last Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {mockInventoryData.map((item) => (
                    <tr key={item.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-4 px-4">
                        <div>
                          <div className="font-medium text-slate-900 dark:text-white">
                            {item.itemName}
                          </div>
                          <div className="text-sm text-slate-600 dark:text-slate-400">
                            SKU: {item.sku}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant="outline" className="text-xs">
                          {item.category}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {item.currentStock}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          {item.minimumStock} / {item.maximumStock}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right font-medium text-slate-900 dark:text-white">
                        {formatCurrency(item.unitCost)}
                      </td>
                      <td className="py-4 px-4 text-right font-semibold text-slate-900 dark:text-white">
                        {formatCurrency(item.totalValue)}
                      </td>
                      <td className="py-4 px-4 text-center">
                        {getStatusBadge(item.status, item.currentStock, item.minimumStock)}
                      </td>
                      <td className="py-4 px-4 text-center text-sm text-slate-600 dark:text-slate-400">
                        {formatDate(item.lastUpdated)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Additional Actions */}
        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <Card className="flex-1">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-slate-900 dark:text-white">
                    Stock Adjustments
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Manually adjust inventory levels
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Adjust Stock
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="flex-1">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-slate-900 dark:text-white">
                    Transfer Items
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Move inventory to other locations
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  <Building2 className="w-4 h-4 mr-2" />
                  Transfer
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}