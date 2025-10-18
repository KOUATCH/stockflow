"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DatePicker } from "@/components/ui/date-picker"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useDailySalesReporting } from "@/hooks/useDailySalesReporting"
import {
  AlertCircle,
  BarChart3,
  CheckCircle,
  CreditCard,
  DollarSign,
  Download,
  Eye,
  FileText,
  History,
  Loader2,
  Lock,
  Mail,
  Package,
  Printer,
  RefreshCw,
  ShoppingCart,
  Smartphone,
  TrendingDown,
  TrendingUp,
  Unlock,
  Wallet,
} from "lucide-react"
import { type SetStateAction, useMemo, useState } from "react"

const CompleteIntegratedDailySalesDashboard = ({ organizationId = "default-org", defaultLocationId = "1" }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedLocationId, setSelectedLocationId] = useState(defaultLocationId)
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false)
  const [isFinalizeDialogOpen, setIsFinalizeDialogOpen] = useState(false)
  const [finalizeNotes, setFinalizeNotes] = useState("")
  const [forceRegenerate, setForceRegenerate] = useState(false)
  const [viewMode, setViewMode] = useState("current")

  const {
    report,
    locations,
    history,
    isReportLoading,
    isLocationsLoading,
    isHistoryLoading,
    isGenerating,
    isFinalizing,
    isLoading,
    hasReport,
    isReportFinalized,
    canGenerateReport,
    generateReport,
    finalizeReport,
    exportReport,
    refreshReport,
    generateError,
    finalizeError,
  } = useDailySalesReporting(selectedDate, selectedLocationId, organizationId)

  // Format currency
  const formatCurrency = (amount: string | number | bigint) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(typeof amount === "bigint" ? amount : Number(amount))

  const formatPercent = (percent: number) => `${percent.toFixed(1)}%`

  // Handle location change
  const handleLocationChange = (locationId: SetStateAction<string>) => {
    setSelectedLocationId(locationId)
  }

  // Handle generate report
  const handleGenerateReport = () => {
    generateReport(forceRegenerate)
    setIsGenerateDialogOpen(false)
    setForceRegenerate(false)
  }

  // Handle finalize report
  const handleFinalizeReport = () => {
    if (report) {
      finalizeReport(report?.id, finalizeNotes)
      setIsFinalizeDialogOpen(false)
      setFinalizeNotes("")
    }
  }

  // Handle export
  const handleExport = (format: "pdf" | "csv" | "excel") => {
    exportReport(format)
  }

  // Calculate comparison metrics (mock)
  const comparisonMetrics = useMemo(() => {
    return {
      revenueChange: 12.5,
      profitChange: 8.3,
      transactionChange: -2.1,
      itemsSoldChange: 15.7,
    }
  }, [selectedDate, selectedLocationId])

  if (!report && isReportLoading) {
    return (
      <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading daily sales report?...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <BarChart3 className="h-6 w-6" />
            </div>
            Daily Sales Report
            {report?.isFinalized && (
              <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                <Lock className="h-3 w-3 mr-1" />
                Finalized
              </Badge>
            )}
          </h1>
          <p className="text-gray-600 mt-1">Comprehensive daily sales analysis and reporting</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode(viewMode === "current" ? "history" : "current")}
            >
              {viewMode === "current" ? <History className="h-4 w-4 mr-2" /> : <BarChart3 className="h-4 w-4 mr-2" />}
              {viewMode === "current" ? "View History" : "Current Report"}
            </Button>
          </div>

          <Select value={selectedLocationId} onValueChange={handleLocationChange}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {locations.map((location) => (
                <SelectItem key={location.id} value={location.id}>
                  {location.name} ({location.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <DatePicker
            date={selectedDate}
            onDateChange={setSelectedDate}
            placeholder="Select date"
            maxDate={new Date()}
          />

          <div className="flex gap-2">
            <Button onClick={refreshReport} variant="outline" size="sm" disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>

            {!hasReport && (
              <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" disabled={isGenerating}>
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Generate Daily Sales Report</DialogTitle>
                    <DialogDescription>
                      Generate a comprehensive daily sales report for {selectedDate}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="force-regenerate"
                        checked={forceRegenerate}
                        onChange={(e) => setForceRegenerate(e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="force-regenerate" className="text-sm">
                        Force regenerate if report already exists
                      </Label>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" onClick={() => setIsGenerateDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleGenerateReport} disabled={isGenerating}>
                        {isGenerating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Generate Report
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}

            {hasReport && !isReportFinalized && (
              <Dialog open={isFinalizeDialogOpen} onOpenChange={setIsFinalizeDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="default" size="sm" disabled={isFinalizing}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Finalize Report
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Finalize Daily Sales Report</DialogTitle>
                    <DialogDescription>
                      Once finalized, this report cannot be modified. Please review all data carefully.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="finalize-notes">Notes (Optional)</Label>
                      <Textarea
                        id="finalize-notes"
                        placeholder="Add any notes about this report?..."
                        value={finalizeNotes}
                        onChange={(e) => setFinalizeNotes(e.target.value)}
                        className="min-h-20"
                      />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" onClick={() => setIsFinalizeDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleFinalizeReport} disabled={isFinalizing}>
                        {isFinalizing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Finalize Report
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}

            <Button onClick={() => handleExport("pdf")} size="sm" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Report Status Alert */}
      {!hasReport && !isReportLoading && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No report found for {selectedDate}. Generate a report to view detailed sales data.
          </AlertDescription>
        </Alert>
      )}

      {/* Error Alerts for Operations */}
      {generateError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Failed to generate report: {generateError.message || "Unknown error"}</AlertDescription>
        </Alert>
      )}

      {finalizeError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Failed to finalize report: {finalizeError.message || "Unknown error"}</AlertDescription>
        </Alert>
      )}

      {viewMode === "history" ? (
        // Report History View
        <Card>
          <CardHeader>
            <CardTitle>Report History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Date</th>
                    <th className="text-left p-3">Location</th>
                    <th className="text-right p-3">Revenue</th>
                    <th className="text-right p-3">Transactions</th>
                    <th className="text-center p-3">Status</th>
                    <th className="text-right p-3">Generated</th>
                    <th className="text-center p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((historyItem) => (
                    <tr key={historyItem.id} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-medium">{historyItem.date.toLocaleDateString()}</td>
                      <td className="p-3">
                        {historyItem.location.name}
                        <div className="text-sm text-gray-500">{historyItem.location.code}</div>
                      </td>
                      <td className="text-right p-3">{formatCurrency(historyItem.totalRevenue)}</td>
                      <td className="text-right p-3">{historyItem.totalTransactions}</td>
                      <td className="text-center p-3">
                        <Badge variant={historyItem.isFinalized ? "default" : "secondary"}>
                          {historyItem.isFinalized ? (
                            <>
                              <Lock className="h-3 w-3 mr-1" />
                              Finalized
                            </>
                          ) : (
                            <>
                              <Unlock className="h-3 w-3 mr-1" />
                              Draft
                            </>
                          )}
                        </Badge>
                      </td>
                      <td className="text-right p-3 text-sm text-gray-500">
                        {historyItem.reportGeneratedAt.toLocaleString()}
                      </td>
                      <td className="text-center p-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedDate(historyItem.date.toISOString().split("T")[0])
                            setSelectedLocationId(historyItem.locationId)
                            setViewMode("current")
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        // Current Report View
        hasReport && (
          <>
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(report?.totalRevenue ?? 0)}</div>
                  <p className="text-xs text-muted-foreground flex items-center">
                    {comparisonMetrics.revenueChange > 0 ? (
                      <TrendingUp className="h-3 w-3 inline mr-1 text-green-600" />
                    ) : (
                      <TrendingDown className="h-3 w-3 inline mr-1 text-red-600" />
                    )}
                    <span className={comparisonMetrics.revenueChange > 0 ? "text-green-600" : "text-red-600"}>
                      {Math.abs(comparisonMetrics.revenueChange)}% from yesterday
                    </span>
                  </p>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Gross Profit</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(report?.grossProfit ?? 0)}</div>
                  <p className="text-xs text-muted-foreground">
                    {formatPercent(report?.grossMargin ?? 0)} margin
                    <span className={comparisonMetrics.profitChange > 0 ? "text-green-600 ml-2" : "text-red-600 ml-2"}>
                      ({comparisonMetrics.profitChange > 0 ? "+" : ""}
                      {comparisonMetrics.profitChange}%)
                    </span>
                  </p>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Items Sold</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{report?.totalQuantitySold}</div>
                  <p className="text-xs text-muted-foreground">
                    {report?.itemsSold} different products
                    <span
                      className={comparisonMetrics.itemsSoldChange > 0 ? "text-green-600 ml-2" : "text-red-600 ml-2"}
                    >
                      ({comparisonMetrics.itemsSoldChange > 0 ? "+" : ""}
                      {comparisonMetrics.itemsSoldChange}%)
                    </span>
                  </p>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Transaction</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(report?.averageTransactionValue ?? 0)}</div>
                  <p className="text-xs text-muted-foreground">
                    {report?.totalTransactions} transactions
                    <span
                      className={comparisonMetrics.transactionChange > 0 ? "text-green-600 ml-2" : "text-red-600 ml-2"}
                    >
                      ({comparisonMetrics.transactionChange > 0 ? "+" : ""}
                      {comparisonMetrics.transactionChange}%)
                    </span>
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Report Details Tabs */}
            <Tabs defaultValue="items" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="items">Item Sales</TabsTrigger>
                <TabsTrigger value="payments">Payment Methods</TabsTrigger>
                <TabsTrigger value="inventory">Inventory Changes</TabsTrigger>
                <TabsTrigger value="cash-drawer">Cash Drawer</TabsTrigger>
              </TabsList>

              {/* Item Sales Tab */}
              <TabsContent value="items" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Item-wise Sales Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-3">Item</th>
                            <th className="text-right p-3">SKU</th>
                            <th className="text-right p-3">Qty Sold</th>
                            <th className="text-right p-3">Unit Price</th>
                            <th className="text-right p-3">Revenue</th>
                            <th className="text-right p-3">Cost</th>
                            <th className="text-right p-3">Profit</th>
                            <th className="text-right p-3">Margin</th>
                          </tr>
                        </thead>
                        <tbody>
                          {report?.itemSales.map((item) => (
                            <tr key={item.id} className="border-b hover:bg-gray-50">
                              <td className="p-3">
                                <div className="font-medium">{item.itemName}</div>
                              </td>
                              <td className="text-right p-3 text-sm text-gray-600">{item.itemSku}</td>
                              <td className="text-right p-3">{item.quantitySold}</td>
                              <td className="text-right p-3">{formatCurrency(item.sellingPrice)}</td>
                              <td className="text-right p-3 font-medium">{formatCurrency(item.totalRevenue)}</td>
                              <td className="text-right p-3">{formatCurrency(item.totalCost)}</td>
                              <td className="text-right p-3">
                                <span className={item.grossProfit >= 0 ? "text-green-600" : "text-red-600"}>
                                  {formatCurrency(item.grossProfit)}
                                </span>
                              </td>
                              <td className="text-right p-3">
                                <Badge
                                  variant={
                                    item.margin >= 30 ? "default" : item.margin >= 15 ? "secondary" : "destructive"
                                  }
                                >
                                  {formatPercent(item.margin)}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Payment Methods Tab */}
              <TabsContent value="payments" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Cash Payments</CardTitle>
                      <Wallet className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatCurrency(report?.cashSales ?? 0)}</div>
                      <p className="text-xs text-muted-foreground">
                        {formatPercent((((report?.cashSales ?? 0) as number) / ((report?.totalRevenue ?? 1) as number)) * 100)} of total
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Card Payments</CardTitle>
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatCurrency(report?.cardSales ?? 0)}</div>
                      <p className="text-xs text-muted-foreground">
                        {formatPercent(((report?.cardSales ?? 0) / ((report?.totalRevenue ?? 1))) * 100)} of total
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Digital Payments</CardTitle>
                      <Smartphone className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatCurrency(report?.digitalSales ?? 0)}</div>
                      <p className="text-xs text-muted-foreground">
                        {formatPercent(((report?.digitalSales ?? 0) / (report?.totalRevenue ?? 1)) * 100)} of total
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Payment breakdown by item */}
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Method Breakdown by Item</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-3">Item</th>
                            <th className="text-right p-3">Cash</th>
                            <th className="text-right p-3">Card</th>
                            <th className="text-right p-3">Digital</th>
                            <th className="text-right p-3">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {report?.itemSales.map((item) => (
                            <tr key={item.id} className="border-b hover:bg-gray-50">
                              <td className="p-3 font-medium">{item.itemName}</td>
                              <td className="text-right p-3">{formatCurrency(item.cashSales)}</td>
                              <td className="text-right p-3">{formatCurrency(item.cardSales)}</td>
                              <td className="text-right p-3">{formatCurrency(item.digitalSales)}</td>
                              <td className="text-right p-3 font-medium">{formatCurrency(item.totalRevenue)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Inventory Changes Tab */}
              <TabsContent value="inventory" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Inventory Movement Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-3">Item</th>
                            <th className="text-right p-3">Starting Qty</th>
                            <th className="text-right p-3">Sold</th>
                            <th className="text-right p-3">Ending Qty</th>
                            <th className="text-right p-3">Stock Status</th>
                            <th className="text-right p-3">Value Change</th>
                          </tr>
                        </thead>
                        <tbody>
                          {report?.itemSales.map((item) => {
                            const stockLevel =
                              item.endingQuantity <= 5 ? "low" : item.endingQuantity <= 10 ? "medium" : "good"
                            const valueChange = item.quantitySold * item.costPrice

                            return (
                              <tr key={item.id} className="border-b hover:bg-gray-50">
                                <td className="p-3 font-medium">{item.itemName}</td>
                                <td className="text-right p-3">{item.startingQuantity}</td>
                                <td className="text-right p-3 text-red-600">-{item.quantitySold}</td>
                                <td className="text-right p-3">{item.endingQuantity}</td>
                                <td className="text-right p-3">
                                  <Badge
                                    variant={
                                      stockLevel === "low"
                                        ? "destructive"
                                        : stockLevel === "medium"
                                          ? "secondary"
                                          : "default"
                                    }
                                  >
                                    {stockLevel === "low" ? "Low Stock" : stockLevel === "medium" ? "Medium" : "Good"}
                                  </Badge>
                                </td>
                                <td className="text-right p-3 text-red-600">-{formatCurrency(valueChange)}</td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Cash Drawer Tab */}
              <TabsContent value="cash-drawer" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Cash Drawer Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Opening Balance:</span>
                        <span className="font-medium">{formatCurrency(report?.openingBalance ?? 0)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Cash Sales:</span>
                        <span className="font-medium text-green-600">+{formatCurrency(report?.cashSales ?? 0)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Cash In:</span>
                        <span className="font-medium text-green-600">+{formatCurrency(report?.cashIn ?? 0)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Cash Out:</span>
                        <span className="font-medium text-red-600">-{formatCurrency(report?.cashOut ?? 0)}</span>
                      </div>
                      <div className="border-t pt-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Expected Closing:</span>
                          <span className="font-bold">
                            {formatCurrency(
                              (report?.openingBalance ?? 0) +
                              (report?.cashSales ?? 0) +
                              (report?.cashIn ?? 0) -
                              (report?.cashOut ?? 0)
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Actual Closing:</span>
                          <span className="font-bold">{formatCurrency(report?.closingBalance ?? 0)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Variance:</span>
                          <span className={`font-bold ${(report?.variance ?? 0) < 0 ? "text-red-600" : "text-green-600"}`}>
                            {formatCurrency(report?.variance ?? 0)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        Cash Flow Details
                        {Math.abs(report?.variance ?? 0) > 20 && <AlertCircle className="h-4 w-4 text-yellow-600" />}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                          <span className="text-sm">Total Cash Received</span>
                          <span className="font-medium text-green-700">
                            {formatCurrency((report?.cashSales ?? 0) + (report?.cashIn ?? 0))}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                          <span className="text-sm">Total Cash Dispensed</span>
                          <span className="font-medium text-red-700">{formatCurrency(report?.cashOut ?? 0)}</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                          <span className="text-sm">Net Cash Movement</span>
                          <span className="font-medium text-blue-700">
                            {formatCurrency(
                              (report?.cashSales ?? 0) +
                              (report?.cashIn ?? 0) -
                              (report?.cashOut ?? 0)
                            )}
                          </span>
                        </div>
                        {Math.abs(report?.variance ?? 0) > 0 && (
                          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                            <div className="flex items-center gap-2 text-yellow-800">
                              <AlertCircle className="h-4 w-4" />
                              <span className="font-medium">Variance Detected</span>
                            </div>
                            <p className="text-sm text-yellow-700 mt-1">
                              There's a {formatCurrency(Math.abs(report?.variance ?? 0))}
                              {report?.variance && report.variance < 0 ? " shortage" : " overage"} in the cash drawer. Please
                              investigate and document the discrepancy.
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Cash Drawer Events */}
                {report?.cashDrawerTransactions && report.cashDrawerTransactions.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Cash Drawer Events</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left p-3">Time</th>
                              <th className="text-left p-3">Event Type</th>
                              <th className="text-right p-3">Amount</th>
                              <th className="text-right p-3">Balance Before</th>
                              <th className="text-right p-3">Balance After</th>
                              <th className="text-left p-3">User</th>
                              <th className="text-left p-3">Notes</th>
                            </tr>
                          </thead>
                          <tbody>
                            {report?.cashDrawerTransactions.map((event) => (
                              <tr key={event.id} className="border-b hover:bg-gray-50">
                                <td className="p-3 text-sm">{event.timestamp.toLocaleTimeString()}</td>
                                <td className="p-3">
                                  <Badge variant="outline" className="text-xs">
                                    {event.eventType.replace(/_/g, " ").toLowerCase()}
                                  </Badge>
                                </td>
                                <td className="text-right p-3">
                                  <span className={event.eventType === "CASH_OUT" ? "text-red-600" : "text-green-600"}>
                                    {event.eventType === "CASH_OUT" ? "-" : "+"}
                                    {formatCurrency(Math.abs(event.amount))}
                                  </span>
                                </td>
                                <td className="text-right p-3 text-sm text-gray-600">
                                  {formatCurrency(event.balanceBefore)}
                                </td>
                                <td className="text-right p-3 text-sm font-medium">
                                  {formatCurrency(event.balanceAfter)}
                                </td>
                                <td className="p-3 text-sm">{event.userName || "System"}</td>
                                <td className="p-3 text-sm text-gray-600">{event.notes || "-"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>

            {/* Report Footer */}
            <Card className="mt-6">
              <CardContent className="p-4">
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <div className="flex items-center gap-4">
                    <span>Report Generated: {report?.reportGeneratedAt.toLocaleString()}</span>
                    <span>•</span>
                    <span>Status: {report?.isFinalized ? "Finalized" : "Draft"}</span>
                    {report?.notes && (
                      <>
                        <span>•</span>
                        <span>Notes: {report?.notes}</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleExport("csv")}>
                      <Download className="h-4 w-4 mr-1" />
                      CSV
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleExport("excel")}>
                      <Download className="h-4 w-4 mr-1" />
                      Excel
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleExport("pdf")}>
                      <Download className="h-4 w-4 mr-1" />
                      PDF
                    </Button>
                    <Button variant="outline" size="sm">
                      <Printer className="h-4 w-4 mr-1" />
                      Print
                    </Button>
                    <Button variant="outline" size="sm">
                      <Mail className="h-4 w-4 mr-1" />
                      Email
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )
      )}
    </div>
  )
}

export default CompleteIntegratedDailySalesDashboard
