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
  AlertTriangle,
  Archive,
  Edit,
  Eye,
  MoreHorizontal,
  Package,
  Plus,
  TrendingDown,
  TrendingUp,
  Activity
} from "lucide-react";

export type StockItem = {
  id: string;
  name: string;
  description?: string;
  sku?: string;
  imageUrls?: string;
  thumbnail?: string;
  costPrice: number;
  sellingPrice: number;
  category?: {
    id: string;
    title: string;
  };
  brand?: {
    id: string;
    brandName: string;
  };
  unit?: {
    id: string;
    name: string;
    abbreviation: string;
  };
  inventoryLevels: Array<{
    id: string;
    quantityOnHand: number;
    reorderPoint: number;
    quantityReserved: number;
    quantityAvailable: number;
    quantityInTransit: number;
    quantityOnOrder: number;
    totalValue: number;
  }>;
  createdAt: Date;
  updatedAt: Date;
};

function getStockStatus(quantity: number) {
  if (quantity === 0) {
    return {
      label: "No Stock",
      variant: "destructive" as const,
      icon: AlertTriangle,
      color: "text-red-500"
    };
  } else if (quantity <= 10) {
    return {
      label: "Low Stock",
      variant: "secondary" as const,
      icon: TrendingDown,
      color: "text-amber-500"
    };
  } else if (quantity <= 50) {
    return {
      label: "Ave Stock",
      variant: "outline" as const,
      icon: Activity,
      color: "text-blue-500"
    };
  } else {
    return {
      label: "High Stock",
      variant: "default" as const,
      icon: TrendingUp,
      color: "text-green-500"
    };
  }
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(amount);
};

