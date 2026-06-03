"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SupplierDetailsModal } from "@/components/finance/SupplierDetailsModal"
import { PayablePaymentDialog } from "@/components/finance/PayablePaymentDialog"
import { usePayablesData } from "@/hooks/usePayablesData"
import {
  ShoppingCart,
  DollarSign,
  Clock,
  AlertTriangle,
  Calendar,
  RefreshCw,
  Download,
  CreditCard,
  CheckCircle,
  MapPin,
  Search,
  Filter,
  Building2,
  TrendingUp,
  BarChart3,
  Package,
  FileText,
  Users,
  Target
} from "lucide-react"

// Use real data from database hooks

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

const formatPercentage = (value: number) => `${value.toFixed(1)}%`

const getStatusBadge = (status: string) => {
  switch (status) {
    case "CURRENT":
      return <Badge className="bg-green-100 text-green-800 border-green-200">Current</Badge>
    case "OVERDUE":
      return <Badge className="bg-red-100 text-red-800 border-red-200">Overdue</Badge>
    case "PENDING":
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>
    case "PAID":
      return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Paid</Badge>
    default:
      return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Unknown</Badge>
  }
}

const getRiskBadge = (risk: string) => {
  switch (risk) {
    case "LOW":
      return <Badge className="bg-green-100 text-green-800 border-green-200">Low Risk</Badge>
    case "MEDIUM":
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Medium Risk</Badge>
    case "HIGH":
      return <Badge className="bg-red-100 text-red-800 border-red-200">High Risk</Badge>
    default:
      return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Unknown</Badge>
  }
}

