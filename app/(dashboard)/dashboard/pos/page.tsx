"use client"

import ProfessionalPOSSystem from '@/components/pos/ProfessionalPOSSystem'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  useActiveSession,
  useClosePOSSession,
  useDailyReports,
  useGenerateDailyReport,
  usepOSStations,
  usePOSSummary,
  useStartPOSSession
} from '@/hooks/usePOSQueries'
import { Banknote, BarChart3, Calendar, Clock, CreditCard, DollarSign, Download, Monitor, Play, RefreshCw, ShoppingCart, Smartphone, Square, TrendingUp } from 'lucide-react'
import { useSession } from '@/lib/auth-client'
import { useEffect, useState } from 'react'

import { useOrgLocationsNew } from "@/hooks/useAllLocationsQueries"

export default function POSPage() {
  const [selectedTerminalId, setSelectedTerminalId] = useState<string>('')
  const [isStartSessionModalOpen, setIsStartSessionModalOpen] = useState(false)
  const [isCloseSessionModalOpen, setIsCloseSessionModalOpen] = useState(false)
  const [openingBalance, setopeningBalance] = useState<string>('')
  const [closingBalance, setclosingBalance] = useState<string>('')
  const [sessionNotes, setSessionNotes] = useState<string>('')
  const [activeView, setActiveView] = useState<'dashboard' | 'pos'>('dashboard')
  const [selectedLocationId, setSelectedLocationId] = useState<string>('')

  const { session, user, organizationId } = useClientAuth()
  const user = userSession?.data?.user
  const ORGANIZATION_ID = user?.organizationId

  const {
    data: locationResponse,
    isLoading: locationsLoading,
    error: locationsError,
    refetch: refetchLocations,
  } = useOrgLocationsNew(ORGANIZATION_ID || "", { enabled: !!ORGANIZATION_ID })

  const locationsData = locationResponse?.data
  console.log(locationResponse)
  const locationName = locationsData?.find((loc) => loc.id === selectedLocationId)?.name || "Select Location"
  const organizationName = locationsData?.[0]?.organization?.name
  // Queries
  const { data: terminals, isLoading: terminalsLoading } = usepOSStations(ORGANIZATION_ID || "", selectedLocationId)
  const { data: summary, isLoading: summaryLoading } = usePOSSummary(ORGANIZATION_ID || "", selectedLocationId)
  const { data: dailyReports } = useDailyReports(ORGANIZATION_ID || "", selectedLocationId)
  const { activeSession, hasActiveSession } = useActiveSession(selectedTerminalId)

  // Mutations
  const startSessionMutation = useStartPOSSession()
  const closeSessionMutation = useClosePOSSession()
  const generateReportMutation = useGenerateDailyReport()

  // Auto-select first terminal
  useEffect(() => {
    if (terminals?.data && terminals.data.length > 0 && !selectedTerminalId) {
      setSelectedTerminalId(terminals.data[0].id)
    }
  }, [terminals, selectedTerminalId])


  // Auto-select first location and terminal on initial load
  useEffect(() => {
    if (locationsData && locationsData.length > 0 && !selectedLocationId) {
      const firstLocation = locationsData[0]
      setSelectedLocationId(firstLocation.id)
    }
  }, [locationsData, selectedLocationId])

  // // Auto-select first available terminal when location changes or terminals load
  // useEffect(() => {
  //   if (availableTerminals && availableTerminals.length > 0 && selectedLocationId && !selectedTerminalId) {
  //     setSelectedTerminalId(availableTerminals[0].id)
  //   }
  // }, [availableTerminals, selectedLocationId, selectedTerminalId])

  const handleStartSession = async () => {
    if (!selectedTerminalId || !openingBalance) return

    try {
      await startSessionMutation.mutateAsync({
        terminalId: selectedTerminalId,
        userId: 'user_123', // Replace with actual user ID
        openingBalance: parseFloat(openingBalance),
        notes: sessionNotes,
      })

      setIsStartSessionModalOpen(false)
      setopeningBalance('')
      setSessionNotes('')
    } catch (error) {
      console.error('Failed to start session:', error)
    }
  }

  const handleCloseSession = async () => {
    if (!activeSession?.id || !closingBalance) return

    try {
      await closeSessionMutation.mutateAsync({
        sessionId: activeSession.id,
        closingBalance: parseFloat(closingBalance),
        notes: sessionNotes,
      })

      setIsCloseSessionModalOpen(false)
      setclosingBalance('')
      setSessionNotes('')
    } catch (error) {
      console.error('Failed to close session:', error)
    }
  }

  const handleGenerateReport = async () => {
    const today = new Date().toISOString().split('T')[0]
    try {
      await generateReportMutation.mutateAsync({
        locationId: selectedLocationId || "",
        date: today,
      })
    } catch (error) {
      console.error('Failed to generate report:', error)
    }
  }

  if (activeView === 'pos' && selectedTerminalId && hasActiveSession) {
    return (
      <div className="min-h-screen">
        <div className="p-4 bg-white border-b">
          <Button
            variant="outline"
            onClick={() => setActiveView('dashboard')}
            className="mb-4"
          >
            ← Back to Dashboard
          </Button>
        </div>
        <ProfessionalPOSSystem
          organizationId={ORGANIZATION_ID || ""}
          locationId={selectedLocationId || ""}
          terminalId={selectedTerminalId}
          sessionId={activeSession?.id}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Point of Sale Dashboard
          </h1>
          <p className="text-slate-600">Manage your POS terminals, sessions, and sales analytics</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/50 backdrop-blur-sm">
            <TabsTrigger value="overview" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <BarChart3 className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="terminals" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Monitor className="w-4 h-4 mr-2" />
              Terminals
            </TabsTrigger>
            <TabsTrigger value="sessions" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Clock className="w-4 h-4 mr-2" />
              Sessions
            </TabsTrigger>
            <TabsTrigger value="reports" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Calendar className="w-4 h-4 mr-2" />
              Reports
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-blue-100">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">Today's Sales</p>
                      <p className="text-3xl font-bold text-blue-900">
                        ${summary?.totalSalesToday?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                    <DollarSign className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-green-100">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">Transactions</p>
                      <p className="text-3xl font-bold text-green-900">
                        {summary?.transactionsToday || 0}
                      </p>
                    </div>
                    <ShoppingCart className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-50 to-purple-100">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600">Avg Transaction</p>
                      <p className="text-3xl font-bold text-purple-900">
                        ${summary?.averageTransactionValue?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0 bg-gradient-to-br from-orange-50 to-orange-100">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-orange-600">Active Sessions</p>
                      <p className="text-3xl font-bold text-orange-900">
                        {summary?.activeSessions || 0}
                      </p>
                    </div>
                    <Monitor className="w-8 h-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Payment Method Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="w-5 h-5 mr-2 text-blue-600" />
                    Payment Methods Today
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center">
                        <Banknote className="w-5 h-5 mr-3 text-green-600" />
                        <span className="font-medium">Cash</span>
                      </div>
                      <span className="font-bold text-green-600">
                        ${summary?.paymentMethodBreakdown?.cash?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center">
                        <CreditCard className="w-5 h-5 mr-3 text-blue-600" />
                        <span className="font-medium">Card</span>
                      </div>
                      <span className="font-bold text-blue-600">
                        ${summary?.paymentMethodBreakdown?.card?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center">
                        <Smartphone className="w-5 h-5 mr-3 text-purple-600" />
                        <span className="font-medium">Digital</span>
                      </div>
                      <span className="font-bold text-purple-600">
                        ${summary?.paymentMethodBreakdown?.digital?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                    Top Selling Items
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {summary?.topSellingItems?.slice(0, 5).map(
                      (
                        item: {
                          itemId: string
                          name: string
                          sku: string
                          quantitySold: number
                          revenue: number
                        },
                        index: number
                      ) => (
                        <div key={item.itemId} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <div className="flex items-center">
                            <Badge variant="secondary" className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs mr-3">
                              {index + 1}
                            </Badge>
                            <div>
                              <p className="font-medium text-sm">{item.name}</p>
                              <p className="text-xs text-slate-500">{item.sku}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-sm">{item.quantitySold} sold</p>
                            <p className="text-xs text-slate-500">${item.revenue.toFixed(2)}</p>
                          </div>
                        </div>
                      )
                    ) || (
                        <div className="text-center py-8 text-slate-500">
                          <TrendingUp className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                          <p>No sales data available</p>
                        </div>
                      )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Terminals Tab */}
          <TabsContent value="terminals" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-800">POS Terminals</h2>
              <Button variant="outline" onClick={() => window.location.reload()}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {terminalsLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className="animate-pulse">
                        <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-slate-200 rounded w-1/2 mb-4"></div>
                        <div className="h-8 bg-slate-200 rounded w-full"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                terminals?.data?.map((terminal: {
                  id: string
                  name: string
                  isActive: boolean
                  terminalNumber: string
                  currentSessionId?: string
                  hasCashDrawer?: boolean
                  hasReceiptPrinter?: boolean
                  hasBarcodeScanner?: boolean
                  hasCardReader?: boolean
                }) => {
                  return (
                    <Card key={terminal.id} className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{terminal.name}</CardTitle>
                          <Badge variant={terminal.isActive ? "default" : "secondary"}>
                            {terminal.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <CardDescription>Terminal: {terminal.terminalNumber}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-600">Current Session:</span>
                          <Badge variant={terminal.currentSessionId ? "default" : "secondary"}>
                            {terminal.currentSessionId ? "Active" : "None"}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          {terminal.hasCashDrawer && <Badge variant="outline">Cash Drawer</Badge>}
                          {terminal.hasReceiptPrinter && <Badge variant="outline">Printer</Badge>}
                          {terminal.hasBarcodeScanner && <Badge variant="outline">Scanner</Badge>}
                          {terminal.hasCardReader && <Badge variant="outline">Card Reader</Badge>}
                        </div>

                        <div className="flex gap-2">
                          {terminal.currentSessionId ? (
                            <>
                              <Button
                                size="sm"
                                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                                onClick={() => {
                                  setSelectedTerminalId(terminal.id)
                                  setActiveView('pos')
                                }}
                              >
                                <Monitor className="w-4 h-4 mr-2" />
                                Open POS
                              </Button>
                              <Dialog open={isCloseSessionModalOpen} onOpenChange={setIsCloseSessionModalOpen}>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedTerminalId(terminal.id)}
                                  >
                                    <Square className="w-4 h-4 mr-2" />
                                    Close
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Close POS Session</DialogTitle>
                                    <DialogDescription>
                                      End the current session for {terminal.name}
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div>
                                      <Label htmlFor="closingBalance">Closing Cash Amount</Label>
                                      <Input
                                        id="closingBalance"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={closingBalance}
                                        onChange={(e) => setclosingBalance(e.target.value)}
                                        placeholder="0.00"
                                        className="mt-1" />
                                    </div>
                                    <div>
                                      <Label htmlFor="sessionNotes">Notes (Optional)</Label>
                                      <Input
                                        id="sessionNotes"
                                        value={sessionNotes}
                                        onChange={(e) => setSessionNotes(e.target.value)}
                                        placeholder="Session notes..."
                                        className="mt-1" />
                                    </div>
                                  </div>
                                  <DialogFooter>
                                    <Button
                                      variant="outline"
                                      onClick={() => setIsCloseSessionModalOpen(false)}
                                    >
                                      Cancel
                                    </Button>
                                    <Button
                                      onClick={handleCloseSession}
                                      disabled={closeSessionMutation.isPending || !closingBalance}
                                    >
                                      {closeSessionMutation.isPending ? (
                                        <>
                                          <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                          Closing...
                                        </>
                                      ) : (
                                        <>
                                          <Square className="w-4 h-4 mr-2" />
                                          Close Session
                                        </>
                                      )}
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </>
                          ) : (
                            <Dialog open={isStartSessionModalOpen} onOpenChange={setIsStartSessionModalOpen}>
                              <DialogTrigger asChild>
                                <Button
                                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                                  onClick={() => setSelectedTerminalId(terminal.id)}
                                  disabled={!terminal.isActive}
                                >
                                  <Play className="w-4 h-4 mr-2" />
                                  Start Session
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Start POS Session</DialogTitle>
                                  <DialogDescription>
                                    Begin a new session for {terminal.name}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <Label htmlFor="openingBalance">Opening Cash Amount</Label>
                                    <Input
                                      id="openingBalance"
                                      type="number"
                                      step="0.01"
                                      min="0"
                                      value={openingBalance}
                                      onChange={(e) => setopeningBalance(e.target.value)}
                                      placeholder="0.00"
                                      className="mt-1" />
                                  </div>
                                  <div>
                                    <Label htmlFor="sessionNotes">Notes (Optional)</Label>
                                    <Input
                                      id="sessionNotes"
                                      value={sessionNotes}
                                      onChange={(e) => setSessionNotes(e.target.value)}
                                      placeholder="Session notes..."
                                      className="mt-1" />
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button
                                    variant="outline"
                                    onClick={() => setIsStartSessionModalOpen(false)}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    onClick={handleStartSession}
                                    disabled={startSessionMutation.isPending || !openingBalance}
                                  >
                                    {startSessionMutation.isPending ? (
                                      <>
                                        <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Starting...
                                      </>
                                    ) : (
                                      <>
                                        <Play className="w-4 h-4 mr-2" />
                                        Start Session
                                      </>
                                    )}
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })
              )}
            </div>
          </TabsContent>

          {/* Sessions Tab */}
          <TabsContent value="sessions" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-800">Recent Sessions</h2>
              <Button variant="outline" onClick={() => window.location.reload()}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>

            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="text-center py-8 text-slate-500">
                  <Clock className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p>Session history will be displayed here</p>
                  <p className="text-sm">Start a session to see activity</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-800">Sales Reports</h2>
              <Button
                onClick={handleGenerateReport}
                disabled={generateReportMutation.isPending}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                {generateReportMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Generate Today's Report
                  </>
                )}
              </Button>
            </div>

            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Daily Sales Reports</CardTitle>
                <CardDescription>View and download daily sales reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-slate-500">
                  <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p>Daily reports will be displayed here</p>
                  <p className="text-sm">Generate a report to get started</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
