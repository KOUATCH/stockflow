"use client";

import React from "react";
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
import Link from "next/link";
import {
  Archive,
  Calendar,
  CheckCircle,
  Clock,
  Copy,
  CreditCard,
  DollarSign,
  Download,
  Edit,
  Eye,
  FileText,
  Mail,
  MoreHorizontal,
  Package,
  PackageCheck,
  Phone,
  Plus,
  Printer,
  RefreshCw,
  Settings,
  Shield,
  Shipping,
  ShoppingCart,
  Star,
  TrendingUp,
  Trash2,
  Truck,
  User,
  Users,
  XCircle,
  MapPin,
  Building2,
  AlertTriangle
} from "lucide-react";

export type EnhancedPurchaseOrder = {
  id: string;
  orderNumber: string;
  supplierId: string;
  supplierName: string;
  supplierCode?: string | null;
  status: "draft" | "pending" | "approved" | "shipped" | "partially_received" | "received" | "cancelled";
  priority: "low" | "medium" | "high" | "urgent";
  orderDate: Date;
  expectedDeliveryDate?: Date | null;
  actualDeliveryDate?: Date | null;
  requestedBy: string;
  approvedBy?: string | null;
  totalAmount: number;
  subtotal: number;
  taxAmount: number;
  shippingCost?: number | null;
  discountAmount?: number | null;
  itemsCount: number;
  receivedItemsCount: number;
  reference?: string | null;
  notes?: string | null;
  paymentTerms?: string | null;
  shippingAddress?: string | null;
  trackingNumber?: string | null;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    items: number;
    receipts: number;
    invoices: number;
  };
};

const formatDate = (date: Date | null) => {
  if (!date) return "Not set";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
};

const formatShortDate = (date: Date | null) => {
  if (!date) return "Not set";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
};

const getOrderInitials = (orderNumber: string): string => {
  const parts = orderNumber.split('-');
  if (parts.length >= 2) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return orderNumber.substring(0, 2).toUpperCase();
}

const getOrderColor = (orderNumber: string): string => {
  const colors = [
    'from-blue-500 to-indigo-500',
    'from-green-500 to-emerald-500',
    'from-purple-500 to-violet-500',
    'from-orange-500 to-red-500',
    'from-teal-500 to-cyan-500',
    'from-pink-500 to-rose-500',
    'from-amber-500 to-yellow-500',
    'from-slate-500 to-gray-500'
  ];
  const index = orderNumber.length % colors.length;
  return colors[index];
};