export const stockColumns: ColumnDef<StockItem>[] = [
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
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => <SortableColumn column={column} title="Item Name" />,
    cell: ({ row }) => {
      const item = row.original;
      return (
        <div className="flex items-center gap-3 min-w-[200px]">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0 overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600">
            {item.thumbnail || (item.imageUrls && item.imageUrls.length > 0) ? (
              <img
                src={item.thumbnail || item.imageUrls?.[0]}
                alt={item.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback to package icon if image fails to load
                  const target = e.target as HTMLImageElement;
                  const parent = target.parentElement;
                  target.style.display = 'none';
                  if (parent) {
                    parent.innerHTML = '<svg class="w-6 h-6 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>';
                  }
                }}
              />
            ) : (
              <Package className="w-6 h-6 text-slate-600 dark:text-slate-400" />
            )}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-slate-900 dark:text-white truncate">
              {item.name}
            </p>
            {item.sku && (
              <div className="flex items-center gap-1 mt-1">
                <span className="text-xs text-slate-500 dark:text-slate-400">SKU:</span>
                <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-xs font-mono text-slate-600 dark:text-slate-400">
                  {item.sku}
                </code>
              </div>
            )}
            {item.description && (
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-48 mt-1">
                {item.description}
              </p>
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "category.title",
    header: ({ column }) => <SortableColumn column={column} title="Category" />,
    cell: ({ row }) => {
      const category = row.original.category;
      return (
        <span className="text-sm text-slate-600 dark:text-slate-400">
          {category?.title || "Uncategorized"}
        </span>
      );
    },
    filterFn: (row, id, value) => {
      const category = row.original.category?.title?.toLowerCase() || "uncategorized";
      return category.includes(value.toLowerCase());
    },
  },
  {
    accessorKey: "inventoryLevels",
    id: "currentStock",
    header: ({ column }) => <SortableColumn column={column} title="Current Stock" />,
    cell: ({ row }) => {
      const item = row.original;
      const quantity = Number(item.inventoryLevels?.[0]?.quantityOnHand) || 0;
      const unit = item.unit;
      const status = getStockStatus(quantity);

      return (
        <div className="text-center">
          <div className={`text-lg font-semibold ${status.color} mb-1`}>
            {quantity}
            {unit && (
              <span className="text-xs text-slate-500 dark:text-slate-400 ml-1 font-normal">
                {unit.abbreviation || unit.name}
              </span>
            )}
          </div>
        </div>
      );
    },
    sortingFn: (rowA, rowB) => {
      const quantityA = Number(rowA.original.inventoryLevels?.[0]?.quantityOnHand) || 0;
      const quantityB = Number(rowB.original.inventoryLevels?.[0]?.quantityOnHand) || 0;
      return quantityA - quantityB;
    },
  },
  {
    accessorKey: "stockStatus",
    header: ({ column }) => <SortableColumn column={column} title="Status" />,
    cell: ({ row }) => {
      const item = row.original;
      const quantity = Number(item.inventoryLevels?.[0]?.quantityOnHand) || 0;
      const status = getStockStatus(quantity);
      const StatusIcon = status.icon;

      return (
        <Badge variant={status.variant} className="flex items-center gap-1 w-fit">
          <StatusIcon className="w-3 h-3" />
          {status.label}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      const quantity = Number(row.original.inventoryLevels?.[0]?.quantityOnHand) || 0;
      const status = getStockStatus(quantity);
      return status.label.toLowerCase().includes(value.toLowerCase());
    },
    sortingFn: (rowA, rowB) => {
      const quantityA = Number(rowA.original.inventoryLevels?.[0]?.quantityOnHand) || 0;
      const quantityB = Number(rowB.original.inventoryLevels?.[0]?.quantityOnHand) || 0;

      // Sort by stock level priority: out of stock, low stock, medium stock, high stock
      const getPriority = (qty: number) => {
        if (qty === 0) return 0; // Out of stock - highest priority
        if (qty <= 10) return 1; // Low stock
        if (qty <= 50) return 2; // Medium stock
        return 3; // High stock
      };

      return getPriority(quantityA) - getPriority(quantityB);
    },
  },
  {
    accessorKey: "costPrice",
    header: ({ column }) => <SortableColumn column={column} title="Unit Cost" />,
    cell: ({ row }) => {
      const cost = parseFloat(row.getValue("costPrice"));
      return (
        <div className="text-right font-medium">
          {formatCurrency(cost)}
        </div>
      );
    },
  },
  {
    accessorKey: "sellingPrice",
    header: ({ column }) => <SortableColumn column={column} title="Selling Price" />,
    cell: ({ row }) => {
      const price = parseFloat(row.getValue("sellingPrice"));
      return (
        <div className="text-right font-medium">
          {formatCurrency(price)}
        </div>
      );
    },
  },
  {
    id: "stockValue",
    header: ({ column }) => <SortableColumn column={column} title="Stock Value" />,
    cell: ({ row }) => {
      const item = row.original;
      const quantity = Number(item.inventoryLevels?.[0]?.quantityOnHand) || 0;
      const cost = Number(item.costPrice) || 0;
      const stockValue = quantity * cost;

      return (
        <div className="text-right font-semibold">
          {formatCurrency(stockValue)}
        </div>
      );
    },
    sortingFn: (rowA, rowB) => {
      const valueA = (Number(rowA.original.inventoryLevels?.[0]?.quantityOnHand) || 0) *
                     (Number(rowA.original.costPrice) || 0);
      const valueB = (Number(rowB.original.inventoryLevels?.[0]?.quantityOnHand) || 0) *
                     (Number(rowB.original.costPrice) || 0);
      return valueA - valueB;
    },
  },
  {
    accessorKey: "updatedAt",
    header: ({ column }) => <SortableColumn column={column} title="Last Updated" />,
    cell: ({ row }) => <DateColumn row={row} accessorKey="updatedAt" />,
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const item = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(item.sku || item.id)}
            >
              Copy SKU
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Eye className="mr-2 h-4 w-4" />
              View details
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Edit className="mr-2 h-4 w-4" />
              Edit item
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Plus className="mr-2 h-4 w-4" />
              Adjust stock
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">
              <Archive className="mr-2 h-4 w-4" />
              Archive item
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];