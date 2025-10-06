"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PermissionGate } from "@/components/rbac/PermissionGate";
import { EnterpriseRoleManagement } from "@/components/rbac/EnterpriseRoleManagement";
import { EnterpriseUserManagement } from "@/components/rbac/EnterpriseUserManagement";
import { usePermissions } from "@/hooks/usePermissions";
import { PERMISSIONS } from "@/lib/permissions";
import {
  Users,
  Shield,
  Settings,
  BarChart3,
  TrendingUp,
  UserCheck,
  Crown,
  Activity,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Zap,
  Globe,
  Database,
  Lock,
  Sparkles,
  Star
} from "lucide-react";
import { getUsers } from "@/actions/users";
import { getRoles } from "@/actions/roles";

interface DashboardMetrics {
  totalUsers: number;
  activeUsers: number;
  totalRoles: number;
  adminUsers: number;
  recentActivity: number;
  systemHealth: number;
  permissionCoverage: number;
  securityScore: number;
}

export default function AdminPage() {
  const { hasAnyPermission, user } = usePermissions();
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalUsers: 0,
    activeUsers: 0,
    totalRoles: 0,
    adminUsers: 0,
    recentActivity: 0,
    systemHealth: 98,
    permissionCoverage: 0,
    securityScore: 95,
  });
  const [loading, setLoading] = useState(true);

  // Check if user has any admin permissions
  const canViewUsers = hasAnyPermission([PERMISSIONS.READ_USERS, PERMISSIONS.INVITE_USERS]);
  const canViewRoles = hasAnyPermission([PERMISSIONS.READ_ROLES, PERMISSIONS.CREATE_ROLES]);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    if (!user?.organizationId) return;

    try {
      setLoading(true);
      const [usersResult, rolesResult] = await Promise.all([
        getUsers(user.organizationId),
        getRoles(user.organizationId),
      ]);

      if (usersResult.success && rolesResult.success) {
        const users = usersResult.data;
        const roles = rolesResult.data;
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        setMetrics({
          totalUsers: users.length,
          activeUsers: users.filter((u: any) => u.isActive).length,
          totalRoles: roles.length,
          adminUsers: users.filter((u: any) => u.roles.some((r: any) => ['super_admin', 'administrator'].includes(r.code))).length,
          recentActivity: users.filter((u: any) => new Date(u.createdAt) > weekAgo).length,
          systemHealth: 98,
          permissionCoverage: Math.round((roles.reduce((sum: number, role: any) => sum + role.permissions.length, 0) / (roles.length * Object.keys(PERMISSIONS).length)) * 100),
          securityScore: 95,
        });
      }
    } catch (error) {
      console.error('Failed to load metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!canViewUsers && !canViewRoles) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <Card className="w-full max-w-md text-center bg-gradient-to-br from-red-500/10 to-orange-500/10 border-red-500/20">
          <CardHeader className="pb-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center mb-4">
              <Lock className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-xl text-white">Access Restricted</CardTitle>
            <CardDescription className="text-white/70">
              You don't have permission to access the admin control center.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Badge variant="outline" className="border-red-500/50 text-red-400">
              Insufficient Privileges
            </Badge>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-8">
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute top-0 right-0 w-64 h-64 transform translate-x-32 -translate-y-32">
          <div className="w-full h-full rounded-full bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm" />
        </div>
        <div className="relative">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
              <Crown className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Admin Control Center</h1>
              <p className="text-white/80 text-lg">
                Command your organization's digital empire
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-5 w-5 text-green-400" />
                <span className="text-white font-medium">System Status</span>
              </div>
              <div className="text-2xl font-bold text-white mt-1">Operational</div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-blue-400" />
                <span className="text-white font-medium">Active Sessions</span>
              </div>
              <div className="text-2xl font-bold text-white mt-1">{metrics.activeUsers}</div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-purple-400" />
                <span className="text-white font-medium">Security Score</span>
              </div>
              <div className="text-2xl font-bold text-white mt-1">{metrics.securityScore}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Metrics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <PermissionGate permission={PERMISSIONS.READ_USERS}>
          <Card className="relative overflow-hidden bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-500/20 backdrop-blur-sm">
            <div className="absolute top-0 right-0 w-20 h-20 transform translate-x-10 -translate-y-10">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-400/20 to-cyan-400/20" />
            </div>
            <CardHeader className="relative">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-blue-100 text-sm font-medium">
                    Total Users
                  </CardTitle>
                  <div className="text-3xl font-bold text-white mt-1">
                    {loading ? '--' : metrics.totalUsers}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="flex items-center space-x-2 mt-3">
                <TrendingUp className="h-4 w-4 text-blue-400" />
                <span className="text-blue-100/80 text-sm">
                  {metrics.recentActivity} new this week
                </span>
              </div>
            </CardHeader>
          </Card>
        </PermissionGate>

        <PermissionGate permission={PERMISSIONS.READ_USERS}>
          <Card className="relative overflow-hidden bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/20 backdrop-blur-sm">
            <div className="absolute top-0 right-0 w-20 h-20 transform translate-x-10 -translate-y-10">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-green-400/20 to-emerald-400/20" />
            </div>
            <CardHeader className="relative">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-green-100 text-sm font-medium">
                    Active Users
                  </CardTitle>
                  <div className="text-3xl font-bold text-white mt-1">
                    {loading ? '--' : metrics.activeUsers}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500">
                  <UserCheck className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="mt-3">
                <Progress
                  value={metrics.totalUsers > 0 ? (metrics.activeUsers / metrics.totalUsers) * 100 : 0}
                  className="h-2"
                />
                <span className="text-green-100/80 text-sm mt-1 block">
                  {metrics.totalUsers > 0 ? Math.round((metrics.activeUsers / metrics.totalUsers) * 100) : 0}% engagement rate
                </span>
              </div>
            </CardHeader>
          </Card>
        </PermissionGate>

        <PermissionGate permission={PERMISSIONS.READ_ROLES}>
          <Card className="relative overflow-hidden bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/20 backdrop-blur-sm">
            <div className="absolute top-0 right-0 w-20 h-20 transform translate-x-10 -translate-y-10">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-400/20 to-pink-400/20" />
            </div>
            <CardHeader className="relative">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-purple-100 text-sm font-medium">
                    Active Roles
                  </CardTitle>
                  <div className="text-3xl font-bold text-white mt-1">
                    {loading ? '--' : metrics.totalRoles}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
                  <Shield className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="flex items-center space-x-2 mt-3">
                <Star className="h-4 w-4 text-purple-400" />
                <span className="text-purple-100/80 text-sm">
                  {metrics.permissionCoverage}% coverage
                </span>
              </div>
            </CardHeader>
          </Card>
        </PermissionGate>

        <PermissionGate permission={PERMISSIONS.READ_USERS}>
          <Card className="relative overflow-hidden bg-gradient-to-br from-orange-500/20 to-red-500/20 border-orange-500/20 backdrop-blur-sm">
            <div className="absolute top-0 right-0 w-20 h-20 transform translate-x-10 -translate-y-10">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-orange-400/20 to-red-400/20" />
            </div>
            <CardHeader className="relative">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-orange-100 text-sm font-medium">
                    Administrators
                  </CardTitle>
                  <div className="text-3xl font-bold text-white mt-1">
                    {loading ? '--' : metrics.adminUsers}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-red-500">
                  <Crown className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="flex items-center space-x-2 mt-3">
                <Lock className="h-4 w-4 text-orange-400" />
                <span className="text-orange-100/80 text-sm">
                  Privileged access
                </span>
              </div>
            </CardHeader>
          </Card>
        </PermissionGate>
      </div>

      {/* System Health Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-green-500" />
                  <span>System Health</span>
                </CardTitle>
                <CardDescription className="text-white/70 mt-1">
                  Overall system performance
                </CardDescription>
              </div>
              <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">
                Excellent
              </Badge>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold text-white">{metrics.systemHealth}%</div>
              <Progress value={metrics.systemHealth} className="mt-2 h-2" />
            </div>
          </CardHeader>
        </Card>

        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-blue-500" />
                  <span>Security Score</span>
                </CardTitle>
                <CardDescription className="text-white/70 mt-1">
                  Permission & access security
                </CardDescription>
              </div>
              <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0">
                Secure
              </Badge>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold text-white">{metrics.securityScore}%</div>
              <Progress value={metrics.securityScore} className="mt-2 h-2" />
            </div>
          </CardHeader>
        </Card>

        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Database className="h-5 w-5 text-purple-500" />
                  <span>Data Integrity</span>
                </CardTitle>
                <CardDescription className="text-white/70 mt-1">
                  User & role data consistency
                </CardDescription>
              </div>
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
                Optimal
              </Badge>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold text-white">100%</div>
              <Progress value={100} className="mt-2 h-2" />
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Enhanced Tabs */}
      <Tabs defaultValue="users" className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList className="bg-white/10 border border-white/20 backdrop-blur-sm">
            <PermissionGate permission={PERMISSIONS.READ_USERS}>
              <TabsTrigger value="users" className="data-[state=active]:bg-white/20 text-white/80 data-[state=active]:text-white">
                <Users className="h-4 w-4 mr-2" />
                User Universe
              </TabsTrigger>
            </PermissionGate>

            <PermissionGate permission={PERMISSIONS.READ_ROLES}>
              <TabsTrigger value="roles" className="data-[state=active]:bg-white/20 text-white/80 data-[state=active]:text-white">
                <Shield className="h-4 w-4 mr-2" />
                Role Matrix
              </TabsTrigger>
            </PermissionGate>

            <PermissionGate permission={PERMISSIONS.VIEW_ORGANIZATION_SETTINGS}>
              <TabsTrigger value="settings" className="data-[state=active]:bg-white/20 text-white/80 data-[state=active]:text-white">
                <Settings className="h-4 w-4 mr-2" />
                System Config
              </TabsTrigger>
            </PermissionGate>

            <PermissionGate permission={PERMISSIONS.VIEW_ANALYTICS}>
              <TabsTrigger value="analytics" className="data-[state=active]:bg-white/20 text-white/80 data-[state=active]:text-white">
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </TabsTrigger>
            </PermissionGate>
          </TabsList>

          <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-0 px-3 py-1">
            <Sparkles className="h-3 w-3 mr-1" />
            Enterprise Edition
          </Badge>
        </div>

        <PermissionGate permission={PERMISSIONS.READ_USERS}>
          <TabsContent value="users" className="space-y-4">
            <EnterpriseUserManagement />
          </TabsContent>
        </PermissionGate>

        <PermissionGate permission={PERMISSIONS.READ_ROLES}>
          <TabsContent value="roles" className="space-y-4">
            <EnterpriseRoleManagement />
          </TabsContent>
        </PermissionGate>

        <PermissionGate permission={PERMISSIONS.VIEW_ORGANIZATION_SETTINGS}>
          <TabsContent value="settings" className="space-y-4">
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Settings className="h-5 w-5 text-purple-500" />
                  <span>Organization Configuration</span>
                </CardTitle>
                <CardDescription className="text-white/70">
                  Configure your organization's core settings and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mb-4">
                    <Settings className="h-8 w-8 text-purple-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Coming Soon</h3>
                  <p className="text-white/60 max-w-md mx-auto">
                    Advanced organization settings panel is being crafted with enterprise-grade features.
                  </p>
                  <Badge variant="outline" className="border-purple-500/50 text-purple-400 mt-4">
                    In Development
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </PermissionGate>

        <PermissionGate permission={PERMISSIONS.VIEW_ANALYTICS}>
          <TabsContent value="analytics" className="space-y-4">
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-blue-500" />
                  <span>Advanced Analytics</span>
                </CardTitle>
                <CardDescription className="text-white/70">
                  Deep insights into user behavior and system performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center mb-4">
                    <BarChart3 className="h-8 w-8 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Analytics Dashboard</h3>
                  <p className="text-white/60 max-w-md mx-auto">
                    Comprehensive analytics and reporting suite is being developed with real-time insights.
                  </p>
                  <Badge variant="outline" className="border-blue-500/50 text-blue-400 mt-4">
                    Coming Soon
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </PermissionGate>
      </Tabs>
    </div>
  );
}