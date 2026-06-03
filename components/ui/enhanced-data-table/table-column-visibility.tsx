/**
 * Table Column Visibility Component
 * Allows users to show/hide columns with toggle controls
 */

"use client"

import { Table } from "@tanstack/react-table"
import { useState } from "react"
import { cn } from "@/lib/utils"

// UI Components
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

// Icons
import {
  Eye,
  EyeOff,
  Settings2,
  Columns,
  RotateCcw,
  Pin,
  PinOff,
} from "lucide-react"

interface TableColumnVisibilityProps<TData> {
  table: Table<TData>
  enabled?: boolean
  variant?: "dropdown" | "popover" | "sidebar"
  showPinning?: boolean
}

export function TableColumnVisibility<TData>({
  table,
  enabled = true,
  variant = "dropdown",
  showPinning = false,
}: TableColumnVisibilityProps<TData>) {
  const [isOpen, setIsOpen] = useState(false)

  if (!enabled) return null

  const columns = table.getAllColumns().filter(
    (column) =>
      typeof column.accessorFn !== "undefined" && column.getCanHide()
  )

  const visibleCount = columns.filter(column => column.getIsVisible()).length
  const totalCount = columns.length
  const hiddenCount = totalCount - visibleCount

  const handleToggleAll = (checked: boolean) => {
    table.toggleAllColumnsVisible(checked)
  }

  const handleResetVisibility = () => {
    table.resetColumnVisibility()
  }

  const handleToggleColumn = (columnId: string, visible: boolean) => {
    const column = table.getColumn(columnId)
    if (column) {
      column.toggleVisibility(visible)
    }
  }

  const handlePinColumn = (columnId: string, position: "left" | "right" | false) => {
    const column = table.getColumn(columnId)
    if (column && showPinning) {
      // This would require additional implementation in the table setup
      console.log(`Pin column ${columnId} to ${position}`)
    }
  }

  const ColumnList = () => (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h4 className="text-sm font-medium">Column Visibility</h4>
          <p className="text-xs text-muted-foreground">
            Show or hide table columns
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {visibleCount}/{totalCount}
          </Badge>
          {hiddenCount > 0 && (
            <Badge variant="outline" className="text-xs">
              {hiddenCount} hidden
            </Badge>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between py-2 border-y">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="toggle-all"
            checked={visibleCount === totalCount}
            onCheckedChange={handleToggleAll}
          />
          <Label htmlFor="toggle-all" className="text-sm font-medium cursor-pointer">
            Toggle All
          </Label>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleResetVisibility}
          className="h-7 text-xs"
        >
          <RotateCcw className="h-3 w-3 mr-1" />
          Reset
        </Button>
      </div>

      {/* Column List */}
      <ScrollArea className="max-h-64">
        <div className="space-y-2">
          {columns.map((column) => {
            const isVisible = column.getIsVisible()
            const columnId = column.id
            const displayName =
              (column.columnDef.header as string) ||
              column.id.charAt(0).toUpperCase() + column.id.slice(1)

            return (
              <div
                key={columnId}
                className={cn(
                  "flex items-center justify-between p-2 rounded-lg border",
                  "hover:bg-muted/50 transition-colors",
                  !isVisible && "opacity-60"
                )}
              >
                <div className="flex items-center space-x-2 flex-1">
                  <Checkbox
                    id={`column-${columnId}`}
                    checked={isVisible}
                    onCheckedChange={(checked) =>
                      handleToggleColumn(columnId, !!checked)
                    }
                  />
                  <Label
                    htmlFor={`column-${columnId}`}
                    className="text-sm cursor-pointer flex-1"
                  >
                    {displayName}
                  </Label>
                </div>

                <div className="flex items-center gap-1">
                  {isVisible ? (
                    <Eye className="h-3 w-3 text-muted-foreground" />
                  ) : (
                    <EyeOff className="h-3 w-3 text-muted-foreground" />
                  )}

                  {/* Pinning controls */}
                  {showPinning && isVisible && (
                    <div className="flex items-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => handlePinColumn(columnId, "left")}
                        title="Pin to left"
                      >
                        <Pin className="h-3 w-3 rotate-45" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => handlePinColumn(columnId, "right")}
                        title="Pin to right"
                      >
                        <Pin className="h-3 w-3 -rotate-45" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </ScrollArea>

      {/* Summary */}
      <div className="text-xs text-muted-foreground pt-2 border-t">
        {visibleCount} of {totalCount} columns visible
        {hiddenCount > 0 && ` • ${hiddenCount} hidden`}
      </div>
    </div>
  )

  // Dropdown variant
  if (variant === "dropdown") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Columns className="h-4 w-4" />
            Columns
            {hiddenCount > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {hiddenCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel className="flex items-center justify-between">
            Column Visibility
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetVisibility}
              className="h-6 text-xs"
            >
              Reset
            </Button>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuCheckboxItem
            checked={visibleCount === totalCount}
            onCheckedChange={handleToggleAll}
            className="font-medium"
          >
            Toggle All ({visibleCount}/{totalCount})
          </DropdownMenuCheckboxItem>

          <DropdownMenuSeparator />

          {columns.map((column) => {
            const displayName =
              (column.columnDef.header as string) ||
              column.id.charAt(0).toUpperCase() + column.id.slice(1)

            return (
              <DropdownMenuCheckboxItem
                key={column.id}
                className="capitalize"
                checked={column.getIsVisible()}
                onCheckedChange={(value) =>
                  column.toggleVisibility(!!value)
                }
              >
                {displayName}
              </DropdownMenuCheckboxItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  // Popover variant
  if (variant === "popover") {
    return (
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Settings2 className="h-4 w-4" />
            Columns
            {hiddenCount > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {hiddenCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4" align="end">
          <ColumnList />
        </PopoverContent>
      </Popover>
    )
  }

  // Sidebar variant (returns the component to be embedded)
  return (
    <div className="p-4 border rounded-lg bg-card">
      <ColumnList />
    </div>
  )
}