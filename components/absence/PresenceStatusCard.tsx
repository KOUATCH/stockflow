"use client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { formatDuration, formatTime } from "@/lib/dateUtils"
import { cn } from "@/lib/utils"
import { type PresenceStatusResponse, PRESENCE_STATUS_COLORS } from "@/types/presence"
import { AlertCircle, CheckCircle, Clock, Coffee, Timer } from "lucide-react"

interface PresenceStatusCardProps {
  status: PresenceStatusResponse | undefined
  className?: string
  showActions?: boolean
  onClockIn?: () => void
  onClockOut?: () => void
  onStartBreak?: () => void
  onEndBreak?: () => void
}

export function PresenceStatusCard({
  status,
  className,
  showActions = false,
  onClockIn,
  onClockOut,
  onStartBreak,
  onEndBreak,
}: PresenceStatusCardProps) {
  if (!status) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Loading presence status...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const { session } = status
  const isWorking = status.status === "CLOCKED_IN" || status.status === "ON_BREAK" || status.status === "OVERTIME"
  const isOnBreak = status.status === "ON_BREAK"

  const getStatusIcon = () => {
    switch (status.status) {
      case "CLOCKED_IN":
        return <CheckCircle className="h-6 w-6 text-green-600" />
      case "ON_BREAK":
        return <Coffee className="h-6 w-6 text-yellow-600" />
      case "OVERTIME":
        return <Timer className="h-6 w-6 text-blue-600" />
      case "LATE":
        return <AlertCircle className="h-6 w-6 text-orange-600" />
      case "CLOCKED_OUT":
        return <Clock className="h-6 w-6 text-gray-600" />
      default:
        return <Clock className="h-6 w-6 text-gray-400" />
    }
  }

  const getStatusMessage = () => {
    if (!session) {
      return "You are currently clocked out. Click 'Clock In' to start your work session."
    }

    switch (status.status) {
      case "CLOCKED_IN":
        return `You've been working for ${formatDuration(session.currentWorkDuration)} today.`
      case "ON_BREAK":
        return `You're currently on a ${session.currentBreak?.breakType?.toLowerCase() || "break"}. Duration: ${session.currentBreak
          ? formatDuration(
            Math.floor((new Date().getTime() - new Date(session.currentBreak.startTime).getTime()) / 60000),
          )
          : "0 minutes"
          }`
      case "OVERTIME":
        return `You're in overtime! Total work time: ${formatDuration(session.currentWorkDuration)}`
      case "LATE":
        return `You clocked in late today. Total work time: ${formatDuration(session.currentWorkDuration)}`
      default:
        return `Current status: ${status.status ? status.status.replace("_", " ").toLowerCase() : "unknown"}`
    }
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">{getStatusIcon()}</div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {isWorking ? "Currently Working" : "Not Working"}
                </h3>
                <Badge className={PRESENCE_STATUS_COLORS[status.status]}>{status.status ? status.status.replace("_", " ") : "Unknown"}</Badge>
              </div>

              <p className="text-gray-600 mb-4">{getStatusMessage()}</p>

              {/* Session Details */}
              {session && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 font-medium">Clock In</p>
                    <p className="text-gray-900">{formatTime(new Date(session.clockInTime))}</p>
                  </div>

                  <div>
                    <p className="text-gray-500 font-medium">Location</p>
                    <p className="text-gray-900">{session.location.name}</p>
                  </div>

                  <div>
                    <p className="text-gray-500 font-medium">Work Time</p>
                    <p className="text-gray-900">
                      {formatDuration(session.currentWorkDuration - session.totalBreakMinutes)}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500 font-medium">Break Time</p>
                    <p className="text-gray-900">{formatDuration(session.totalBreakMinutes)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          {showActions && (
            <div className="flex flex-col space-y-2 ml-4">
              {!isWorking && (
                <Button onClick={onClockIn} className="bg-green-600 hover:bg-green-700" size="sm">
                  Clock In
                </Button>
              )}

              {isWorking && !isOnBreak && (
                <>
                  <Button
                    onClick={onStartBreak}
                    variant="outline"
                    size="sm"
                    className="border-yellow-600 text-yellow-600 hover:bg-yellow-50 bg-transparent"
                  >
                    Start Break
                  </Button>
                  <Button
                    onClick={onClockOut}
                    variant="outline"
                    size="sm"
                    className="border-red-600 text-red-600 hover:bg-red-50 bg-transparent"
                  >
                    Clock Out
                  </Button>
                </>
              )}

              {isOnBreak && (
                <>
                  <Button onClick={onEndBreak} className="bg-green-600 hover:bg-green-700" size="sm">
                    End Break
                  </Button>
                  <Button
                    onClick={onClockOut}
                    variant="outline"
                    size="sm"
                    className="border-red-600 text-red-600 hover:bg-red-50 bg-transparent"
                  >
                    Clock Out
                  </Button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Overtime Warning */}
        {session && session.currentWorkDuration > 480 && (
          <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <p className="text-sm text-orange-800">
                <span className="font-medium">Overtime Alert:</span> You've worked{" "}
                {formatDuration(session.currentWorkDuration - 480)} beyond your regular hours.
              </p>
            </div>
          </div>
        )}

        {/* Extended Break Warning */}
        {isOnBreak &&
          session?.currentBreak?.expectedDuration &&
          (() => {
            const currentBreakDuration = Math.floor(
              (new Date().getTime() - new Date(session.currentBreak!.startTime).getTime()) / 60000,
            )
            const isExtended = currentBreakDuration > session.currentBreak.expectedDuration + 5

            return isExtended ? (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Coffee className="h-4 w-4 text-yellow-600" />
                  <p className="text-sm text-yellow-800">
                    <span className="font-medium">Extended Break:</span> Your break has exceeded the expected duration
                    by {formatDuration(currentBreakDuration - session.currentBreak.expectedDuration)} minutes.
                  </p>
                </div>
              </div>
            ) : null
          })()}
      </CardContent>
    </Card>
  )
}
