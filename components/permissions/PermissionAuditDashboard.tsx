"use client";

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/lib/auth-unified';
import { usePermissions } from '@/lib/enterprise-permissions/hooks';
import { SYSTEM_PERMISSIONS } from '@/lib/enterprise-permissions/permissions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
  Activity,
  Shield,
  AlertTriangle,
  Search,
  Settings,
  Eye,
  Key,
  Clock,
  Globe,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Filter,
  Download,
  RefreshCw,
  Calendar,
  User,
  Users,
  Server,
  Database,
  Lock,
  Unlock,
  Warning,
  Info,
  Ban,
  Zap,
  Target,
  Layers,
  Award,
  Star,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  Mail,
  Phone,
  MapPin,
  Monitor,
  Smartphone,
  Tablet,
} from 'lucide-react';

interface AuditLog {
  id: string;
  timestamp: Date;
  userId?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
  action: string;
  resource: string;
  resourceId?: string;
  permission?: string;
  ipAddress: string;
  userAgent: string;
  status: 'success' | 'failed' | 'denied' | 'warning';
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  details?: any;
  sessionId?: string;
  organizationId: string;
  duration?: number;
  changes?: {
    before?: any;
    after?: any;
  };
}

interface SecurityAlert {
  id: string;
  type: 'FAILED_LOGIN' | 'PRIVILEGE_ESCALATION' | 'SUSPICIOUS_ACTIVITY' | 'UNAUTHORIZED_ACCESS' | 'DATA_BREACH';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  description: string;
  timestamp: Date;
  userId?: string;
  user?: {
    name: string;
    email: string;
  };
  ipAddress: string;
  location?: string;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: Date;
  actions: string[];
}

interface AuditStats {
  totalEvents: number;
  successfulActions: number;
  failedActions: number;
  deniedActions: number;
  uniqueUsers: number;
  riskEvents: number;
  avgResponseTime: number;
  topActions: Array<{ action: string; count: number }>;
  hourlyActivity: Array<{ hour: number; count: number }>;
}

