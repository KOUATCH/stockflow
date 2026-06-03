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
import DateColumn from "@/components/DataTableColumns/DateColumn";
import SortableColumn from "@/components/DataTableColumns/SortableColumn";
import { ColumnDef } from "@tanstack/react-table";
import {
  Activity,
  Calendar,
  Copy,
  Crown,
  Edit,
  Eye,
  KeyRound,
  Mail,
  MoreHorizontal,
  Shield,
  Star,
  Trash2,
  User,
  UserCheck,
  UserPlus,
  UserX,
  Users
} from "lucide-react";

export type EnhancedUser = {
  id: string;
  name: string;
  email: string;
  emailVerified?: Date | null;
  image?: string | null;
  role?: string;
  isActive?: boolean;
  isAdmin?: boolean;
  lastLoginAt?: Date | null;
  organizationId?: string;
  createdAt: Date;
  updatedAt?: Date;
  _count?: {
    salesOrders: number;
    purchaseOrders: number;
    activityLogs: number;
  };
};

const formatDate = (date: Date | string | null | undefined) => {
  if (!date) {
    return "N/A";
  }

  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return "Invalid Date";
    }

    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(dateObj);
  } catch (error) {
    console.warn('Date formatting error:', error, 'for date:', date);
    return "Invalid Date";
  }
};

function getUserInitials(name: string) {
  return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
}

function getUserStatusColor(isActive?: boolean, emailVerified?: Date | null) {
  if (!isActive) {
    return {
      label: "Inactive",
      variant: "destructive" as const,
      icon: UserX,
      color: "text-red-500",
      bgColor: "from-red-100 to-red-200 dark:from-red-900 dark:to-red-800"
    };
  } else if (!emailVerified) {
    return {
      label: "Pending",
      variant: "secondary" as const,
      icon: UserPlus,
      color: "text-amber-500",
      bgColor: "from-amber-100 to-amber-200 dark:from-amber-900 dark:to-amber-800"
    };
  } else {
    return {
      label: "Active",
      variant: "default" as const,
      icon: UserCheck,
      color: "text-green-500",
      bgColor: "from-green-100 to-green-200 dark:from-green-900 dark:to-green-800"
    };
  }
}

function getRoleColor(role?: string) {
  switch (role?.toLowerCase()) {
    case "admin":
      return "bg-red-100 text-red-700 border-red-200 dark:bg-red-900 dark:text-red-300 dark:border-red-700";
    case "manager":
      return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-700";
    case "cashier":
      return "bg-green-100 text-green-700 border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-700";
    case "staff":
      return "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900 dark:text-purple-300 dark:border-purple-700";
    case "viewer":
      return "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-700";
  }
}

