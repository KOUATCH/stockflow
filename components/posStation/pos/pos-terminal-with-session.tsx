"use client"

import { SessionManagement } from "@/components/posStation/pos/session-management"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useActiveSession } from "@/hooks/posStation/use-pos-session"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency } from "@/lib/formatCurrency"
import { AlertTriangle, CheckCircle, Clock, ShoppingCart, Terminal, TrendingUp } from "lucide-react"
import { useEffect, useState } from "react"

interface pOSStationWithSessionProps {
  organizationId: string
  locationId: string
  terminalId: string
  userId: string
  userName?: string
}

export function PosStationWithSession({
  organizationId,
  locationId,
  terminalId,
  userId,
  userName,
}: pOSStationWithSessionProps) {
  const [currentSession, setCurrentSession] = useState<any>(null)

  const { toast } = useToast()
  const {
    data: sessionData,
    isLoading: sessionLoading,
    error: sessionError,
    refetch: refetchSession,
  } = useActiveSession(terminalId)

  useEffect(() => {
    if (sessionData?.success && sessionData.data) {
      setCurrentSession(sessionData.data)

      // Welcome message when session is found
      if (!currentSession && sessionData.data) {
        toast({
          title: `Welcome back, ${userName || "User"}!`,
          description: `Continuing session ${sessionData.data.sessionNumber}`,
          variant: "default",
        })
      }
    } else if (sessionData?.success && !sessionData.data) {
      setCurrentSession(null)
    }
  }, [sessionData, currentSession, userName, toast])

  useEffect(() => {
    if (sessionError) {
      toast({
        title: "Session Error",
        description: "Failed to load session information",
        variant: "destructive",
      })
    }
  }, [sessionError, toast])

  const handleSessionChange = (session: any) => {
    setCurrentSession(session)
    refetchSession()
  }

  const sessionDuration = currentSession
    ? (new Date().getTime() - new Date(currentSession.startTime).getTime()) / (1000 * 60 * 60)
    : 0

  return (
    <div className="space-y-6">
      {/* Session Status Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Terminal className="h-5 w-5 text-blue-600" />
              POS Terminal Status
            </span>
            {sessionLoading && (
              <Badge variant="outline" className="animate-pulse">
                <Clock className="h-3 w-3 mr-1" />
                Loading...
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentSession ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-white/60 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{formatCurrency(currentSession.totalSales)}</div>
                <div className="text-sm text-gray-600">Session Sales</div>
              </div>
              <div className="text-center p-3 bg-white/60 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{currentSession.transactionCount}</div>
                <div className="text-sm text-gray-600">Transactions</div>
              </div>
              <div className="text-center p-3 bg-white/60 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{sessionDuration.toFixed(1)}h</div>
                <div className="text-sm text-gray-600">Duration</div>
              </div>
              <div className="text-center p-3 bg-white/60 rounded-lg">
                <div className="text-2xl font-bold text-emerald-600">{formatCurrency(currentSession.openingBalance)}</div>
                <div className="text-sm text-gray-600">Opening Cash</div>
              </div>
            </div>
          ) : (
            <Alert className="border-amber-200 bg-amber-50">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                No active session. Start a new session to begin processing transactions.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Session Management */}
      <SessionManagement
        terminalId={terminalId}
        locationId={locationId}
        organizationId={organizationId}
        userId={userId}
        currentSession={currentSession}
        onSessionChange={handleSessionChange}
      />

      {/* POS Terminal Interface */}
      {currentSession ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Point of Sale
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <CheckCircle className="h-3 w-3 mr-1" />
                Session Active
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium mb-2">POS Interface Ready</p>
              <p className="text-sm text-gray-600 mb-4">
                Session {currentSession.sessionNumber} is active and ready for transactions
              </p>
              <Button className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Start Selling
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="opacity-60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Point of Sale
              <Badge variant="secondary">Session Required</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Terminal className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium mb-2">Session Required</p>
              <p className="text-sm text-gray-600">Please start a POS session to access the point of sale interface</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
