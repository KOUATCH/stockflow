"use client";

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatDuration, formatTime } from '@/lib/dateUtils';
import { cn } from '@/lib/utils';
import { PRESENCE_STATUS_COLORS, PresenceSession, PresenceStatus } from '@/types/presence';
import { Clock, Coffee, MapPin, Timer, User } from 'lucide-react';

interface ActiveEmployeesListProps {
  sessions: PresenceSession[];
  showDetails?: boolean;
  className?: string;
  onEmployeeClick?: (session: PresenceSession) => void;
}

export function ActiveEmployeesList({
  sessions,
  showDetails = false,
  className,
  onEmployeeClick
}: ActiveEmployeesListProps) {
  if (!sessions || sessions.length === 0) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No active sessions</p>
            <p className="text-sm text-gray-400 mt-1">
              No employees are currently clocked in
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CLOCKED_IN':
        return <Clock className="h-4 w-4 text-green-600" />;
      case 'ON_BREAK':
        return <Coffee className="h-4 w-4 text-yellow-600" />;
      case 'OVERTIME':
        return <Timer className="h-4 w-4 text-blue-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getWorkDuration = (session: PresenceSession) => {
    const clockInTime = new Date(session.clockInTime).getTime();
    const now = new Date().getTime();
    const totalMinutes = Math.floor((now - clockInTime) / 60000);
    return totalMinutes - session.totalBreakMinutes;
  };

  const sortedSessions = [...sessions].sort((a, b) => {
    // Sort by status priority, then by clock in time
    const statusPriority = { 'OVERTIME': 0, 'ON_BREAK': 1, 'CLOCKED_IN': 2 };
    const aPriority = statusPriority[a.status as keyof typeof statusPriority] ?? 3;
    const bPriority = statusPriority[b.status as keyof typeof statusPriority] ?? 3;

    if (aPriority !== bPriority) {
      return aPriority - bPriority;
    }

    return new Date(a.clockInTime).getTime() - new Date(b.clockInTime).getTime();
  });

  return (
    <div className={cn("space-y-3", className)}>
      {sortedSessions.map((session, index) => (
        <Card
          key={session.id}
          className={cn(
            "border transition-all duration-200",
            onEmployeeClick && "cursor-pointer hover:shadow-md hover:border-blue-300",
            session.status === 'OVERTIME' && "border-blue-200 bg-blue-50",
            session.status === 'ON_BREAK' && "border-yellow-200 bg-yellow-50"
          )}
          onClick={() => onEmployeeClick?.(session)}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1">
                {/* Avatar */}
                <Avatar className="h-10 w-10">
                  <AvatarImage src={session.user.image || undefined} />
                  <AvatarFallback className="bg-blue-100 text-blue-600">
                    {session.user.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>

                {/* Employee Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <p className="font-medium text-gray-900 truncate">
                      {session.user.name || 'Unknown User'}
                    </p>
                    <Badge className={PRESENCE_STATUS_COLORS[session.status as PresenceStatus]}>
                      {session.status.replace('_', ' ')}
                    </Badge>
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    {/* Clock In Time */}
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(session.status)}
                      <span>{formatTime(new Date(session.clockInTime))}</span>
                    </div>

                    {/* Location */}
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-3 w-3 text-gray-400" />
                      <span className="truncate">{session.location.name}</span>
                    </div>

                    {/* Work Duration */}
                    <div className="flex items-center space-x-1">
                      <Timer className="h-3 w-3 text-gray-400" />
                      <span>{formatDuration(getWorkDuration(session))}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Indicator */}
              <div className="flex flex-col items-end space-y-1">
                <div className={cn(
                  "w-3 h-3 rounded-full",
                  session.status === 'CLOCKED_IN' && "bg-green-500",
                  session.status === 'ON_BREAK' && "bg-yellow-500 animate-pulse",
                  session.status === 'OVERTIME' && "bg-blue-500 animate-pulse"
                )} />
                {session.status === 'OVERTIME' && (
                  <span className="text-xs text-blue-600 font-medium">OT</span>
                )}
              </div>
            </div>

            {/* Extended Details */}
            {showDetails && (
              <>
                <Separator className="my-3" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div>
                    <p className="text-gray-500 font-medium">Total Work</p>
                    <p className="text-gray-900">{formatDuration(getWorkDuration(session))}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 font-medium">Break Time</p>
                    <p className="text-gray-900">{formatDuration(session.totalBreakMinutes)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 font-medium">Expected End</p>
                    <p className="text-gray-900">
                      {session.expectedClockOutTime
                        ? formatTime(new Date(session.expectedClockOutTime))
                        : 'Not set'
                      }
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 font-medium">Terminal</p>
                    <p className="text-gray-900 truncate">
                      {session.terminal?.name || 'Web Browser'}
                    </p>
                  </div>
                </div>

                {/* Current Break Info */}
                {session.status === 'ON_BREAK' && session.currentBreak && (
                  <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <Coffee className="h-4 w-4 text-yellow-600" />
                        <span className="font-medium text-yellow-800">
                          {session.currentBreak.breakType.replace('_', ' ')} Break
                        </span>
                      </div>
                      <span className="text-yellow-700">
                        {formatDuration(
                          Math.floor(
                            (new Date().getTime() - new Date(session.currentBreak.startTime).getTime()) / 60000
                          )
                        )}
                      </span>
                    </div>
                    {session.currentBreak.reason && (
                      <p className="text-xs text-yellow-700 mt-1 ml-6">
                        {session.currentBreak.reason}
                      </p>
                    )}
                  </div>
                )}

                {/* Overtime Warning */}
                {session.status === 'OVERTIME' && (
                  <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center space-x-2 text-sm">
                      <Timer className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-blue-800">
                        Overtime: {formatDuration(session.overtimeMinutes)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Notes */}
                {session.notes && (
                  <div className="mt-3 p-2 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="text-xs text-gray-600">{session.notes}</p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}