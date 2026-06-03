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
import { enhancedRolesColumns } from "@/_legacy-dashboard/dashboard/settings/roles/enhanced-columns";
import { EnhancedRole } from "@/types/roles";
import {
  Activity,
  Crown,
  Download,
  Filter,
  Key,
  Plus,
  RefreshCw,
  Settings,
  Shield,
  Target,
  TrendingUp,
  Users,
  Zap,
  AlertTriangle,
  CheckCircle,
  XCircle
} from "lucide-react";
import { useState, useMemo } from "react";
import Link from "next/link";

interface EnhancedRolesManagementProps {
  data: EnhancedRole[];
  organizationId: string;
}

export default function EnhancedRolesManagement({
  data,
  organizationId
}: EnhancedRolesManagementProps) {
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Calculate comprehensive statistics
  const stats = useMemo(() => {
    const totalRoles = data.length;

    // Role type categories
    const systemRoles = data.filter(role => role.isSystemRole);
    const customRoles = data.filter(role => !role.isSystemRole);

    // Status categories
    const activeRoles = data.filter(role => role.isActive);
    const inactiveRoles = data.filter(role => !role.isActive);

    // Permission level analysis
    const highAccessRoles = data.filter(role => (role._count?.permissions || 0) >= 20);
    const mediumAccessRoles = data.filter(role => {
      const count = role._count?.permissions || 0;
      return count >= 10 && count < 20;
    });
    const lowAccessRoles = data.filter(role => {
      const count = role._count?.permissions || 0;
      return count < 10 && count > 0;
    });
    const noAccessRoles = data.filter(role => (role._count?.permissions || 0) === 0);

    // User assignment metrics
    const totalAssignedUsers = data.reduce((sum, role) => sum + (role._count?.users || 0), 0);
    const totalPermissions = data.reduce((sum, role) => sum + (role._count?.permissions || 0), 0);

    // Widely used roles (>10 users)
    const widelyUsedRoles = data.filter(role => (role._count?.users || 0) > 10);

    // Unused roles (0 users)
    const unusedRoles = data.filter(role => (role._count?.users || 0) === 0);

    // Recent roles (last 30 days)
    const recentRoles = data.filter(role => {
      const daysSinceCreated = Math.abs(new Date().getTime() - new Date(role.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceCreated <= 30;
    });

    const averagePermissionsPerRole = Math.floor(totalPermissions / totalRoles) || 0;
    const averageUsersPerRole = Math.floor(totalAssignedUsers / totalRoles) || 0;

    return {
      totalRoles,
      systemRoles: systemRoles.length,
      customRoles: customRoles.length,
      activeRoles: activeRoles.length,
      inactiveRoles: inactiveRoles.length,
      highAccessRoles: highAccessRoles.length,
      mediumAccessRoles: mediumAccessRoles.length,
      lowAccessRoles: lowAccessRoles.length,
      noAccessRoles: noAccessRoles.length,
      totalAssignedUsers,
      totalPermissions,
      widelyUsedRoles: widelyUsedRoles.length,
      unusedRoles: unusedRoles.length,
      recentRoles: recentRoles.length,
      averagePermissionsPerRole,
      averageUsersPerRole,
    };
  }, [data]);

  // Filter data based on selected filters
  const filteredData = useMemo(() => {
    return data.filter(role => {
      // Type filter
      let typeMatch = true;
      if (typeFilter === "system") {
        typeMatch = role.isSystemRole;
      } else if (typeFilter === "custom") {
        typeMatch = !role.isSystemRole;
      }

      // Status filter
      let statusMatch = true;
      if (statusFilter === "active") {
        statusMatch = role.isActive;
      } else if (statusFilter === "inactive") {
        statusMatch = !role.isActive;
      } else if (statusFilter === "high-access") {
        statusMatch = (role._count?.permissions || 0) >= 20;
      } else if (statusFilter === "medium-access") {
        const count = role._count?.permissions || 0;
        statusMatch = count >= 10 && count < 20;
      } else if (statusFilter === "low-access") {
        statusMatch = (role._count?.permissions || 0) < 10 && (role._count?.permissions || 0) > 0;
      } else if (statusFilter === "no-access") {
        statusMatch = (role._count?.permissions || 0) === 0;
      } else if (statusFilter === "widely-used") {
        statusMatch = (role._count?.users || 0) > 10;
      } else if (statusFilter === "unused") {
        statusMatch = (role._count?.users || 0) === 0;
      }

      // Search filter
      const searchMatch = searchTerm === "" ||
                         role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         role.description?.toLowerCase().includes(searchTerm.toLowerCase());

      return typeMatch && statusMatch && searchMatch;
    });
  }, [data, typeFilter, statusFilter, searchTerm]);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  const handleBulkExport = () => {
    console.log("Exporting roles data...");
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
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 dark:from-blue-400/20 dark:to-cyan-400/20"></div>
          <div className="absolute top-3 right-3 p-2 rounded-full bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
            <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
              Total Roles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {stats.totalRoles}
            </div>
            <div className="flex items-center gap-1">
              <Activity className="w-3 h-3 text-blue-500" />
              <p className="text-xs text-slate-600 dark:text-slate-400">Access roles</p>
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 dark:from-purple-400/20 dark:to-pink-400/20"></div>
          <div className="absolute top-3 right-3 p-2 rounded-full bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors">
            <Crown className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
              System Roles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {stats.systemRoles}
            </div>
            <div className="flex items-center gap-1">
              <Crown className="w-3 h-3 text-purple-500" />
              <p className="text-xs text-slate-600 dark:text-slate-400">Protected</p>
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
              Active Roles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {stats.activeRoles}
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {stats.inactiveRoles} inactive
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-orange-500/10 dark:from-red-400/20 dark:to-orange-400/20"></div>
          <div className="absolute top-3 right-3 p-2 rounded-full bg-red-500/10 group-hover:bg-red-500/20 transition-colors">
            <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
              High Access
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {stats.highAccessRoles}
            </div>
            <div className="flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-red-500" />
              <p className="text-xs text-slate-600 dark:text-slate-400">≥20 permissions</p>
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
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {stats.totalAssignedUsers}
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3 text-indigo-500" />
              <p className="text-xs text-slate-600 dark:text-slate-400">Assigned</p>
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-amber-500/10 dark:from-yellow-400/20 dark:to-amber-400/20"></div>
          <div className="absolute top-3 right-3 p-2 rounded-full bg-yellow-500/10 group-hover:bg-yellow-500/20 transition-colors">
            <Key className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
              Total Permissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-slate-900 dark:text-white mb-1">
              {formatNumber(stats.totalPermissions)}
            </div>
            <div className="flex items-center gap-1">
              <Key className="w-3 h-3 text-yellow-500" />
              <p className="text-xs text-slate-600 dark:text-slate-400">All permissions</p>
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 dark:from-orange-400/20 dark:to-red-400/20"></div>
          <div className="absolute top-3 right-3 p-2 rounded-full bg-orange-500/10 group-hover:bg-orange-500/20 transition-colors">
            <TrendingUp className="w-4 h-4 text-orange-600 dark:text-orange-400" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
              Widely Used
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {stats.widelyUsedRoles}
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-orange-500" />
              <p className="text-xs text-slate-600 dark:text-slate-400">&gt;10 users</p>
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-500/10 to-slate-500/10 dark:from-gray-400/20 dark:to-slate-400/20"></div>
          <div className="absolute top-3 right-3 p-2 rounded-full bg-gray-500/10 group-hover:bg-gray-500/20 transition-colors">
            <XCircle className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
              Unused Roles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {stats.unusedRoles}
            </div>
            <div className="flex items-center gap-1">
              <XCircle className="w-3 h-3 text-gray-500" />
              <p className="text-xs text-slate-600 dark:text-slate-400">Need review</p>
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
                <Shield className="w-5 h-5" />
                Role Management
              </CardTitle>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Showing {filteredData.length} of {stats.totalRoles} roles • {formatNumber(stats.totalPermissions)} total permissions
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
              <Link href="/dashboard/settings/roles/new">
                <Button size="sm" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Role
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Search */}
            <div className="sm:col-span-2">
              <Input
                placeholder="Search roles by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Type Filter */}
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="system">System Roles</SelectItem>
                <SelectItem value="custom">Custom Roles</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="active">Active Roles</SelectItem>
                <SelectItem value="inactive">Inactive Roles</SelectItem>
                <SelectItem value="high-access">High Access (≥20)</SelectItem>
                <SelectItem value="medium-access">Medium Access (10-19)</SelectItem>
                <SelectItem value="low-access">Low Access (1-9)</SelectItem>
                <SelectItem value="no-access">No Access (0)</SelectItem>
                <SelectItem value="widely-used">Widely Used (&gt;10)</SelectItem>
                <SelectItem value="unused">Unused (0 users)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Active Filters Display */}
          {(typeFilter !== "all" || statusFilter !== "all" || searchTerm) && (
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-sm text-slate-600 dark:text-slate-400">Active filters:</span>
              {typeFilter !== "all" && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Filter className="w-3 h-3" />
                  {typeFilter} roles
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
                  <Target className="w-3 h-3" />
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
                  setTypeFilter("all");
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
            columns={enhancedRolesColumns}
            data={filteredData}
            searchPlaceholder="Search role management..."
          />
        </CardContent>
      </Card>
    </div>
  );
}