export const enhancedUsersColumns: ColumnDef<EnhancedUser>[] = [
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
    header: ({ column }) => <SortableColumn column={column} title="User Details" />,
    cell: ({ row }) => {
      const user = row.original;
      const initials = getUserInitials(user.name);
      const status = getUserStatusColor(user.isActive, user.emailVerified);

      return (
        <div className="flex items-center gap-3 min-w-[250px]">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 overflow-hidden bg-gradient-to-br ${status.bgColor} shadow-md relative`}>
            {user.image ? (
              <img
                src={user.image}
                alt={user.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  const parent = target.parentElement;
                  target.style.display = 'none';
                  if (parent) {
                    parent.innerHTML = `<span class="text-white font-bold text-sm">${initials}</span>`;
                  }
                }}
              />
            ) : (
              <span className="text-white font-bold text-sm">{initials}</span>
            )}
            {user.isAdmin && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                <Crown className="w-2 h-2 text-white" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-slate-900 dark:text-white truncate">
                {user.name}
              </p>
              {user.isAdmin && (
                <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400">
                  <Crown className="w-3 h-3 mr-1" />
                  Admin
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <Mail className="w-3 h-3 text-slate-400" />
              <span className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-48">
                {user.email}
              </span>
            </div>
            {user.role && (
              <div className="mt-1">
                <Badge className={`text-xs ${getRoleColor(user.role)}`}>
                  {user.role}
                </Badge>
              </div>
            )}
          </div>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      const name = row.original.name?.toLowerCase() || "";
      const email = row.original.email?.toLowerCase() || "";
      const role = row.original.role?.toLowerCase() || "";
      const searchValue = value.toLowerCase();
      return name.includes(searchValue) || email.includes(searchValue) || role.includes(searchValue);
    },
  },
  {
    accessorKey: "role",
    header: ({ column }) => <SortableColumn column={column} title="Role & Permissions" />,
    cell: ({ row }) => {
      const user = row.original;
      const roleColor = getRoleColor(user.role);

      return (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center">
              <Shield className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            </div>
            <Badge className={`text-sm ${roleColor}`}>
              {user.role || "No Role"}
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            <KeyRound className="w-3 h-3 text-slate-400" />
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {user.isAdmin ? "Full Access" : "Limited Access"}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    id: "status",
    header: ({ column }) => <SortableColumn column={column} title="Status" />,
    cell: ({ row }) => {
      const user = row.original;
      const status = getUserStatusColor(user.isActive, user.emailVerified);
      const StatusIcon = status.icon;

      return (
        <div className="text-center space-y-2">
          <Badge variant={status.variant} className="flex items-center gap-1 w-fit mx-auto">
            <StatusIcon className="w-3 h-3" />
            {status.label}
          </Badge>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {user.emailVerified ? "Verified" : "Unverified"}
          </div>
        </div>
      );
    },
  },
  {
    id: "activity",
    header: ({ column }) => <SortableColumn column={column} title="Activity" />,
    cell: ({ row }) => {
      const user = row.original;
      const salesCount = user._count?.salesOrders || 0;
      const purchaseCount = user._count?.purchaseOrders || 0;
      const totalActivity = salesCount + purchaseCount;

      return (
        <div className="text-center space-y-1">
          <div className="text-lg font-semibold text-slate-900 dark:text-white">
            {totalActivity}
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400">
            {salesCount} sales • {purchaseCount} purchases
          </div>
          <div className="flex items-center justify-center gap-1">
            <div className={`w-2 h-2 rounded-full ${
              totalActivity > 50 ? "bg-green-500" : totalActivity > 10 ? "bg-yellow-500" : "bg-gray-500"
            }`}></div>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {totalActivity > 50 ? "High" : totalActivity > 10 ? "Medium" : "Low"}
            </span>
          </div>
        </div>
      );
    },
    sortingFn: (rowA, rowB) => {
      const activityA = (rowA.original._count?.salesOrders || 0) + (rowA.original._count?.purchaseOrders || 0);
      const activityB = (rowB.original._count?.salesOrders || 0) + (rowB.original._count?.purchaseOrders || 0);
      return activityA - activityB;
    },
  },
  {
    accessorKey: "lastLoginAt",
    header: ({ column }) => <SortableColumn column={column} title="Last Login" />,
    cell: ({ row }) => {
      const lastLogin = row.getValue("lastLoginAt") as Date;

      if (!lastLogin) {
        return (
          <div className="text-sm text-center">
            <span className="text-slate-500 dark:text-slate-400">Never logged in</span>
          </div>
        );
      }

      const now = new Date();
      const diffTime = Math.abs(now.getTime() - new Date(lastLogin).getTime());
      const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      let timeAgo = "";
      if (diffHours < 24) {
        timeAgo = diffHours === 1 ? "1 hour ago" : `${diffHours} hours ago`;
      } else {
        timeAgo = diffDays === 1 ? "1 day ago" : `${diffDays} days ago`;
      }

      return (
        <div className="text-sm">
          <div className="font-medium text-slate-900 dark:text-white">
            {formatDate(lastLogin)}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {timeAgo}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => <SortableColumn column={column} title="Joined" />,
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
      const user = row.original;

      const handleCopyId = () => {
        navigator.clipboard.writeText(user.id);
      };

      const handleCopyEmail = () => {
        navigator.clipboard.writeText(user.email);
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
              Copy User ID
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleCopyEmail}>
              <Copy className="mr-2 h-4 w-4" />
              Copy Email
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Eye className="mr-2 h-4 w-4" />
              View Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Edit className="mr-2 h-4 w-4" />
              Edit User
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Shield className="mr-2 h-4 w-4" />
              Manage Permissions
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Activity className="mr-2 h-4 w-4" />
              View Activity
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <UserX className="mr-2 h-4 w-4" />
              {user.isActive ? "Deactivate User" : "Activate User"}
            </DropdownMenuItem>
            <DropdownMenuItem>
              <KeyRound className="mr-2 h-4 w-4" />
              Reset Password
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Mail className="mr-2 h-4 w-4" />
              Send Welcome Email
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete User
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];