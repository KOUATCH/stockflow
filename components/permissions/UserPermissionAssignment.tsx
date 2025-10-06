"use client";

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/lib/auth-unified';
import { usePermissions, useUserPermissions } from '@/lib/enterprise-permissions/hooks';
import { SYSTEM_PERMISSIONS, PERMISSION_GROUPS } from '@/lib/enterprise-permissions/permissions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import {
  UserCheck,
  Users,
  Shield,
  Lock,
  Unlock,
  Search,
  Settings,
  Plus,
  Edit,
  Trash2,
  ChevronRight,
  ChevronDown,
  Eye,
  EyeOff,
  Key,
  Crown,
  Globe,
  Building2,
  Clock,
  AlertTriangle,
  CheckCircle,
  Star,
  Target,
  Layers,
  Award,
  Zap,
  Activity,
  Filter,
  Copy,
  Download,
  Upload,
  RefreshCw,
  Save,
  X,
  Mail,
  Phone,
  Calendar,
  User,
  History,
  Minus,
  Info,
  ExternalLink,
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  image?: string;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  organizationId: string;
  roles: UserRole[];
  directPermissions: UserPermission[];
  sessions: UserSession[];
}

interface UserRole {
  id: string;
  roleId: string;
  role: {
    id: string;
    code: string;
    name: string;
    hierarchyLevel: number;
    permissions: string[];
  };
  assignedAt: Date;
  assignedBy: string;
  expiresAt?: Date;
  isActive: boolean;
}

interface UserPermission {
  id: string;
  permissionCode: string;
  grantedAt: Date;
  grantedBy: string;
  expiresAt?: Date;
  isActive: boolean;
  conditions?: any;
  justification?: string;
}

interface UserSession {
  id: string;
  deviceInfo: string;
  ipAddress: string;
  lastActivity: Date;
  isActive: boolean;
}

interface PermissionAssignmentData {
  userId: string;
  permissions: string[];
  roles: string[];
  expiresAt?: Date;
  justification?: string;
  notifyUser: boolean;
}

