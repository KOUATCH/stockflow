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
  Phone,
  Plus,
  RefreshCw,
  ShoppingCart,
  Star,
  Trash2,
  TrendingDown,
  TrendingUp,
  Truck,
  User,
  AlertCircle,
  XCircle,
  RotateCcw
} from "lucide-react";

export type EnhancedPurchaseOrder = {
  id: string;
  orderNumber: string;
  orderDate: Date;
  status: string;
  total: number;
  items: number;
  deliveryDate: Date | null;
  paymentStatus: string;
  supplierId: string;
  supplierName?: string;
  priority?: string;
  discount?: number;
  tax?: number;
  shippingCost?: number;
  notes?: string;
  createdBy?: string;
  updatedAt?: Date;
  expectedDelivery?: Date;
  actualDelivery?: Date;
  invoiceNumber?: string;
  paymentDueDate?: Date;
  deliveryAddress?: string;
  orderType?: string;
};

const formatDate = (date: Date | null) => {
  if (!date) return "N/A";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
};

const formatDateTime = (date: Date) => {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
};

const getOrderInitials = (orderNumber: string): string => {
  const parts = orderNumber.split('-');
  if (parts.length >= 2) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return orderNumber.substring(0, 2).toUpperCase();
};

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
    completed: {
      icon: CheckCircle,
      className: "bg-green-100 text-green-700 border-green-200 dark:bg-green-900 dark:text-green-300"
    },
    pending: {
      icon: Clock,
      className: "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-300"
    },
    cancelled: {
      icon: XCircle,
      className: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900 dark:text-red-300"
    },
    processing: {
      icon: RefreshCw,
      className: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900 dark:text-blue-300"
    },
    shipped: {
      icon: Truck,
      className: "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900 dark:text-purple-300"
    },
    draft: {
      icon: Edit,
      className: "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300"
    }
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  const IconComponent = config.icon;

  return (
    <Badge className={`flex items-center gap-1 text-xs font-medium ${config.className}`}>
      <IconComponent className="w-3 h-3" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

const getPaymentStatusBadge = (status: string) => {
  const statusConfig = {
    paid: {
      icon: CheckCircle,
      className: "bg-green-100 text-green-700 border-green-200 dark:bg-green-900 dark:text-green-300"
    },
    pending: {
      icon: Clock,
      className: "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900 dark:text-orange-300"
    },
    overdue: {
      icon: AlertCircle,
      className: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900 dark:text-red-300"
    },
    cancelled: {
      icon: XCircle,
      className: "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300"
    },
    partial: {
      icon: DollarSign,
      className: "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-300"
    }
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  const IconComponent = config.icon;

  return (
    <Badge className={`flex items-center gap-1 text-xs font-medium ${config.className}`}>
      <IconComponent className="w-3 h-3" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

const getPriorityBadge = (priority?: string) => {
  if (!priority) return null;

  const priorityConfig = {
    high: {
      className: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400"
    },
    medium: {
      className: "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400"
    },
    low: {
      className: "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400"
    },
    urgent: {
      className: "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400"
    }
  };

  const config = priorityConfig[priority as keyof typeof priorityConfig];
  if (!config) return null;

  return (
    <Badge variant="outline" className={`text-xs font-medium ${config.className}`}>
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </Badge>
  );
};

const getDeliveryStatus = (expectedDelivery?: Date, actualDelivery?: Date) => {
  if (actualDelivery) {
    const isOnTime = expectedDelivery && actualDelivery <= expectedDelivery;
    return {
      status: isOnTime ? "On Time" : "Late",
      color: isOnTime ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400",
      icon: isOnTime ? CheckCircle : AlertCircle
    };
  }

  if (expectedDelivery) {
    const isOverdue = new Date() > expectedDelivery;
    return {
      status: isOverdue ? "Overdue" : "Pending",
      color: isOverdue ? "text-red-600 dark:text-red-400" : "text-blue-600 dark:text-blue-400",
      icon: isOverdue ? AlertCircle : Clock
    };
  }

  return {
    status: "Unknown",
    color: "text-gray-400",
    icon: Clock
  };
};

export const enhancedPurchaseHistoryColumns: ColumnDef<EnhancedPurchaseOrder>[] = [
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
    header: ({ column }) => <SortableColumn column={column} title="Order Details" />,
    cell: ({ row }) => {
      const order = row.original;
      const initials = getOrderInitials(order.orderNumber);
      const gradientClass = getOrderColor(order.orderNumber);

      return (
        <div className="flex items-center gap-3 min-w-[220px]">
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
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" />
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {formatDate(order.orderDate)}
                </span>
              </div>
              {order.invoiceNumber && (
                <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-xs font-mono text-slate-600 dark:text-slate-400">
                  {order.invoiceNumber}
                </code>
              )}
            </div>
          </div>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      const orderNumber = row.original.orderNumber?.toLowerCase() || "";
      const invoiceNumber = row.original.invoiceNumber?.toLowerCase() || "";
      const searchValue = value.toLowerCase();
      return orderNumber.includes(searchValue) || invoiceNumber.includes(searchValue);
    },
  },
  {
    id: "status",
    header: ({ column }) => <SortableColumn column={column} title="Status" />,
    cell: ({ row }) => {
      const order = row.original;

      return (
        <div className="flex flex-col gap-1 min-w-[140px]">
          {getStatusBadge(order.status)}
          {getPaymentStatusBadge(order.paymentStatus)}
        </div>
      );
    },
    filterFn: (row, id, value) => {
      const status = row.original.status?.toLowerCase() || "";
      const paymentStatus = row.original.paymentStatus?.toLowerCase() || "";
      const searchValue = value.toLowerCase();
      return status.includes(searchValue) || paymentStatus.includes(searchValue);
    },
  },
  {
    id: "items",
    header: ({ column }) => <SortableColumn column={column} title="Items & Quantity" />,
    cell: ({ row }) => {
      const order = row.original;

      return (
        <div className="text-center space-y-1">
          <div className="flex items-center justify-center gap-2">
            <Package className="w-4 h-4 text-blue-500" />
            <span className="font-semibold text-slate-900 dark:text-white">
              {order.items} Items
            </span>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Order #{order.id.slice(-6)}
          </div>
        </div>
      );
    },
    sortingFn: (rowA, rowB) => {
      return rowA.original.items - rowB.original.items;
    },
  },
  {
    id: "financials",
    header: ({ column }) => <SortableColumn column={column} title="Financial Details" />,
    cell: ({ row }) => {
      const order = row.original;
      const subtotal = order.total - (order.tax || 0) - (order.shippingCost || 0) + (order.discount || 0);
      const hasDiscount = order.discount && order.discount > 0;

      return (
        <div className="text-right space-y-1 min-w-[160px]">
          <div className="font-bold text-lg text-slate-900 dark:text-white">
            {formatCurrency(order.total)}
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400">
            Subtotal: {formatCurrency(subtotal)}
          </div>
          <div className="flex justify-end gap-2 text-xs">
            {order.tax && order.tax > 0 && (
              <span className="text-orange-600 dark:text-orange-400">
                Tax: {formatCurrency(order.tax)}
              </span>
            )}
            {hasDiscount && (
              <span className="text-green-600 dark:text-green-400">
                Disc: -{formatCurrency(order.discount)}
              </span>
            )}
          </div>
          {order.shippingCost && order.shippingCost > 0 && (
            <div className="text-xs text-slate-500 dark:text-slate-500">
              Shipping: {formatCurrency(order.shippingCost)}
            </div>
          )}
        </div>
      );
    },
    sortingFn: (rowA, rowB) => {
      return rowA.original.total - rowB.original.total;
    },
  },
  {
    id: "delivery",
    header: ({ column }) => <SortableColumn column={column} title="Delivery Status" />,
    cell: ({ row }) => {
      const order = row.original;
      const deliveryInfo = getDeliveryStatus(order.expectedDelivery, order.actualDelivery);
      const IconComponent = deliveryInfo.icon;

      return (
        <div className="space-y-1 min-w-[140px]">
          <div className={`flex items-center gap-1 text-sm font-medium ${deliveryInfo.color}`}>
            <IconComponent className="w-4 h-4" />
            {deliveryInfo.status}
          </div>
          {order.expectedDelivery && (
            <div className="text-xs text-slate-600 dark:text-slate-400">
              Expected: {formatDate(order.expectedDelivery)}
            </div>
          )}
          {order.actualDelivery && (
            <div className="text-xs text-slate-600 dark:text-slate-400">
              Delivered: {formatDate(order.actualDelivery)}
            </div>
          )}
          {!order.expectedDelivery && !order.actualDelivery && (
            <div className="text-xs text-slate-400">
              No delivery date set
            </div>
          )}
        </div>
      );
    },
  },
  {
    id: "payment",
    header: ({ column }) => <SortableColumn column={column} title="Payment Info" />,
    cell: ({ row }) => {
      const order = row.original;
      const isOverdue = order.paymentDueDate && new Date() > order.paymentDueDate && order.paymentStatus !== 'paid';

      return (
        <div className="space-y-1 min-w-[140px]">
          <div className="flex items-center gap-1">
            <CreditCard className="w-3 h-3 text-slate-400" />
            <span className="text-xs text-slate-600 dark:text-slate-400">
              {order.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
            </span>
          </div>
          {order.paymentDueDate && (
            <div className={`text-xs ${isOverdue ? 'text-red-600 dark:text-red-400 font-medium' : 'text-slate-500 dark:text-slate-500'}`}>
              Due: {formatDate(order.paymentDueDate)}
            </div>
          )}
          {order.paymentStatus === 'paid' && (
            <div className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-green-500" />
              <span className="text-xs text-green-600 dark:text-green-400">
                Completed
              </span>
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "updatedAt",
    header: ({ column }) => <SortableColumn column={column} title="Last Updated" />,
    cell: ({ row }) => {
      const date = row.original.updatedAt || row.original.orderDate;
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - new Date(date).getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return (
        <div className="text-sm">
          <div className="flex items-center gap-1 font-medium text-slate-900 dark:text-white">
            <Clock className="w-3 h-3 text-slate-400" />
            {formatDate(date)}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {diffDays === 0 ? "Today" : `${diffDays} days ago`}
          </div>
          {row.original.createdBy && (
            <div className="text-xs text-slate-400">
              by {row.original.createdBy}
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

      const handleCopyOrderNumber = () => {
        navigator.clipboard.writeText(order.orderNumber);
      };

      const handleCopyId = () => {
        navigator.clipboard.writeText(order.id);
      };

      const handleCopyInvoice = () => {
        if (order.invoiceNumber) {
          navigator.clipboard.writeText(order.invoiceNumber);
        }
      };

      const handleDeleteOrder = async () => {
        try {
          console.log("Delete order:", order.id);
        } catch (error) {
          console.error("Failed to delete order:", error);
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
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
              Actions
            </DropdownMenuLabel>

            {/* Copy Actions */}
            <DropdownMenuItem onClick={handleCopyOrderNumber}>
              <Copy className="mr-2 h-4 w-4" />
              Copy Order Number
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleCopyId}>
              <Copy className="mr-2 h-4 w-4" />
              Copy Order ID
            </DropdownMenuItem>
            {order.invoiceNumber && (
              <DropdownMenuItem onClick={handleCopyInvoice}>
                <Copy className="mr-2 h-4 w-4" />
                Copy Invoice Number
              </DropdownMenuItem>
            )}

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
                View Items
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
            <DropdownMenuItem onClick={() => {
              // Handle duplicate order
              console.log("Duplicating order:", order.id);
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Duplicate Order
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {
              // Handle status update
              console.log("Updating status for order:", order.id);
            }}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Update Status
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* Export Actions */}
            <DropdownMenuItem onClick={() => {
              // Handle invoice download
              console.log("Downloading invoice for order:", order.id);
              window.open(`/api/orders/${order.id}/invoice/download`, '_blank');
            }}>
              <Download className="mr-2 h-4 w-4" />
              Download Invoice
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {
              // Handle PDF export
              console.log("Exporting PDF for order:", order.id);
              window.open(`/api/orders/${order.id}/pdf`, '_blank');
            }}>
              <Download className="mr-2 h-4 w-4" />
              Export Order PDF
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* Status Actions */}
            {order.status !== 'completed' && (
              <DropdownMenuItem>
                <CheckCircle className="mr-2 h-4 w-4" />
                Mark as Completed
              </DropdownMenuItem>
            )}
            {order.status !== 'cancelled' && (
              <DropdownMenuItem>
                <XCircle className="mr-2 h-4 w-4" />
                Cancel Order
              </DropdownMenuItem>
            )}
            {order.status === 'cancelled' && (
              <DropdownMenuItem>
                <RotateCcw className="mr-2 h-4 w-4" />
                Restore Order
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator />

            {/* Communication */}
            <DropdownMenuItem>
              <Mail className="mr-2 h-4 w-4" />
              Email Supplier
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Phone className="mr-2 h-4 w-4" />
              Call Supplier
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={handleDeleteOrder}
              className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Order
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];