/**
 * Enhanced Data Table Component
 * Professional, feature-rich data table with modern design and enterprise capabilities
 */

"use client"

import {
  ColumnDef,
  ColumnFiltersState,
  Row,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { memo, useCallback, useEffect, useMemo, useState } from "react"
import { cn } from "@/lib/utils"

// UI Components
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Checkbox } from "@/components/ui/checkbox"

// Icons
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  MoreHorizontal,
  Eye,
  EyeOff,
  Download,
  Upload,
  RefreshCw,
  Filter,
  Search,
  X,
  AlertCircle,
  Package,
} from "lucide-react"

// Local Components
import { EnhancedDataTableProps, TableConfig, RowState } from "./types"
import { EnhancedTableToolbar } from "./table-toolbar"
import { EnhancedTablePagination } from "./table-pagination"
import { EnhancedTableFilters } from "./table-filters"
import { TableColumnVisibility } from "./table-column-visibility"
import { TableEmptyState } from "./table-empty-state"
import { TableLoadingState } from "./table-loading-state"
import { TableErrorState } from "./table-error-state"

// Default configuration
const DEFAULT_CONFIG: TableConfig = {
  searchable: true,
  sortable: true,
  filterable: true,
  exportable: true,
  selectable: true,
  paginated: true,
  resizable: false,
  virtualizeRows: false,
  showRowNumbers: false,
  showFooter: false,
  stickyHeader: true,
  compactMode: false,
  striped: true,
  bordered: false,
  hoverable: true,
}

