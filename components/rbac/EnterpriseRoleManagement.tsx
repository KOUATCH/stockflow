"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useNotifications } from "@/components/notifications/NotificationProvider";
import { usePermissions } from "@/hooks/usePermissions";
import { PermissionGate } from "./PermissionGate";
import {
  Plus,
  Edit,
  Trash2,
  Users,
  Shield,
  ChevronDown,
  ChevronRight,
  Crown,
  Star,
  Zap,
  Eye,
  Filter,
  Search,
  MoreVertical,
  Copy,
  Download,
  Activity,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Settings2,
  Grid3X3,
  List,
  Sparkles,
  Lock,
  Unlock,
  Users2,
  BarChart3
} from "lucide-react";
import { getRoles, createRole, updateRole, deleteRole, getRoleTemplates, getAvailablePermissions } from "@/actions/roles";
import { PERMISSIONS, PERMISSION_GROUPS } from "@/lib/permissions";

interface Role {
  id: string;
  name: string;
  code: string;
  description?: string;
  permissions: string[];
  users: { id: string; name: string; email: string }[];
  _count: { users: number };
  createdAt: Date;
  updatedAt: Date;
}

interface RoleTemplate {
  name: string;
  code: string;
  description: string;
  permissions: string[];
  hierarchy: number;
}

interface Permission {
  key: string;
  value: string;
  label: string;
}

const getRoleIcon = (code: string) => {
  const iconMap: Record<string, any> = {
    'super_admin': Crown,
    'administrator': Shield,
    'manager': Star,
    'supervisor': Zap,
    'employee': Users,
    'cashier': Activity,
    'viewer': Eye,
  };
  return iconMap[code] || Shield;
};

const getRoleGradient = (code: string) => {
  const gradientMap: Record<string, string> = {
    'super_admin': 'from-yellow-400 via-orange-500 to-red-500',
    'administrator': 'from-purple-500 via-pink-500 to-rose-500',
    'manager': 'from-blue-500 via-cyan-500 to-teal-500',
    'supervisor': 'from-green-500 via-emerald-500 to-cyan-500',
    'employee': 'from-indigo-500 via-purple-500 to-pink-500',
    'cashier': 'from-orange-500 via-amber-500 to-yellow-500',
    'viewer': 'from-gray-500 via-slate-500 to-zinc-500',
  };
  return gradientMap[code] || 'from-slate-500 via-gray-600 to-zinc-700';
};

