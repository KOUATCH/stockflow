"use client";

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from "@tanstack/react-table";
import * as React from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useState } from "react";

import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator } from "@radix-ui/react-dropdown-menu";
import { ListFilter } from "lucide-react";
import { Button } from "../ui/button";
import { DropdownMenuTrigger } from "../ui/dropdown-menu";
import { DataTablePagination } from "./DataTablePagination";
import { DataTableViewOptions } from "./DataTableViewOptions";
import DateFilters from "./DateFilters";
import DateRangeFilter from "./DateRangeFilter";
import SearchBar from "./SearchBar";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  model?: string;
  searchPlaceholder?: string;
  showToolbar?: boolean;
  variant?: "default" | "landing";
}
export default function DataTable<TData, TValue>({
  columns,
  data,
  searchPlaceholder = "",
  showToolbar = true,
  variant = "default",
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [searchResults, setSearchResults] = useState(data);
  const [filteredData, setFilteredData] = useState(data);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [isSearch, setIsSearch] = useState(true);
  const isLanding = variant === "landing";

  React.useEffect(() => {
    setSearchResults(data);
    setFilteredData(data);
    setIsSearch(true);
  }, [data]);

  // console.log(isSearch);
  const table = useReactTable({
    data: isSearch ? searchResults : filteredData,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });
  // console.log(searchResults);
  return (
    <div className={cn("w-full min-w-0", isLanding ? "dashboard-data-table space-y-3" : "coantainer")}>
      {/* <BigContainer> */}
      {showToolbar && (
        <div className={cn(
          "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
          isLanding && "rounded-lg border border-[var(--dash-border-subtle)] bg-[var(--dash-surface)]/70 p-3"
        )}>
          <div className="w-full min-w-0 flex-1">
            <SearchBar
              data={data}
              onSearch={setSearchResults}
              setIsSearch={setIsSearch}
              placeholder={searchPlaceholder}
              variant={variant}
            />
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <DateRangeFilter
              data={data}
              onFilter={setFilteredData}
              setIsSearch={setIsSearch}
            />
            <DateFilters
              data={data}
              onFilter={setFilteredData}
              setIsSearch={setIsSearch}
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn("h-8 gap-1", isLanding && "dashboard-button-secondary rounded-lg")}
                >
                  <ListFilter className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Filter
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem checked>
                  Active
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>Draft</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>Archived</DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DataTableViewOptions table={table} />
          </div>
        </div>
      )}

      <div className={cn("min-w-0 rounded-md border", isLanding && "dashboard-table-shell border-0")}>
        <div className="w-full overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className={cn(isLanding && "px-3")}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  className={cn(
                    isLanding
                      ? "hover:bg-[rgba(47,125,246,0.085)] data-[state=selected]:bg-[var(--dash-brand-soft)]"
                      : "hover:bg-indigo-400 rounded-lg"
                  )}
                  key={row.id}
                  data-state={row.getIsSelected() ? "selected" : undefined}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className={cn(isLanding && "px-3 py-3")}>
                      {cell.getIsAggregated()
                        ? flexRender(
                          cell.column.columnDef.aggregatedCell,
                          cell.getContext()
                        )
                        : flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className={cn("h-24 text-center", isLanding && "text-[var(--dash-text-soft)]")}
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>

          <TableFooter>
            {table.getFooterGroups().map((footerGroup) => {
              return (
                <TableRow key={footerGroup.id}>
                  {footerGroup.headers.map((footer) => {
                    return (
                      <TableHead key={footer.id} colSpan={footer.colSpan}>
                        {footer.isPlaceholder
                          ? null
                          : flexRender(
                            footer.column.columnDef.footer,
                            footer.getContext()
                          )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableFooter>
        </Table>
        </div>
      </div>
      <DataTablePagination table={table} />
    </div>
  );
}
