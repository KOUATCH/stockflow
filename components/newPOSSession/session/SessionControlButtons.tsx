"use client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, DollarSign, Pause, Play, RotateCcw, Square, Users } from "lucide-react"

interface SessionControlButtonsProps {
  sessionStatus: "active" | "paused" | "closed"
  onStartSession: () => void
  onPauseSession: () => void
  onEndSession: () => void
  onResumeSession: () => void
  sessionData?: {
    startTime: string
    totalSales: number
    transactionCount: number
  }
}

export function SessionControlButtons({
  sessionStatus,
  onStartSession,
  onPauseSession,
  onEndSession,
  onResumeSession,
  sessionData,
}: SessionControlButtonsProps) {
  const getStatusColor = () => {
    switch (sessionStatus) {
      case "active":
        return "bg-green-500"
      case "paused":
        return "bg-yellow-500"
      case "closed":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusText = () => {
    switch (sessionStatus) {
      case "active":
        return "Active"
      case "paused":
        return "Paused"
      case "closed":
        return "Closed"
      default:
        return "Unknown"
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Session Control</CardTitle>
          <Badge variant="outline" className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
            {getStatusText()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Session Stats */}
        {sessionData && sessionStatus !== "closed" && (
          <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="text-center">
              <Clock className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Started</p>
              <p className="text-sm font-medium">{new Date(sessionData.startTime).toLocaleTimeString()}</p>
            </div>
            <div className="text-center">
              <DollarSign className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Total Sales</p>
              <p className="text-sm font-medium">${sessionData.totalSales.toFixed(2)}</p>
            </div>
            <div className="text-center">
              <Users className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Transactions</p>
              <p className="text-sm font-medium">{sessionData.transactionCount}</p>
            </div>
          </div>
        )}

        {/* Control Buttons */}
        <div className="flex gap-2">
          {sessionStatus === "closed" && (
            <Button onClick={onStartSession} className="flex-1 bg-green-600 hover:bg-green-700">
              <Play className="w-4 h-4 mr-2" />
              Start Session
            </Button>
          )}

          {sessionStatus === "active" && (
            <>
              <Button onClick={onPauseSession} variant="outline" className="flex-1 bg-transparent">
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </Button>
              <Button onClick={onEndSession} variant="destructive" className="flex-1">
                <Square className="w-4 h-4 mr-2" />
                End Session
              </Button>
            </>
          )}

          {sessionStatus === "paused" && (
            <>
              <Button onClick={onResumeSession} className="flex-1 bg-green-600 hover:bg-green-700">
                <RotateCcw className="w-4 h-4 mr-2" />
                Resume
              </Button>
              <Button onClick={onEndSession} variant="destructive" className="flex-1">
                <Square className="w-4 h-4 mr-2" />
                End Session
              </Button>
            </>
          )}
        </div>

        {/* Session Instructions */}
        {sessionStatus === "closed" && (
          <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-700">Start a new session to begin processing transactions</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
