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
  CreditCard,
  Crown,
  Edit,
  Eye,
  Gift,
  Mail,
  MapPin,
  MessageSquare,
  MoreHorizontal,
  Phone,
  ShoppingBag,
  Star,
  Trash2,
  TrendingDown,
  TrendingUp,
  User,
  UserCheck,
  UserX,
  Users,
  Zap
} from "lucide-react";

export type EnhancedCustomer = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  // Image fields
  imageUrls?: string[];
  avatar?: string;
  // Extended fields for enhanced display
  totalOrderValue?: number;
  totalOrders?: number;
  lastOrderDate?: Date;
  loyaltyPoints?: number;
  customerTier?: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
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

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(amount);
};

function getCustomerStatus(customer: EnhancedCustomer) {
  if (!customer.isActive) {
    return {
      label: "Inactive",
      variant: "destructive" as const,
      icon: UserX,
      color: "text-red-500"
    };
  }

  const lastOrder = customer.lastOrderDate;
  if (!lastOrder) {
    return {
      label: "New Customer",
      variant: "secondary" as const,
      icon: User,
      color: "text-blue-500"
    };
  }

  const daysSinceLastOrder = Math.floor((Date.now() - new Date(lastOrder).getTime()) / (1000 * 60 * 60 * 24));

  if (daysSinceLastOrder <= 30) {
    return {
      label: "Active",
      variant: "default" as const,
      icon: UserCheck,
      color: "text-green-500"
    };
  } else if (daysSinceLastOrder <= 90) {
    return {
      label: "Regular",
      variant: "outline" as const,
      icon: Activity,
      color: "text-yellow-500"
    };
  } else {
    return {
      label: "Inactive",
      variant: "secondary" as const,
      icon: TrendingDown,
      color: "text-red-500"
    };
  }
}

function getCustomerTier(customer: EnhancedCustomer) {
  const tier = customer.customerTier || 'Bronze';
  const totalValue = customer.totalOrderValue || 0;

  // Auto-assign tier based on total order value if not set
  let autoTier = tier;
  if (totalValue > 10000) autoTier = 'Platinum';
  else if (totalValue > 5000) autoTier = 'Gold';
  else if (totalValue > 1000) autoTier = 'Silver';
  else autoTier = 'Bronze';

  const tierConfig = {
    Bronze: { color: "text-amber-600", bgColor: "bg-amber-100 dark:bg-amber-900/20", icon: Crown },
    Silver: { color: "text-slate-600", bgColor: "bg-slate-100 dark:bg-slate-900/20", icon: Crown },
    Gold: { color: "text-yellow-600", bgColor: "bg-yellow-100 dark:bg-yellow-900/20", icon: Crown },
    Platinum: { color: "text-purple-600", bgColor: "bg-purple-100 dark:bg-purple-900/20", icon: Crown }
  };

  return { tier: autoTier, ...tierConfig[autoTier as keyof typeof tierConfig] };
}

