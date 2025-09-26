"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { POSSession } from "@/lib/cashSystem/db"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { AlertTriangle, CheckCircle, Clock, DollarSign, Lock, TrendingDown, TrendingUp, Unlock } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"
// import type { POSSession } from "@/types"

const openSessionSchema = z.object({
  openingBalance: z.number().min(0, "Opening balance must be 0 or greater"),
})

const closeSessionSchema = z.object({
  actualBalance: z.number().min(0, "Actual balance must be 0 or greater"),
  notes: z.string().optional(),
})

type OpenSessionForm = z.infer<typeof openSessionSchema>
type CloseSessionForm = z.infer<typeof closeSessionSchema>

interface SessionControlDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  action: "open" | "close"
  currentSession?: POSSession | null
  expectedBalance?: number
  onOpenSession: (openingBalance: number) => void
  onCloseSession: (actualBalance: number, notes?: string) => void
  isLoading: boolean
}

export function SessionControlDialog({
  open,
  onOpenChange,
  action,
  currentSession,
  expectedBalance = 0,
  onOpenSession,
  onCloseSession,
  isLoading,
}: SessionControlDialogProps) {
  const openForm = useForm<OpenSessionForm>({
    resolver: zodResolver(openSessionSchema),
    defaultValues: {
      openingBalance: 200, // Default starting amount
    },
  })

  const closeForm = useForm<CloseSessionForm>({
    resolver: zodResolver(closeSessionSchema),
    defaultValues: {
      actualBalance: expectedBalance,
      notes: "",
    },
  })

  const onOpenSubmit = (data: OpenSessionForm) => {
    onOpenSession(data.openingBalance)
  }

  const onCloseSubmit = (data: CloseSessionForm) => {
    onCloseSession(data.actualBalance, data.notes)
  }

  const handleClose = () => {
    openForm.reset()
    closeForm.reset({ actualBalance: expectedBalance, notes: "" })
    onOpenChange(false)
  }

  const actualBalance = closeForm.watch("actualBalance") || 0
  const variance = actualBalance - expectedBalance
  const hasVariance = Math.abs(variance) > 0.01
  const variancePercentage = expectedBalance > 0 ? (variance / expectedBalance) * 100 : 0
  const isLargeVariance = Math.abs(variance) > 10
  const isCriticalVariance = Math.abs(variance) > 50

  // Calculate session duration
  const sessionDuration = currentSession ? new Date().getTime() - currentSession.startTime.getTime() : 0

  const formatDuration = (milliseconds: number) => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60))
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m`
  }

  // Quick balance buttons for closing
  const quickBalances =
    expectedBalance > 0
      ? [
        expectedBalance - 20,
        expectedBalance - 10,
        expectedBalance - 5,
        expectedBalance,
        expectedBalance + 5,
        expectedBalance + 10,
        expectedBalance + 20,
      ].filter((amount) => amount >= 0)
      : [0, 50, 100, 150, 200]

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {action === "open" ? (
              <div className="p-2 rounded-full bg-green-100">
                <Unlock className="h-4 w-4 text-green-600" />
              </div>
            ) : (
              <div className="p-2 rounded-full bg-red-100">
                <Lock className="h-4 w-4 text-red-600" />
              </div>
            )}
            {action === "open" ? "Open POS Session" : "Close POS Session"}
          </DialogTitle>
          <DialogDescription>
            {action === "open"
              ? "Enter the opening cash balance to start a new POS session."
              : "Count the cash in the drawer and enter the actual balance to close the session."}
          </DialogDescription>
        </DialogHeader>

        {action === "open" ? (
          <Form {...openForm}>
            <form onSubmit={openForm.handleSubmit(onOpenSubmit)} className="space-y-6">
              <FormField
                control={openForm.control}
                name="openingBalance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">Opening Balance</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="200.00"
                          className="pl-9 text-lg"
                          {...field}
                          onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 0)}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Quick Amount Buttons */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Common starting amounts:</p>
                <div className="flex flex-wrap gap-2">
                  {[100, 150, 200, 250, 300, 500].map((amount) => (
                    <Button
                      key={amount}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => openForm.setValue("openingBalance", amount)}
                      className="h-8"
                    >
                      ${amount}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Opening Balance Info */}
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">Session Setup</span>
                  </div>
                  <div className="text-xs text-blue-700 space-y-1">
                    <p>• This amount will be recorded as your starting cash</p>
                    <p>• Make sure to count all bills and coins accurately</p>
                    <p>• This balance will be used for variance calculations</p>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={handleClose} className="flex-1 bg-transparent">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700" disabled={isLoading}>
                  {isLoading ? "Opening..." : "Open Session"}
                </Button>
              </div>
            </form>
          </Form>
        ) : (
          <div className="space-y-6">
            {/* Current Session Info */}
            {currentSession && (
              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Session Details</span>
                      <Badge variant="outline" className="bg-green-100 text-green-700">
                        Active
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Session:</span>
                        <div className="font-medium">{currentSession.sessionNumber}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Duration:</span>
                        <div className="font-medium flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDuration(sessionDuration)}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Started:</span>
                        <div className="font-medium">{format(currentSession.startTime, "MMM dd, HH:mm")}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Transactions:</span>
                        <div className="font-medium">{currentSession.transactionCount}</div>
                      </div>
                    </div>
                    <div className="pt-2 border-t">
                      <div className="flex justify-between text-sm">
                        <span>Opening Cash:</span>
                        <span className="font-medium">${currentSession.openingBalance.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Cash Sales:</span>
                        <span className="font-medium text-green-600">+${currentSession.cashTotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm font-medium border-t pt-1 mt-1">
                        <span>Expected Balance:</span>
                        <span>${expectedBalance.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Form {...closeForm}>
              <form onSubmit={closeForm.handleSubmit(onCloseSubmit)} className="space-y-6">
                <FormField
                  control={closeForm.control}
                  name="actualBalance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium">Actual Cash Count</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder={expectedBalance.toFixed(2)}
                            className="pl-9 text-lg"
                            {...field}
                            onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 0)}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Quick Balance Buttons */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Quick amounts:</p>
                  <div className="flex flex-wrap gap-2">
                    {quickBalances.slice(0, 7).map((amount) => (
                      <Button
                        key={amount}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => closeForm.setValue("actualBalance", amount)}
                        className={`h-8 ${amount === expectedBalance ? "border-green-500 bg-green-50" : ""}`}
                      >
                        ${amount.toFixed(0)}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Variance Display */}
                {hasVariance && (
                  <Card
                    className={`border-2 ${isCriticalVariance
                      ? "border-red-200 bg-red-50"
                      : isLargeVariance
                        ? "border-orange-200 bg-orange-50"
                        : "border-yellow-200 bg-yellow-50"
                      }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle
                          className={`h-4 w-4 ${isCriticalVariance
                            ? "text-red-600"
                            : isLargeVariance
                              ? "text-orange-600"
                              : "text-yellow-600"
                            }`}
                        />
                        <span
                          className={`font-medium ${isCriticalVariance
                            ? "text-red-700"
                            : isLargeVariance
                              ? "text-orange-700"
                              : "text-yellow-700"
                            }`}
                        >
                          {isCriticalVariance
                            ? "Critical Variance Detected"
                            : isLargeVariance
                              ? "Large Variance Detected"
                              : "Variance Detected"}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Expected:</span>
                          <span className="font-medium">${expectedBalance.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Actual:</span>
                          <span className="font-medium">${actualBalance.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center border-t pt-2">
                          <span className="font-medium">Variance:</span>
                          <div className="flex items-center gap-2">
                            {variance > 0 ? (
                              <TrendingUp className="h-4 w-4 text-green-600" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-red-600" />
                            )}
                            <span className={`font-bold ${variance > 0 ? "text-green-600" : "text-red-600"}`}>
                              {variance > 0 ? "+" : ""}${variance.toFixed(2)}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {variancePercentage > 0 ? "+" : ""}
                              {variancePercentage.toFixed(1)}%
                            </Badge>
                          </div>
                        </div>
                      </div>
                      {isCriticalVariance && (
                        <Alert className="mt-3 border-red-300 bg-red-100">
                          <AlertDescription className="text-red-800 text-xs">
                            This variance requires manager approval and investigation before closing.
                          </AlertDescription>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                )}

                <FormField
                  control={closeForm.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes {hasVariance && "(Required for variance)"}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={
                            hasVariance
                              ? "Please explain the reason for the variance..."
                              : "Any notes about the session or closing process..."
                          }
                          className="resize-none"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={handleClose} className="flex-1 bg-transparent">
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="destructive"
                    className="flex-1"
                    disabled={isLoading || (hasVariance && !closeForm.watch("notes")?.trim())}
                  >
                    {isLoading ? "Closing..." : "Close Session"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
