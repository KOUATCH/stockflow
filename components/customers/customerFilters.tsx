"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { CalendarIcon, Download, Filter, X, Search, Users, Activity, TrendingUp, DollarSign } from "lucide-react"
import { useState } from "react"

export interface CustomerFilters {
  search: string
  status: "all" | "active" | "inactive"
  minRevenue: string
  maxRevenue: string
  dateFrom: Date | undefined
  dateTo: Date | undefined
  paymentTerms: "all" | "15" | "30" | "45" | "60"
}

interface CustomerFiltersProps {
  filters: CustomerFilters
  onFiltersChange: (filters: CustomerFilters) => void
  onExport: () => void
  totalCount: number
  filteredCount: number
}

export function CustomerFiltersComponent({
  filters,
  onFiltersChange,
  onExport,
  totalCount,
  filteredCount,
}: CustomerFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)

  const updateFilter = (key: keyof CustomerFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const clearFilters = () => {
    onFiltersChange({
      search: "",
      status: "all",
      minRevenue: "",
      maxRevenue: "",
      dateFrom: undefined,
      dateTo: undefined,
      paymentTerms: "all",
    })
  }

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === "search") return value.length > 0
    if (key === "status" || key === "paymentTerms") return value !== "all"
    if (key === "minRevenue" || key === "maxRevenue") return value.length > 0
    if (key === "dateFrom" || key === "dateTo") return value !== undefined
    return false
  }).length

  return (
    <div className="space-y-4">
      {/* Enhanced Search and Quick Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input with Icon */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search customers by name, email, or phone..."
            value={filters.search}
            onChange={(e) => updateFilter("search", e.target.value)}
            className="pl-10 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        {/* Quick Status Filter */}
        <Select value={filters.status} onValueChange={(value) => updateFilter("status", value)}>
          <SelectTrigger className="w-40 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-slate-500" />
              <SelectValue placeholder="All Status" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Customers</SelectItem>
            <SelectItem value="active">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                Active
              </div>
            </SelectItem>
            <SelectItem value="inactive">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                Inactive
              </div>
            </SelectItem>
          </SelectContent>
        </Select>

        {/* Advanced Filters and Actions */}
        <div className="flex items-center gap-2">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/80"
              >
                <Filter className="mr-2 h-4 w-4" />
                Advanced
                {activeFiltersCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                  >
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[540px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg">
              <SheetHeader className="pb-6">
                <SheetTitle className="text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Advanced Filters
                </SheetTitle>
                <SheetDescription className="text-slate-600 dark:text-slate-400">
                  Refine your customer search with detailed criteria and find exactly what you need.
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-6 py-6">
                {/* Revenue Range */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <Label className="font-semibold text-slate-700 dark:text-slate-300">Revenue Range</Label>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">Minimum</Label>
                      <Input
                        type="number"
                        placeholder="$0"
                        value={filters.minRevenue}
                        onChange={(e) => updateFilter("minRevenue", e.target.value)}
                        className="bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">Maximum</Label>
                      <Input
                        type="number"
                        placeholder="$1,000,000"
                        value={filters.maxRevenue}
                        onChange={(e) => updateFilter("maxRevenue", e.target.value)}
                        className="bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700"
                      />
                    </div>
                  </div>
                </div>

                <Separator className="bg-slate-200 dark:bg-slate-700" />

                {/* Date Range */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <Label className="font-semibold text-slate-700 dark:text-slate-300">Registration Date</Label>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">From Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700",
                              !filters.dateFrom && "text-slate-500 dark:text-slate-400"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {filters.dateFrom ? format(filters.dateFrom, "MMM dd, yyyy") : "Select date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={filters.dateFrom}
                            onSelect={(date) => updateFilter("dateFrom", date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">To Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700",
                              !filters.dateTo && "text-slate-500 dark:text-slate-400"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {filters.dateTo ? format(filters.dateTo, "MMM dd, yyyy") : "Select date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={filters.dateTo}
                            onSelect={(date) => updateFilter("dateTo", date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>

                <Separator className="bg-slate-200 dark:bg-slate-700" />

                {/* Payment Terms */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    <Label className="font-semibold text-slate-700 dark:text-slate-300">Payment Terms</Label>
                  </div>
                  <Select value={filters.paymentTerms} onValueChange={(value) => updateFilter("paymentTerms", value)}>
                    <SelectTrigger className="bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700">
                      <SelectValue placeholder="All payment terms" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Payment Terms</SelectItem>
                      <SelectItem value="15">15 days</SelectItem>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="45">45 days</SelectItem>
                      <SelectItem value="60">60+ days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Filter Actions */}
                <div className="flex gap-3 pt-6 border-t border-slate-200 dark:border-slate-700">
                  <Button
                    onClick={clearFilters}
                    variant="outline"
                    className="flex-1 bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-200 dark:hover:border-red-700 hover:text-red-600 dark:hover:text-red-400"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Clear Filters
                  </Button>
                  <Button
                    onClick={() => setIsOpen(false)}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                  >
                    Apply Filters
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Export Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onExport}
            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/80"
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Enhanced Results Summary */}
      <div className="flex items-center justify-between py-3 px-4 bg-slate-50/80 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-slate-500" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {filteredCount === totalCount ? (
                `${totalCount} customers`
              ) : (
                `${filteredCount} of ${totalCount} customers`
              )}
            </span>
          </div>
          {activeFiltersCount > 0 && (
            <Badge
              variant="secondary"
              className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-700"
            >
              {activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''} applied
            </Badge>
          )}
        </div>

        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 h-8"
          >
            <X className="h-3 w-3 mr-1" />
            Clear
          </Button>
        )}
      </div>
    </div>
  )
}
