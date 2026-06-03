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
import deleteUnit from "@/actions/units/deleteUnit";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import {
  Archive,
  Copy,
  Edit,
  Eye,
  MoreHorizontal,
  Package,
  Ruler,
  Trash2,
  Hash
} from "lucide-react";

export type EnhancedUnit = {
  id: string;
  name: string;
  symbol: string;
  organizationId: string | null;
  createdAt: Date;
  updatedAt: Date;
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

export const enhancedUnitsColumns: ColumnDef<EnhancedUnit>[] = [
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
    header: ({ column }) => <SortableColumn column={column} title="Unit Name" />,
    cell: ({ row }) => {
      const unit = row.original;
      return (
        <div className="flex items-center gap-3 min-w-[180px]">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800">
            <Ruler className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-slate-900 dark:text-white truncate">
              {unit.name}
            </p>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-xs text-slate-500 dark:text-slate-400">Symbol:</span>
              <Badge variant="outline" className="text-xs px-1.5 py-0">
                {unit.symbol}
              </Badge>
            </div>
          </div>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      const name = row.original.name?.toLowerCase() || "";
      const symbol = row.original.symbol?.toLowerCase() || "";
      const searchValue = value.toLowerCase();
      return name.includes(searchValue) || symbol.includes(searchValue);
    },
  },
  {
    accessorKey: "symbol",
    header: ({ column }) => <SortableColumn column={column} title="Symbol" />,
    cell: ({ row }) => {
      const symbol = row.getValue("symbol") as string;
      return (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800 flex items-center justify-center">
            <Hash className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-sm font-mono font-semibold text-slate-800 dark:text-slate-200">
            {symbol}
          </code>
        </div>
      );
    },
  },
  {
    id: "usage",
    header: ({ column }) => <SortableColumn column={column} title="Usage" />,
    cell: ({ row }) => {
      // In a real app, you'd fetch this data or pass it as a prop
      const usageCount = Math.floor(Math.random() * 50); // Mock data
      const isPopular = usageCount > 25;

      return (
        <div className="text-center">
          <div className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
            {usageCount}
          </div>
          <Badge
            variant={isPopular ? "default" : "secondary"}
            className={`text-xs ${
              isPopular
                ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400"
            }`}
          >
            {isPopular ? "Popular" : "Standard"}
          </Badge>
        </div>
      );
    },
    sortingFn: (rowA, rowB) => {
      // Mock sorting logic - in real app, use actual usage data
      const usageA = Math.floor(Math.random() * 50);
      const usageB = Math.floor(Math.random() * 50);
      return usageA - usageB;
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
          <div className="font-medium text-slate-900 dark:text-white">
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
      // Mock status logic - in real app, this would be based on actual data
      const isActive = Math.random() > 0.1; // 90% chance of being active

      return (
        <Badge
          variant={isActive ? "default" : "destructive"}
          className={`flex items-center gap-1 w-fit ${
            isActive
              ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-700"
              : ""
          }`}
        >
          <div className={`w-2 h-2 rounded-full ${isActive ? "bg-green-500" : "bg-red-500"}`}></div>
          {isActive ? "Active" : "Inactive"}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      const isActive = Math.random() > 0.1;
      const status = isActive ? "active" : "inactive";
      return status.includes(value.toLowerCase());
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const unit = row.original;

      const handleDeleteUnit = async () => {
        try {
          const res = await deleteUnit(unit.id);
          if (res?.data?.id) {
            window.location.reload();
          }
        } catch (error) {
          console.error("Failed to delete unit:", error);
        }
      };

      const handleCopyId = () => {
        navigator.clipboard.writeText(unit.id);
        // In a real app, show a provider notification
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
              Copy Unit ID
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(unit.symbol)}>
              <Copy className="mr-2 h-4 w-4" />
              Copy Symbol
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/inventory/units/${unit.id}/details`}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/inventory/units/${unit.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Unit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/inventory/units/${unit.id}/items`}>
                <Package className="mr-2 h-4 w-4" />
                View Items Using Unit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Archive className="mr-2 h-4 w-4" />
              Archive Unit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleDeleteUnit}
              className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Unit
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];