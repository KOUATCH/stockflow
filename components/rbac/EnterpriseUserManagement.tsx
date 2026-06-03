"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNotifications } from "@/components/notifications/NotificationProvider";
import { usePermissions } from "@/hooks/usePermissions";
import { PermissionGate } from "./PermissionGate";
import {
  Plus,
  Edit,
  Trash2,
  UserPlus,
  Mail,
  Phone,
  Calendar,
  Shield,
  UserCheck,
  UserX,
  MoreVertical,
  Search,
  Filter,
  Download,
  Upload,
  Users2,
  Crown,
  Star,
  Activity,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  Settings2,
  Sparkles,
  Globe,
  MapPin,
  Briefcase,
  Award,
  Zap
} from "lucide-react";
import { getUsers, updateUser, toggleUserStatus, deleteUser } from "@/actions/users";
import { sendInvite } from "@/actions/users/sendInvite";
import { getRoles, assignRoleToUser, removeRoleFromUser } from "@/actions/roles";
import { PERMISSIONS } from "@/lib/permissions";

interface User {
  id: string;
  name: string;
  firstName?: string | null;
  lastName?: string | null;
  email: string;
  phone?: string | null;
  image?: string | null;
  jobTitle?: string | null;
  isActive: boolean;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  roles: {
    id: string;
    name: string;
    code: string;
    description?: string | null;
  }[];
}

interface Role {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  permissions: string[];
  _count: { users: number };
}

const getUserStatusColor = (user: User) => {
  if (!user.isActive) return 'from-gray-500 to-slate-600';
  if (!user.isVerified) return 'from-yellow-500 to-orange-600';
  return 'from-green-500 to-emerald-600';
};

const getRoleColor = (code: string) => {
  const colorMap: Record<string, string> = {
    'super_admin': 'from-yellow-400 to-orange-500',
    'administrator': 'from-purple-500 to-pink-500',
    'manager': 'from-blue-500 to-cyan-500',
    'supervisor': 'from-green-500 to-emerald-500',
    'employee': 'from-indigo-500 to-purple-500',
    'cashier': 'from-orange-500 to-amber-500',
    'viewer': 'from-gray-500 to-slate-500',
  };
  return colorMap[code] || 'from-slate-500 to-gray-600';
};

const getRoleIcon = (code: string) => {
  const iconMap: Record<string, any> = {
    'super_admin': Crown,
    'administrator': Shield,
    'manager': Star,
    'supervisor': Zap,
    'employee': Users2,
    'cashier': Activity,
    'viewer': Eye,
  };
  return iconMap[code] || Shield;
};

