"use client"

import { POSTerminalFinal } from "@/components/cashSystem/POSTerminalFinal"
import { AlertCenter } from "@/components/newPOSSession/alerts/alert-center"
import { RealTimeStatusBar } from "@/components/newPOSSession/alerts/real-time-status-bar"
import { VarianceMonitor } from "@/components/newPOSSession/alerts/variance-monitor"
import { CashDrawerManager } from "@/components/newPOSSession/cash-drawer/cash-drawer-manager"
import { AnalyticsDashboard } from "@/components/newPOSSession/reports/analytics-dashboard"
import { CashReconciliationReportComponent } from "@/components/newPOSSession/reports/cash-reconciliation-report"
import { SessionControlButtons1 } from "@/components/newPOSSession/session/SessionControlButtons1"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useLowStockMonitoring, useRealTimeBalanceTracking, useSystemMonitoring } from "@/hooks/newPOSSession/use-real-time-tracking"
import { useSessionManagement } from "@/hooks/newPOSSession/useSessionManagement"
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
  MapPin,
  Monitor,
  Package,
  Power,
  RefreshCw,
  Settings,
  ShoppingCart,
  Target,
  Terminal,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react"

import { usePosStations } from "@/hooks/posStation/use-pos-terminals"
import { useOrgLocationsNew } from "@/hooks/useAllLocationsQueries"
import { useClientAuth } from "@/hooks/useClientAuth"
import { useEffect, useMemo, useState } from "react"

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("overview")

  const [selectedLocation, setSelectedLocation] = useState<string>("loc_1")
  const [selectedTerminal, setSelectedTerminal] = useState<string>("terminal_1")
  const { session, user, organizationId } = useClientAuth()
  console.log("User from session:", user)
  const orgId = organizationId || "org_1"

  // const { data: locations, isLoading: locationsLoading } = useLocationsByOrganization(orgId)
  const userId = user?.id
  const userName = user?.name


  const {
    data: terminalResponse,
    isLoading: terminalLoading,
    error: terminalError,
    refetch: refetchTerminals,
  } = usePosStations(orgId)

  const terminalData = terminalResponse?.data

  const {
    data: locationResponse,
    isLoading: locationsLoading,
    error: locationsError,
    refetch: refetchLocations,
  } = useOrgLocationsNew(orgId, { enabled: !!orgId })

  const locationsData = locationResponse?.data
  console.log(locationResponse)
  const locationName = locationsData?.find((loc) => loc.id === selectedLocation)?.name || "Select Location"
  const organizationName = locationsData?.[0]?.organization?.name

  // Filter terminals based on selected location
  const availableTerminals = useMemo(() => {
    if (!terminalData || !selectedLocation) {
      return terminalData || []
    }
    return terminalData.filter((terminal: any) => terminal.locationId === selectedLocation)
  }, [terminalData, selectedLocation])

  const allTerminals = terminalData || []

  // Auto-select first location and terminal on initial load
  useEffect(() => {
    if (locationsData && locationsData.length > 0 && !selectedLocation) {
      const firstLocation = locationsData[0]
      setSelectedLocation(firstLocation.id)
    }
  }, [locationsData, selectedLocation])

  // Auto-select first available terminal when location changes or terminals load
  useEffect(() => {
    if (availableTerminals && availableTerminals.length > 0 && selectedLocation && !selectedTerminal) {
      setSelectedTerminal(availableTerminals[0].id)
    }
  }, [availableTerminals, selectedLocation, selectedTerminal])



  const mockTerminals = allTerminals.filter((terminal) => terminal.locationId === selectedLocation)

  const handleLocationChange = (locationId: string) => {
    setSelectedLocation(locationId)
    const locationTerminals = allTerminals.filter((terminal) => terminal.locationId === locationId)
    if (locationTerminals.length > 0) {
      setSelectedTerminal(locationTerminals[0].id)
    }
  }

  const { currentSession, sessionLoading } = useSessionManagement(selectedTerminal)

  // Real-time monitoring hooks
  const { realTimeState, session, summary } = useRealTimeBalanceTracking(selectedTerminal, currentSession?.id || "")
  const { lowStockCount, criticalStockCount, lowStockItems } = useLowStockMonitoring(selectedLocation, orgId)
  const { systemMetrics, systemHealth } = useSystemMonitoring(orgId, selectedLocation)

  const isSessionActive = currentSession?.status === "active"

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Enhanced Header */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <RealTimeStatusBar
          terminalId={selectedTerminal}
          sessionId={currentSession?.id || ""}
          locationId={selectedLocation}
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
                  <span>{organizationName}</span>
                  <span>•</span>
                  <span>{locationName}</span>
                  <span>•</span>
                  <Badge variant="outline" className="text-xs">
                    <Activity className="w-3 h-3 mr-1" />
                    {realTimeState.systemHealth.toUpperCase()}
                  </Badge>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Select value={selectedLocation} onValueChange={handleLocationChange}>
                  <SelectTrigger className="w-48 bg-white/80 backdrop-blur-sm">
                    <MapPin className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Select Location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locationsData?.map((location) => (
                      <SelectItem key={location.id} value={location.id}>
                        <div className="flex items-center gap-2">
                          <span>{location.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {location.type}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedTerminal} onValueChange={setSelectedTerminal}>
                  <SelectTrigger className="w-52 bg-white/80 backdrop-blur-sm">
                    <Terminal className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Select Terminal" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockTerminals.map((terminal) => (
                      <SelectItem key={terminal.id} value={terminal.id}>
                        {terminal.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <SessionControlButtons1
                terminalId={selectedTerminal}
                locationId={selectedLocation}
                organizationId={orgId}
                userId={user?.id || ""}
              />

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
                sessionId={currentSession?.id || ""}
                locationId={selectedLocation}
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
              <h2 className="text-3xl font-bold text-gray-900 text-balance">Welcome back, {user?.firstName}</h2>
              <p className="text-gray-600 mt-2 flex items-center gap-3">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {user?.roles?.join(", ") || "Staff"}
                </Badge>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Session: {isSessionActive ? realTimeState.sessionDuration.toFixed(1) : "0.0"}h
                </span>
                <span>•</span>
                <span className="text-sm">{format(new Date(), "EEEE, MMMM do, yyyy")}</span>
                <span>•</span>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Terminal className="w-3 h-3" />
                  {mockTerminals.find((t) => t.id === selectedTerminal)?.name.split(" - ")[0] || "Terminal 1"}
                </Badge>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-2 bg-white/80 backdrop-blur-sm rounded-lg border">
                <Power className={`w-4 h-4 ${isSessionActive ? "text-green-600" : "text-gray-400"}`} />
                <span className="text-sm font-medium">{isSessionActive ? "Session Active" : "No Session"}</span>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 bg-white/80 backdrop-blur-sm"
                disabled={!isSessionActive}
              >
                <Zap className="w-4 h-4" />
                Quick Sale
              </Button>
              <Button variant="outline" size="sm" className="flex items-center gap-2 bg-white/80 backdrop-blur-sm">
                <Package className="w-4 h-4" />
                Inventory
              </Button>
              <Button
                size="sm"
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600"
                disabled={!isSessionActive}
              >
                <DollarSign className="w-4 h-4" />
                Cash Count
              </Button>
            </div>
          </div>

          {!isSessionActive && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <div>
                  <p className="text-sm font-medium text-amber-800">No Active Session</p>
                  <p className="text-xs text-amber-700 mt-1">
                    Please open a POS session to enable cash drawer operations and sales transactions.
                  </p>
                </div>
              </div>
            </div>
          )}

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
                disabled={!isSessionActive}
              >
                <CashRegister className="w-4 h-4" />
                POS Terminal
              </TabsTrigger>
              <TabsTrigger
                value="cash-drawer"
                className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                disabled={!isSessionActive}
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {/* Session Status Card */}
                <Card
                  className={`relative overflow-hidden ${isSessionActive ? "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200" : "bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200"}`}
                >
                  <div
                    className={`absolute top-0 right-0 w-20 h-20 rounded-bl-full ${isSessionActive ? "bg-gradient-to-br from-green-500/20 to-emerald-500/20" : "bg-gradient-to-br from-gray-500/20 to-slate-500/20"}`}
                  ></div>
                  <CardHeader className="pb-2">
                    <CardTitle
                      className={`text-sm font-medium flex items-center gap-2 ${isSessionActive ? "text-green-700" : "text-gray-700"}`}
                    >
                      <Power className="w-4 h-4" />
                      Session Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${isSessionActive ? "text-green-800" : "text-gray-800"}`}>
                      {isSessionActive ? "ACTIVE" : "INACTIVE"}
                    </div>
                    <div className="flex items-center gap-1 mt-2">
                      {isSessionActive ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <p className="text-sm text-green-600 font-medium">Ready for sales</p>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-4 h-4 text-gray-600" />
                          <p className="text-sm text-gray-600 font-medium">Open session to start</p>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>

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
                                {alert.actionRequired ? "Take Action" : "View Details"}
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
              <div className="mb-4 p-4 bg-white/80 backdrop-blur-sm rounded-lg border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium">Location:</span>
                      <Badge variant="outline">{locationName}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium">Terminal:</span>
                      <Badge variant="outline">
                        {mockTerminals.find((t) => t.id === selectedTerminal)?.name || "Terminal 1"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Power className={`w-4 h-4 ${isSessionActive ? "text-green-600" : "text-gray-400"}`} />
                      <span className="text-sm font-medium">Session:</span>
                      <Badge
                        variant={isSessionActive ? "default" : "secondary"}
                        className={isSessionActive ? "bg-green-100 text-green-800 border-green-200" : ""}
                      >
                        {isSessionActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {isSessionActive ? "POS operations enabled" : "Open a session to enable POS operations"}
                  </div>
                </div>
              </div>
              {isSessionActive ? (
                <POSTerminalFinal
                  locationId={selectedLocation}
                  terminalId={selectedTerminal}
                  organizationId={orgId}
                  userId={""} />
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Terminal className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p className="text-lg font-medium mb-2">POS Terminal Unavailable</p>
                  <p className="text-sm">Please open a session to use the POS terminal.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="cash-drawer">
              <div className="mb-4 p-4 bg-white/80 backdrop-blur-sm rounded-lg border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium">Active Terminal:</span>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        {mockTerminals.find((t) => t.id === selectedTerminal)?.name || "Terminal 1"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Power className={`w-4 h-4 ${isSessionActive ? "text-green-600" : "text-gray-400"}`} />
                      <span className="text-sm font-medium">Session:</span>
                      <Badge
                        variant={isSessionActive ? "default" : "secondary"}
                        className={isSessionActive ? "bg-green-100 text-green-800 border-green-200" : ""}
                      >
                        {isSessionActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {isSessionActive
                      ? "Cash drawer operations enabled"
                      : "Open a session to enable cash drawer operations"}
                  </div>
                </div>
              </div>
              {isSessionActive ? (
                <CashDrawerManager
                  terminalId={selectedTerminal}
                  locationId={selectedLocation}
                  organizationId={orgId}
                  userId={""} />
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <DollarSign className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p className="text-lg font-medium mb-2">Cash Drawer Unavailable</p>
                  <p className="text-sm">Please open a session to manage the cash drawer.</p>
                </div>
              )}
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
                <VarianceMonitor terminalId={selectedTerminal} sessionId={currentSession?.id || ""} />

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
