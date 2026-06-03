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
  Building2,
  Copy,
  Edit,
  ExternalLink,
  Eye,
  MapPin,
  MoreHorizontal,
  Package,
  Star,
  Trash2,
  TrendingUp,
  Users,
  Phone,
  Mail,
  Calendar,
  CheckCircle,
  XCircle,
  Settings,
  Shield,
  ShoppingCart
} from "lucide-react";
import { LocationType } from "@prisma/client";
import Link from "next/link";

export type EnhancedLocation = {
  id: string;
  name: string;
  code: string;
  type?: LocationType;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  isActive?: boolean;
  isDefault?: boolean;
  managerId?: string | null;
  organizationId?: string;
  organization?: { id: string; name: string} | null;
  allowNegativeStock?: boolean;
  requiresApproval?: boolean;
  createdAt: Date;
  updatedAt?: Date;
  _count?: {
    inventoryLevels: number;
    purchaseOrders: number;
    salesOrders: number;
  };
};

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
};

// Generate a consistent color based on location type
const getLocationTypeColor = (type: LocationType | undefined) => {
  switch (type) {
    case "WAREHOUSE":
      return "from-blue-500 to-cyan-500";
    case "STORE":
      return "from-green-500 to-emerald-500";
    case "DISTRIBUTION_CENTER":
      return "from-purple-500 to-pink-500";
    case "SUPPLIER":
      return "from-orange-500 to-red-500";
    case "CUSTOMER":
      return "from-yellow-500 to-amber-500";
    case "MANUFACTURING":
      return "from-indigo-500 to-blue-500";
    case "QUARANTINE":
      return "from-red-500 to-orange-500";
    case "DAMAGED":
      return "from-gray-500 to-slate-500";
    case "TRANSIT":
      return "from-teal-500 to-green-500";
    case "VIRTUAL":
      return "from-violet-500 to-purple-500";
    default:
      return "from-slate-500 to-gray-500";
  }
};

const getLocationInitials = (name: string) => {
  return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
};

const getLocationTypeIcon = (type: LocationType | undefined) => {
  switch (type) {
    case "WAREHOUSE":
      return Package;
    case "STORE":
      return ShoppingCart;
    case "DISTRIBUTION_CENTER":
      return Building2;
    case "SUPPLIER":
    case "CUSTOMER":
      return Users;
    case "MANUFACTURING":
      return Settings;
    case "QUARANTINE":
    case "DAMAGED":
      return Shield;
    case "TRANSIT":
      return TrendingUp;
    case "VIRTUAL":
      return Eye;
    default:
      return Building2;
  }
};

const getLocationTypeBadgeColor = (type: LocationType | undefined) => {
  switch (type) {
    case "WAREHOUSE":
      return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-700";
    case "STORE":
      return "bg-green-100 text-green-700 border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-700";
    case "DISTRIBUTION_CENTER":
      return "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900 dark:text-purple-300 dark:border-purple-700";
    case "SUPPLIER":
      return "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900 dark:text-orange-300 dark:border-orange-700";
    case "CUSTOMER":
      return "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-300 dark:border-yellow-700";
    case "MANUFACTURING":
      return "bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900 dark:text-indigo-300 dark:border-indigo-700";
    case "QUARANTINE":
    case "DAMAGED":
      return "bg-red-100 text-red-700 border-red-200 dark:bg-red-900 dark:text-red-300 dark:border-red-700";
    case "TRANSIT":
      return "bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-900 dark:text-teal-300 dark:border-teal-700";
    case "VIRTUAL":
      return "bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900 dark:text-violet-300 dark:border-violet-700";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-700";
  }
};

