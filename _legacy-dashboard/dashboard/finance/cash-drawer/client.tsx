"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Wallet,
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
  Target,
  Lock,
  Unlock,
  Activity,
  Eye,
  Calculator,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  Minus
} from "lucide-react"

// Comprehensive mock data structure for location-based cash drawer analysis
const mockCashDrawerData = {
  overview: {
    totalBalance: 186750,
    totalDrawers: 12,
    activeDrawers: 8,
    totalTransactions: 2847,
    totalDeposits: 145620,
    totalWithdrawals: 89340,
    avgDrawerBalance: 15562
  },
  locations: [
    {
      id: "1",
      name: "Downtown Store",
      address: "123 Main St, Downtown",
      drawers: [
        {
          id: "DR001",
          name: "Main Register",
          stationId: "STATION-001",
          status: "OPEN",
          currentBalance: 2850,
          expectedBalance: 2750,
          variance: 100,
          lastActivity: "2024-10-14T14:30:00Z",
          openedBy: "John Doe",
          transactions: 156,
          deposits: 12,
          withdrawals: 8
        },
        {
          id: "DR002",
          name: "Express Lane",
          stationId: "STATION-002",
          status: "OPEN",
          currentBalance: 1890,
          expectedBalance: 1850,
          variance: 40,
          lastActivity: "2024-10-14T13:45:00Z",
          openedBy: "Jane Smith",
          transactions: 98,
          deposits: 6,
          withdrawals: 3
        },
        {
          id: "DR003",
          name: "Customer Service",
          stationId: "STATION-003",
          status: "CLOSED",
          currentBalance: 0,
          expectedBalance: 0,
          variance: 0,
          lastActivity: "2024-10-13T18:00:00Z",
          openedBy: "Mike Johnson",
          transactions: 45,
          deposits: 2,
          withdrawals: 1
        }
      ],
      metrics: {
        totalBalance: 4740,
        activeDrawers: 2,
        averageBalance: 2370,
        totalVariance: 140,
        efficiency: 0.94,
        dailyTransactions: 299
      }
    },
    {
      id: "2",
      name: "Mall Location",
      address: "456 Shopping Center",
      drawers: [
        {
          id: "DR004",
          name: "Register 1",
          stationId: "STATION-004",
          status: "OPEN",
          currentBalance: 3240,
          expectedBalance: 3150,
          variance: 90,
          lastActivity: "2024-10-14T15:15:00Z",
          openedBy: "Sarah Wilson",
          transactions: 187,
          deposits: 14,
          withdrawals: 9
        },
        {
          id: "DR005",
          name: "Register 2",
          stationId: "STATION-005",
          status: "OPEN",
          currentBalance: 2780,
          expectedBalance: 2720,
          variance: 60,
          lastActivity: "2024-10-14T14:50:00Z",
          openedBy: "David Brown",
          transactions: 143,
          deposits: 11,
          withdrawals: 6
        }
      ],
      metrics: {
        totalBalance: 6020,
        activeDrawers: 2,
        averageBalance: 3010,
        totalVariance: 150,
        efficiency: 0.97,
        dailyTransactions: 330
      }
    },
    {
      id: "3",
      name: "Airport Branch",
      address: "789 Terminal Rd",
      drawers: [
        {
          id: "DR006",
          name: "Terminal Register",
          stationId: "STATION-006",
          status: "OPEN",
          currentBalance: 4150,
          expectedBalance: 4050,
          variance: 100,
          lastActivity: "2024-10-14T16:20:00Z",
          openedBy: "Lisa Garcia",
          transactions: 234,
          deposits: 18,
          withdrawals: 12
        }
      ],
      metrics: {
        totalBalance: 4150,
        activeDrawers: 1,
        averageBalance: 4150,
        totalVariance: 100,
        efficiency: 0.98,
        dailyTransactions: 234
      }
    },
    {
      id: "4",
      name: "Suburban Outlet",
      address: "321 Suburb Ave",
      drawers: [
        {
          id: "DR007",
          name: "Main Counter",
          stationId: "STATION-007",
          status: "OPEN",
          currentBalance: 1920,
          expectedBalance: 1880,
          variance: 40,
          lastActivity: "2024-10-14T15:45:00Z",
          openedBy: "Tom Anderson",
          transactions: 89,
          deposits: 7,
          withdrawals: 4
        },
        {
          id: "DR008",
          name: "Self-Checkout",
          stationId: "STATION-008",
          status: "CLOSED",
          currentBalance: 0,
          expectedBalance: 0,
          variance: 0,
          lastActivity: "2024-10-13T20:00:00Z",
          openedBy: "Amy Davis",
          transactions: 56,
          deposits: 3,
          withdrawals: 2
        }
      ],
      metrics: {
        totalBalance: 1920,
        activeDrawers: 1,
        averageBalance: 1920,
        totalVariance: 40,
        efficiency: 0.98,
        dailyTransactions: 145
      }
    }
  ],
  recentTransactions: [
    {
      id: "TXN001",
      type: "DEPOSIT",
      amount: 500,
      drawerId: "DR001",
      drawerName: "Main Register",
      location: "Downtown Store",
      timestamp: "2024-10-14T14:30:00Z",
      user: "John Doe",
      reason: "Cash deposit from sales",
      balanceBefore: 2350,
      balanceAfter: 2850
    },
    {
      id: "TXN002",
      type: "WITHDRAWAL",
      amount: 200,
      drawerId: "DR004",
      drawerName: "Register 1",
      location: "Mall Location",
      timestamp: "2024-10-14T14:15:00Z",
      user: "Sarah Wilson",
      reason: "Change for large bill",
      balanceBefore: 3440,
      balanceAfter: 3240
    },
    {
      id: "TXN003",
      type: "DEPOSIT",
      amount: 750,
      drawerId: "DR006",
      drawerName: "Terminal Register",
      location: "Airport Branch",
      timestamp: "2024-10-14T13:45:00Z",
      user: "Lisa Garcia",
      reason: "End of shift deposit",
      balanceBefore: 3400,
      balanceAfter: 4150
    },
    {
      id: "TXN004",
      type: "OPENING_BALANCE",
      amount: 1500,
      drawerId: "DR002",
      drawerName: "Express Lane",
      location: "Downtown Store",
      timestamp: "2024-10-14T08:00:00Z",
      user: "Jane Smith",
      reason: "Morning opening balance",
      balanceBefore: 0,
      balanceAfter: 1500
    },
    {
      id: "TXN005",
      type: "WITHDRAWAL",
      amount: 100,
      drawerId: "DR005",
      drawerName: "Register 2",
      location: "Mall Location",
      timestamp: "2024-10-14T12:30:00Z",
      user: "David Brown",
      reason: "Petty cash withdrawal",
      balanceBefore: 2880,
      balanceAfter: 2780
    }
  ],
  analytics: {
    dailyTrends: [
      { day: "Monday", balance: 145200, transactions: 234, variance: 150 },
      { day: "Tuesday", balance: 158600, transactions: 267, variance: 200 },
      { day: "Wednesday", balance: 162400, transactions: 289, variance: 180 },
      { day: "Thursday", balance: 159800, transactions: 276, variance: 160 },
      { day: "Friday", balance: 186750, transactions: 324, variance: 190 },
      { day: "Saturday", balance: 195400, transactions: 356, variance: 220 },
      { day: "Sunday", balance: 172300, transactions: 298, variance: 170 }
    ],
    varianceAnalysis: [
      { period: "Perfect Match (±$0)", count: 2, percentage: 16.7, color: "bg-green-500" },
      { period: "Minor Variance (±$1-50)", count: 5, percentage: 41.7, color: "bg-yellow-500" },
      { period: "Moderate Variance (±$51-100)", count: 4, percentage: 33.3, color: "bg-orange-500" },
      { period: "High Variance (±$100+)", count: 1, percentage: 8.3, color: "bg-red-500" }
    ]
  }
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
    case "OPEN":
      return <Badge className="bg-green-100 text-green-800 border-green-200">Open</Badge>
    case "CLOSED":
      return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Closed</Badge>
    case "RECONCILING":
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Reconciling</Badge>
    default:
      return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Unknown</Badge>
  }
}

