"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import {
  Play,
  Square,
  Pause,
  RotateCcw,
  Clock,
  DollarSign,
  Receipt,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Settings,
  User,
  MapPin,
  Calendar,
  BarChart3,
  PieChart,
  Monitor,
  Smartphone,
  Printer,
  Wifi,
  WifiOff,
  RefreshCw,
  Download,
  Upload,
  Save,
  Trash2,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Edit,
  Plus,
  Minus,
  Zap,
  ShoppingCart,
  CreditCard,
  Banknote,
  Calculator,
  FileText,
  HelpCircle,
  Info
} from 'lucide-react'

import { formatCurrency } from '@/actions/posSystem/utils/pos-utils'
// Removed old session hooks - using unified session management
import { getAvailableLocations, getTerminalsByLocation } from '@/actions/sessions/pos-session-actions'
import { useSessionManagement } from '@/hooks/sessions'
import { useToast } from '@/hooks/use-toast'
import { useQuery } from '@tanstack/react-query'
import type {
  POSSession,
  POSTerminal,
  Location,
  SessionStatus
} from '@/actions/posSystem/types/pos-system-types'

interface POSSessionManagerProps {
  organizationId: string
  userId: string
  userName: string
  onSessionStarted?: (session: POSSession) => void
  onSessionEnded?: () => void
}