export const enhancedLocationsColumns: ColumnDef<EnhancedLocation>[] = [
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
    header: ({ column }) => <SortableColumn column={column} title="Location Name" />,
    cell: ({ row }) => {
      const location = row.original;
      const initials = getLocationInitials(location.name);
      const gradientClass = getLocationTypeColor(location.type);
      const IconComponent = getLocationTypeIcon(location.type);

      return (
        <div className="flex items-center gap-3 min-w-[220px]">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 bg-gradient-to-br ${gradientClass} shadow-md`}>
            <span className="text-white font-bold text-sm">{initials}</span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-slate-900 dark:text-white truncate">
                {location.name}
              </p>
              {location.isDefault && (
                <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-700/50">
                  <Star className="w-3 h-3 mr-1" />
                  Default
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-xs font-mono text-slate-600 dark:text-slate-400">
                {location.code}
              </code>
              <div className="flex items-center gap-1">
                <IconComponent className="w-3 h-3 text-slate-400" />
                <span className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                  {location.type?.toLowerCase().replace('_', ' ') || 'Unknown'}
                </span>
              </div>
            </div>
          </div>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      const name = row.original.name?.toLowerCase() || "";
      const code = row.original.code?.toLowerCase() || "";
      const type = row.original.type?.toLowerCase() || "";
      const searchValue = value.toLowerCase();
      return name.includes(searchValue) || code.includes(searchValue) || type.includes(searchValue);
    },
  },
  {
    accessorKey: "type",
    header: ({ column }) => <SortableColumn column={column} title="Type" />,
    cell: ({ row }) => {
      const type = row.getValue("type") as LocationType;
      const badgeColor = getLocationTypeBadgeColor(type);
      const IconComponent = getLocationTypeIcon(type);

      return (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center">
            <IconComponent className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          </div>
          <Badge className={`text-xs flex items-center gap-1 ${badgeColor}`}>
            {type ? type.toLowerCase().replace('_', ' ') : 'Unknown'}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "address",
    header: "Location Details",
    cell: ({ row }) => {
      const location = row.original;

      return (
        <div className="space-y-1 min-w-[200px]">
          {location.address && (
            <div className="flex items-center gap-1 text-xs">
              <MapPin className="h-3 w-3 text-slate-400 flex-shrink-0" />
              <span className="text-slate-600 dark:text-slate-400 truncate">{location.address}</span>
            </div>
          )}
          {location.email && (
            <div className="flex items-center gap-1 text-xs">
              <Mail className="h-3 w-3 text-slate-400 flex-shrink-0" />
              <span className="text-slate-600 dark:text-slate-400 truncate">{location.email}</span>
            </div>
          )}
          {location.phone && (
            <div className="flex items-center gap-1 text-xs">
              <Phone className="h-3 w-3 text-slate-400 flex-shrink-0" />
              <span className="text-slate-600 dark:text-slate-400">{location.phone}</span>
            </div>
          )}
          {!location.address && !location.email && !location.phone && (
            <span className="text-xs text-slate-400">No details available</span>
          )}
        </div>
      );
    },
  },
  {
    id: "inventory",
    header: ({ column }) => <SortableColumn column={column} title="Inventory" />,
    cell: ({ row }) => {
      const location = row.original;
      const inventoryCount = location._count?.inventoryLevels || 0;
      const isLowInventory = inventoryCount < 10;

      return (
        <div className="text-center">
          <div className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
            {inventoryCount}
          </div>
          <Badge
            variant={isLowInventory ? "destructive" : "default"}
            className={`text-xs flex items-center gap-1 w-fit mx-auto ${
              isLowInventory
                ? "bg-red-100 text-red-700 border-red-200 dark:bg-red-900 dark:text-red-300 dark:border-red-700"
                : "bg-green-100 text-green-700 border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-700"
            }`}
          >
            <Package className="w-3 h-3" />
            {isLowInventory ? "Low Stock" : "Stocked"}
          </Badge>
        </div>
      );
    },
    sortingFn: (rowA, rowB) => {
      const inventoryA = rowA.original._count?.inventoryLevels || 0;
      const inventoryB = rowB.original._count?.inventoryLevels || 0;
      return inventoryA - inventoryB;
    },
  },
  {
    id: "sales",
    header: ({ column }) => <SortableColumn column={column} title="Sales Activity" />,
    cell: ({ row }) => {
      const location = row.original;
      const salesCount = location._count?.salesOrders || 0;
      const purchaseOrdersCount = location._count?.purchaseOrders || 0;

      return (
        <div className="text-center space-y-1">
          <div className="text-sm font-semibold text-slate-900 dark:text-white">
            {salesCount} Sales
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {purchaseOrdersCount} POs
          </div>
          <div className="flex items-center justify-center gap-1">
            <div className={`w-2 h-2 rounded-full ${salesCount > 5 ? "bg-green-500" : "bg-yellow-500"}`}></div>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {salesCount > 10 ? "High" : salesCount > 5 ? "Medium" : "Low"}
            </span>
          </div>
        </div>
      );
    },
    sortingFn: (rowA, rowB) => {
      const salesA = rowA.original._count?.salesOrders || 0;
      const salesB = rowB.original._count?.salesOrders || 0;
      return salesA - salesB;
    },
  },
  {
    accessorKey: "isActive",
    header: ({ column }) => <SortableColumn column={column} title="Status" />,
    cell: ({ row }) => {
      const location = row.original;
      const isActive = location.isActive ?? true;

      return (
        <div className="flex flex-col gap-1">
          <Badge
            variant={isActive ? "default" : "destructive"}
            className={`flex items-center gap-1 w-fit text-xs ${
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

          <div className="flex gap-1">
            {location.allowNegativeStock && (
              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-700/50">
                Allow -Stock
              </Badge>
            )}
            {location.requiresApproval && (
              <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-700/50">
                Approval Req.
              </Badge>
            )}
          </div>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      const isActive = row.original.isActive ?? true;
      const allowNegativeStock = row.original.allowNegativeStock ?? false;
      const requiresApproval = row.original.requiresApproval ?? false;
      const searchValue = value.toLowerCase();

      const status = isActive ? "active" : "inactive";
      const negativeStock = allowNegativeStock ? "negative stock" : "";
      const approval = requiresApproval ? "approval required" : "";

      return status.includes(searchValue) || negativeStock.includes(searchValue) || approval.includes(searchValue);
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
      const location = row.original;

      const handleCopyId = () => {
        navigator.clipboard.writeText(location.id);
      };

      const handleCopyCode = () => {
        navigator.clipboard.writeText(location.code);
      };

      const handleViewInventory = () => {
        window.open(`/dashboard/settings/locations/${location.id}/inventory`, '_blank');
      };

      const handleViewSales = () => {
        window.open(`/dashboard/settings/locations/${location.id}/sales`, '_blank');
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
              Copy Location ID
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleCopyCode}>
              <Copy className="mr-2 h-4 w-4" />
              Copy Location Code
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/settings/locations/${location.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/settings/locations/${location.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Location
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleViewInventory}>
              <Package className="mr-2 h-4 w-4" />
              View Inventory
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleViewSales}>
              <TrendingUp className="mr-2 h-4 w-4" />
              View Sales
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/settings/locations/${location.id}/settings`}>
                <Settings className="mr-2 h-4 w-4" />
                Location Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/settings/locations/${location.id}/permissions`}>
                <Shield className="mr-2 h-4 w-4" />
                Permissions
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/settings/locations/${location.id}/archive`}>
                <Archive className="mr-2 h-4 w-4" />
                Archive Location
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href={`/dashboard/settings/locations/${location.id}/delete`}
                className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Location
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];