const getVarianceBadge = (variance: number) => {
  if (variance === 0) {
    return <Badge className="bg-green-100 text-green-800 border-green-200">Perfect</Badge>
  } else if (Math.abs(variance) <= 50) {
    return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Minor</Badge>
  } else if (Math.abs(variance) <= 100) {
    return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Moderate</Badge>
  } else {
    return <Badge className="bg-red-100 text-red-800 border-red-200">High</Badge>
  }
}

const getTransactionIcon = (type: string) => {
  switch (type) {
    case "DEPOSIT":
      return <ArrowUpRight className="w-4 h-4 text-green-600" />
    case "WITHDRAWAL":
      return <ArrowDownLeft className="w-4 h-4 text-red-600" />
    case "OPENING_BALANCE":
      return <Plus className="w-4 h-4 text-blue-600" />
    case "CLOSING_BALANCE":
      return <Minus className="w-4 h-4 text-gray-600" />
    default:
      return <Activity className="w-4 h-4 text-gray-600" />
  }
}

export default function CashDrawerAnalyticsClient() {
  const [selectedPeriod, setSelectedPeriod] = useState("today")
  const [selectedLocation, setSelectedLocation] = useState("all")
  const [selectedDrawer, setSelectedDrawer] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState("locations")

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsRefreshing(false)
  }

  const filteredLocations = useMemo(() => {
    return mockCashDrawerData.locations.filter(location =>
      location.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [searchTerm])

  const selectedDrawerData = useMemo(() => {
    if (!selectedDrawer) return null
    for (const location of mockCashDrawerData.locations) {
      const drawer = location.drawers.find(d => d.id === selectedDrawer)
      if (drawer) {
        return { ...drawer, locationName: location.name }
      }
    }
    return null
  }, [selectedDrawer])

  const allDrawers = useMemo(() => {
    return mockCashDrawerData.locations.flatMap(location =>
      location.drawers.map(drawer => ({
        ...drawer,
        locationName: location.name,
        locationId: location.id
      }))
    )
  }, [])

  const filteredDrawers = useMemo(() => {
    let drawers = allDrawers

    if (searchTerm) {
      drawers = drawers.filter(drawer =>
        drawer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        drawer.locationName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedLocation !== "all") {
      drawers = drawers.filter(drawer => drawer.locationId === selectedLocation)
    }

    return drawers
  }, [allDrawers, searchTerm, selectedLocation])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/30 to-emerald-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-4 sm:py-8">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25">
                <Wallet className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                  Cash Drawer Analytics
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  Comprehensive location-based cash drawer management and analysis
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-48 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="yesterday">Yesterday</SelectItem>
                  <SelectItem value="this-week">This Week</SelectItem>
                  <SelectItem value="last-week">Last Week</SelectItem>
                  <SelectItem value="this-month">This Month</SelectItem>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-6 mb-8">
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
                  <p className="text-sm text-emerald-600/80 font-medium">Total Balance</p>
                  <p className="text-2xl font-bold text-emerald-700">
                    {formatCurrency(mockCashDrawerData.overview.totalBalance)}
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
                    {mockCashDrawerData.locations.length}
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
                  <Wallet className="w-6 h-6 text-indigo-700" />
                </div>
                <div>
                  <p className="text-sm text-indigo-600/80 font-medium">Total Drawers</p>
                  <p className="text-2xl font-bold text-indigo-700">
                    {mockCashDrawerData.overview.totalDrawers}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-2 border-green-300/30 bg-gradient-to-br from-green-400/20 via-emerald-400/10 to-teal-400/20 backdrop-blur-xl shadow-2xl ring-1 ring-white/20 hover:shadow-3xl hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 ease-out group">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/20 to-transparent rounded-bl-full" />
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-white/10 to-transparent rounded-tr-full" />
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-green-500/20 animate-pulse" />
              <div className="absolute top-8 right-8 w-1 h-1 rounded-full bg-green-500/20 animate-pulse delay-200" />
              <div className="absolute bottom-6 right-6 w-1.5 h-1.5 rounded-full bg-green-500/20 animate-pulse delay-500" />
            </div>
            <CardContent className="relative z-10 p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-green-500/20 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <CheckCircle className="w-6 h-6 text-green-700" />
                </div>
                <div>
                  <p className="text-sm text-green-600/80 font-medium">Active Drawers</p>
                  <p className="text-2xl font-bold text-green-700">
                    {mockCashDrawerData.overview.activeDrawers}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-2 border-blue-300/30 bg-gradient-to-br from-blue-400/20 via-cyan-400/10 to-indigo-400/20 backdrop-blur-xl shadow-2xl ring-1 ring-white/20 hover:shadow-3xl hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 ease-out group">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/20 to-transparent rounded-bl-full" />
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-white/10 to-transparent rounded-tr-full" />
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-blue-500/20 animate-pulse" />
              <div className="absolute top-8 right-8 w-1 h-1 rounded-full bg-blue-500/20 animate-pulse delay-200" />
              <div className="absolute bottom-6 right-6 w-1.5 h-1.5 rounded-full bg-blue-500/20 animate-pulse delay-500" />
            </div>
            <CardContent className="relative z-10 p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-blue-500/20 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Activity className="w-6 h-6 text-blue-700" />
                </div>
                <div>
                  <p className="text-sm text-blue-600/80 font-medium">Transactions</p>
                  <p className="text-2xl font-bold text-blue-700">
                    {mockCashDrawerData.overview.totalTransactions}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

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
                  <ArrowUpRight className="w-6 h-6 text-purple-700" />
                </div>
                <div>
                  <p className="text-sm text-purple-600/80 font-medium">Deposits</p>
                  <p className="text-2xl font-bold text-purple-700">
                    {formatCurrency(mockCashDrawerData.overview.totalDeposits)}
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
                  <ArrowDownLeft className="w-6 h-6 text-amber-700" />
                </div>
                <div>
                  <p className="text-sm text-amber-600/80 font-medium">Withdrawals</p>
                  <p className="text-2xl font-bold text-amber-700">
                    {formatCurrency(mockCashDrawerData.overview.totalWithdrawals)}
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
                    placeholder="Search locations or drawers..."
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
                    {mockCashDrawerData.locations.map((location) => (
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
            <TabsTrigger value="locations" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-600 data-[state=active]:text-white">
              Location Analysis
            </TabsTrigger>
            <TabsTrigger value="drawers" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-600 data-[state=active]:text-white">
              Drawer Overview
            </TabsTrigger>
            <TabsTrigger value="details" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-600 data-[state=active]:text-white">
              Drawer Details
            </TabsTrigger>
            <TabsTrigger value="transactions" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-600 data-[state=active]:text-white">
              Transactions
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-600 data-[state=active]:text-white">
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Location Analysis Tab */}
          <TabsContent value="locations" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredLocations.map((location) => (
                <Card key={location.id} className="relative overflow-hidden border-2 border-emerald-300/30 bg-gradient-to-br from-emerald-400/20 via-teal-400/10 to-cyan-400/20 backdrop-blur-xl shadow-2xl ring-1 ring-white/20 hover:shadow-3xl hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 ease-out group">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/20 to-transparent rounded-bl-full" />
                  <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-white/10 to-transparent rounded-tr-full" />
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-emerald-500/20 animate-pulse" />
                    <div className="absolute top-8 right-8 w-1 h-1 rounded-full bg-emerald-500/20 animate-pulse delay-200" />
                    <div className="absolute bottom-6 right-6 w-1.5 h-1.5 rounded-full bg-emerald-500/20 animate-pulse delay-500" />
                  </div>
                  <CardHeader className="pb-3 relative z-10">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-emerald-500/20 group-hover:scale-110 transition-transform duration-300">
                          <MapPin className="w-5 h-5 text-emerald-700" />
                        </div>
                        <div>
                          <CardTitle className="text-lg font-bold text-emerald-700">{location.name}</CardTitle>
                          <CardDescription className="text-sm text-emerald-600/80">{location.address}</CardDescription>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300">
                        {location.drawers.length} drawers
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 relative z-10">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                        <p className="text-sm text-green-700 dark:text-green-300">Total Balance</p>
                        <p className="text-xl font-bold text-green-900 dark:text-green-100">
                          {formatCurrency(location.metrics.totalBalance)}
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
                        <p className="text-sm text-blue-700 dark:text-blue-300">Active Drawers</p>
                        <p className="text-xl font-bold text-blue-900 dark:text-blue-100">
                          {location.metrics.activeDrawers}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Avg Balance</p>
                        <p className="font-semibold">{formatCurrency(location.metrics.averageBalance)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Transactions</p>
                        <p className="font-semibold">{location.metrics.dailyTransactions}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Efficiency</p>
                        <p className="font-semibold">{formatPercentage(location.metrics.efficiency * 100)}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Cash Drawers:</p>
                      <div className="space-y-2">
                        {location.drawers.map((drawer) => (
                          <div key={drawer.id} className="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-slate-700/50">
                            <div className="flex items-center gap-2">
                              {drawer.status === "OPEN" ? (
                                <Unlock className="w-4 h-4 text-green-600" />
                              ) : (
                                <Lock className="w-4 h-4 text-gray-600" />
                              )}
                              <div>
                                <p className="text-sm font-medium">{drawer.name}</p>
                                <p className="text-xs text-slate-600 dark:text-slate-400">{drawer.transactions} transactions</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold">{formatCurrency(drawer.currentBalance)}</p>
                              {getStatusBadge(drawer.status)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-medium text-green-600">
                          {formatPercentage(location.metrics.efficiency * 100)} efficiency
                        </span>
                      </div>
                      {Math.abs(location.metrics.totalVariance) > 100 && (
                        <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                          High Variance
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Drawer Overview Tab */}
          <TabsContent value="drawers" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {filteredDrawers.map((drawer) => (
                <Card
                  key={drawer.id}
                  className="relative overflow-hidden border-2 border-indigo-300/30 bg-gradient-to-br from-indigo-400/20 via-blue-400/10 to-cyan-400/20 backdrop-blur-xl shadow-2xl ring-1 ring-white/20 hover:shadow-3xl hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 ease-out cursor-pointer group"
                  onClick={() => {
                    setSelectedDrawer(drawer.id)
                    setActiveTab("details")
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
                        <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg group-hover:scale-110 transition-transform duration-300">
                          <Wallet className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-slate-900 dark:text-white">{drawer.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            {getStatusBadge(drawer.status)}
                            <Badge variant="outline">
                              {drawer.locationName}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">
                          {formatCurrency(drawer.currentBalance)}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Current Balance</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                      <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                        <p className="text-sm text-slate-600 dark:text-slate-400">Expected</p>
                        <p className="font-bold text-lg">{formatCurrency(drawer.expectedBalance)}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                        <p className="text-sm text-slate-600 dark:text-slate-400">Variance</p>
                        <p className={`font-bold text-lg ${drawer.variance === 0 ? 'text-green-600' : Math.abs(drawer.variance) > 50 ? 'text-red-600' : 'text-yellow-600'}`}>
                          {drawer.variance >= 0 ? '+' : ''}{formatCurrency(drawer.variance)}
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                        <p className="text-sm text-slate-600 dark:text-slate-400">Transactions</p>
                        <p className="font-bold text-lg">{drawer.transactions}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                        <p className="text-sm text-slate-600 dark:text-slate-400">Opened By</p>
                        <p className="font-bold text-lg">{drawer.openedBy}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-500" />
                        <span className="text-sm text-slate-600">
                          Last activity: {new Date(drawer.lastActivity).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {getVarianceBadge(drawer.variance)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Drawer Details Tab */}
          <TabsContent value="details" className="space-y-6">
            {selectedDrawerData ? (
              <>
                <Card className="relative overflow-hidden border-2 border-emerald-300/30 bg-gradient-to-br from-emerald-400/20 via-teal-400/10 to-cyan-400/20 backdrop-blur-xl shadow-2xl ring-1 ring-white/20">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/20 to-transparent rounded-bl-full" />
                  <CardHeader className="relative z-10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
                          <Wallet className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-2xl">{selectedDrawerData.name}</CardTitle>
                          <CardDescription>Station: {selectedDrawerData.stationId} • {selectedDrawerData.locationName}</CardDescription>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-slate-900 dark:text-white">
                          {formatCurrency(selectedDrawerData.currentBalance)}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Current Balance</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6 relative z-10">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
                        <p className="text-sm text-blue-700 dark:text-blue-300">Expected Balance</p>
                        <p className="text-xl font-bold text-blue-900 dark:text-blue-100">
                          {formatCurrency(selectedDrawerData.expectedBalance)}
                        </p>
                      </div>
                      <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20">
                        <p className="text-sm text-purple-700 dark:text-purple-300">Variance</p>
                        <p className={`text-xl font-bold ${selectedDrawerData.variance === 0 ? 'text-green-600' : selectedDrawerData.variance > 0 ? 'text-blue-600' : 'text-red-600'}`}>
                          {selectedDrawerData.variance >= 0 ? '+' : ''}{formatCurrency(selectedDrawerData.variance)}
                        </p>
                      </div>
                      <div className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                        <p className="text-sm text-green-700 dark:text-green-300">Transactions</p>
                        <p className="text-xl font-bold text-green-900 dark:text-green-100">
                          {selectedDrawerData.transactions}
                        </p>
                      </div>
                      <div className="p-4 rounded-lg bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20">
                        <p className="text-sm text-yellow-700 dark:text-yellow-300">Status</p>
                        <div className="flex items-center gap-2 mt-1">
                          {selectedDrawerData.status === "OPEN" ? (
                            <Unlock className="w-5 h-5 text-green-600" />
                          ) : (
                            <Lock className="w-5 h-5 text-red-600" />
                          )}
                          <span className="text-xl font-bold text-yellow-900 dark:text-yellow-100">
                            {selectedDrawerData.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                        <div className="flex items-center gap-2 mb-2">
                          <ArrowUpRight className="w-4 h-4 text-green-600" />
                          <span className="font-medium">Deposits</span>
                        </div>
                        <p className="text-2xl font-bold">{selectedDrawerData.deposits}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                        <div className="flex items-center gap-2 mb-2">
                          <ArrowDownLeft className="w-4 h-4 text-red-600" />
                          <span className="font-medium">Withdrawals</span>
                        </div>
                        <p className="text-2xl font-bold">{selectedDrawerData.withdrawals}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                        <div className="flex items-center gap-2 mb-2">
                          <Eye className="w-4 h-4 text-blue-600" />
                          <span className="font-medium">Opened By</span>
                        </div>
                        <p className="text-lg font-bold">{selectedDrawerData.openedBy}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-0 shadow-xl">
                <CardContent className="p-12 text-center">
                  <Wallet className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Select a Cash Drawer
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    Choose a cash drawer from the Drawer Overview tab to view detailed information and analytics.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-6">
            <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Recent Transactions
                </CardTitle>
                <CardDescription>Latest cash drawer transactions across all locations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockCashDrawerData.recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          {getTransactionIcon(transaction.type)}
                          <div>
                            <p className="font-medium text-lg">{transaction.drawerName}</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              {transaction.location} • {transaction.user}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              {transaction.reason} • {new Date(transaction.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-xl font-bold ${transaction.type === 'DEPOSIT' ? 'text-green-600' : transaction.type === 'WITHDRAWAL' ? 'text-red-600' : 'text-blue-600'}`}>
                            {transaction.type === 'WITHDRAWAL' ? '-' : '+'}
                            {formatCurrency(transaction.amount)}
                          </p>
                          <Badge variant="outline" className="mt-1">
                            {transaction.type.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm pt-2 border-t border-slate-200 dark:border-slate-600">
                        <span className="text-slate-600 dark:text-slate-400">
                          Balance: {formatCurrency(transaction.balanceBefore)} → {formatCurrency(transaction.balanceAfter)}
                        </span>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Variance Analysis
                </CardTitle>
                <CardDescription>Cash drawer variance breakdown across all locations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {mockCashDrawerData.analytics.varianceAnalysis.map((variance) => (
                    <div key={variance.period} className="p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded-full ${variance.color} shadow-lg`}></div>
                          <div>
                            <p className="font-semibold text-lg">{variance.period}</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              {variance.count} drawers • {formatPercentage(variance.percentage)} of total
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${variance.color}`}
                          style={{ width: `${variance.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}