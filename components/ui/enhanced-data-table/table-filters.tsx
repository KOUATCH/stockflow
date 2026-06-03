/**
 * Enhanced Table Filters Component
 * Advanced filtering system with multiple filter types and live updates
 */

"use client"

import { Table, Column } from "@tanstack/react-table"
import { useState, useMemo, useCallback } from "react"
import { cn } from "@/lib/utils"

// UI Components
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Icons
import {
  Filter,
  X,
  Calendar as CalendarIcon,
  Check,
  Search,
  ChevronDown,
  Settings,
} from "lucide-react"

// Date utilities
import { format, isAfter, isBefore, isEqual, parseISO } from "date-fns"

// Types
import { FilterConfig } from "./types"

interface EnhancedTableFiltersProps<TData> {
  table: Table<TData>
  filters: FilterConfig[]
  columnFilters: any[]
  setColumnFilters: (filters: any[]) => void
}

export function EnhancedTableFilters<TData>({
  table,
  filters,
  columnFilters,
  setColumnFilters,
}: EnhancedTableFiltersProps<TData>) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Get unique values for select filters
  const getUniqueValues = useCallback((columnId: string) => {
    const column = table.getColumn(columnId)
    if (!column) return []

    const uniqueValues = Array.from(column.getFacetedUniqueValues().keys())
    return uniqueValues.filter(Boolean).sort()
  }, [table])

  // Apply filter
  const applyFilter = useCallback((filterId: string, value: any) => {
    const column = table.getColumn(filterId)
    if (column) {
      column.setFilterValue(value === "" || value === null ? undefined : value)
    }
  }, [table])

  // Clear single filter
  const clearFilter = useCallback((filterId: string) => {
    const column = table.getColumn(filterId)
    if (column) {
      column.setFilterValue(undefined)
    }
  }, [table])

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    table.resetColumnFilters()
  }, [table])

  // Get active filter count
  const activeFilterCount = useMemo(() => {
    return columnFilters.length
  }, [columnFilters])

  // Render text filter
  const renderTextFilter = useCallback((filter: FilterConfig) => {
    const column = table.getColumn(filter.key)
    const value = column?.getFilterValue() as string

    return (
      <div className="space-y-2">
        <Label htmlFor={filter.key} className="text-xs font-medium">
          {filter.label}
        </Label>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            id={filter.key}
            placeholder={filter.placeholder || `Filter ${filter.label.toLowerCase()}...`}
            value={value || ""}
            onChange={(e) => applyFilter(filter.key, e.target.value)}
            className="pl-8 h-9"
          />
          {value && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1 h-7 w-7 p-0"
              onClick={() => clearFilter(filter.key)}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
    )
  }, [table, applyFilter, clearFilter])

  // Render select filter
  const renderSelectFilter = useCallback((filter: FilterConfig) => {
    const column = table.getColumn(filter.key)
    const value = column?.getFilterValue() as string
    const options = filter.options || getUniqueValues(filter.key).map(val => ({
      label: String(val),
      value: val
    }))

    return (
      <div className="space-y-2">
        <Label htmlFor={filter.key} className="text-xs font-medium">
          {filter.label}
        </Label>
        <Select
          value={value || ""}
          onValueChange={(val) => applyFilter(filter.key, val === "all" ? "" : val)}
        >
          <SelectTrigger className="h-9">
            <SelectValue placeholder={filter.placeholder || `Select ${filter.label.toLowerCase()}`} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All {filter.label}</SelectItem>
            {options.map((option) => (
              <SelectItem key={String(option.value)} value={String(option.value)}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    )
  }, [table, applyFilter, getUniqueValues])

  // Render multi-select filter
  const renderMultiSelectFilter = useCallback((filter: FilterConfig) => {
    const column = table.getColumn(filter.key)
    const value = (column?.getFilterValue() as string[]) || []
    const options = filter.options || getUniqueValues(filter.key).map(val => ({
      label: String(val),
      value: val
    }))

    const toggleOption = (optionValue: string) => {
      const newValue = value.includes(optionValue)
        ? value.filter(v => v !== optionValue)
        : [...value, optionValue]
      applyFilter(filter.key, newValue.length > 0 ? newValue : undefined)
    }

    return (
      <div className="space-y-2">
        <Label className="text-xs font-medium">{filter.label}</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-between h-9"
              role="combobox"
            >
              {value.length > 0 ? (
                <span className="truncate">
                  {value.length} selected
                </span>
              ) : (
                filter.placeholder || `Select ${filter.label.toLowerCase()}`
              )}
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0" align="start">
            <div className="max-h-64 overflow-auto p-1">
              {options.map((option) => (
                <div
                  key={String(option.value)}
                  className="flex items-center space-x-2 p-2 hover:bg-accent rounded-sm cursor-pointer"
                  onClick={() => toggleOption(String(option.value))}
                >
                  <Checkbox
                    checked={value.includes(String(option.value))}
                    onChange={() => {}} // Controlled by click handler
                  />
                  <span className="text-sm">{option.label}</span>
                </div>
              ))}
            </div>
            {value.length > 0 && (
              <div className="border-t p-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => applyFilter(filter.key, undefined)}
                >
                  Clear selection
                </Button>
              </div>
            )}
          </PopoverContent>
        </Popover>
        {value.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {value.map((val) => (
              <Badge key={val} variant="secondary" className="text-xs">
                {val}
                <X
                  className="ml-1 h-3 w-3 cursor-pointer"
                  onClick={() => toggleOption(val)}
                />
              </Badge>
            ))}
          </div>
        )}
      </div>
    )
  }, [table, applyFilter, getUniqueValues])

  // Render date filter
  const renderDateFilter = useCallback((filter: FilterConfig) => {
    const column = table.getColumn(filter.key)
    const value = column?.getFilterValue() as Date

    return (
      <div className="space-y-2">
        <Label className="text-xs font-medium">{filter.label}</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal h-9",
                !value && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {value ? format(value, "PPP") : filter.placeholder || "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={value}
              onSelect={(date) => applyFilter(filter.key, date)}
              initialFocus
            />
            {value && (
              <div className="border-t p-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => clearFilter(filter.key)}
                >
                  Clear date
                </Button>
              </div>
            )}
          </PopoverContent>
        </Popover>
      </div>
    )
  }, [table, applyFilter, clearFilter])

  // Render date range filter
  const renderDateRangeFilter = useCallback((filter: FilterConfig) => {
    const column = table.getColumn(filter.key)
    const value = column?.getFilterValue() as [Date, Date] | undefined

    return (
      <div className="space-y-2">
        <Label className="text-xs font-medium">{filter.label}</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal h-9",
                !value && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {value ? (
                `${format(value[0], "LLL dd")} - ${format(value[1], "LLL dd")}`
              ) : (
                filter.placeholder || "Pick date range"
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={value ? { from: value[0], to: value[1] } : undefined}
              onSelect={(range) => {
                if (range?.from && range?.to) {
                  applyFilter(filter.key, [range.from, range.to])
                }
              }}
              numberOfMonths={2}
            />
            {value && (
              <div className="border-t p-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => clearFilter(filter.key)}
                >
                  Clear range
                </Button>
              </div>
            )}
          </PopoverContent>
        </Popover>
      </div>
    )
  }, [table, applyFilter, clearFilter])

  // Render number filter
  const renderNumberFilter = useCallback((filter: FilterConfig) => {
    const column = table.getColumn(filter.key)
    const value = column?.getFilterValue() as number

    return (
      <div className="space-y-2">
        <Label htmlFor={filter.key} className="text-xs font-medium">
          {filter.label}
        </Label>
        <Input
          id={filter.key}
          type="number"
          placeholder={filter.placeholder || `Enter ${filter.label.toLowerCase()}`}
          value={value || ""}
          onChange={(e) => applyFilter(filter.key, e.target.value ? Number(e.target.value) : "")}
          className="h-9"
        />
      </div>
    )
  }, [table, applyFilter])

  // Render boolean filter
  const renderBooleanFilter = useCallback((filter: FilterConfig) => {
    const column = table.getColumn(filter.key)
    const value = column?.getFilterValue() as boolean

    return (
      <div className="space-y-2">
        <Label className="text-xs font-medium">{filter.label}</Label>
        <Select
          value={value === undefined ? "all" : value ? "true" : "false"}
          onValueChange={(val) =>
            applyFilter(filter.key, val === "all" ? undefined : val === "true")
          }
        >
          <SelectTrigger className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="true">Yes</SelectItem>
            <SelectItem value="false">No</SelectItem>
          </SelectContent>
        </Select>
      </div>
    )
  }, [table, applyFilter])

  // Render filter based on type
  const renderFilter = useCallback((filter: FilterConfig) => {
    switch (filter.type) {
      case 'text':
        return renderTextFilter(filter)
      case 'select':
        return renderSelectFilter(filter)
      case 'multiSelect':
        return renderMultiSelectFilter(filter)
      case 'date':
        return renderDateFilter(filter)
      case 'dateRange':
        return renderDateRangeFilter(filter)
      case 'number':
        return renderNumberFilter(filter)
      case 'boolean':
        return renderBooleanFilter(filter)
      default:
        return renderTextFilter(filter)
    }
  }, [
    renderTextFilter,
    renderSelectFilter,
    renderMultiSelectFilter,
    renderDateFilter,
    renderDateRangeFilter,
    renderNumberFilter,
    renderBooleanFilter,
  ])

  // Split filters into basic and advanced
  const basicFilters = filters.slice(0, 3)
  const advancedFilters = filters.slice(3)

  return (
    <Card className="border-0 bg-muted/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <CardTitle className="text-sm">Filters</CardTitle>
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="h-5 text-xs">
                {activeFilterCount}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            {advancedFilters.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="h-7 text-xs"
              >
                <Settings className="h-3 w-3 mr-1" />
                {showAdvanced ? "Simple" : "Advanced"}
              </Button>
            )}

            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="h-7 text-xs"
              >
                <X className="h-3 w-3 mr-1" />
                Clear All
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Basic Filters */}
        {basicFilters.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {basicFilters.map((filter) => (
              <div key={filter.key}>
                {renderFilter(filter)}
              </div>
            ))}
          </div>
        )}

        {/* Advanced Filters */}
        {showAdvanced && advancedFilters.length > 0 && (
          <div className="space-y-4 pt-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {advancedFilters.map((filter) => (
                <div key={filter.key}>
                  {renderFilter(filter)}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Active Filters Summary */}
        {activeFilterCount > 0 && (
          <div className="pt-4 border-t">
            <div className="flex flex-wrap gap-2">
              {columnFilters.map((filter) => {
                const filterConfig = filters.find(f => f.key === filter.id)
                const displayValue = Array.isArray(filter.value)
                  ? `${filter.value.length} selected`
                  : String(filter.value)

                return (
                  <Badge
                    key={filter.id}
                    variant="outline"
                    className="flex items-center gap-1"
                  >
                    <span className="text-xs">
                      {filterConfig?.label || filter.id}: {displayValue}
                    </span>
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-destructive"
                      onClick={() => clearFilter(filter.id)}
                    />
                  </Badge>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}