export default function POSSessionManager({
  organizationId,
  userId,
  userName,
  onSessionStarted,
  onSessionEnded
}: POSSessionManagerProps) {
  const { toast } = useToast()

  // Get available locations
  const {
    data: availableLocations,
    isLoading: locationsLoading
  } = useQuery({
    queryKey: ['available-locations'],
    queryFn: getAvailableLocations
  })

  // State for session operations
  const [selectedLocationId, setSelectedLocationId] = useState<string>('')
  const [selectedTerminalId, setSelectedTerminalId] = useState<string>('')

  // Get terminals for selected location
  const {
    data: availableTerminals,
    isLoading: terminalsLoading
  } = useQuery({
    queryKey: ['location-terminals', selectedLocationId],
    queryFn: () => selectedLocationId ? getTerminalsByLocation(selectedLocationId) : [],
    enabled: !!selectedLocationId
  })

  // Unified session management hook
  const {
    currentSession,
    isSessionActive,
    startSession,
    endSession,
    sessionLoading,
    isOpeningSession,
    isClosingSession,
    sessionError,
    refetchSession,
    sessionState
  } = useSessionManagement({
    stationId: selectedTerminalId || '',
    organizationId: organizationId,
    enableAutoRefetch: true,
    refetchInterval: 30000
  })

  // State for session operations
  const [showStartDialog, setShowStartDialog] = useState(false)
  const [showEndDialog, setShowEndDialog] = useState(false)
  const [openingCash, setOpeningCash] = useState<number>(0)
  const [closingCash, setClosingCash] = useState<number>(0)
  const [sessionNotes, setSessionNotes] = useState('')

  // Reset terminal selection when location changes
  useEffect(() => {
    setSelectedTerminalId('')
  }, [selectedLocationId])

  // Derive session status
  const sessionStatus = currentSession?.status || sessionState || 'inactive'

  // Auto-refresh analytics
  useEffect(() => {
    if (isSessionActive) {
      const interval = setInterval(refetchSession, 60000) // Refresh every minute
      return () => clearInterval(interval)
    }
  }, [isSessionActive, refetchSession])

  // Handle session start
  const handleStartSession = async () => {
    if (!selectedLocationId) {
      toast({
        title: "Error",
        description: "Please select a location",
        variant: "destructive"
      })
      return
    }

    if (!selectedTerminalId) {
      toast({
        title: "Error",
        description: "Please select a terminal",
        variant: "destructive"
      })
      return
    }

    try {
      await startSession(openingCash, userId, selectedLocationId, organizationId)

      const selectedLocation = availableLocations?.find(loc => loc.id === selectedLocationId)
      const selectedTerminal = availableTerminals?.find(term => term.id === selectedTerminalId)
      toast({
        title: "Session Started",
        description: `POS session started at ${selectedLocation?.name} on ${selectedTerminal?.terminalName} with ${formatCurrency(openingCash, 'USD')} opening cash`
      })
      setShowStartDialog(false)
      setSelectedLocationId('')
      setSelectedTerminalId('')
      setOpeningCash(0)
      setSessionNotes('')
      onSessionStarted?.(currentSession)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start session",
        variant: "destructive"
      })
    }
  }

  // Handle session end
  const handleEndSession = async () => {
    if (!currentSession) return

    try {
      await endSession(closingCash)

      toast({
        title: "Session Ended",
        description: "POS session closed successfully"
      })
      setShowEndDialog(false)
      setClosingCash(0)
      onSessionEnded?.()
    } catch (error) {
      console.error("Failed to end session:", error)
      toast({
        title: "Error",
        description: "Failed to end session",
        variant: "destructive"
      })
    }
  }

  // Handle session suspend
  const handleSuspendSession = async () => {
    if (!currentSession) return

    try {
      const success = await suspendSession(currentSession.id)

      if (success) {
        toast({
          title: "Session Suspended",
          description: "POS session has been suspended"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to suspend session",
        variant: "destructive"
      })
    }
  }

  // Handle session resume
  const handleResumeSession = async () => {
    if (!currentSession) return

    try {
      const success = await resumeSession(currentSession.id)

      if (success) {
        toast({
          title: "Session Resumed",
          description: "POS session has been resumed"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resume session",
        variant: "destructive"
      })
    }
  }

  // Calculate expected cash
  const expectedCash = currentSession ?
    currentSession.openingCash + (sessionAnalytics?.cashSales || 0) : 0

  // Get current location and terminal info
  const currentLocation = currentSession ?
    availableLocations?.find(loc => loc.id === currentSession.locationId) : null
  const currentTerminal = currentSession ?
    availableTerminals?.find(term => term.id === currentSession.terminalId) : null

  const getSessionStatusColor = (status: SessionStatus | null) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800 border-green-200'
      case 'SUSPENDED': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'CLOSED': return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'RECONCILED': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getSessionStatusIcon = (status: SessionStatus | null) => {
    switch (status) {
      case 'ACTIVE': return <CheckCircle className="w-4 h-4" />
      case 'SUSPENDED': return <Pause className="w-4 h-4" />
      case 'CLOSED': return <Square className="w-4 h-4" />
      case 'RECONCILED': return <Calculator className="w-4 h-4" />
      default: return <XCircle className="w-4 h-4" />
    }
  }

  if (sessionError) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          {sessionError?.message || 'An error occurred'}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Session Status Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
                <Monitor className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl">
                  {currentSession ? `${currentTerminal?.terminalName || 'Terminal'} (${currentTerminal?.terminalNumber || 'N/A'})` : 'No Active Session'}
                </CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <MapPin className="w-4 h-4" />
                  {currentLocation ? `${currentLocation.name} • ${currentLocation.city}, ${currentLocation.state}` : 'No location selected'}
                </CardDescription>
              </div>
            </div>
            <div className="text-right">
              <Badge className={`${getSessionStatusColor(sessionStatus)} border`}>
                {getSessionStatusIcon(sessionStatus)}
                <span className="ml-1">
                  {sessionStatus || 'NO SESSION'}
                </span>
              </Badge>
              {currentSession && (
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Session: {currentSession.sessionNumber}
                </p>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Session Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {!currentSession ? (
          <Card className="md:col-span-3">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                <Play className="w-8 h-8 text-slate-600 dark:text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                No Active Session
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-center mb-6">
                Start a new POS session to begin processing transactions
              </p>
              <Button
                onClick={() => setShowStartDialog(true)}
                disabled={isOpeningSession}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg"
              >
                {isOpeningSession ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Play className="w-4 h-4 mr-2" />
                )}
                Start Session
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Session Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Session Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Started:</span>
                  <span className="text-sm font-medium">
                    {new Date(currentSession.startTime).toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Cashier:</span>
                  <span className="text-sm font-medium">{userName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Opening Cash:</span>
                  <span className="text-sm font-medium">
                    {formatCurrency(currentSession.openingCash, 'USD')}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Session Analytics */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Session Analytics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Total Sales:</span>
                  <span className="text-sm font-medium text-green-600">
                    {formatCurrency(sessionAnalytics?.totalSales || 0, 'USD')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Transactions:</span>
                  <span className="text-sm font-medium">
                    {sessionAnalytics?.totalTransactions || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Avg. Transaction:</span>
                  <span className="text-sm font-medium">
                    {formatCurrency(sessionAnalytics?.averageTransaction || 0, 'USD')}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Session Controls */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Session Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {sessionStatus === 'ACTIVE' && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSuspendSession}
                      className="w-full"
                    >
                      <Pause className="w-4 h-4 mr-2" />
                      Suspend
                    </Button>
                    <Button
                      onClick={() => setShowEndDialog(true)}
                      disabled={isClosingSession}
                      variant="destructive"
                      size="sm"
                      className="w-full"
                    >
                      {isClosingSession ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Square className="w-4 h-4 mr-2" />
                      )}
                      End Session
                    </Button>
                  </>
                )}
                {sessionStatus === 'SUSPENDED' && (
                  <Button
                    onClick={handleResumeSession}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Resume
                  </Button>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Session Analytics Details */}
      {currentSession && sessionAnalytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sales Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5 text-blue-600" />
                Sales Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Cash Sales</span>
                  <span className="font-medium">
                    {formatCurrency(sessionAnalytics.cashSales, 'USD')}
                  </span>
                </div>
                <Progress
                  value={(sessionAnalytics.cashSales / sessionAnalytics.totalSales) * 100}
                  className="h-2"
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Card Sales</span>
                  <span className="font-medium">
                    {formatCurrency(sessionAnalytics.cardSales, 'USD')}
                  </span>
                </div>
                <Progress
                  value={(sessionAnalytics.cardSales / sessionAnalytics.totalSales) * 100}
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>

          {/* Top Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Top Selling Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sessionAnalytics.topItems?.slice(0, 5).map((item, index) => (
                  <div key={item.itemId} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="w-6 h-6 p-0 text-xs">
                        {index + 1}
                      </Badge>
                      <span className="text-sm font-medium truncate">{item.itemName}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {formatCurrency(item.revenue, 'USD')}
                      </div>
                      <div className="text-xs text-slate-500">
                        Qty: {item.quantity}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Start Session Dialog */}
      <Dialog open={showStartDialog} onOpenChange={setShowStartDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Start POS Session</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Select value={selectedLocationId} onValueChange={setSelectedLocationId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a location" />
                </SelectTrigger>
                <SelectContent>
                  {availableLocations?.map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <div>
                          <div className="font-medium">{location.name}</div>
                          <div className="text-xs text-slate-500">
                            {location.address}, {location.city}, {location.state}
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="terminal">Terminal</Label>
              <Select value={selectedTerminalId} onValueChange={setSelectedTerminalId} disabled={!selectedLocationId}>
                <SelectTrigger>
                  <SelectValue placeholder={selectedLocationId ? "Select a terminal" : "Select location first"} />
                </SelectTrigger>
                <SelectContent>
                  {availableTerminals?.map((terminal) => (
                    <SelectItem key={terminal.id} value={terminal.id} disabled={!['ACTIVE', 'AVAILABLE'].includes(terminal.status)}>
                      <div className="flex items-center gap-2">
                        <Monitor className="w-4 h-4" />
                        <div>
                          <div className="font-medium">{terminal.terminalName}</div>
                          <div className="text-xs text-slate-500 flex items-center gap-2">
                            <span>{terminal.terminalNumber}</span>
                            <span>•</span>
                            <Badge
                              variant={['ACTIVE', 'AVAILABLE'].includes(terminal.status) ? 'default' : 'secondary'}
                              className={`text-xs ${
                                terminal.status === 'ACTIVE'
                                  ? 'bg-blue-100 text-blue-800'
                                  : terminal.status === 'AVAILABLE'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-orange-100 text-orange-800'
                              }`}
                            >
                              {terminal.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {terminalsLoading && (
                <p className="text-sm text-slate-500">Loading terminals...</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="openingCash">Opening Cash Amount</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  id="openingCash"
                  type="number"
                  step="0.01"
                  min="0"
                  value={openingCash || ''}
                  onChange={(e) => setOpeningCash(parseFloat(e.target.value) || 0)}
                  className="pl-10"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sessionNotes">Session Notes (Optional)</Label>
              <Input
                id="sessionNotes"
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                placeholder="Enter any notes for this session..."
              />
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <h4 className="font-medium mb-2">Session Details</h4>
              <div className="text-sm space-y-1 text-slate-600 dark:text-slate-400">
                <p>Location: {selectedLocationId ? availableLocations?.find(loc => loc.id === selectedLocationId)?.name || 'Unknown' : 'Not selected'}</p>
                <p>Terminal: {selectedTerminalId ? availableTerminals?.find(term => term.id === selectedTerminalId)?.terminalName || 'Unknown' : 'Not selected'}</p>
                <p>Cashier: {userName}</p>
                <p>Date: {new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStartDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleStartSession}
              disabled={isOpeningSession || !selectedLocationId || !selectedTerminalId || locationsLoading || terminalsLoading}
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white"
            >
              {isOpeningSession ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Play className="w-4 h-4 mr-2" />
              )}
              Start Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* End Session Dialog */}
      <Dialog open={showEndDialog} onOpenChange={setShowEndDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>End POS Session</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="closingCash">Closing Cash Count</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  id="closingCash"
                  type="number"
                  step="0.01"
                  min="0"
                  value={closingCash || ''}
                  onChange={(e) => setClosingCash(parseFloat(e.target.value) || 0)}
                  className="pl-10"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg space-y-3">
              <h4 className="font-medium">Session Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Opening Cash:</span>
                  <span className="font-medium">
                    {formatCurrency(currentSession?.openingCash || 0, 'USD')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Cash Sales:</span>
                  <span className="font-medium">
                    {formatCurrency(sessionAnalytics?.cashSales || 0, 'USD')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Expected Cash:</span>
                  <span className="font-medium text-blue-600">
                    {formatCurrency(expectedCash, 'USD')}
                  </span>
                </div>
                {closingCash > 0 && (
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-slate-600 dark:text-slate-400">Variance:</span>
                    <span className={`font-medium ${
                      closingCash - expectedCash >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(closingCash - expectedCash, 'USD')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEndDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleEndSession}
              disabled={isClosingSession}
              variant="destructive"
            >
              {isClosingSession ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Square className="w-4 h-4 mr-2" />
              )}
              End Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}