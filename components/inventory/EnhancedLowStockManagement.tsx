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
import { lowStockColumns } from "@/_legacy-dashboard/dashboard/inventory/stock/low-stock/enhanced-columns";
import { LowStockItem } from "@/actions/analytics/getLowStockItems";
import {
  Activity,
  AlertTriangle,
  Archive,
  BarChart3,
  DollarSign,
  Download,
  Filter,
  Package,
  Plus,
  RefreshCw,
  Settings,
  ShoppingCart,
  Star,
  Target,
  TrendingUp,
  TrendingDown,
  Warehouse,
  Clock,
  AlertCircle,
  XCircle,
  CheckCircle2
} from "lucide-react";
import { useState, useMemo } from "react";
import Link from "next/link";

interface EnhancedLowStockManagementProps {
  data: LowStockItem[];
  organizationId: string;
}

export default function EnhancedLowStockManagement({
  data,
  organizationId
}: EnhancedLowStockManagementProps) {
  const [urgencyFilter, setUrgencyFilter] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Calculate comprehensive statistics
  const stats = useMemo(() => {
    const totalLowStockItems = data.length;
    const criticalItems = data.filter(item => item.urgencyLevel === 'critical').length;
    const warningItems = data.filter(item => item.urgencyLevel === 'warning').length;
    const lowItems = data.filter(item => item.urgencyLevel === 'low').length;

    const outOfStockItems = data.filter(item => item.currentStock === 0).length;

    const totalDeficit = data.reduce((sum, item) => sum + item.stockDeficit, 0);
    const totalValueAtRisk = data.reduce((sum, item) => sum + item.totalValue, 0);

    const avgDaysUntilOutOfStock = data
      .filter(item => item.daysUntilOutOfStock !== null)
      .reduce((sum, item) => sum + (item.daysUntilOutOfStock || 0), 0) /
      data.filter(item => item.daysUntilOutOfStock !== null).length;

    // Recent low stock items (last 7 days)
    const recentLowStockItems = data.filter(item => {
      if (!item.lastTransactionAt) return false;
      const daysSinceTransaction = Math.abs(new Date().getTime() - new Date(item.lastTransactionAt).getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceTransaction <= 7;
    });

    // High value at risk items (>$1000)
    const highValueRiskItems = data.filter(item => item.totalValue > 1000);

    return {
      totalLowStockItems,
      criticalItems,
      warningItems,
      lowItems,
      outOfStockItems,
      totalDeficit,
      totalValueAtRisk,
      avgDaysUntilOutOfStock: Math.round(avgDaysUntilOutOfStock) || 0,
      recentLowStockItems: recentLowStockItems.length,
      highValueRiskItems: highValueRiskItems.length
    };
  }, [data]);

  // Filter data based on selected filters
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchesUrgency = urgencyFilter === "all" || item.urgencyLevel === urgencyFilter;
      const matchesLocation = locationFilter === "all" || item.location.id === locationFilter;
      const matchesCategory = categoryFilter === "all" || item.category?.id === categoryFilter;

      return matchesUrgency && matchesLocation && matchesCategory;
    });
  }, [data, urgencyFilter, locationFilter, categoryFilter]);

  // Get unique locations and categories for filters
  const uniqueLocations = useMemo(() => {
    const locations = new Map();
    data.forEach(item => {
      locations.set(item.location.id, item.location);
    });
    return Array.from(locations.values());
  }, [data]);

  const uniqueCategories = useMemo(() => {
    const categories = new Map();
    data.forEach(item => {
      if (item.category) {
        categories.set(item.category.id, item.category);
      }
    });
    return Array.from(categories.values());
  }, [data]);

  return (
    <div className="space-y-6">
      {/* Enhanced Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg">
                  <TrendingDown className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Total Low Stock
                  </div>
                  <div className="text-3xl font-bold text-slate-900 dark:text-white">
                    {stats.totalLowStockItems}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="destructive" className="text-xs px-2 py-1">
                      {stats.criticalItems} Critical
                    </Badge>
                    <Badge variant="secondary" className="text-xs px-2 py-1">
                      {stats.warningItems} Warning
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-500 dark:text-slate-400">vs last week</div>
                <div className="flex items-center gap-1 text-sm font-medium text-red-600 dark:text-red-400">
                  <TrendingUp className="w-3 h-3" />
                  +12%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg">
                  <XCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Out of Stock
                  </div>
                  <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                    {stats.outOfStockItems}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Immediate action required
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-500 dark:text-slate-400">High priority</div>
                <Badge variant="destructive" className="text-xs">URGENT</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Value at Risk
                  </div>
                  <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    ${stats.totalValueAtRisk.toLocaleString('en-US', {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0
                    })}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Current inventory value
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-500 dark:text-slate-400">High value items</div>
                <div className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                  {stats.highValueRiskItems}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Avg Days Left
                  </div>
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {stats.avgDaysUntilOutOfStock}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Until stockout
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-500 dark:text-slate-400">Recent activity</div>
                <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  {stats.recentLowStockItems} items
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950 dark:to-purple-950">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600">
                <ShoppingCart className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white">Quick Actions</h3>
            </div>
            <div className="space-y-3">
              <Link href="/dashboard/inventory/stock/low-stock/create-purchase-order">
                <Button className="w-full justify-start bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Purchase Order
                </Button>
              </Link>
              <Button variant="outline" className="w-full justify-start" onClick={() => {
                // Implement export functionality
                const csvData = filteredData.map(item => ({
                  SKU: item.sku,
                  Name: item.name,
                  Category: item.category?.title || 'N/A',
                  CurrentStock: item.currentStock,
                  ReorderPoint: item.reorderPoint,
                  Deficit: item.stockDeficit,
                  UrgencyLevel: item.urgencyLevel,
                  Location: item.location.name
                }));

                const csv = [
                  Object.keys(csvData[0]).join(','),
                  ...csvData.map(row => Object.values(row).join(','))
                ].join('\\n');

                const blob = new Blob([csv], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `low-stock-report-${new Date().toISOString().split('T')[0]}.csv`;
                a.click();
                window.URL.revokeObjectURL(url);
              }}>
                <Download className="mr-2 h-4 w-4" />
                Export Low Stock Report
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white">Analytics</h3>
            </div>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Activity className="mr-2 h-4 w-4" />
                Stock Movement Analysis
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Target className="mr-2 h-4 w-4" />
                Reorder Point Optimization
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white">Settings</h3>
            </div>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <RefreshCw className="mr-2 h-4 w-4" />
                Auto-Reorder Settings
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <AlertTriangle className="mr-2 h-4 w-4" />
                Alert Preferences
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Data Table */}
      <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg">
                <Package className="w-5 h-5 text-white" />
              </div>
              <span className="bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                Low Stock Items Analysis
              </span>
              <Badge variant="secondary" className="ml-2">
                {filteredData.length} items
              </Badge>
            </CardTitle>

            <div className="flex items-center gap-2">
              <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Urgency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Urgency</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>

              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {uniqueLocations.map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {uniqueCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {filteredData.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900 dark:to-emerald-800 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                {urgencyFilter !== "all" || locationFilter !== "all" || categoryFilter !== "all"
                  ? "No matching low stock items"
                  : "All items are well stocked!"
                }
              </h3>
              <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-6">
                {urgencyFilter !== "all" || locationFilter !== "all" || categoryFilter !== "all"
                  ? "Try adjusting your filters to see more results."
                  : "Your inventory levels are healthy. Keep monitoring to maintain optimal stock levels."
                }
              </p>
              <Button variant="outline" onClick={() => {
                setUrgencyFilter("all");
                setLocationFilter("all");
                setCategoryFilter("all");
              }}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Clear Filters
              </Button>
            </div>
          ) : (
            <DataTable
              columns={lowStockColumns}
              data={filteredData}
              searchPlaceholder="Search items by name, SKU, category, or brand..."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
