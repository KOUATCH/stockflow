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
  Activity,
  AlertTriangle,
  Archive,
  BarChart3,
  Copy,
  DollarSign,
  Edit,
  ExternalLink,
  Eye,
  MoreHorizontal,
  Package,
  Plus,
  Settings,
  ShoppingCart,
  Star,
  Tag,
  Trash2,
  TrendingDown,
  TrendingUp,
  Warehouse
} from "lucide-react";

export type EnhancedItem = {
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
    symbol: string;
  };
  inventoryLevels: Array<{
    id: string;
    quantityOnHand: number;
    reorderPoint?: number;
    quantityReserved?: number;
    quantityAvailable?: number;
    quantityInTransit?: number;
    quantityOnOrder?: number;
    totalValue?: number;
  }>;
  createdAt: Date;
  updatedAt: Date;
  isActive?: boolean;
  isDiscontinued?: boolean;
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

function getProfitMargin(cost: number, selling: number) {
  if (cost === 0) return 0;
  return ((selling - cost) / selling * 100);
}

function getProfitMarginStatus(margin: number) {
  if (margin < 10) {
    return { label: "Low Margin", color: "text-red-500", bgColor: "bg-red-100 dark:bg-red-900" };
  } else if (margin < 30) {
    return { label: "Good Margin", color: "text-yellow-600", bgColor: "bg-yellow-100 dark:bg-yellow-900" };
  } else {
    return { label: "High Margin", color: "text-green-600", bgColor: "bg-green-100 dark:bg-green-900" };
  }
}