const getStatusBadge = (status: string) => {
  const statusConfig = {
    draft: {
      color: "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700",
      icon: <Edit className="w-3 h-3" />
    },
    pending: {
      color: "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-300 dark:border-yellow-700",
      icon: <Clock className="w-3 h-3" />
    },
    approved: {
      color: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-700",
      icon: <CheckCircle className="w-3 h-3" />
    },
    shipped: {
      color: "bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900 dark:text-indigo-300 dark:border-indigo-700",
      icon: <Truck className="w-3 h-3" />
    },
    partially_received: {
      color: "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900 dark:text-orange-300 dark:border-orange-700",
      icon: <Package className="w-3 h-3" />
    },
    received: {
      color: "bg-green-100 text-green-700 border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-700",
      icon: <PackageCheck className="w-3 h-3" />
    },
    cancelled: {
      color: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900 dark:text-red-300 dark:border-red-700",
      icon: <XCircle className="w-3 h-3" />
    }
  };

  const config = statusConfig[status as keyof typeof statusConfig];

  return (
    <Badge
      variant="outline"
      className={`flex items-center gap-1 text-xs font-medium ${config?.color || statusConfig.draft.color}`}
    >
      {config?.icon || statusConfig.draft.icon}
      {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
    </Badge>
  );
};

const getPriorityBadge = (priority: string) => {
  const priorityConfig = {
    low: {
      color: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-700",
      icon: <TrendingUp className="w-3 h-3" />
    },
    medium: {
      color: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-700",
      icon: <TrendingUp className="w-3 h-3" />
    },
    high: {
      color: "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900 dark:text-orange-300 dark:border-orange-700",
      icon: <AlertTriangle className="w-3 h-3" />
    },
    urgent: {
      color: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900 dark:text-red-300 dark:border-red-700",
      icon: <AlertTriangle className="w-3 h-3" />
    }
  };

  const config = priorityConfig[priority as keyof typeof priorityConfig];

  return (
    <Badge
      variant="outline"
      className={`flex items-center gap-1 text-xs font-medium ${config?.color || priorityConfig.medium.color}`}
    >
      {config?.icon || priorityConfig.medium.icon}
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </Badge>
  );
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
};

const getDeliveryStatus = (expectedDate: Date | null, actualDate: Date | null, status: string) => {
  if (status === "cancelled") return null;
  if (actualDate) {
    const timeDiff = new Date(actualDate).getTime() - new Date(expectedDate || new Date()).getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (daysDiff <= 0) {
      return { label: "On Time", color: "text-green-600 dark:text-green-400", icon: CheckCircle };
    } else {
      return { label: `${daysDiff}d Late`, color: "text-red-600 dark:text-red-400", icon: XCircle };
    }
  }

  if (expectedDate && status !== "received") {
    const timeDiff = new Date(expectedDate).getTime() - new Date().getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (daysDiff < 0) {
      return { label: `${Math.abs(daysDiff)}d Overdue`, color: "text-red-600 dark:text-red-400", icon: AlertTriangle };
    } else if (daysDiff <= 3) {
      return { label: `Due in ${daysDiff}d`, color: "text-orange-600 dark:text-orange-400", icon: Clock };
    } else {
      return { label: `Due in ${daysDiff}d`, color: "text-blue-600 dark:text-blue-400", icon: Clock };
    }
  }

  return null;
};

export const enhancedPurchaseOrderColumns: ColumnDef<EnhancedPurchaseOrder>[] = [
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
    accessorKey: "orderNumber",
    header: ({ column }) => <SortableColumn column={column} title="Purchase Order" />,
    cell: ({ row }) => {
      const order = row.original;
      const initials = getOrderInitials(order.orderNumber);
      const gradientClass = getOrderColor(order.orderNumber);

      return (
        <div className="flex items-center gap-3 min-w-[250px]">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 bg-gradient-to-br ${gradientClass} shadow-md`}>
            <span className="text-white font-bold text-sm">{initials}</span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-slate-900 dark:text-white truncate">
                {order.orderNumber}
              </p>
              {getPriorityBadge(order.priority)}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              {order.reference && (
                <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-xs font-mono text-slate-600 dark:text-slate-400">
                  {order.reference}
                </code>
              )}
              <div className="flex items-center gap-1">
                <User className="w-3 h-3 text-slate-400" />
                <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {order.requestedBy}
                </span>
              </div>
            </div>
          </div>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      const orderNumber = row.original.orderNumber?.toLowerCase() || "";
      const reference = row.original.reference?.toLowerCase() || "";
      const requestedBy = row.original.requestedBy?.toLowerCase() || "";
      const searchValue = value.toLowerCase();
      return orderNumber.includes(searchValue) || reference.includes(searchValue) || requestedBy.includes(searchValue);
    },
  },
  {
    accessorKey: "supplierName",
    header: ({ column }) => <SortableColumn column={column} title="Supplier" />,
    cell: ({ row }) => {
      const order = row.original;

      return (
        <div className="space-y-1 min-w-[180px]">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-slate-400 flex-shrink-0" />
            <span className="font-medium text-slate-900 dark:text-white truncate">
              {order.supplierName}
            </span>
          </div>
          {order.supplierCode && (
            <div className="flex items-center gap-1">
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-xs font-mono text-slate-600 dark:text-slate-400">
                {order.supplierCode}
              </code>
            </div>
          )}
          {order.paymentTerms && (
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Terms: {order.paymentTerms}
            </div>
          )}
        </div>
      );
    },
    filterFn: (row, id, value) => {
      const supplierName = row.original.supplierName?.toLowerCase() || "";
      const supplierCode = row.original.supplierCode?.toLowerCase() || "";
      const searchValue = value.toLowerCase();
      return supplierName.includes(searchValue) || supplierCode.includes(searchValue);
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => <SortableColumn column={column} title="Status & Progress" />,
    cell: ({ row }) => {
      const order = row.original;
      const progress = order.receivedItemsCount / order.itemsCount;
      const progressPercentage = Math.round(progress * 100);

      return (
        <div className="space-y-2 min-w-[160px]">
          {getStatusBadge(order.status)}

          {order.status !== "draft" && order.status !== "cancelled" && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-400">Progress</span>
                <span className="font-medium text-slate-900 dark:text-white">{progressPercentage}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    progressPercentage === 100 ? "bg-green-500" :
                    progressPercentage > 50 ? "bg-blue-500" : "bg-orange-500"
                  }`}
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {order.receivedItemsCount} / {order.itemsCount} items received
              </div>
            </div>
          )}
        </div>
      );
    },
    filterFn: (row, id, value) => {
      const status = row.original.status?.toLowerCase() || "";
      const searchValue = value.toLowerCase();
      return status.includes(searchValue);
    },
  },
  {
    id: "delivery",
    header: ({ column }) => <SortableColumn column={column} title="Delivery Schedule" />,
    cell: ({ row }) => {
      const order = row.original;
      const deliveryStatus = getDeliveryStatus(order.expectedDeliveryDate, order.actualDeliveryDate, order.status);

      return (
        <div className="space-y-1 min-w-[150px]">
          {order.expectedDeliveryDate && (
            <div className="flex items-center gap-1 text-xs">
              <Calendar className="h-3 w-3 text-slate-400 flex-shrink-0" />
              <span className="text-slate-600 dark:text-slate-400">
                Expected: {formatShortDate(order.expectedDeliveryDate)}
              </span>
            </div>
          )}

          {order.actualDeliveryDate && (
            <div className="flex items-center gap-1 text-xs">
              <PackageCheck className="h-3 w-3 text-green-500 flex-shrink-0" />
              <span className="text-slate-600 dark:text-slate-400">
                Delivered: {formatShortDate(order.actualDeliveryDate)}
              </span>
            </div>
          )}

          {deliveryStatus && (
            <div className={`flex items-center gap-1 text-xs font-medium ${deliveryStatus.color}`}>
              <deliveryStatus.icon className="w-3 h-3" />
              {deliveryStatus.label}
            </div>
          )}

          {order.trackingNumber && (
            <div className="text-xs">
              <code className="px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded text-xs font-mono">
                {order.trackingNumber}
              </code>
            </div>
          )}
        </div>
      );
    },
    sortingFn: (rowA, rowB) => {
      const dateA = rowA.original.expectedDeliveryDate || new Date('9999-12-31');
      const dateB = rowB.original.expectedDeliveryDate || new Date('9999-12-31');
      return new Date(dateA).getTime() - new Date(dateB).getTime();
    },
  },
  {
    id: "financial",
    header: ({ column }) => <SortableColumn column={column} title="Financial Details" />,
    cell: ({ row }) => {
      const order = row.original;
      const hasDiscount = order.discountAmount && order.discountAmount > 0;
      const hasShipping = order.shippingCost && order.shippingCost > 0;

      return (
        <div className="text-right space-y-1 min-w-[140px]">
          <div className="font-semibold text-lg text-slate-900 dark:text-white">
            {formatCurrency(order.totalAmount)}
          </div>

          <div className="space-y-0.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 dark:text-slate-400">Subtotal:</span>
              <span className="text-slate-600 dark:text-slate-400">{formatCurrency(order.subtotal)}</span>
            </div>

            {order.taxAmount > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">Tax:</span>
                <span className="text-slate-600 dark:text-slate-400">{formatCurrency(order.taxAmount)}</span>
              </div>
            )}

            {hasShipping && (
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">Shipping:</span>
                <span className="text-slate-600 dark:text-slate-400">{formatCurrency(order.shippingCost!)}</span>
              </div>
            )}

            {hasDiscount && (
              <div className="flex justify-between items-center text-green-600 dark:text-green-400">
                <span>Discount:</span>
                <span>-{formatCurrency(order.discountAmount!)}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-1 pt-1">
            <Package className="w-3 h-3 text-slate-400" />
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {order.itemsCount} items
            </span>
          </div>
        </div>
      );
    },
    sortingFn: (rowA, rowB) => {
      return rowA.original.totalAmount - rowB.original.totalAmount;
    },
  },
  {
    accessorKey: "orderDate",
    header: ({ column }) => <SortableColumn column={column} title="Order Date" />,
    cell: ({ row }) => {
      const date = row.getValue("orderDate") as Date;
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - new Date(date).getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return (
        <div className="text-sm space-y-1 min-w-[140px]">
          <div className="flex items-center gap-1 font-medium text-slate-900 dark:text-white">
            <Calendar className="w-3 h-3 text-slate-400" />
            {formatShortDate(date)}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {diffDays === 0 ? "Today" : `${diffDays} days ago`}
          </div>
          {row.original.approvedBy && (
            <div className="flex items-center gap-1 text-xs">
              <CheckCircle className="w-3 h-3 text-green-500" />
              <span className="text-slate-500 dark:text-slate-400">
                by {row.original.approvedBy}
              </span>
            </div>
          )}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const order = row.original;

      const handleCopyId = () => {
        navigator.clipboard.writeText(order.id);
      };

      const handleCopyOrderNumber = () => {
        navigator.clipboard.writeText(order.orderNumber);
      };

      const handlePrintOrder = () => {
        window.open(`/dashboard/purchases/orders/${order.id}/invoice?print=true`, '_blank');
      };

      const handleDownloadPDF = () => {
        // This would typically trigger a PDF download
        console.log("Download PDF for order:", order.id);
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
          <DropdownMenuContent align="end" className="w-72">
            <DropdownMenuLabel className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
              Purchase Order Actions
            </DropdownMenuLabel>

            {/* Copy Actions */}
            <DropdownMenuItem onClick={handleCopyId}>
              <Copy className="mr-2 h-4 w-4" />
              Copy Order ID
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleCopyOrderNumber}>
              <Copy className="mr-2 h-4 w-4" />
              Copy Order Number
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* View Actions */}
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/purchases/orders/${order.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                View Order Details
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/purchases/orders/${order.id}/items`}>
                <Package className="mr-2 h-4 w-4" />
                View Order Items
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/purchases/orders/${order.id}/invoice`}>
                <FileText className="mr-2 h-4 w-4" />
                View Invoice
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/purchases/orders/${order.id}/track`}>
                <Truck className="mr-2 h-4 w-4" />
                Track Delivery
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* Management Actions */}
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/purchases/orders/${order.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Order
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/purchases/orders/${order.id}/duplicate`}>
                <Copy className="mr-2 h-4 w-4" />
                Duplicate Order
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/purchases/orders/${order.id}/receive-items`}>
                <PackageCheck className="mr-2 h-4 w-4" />
                Receive Items
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* Status Management */}
            {order.status === "draft" && (
              <DropdownMenuItem>
                <CheckCircle className="mr-2 h-4 w-4 text-blue-600" />
                Submit for Approval
              </DropdownMenuItem>
            )}
            {order.status === "pending" && (
              <DropdownMenuItem>
                <Shield className="mr-2 h-4 w-4 text-green-600" />
                Approve Order
              </DropdownMenuItem>
            )}
            {order.status === "approved" && (
              <DropdownMenuItem>
                <Shipping className="mr-2 h-4 w-4 text-indigo-600" />
                Mark as Shipped
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator />

            {/* Export Actions */}
            <DropdownMenuItem onClick={handlePrintOrder}>
              <Printer className="mr-2 h-4 w-4" />
              Print Order
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDownloadPDF}>
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Mail className="mr-2 h-4 w-4" />
              Email to Supplier
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* Advanced Actions */}
            <DropdownMenuItem>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Status
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Order Settings
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400">
              <Trash2 className="mr-2 h-4 w-4" />
              Cancel Order
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];