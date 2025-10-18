"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SupplierDetailsModal } from "@/components/finance/SupplierDetailsModal"
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

// Comprehensive mock data structure for location-based analysis
const mockLocationPayablesData = {
  overview: {
    totalPayables: 523450,
    totalLocations: 6,
    totalSuppliers: 24,
    overduePayables: 67890,
    avgPaymentDays: 32,
    totalInvoices: 1247
  },
  locations: [
    {
      id: "1",
      name: "Downtown Store",
      address: "123 Main St, Downtown",
      payables: {
        total: 156780,
        current: 124560,
        overdue: 32220,
        suppliers: 8,
        avgDays: 28,
        invoices: 312
      },
      metrics: {
        monthlyAvg: 145000,
        growth: 8.1,
        paymentRatio: 0.87,
        criticalSuppliers: 2
      }
    },
    {
      id: "2",
      name: "Mall Location",
      address: "456 Shopping Center",
      payables: {
        total: 189340,
        current: 167890,
        overdue: 21450,
        suppliers: 6,
        avgDays: 24,
        invoices: 428
      },
      metrics: {
        monthlyAvg: 178000,
        growth: 6.4,
        paymentRatio: 0.91,
        criticalSuppliers: 1
      }
    },
    {
      id: "3",
      name: "Airport Branch",
      address: "789 Terminal Rd",
      payables: {
        total: 98750,
        current: 89200,
        overdue: 9550,
        suppliers: 5,
        avgDays: 22,
        invoices: 198
      },
      metrics: {
        monthlyAvg: 92000,
        growth: 7.3,
        paymentRatio: 0.93,
        criticalSuppliers: 0
      }
    },
    {
      id: "4",
      name: "Suburban Outlet",
      address: "321 Suburb Ave",
      payables: {
        total: 78580,
        current: 74330,
        overdue: 4250,
        suppliers: 5,
        avgDays: 19,
        invoices: 309
      },
      metrics: {
        monthlyAvg: 72000,
        growth: 9.1,
        paymentRatio: 0.95,
        criticalSuppliers: 0
      }
    }
  ],
  suppliers: [
    {
      id: "1",
      name: "Global Tech Supplies",
      totalOwed: 89420,
      locations: [
        { locationId: "1", locationName: "Downtown Store", amount: 34500, invoices: 12, status: "CURRENT" },
        { locationId: "2", locationName: "Mall Location", amount: 28900, invoices: 8, status: "CURRENT" },
        { locationId: "3", locationName: "Airport Branch", amount: 26020, invoices: 6, status: "OVERDUE" }
      ],
      metrics: {
        avgPaymentDays: 31,
        creditLimit: 150000,
        utilizationRate: 0.596,
        paymentHistory: 0.89,
        riskScore: "LOW"
      },
      transactions: [
        { id: "T001", date: "2024-10-12", invoice: "INV-2024-1001", amount: 12500, description: "Computer Equipment", dueDate: "2024-11-11", status: "PENDING", location: "Downtown Store" },
        { id: "T002", date: "2024-10-08", invoice: "INV-2024-0998", amount: 8900, description: "Office Supplies", dueDate: "2024-11-07", status: "PENDING", location: "Mall Location" },
        { id: "T003", date: "2024-10-15", invoice: "INV-2024-1015", amount: 15600, description: "Software Licenses", dueDate: "2024-11-14", status: "PENDING", location: "Downtown Store" },
        { id: "T004", date: "2024-09-28", invoice: "INV-2024-0956", amount: 6750, description: "Maintenance Services", dueDate: "2024-10-28", status: "OVERDUE", location: "Airport Branch" }
      ]
    },
    {
      id: "2",
      name: "Premium Food Distributors",
      totalOwed: 67850,
      locations: [
        { locationId: "1", locationName: "Downtown Store", amount: 45200, invoices: 15, status: "CURRENT" },
        { locationId: "2", locationName: "Mall Location", amount: 22650, invoices: 7, status: "CURRENT" }
      ],
      metrics: {
        avgPaymentDays: 18,
        creditLimit: 100000,
        utilizationRate: 0.679,
        paymentHistory: 0.96,
        riskScore: "LOW"
      },
      transactions: [
        { id: "T005", date: "2024-10-14", invoice: "INV-2024-1012", amount: 18900, description: "Fresh Produce Delivery", dueDate: "2024-11-13", status: "PENDING", location: "Downtown Store" },
        { id: "T006", date: "2024-10-10", invoice: "INV-2024-1005", amount: 12400, description: "Frozen Foods", dueDate: "2024-11-09", status: "PENDING", location: "Mall Location" },
        { id: "T007", date: "2024-10-16", invoice: "INV-2024-1018", amount: 24200, description: "Beverage Supplies", dueDate: "2024-11-15", status: "PENDING", location: "Downtown Store" }
      ]
    },
    {
      id: "3",
      name: "Industrial Equipment Corp",
      totalOwed: 45780,
      locations: [
        { locationId: "1", locationName: "Downtown Store", amount: 28900, invoices: 4, status: "OVERDUE" },
        { locationId: "4", locationName: "Suburban Outlet", amount: 16880, invoices: 3, status: "CURRENT" }
      ],
      metrics: {
        avgPaymentDays: 45,
        creditLimit: 75000,
        utilizationRate: 0.610,
        paymentHistory: 0.72,
        riskScore: "MEDIUM"
      },
      transactions: [
        { id: "T008", date: "2024-09-20", invoice: "INV-2024-0923", amount: 18900, description: "HVAC Maintenance", dueDate: "2024-10-20", status: "OVERDUE", location: "Downtown Store" },
        { id: "T009", date: "2024-10-05", invoice: "INV-2024-0987", amount: 8450, description: "Security Equipment", dueDate: "2024-11-04", status: "PENDING", location: "Suburban Outlet" },
        { id: "T010", date: "2024-09-25", invoice: "INV-2024-0935", amount: 10000, description: "Electrical Work", dueDate: "2024-10-25", status: "OVERDUE", location: "Downtown Store" }
      ]
    }
  ],
  agingAnalysis: {
    buckets: [
      { period: "Current (0-30 days)", amount: 387560, percentage: 74.1, count: 892, color: "bg-green-500" },
      { period: "31-60 days", amount: 78450, percentage: 15.0, count: 198, color: "bg-yellow-500" },
      { period: "61-90 days", amount: 34220, percentage: 6.5, count: 89, color: "bg-orange-500" },
      { period: "90+ days", amount: 23220, percentage: 4.4, count: 68, color: "bg-red-500" }
    ]
  },
  paymentSchedule: [
    { week: "This Week", amount: 89420, invoices: 23, urgent: 3 },
    { week: "Next Week", amount: 67850, invoices: 18, urgent: 1 },
    { week: "Week 3", amount: 45780, invoices: 12, urgent: 0 },
    { week: "Week 4", amount: 78900, invoices: 28, urgent: 2 }
  ]
}

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
  const [activeTab, setActiveTab] = useState("locations")
  const [supplierModalOpen, setSupplierModalOpen] = useState(false)
  const [selectedSupplierForModal, setSelectedSupplierForModal] = useState<any>(null)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsRefreshing(false)
  }

  const filteredSuppliers = useMemo(() => {
    let suppliers = mockLocationPayablesData.suppliers

    if (searchTerm) {
      suppliers = suppliers.filter(supplier =>
        supplier.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedLocation !== "all") {
      suppliers = suppliers.filter(supplier =>
        supplier.locations.some(loc => loc.locationId === selectedLocation)
      )
    }

    return suppliers
  }, [searchTerm, selectedLocation])

  const selectedSupplierData = useMemo(() => {
    if (!selectedSupplier) return null
    return mockLocationPayablesData.suppliers.find(s => s.id === selectedSupplier)
  }, [selectedSupplier])

  const filteredLocations = useMemo(() => {
    return mockLocationPayablesData.locations.filter(location =>
      location.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
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
                    {formatCurrency(mockLocationPayablesData.overview.totalPayables)}
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
                  <p className="text-sm text-teal-600/80 font-medium">Locations</p>
                  <p className="text-2xl font-bold text-teal-700">
                    {mockLocationPayablesData.overview.totalLocations}
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
                    {mockLocationPayablesData.overview.totalSuppliers}
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
                    {formatCurrency(mockLocationPayablesData.overview.overduePayables)}
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
                    {mockLocationPayablesData.overview.avgPaymentDays}
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
                    {mockLocationPayablesData.overview.totalInvoices}
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
                    {mockLocationPayablesData.locations.map((location) => (
                      <SelectItem key={location.id} value={location.id}>
                        {location.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-xl p-1 shadow-xl">
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
                  {mockLocationPayablesData.agingAnalysis.buckets.map((bucket) => (
                    <div key={bucket.period} className="p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded-full ${bucket.color} shadow-lg`}></div>
                          <div>
                            <p className="font-semibold text-lg">{bucket.period}</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              {bucket.count} invoices • {formatPercentage(bucket.percentage)} of total
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">{formatCurrency(bucket.amount)}</p>
                        </div>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${bucket.color}`}
                          style={{ width: `${bucket.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
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
                  {mockLocationPayablesData.paymentSchedule.map((week) => (
                    <div key={week.week} className="p-4 rounded-lg bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-700/50 dark:to-blue-900/20">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-lg">{week.week}</h4>
                        {week.urgent > 0 && (
                          <Badge className="bg-red-100 text-red-800 border-red-200">
                            {week.urgent} urgent
                          </Badge>
                        )}
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-slate-600 dark:text-slate-400">Amount:</span>
                          <span className="font-bold text-xl">{formatCurrency(week.amount)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600 dark:text-slate-400">Invoices:</span>
                          <span className="font-medium">{week.invoices}</span>
                        </div>
                      </div>
                    </div>
                  ))}
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