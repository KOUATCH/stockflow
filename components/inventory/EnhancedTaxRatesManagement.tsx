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
import { enhancedTaxRateColumns, EnhancedTaxRate } from "@/_legacy-dashboard/dashboard/settings/tax-rates/enhanced-columns";
import {
  Activity,
  Calculator,
  DollarSign,
  Download,
  Filter,
  Percent,
  Plus,
  RefreshCw,
  Scale,
  Settings,
  Star,
  Target,
  TrendingUp,
} from "lucide-react";
import { useState, useMemo } from "react";
import Link from "next/link";

interface EnhancedTaxRatesManagementProps {
  data: EnhancedTaxRate[];
  organizationId: string;
}

export default function EnhancedTaxRatesManagement({
  data,
  organizationId
}: EnhancedTaxRatesManagementProps) {
  const [rateFilter, setRateFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Calculate comprehensive statistics
  const stats = useMemo(() => {
    const totalTaxRates = data.length;

    // Rate categories
    const taxFreeTaxRates = data.filter(rate => Number(rate.rate) === 0);
    const lowRateTaxRates = data.filter(rate => {
      const rateValue = Number(rate.rate);
      return rateValue > 0 && rateValue <= 5;
    });
    const standardRateTaxRates = data.filter(rate => {
      const rateValue = Number(rate.rate);
      return rateValue > 5 && rateValue <= 15;
    });
    const highRateTaxRates = data.filter(rate => Number(rate.rate) > 15);

    // Status categories
    const activeTaxRates = data.filter(rate => rate.isActive !== false);
    const inactiveTaxRates = data.filter(rate => rate.isActive === false);
    const defaultTaxRates = data.filter(rate => rate.isDefault === true);

    // Recent items (last 7 days)
    const recentTaxRates = data.filter(rate => {
      const daysSinceCreated = Math.abs(new Date().getTime() - new Date(rate.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceCreated <= 7;
    });

    // Average tax rate
    const averageRate = data.length > 0 ?
      data.reduce((sum, rate) => sum + Number(rate.rate), 0) / data.length : 0;

    // Most used tax rate (mock data)
    const mostUsedRate = data.length > 0 ? data[0] : null;

    return {
      totalTaxRates,
      taxFreeCount: taxFreeTaxRates.length,
      lowRateCount: lowRateTaxRates.length,
      standardRateCount: standardRateTaxRates.length,
      highRateCount: highRateTaxRates.length,
      activeCount: activeTaxRates.length,
      inactiveCount: inactiveTaxRates.length,
      defaultCount: defaultTaxRates.length,
      recentCount: recentTaxRates.length,
      averageRate,
      mostUsedRate,
    };
  }, [data]);

  // Filter data based on selected filters
  const filteredData = useMemo(() => {
    return data.filter(rate => {
      const rateValue = Number(rate.rate);

      // Rate filter
      let rateMatch = true;
      if (rateFilter === "tax-free") {
        rateMatch = rateValue === 0;
      } else if (rateFilter === "low") {
        rateMatch = rateValue > 0 && rateValue <= 5;
      } else if (rateFilter === "standard") {
        rateMatch = rateValue > 5 && rateValue <= 15;
      } else if (rateFilter === "high") {
        rateMatch = rateValue > 15;
      }

      // Status filter
      let statusMatch = true;
      if (statusFilter === "active") {
        statusMatch = rate.isActive !== false;
      } else if (statusFilter === "inactive") {
        statusMatch = rate.isActive === false;
      } else if (statusFilter === "default") {
        statusMatch = rate.isDefault === true;
      }

      // Search filter
      const searchMatch = searchTerm === "" ||
                         rate.taxRateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rate.rate.toString().includes(searchTerm);

      return rateMatch && statusMatch && searchMatch;
    });
  }, [data, rateFilter, statusFilter, searchTerm]);

  const handleBulkExport = () => {
    console.log("Exporting tax rates data...");
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
      {/* Comprehensive Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
        <Card className="group relative overflow-hidden bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-purple-500/10 dark:from-violet-400/20 dark:to-purple-400/20"></div>
          <div className="absolute top-3 right-3 p-2 rounded-full bg-violet-500/10 group-hover:bg-violet-500/20 transition-colors">
            <Percent className="w-4 h-4 text-violet-600 dark:text-violet-400" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
              Total Tax Rates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {stats.totalTaxRates}
            </div>
            <div className="flex items-center gap-1">
              <Activity className="w-3 h-3 text-violet-500" />
              <p className="text-xs text-slate-600 dark:text-slate-400">Tax configurations</p>
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-500/10 to-slate-500/10 dark:from-gray-400/20 dark:to-slate-400/20"></div>
          <div className="absolute top-3 right-3 p-2 rounded-full bg-gray-500/10 group-hover:bg-gray-500/20 transition-colors">
            <Scale className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
              Tax Free
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {stats.taxFreeCount}
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-gray-500"></div>
              <p className="text-xs text-slate-600 dark:text-slate-400">0% rates</p>
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 dark:from-green-400/20 dark:to-emerald-400/20"></div>
          <div className="absolute top-3 right-3 p-2 rounded-full bg-green-500/10 group-hover:bg-green-500/20 transition-colors">
            <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
              Low Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {stats.lowRateCount}
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <p className="text-xs text-slate-600 dark:text-slate-400">≤5% rates</p>
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 dark:from-blue-400/20 dark:to-cyan-400/20"></div>
          <div className="absolute top-3 right-3 p-2 rounded-full bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
            <Calculator className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
              Standard Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {stats.standardRateCount}
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <p className="text-xs text-slate-600 dark:text-slate-400">5-15% rates</p>
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-rose-500/10 dark:from-red-400/20 dark:to-rose-400/20"></div>
          <div className="absolute top-3 right-3 p-2 rounded-full bg-red-500/10 group-hover:bg-red-500/20 transition-colors">
            <TrendingUp className="w-4 h-4 text-red-600 dark:text-red-400" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
              High Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {stats.highRateCount}
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <p className="text-xs text-slate-600 dark:text-slate-400">&gt;15% rates</p>
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 dark:from-emerald-400/20 dark:to-teal-400/20"></div>
          <div className="absolute top-3 right-3 p-2 rounded-full bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors">
            <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
              Active Rates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {stats.activeCount}
            </div>
            <div className="flex items-center gap-1">
              <Activity className="w-3 h-3 text-emerald-500" />
              <p className="text-xs text-slate-600 dark:text-slate-400">Available for use</p>
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-orange-500/10 dark:from-amber-400/20 dark:to-orange-400/20"></div>
          <div className="absolute top-3 right-3 p-2 rounded-full bg-amber-500/10 group-hover:bg-amber-500/20 transition-colors">
            <DollarSign className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
              Avg Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-slate-900 dark:text-white mb-1">
              {stats.averageRate.toFixed(2)}%
            </div>
            <div className="flex items-center gap-1">
              <Calculator className="w-3 h-3 text-amber-500" />
              <p className="text-xs text-slate-600 dark:text-slate-400">Average rate</p>
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 dark:from-purple-400/20 dark:to-pink-400/20"></div>
          <div className="absolute top-3 right-3 p-2 rounded-full bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors">
            <Star className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
              Default Rates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {stats.defaultCount}
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-purple-500" />
              <p className="text-xs text-slate-600 dark:text-slate-400">System defaults</p>
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
                <Percent className="w-5 h-5" />
                Tax Rate Management
              </CardTitle>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Showing {filteredData.length} of {stats.totalTaxRates} tax rates • Avg {stats.averageRate.toFixed(2)}%
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
              <Button size="sm" className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg">
                <Plus className="w-4 h-4 mr-2" />
                Add Tax Rate
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Search */}
            <div className="sm:col-span-2">
              <Input
                placeholder="Search tax rates by name or rate value..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Rate Category Filter */}
            <Select value={rateFilter} onValueChange={setRateFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Rate category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Rate Categories</SelectItem>
                <SelectItem value="tax-free">Tax Free (0%)</SelectItem>
                <SelectItem value="low">Low Rate (≤5%)</SelectItem>
                <SelectItem value="standard">Standard (5-15%)</SelectItem>
                <SelectItem value="high">High Rate (&gt;15%)</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active Only</SelectItem>
                <SelectItem value="inactive">Inactive Only</SelectItem>
                <SelectItem value="default">Default Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Active Filters Display */}
          {(rateFilter !== "all" || statusFilter !== "all" || searchTerm) && (
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-sm text-slate-600 dark:text-slate-400">Active filters:</span>
              {rateFilter !== "all" && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Filter className="w-3 h-3" />
                  {rateFilter.replace("-", " ")}
                  <button
                    onClick={() => setRateFilter("all")}
                    className="ml-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {statusFilter !== "all" && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Target className="w-3 h-3" />
                  {statusFilter}
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
                  setRateFilter("all");
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
            columns={enhancedTaxRateColumns}
            data={filteredData}
            searchPlaceholder="Search tax rate configurations..."
          />
        </CardContent>
      </Card>
    </div>
  );
}
