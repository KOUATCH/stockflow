"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
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
  Award,
  Calendar,
  Copy,
  CreditCard,
  Crown,
  Edit,
  ExternalLink,
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
  Zap,
  Target,
  DollarSign,
  Clock,
  Archive,
  AlertTriangle,
  Ban,
  CheckCircle,
  Shield
} from "lucide-react";

export type EnhancedCustomer = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  dateOfBirth?: Date;
  gender?: "Male" | "Female" | "Other";
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  lastOrderDate?: Date;
  customerTier: "Bronze" | "Silver" | "Gold" | "Platinum";
  loyaltyPoints: number;
  isVip: boolean;
  status: "Active" | "Inactive" | "Blocked";
  joinedDate: Date;
  notes?: string;
  creditLimit?: number;
  outstandingBalance?: number;
  lifetimeValue: number;
  preferredContactMethod: "Email" | "Phone" | "SMS";
  marketingOptIn: boolean;
  lastContactDate?: Date;
  source: "Website" | "Store" | "Referral" | "Advertisement" | "Other";
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
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
    }).format(dateObj);
  } catch (error) {
    console.warn('Date formatting error:', error, 'for date:', date);
    return "Invalid Date";
  }
};

const getTierIcon = (tier: string) => {
  switch (tier) {
    case "Platinum":
      return <Crown className="w-4 h-4 text-purple-600" />;
    case "Gold":
      return <Award className="w-4 h-4 text-yellow-600" />;
    case "Silver":
      return <Star className="w-4 h-4 text-gray-600" />;
    default:
      return <Target className="w-4 h-4 text-orange-600" />;
  }
};

