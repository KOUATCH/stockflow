/**
 * Enhanced Table Pagination Component
 * Professional pagination with advanced navigation and analytics
 */

"use client"

import { Table } from "@tanstack/react-table"
import { useMemo } from "react"

// UI Components
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

// Icons
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
} from "lucide-react"

interface EnhancedTablePaginationProps<TData> {
  table: Table<TData>
  pageSizeOptions?: number[]
  showPageSizeSelector?: boolean
  showPageInfo?: boolean
  showQuickJump?: boolean
  compactMode?: boolean
}

export function EnhancedTablePagination<TData>({
  table,
  pageSizeOptions = [10, 20, 30, 40, 50, 100],
  showPageSizeSelector = true,
  showPageInfo = true,
  showQuickJump = true,
  compactMode = false,
}: EnhancedTablePaginationProps<TData>) {
  const pagination = table.getState().pagination
  const totalPages = table.getPageCount()
  const currentPage = pagination.pageIndex + 1
  const pageSize = pagination.pageSize
  const totalRows = table.getFilteredRowModel().rows.length

  // Calculate row range
  const startRow = pagination.pageIndex * pageSize + 1
  const endRow = Math.min(startRow + pageSize - 1, totalRows)

  // Generate page numbers for pagination
  const pageNumbers = useMemo(() => {
    const delta = 2
    const range = []
    const rangeWithDots = []

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i)
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, "...")
    } else {
      rangeWithDots.push(1)
    }

    rangeWithDots.push(...range)

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push("...", totalPages)
    } else {
      rangeWithDots.push(totalPages)
    }

    return rangeWithDots
  }, [currentPage, totalPages])

  const handlePageJump = (page: string) => {
    const pageNum = parseInt(page)
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      table.setPageIndex(pageNum - 1)
    }
  }

  if (compactMode) {
    return (
      <div className="flex items-center justify-between px-2 py-3 border-t bg-background/50">
        {/* Row count */}
        <div className="text-sm text-muted-foreground">
          {totalRows > 0 ? `${startRow}-${endRow} of ${totalRows}` : "No data"}
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="text-sm text-muted-foreground px-2">
            {currentPage} of {totalPages}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 px-4 py-4 border-t bg-background/50">
      {/* Main pagination controls */}
      <div className="flex items-center justify-between">
        {/* Left side - Row info and page size */}
        <div className="flex items-center gap-6">
          {showPageInfo && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Showing {totalRows > 0 ? `${startRow} to ${endRow}` : "0"} of{" "}
                <span className="font-medium text-foreground">{totalRows}</span> entries
              </span>
              {table.getFilteredRowModel().rows.length !== table.getCoreRowModel().rows.length && (
                <Badge variant="outline" className="text-xs">
                  (filtered from {table.getCoreRowModel().rows.length} total)
                </Badge>
              )}
            </div>
          )}

          {showPageSizeSelector && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Rows per page</span>
              <Select
                value={`${pageSize}`}
                onValueChange={(value) => table.setPageSize(Number(value))}
              >
                <SelectTrigger className="h-8 w-20">
                  <SelectValue placeholder={pageSize} />
                </SelectTrigger>
                <SelectContent side="top">
                  {pageSizeOptions.map((size) => (
                    <SelectItem key={size} value={`${size}`}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Right side - Navigation controls */}
        <div className="flex items-center gap-2">
          {/* Quick jump */}
          {showQuickJump && totalPages > 10 && (
            <div className="flex items-center gap-2 mr-4">
              <span className="text-sm text-muted-foreground">Go to page</span>
              <Input
                type="number"
                min={1}
                max={totalPages}
                className="h-8 w-16 text-center"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handlePageJump((e.target as HTMLInputElement).value)
                  }
                }}
              />
            </div>
          )}

          {/* First page */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="h-8 w-8 p-0"
            title="First page"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>

          {/* Previous page */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="h-8 w-8 p-0"
            title="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {/* Page numbers */}
          <div className="flex items-center gap-1">
            {pageNumbers.map((pageNumber, index) => {
              if (pageNumber === "...") {
                return (
                  <Button
                    key={`ellipsis-${index}`}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    disabled
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                )
              }

              const isCurrentPage = pageNumber === currentPage
              return (
                <Button
                  key={pageNumber}
                  variant={isCurrentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => table.setPageIndex((pageNumber as number) - 1)}
                  className="h-8 w-8 p-0"
                  aria-current={isCurrentPage ? "page" : undefined}
                >
                  {pageNumber}
                </Button>
              )
            })}
          </div>

          {/* Next page */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="h-8 w-8 p-0"
            title="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          {/* Last page */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(totalPages - 1)}
            disabled={!table.getCanNextPage()}
            className="h-8 w-8 p-0"
            title="Last page"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Additional info */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>Page {currentPage} of {totalPages}</span>
          {table.getSelectedRowModel().rows.length > 0 && (
            <span>
              {table.getSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s) selected
            </span>
          )}
        </div>

        <div className="flex items-center gap-4">
          {table.getState().columnFilters.length > 0 && (
            <span>{table.getState().columnFilters.length} filter(s) active</span>
          )}
          {table.getState().sorting.length > 0 && (
            <span>{table.getState().sorting.length} sort(s) active</span>
          )}
        </div>
      </div>
    </div>
  )
}