"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DataTable from "@/components/DataTableComponents/DataTable";
import { stockColumns, StockItem } from "@/_legacy-dashboard/dashboard/inventory/stock/columns";
import {
  Archive,
  Download,
  Filter,
  Package,
  Plus,
  RefreshCw,
  Settings,
  TrendingDown,
  AlertTriangle,
  Activity,
  BarChart3
} from "lucide-react";
import { useState, useMemo } from "react";

interface StockManagementProps {
  data: StockItem[];
  organizationId: string;
}

export default function StockManagement({ data, organizationId }: StockManagementProps) {
  const [stockFilter, setStockFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Calculate stock statistics
  const stats = useMemo(() => {
    const totalItems = data.length;
    const inStockItems = data.filter(item =>
      (Number(item?.inventoryLevels?.[0]?.quantityOnHand) || 0) > 0
    );
    const lowStockItems = data.filter(item =>
      (Number(item?.inventoryLevels?.[0]?.quantityOnHand) || 0) > 0 &&
      (Number(item?.inventoryLevels?.[0]?.quantityOnHand) || 0) <= 10
    );
    const noStockItems = data.filter(item =>
      (Number(item?.inventoryLevels?.[0]?.quantityOnHand) || 0) === 0
    );

    const totalStockValue = data.reduce((total, item) => {
      const quantity = Number(item?.inventoryLevels?.[0]?.quantityOnHand) || 0;
      const cost = Number(item?.costPrice) || 0;
      return total + (quantity * cost);
    }, 0);

    const totalSellingValue = data.reduce((total, item) => {
      const quantity = Number(item?.inventoryLevels?.[0]?.quantityOnHand) || 0;
      const price = Number(item?.sellingPrice) || 0;
      return total + (quantity * price);
    }, 0);

    return {
      totalItems,
      inStockCount: inStockItems.length,
      lowStockCount: lowStockItems.length,
      noStockCount: noStockItems.length,
      totalStockValue,
      totalSellingValue,
      potentialProfit: totalSellingValue - totalStockValue,
    };
  }, [data]);

  // Get unique categories for filter
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(data.map(item => item.category?.title).filter(Boolean))
    );
    return uniqueCategories.sort();
  }, [data]);

  // Filter data based on selected filters
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const quantity = Number(item?.inventoryLevels?.[0]?.quantityOnHand) || 0;

      // Stock status filter
      let stockMatch = true;
      if (stockFilter === "in-stock") {
        stockMatch = quantity > 0;
      } else if (stockFilter === "low-stock") {
        stockMatch = quantity > 0 && quantity <= 10;
      } else if (stockFilter === "no-stock") {
        stockMatch = quantity === 0;
      } else if (stockFilter === "high-stock") {
        stockMatch = quantity > 50;
      }

      // Category filter
      const categoryMatch = categoryFilter === "all" ||
                          item.category?.title === categoryFilter;

      // Search filter
      const searchMatch = searchTerm === "" ||
                         item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category?.title?.toLowerCase().includes(searchTerm.toLowerCase());

      return stockMatch && categoryMatch && searchMatch;
    });
  }, [data, stockFilter, categoryFilter, searchTerm]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleBulkExport = () => {
    // TODO: Implement bulk export functionality
    console.log("Exporting stock data...");
  };

  const handleStockAdjustment = () => {
    // TODO: Implement bulk stock adjustment
    console.log("Opening bulk stock adjustment...");
  };

  const handleRefresh = () => {
    // TODO: Implement data refresh
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      {/* Quick Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="group relative overflow-hidden bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 dark:from-blue-400/20 dark:to-cyan-400/20"></div>
          <div className="absolute top-3 right-3 p-2 rounded-full bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
            <Package className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
              Total Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {stats.totalItems}
            </div>
            <div className="flex items-center gap-1">
              <Activity className="w-3 h-3 text-blue-500" />
              <p className="text-xs text-slate-600 dark:text-slate-400">Products tracked</p>
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 dark:from-green-400/20 dark:to-emerald-400/20"></div>
          <div className="absolute top-3 right-3 p-2 rounded-full bg-green-500/10 group-hover:bg-green-500/20 transition-colors">
            <Package className="w-4 h-4 text-green-600 dark:text-green-400" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
              In Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {stats.inStockCount}
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <p className="text-xs text-slate-600 dark:text-slate-400">Available</p>
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-orange-500/10 dark:from-amber-400/20 dark:to-orange-400/20"></div>
          <div className="absolute top-3 right-3 p-2 rounded-full bg-amber-500/10 group-hover:bg-amber-500/20 transition-colors">
            <TrendingDown className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
              Low Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {stats.lowStockCount}
            </div>
            <div className="flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-amber-500" />
              <p className="text-xs text-slate-600 dark:text-slate-400">Need restock</p>
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-rose-500/10 dark:from-red-400/20 dark:to-rose-400/20"></div>
          <div className="absolute top-3 right-3 p-2 rounded-full bg-red-500/10 group-hover:bg-red-500/20 transition-colors">
            <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
              No Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {stats.noStockCount}
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <p className="text-xs text-slate-600 dark:text-slate-400">Unavailable</p>
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-violet-500/10 dark:from-purple-400/20 dark:to-violet-400/20"></div>
          <div className="absolute top-3 right-3 p-2 rounded-full bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors">
            <BarChart3 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
              Stock Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {formatCurrency(stats.totalStockValue)}
            </div>
            <div className="flex items-center gap-1">
              <Activity className="w-3 h-3 text-purple-500" />
              <p className="text-xs text-slate-600 dark:text-slate-400">Cost value</p>
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 dark:from-emerald-400/20 dark:to-teal-400/20"></div>
          <div className="absolute top-3 right-3 p-2 rounded-full bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors">
            <BarChart3 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
              Potential Profit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {formatCurrency(stats.potentialProfit)}
            </div>
            <div className="flex items-center gap-1">
              <Activity className="w-3 h-3 text-emerald-500" />
              <p className="text-xs text-slate-600 dark:text-slate-400">Margin</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Filters and Actions */}
      <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Stock Management
              </CardTitle>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Showing {filteredData.length} of {stats.totalItems} items
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={handleBulkExport}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button size="sm" onClick={handleStockAdjustment}>
                <Settings className="w-4 h-4 mr-2" />
                Bulk Actions
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="flex-1">
              <Input
                placeholder="Search items by name, SKU, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Stock Status Filter */}
            <Select value={stockFilter} onValueChange={setStockFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by stock status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Items</SelectItem>
                <SelectItem value="in-stock">In Stock</SelectItem>
                <SelectItem value="low-stock">Low Stock</SelectItem>
                <SelectItem value="no-stock">No Stock</SelectItem>
                <SelectItem value="high-stock">High Stock</SelectItem>
              </SelectContent>
            </Select>

            {/* Category Filter */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Active Filters Display */}
          {(stockFilter !== "all" || categoryFilter !== "all" || searchTerm) && (
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm text-slate-600 dark:text-slate-400">Active filters:</span>
              {stockFilter !== "all" && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Filter className="w-3 h-3" />
                  {stockFilter.replace("-", " ")}
                  <button
                    onClick={() => setStockFilter("all")}
                    className="ml-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {categoryFilter !== "all" && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Filter className="w-3 h-3" />
                  {categoryFilter}
                  <button
                    onClick={() => setCategoryFilter("all")}
                    className="ml-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {searchTerm && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Search: {searchTerm}
                  <button
                    onClick={() => setSearchTerm("")}
                    className="ml-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
                  >
                    ×
                  </button>
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setStockFilter("all");
                  setCategoryFilter("all");
                  setSearchTerm("");
                }}
                className="text-xs"
              >
                Clear all
              </Button>
            </div>
          )}

          {/* TanStack Data Table */}
          <DataTable
            columns={stockColumns}
            data={filteredData}
            searchPlaceholder="Search inventory items..."
          />
        </CardContent>
      </Card>
    </div>
  );
}
