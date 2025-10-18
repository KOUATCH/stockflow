"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CustomerDetailsModal } from "@/components/finance/CustomerDetailsModal"
import {
  Users,
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
  Target
} from "lucide-react"

// Comprehensive mock data structure for location-based analysis
const mockLocationReceivablesData = {
  overview: {
    totalReceivables: 456780,
    totalLocations: 5,
    totalCustomers: 18,
    overdueReceivables: 89420,
    avgCollectionDays: 28,
    totalInvoices: 892
  },
  locations: [
    {
      id: "1",
      name: "Downtown Store",
      address: "123 Main St, Downtown",
      receivables: {
        total: 189340,
        current: 167890,
        overdue: 21450,
        customers: 6,
        avgDays: 24,
        invoices: 234
      },
      metrics: {
        monthlyAvg: 178000,
        growth: 6.4,
        collectionRate: 0.91,
        criticalCustomers: 1
      }
    },
    {
      id: "2",
      name: "Mall Location",
      address: "456 Shopping Center",
      receivables: {
        total: 156780,
        current: 124560,
        overdue: 32220,
        customers: 8,
        avgDays: 28,
        invoices: 189
      },
      metrics: {
        monthlyAvg: 145000,
        growth: 8.1,
        collectionRate: 0.87,
        criticalCustomers: 2
      }
    },
    {
      id: "3",
      name: "Airport Branch",
      address: "789 Terminal Rd",
      receivables: {
        total: 67850,
        current: 59200,
        overdue: 8650,
        customers: 4,
        avgDays: 22,
        invoices: 145
      },
      metrics: {
        monthlyAvg: 62000,
        growth: 9.4,
        collectionRate: 0.94,
        criticalCustomers: 0
      }
    },
    {
      id: "4",
      name: "Suburban Outlet",
      address: "321 Suburb Ave",
      receivables: {
        total: 42810,
        current: 39330,
        overdue: 3480,
        customers: 3,
        avgDays: 19,
        invoices: 324
      },
      metrics: {
        monthlyAvg: 38000,
        growth: 12.6,
        collectionRate: 0.97,
        criticalCustomers: 0
      }
    }
  ],
  customers: [
    {
      id: "1",
      name: "Premium Retail Corp",
      email: "finance@premiumretail.com",
      phone: "+1 (555) 123-4567",
      address: "789 Business Plaza, Suite 200",
      totalOwed: 67850,
      currentAmount: 59200,
      overdueAmount: 8650,
      creditLimit: 100000,
      paymentHistory: 0.89,
      riskScore: "LOW" as const,
      locations: [
        { locationId: "1", locationName: "Downtown Store", amount: 34500, invoices: 12, status: "CURRENT" },
        { locationId: "2", locationName: "Mall Location", amount: 23350, invoices: 8, status: "CURRENT" },
        { locationId: "3", locationName: "Airport Branch", amount: 10000, invoices: 4, status: "OVERDUE" }
      ],
      metrics: {
        avgPaymentDays: 31,
        utilizationRate: 0.679,
        totalTransactions: 156,
        lastPaymentDate: "2024-10-10",
        registrationDate: "2022-03-15"
      },
      transactions: [
        { id: "T001", date: "2024-10-12", invoice: "INV-2024-1001", amount: 12500, description: "Monthly Service Agreement", dueDate: "2024-11-11", status: "CURRENT", location: "Downtown Store" },
        { id: "T002", date: "2024-10-08", invoice: "INV-2024-0998", amount: 8900, description: "Product Purchase", dueDate: "2024-11-07", status: "CURRENT", location: "Mall Location" },
        { id: "T003", date: "2024-10-15", invoice: "INV-2024-1015", amount: 15600, description: "Consulting Services", dueDate: "2024-11-14", status: "CURRENT", location: "Downtown Store" },
        { id: "T004", date: "2024-09-28", invoice: "INV-2024-0956", amount: 6750, description: "Equipment Rental", dueDate: "2024-10-28", status: "OVERDUE", location: "Airport Branch" }
      ]
    },
    {
      id: "2",
      name: "Global Enterprises Ltd",
      email: "ap@globalent.com",
      phone: "+1 (555) 987-6543",
      address: "456 Corporate Drive",
      totalOwed: 89420,
      currentAmount: 76920,
      overdueAmount: 12500,
      creditLimit: 150000,
      paymentHistory: 0.92,
      riskScore: "LOW" as const,
      locations: [
        { locationId: "1", locationName: "Downtown Store", amount: 45200, invoices: 15, status: "CURRENT" },
        { locationId: "2", locationName: "Mall Location", amount: 32720, invoices: 10, status: "CURRENT" },
        { locationId: "4", locationName: "Suburban Outlet", amount: 11500, invoices: 5, status: "OVERDUE" }
      ],
      metrics: {
        avgPaymentDays: 26,
        utilizationRate: 0.596,
        totalTransactions: 203,
        lastPaymentDate: "2024-10-14",
        registrationDate: "2021-08-22"
      },
      transactions: [
        { id: "T005", date: "2024-10-14", invoice: "INV-2024-1012", amount: 18900, description: "Bulk Order", dueDate: "2024-11-13", status: "CURRENT", location: "Downtown Store" },
        { id: "T006", date: "2024-10-10", invoice: "INV-2024-1005", amount: 12400, description: "Service Contract", dueDate: "2024-11-09", status: "CURRENT", location: "Mall Location" },
        { id: "T007", date: "2024-10-16", invoice: "INV-2024-1018", amount: 24200, description: "Annual Subscription", dueDate: "2024-11-15", status: "CURRENT", location: "Downtown Store" }
      ]
    },
    {
      id: "3",
      name: "Metro Business Solutions",
      email: "billing@metrobiz.com",
      phone: "+1 (555) 456-7890",
      address: "123 Metro Plaza",
      totalOwed: 45780,
      currentAmount: 38900,
      overdueAmount: 6880,
      creditLimit: 75000,
      paymentHistory: 0.84,
      riskScore: "MEDIUM" as const,
      locations: [
        { locationId: "2", locationName: "Mall Location", amount: 28900, invoices: 8, status: "CURRENT" },
        { locationId: "3", locationName: "Airport Branch", amount: 16880, invoices: 6, status: "OVERDUE" }
      ],
      metrics: {
        avgPaymentDays: 38,
        utilizationRate: 0.610,
        totalTransactions: 89,
        lastPaymentDate: "2024-09-28",
        registrationDate: "2023-01-10"
      },
      transactions: [
        { id: "T008", date: "2024-09-20", invoice: "INV-2024-0923", amount: 18900, description: "Project Consulting", dueDate: "2024-10-20", status: "OVERDUE", location: "Mall Location" },
        { id: "T009", date: "2024-10-05", invoice: "INV-2024-0987", amount: 8450, description: "Software License", dueDate: "2024-11-04", status: "CURRENT", location: "Airport Branch" },
        { id: "T010", date: "2024-09-25", invoice: "INV-2024-0935", amount: 10000, description: "Support Services", dueDate: "2024-10-25", status: "OVERDUE", location: "Mall Location" }
      ]
    }
  ],
  agingAnalysis: {
    buckets: [
      { period: "Current (0-30 days)", amount: 334560, percentage: 73.2, count: 652, color: "bg-green-500" },
      { period: "31-60 days", amount: 67890, percentage: 14.9, count: 156, color: "bg-yellow-500" },
      { period: "61-90 days", amount: 32220, percentage: 7.1, count: 58, color: "bg-orange-500" },
      { period: "90+ days", amount: 22110, percentage: 4.8, count: 26, color: "bg-red-500" }
    ]
  },
  collectionSchedule: [
    { week: "This Week", amount: 67850, invoices: 18, urgent: 2 },
    { week: "Next Week", amount: 89420, invoices: 24, urgent: 1 },
    { week: "Week 3", amount: 45780, invoices: 15, urgent: 0 },
    { week: "Week 4", amount: 58900, invoices: 21, urgent: 3 }
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

export default function CustomerReceivablesClient() {
  const [selectedPeriod, setSelectedPeriod] = useState("current-month")
  const [selectedLocation, setSelectedLocation] = useState("all")
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState("locations")
  const [customerModalOpen, setCustomerModalOpen] = useState(false)
  const [selectedCustomerForModal, setSelectedCustomerForModal] = useState<any>(null)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsRefreshing(false)
  }

  const filteredCustomers = useMemo(() => {
    let customers = mockLocationReceivablesData.customers

    if (searchTerm) {
      customers = customers.filter(customer =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedLocation !== "all") {
      customers = customers.filter(customer =>
        customer.locations.some(loc => loc.locationId === selectedLocation)
      )
    }

    return customers
  }, [searchTerm, selectedLocation])

  const selectedCustomerData = useMemo(() => {
    if (!selectedCustomer) return null
    return mockLocationReceivablesData.customers.find(c => c.id === selectedCustomer)
  }, [selectedCustomer])

  const filteredLocations = useMemo(() => {
    return mockLocationReceivablesData.locations.filter(location =>
      location.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [searchTerm])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-4 sm:py-8">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg shadow-blue-500/25">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                  Customer Receivables Analytics
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  Comprehensive location-based customer payment tracking
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
          <Card className="relative overflow-hidden border-2 border-emerald-300/30 bg-gradient-to-br from-emerald-400/20 via-teal-400/10 to-cyan-400/20 backdrop-blur-xl shadow-2xl ring-1 ring-white/20 hover:shadow-3xl hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 ease-out group">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/20 to-transparent rounded-bl-full" />
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-white/10 to-transparent rounded-tr-full" />
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-emerald-500/20 animate-pulse" />
              <div className="absolute top-8 right-8 w-1 h-1 rounded-full bg-emerald-500/20 animate-pulse delay-200" />
              <div className="absolute bottom-6 right-6 w-1.5 h-1.5 rounded-full bg-emerald-500/20 animate-pulse delay-500" />
            </div>
            <CardContent className="relative z-10 p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-emerald-500/20 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <DollarSign className="w-6 h-6 text-emerald-700" />
                </div>
                <div>
                  <p className="text-sm text-emerald-600/80 font-medium">Total Receivables</p>
                  <p className="text-2xl font-bold text-emerald-700">
                    {formatCurrency(mockLocationReceivablesData.overview.totalReceivables)}
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
                    {mockLocationReceivablesData.overview.totalLocations}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-2 border-indigo-300/30 bg-gradient-to-br from-indigo-400/20 via-purple-400/10 to-violet-400/20 backdrop-blur-xl shadow-2xl ring-1 ring-white/20 hover:shadow-3xl hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 ease-out group">
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
                  <p className="text-sm text-indigo-600/80 font-medium">Customers</p>
                  <p className="text-2xl font-bold text-indigo-700">
                    {mockLocationReceivablesData.overview.totalCustomers}
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
                    {formatCurrency(mockLocationReceivablesData.overview.overdueReceivables)}
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
                    {mockLocationReceivablesData.overview.avgCollectionDays}
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
                    {mockLocationReceivablesData.overview.totalInvoices}
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
                    placeholder="Search locations or customers..."
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
                    {mockLocationReceivablesData.locations.map((location) => (
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
            <TabsTrigger value="locations" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-600 data-[state=active]:text-white">
              Location Analysis
            </TabsTrigger>
            <TabsTrigger value="customers" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-600 data-[state=active]:text-white">
              Customer Overview
            </TabsTrigger>
            <TabsTrigger value="details" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-600 data-[state=active]:text-white">
              Customer Details
            </TabsTrigger>
            <TabsTrigger value="aging" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-600 data-[state=active]:text-white">
              Aging Analysis
            </TabsTrigger>
            <TabsTrigger value="collections" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-600 data-[state=active]:text-white">
              Collection Schedule
            </TabsTrigger>
          </TabsList>

          {/* Location Analysis Tab */}
          <TabsContent value="locations" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredLocations.map((location) => (
                <Card key={location.id} className="relative overflow-hidden border-2 border-blue-300/30 bg-gradient-to-br from-blue-400/20 via-cyan-400/10 to-indigo-400/20 backdrop-blur-xl shadow-2xl ring-1 ring-white/20 hover:shadow-3xl hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 ease-out group">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/20 to-transparent rounded-bl-full" />
                  <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-white/10 to-transparent rounded-tr-full" />
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-blue-500/20 animate-pulse" />
                    <div className="absolute top-8 right-8 w-1 h-1 rounded-full bg-blue-500/20 animate-pulse delay-200" />
                    <div className="absolute bottom-6 right-6 w-1.5 h-1.5 rounded-full bg-blue-500/20 animate-pulse delay-500" />
                  </div>
                  <CardHeader className="pb-3 relative z-10">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-500/20 group-hover:scale-110 transition-transform duration-300">
                          <MapPin className="w-5 h-5 text-blue-700" />
                        </div>
                        <div>
                          <CardTitle className="text-lg font-bold text-blue-700">{location.name}</CardTitle>
                          <CardDescription className="text-sm text-blue-600/80">{location.address}</CardDescription>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300">
                        {location.receivables.customers} customers
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 relative z-10">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                        <p className="text-sm text-green-700 dark:text-green-300">Total Receivables</p>
                        <p className="text-xl font-bold text-green-900 dark:text-green-100">
                          {formatCurrency(location.receivables.total)}
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20">
                        <p className="text-sm text-red-700 dark:text-red-300">Overdue</p>
                        <p className="text-xl font-bold text-red-900 dark:text-red-100">
                          {formatCurrency(location.receivables.overdue)}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Avg Days</p>
                        <p className="font-semibold">{location.receivables.avgDays}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Invoices</p>
                        <p className="font-semibold">{location.receivables.invoices}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Collection Rate</p>
                        <p className="font-semibold">{formatPercentage(location.metrics.collectionRate * 100)}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-medium text-green-600">
                          +{formatPercentage(location.metrics.growth)} growth
                        </span>
                      </div>
                      {location.metrics.criticalCustomers > 0 && (
                        <Badge className="bg-red-100 text-red-800 border-red-200">
                          {location.metrics.criticalCustomers} critical
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Customer Overview Tab */}
          <TabsContent value="customers" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {filteredCustomers.map((customer) => (
                <Card
                  key={customer.id}
                  className="relative overflow-hidden border-2 border-indigo-300/30 bg-gradient-to-br from-indigo-400/20 via-blue-400/10 to-cyan-400/20 backdrop-blur-xl shadow-2xl ring-1 ring-white/20 hover:shadow-3xl hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 ease-out cursor-pointer group"
                  onClick={() => {
                    setSelectedCustomerForModal(customer)
                    setCustomerModalOpen(true)
                  }}
                >
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/20 to-transparent rounded-bl-full" />
                  <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-white/10 to-transparent rounded-tr-full" />
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-indigo-500/20 animate-pulse" />
                    <div className="absolute top-8 right-8 w-1 h-1 rounded-full bg-indigo-500/20 animate-pulse delay-200" />
                    <div className="absolute bottom-6 right-6 w-1.5 h-1.5 rounded-full bg-indigo-500/20 animate-pulse delay-500" />
                  </div>
                  <CardContent className="p-6 relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg group-hover:scale-110 transition-transform duration-300">
                          <Users className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-slate-900 dark:text-white">{customer.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            {getRiskBadge(customer.riskScore)}
                            <Badge variant="outline">
                              {customer.locations.length} locations
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">
                          {formatCurrency(customer.totalOwed)}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Total Outstanding</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                      <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                        <p className="text-sm text-slate-600 dark:text-slate-400">Avg Payment Days</p>
                        <p className="font-bold text-lg">{customer.metrics.avgPaymentDays}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                        <p className="text-sm text-slate-600 dark:text-slate-400">Credit Utilization</p>
                        <p className="font-bold text-lg">{formatPercentage(customer.metrics.utilizationRate * 100)}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                        <p className="text-sm text-slate-600 dark:text-slate-400">Payment History</p>
                        <p className="font-bold text-lg">{formatPercentage(customer.paymentHistory * 100)}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                        <p className="text-sm text-slate-600 dark:text-slate-400">Credit Limit</p>
                        <p className="font-bold text-lg">{formatCurrency(customer.creditLimit)}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Location Breakdown:</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {customer.locations.map((location) => (
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

          {/* Customer Details Tab */}
          <TabsContent value="details" className="space-y-6">
            {selectedCustomerData ? (
              <>
                <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-0 shadow-xl">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg">
                          <Users className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-2xl">{selectedCustomerData.name}</CardTitle>
                          <CardDescription>Detailed customer analysis and transaction history</CardDescription>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-slate-900 dark:text-white">
                          {formatCurrency(selectedCustomerData.totalOwed)}
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
                          {formatCurrency(selectedCustomerData.creditLimit)}
                        </p>
                      </div>
                      <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20">
                        <p className="text-sm text-purple-700 dark:text-purple-300">Utilization Rate</p>
                        <p className="text-xl font-bold text-purple-900 dark:text-purple-100">
                          {formatPercentage(selectedCustomerData.metrics.utilizationRate * 100)}
                        </p>
                      </div>
                      <div className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                        <p className="text-sm text-green-700 dark:text-green-300">Payment History</p>
                        <p className="text-xl font-bold text-green-900 dark:text-green-100">
                          {formatPercentage(selectedCustomerData.paymentHistory * 100)}
                        </p>
                      </div>
                      <div className="p-4 rounded-lg bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20">
                        <p className="text-sm text-yellow-700 dark:text-yellow-300">Avg Payment Days</p>
                        <p className="text-xl font-bold text-yellow-900 dark:text-yellow-100">
                          {selectedCustomerData.metrics.avgPaymentDays}
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
                    <CardDescription>Latest customer transactions and invoices</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedCustomerData.transactions.map((transaction) => (
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
                                Send Invoice
                              </Button>
                              <Button size="sm" variant="outline">
                                <Calendar className="w-4 h-4 mr-2" />
                                Follow Up
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
                  <Users className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Select a Customer
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    Choose a customer from the Customer Overview tab to view detailed transaction history and analytics.
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
                  Accounts Receivable Aging Analysis
                </CardTitle>
                <CardDescription>Breakdown of receivables by aging periods across all locations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {mockLocationReceivablesData.agingAnalysis.buckets.map((bucket) => (
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

          {/* Collection Schedule Tab */}
          <TabsContent value="collections" className="space-y-6">
            <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Collection Schedule
                </CardTitle>
                <CardDescription>Weekly collection schedule and priority breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {mockLocationReceivablesData.collectionSchedule.map((week) => (
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

        {/* Customer Details Modal */}
        <CustomerDetailsModal
          customer={selectedCustomerForModal}
          open={customerModalOpen}
          onOpenChange={setCustomerModalOpen}
        />
      </div>
    </div>
  )
}