export function EnterpriseRoleManagement() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [roleTemplates, setRoleTemplates] = useState<RoleTemplate[]>([]);
  const [availablePermissions, setAvailablePermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['USER_MANAGEMENT', 'INVENTORY_MANAGEMENT']));
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { success, error, formSuccess, formError } = useNotifications();
  const { user, hasPermission } = usePermissions();

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    permissions: [] as string[],
    templateCode: "",
  });

  // Enhanced metrics
  const [metrics, setMetrics] = useState({
    totalRoles: 0,
    activeUsers: 0,
    permissionCoverage: 0,
    lastModified: null as Date | null,
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (roles.length > 0) {
      setMetrics({
        totalRoles: roles.length,
        activeUsers: roles.reduce((sum, role) => sum + role._count.users, 0),
        permissionCoverage: Math.round((roles.reduce((sum, role) => sum + role.permissions.length, 0) / (roles.length * Object.keys(PERMISSIONS).length)) * 100),
        lastModified: new Date(Math.max(...roles.map(r => new Date(r.updatedAt).getTime()))),
      });
    }
  }, [roles]);

  const loadData = async () => {
    if (!user?.organizationId) return;

    setLoading(true);
    try {
      const [rolesResult, templatesResult, permissionsResult] = await Promise.all([
        getRoles(user.organizationId),
        getRoleTemplates(),
        getAvailablePermissions(),
      ]);

      if (rolesResult.success) {
        setRoles(rolesResult.data);
      }

      if (templatesResult.success) {
        setRoleTemplates(templatesResult.data);
      }

      if (permissionsResult.success) {
        setAvailablePermissions(permissionsResult.data);
      }
    } catch (error) {
      error("Failed to Load Data", "Failed to load role data");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRole = async () => {
    if (!user?.organizationId) return;

    try {
      const result = await createRole({
        name: formData.name,
        description: formData.description,
        permissions: formData.permissions,
        organizationId: user.organizationId,
      });

      if (result.success) {
        formSuccess("Create Role", `${formData.name} role has been created successfully`);
        setShowCreateDialog(false);
        resetForm();
        loadData();
      } else {
        formError("Create Role", result.error);
      }
    } catch (error) {
      error("Create Role Failed", "Failed to create role");
    }
  };

  const handleUpdateRole = async () => {
    if (!selectedRole) return;

    try {
      const result = await updateRole(selectedRole.id, {
        name: formData.name,
        description: formData.description,
        permissions: formData.permissions,
        organizationId: selectedRole.organizationId,
      });

      if (result.success) {
        formSuccess("Update Role", `${formData.name} has been updated successfully`);
        setShowEditDialog(false);
        resetForm();
        loadData();
      } else {
        formError("Update Role", result.error);
      }
    } catch (error) {
      error("Update Role Failed", "Failed to update role");
    }
  };

  const handleDeleteRole = async (role: Role) => {
    try {
      const result = await deleteRole(role.id);

      if (result.success) {
        formSuccess("Delete Role", `${role.name} has been deleted successfully`);
        loadData();
      } else {
        formError("Delete Role", result.error);
      }
    } catch (error) {
      error("Delete Role Failed", "Failed to delete role");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      permissions: [],
      templateCode: "",
    });
    setSelectedRole(null);
  };

  const openEditDialog = (role: Role) => {
    setSelectedRole(role);
    setFormData({
      name: role.name,
      description: role.description || "",
      permissions: role.permissions,
      templateCode: "",
    });
    setShowEditDialog(true);
  };

  const applyTemplate = (templateCode: string) => {
    const template = roleTemplates.find(t => t.code === templateCode);
    if (template) {
      setFormData(prev => ({
        ...prev,
        name: template.name,
        description: template.description,
        permissions: template.permissions,
      }));
    }
  };

  const togglePermission = (permission: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission],
    }));
  };

  const toggleGroup = (groupName: string) => {
    const group = PERMISSION_GROUPS[groupName as keyof typeof PERMISSION_GROUPS];
    if (!group) return;

    const allSelected = group.permissions.every(p => formData.permissions.includes(p));

    if (allSelected) {
      setFormData(prev => ({
        ...prev,
        permissions: prev.permissions.filter(p => !group.permissions.includes(p)),
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        permissions: [...new Set([...prev.permissions, ...group.permissions])],
      }));
    }
  };

  const toggleGroupExpansion = (groupName: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupName)) {
      newExpanded.delete(groupName);
    } else {
      newExpanded.add(groupName);
    }
    setExpandedGroups(newExpanded);
  };

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderPermissionGroups = () => {
    return Object.entries(PERMISSION_GROUPS).map(([groupKey, group]) => {
      const isExpanded = expandedGroups.has(groupKey);
      const selectedCount = group.permissions.filter(p => formData.permissions.includes(p)).length;
      const totalCount = group.permissions.length;
      const allSelected = selectedCount === totalCount;
      const someSelected = selectedCount > 0 && selectedCount < totalCount;
      const percentage = Math.round((selectedCount / totalCount) * 100);

      return (
        <div key={groupKey} className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-pink-500/10" />
          <div className="relative p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleGroupExpansion(groupKey)}
                  className="h-8 w-8 p-0 rounded-full hover:bg-white/10"
                >
                  {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </Button>
                <Checkbox
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected;
                  }}
                  onCheckedChange={() => toggleGroup(groupKey)}
                  className="border-white/20"
                />
                <div className="flex-1">
                  <Label className="font-semibold text-white cursor-pointer flex items-center space-x-2" onClick={() => toggleGroup(groupKey)}>
                    <span>{group.name}</span>
                    <Badge variant="secondary" className="bg-white/10 text-white/80 border-white/20">
                      {selectedCount}/{totalCount}
                    </Badge>
                  </Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Progress value={percentage} className="h-1 flex-1" />
                    <span className="text-xs text-white/60">{percentage}%</span>
                  </div>
                </div>
              </div>
            </div>

            {isExpanded && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-8">
                {group.permissions.map((permission) => (
                  <div key={permission} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-white/5 transition-colors">
                    <Checkbox
                      checked={formData.permissions.includes(permission)}
                      onCheckedChange={() => togglePermission(permission)}
                      className="border-white/20"
                    />
                    <Label className="text-sm text-white/80 cursor-pointer flex-1" onClick={() => togglePermission(permission)}>
                      {permission.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                    </Label>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    });
  };

  const renderRoleCard = (role: Role) => {
    const RoleIcon = getRoleIcon(role.code);
    const gradient = getRoleGradient(role.code);
    const permissionPercentage = Math.round((role.permissions.length / Object.keys(PERMISSIONS).length) * 100);

    return (
      <Card key={role.id} className="group relative overflow-hidden border-0 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm hover:from-white/15 hover:to-white/10 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl">
        <div className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-20 group-hover:opacity-30 transition-opacity duration-500`} />
        <div className="absolute top-0 right-0 w-32 h-32 transform translate-x-16 -translate-y-16">
          <div className={`w-full h-full rounded-full bg-gradient-to-br ${gradient} opacity-10 group-hover:opacity-20 transition-opacity duration-500`} />
        </div>

        <CardHeader className="relative">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-3">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}>
                <RoleIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-white group-hover:text-white/90 transition-colors">
                  {role.name}
                </CardTitle>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant="outline" className="text-xs border-white/20 text-white/60">
                    {role.code}
                  </Badge>
                  {role._count.users > 0 && (
                    <Badge className={`text-xs bg-gradient-to-r ${gradient} border-0`}>
                      {role._count.users} users
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-white/60 hover:text-white hover:bg-white/10">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-black/80 backdrop-blur border-white/10">
                <PermissionGate permission={PERMISSIONS.UPDATE_ROLES}>
                  <DropdownMenuItem onClick={() => openEditDialog(role)} className="text-white hover:bg-white/10">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Role
                  </DropdownMenuItem>
                </PermissionGate>
                <DropdownMenuItem className="text-white hover:bg-white/10">
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem className="text-white hover:bg-white/10">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/10" />
                <PermissionGate permission={PERMISSIONS.DELETE_ROLES}>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-400 hover:bg-red-500/10">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-black/90 backdrop-blur border-white/10">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-white">Delete Role</AlertDialogTitle>
                        <AlertDialogDescription className="text-white/70">
                          Are you sure you want to delete "{role.name}"? This action cannot be undone.
                          {role._count.users > 0 && (
                            <span className="block mt-2 text-red-400 font-medium">
                              ⚠️ This role is assigned to {role._count.users} user(s).
                            </span>
                          )}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteRole(role)}
                          className="bg-red-500 text-white hover:bg-red-600"
                        >
                          Delete Role
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </PermissionGate>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="relative space-y-4">
          {role.description && (
            <p className="text-sm text-white/70 leading-relaxed">
              {role.description}
            </p>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-white/60">
                <Users2 className="h-4 w-4" />
                <span>Team Members</span>
              </div>
              <div className="text-xl font-semibold text-white">
                {role._count.users}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-white/60">
                <Shield className="h-4 w-4" />
                <span>Permissions</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="text-xl font-semibold text-white">
                  {role.permissions.length}
                </div>
                <div className="flex-1">
                  <Progress value={permissionPercentage} className="h-2" />
                </div>
                <span className="text-xs text-white/60">{permissionPercentage}%</span>
              </div>
            </div>
          </div>

          <Separator className="bg-white/10" />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-white/80">Recent Activity</span>
              <Activity className="h-4 w-4 text-white/40" />
            </div>
            <div className="text-xs text-white/60">
              Last modified {new Date(role.updatedAt).toLocaleDateString()}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500/30 border-t-purple-500 mx-auto" />
          <p className="text-white/60">Loading role management system...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 p-8">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative flex justify-between items-center">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-white">Role Universe</h1>
            <p className="text-white/80 text-lg">
              Architect your organization's permission matrix with precision
            </p>
          </div>

          <PermissionGate permission={PERMISSIONS.CREATE_ROLES}>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => { resetForm(); setShowCreateDialog(true); }}
                  className="bg-white/20 hover:bg-white/30 text-white border border-white/20 backdrop-blur-sm"
                  size="lg"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create Role
                  <Sparkles className="h-4 w-4 ml-2" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-6xl max-h-[90vh] bg-black/90 backdrop-blur border-white/10">
                <DialogHeader>
                  <DialogTitle className="text-2xl text-white flex items-center space-x-2">
                    <Crown className="h-6 w-6 text-yellow-500" />
                    <span>Create New Role</span>
                  </DialogTitle>
                  <DialogDescription className="text-white/70">
                    Design a new role with tailored permissions for your organization
                  </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="basic" className="space-y-6">
                  <TabsList className="bg-white/10 border border-white/20">
                    <TabsTrigger value="basic" className="data-[state=active]:bg-white/20">
                      Basic Info
                    </TabsTrigger>
                    <TabsTrigger value="permissions" className="data-[state=active]:bg-white/20">
                      Permissions
                    </TabsTrigger>
                    <TabsTrigger value="template" className="data-[state=active]:bg-white/20">
                      Templates
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="basic" className="space-y-6">
                    <div className="grid gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-white">Role Name</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Enter role name"
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description" className="text-white">Description</Label>
                        <Input
                          id="description"
                          value={formData.description}
                          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Enter role description"
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="permissions" className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="text-white/80">
                        Selected: <span className="font-semibold text-white">{formData.permissions.length}</span> permissions
                      </div>
                      <Progress
                        value={(formData.permissions.length / Object.keys(PERMISSIONS).length) * 100}
                        className="w-32"
                      />
                    </div>
                    <ScrollArea className="h-[500px] pr-4">
                      <div className="space-y-4">
                        {renderPermissionGroups()}
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="template" className="space-y-6">
                    <div className="space-y-4">
                      <Label htmlFor="template" className="text-white">Role Template</Label>
                      <Select value={formData.templateCode} onValueChange={(value) => {
                        setFormData(prev => ({ ...prev, templateCode: value }));
                        applyTemplate(value);
                      }}>
                        <SelectTrigger className="bg-white/10 border-white/20 text-white">
                          <SelectValue placeholder="Select a role template" />
                        </SelectTrigger>
                        <SelectContent className="bg-black/90 backdrop-blur border-white/10">
                          {roleTemplates.map((template) => (
                            <SelectItem key={template.code} value={template.code} className="text-white hover:bg-white/10">
                              <div className="flex items-center space-x-2">
                                <Crown className="h-4 w-4" />
                                <div>
                                  <div className="font-medium">{template.name}</div>
                                  <div className="text-xs text-white/60">{template.description}</div>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="flex justify-end space-x-3 pt-4 border-t border-white/10">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)} className="border-white/20 text-white hover:bg-white/10">
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateRole}
                    disabled={!formData.name.trim() || formData.permissions.length === 0}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0"
                  >
                    Create Role
                    <Sparkles className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </PermissionGate>
        </div>
      </div>

      {/* Metrics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-500/20 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100/80 text-sm font-medium">Total Roles</p>
                <p className="text-3xl font-bold text-white">{metrics.totalRoles}</p>
              </div>
              <Shield className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/20 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100/80 text-sm font-medium">Active Users</p>
                <p className="text-3xl font-bold text-white">{metrics.activeUsers}</p>
              </div>
              <Users2 className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/20 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100/80 text-sm font-medium">Permission Coverage</p>
                <p className="text-3xl font-bold text-white">{metrics.permissionCoverage}%</p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border-orange-500/20 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100/80 text-sm font-medium">Last Modified</p>
                <p className="text-lg font-bold text-white">
                  {metrics.lastModified ? new Date(metrics.lastModified).toLocaleDateString() : 'Never'}
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
          <Input
            placeholder="Search roles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
          />
        </div>

        <div className="flex items-center space-x-3">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className="bg-white/10 hover:bg-white/20 border-white/20"
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="bg-white/10 hover:bg-white/20 border-white/20"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      {/* Roles Grid */}
      <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
        {filteredRoles.map(renderRoleCard)}
      </div>

      {/* Edit Role Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh] bg-black/90 backdrop-blur border-white/10">
          <DialogHeader>
            <DialogTitle className="text-2xl text-white flex items-center space-x-2">
              <Edit className="h-6 w-6 text-blue-500" />
              <span>Edit Role</span>
            </DialogTitle>
            <DialogDescription className="text-white/70">
              Modify the role settings and permissions
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="basic" className="space-y-6">
            <TabsList className="bg-white/10 border border-white/20">
              <TabsTrigger value="basic" className="data-[state=active]:bg-white/20">
                Basic Info
              </TabsTrigger>
              <TabsTrigger value="permissions" className="data-[state=active]:bg-white/20">
                Permissions
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-6">
              <div className="grid gap-6">
                <div className="space-y-2">
                  <Label htmlFor="edit-name" className="text-white">Role Name</Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter role name"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-description" className="text-white">Description</Label>
                  <Input
                    id="edit-description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter role description"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="permissions" className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="text-white/80">
                  Selected: <span className="font-semibold text-white">{formData.permissions.length}</span> permissions
                </div>
                <Progress
                  value={(formData.permissions.length / Object.keys(PERMISSIONS).length) * 100}
                  className="w-32"
                />
              </div>
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-4">
                  {renderPermissionGroups()}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end space-x-3 pt-4 border-t border-white/10">
            <Button variant="outline" onClick={() => setShowEditDialog(false)} className="border-white/20 text-white hover:bg-white/10">
              Cancel
            </Button>
            <Button
              onClick={handleUpdateRole}
              disabled={!formData.name.trim() || formData.permissions.length === 0}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0"
            >
              Update Role
              <CheckCircle2 className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}