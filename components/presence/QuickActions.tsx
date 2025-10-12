"use client";

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useOrgLocationsNew } from '@/hooks/useAllLocationsQueries';
import { useClockIn, useClockOut, useEndBreak, useStartBreak } from '@/hooks/usePresenceQueries';
import { cn } from '@/lib/utils';
import { PresenceStatusResponse } from '@/types/presence';
import { AlertTriangle, Calendar, Clock, Coffee, FileText, LogOut, MapPin, Timer } from 'lucide-react';

interface QuickActionsProps {
  currentStatus: PresenceStatusResponse | undefined;
  organizationId: string;
  className?: string;
}

export function QuickActions({ currentStatus, organizationId, className }: QuickActionsProps) {
  const { data: locationsResponse } = useOrgLocationsNew(organizationId, { enabled: !!organizationId });
  const locations = locationsResponse?.data || [];
  const clockInMutation = useClockIn();
  const clockOutMutation = useClockOut();
  const startBreakMutation = useStartBreak();
  const endBreakMutation = useEndBreak();

  const isWorking = currentStatus?.status && ['CLOCKED_IN', 'ON_BREAK', 'OVERTIME'].includes(currentStatus.status);
  const isOnBreak = currentStatus?.status === 'ON_BREAK';
  const loading = clockInMutation.isPending || clockOutMutation.isPending || startBreakMutation.isPending || endBreakMutation.isPending;

  const handleQuickClockIn = async () => {
    if (!locations?.length) return;

    try {
      // Use the first available location for quick clock in
      const defaultLocation = locations[0];

      await clockInMutation.mutateAsync({
        locationId: defaultLocation.id,
        method: 'WEB_BROWSER',
        notes: 'Quick clock in'
      });
    } catch (error) {
      console.error('Quick clock in failed:', error);
    }
  };

  const handleQuickClockOut = async () => {
    try {
      await clockOutMutation.mutateAsync({
        method: 'WEB_BROWSER',
        notes: 'Quick clock out'
      });
    } catch (error) {
      console.error('Quick clock out failed:', error);
    }
  };

  const handleQuickBreak = async () => {
    try {
      await startBreakMutation.mutateAsync({
        breakType: 'REGULAR',
        expectedDuration: 15,
        reason: 'Quick break'
      });
    } catch (error) {
      console.error('Quick break failed:', error);
    }
  };

  const handleEndBreak = async () => {
    try {
      await endBreakMutation.mutateAsync();
    } catch (error) {
      console.error('End break failed:', error);
    }
  };

  const quickActions = [
    // Clock In/Out Actions
    ...(!isWorking ? [{
      id: 'clock-in',
      label: 'Quick Clock In',
      description: 'Clock in to your default location',
      icon: Clock,
      color: 'bg-green-500 hover:bg-green-600',
      textColor: 'text-white',
      action: handleQuickClockIn,
      disabled: loading || !locations?.length,
      primary: true
    }] : []),

    ...(isWorking && !isOnBreak ? [{
      id: 'start-break',
      label: 'Quick Break',
      description: '15-minute break',
      icon: Coffee,
      color: 'bg-yellow-500 hover:bg-yellow-600',
      textColor: 'text-white',
      action: handleQuickBreak,
      disabled: loading
    }] : []),

    ...(isOnBreak ? [{
      id: 'end-break',
      label: 'End Break',
      description: 'Resume work',
      icon: Timer,
      color: 'bg-green-500 hover:bg-green-600',
      textColor: 'text-white',
      action: handleEndBreak,
      disabled: loading,
      primary: true
    }] : []),

    ...(isWorking ? [{
      id: 'clock-out',
      label: 'Clock Out',
      description: 'End your work session',
      icon: LogOut,
      color: 'bg-red-500 hover:bg-red-600',
      textColor: 'text-white',
      action: handleQuickClockOut,
      disabled: loading
    }] : []),

    // Navigation Actions
    {
      id: 'view-reports',
      label: 'My Reports',
      description: 'View attendance reports',
      icon: FileText,
      color: 'bg-blue-500 hover:bg-blue-600',
      textColor: 'text-white',
      action: () => window.location.href = '/dashboard/presence/reports',
      disabled: false
    },
    {
      id: 'view-schedule',
      label: 'My Schedule',
      description: 'View work schedule',
      icon: Calendar,
      color: 'bg-purple-500 hover:bg-purple-600',
      textColor: 'text-white',
      action: () => window.location.href = '/dashboard/presence/schedule',
      disabled: false
    },
    {
      id: 'view-alerts',
      label: 'My Alerts',
      description: 'Check presence alerts',
      icon: AlertTriangle,
      color: 'bg-orange-500 hover:bg-orange-600',
      textColor: 'text-white',
      action: () => window.location.href = '/dashboard/presence/alerts',
      disabled: false
    }
  ];

  return (
    <div className={cn("space-y-4", className)}>
      {/* Primary Actions */}
      <div className="space-y-3">
        {quickActions.filter(action => action.primary).map((action) => (
          <Button
            key={action.id}
            onClick={action.action}
            disabled={action.disabled}
            className={cn("w-full h-auto p-4 flex items-center justify-start gap-3", action.color, action.textColor)}
            size="lg"
          >
            <action.icon className="h-6 w-6" />
            <div className="text-left">
              <p className="font-medium">{action.label}</p>
              <p className="text-sm opacity-90">{action.description}</p>
            </div>
          </Button>
        ))}
      </div>

      {/* Secondary Actions */}
      <div className="grid grid-cols-2 gap-3">
        {quickActions.filter(action => !action.primary).map((action) => (
          <Card
            key={action.id}
            className={cn(
              "cursor-pointer transition-all duration-200 hover:shadow-md",
              action.disabled && "opacity-50 cursor-not-allowed"
            )}
            onClick={action.disabled ? undefined : action.action}
          >
            <CardContent className="p-4">
              <div className="flex flex-col items-center text-center space-y-2">
                <div className={cn("p-3 rounded-full", action.color)}>
                  <action.icon className={cn("h-5 w-5", action.textColor)} />
                </div>
                <div>
                  <p className="font-medium text-sm">{action.label}</p>
                  <p className="text-xs text-gray-600">{action.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Status Information */}
      {currentStatus && (
        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-3 h-3 rounded-full",
                    currentStatus.status === 'CLOCKED_IN' && "bg-green-500",
                    currentStatus.status === 'ON_BREAK' && "bg-yellow-500 animate-pulse",
                    currentStatus.status === 'CLOCKED_OUT' && "bg-gray-500",
                    currentStatus.status === 'OVERTIME' && "bg-blue-500 animate-pulse"
                  )} />
                  <span className="text-sm font-medium text-gray-700">
                    Current Status
                  </span>
                </div>
                <Badge variant="outline">
                  {currentStatus.status.replace('_', ' ')}
                </Badge>
              </div>

              {currentStatus.session && (
                <div className="text-right">
                  <p className="text-sm text-gray-600">
                    Since {new Date(currentStatus.session.clockInTime).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                  {currentStatus.session.location && (
                    <div className="flex items-center gap-1 text-xs text-gray-500 justify-end">
                      <MapPin className="h-3 w-3" />
                      <span>{currentStatus.session.location.name}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tips */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-900 mb-1">Quick Tips</p>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• Use quick actions for faster clock operations</li>
                <li>• Check your schedule regularly for updates</li>
                <li>• Review alerts to stay compliant</li>
                <li>• Clock out before leaving work</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}