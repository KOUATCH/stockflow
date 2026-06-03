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
import { enhancedItemsColumns, EnhancedItem } from "@/_legacy-dashboard/dashboard/inventory/items/enhanced-columns";
import {
  Activity,
  AlertTriangle,
  Archive,
  DollarSign,
  Download,
  Filter,
  Package,
  Plus,
  RefreshCw,
  Settings,
  Star,
  Target,
  TrendingUp,
  Warehouse,
  X
} from "lucide-react";
import { useState, useMemo, type CSSProperties } from "react";
import Link from "next/link";

interface EnhancedItemsManagementProps {
  data: EnhancedItem[];
  organizationId: string;
}

export default function EnhancedItemsManagement({
  data,
  organizationId
}: EnhancedItemsManagementProps) {
  const [stockFilter, setStockFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Calculate comprehensive statistics
  const stats = useMemo(() => {
    const totalItems = data.length;

    // Stock levels
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

    // Financial metrics
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

    const potentialProfit = totalSellingValue - totalStockValue;

    // Active/inactive items
    const activeItems = data.filter(item => item.isActive !== false);
    const discontinuedItems = data.filter(item => item.isDiscontinued === true);

    // Recent items (last 7 days)
    const recentItems = data.filter(item => {
      const daysSinceCreated = Math.abs(new Date().getTime() - new Date(item.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceCreated <= 7;
    });

    // High margin items (>30%)
    const highMarginItems = data.filter(item => {
      const cost = Number(item?.costPrice) || 0;
      const selling = Number(item?.sellingPrice) || 0;
      if (cost === 0) return false;
      const margin = ((selling - cost) / selling) * 100;
      return margin > 30;
    });

    return {
      totalItems,
      inStockCount: inStockItems.length,
      lowStockCount: lowStockItems.length,
      noStockCount: noStockItems.length,
      activeCount: activeItems.length,
      discontinuedCount: discontinuedItems.length,
      recentCount: recentItems.length,
      highMarginCount: highMarginItems.length,
      totalStockValue,
      totalSellingValue,
      potentialProfit,
    };
  }, [data]);

  // Get unique categories for filter
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(data.map(item => item.category?.title).filter((category): category is string => Boolean(category)))
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

      // Status filter
      let statusMatch = true;
      if (statusFilter === "active") {
        statusMatch = item.isActive !== false;
      } else if (statusFilter === "inactive") {
        statusMatch = item.isActive === false;
      } else if (statusFilter === "discontinued") {
        statusMatch = item.isDiscontinued === true;
      }

      // Search filter
      const searchMatch = searchTerm === "" ||
                         item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.brand?.brandName?.toLowerCase().includes(searchTerm.toLowerCase());

      return stockMatch && categoryMatch && statusMatch && searchMatch;
    });
  }, [data, stockFilter, categoryFilter, statusFilter, searchTerm]);

  const hasActiveFilters = stockFilter !== "all" || categoryFilter !== "all" || statusFilter !== "all" || Boolean(searchTerm);

  const clearFilters = () => {
    setStockFilter("all");
    setCategoryFilter("all");
    setStatusFilter("all");
    setSearchTerm("");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleBulkExport = () => {
    console.log("Exporting items data...");
    // TODO: Implement bulk export functionality
  };

  const handleBulkActions = () => {
    console.log("Opening bulk actions...");
    // TODO: Implement bulk actions
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const statCards = [
    {
      label: "Total Items",
      value: stats.totalItems,
      detail: "Product catalog",
      Icon: Package,
      accent: "var(--dash-brand)",
      soft: "var(--dash-brand-soft)",
      valueClassName: "text-2xl",
    },
    {
      label: "In Stock",
      value: stats.inStockCount,
      detail: "Available",
      Icon: Warehouse,
      accent: "var(--dash-success)",
      soft: "var(--dash-success-soft)",
      valueClassName: "text-2xl",
    },
    {
      label: "Low Stock",
      value: stats.lowStockCount,
      detail: "Need restock",
      Icon: AlertTriangle,
      accent: "var(--dash-warning)",
      soft: "var(--dash-warning-soft)",
      valueClassName: "text-2xl",
    },
    {
      label: "No Stock",
      value: stats.noStockCount,
      detail: "Unavailable",
      Icon: Archive,
      accent: "var(--dash-danger)",
      soft: "var(--dash-danger-soft)",
      valueClassName: "text-2xl",
    },
    {
      label: "Active Items",
      value: stats.activeCount,
      detail: "Available for sale",
      Icon: Activity,
      accent: "var(--dash-info)",
      soft: "var(--dash-info-soft)",
      valueClassName: "text-2xl",
    },
    {
      label: "Stock Value",
      value: formatCurrency(stats.totalStockValue),
      detail: "Cost value",
      Icon: DollarSign,
      accent: "var(--dash-spruce)",
      soft: "var(--dash-spruce-soft)",
      valueClassName: "text-lg sm:text-xl",
    },
    {
      label: "Potential Profit",
      value: formatCurrency(stats.potentialProfit),
      detail: "Total margin",
      Icon: TrendingUp,
      accent: "var(--dash-warm)",
      soft: "var(--dash-warm-soft)",
      valueClassName: "text-lg sm:text-xl",
    },
    {
      label: "High Margin",
      value: stats.highMarginCount,
      detail: ">30% margin",
      Icon: Star,
      accent: "var(--dash-gold)",
      soft: "var(--dash-gold-soft)",
      valueClassName: "text-2xl",
    },
  ];

  return (
    <div className="min-w-0 space-y-6" data-organization-id={organizationId}>
      {/* Comprehensive Stats Cards */}
      <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-8">
        {statCards.map(({ label, value, detail, Icon, accent, soft, valueClassName }) => (
          <Card
            key={label}
            className="dashboard-stat-card group relative min-h-[132px] min-w-0 overflow-hidden"
            style={{
              "--stat-accent": accent,
              "--stat-soft": soft,
            } as CSSProperties}
          >
            <div className="absolute inset-x-0 top-0 h-1 bg-[var(--stat-accent)] opacity-80" />
            <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--stat-soft)] text-[var(--stat-accent)] transition-transform duration-200 group-hover:scale-105">
              <Icon className="h-4 w-4" />
            </div>
            <CardHeader className="pb-2 pr-12">
              <CardTitle className="text-[0.68rem] font-semibold uppercase leading-4 tracking-[0.12em] text-[var(--dash-text-faint)]">
                {label}
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className={`${valueClassName} mb-1 truncate font-semibold text-[var(--dash-text)]`}>
                {value}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--stat-accent)]" />
                <p className="truncate text-xs text-[var(--dash-text-soft)]">{detail}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Advanced Filters and Actions */}
      <Card className="dashboard-glass-panel min-w-0 overflow-hidden rounded-lg text-[var(--dash-text)]">
        <CardHeader className="p-5 pb-4">
          <div className="flex min-w-0 flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div className="min-w-0">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-[var(--dash-text)]">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--dash-spruce-soft)] text-[var(--dash-spruce)]">
                  <Package className="h-4 w-4" />
                </span>
                Product Inventory
              </CardTitle>
              <p className="mt-2 text-sm text-[var(--dash-text-soft)]">
                Showing {filteredData.length} of {stats.totalItems} items / {formatCurrency(stats.totalStockValue)} total value
              </p>
            </div>
            <div className="grid w-full grid-cols-2 gap-2 sm:w-auto sm:flex sm:flex-wrap sm:items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="dashboard-button-secondary h-9 justify-center rounded-lg"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkExport}
                className="dashboard-button-secondary h-9 justify-center rounded-lg"
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
              <Button
                size="sm"
                onClick={handleBulkActions}
                className="dashboard-button-secondary h-9 justify-center rounded-lg"
              >
                <Settings className="h-4 w-4" />
                Bulk Actions
              </Button>
              <Button asChild size="sm" className="dashboard-button-primary h-9 justify-center rounded-lg">
                <Link href="/dashboard/inventory/items/create">
                  <Plus className="h-4 w-4" />
                  Add Item
                </Link>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-5 pt-0">
          <div className="mb-5 grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {/* Search */}
            <div className="min-w-0 sm:col-span-2">
              <Input
                placeholder="Search items by name, SKU, category, or brand..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="dashboard-control h-10 w-full rounded-lg"
              />
            </div>

            {/* Stock Status Filter */}
            <Select value={stockFilter} onValueChange={setStockFilter}>
              <SelectTrigger className="dashboard-control h-10 w-full rounded-lg">
                <SelectValue placeholder="Stock status" />
              </SelectTrigger>
              <SelectContent className="border-[var(--dash-border-subtle)] bg-[var(--dash-surface-raised)] text-[var(--dash-text)]">
                <SelectItem value="all">All Stock Levels</SelectItem>
                <SelectItem value="in-stock">In Stock</SelectItem>
                <SelectItem value="low-stock">Low Stock</SelectItem>
                <SelectItem value="no-stock">No Stock</SelectItem>
                <SelectItem value="high-stock">High Stock</SelectItem>
              </SelectContent>
            </Select>

            {/* Category Filter */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="dashboard-control h-10 w-full rounded-lg">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="border-[var(--dash-border-subtle)] bg-[var(--dash-surface-raised)] text-[var(--dash-text)]">
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="dashboard-control h-10 w-full rounded-lg">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="border-[var(--dash-border-subtle)] bg-[var(--dash-surface-raised)] text-[var(--dash-text)]">
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="discontinued">Discontinued</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="mb-4 flex min-w-0 flex-wrap items-center gap-2">
              <span className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--dash-text-faint)]">Active filters</span>
              {stockFilter !== "all" && (
                <Badge variant="outline" className="dashboard-filter-chip flex h-7 items-center gap-1 rounded-lg px-2 text-xs">
                  <Filter className="h-3 w-3 text-[var(--dash-warning)]" />
                  {stockFilter.replace("-", " ")}
                  <button
                    aria-label="Remove stock filter"
                    onClick={() => setStockFilter("all")}
                    className="ml-1 rounded text-[var(--dash-text-faint)] hover:text-[var(--dash-text)]"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {categoryFilter !== "all" && (
                <Badge variant="outline" className="dashboard-filter-chip flex h-7 items-center gap-1 rounded-lg px-2 text-xs">
                  <Target className="h-3 w-3 text-[var(--dash-info)]" />
                  {categoryFilter}
                  <button
                    aria-label="Remove category filter"
                    onClick={() => setCategoryFilter("all")}
                    className="ml-1 rounded text-[var(--dash-text-faint)] hover:text-[var(--dash-text)]"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {statusFilter !== "all" && (
                <Badge variant="outline" className="dashboard-filter-chip flex h-7 items-center gap-1 rounded-lg px-2 text-xs">
                  <Activity className="h-3 w-3 text-[var(--dash-spruce)]" />
                  {statusFilter}
                  <button
                    aria-label="Remove status filter"
                    onClick={() => setStatusFilter("all")}
                    className="ml-1 rounded text-[var(--dash-text-faint)] hover:text-[var(--dash-text)]"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {searchTerm && (
                <Badge variant="outline" className="dashboard-filter-chip flex h-7 max-w-full items-center gap-1 rounded-lg px-2 text-xs">
                  <span className="max-w-[220px] truncate">Search: {searchTerm}</span>
                  <button
                    aria-label="Remove search filter"
                    onClick={() => setSearchTerm("")}
                    className="ml-1 rounded text-[var(--dash-text-faint)] hover:text-[var(--dash-text)]"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-7 rounded-lg px-2 text-xs text-[var(--dash-text-soft)] hover:bg-[var(--dash-surface-warm)] hover:text-[var(--dash-text)]"
              >
                Clear all
              </Button>
            </div>
          )}

          {/* Enhanced TanStack Data Table */}
          {filteredData.length > 0 ? (
            <DataTable
              columns={enhancedItemsColumns}
              data={filteredData}
              searchPlaceholder="Search product inventory..."
              showToolbar={false}
              variant="landing"
            />
          ) : (
            <div className="dashboard-table-shell flex min-h-[260px] min-w-0 flex-col items-center justify-center rounded-lg px-6 py-10 text-center">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-lg border border-[var(--dash-border-subtle)] bg-[var(--dash-brand-soft)] text-[var(--dash-brand-strong)]">
                <Package className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-semibold text-[var(--dash-text)]">
                {hasActiveFilters ? "No items match these filters" : "No inventory items yet"}
              </h3>
              <p className="mt-2 max-w-md text-sm leading-6 text-[var(--dash-text-soft)]">
                {hasActiveFilters
                  ? "Try clearing one or more filters to bring products back into view."
                  : "Start building your catalog by creating the first product item for this organization."}
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                    className="dashboard-button-secondary h-9 rounded-lg"
                  >
                    <X className="h-4 w-4" />
                    Clear filters
                  </Button>
                )}
                <Button asChild size="sm" className="dashboard-button-primary h-9 rounded-lg">
                  <Link href="/dashboard/inventory/items/create">
                    <Plus className="h-4 w-4" />
                    Add Item
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
