"use client"

import { RealTimeStatusBar } from "@/components/newPOSSession/alerts/real-time-status-bar"
// import { OpeningBalanceDialog } from "@/components/pos/opening-balance-dialog"
import { ModernizedPOSTerminal } from "@/components/synchro/ModernizedPOSTerminal"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { usePosStations } from "@/hooks/posStation/use-pos-station-management"
import { useCallback, useEffect, useState } from "react"

import { OpeningBalanceDialogModern } from "@/components/synchro/OpeningBalanceDialogModern"
import {
  useLowStockMonitoring,
  useRealTimeBalanceTracking,
  useSystemMonitoring,
} from "@/hooks/cashDrawer/useRealTimeTracking"
import { useSessionManagement } from "@/hooks/newPOSSession/useSessionManagementModern"
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
import { useClientAuth } from "@/hooks/useClientAuth"
// import { useCustomers } from "@/hooks/customers/useCustomers"
import { useItemsWithInventory } from "@/hooks/inventoryHooks/useInventoryWithIinventoryHooks"
import { useOrgLocationsNew } from "@/hooks/useAllLocationsQueries"
import { useCustomers } from "@/hooks/useCustomerQueries"

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedLocationId, setSelectedLocationId] = useState<string>("")
  const [selectedTerminalId, setSelectedTerminalId] = useState<string>("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [showOpeningBalanceDialog, setShowOpeningBalanceDialog] = useState(false)

  const {
    currentSession,
    sessionLoading,
    sessionError,
    startSession,
    endSession,
    isSessionActive,
    sessionDuration,
    refetchSession,
  } = useSessionManagement(selectedTerminalId)


  const { user, organizationId } = useClientAuth()
  // Get organization ID from session or props
  const orgId = organizationId || ""
  console.log("User Organization ID:", orgId)
  const customers = useCustomers()
  const customersData = customers?.data || []
  const userId = user?.id || ""
  const { realTimeState, session, summary } = useRealTimeBalanceTracking(selectedTerminalId, currentSession?.id || "")
  const { lowStockCount, criticalStockCount, lowStockItems } = useLowStockMonitoring(selectedLocationId, orgId)
  const { systemMetrics, systemHealth } = useSystemMonitoring(orgId, selectedLocationId)

  // const isSessionActive = currentSession?.status === "active"
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
  } = usePosStations(orgId, { enabled: !!orgId })

  const terminalsData = terminalResponse || []
  console.log(terminalResponse)

  const { data, isLoading, error } = useItemsWithInventory({
    locationId: selectedLocationId,
    organizationId: orgId,
    trackInventory: true,
    categoryId: selectedCategory === "all" ? undefined : selectedCategory,
  })
  // Auto-select first location if none selected and locations are available
  useEffect(() => {
    if (!selectedLocationId && Array.isArray(locationsData) && locationsData.length > 0 && !locationsLoading) {
      console.log("Auto-selecting first location:", locationsData[0])
      setSelectedLocationId(locationsData[0]?.id)
    }
  }, [locationsData, selectedLocationId, locationsLoading])

  // Auto-select first terminal for the selected location
  useEffect(() => {
    if (selectedLocationId && Array.isArray(terminalsData) && terminalsData.length > 0 && !terminalsLoading) {
      const locationTerminals = terminalsData.filter((terminal) => terminal.locationId === selectedLocationId)

      if (locationTerminals.length > 0 && (!selectedTerminalId || !locationTerminals.find(t => t.id === selectedTerminalId))) {
        // Prefer online terminals, but select any available terminal if none are online
        const onlineTerminals = locationTerminals.filter((t) => t.status === "online")
        const terminalToSelect = onlineTerminals.length > 0 ? onlineTerminals[0] : locationTerminals[0]

        console.log("Auto-selecting terminal for location:", terminalToSelect)
        setSelectedTerminalId(terminalToSelect.id)
      }
    }
  }, [selectedLocationId, terminalsData, selectedTerminalId, terminalsLoading])

  const locationName = locationsData?.find((loc) => loc.id === selectedLocationId)?.name || "Select Location"
  const organizationName = locationsData?.[0]?.organization?.name || "Demo Organization"

  const availableTerminals = terminalsData.filter((terminal) => terminal.locationId === selectedLocationId)


  const handleTerminalChange = (terminalId: string) => {
    setSelectedTerminalId(terminalId)
    // If session is active and we're switching terminals, stay on POS tab
    if (isSessionActive && activeTab !== "pos") {
      setActiveTab("pos")
    }
  }

  const handleLocationChange = useCallback(
    (locationId: string) => {
      setSelectedLocationId(locationId)
      const locationTerminals = terminalsData.filter((terminal) => terminal.locationId === locationId)

      if (locationTerminals.length > 0) {
        const onlineTerminals = locationTerminals.filter((t) => t.status === "online")
        const terminalToSelect = onlineTerminals.length > 0 ? onlineTerminals[0] : locationTerminals[0]
        setSelectedTerminalId(terminalToSelect.id)

        // If session is active and we're switching locations, stay on POS tab
        if (isSessionActive && activeTab !== "pos") {
          setActiveTab("pos")
        }
      }
    },
    [terminalsData, isSessionActive, activeTab],
  )

  const handleStartSession = useCallback(() => {
    console.log("[v0] Starting session - showing opening balance dialog")
    setShowOpeningBalanceDialog(true)
  }, [])

  const handleOpeningBalanceConfirm = useCallback(
    async (balance: number) => {
      try {
        console.log("[Session UI] Starting session with opening balance:", balance)
        console.log("[Session UI] Session params:", {
          balance,
          userId,
          selectedLocationId,
          orgId,
          selectedTerminalId,
        })

        const result = await startSession(balance, userId, selectedLocationId, orgId)
        console.log("[Session UI] Session start result:", result)

        // Ensure we have a valid terminal selected
        const currentTerminal = availableTerminals.find((t) => t.id === selectedTerminalId)
        if (!currentTerminal && availableTerminals.length > 0) {
          const onlineTerminals = availableTerminals.filter((t) => t.status === "online")
          const terminalToSelect = onlineTerminals.length > 0 ? onlineTerminals[0] : availableTerminals[0]
          console.log("[Session UI] Switching to terminal:", terminalToSelect.id)
          setSelectedTerminalId(terminalToSelect.id)
        }

        console.log("[Session UI] Session started successfully, switching to POS tab")
        setActiveTab("pos")
        setShowOpeningBalanceDialog(false)

        // Force a session refetch after a short delay
        setTimeout(() => {
          console.log("[Session UI] Force refreshing session")
          refetchSession()
        }, 1000)
      } catch (error) {
        console.error("[Session UI] Failed to start session:", error)
        // Error is handled by the hook's toast notification
      }
    },
    [startSession, userId, selectedLocationId, orgId, availableTerminals, selectedTerminalId, refetchSession],
  )

  const handleEndSession = useCallback(async () => {
    try {
      console.log("[v0] Ending session")
      await endSession()
      setActiveTab("overview")
      console.log("[v0] Session ended successfully")
    } catch (error) {
      console.error("[v0] Failed to end session:", error)
      // Error is handled by the hook's toast notification
    }
  }, [endSession])

  const getSessionDuration = useCallback(() => {
    if (!currentSession?.startTime) return "0.0h"
    const now = new Date()
    const startTime = new Date(currentSession.startTime)
    const diffMs = now.getTime() - startTime.getTime()
    const diffHours = diffMs / (1000 * 60 * 60)
    return `${diffHours.toFixed(1)}h`
  }, [currentSession?.startTime])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    // Only start auto-refresh after session has been active for at least 30 seconds
    if (isSessionActive) {
      interval = setInterval(() => {
        console.log("[Session] Auto-refreshing session status")
        refetchSession()
      }, 2 * 60 * 1000) // Refresh every 2 minutes when session is active
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isSessionActive, refetchSession])

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 session-transition">
      {/* Enhanced Header */}
      <header className="bg-card/95 backdrop-blur-sm border-b border-border sticky shadow-sm">
        <RealTimeStatusBar
          terminalId={selectedTerminalId}
          sessionId={currentSession?.id || ""}
          locationId={selectedLocationId}
          organizationId={orgId}
        />
        <div className="px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-primary to-primary/80 rounded-xl shadow-lg">
                <CashRegister className="w-7 h-7 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground text-balance">POS Cash Drawer System</h1>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <span>{organizationName}</span>
                  <span>•</span>
                  <span>{locationName}</span>
                  <span>•</span>
                  <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                    <Activity className="w-3 h-3 mr-1" />
                    {systemHealth ?? "GOOD"}
                  </Badge>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Select value={selectedLocationId} onValueChange={handleLocationChange}>
                  <SelectTrigger className="w-48 bg-card/80 backdrop-blur-sm border-2 hover:border-primary/30 transition-colors">
                    <MapPin className="w-4 h-4 mr-2 text-primary" />
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

                <Select value={selectedTerminalId} onValueChange={setSelectedTerminalId}>
                  <SelectTrigger className="w-52 bg-card/80 backdrop-blur-sm border-2 hover:border-secondary/30 transition-colors">
                    <Terminal className="w-4 h-4 mr-2 text-secondary" />
                    <SelectValue placeholder="Select Terminal" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTerminals.map((terminal) => (
                      <SelectItem key={terminal.id} value={terminal.id}>
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2 h-2 rounded-full ${terminal.status === "online" ? "bg-green-500" : "bg-gray-400"}`}
                          ></div>
                          <span>{terminal.name}</span>
                          <Badge variant={terminal.status === "online" ? "default" : "secondary"} className="text-xs">
                            {terminal.status}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                {!isSessionActive ? (
                  <Button
                    onClick={handleStartSession}
                    disabled={sessionLoading}
                    className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg session-transition"
                  >
                    <Power className="w-4 h-4" />
                    {sessionLoading ? "Starting..." : "Start Session"}
                  </Button>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="status-indicator status-active">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span>Session Active</span>
                    </div>
                    <Button
                      onClick={handleEndSession}
                      disabled={sessionLoading}
                      variant="outline"
                      className="flex items-center gap-2 border-red-200 text-red-600 hover:bg-red-50 bg-transparent session-transition"
                    >
                      <Power className="w-4 h-4" />
                      {sessionLoading ? "Ending..." : "End Session"}
                    </Button>
                  </div>
                )}
              </div>

              <Badge variant="outline" className="flex items-center gap-2 border-green-200 bg-green-50">
                <div className="w-2 h-2 rounded-full animate-pulse bg-green-500"></div>
                System Online
              </Badge>

              <Button variant="ghost" size="sm" className="flex items-center gap-2 bg-transparent">
                <RefreshCw className="w-4 h-4" />
                Sync
              </Button>

              <Button variant="ghost" size="sm" className="bg-transparent">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Opening Balance Dialog */}
      <OpeningBalanceDialogModern
        open={showOpeningBalanceDialog}
        onOpenChange={setShowOpeningBalanceDialog}
        onConfirm={handleOpeningBalanceConfirm}
        terminalName={availableTerminals.find((t) => t.id === selectedTerminalId)?.name}
        locationName={locationName}
      />

      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Enhanced Welcome Section */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-foreground text-balance">
                Welcome back, {user?.firstName || "User"} {user?.lastName || ""}
              </h2>
              <p className="text-muted-foreground mt-2 flex items-center gap-3">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  Manager
                </Badge>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Session: {getSessionDuration()}
                </span>
                <span>•</span>
                <span className="text-sm">{new Date().toLocaleDateString()}</span>
                <span>•</span>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Terminal className="w-3 h-3" />
                  {availableTerminals.find((t) => t.id === selectedTerminalId)?.name || "Main Counter"}
                </Badge>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className={`status-indicator ${isSessionActive ? "status-active" : "status-inactive"}`}>
                <Power className={`w-4 h-4 ${isSessionActive ? "text-green-500" : "text-gray-400"}`} />
                <span>{isSessionActive ? "Session Active" : "No Session"}</span>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 bg-card/80"
                disabled={!isSessionActive}
              >
                <Zap className="w-4 h-4" />
                Quick Sale
              </Button>
              <Button variant="outline" size="sm" className="flex items-center gap-2 bg-card/80">
                <Package className="w-4 h-4" />
                Inventory
              </Button>
              <Button
                size="sm"
                className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary/80"
                disabled={!isSessionActive}
              >
                <DollarSign className="w-4 h-4" />
                Cash Count
              </Button>
            </div>
          </div>

          {!isSessionActive && (
            <div className="mb-6 p-4 bg-accent/10 border border-accent/20 rounded-lg session-transition">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-accent" />
                <div>
                  <p className="text-sm font-medium text-accent-foreground">No Active Session</p>
                  <p className="text-xs text-accent-foreground/75 mt-1">
                    Please start a POS session using the "Start Session" button in the header to enable cash drawer operations and sales transactions.
                  </p>
                </div>
              </div>
            </div>
          )}

          {sessionError && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                <div>
                  <p className="text-sm font-medium text-destructive">Session Error</p>
                  <p className="text-xs text-destructive/75 mt-1">
                    {sessionError.message || "An error occurred with the session management."}
                  </p>
                </div>
              </div>
            </div>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 bg-card/90 backdrop-blur-sm shadow-lg border border-border/50 rounded-xl p-1">
              <TabsTrigger
                value="overview"
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-primary-foreground data-[state=active]:shadow-md rounded-lg transition-all duration-300"
              >
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger
                value="pos"
                className="flex items-center gap-2 rounded-lg transition-all duration-300"
                disabled={!isSessionActive}
              >
                <CashRegister className="h-4 w-4" />
                <span className="hidden sm:inline">POS Terminal</span>
              </TabsTrigger>
              <TabsTrigger
                value="cash-drawer"
                className="flex items-center gap-2 rounded-lg transition-all duration-300"
                disabled={!isSessionActive}
              >
                <DollarSign className="w-4 h-4" />
                <span className="hidden sm:inline">Cash Drawer</span>
              </TabsTrigger>
              <TabsTrigger
                value="reports"
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-secondary data-[state=active]:to-secondary/80 data-[state=active]:text-secondary-foreground data-[state=active]:shadow-md rounded-lg transition-all duration-300"
              >
                <TrendingUp className="w-4 h-4" />
                <span className="hidden sm:inline">Analytics</span>
              </TabsTrigger>
              <TabsTrigger
                value="monitoring"
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg transition-all duration-300"
              >
                <Monitor className="w-4 h-4" />
                <span className="hidden sm:inline">Monitoring</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <Card className="relative overflow-hidden bg-gradient-to-br from-card to-muted/20 border-border hover:shadow-lg hover:scale-105 transition-all duration-200">
                  <div className="absolute top-0 right-0 w-20 h-20 rounded-bl-full bg-gradient-to-br from-muted-foreground/20 to-muted-foreground/10"></div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2 text-card-foreground">
                      <Power className="w-4 h-4" />
                      Session Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div
                      className={`text-2xl font-bold ${isSessionActive ? "text-green-600" : "text-muted-foreground"}`}
                    >
                      {isSessionActive ? "ACTIVE" : "INACTIVE"}
                    </div>
                    <div className="flex items-center gap-1 mt-2">
                      {isSessionActive ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <p className="text-sm text-green-600 font-medium">Session running</p>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-4 h-4 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground font-medium">Open session to start</p>
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

                <Card className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-bl-full"></div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2 text-blue-700">
                      <CashRegister className="w-4 h-4" />
                      Cash Balance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-blue-800">$250.00</div>
                    <div className="flex items-center gap-1 mt-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <p className="text-sm font-medium text-green-600">Perfect balance</p>
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

                <Card className="relative overflow-hidden bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-bl-full"></div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2 text-green-700">
                      <Package className="w-4 h-4" />
                      Inventory Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-800">0</div>
                    <div className="flex items-center gap-1 mt-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <p className="text-sm font-medium text-green-600">All items stocked</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                          <span className="text-sm font-medium text-green-800">Sales completed</span>
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

                <Card className="bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-orange-600" />
                      System Alerts
                      <Badge variant="destructive" className="text-xs">
                        0
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-center py-8 text-gray-500">
                        <CheckCircle className="w-12 mx-auto mb-3 opacity-50" />
                        <p className="text-sm">No active alerts</p>
                        <p className="text-xs">System is running smoothly</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

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
              {isSessionActive ? (
                <ModernizedPOSTerminal
                  locationId={selectedLocationId}
                  terminalId={selectedTerminalId}
                  organizationId={orgId}
                  userId={userId}

                />
              ) : (
                <div className="text-center py-16 bg-gradient-to-br from-muted/20 to-muted/10 rounded-xl border border-border">
                  <div className="max-w-md mx-auto">
                    <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                      <Terminal className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-3">POS Terminal Unavailable</h3>
                    <p className="text-muted-foreground mb-6">
                      A POS session must be active to use the terminal. Please start a session using the "Start Session"
                      button in the header.
                    </p>
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Session management available in the header</span>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="cash-drawer">
              {isSessionActive ? (
                <div className="text-center py-12 text-green-600">
                  <DollarSign className="w-16 h-16 mx-auto mb-4 opacity-60" />
                  <p className="text-lg font-medium mb-2">Cash Drawer Active</p>
                  <p className="text-sm">Cash drawer management functionality will be available here.</p>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <DollarSign className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p className="text-lg font-medium mb-2">Cash Drawer Unavailable</p>
                  <p className="text-sm">Please start a session to manage the cash drawer.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="reports" className="space-y-6">
              <div className="text-center py-12 text-gray-500">
                <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium mb-2">Analytics Dashboard</p>
                <p className="text-sm">Reports and analytics will be available here.</p>
              </div>
            </TabsContent>

            <TabsContent value="monitoring">
              <div className="text-center py-12 text-gray-500">
                <Monitor className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium mb-2">System Monitoring</p>
                <p className="text-sm">Real-time system monitoring will be available here.</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