const UserPermissionAssignment = () => {
  const { session, hasPermission, user } = useAuth();
  const { hasPermission: hasEnterprisePermission, isLoading: permissionsLoading } = usePermissions();
  const { permissions: userPermissions, isLoading: userPermissionsLoading } = useUserPermissions();

  // State
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isPermissionHistoryOpen, setIsPermissionHistoryOpen] = useState(false);
  const [expandedPermissionGroups, setExpandedPermissionGroups] = useState(new Set(['SYSTEM_ADMIN']));
  const [activeTab, setActiveTab] = useState('users');

  // Assignment form state
  const [assignmentData, setAssignmentData] = useState<PermissionAssignmentData>({
    userId: '',
    permissions: [],
    roles: [],
    notifyUser: true,
  });

  // Mock data - in real implementation, this would come from your API
  useEffect(() => {
    const mockUsers: User[] = [
      {
        id: '1',
        name: 'John Smith',
        email: 'john.smith@company.com',
        phone: '+1 (555) 123-4567',
        image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        isActive: true,
        lastLoginAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        createdAt: new Date('2024-01-15'),
        organizationId: user?.organizationId || '',
        roles: [
          {
            id: '1',
            roleId: 'admin',
            role: {
              id: 'admin',
              code: 'administrator',
              name: 'Administrator',
              hierarchyLevel: 2,
              permissions: ['MANAGE_ORGANIZATION', 'READ_USERS', 'CREATE_USERS'],
            },
            assignedAt: new Date('2024-01-15'),
            assignedBy: 'system',
            isActive: true,
          },
        ],
        directPermissions: [
          {
            id: '1',
            permissionCode: 'VIEW_FINANCIAL_REPORTS',
            grantedAt: new Date('2024-02-01'),
            grantedBy: 'super_admin',
            isActive: true,
            justification: 'Temporary access for Q1 financial review',
            expiresAt: new Date('2024-04-01'),
          },
        ],
        sessions: [
          {
            id: '1',
            deviceInfo: 'Chrome on Windows',
            ipAddress: '192.168.1.100',
            lastActivity: new Date(Date.now() - 10 * 60 * 1000),
            isActive: true,
          },
        ],
      },
      {
        id: '2',
        name: 'Sarah Johnson',
        email: 'sarah.johnson@company.com',
        phone: '+1 (555) 234-5678',
        image: 'https://images.unsplash.com/photo-1494790108755-2616b5b0db6e?w=150&h=150&fit=crop&crop=face',
        isActive: true,
        lastLoginAt: new Date(Date.now() - 30 * 60 * 1000),
        createdAt: new Date('2024-01-20'),
        organizationId: user?.organizationId || '',
        roles: [
          {
            id: '2',
            roleId: 'manager',
            role: {
              id: 'manager',
              code: 'inventory_manager',
              name: 'Inventory Manager',
              hierarchyLevel: 3,
              permissions: ['READ_ITEMS', 'CREATE_ITEMS', 'UPDATE_ITEMS'],
            },
            assignedAt: new Date('2024-01-20'),
            assignedBy: 'admin',
            isActive: true,
          },
        ],
        directPermissions: [],
        sessions: [
          {
            id: '2',
            deviceInfo: 'Safari on MacOS',
            ipAddress: '192.168.1.105',
            lastActivity: new Date(Date.now() - 5 * 60 * 1000),
            isActive: true,
          },
        ],
      },
      {
        id: '3',
        name: 'Mike Davis',
        email: 'mike.davis@company.com',
        isActive: false,
        lastLoginAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date('2024-01-10'),
        organizationId: user?.organizationId || '',
        roles: [
          {
            id: '3',
            roleId: 'cashier',
            role: {
              id: 'cashier',
              code: 'cashier',
              name: 'Cashier',
              hierarchyLevel: 6,
              permissions: ['OPERATE_POS', 'PROCESS_PAYMENTS'],
            },
            assignedAt: new Date('2024-01-10'),
            assignedBy: 'manager',
            isActive: false,
          },
        ],
        directPermissions: [],
        sessions: [],
      },
    ];
    setUsers(mockUsers);
  }, [user?.organizationId]);

  // Filter users based on search and role
  useEffect(() => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedRole !== 'all') {
      filtered = filtered.filter(user =>
        user.roles.some(userRole => userRole.role.code === selectedRole)
      );
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, selectedRole]);

  const handleAssignPermissions = (user: User) => {
    setSelectedUser(user);
    setAssignmentData({
      userId: user.id,
      permissions: user.directPermissions.filter(p => p.isActive).map(p => p.permissionCode),
      roles: user.roles.filter(r => r.isActive).map(r => r.roleId),
      notifyUser: true,
    });
    setIsAssignDialogOpen(true);
  };

  const handleViewHistory = (user: User) => {
    setSelectedUser(user);
    setIsPermissionHistoryOpen(true);
  };

  const handlePermissionToggle = (permissionCode: string) => {
    setAssignmentData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionCode)
        ? prev.permissions.filter(p => p !== permissionCode)
        : [...prev.permissions, permissionCode]
    }));
  };

  const handleRoleToggle = (roleCode: string) => {
    setAssignmentData(prev => ({
      ...prev,
      roles: prev.roles.includes(roleCode)
        ? prev.roles.filter(r => r !== roleCode)
        : [...prev.roles, roleCode]
    }));
  };

  const togglePermissionGroup = (groupKey: string) => {
    const newExpanded = new Set(expandedPermissionGroups);
    if (newExpanded.has(groupKey)) {
      newExpanded.delete(groupKey);
    } else {
      newExpanded.add(groupKey);
    }
    setExpandedPermissionGroups(newExpanded);
  };

  const getEffectivePermissions = (user: User): string[] => {
    const rolePermissions = user.roles
      .filter(r => r.isActive)
      .flatMap(r => r.role.permissions);

    const directPermissions = user.directPermissions
      .filter(p => p.isActive)
      .map(p => p.permissionCode);

    return [...new Set([...rolePermissions, ...directPermissions])];
  };

  const getUserStatusColor = (user: User) => {
    if (!user.isActive) return 'text-red-500';
    if (user.lastLoginAt && user.lastLoginAt > new Date(Date.now() - 24 * 60 * 60 * 1000)) {
      return 'text-green-500';
    }
    return 'text-yellow-500';
  };

  const getUserStatusText = (user: User) => {
    if (!user.isActive) return 'Inactive';
    if (user.lastLoginAt && user.lastLoginAt > new Date(Date.now() - 24 * 60 * 60 * 1000)) {
      return 'Active';
    }
    return 'Away';
  };

  if (permissionsLoading || userPermissionsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl animate-pulse">
            <UserCheck className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Loading User Permissions...</h2>
          <p className="text-gray-600">Please wait while we load user permission data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-white/80 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-6">
        <div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg">
              <UserCheck className="h-8 w-8" />
            </div>
            User Permission Assignment
          </h1>
          <p className="text-muted-foreground text-lg mt-1">Manage user roles and direct permission assignments</p>
          <div className="flex items-center gap-4 mt-3">
            <Badge variant="outline" className="flex items-center gap-2 px-3 py-1">
              <Users className="h-4 w-4" />
              {users.length} Total Users
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-2 px-3 py-1">
              <CheckCircle className="h-4 w-4 text-green-500" />
              {users.filter(u => u.isActive).length} Active
            </Badge>
            <Badge variant="outline" className="px-3 py-1 font-medium">
              <Activity className="h-4 w-4 mr-2" />
              {users.filter(u => u.sessions.some(s => s.isActive)).length} Online
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all"
          >
            <Upload className="h-4 w-4" />
            Import
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur-sm shadow-lg">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            User List
          </TabsTrigger>
          <TabsTrigger value="bulk" className="flex items-center gap-2">
            <Copy className="h-4 w-4" />
            Bulk Assignment
          </TabsTrigger>
          <TabsTrigger value="matrix" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Permission Matrix
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          {/* Filters */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
              <CardTitle className="flex items-center gap-3 text-xl">
                <Filter className="h-5 w-5 text-blue-600" />
                Filters & Search
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="search">Search Users</Label>
                  <div className="relative mt-2">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search by name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-white/80 backdrop-blur-sm border-gray-200 shadow-sm focus:shadow-md transition-all"
                    />
                  </div>
                </div>
                <div className="w-64">
                  <Label htmlFor="role-filter">Filter by Role</Label>
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger className="mt-2 bg-white/80 backdrop-blur-sm">
                      <SelectValue placeholder="All roles" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="administrator">Administrator</SelectItem>
                      <SelectItem value="inventory_manager">Inventory Manager</SelectItem>
                      <SelectItem value="sales_manager">Sales Manager</SelectItem>
                      <SelectItem value="cashier">Cashier</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Users List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredUsers.map((user) => {
              const effectivePermissions = getEffectivePermissions(user);
              const highestRole = user.roles
                .filter(r => r.isActive)
                .sort((a, b) => a.role.hierarchyLevel - b.role.hierarchyLevel)[0];

              return (
                <Card key={user.id} className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 group">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12 border-2 border-white shadow-lg">
                        <AvatarImage src={user.image} alt={user.name} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-lg">{user.name}</h3>
                          <div className={`w-2 h-2 rounded-full ${getUserStatusColor(user).replace('text-', 'bg-')}`} />
                        </div>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <Badge
                          variant={user.isActive ? "secondary" : "outline"}
                          className={`mt-1 ${getUserStatusColor(user)}`}
                        >
                          {getUserStatusText(user)}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    {/* Role Information */}
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">Primary Role</Label>
                      {highestRole ? (
                        <div className="flex items-center gap-2 mt-1">
                          <Crown className="h-4 w-4 text-amber-600" />
                          <span className="text-sm font-medium">{highestRole.role.name}</span>
                          <Badge variant="outline" className="text-xs">
                            Level {highestRole.role.hierarchyLevel}
                          </Badge>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground mt-1">No roles assigned</p>
                      )}
                    </div>

                    {/* Permission Summary */}
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">Permissions</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Key className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">{effectivePermissions.length} total</span>
                        {user.directPermissions.filter(p => p.isActive).length > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {user.directPermissions.filter(p => p.isActive).length} direct
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Last Activity */}
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">Last Activity</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-muted-foreground">
                          {user.lastLoginAt ? user.lastLoginAt.toLocaleString() : 'Never'}
                        </span>
                      </div>
                    </div>

                    {/* Active Sessions */}
                    {user.sessions.filter(s => s.isActive).length > 0 && (
                      <div>
                        <Label className="text-sm font-semibold text-gray-700">Active Sessions</Label>
                        <div className="space-y-1 mt-1">
                          {user.sessions.filter(s => s.isActive).map(session => (
                            <div key={session.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Globe className="h-3 w-3" />
                              <span>{session.deviceInfo}</span>
                              <Badge variant="outline" className="text-xs">
                                {session.ipAddress}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <Separator />

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700"
                        onClick={() => handleAssignPermissions(user)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Assign
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewHistory(user)}
                      >
                        <History className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="bulk" className="space-y-6">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
              <CardTitle className="flex items-center gap-3 text-xl">
                <Copy className="h-5 w-5 text-purple-600" />
                Bulk Permission Assignment
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-center py-12">
                <Copy className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Bulk Assignment Tool</h3>
                <p className="text-gray-600 mb-4">Assign permissions to multiple users at once</p>
                <Button className="bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:from-purple-600 hover:to-pink-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Start Bulk Assignment
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="matrix" className="space-y-6">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
              <CardTitle className="flex items-center gap-3 text-xl">
                <Eye className="h-5 w-5 text-green-600" />
                User-Permission Matrix
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-semibold">User</th>
                      {Object.values(SYSTEM_PERMISSIONS).slice(0, 8).map(permission => (
                        <th key={permission} className="text-center p-3 font-semibold min-w-24">
                          <div className="transform -rotate-45 origin-center whitespace-nowrap text-xs">
                            {permission.replace('_', ' ')}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(user => {
                      const effectivePermissions = getEffectivePermissions(user);
                      return (
                        <tr key={user.id} className="border-b hover:bg-gray-50">
                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={user.image} alt={user.name} />
                                <AvatarFallback className="text-xs">
                                  {user.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{user.name}</div>
                                <div className="text-xs text-muted-foreground">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          {Object.values(SYSTEM_PERMISSIONS).slice(0, 8).map(permission => (
                            <td key={permission} className="text-center p-3">
                              {effectivePermissions.includes(permission) || effectivePermissions.includes('*') ? (
                                <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                              ) : (
                                <X className="h-5 w-5 text-gray-300 mx-auto" />
                              )}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Permission Assignment Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-3">
              <UserCheck className="h-6 w-6 text-blue-600" />
              Assign Permissions: {selectedUser?.name}
            </DialogTitle>
            <DialogDescription>
              Manage role assignments and direct permissions for this user.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-6">
            {/* Roles Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Crown className="h-5 w-5 text-amber-600" />
                Role Assignments
              </h3>

              <div className="space-y-3 max-h-64 overflow-y-auto border rounded-lg p-4 bg-gray-50">
                {[
                  { id: 'admin', name: 'Administrator', level: 2 },
                  { id: 'manager', name: 'Inventory Manager', level: 3 },
                  { id: 'cashier', name: 'Cashier', level: 6 },
                ].map(role => (
                  <div key={role.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white transition-colors">
                    <Checkbox
                      id={`role-${role.id}`}
                      checked={assignmentData.roles.includes(role.id)}
                      onCheckedChange={() => handleRoleToggle(role.id)}
                    />
                    <Label htmlFor={`role-${role.id}`} className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{role.name}</span>
                        <Badge variant="outline" className="text-xs">
                          Level {role.level}
                        </Badge>
                      </div>
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Direct Permissions Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Key className="h-5 w-5 text-blue-600" />
                Direct Permissions
              </h3>

              <div className="space-y-3 max-h-64 overflow-y-auto border rounded-lg p-4 bg-gray-50">
                {Object.entries(PERMISSION_GROUPS).slice(0, 3).map(([groupKey, group]) => (
                  <div key={groupKey} className="space-y-2">
                    <div
                      className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-white transition-colors"
                      onClick={() => togglePermissionGroup(groupKey)}
                    >
                      {expandedPermissionGroups.has(groupKey) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                      <h4 className="font-medium">{group.name}</h4>
                      <Badge variant="secondary" className="ml-auto text-xs">
                        {group.permissions.length}
                      </Badge>
                    </div>

                    {expandedPermissionGroups.has(groupKey) && (
                      <div className="ml-6 space-y-2">
                        {group.permissions.slice(0, 5).map(permission => (
                          <div key={permission} className="flex items-center space-x-2">
                            <Checkbox
                              id={permission}
                              checked={assignmentData.permissions.includes(permission)}
                              onCheckedChange={() => handlePermissionToggle(permission)}
                            />
                            <Label htmlFor={permission} className="text-sm font-mono cursor-pointer">
                              {permission}
                            </Label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Additional Options */}
          <div className="space-y-4 border-t pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expires-at">Expiration Date (Optional)</Label>
                <Input
                  id="expires-at"
                  type="datetime-local"
                  value={assignmentData.expiresAt?.toISOString().slice(0, 16) || ''}
                  onChange={(e) => setAssignmentData(prev => ({
                    ...prev,
                    expiresAt: e.target.value ? new Date(e.target.value) : undefined
                  }))}
                  className="bg-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notify-user" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Notification Settings
                </Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="notify-user"
                    checked={assignmentData.notifyUser}
                    onCheckedChange={(checked) => setAssignmentData(prev => ({ ...prev, notifyUser: checked }))}
                  />
                  <Label htmlFor="notify-user" className="text-sm">
                    Send email notification to user
                  </Label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="justification">Justification (Optional)</Label>
              <Textarea
                id="justification"
                value={assignmentData.justification || ''}
                onChange={(e) => setAssignmentData(prev => ({ ...prev, justification: e.target.value }))}
                placeholder="Provide a reason for this permission assignment..."
                className="bg-white"
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t pt-4">
            <Button
              variant="outline"
              onClick={() => setIsAssignDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700"
            >
              <Save className="mr-2 h-4 w-4" />
              Save Assignment
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Permission History Dialog */}
      <Dialog open={isPermissionHistoryOpen} onOpenChange={setIsPermissionHistoryOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-3">
              <History className="h-6 w-6 text-gray-600" />
              Permission History: {selectedUser?.name}
            </DialogTitle>
            <DialogDescription>
              View the complete permission and role assignment history for this user.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="text-center py-8">
              <History className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Permission History</h3>
              <p className="text-gray-600">Track all permission changes and assignments over time</p>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={() => setIsPermissionHistoryOpen(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserPermissionAssignment;