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
import { enhancedRolesColumns, EnhancedRole } from "@/_legacy-dashboard/dashboard/settings/roles/enhanced-columns";
import {
  Activity,
  Archive,
  Shield,
  BarChart3,
  Download,
  Key,
  Filter,
  Users,
  Plus,
  RefreshCw,
  Settings,
  Star,
  TrendingUp,
  Crown,
  CheckCircle,
  XCircle,
  UserPlus,
  Lock,
  Zap,
  Clock
} from "lucide-react";
import { useState, useMemo } from "react";
import Link from "next/link";
import { EnhancedRole } from "@/types/roles";

interface EnhancedRolesManagementProps {
  data: EnhancedRole[];
  organizationId: string;
}

export default function EnhancedRolesManagement({
  data,
  organizationId
}: EnhancedRolesManagementProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Calculate statistics
  const stats = useMemo(() => {
    const totalRoles = data.length;
    const activeRoles = data.filter(role => role.isActive).length;
    const inactiveRoles = totalRoles - activeRoles;
    const systemRoles = data.filter(role => role.isSystemRole).length;
    const customRoles = totalRoles - systemRoles;

    // Calculate total permissions and users
    const totalPermissions = data.reduce((sum, role) =>
      sum + (role._count?.permissions || 0), 0
    );
    const totalUsers = data.reduce((sum, role) =>
      sum + (role._count?.users || 0), 0
    );
    const totalAssignments = data.reduce((sum, role) =>
      sum + (role._count?.assignments || 0), 0
    );

    // Calculate averages
    const averagePermissionsPerRole = Math.floor(totalPermissions / totalRoles) || 0;
    const averageUsersPerRole = Math.floor(totalUsers / totalRoles) || 0;

    // Calculate high-permission roles (>= 15 permissions)
    const highPermissionRoles = data.filter(role =>
      (role._count?.permissions || 0) >= 15
    ).length;

    // Calculate widely used roles (>= 5 users)
    const widelyUsedRoles = data.filter(role =>
      (role._count?.users || 0) >= 5
    ).length;

    // Calculate roles with no users assigned
    const unusedRoles = data.filter(role =>
      (role._count?.users || 0) === 0
    ).length;

    return {
      totalRoles,
      activeRoles,
      inactiveRoles,
      systemRoles,
      customRoles,
      totalPermissions,
      totalUsers,
      totalAssignments,
      averagePermissionsPerRole,
      averageUsersPerRole,
      highPermissionRoles,
      widelyUsedRoles,
      unusedRoles,
    };
  }, [data]);

  // Filter data based on selected filters
  const filteredData = useMemo(() => {
    return data.filter(role => {
      // Status filter
      let statusMatch = true;
      if (statusFilter === "active") {
        statusMatch = role.isActive;
      } else if (statusFilter === "inactive") {
        statusMatch = !role.isActive;
      } else if (statusFilter === "high-permissions") {
        statusMatch = (role._count?.permissions || 0) >= 15;
      } else if (statusFilter === "widely-used") {
        statusMatch = (role._count?.users || 0) >= 5;
      } else if (statusFilter === "unused") {
        statusMatch = (role._count?.users || 0) === 0;
      }

      // Type filter
      let typeMatch = true;
      if (typeFilter === "system") {
        typeMatch = role.isSystemRole;
      } else if (typeFilter === "custom") {
        typeMatch = !role.isSystemRole;
      }

      // Search filter
      const searchMatch = searchTerm === "" ||
                         role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         role.description?.toLowerCase().includes(searchTerm.toLowerCase());

      return statusMatch && typeMatch && searchMatch;
    });
  }, [data, statusFilter, typeFilter, searchTerm]);

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
      {/* Quick Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
        <Card className="group relative overflow-hidden bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-blue-500/10 dark:from-indigo-400/20 dark:to-blue-400/20"></div>
          <div className="absolute top-3 right-3 p-2 rounded-full bg-indigo-500/10 group-hover:bg-indigo-500/20 transition-colors">
            <Shield className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
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
              <Activity className="w-3 h-3 text-indigo-500" />
              <p className="text-xs text-slate-600 dark:text-slate-400">Role system</p>
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
              <Lock className="w-3 h-3 text-purple-500" />
              <p className="text-xs text-slate-600 dark:text-slate-400">Protected</p>
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 dark:from-blue-400/20 dark:to-cyan-400/20"></div>
          <div className="absolute top-3 right-3 p-2 rounded-full bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
            <Settings className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
              Custom Roles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {stats.customRoles}
            </div>
            <div className="flex items-center gap-1">
              <Settings className="w-3 h-3 text-blue-500" />
              <p className="text-xs text-slate-600 dark:text-slate-400">Configurable</p>
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
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {formatNumber(stats.totalPermissions)}
            </div>
            <div className="flex items-center gap-1">
              <Key className="w-3 h-3 text-yellow-500" />
              <p className="text-xs text-slate-600 dark:text-slate-400">Access rights</p>
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 dark:from-emerald-400/20 dark:to-teal-400/20"></div>
          <div className="absolute top-3 right-3 p-2 rounded-full bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors">
            <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
              Assigned Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {formatNumber(stats.totalUsers)}
            </div>
            <div className="flex items-center gap-1">
              <UserPlus className="w-3 h-3 text-emerald-500" />
              <p className="text-xs text-slate-600 dark:text-slate-400">Users total</p>
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 dark:from-orange-400/20 dark:to-red-400/20"></div>
          <div className="absolute top-3 right-3 p-2 rounded-full bg-orange-500/10 group-hover:bg-orange-500/20 transition-colors">
            <Zap className="w-4 h-4 text-orange-600 dark:text-orange-400" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
              High Permission
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {stats.highPermissionRoles}
            </div>
            <div className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-orange-500" />
              <p className="text-xs text-slate-600 dark:text-slate-400">≥15 permissions</p>
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 to-pink-500/10 dark:from-rose-400/20 dark:to-pink-400/20"></div>
          <div className="absolute top-3 right-3 p-2 rounded-full bg-rose-500/10 group-hover:bg-rose-500/20 transition-colors">
            <TrendingUp className="w-4 h-4 text-rose-600 dark:text-rose-400" />
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
              <TrendingUp className="w-3 h-3 text-rose-500" />
              <p className="text-xs text-slate-600 dark:text-slate-400">≥5 users</p>
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
                Role & Permission Management
              </CardTitle>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Showing {filteredData.length} of {stats.totalRoles} roles • {formatNumber(stats.totalPermissions)} total permissions • {formatNumber(stats.totalUsers)} users assigned
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
              <Link href="/dashboard/settings/roles/create">
                <Button size="sm" className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-lg">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Role
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
                placeholder="Search roles by name or description..."
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
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="active">Active Roles</SelectItem>
                <SelectItem value="inactive">Inactive Roles</SelectItem>
                <SelectItem value="high-permissions">High Permission Roles</SelectItem>
                <SelectItem value="widely-used">Widely Used Roles</SelectItem>
                <SelectItem value="unused">Unused Roles</SelectItem>
              </SelectContent>
            </Select>

            {/* Type Filter */}
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="system">System Roles</SelectItem>
                <SelectItem value="custom">Custom Roles</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Active Filters Display */}
          {(statusFilter !== "all" || typeFilter !== "all" || searchTerm) && (
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
              {typeFilter !== "all" && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Filter className="w-3 h-3" />
                  Type: {typeFilter}
                  <button
                    onClick={() => setTypeFilter("all")}
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
            columns={enhancedRolesColumns}
            data={filteredData}
            searchPlaceholder="Search role system..."
          />
        </CardContent>
      </Card>
    </div>
  );
}
