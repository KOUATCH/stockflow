"use client"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { formatDuration, formatTime } from "@/lib/dateUtils"
import type { Session } from "@/types/presence"

interface ActiveEmployeesListProps {
  sessions: Session[]
  showDetails?: boolean
}

export function ActiveEmployeesList({ sessions, showDetails = false }: ActiveEmployeesListProps) {
  if (!sessions || sessions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No active sessions at the moment</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {sessions.map((session) => (
        <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm">Employee</p>
              <p className="text-xs text-gray-500">{session.location.name}</p>
            </div>
          </div>
          {showDetails && (
            <div className="text-right">
              <p className="text-sm font-medium">{formatDuration(session.currentWorkDuration)}</p>
              <p className="text-xs text-gray-500">Since {formatTime(new Date(session.clockInTime))}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
