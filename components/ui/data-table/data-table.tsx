// components/ui/data-table/data-table.tsx
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateFilterOption, DateRange } from "@/components/ui/date-filter";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import RowsPerPage from "@/components/ui/rows-per-page";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import clsx from "clsx";
import {
  Activity,
  BarChart3,
  Database,
  FileSpreadsheet,
  Filter,
  Layers,
  Plus,
  RefreshCw,
  TrendingUp
} from "lucide-react";
import { ReactNode, useEffect, useState } from "react";
import FilterBar from "./filter-bar";

export interface Column<T> {
  header: string;
  accessorKey: keyof T | ((row: T) => any);
  cell?: (row: T) => ReactNode;
}

interface DataTableProps<T> {
  title: string;
  subtitle?: string;
  data: T[];
  columns: Column<T>[];
  keyField: keyof T;
  isLoading?: boolean;
  onRefresh?: () => void;
  actions?: {
    onAdd?: () => void;
    onEdit?: (item: T) => void;
    onDelete?: (item: T) => void;
    onExport?: (filteredData: T[]) => void;
  };
  filters?: {
    searchFields?: (keyof T)[];
    enableDateFilter?: boolean;
    getItemDate?: (item: T) => Date | string;
    additionalFilters?: ReactNode;
  };
  renderRowActions?: (item: T) => ReactNode;
  emptyState?: ReactNode;
}