export const enhancedItemsColumns: ColumnDef<EnhancedItem>[] = [
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
    header: ({ column }) => <SortableColumn column={column} title="Product Details" />,
    cell: ({ row }) => {
      const item = row.original;
      const imageUrl = item.thumbnail || (item.imageUrls && item.imageUrls[0]);

      return (
        <div className="flex items-center gap-3 min-w-[250px]">
          <div className="w-14 h-14 rounded-lg flex items-center justify-center shrink-0 overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={item.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  const parent = target.parentElement;
                  target.style.display = 'none';
                  if (parent) {
                    parent.innerHTML = '<svg class="w-7 h-7 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>';
                  }
                }}
              />
            ) : (
              <Package className="w-7 h-7 text-slate-600 dark:text-slate-400" />
            )}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-slate-900 dark:text-white truncate">
              {item.name}
            </p>
            {item.sku && (
              <div className="flex items-center gap-1 mt-0.5">
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
    filterFn: (row, id, value) => {
      const name = row.original.name?.toLowerCase() || "";
      const sku = row.original.sku?.toLowerCase() || "";
      const description = row.original.description?.toLowerCase() || "";
      const searchValue = value.toLowerCase();
      return name.includes(searchValue) || sku.includes(searchValue) || description.includes(searchValue);
    },
  },
  {
    accessorKey: "category.title",
    header: ({ column }) => <SortableColumn column={column} title="Category & Brand" />,
    cell: ({ row }) => {
      const item = row.original;
      return (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 flex items-center justify-center">
              <Tag className="w-3 h-3 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {item.category?.title || "Uncategorized"}
            </span>
          </div>
          {item.brand && (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800 flex items-center justify-center">
                <Star className="w-3 h-3 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {item.brand.brandName}
              </span>
            </div>
          )}
        </div>
      );
    },
    filterFn: (row, id, value) => {
      const category = row.original.category?.title?.toLowerCase() || "uncategorized";
      const brand = row.original.brand?.brandName?.toLowerCase() || "";
      const searchValue = value.toLowerCase();
      return category.includes(searchValue) || brand.includes(searchValue);
    },
  },
  {
    accessorKey: "inventoryLevels",
    id: "currentStock",
    header: ({ column }) => <SortableColumn column={column} title="Stock Level" />,
    cell: ({ row }) => {
      const item = row.original;
      const quantity = Number(item.inventoryLevels?.[0]?.quantityOnHand) || 0;
      const status = getStockStatus(quantity);
      const StatusIcon = status.icon;

      return (
        <div className="text-center space-y-2">
          <div className={`text-xl font-bold ${status.color}`}>
            {quantity}
            {item.unit && (
              <span className="text-xs text-slate-500 dark:text-slate-400 ml-1 font-normal">
                {item.unit.symbol || item.unit.name}
              </span>
            )}
          </div>
          <Badge variant={status.variant} className="flex items-center gap-1 w-fit mx-auto">
            <StatusIcon className="w-3 h-3" />
            {status.label}
          </Badge>
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
    id: "pricing",
    header: ({ column }) => <SortableColumn column={column} title="Pricing" />,
    cell: ({ row }) => {
      const item = row.original;
      const cost = Number(item.costPrice) || 0;
      const selling = Number(item.sellingPrice) || 0;

      return (
        <div className="text-right space-y-1">
          <div className="space-y-0.5">
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Cost: <span className="font-medium text-slate-700 dark:text-slate-300">{formatCurrency(cost)}</span>
            </div>
            <div className="text-sm font-semibold text-slate-900 dark:text-white">
              Sell: {formatCurrency(selling)}
            </div>
          </div>
        </div>
      );
    },
    sortingFn: (rowA, rowB) => {
      const sellingA = Number(rowA.original.sellingPrice) || 0;
      const sellingB = Number(rowB.original.sellingPrice) || 0;
      return sellingA - sellingB;
    },
  },
  {
    id: "profitMargin",
    header: ({ column }) => <SortableColumn column={column} title="Profit Margin" />,
    cell: ({ row }) => {
      const item = row.original;
      const cost = Number(item.costPrice) || 0;
      const selling = Number(item.sellingPrice) || 0;
      const margin = getProfitMargin(cost, selling);
      const status = getProfitMarginStatus(margin);

      return (
        <div className="text-center space-y-1">
          <div className={`text-lg font-bold ${status.color}`}>
            {margin.toFixed(1)}%
          </div>
          <div className={`text-xs px-2 py-1 rounded-full ${status.bgColor} ${status.color}`}>
            {status.label}
          </div>
        </div>
      );
    },
    sortingFn: (rowA, rowB) => {
      const marginA = getProfitMargin(Number(rowA.original.costPrice), Number(rowA.original.sellingPrice));
      const marginB = getProfitMargin(Number(rowB.original.costPrice), Number(rowB.original.sellingPrice));
      return marginA - marginB;
    },
  },
  {
    id: "stockValue",
    header: ({ column }) => <SortableColumn column={column} title="Stock Value" />,
    cell: ({ row }) => {
      const item = row.original;
      const quantity = Number(item.inventoryLevels?.[0]?.quantityOnHand) || 0;
      const cost = Number(item.costPrice) || 0;
      const selling = Number(item.sellingPrice) || 0;
      const costValue = quantity * cost;
      const sellingValue = quantity * selling;

      return (
        <div className="text-right space-y-1">
          <div className="space-y-0.5">
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Cost: <span className="font-medium">{formatCurrency(costValue)}</span>
            </div>
            <div className="text-sm font-semibold text-green-600 dark:text-green-400">
              Value: {formatCurrency(sellingValue)}
            </div>
          </div>
        </div>
      );
    },
    sortingFn: (rowA, rowB) => {
      const valueA = (Number(rowA.original.inventoryLevels?.[0]?.quantityOnHand) || 0) *
                     (Number(rowA.original.sellingPrice) || 0);
      const valueB = (Number(rowB.original.inventoryLevels?.[0]?.quantityOnHand) || 0) *
                     (Number(rowB.original.sellingPrice) || 0);
      return valueA - valueB;
    },
  },
  {
    id: "performance",
    header: ({ column }) => <SortableColumn column={column} title="Performance" />,
    cell: ({ row }) => {
      // Mock performance data
      const salesCount = Math.floor(Math.random() * 100);
      const trend = Math.random() > 0.5 ? "up" : "down";
      const rating = (Math.random() * 5).toFixed(1);

      return (
        <div className="text-center space-y-1">
          <div className="text-sm font-semibold text-slate-900 dark:text-white">
            {salesCount} sold
          </div>
          <div className={`flex items-center justify-center gap-1 text-xs ${
            trend === "up" ? "text-green-600" : "text-red-600"
          }`}>
            <TrendingUp className={`w-3 h-3 ${trend === "down" ? "rotate-180" : ""}`} />
            {Math.floor(Math.random() * 20)}%
          </div>
          <div className="flex items-center justify-center gap-0.5">
            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
            <span className="text-xs font-medium">{rating}</span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "updatedAt",
    header: ({ column }) => <SortableColumn column={column} title="Last Updated" />,
    cell: ({ row }) => {
      const date = row.getValue("updatedAt") as Date;
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - new Date(date).getTime());
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
      const item = row.original;
      const isActive = item.isActive !== false;
      const isDiscontinued = item.isDiscontinued === true;
      const isFeatured = Math.random() > 0.8; // Mock featured status

      return (
        <div className="flex flex-col gap-1">
          <Badge
            variant={isActive ? "default" : "destructive"}
            className={`flex items-center gap-1 w-fit text-xs ${
              isActive
                ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-700"
                : ""
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${isActive ? "bg-green-500" : "bg-red-500"}`}></div>
            {isActive ? "Active" : "Inactive"}
          </Badge>
          {isDiscontinued && (
            <Badge variant="secondary" className="flex items-center gap-1 w-fit text-xs bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400">
              <Archive className="w-3 h-3" />
              Discontinued
            </Badge>
          )}
          {isFeatured && (
            <Badge variant="outline" className="flex items-center gap-1 w-fit text-xs bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400">
              <Star className="w-3 h-3" />
              Featured
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const item = row.original;

      const handleCopyId = () => {
        navigator.clipboard.writeText(item.id);
      };

      const handleCopySKU = () => {
        navigator.clipboard.writeText(item.sku || item.id);
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
              Copy Item ID
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleCopySKU}>
              <Copy className="mr-2 h-4 w-4" />
              Copy SKU
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/inventory/items/${item.id}/others`} className="flex items-center w-full">
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/inventory/items/${item.id}/edit`} className="flex items-center w-full">
                <Edit className="mr-2 h-4 w-4" />
                Edit Item
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/inventory/items/${item.id}/adjust-stock`} className="flex items-center w-full">
                <Warehouse className="mr-2 h-4 w-4" />
                Adjust Stock
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/inventory/items/${item.id}/analytics`} className="flex items-center w-full">
                <BarChart3 className="mr-2 h-4 w-4" />
                View Analytics
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Plus className="mr-2 h-4 w-4" />
              Duplicate Item
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/app/purchases/orders`} className="flex items-center w-full">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Create Purchase Order
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/inventory/items/${item.id}/feature`} className="flex items-center w-full">
                <Star className="mr-2 h-4 w-4" />
                Feature Item
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/inventory/items/${item.id}/discontinue`} className="flex items-center w-full">
                <Archive className="mr-2 h-4 w-4" />
                Discontinue Item
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Item
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];