const getTierColor = (tier: string) => {
  switch (tier) {
    case "Platinum":
      return "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900 dark:text-purple-100";
    case "Gold":
      return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-100";
    case "Silver":
      return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-100";
    default:
      return "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:text-orange-100";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "Active":
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    case "Inactive":
      return <Clock className="w-4 h-4 text-gray-600" />;
    case "Blocked":
      return <Ban className="w-4 h-4 text-red-600" />;
    default:
      return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "Active":
      return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-100";
    case "Inactive":
      return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-100";
    case "Blocked":
      return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-100";
    default:
      return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-100";
  }
};

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
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "firstName",
    header: ({ column }) => (
      <SortableColumn column={column} title="Customer" />
    ),
    cell: ({ row }) => {
      const customer = row.original;
      const fullName = `${customer.firstName} ${customer.lastName}`;
      const initials = `${customer.firstName?.charAt(0)}${customer.lastName?.charAt(0)}`;

      return (
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold ${
            customer.isVip ? 'bg-gradient-to-br from-purple-500 to-pink-600' : 'bg-gradient-to-br from-blue-500 to-cyan-600'
          }`}>
            {initials}
            {customer.isVip && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                <Crown className="w-2 h-2 text-yellow-800" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {fullName}
              </p>
              {customer.isVip && (
                <Badge variant="secondary" className="px-1.5 py-0.5 text-xs">
                  <Crown className="w-3 h-3 mr-1" />
                  VIP
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span className="flex items-center">
                <Mail className="w-3 h-3 mr-1" />
                {customer.email}
              </span>
              {customer.phone && (
                <span className="flex items-center">
                  <Phone className="w-3 h-3 mr-1" />
                  {customer.phone}
                </span>
              )}
            </div>
          </div>
        </div>
      );
    },
    enableSorting: true,
  },
  {
    accessorKey: "customerTier",
    header: ({ column }) => (
      <SortableColumn column={column} title="Tier" />
    ),
    cell: ({ row }) => {
      const tier = row.getValue("customerTier") as string;
      return (
        <div className="flex items-center space-x-2">
          {getTierIcon(tier)}
          <Badge variant="outline" className={getTierColor(tier)}>
            {tier}
          </Badge>
        </div>
      );
    },
    enableSorting: true,
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <SortableColumn column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <div className="flex items-center space-x-2">
          {getStatusIcon(status)}
          <Badge variant="outline" className={getStatusColor(status)}>
            {status}
          </Badge>
        </div>
      );
    },
    enableSorting: true,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "totalOrders",
    header: ({ column }) => (
      <SortableColumn column={column} title="Orders" />
    ),
    cell: ({ row }) => {
      const orders = row.getValue("totalOrders") as number;
      const trend = orders > 10 ? "up" : orders < 5 ? "down" : "stable";
      const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : ShoppingBag;
      const trendColor = trend === "up" ? "text-green-600" : trend === "down" ? "text-red-600" : "text-gray-600";

      return (
        <div className="flex items-center space-x-2">
          <TrendIcon className={`w-4 h-4 ${trendColor}`} />
          <span className="text-sm font-medium">{orders.toLocaleString()}</span>
        </div>
      );
    },
    enableSorting: true,
  },
  {
    accessorKey: "totalSpent",
    header: ({ column }) => (
      <SortableColumn column={column} title="Total Spent" />
    ),
    cell: ({ row }) => {
      const amount = row.getValue("totalSpent") as number;
      return (
        <div className="flex items-center space-x-2">
          <DollarSign className="w-4 h-4 text-green-600" />
          <span className="text-sm font-medium">{formatCurrency(amount)}</span>
        </div>
      );
    },
    enableSorting: true,
  },
  {
    accessorKey: "averageOrderValue",
    header: ({ column }) => (
      <SortableColumn column={column} title="Avg Order" />
    ),
    cell: ({ row }) => {
      const avg = row.getValue("averageOrderValue") as number;
      return (
        <div className="flex items-center space-x-2">
          <Target className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium">{formatCurrency(avg)}</span>
        </div>
      );
    },
    enableSorting: true,
  },
  {
    accessorKey: "loyaltyPoints",
    header: ({ column }) => (
      <SortableColumn column={column} title="Points" />
    ),
    cell: ({ row }) => {
      const points = row.getValue("loyaltyPoints") as number;
      return (
        <div className="flex items-center space-x-2">
          <Star className="w-4 h-4 text-yellow-600" />
          <span className="text-sm font-medium">{points.toLocaleString()}</span>
        </div>
      );
    },
    enableSorting: true,
  },
  {
    accessorKey: "lastOrderDate",
    header: ({ column }) => (
      <SortableColumn column={column} title="Last Order" />
    ),
    cell: ({ row }) => {
      return <DateColumn row={row} accessorKey="lastOrderDate" />;
    },
    enableSorting: true,
  },
  {
    accessorKey: "joinedDate",
    header: ({ column }) => (
      <SortableColumn column={column} title="Joined" />
    ),
    cell: ({ row }) => {
      return <DateColumn row={row} accessorKey="joinedDate" />;
    },
    enableSorting: true,
  },
  {
    accessorKey: "lifetimeValue",
    header: ({ column }) => (
      <SortableColumn column={column} title="LTV" />
    ),
    cell: ({ row }) => {
      const ltv = row.getValue("lifetimeValue") as number;
      return (
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-4 h-4 text-purple-600" />
          <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
            {formatCurrency(ltv)}
          </span>
        </div>
      );
    },
    enableSorting: true,
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const customer = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Customer Actions</DropdownMenuLabel>
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
              <Mail className="mr-2 h-4 w-4" />
              Send Email
            </DropdownMenuItem>

            <DropdownMenuItem>
              <MessageSquare className="mr-2 h-4 w-4" />
              Add Note
            </DropdownMenuItem>

            <DropdownMenuItem>
              <ShoppingBag className="mr-2 h-4 w-4" />
              View Orders
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem>
              <Gift className="mr-2 h-4 w-4" />
              Reward Points
            </DropdownMenuItem>

            <DropdownMenuItem>
              <CreditCard className="mr-2 h-4 w-4" />
              Payment History
            </DropdownMenuItem>

            <DropdownMenuItem>
              <MapPin className="mr-2 h-4 w-4" />
              Addresses
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem>
              <Copy className="mr-2 h-4 w-4" />
              Copy Customer ID
            </DropdownMenuItem>

            <DropdownMenuItem>
              <ExternalLink className="mr-2 h-4 w-4" />
              Open in New Tab
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {customer.status === "Active" ? (
              <DropdownMenuItem className="text-orange-600">
                <Archive className="mr-2 h-4 w-4" />
                Deactivate
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem className="text-green-600">
                <CheckCircle className="mr-2 h-4 w-4" />
                Activate
              </DropdownMenuItem>
            )}

            <DropdownMenuItem className="text-red-600">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Customer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
