"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import {
  addCashToDrawer,
  closeCashDrawer,
  getCashDrawersByLocation,
  openCashDrawer,
  removeCashFromDrawer,
} from "@/actions/cash-drawer/cashDrawerActions"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { format } from "date-fns"
import {
  BarChart3,
  Calendar,
  Clock,
  DollarSign,
  Lock,
  MapPin,
  Minus,
  Plus,
  Receipt,
  TrendingDown,
  TrendingUp,
  Unlock,
} from "lucide-react"
import { useState } from "react"

type DecimalLike = { toNumber?: () => number; toString: () => string } | number | string | null | undefined

function toNumber(value: DecimalLike) {
  if (value == null) return 0
  if (typeof value === "number") return value
  if (typeof value === "string") return Number(value) || 0
  if (typeof value.toNumber === "function") return value.toNumber()
  return Number(value.toString()) || 0
}

interface CashDrawerDashboardProps {
  locationId: string
  userId: string
  sessionId?: string
}

export function CashDrawerDashboard({ locationId, userId, sessionId }: CashDrawerDashboardProps) {
  const queryClient = useQueryClient()
  const [selectedDrawerId, setSelectedDrawerId] = useState<string>("")
  const [isOpenDialogOpen, setIsOpenDialogOpen] = useState(false)
  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false)
  const [isCashInDialogOpen, setIsCashInDialogOpen] = useState(false)
  const [isCashOutDialogOpen, setIsCashOutDialogOpen] = useState(false)
  const [openingBalance, setOpeningBalance] = useState("")
  const [closingBalance, setClosingBalance] = useState("")
  const [cashAmount, setCashAmount] = useState("")
  const [reason, setReason] = useState("")
  const [notes, setNotes] = useState("")

  // Hooks
  const drawersQueryKey = ["cashDrawersByLocation", locationId] as const
  const { data: drawersResult } = useQuery({
    queryKey: drawersQueryKey,
    queryFn: () => getCashDrawersByLocation(locationId),
    enabled: !!locationId,
  })
  const invalidateDrawers = () => queryClient.invalidateQueries({ queryKey: drawersQueryKey })
  const openDrawerMutation = useMutation({ mutationFn: openCashDrawer, onSuccess: invalidateDrawers })
  const closeDrawerMutation = useMutation({ mutationFn: closeCashDrawer, onSuccess: invalidateDrawers })
  const addCashMutation = useMutation({ mutationFn: addCashToDrawer, onSuccess: invalidateDrawers })
  const removeCashMutation = useMutation({ mutationFn: removeCashFromDrawer, onSuccess: invalidateDrawers })

  const drawers = drawersResult?.success && Array.isArray(drawersResult.data)
    ? drawersResult.data.map((drawer) => ({
      ...drawer,
      currentBalance: toNumber(drawer.currentBalance),
      events: drawer.transactions?.map((event) => ({
        ...event,
        amount: toNumber(event.amount),
      })) ?? [],
    }))
    : []

  const handleOpenDrawer = async () => {
    if (!selectedDrawerId || !openingBalance) return

    await openDrawerMutation.mutateAsync({
      cashDrawerId: selectedDrawerId,
      userId,
      sessionId,
      openingBalance: Number.parseFloat(openingBalance),
      notes: notes || undefined,
    })

    setIsOpenDialogOpen(false)
    setOpeningBalance("")
    setNotes("")
  }

  const handleCloseDrawer = async () => {
    if (!selectedDrawerId || !closingBalance) return

    await closeDrawerMutation.mutateAsync({
      cashDrawerId: selectedDrawerId,
      userId,
      sessionId,
      closingBalance: Number.parseFloat(closingBalance),
      notes: notes || undefined,
    })

    setIsCloseDialogOpen(false)
    setClosingBalance("")
    setNotes("")
  }

  const handleAddCash = async () => {
    if (!selectedDrawerId || !cashAmount) return

    await addCashMutation.mutateAsync({
      cashDrawerId: selectedDrawerId,
      type: "CASH_IN",
      amount: Number.parseFloat(cashAmount),
      reason: reason || "Cash added to drawer",
      notes: notes || undefined,
      userId,
      sessionId,
    })

    setIsCashInDialogOpen(false)
    setCashAmount("")
    setReason("")
    setNotes("")
  }

  const handleRemoveCash = async () => {
    if (!selectedDrawerId || !cashAmount) return

    await removeCashMutation.mutateAsync({
      cashDrawerId: selectedDrawerId,
      type: "CASH_OUT",
      amount: Number.parseFloat(cashAmount),
      reason: reason || "Cash removed from drawer",
      notes: notes || undefined,
      userId,
      sessionId,
    })

    setIsCashOutDialogOpen(false)
    setCashAmount("")
    setReason("")
    setNotes("")
  }

  const getTotalBalance = () => {
    if (!drawers || drawers.length === 0) return 0
    return drawers.reduce((total, drawer) => total + drawer.currentBalance, 0)
  }

  const getOpenDrawersCount = () => {
    if (!drawers || drawers.length === 0) return 0
    return drawers.filter((drawer) => drawer.isOpen).length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary text-primary-foreground">
              <DollarSign className="h-6 w-6" />
            </div>
            Cash Drawer Management
          </h1>
          <p className="text-muted-foreground">Monitor and manage cash drawer operations</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            Location {locationId}
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {format(new Date(), "MMM dd, yyyy")}
          </Badge>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Total Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">${getTotalBalance().toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Across all drawers</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Open Drawers</CardTitle>
            <Unlock className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{getOpenDrawersCount()}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Total Drawers</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{drawers.length}</div>
            <p className="text-xs text-muted-foreground">In this location</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Today's Activity</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {drawers && drawers.length > 0
                ? drawers.reduce((total, drawer) => total + (drawer.events?.length || 0), 0)
                : 0}
            </div>
            <p className="text-xs text-muted-foreground">Total events</p>
          </CardContent>
        </Card>
      </div>

      {/* Cash Drawers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {drawers &&
          drawers.length > 0 &&
          drawers.map((drawer) => (
            <Card key={drawer.id} className="bg-card border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-card-foreground">{drawer.name}</CardTitle>
                  <Badge
                    variant={drawer.isOpen ? "default" : "secondary"}
                    className={drawer.isOpen ? "bg-accent text-accent-foreground" : ""}
                  >
                    {drawer.isOpen ? (
                      <>
                        <Unlock className="h-3 w-3 mr-1" />
                        Open
                      </>
                    ) : (
                      <>
                        <Lock className="h-3 w-3 mr-1" />
                        Closed
                      </>
                    )}
                  </Badge>
                </div>
                <CardDescription>Current Balance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-3xl font-bold text-primary">${drawer.currentBalance.toFixed(2)}</div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  {!drawer.isOpen ? (
                    <Dialog open={isOpenDialogOpen} onOpenChange={setIsOpenDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          className="bg-accent text-accent-foreground hover:bg-accent/90"
                          onClick={() => setSelectedDrawerId(drawer.id)}
                        >
                          <Unlock className="h-4 w-4 mr-1" />
                          Open
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Open Cash Drawer</DialogTitle>
                          <DialogDescription>Enter the opening balance for {drawer.name}</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="openingBalance">Opening Balance</Label>
                            <Input
                              id="openingBalance"
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              value={openingBalance}
                              onChange={(e) => setOpeningBalance(e.target.value)}
                            />
                          </div>
                          <div>
                            <Label htmlFor="notes">Notes (Optional)</Label>
                            <Textarea
                              id="notes"
                              placeholder="Add any notes..."
                              value={notes}
                              onChange={(e) => setNotes(e.target.value)}
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setIsOpenDialogOpen(false)} className="flex-1">
                              Cancel
                            </Button>
                            <Button
                              onClick={handleOpenDrawer}
                              disabled={!openingBalance || openDrawerMutation.isPending}
                              className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90"
                            >
                              {openDrawerMutation.isPending ? "Opening..." : "Open Drawer"}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  ) : (
                    <Dialog open={isCloseDialogOpen} onOpenChange={setIsCloseDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" onClick={() => setSelectedDrawerId(drawer.id)}>
                          <Lock className="h-4 w-4 mr-1" />
                          Close
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Close Cash Drawer</DialogTitle>
                          <DialogDescription>Enter the actual closing balance for {drawer.name}</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="p-3 bg-muted rounded-lg">
                            <div className="text-sm text-muted-foreground">Expected Balance</div>
                            <div className="text-lg font-semibold">${drawer.currentBalance.toFixed(2)}</div>
                          </div>
                          <div>
                            <Label htmlFor="closingBalance">Actual Closing Balance</Label>
                            <Input
                              id="closingBalance"
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              value={closingBalance}
                              onChange={(e) => setClosingBalance(e.target.value)}
                            />
                          </div>
                          {closingBalance && (
                            <div className="p-3 bg-muted rounded-lg">
                              <div className="text-sm text-muted-foreground">Variance</div>
                              <div
                                className={`text-lg font-semibold ${Number.parseFloat(closingBalance) - drawer.currentBalance === 0
                                  ? "text-foreground"
                                  : Number.parseFloat(closingBalance) - drawer.currentBalance > 0
                                    ? "text-accent"
                                    : "text-destructive"
                                  }`}
                              >
                                ${(Number.parseFloat(closingBalance) - drawer.currentBalance).toFixed(2)}
                              </div>
                            </div>
                          )}
                          <div>
                            <Label htmlFor="notes">Notes (Optional)</Label>
                            <Textarea
                              id="notes"
                              placeholder="Add any notes..."
                              value={notes}
                              onChange={(e) => setNotes(e.target.value)}
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setIsCloseDialogOpen(false)} className="flex-1">
                              Cancel
                            </Button>
                            <Button
                              onClick={handleCloseDrawer}
                              disabled={!closingBalance || closeDrawerMutation.isPending}
                              className="flex-1"
                            >
                              {closeDrawerMutation.isPending ? "Closing..." : "Close Drawer"}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}

                  {drawer.isOpen && (
                    <>
                      <Dialog open={isCashInDialogOpen} onOpenChange={setIsCashInDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            onClick={() => setSelectedDrawerId(drawer.id)}
                            className="text-accent border-accent hover:bg-accent hover:text-accent-foreground"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add Cash
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add Cash to Drawer</DialogTitle>
                            <DialogDescription>Add cash to {drawer.name}</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="cashAmount">Amount</Label>
                              <Input
                                id="cashAmount"
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={cashAmount}
                                onChange={(e) => setCashAmount(e.target.value)}
                              />
                            </div>
                            <div>
                              <Label htmlFor="reason">Reason</Label>
                              <Select value={reason} onValueChange={setReason}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select reason" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Starting cash">Starting cash</SelectItem>
                                  <SelectItem value="Bank deposit return">Bank deposit return</SelectItem>
                                  <SelectItem value="Change fund">Change fund</SelectItem>
                                  <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="notes">Notes (Optional)</Label>
                              <Textarea
                                id="notes"
                                placeholder="Add any notes..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" onClick={() => setIsCashInDialogOpen(false)} className="flex-1">
                                Cancel
                              </Button>
                              <Button
                                onClick={handleAddCash}
                                disabled={!cashAmount || !reason || addCashMutation.isPending}
                                className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90"
                              >
                                {addCashMutation.isPending ? "Adding..." : "Add Cash"}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Dialog open={isCashOutDialogOpen} onOpenChange={setIsCashOutDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            onClick={() => setSelectedDrawerId(drawer.id)}
                            className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                          >
                            <Minus className="h-4 w-4 mr-1" />
                            Remove Cash
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Remove Cash from Drawer</DialogTitle>
                            <DialogDescription>Remove cash from {drawer.name}</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="p-3 bg-muted rounded-lg">
                              <div className="text-sm text-muted-foreground">Available Balance</div>
                              <div className="text-lg font-semibold">${drawer.currentBalance.toFixed(2)}</div>
                            </div>
                            <div>
                              <Label htmlFor="cashAmount">Amount</Label>
                              <Input
                                id="cashAmount"
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                max={drawer.currentBalance}
                                value={cashAmount}
                                onChange={(e) => setCashAmount(e.target.value)}
                              />
                            </div>
                            <div>
                              <Label htmlFor="reason">Reason</Label>
                              <Select value={reason} onValueChange={setReason}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select reason" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Bank deposit">Bank deposit</SelectItem>
                                  <SelectItem value="Petty cash">Petty cash</SelectItem>
                                  <SelectItem value="Safe drop">Safe drop</SelectItem>
                                  <SelectItem value="Payout">Payout</SelectItem>
                                  <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="notes">Notes (Optional)</Label>
                              <Textarea
                                id="notes"
                                placeholder="Add any notes..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                onClick={() => setIsCashOutDialogOpen(false)}
                                className="flex-1"
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={handleRemoveCash}
                                disabled={
                                  !cashAmount ||
                                  !reason ||
                                  removeCashMutation.isPending ||
                                  Number.parseFloat(cashAmount || "0") > drawer.currentBalance
                                }
                                className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                {removeCashMutation.isPending ? "Removing..." : "Remove Cash"}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </>
                  )}
                </div>

                {/* Recent Events */}
                {drawer.events && drawer.events.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="text-sm font-medium text-card-foreground mb-2 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Recent Activity
                      </h4>
                      <ScrollArea className="h-24">
                        <div className="space-y-1">
                          {drawer.events.slice(0, 3).map((event) => (
                            <div key={event.id} className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-1">
                                {event.type === "OPENING_BALANCE" && <Unlock className="h-3 w-3 text-accent" />}
                                {event.type === "CLOSING_BALANCE" && <Lock className="h-3 w-3 text-muted-foreground" />}
                                {event.type === "CASH_IN" && <TrendingUp className="h-3 w-3 text-accent" />}
                                {event.type === "CASH_OUT" && <TrendingDown className="h-3 w-3 text-destructive" />}
                                {event.type === "SALE" && <Receipt className="h-3 w-3 text-primary" />}
                                <span className="text-muted-foreground">
                                  {event.type.replace("_", " ").toLowerCase()}
                                </span>
                              </div>
                              <div className={`font-medium ${event.amount > 0 ? "text-accent" : "text-destructive"}`}>
                                ${Math.abs(event.amount).toFixed(2)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
      </div>

      {/* Empty State */}
      {(!drawers || drawers.length === 0) && (
        <Card className="bg-card border-border">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-card-foreground mb-2">No Cash Drawers Found</h3>
            <p className="text-muted-foreground text-center mb-4">
              No cash drawers are configured for this location. Contact your administrator to set up cash drawers.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
