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
  Calculator,
  Calendar,
  Copy,
  Edit,
  ExternalLink,
  Eye,
  FileText,
  MoreHorizontal,
  Percent,
  Scale,
  Settings,
  Star,
  Tag,
  Trash2,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

export type EnhancedTaxRate = {
  id: string;
  taxRateName: string;
  rate: number;
  organizationId: string;
  createdAt: Date | string;
  updatedAt?: Date | string;
  isActive?: boolean;
  isDefault?: boolean;
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

function getTaxRateCategory(rate: number) {
  if (rate === 0) {
    return {
      label: "Tax Free",
      variant: "secondary" as const,
      icon: Scale,
      color: "text-gray-500"
    };
  } else if (rate <= 5) {
    return {
      label: "Low Rate",
      variant: "default" as const,
      icon: TrendingUp,
      color: "text-green-500"
    };
  } else if (rate <= 15) {
    return {
      label: "Standard Rate",
      variant: "outline" as const,
      icon: Calculator,
      color: "text-blue-500"
    };
  } else {
    return {
      label: "High Rate",
      variant: "destructive" as const,
      icon: TrendingUp,
      color: "text-red-500"
    };
  }
}

export const enhancedTaxRateColumns: ColumnDef<EnhancedTaxRate>[] = [
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
    accessorKey: "taxRateName",
    header: ({ column }) => <SortableColumn column={column} title="Tax Rate Details" />,
    cell: ({ row }) => {
      const taxRate = row.original;
      const isDefault = taxRate.isDefault;

      return (
        <div className="flex items-center gap-3 min-w-[200px]">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0 overflow-hidden bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800">
            <Percent className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-slate-900 dark:text-white truncate">
                {taxRate.taxRateName}
              </p>
              {isDefault && (
                <Badge variant="outline" className="flex items-center gap-1 text-xs bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400">
                  <Star className="w-3 h-3" />
                  Default
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-xs text-slate-500 dark:text-slate-400">Rate:</span>
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-xs font-mono text-slate-600 dark:text-slate-400">
                {Number(taxRate.rate).toFixed(4)}%
              </code>
            </div>
          </div>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      const name = row.original.taxRateName?.toLowerCase() || "";
      const rate = row.original.rate?.toString() || "";
      const searchValue = value.toLowerCase();
      return name.includes(searchValue) || rate.includes(searchValue);
    },
  },
  {
    accessorKey: "rate",
    header: ({ column }) => <SortableColumn column={column} title="Rate & Category" />,
    cell: ({ row }) => {
      const taxRate = row.original;
      const rate = Number(taxRate.rate) || 0;
      const category = getTaxRateCategory(rate);
      const CategoryIcon = category.icon;

      return (
        <div className="text-center space-y-2">
          <div className={`text-2xl font-bold ${category.color}`}>
            {rate.toFixed(2)}%
          </div>
          <Badge variant={category.variant} className="flex items-center gap-1 w-fit mx-auto">
            <CategoryIcon className="w-3 h-3" />
            {category.label}
          </Badge>
        </div>
      );
    },
    sortingFn: (rowA, rowB) => {
      const rateA = Number(rowA.original.rate) || 0;
      const rateB = Number(rowB.original.rate) || 0;
      return rateA - rateB;
    },
  },
  {
    id: "usage",
    header: ({ column }) => <SortableColumn column={column} title="Usage Stats" />,
    cell: ({ row }) => {
      // Mock usage data - in real app, this would come from actual usage tracking
      const itemsUsing = Math.floor(Math.random() * 50);
      const transactionsThisMonth = Math.floor(Math.random() * 200);
      const trend = Math.random() > 0.5 ? "up" : "down";

      return (
        <div className="text-center space-y-1">
          <div className="text-sm font-semibold text-slate-900 dark:text-white">
            {itemsUsing} items
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400">
            {transactionsThisMonth} transactions
          </div>
          <div className={`flex items-center justify-center gap-1 text-xs ${
            trend === "up" ? "text-green-600" : "text-red-600"
          }`}>
            <TrendingUp className={`w-3 h-3 ${trend === "down" ? "rotate-180" : ""}`} />
            {Math.floor(Math.random() * 20)}% this month
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => <SortableColumn column={column} title="Date Added" />,
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as Date;
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
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-3 h-3 text-slate-500 dark:text-slate-400" />
            <span className="font-medium text-slate-900 dark:text-white">
              {formatDate(date)}
            </span>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {timeAgo}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "updatedAt",
    header: ({ column }) => <SortableColumn column={column} title="Last Modified" />,
    cell: ({ row }) => {
      const updatedAt = row.getValue("updatedAt") as Date;
      const createdAt = row.original.createdAt;
      const updateDate = updatedAt || createdAt;

      if (!updateDate) {
        return <span className="text-xs text-slate-500 dark:text-slate-400">Never</span>;
      }

      return (
        <div className="text-sm">
          <div className="font-medium text-slate-900 dark:text-white">
            {formatDate(updateDate)}
          </div>
          {updatedAt && updatedAt !== createdAt && (
            <div className="text-xs text-amber-600 dark:text-amber-400">
              Modified
            </div>
          )}
        </div>
      );
    },
  },
  {
    id: "status",
    header: ({ column }) => <SortableColumn column={column} title="Status" />,
    cell: ({ row }) => {
      const taxRate = row.original;
      const isActive = taxRate.isActive !== false;
      const isDefault = taxRate.isDefault === true;

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
          {isDefault && (
            <Badge variant="outline" className="flex items-center gap-1 w-fit text-xs bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400">
              <Settings className="w-3 h-3" />
              System Default
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const taxRate = row.original;

      const handleCopyId = () => {
        navigator.clipboard.writeText(taxRate.id);
      };

      const handleCopyRate = () => {
        navigator.clipboard.writeText(`${taxRate.rate}%`);
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
              Copy Tax Rate ID
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleCopyRate}>
              <Copy className="mr-2 h-4 w-4" />
              Copy Rate Value
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/settings/tax-rates/${taxRate.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                View Usage Details
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/settings/tax-rates/${taxRate.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Tax Rate
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/settings/tax-rates/${taxRate.id}/calculate`}>
                <Calculator className="mr-2 h-4 w-4" />
                Calculate Impact
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/settings/tax-rates/${taxRate.id}/settings`}>
                <Settings className="mr-2 h-4 w-4" />
                Rate Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/settings/tax-rates/${taxRate.id}/export`}>
                <FileText className="mr-2 h-4 w-4" />
                Export Usage Report
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link
                href={`/dashboard/settings/tax-rates/${taxRate.id}/delete`}
                className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Tax Rate
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];