/**
 * Enhanced Table Toolbar Component
 * Professional toolbar with search, filters, actions, and analytics
 */

"use client"

import { Table } from "@tanstack/react-table"
import { useState, useMemo, useCallback } from "react"
import { cn } from "@/lib/utils"

// UI Components
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

// Icons
import {
  Search,
  Filter,
  Download,
  Upload,
  RefreshCw,
  MoreVertical,
  Settings,
  Eye,
  EyeOff,
  Trash2,
  Edit,
  Plus,
  X,
  BarChart3,
  Database,
  FileText,
} from "lucide-react"

// Types
import { TableConfig, ToolbarConfig, BulkAction } from "./types"

interface EnhancedTableToolbarProps<TData> {
  table: Table<TData>
  config: TableConfig
  toolbar?: ToolbarConfig
  globalFilter: string
  setGlobalFilter: (value: string) => void
}

export function EnhancedTableToolbar<TData>({
  table,
  config,
  toolbar,
  globalFilter,
  setGlobalFilter,
}: EnhancedTableToolbarProps<TData>) {
  const [isSearchFocused, setIsSearchFocused] = useState(false)

  // Get selected rows
  const selectedRows = table.getSelectedRowModel().rows
  const hasSelection = selectedRows.length > 0

  // Table statistics
  const stats = useMemo(() => {
    const totalRows = table.getFilteredRowModel().rows.length
    const allRows = table.getCoreRowModel().rows.length
    const selectedCount = selectedRows.length
    const filteredCount = totalRows !== allRows ? totalRows : null

    return {
      total: allRows,
      filtered: filteredCount,
      selected: selectedCount,
      showing: totalRows,
    }
  }, [table, selectedRows.length])

  // Handle bulk actions
  const handleBulkAction = useCallback((action: BulkAction) => {
    if (!action.onClick) return

    const selectedData = selectedRows.map(row => row.original)

    if (action.requiresConfirmation) {
      const confirmed = window.confirm(
        action.confirmationMessage || `Are you sure you want to ${action.label.toLowerCase()} ${selectedData.length} item(s)?`
      )
      if (!confirmed) return
    }

    action.onClick(selectedData)
    table.resetRowSelection()
  }, [selectedRows, table])

  // Handle export
  const handleExport = useCallback((format: string) => {
    if (toolbar?.export?.customExporter) {
      const data = table.getFilteredRowModel().rows.map(row => row.original)
      toolbar.export.customExporter(data, format)
    } else {
      console.log(`Exporting ${stats.showing} rows as ${format}`)
      // Default export implementation would go here
    }
  }, [table, toolbar, stats.showing])

  // Clear filters
  const clearFilters = useCallback(() => {
    table.resetColumnFilters()
    table.resetGlobalFilter()
    setGlobalFilter("")
  }, [table, setGlobalFilter])

  const hasActiveFilters = table.getState().columnFilters.length > 0 || globalFilter.length > 0

  return (
    <div className="space-y-4">
      {/* Main Toolbar */}
      <div className="flex items-center justify-between gap-4 p-4 bg-background/50 backdrop-blur border rounded-lg">
        {/* Left Section - Title & Description */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            {toolbar?.title && (
              <h2 className="text-lg font-semibold text-foreground truncate">
                {toolbar.title}
              </h2>
            )}

            {/* Statistics */}
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {stats.total} total
              </Badge>
              {stats.filtered !== null && (
                <Badge variant="outline" className="text-xs">
                  {stats.filtered} filtered
                </Badge>
              )}
              {hasSelection && (
                <Badge variant="default" className="text-xs">
                  {stats.selected} selected
                </Badge>
              )}
            </div>
          </div>

          {toolbar?.description && (
            <p className="text-sm text-muted-foreground mt-1 truncate">
              {toolbar.description}
            </p>
          )}
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center gap-2">
          {/* Refresh Button */}
          {toolbar?.refresh?.enabled && toolbar.refresh.onRefresh && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toolbar.refresh?.onRefresh?.()}
                    className="h-8 w-8 p-0"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Refresh data</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {/* Primary Actions */}
          {toolbar?.actions?.map((action, index) => (
            <Button
              key={index}
              variant={action.variant || "default"}
              size="sm"
              onClick={() => action.onClick?.(null)}
              className="gap-2"
              disabled={action.disabled?.(null)}
            >
              {action.icon}
              {action.label}
            </Button>
          ))}

          {/* More Actions Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {/* Export Options */}
              {config.exportable && toolbar?.export?.enabled && (
                <>
                  <DropdownMenuLabel>Export</DropdownMenuLabel>
                  {toolbar.export.formats?.map((format) => (
                    <DropdownMenuItem
                      key={format}
                      onClick={() => handleExport(format)}
                      className="gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Export as {format.toUpperCase()}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                </>
              )}

              {/* Import */}
              {config.importable && toolbar?.import?.enabled && (
                <>
                  <DropdownMenuItem className="gap-2">
                    <Upload className="h-4 w-4" />
                    Import Data
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}

              {/* Table Settings */}
              <DropdownMenuItem className="gap-2">
                <Settings className="h-4 w-4" />
                Table Settings
              </DropdownMenuItem>

              {/* View Options */}
              <DropdownMenuItem className="gap-2">
                <Eye className="h-4 w-4" />
                Column Visibility
              </DropdownMenuItem>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <DropdownMenuItem onClick={clearFilters} className="gap-2">
                  <X className="h-4 w-4" />
                  Clear All Filters
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex items-center gap-4">
        {/* Global Search */}
        {config.searchable && toolbar?.search?.enabled !== false && (
          <div className="flex-1 max-w-md relative">
            <div
              className={cn(
                "relative transition-all duration-200",
                isSearchFocused && "scale-[1.02]"
              )}
            >
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={toolbar?.search?.placeholder || "Search all columns..."}
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className="pl-9 pr-4 h-9 bg-background/50 backdrop-blur border-muted focus:bg-background transition-colors"
              />
              {globalFilter && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setGlobalFilter("")}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0 hover:bg-muted"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Active Filters Count */}
        {hasActiveFilters && (
          <Badge variant="secondary" className="gap-1">
            <Filter className="h-3 w-3" />
            {table.getState().columnFilters.length + (globalFilter ? 1 : 0)} filter(s)
          </Badge>
        )}

        {/* Bulk Actions */}
        {hasSelection && toolbar?.bulkActions && toolbar.bulkActions.length > 0 && (
          <div className="flex items-center gap-2 pl-4 border-l">
            <span className="text-sm text-muted-foreground">
              {selectedRows.length} selected
            </span>
            {toolbar.bulkActions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || "outline"}
                size="sm"
                onClick={() => handleBulkAction(action)}
                disabled={
                  Boolean(
                    action.disabled?.(selectedRows.map(row => row.original)) ||
                    (action.minSelection !== undefined && selectedRows.length < action.minSelection) ||
                    (action.maxSelection !== undefined && selectedRows.length > action.maxSelection)
                  )
                }
                className="gap-1"
              >
                {action.icon}
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Quick Stats */}
      {toolbar?.title && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-3">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-lg font-semibold">{stats.total}</div>
                <div className="text-xs text-muted-foreground">Total Records</div>
              </div>
            </div>
          </Card>

          <Card className="p-3">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-lg font-semibold">{stats.showing}</div>
                <div className="text-xs text-muted-foreground">Visible</div>
              </div>
            </div>
          </Card>

          {hasSelection && (
            <Card className="p-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-lg font-semibold">{stats.selected}</div>
                  <div className="text-xs text-muted-foreground">Selected</div>
                </div>
              </div>
            </Card>
          )}

          {hasActiveFilters && (
            <Card className="p-3">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-lg font-semibold">
                    {table.getState().columnFilters.length + (globalFilter ? 1 : 0)}
                  </div>
                  <div className="text-xs text-muted-foreground">Active Filters</div>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
