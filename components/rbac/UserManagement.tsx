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
import { useNotifications } from "@/components/notifications/NotificationProvider";
import { usePermissions } from "@/hooks/usePermissions";
import { PermissionGate } from "./PermissionGate";
import { Plus, Edit, Trash2, UserPlus, Mail, Phone, Calendar, Shield, UserCheck, UserX } from "lucide-react";
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

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(false);

  const { success, error: notifyError, formSuccess, formError } = useNotifications();
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

  useEffect(() => {
    loadData();
  }, []);

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
      notifyError("Load Error", "Failed to load user data");
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
        formSuccess("User Invitation", "User invited successfully");
        setShowInviteDialog(false);
        resetInviteForm();
        loadData();
      } else {
        formError("User Invitation", result.error ?? "Failed to invite user");
      }
    } catch (error) {
      formError("User Invitation", "Failed to invite user");
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    try {
      const result = await updateUser(selectedUser.id, editForm);

      if (result.success) {
        formSuccess("User Update", "User updated successfully");
        setShowEditDialog(false);
        resetEditForm();
        loadData();
      } else {
        formError("User Update", result.error ?? "Failed to update user");
      }
    } catch (error) {
      formError("User Update", "Failed to update user");
    }
  };

  const handleToggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      const result = await toggleUserStatus(userId, isActive);

      if (result.success) {
        success("User Status", result.message ?? "User status updated successfully");
        loadData();
      } else {
        notifyError("User Status", result.error ?? "Failed to update user status");
      }
    } catch (error) {
      notifyError("User Status", "Failed to update user status");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const result = await deleteUser(userId);

      if (result.success) {
        success("User Deletion", "User deleted successfully");
        loadData();
      } else {
        notifyError("User Deletion", result.error ?? "Failed to delete user");
      }
    } catch (error) {
      notifyError("User Deletion", "Failed to delete user");
    }
  };

  const handleAssignRole = async (userId: string, roleId: string) => {
    try {
      const result = await assignRoleToUser(userId, roleId);

      if (result.success) {
        success("Role Assignment", "Role assigned successfully");
        loadData();
      } else {
        notifyError("Role Assignment", result.error ?? "Failed to assign role");
      }
    } catch (error) {
      notifyError("Role Assignment", "Failed to assign role");
    }
  };

  const handleRemoveRole = async (userId: string, roleId: string) => {
    try {
      const result = await removeRoleFromUser(userId, roleId);

      if (result.success) {
        success("Role Removal", "Role removed successfully");
        loadData();
      } else {
        notifyError("Role Removal", result.error ?? "Failed to remove role");
      }
    } catch (error) {
      notifyError("Role Removal", "Failed to remove role");
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

  if (loading) {
    return <div className="flex justify-center p-8">Loading users...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">User Management</h2>
          <p className="text-muted-foreground">
            Manage users and their role assignments
          </p>
        </div>

        <PermissionGate permission={PERMISSIONS.CREATE_USERS}>
          <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetInviteForm(); setShowInviteDialog(true); }}>
                <UserPlus className="h-4 w-4 mr-2" />
                Invite User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite New User</DialogTitle>
                <DialogDescription>
                  Send an invitation to a new user to join your organization
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={inviteForm.firstName}
                      onChange={(e) => setInviteForm(prev => ({ ...prev, firstName: e.target.value }))}
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={inviteForm.lastName}
                      onChange={(e) => setInviteForm(prev => ({ ...prev, lastName: e.target.value }))}
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={inviteForm.email}
                    onChange={(e) => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="john.doe@example.com"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone (Optional)</Label>
                  <Input
                    id="phone"
                    value={inviteForm.phone}
                    onChange={(e) => setInviteForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>

                <div>
                  <Label htmlFor="role">Initial Role</Label>
                  <Select value={inviteForm.roleId} onValueChange={(value) => setInviteForm(prev => ({ ...prev, roleId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name} - {role.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="password">Temporary Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={inviteForm.password}
                    onChange={(e) => setInviteForm(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Enter temporary password"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleInviteUser}
                  disabled={!inviteForm.firstName || !inviteForm.lastName || !inviteForm.email || !inviteForm.roleId || !inviteForm.password}
                >
                  Send Invitation
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </PermissionGate>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users ({users.length})</CardTitle>
          <CardDescription>
            All users in your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={user.image ?? undefined} />
                        <AvatarFallback>{getUserInitials(user)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        {user.jobTitle && (
                          <div className="text-sm text-muted-foreground">{user.jobTitle}</div>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-1 text-sm">
                        <Mail className="h-3 w-3" />
                        <span>{user.email}</span>
                      </div>
                      {user.phone && (
                        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          <span>{user.phone}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {user.roles.map((role) => (
                        <Badge key={role.id} variant="secondary" className="text-xs">
                          {role.name}
                        </Badge>
                      ))}
                      {user.roles.length === 0 && (
                        <Badge variant="outline" className="text-xs">
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
                          disabled={user.id === user.id} // Prevent self-deactivation
                        />
                      </PermissionGate>
                      <span className="text-sm">
                        {user.isActive ? (
                          <Badge variant="default" className="text-xs">
                            <UserCheck className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            <UserX className="h-3 w-3 mr-1" />
                            Inactive
                          </Badge>
                        )}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                    </div>
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <PermissionGate permission={PERMISSIONS.ASSIGN_ROLES}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openRoleDialog(user)}
                        >
                          <Shield className="h-4 w-4" />
                        </Button>
                      </PermissionGate>

                      <PermissionGate permission={PERMISSIONS.UPDATE_USERS}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </PermissionGate>

                      <PermissionGate permission={PERMISSIONS.DELETE_USERS}>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete User</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete {user.name}? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteUser(user.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </PermissionGate>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-firstName">First Name</Label>
                <Input
                  id="edit-firstName"
                  value={editForm.firstName}
                  onChange={(e) => setEditForm(prev => ({ ...prev, firstName: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="edit-lastName">Last Name</Label>
                <Input
                  id="edit-lastName"
                  value={editForm.lastName}
                  onChange={(e) => setEditForm(prev => ({ ...prev, lastName: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit-phone">Phone</Label>
              <Input
                id="edit-phone"
                value={editForm.phone}
                onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="edit-jobTitle">Job Title</Label>
              <Input
                id="edit-jobTitle"
                value={editForm.jobTitle}
                onChange={(e) => setEditForm(prev => ({ ...prev, jobTitle: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateUser}>
              Update User
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Role Management Dialog */}
      <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage User Roles</DialogTitle>
            <DialogDescription>
              Assign or remove roles for {selectedUser?.name}
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Current Roles</h4>
                <div className="space-y-2">
                  {selectedUser.roles.length > 0 ? (
                    selectedUser.roles.map((role) => (
                      <div key={role.id} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <span className="font-medium">{role.name}</span>
                          {role.description && (
                            <p className="text-sm text-muted-foreground">{role.description}</p>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveRole(selectedUser.id, role.id)}
                          className="text-destructive"
                        >
                          Remove
                        </Button>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No roles assigned</p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Available Roles</h4>
                <div className="space-y-2">
                  {getAvailableRoles(selectedUser).length > 0 ? (
                    getAvailableRoles(selectedUser).map((role) => (
                      <div key={role.id} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <span className="font-medium">{role.name}</span>
                          {role.description && (
                            <p className="text-sm text-muted-foreground">{role.description}</p>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAssignRole(selectedUser.id, role.id)}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Assign
                        </Button>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">All available roles are assigned</p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setShowRoleDialog(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
