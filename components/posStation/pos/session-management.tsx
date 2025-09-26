"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useCloseSession, useOpenSession, useResumeSession, useSuspendSession } from "@/hooks/posStation/use-pos-session"
import { useLocationsByOrganization } from "@/hooks/posStation/use-pos-stations"
import { usePosStations } from "@/hooks/posStation/use-pos-terminals"
import { formatCurrency } from "@/lib/formatCurrency"
import { AlertTriangle, CheckCircle, MapPin, Monitor, Pause, Play, Square, Terminal } from "lucide-react"
import { useState } from "react"

interface SessionManagementProps {
  terminalId?: string
  locationId?: string
  organizationId: string
  userId: string
  currentSession?: any
  onSessionChange?: (session: any) => void
}

export function SessionManagement({
  terminalId: initialTerminalId,
  locationId: initialLocationId,
  organizationId,
  userId,
  currentSession,
  onSessionChange,
}: SessionManagementProps) {
  const [openingBalance, setopeningBalance] = useState("200.00")
  const [closingBalance, setclosingBalance] = useState("")
  const [notes, setNotes] = useState("")
  const [isOpenDialogOpen, setIsOpenDialogOpen] = useState(false)
  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false)

  const [selectedLocationId, setSelectedLocationId] = useState(initialLocationId || "")
  const [selectedTerminalId, setSelectedTerminalId] = useState(initialTerminalId || "")

  const { data: locations, isLoading: locationsLoading } = useLocationsByOrganization(organizationId)
  const { data: terminalsResponse, isLoading: terminalsLoading } = usePosStations(
    organizationId,
    selectedLocationId || undefined,
  )
  const terminals = terminalsResponse?.success ? terminalsResponse.data : []

  const openSessionMutation = useOpenSession()
  const closeSessionMutation = useCloseSession()
  const suspendSessionMutation = useSuspendSession()
  const resumeSessionMutation = useResumeSession()

  const handleOpenSession = async () => {
    if (!selectedTerminalId || !selectedLocationId) {
      return
    }

    const result = await openSessionMutation.mutateAsync({
      terminalId: selectedTerminalId,
      locationId: selectedLocationId,
      organizationId,
      userId,
      openingBalance: Number.parseFloat(openingBalance) || 200.0,
      notes: notes.trim() || undefined,
    })

    if (result.success) {
      setIsOpenDialogOpen(false)
      setNotes("")
      onSessionChange?.(result.data?.session)
    }
  }

  const handleLocationChange = (locationId: string) => {
    setSelectedLocationId(locationId)
    setSelectedTerminalId("") // Reset terminal selection
  }

  const handleCloseSession = async () => {
    if (!currentSession) return

    const result = await closeSessionMutation.mutateAsync({
      sessionId: currentSession.id,
      userId,
      closingBalance: Number.parseFloat(closingBalance) || 0,
      notes: notes.trim() || undefined,
    })

    if (result.success) {
      setIsCloseDialogOpen(false)
      setclosingBalance("")
      setNotes("")
      onSessionChange?.(null)
    }
  }

  const handleSuspendSession = () => {
    if (!currentSession) return
    suspendSessionMutation.mutate({
      sessionId: currentSession.id,
      userId,
      reason: "Manual suspension",
    })
  }

  const handleResumeSession = () => {
    if (!currentSession) return
    resumeSessionMutation.mutate({
      sessionId: currentSession.id,
      userId,
    })
  }

  const sessionDuration = currentSession
    ? (new Date().getTime() - new Date(currentSession.startTime).getTime()) / (1000 * 60 * 60)
    : 0

  return (
    <Card className="bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Terminal className="h-5 w-5" />
            Session Management
          </span>
          {currentSession && (
            <Badge
              variant={
                currentSession.status === "ACTIVE"
                  ? "default"
                  : currentSession.status === "SUSPENDED"
                    ? "secondary"
                    : "outline"
              }
              className="flex items-center gap-1"
            >
              {currentSession.status === "ACTIVE" && <CheckCircle className="h-3 w-3" />}
              {currentSession.status === "SUSPENDED" && <AlertTriangle className="h-3 w-3" />}
              {currentSession.status}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentSession ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
              <div>
                <Label className="text-xs text-gray-600">Session Number</Label>
                <p className="font-mono font-medium">{currentSession.sessionNumber}</p>
              </div>
              <div>
                <Label className="text-xs text-gray-600">Duration</Label>
                <p className="font-medium">{sessionDuration.toFixed(1)}h</p>
              </div>
              <div>
                <Label className="text-xs text-gray-600">Opening Cash</Label>
                <p className="font-medium">{formatCurrency(currentSession.openingBalance)}</p>
              </div>
              <div>
                <Label className="text-xs text-gray-600">Total Sales</Label>
                <p className="font-medium text-green-600">{formatCurrency(currentSession.totalSales)}</p>
              </div>
            </div>

            <div className="flex gap-2">
              {currentSession.status === "ACTIVE" && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSuspendSession}
                    disabled={suspendSessionMutation.isPending}
                    className="flex items-center gap-2 bg-transparent"
                  >
                    <Pause className="h-4 w-4" />
                    Suspend
                  </Button>
                  <Dialog open={isCloseDialogOpen} onOpenChange={setIsCloseDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="destructive" size="sm" className="flex items-center gap-2">
                        <Square className="h-4 w-4" />
                        Close Session
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Close POS Session</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="closingBalance">Closing Cash Amount</Label>
                          <Input
                            id="closingBalance"
                            type="number"
                            step="0.01"
                            value={closingBalance}
                            onChange={(e) => setclosingBalance(e.target.value)}
                            placeholder="0.00"
                          />
                        </div>
                        <div>
                          <Label htmlFor="closeNotes">Notes (Optional)</Label>
                          <Textarea
                            id="closeNotes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Any notes about the session..."
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setIsCloseDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button
                            onClick={handleCloseSession}
                            disabled={closeSessionMutation.isPending || !closingBalance}
                          >
                            Close Session
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </>
              )}

              {currentSession.status === "SUSPENDED" && (
                <Button
                  onClick={handleResumeSession}
                  disabled={resumeSessionMutation.isPending}
                  className="flex items-center gap-2"
                >
                  <Play className="h-4 w-4" />
                  Resume Session
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <Terminal className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 mb-4">No active session</p>
            <Dialog open={isOpenDialogOpen} onOpenChange={setIsOpenDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Play className="h-4 w-4" />
                  Start New Session
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Open New POS Session</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="location" className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Location
                    </Label>
                    <Select value={selectedLocationId} onValueChange={handleLocationChange}>
                      <SelectTrigger>
                        <SelectValue placeholder={locationsLoading ? "Loading locations..." : "Select a location"} />
                      </SelectTrigger>
                      <SelectContent>
                        {locations?.map((location) => (
                          <SelectItem key={location.id} value={location.id}>
                            {location.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="terminal" className="flex items-center gap-2">
                      <Monitor className="h-4 w-4" />
                      Terminal
                    </Label>
                    <Select
                      value={selectedTerminalId}
                      onValueChange={setSelectedTerminalId}
                      disabled={!selectedLocationId}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            !selectedLocationId
                              ? "Select a location first"
                              : terminalsLoading
                                ? "Loading terminals..."
                                : "Select a terminal"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {terminals?.map((terminal) => (
                          <SelectItem key={terminal.id} value={terminal.id}>
                            <div className="flex items-center justify-between w-full">
                              <span>{terminal.name}</span>
                              <Badge variant={terminal.isActive ? "default" : "secondary"} className="ml-2">
                                {terminal.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedLocationId && terminals?.length === 0 && !terminalsLoading && (
                      <p className="text-sm text-muted-foreground mt-1">No terminals available for this location</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="openingBalance">Opening Cash Amount</Label>
                    <Input
                      id="openingBalance"
                      type="number"
                      step="0.01"
                      value={openingBalance}
                      onChange={(e) => setopeningBalance(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="openNotes">Notes (Optional)</Label>
                    <Textarea
                      id="openNotes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Any notes about opening the session..."
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsOpenDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleOpenSession}
                      disabled={
                        openSessionMutation.isPending || !selectedLocationId || !selectedTerminalId || terminalsLoading
                      }
                    >
                      Open Session
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