export function EnterpriseUserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [showPassword, setShowPassword] = useState(false);

  const { formSuccess, formError, error: notifyError } = useNotifications();
  const { user, hasPermission } = usePermissions();

  // Form states
  const [inviteForm, setInviteForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    roleId: "",
    password: "",
  });

  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    jobTitle: "",
  });

  // Enhanced metrics
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    activeUsers: 0,
    adminUsers: 0,
    recentlyAdded: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (users.length > 0) {
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      setMetrics({
        totalUsers: users.length,
        activeUsers: users.filter(u => u.isActive).length,
        adminUsers: users.filter(u => u.roles.some(r => ['super_admin', 'administrator'].includes(r.code))).length,
        recentlyAdded: users.filter(u => new Date(u.createdAt) > weekAgo).length,
      });
    }
  }, [users]);

  const loadData = async () => {
    if (!user?.organizationId) return;

    setLoading(true);
    try {
      const [usersResult, rolesResult] = await Promise.all([
        getUsers(user.organizationId),
        getRoles(user.organizationId),
      ]);

      if (usersResult.success) {
        setUsers(usersResult.data ?? []);
      }

      if (rolesResult.success) {
        setRoles(rolesResult.data ?? []);
      }
    } catch (error) {
      notifyError("Loading Error", "Failed to load user data");
    } finally {
      setLoading(false);
    }
  };

  const handleInviteUser = async () => {
    if (!user?.organizationId) return;

    try {
      const selectedRole = roles.find((role) => role.id === inviteForm.roleId);
      const result = await sendInvite({
        email: inviteForm.email,
        roleId: inviteForm.roleId,
        organizationId: user.organizationId,
        organizationName: user.organizationName || "",
        name: selectedRole?.name ?? `${inviteForm.firstName} ${inviteForm.lastName}`,
        roleName: selectedRole?.name,
      });

      if (result.status === 200) {
        formSuccess("Invite User", `${inviteForm.firstName} ${inviteForm.lastName} has been invited successfully`);
        setShowInviteDialog(false);
        resetInviteForm();
        loadData();
      } else {
        formError("Invite User", result.error ?? "Failed to invite user");
      }
    } catch (error) {
      formError("Invite User", "Failed to invite user");
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    try {
      const result = await updateUser(selectedUser.id, editForm);

      if (result.success) {
        formSuccess("User Updated", `${editForm.firstName} ${editForm.lastName} has been updated successfully`);
        setShowEditDialog(false);
        resetEditForm();
        loadData();
      } else {
        formError("Update User", result.error ?? "Failed to update user");
      }
    } catch (error) {
      formError("Update User", "Failed to update user");
    }
  };

  const handleToggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      const result = await toggleUserStatus(userId, isActive);

      if (result.success) {
        formSuccess("Toggle Status", result.message ?? "User status updated successfully");
        loadData();
      } else {
        formError("Toggle Status", result.error ?? "Failed to update user status");
      }
    } catch (error) {
      formError("Toggle Status", "Failed to update user status");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const result = await deleteUser(userId);

      if (result.success) {
        formSuccess("Delete User", "User has been deleted successfully");
        loadData();
      } else {
        formError("Delete User", result.error ?? "Failed to delete user");
      }
    } catch (error) {
      formError("Delete User", "Failed to delete user");
    }
  };

  const handleAssignRole = async (userId: string, roleId: string) => {
    try {
      const result = await assignRoleToUser(userId, roleId);

      if (result.success) {
        formSuccess("Assign Role", "Role has been assigned successfully");
        loadData();
      } else {
        formError("Assign Role", result.error ?? "Failed to assign role");
      }
    } catch (error) {
      formError("Assign Role", "Failed to assign role");
    }
  };

  const handleRemoveRole = async (userId: string, roleId: string) => {
    try {
      const result = await removeRoleFromUser(userId, roleId);

      if (result.success) {
        formSuccess("Remove Role", "Role has been removed successfully");
        loadData();
      } else {
        formError("Remove Role", result.error ?? "Failed to remove role");
      }
    } catch (error) {
      formError("Remove Role", "Failed to remove role");
    }
  };

  const resetInviteForm = () => {
    setInviteForm({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      roleId: "",
      password: "",
    });
  };

  const resetEditForm = () => {
    setEditForm({
      firstName: "",
      lastName: "",
      phone: "",
      jobTitle: "",
    });
    setSelectedUser(null);
  };

  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    setEditForm({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      phone: user.phone || "",
      jobTitle: user.jobTitle || "",
    });
    setShowEditDialog(true);
  };

  const openRoleDialog = (user: User) => {
    setSelectedUser(user);
    setShowRoleDialog(true);
  };

  const getUserInitials = (user: User) => {
    return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();
  };

  const getAvailableRoles = (user: User) => {
    return roles.filter(role => !user.roles.some(userRole => userRole.id === role.id));
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterStatus === 'all' ||
                         (filterStatus === 'active' && user.isActive) ||
                         (filterStatus === 'inactive' && !user.isActive);

    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500/30 border-t-blue-500 mx-auto" />
          <p className="text-white/60">Loading user management system...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-8">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative flex justify-between items-center">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-white">Team Universe</h1>
            <p className="text-white/80 text-lg">
              Orchestrate your organization's talent constellation
            </p>
          </div>

          <PermissionGate permission={PERMISSIONS.CREATE_USERS}>
            <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => { resetInviteForm(); setShowInviteDialog(true); }}
                  className="bg-white/20 hover:bg-white/30 text-white border border-white/20 backdrop-blur-sm"
                  size="lg"
                >
                  <UserPlus className="h-5 w-5 mr-2" />
                  Invite User
                  <Sparkles className="h-4 w-4 ml-2" />
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-black/90 backdrop-blur border-white/10 max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl text-white flex items-center space-x-2">
                    <UserPlus className="h-6 w-6 text-blue-500" />
                    <span>Invite New Team Member</span>
                  </DialogTitle>
                  <DialogDescription className="text-white/70">
                    Send an invitation to expand your team constellation
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-white">First Name</Label>
                      <Input
                        id="firstName"
                        value={inviteForm.firstName}
                        onChange={(e) => setInviteForm(prev => ({ ...prev, firstName: e.target.value }))}
                        placeholder="John"
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-white">Last Name</Label>
                      <Input
                        id="lastName"
                        value={inviteForm.lastName}
                        onChange={(e) => setInviteForm(prev => ({ ...prev, lastName: e.target.value }))}
                        placeholder="Doe"
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={inviteForm.email}
                      onChange={(e) => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="john.doe@company.com"
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-white">Phone Number (Optional)</Label>
                    <Input
                      id="phone"
                      value={inviteForm.phone}
                      onChange={(e) => setInviteForm(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+1 (555) 000-0000"
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role" className="text-white">Initial Role</Label>
                    <Select value={inviteForm.roleId} onValueChange={(value) => setInviteForm(prev => ({ ...prev, roleId: value }))}>
                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent className="bg-black/90 backdrop-blur border-white/10">
                        {roles.map((role) => {
                          const RoleIcon = getRoleIcon(role.code);
                          const gradient = getRoleColor(role.code);
                          return (
                            <SelectItem key={role.id} value={role.id} className="text-white hover:bg-white/10">
                              <div className="flex items-center space-x-3">
                                <div className={`p-1 rounded bg-gradient-to-r ${gradient}`}>
                                  <RoleIcon className="h-3 w-3 text-white" />
                                </div>
                                <div>
                                  <div className="font-medium">{role.name}</div>
                                  <div className="text-xs text-white/60">{role.description}</div>
                                </div>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-white">Temporary Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={inviteForm.password}
                        onChange={(e) => setInviteForm(prev => ({ ...prev, password: e.target.value }))}
                        placeholder="Enter temporary password"
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50 pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 text-white/60 hover:text-white hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-white/10">
                  <Button variant="outline" onClick={() => setShowInviteDialog(false)} className="border-white/20 text-white hover:bg-white/10">
                    Cancel
                  </Button>
                  <Button
                    onClick={handleInviteUser}
                    disabled={!inviteForm.firstName || !inviteForm.lastName || !inviteForm.email || !inviteForm.roleId || !inviteForm.password}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0"
                  >
                    Send Invitation
                    <Mail className="h-4 w-4 ml-2" />
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
                <p className="text-blue-100/80 text-sm font-medium">Total Users</p>
                <p className="text-3xl font-bold text-white">{metrics.totalUsers}</p>
              </div>
              <Users2 className="h-8 w-8 text-blue-400" />
            </div>
            <div className="mt-2">
              <Progress value={(metrics.activeUsers / metrics.totalUsers) * 100} className="h-2" />
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
              <UserCheck className="h-8 w-8 text-green-400" />
            </div>
            <div className="mt-2 text-xs text-green-100/60">
              {Math.round((metrics.activeUsers / metrics.totalUsers) * 100)}% of total
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/20 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100/80 text-sm font-medium">Administrators</p>
                <p className="text-3xl font-bold text-white">{metrics.adminUsers}</p>
              </div>
              <Crown className="h-8 w-8 text-purple-400" />
            </div>
            <div className="mt-2 text-xs text-purple-100/60">
              System administrators
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border-orange-500/20 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100/80 text-sm font-medium">New This Week</p>
                <p className="text-3xl font-bold text-white">{metrics.recentlyAdded}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-400" />
            </div>
            <div className="mt-2 text-xs text-orange-100/60">
              Recently added users
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
          />
        </div>

        <div className="flex items-center space-x-3">
          <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
            <SelectTrigger className="w-32 bg-white/10 border-white/20 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-black/90 backdrop-blur border-white/10">
              <SelectItem value="all" className="text-white hover:bg-white/10">All Users</SelectItem>
              <SelectItem value="active" className="text-white hover:bg-white/10">Active</SelectItem>
              <SelectItem value="inactive" className="text-white hover:bg-white/10">Inactive</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>

          <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Users Table */}
      <Card className="bg-white/5 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Users2 className="h-5 w-5" />
            <span>Team Members ({filteredUsers.length})</span>
          </CardTitle>
          <CardDescription className="text-white/70">
            Manage your organization's team members and their roles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-white/10 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-white/5">
                  <TableHead className="text-white/80">User</TableHead>
                  <TableHead className="text-white/80">Contact</TableHead>
                  <TableHead className="text-white/80">Roles</TableHead>
                  <TableHead className="text-white/80">Status</TableHead>
                  <TableHead className="text-white/80">Joined</TableHead>
                  <TableHead className="text-white/80 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => {
                  const statusGradient = getUserStatusColor(user);
                  return (
                    <TableRow key={user.id} className="border-white/10 hover:bg-white/5">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={user.image ?? undefined} />
                              <AvatarFallback className={`bg-gradient-to-br ${statusGradient} text-white font-semibold`}>
                                {getUserInitials(user)}
                              </AvatarFallback>
                            </Avatar>
                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-gradient-to-br ${statusGradient} border-2 border-black`} />
                          </div>
                          <div>
                            <div className="font-medium text-white">{user.name}</div>
                            {user.jobTitle && (
                              <div className="text-sm text-white/60 flex items-center space-x-1">
                                <Briefcase className="h-3 w-3" />
                                <span>{user.jobTitle}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2 text-sm text-white">
                            <Mail className="h-3 w-3 text-white/60" />
                            <span>{user.email}</span>
                          </div>
                          {user.phone && (
                            <div className="flex items-center space-x-2 text-sm text-white/60">
                              <Phone className="h-3 w-3" />
                              <span>{user.phone}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {user.roles.map((role) => {
                            const RoleIcon = getRoleIcon(role.code);
                            const gradient = getRoleColor(role.code);
                            return (
                              <Badge key={role.id} className={`bg-gradient-to-r ${gradient} text-white border-0 text-xs`}>
                                <RoleIcon className="h-3 w-3 mr-1" />
                                {role.name}
                              </Badge>
                            );
                          })}
                          {user.roles.length === 0 && (
                            <Badge variant="outline" className="text-xs border-white/20 text-white/60">
                              No roles
                            </Badge>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <PermissionGate permission={PERMISSIONS.DEACTIVATE_USERS}>
                            <Switch
                              checked={user.isActive}
                              onCheckedChange={(checked) => handleToggleUserStatus(user.id, checked)}
                              disabled={user.id === user.id}
                            />
                          </PermissionGate>
                          <div className="flex flex-col space-y-1">
                            <Badge className={`text-xs bg-gradient-to-r ${statusGradient} border-0`}>
                              {user.isActive ? (
                                <>
                                  <UserCheck className="h-3 w-3 mr-1" />
                                  Active
                                </>
                              ) : (
                                <>
                                  <UserX className="h-3 w-3 mr-1" />
                                  Inactive
                                </>
                              )}
                            </Badge>
                            {!user.isVerified && (
                              <Badge variant="outline" className="text-xs border-yellow-500/50 text-yellow-400">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Unverified
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center space-x-2 text-sm text-white/60">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                        </div>
                      </TableCell>

                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-white/60 hover:text-white hover:bg-white/10">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-black/90 backdrop-blur border-white/10">
                            <PermissionGate permission={PERMISSIONS.ASSIGN_ROLES}>
                              <DropdownMenuItem onClick={() => openRoleDialog(user)} className="text-white hover:bg-white/10">
                                <Shield className="h-4 w-4 mr-2" />
                                Manage Roles
                              </DropdownMenuItem>
                            </PermissionGate>

                            <PermissionGate permission={PERMISSIONS.UPDATE_USERS}>
                              <DropdownMenuItem onClick={() => openEditDialog(user)} className="text-white hover:bg-white/10">
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Profile
                              </DropdownMenuItem>
                            </PermissionGate>

                            <DropdownMenuSeparator className="bg-white/10" />

                            <PermissionGate permission={PERMISSIONS.DELETE_USERS}>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-400 hover:bg-red-500/10">
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete User
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="bg-black/90 backdrop-blur border-white/10">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle className="text-white">Delete User</AlertDialogTitle>
                                    <AlertDialogDescription className="text-white/70">
                                      Are you sure you want to delete {user.name}? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteUser(user.id)}
                                      className="bg-red-500 text-white hover:bg-red-600"
                                    >
                                      Delete User
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </PermissionGate>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="bg-black/90 backdrop-blur border-white/10">
          <DialogHeader>
            <DialogTitle className="text-xl text-white flex items-center space-x-2">
              <Edit className="h-5 w-5 text-blue-500" />
              <span>Edit User Profile</span>
            </DialogTitle>
            <DialogDescription className="text-white/70">
              Update user information and details
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-firstName" className="text-white">First Name</Label>
                <Input
                  id="edit-firstName"
                  value={editForm.firstName}
                  onChange={(e) => setEditForm(prev => ({ ...prev, firstName: e.target.value }))}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-lastName" className="text-white">Last Name</Label>
                <Input
                  id="edit-lastName"
                  value={editForm.lastName}
                  onChange={(e) => setEditForm(prev => ({ ...prev, lastName: e.target.value }))}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-phone" className="text-white">Phone Number</Label>
              <Input
                id="edit-phone"
                value={editForm.phone}
                onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-jobTitle" className="text-white">Job Title</Label>
              <Input
                id="edit-jobTitle"
                value={editForm.jobTitle}
                onChange={(e) => setEditForm(prev => ({ ...prev, jobTitle: e.target.value }))}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-white/10">
            <Button variant="outline" onClick={() => setShowEditDialog(false)} className="border-white/20 text-white hover:bg-white/10">
              Cancel
            </Button>
            <Button onClick={handleUpdateUser} className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0">
              Update Profile
              <CheckCircle2 className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Role Management Dialog */}
      <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <DialogContent className="bg-black/90 backdrop-blur border-white/10 max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl text-white flex items-center space-x-2">
              <Shield className="h-5 w-5 text-purple-500" />
              <span>Manage User Roles</span>
            </DialogTitle>
            <DialogDescription className="text-white/70">
              Assign or remove roles for {selectedUser?.name}
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-white mb-4 flex items-center space-x-2">
                  <Award className="h-4 w-4 text-green-500" />
                  <span>Current Roles</span>
                </h4>
                <div className="space-y-3">
                  {selectedUser.roles.length > 0 ? (
                    selectedUser.roles.map((role) => {
                      const RoleIcon = getRoleIcon(role.code);
                      const gradient = getRoleColor(role.code);
                      return (
                        <div key={role.id} className="flex items-center justify-between p-4 rounded-lg border border-white/10 bg-white/5">
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-lg bg-gradient-to-r ${gradient}`}>
                              <RoleIcon className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <span className="font-medium text-white">{role.name}</span>
                              {role.description && (
                                <p className="text-sm text-white/60">{role.description}</p>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveRole(selectedUser.id, role.id)}
                            className="text-red-400 border-red-400/50 hover:bg-red-500/10"
                          >
                            Remove
                          </Button>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-white/60 text-center py-4 border border-white/10 rounded-lg bg-white/5">
                      No roles assigned
                    </p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-white mb-4 flex items-center space-x-2">
                  <Plus className="h-4 w-4 text-blue-500" />
                  <span>Available Roles</span>
                </h4>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {getAvailableRoles(selectedUser).length > 0 ? (
                    getAvailableRoles(selectedUser).map((role) => {
                      const RoleIcon = getRoleIcon(role.code);
                      const gradient = getRoleColor(role.code);
                      return (
                        <div key={role.id} className="flex items-center justify-between p-4 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-lg bg-gradient-to-r ${gradient}`}>
                              <RoleIcon className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <span className="font-medium text-white">{role.name}</span>
                              {role.description && (
                                <p className="text-sm text-white/60">{role.description}</p>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAssignRole(selectedUser.id, role.id)}
                            className="border-white/20 text-white hover:bg-white/10"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Assign
                          </Button>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-white/60 text-center py-4 border border-white/10 rounded-lg bg-white/5">
                      All available roles are assigned
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-4 border-t border-white/10">
            <Button variant="outline" onClick={() => setShowRoleDialog(false)} className="border-white/20 text-white hover:bg-white/10">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