export default function DataTable<T>({
  title,
  subtitle,
  data,
  columns,
  keyField,
  isLoading = false,
  onRefresh,
  actions,
  filters,
  renderRowActions,
  emptyState,
}: DataTableProps<T>) {
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<{
    range: DateRange | null;
    option: DateFilterOption;
  }>({
    range: null,
    option: "lifetime",
  });

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, dateFilter, itemsPerPage]);

  // Apply search filter
  const applySearchFilter = (items: T[]): T[] => {
    if (!searchQuery.trim() || !filters?.searchFields?.length) return items;

    const query = searchQuery.toLowerCase();
    return items.filter((item) => {
      return filters.searchFields!.some((field) => {
        const value = item[field];
        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(query);
      });
    });
  };

  // Apply date filter
  const applyDateFilter = (items: T[]): T[] => {
    if (
      !dateFilter.range?.from ||
      !dateFilter.range?.to ||
      !filters?.getItemDate
    ) {
      return items;
    }

    const from = new Date(dateFilter.range.from);
    const to = new Date(dateFilter.range.to);

    return items.filter((item) => {
      const itemDate = filters.getItemDate ? new Date(filters.getItemDate(item)) : null;
      return itemDate !== null && itemDate >= from && itemDate <= to;
    });
  };

  // Apply all filters
  const filteredData = applyDateFilter(applySearchFilter(data));

  // Calculate pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  // Handle page change
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push("ellipsis");
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(1);
        pageNumbers.push("ellipsis");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        pageNumbers.push(1);
        pageNumbers.push("ellipsis");
        pageNumbers.push(currentPage - 1);
        pageNumbers.push(currentPage);
        pageNumbers.push(currentPage + 1);
        pageNumbers.push("ellipsis");
        pageNumbers.push(totalPages);
      }
    }

    return pageNumbers;
  };

  // Get value from accessorKey
  const getCellValue = (item: T, accessor: keyof T | ((row: T) => any)) => {
    if (typeof accessor === "function") {
      return accessor(item);
    }
    return item[accessor];
  };

  const hasActiveFilters = searchQuery.trim() !== "" || dateFilter.option !== "lifetime";

  return (
    <div className="w-full space-y-6">
      {/* Enhanced Header Card */}
      <Card className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-blue-200 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl shadow-lg">
                <Database className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  {title}
                  <Badge variant="outline" className="bg-white/80 text-blue-700 border-blue-200">
                    <Activity className="w-3 h-3 mr-1" />
                    Live Data
                  </Badge>
                </CardTitle>
                {subtitle && (
                  <p className="text-gray-600 mt-1 flex items-center gap-2">
                    {subtitle}
                  </p>
                )}
                <div className="flex items-center gap-4 mt-2">
                  <Badge variant="secondary" className="flex items-center gap-1 bg-blue-100 text-blue-700">
                    <BarChart3 className="w-3 h-3" />
                    {filteredData.length} {filteredData.length === 1 ? "record" : "records"}
                  </Badge>
                  {hasActiveFilters && (
                    <Badge variant="outline" className="flex items-center gap-1 bg-orange-50 text-orange-700 border-orange-200">
                      <Filter className="w-3 h-3" />
                      Filtered
                    </Badge>
                  )}
                  {isLoading && (
                    <Badge variant="outline" className="flex items-center gap-1 bg-yellow-50 text-yellow-700 border-yellow-200">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                      Updating...
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {onRefresh && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRefresh}
                  disabled={isLoading}
                  className="flex items-center gap-2 bg-white/80 hover:bg-white border-blue-200 hover:border-blue-300"
                  title="Refresh data"
                >
                  <RefreshCw className={clsx("h-4 w-4", isLoading && "animate-spin")} />
                  Refresh
                </Button>
              )}
              {actions?.onExport && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => actions.onExport?.(filteredData)}
                  className="flex items-center gap-2 bg-white/80 hover:bg-white border-blue-200 hover:border-blue-300"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  Export
                </Button>
              )}
              {actions?.onAdd && (
                <Button
                  size="sm"
                  onClick={actions.onAdd}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Plus className="h-4 w-4" />
                  Add New
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Data Card */}
      <Card className="bg-white/95 backdrop-blur-sm border-gray-200 shadow-xl overflow-hidden">
        <CardContent className="p-0">
          {/* Enhanced Filter Bar */}
          {filters && (
            <div className="bg-gradient-to-r from-gray-50 to-blue-50/30 border-b border-gray-200 p-4">
              <FilterBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                showDateFilter={filters.enableDateFilter}
                dateFilter={dateFilter}
                onDateFilterChange={(range, option) =>
                  setDateFilter({ range, option })
                }
                additionalFilters={filters.additionalFilters}
                onExport={
                  actions?.onExport
                    ? () => actions.onExport?.(filteredData)
                    : undefined
                }
              />
            </div>
          )}

          {/* Enhanced Table */}
          <div className="relative overflow-hidden">
            {isLoading && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-6 h-6 border-2 border-blue-200 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 w-6 h-6 border-2 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
                  </div>
                  <span className="text-sm text-gray-600 font-medium">Loading data...</span>
                </div>
              </div>
            )}

            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-gray-50 to-blue-50/20 border-b border-gray-200">
                  {columns.map((column, index) => (
                    <TableHead key={index} className="font-semibold text-gray-700 py-4">
                      {column.header}
                    </TableHead>
                  ))}
                  {renderRowActions && (
                    <TableHead className="text-right font-semibold text-gray-700 py-4">
                      Actions
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.length > 0 ? (
                  currentItems.map((item, rowIndex) => (
                    <TableRow
                      key={String(item[keyField])}
                      className={clsx(
                        "border-b border-gray-100 hover:bg-gradient-to-r hover:from-blue-50/30 hover:to-indigo-50/30 transition-all duration-200",
                        rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                      )}
                    >
                      {columns.map((column, index) => (
                        <TableCell key={index} className="py-4 text-gray-900">
                          {column.cell
                            ? column.cell(item)
                            : getCellValue(item, column.accessorKey)}
                        </TableCell>
                      ))}
                      {renderRowActions && (
                        <TableCell className="text-right py-4">
                          {renderRowActions(item)}
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length + (renderRowActions ? 1 : 0)}
                      className="text-center py-12"
                    >
                      {emptyState || (
                        <div className="flex flex-col items-center gap-4 text-gray-500">
                          <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                            <Layers className="w-8 h-8 text-gray-400" />
                          </div>
                          <div className="text-center">
                            <p className="font-medium text-gray-900 mb-1">
                              {hasActiveFilters
                                ? "No matching records found"
                                : "No data available"
                              }
                            </p>
                            <p className="text-sm text-gray-500">
                              {hasActiveFilters
                                ? "Try adjusting your search or filter criteria"
                                : "Get started by adding your first record"
                              }
                            </p>
                          </div>
                          {!hasActiveFilters && actions?.onAdd && (
                            <Button
                              onClick={actions.onAdd}
                              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Add First Record
                            </Button>
                          )}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Enhanced Pagination */}
          {filteredData.length > 0 && (
            <div className="bg-gradient-to-r from-gray-50 to-blue-50/30 border-t border-gray-200 p-4">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                  <RowsPerPage
                    value={itemsPerPage}
                    onChange={setItemsPerPage}
                    options={[5, 10, 25, 50, 100]}
                  />
                  <div className="text-sm text-gray-600 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-500" />
                    <span>
                      Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredData.length)} of{" "}
                      <span className="font-semibold text-gray-900">{filteredData.length}</span>
                    </span>
                  </div>
                </div>

                {totalPages > 1 && (
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                          className={clsx(
                            currentPage === 1
                              ? "pointer-events-none opacity-50"
                              : "cursor-pointer hover:bg-blue-50"
                          )}
                        />
                      </PaginationItem>

                      {getPageNumbers().map((page, index) =>
                        page === "ellipsis" ? (
                          <PaginationItem key={`ellipsis-${index}`}>
                            <PaginationEllipsis />
                          </PaginationItem>
                        ) : (
                          <PaginationItem key={`page-${page}`}>
                            <PaginationLink
                              onClick={() => handlePageChange(page as number)}
                              className={clsx(
                                "cursor-pointer transition-all duration-200",
                                currentPage === page
                                  ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600"
                                  : "hover:bg-blue-50"
                              )}
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        )
                      )}

                      <PaginationItem>
                        <PaginationNext
                          onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                          className={clsx(
                            currentPage === totalPages
                              ? "pointer-events-none opacity-50"
                              : "cursor-pointer hover:bg-blue-50"
                          )}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}