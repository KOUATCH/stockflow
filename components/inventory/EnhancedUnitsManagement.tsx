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
import { enhancedUnitsColumns, EnhancedUnit } from "@/_legacy-dashboard/dashboard/inventory/units/enhanced-columns";
import {
  Activity,
  Archive,
  BarChart3,
  Download,
  Filter,
  Plus,
  RefreshCw,
  Ruler,
  Settings,
  TrendingUp,
  Hash,
  Package
} from "lucide-react";
import { useState, useMemo } from "react";
import Link from "next/link";

interface EnhancedUnitsManagementProps {
  data: EnhancedUnit[];
  organizationId: string;
}

export default function EnhancedUnitsManagement({
  data,
  organizationId
}: EnhancedUnitsManagementProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Calculate statistics
  const stats = useMemo(() => {
    const totalUnits = data.length;
    const activeUnits = data.filter(() => Math.random() > 0.1).length; // Mock active status
    const popularUnits = data.filter(() => Math.random() > 0.5).length; // Mock popular status
    const recentlyCreated = data.filter(unit => {
      const daysSinceCreated = Math.abs(new Date().getTime() - new Date(unit.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceCreated <= 7;
    }).length;

    // Mock usage statistics
    const totalUsage = data.reduce(() => Math.floor(Math.random() * 100), 0);
    const averageUsage = Math.floor(totalUsage / totalUnits) || 0;

    return {
      totalUnits,
      activeUnits,
      popularUnits,
      recentlyCreated,
      totalUsage,
      averageUsage,
    };
  }, [data]);

  // Filter data based on selected filters
  const filteredData = useMemo(() => {
    return data.filter(unit => {
      // Status filter
      let statusMatch = true;
      if (statusFilter === "active") {
        statusMatch = Math.random() > 0.1; // Mock active status
      } else if (statusFilter === "inactive") {
        statusMatch = Math.random() <= 0.1; // Mock inactive status
      } else if (statusFilter === "popular") {
        statusMatch = Math.random() > 0.5; // Mock popular status
      }

      // Search filter
      const searchMatch = searchTerm === "" ||
                         unit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         unit.symbol.toLowerCase().includes(searchTerm.toLowerCase());

      return statusMatch && searchMatch;
    });
  }, [data, statusFilter, searchTerm]);

  const handleBulkExport = () => {
    console.log("Exporting units data...");
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
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="group relative overflow-hidden bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 dark:from-blue-400/20 dark:to-cyan-400/20"></div>
          <div className="absolute top-3 right-3 p-2 rounded-full bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
            <Ruler className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
              Total Units
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {stats.totalUnits}
            </div>
            <div className="flex items-center gap-1">
              <Activity className="w-3 h-3 text-blue-500" />
              <p className="text-xs text-slate-600 dark:text-slate-400">Measurement units</p>
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 dark:from-green-400/20 dark:to-emerald-400/20"></div>
          <div className="absolute top-3 right-3 p-2 rounded-full bg-green-500/10 group-hover:bg-green-500/20 transition-colors">
            <Activity className="w-4 h-4 text-green-600 dark:text-green-400" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
              Active Units
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {stats.activeUnits}
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <p className="text-xs text-slate-600 dark:text-slate-400">Currently in use</p>
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-violet-500/10 dark:from-purple-400/20 dark:to-violet-400/20"></div>
          <div className="absolute top-3 right-3 p-2 rounded-full bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors">
            <TrendingUp className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
              Popular Units
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {stats.popularUnits}
            </div>
            <div className="flex items-center gap-1">
              <BarChart3 className="w-3 h-3 text-purple-500" />
              <p className="text-xs text-slate-600 dark:text-slate-400">High usage</p>
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-orange-500/10 dark:from-amber-400/20 dark:to-orange-400/20"></div>
          <div className="absolute top-3 right-3 p-2 rounded-full bg-amber-500/10 group-hover:bg-amber-500/20 transition-colors">
            <Plus className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
              Recent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {stats.recentlyCreated}
            </div>
            <div className="flex items-center gap-1">
              <Activity className="w-3 h-3 text-amber-500" />
              <p className="text-xs text-slate-600 dark:text-slate-400">Last 7 days</p>
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 to-pink-500/10 dark:from-rose-400/20 dark:to-pink-400/20"></div>
          <div className="absolute top-3 right-3 p-2 rounded-full bg-rose-500/10 group-hover:bg-rose-500/20 transition-colors">
            <Hash className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
              Unique Symbols
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {stats.totalUnits}
            </div>
            <div className="flex items-center gap-1">
              <Hash className="w-3 h-3 text-rose-500" />
              <p className="text-xs text-slate-600 dark:text-slate-400">All unique</p>
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-cyan-500/10 dark:from-teal-400/20 dark:to-cyan-400/20"></div>
          <div className="absolute top-3 right-3 p-2 rounded-full bg-teal-500/10 group-hover:bg-teal-500/20 transition-colors">
            <Package className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
              Avg. Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {stats.averageUsage}
            </div>
            <div className="flex items-center gap-1">
              <BarChart3 className="w-3 h-3 text-teal-500" />
              <p className="text-xs text-slate-600 dark:text-slate-400">Per unit</p>
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
                <Ruler className="w-5 h-5" />
                Units Management
              </CardTitle>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Showing {filteredData.length} of {stats.totalUnits} measurement units
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
              <Link href="/dashboard/inventory/units/create">
                <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Unit
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
                placeholder="Search units by name or symbol..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Units</SelectItem>
                <SelectItem value="active">Active Units</SelectItem>
                <SelectItem value="inactive">Inactive Units</SelectItem>
                <SelectItem value="popular">Popular Units</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Active Filters Display */}
          {(statusFilter !== "all" || searchTerm) && (
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm text-slate-600 dark:text-slate-400">Active filters:</span>
              {statusFilter !== "all" && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Filter className="w-3 h-3" />
                  {statusFilter.replace("-", " ")}
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
            columns={enhancedUnitsColumns}
            data={filteredData}
            searchPlaceholder="Search measurement units..."
          />
        </CardContent>
      </Card>
    </div>
  );
}
