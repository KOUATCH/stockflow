"use client";

import { Column } from "@tanstack/react-table";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SortableColumnProps<TData> {
  column: Column<TData, unknown>;
  title: string;
  className?: string;
}

export function SortableColumn<TData>({
  column,
  title,
  className
}: SortableColumnProps<TData>) {
  const sortDirection = column.getIsSorted();

  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(sortDirection === "asc")}
      className={cn(
        "h-auto p-0 font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors",
        className
      )}
    >
      <span className="mr-2">{title}</span>
      {sortDirection === "asc" ? (
        <ArrowUp className="h-3 w-3" />
      ) : sortDirection === "desc" ? (
        <ArrowDown className="h-3 w-3" />
      ) : (
        <ArrowUpDown className="h-3 w-3 opacity-50" />
      )}
    </Button>
  );
}