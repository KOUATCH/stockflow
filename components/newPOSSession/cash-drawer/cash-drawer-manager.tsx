"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import { CashDrawer, cashDrawerTransaction, POSSession } from "@/lib/newPOSSession/db"
import type { cashDrawerTransactionType, POSSessionStatus } from "@/types/newPOSSession/types"
import { format } from "date-fns"
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Calculator,
  CheckCircle,
  Clock,
  DollarSign,
  Eye,
  History,
  Lock,
  Minus,
  Plus,
  Receipt,
  TrendingDown,
  TrendingUp,
  Unlock,
  Wallet,
  XCircle,
} from "lucide-react"
import { useState } from "react"
import { CashTransactionDialog } from "./cash-transaction-dialog"
import { SessionControlDialog } from "./session-control-dialog"
import { TransactionHistory } from "./transaction-history"

interface CashDrawerManagerProps {
  terminalId: string
  userId: string
  locationId: string
  organizationId: string
}

export function CashDrawerManager({ terminalId, userId, locationId, organizationId }: CashDrawerManagerProps) {
  const [showTransactionDialog, setShowTransactionDialog] = useState(false)
  const [transactionType, setTransactionType] = useState<"CASH_IN" | "CASH_OUT">("CASH_IN")
  const [showSessionDialog, setShowSessionDialog] = useState(false)
  const [sessionAction, setSessionAction] = useState<"open" | "close">("open")
  const [showTransactionHistory, setShowTransactionHistory] = useState(false)
  const [showAdvancedView, setShowAdvancedView] = useState(false)

  // Mock data for demonstration - in real app this would come from hooks
  const [currentSession, setCurrentSession] = useState<POSSession | null>()

  const [cashDrawerStatus, setCashDrawerStatus] = useState<CashDrawer>()

  const [recentEvents, setRecentEvents] = useState<cashDrawerTransaction[]>([
  ])

  const { toast } = useToast()

  const hasActiveSession = currentSession?.status === "ACTIVE"
  const expectedBalance = currentSession ? currentSession.openingBalance + currentSession.cashTotal : 0
  const variance = (cashDrawerStatus?.currentBalance ?? 0) - expectedBalance
  const hasVariance = Math.abs(variance) > 0.01
  const variancePercentage = expectedBalance > 0 ? (variance / expectedBalance) * 100 : 0

  // Calculate session statistics
  const sessionStats = currentSession
    ? {
      duration: new Date().getTime() - currentSession.startTime.getTime(),
      averageTransaction:
        currentSession.transactionCount > 0 ? currentSession.totalSales / currentSession.transactionCount : 0,
      cashPercentage:
        currentSession.totalSales > 0 ? (currentSession.cashTotal / currentSession.totalSales) * 100 : 0,
      cardPercentage:
        currentSession.totalSales > 0 ? (currentSession.cardTotal / currentSession.totalSales) * 100 : 0,
      digitalPercentage:
        currentSession.totalSales > 0 ? (currentSession.digitalTotal / currentSession.totalSales) * 100 : 0,
    }
    : null

  const handleOpenSession = async (openingBalance: number) => {
    try {
      // Mock session creation
      const newSession: POSSession = {
        id: `session-${Date.now()}`,
        sessionNumber: `SES-${new Date().toISOString().slice(0, 10)}-${Math.floor(Math.random() * 1000)
          .toString()
          .padStart(3, "0")}`,
        status: "ACTIVE" as POSSessionStatus,
        startTime: new Date(),
        terminalId,
        locationId,
        userId,
        openingBalance: openingBalance,
        totalSales: 0,
        transactionCount: 0,
        cashTotal: 0,
        cardTotal: 0,
        digitalTotal: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      setCurrentSession(newSession)
      setCashDrawerStatus((prev) => ({
        ...prev,
        currentBalance: openingBalance,
        isOpen: true,
        updatedAt: new Date(),
      }))

      // Add opening balance event
      const openingEvent: cashDrawerTransaction = {
        id: `event-${Date.now()}`,
        type: "OPENING_BALANCE" as cashDrawerTransactionType,
        amount: openingBalance,
        reason: "Session opening balance",
        cashDrawerId: cashDrawerStatus.id,
        sessionId: newSession.id,
        userId,
        balanceBefore: 0,
        balanceAfter: openingBalance,
        createdAt: new Date(),
      }

      setRecentEvents((prev) => [openingEvent, ...prev])

      toast({
        title: "Session Opened Successfully",
        description: `Session ${newSession.sessionNumber} started with $${openingBalance.toFixed(2)}`,
      })
      setShowSessionDialog(false)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to open session. Please try again.",
      })
    }
  }

  const handleCloseSession = async (actualBalance: number, notes?: string) => {
    if (!currentSession) return

    try {
      const finalVariance = actualBalance - expectedBalance

      setCurrentSession((prev) =>
        prev
          ? {
            ...prev,
            status: "CLOSED" as POSSessionStatus,
            endTime: new Date(),
            closingBalance: actualBalance,
            variance: finalVariance,
            updatedAt: new Date(),
          }
          : null,
      )

      setCashDrawerStatus((prev) => ({
        ...prev,
        currentBalance: actualBalance,
        isOpen: false,
        updatedAt: new Date(),
      }))

      // Add closing event
      const closingEvent: cashDrawerTransaction = {
        id: `event-${Date.now()}`,
        type: "CLOSING_BALANCE" as cashDrawerTransactionType,
        amount: actualBalance,
        reason: "Session closing balance",
        notes,
        cashDrawerId: cashDrawerStatus.id,
        sessionId: currentSession.id,
        userId,
        balanceBefore: cashDrawerStatus.currentBalance,
        balanceAfter: actualBalance,
        createdAt: new Date(),
      }

      setRecentEvents((prev) => [closingEvent, ...prev])

      toast({
        title: "Session Closed Successfully",
        description: `Session closed with ${finalVariance >= 0 ? "surplus" : "shortage"} of $${Math.abs(finalVariance).toFixed(2)}`,
        variant: Math.abs(finalVariance) > 5 ? "destructive" : "default",
      })
      setShowSessionDialog(false)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to close session. Please try again.",
      })
    }
  }

  const handleCashTransaction = async (amount: number, reason: string, notes?: string) => {
    if (!currentSession) return

    try {
      const isAddition = transactionType === "CASH_IN"
      const newBalance = cashDrawerStatus.currentBalance + (isAddition ? amount : -amount)

      if (!isAddition && newBalance < 0) {
        toast({
          variant: "destructive",
          title: "Insufficient Cash",
          description: "Cannot remove more cash than available in drawer.",
        })
        return
      }

      setCashDrawerStatus((prev) => ({
        ...prev,
        currentBalance: newBalance,
        updatedAt: new Date(),
      }))

      // Add transaction event
      const transactionEvent: cashDrawerTransaction = {
        id: `event-${Date.now()}`,
        type: transactionType,
        amount,
        reason,
        notes,
        cashDrawerId: cashDrawerStatus.id,
        sessionId: currentSession.id,
        userId,
        balanceBefore: cashDrawerStatus.currentBalance,
        balanceAfter: newBalance,
        createdAt: new Date(),
      }

      setRecentEvents((prev) => [transactionEvent, ...prev.slice(0, 19)]) // Keep last 20 events

      toast({
        title: `Cash ${isAddition ? "Added" : "Removed"} Successfully`,
        description: `$${amount.toFixed(2)} ${isAddition ? "added to" : "removed from"} drawer. New balance: $${newBalance.toFixed(2)}`,
      })
      setShowTransactionDialog(false)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Transaction Failed",
        description: "Failed to process cash transaction. Please try again.",
      })
    }
  }

  const formatDuration = (milliseconds: number) => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60))
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m`
  }

  const getEventIcon = (type: cashDrawerTransactionType) => {
    switch (type) {
      case "CASH_IN":
      case "OPENING_BALANCE":
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case "CASH_OUT":
      case "CLOSING_BALANCE":
        return <TrendingDown className="h-4 w-4 text-red-600" />
      case "SALE":
        return <Receipt className="h-4 w-4 text-blue-600" />
      case "RETURN":
        return <TrendingDown className="h-4 w-4 text-orange-600" />
      default:
        return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  const getEventColor = (type: cashDrawerTransactionType) => {
    switch (type) {
      case "CASH_IN":
      case "OPENING_BALANCE":
        return "text-green-600"
      case "CASH_OUT":
      case "CLOSING_BALANCE":
        return "text-red-600"
      case "SALE":
        return "text-blue-600"
      case "RETURN":
        return "text-orange-600"
      default:
        return "text-gray-600"
    }
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Session Status Header */}
      <Card className={`border-2 ${hasActiveSession ? "border-green-200 bg-green-50" : "border-gray-200"}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-full ${hasActiveSession ? "bg-green-100" : "bg-gray-100"}`}>
                {hasActiveSession ? (
                  <Unlock className="h-6 w-6 text-green-600" />
                ) : (
                  <Lock className="h-6 w-6 text-gray-600" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-xl">{hasActiveSession ? "Session Active" : "Session Closed"}</CardTitle>
                  {hasActiveSession && (
                    <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                      <Activity className="h-3 w-3 mr-1" />
                      Live
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-4 mt-1">
                  <p className="text-sm text-muted-foreground">
                    {hasActiveSession && currentSession
                      ? `Started ${format(currentSession.startTime, "MMM dd, yyyy HH:mm")}`
                      : "No active session"}
                  </p>
                  {hasActiveSession && sessionStats && (
                    <Badge variant="secondary" className="text-xs">
                      Duration: {formatDuration(sessionStats.duration)}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdvancedView(!showAdvancedView)}
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                {showAdvancedView ? "Simple" : "Advanced"}
              </Button>
              {hasActiveSession ? (
                <>
                  <Button variant="outline" size="sm" onClick={() => setShowTransactionHistory(true)}>
                    <History className="h-4 w-4 mr-2" />
                    History
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setSessionAction("close")
                      setShowSessionDialog(true)
                    }}
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    Close Session
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => {
                    setSessionAction("open")
                    setShowSessionDialog(true)
                  }}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Unlock className="h-4 w-4 mr-2" />
                  Open Session
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Variance Alert */}
      {hasActiveSession && hasVariance && (
        <Alert
          className={`border-2 ${Math.abs(variance) > 10 ? "border-red-200 bg-red-50" : "border-orange-200 bg-orange-50"}`}
        >
          <AlertTriangle className={`h-4 w-4 ${Math.abs(variance) > 10 ? "text-red-600" : "text-orange-600"}`} />
          <AlertDescription className={Math.abs(variance) > 10 ? "text-red-800" : "text-orange-800"}>
            <strong>Cash Variance Detected:</strong> {variance > 0 ? "Surplus" : "Shortage"} of $
            {Math.abs(variance).toFixed(2)} ({variancePercentage > 0 ? "+" : ""}
            {variancePercentage.toFixed(1)}%)
            {Math.abs(variance) > 10 && " - Immediate attention required!"}
          </AlertDescription>
        </Alert>
      )}

      {hasActiveSession && (
        <>
          {/* Enhanced Cash Drawer Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="relative overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-blue-100">
                    <Wallet className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Current Balance</p>
                    <p className="text-2xl font-bold">${cashDrawerStatus.currentBalance.toFixed(2)}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {cashDrawerStatus.isOpen ? (
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      ) : (
                        <XCircle className="h-3 w-3 text-red-500" />
                      )}
                      <span className="text-xs text-muted-foreground">
                        {cashDrawerStatus.isOpen ? "Open" : "Closed"}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-green-100">
                    <Calculator className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Expected Balance</p>
                    <p className="text-2xl font-bold">${expectedBalance.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground mt-1">Opening + Cash Sales</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={hasVariance ? "border-orange-200 bg-orange-50" : ""}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${hasVariance ? "bg-orange-100" : "bg-gray-100"}`}>
                    <AlertTriangle className={`h-5 w-5 ${hasVariance ? "text-orange-600" : "text-gray-600"}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Variance</p>
                    <p
                      className={`text-2xl font-bold ${variance > 0 ? "text-green-600" : variance < 0 ? "text-red-600" : "text-gray-600"}`}
                    >
                      {variance > 0 ? "+" : ""}${variance.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {variancePercentage > 0 ? "+" : ""}
                      {variancePercentage.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-purple-100">
                    <Receipt className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Total Sales</p>
                    <p className="text-2xl font-bold">${currentSession.totalSales.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground mt-1">{currentSession.transactionCount} transactions</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Advanced Session Analytics */}
          {showAdvancedView && sessionStats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Payment Methods
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Cash</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full"
                          style={{ width: `${sessionStats.cashPercentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{sessionStats.cashPercentage.toFixed(0)}%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Card</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${sessionStats.cardPercentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{sessionStats.cardPercentage.toFixed(0)}%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Digital</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-500 rounded-full"
                          style={{ width: `${sessionStats.digitalPercentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{sessionStats.digitalPercentage.toFixed(0)}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Session Performance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Avg Transaction</span>
                    <span className="font-medium">${sessionStats.averageTransaction.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Transactions/Hour</span>
                    <span className="font-medium">
                      {sessionStats.duration > 0
                        ? (currentSession.transactionCount / (sessionStats.duration / (1000 * 60 * 60))).toFixed(1)
                        : "0.0"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Sales/Hour</span>
                    <span className="font-medium">
                      $
                      {sessionStats.duration > 0
                        ? (currentSession.totalSales / (sessionStats.duration / (1000 * 60 * 60))).toFixed(2)
                        : "0.00"}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Cash Flow Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Opening Cash</span>
                    <span className="font-medium">${currentSession.openingBalance.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Cash Sales</span>
                    <span className="font-medium text-green-600">+${currentSession.cashTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Net Cash Flow</span>
                    <span className="font-medium">${currentSession.cashTotal.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Enhanced Cash Operations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Cash Operations
                <Badge variant="secondary" className="ml-auto">
                  Balance: ${cashDrawerStatus.currentBalance.toFixed(2)}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={() => {
                    setTransactionType("CASH_IN")
                    setShowTransactionDialog(true)
                  }}
                  className="h-20 bg-green-600 hover:bg-green-700 flex-col gap-2"
                  disabled={!cashDrawerStatus.isOpen}
                >
                  <Plus className="h-6 w-6" />
                  <span>Add Cash</span>
                  <span className="text-xs opacity-80">Increase drawer balance</span>
                </Button>
                <Button
                  onClick={() => {
                    setTransactionType("CASH_OUT")
                    setShowTransactionDialog(true)
                  }}
                  variant="destructive"
                  className="h-20 flex-col gap-2"
                  disabled={!cashDrawerStatus.isOpen || cashDrawerStatus.currentBalance <= 0}
                >
                  <Minus className="h-6 w-6" />
                  <span>Remove Cash</span>
                  <span className="text-xs opacity-80">Decrease drawer balance</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Recent Transactions */}
          {recentEvents && recentEvents.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Recent Activity
                    <Badge variant="outline">{recentEvents.length} events</Badge>
                  </CardTitle>
                  <Button variant="outline" size="sm" onClick={() => setShowTransactionHistory(true)}>
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-80">
                  <div className="space-y-3">
                    {recentEvents.slice(0, 8).map((event) => (
                      <div
                        key={event.id}
                        className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-muted">{getEventIcon(event.type)}</div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium capitalize text-sm">
                                {event.type.replace("_", " ").toLowerCase()}
                              </p>
                              <Badge variant="outline" className="text-xs">
                                {event.type}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{event.reason}</p>
                            {event.notes && <p className="text-xs text-muted-foreground italic">{event.notes}</p>}
                            <p className="text-xs text-muted-foreground">
                              {format(event.createdAt, "MMM dd, HH:mm:ss")}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${getEventColor(event.type)}`}>
                            {event.type === "CASH_OUT" || event.type === "CLOSING_BALANCE" ? "-" : "+"}$
                            {Math.abs(event.amount).toFixed(2)}
                          </p>
                          <div className="text-xs text-muted-foreground">
                            <div>Before: ${event.balanceBefore.toFixed(2)}</div>
                            <div>After: ${event.balanceAfter.toFixed(2)}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Enhanced Dialogs */}
      <CashTransactionDialog
        open={showTransactionDialog}
        onOpenChange={setShowTransactionDialog}
        type={transactionType}
        sessionId={currentSession?.id || ""}
        onSuccess={handleCashTransaction}
      />

      <SessionControlDialog
        open={showSessionDialog}
        onOpenChange={setShowSessionDialog}
        action={sessionAction}
        currentSession={currentSession}
        expectedBalance={expectedBalance}
        onOpenSession={handleOpenSession}
        onCloseSession={handleCloseSession}
        isLoading={false}
      />

      <TransactionHistory
        open={showTransactionHistory}
        onOpenChange={setShowTransactionHistory}
        sessionId={currentSession?.id}
        events={recentEvents}
      />
    </div>
  )
}
