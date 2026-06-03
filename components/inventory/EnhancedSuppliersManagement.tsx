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
import { enhancedSuppliersColumns, EnhancedSupplier } from "@/_legacy-dashboard/dashboard/purchases/suppliers/enhanced-columns";
import {
  Activity,
  Archive,
  Building2,
  BarChart3,
  Download,
  DollarSign,
  Filter,
  Package,
  Plus,
  RefreshCw,
  Settings,
  Star,
  TrendingUp,
  Users,
  CheckCircle,
  XCircle,
  ShoppingCart,
  CreditCard,
  FileText,
  Clock
} from "lucide-react";
import { useState, useMemo } from "react";
import Link from "next/link";

interface EnhancedSuppliersManagementProps {
  data: EnhancedSupplier[];
  organizationId: string;
}

export default function EnhancedSuppliersManagement({
  data,
  organizationId
}: EnhancedSuppliersManagementProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Calculate statistics
  const stats = useMemo(() => {
    const totalSuppliers = data.length;
    const activeSuppliers = data.filter(supplier => supplier.isActive).length;
    const inactiveSuppliers = totalSuppliers - activeSuppliers;

    // Calculate total purchase orders and items
    const totalPurchaseOrders = data.reduce((sum, supplier) =>
      sum + (supplier._count?.purchaseOrders || 0), 0
    );
    const totalSupplierItems = data.reduce((sum, supplier) =>
      sum + (supplier._count?.supplierItems || 0), 0
    );
    const totalPayables = data.reduce((sum, supplier) =>
      sum + (supplier._count?.payables || 0), 0
    );

    // Calculate averages
    const averagePurchaseOrdersPerSupplier = Math.floor(totalPurchaseOrders / totalSuppliers) || 0;
    const averageItemsPerSupplier = Math.floor(totalSupplierItems / totalSuppliers) || 0;

    // Calculate payment terms statistics
    const suppliersWithTerms = data.filter(supplier => supplier.paymentTerms);
    const averagePaymentTerms = suppliersWithTerms.length > 0
      ? Math.floor(suppliersWithTerms.reduce((sum, supplier) => sum + (supplier.paymentTerms || 0), 0) / suppliersWithTerms.length)
      : 0;

    // Calculate credit limit statistics
    const totalCreditLimit = data.reduce((sum, supplier) =>
      sum + (supplier.creditLimit || 0), 0
    );

    // Calculate suppliers with good payment terms (<=30 days)
    const goodPaymentTermsSuppliers = data.filter(supplier =>
      supplier.paymentTerms && supplier.paymentTerms <= 30
    ).length;

    return {
      totalSuppliers,
      activeSuppliers,
      inactiveSuppliers,
      totalPurchaseOrders,
      totalSupplierItems,
      totalPayables,
      averagePurchaseOrdersPerSupplier,
      averageItemsPerSupplier,
      averagePaymentTerms,
      totalCreditLimit,
      goodPaymentTermsSuppliers,
    };
  }, [data]);

  // Filter data based on selected filters and enhance with image data
  const filteredData = useMemo(() => {
    // Sample supplier representative images for demonstration
    const sampleRepImages = [
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
      "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
      "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
      "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
      "https://images.unsplash.com/photo-1600486913747-55e5470d6f40?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
      "https://images.unsplash.com/photo-1556157382-97eda2d62296?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
    ];

    const sampleRepNames = [
      "John Mitchell", "Sarah Chen", "Michael Rodriguez", "Emma Thompson", "David Kim",
      "Lisa Anderson", "Carlos Santos", "Rachel Green", "Alex Johnson", "Maria Garcia"
    ];

    return data
      .filter(supplier => {
        // Status filter
        let statusMatch = true;
        if (statusFilter === "active") {
          statusMatch = supplier.isActive;
        } else if (statusFilter === "inactive") {
          statusMatch = !supplier.isActive;
        } else if (statusFilter === "high-orders") {
          statusMatch = (supplier._count?.purchaseOrders || 0) > 50;
        } else if (statusFilter === "many-items") {
          statusMatch = (supplier._count?.supplierItems || 0) > 10;
        } else if (statusFilter === "good-terms") {
          statusMatch = supplier.paymentTerms !== null && supplier.paymentTerms <= 30;
        }

        // Search filter
        const searchMatch = searchTerm === "" ||
                           supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           supplier.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           supplier.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           supplier.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           supplier.phone?.includes(searchTerm) ||
                           supplier.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           supplier.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           supplier.state?.toLowerCase().includes(searchTerm.toLowerCase());

        return statusMatch && searchMatch;
      })
      .map((supplier, index) => ({
        ...supplier,
        // Add representative image data
        repAvatar: Math.random() > 0.25 ? sampleRepImages[index % sampleRepImages.length] : undefined, // 75% chance of having representative image
        imageUrls: Math.random() > 0.5 ? [sampleRepImages[index % sampleRepImages.length]] : undefined,
        repName: Math.random() > 0.2 ? sampleRepNames[index % sampleRepNames.length] : supplier.contactPerson, // 80% chance of having rep name
      }));
  }, [data, statusFilter, searchTerm]);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleBulkExport = () => {
    console.log("Exporting suppliers data...");
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
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-blue-500/10 dark:from-indigo-400/20 dark:to-blue-400/20"></div>
          <div className="absolute top-3 right-3 p-2 rounded-full bg-indigo-500/10 group-hover:bg-indigo-500/20 transition-colors">
            <Building2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
              Total Suppliers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {stats.totalSuppliers}
            </div>
            <div className="flex items-center gap-1">
              <Activity className="w-3 h-3 text-indigo-500" />
              <p className="text-xs text-slate-600 dark:text-slate-400">Supplier network</p>
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
              Active Suppliers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {stats.activeSuppliers}
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {stats.inactiveSuppliers} inactive
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 dark:from-blue-400/20 dark:to-cyan-400/20"></div>
          <div className="absolute top-3 right-3 p-2 rounded-full bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
            <ShoppingCart className="w-4 h-4 text-blue-600 dark:text-blue-400" />
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
              <ShoppingCart className="w-3 h-3 text-blue-500" />
              <p className="text-xs text-slate-600 dark:text-slate-400">Total orders</p>
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
              Items Supplied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {formatNumber(stats.totalSupplierItems)}
            </div>
            <div className="flex items-center gap-1">
              <Package className="w-3 h-3 text-purple-500" />
              <p className="text-xs text-slate-600 dark:text-slate-400">Total items</p>
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 dark:from-orange-400/20 dark:to-red-400/20"></div>
          <div className="absolute top-3 right-3 p-2 rounded-full bg-orange-500/10 group-hover:bg-orange-500/20 transition-colors">
            <FileText className="w-4 h-4 text-orange-600 dark:text-orange-400" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
              Payables
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {formatNumber(stats.totalPayables)}
            </div>
            <div className="flex items-center gap-1">
              <FileText className="w-3 h-3 text-orange-500" />
              <p className="text-xs text-slate-600 dark:text-slate-400">Outstanding</p>
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 dark:from-emerald-400/20 dark:to-teal-400/20"></div>
          <div className="absolute top-3 right-3 p-2 rounded-full bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors">
            <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
              Credit Limit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-1">
              {formatCurrency(stats.totalCreditLimit)}
            </div>
            <div className="flex items-center gap-1">
              <CreditCard className="w-3 h-3 text-emerald-500" />
              <p className="text-xs text-slate-600 dark:text-slate-400">Available</p>
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-amber-500/10 dark:from-yellow-400/20 dark:to-amber-400/20"></div>
          <div className="absolute top-3 right-3 p-2 rounded-full bg-yellow-500/10 group-hover:bg-yellow-500/20 transition-colors">
            <Clock className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
              Avg Payment Terms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {stats.averagePaymentTerms}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-yellow-500" />
              <p className="text-xs text-slate-600 dark:text-slate-400">Days average</p>
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 to-pink-500/10 dark:from-rose-400/20 dark:to-pink-400/20"></div>
          <div className="absolute top-3 right-3 p-2 rounded-full bg-rose-500/10 group-hover:bg-rose-500/20 transition-colors">
            <BarChart3 className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
              Good Terms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {stats.goodPaymentTermsSuppliers}
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-rose-500" />
              <p className="text-xs text-slate-600 dark:text-slate-400">≤30 days</p>
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
                <Building2 className="w-5 h-5" />
                Supplier Management
              </CardTitle>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Showing {filteredData.length} of {stats.totalSuppliers} suppliers • {formatNumber(stats.totalPurchaseOrders)} total orders
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
              <Link href="/dashboard/purchases/suppliers/create">
                <Button size="sm" className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-lg">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Supplier
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
                placeholder="Search suppliers by name, code, contact, email, phone, or location..."
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
                <SelectItem value="all">All Suppliers</SelectItem>
                <SelectItem value="active">Active Suppliers</SelectItem>
                <SelectItem value="inactive">Inactive Suppliers</SelectItem>
                <SelectItem value="high-orders">High Order Volume</SelectItem>
                <SelectItem value="many-items">Many Items Supplied</SelectItem>
                <SelectItem value="good-terms">Good Payment Terms</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Active Filters Display */}
          {(statusFilter !== "all" || searchTerm) && (
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span className="text-sm text-slate-600 dark:text-slate-400">Active filters:</span>
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
            columns={enhancedSuppliersColumns}
            data={filteredData}
            searchPlaceholder="Search supplier network..."
          />
        </CardContent>
      </Card>
    </div>
  );
}