export default function SupplierPayablesClient() {
  const [selectedPeriod, setSelectedPeriod] = useState("current-month")
  const [selectedLocation, setSelectedLocation] = useState("all")
  const [selectedSupplier, setSelectedSupplier] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState("invoices")
  const [supplierModalOpen, setSupplierModalOpen] = useState(false)
  const [selectedSupplierForModal, setSelectedSupplierForModal] = useState<any>(null)

  // Real data hooks
  const { payables, summary, loading, error, refreshData } = usePayablesData()

  const handleRefresh = async () => {
    setIsRefreshing(true)
    refreshData()
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsRefreshing(false)
  }

  // Filter logic will be updated to use real data
  const filteredSuppliers = useMemo(() => {
    // Will be implemented with real supplier data
    return []
  }, [searchTerm, selectedLocation])

  const selectedSupplierData = useMemo(() => {
    // Will be implemented with real supplier data
    return null
  }, [selectedSupplier])

  const filteredLocations = useMemo(() => {
    // Will be implemented with real location data
    return []
  }, [searchTerm])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-4 sm:py-8">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg shadow-purple-500/25">
                <ShoppingCart className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                  Supplier Payables Analytics
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  Comprehensive location-based supplier payment management
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-48 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current-month">Current Month</SelectItem>
                  <SelectItem value="last-month">Last Month</SelectItem>
                  <SelectItem value="current-quarter">Current Quarter</SelectItem>
                  <SelectItem value="current-year">Current Year</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Key Metrics Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
          <Card className="relative overflow-hidden border-2 border-purple-300/30 bg-gradient-to-br from-purple-400/20 via-violet-400/10 to-indigo-400/20 backdrop-blur-xl shadow-2xl ring-1 ring-white/20 hover:shadow-3xl hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 ease-out group">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/20 to-transparent rounded-bl-full" />
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-white/10 to-transparent rounded-tr-full" />
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-purple-500/20 animate-pulse" />
              <div className="absolute top-8 right-8 w-1 h-1 rounded-full bg-purple-500/20 animate-pulse delay-200" />
              <div className="absolute bottom-6 right-6 w-1.5 h-1.5 rounded-full bg-purple-500/20 animate-pulse delay-500" />
            </div>
            <CardContent className="relative z-10 p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-purple-500/20 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <DollarSign className="w-6 h-6 text-purple-700" />
                </div>
                <div>
                  <p className="text-sm text-purple-600/80 font-medium">Total Payables</p>
                  <p className="text-2xl font-bold text-purple-700">
                    {loading ? "Loading..." : formatCurrency(summary?.totalAmount || 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-2 border-teal-300/30 bg-gradient-to-br from-teal-400/20 via-emerald-400/10 to-green-400/20 backdrop-blur-xl shadow-2xl ring-1 ring-white/20 hover:shadow-3xl hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 ease-out group">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/20 to-transparent rounded-bl-full" />
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-white/10 to-transparent rounded-tr-full" />
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-teal-500/20 animate-pulse" />
              <div className="absolute top-8 right-8 w-1 h-1 rounded-full bg-teal-500/20 animate-pulse delay-200" />
              <div className="absolute bottom-6 right-6 w-1.5 h-1.5 rounded-full bg-teal-500/20 animate-pulse delay-500" />
            </div>
            <CardContent className="relative z-10 p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-teal-500/20 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Building2 className="w-6 h-6 text-teal-700" />
                </div>
                <div>
                  <p className="text-sm text-teal-600/80 font-medium">Outstanding</p>
                  <p className="text-2xl font-bold text-teal-700">
                    {loading ? "Loading..." : formatCurrency(summary?.outstandingAmount || 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-2 border-indigo-300/30 bg-gradient-to-br from-indigo-400/20 via-blue-400/10 to-cyan-400/20 backdrop-blur-xl shadow-2xl ring-1 ring-white/20 hover:shadow-3xl hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 ease-out group">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/20 to-transparent rounded-bl-full" />
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-white/10 to-transparent rounded-tr-full" />
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-indigo-500/20 animate-pulse" />
              <div className="absolute top-8 right-8 w-1 h-1 rounded-full bg-indigo-500/20 animate-pulse delay-200" />
              <div className="absolute bottom-6 right-6 w-1.5 h-1.5 rounded-full bg-indigo-500/20 animate-pulse delay-500" />
            </div>
            <CardContent className="relative z-10 p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-indigo-500/20 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-6 h-6 text-indigo-700" />
                </div>
                <div>
                  <p className="text-sm text-indigo-600/80 font-medium">Suppliers</p>
                  <p className="text-2xl font-bold text-indigo-700">
                    {loading ? "Loading..." : (summary?.totalCount || 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-2 border-red-300/30 bg-gradient-to-br from-red-400/20 via-rose-400/10 to-pink-400/20 backdrop-blur-xl shadow-2xl ring-1 ring-white/20 hover:shadow-3xl hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 ease-out group">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/20 to-transparent rounded-bl-full" />
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-white/10 to-transparent rounded-tr-full" />
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-red-500/20 animate-pulse" />
              <div className="absolute top-8 right-8 w-1 h-1 rounded-full bg-red-500/20 animate-pulse delay-200" />
              <div className="absolute bottom-6 right-6 w-1.5 h-1.5 rounded-full bg-red-500/20 animate-pulse delay-500" />
            </div>
            <CardContent className="relative z-10 p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-red-500/20 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <AlertTriangle className="w-6 h-6 text-red-700" />
                </div>
                <div>
                  <p className="text-sm text-red-600/80 font-medium">Overdue</p>
                  <p className="text-2xl font-bold text-red-700">
                    {loading ? "Loading..." : formatCurrency(summary?.overdueAmount || 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-2 border-amber-300/30 bg-gradient-to-br from-amber-400/20 via-yellow-400/10 to-orange-400/20 backdrop-blur-xl shadow-2xl ring-1 ring-white/20 hover:shadow-3xl hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 ease-out group">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/20 to-transparent rounded-bl-full" />
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-white/10 to-transparent rounded-tr-full" />
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-amber-500/20 animate-pulse" />
              <div className="absolute top-8 right-8 w-1 h-1 rounded-full bg-amber-500/20 animate-pulse delay-200" />
              <div className="absolute bottom-6 right-6 w-1.5 h-1.5 rounded-full bg-amber-500/20 animate-pulse delay-500" />
            </div>
            <CardContent className="relative z-10 p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-amber-500/20 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Clock className="w-6 h-6 text-amber-700" />
                </div>
                <div>
                  <p className="text-sm text-amber-600/80 font-medium">Avg Days</p>
                  <p className="text-2xl font-bold text-amber-700">
                    {loading ? "Loading..." : "30"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-2 border-cyan-300/30 bg-gradient-to-br from-cyan-400/20 via-blue-400/10 to-indigo-400/20 backdrop-blur-xl shadow-2xl ring-1 ring-white/20 hover:shadow-3xl hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 ease-out group">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/20 to-transparent rounded-bl-full" />
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-white/10 to-transparent rounded-tr-full" />
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-cyan-500/20 animate-pulse" />
              <div className="absolute top-8 right-8 w-1 h-1 rounded-full bg-cyan-500/20 animate-pulse delay-200" />
              <div className="absolute bottom-6 right-6 w-1.5 h-1.5 rounded-full bg-cyan-500/20 animate-pulse delay-500" />
            </div>
            <CardContent className="relative z-10 p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-cyan-500/20 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <FileText className="w-6 h-6 text-cyan-700" />
                </div>
                <div>
                  <p className="text-sm text-cyan-600/80 font-medium">Invoices</p>
                  <p className="text-2xl font-bold text-cyan-700">
                    {loading ? "Loading..." : (payables?.length || 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter Controls */}
        <div className="mb-6">
          <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Search locations or suppliers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-slate-50 dark:bg-slate-700/50 border-0"
                  />
                </div>
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger className="w-full sm:w-64 bg-slate-50 dark:bg-slate-700/50 border-0">
                    <MapPin className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Filter by location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {/* Location options will be populated from real data */}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-xl p-1 shadow-xl">
            <TabsTrigger value="invoices" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white">
              Invoices
            </TabsTrigger>
            <TabsTrigger value="locations" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white">
              Location Analysis
            </TabsTrigger>
            <TabsTrigger value="suppliers" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white">
              Supplier Overview
            </TabsTrigger>
            <TabsTrigger value="details" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white">
              Supplier Details
            </TabsTrigger>
            <TabsTrigger value="aging" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white">
              Aging Analysis
            </TabsTrigger>
            <TabsTrigger value="payments" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white">
              Payment Schedule
            </TabsTrigger>
          </TabsList>

          {/* Invoices Tab */}
          <TabsContent value="invoices" className="space-y-6">
            {error && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-4">
                  <p className="text-red-800 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    {error}
                  </p>
                </CardContent>
              </Card>
            )}

            <div className="space-y-4">
              {loading ? (
                <div className="grid gap-4">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-6">
                        <div className="h-6 bg-gray-200 rounded mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : payables.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No Invoices Found</h3>
                    <p className="text-gray-600">There are no payable invoices to display.</p>
                  </CardContent>
                </Card>
              ) : (
                payables.map((payable) => (
                  <Card key={payable.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
                            <FileText className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold">{payable.invoiceNumber}</h3>
                            <p className="text-gray-600">{payable.supplier.name}</p>
                            <p className="text-sm text-gray-500">
                              Due: {new Date(payable.dueDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900">
                            {formatCurrency(payable.outstandingAmount)}
                          </p>
                          <p className="text-sm text-gray-500">Outstanding</p>
                          {getStatusBadge(payable.status)}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="p-3 rounded-lg bg-gray-50">
                          <p className="text-sm text-gray-600">Total Amount</p>
                          <p className="font-bold">{formatCurrency(payable.totalAmount)}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-gray-50">
                          <p className="text-sm text-gray-600">Paid Amount</p>
                          <p className="font-bold text-green-600">{formatCurrency(payable.paidAmount)}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-gray-50">
                          <p className="text-sm text-gray-600">Payment Terms</p>
                          <p className="font-bold">{payable.paymentTerms} days</p>
                        </div>
                        <div className="p-3 rounded-lg bg-gray-50">
                          <p className="text-sm text-gray-600">Invoice Date</p>
                          <p className="font-bold">{new Date(payable.invoiceDate).toLocaleDateString()}</p>
                        </div>
                      </div>

                      {payable.description && (
                        <div className="mb-4">
                          <p className="text-sm text-gray-600 mb-1">Description:</p>
                          <p className="text-gray-800">{payable.description}</p>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(payable.dueDate) < new Date()
                              ? `Overdue by ${Math.floor((Date.now() - new Date(payable.dueDate).getTime()) / (1000 * 60 * 60 * 24))} days`
                              : `Due in ${Math.floor((new Date(payable.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days`
                            }
                          </span>
                        </div>

                        <div className="flex gap-2">
                          {payable.outstandingAmount > 0 && (
                            <PayablePaymentDialog
                              payable={{
                                id: payable.id,
                                invoiceNumber: payable.invoiceNumber,
                                supplierName: payable.supplier.name,
                                totalAmount: payable.totalAmount,
                                outstandingAmount: payable.outstandingAmount,
                                dueDate: payable.dueDate.toISOString(),
                                status: payable.status
                              }}
                              onPaymentSuccess={refreshData}
                              trigger={
                                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                                  <CreditCard className="w-4 h-4 mr-2" />
                                  Pay Now
                                </Button>
                              }
                            />
                          )}
                          <Button size="sm" variant="outline">
                            <Calendar className="w-4 h-4 mr-2" />
                            Schedule
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Location Analysis Tab */}
          <TabsContent value="locations" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredLocations.map((location) => (
                <Card key={location.id} className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-300 group">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg group-hover:scale-110 transition-transform duration-300">
                          <MapPin className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg font-bold">{location.name}</CardTitle>
                          <CardDescription className="text-sm">{location.address}</CardDescription>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300">
                        {location.payables.suppliers} suppliers
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                        <p className="text-sm text-green-700 dark:text-green-300">Total Payables</p>
                        <p className="text-xl font-bold text-green-900 dark:text-green-100">
                          {formatCurrency(location.payables.total)}
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20">
                        <p className="text-sm text-red-700 dark:text-red-300">Overdue</p>
                        <p className="text-xl font-bold text-red-900 dark:text-red-100">
                          {formatCurrency(location.payables.overdue)}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Avg Days</p>
                        <p className="font-semibold">{location.payables.avgDays}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Invoices</p>
                        <p className="font-semibold">{location.payables.invoices}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Payment Ratio</p>
                        <p className="font-semibold">{formatPercentage(location.metrics.paymentRatio * 100)}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-medium text-green-600">
                          +{formatPercentage(location.metrics.growth)} growth
                        </span>
                      </div>
                      {location.metrics.criticalSuppliers > 0 && (
                        <Badge className="bg-red-100 text-red-800 border-red-200">
                          {location.metrics.criticalSuppliers} critical
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Supplier Overview Tab */}
          <TabsContent value="suppliers" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {filteredSuppliers.map((supplier) => (
                <Card
                  key={supplier.id}
                  className="relative overflow-hidden border-2 border-indigo-300/30 bg-gradient-to-br from-indigo-400/20 via-blue-400/10 to-cyan-400/20 backdrop-blur-xl shadow-2xl ring-1 ring-white/20 hover:shadow-3xl hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 ease-out cursor-pointer group"
                  onClick={() => {
                    setSelectedSupplierForModal(supplier)
                    setSupplierModalOpen(true)
                  }}
                >
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/20 to-transparent rounded-bl-full" />
                  <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-white/10 to-transparent rounded-tr-full" />
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-indigo-500/20 animate-pulse" />
                    <div className="absolute top-8 right-8 w-1 h-1 rounded-full bg-indigo-500/20 animate-pulse delay-200" />
                    <div className="absolute bottom-6 right-6 w-1.5 h-1.5 rounded-full bg-indigo-500/20 animate-pulse delay-500" />
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg group-hover:scale-110 transition-transform duration-300">
                          <Building2 className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-slate-900 dark:text-white">{supplier.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            {getRiskBadge(supplier.metrics.riskScore)}
                            <Badge variant="outline">
                              {supplier.locations.length} locations
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">
                          {formatCurrency(supplier.totalOwed)}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Total Outstanding</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                      <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                        <p className="text-sm text-slate-600 dark:text-slate-400">Avg Payment Days</p>
                        <p className="font-bold text-lg">{supplier.metrics.avgPaymentDays}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                        <p className="text-sm text-slate-600 dark:text-slate-400">Credit Utilization</p>
                        <p className="font-bold text-lg">{formatPercentage(supplier.metrics.utilizationRate * 100)}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                        <p className="text-sm text-slate-600 dark:text-slate-400">Payment History</p>
                        <p className="font-bold text-lg">{formatPercentage(supplier.metrics.paymentHistory * 100)}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                        <p className="text-sm text-slate-600 dark:text-slate-400">Credit Limit</p>
                        <p className="font-bold text-lg">{formatCurrency(supplier.metrics.creditLimit)}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Location Breakdown:</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {supplier.locations.map((location) => (
                          <div key={location.locationId} className="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-slate-700/50">
                            <div>
                              <p className="text-sm font-medium">{location.locationName}</p>
                              <p className="text-xs text-slate-600 dark:text-slate-400">{location.invoices} invoices</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold">{formatCurrency(location.amount)}</p>
                              {getStatusBadge(location.status)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Supplier Details Tab */}
          <TabsContent value="details" className="space-y-6">
            {selectedSupplierData ? (
              <>
                <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-0 shadow-xl">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg">
                          <Building2 className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-2xl">{selectedSupplierData.name}</CardTitle>
                          <CardDescription>Detailed supplier analysis and transaction history</CardDescription>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-slate-900 dark:text-white">
                          {formatCurrency(selectedSupplierData.totalOwed)}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Total Outstanding</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
                        <p className="text-sm text-blue-700 dark:text-blue-300">Credit Limit</p>
                        <p className="text-xl font-bold text-blue-900 dark:text-blue-100">
                          {formatCurrency(selectedSupplierData.metrics.creditLimit)}
                        </p>
                      </div>
                      <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20">
                        <p className="text-sm text-purple-700 dark:text-purple-300">Utilization Rate</p>
                        <p className="text-xl font-bold text-purple-900 dark:text-purple-100">
                          {formatPercentage(selectedSupplierData.metrics.utilizationRate * 100)}
                        </p>
                      </div>
                      <div className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                        <p className="text-sm text-green-700 dark:text-green-300">Payment History</p>
                        <p className="text-xl font-bold text-green-900 dark:text-green-100">
                          {formatPercentage(selectedSupplierData.metrics.paymentHistory * 100)}
                        </p>
                      </div>
                      <div className="p-4 rounded-lg bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20">
                        <p className="text-sm text-yellow-700 dark:text-yellow-300">Avg Payment Days</p>
                        <p className="text-xl font-bold text-yellow-900 dark:text-yellow-100">
                          {selectedSupplierData.metrics.avgPaymentDays}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Recent Transactions
                    </CardTitle>
                    <CardDescription>Latest payment transactions and invoices</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedSupplierData.transactions.map((transaction) => (
                        <div key={transaction.id} className="p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-medium text-lg">{transaction.invoice}</p>
                              <p className="text-sm text-slate-600 dark:text-slate-400">{transaction.description}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                                {transaction.location} • {new Date(transaction.date).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xl font-bold">{formatCurrency(transaction.amount)}</p>
                              {getStatusBadge(transaction.status)}
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-600 dark:text-slate-400">
                              Due: {new Date(transaction.dueDate).toLocaleDateString()}
                            </span>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                <CreditCard className="w-4 h-4 mr-2" />
                                Pay Now
                              </Button>
                              <Button size="sm" variant="outline">
                                <Calendar className="w-4 h-4 mr-2" />
                                Schedule
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-0 shadow-xl">
                <CardContent className="p-12 text-center">
                  <Building2 className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Select a Supplier
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    Choose a supplier from the Supplier Overview tab to view detailed transaction history and analytics.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Aging Analysis Tab */}
          <TabsContent value="aging" className="space-y-6">
            <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Accounts Payable Aging Analysis
                </CardTitle>
                <CardDescription>Breakdown of payables by aging periods across all locations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {summary?.aging?.map((bucket, index) => {
                    const colors = ['bg-green-500', 'bg-yellow-500', 'bg-orange-500', 'bg-red-500'];
                    const color = colors[index] || 'bg-gray-500';
                    const totalAmount = summary.aging.reduce((sum, b) => sum + Number(b.amount), 0);
                    const percentage = totalAmount > 0 ? ((Number(bucket.amount) / totalAmount) * 100) : 0;
                    const periodName = bucket.range === 'current' ? 'Current (0-30 days)' :
                                     bucket.range === '1-30' ? '31-60 days' :
                                     bucket.range === '31-60' ? '61-90 days' :
                                     bucket.range === '61-90' ? '91-120 days' : '120+ days';

                    return (
                      <div key={bucket.range} className="p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded-full ${color} shadow-lg`}></div>
                            <div>
                              <p className="font-semibold text-lg">{periodName}</p>
                              <p className="text-sm text-slate-600 dark:text-slate-400">
                                {bucket.count} invoices • {percentage.toFixed(1)}% of total
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold">{formatCurrency(Number(bucket.amount))}</p>
                          </div>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${color}`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  }) || (
                    <div className="text-center text-gray-500 py-8">
                      {loading ? "Loading aging analysis..." : "No aging data available"}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payment Schedule Tab */}
          <TabsContent value="payments" className="space-y-6">
            <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Upcoming Payment Schedule
                </CardTitle>
                <CardDescription>Weekly payment schedule and priority breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Payment schedule - will be implemented with real data */}
                  <div className="text-center text-gray-500 py-8">
                    Payment schedule feature coming soon - based on real payables data
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Supplier Details Modal */}
        <SupplierDetailsModal
          supplier={selectedSupplierForModal}
          open={supplierModalOpen}
          onOpenChange={setSupplierModalOpen}
        />
      </div>
    </div>
  )
}