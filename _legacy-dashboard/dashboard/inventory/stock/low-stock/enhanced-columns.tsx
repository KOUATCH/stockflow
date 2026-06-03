"use client";

import { ColumnDef } from "@tanstack/react-table";
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
import { LowStockItem } from "@/actions/analytics/getLowStockItems";
import {
  AlertTriangle,
  AlertCircle,
  XCircle,
  CheckCircle2,
  MoreHorizontal,
  Plus,
  ShoppingCart,
  Package,
  Warehouse,
  Star,
  TrendingUp,
  Clock,
  DollarSign,
  Settings
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { SortableColumn } from "@/components/DataTableComponents/SortableColumn";

const getUrgencyConfig = (urgencyLevel: string) => {
  switch (urgencyLevel) {
    case 'critical':
      return {
        icon: <XCircle className="w-3 h-3" />,
        variant: "destructive" as const,
        label: "CRITICAL",
        color: "text-red-600 dark:text-red-400"
      };
    case 'warning':
      return {
        icon: <AlertCircle className="w-3 h-3" />,
        variant: "secondary" as const,
        label: "WARNING",
        color: "text-amber-600 dark:text-amber-400"
      };
    case 'low':
      return {
        icon: <AlertTriangle className="w-3 h-3" />,
        variant: "outline" as const,
        label: "LOW",
        color: "text-slate-600 dark:text-slate-400"
      };
    default:
      return {
        icon: <AlertTriangle className="w-3 h-3" />,
        variant: "outline" as const,
        label: "UNKNOWN",
        color: "text-slate-600 dark:text-slate-400"
      };
  }
};

export const lowStockColumns: ColumnDef<LowStockItem>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
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
    accessorKey: "name",
    id: "itemInfo",
    header: ({ column }) => <SortableColumn column={column} title="Product Information" />,
    cell: ({ row }) => {
      const item = row.original;
      const urgencyConfig = getUrgencyConfig(item.urgencyLevel);

      return (
        <div className="space-y-3">
          {/* Urgency Badge */}
          <div className="flex items-center gap-2">
            <Badge
              variant={urgencyConfig.variant}
              className="flex items-center gap-1.5 text-xs font-medium px-2 py-1"
            >
              {urgencyConfig.icon}
              {urgencyConfig.label}
            </Badge>
            {item.currentStock === 0 && (
              <Badge variant="destructive" className="text-xs px-2 py-1">
                OUT OF STOCK
              </Badge>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-gradient-to-br from-violet-100 to-violet-200 dark:from-violet-900 dark:to-violet-800 flex items-center justify-center">
                <Package className="w-3 h-3 text-violet-600 dark:text-violet-400" />
              </div>
              <Link
                href={`/dashboard/inventory/items/${item.id}/adjust-stock`}
                className="font-semibold text-slate-900 dark:text-white hover:text-violet-600 dark:hover:text-violet-400 transition-colors text-sm"
              >
                {item.name}
              </Link>
            </div>

            <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
              <div className="flex items-center gap-1">
                <span className="font-medium">SKU:</span>
                <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono">
                  {item.sku}
                </code>
              </div>
              {item.category && (
                <div className="flex items-center gap-1">
                  <span className="font-medium">Category:</span>
                  <Badge variant="outline" className="text-xs h-5">
                    {item.category.title}
                  </Badge>
                </div>
              )}
              {item.brand && (
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-amber-500" />
                  <span className="text-slate-600 dark:text-slate-400">{item.brand.brandName}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      const item = row.original;
      const searchValue = value.toLowerCase();
      return (
        item.name.toLowerCase().includes(searchValue) ||
        item.sku.toLowerCase().includes(searchValue) ||
        (item.category?.title?.toLowerCase().includes(searchValue) ?? false) ||
        (item.brand?.brandName?.toLowerCase().includes(searchValue) ?? false)
      );
    },
  },
  {
    accessorKey: "location",
    id: "location",
    header: ({ column }) => <SortableColumn column={column} title="Location" />,
    cell: ({ row }) => {
      const { location } = row.original;

      return (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900 dark:to-emerald-800 flex items-center justify-center">
            <Warehouse className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <div className="font-medium text-slate-900 dark:text-white text-sm">
              {location.name}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Warehouse Location
            </div>
          </div>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return row.original.location.name.toLowerCase().includes(value.toLowerCase());
    },
  },
  {
    accessorKey: "currentStock",
    id: "stockStatus",
    header: ({ column }) => <SortableColumn column={column} title="Stock Status" />,
    cell: ({ row }) => {
      const item = row.original;
      const stockPercentage = item.reorderPoint > 0
        ? (item.currentStock / item.reorderPoint) * 100
        : 0;

      const getStatusColor = () => {
        if (item.currentStock === 0) return "text-red-600 dark:text-red-400";
        if (stockPercentage <= 30) return "text-orange-600 dark:text-orange-400";
        if (stockPercentage <= 60) return "text-amber-600 dark:text-amber-400";
        return "text-emerald-600 dark:text-emerald-400";
      };

      return (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 flex items-center justify-center">
              <Package className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className={`text-lg font-bold ${getStatusColor()}`}>
                {item.currentStock.toLocaleString()}
                {item.unit && (
                  <span className="text-xs text-slate-500 ml-1 font-normal">
                    {item.unit.symbol}
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Current stock
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Reorder Point</span>
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {item.reorderPoint}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Min Level</span>
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {item.minStockLevel}
              </span>
            </div>
          </div>
        </div>
      );
    },
    sortingFn: (rowA, rowB) => {
      return rowA.original.currentStock - rowB.original.currentStock;
    },
  },
  {
    accessorKey: "stockDeficit",
    id: "deficit",
    header: ({ column }) => <SortableColumn column={column} title="Deficit Analysis" />,
    cell: ({ row }) => {
      const item = row.original;

      return (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900 dark:to-red-800 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <div className="text-lg font-bold text-red-600 dark:text-red-400">
                {item.stockDeficit.toLocaleString()}
                {item.unit && (
                  <span className="text-xs text-slate-500 ml-1 font-normal">
                    {item.unit.symbol}
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Units needed
              </div>
            </div>
          </div>

          {item.daysUntilOutOfStock && (
            <div className="flex items-center gap-1 text-xs">
              <Clock className="w-3 h-3 text-amber-500" />
              <span className="text-amber-600 dark:text-amber-400 font-medium">
                ~{item.daysUntilOutOfStock} days left
              </span>
            </div>
          )}
        </div>
      );
    },
    sortingFn: (rowA, rowB) => {
      return rowB.original.stockDeficit - rowA.original.stockDeficit;
    },
  },
  {
    accessorKey: "totalValue",
    id: "financialImpact",
    header: ({ column }) => <SortableColumn column={column} title="Financial Impact" />,
    cell: ({ row }) => {
      const item = row.original;
      const potentialLoss = item.stockDeficit * item.costPrice;

      return (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900 dark:to-green-800 flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <div className="text-sm font-semibold text-green-600 dark:text-green-400">
                ${item.totalValue.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Current value
              </div>
            </div>
          </div>

          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Cost/Unit</span>
              <span className="font-medium text-slate-700 dark:text-slate-300">
                ${item.costPrice.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Restock Cost</span>
              <span className="font-medium text-orange-600 dark:text-orange-400">
                ${potentialLoss.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </span>
            </div>
          </div>
        </div>
      );
    },
    sortingFn: (rowA, rowB) => {
      return rowB.original.totalValue - rowA.original.totalValue;
    },
  },
  {
    accessorKey: "lastTransactionAt",
    id: "lastActivity",
    header: ({ column }) => <SortableColumn column={column} title="Last Activity" />,
    cell: ({ row }) => {
      const item = row.original;

      return (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800 flex items-center justify-center">
              <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <div className="text-sm font-medium text-slate-900 dark:text-white">
                {item.lastTransactionAt
                  ? formatDistanceToNow(new Date(item.lastTransactionAt), { addSuffix: true })
                  : 'No recent activity'
                }
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Last transaction
              </div>
            </div>
          </div>
        </div>
      );
    },
    sortingFn: (rowA, rowB) => {
      const dateA = rowA.original.lastTransactionAt ? new Date(rowA.original.lastTransactionAt) : new Date(0);
      const dateB = rowB.original.lastTransactionAt ? new Date(rowB.original.lastTransactionAt) : new Date(0);
      return dateB.getTime() - dateA.getTime();
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const item = row.original;

      return (
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/inventory/items/${item.id}/adjust-stock`}>
            <Button size="sm" variant="outline" className="h-8 hover:bg-emerald-50 hover:border-emerald-300 dark:hover:bg-emerald-950">
              <Plus className="mr-1 h-3 w-3" />
              Adjust
            </Button>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-violet-50 dark:hover:bg-violet-950">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-semibold text-slate-700 dark:text-slate-300">
                Quick Actions
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              <Link href={`/dashboard/inventory/stock/low-stock/create-purchase-order?items=${item.id}&urgency=${item.urgencyLevel}`}>
                <DropdownMenuItem className="cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-950">
                  <ShoppingCart className="mr-2 h-4 w-4 text-emerald-600" />
                  <div>
                    <div className="font-medium">Create Purchase Order</div>
                    <div className="text-xs text-slate-500">Generate PO for this item</div>
                  </div>
                </DropdownMenuItem>
              </Link>

              <DropdownMenuSeparator />

              <Link href={`/dashboard/inventory/stock/low-stock/item-details/${item.id}`}>
                <DropdownMenuItem className="cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950">
                  <Package className="mr-2 h-4 w-4 text-blue-600" />
                  <div>
                    <div className="font-medium">View Item Details</div>
                    <div className="text-xs text-slate-500">Complete item information</div>
                  </div>
                </DropdownMenuItem>
              </Link>

              <Link href={`/dashboard/inventory/stock/low-stock/stock-history/${item.id}`}>
                <DropdownMenuItem className="cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-950">
                  <TrendingUp className="mr-2 h-4 w-4 text-purple-600" />
                  <div>
                    <div className="font-medium">View Stock History</div>
                    <div className="text-xs text-slate-500">Analytics & trends</div>
                  </div>
                </DropdownMenuItem>
              </Link>

              <DropdownMenuSeparator />

              <Link href={`/dashboard/inventory/items/${item.id}/edit`}>
                <DropdownMenuItem className="cursor-pointer hover:bg-orange-50 dark:hover:bg-orange-950">
                  <Settings className="mr-2 h-4 w-4 text-orange-600" />
                  <div>
                    <div className="font-medium">Edit Item Settings</div>
                    <div className="text-xs text-slate-500">Update reorder points</div>
                  </div>
                </DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
];
