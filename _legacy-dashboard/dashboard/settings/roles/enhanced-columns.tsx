"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import SortableColumn from "@/components/DataTableColumns/SortableColumn";
import { ColumnDef } from "@tanstack/react-table";
import {
  Archive,
  Calendar,
  CheckCircle,
  Copy,
  Edit,
  Eye,
  Key,
  MoreHorizontal,
  Settings,
  Shield,
  Star,
  Trash2,
  Users,
  XCircle,
  Lock,
  Crown,
  Zap,
  AlertTriangle,
  Clock,
  UserPlus,
  UserMinus
} from "lucide-react";
import { EnhancedRole } from "@/types/roles";

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
};

const getRoleInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('')
}

const getRoleColor = (name: string, color?: string): string => {
  if (color) return color;

  const colors = [
    'from-red-500 to-orange-500',
    'from-blue-500 to-cyan-500',
    'from-green-500 to-emerald-500',
    'from-purple-500 to-pink-500',
    'from-yellow-500 to-amber-500',
    'from-indigo-500 to-blue-500',
    'from-teal-500 to-green-500',
    'from-rose-500 to-pink-500'
  ];
  const index = name.length % colors.length;
  return colors[index];
};

const getStatusBadge = (isActive: boolean) => {
  return (
    <Badge
      variant={isActive ? "default" : "destructive"}
      className={`flex items-center gap-1 text-xs font-medium ${
        isActive
          ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-700"
          : "bg-red-100 text-red-700 border-red-200 dark:bg-red-900 dark:text-red-300 dark:border-red-700"
      }`}
    >
      {isActive ? (
        <CheckCircle className="w-3 h-3" />
      ) : (
        <XCircle className="w-3 h-3" />
      )}
      {isActive ? "Active" : "Inactive"}
    </Badge>
  );
};

const getRoleTypeBadge = (isSystemRole: boolean) => {
  return (
    <Badge
      variant={isSystemRole ? "default" : "secondary"}
      className={`flex items-center gap-1 text-xs font-medium ${
        isSystemRole
          ? "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900 dark:text-purple-300 dark:border-purple-700"
          : "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-700"
      }`}
    >
      {isSystemRole ? (
        <Crown className="w-3 h-3" />
      ) : (
        <Shield className="w-3 h-3" />
      )}
      {isSystemRole ? "System" : "Custom"}
    </Badge>
  );
};

const getPermissionLevelBadge = (permissionCount: number) => {
  if (permissionCount === 0) {
    return (
      <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 text-xs">
        No Permissions
      </Badge>
    );
  }

  const level = permissionCount >= 20 ? "High" : permissionCount >= 10 ? "Medium" : "Low";
  const color = permissionCount >= 20 ? "red" : permissionCount >= 10 ? "yellow" : "green";

  return (
    <Badge
      variant="outline"
      className={`bg-${color}-100 text-${color}-700 border-${color}-200 dark:bg-${color}-900 dark:text-${color}-300 dark:border-${color}-700 font-medium text-xs flex items-center gap-1`}
    >
      {level === "High" && <AlertTriangle className="w-3 h-3" />}
      {level === "Medium" && <Zap className="w-3 h-3" />}
      {level === "Low" && <Key className="w-3 h-3" />}
      {level} Access
    </Badge>
  );
};