export function EnhancedDataTable<TData>({
  data = [],
  columns,
  config = DEFAULT_CONFIG,
  toolbar,
  theme = { variant: 'modern', size: 'md' },
  loading = false,
  error = null,
  onRowClick,
  onRowDoubleClick,
  onSelectionChange,
  onSortingChange,
  onFiltersChange,
  onPaginationChange,
  loadingConfig = { enabled: true, skeletonRows: 5 },
  errorConfig = { enabled: true, retryEnabled: true },
  emptyStateConfig = { enabled: true },
  virtualizationEnabled = false,
  persistFilters = true,
  persistSorting = true,
  persistColumnVisibility = true,
  globalFilterEnabled = true,
  customToolbar,
  customPagination,
  customFooter,
  ariaLabel = "Enhanced data table",
  ariaDescription,
}: EnhancedDataTableProps<TData>) {
  // Table state
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState("")

  // Enhanced configuration
  const tableConfig = useMemo(() => ({ ...DEFAULT_CONFIG, ...config }), [config])
  const tableColumns = columns as ColumnDef<TData, any>[]

  // Table instance
  const table = useReactTable({
    data,
    columns: tableColumns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter: globalFilterEnabled ? globalFilter : undefined,
    },
    enableRowSelection: tableConfig.selectable,
    enableSorting: tableConfig.sortable,
    enableColumnFilters: tableConfig.filterable,
    enableGlobalFilter: globalFilterEnabled,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    enableMultiSort: true,
    enableColumnResizing: tableConfig.resizable,
  })

  // Callback handlers
  const handleRowClick = useCallback(
    (row: Row<TData>) => {
      if (onRowClick && typeof onRowClick === 'function') {
        onRowClick(row.original)
      }
    },
    [onRowClick]
  )

  const handleRowDoubleClick = useCallback(
    (row: Row<TData>) => {
      if (onRowDoubleClick && typeof onRowDoubleClick === 'function') {
        onRowDoubleClick(row.original)
      }
    },
    [onRowDoubleClick]
  )

  // Selection change handler
  useEffect(() => {
    if (onSelectionChange && typeof onSelectionChange === 'function') {
      const selectedRows = table.getSelectedRowModel().rows.map(row => row.original)
      onSelectionChange(selectedRows)
    }
  }, [rowSelection, onSelectionChange, table])

  // Sorting change handler
  useEffect(() => {
    if (onSortingChange && typeof onSortingChange === 'function') {
      onSortingChange(sorting)
    }
  }, [sorting, onSortingChange])

  // Filters change handler
  useEffect(() => {
    if (onFiltersChange && typeof onFiltersChange === 'function') {
      onFiltersChange(columnFilters)
    }
  }, [columnFilters, onFiltersChange])

  // Pagination change handler
  useEffect(() => {
    if (onPaginationChange && typeof onPaginationChange === 'function') {
      const pagination = table.getState().pagination
      onPaginationChange(pagination)
    }
  }, [table.getState().pagination, onPaginationChange, table])

  // Get row state for styling
  const getRowState = useCallback((row: Row<TData>): RowState => {
    return {
      selected: row.getIsSelected(),
      highlighted: false,
      disabled: false,
    }
  }, [])

  // Table classes
  const tableClasses = cn(
    "w-full border-collapse",
    {
      "border border-border": tableConfig.bordered,
      "shadow-sm": theme?.shadowLevel === 'sm',
      "shadow-md": theme?.shadowLevel === 'md',
      "shadow-lg": theme?.shadowLevel === 'lg',
    }
  )

  // Row classes
  const getRowClasses = useCallback((row: Row<TData>) => {
    const rowState = getRowState(row)
    return cn(
      "transition-colors duration-200",
      {
        "hover:bg-muted/50": tableConfig.hoverable && !rowState.disabled,
        "bg-muted/20": tableConfig.striped && row.index % 2 === 1,
        "bg-primary/10": rowState.selected,
        "opacity-50 cursor-not-allowed": rowState.disabled,
        "cursor-pointer": onRowClick && !rowState.disabled,
        "bg-accent/20": rowState.highlighted,
      }
    )
  }, [tableConfig, onRowClick, getRowState])

  // Cell classes
  const getCellClasses = useCallback((column: any) => {
    return cn(
      "px-4 py-3 text-left transition-colors",
      {
        "text-sm": theme?.size === 'sm',
        "text-base": theme?.size === 'md',
        "text-lg": theme?.size === 'lg',
        "font-mono": column.columnDef.meta?.isNumeric,
        "text-right": column.columnDef.meta?.align === 'right',
        "text-center": column.columnDef.meta?.align === 'center',
        "sticky left-0 bg-background": column.columnDef.meta?.sticky === 'left',
        "sticky right-0 bg-background": column.columnDef.meta?.sticky === 'right',
      }
    )
  }, [theme])

  // Loading state
  if (loading && loadingConfig.enabled) {
    return <TableLoadingState config={loadingConfig} />
  }

  // Error state - ensure safe error config
  if (error && errorConfig.enabled) {
    const safeErrorConfig = {
      ...errorConfig,
      onRetry: errorConfig.onRetry && typeof errorConfig.onRetry === 'function' ? errorConfig.onRetry : undefined
    }
    return <TableErrorState error={error} config={safeErrorConfig} />
  }

  // Empty state - ensure safe empty state config
  if (data.length === 0 && emptyStateConfig.enabled) {
    const safeEmptyStateConfig = {
      ...emptyStateConfig,
      action: emptyStateConfig.action && emptyStateConfig.action.onClick && typeof emptyStateConfig.action.onClick === 'function'
        ? emptyStateConfig.action
        : undefined
    }
    return <TableEmptyState config={safeEmptyStateConfig} />
  }

  return (
    <div className="space-y-4" role="region" aria-label={ariaLabel} aria-describedby={ariaDescription}>
      {/* Custom Toolbar */}
      {customToolbar || (
        <EnhancedTableToolbar
          table={table}
          config={tableConfig}
          toolbar={toolbar ? {
            ...toolbar,
            refresh: toolbar.refresh && toolbar.refresh.onRefresh && typeof toolbar.refresh.onRefresh === 'function'
              ? toolbar.refresh
              : toolbar.refresh
                ? { ...toolbar.refresh, onRefresh: undefined }
                : undefined,
            actions: toolbar.actions?.filter(action =>
              action.onClick && typeof action.onClick === 'function'
            ),
            bulkActions: toolbar.bulkActions?.filter(action =>
              action.onClick && typeof action.onClick === 'function'
            )
          } : undefined}
          globalFilter={globalFilter}
          setGlobalFilter={setGlobalFilter}
        />
      )}

      {/* Filters */}
      {tableConfig.filterable && toolbar?.filters && (
        <EnhancedTableFilters
          filters={toolbar.filters}
          columnFilters={columnFilters}
          setColumnFilters={setColumnFilters}
          table={table}
        />
      )}

      {/* Table Container */}
      <Card className="relative overflow-hidden">
        <CardContent className="p-0">
          <div className="relative overflow-auto max-h-[70vh]">
            <Table className={tableClasses}>
              {/* Header */}
              <TableHeader className={cn({ "sticky top-0 bg-background z-10": tableConfig.stickyHeader })}>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="hover:bg-transparent border-b">
                    {/* Row numbers */}
                    {tableConfig.showRowNumbers && (
                      <TableHead className="w-12 text-center font-medium">
                        #
                      </TableHead>
                    )}

                    {/* Selection checkbox */}
                    {tableConfig.selectable && (
                      <TableHead className="w-12">
                        <Checkbox
                          checked={table.getIsAllPageRowsSelected()}
                          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                          aria-label="Select all rows"
                          className="translate-y-[2px]"
                        />
                      </TableHead>
                    )}

                    {/* Column headers */}
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className={cn(
                          "font-semibold text-foreground/80",
                          getCellClasses(header.column),
                          {
                            "cursor-pointer select-none": header.column.getCanSort(),
                            "resize-horizontal": tableConfig.resizable && header.column.getCanResize(),
                          }
                        )}
                        style={{
                          width: header.getSize() !== 150 ? header.getSize() : undefined,
                        }}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <div className="flex items-center gap-2">
                          {flexRender(header.column.columnDef.header, header.getContext())}

                          {/* Sort indicator */}
                          {header.column.getCanSort() && (
                            <div className="ml-auto">
                              {{
                                asc: <ChevronUp className="h-4 w-4" />,
                                desc: <ChevronDown className="h-4 w-4" />,
                              }[header.column.getIsSorted() as string] ?? (
                                <ChevronsUpDown className="h-4 w-4 opacity-50" />
                              )}
                            </div>
                          )}
                        </div>

                        {/* Resize handle */}
                        {tableConfig.resizable && header.column.getCanResize() && (
                          <div
                            {...{
                              onMouseDown: header.getResizeHandler(),
                              onTouchStart: header.getResizeHandler(),
                            }}
                            className="absolute right-0 top-0 h-full w-1 bg-border cursor-col-resize hover:bg-primary/50"
                          />
                        )}
                      </TableHead>
                    ))}

                    {/* Actions column */}
                    {toolbar?.actions && toolbar.actions.length > 0 && (
                      <TableHead className="w-20 text-center">Actions</TableHead>
                    )}
                  </TableRow>
                ))}
              </TableHeader>

              {/* Body */}
              <TableBody>
                {table.getRowModel().rows.length > 0 ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      className={getRowClasses(row)}
                      onClick={() => handleRowClick(row)}
                      onDoubleClick={() => handleRowDoubleClick(row)}
                    >
                      {/* Row numbers */}
                      {tableConfig.showRowNumbers && (
                        <TableCell className="text-center text-sm text-muted-foreground font-mono">
                          {row.index + 1}
                        </TableCell>
                      )}

                      {/* Selection checkbox */}
                      {tableConfig.selectable && (
                        <TableCell>
                          <Checkbox
                            checked={row.getIsSelected()}
                            onCheckedChange={(value) => row.toggleSelected(!!value)}
                            aria-label={`Select row ${row.index + 1}`}
                            className="translate-y-[2px]"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </TableCell>
                      )}

                      {/* Data cells */}
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className={getCellClasses(cell.column)}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}

                      {/* Actions */}
                      {toolbar?.actions && toolbar.actions.length > 0 && (
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            {toolbar.actions.map((action, index) => (
                              <Button
                                key={index}
                                variant={action.variant || "ghost"}
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  if (action.onClick && typeof action.onClick === 'function') {
                                    action.onClick(row.original)
                                  }
                                }}
                                disabled={action.disabled?.(row.original)}
                                className={cn("h-8 w-8 p-0", action.className)}
                                title={action.tooltip}
                              >
                                {action.icon}
                              </Button>
                            ))}
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={
                        columns.length +
                        (tableConfig.selectable ? 1 : 0) +
                        (tableConfig.showRowNumbers ? 1 : 0) +
                        (toolbar?.actions ? 1 : 0)
                      }
                      className="h-24 text-center text-muted-foreground"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Package className="h-8 w-8 opacity-50" />
                        <span>No data available</span>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>

              {/* Footer */}
              {tableConfig.showFooter && (
                <TableFooter>
                  {table.getFooterGroups().map((footerGroup) => (
                    <TableRow key={footerGroup.id}>
                      {footerGroup.headers.map((header) => (
                        <TableHead key={header.id}>
                          {flexRender(header.column.columnDef.footer, header.getContext())}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableFooter>
              )}
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {tableConfig.paginated && (
        customPagination || <EnhancedTablePagination table={table} />
      )}

      {/* Custom Footer */}
      {customFooter}

      {/* Column Visibility */}
      <TableColumnVisibility
        table={table}
        enabled={tableConfig.filterable}
      />
    </div>
  )
}

export default memo(EnhancedDataTable) as typeof EnhancedDataTable
