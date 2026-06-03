"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useSessionManagement } from "@/hooks/newPOSSession/useSessionManagement"
import { formatCurrency } from "@/lib/formatCurrency"
import { AlertTriangle, CheckCircle, Clock, DollarSign, Play, Square } from "lucide-react"
import { useState } from "react"

interface SessionControlButtonsProps {
  terminalId: string
  locationId: string
  organizationId: string
  userId: string
}

export function SessionControlButtons1({ terminalId, locationId, organizationId, userId }: SessionControlButtonsProps) {
  const [openingBalance, setopeningBalance] = useState("200.00")
  const [closingBalance, setclosingBalance] = useState("")
  const [isOpenDialogOpen, setIsOpenDialogOpen] = useState(false)
  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false)

  const { currentSession, sessionLoading, openSession, closeSession, isOpeningSession, isClosingSession } =
    useSessionManagement(terminalId)

  const handleOpenSession = () => {
    console.log("[v0] Opening session with data:", {
      terminalId,
      userId,
      locationId,
      organizationId,
      openingBalance: Number.parseFloat(openingBalance) || 200.0,
    })

    openSession({
      terminalId,
      userId,
      locationId,
      organizationId,
      openingBalance: Number.parseFloat(openingBalance) || 200.0,
    })
    setIsOpenDialogOpen(false)
  }

  const handleCloseSession = () => {
    if (currentSession) {
      console.log("[v0] Closing session:", currentSession.id)

      closeSession({
        sessionId: currentSession.id,
        terminalId,
        closingBalance: Number.parseFloat(closingBalance) || 0,
        userId,
      })
      setIsCloseDialogOpen(false)
    }
  }

  const isSessionActive = currentSession?.status === "ACTIVE"

  return (
    <div className="flex items-center gap-3">
      {/* Session Status Badge */}
      <Badge
        variant={isSessionActive ? "default" : "secondary"}
        className={`flex items-center gap-2 px-3 py-1 ${isSessionActive ? "bg-green-100 text-green-800 border-green-200" : "bg-gray-100 text-gray-600 border-gray-200"
          }`}
      >
        {isSessionActive ? (
          <>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            Session Active
          </>
        ) : (
          <>
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            No Active Session
          </>
        )}
      </Badge>

      {/* Session Info */}
      {isSessionActive && currentSession && (
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{new Date(currentSession.startTime).toLocaleTimeString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <DollarSign className="w-4 h-4" />
            <span>{formatCurrency(currentSession.openingBalance)}</span>
          </div>
        </div>
      )}

      {/* Open Session Button */}
      {!isSessionActive && (
        <Dialog open={isOpenDialogOpen} onOpenChange={setIsOpenDialogOpen}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              disabled={!terminalId || sessionLoading}
            >
              <Play className="w-4 h-4" />
              Open Session
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Play className="w-5 h-5 text-green-600" />
                Open POS Session
              </DialogTitle>
              <DialogDescription>
                Start a new POS session for this terminal. Enter the opening cash amount.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="opening-cash">Opening Cash Amount</Label>
                <Input
                  id="opening-cash"
                  type="number"
                  step="0.01"
                  value={openingBalance}
                  onChange={(e) => setopeningBalance(e.target.value)}
                  placeholder="200.00"
                  className="text-right"
                />
              </div>
              <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <CheckCircle className="w-5 h-5 text-blue-600" />
                <div className="text-sm">
                  <p className="font-medium text-blue-800">Ready to start session</p>
                  <p className="text-blue-600">Cash drawer will be opened automatically</p>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsOpenDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleOpenSession}
                  disabled={isOpeningSession}
                  className="bg-gradient-to-r from-green-600 to-emerald-600"
                >
                  {isOpeningSession ? "Opening..." : "Open Session"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Close Session Button */}
      {isSessionActive && (
        <Dialog open={isCloseDialogOpen} onOpenChange={setIsCloseDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 border-red-200 text-red-700 hover:bg-red-50 bg-transparent"
              disabled={sessionLoading}
            >
              <Square className="w-4 h-4" />
              Close Session
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Square className="w-5 h-5 text-red-600" />
                Close POS Session
              </DialogTitle>
              <DialogDescription>
                End the current POS session. Enter the closing cash amount for reconciliation.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="closing-cash">Closing Cash Amount</Label>
                <Input
                  id="closing-cash"
                  type="number"
                  step="0.01"
                  value={closingBalance}
                  onChange={(e) => setclosingBalance(e.target.value)}
                  placeholder="0.00"
                  className="text-right"
                />
              </div>
              {currentSession && (
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                    <p className="font-medium text-amber-800">Session Summary</p>
                  </div>
                  <div className="text-sm text-amber-700 space-y-1">
                    <p>Opening Cash: {formatCurrency(currentSession.openingBalance)}</p>
                    <p>Total Sales: {formatCurrency(currentSession.totalSales)}</p>
                    <p>Transactions: {currentSession.transactionCount}</p>
                  </div>
                </div>
              )}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCloseDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCloseSession} disabled={isClosingSession} variant="destructive">
                  {isClosingSession ? "Closing..." : "Close Session"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
