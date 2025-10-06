"use client";

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/lib/auth-unified';
import { useRoles } from '@/lib/enterprise-permissions/hooks';
import { SYSTEM_PERMISSIONS, PERMISSION_GROUPS } from '@/lib/enterprise-permissions/permissions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Crown,
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
  UserCheck,
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
  ArrowUp,
  ArrowDown,
  Minus,
} from 'lucide-react';

interface Role {
  id: string;
  code: string;
  name: string;
  description: string;
  hierarchyLevel: number;
  parentRoleId?: string;
  isActive: boolean;
  isSystemRole: boolean;
  validFrom?: Date;
  validTo?: Date;
  permissions: string[];
  userCount: number;
  createdAt: Date;
  updatedAt: Date;
  organizationId: string;
}

interface RoleFormData {
  code: string;
  name: string;
  description: string;
  hierarchyLevel: number;
  parentRoleId?: string;
  validFrom?: Date;
  validTo?: Date;
  permissions: string[];
  isActive: boolean;
}

const HIERARCHY_LEVELS = [
  { value: 1, label: 'Platform Admin', description: 'Highest level - platform-wide control' },
  { value: 2, label: 'Organization Admin', description: 'Organization-wide administration' },
  { value: 3, label: 'Manager', description: 'Department or team management' },
  { value: 4, label: 'Supervisor', description: 'Team supervision and coordination' },
  { value: 5, label: 'Employee', description: 'Standard operational access' },
  { value: 6, label: 'Cashier', description: 'Point-of-sale operations' },
  { value: 7, label: 'Viewer', description: 'Read-only access' },
];