export const enhancedRolesColumns: ColumnDef<EnhancedRole>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="border-slate-300 dark:border-slate-600"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="border-slate-300 dark:border-slate-600"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => <SortableColumn column={column} title="Role Name" />,
    cell: ({ row }) => {
      const role = row.original;
      const initials = getRoleInitials(role.name);
      const gradientClass = getRoleColor(role.name, role.color);

      return (
        <div className="flex items-center gap-3 min-w-[220px]">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 bg-gradient-to-br ${gradientClass} shadow-md`}>
            <span className="text-white font-bold text-sm">{initials}</span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-slate-900 dark:text-white truncate">
                {role.name}
              </p>
              {role.isSystemRole && (
                <Crown className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              )}
            </div>
            <div className="flex items-start gap-2 mt-0.5">
              {role.description && (
                <span className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[180px]">
                  {role.description}
                </span>
              )}
            </div>
          </div>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      const name = row.original.name?.toLowerCase() || "";
      const description = row.original.description?.toLowerCase() || "";
      const searchValue = value.toLowerCase();
      return name.includes(searchValue) || description.includes(searchValue);
    },
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => {
      const role = row.original;

      return (
        <div className="min-w-[200px]">
          {role.description ? (
            <span className="text-sm text-slate-600 dark:text-slate-400">
              {role.description}
            </span>
          ) : (
            <span className="text-xs text-slate-400 italic">No description provided</span>
          )}
        </div>
      );
    },
  },
  {
    id: "permissions",
    header: ({ column }) => <SortableColumn column={column} title="Permissions" />,
    cell: ({ row }) => {
      const role = row.original;
      const permissionCount = role._count?.permissions || 0;

      return (
        <div className="text-center space-y-1">
          <div className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
            {permissionCount}
          </div>
          {getPermissionLevelBadge(permissionCount)}
          <div className="flex items-center justify-center gap-1">
            <Key className="w-3 h-3 text-slate-400" />
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Total Permissions
            </span>
          </div>
        </div>
      );
    },
    sortingFn: (rowA, rowB) => {
      const permissionsA = rowA.original._count?.permissions || 0;
      const permissionsB = rowB.original._count?.permissions || 0;
      return permissionsA - permissionsB;
    },
  },
  {
    id: "users",
    header: ({ column }) => <SortableColumn column={column} title="Users Assigned" />,
    cell: ({ row }) => {
      const role = row.original;
      const userCount = role._count?.users || 0;
      const isHighAssignment = userCount > 10;

      return (
        <div className="text-center space-y-1">
          <div className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
            {userCount}
          </div>
          <Badge
            variant={isHighAssignment ? "default" : "secondary"}
            className={`text-xs flex items-center gap-1 w-fit mx-auto ${
              isHighAssignment
                ? "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-700"
                : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400"
            }`}
          >
            <Users className="w-3 h-3" />
            {isHighAssignment ? "Widely Used" : "Standard"}
          </Badge>
        </div>
      );
    },
    sortingFn: (rowA, rowB) => {
      const usersA = rowA.original._count?.users || 0;
      const usersB = rowB.original._count?.users || 0;
      return usersA - usersB;
    },
  },
  {
    id: "roleType",
    header: ({ column }) => <SortableColumn column={column} title="Role Type" />,
    cell: ({ row }) => {
      const role = row.original;

      return (
        <div className="flex flex-col gap-1 items-center">
          {getRoleTypeBadge(role.isSystemRole)}
          {role.isSystemRole && (
            <div className="flex items-center gap-1">
              <Lock className="w-3 h-3 text-slate-400" />
              <span className="text-xs text-slate-500 dark:text-slate-400">Protected</span>
            </div>
          )}
        </div>
      );
    },
    filterFn: (row, id, value) => {
      const isSystemRole = row.original.isSystemRole;
      const searchValue = value.toLowerCase();
      const type = isSystemRole ? "system" : "custom";
      return type.includes(searchValue);
    },
  },
  {
    accessorKey: "isActive",
    header: ({ column }) => <SortableColumn column={column} title="Status" />,
    cell: ({ row }) => {
      const role = row.original;
      const isActive = role.isActive;

      return (
        <div className="flex flex-col gap-1">
          {getStatusBadge(isActive)}
        </div>
      );
    },
    filterFn: (row, id, value) => {
      const isActive = row.original.isActive;
      const searchValue = value.toLowerCase();
      const status = isActive ? "active" : "inactive";
      return status.includes(searchValue);
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => <SortableColumn column={column} title="Created" />,
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as Date;
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - new Date(date).getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return (
        <div className="text-sm">
          <div className="flex items-center gap-1 font-medium text-slate-900 dark:text-white">
            <Calendar className="w-3 h-3 text-slate-400" />
            {formatDate(date)}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {diffDays === 0 ? "Today" : `${diffDays} days ago`}
          </div>
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const role = row.original;

      const handleCopyId = () => {
        navigator.clipboard.writeText(role.id);
      };

      const handleViewPermissions = () => {
        window.location.href = `/dashboard/settings/roles/permissions/${role.id}`;
      };

      const handleViewUsers = () => {
        window.open(`/dashboard/settings/roles/${role.id}/users`, '_blank');
      };

      const handleAssignRole = () => {
        console.log("Opening assign role dialog for:", role.name);
      };

      const handleCloneRole = () => {
        console.log("Cloning role:", role.name);
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
              Actions
            </DropdownMenuLabel>
            <DropdownMenuItem onClick={handleCopyId}>
              <Copy className="mr-2 h-4 w-4" />
              Copy Role ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Edit className="mr-2 h-4 w-4" />
              Edit Role
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleCloneRole}>
              <Copy className="mr-2 h-4 w-4" />
              Clone Role
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleViewPermissions}>
              <Key className="mr-2 h-4 w-4" />
              Manage Permissions
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleViewUsers}>
              <Users className="mr-2 h-4 w-4" />
              View Assigned Users
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleAssignRole}>
              <UserPlus className="mr-2 h-4 w-4" />
              Assign to Users
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Role Settings
            </DropdownMenuItem>
            {!role.isSystemRole && (
              <>
                <DropdownMenuItem>
                  <Archive className="mr-2 h-4 w-4" />
                  Archive Role
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Role
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];