const PermissionAuditDashboard = () => {
  const { session, hasPermission, user } = useAuth();
  const { hasPermission: hasEnterprisePermission, isLoading: permissionsLoading } = usePermissions();

  // State
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([]);
  const [auditStats, setAuditStats] = useState<AuditStats | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedRiskLevel, setSelectedRiskLevel] = useState<string>('all');
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('24h');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [isLogDetailOpen, setIsLogDetailOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Mock data - in real implementation, this would come from your API
  useEffect(() => {
    const mockAuditLogs: AuditLog[] = [
      {
        id: '1',
        timestamp: new Date(Date.now() - 10 * 60 * 1000),
        userId: 'user1',
        user: {
          id: 'user1',
          name: 'John Smith',
          email: 'john.smith@company.com',
          image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        },
        action: 'LOGIN',
        resource: 'AUTH_SYSTEM',
        status: 'success',
        riskLevel: 'LOW',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        sessionId: 'sess_123',
        organizationId: user?.organizationId || '',
        duration: 1250,
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 25 * 60 * 1000),
        userId: 'user2',
        user: {
          id: 'user2',
          name: 'Sarah Johnson',
          email: 'sarah.johnson@company.com',
        },
        action: 'PERMISSION_GRANTED',
        resource: 'USER_MANAGEMENT',
        resourceId: 'user3',
        permission: 'CREATE_USERS',
        status: 'success',
        riskLevel: 'MEDIUM',
        ipAddress: '192.168.1.105',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        organizationId: user?.organizationId || '',
        duration: 850,
        changes: {
          before: { permissions: ['READ_USERS'] },
          after: { permissions: ['READ_USERS', 'CREATE_USERS'] },
        },
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 45 * 60 * 1000),
        action: 'FAILED_LOGIN',
        resource: 'AUTH_SYSTEM',
        status: 'failed',
        riskLevel: 'HIGH',
        ipAddress: '203.0.113.45',
        userAgent: 'curl/7.68.0',
        organizationId: user?.organizationId || '',
        details: {
          attempts: 5,
          reason: 'Invalid credentials',
          email: 'admin@company.com',
        },
      },
      {
        id: '4',
        timestamp: new Date(Date.now() - 60 * 60 * 1000),
        userId: 'user1',
        user: {
          id: 'user1',
          name: 'John Smith',
          email: 'john.smith@company.com',
        },
        action: 'ACCESS_DENIED',
        resource: 'FINANCIAL_REPORTS',
        permission: 'VIEW_FINANCIAL_REPORTS',
        status: 'denied',
        riskLevel: 'MEDIUM',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        organizationId: user?.organizationId || '',
      },
      {
        id: '5',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        userId: 'user3',
        user: {
          id: 'user3',
          name: 'Mike Davis',
          email: 'mike.davis@company.com',
        },
        action: 'ROLE_ASSIGNED',
        resource: 'ROLE_MANAGEMENT',
        resourceId: 'admin_role',
        status: 'success',
        riskLevel: 'HIGH',
        ipAddress: '192.168.1.110',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        organizationId: user?.organizationId || '',
        duration: 2100,
        changes: {
          before: { roles: ['employee'] },
          after: { roles: ['employee', 'administrator'] },
        },
      },
    ];

    const mockSecurityAlerts: SecurityAlert[] = [
      {
        id: '1',
        type: 'FAILED_LOGIN',
        severity: 'HIGH',
        title: 'Multiple Failed Login Attempts',
        description: 'Detected 5 consecutive failed login attempts from IP 203.0.113.45',
        timestamp: new Date(Date.now() - 45 * 60 * 1000),
        ipAddress: '203.0.113.45',
        location: 'Unknown Location',
        resolved: false,
        actions: ['Block IP', 'Investigate', 'Notify Admin'],
      },
      {
        id: '2',
        type: 'PRIVILEGE_ESCALATION',
        severity: 'CRITICAL',
        title: 'Unusual Privilege Escalation',
        description: 'User attempted to access high-privilege functions outside normal hours',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
        userId: 'user3',
        user: {
          name: 'Mike Davis',
          email: 'mike.davis@company.com',
        },
        ipAddress: '192.168.1.110',
        location: 'Office Network',
        resolved: true,
        resolvedBy: 'Security Team',
        resolvedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        actions: ['Review Access', 'Contact User', 'Monitor Activity'],
      },
    ];

    const mockStats: AuditStats = {
      totalEvents: 1247,
      successfulActions: 1098,
      failedActions: 89,
      deniedActions: 60,
      uniqueUsers: 156,
      riskEvents: 23,
      avgResponseTime: 1250,
      topActions: [
        { action: 'LOGIN', count: 450 },
        { action: 'READ_DATA', count: 320 },
        { action: 'UPDATE_RECORD', count: 180 },
        { action: 'CREATE_RECORD', count: 120 },
        { action: 'DELETE_RECORD', count: 85 },
      ],
      hourlyActivity: Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        count: Math.floor(Math.random() * 100) + 10,
      })),
    };

    setAuditLogs(mockAuditLogs);
    setSecurityAlerts(mockSecurityAlerts);
    setAuditStats(mockStats);
  }, [user?.organizationId]);

  // Filter logs based on search and filters
  useEffect(() => {
    let filtered = auditLogs;

    if (searchTerm) {
      filtered = filtered.filter(log =>
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.user?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.ipAddress.includes(searchTerm)
      );
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(log => log.status === selectedStatus);
    }

    if (selectedRiskLevel !== 'all') {
      filtered = filtered.filter(log => log.riskLevel === selectedRiskLevel);
    }

    // Apply time range filter
    const now = new Date();
    const timeRanges = {
      '1h': 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
    };

    if (selectedTimeRange !== 'all') {
      const range = timeRanges[selectedTimeRange as keyof typeof timeRanges];
      if (range) {
        const cutoff = new Date(now.getTime() - range);
        filtered = filtered.filter(log => log.timestamp >= cutoff);
      }
    }

    setFilteredLogs(filtered);
  }, [auditLogs, searchTerm, selectedStatus, selectedRiskLevel, selectedTimeRange]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleViewDetails = (log: AuditLog) => {
    setSelectedLog(log);
    setIsLogDetailOpen(true);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      success: 'text-green-600 bg-green-50 border-green-200',
      failed: 'text-red-600 bg-red-50 border-red-200',
      denied: 'text-orange-600 bg-orange-50 border-orange-200',
      warning: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    };
    return colors[status as keyof typeof colors] || 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getRiskColor = (riskLevel: string) => {
    const colors = {
      LOW: 'text-green-600',
      MEDIUM: 'text-yellow-600',
      HIGH: 'text-orange-600',
      CRITICAL: 'text-red-600',
    };
    return colors[riskLevel as keyof typeof colors] || 'text-gray-600';
  };

  const getSeverityColor = (severity: string) => {
    const colors = {
      LOW: 'from-green-500 to-green-600',
      MEDIUM: 'from-yellow-500 to-yellow-600',
      HIGH: 'from-orange-500 to-orange-600',
      CRITICAL: 'from-red-500 to-red-600',
    };
    return colors[severity as keyof typeof colors] || 'from-gray-500 to-gray-600';
  };

  const getActionIcon = (action: string) => {
    const icons = {
      LOGIN: User,
      LOGOUT: User,
      PERMISSION_GRANTED: Key,
      PERMISSION_REVOKED: Lock,
      ROLE_ASSIGNED: Award,
      ROLE_REMOVED: Layers,
      ACCESS_DENIED: Ban,
      FAILED_LOGIN: XCircle,
      CREATE_RECORD: Plus,
      UPDATE_RECORD: Edit,
      DELETE_RECORD: Trash2,
      READ_DATA: Eye,
    };
    return icons[action as keyof typeof icons] || Activity;
  };

  if (permissionsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl animate-pulse">
            <Activity className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Loading Audit Dashboard...</h2>
          <p className="text-gray-600">Please wait while we load audit data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-white/80 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-6">
        <div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg">
              <Activity className="h-8 w-8" />
            </div>
            Permission Audit & Monitoring
          </h1>
          <p className="text-muted-foreground text-lg mt-1">Real-time security monitoring and compliance tracking</p>
          <div className="flex items-center gap-4 mt-3">
            <Badge variant="outline" className="flex items-center gap-2 px-3 py-1">
              <CheckCircle className="h-4 w-4 text-green-500" />
              {auditStats?.totalEvents || 0} Events Today
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-2 px-3 py-1">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              {securityAlerts.filter(a => !a.resolved).length} Active Alerts
            </Badge>
            <Badge variant="outline" className="px-3 py-1 font-medium">
              <Database className="h-4 w-4 mr-2" />
              {auditStats?.uniqueUsers || 0} Active Users
            </Badge>
          </div>
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

      {/* Security Alerts */}
      {securityAlerts.filter(a => !a.resolved).length > 0 && (
        <div className="grid gap-4">
          {securityAlerts.filter(a => !a.resolved).map((alert) => (
            <Alert key={alert.id} className={`border-2 ${alert.severity === 'CRITICAL' ? 'border-red-500 bg-red-50' : alert.severity === 'HIGH' ? 'border-orange-500 bg-orange-50' : 'border-yellow-500 bg-yellow-50'}`}>
              <AlertTriangle className={`h-5 w-5 ${alert.severity === 'CRITICAL' ? 'text-red-600' : alert.severity === 'HIGH' ? 'text-orange-600' : 'text-yellow-600'}`} />
              <AlertDescription className={`${alert.severity === 'CRITICAL' ? 'text-red-800' : alert.severity === 'HIGH' ? 'text-orange-800' : 'text-yellow-800'} font-medium`}>
                <div className="flex items-center justify-between">
                  <div>
                    <strong>{alert.title}</strong> - {alert.description}
                    <div className="text-xs mt-1 opacity-75">
                      {alert.timestamp.toLocaleString()} • IP: {alert.ipAddress}
                    </div>
                  </div>
                  <Badge className={`bg-gradient-to-r ${getSeverityColor(alert.severity)} text-white`}>
                    {alert.severity}
                  </Badge>
                </div>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Stats Dashboard */}
      {auditStats && (
        <div className="grid grid-cols-5 gap-6">
          <Card className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 border-0 shadow-xl text-white overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-500/20 backdrop-blur-3xl"></div>
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold mb-1">{auditStats.totalEvents}</div>
                  <div className="text-blue-100 font-medium">Total Events</div>
                </div>
                <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                  <Activity className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-600 border-0 shadow-xl text-white overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-teal-500/20 backdrop-blur-3xl"></div>
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold mb-1">{auditStats.successfulActions}</div>
                  <div className="text-green-100 font-medium">Successful</div>
                </div>
                <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                  <CheckCircle className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-red-500 via-rose-500 to-pink-600 border-0 shadow-xl text-white overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-red-400/20 to-pink-500/20 backdrop-blur-3xl"></div>
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold mb-1">{auditStats.failedActions}</div>
                  <div className="text-red-100 font-medium">Failed</div>
                </div>
                <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                  <XCircle className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-600 border-0 shadow-xl text-white overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 to-yellow-500/20 backdrop-blur-3xl"></div>
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold mb-1">{auditStats.riskEvents}</div>
                  <div className="text-orange-100 font-medium">Risk Events</div>
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
                  <div className="text-2xl font-bold mb-1">{auditStats.avgResponseTime}ms</div>
                  <div className="text-slate-100 font-medium">Avg Response</div>
                </div>
                <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                  <Zap className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm shadow-lg">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="events" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Audit Events
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Security Alerts
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Top Actions */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-violet-50 to-purple-50 border-b">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <Target className="h-5 w-5 text-violet-600" />
                  Top Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {auditStats?.topActions.map((action, index) => (
                    <div key={action.action} className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">{action.action}</span>
                          <span className="text-sm text-muted-foreground">{action.count}</span>
                        </div>
                        <Progress
                          value={(action.count / auditStats.totalEvents) * 100}
                          className="h-2"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Security Alerts */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50 border-b">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  Recent Security Alerts
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {securityAlerts.slice(0, 5).map((alert) => (
                    <div key={alert.id} className="p-3 rounded-xl border border-gray-200 bg-white/60 backdrop-blur-sm">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <div className={`w-2 h-2 rounded-full ${alert.severity === 'CRITICAL' ? 'bg-red-500' : alert.severity === 'HIGH' ? 'bg-orange-500' : 'bg-yellow-500'}`} />
                            <span className="font-medium text-sm">{alert.title}</span>
                            <Badge
                              variant={alert.resolved ? "secondary" : "destructive"}
                              className="text-xs"
                            >
                              {alert.resolved ? 'Resolved' : 'Active'}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{alert.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {alert.timestamp.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="events" className="space-y-6">
          {/* Filters */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
              <CardTitle className="flex items-center gap-3 text-xl">
                <Filter className="h-5 w-5 text-blue-600" />
                Filters & Search
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-5 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="search">Search Events</Label>
                  <div className="relative mt-2">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search by action, user, resource..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-white/80 backdrop-blur-sm border-gray-200 shadow-sm focus:shadow-md transition-all"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="status-filter">Status</Label>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="mt-2 bg-white/80 backdrop-blur-sm">
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="denied">Denied</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="risk-filter">Risk Level</Label>
                  <Select value={selectedRiskLevel} onValueChange={setSelectedRiskLevel}>
                    <SelectTrigger className="mt-2 bg-white/80 backdrop-blur-sm">
                      <SelectValue placeholder="All risks" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Risks</SelectItem>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="CRITICAL">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="time-filter">Time Range</Label>
                  <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
                    <SelectTrigger className="mt-2 bg-white/80 backdrop-blur-sm">
                      <SelectValue placeholder="Select range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1h">Last Hour</SelectItem>
                      <SelectItem value="24h">Last 24 Hours</SelectItem>
                      <SelectItem value="7d">Last 7 Days</SelectItem>
                      <SelectItem value="30d">Last 30 Days</SelectItem>
                      <SelectItem value="all">All Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Audit Events List */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <Activity className="h-5 w-5 text-indigo-600" />
                  Audit Events ({filteredLogs.length})
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {filteredLogs.map((log) => {
                    const ActionIcon = getActionIcon(log.action);
                    return (
                      <div
                        key={log.id}
                        className="p-4 rounded-xl border border-gray-200 bg-white/60 backdrop-blur-sm hover:shadow-md transition-all cursor-pointer"
                        onClick={() => handleViewDetails(log)}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`p-2 rounded-xl ${getStatusColor(log.status)}`}>
                            <ActionIcon className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <span className="font-semibold">{log.action}</span>
                                <Badge
                                  variant="outline"
                                  className={`text-xs ${getStatusColor(log.status)}`}
                                >
                                  {log.status}
                                </Badge>
                                <Badge
                                  variant="outline"
                                  className={`text-xs ${getRiskColor(log.riskLevel)}`}
                                >
                                  {log.riskLevel}
                                </Badge>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {log.timestamp.toLocaleString()}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                {log.user ? (
                                  <>
                                    <Avatar className="h-6 w-6">
                                      <AvatarImage src={log.user.image} alt={log.user.name} />
                                      <AvatarFallback className="text-xs">
                                        {log.user.name.split(' ').map(n => n[0]).join('')}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span>{log.user.name}</span>
                                  </>
                                ) : (
                                  <span>System/Anonymous</span>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <Globe className="h-4 w-4" />
                                <span>{log.ipAddress}</span>
                              </div>
                            </div>
                            <div className="mt-2 text-sm">
                              <span className="font-medium">Resource: </span>
                              <span>{log.resource}</span>
                              {log.resourceId && (
                                <>
                                  <span className="mx-2">•</span>
                                  <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                                    {log.resourceId}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <div className="grid gap-6">
            {securityAlerts.map((alert) => (
              <Card key={alert.id} className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader className={`bg-gradient-to-r ${getSeverityColor(alert.severity)} text-white border-b`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-6 w-6" />
                      <div>
                        <CardTitle className="text-xl text-white">{alert.title}</CardTitle>
                        <p className="text-white/80 text-sm mt-1">{alert.type.replace('_', ' ')}</p>
                      </div>
                    </div>
                    <Badge
                      variant={alert.resolved ? "secondary" : "destructive"}
                      className={alert.resolved ? "bg-white/20 text-white" : "bg-white/90 text-red-600"}
                    >
                      {alert.resolved ? 'Resolved' : 'Active'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <p className="text-gray-700">{alert.description}</p>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <Label className="font-semibold text-gray-700">Timestamp</Label>
                        <p className="text-muted-foreground">{alert.timestamp.toLocaleString()}</p>
                      </div>
                      <div>
                        <Label className="font-semibold text-gray-700">IP Address</Label>
                        <p className="text-muted-foreground font-mono">{alert.ipAddress}</p>
                      </div>
                      <div>
                        <Label className="font-semibold text-gray-700">Location</Label>
                        <p className="text-muted-foreground">{alert.location || 'Unknown'}</p>
                      </div>
                    </div>

                    {alert.user && (
                      <div>
                        <Label className="font-semibold text-gray-700">User</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <User className="h-4 w-4 text-gray-500" />
                          <span>{alert.user.name} ({alert.user.email})</span>
                        </div>
                      </div>
                    )}

                    {alert.resolved && (
                      <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center gap-2 mb-1">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="font-medium text-green-800">Resolved</span>
                        </div>
                        <p className="text-sm text-green-700">
                          Resolved by {alert.resolvedBy} at {alert.resolvedAt?.toLocaleString()}
                        </p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                      {!alert.resolved && (
                        <Button size="sm" className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                          Mark Resolved
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="text-center py-12">
            <BarChart3 className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Advanced Analytics</h3>
            <p className="text-gray-600">Detailed charts and metrics coming soon</p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Log Detail Dialog */}
      <Dialog open={isLogDetailOpen} onOpenChange={setIsLogDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-3">
              <Activity className="h-6 w-6 text-indigo-600" />
              Audit Event Details
            </DialogTitle>
            <DialogDescription>
              Detailed information about this audit event.
            </DialogDescription>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="font-semibold">Action</Label>
                    <p className="text-lg font-medium">{selectedLog.action}</p>
                  </div>
                  <div>
                    <Label className="font-semibold">Resource</Label>
                    <p>{selectedLog.resource}</p>
                  </div>
                  <div>
                    <Label className="font-semibold">Status</Label>
                    <Badge className={getStatusColor(selectedLog.status)}>
                      {selectedLog.status}
                    </Badge>
                  </div>
                  <div>
                    <Label className="font-semibold">Risk Level</Label>
                    <Badge className={getRiskColor(selectedLog.riskLevel)}>
                      {selectedLog.riskLevel}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="font-semibold">User</Label>
                    {selectedLog.user ? (
                      <div className="flex items-center gap-3 mt-1">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={selectedLog.user.image} alt={selectedLog.user.name} />
                          <AvatarFallback>
                            {selectedLog.user.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{selectedLog.user.name}</p>
                          <p className="text-sm text-muted-foreground">{selectedLog.user.email}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">System/Anonymous</p>
                    )}
                  </div>
                  <div>
                    <Label className="font-semibold">Timestamp</Label>
                    <p>{selectedLog.timestamp.toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="font-semibold">IP Address</Label>
                    <p className="font-mono">{selectedLog.ipAddress}</p>
                  </div>
                  <div>
                    <Label className="font-semibold">Duration</Label>
                    <p>{selectedLog.duration ? `${selectedLog.duration}ms` : 'N/A'}</p>
                  </div>
                </div>
              </div>

              {selectedLog.changes && (
                <div className="space-y-4 border-t pt-4">
                  <Label className="font-semibold">Changes</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                      <Label className="text-sm font-medium text-red-800">Before</Label>
                      <pre className="text-xs mt-2 text-red-700">
                        {JSON.stringify(selectedLog.changes.before, null, 2)}
                      </pre>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <Label className="text-sm font-medium text-green-800">After</Label>
                      <pre className="text-xs mt-2 text-green-700">
                        {JSON.stringify(selectedLog.changes.after, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              )}

              {selectedLog.details && (
                <div className="space-y-2 border-t pt-4">
                  <Label className="font-semibold">Additional Details</Label>
                  <pre className="text-xs bg-gray-50 p-3 rounded-lg border">
                    {JSON.stringify(selectedLog.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end border-t pt-4">
            <Button
              variant="outline"
              onClick={() => setIsLogDetailOpen(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PermissionAuditDashboard;