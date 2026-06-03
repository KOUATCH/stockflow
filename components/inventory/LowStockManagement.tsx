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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LowStockItem } from "@/actions/analytics/getLowStockItems";
import {
  AlertTriangle,
  BarChart3,
  Clock,
  Filter,
  Package,
  Plus,
  RefreshCw,
  ShoppingCart,
  TrendingDown,
  Warehouse,
  AlertCircle,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { useState, useMemo } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

interface LowStockManagementProps {
  data: LowStockItem[];
  organizationId: string;
}

export default function LowStockManagement({
  data,
  organizationId
}: LowStockManagementProps) {
  const [urgencyFilter, setUrgencyFilter] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

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

    return {
      totalLowStockItems,
      criticalItems,
      warningItems,
      lowItems,
      outOfStockItems,
      totalDeficit,
      totalValueAtRisk,
      avgDaysUntilOutOfStock: Math.round(avgDaysUntilOutOfStock) || 0
    };
  }, [data]);

  // Filter data based on selected filters
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchesUrgency = urgencyFilter === "all" || item.urgencyLevel === urgencyFilter;
      const matchesLocation = locationFilter === "all" || item.location.id === locationFilter;
      const matchesCategory = categoryFilter === "all" || item.category?.id === categoryFilter;
      const matchesSearch = searchTerm === "" ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.brand?.brandName?.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesUrgency && matchesLocation && matchesCategory && matchesSearch;
    });
  }, [data, urgencyFilter, locationFilter, categoryFilter, searchTerm]);

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

  const getUrgencyBadgeVariant = (urgencyLevel: string) => {
    switch (urgencyLevel) {
      case 'critical': return 'destructive';
      case 'warning': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getUrgencyIcon = (urgencyLevel: string) => {
    switch (urgencyLevel) {
      case 'critical': return <XCircle className="w-3 h-3" />;
      case 'warning': return <AlertCircle className="w-3 h-3" />;
      case 'low': return <AlertTriangle className="w-3 h-3" />;
      default: return <AlertTriangle className="w-3 h-3" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="w-4 h-4 text-cyan-500" />
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Low Stock</p>
                </div>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">
                  {stats.totalLowStockItems}
                </p>
                <div className="flex gap-2 mt-2">
                  <Badge variant="destructive" className="text-xs">
                    {stats.criticalItems} Critical
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {stats.warningItems} Warning
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="w-4 h-4 text-sky-600" />
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Out of Stock</p>
                </div>
                <p className="text-3xl font-bold text-sky-600 dark:text-sky-400">
                  {stats.outOfStockItems}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Immediate attention required
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Package className="w-4 h-4 text-teal-500" />
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Deficit</p>
                </div>
                <p className="text-3xl font-bold text-teal-600 dark:text-teal-400">
                  {stats.totalDeficit}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Units needed to reach reorder levels
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-cyan-500" />
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Avg Days Left</p>
                </div>
                <p className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">
                  {stats.avgDaysUntilOutOfStock}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Until items run out
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500 to-teal-600">
                <Filter className="w-5 h-5 text-white" />
              </div>
              <span className="bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                Low Stock Items
              </span>
            </CardTitle>
            <div className="flex gap-2">
              <Button size="sm" variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Create Purchase Order
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search items by name, SKU, category, or brand..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by urgency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Urgency</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>

              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by location" />
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
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by category" />
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

          {filteredData.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                {searchTerm || urgencyFilter !== "all" || locationFilter !== "all" || categoryFilter !== "all"
                  ? "No matching low stock items"
                  : "All items are well stocked!"
                }
              </h3>
              <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                {searchTerm || urgencyFilter !== "all" || locationFilter !== "all" || categoryFilter !== "all"
                  ? "Try adjusting your filters or search terms to see more results."
                  : "Your inventory levels are healthy. Keep monitoring to maintain optimal stock levels."
                }
              </p>
            </div>
          ) : (
            <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                    <TableHead className="font-semibold">Item Details</TableHead>
                    <TableHead className="font-semibold">Location</TableHead>
                    <TableHead className="font-semibold text-center">Stock Status</TableHead>
                    <TableHead className="font-semibold text-center">Deficit</TableHead>
                    <TableHead className="font-semibold text-center">Value at Risk</TableHead>
                    <TableHead className="font-semibold text-center">Last Transaction</TableHead>
                    <TableHead className="font-semibold text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((item) => (
                    <TableRow key={`${item.id}-${item.location.id}`} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                      <TableCell>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={getUrgencyBadgeVariant(item.urgencyLevel)}
                              className="flex items-center gap-1 text-xs"
                            >
                              {getUrgencyIcon(item.urgencyLevel)}
                              {item.urgencyLevel.toUpperCase()}
                            </Badge>
                          </div>
                          <div>
                            <Link
                              href={`/dashboard/inventory/items/${item.id}/adjust-stock`}
                              className="font-medium text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            >
                              {item.name}
                            </Link>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              SKU: {item.sku}
                            </p>
                            {item.category && (
                              <Badge variant="outline" className="text-xs mt-1">
                                {item.category.title}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Warehouse className="w-4 h-4 text-slate-500" />
                          <span className="text-sm font-medium">{item.location.name}</span>
                        </div>
                      </TableCell>

                      <TableCell className="text-center">
                        <div className="space-y-1">
                          <div className={`text-lg font-bold ${
                            item.currentStock === 0 ? 'text-sky-600' :
                            item.currentStock <= item.reorderPoint * 0.3 ? 'text-cyan-500' :
                            'text-teal-500'
                          }`}>
                            {item.currentStock}
                            {item.unit && (
                              <span className="text-xs text-slate-500 ml-1 font-normal">
                                {item.unit.symbol}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500">
                            Reorder: {item.reorderPoint} | Min: {item.minStockLevel}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="text-center">
                        <div className="text-lg font-bold text-cyan-600">
                          {item.stockDeficit}
                          {item.unit && (
                            <span className="text-xs text-slate-500 ml-1 font-normal">
                              {item.unit.symbol}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500">
                          needed
                        </div>
                      </TableCell>

                      <TableCell className="text-center">
                        <div className="text-lg font-bold text-green-600">
                          ${item.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div className="text-xs text-slate-500">
                          @ ${item.costPrice.toFixed(2)}/unit
                        </div>
                      </TableCell>

                      <TableCell className="text-center">
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          {item.lastTransactionAt
                            ? formatDistanceToNow(new Date(item.lastTransactionAt), { addSuffix: true })
                            : 'No recent activity'
                          }
                        </div>
                        {item.daysUntilOutOfStock && (
                          <div className="text-xs text-teal-600 mt-1">
                            ~{item.daysUntilOutOfStock} days left
                          </div>
                        )}
                      </TableCell>

                      <TableCell className="text-center">
                        <div className="flex justify-center gap-2">
                          <Link href={`/dashboard/inventory/items/${item.id}/adjust-stock`}>
                            <Button size="sm" variant="outline">
                              <Plus className="mr-1 h-3 w-3" />
                              Adjust
                            </Button>
                          </Link>
                          <Button size="sm" variant="outline">
                            <ShoppingCart className="mr-1 h-3 w-3" />
                            Order
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}