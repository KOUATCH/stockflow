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
import { enhancedUsersColumns, EnhancedUser } from "@/_legacy-dashboard/dashboard/settings/users/enhanced-columns";
import {
  Activity,
  Crown,
  Download,
  Filter,
  KeyRound,
  Mail,
  Plus,
  RefreshCw,
  Settings,
  Shield,
  Target,
  TrendingUp,
  User,
  UserCheck,
  UserPlus,
  UserX,
  Users
} from "lucide-react";
import { useState, useMemo } from "react";

interface EnhancedUsersManagementProps {
  data: EnhancedUser[];
  organizationId: string;
}

export default function EnhancedUsersManagement({
  data,
  organizationId
}: EnhancedUsersManagementProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Calculate comprehensive statistics
  const stats = useMemo(() => {
    const totalUsers = data.length;

    // Status categories
    const activeUsers = data.filter(user => user.isActive !== false);
    const inactiveUsers = data.filter(user => user.isActive === false);
    const verifiedUsers = data.filter(user => user.emailVerified);
    const pendingUsers = data.filter(user => !user.emailVerified);

    // Role categories
    const adminUsers = data.filter(user => user.isAdmin || user.role?.toLowerCase() === 'admin');
    const managerUsers = data.filter(user => user.role?.toLowerCase() === 'manager');
    const staffUsers = data.filter(user => user.role?.toLowerCase() === 'staff' || user.role?.toLowerCase() === 'cashier');

    // Activity metrics
    const recentlyActiveUsers = data.filter(user => {
      if (!user.lastLoginAt) return false;
      const daysSinceLogin = Math.abs(new Date().getTime() - new Date(user.lastLoginAt).getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceLogin <= 7;
    });

    const highActivityUsers = data.filter(user => {
      const totalActivity = (user._count?.salesOrders || 0) + (user._count?.purchaseOrders || 0);
      return totalActivity > 50;
    });

    // Recent users (last 30 days)
    const recentUsers = data.filter(user => {
      const daysSinceCreated = Math.abs(new Date().getTime() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceCreated <= 30;
    });

    // Total activity
    const totalActivity = data.reduce((sum, user) =>
      sum + (user._count?.salesOrders || 0) + (user._count?.purchaseOrders || 0), 0
    );

    const averageActivityPerUser = Math.floor(totalActivity / totalUsers) || 0;

    // Users who never logged in
    const neverLoggedIn = data.filter(user => !user.lastLoginAt).length;

    return {
      totalUsers,
      activeUsers: activeUsers.length,
      inactiveUsers: inactiveUsers.length,
      verifiedUsers: verifiedUsers.length,
      pendingUsers: pendingUsers.length,
      adminUsers: adminUsers.length,
      managerUsers: managerUsers.length,
      staffUsers: staffUsers.length,
      recentlyActiveUsers: recentlyActiveUsers.length,
      highActivityUsers: highActivityUsers.length,
      recentUsers: recentUsers.length,
      totalActivity,
      averageActivityPerUser,
      neverLoggedIn,
    };
  }, [data]);

  // Get unique roles for filter
  const roles = useMemo(() => {
    const uniqueRoles = Array.from(
      new Set(data.map(user => user.role).filter(Boolean))
    );
    return uniqueRoles.sort();
  }, [data]);

  // Filter data based on selected filters
  const filteredData = useMemo(() => {
    return data.filter(user => {
      // Status filter
      let statusMatch = true;
      if (statusFilter === "active") {
        statusMatch = user.isActive !== false;
      } else if (statusFilter === "inactive") {
        statusMatch = user.isActive === false;
      } else if (statusFilter === "verified") {
        statusMatch = !!user.emailVerified;
      } else if (statusFilter === "pending") {
        statusMatch = !user.emailVerified;
      } else if (statusFilter === "admin") {
        statusMatch = user.isAdmin === true || user.role?.toLowerCase() === 'admin';
      } else if (statusFilter === "recent-activity") {
        if (!user.lastLoginAt) return false;
        const daysSinceLogin = Math.abs(new Date().getTime() - new Date(user.lastLoginAt).getTime()) / (1000 * 60 * 60 * 24);
        statusMatch = daysSinceLogin <= 7;
      } else if (statusFilter === "never-logged-in") {
        statusMatch = !user.lastLoginAt;
      }

      // Role filter
      const roleMatch = roleFilter === "all" || user.role === roleFilter;

      // Search filter
      const searchMatch = searchTerm === "" ||
                         user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.role?.toLowerCase().includes(searchTerm.toLowerCase());

      return statusMatch && roleMatch && searchMatch;
    });
  }, [data, statusFilter, roleFilter, searchTerm]);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  const handleBulkExport = () => {
    console.log("Exporting users data...");
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
            <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {stats.totalUsers}
            </div>
            <div className="flex items-center gap-1">
              <Activity className="w-3 h-3 text-blue-500" />
              <p className="text-xs text-slate-600 dark:text-slate-400">Team members</p>
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 dark:from-green-400/20 dark:to-emerald-400/20"></div>
          <div className="absolute top-3 right-3 p-2 rounded-full bg-green-500/10 group-hover:bg-green-500/20 transition-colors">
            <UserCheck className="w-4 h-4 text-green-600 dark:text-green-400" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
              Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {stats.activeUsers}
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {stats.inactiveUsers} inactive
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-amber-500/10 dark:from-yellow-400/20 dark:to-amber-400/20"></div>
          <div className="absolute top-3 right-3 p-2 rounded-full bg-yellow-500/10 group-hover:bg-yellow-500/20 transition-colors">
            <Crown className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
              Admins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {stats.adminUsers}
            </div>
            <div className="flex items-center gap-1">
              <Crown className="w-3 h-3 text-yellow-500" />
              <p className="text-xs text-slate-600 dark:text-slate-400">Admin users</p>
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 dark:from-purple-400/20 dark:to-pink-400/20"></div>
          <div className="absolute top-3 right-3 p-2 rounded-full bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors">
            <Mail className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
              Verified
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {stats.verifiedUsers}
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-purple-500"></div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {stats.pendingUsers} pending
              </p>
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
              Recently Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {stats.recentlyActiveUsers}
            </div>
            <div className="flex items-center gap-1">
              <Activity className="w-3 h-3 text-emerald-500" />
              <p className="text-xs text-slate-600 dark:text-slate-400">Last 7 days</p>
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 dark:from-indigo-400/20 dark:to-purple-400/20"></div>
          <div className="absolute top-3 right-3 p-2 rounded-full bg-indigo-500/10 group-hover:bg-indigo-500/20 transition-colors">
            <Shield className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
              Total Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-slate-900 dark:text-white mb-1">
              {formatNumber(stats.totalActivity)}
            </div>
            <div className="flex items-center gap-1">
              <Activity className="w-3 h-3 text-indigo-500" />
              <p className="text-xs text-slate-600 dark:text-slate-400">All actions</p>
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 dark:from-orange-400/20 dark:to-red-400/20"></div>
          <div className="absolute top-3 right-3 p-2 rounded-full bg-orange-500/10 group-hover:bg-orange-500/20 transition-colors">
            <UserPlus className="w-4 h-4 text-orange-600 dark:text-orange-400" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
              New Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {stats.recentUsers}
            </div>
            <div className="flex items-center gap-1">
              <UserPlus className="w-3 h-3 text-orange-500" />
              <p className="text-xs text-slate-600 dark:text-slate-400">Last 30 days</p>
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-pink-500/10 dark:from-red-400/20 dark:to-pink-400/20"></div>
          <div className="absolute top-3 right-3 p-2 rounded-full bg-red-500/10 group-hover:bg-red-500/20 transition-colors">
            <UserX className="w-4 h-4 text-red-600 dark:text-red-400" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
              Never Logged In
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {stats.neverLoggedIn}
            </div>
            <div className="flex items-center gap-1">
              <UserX className="w-3 h-3 text-red-500" />
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
                <Users className="w-5 h-5" />
                User Management
              </CardTitle>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Showing {filteredData.length} of {stats.totalUsers} users • {formatNumber(stats.totalActivity)} total activities
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
              <Button size="sm" className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg">
                <Plus className="w-4 h-4 mr-2" />
                Invite User
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Search */}
            <div className="sm:col-span-2">
              <Input
                placeholder="Search users by name, email, or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="active">Active Users</SelectItem>
                <SelectItem value="inactive">Inactive Users</SelectItem>
                <SelectItem value="verified">Verified Users</SelectItem>
                <SelectItem value="pending">Pending Verification</SelectItem>
                <SelectItem value="admin">Admin Users</SelectItem>
                <SelectItem value="recent-activity">Recently Active</SelectItem>
                <SelectItem value="never-logged-in">Never Logged In</SelectItem>
              </SelectContent>
            </Select>

            {/* Role Filter */}
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {roles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Active Filters Display */}
          {(statusFilter !== "all" || roleFilter !== "all" || searchTerm) && (
            <div className="flex flex-wrap items-center gap-2 mb-4">
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
              {roleFilter !== "all" && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Target className="w-3 h-3" />
                  {roleFilter}
                  <button
                    onClick={() => setRoleFilter("all")}
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
                  setRoleFilter("all");
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
            columns={enhancedUsersColumns}
            data={filteredData}
            searchPlaceholder="Search user management..."
          />
        </CardContent>
      </Card>
    </div>
  );
}
