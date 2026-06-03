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
import { enhancedLocationsColumns, EnhancedLocation } from "@/_legacy-dashboard/dashboard/settings/locations/enhanced-columns";
import {
  Activity,
  Archive,
  Building2,
  BarChart3,
  Download,
  DollarSign,
  Filter,
  MapPin,
  Plus,
  RefreshCw,
  Settings,
  Star,
  TrendingUp,
  Package,
  Users,
  CheckCircle,
  XCircle,
  ShoppingCart
} from "lucide-react";
import { useState, useMemo } from "react";
import Link from "next/link";
import { LocationType } from "@prisma/client";

interface EnhancedLocationsManagementProps {
  data: EnhancedLocation[];
  organizationId: string;
}

export default function EnhancedLocationsManagement({
  data,
  organizationId
}: EnhancedLocationsManagementProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Calculate statistics
  const stats = useMemo(() => {
    const totalLocations = data.length;
    const activeLocations = data.filter(location => location.isActive !== false).length;
    const defaultLocation = data.find(location => location.isDefault);
    const typeCounts = data.reduce((acc, location) => {
      const type = location.type || "UNKNOWN";
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate total inventory and sales
    const totalInventoryItems = data.reduce((sum, location) =>
      sum + (location._count?.inventoryLevels || 0), 0
    );
    const totalSales = data.reduce((sum, location) =>
      sum + (location._count?.salesOrders || 0), 0
    );
    const totalPurchaseOrders = data.reduce((sum, location) =>
      sum + (location._count?.purchaseOrders || 0), 0
    );

    // Calculate averages
    const averageInventoryPerLocation = Math.floor(totalInventoryItems / totalLocations) || 0;
    const averageSalesPerLocation = Math.floor(totalSales / totalLocations) || 0;

    // Get dominant location type
    const dominantType = Object.entries(typeCounts).reduce((a, b) =>
      typeCounts[a[0]] > typeCounts[b[0]] ? a : b, ["", 0]
    )[0];

    // Calculate locations with low inventory
    const lowInventoryLocations = data.filter(location =>
      (location._count?.inventoryLevels || 0) < 10
    ).length;

    return {
      totalLocations,
      activeLocations,
      inactiveLocations: totalLocations - activeLocations,
      defaultLocation: defaultLocation?.name || "None",
      typeCounts,
      dominantType,
      totalInventoryItems,
      totalSales,
      totalPurchaseOrders,
      averageInventoryPerLocation,
      averageSalesPerLocation,
      lowInventoryLocations,
    };
  }, [data]);

  // Filter data based on selected filters
  const filteredData = useMemo(() => {
    return data.filter(location => {
      // Status filter
      let statusMatch = true;
      if (statusFilter === "active") {
        statusMatch = location.isActive !== false;
      } else if (statusFilter === "inactive") {
        statusMatch = location.isActive === false;
      } else if (statusFilter === "default") {
        statusMatch = location.isDefault === true;
      } else if (statusFilter === "low-inventory") {
        statusMatch = (location._count?.inventoryLevels || 0) < 10;
      } else if (statusFilter === "high-sales") {
        statusMatch = (location._count?.salesOrders || 0) > 10;
      }

      // Type filter
      let typeMatch = true;
      if (typeFilter !== "all") {
        typeMatch = location.type === typeFilter;
      }

      // Search filter
      const searchMatch = searchTerm === "" ||
                         location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         location.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         location.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         location.type?.toLowerCase().includes(searchTerm.toLowerCase());

      return statusMatch && typeMatch && searchMatch;
    });
  }, [data, statusFilter, typeFilter, searchTerm]);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  const handleBulkExport = () => {
    console.log("Exporting locations data...");
    // TODO: Implement bulk export functionality
  };

  const handleBulkActions = () => {
    console.log("Opening bulk actions...");
    // TODO: Implement bulk actions
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      {/* Quick Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
        <Card className="group relative overflow-hidden bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 dark:from-blue-400/20 dark:to-cyan-400/20"></div>
          <div className="absolute top-3 right-3 p-2 rounded-full bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
            <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
              Total Locations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {stats.totalLocations}
            </div>
            <div className="flex items-center gap-1">
              <Activity className="w-3 h-3 text-blue-500" />
              <p className="text-xs text-slate-600 dark:text-slate-400">Network sites</p>
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 dark:from-green-400/20 dark:to-emerald-400/20"></div>
          <div className="absolute top-3 right-3 p-2 rounded-full bg-green-500/10 group-hover:bg-green-500/20 transition-colors">
            <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
              Active Locations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {stats.activeLocations}
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {stats.inactiveLocations} inactive
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-amber-500/10 dark:from-yellow-400/20 dark:to-amber-400/20"></div>
          <div className="absolute top-3 right-3 p-2 rounded-full bg-yellow-500/10 group-hover:bg-yellow-500/20 transition-colors">
            <Star className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
              Default
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold text-slate-900 dark:text-white mb-1 truncate">
              {stats.defaultLocation}
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-500" />
              <p className="text-xs text-slate-600 dark:text-slate-400">Primary site</p>
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 dark:from-purple-400/20 dark:to-pink-400/20"></div>
          <div className="absolute top-3 right-3 p-2 rounded-full bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors">
            <Package className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
              Total Inventory
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {formatNumber(stats.totalInventoryItems)}
            </div>
            <div className="flex items-center gap-1">
              <Package className="w-3 h-3 text-purple-500" />
              <p className="text-xs text-slate-600 dark:text-slate-400">Total items</p>
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 dark:from-emerald-400/20 dark:to-teal-400/20"></div>
          <div className="absolute top-3 right-3 p-2 rounded-full bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors">
            <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
              Total Sales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {formatNumber(stats.totalSales)}
            </div>
            <div className="flex items-center gap-1">
              <ShoppingCart className="w-3 h-3 text-emerald-500" />
              <p className="text-xs text-slate-600 dark:text-slate-400">Transactions</p>
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 dark:from-orange-400/20 dark:to-red-400/20"></div>
          <div className="absolute top-3 right-3 p-2 rounded-full bg-orange-500/10 group-hover:bg-orange-500/20 transition-colors">
            <BarChart3 className="w-4 h-4 text-orange-600 dark:text-orange-400" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
              Avg Inventory
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {stats.averageInventoryPerLocation}
            </div>
            <div className="flex items-center gap-1">
              <BarChart3 className="w-3 h-3 text-orange-500" />
              <p className="text-xs text-slate-600 dark:text-slate-400">Per location</p>
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 dark:from-indigo-400/20 dark:to-purple-400/20"></div>
          <div className="absolute top-3 right-3 p-2 rounded-full bg-indigo-500/10 group-hover:bg-indigo-500/20 transition-colors">
            <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
              Purchase Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {formatNumber(stats.totalPurchaseOrders)}
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3 text-indigo-500" />
              <p className="text-xs text-slate-600 dark:text-slate-400">Total POs</p>
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-pink-500/10 dark:from-red-400/20 dark:to-pink-400/20"></div>
          <div className="absolute top-3 right-3 p-2 rounded-full bg-red-500/10 group-hover:bg-red-500/20 transition-colors">
            <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
              Low Inventory
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {stats.lowInventoryLocations}
            </div>
            <div className="flex items-center gap-1">
              <XCircle className="w-3 h-3 text-red-500" />
              <p className="text-xs text-slate-600 dark:text-slate-400">Need attention</p>
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
                <MapPin className="w-5 h-5" />
                Location Management
              </CardTitle>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Showing {filteredData.length} of {stats.totalLocations} locations • {formatNumber(stats.totalInventoryItems)} total inventory items
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
              <Button size="sm" onClick={handleBulkActions}>
                <Settings className="w-4 h-4 mr-2" />
                Bulk Actions
              </Button>
              <Link href="/dashboard/settings/locations/create">
                <Button size="sm" className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Location
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="flex-1">
              <Input
                placeholder="Search locations by name, code, address, or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Type Filter */}
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="WAREHOUSE">Warehouse</SelectItem>
                <SelectItem value="STORE">Store</SelectItem>
                <SelectItem value="DISTRIBUTION_CENTER">Distribution Center</SelectItem>
                <SelectItem value="SUPPLIER">Supplier</SelectItem>
                <SelectItem value="CUSTOMER">Customer</SelectItem>
                <SelectItem value="MANUFACTURING">Manufacturing</SelectItem>
                <SelectItem value="QUARANTINE">Quarantine</SelectItem>
                <SelectItem value="DAMAGED">Damaged</SelectItem>
                <SelectItem value="TRANSIT">Transit</SelectItem>
                <SelectItem value="VIRTUAL">Virtual</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="active">Active Locations</SelectItem>
                <SelectItem value="inactive">Inactive Locations</SelectItem>
                <SelectItem value="default">Default Location</SelectItem>
                <SelectItem value="low-inventory">Low Inventory</SelectItem>
                <SelectItem value="high-sales">High Sales</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Active Filters Display */}
          {(statusFilter !== "all" || typeFilter !== "all" || searchTerm) && (
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span className="text-sm text-slate-600 dark:text-slate-400">Active filters:</span>
              {typeFilter !== "all" && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Filter className="w-3 h-3" />
                  Type: {typeFilter.toLowerCase().replace('_', ' ')}
                  <button
                    onClick={() => setTypeFilter("all")}
                    className="ml-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {statusFilter !== "all" && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Filter className="w-3 h-3" />
                  Status: {statusFilter.replace("-", " ")}
                  <button
                    onClick={() => setStatusFilter("all")}
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
                  setStatusFilter("all");
                  setTypeFilter("all");
                  setSearchTerm("");
                }}
                className="text-xs"
              >
                Clear all
              </Button>
            </div>
          )}

          {/* Enhanced TanStack Data Table */}
          <DataTable
            columns={enhancedLocationsColumns}
            data={filteredData}
            searchPlaceholder="Search locations network..."
          />
        </CardContent>
      </Card>
    </div>
  );
}
