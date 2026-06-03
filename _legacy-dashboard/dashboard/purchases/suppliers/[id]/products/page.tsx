import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getAuthenticatedUser } from "@/config/useAuth";
import {
  ArrowLeft,
  Building2,
  DollarSign,
  Download,
  Edit,
  Eye,
  Filter,
  Package,
  Search,
  Star,
  Tag,
  TrendingDown,
  TrendingUp,
  Truck
} from "lucide-react";
import Link from "next/link";

interface ProductsPageProps {
  params: {
    id: string;
  };
}

// Mock products data
const mockProducts = [
  {
    id: "prod_001",
    name: "Wireless Bluetooth Headphones",
    sku: "WBH-001",
    category: "Electronics",
    supplierSku: "TC-WBH-001",
    unitCost: 45.50,
    lastPurchaseDate: new Date("2024-11-15"),
    leadTimeDays: 7,
    minOrderQuantity: 10,
    isPreferred: true,
    totalOrdered: 250,
    lastOrderValue: 1137.50
  },
  {
    id: "prod_002",
    name: "USB-C Charging Cable",
    sku: "USB-C-001",
    category: "Accessories",
    supplierSku: "TC-USB-001",
    unitCost: 12.99,
    lastPurchaseDate: new Date("2024-10-28"),
    leadTimeDays: 3,
    minOrderQuantity: 50,
    isPreferred: false,
    totalOrdered: 500,
    lastOrderValue: 649.50
  },
  {
    id: "prod_003",
    name: "Laptop Stand Adjustable",
    sku: "LSA-001",
    category: "Accessories",
    supplierSku: "TC-LSA-001",
    unitCost: 89.00,
    lastPurchaseDate: new Date("2024-11-10"),
    leadTimeDays: 10,
    minOrderQuantity: 5,
    isPreferred: true,
    totalOrdered: 75,
    lastOrderValue: 890.00
  },
  {
    id: "prod_004",
    name: "Wireless Mouse",
    sku: "WM-001",
    category: "Electronics",
    supplierSku: "TC-WM-001",
    unitCost: 25.75,
    lastPurchaseDate: new Date("2024-09-15"),
    leadTimeDays: 5,
    minOrderQuantity: 20,
    isPreferred: false,
    totalOrdered: 120,
    lastOrderValue: 515.00
  },
  {
    id: "prod_005",
    name: "Portable Power Bank",
    sku: "PPB-001",
    category: "Electronics",
    supplierSku: "TC-PPB-001",
    unitCost: 32.00,
    lastPurchaseDate: new Date("2024-10-05"),
    leadTimeDays: 7,
    minOrderQuantity: 15,
    isPreferred: true,
    totalOrdered: 180,
    lastOrderValue: 960.00
  }
];

const mockSupplierData = {
  id: "supplier_123",
  name: "TechCorp Solutions Ltd.",
  code: "TC001"
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
  }).format(new Date(date));
};

const getLeadTimeBadge = (days: number) => {
  if (days <= 3) {
    return (
      <Badge className="bg-green-100 text-green-700 border-green-200 dark:bg-green-900 dark:text-green-300">
        {days} days - Fast
      </Badge>
    );
  } else if (days <= 7) {
    return (
      <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-300">
        {days} days - Standard
      </Badge>
    );
  } else {
    return (
      <Badge className="bg-red-100 text-red-700 border-red-200 dark:bg-red-900 dark:text-red-300">
        {days} days - Slow
      </Badge>
    );
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case "Electronics":
      return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400";
    case "Accessories":
      return "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400";
  }
};

export default async function ProductsPage({ params }: ProductsPageProps) {
  const user = await getAuthenticatedUser();
  const userOrg = user?.organizationId;

  if (!userOrg) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        <div className="container py-8">
          <div className="max-w-md mx-auto text-center py-16">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <Building2 className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-3">Access Denied</h3>
            <p className="text-muted-foreground">You need to be part of an organization to view products.</p>
          </div>
        </div>
      </div>
    );
  }

  const supplier = mockSupplierData;
  const products = mockProducts;

  // Calculate summary statistics
  const totalProducts = products.length;
  const preferredProducts = products.filter(p => p.isPreferred).length;
  const totalValue = products.reduce((sum, product) => sum + product.lastOrderValue, 0);
  const avgLeadTime = Math.round(products.reduce((sum, product) => sum + product.leadTimeDays, 0) / products.length);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Link href={`/dashboard/purchases/suppliers/${params.id}`}>
              <Button variant="outline" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Details
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                Supplier Products
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                {supplier.name} ({supplier.code})
              </p>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                    <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Total Products</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalProducts}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/20">
                    <Star className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Preferred</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{preferredProducts}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/20">
                    <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Total Value</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(totalValue)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/20">
                    <Truck className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Avg Lead Time</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{avgLeadTime} days</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filter & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search by product name or SKU..."
                  className="pl-10"
                />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="electronics">Electronics</SelectItem>
                  <SelectItem value="accessories">Accessories</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="all">
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Preferred status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Products</SelectItem>
                  <SelectItem value="preferred">Preferred Only</SelectItem>
                  <SelectItem value="standard">Standard Only</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Export
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Products Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                      {product.name}
                    </CardTitle>
                    <div className="flex items-center gap-2 mb-2">
                      <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono text-slate-600 dark:text-slate-400">
                        {product.sku}
                      </code>
                      <Badge variant="outline" className={getCategoryColor(product.category)}>
                        <Tag className="w-3 h-3 mr-1" />
                        {product.category}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      {product.isPreferred && (
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400">
                          <Star className="w-3 h-3 mr-1" />
                          Preferred
                        </Badge>
                      )}
                      {getLeadTimeBadge(product.leadTimeDays)}
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="space-y-4">
                  {/* Supplier Information */}
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Supplier Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Supplier SKU:</span>
                        <code className="font-mono text-slate-900 dark:text-white">{product.supplierSku}</code>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Unit Cost:</span>
                        <span className="font-semibold text-green-600 dark:text-green-400">
                          {formatCurrency(product.unitCost)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Min Order:</span>
                        <span className="font-medium text-slate-900 dark:text-white">{product.minOrderQuantity} units</span>
                      </div>
                    </div>
                  </div>

                  {/* Purchase History */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Purchase History</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Last Purchase:</span>
                        <span className="font-medium text-slate-900 dark:text-white">
                          {formatDate(product.lastPurchaseDate)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Total Ordered:</span>
                        <span className="font-medium text-slate-900 dark:text-white">{product.totalOrdered} units</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Last Order Value:</span>
                        <span className="font-semibold text-blue-600 dark:text-blue-400">
                          {formatCurrency(product.lastOrderValue)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1 gap-2">
                      <Eye className="w-4 h-4" />
                      View Details
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 gap-2">
                      <Edit className="w-4 h-4" />
                      Edit Terms
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {products.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Package className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No Products Found</h3>
              <p className="text-slate-600 dark:text-slate-400">This supplier hasn't been linked to any products yet.</p>
              <Button className="mt-4 gap-2">
                <Package className="w-4 h-4" />
                Add Products
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}