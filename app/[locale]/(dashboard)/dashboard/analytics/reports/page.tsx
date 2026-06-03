"use client"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { endOfMonth, format, startOfMonth, subDays } from "date-fns"
import { CalendarIcon, DollarSign, FileText, Package, Users } from "lucide-react"
import { useEffect, useState } from "react"

import { CashFlowReportComponent } from "@/components/reports/cash-flow-report"
import { CashierPerformanceReportComponent } from "@/components/reports/cashier-performance-report"
import { FinancialSummaryReportComponent } from "@/components/reports/financial-summary-report"
import { ItemPerformanceReportComponent } from "@/components/reports/item-performance-report"

import {
  getCashFlowReport,
  getCashierPerformanceReport,
  getFinancialSummaryReport,
  getItemPerformanceReport,
  type CashFlowReport,
  type CashierPerformanceReport,
  type FinancialSummaryReport,
  type ItemPerformanceReport,
} from "@/actions/analytics/financial-reports"

type ReportType = "financial" | "cashier" | "items" | "cashflow"

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState<ReportType>("financial")
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: subDays(new Date(), 7),
    to: new Date(),
  })
  const [isLoading, setIsLoading] = useState(false)

  // Report data states
  const [financialReport, setFinancialReport] = useState<FinancialSummaryReport | null>(null)
  const [cashierReports, setCashierReports] = useState<CashierPerformanceReport[]>([])
  const [itemReports, setItemReports] = useState<ItemPerformanceReport[]>([])
  const [cashFlowReport, setCashFlowReport] = useState<CashFlowReport | null>(null)

  // Mock organization and location IDs - in real app, get from context/auth
  const organizationId = "org_123"
  const locationId = "loc_123"

  const loadReports = async () => {
    setIsLoading(true)
    try {
      switch (selectedReport) {
        case "financial":
          const financial = await getFinancialSummaryReport(organizationId, locationId, dateRange.from, dateRange.to)
          setFinancialReport(financial)
          break

        case "cashier":
          const cashier = await getCashierPerformanceReport(organizationId, locationId, dateRange.from, dateRange.to)
          setCashierReports(cashier)
          break

        case "items":
          const items = await getItemPerformanceReport(organizationId, locationId, dateRange.from, dateRange.to)
          setItemReports(items)
          break

        case "cashflow":
          const cashflow = await getCashFlowReport(organizationId, locationId, dateRange.from, dateRange.to)
          setCashFlowReport(cashflow)
          break
      }
    } catch (error) {
      console.error("Error loading reports:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadReports()
  }, [selectedReport, dateRange])

  const setQuickDateRange = (days: number) => {
    setDateRange({
      from: subDays(new Date(), days),
      to: new Date(),
    })
  }

  const setMonthRange = () => {
    const now = new Date()
    setDateRange({
      from: startOfMonth(now),
      to: endOfMonth(now),
    })
  }

  const reportTypes = [
    {
      id: "financial" as const,
      name: "Financial Summary",
      description: "Revenue, profit, and sales overview",
      icon: FileText,
    },
    {
      id: "cashier" as const,
      name: "Cashier Performance",
      description: "Individual cashier metrics and performance",
      icon: Users,
    },
    {
      id: "items" as const,
      name: "Item Performance",
      description: "Product sales and inventory analysis",
      icon: Package,
    },
    {
      id: "cashflow" as const,
      name: "Cash Flow",
      description: "Cash in/out and drawer reconciliation",
      icon: DollarSign,
    },
  ]

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Financial Reports</h1>
          <p className="text-muted-foreground">Comprehensive analytics and performance insights</p>
        </div>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Report Type Selection */}
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Report Type</label>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                {reportTypes.map((type) => {
                  const Icon = type.icon
                  return (
                    <Button
                      key={type.id}
                      variant={selectedReport === type.id ? "default" : "outline"}
                      className="h-auto p-3 flex flex-col items-center gap-2"
                      onClick={() => setSelectedReport(type.id)}
                    >
                      <Icon className="h-4 w-4" />
                      <div className="text-center">
                        <div className="text-xs font-medium">{type.name}</div>
                        <div className="text-xs text-muted-foreground hidden lg:block">{type.description}</div>
                      </div>
                    </Button>
                  )
                })}
              </div>
            </div>

            {/* Date Range Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Date Range</label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-[280px] justify-start text-start font-normal",
                        !dateRange && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="me-2 h-4 w-4" />
                      {dateRange?.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(dateRange.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Pick a date range</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange?.from}
                      selected={dateRange}
                      onSelect={(range) => {
                        if (range?.from && range?.to) {
                          setDateRange({ from: range.from, to: range.to })
                        }
                      }}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Quick Date Buttons */}
              <div className="flex gap-1">
                <Button size="sm" variant="outline" onClick={() => setQuickDateRange(7)}>
                  7 days
                </Button>
                <Button size="sm" variant="outline" onClick={() => setQuickDateRange(30)}>
                  30 days
                </Button>
                <Button size="sm" variant="outline" onClick={setMonthRange}>
                  This month
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Content */}
      {isLoading ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading report...</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {selectedReport === "financial" && financialReport && (
            <FinancialSummaryReportComponent report={financialReport} />
          )}

          {selectedReport === "cashier" && cashierReports.length > 0 && (
            <CashierPerformanceReportComponent reports={cashierReports} />
          )}

          {selectedReport === "items" && itemReports.length > 0 && (
            <ItemPerformanceReportComponent reports={itemReports} />
          )}

          {selectedReport === "cashflow" && cashFlowReport && <CashFlowReportComponent report={cashFlowReport} />}
        </>
      )}
    </div>
  )
}
