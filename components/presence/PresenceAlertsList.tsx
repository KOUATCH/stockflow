"use client";

import React, { useState } from 'react';
import { AlertTriangle, Clock, Coffee, MapPin, CheckCircle, X, Eye, EyeOff, Filter } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { usePresenceAlerts, useMarkAlertAsRead, useResolveAlert } from '@/hooks/usePresenceQueries';
import { AlertType, AlertSeverity, PresenceAlert } from '@/types/presence';
import { formatDistanceToNow } from 'date-fns';

interface PresenceAlertsListProps {
  userId?: string;
  organizationId: string;
  isManager?: boolean;
  className?: string;
}

export function PresenceAlertsList({
  userId,
  organizationId,
  isManager = false,
  className
}: PresenceAlertsListProps) {
  const [selectedSeverity, setSelectedSeverity] = useState<AlertSeverity | 'ALL'>('ALL');
  const [selectedType, setSelectedType] = useState<AlertType | 'ALL'>('ALL');
  const [showResolved, setShowResolved] = useState(false);
  const [resolveNotes, setResolveNotes] = useState('');
  const [selectedAlert, setSelectedAlert] = useState<PresenceAlert | null>(null);

  const { data: alerts, isLoading } = usePresenceAlerts({
    userId: isManager ? undefined : userId,
    organizationId,
    includeResolved: showResolved
  });

  const markAsReadMutation = useMarkAlertAsRead();
  const resolveAlertMutation = useResolveAlert();

  const filteredAlerts = alerts?.filter(alert => {
    if (selectedSeverity !== 'ALL' && alert.severity !== selectedSeverity) return false;
    if (selectedType !== 'ALL' && alert.alertType !== selectedType) return false;
    return true;
  }) || [];

  const unresolvedAlerts = filteredAlerts.filter(alert => !alert.isResolved);
  const resolvedAlerts = filteredAlerts.filter(alert => alert.isResolved);

  const handleMarkAsRead = async (alertId: string) => {
    try {
      await markAsReadMutation.mutateAsync(alertId);
    } catch (error) {
      console.error('Failed to mark alert as read:', error);
    }
  };

  const handleResolveAlert = async () => {
    if (!selectedAlert) return;

    try {
      await resolveAlertMutation.mutateAsync({
        alertId: selectedAlert.id,
        resolutionNotes: resolveNotes.trim() || undefined
      });
      setSelectedAlert(null);
      setResolveNotes('');
    } catch (error) {
      console.error('Failed to resolve alert:', error);
    }
  };

  const getAlertIcon = (type: AlertType) => {
    switch (type) {
      case 'LATE_ARRIVAL':
        return <Clock className="h-4 w-4" />;
      case 'EXTENDED_BREAK':
      case 'MISSED_CLOCK_OUT':
        return <Coffee className="h-4 w-4" />;
      case 'LOCATION_MISMATCH':
        return <MapPin className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getAlertColor = (severity: AlertSeverity) => {
    switch (severity) {
      case 'LOW':
        return 'text-gray-600 bg-gray-100 border-gray-200';
      case 'MEDIUM':
        return 'text-yellow-700 bg-yellow-100 border-yellow-200';
      case 'HIGH':
        return 'text-orange-700 bg-orange-100 border-orange-200';
      case 'CRITICAL':
        return 'text-red-700 bg-red-100 border-red-200';
      case 'URGENT':
        return 'text-red-800 bg-red-200 border-red-300';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const formatAlertType = (type: AlertType) => {
    return type.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Presence Alerts
          </CardTitle>
          <CardDescription>
            {isManager
              ? "Monitor and resolve team presence alerts"
              : "View your presence notifications and alerts"
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <Label className="text-sm">Filters:</Label>
            </div>

            <Select value={selectedSeverity} onValueChange={(value) => setSelectedSeverity(value as AlertSeverity | 'ALL')}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Severity</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="CRITICAL">Critical</SelectItem>
                <SelectItem value="URGENT">Urgent</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedType} onValueChange={(value) => setSelectedType(value as AlertType | 'ALL')}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Types</SelectItem>
                <SelectItem value="LATE_ARRIVAL">Late Arrival</SelectItem>
                <SelectItem value="EARLY_DEPARTURE">Early Departure</SelectItem>
                <SelectItem value="MISSED_CLOCK_OUT">Missed Clock Out</SelectItem>
                <SelectItem value="EXTENDED_BREAK">Extended Break</SelectItem>
                <SelectItem value="NO_SHOW">No Show</SelectItem>
                <SelectItem value="OVERTIME_ALERT">Overtime</SelectItem>
                <SelectItem value="LOCATION_MISMATCH">Location Mismatch</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowResolved(!showResolved)}
              className="ml-auto"
            >
              {showResolved ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
              {showResolved ? 'Hide Resolved' : 'Show Resolved'}
            </Button>
          </div>

          {/* Summary Stats */}
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full" />
              <span>{unresolvedAlerts.length} Unresolved</span>
            </div>
            {showResolved && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span>{resolvedAlerts.length} Resolved</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Alerts Tabs */}
      <Tabs defaultValue="unresolved" className="space-y-4">
        <TabsList>
          <TabsTrigger value="unresolved" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Unresolved ({unresolvedAlerts.length})
          </TabsTrigger>
          {showResolved && (
            <TabsTrigger value="resolved" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Resolved ({resolvedAlerts.length})
            </TabsTrigger>
          )}
        </TabsList>

        {/* Unresolved Alerts */}
        <TabsContent value="unresolved" className="space-y-3">
          {unresolvedAlerts.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">No unresolved alerts</p>
                <p className="text-sm text-gray-500 mt-1">All presence alerts have been addressed</p>
              </CardContent>
            </Card>
          ) : (
            unresolvedAlerts.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                onMarkAsRead={handleMarkAsRead}
                onResolve={isManager ? () => setSelectedAlert(alert) : undefined}
                getAlertIcon={getAlertIcon}
                getAlertColor={getAlertColor}
                formatAlertType={formatAlertType}
              />
            ))
          )}
        </TabsContent>

        {/* Resolved Alerts */}
        {showResolved && (
          <TabsContent value="resolved" className="space-y-3">
            {resolvedAlerts.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium">No resolved alerts</p>
                  <p className="text-sm text-gray-500 mt-1">No alerts have been resolved yet</p>
                </CardContent>
              </Card>
            ) : (
              resolvedAlerts.map((alert) => (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  onMarkAsRead={handleMarkAsRead}
                  getAlertIcon={getAlertIcon}
                  getAlertColor={getAlertColor}
                  formatAlertType={formatAlertType}
                  isResolved
                />
              ))
            )}
          </TabsContent>
        )}
      </Tabs>

      {/* Resolve Alert Dialog */}
      <Dialog open={!!selectedAlert} onOpenChange={() => setSelectedAlert(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve Alert</DialogTitle>
            <DialogDescription>
              Add resolution notes and mark this alert as resolved.
            </DialogDescription>
          </DialogHeader>

          {selectedAlert && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className={cn("p-2 rounded-lg", getAlertColor(selectedAlert.severity))}>
                    {getAlertIcon(selectedAlert.alertType)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{selectedAlert.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{selectedAlert.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>User: {selectedAlert.user.name}</span>
                      <span>Created: {formatDistanceToNow(new Date(selectedAlert.createdAt))} ago</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="resolution-notes">Resolution Notes</Label>
                <Textarea
                  id="resolution-notes"
                  placeholder="Describe how this alert was resolved..."
                  value={resolveNotes}
                  onChange={(e) => setResolveNotes(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelectedAlert(null)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleResolveAlert}
                  disabled={resolveAlertMutation.isPending}
                >
                  {resolveAlertMutation.isPending ? 'Resolving...' : 'Resolve Alert'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Alert Card Component
interface AlertCardProps {
  alert: PresenceAlert;
  onMarkAsRead: (alertId: string) => void;
  onResolve?: () => void;
  getAlertIcon: (type: AlertType) => React.ReactNode;
  getAlertColor: (severity: AlertSeverity) => string;
  formatAlertType: (type: AlertType) => string;
  isResolved?: boolean;
}

function AlertCard({
  alert,
  onMarkAsRead,
  onResolve,
  getAlertIcon,
  getAlertColor,
  formatAlertType,
  isResolved = false
}: AlertCardProps) {
  return (
    <Card className={cn(
      "border-l-4 transition-all duration-200",
      !alert.isRead && !isResolved && "bg-blue-50 border-l-blue-500",
      isResolved && "opacity-75"
    )}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className={cn("p-2 rounded-lg", getAlertColor(alert.severity))}>
              {getAlertIcon(alert.alertType)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-gray-900">{alert.title}</h4>
                <Badge variant="outline" className={getAlertColor(alert.severity)}>
                  {alert.severity}
                </Badge>
                <Badge variant="secondary">
                  {formatAlertType(alert.alertType)}
                </Badge>
                {!alert.isRead && !isResolved && (
                  <Badge className="bg-blue-100 text-blue-800">
                    New
                  </Badge>
                )}
              </div>

              <p className="text-sm text-gray-600 mb-2">{alert.description}</p>

              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>User: {alert.user.name}</span>
                <span>Created: {formatDistanceToNow(new Date(alert.createdAt))} ago</span>
                {isResolved && alert.resolvedAt && (
                  <span>Resolved: {formatDistanceToNow(new Date(alert.resolvedAt))} ago</span>
                )}
              </div>

              {isResolved && alert.resolutionNotes && (
                <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                  <p className="text-xs text-green-800">
                    <span className="font-medium">Resolution:</span> {alert.resolutionNotes}
                  </p>
                </div>
              )}
            </div>
          </div>

          {!isResolved && (
            <div className="flex flex-col gap-2">
              {!alert.isRead && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onMarkAsRead(alert.id)}
                >
                  Mark Read
                </Button>
              )}
              {onResolve && (
                <Button
                  size="sm"
                  onClick={onResolve}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Resolve
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}