const RoleManagement = () => {
  const { session, hasPermission, user } = useAuth();
  const { roles: userRoles, isLoading: rolesLoading } = useRoles();

  // State
  const [roles, setRoles] = useState<Role[]>([]);
  const [filteredRoles, setFilteredRoles] = useState<Role[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHierarchy, setSelectedHierarchy] = useState<string>('all');
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [expandedPermissionGroups, setExpandedPermissionGroups] = useState(new Set(['SYSTEM_ADMIN']));
  const [activeTab, setActiveTab] = useState('overview');

  // Form state
  const [formData, setFormData] = useState<RoleFormData>({
    code: '',
    name: '',
    description: '',
    hierarchyLevel: 7,
    permissions: [],
    isActive: true,
  });

  // Mock data - in real implementation, this would come from your API
  useEffect(() => {
    const mockRoles: Role[] = [
      {
        id: '1',
        code: 'platform_admin',
        name: 'Platform Administrator',
        description: 'Complete platform access with all permissions',
        hierarchyLevel: 1,
        isActive: true,
        isSystemRole: true,
        permissions: ['PLATFORM_ADMIN', '*'],
        userCount: 2,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        organizationId: user?.organizationId || '',
      },
      {
        id: '2',
        code: 'organization_admin',
        name: 'Organization Administrator',
        description: 'Full organization management capabilities',
        hierarchyLevel: 2,
        parentRoleId: '1',
        isActive: true,
        isSystemRole: false,
        permissions: ['MANAGE_ORGANIZATION', 'READ_USERS', 'CREATE_USERS', 'UPDATE_USERS'],
        userCount: 5,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-02-01'),
        organizationId: user?.organizationId || '',
      },
      {
        id: '3',
        code: 'inventory_manager',
        name: 'Inventory Manager',
        description: 'Manages inventory, products, and stock operations',
        hierarchyLevel: 3,
        parentRoleId: '2',
        isActive: true,
        isSystemRole: false,
        permissions: ['READ_ITEMS', 'CREATE_ITEMS', 'UPDATE_ITEMS', 'MANAGE_INVENTORY_LEVELS'],
        userCount: 8,
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date('2024-02-15'),
        organizationId: user?.organizationId || '',
      },
      {
        id: '4',
        code: 'sales_manager',
        name: 'Sales Manager',
        description: 'Manages sales operations and customer relationships',
        hierarchyLevel: 3,
        parentRoleId: '2',
        isActive: true,
        isSystemRole: false,
        permissions: ['VIEW_SALES_REPORTS', 'PROCESS_SALES', 'READ_CUSTOMERS', 'CREATE_CUSTOMERS'],
        userCount: 12,
        createdAt: new Date('2024-01-25'),
        updatedAt: new Date('2024-02-10'),
        organizationId: user?.organizationId || '',
      },
      {
        id: '5',
        code: 'cashier',
        name: 'Cashier',
        description: 'Point-of-sale operations and transaction processing',
        hierarchyLevel: 6,
        parentRoleId: '4',
        isActive: true,
        isSystemRole: false,
        permissions: ['OPERATE_POS', 'PROCESS_PAYMENTS', 'READ_CUSTOMERS'],
        userCount: 25,
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-02-20'),
        organizationId: user?.organizationId || '',
      },
    ];
    setRoles(mockRoles);
  }, [user?.organizationId]);

  // Filter roles based on search and hierarchy
  useEffect(() => {
    let filtered = roles;

    if (searchTerm) {
      filtered = filtered.filter(role =>
        role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedHierarchy !== 'all') {
      filtered = filtered.filter(role => role.hierarchyLevel === parseInt(selectedHierarchy));
    }

    setFilteredRoles(filtered);
  }, [roles, searchTerm, selectedHierarchy]);

  const handleCreateRole = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      hierarchyLevel: 7,
      permissions: [],
      isActive: true,
    });
    setIsCreateDialogOpen(true);
  };

  const handleEditRole = (role: Role) => {
    setSelectedRole(role);
    setFormData({
      code: role.code,
      name: role.name,
      description: role.description,
      hierarchyLevel: role.hierarchyLevel,
      parentRoleId: role.parentRoleId,
      validFrom: role.validFrom,
      validTo: role.validTo,
      permissions: role.permissions,
      isActive: role.isActive,
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteRole = (role: Role) => {
    setSelectedRole(role);
    setIsDeleteDialogOpen(true);
  };

  const handlePermissionToggle = (permissionCode: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionCode)
        ? prev.permissions.filter(p => p !== permissionCode)
        : [...prev.permissions, permissionCode]
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

  const getHierarchyLabel = (level: number) => {
    return HIERARCHY_LEVELS.find(h => h.value === level)?.label || `Level ${level}`;
  };

  const getHierarchyColor = (level: number) => {
    const colors = {
      1: 'from-red-500 to-red-600',
      2: 'from-orange-500 to-orange-600',
      3: 'from-amber-500 to-amber-600',
      4: 'from-yellow-500 to-yellow-600',
      5: 'from-green-500 to-green-600',
      6: 'from-blue-500 to-blue-600',
      7: 'from-indigo-500 to-indigo-600',
    };
    return colors[level as keyof typeof colors] || 'from-gray-500 to-gray-600';
  };

  const getRoleIcon = (level: number) => {
    const icons = {
      1: Crown,
      2: Shield,
      3: Award,
      4: Star,
      5: Users,
      6: Zap,
      7: Eye,
    };
    return icons[level as keyof typeof icons] || Users;
  };

  if (rolesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl animate-pulse">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Loading Roles...</h2>
          <p className="text-gray-600">Please wait while we load role information.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-white/80 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-6">
        <div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg">
              <Crown className="h-8 w-8" />
            </div>
            Role Management
          </h1>
          <p className="text-muted-foreground text-lg mt-1">Manage user roles and permission hierarchies</p>
          <div className="flex items-center gap-4 mt-3">
            <Badge variant="outline" className="flex items-center gap-2 px-3 py-1">
              <Users className="h-4 w-4" />
              {roles.length} Total Roles
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-2 px-3 py-1">
              <CheckCircle className="h-4 w-4 text-green-500" />
              {roles.filter(r => r.isActive).length} Active
            </Badge>
            <Badge variant="outline" className="px-3 py-1 font-medium">
              <Eye className="h-4 w-4 mr-2" />
              {roles.reduce((sum, r) => sum + r.userCount, 0)} Users
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
            onClick={handleCreateRole}
            className="bg-gradient-to-r from-violet-500 to-purple-600 text-white hover:from-violet-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Role
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur-sm shadow-lg">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="hierarchy" className="flex items-center gap-2">
            <Layers className="h-4 w-4" />
            Hierarchy
          </TabsTrigger>
          <TabsTrigger value="permissions" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            Permission Matrix
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
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
                  <Label htmlFor="search">Search Roles</Label>
                  <div className="relative mt-2">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search by name, code, or description..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-white/80 backdrop-blur-sm border-gray-200 shadow-sm focus:shadow-md transition-all"
                    />
                  </div>
                </div>
                <div className="w-64">
                  <Label htmlFor="hierarchy">Hierarchy Level</Label>
                  <Select value={selectedHierarchy} onValueChange={setSelectedHierarchy}>
                    <SelectTrigger className="mt-2 bg-white/80 backdrop-blur-sm">
                      <SelectValue placeholder="All levels" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      {HIERARCHY_LEVELS.map(level => (
                        <SelectItem key={level.value} value={level.value.toString()}>
                          Level {level.value} - {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Roles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRoles.map((role) => {
              const IconComponent = getRoleIcon(role.hierarchyLevel);
              return (
                <Card key={role.id} className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 group">
                  <CardHeader className={`bg-gradient-to-r ${getHierarchyColor(role.hierarchyLevel)} border-b text-white`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm">
                          <IconComponent className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-lg text-white">{role.name}</CardTitle>
                          <p className="text-white/80 text-sm">Level {role.hierarchyLevel}</p>
                        </div>
                      </div>
                      <Badge
                        variant={role.isActive ? "secondary" : "outline"}
                        className={role.isActive ? "bg-white/20 text-white" : "bg-white/10 text-white/70"}
                      >
                        {role.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Description</p>
                        <p className="text-sm">{role.description}</p>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Code:</span>
                        <Badge variant="outline" className="font-mono text-xs">
                          {role.code}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Users:</span>
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {role.userCount}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Permissions:</span>
                        <Badge variant="outline">
                          {role.permissions.length}
                        </Badge>
                      </div>

                      {role.isSystemRole && (
                        <div className="flex items-center gap-2 p-2 bg-amber-50 rounded-lg border border-amber-200">
                          <Shield className="h-4 w-4 text-amber-600" />
                          <span className="text-xs text-amber-800 font-medium">System Role</span>
                        </div>
                      )}

                      <Separator />

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleEditRole(role)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        {!role.isSystemRole && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDeleteRole(role)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="hierarchy" className="space-y-6">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-violet-50 to-purple-50 border-b">
              <CardTitle className="flex items-center gap-3 text-xl">
                <Layers className="h-5 w-5 text-violet-600" />
                Role Hierarchy
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {HIERARCHY_LEVELS.map((level) => {
                  const rolesAtLevel = roles.filter(r => r.hierarchyLevel === level.value);
                  const IconComponent = getRoleIcon(level.value);

                  return (
                    <div
                      key={level.value}
                      className={`p-4 rounded-xl bg-gradient-to-r ${getHierarchyColor(level.value)} text-white shadow-lg`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm">
                            <IconComponent className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg">{level.label}</h3>
                            <p className="text-white/80 text-sm">{level.description}</p>
                          </div>
                        </div>
                        <Badge className="bg-white/20 text-white">
                          Level {level.value}
                        </Badge>
                      </div>

                      {rolesAtLevel.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
                          {rolesAtLevel.map(role => (
                            <div
                              key={role.id}
                              className="p-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium">{role.name}</p>
                                  <p className="text-xs text-white/70">{role.code}</p>
                                </div>
                                <Badge className="bg-white/20 text-white text-xs">
                                  {role.userCount} users
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-white/70">
                          <p className="text-sm">No roles assigned to this level</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-6">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
              <CardTitle className="flex items-center gap-3 text-xl">
                <Key className="h-5 w-5 text-green-600" />
                Permission Matrix
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-semibold">Permission</th>
                      {roles.map(role => (
                        <th key={role.id} className="text-center p-3 font-semibold min-w-24">
                          <div className="transform -rotate-45 origin-center whitespace-nowrap">
                            {role.name}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.values(SYSTEM_PERMISSIONS).slice(0, 10).map(permission => (
                      <tr key={permission} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <div className="font-medium text-sm">{permission}</div>
                        </td>
                        {roles.map(role => (
                          <td key={role.id} className="text-center p-3">
                            {role.permissions.includes(permission) || role.permissions.includes('*') ? (
                              <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                            ) : (
                              <X className="h-5 w-5 text-gray-300 mx-auto" />
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Role Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-3">
              <Crown className="h-6 w-6 text-violet-600" />
              Create New Role
            </DialogTitle>
            <DialogDescription>
              Define a new role with specific permissions and hierarchy level.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role-code">Role Code *</Label>
                <Input
                  id="role-code"
                  value={formData.code}
                  onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                  placeholder="e.g., inventory_manager"
                  className="bg-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role-name">Role Name *</Label>
                <Input
                  id="role-name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Inventory Manager"
                  className="bg-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role-description">Description</Label>
              <Textarea
                id="role-description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the role's responsibilities and scope..."
                className="bg-white"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hierarchy-level">Hierarchy Level *</Label>
              <Select
                value={formData.hierarchyLevel.toString()}
                onValueChange={(value) => setFormData(prev => ({ ...prev, hierarchyLevel: parseInt(value) }))}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HIERARCHY_LEVELS.map(level => (
                    <SelectItem key={level.value} value={level.value.toString()}>
                      Level {level.value} - {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <Label className="text-lg font-semibold">Permissions</Label>
              <div className="space-y-4 max-h-64 overflow-y-auto border rounded-lg p-4 bg-gray-50">
                {Object.entries(PERMISSION_GROUPS).map(([groupKey, group]) => (
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
                      <h4 className="font-semibold">{group.name}</h4>
                      <Badge variant="secondary" className="ml-auto">
                        {group.permissions.length}
                      </Badge>
                    </div>

                    {expandedPermissionGroups.has(groupKey) && (
                      <div className="ml-6 space-y-2">
                        {group.permissions.map(permission => (
                          <div key={permission} className="flex items-center space-x-2">
                            <Checkbox
                              id={permission}
                              checked={formData.permissions.includes(permission)}
                              onCheckedChange={() => handlePermissionToggle(permission)}
                            />
                            <Label htmlFor={permission} className="text-sm font-mono">
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

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is-active"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: !!checked }))}
              />
              <Label htmlFor="is-active">Role is active</Label>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="bg-gradient-to-r from-violet-500 to-purple-600 text-white hover:from-violet-600 hover:to-purple-700"
              >
                <Save className="mr-2 h-4 w-4" />
                Create Role
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-3">
              <Edit className="h-6 w-6 text-blue-600" />
              Edit Role: {selectedRole?.name}
            </DialogTitle>
            <DialogDescription>
              Modify role properties and permissions.
            </DialogDescription>
          </DialogHeader>

          {/* Similar form structure as create dialog */}
          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700"
            >
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-3 text-red-600">
              <AlertTriangle className="h-6 w-6" />
              Delete Role
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the role "{selectedRole?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {selectedRole && selectedRole.userCount > 0 && (
            <Alert className="border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                This role is currently assigned to {selectedRole.userCount} user(s). Deleting it will remove permissions for these users.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Role
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RoleManagement;