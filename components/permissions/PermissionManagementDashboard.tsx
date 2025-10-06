"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-unified';
import { usePermissions, useRoles, useUserPermissions } from '@/lib/enterprise-permissions/hooks';
import { SYSTEM_PERMISSIONS, PERMISSION_GROUPS } from '@/lib/enterprise-permissions/permissions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Shield,
  Users,
  Crown,
  Lock,
  Unlock,
  Search,
  Settings,
  Activity,
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff,
  Key,
  UserCheck,
  Clock,
  Globe,
  Zap,
  Star,
  Target,
  TrendingUp,
  BarChart3,
  Award,
  Layers,
  Hexagon,
  ChevronRight,
  ChevronDown,
  Plus,
  Edit,
  Trash2,
  Download,
  Upload,
  RefreshCw,
  Filter,
} from 'lucide-react';

interface PermissionStats {
  totalUsers: number;
  totalRoles: number;
  totalPermissions: number;
  recentActivities: number;
  riskAlerts: number;
  pendingApprovals: number;
}

interface RiskMetric {
  id: string;
  type: 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  count: number;
  trend: 'up' | 'down' | 'stable';
}

interface RecentActivity {
  id: string;
  user: string;
  action: string;
  resource: string;
  timestamp: Date;
  status: 'success' | 'failed' | 'pending';
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

const PermissionManagementDashboard = () => {
  const { session, hasPermission, user } = useAuth();
  const { hasPermission: hasEnterprisePermission, isLoading: permissionsLoading } = usePermissions();
  const { roles, isLoading: rolesLoading } = useRoles();
  const { permissions, isLoading: userPermissionsLoading } = useUserPermissions();

  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('overview');
  const [expandedSections, setExpandedSections] = useState(new Set(['overview', 'quick-actions']));
  const [currentTime, setCurrentTime] = useState(new Date());

  // Mock data - in real implementation, this would come from your API
  const [stats, setStats] = useState<PermissionStats>({
    totalUsers: 156,
    totalRoles: 12,
    totalPermissions: 85,
    recentActivities: 24,
    riskAlerts: 3,
    pendingApprovals: 5,
  });

  const [riskMetrics, setRiskMetrics] = useState<RiskMetric[]>([
    { id: '1', type: 'HIGH', description: 'Failed login attempts', count: 8, trend: 'up' },
    { id: '2', type: 'MEDIUM', description: 'Permission escalations', count: 3, trend: 'stable' },
    { id: '3', type: 'LOW', description: 'Resource access', count: 12, trend: 'down' },
  ]);

  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([
    {
      id: '1',
      user: 'John Smith',
      action: 'Permission granted',
      resource: 'Financial Reports',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      status: 'success',
      riskLevel: 'MEDIUM'
    },
    {
      id: '2',
      user: 'Sarah Johnson',
      action: 'Role assignment',
      resource: 'Administrator',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      status: 'pending',
      riskLevel: 'HIGH'
    },
    {
      id: '3',
      user: 'Mike Davis',
      action: 'Permission revoked',
      resource: 'User Management',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      status: 'success',
      riskLevel: 'LOW'
    },
  ]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  if (permissionsLoading || rolesLoading || userPermissionsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl animate-pulse">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Loading Permissions...</h2>
          <p className="text-gray-600">Please wait while we load your permission dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 space-y-6">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between bg-white/80 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-6">
        <div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg">
              <Shield className="h-8 w-8" />
            </div>
            Permission Management
          </h1>
          <p className="text-muted-foreground text-lg mt-1">Enterprise-grade access control and security</p>
          {user && (
            <div className="flex items-center gap-4 mt-3">
              <Badge variant="outline" className="flex items-center gap-2 px-3 py-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Current User: {user.name}
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-2 px-3 py-1">
                <Crown className="h-4 w-4" />
                {roles[0]?.code || 'User'}
              </Badge>
              <Badge variant="outline" className="px-3 py-1 font-medium">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                Active Session
              </Badge>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
          <div className="text-right bg-white/80 backdrop-blur-sm rounded-lg px-4 py-2 shadow-sm">
            <div className="text-lg font-semibold text-foreground">{currentTime.toLocaleTimeString()}</div>
            <div className="text-sm text-muted-foreground">{currentTime.toLocaleDateString()}</div>
          </div>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-6 gap-6">
        <Card className="bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-600 border-0 shadow-xl text-white overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-400/20 to-indigo-500/20 backdrop-blur-3xl"></div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold mb-1">{stats.totalUsers}</div>
                <div className="text-violet-100 font-medium">Total Users</div>
              </div>
              <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                <Users className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 border-0 shadow-xl text-white overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-cyan-500/20 backdrop-blur-3xl"></div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold mb-1">{stats.totalRoles}</div>
                <div className="text-emerald-100 font-medium">Active Roles</div>
              </div>
              <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                <Crown className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 border-0 shadow-xl text-white overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 to-red-500/20 backdrop-blur-3xl"></div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold mb-1">{stats.totalPermissions}</div>
                <div className="text-amber-100 font-medium">Permissions</div>
              </div>
              <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                <Key className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 border-0 shadow-xl text-white overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-500/20 backdrop-blur-3xl"></div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold mb-1">{stats.recentActivities}</div>
                <div className="text-blue-100 font-medium">Recent Activity</div>
              </div>
              <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                <Activity className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-rose-500 via-pink-500 to-red-600 border-0 shadow-xl text-white overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-rose-400/20 to-red-500/20 backdrop-blur-3xl"></div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold mb-1">{stats.riskAlerts}</div>
                <div className="text-rose-100 font-medium">Risk Alerts</div>
              </div>
              <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                <AlertTriangle className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-slate-500 via-gray-600 to-zinc-700 border-0 shadow-xl text-white overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-400/20 to-zinc-500/20 backdrop-blur-3xl"></div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold mb-1">{stats.pendingApprovals}</div>
                <div className="text-slate-100 font-medium">Pending</div>
              </div>
              <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                <Clock className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Alerts */}
      {stats.riskAlerts > 0 && (
        <Alert className="border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 shadow-md">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          <AlertDescription className="text-amber-800 font-medium">
            {stats.riskAlerts} security alerts require your attention. Review high-risk activities and approve pending requests.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick Actions */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-violet-50 to-purple-50 border-b">
              <CardTitle
                className="flex items-center gap-3 text-xl cursor-pointer"
                onClick={() => toggleSection('quick-actions')}
              >
                <Zap className="h-5 w-5 text-violet-600" />
                Quick Actions
                {expandedSections.has('quick-actions') ?
                  <ChevronDown className="h-4 w-4 ml-auto" /> :
                  <ChevronRight className="h-4 w-4 ml-auto" />
                }
              </CardTitle>
            </CardHeader>
            {expandedSections.has('quick-actions') && (
              <CardContent className="p-6">
                <div className="space-y-3">
                  <Button
                    className="w-full justify-start bg-gradient-to-r from-violet-500 to-purple-600 text-white hover:from-violet-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Role
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-white/80 backdrop-blur-sm hover:shadow-md transition-all"
                  >
                    <UserCheck className="mr-2 h-4 w-4" />
                    Assign Permissions
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-white/80 backdrop-blur-sm hover:shadow-md transition-all"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Audit Logs
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-white/80 backdrop-blur-sm hover:shadow-md transition-all"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Security Settings
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Risk Metrics */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50 border-b">
              <CardTitle className="flex items-center gap-3 text-xl">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Risk Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {riskMetrics.map((metric) => (
                  <div key={metric.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-200 bg-white/60 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        metric.type === 'HIGH' ? 'bg-red-500' :
                        metric.type === 'MEDIUM' ? 'bg-yellow-500' : 'bg-green-500'
                      }`} />
                      <div>
                        <div className="font-medium text-sm">{metric.description}</div>
                        <div className="text-xs text-muted-foreground">Count: {metric.count}</div>
                      </div>
                    </div>
                    <Badge
                      variant={metric.type === 'HIGH' ? 'destructive' : 'secondary'}
                      className="text-xs"
                    >
                      {metric.type}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activities */}
        <div className="lg:col-span-2">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <Activity className="h-5 w-5 text-blue-600" />
                  Recent Activities
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="bg-white shadow-sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm" className="bg-white shadow-sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search activities..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/80 backdrop-blur-sm border-gray-200 shadow-sm focus:shadow-md transition-all"
                  />
                </div>

                {/* Activities List */}
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {recentActivities.map((activity) => (
                      <div
                        key={activity.id}
                        className="p-4 rounded-xl border border-gray-200 bg-white/60 backdrop-blur-sm hover:shadow-md transition-all"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="font-semibold text-sm">{activity.user}</div>
                              <Badge
                                variant={activity.status === 'success' ? 'secondary' :
                                        activity.status === 'failed' ? 'destructive' : 'outline'}
                                className="text-xs"
                              >
                                {activity.status}
                              </Badge>
                              <Badge
                                variant={activity.riskLevel === 'HIGH' || activity.riskLevel === 'CRITICAL' ? 'destructive' :
                                        activity.riskLevel === 'MEDIUM' ? 'secondary' : 'outline'}
                                className="text-xs"
                              >
                                {activity.riskLevel}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {activity.action} • {activity.resource}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {activity.timestamp.toLocaleTimeString()} - {activity.timestamp.toLocaleDateString()}
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Permission Categories Overview */}
      <div className="grid grid-cols-4 gap-6">
        {Object.entries(PERMISSION_GROUPS).map(([groupKey, group]) => {
          const getGradient = (key: string) => {
            const gradients = {
              'SYSTEM_ADMIN': 'from-violet-500 to-purple-600',
              'ORG_MANAGEMENT': 'from-emerald-500 to-teal-600',
              'USER_MANAGEMENT': 'from-blue-500 to-indigo-600',
              'INVENTORY': 'from-amber-500 to-orange-600',
              'SALES': 'from-rose-500 to-pink-600',
              'FINANCIAL': 'from-green-500 to-emerald-600',
              'POS': 'from-indigo-500 to-purple-600',
              'SECURITY': 'from-red-500 to-rose-600',
            };
            return gradients[key as keyof typeof gradients] || 'from-gray-500 to-slate-600';
          };

          const getIcon = (key: string) => {
            const icons = {
              'SYSTEM_ADMIN': Shield,
              'ORG_MANAGEMENT': Globe,
              'USER_MANAGEMENT': Users,
              'INVENTORY': Hexagon,
              'SALES': TrendingUp,
              'FINANCIAL': BarChart3,
              'POS': Zap,
              'SECURITY': Lock,
            };
            const IconComponent = icons[key as keyof typeof icons] || Settings;
            return IconComponent;
          };

          const IconComponent = getIcon(groupKey);

          return (
            <Card key={groupKey} className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer group">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${getGradient(groupKey)} text-white shadow-lg group-hover:scale-110 transition-transform`}>
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-lg text-gray-900">{group.name}</div>
                    <div className="text-sm text-muted-foreground">{group.description}</div>
                    <Badge variant="secondary" className="mt-2">
                      {group.permissions.length} permissions
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default PermissionManagementDashboard;