export const enhancedCustomersColumns: ColumnDef<EnhancedCustomer>[] = [
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
    header: ({ column }) => <SortableColumn column={column} title="Customer Details" />,
    cell: ({ row }) => {
      const customer = row.original;
      const imageUrl = customer.avatar || (customer.imageUrls && customer.imageUrls[0]);

      return (
        <div className="flex items-center gap-3 min-w-[250px]">
          <div className="w-14 h-14 rounded-full flex items-center justify-center shrink-0 overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-blue-900 dark:to-indigo-800 border-2 border-white dark:border-slate-600 shadow-lg">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={customer.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  const parent = target.parentElement;
                  target.style.display = 'none';
                  if (parent) {
                    parent.innerHTML = '<svg class="w-7 h-7 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>';
                  }
                }}
              />
            ) : (
              <User className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            )}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-slate-900 dark:text-white truncate">
              {customer.name}
            </p>
            {customer.email && (
              <div className="flex items-center gap-1 mt-0.5">
                <Mail className="w-3 h-3 text-slate-400" />
                <span className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-48">
                  {customer.email}
                </span>
              </div>
            )}
            {customer.phone && (
              <div className="flex items-center gap-1 mt-0.5">
                <Phone className="w-3 h-3 text-slate-400" />
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {customer.phone}
                </span>
              </div>
            )}
          </div>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      const name = row.original.name?.toLowerCase() || "";
      const email = row.original.email?.toLowerCase() || "";
      const phone = row.original.phone?.toLowerCase() || "";
      const searchValue = value.toLowerCase();
      return name.includes(searchValue) || email.includes(searchValue) || phone.includes(searchValue);
    },
  },
  {
    accessorKey: "address",
    header: ({ column }) => <SortableColumn column={column} title="Location" />,
    cell: ({ row }) => {
      const customer = row.original;
      return (
        <div className="space-y-1">
          {customer.address ? (
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <span className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {customer.address}
              </span>
            </div>
          ) : (
            <span className="text-sm text-slate-400 italic">No address provided</span>
          )}
        </div>
      );
    },
    filterFn: (row, id, value) => {
      const address = row.original.address?.toLowerCase() || "";
      const searchValue = value.toLowerCase();
      return address.includes(searchValue);
    },
  },
  {
    id: "orderStats",
    header: ({ column }) => <SortableColumn column={column} title="Order Statistics" />,
    cell: ({ row }) => {
      const customer = row.original;
      const totalOrders = customer.totalOrders || 0;
      const totalValue = customer.totalOrderValue || 0;

      return (
        <div className="text-center space-y-2">
          <div className="space-y-1">
            <div className="text-lg font-bold text-slate-900 dark:text-white">
              {totalOrders}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Orders
            </div>
          </div>
          <div className="text-sm font-semibold text-green-600 dark:text-green-400">
            {formatCurrency(totalValue)}
          </div>
        </div>
      );
    },
    sortingFn: (rowA, rowB) => {
      const valueA = Number(rowA.original.totalOrderValue) || 0;
      const valueB = Number(rowB.original.totalOrderValue) || 0;
      return valueA - valueB;
    },
  },
  {
    id: "customerTier",
    header: ({ column }) => <SortableColumn column={column} title="Customer Tier" />,
    cell: ({ row }) => {
      const customer = row.original;
      const tierInfo = getCustomerTier(customer);
      const TierIcon = tierInfo.icon;
      const loyaltyPoints = customer.loyaltyPoints || 0;

      return (
        <div className="text-center space-y-2">
          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${tierInfo.bgColor} ${tierInfo.color}`}>
            <TierIcon className="w-3 h-3" />
            <span className="text-xs font-medium">{tierInfo.tier}</span>
          </div>
          {loyaltyPoints > 0 && (
            <div className="flex items-center justify-center gap-1 text-xs text-slate-600 dark:text-slate-400">
              <Zap className="w-3 h-3 text-yellow-500" />
              {loyaltyPoints.toLocaleString()} pts
            </div>
          )}
        </div>
      );
    },
    sortingFn: (rowA, rowB) => {
      const tierOrder = { Bronze: 1, Silver: 2, Gold: 3, Platinum: 4 };
      const tierA = getCustomerTier(rowA.original).tier as keyof typeof tierOrder;
      const tierB = getCustomerTier(rowB.original).tier as keyof typeof tierOrder;
      return tierOrder[tierA] - tierOrder[tierB];
    },
  },
  {
    id: "activity",
    header: ({ column }) => <SortableColumn column={column} title="Activity" />,
    cell: ({ row }) => {
      const customer = row.original;
      const lastOrder = customer.lastOrderDate;
      const status = getCustomerStatus(customer);
      const StatusIcon = status.icon;

      let activityText = "No orders yet";
      if (lastOrder) {
        const daysSince = Math.floor((Date.now() - new Date(lastOrder).getTime()) / (1000 * 60 * 60 * 24));
        if (daysSince === 0) activityText = "Today";
        else if (daysSince === 1) activityText = "Yesterday";
        else if (daysSince < 30) activityText = `${daysSince} days ago`;
        else if (daysSince < 365) activityText = `${Math.floor(daysSince / 30)} months ago`;
        else activityText = `${Math.floor(daysSince / 365)} years ago`;
      }

      return (
        <div className="text-center space-y-2">
          <Badge variant={status.variant} className="flex items-center gap-1 w-fit mx-auto">
            <StatusIcon className="w-3 h-3" />
            {status.label}
          </Badge>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Last order: {activityText}
          </div>
        </div>
      );
    },
    sortingFn: (rowA, rowB) => {
      const dateA = rowA.original.lastOrderDate ? new Date(rowA.original.lastOrderDate).getTime() : 0;
      const dateB = rowB.original.lastOrderDate ? new Date(rowB.original.lastOrderDate).getTime() : 0;
      return dateB - dateA; // Most recent first
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => <SortableColumn column={column} title="Customer Since" />,
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as Date;
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - new Date(date).getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      let timeAgo = "";
      if (diffDays < 30) {
        timeAgo = diffDays === 1 ? "1 day ago" : `${diffDays} days ago`;
      } else if (diffDays < 365) {
        const months = Math.floor(diffDays / 30);
        timeAgo = months === 1 ? "1 month ago" : `${months} months ago`;
      } else {
        const years = Math.floor(diffDays / 365);
        timeAgo = years === 1 ? "1 year ago" : `${years} years ago`;
      }

      return (
        <div className="text-sm">
          <div className="font-medium text-slate-900 dark:text-white">
            {formatDate(date)}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {timeAgo}
          </div>
        </div>
      );
    },
  },
  {
    id: "status",
    header: ({ column }) => <SortableColumn column={column} title="Status" />,
    cell: ({ row }) => {
      const customer = row.original;
      const status = getCustomerStatus(customer);
      const StatusIcon = status.icon;

      return (
        <div className="flex flex-col gap-1">
          <Badge
            variant={customer.isActive ? "default" : "destructive"}
            className={`flex items-center gap-1 w-fit text-xs ${
              customer.isActive
                ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-700"
                : ""
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${customer.isActive ? "bg-green-500" : "bg-red-500"}`}></div>
            {customer.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const customer = row.original;

      const handleCopyId = () => {
        navigator.clipboard.writeText(customer.id);
      };

      const handleCopyEmail = () => {
        if (customer.email) {
          navigator.clipboard.writeText(customer.email);
        }
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
              Copy Customer ID
            </DropdownMenuItem>
            {customer.email && (
              <DropdownMenuItem onClick={handleCopyEmail}>
                <Copy className="mr-2 h-4 w-4" />
                Copy Email
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Eye className="mr-2 h-4 w-4" />
              View Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Edit className="mr-2 h-4 w-4" />
              Edit Customer
            </DropdownMenuItem>
            <DropdownMenuItem>
              <ShoppingBag className="mr-2 h-4 w-4" />
              View Orders
            </DropdownMenuItem>
            <DropdownMenuItem>
              <CreditCard className="mr-2 h-4 w-4" />
              Payment History
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <MessageSquare className="mr-2 h-4 w-4" />
              Send Message
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Gift className="mr-2 h-4 w-4" />
              Add Loyalty Points
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Customer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];