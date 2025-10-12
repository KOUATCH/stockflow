"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useEffect, useState } from "react"

import { AlertCenter } from "@/components/cashSystem/alerts/alert-center"
import { RealTimeStatusBar } from "@/components/cashSystem/alerts/real-time-status-bar"
import { VarianceMonitor } from "@/components/cashSystem/alerts/variance-monitor"
import { CashDrawerManager } from "@/components/cashSystem/cash-drawer/cash-drawer-manager"
import { AnalyticsDashboard } from "@/components/cashSystem/reports/analytics-dashboard"
import { CashReconciliationReportComponent } from "@/components/cashSystem/reports/cash-reconciliation-report"
import { useLowStockMonitoring, useRealTimeBalanceTracking, useSystemMonitoring } from "@/hooks/cashDrawer/use-real-time-tracking"
import { useItemsWithInventory } from "@/hooks/inventoryHooks/useInventoryWithIinventoryHooks"
import { usePosStations } from "@/hooks/pOSStation/usepOSStationHooks"
import { useOrgLocationsNew } from "@/hooks/useAllLocationsQueries"
import { useCustomers } from "@/hooks/useCustomerQueries"
import { format } from "date-fns"
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CaseLower as CashRegister,
  CheckCircle,
  Clock,
  DollarSign,
  FileText,
  Monitor,
  Package,
  RefreshCw,
  Settings,
  ShoppingCart,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react"
import { useClientAuth } from "@/hooks/useClientAuth"

