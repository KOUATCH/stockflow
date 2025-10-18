"use client";

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useOrgLocationsNew } from '@/hooks/useAllLocationsQueries';
import { useClockIn, useClockOut, useEndBreak, useStartBreak } from '@/hooks/usePresenceQueries';
import { BREAK_TYPE_LABELS, BreakType, CLOCK_METHODS, ClockMethod, PresenceStatusResponse } from '@/types/presence';
import { AlertCircle, Calendar, Clock, Coffee, LogOut, MapPin, Monitor } from 'lucide-react';
import { useState } from 'react';

interface ClockInOutPanelProps {
  currentStatus: PresenceStatusResponse | undefined;
  organizationId: string;
}

export function ClockInOutPanel({ currentStatus, organizationId }: ClockInOutPanelProps) {
  const [selectedLocationId, setSelectedLocationId] = useState<string>('');
  const [selectedMethod, setSelectedMethod] = useState<ClockMethod>('WEB_BROWSER');
  const [notes, setNotes] = useState('');
  const [breakType, setBreakType] = useState<BreakType>('REGULAR');
  const [breakDuration, setBreakDuration] = useState<number>(15);
  const [breakReason, setBreakReason] = useState('');

  const { data: locationsResponse } = useOrgLocationsNew(organizationId, { enabled: !!organizationId });
  const locations = locationsResponse?.data || [];
  const clockInMutation = useClockIn();
  const clockOutMutation = useClockOut();
  const startBreakMutation = useStartBreak();
  const endBreakMutation = useEndBreak();

  const isWorking = currentStatus?.status && ['CLOCKED_IN', 'ON_BREAK', 'OVERTIME'].includes(currentStatus.status);
  const isOnBreak = currentStatus?.status === 'ON_BREAK';
  const loading = clockInMutation.isPending || clockOutMutation.isPending || startBreakMutation.isPending || endBreakMutation.isPending;

  const handleClockIn = async () => {
    if (!selectedLocationId) {
      alert('Please select a location');
      return;
    }

    try {
      // Get geolocation if available
      let geolocation;
      if (navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
          });
          geolocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          };
        } catch (error) {
          console.log('Geolocation not available:', error);
        }
      }

      await clockInMutation.mutateAsync({
        locationId: selectedLocationId,
        method: selectedMethod,
        notes: notes.trim() || undefined,
        geolocation,
        deviceInfo: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          language: navigator.language
        }
      });

      setNotes('');
    } catch (error) {
      console.error('Clock in failed:', error);
    }
  };

  const handleClockOut = async () => {
    try {
      await clockOutMutation.mutateAsync({
        method: selectedMethod,
        notes: notes.trim() || undefined
      });
      setNotes('');
    } catch (error) {
      console.error('Clock out failed:', error);
    }
  };

  const handleStartBreak = async () => {
    try {
      await startBreakMutation.mutateAsync({
        breakType,
        expectedDuration: breakDuration,
        reason: breakReason.trim() || undefined,
        notes: notes.trim() || undefined
      });
      setNotes('');
      setBreakReason('');
    } catch (error) {
      console.error('Start break failed:', error);
    }
  };

  const handleEndBreak = async () => {
    try {
      await endBreakMutation.mutateAsync();
    } catch (error) {
      console.error('End break failed:', error);
    }
  };

  const getCurrentTime = () => {
    return new Date().toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Current Time Display */}
      <Card className="bg-gradient-to-r from-teal-50 to-emerald-50 border-teal-200">
        <CardContent className="p-6 text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Current Time</span>
          </div>
          <p className="text-2xl font-bold text-blue-900">{getCurrentTime()}</p>
        </CardContent>
      </Card>

      {/* Main Clock In/Out Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-6 w-6" />
            <span>Time Clock</span>
          </CardTitle>
          <CardDescription>
            {isWorking
              ? "Manage your current work session"
              : "Start your work session by clocking in"
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Status */}
          {currentStatus && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Current Status</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge className={`${currentStatus.status === 'CLOCKED_IN' ? 'bg-green-100 text-green-800' :
                      currentStatus.status === 'ON_BREAK' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'}`}>
                      {currentStatus.status.replace('_', ' ')}
                    </Badge>
                    {currentStatus.session && (
                      <span className="text-sm text-gray-600">
                        at {currentStatus.session.location.name}
                      </span>
                    )}
                  </div>
                </div>
                {currentStatus.session && (
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Started at</p>
                    <p className="font-medium">
                      {new Date(currentStatus.session.clockInTime).toLocaleTimeString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Clock In Form */}
          {!isWorking && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Location Selection */}
                <div className="space-y-2">
                  <Label htmlFor="location" className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>Location</span>
                  </Label>
                  <Select value={selectedLocationId} onValueChange={setSelectedLocationId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations?.map((location) => (
                        <SelectItem key={location.id} value={location.id}>
                          {location.name} ({location.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Clock Method */}
                <div className="space-y-2">
                  <Label htmlFor="method" className="flex items-center space-x-1">
                    <Monitor className="h-4 w-4" />
                    <span>Method</span>
                  </Label>
                  <Select value={selectedMethod} onValueChange={(value) => setSelectedMethod(value as ClockMethod)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(CLOCK_METHODS).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any notes for your clock in..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                />
              </div>

              <Button
                onClick={handleClockIn}
                disabled={!selectedLocationId || loading}
                className="w-full bg-green-600 hover:bg-green-700"
                size="lg"
              >
                {loading ? 'Clocking In...' : 'Clock In'}
              </Button>
            </div>
          )}

          {/* Break Management */}
          {isWorking && !isOnBreak && (
            <div className="space-y-4 border-t pt-4">
              <h4 className="font-medium flex items-center space-x-2">
                <Coffee className="h-5 w-5" />
                <span>Take a Break</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Break Type</Label>
                  <Select value={breakType} onValueChange={(value) => setBreakType(value as BreakType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(BREAK_TYPE_LABELS).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Expected Duration (minutes)</Label>
                  <Select value={breakDuration.toString()} onValueChange={(value) => setBreakDuration(parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Reason (Optional)</Label>
                <Textarea
                  placeholder="Reason for break..."
                  value={breakReason}
                  onChange={(e) => setBreakReason(e.target.value)}
                  rows={2}
                />
              </div>

              <div className="flex space-x-3">
                <Button
                  onClick={handleStartBreak}
                  disabled={loading}
                  variant="outline"
                  className="flex-1 border-yellow-600 text-yellow-600 hover:bg-yellow-50"
                >
                  {loading ? 'Starting Break...' : 'Start Break'}
                </Button>
              </div>
            </div>
          )}

          {/* End Break */}
          {isOnBreak && (
            <div className="space-y-4 border-t pt-4">
              <Alert>
                <Coffee className="h-4 w-4" />
                <AlertDescription>
                  You are currently on a break. Click "End Break" to resume work.
                </AlertDescription>
              </Alert>

              <Button
                onClick={handleEndBreak}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700"
                size="lg"
              >
                {loading ? 'Ending Break...' : 'End Break'}
              </Button>
            </div>
          )}

          {/* Clock Out */}
          {isWorking && (
            <div className="space-y-4 border-t pt-4">
              <h4 className="font-medium flex items-center space-x-2">
                <LogOut className="h-5 w-5" />
                <span>End Work Session</span>
              </h4>

              <div className="space-y-2">
                <Label>End of Day Notes (Optional)</Label>
                <Textarea
                  placeholder="Add any notes about your work session..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                />
              </div>

              <Button
                onClick={handleClockOut}
                disabled={loading}
                variant="outline"
                className="w-full border-red-600 text-red-600 hover:bg-red-50"
                size="lg"
              >
                {loading ? 'Clocking Out...' : 'Clock Out'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Help and Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tips & Guidelines</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">Accurate Time Tracking</p>
              <p className="text-sm text-gray-600">
                Always clock in when you start work and clock out when you finish to ensure accurate time tracking.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <Coffee className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">Break Management</p>
              <p className="text-sm text-gray-600">
                Use the break feature for lunch, personal time, or meetings to maintain accurate work time records.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <MapPin className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">Location Tracking</p>
              <p className="text-sm text-gray-600">
                Select the correct location where you're working to help with scheduling and resource management.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}