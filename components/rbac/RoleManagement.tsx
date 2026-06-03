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
  Settings2
} from "lucide-react";
import { getRoles, createRole, updateRole, deleteRole, getRoleTemplates, getAvailablePermissions } from "@/actions/roles";
import { PERMISSIONS, PERMISSION_GROUPS } from "@/lib/permissions";

interface Role {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  organizationId: string;
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

export function RoleManagement() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [roleTemplates, setRoleTemplates] = useState<RoleTemplate[]>([]);
  const [availablePermissions, setAvailablePermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [filterByPermissions, setFilterByPermissions] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { success, error: notifyError, formSuccess, formError } = useNotifications();
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
        setRoles(rolesResult.data ?? []);
      }

      if (templatesResult.success) {
        setRoleTemplates((templatesResult.data ?? []).map((template) => ({
          ...template,
          permissions: [...template.permissions],
        })));
      }

      if (permissionsResult.success) {
        setAvailablePermissions(permissionsResult.data ?? []);
      }
    } catch (error) {
      notifyError("Failed to Load Data", "Failed to load role data");
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
        formSuccess("Create Role", "Role created successfully");
        setShowCreateDialog(false);
        resetForm();
        loadData();
      } else {
        formError("Create Role", result.error ?? "Failed to create role");
      }
    } catch (error) {
      notifyError("Create Role Failed", "Failed to create role");
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
        formSuccess("Update Role", "Role updated successfully");
        setShowEditDialog(false);
        resetForm();
        loadData();
      } else {
        formError("Update Role", result.error ?? "Failed to update role");
      }
    } catch (error) {
      notifyError("Update Role Failed", "Failed to update role");
    }
  };

  const handleDeleteRole = async (role: Role) => {
    try {
      const result = await deleteRole(role.id);

      if (result.success) {
        formSuccess("Delete Role", "Role deleted successfully");
        loadData();
      } else {
        formError("Delete Role", result.error ?? "Failed to delete role");
      }
    } catch (error) {
      notifyError("Delete Role Failed", "Failed to delete role");
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
      permissions: [...template.permissions],
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

    const groupPermissions = [...group.permissions] as string[];
    const allSelected = groupPermissions.every(p => formData.permissions.includes(p));

    if (allSelected) {
      // Remove all permissions from this group
      setFormData(prev => ({
        ...prev,
        permissions: prev.permissions.filter(p => !groupPermissions.includes(p)),
      }));
    } else {
      // Add all permissions from this group
      setFormData(prev => ({
        ...prev,
        permissions: [...new Set([...prev.permissions, ...groupPermissions])],
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

  const renderPermissionGroups = () => {
    return Object.entries(PERMISSION_GROUPS).map(([groupKey, group]) => {
      const isExpanded = expandedGroups.has(groupKey);
      const groupPermissions = [...group.permissions] as string[];
      const selectedCount = groupPermissions.filter(p => formData.permissions.includes(p)).length;
      const totalCount = groupPermissions.length;
      const allSelected = selectedCount === totalCount;
      const someSelected = selectedCount > 0 && selectedCount < totalCount;

      return (
        <div key={groupKey} className="border rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleGroupExpansion(groupKey)}
                className="p-0 h-auto"
              >
                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
              <Checkbox
                checked={someSelected ? "indeterminate" : allSelected}
                onCheckedChange={() => toggleGroup(groupKey)}
              />
              <Label className="font-medium cursor-pointer" onClick={() => toggleGroup(groupKey)}>
                {group.name}
              </Label>
              <Badge variant="secondary" className="text-xs">
                {selectedCount}/{totalCount}
              </Badge>
            </div>
          </div>

          {isExpanded && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 ml-6">
              {groupPermissions.map((permission) => (
                <div key={permission} className="flex items-center space-x-2">
                  <Checkbox
                    checked={formData.permissions.includes(permission)}
                    onCheckedChange={() => togglePermission(permission)}
                  />
                  <Label className="text-sm cursor-pointer" onClick={() => togglePermission(permission)}>
                    {permission.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                  </Label>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    });
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading roles...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Role Management</h2>
          <p className="text-muted-foreground">
            Manage user roles and permissions for your organization
          </p>
        </div>

        <PermissionGate permission={PERMISSIONS.CREATE_ROLES}>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetForm(); setShowCreateDialog(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Create Role
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh]">
              <DialogHeader>
                <DialogTitle>Create New Role</DialogTitle>
                <DialogDescription>
                  Define a new role with specific permissions for your organization
                </DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="basic" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="permissions">Permissions</TabsTrigger>
                  <TabsTrigger value="template">Templates</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4">
                  <div className="grid gap-4">
                    <div>
                      <Label htmlFor="name">Role Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter role name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Input
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Enter role description"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="permissions" className="space-y-4">
                  <div className="text-sm text-muted-foreground mb-4">
                    Selected: {formData.permissions.length} permissions
                  </div>
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-4">
                      {renderPermissionGroups()}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="template" className="space-y-4">
                  <div>
                    <Label htmlFor="template">Role Template</Label>
                    <Select value={formData.templateCode} onValueChange={(value) => {
                      setFormData(prev => ({ ...prev, templateCode: value }));
                      applyTemplate(value);
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role template" />
                      </SelectTrigger>
                      <SelectContent>
                        {roleTemplates.map((template) => (
                          <SelectItem key={template.code} value={template.code}>
                            {template.name} - {template.description}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateRole}
                  disabled={!formData.name.trim() || formData.permissions.length === 0}
                >
                  Create Role
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </PermissionGate>
      </div>

      <div className="grid gap-4">
        {roles.map((role) => (
          <Card key={role.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5" />
                    <span>{role.name}</span>
                    <Badge variant="outline">{role.code}</Badge>
                  </CardTitle>
                  {role.description && (
                    <CardDescription className="mt-1">
                      {role.description}
                    </CardDescription>
                  )}
                </div>

                <div className="flex space-x-2">
                  <PermissionGate permission={PERMISSIONS.UPDATE_ROLES}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(role)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </PermissionGate>

                  <PermissionGate permission={PERMISSIONS.DELETE_ROLES}>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Role</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete the role "{role.name}"?
                            {role._count.users > 0 && (
                              <span className="text-destructive font-medium">
                                {" "}This role is assigned to {role._count.users} user(s).
                              </span>
                            )}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteRole(role)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </PermissionGate>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>{role._count.users} users</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Shield className="h-4 w-4" />
                  <span>{role.permissions.length} permissions</span>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-2">Permissions:</h4>
                <div className="flex flex-wrap gap-1">
                  {role.permissions.slice(0, 8).map((permission) => (
                    <Badge key={permission} variant="secondary" className="text-xs">
                      {permission.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                    </Badge>
                  ))}
                  {role.permissions.length > 8 && (
                    <Badge variant="outline" className="text-xs">
                      +{role.permissions.length - 8} more
                    </Badge>
                  )}
                </div>
              </div>

              {role._count.users > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Assigned Users:</h4>
                  <div className="flex flex-wrap gap-1">
                    {role.users.slice(0, 3).map((user) => (
                      <Badge key={user.id} variant="outline" className="text-xs">
                        {user.name || user.email}
                      </Badge>
                    ))}
                    {role.users.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{role.users.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Role Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
            <DialogDescription>
              Modify the role settings and permissions
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="basic" className="space-y-4">
            <TabsList>
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="permissions">Permissions</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="edit-name">Role Name</Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter role name"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-description">Description</Label>
                  <Input
                    id="edit-description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter role description"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="permissions" className="space-y-4">
              <div className="text-sm text-muted-foreground mb-4">
                Selected: {formData.permissions.length} permissions
              </div>
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {renderPermissionGroups()}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdateRole}
              disabled={!formData.name.trim() || formData.permissions.length === 0}
            >
              Update Role
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