export default function HomePage() {
  const [selectedLocation, setSelectedLocation] = useState<string>("1")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedTerminal, setSelectedTerminal] = useState<string>("")

  const [activeTab, setActiveTab] = useState("overview")
  const { user, organizationId, isLoading, isAuthenticated } = useClientAuth()
  // Get organization ID from session or props
  const orgId = organizationId || ""
  console.log("User Organization ID:", orgId)
  const customers = useCustomers()
  const customersData = customers?.data || []
  const userId = user?.id || ""

  const {
    data: locationResponse,
    isLoading: locationsLoading,
    error: locationsError,
    refetch: refetchLocations,
  } = useOrgLocationsNew(orgId, { enabled: !!orgId })

  const locationsData = locationResponse?.data
  console.log(locationResponse)

  const {
    data: terminalResponse,
    isLoading: terminalsLoading,
    error: terminalsError,
    refetch: refetchTerminals,
  } = usePosStations(orgId, selectedLocation)

  const terminalsData = terminalResponse?.data || []
  console.log(terminalResponse)

  const { data, isLoading: itemsLoading, error } = useItemsWithInventory({
    locationId: selectedLocation,
    organizationId: orgId,
    trackInventory: true,
    categoryId: selectedCategory === "all" ? undefined : selectedCategory,
  })
  // Auto-select first location if none selected and locations are available
  useEffect(() => {
    if (!selectedLocation && Array.isArray(locationsData) && locationsData.length > 0 && !locationsLoading) {
      console.log(locationsData[0])
      // setSelectedLocation(locationsData[0]?.id)
      setSelectedLocation(locationsData[0]?.id)
    }
  }, [locationsData, selectedLocation, locationsLoading])

  // Auto-select first location if none selected and locations are available
  useEffect(() => {
    if (!selectedTerminal && Array.isArray(terminalsData) && terminalsData.length > 0 && !terminalsLoading) {
      console.log(terminalsData[0])
      // setSelectedTerminal(terminalsData[0]?.id)
      setSelectedTerminal(terminalsData[0]?.id)
    }
  }, [terminalsData, selectedTerminal, terminalsLoading])

  // Real-time monitoring hooks
  const [sessionId, setSessionId] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (session?.id) {
      setSessionId(session.id)
    }
  }, [sessionId])

  const { realTimeState, session, summary } = useRealTimeBalanceTracking(
    selectedTerminal,
    sessionId
  )
  const { lowStockCount, lowStockItems } = useLowStockMonitoring(session?.locationId, orgId)
  const { systemMetrics, systemHealth } = useSystemMonitoring(orgId, session?.locationId)


  // Define criticalStockCount based on lowStockItems or other logic
  const criticalStockCount = lowStockItems?.filter(item => item.inventoryLevel?.id === "critical").length || 0

  console.log("Real-Time State:", realTimeState)
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Enhanced Header */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <RealTimeStatusBar
          terminalId={session?.terminalId}
          sessionId={session?.id}
          locationId={session?.locationId}
          organizationId={orgId}
        />
        <div className="px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg">
                <CashRegister className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 text-balance">POS Cash Drawer System</h1>
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <span>{user?.organizationName}</span>
                  <span>•</span>
                  {/* <span>{user}</span> */}
                  <span>•</span>
                  <Badge variant="outline" className="text-xs">
                    <Activity className="w-3 h-3 mr-1" />
                    {realTimeState.systemHealth.toUpperCase()}
                  </Badge>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Badge
                variant="outline"
                className={`flex items-center gap-2 ${realTimeState.isOnline ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}
              >
                <div
                  className={`w-2 h-2 rounded-full animate-pulse ${realTimeState.isOnline ? "bg-green-500" : "bg-red-500"}`}
                ></div>
                {realTimeState.isOnline ? "System Online" : "System Offline"}
              </Badge>

              <Button variant="ghost" size="sm" className="flex items-center gap-2 bg-transparent">
                <RefreshCw className="w-4 h-4" />
                Sync
              </Button>

              <AlertCenter
                terminalId={selectedTerminal}
                sessionId={session?.id}
                locationId={session?.locationId}
                organizationId={orgId}
              />

              <Button variant="ghost" size="sm" className="bg-transparent">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Enhanced Welcome Section */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 text-balance">Welcome back, {user?.name}</h2>
              <p className="text-gray-600 mt-2 flex items-center gap-3">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {user?.roles[0]?.code === "ADMIN"
                    ? "Administrator"
                    : user?.roles[0]?.code === "MANAGER"
                      ? "Manager"
                      : "Cashier"}
                </Badge>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Session: {realTimeState.sessionDuration.toFixed(1)}h
                </span>
                <span>•</span>
                <span className="text-sm">{format(new Date(), "EEEE, MMMM do, yyyy")}</span>
                <span>•</span>

              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="flex items-center gap-2 bg-white/80 backdrop-blur-sm">
                <Zap className="w-4 h-4" />
                Quick Sale
              </Button>
              <Button variant="outline" size="sm" className="flex items-center gap-2 bg-white/80 backdrop-blur-sm">
                <Package className="w-4 h-4" />
                Inventory
              </Button>
              <Button size="sm" className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600">
                <DollarSign className="w-4 h-4" />
                Cash Count
              </Button>
            </div>
          </div>

          {/* Enhanced Tabs Navigation */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 bg-white/80 backdrop-blur-sm shadow-sm">
              <TabsTrigger
                value="overview"
                className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                <BarChart3 className="w-4 h-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="pos"
                className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                <CashRegister className="w-4 h-4" />
                POS Terminal
              </TabsTrigger>
              <TabsTrigger
                value="cash-drawer"
                className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                <DollarSign className="w-4 h-4" />
                Cash Drawer
              </TabsTrigger>
              <TabsTrigger
                value="reports"
                className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                <TrendingUp className="w-4 h-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger
                value="monitoring"
                className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                <Monitor className="w-4 h-4" />
                Monitoring
              </TabsTrigger>
            </TabsList>

            {/* Enhanced Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Key Metrics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="relative overflow-hidden bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-bl-full"></div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-green-700 flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Today's Sales
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-800">$2,847.50</div>
                    <div className="flex items-center gap-1 mt-2">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <p className="text-sm text-green-600 font-medium">+12.5% from yesterday</p>
                    </div>
                  </CardContent>
                </Card>

                <Card
                  className={`relative overflow-hidden ${Math.abs(realTimeState.variance) > 5 ? "bg-gradient-to-br from-orange-50 to-red-50 border-orange-200" : "bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200"}`}
                >
                  <div
                    className={`absolute top-0 right-0 w-20 h-20 rounded-bl-full ${Math.abs(realTimeState.variance) > 5 ? "bg-gradient-to-br from-orange-500/20 to-red-500/20" : "bg-gradient-to-br from-blue-500/20 to-cyan-500/20"}`}
                  ></div>
                  <CardHeader className="pb-2">
                    <CardTitle
                      className={`text-sm font-medium flex items-center gap-2 ${Math.abs(realTimeState.variance) > 5 ? "text-orange-700" : "text-blue-700"}`}
                    >
                      <CashRegister className="w-4 h-4" />
                      Cash Balance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div
                      className={`text-3xl font-bold ${Math.abs(realTimeState.variance) > 5 ? "text-orange-800" : "text-blue-800"}`}
                    >
                      ${realTimeState.currentBalance.toFixed(2)}
                    </div>
                    <div className="flex items-center gap-1 mt-2">
                      {Math.abs(realTimeState.variance) < 0.01 ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-orange-600" />
                      )}
                      <p
                        className={`text-sm font-medium ${Math.abs(realTimeState.variance) < 0.01 ? "text-green-600" : "text-orange-600"}`}
                      >
                        {Math.abs(realTimeState.variance) < 0.01
                          ? "Perfect balance"
                          : `Variance: ${realTimeState.variance >= 0 ? "+" : ""}$${realTimeState.variance.toFixed(2)}`}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-500/20 to-violet-500/20 rounded-bl-full"></div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-purple-700 flex items-center gap-2">
                      <ShoppingCart className="w-4 h-4" />
                      Transactions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-purple-800">127</div>
                    <div className="flex items-center gap-1 mt-2">
                      <TrendingUp className="w-4 h-4 text-purple-600" />
                      <p className="text-sm text-purple-600 font-medium">+8 from last hour</p>
                    </div>
                  </CardContent>
                </Card>

                <Card
                  className={`relative overflow-hidden ${criticalStockCount > 0 ? "bg-gradient-to-br from-red-50 to-pink-50 border-red-200" : lowStockCount > 0 ? "bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200" : "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200"}`}
                >
                  <div
                    className={`absolute top-0 right-0 w-20 h-20 rounded-bl-full ${criticalStockCount > 0 ? "bg-gradient-to-br from-red-500/20 to-pink-500/20" : lowStockCount > 0 ? "bg-gradient-to-br from-orange-500/20 to-amber-500/20" : "bg-gradient-to-br from-green-500/20 to-emerald-500/20"}`}
                  ></div>
                  <CardHeader className="pb-2">
                    <CardTitle
                      className={`text-sm font-medium flex items-center gap-2 ${criticalStockCount > 0 ? "text-red-700" : lowStockCount > 0 ? "text-orange-700" : "text-green-700"}`}
                    >
                      <Package className="w-4 h-4" />
                      Inventory Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div
                      className={`text-3xl font-bold ${criticalStockCount > 0 ? "text-red-800" : lowStockCount > 0 ? "text-orange-800" : "text-green-800"}`}
                    >
                      {criticalStockCount > 0 ? criticalStockCount : lowStockCount}
                    </div>
                    <div className="flex items-center gap-1 mt-2">
                      {criticalStockCount > 0 ? (
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                      ) : lowStockCount > 0 ? (
                        <AlertTriangle className="w-4 h-4 text-orange-600" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      )}
                      <p
                        className={`text-sm font-medium ${criticalStockCount > 0 ? "text-red-600" : lowStockCount > 0 ? "text-orange-600" : "text-green-600"}`}
                      >
                        {criticalStockCount > 0
                          ? "Critical stock"
                          : lowStockCount > 0
                            ? "Low stock items"
                            : "All items stocked"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Activity and Alerts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <Card className="bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Activity className="w-5 h-5" />
                        Recent Activity
                      </span>
                      <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1"></div>
                        Live
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <div>
                          <span className="text-sm font-medium text-green-800">Sale completed</span>
                          <p className="text-xs text-green-600">Transaction #1247 - $45.99</p>
                        </div>
                      </div>
                      <span className="text-xs text-green-600 font-medium">2 min ago</span>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <div>
                          <span className="text-sm font-medium text-blue-800">Cash added</span>
                          <p className="text-xs text-blue-600">Till replenishment - $100.00</p>
                        </div>
                      </div>
                      <span className="text-xs text-blue-600 font-medium">15 min ago</span>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-200">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                        <div>
                          <span className="text-sm font-medium text-orange-800">Low stock alert</span>
                          <p className="text-xs text-orange-600">Coffee Beans - 5 units remaining</p>
                        </div>
                      </div>
                      <span className="text-xs text-orange-600 font-medium">1 hour ago</span>
                    </div>
                  </CardContent>
                </Card>

                {/* System Alerts */}
                <Card className="bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-orange-600" />
                      System Alerts
                      <Badge variant="destructive" className="text-xs">
                        {realTimeState.alerts.length}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {realTimeState.alerts.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <CheckCircle className="w-12 mx-auto mb-3 opacity-50" />
                          <p className="text-sm">No active alerts</p>
                          <p className="text-xs">System is running smoothly</p>
                        </div>
                      ) : (
                        realTimeState.alerts.slice(0, 3).map((alert) => (
                          <div
                            key={alert.id}
                            className={`flex items-start gap-3 p-4 rounded-lg border ${alert.severity === "critical"
                              ? "bg-red-50 border-red-200"
                              : alert.severity === "high"
                                ? "bg-orange-50 border-orange-200"
                                : alert.severity === "medium"
                                  ? "bg-yellow-50 border-yellow-200"
                                  : "bg-blue-50 border-blue-200"
                              }`}
                          >
                            <AlertTriangle
                              className={`w-5 h-5 mt-0.5 ${alert.severity === "critical"
                                ? "text-red-600"
                                : alert.severity === "high"
                                  ? "text-orange-600"
                                  : alert.severity === "medium"
                                    ? "text-yellow-600"
                                    : "text-blue-600"
                                }`}
                            />
                            <div className="flex-1">
                              <p
                                className={`text-sm font-medium ${alert.severity === "critical"
                                  ? "text-red-800"
                                  : alert.severity === "high"
                                    ? "text-orange-800"
                                    : alert.severity === "medium"
                                      ? "text-yellow-800"
                                      : "text-blue-800"
                                  }`}
                              >
                                {alert.title}
                              </p>
                              <p
                                className={`text-xs mt-1 ${alert.severity === "critical"
                                  ? "text-red-700"
                                  : alert.severity === "high"
                                    ? "text-orange-700"
                                    : alert.severity === "medium"
                                      ? "text-yellow-700"
                                      : "text-blue-700"
                                  }`}
                              >
                                {alert.message}
                              </p>
                              <Button size="sm" variant="outline" className="mt-2 text-xs bg-white/80">
                                {alert?.actionRequired ? "Take Action" : "View Details"}
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card className="bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Button variant="outline" className="h-20 flex-col gap-2 bg-white/80">
                      <DollarSign className="w-6 h-6" />
                      <span className="text-sm">Cash Count</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col gap-2 bg-white/80">
                      <Package className="w-6 h-6" />
                      <span className="text-sm">Stock Check</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col gap-2 bg-white/80">
                      <FileText className="w-6 h-6" />
                      <span className="text-sm">End of Day</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col gap-2 bg-white/80">
                      <BarChart3 className="w-6 h-6" />
                      <span className="text-sm">View Reports</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pos">
              <pOSStationComplete organizationId={orgId} locationId={selectedLocation} terminalId={selectedTerminalId} userId={userId} />
            </TabsContent>

            <TabsContent value="cash-drawer">
              <CashDrawerManager terminalId={selectedTerminal} userId={userId} locationId={selectedLocation} organizationId={orgId} />
            </TabsContent>

            <TabsContent value="reports" className="space-y-6">
              <Tabs defaultValue="analytics" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="analytics">Sales Analytics</TabsTrigger>
                  <TabsTrigger value="reconciliation">Cash Reconciliation</TabsTrigger>
                </TabsList>
                <TabsContent value="analytics">
                  <AnalyticsDashboard locationId={selectedLocation} organizationId={orgId} />
                </TabsContent>
                <TabsContent value="reconciliation">
                  <CashReconciliationReportComponent locationId={selectedLocation} organizationId={orgId} />
                </TabsContent>
              </Tabs>
            </TabsContent>

            <TabsContent value="monitoring">
              <div className="space-y-6">
                <VarianceMonitor terminalId={selectedTerminal} sessionId={sessionId} />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="w-5 h-5" />
                        System Performance
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">System Health</span>
                          <Badge
                            className={`${realTimeState.systemHealth === "excellent"
                              ? "bg-green-100 text-green-800"
                              : realTimeState.systemHealth === "good"
                                ? "bg-blue-100 text-blue-800"
                                : realTimeState.systemHealth === "warning"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                          >
                            {realTimeState.systemHealth.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Connection Status</span>
                          <Badge
                            className={
                              realTimeState.isOnline ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                            }
                          >
                            {realTimeState.isOnline ? "ONLINE" : "OFFLINE"}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Active Alerts</span>
                          <span className="font-medium">{realTimeState.alerts.length}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Session Duration</span>
                          <span className="font-medium">{realTimeState.sessionDuration.toFixed(1)}h</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Package className="w-5 h-5" />
                        Inventory Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Low Stock Items</span>
                          <Badge
                            className={
                              lowStockCount > 0 ? "bg-orange-100 text-orange-800" : "bg-green-100 text-green-800"
                            }
                          >
                            {lowStockCount}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Critical Stock Items</span>
                          <Badge
                            className={
                              criticalStockCount > 0 ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                            }
                          >
                            {criticalStockCount}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Total Items Monitored</span>
                          <span className="font-medium">{lowStockItems.length + 50}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}


