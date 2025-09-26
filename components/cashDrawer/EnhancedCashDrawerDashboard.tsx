"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

import { useCashDrawers } from "@/hooks/cashDrawer/useAllCashDrawerHooks"
import { formatCurrency } from "@/lib/formatCurrency"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import {
  Activity,
  AlertCircle,
  BarChart3,
  Calendar,
  Clock,
  DollarSign,
  Lock,
  MapPin,
  Minus,
  Plus,
  Receipt,
  Shield,
  TrendingDown,
  TrendingUp,
  Unlock,
  Wallet,
  Zap
} from "lucide-react"
import { useState } from "react"

interface EnhancedCashDrawerDashboardProps {
  locationId: string
  userId: string
  sessionId?: string
  organizationId: string
}

export function EnhancedCashDrawerDashboard({
  locationId,
  userId,
  sessionId,
  organizationId
}: EnhancedCashDrawerDashboardProps) {
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

  // Use the enhanced hooks
  const { data: drawersResult, isLoading } = useCashDrawers(organizationId)
  const drawers = drawersResult?.success && Array.isArray(drawersResult.data) ? drawersResult.data : []

  const getTotalBalance = () => {
    if (!drawers || drawers.length === 0) return 0
    return drawers.reduce((total, drawer) => total + drawer.currentBalance, 0)
  }

  const getOpenDrawersCount = () => {
    if (!drawers || drawers.length === 0) return 0
    return drawers.filter((drawer) => drawer.isOpen).length
  }

  const getTotalVariance = () => {
    if (!drawers || drawers.length === 0) return 0
    return drawers.reduce((total, drawer) => total + drawer.variance, 0)
  }

  const getVarianceStatus = (variance: number) => {
    if (variance === 0) return { status: "perfect", color: "emerald", severity: "low" }
    if (Math.abs(variance) <= 10) return { status: "minor", color: "amber", severity: "medium" }
    return { status: "alert", color: "red", severity: "high" }
  }

  const totalVariance = getTotalVariance()
  const varianceInfo = getVarianceStatus(totalVariance)

  return (
    <div className="space-y-8">
      {/* Enhanced Header with Professional Styling */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="p-4 rounded-3xl bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-400/20 to-red-500/20 rounded-3xl animate-pulse"></div>
              <DollarSign className="relative w-8 h-8 text-white" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full flex items-center justify-center">
                <Zap className="w-2 h-2 text-green-800" />
              </div>
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-slate-900 via-amber-700 to-orange-700 dark:from-white dark:via-amber-300 dark:to-orange-300 bg-clip-text text-transparent">
              Cash Drawer Management
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2 flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-600" />
              Professional cash handling & real-time monitoring system
            </p>
            <div className="flex items-center gap-4 mt-3">
              <Badge variant="outline" className="bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-700">
                <MapPin className="w-3 h-3 mr-1" />
                Location {locationId}
              </Badge>
              <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700">
                <Calendar className="w-3 h-3 mr-1" />
                {format(new Date(), "MMM dd, yyyy")}
              </Badge>
              <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Live System
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Summary Cards with Professional Design */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Total Balance Card */}
        <Card className="relative overflow-hidden bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-0 shadow-2xl group hover:shadow-3xl transition-all duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-green-500/10"></div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-bl-[3rem] group-hover:scale-110 transition-transform duration-300"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                <Wallet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              Total Balance
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-black text-emerald-800 dark:text-emerald-200 mb-2">
              {formatCurrency(getTotalBalance())}
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Live Balance</span>
              </div>
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Across {drawers.length} drawers</p>
          </CardContent>
        </Card>

        {/* Open Drawers Card */}
        <Card className="relative overflow-hidden bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-0 shadow-2xl group hover:shadow-3xl transition-all duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-cyan-500/5 to-indigo-500/10"></div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-bl-[3rem] group-hover:scale-110 transition-transform duration-300"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-bold text-blue-700 dark:text-blue-300 flex items-center gap-2">
              <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                <Unlock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              Open Drawers
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-3xl font-black text-blue-800 dark:text-blue-200">{getOpenDrawersCount()}</span>
              <span className="text-xl text-slate-500 dark:text-slate-400">/{drawers.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Activity className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400">Currently active</span>
              </div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mt-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${drawers.length > 0 ? (getOpenDrawersCount() / drawers.length) * 100 : 0}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        {/* Total Drawers Card */}
        <Card className="relative overflow-hidden bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-0 shadow-2xl group hover:shadow-3xl transition-all duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-violet-500/5 to-indigo-500/10"></div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-500/20 to-violet-500/20 rounded-bl-[3rem] group-hover:scale-110 transition-transform duration-300"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-bold text-purple-700 dark:text-purple-300 flex items-center gap-2">
              <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/30">
                <Receipt className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              Total Drawers
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-black text-purple-800 dark:text-purple-200 mb-2">
              {drawers.length}
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <BarChart3 className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                <span className="text-xs font-bold text-purple-600 dark:text-purple-400">In this location</span>
              </div>
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Managed drawers</p>
          </CardContent>
        </Card>

        {/* Enhanced Variance Card */}
        <Card className={cn(
          "relative overflow-hidden bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-0 shadow-2xl group hover:shadow-3xl transition-all duration-500",
          varianceInfo.severity === "high" ? "ring-2 ring-red-200 dark:ring-red-800" : ""
        )}>
          <div className={cn(
            "absolute inset-0 bg-gradient-to-br",
            varianceInfo.color === "red"
              ? "from-red-500/10 via-rose-500/5 to-red-500/10"
              : varianceInfo.color === "amber"
                ? "from-amber-500/10 via-yellow-500/5 to-orange-500/10"
                : "from-emerald-500/10 via-green-500/5 to-teal-500/10"
          )}></div>
          <div className={cn(
            "absolute top-0 right-0 w-24 h-24 rounded-bl-[3rem] group-hover:scale-110 transition-transform duration-300",
            varianceInfo.color === "red"
              ? "bg-gradient-to-br from-red-500/20 to-rose-500/20"
              : varianceInfo.color === "amber"
                ? "bg-gradient-to-br from-amber-500/20 to-orange-500/20"
                : "bg-gradient-to-br from-emerald-500/20 to-green-500/20"
          )}></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className={cn(
              "text-sm font-bold flex items-center gap-2",
              varianceInfo.color === "red" ? "text-red-700 dark:text-red-300"
                : varianceInfo.color === "amber" ? "text-amber-700 dark:text-amber-300"
                : "text-emerald-700 dark:text-emerald-300"
            )}>
              <div className={cn(
                "p-2 rounded-xl",
                varianceInfo.color === "red" ? "bg-red-100 dark:bg-red-900/30"
                  : varianceInfo.color === "amber" ? "bg-amber-100 dark:bg-amber-900/30"
                  : "bg-emerald-100 dark:bg-emerald-900/30"
              )}>
                {varianceInfo.severity === "low" ? (
                  <Wallet className={cn(
                    "w-4 h-4",
                    "text-emerald-600 dark:text-emerald-400"
                  )} />
                ) : (
                  <AlertCircle className={cn(
                    "w-4 h-4",
                    varianceInfo.color === "red" ? "text-red-600 dark:text-red-400" : "text-amber-600 dark:text-amber-400"
                  )} />
                )}
              </div>
              Total Variance
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <div className={cn(
              "text-3xl font-black mb-2",
              varianceInfo.color === "red" ? "text-red-800 dark:text-red-200"
                : varianceInfo.color === "amber" ? "text-amber-800 dark:text-amber-200"
                : "text-emerald-800 dark:text-emerald-200"
            )}>
              {formatCurrency(Math.abs(totalVariance))}
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {totalVariance >= 0 ? (
                  <>
                    <TrendingUp className="w-3 h-3 text-green-600 dark:text-green-400" />
                    <span className="text-xs font-bold text-green-600 dark:text-green-400">
                      {varianceInfo.status === "perfect" ? "Perfect" : "Overage"}
                    </span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="w-3 h-3 text-red-600 dark:text-red-400" />
                    <span className="text-xs font-bold text-red-600 dark:text-red-400">Shortage</span>
                  </>
                )}
              </div>
              <div className={cn(
                "w-2 h-2 rounded-full animate-pulse",
                totalVariance === 0 ? "bg-emerald-500"
                  : totalVariance > 0 ? "bg-amber-500"
                  : "bg-red-500"
              )}></div>
            </div>
            <div className={cn(
              "w-full rounded-full h-2 mt-2",
              varianceInfo.color === "red" ? "bg-red-200 dark:bg-red-800"
                : varianceInfo.color === "amber" ? "bg-amber-200 dark:bg-amber-800"
                : "bg-emerald-200 dark:bg-emerald-800"
            )}>
              <div
                className={cn(
                  "h-2 rounded-full transition-all duration-500",
                  varianceInfo.color === "red" ? "bg-gradient-to-r from-red-500 to-rose-500"
                    : varianceInfo.color === "amber" ? "bg-gradient-to-r from-amber-500 to-orange-500"
                    : "bg-gradient-to-r from-emerald-500 to-green-500"
                )}
                style={{ width: `${Math.min((Math.abs(totalVariance) / 50) * 100, 100)}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Cash Drawers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {isLoading ? (
          // Loading skeleton
          Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-0 shadow-xl animate-pulse">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-32"></div>
                  <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-16"></div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-24"></div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded"></div>
                  <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : drawers.length > 0 ? (
          drawers.map((drawer) => {
            const drawerVarianceInfo = getVarianceStatus(drawer.variance)
            return (
              <Card key={drawer.id} className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 group">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-50/50 via-white/30 to-slate-100/50 dark:from-slate-800/50 dark:via-slate-700/30 dark:to-slate-900/50 rounded-2xl"></div>
                <CardHeader className="relative">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-3">
                      <div className={cn(
                        "w-3 h-3 rounded-full shadow-lg",
                        drawer.isOpen
                          ? "bg-gradient-to-r from-green-400 to-emerald-500 shadow-green-500/30 animate-pulse"
                          : "bg-gradient-to-r from-slate-400 to-slate-500 shadow-slate-500/30"
                      )} />
                      {drawer.name}
                    </CardTitle>
                    <Badge
                      variant={drawer.isOpen ? "default" : "secondary"}
                      className={cn(
                        "font-bold shadow-lg transition-all duration-300",
                        drawer.isOpen
                          ? "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-green-500/30"
                          : "bg-gradient-to-r from-slate-400 to-slate-500 hover:from-slate-500 hover:to-slate-600 shadow-slate-500/30"
                      )}
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
                  <CardDescription className="font-medium text-slate-600 dark:text-slate-400">
                    Drawer #{drawer.drawerNumber}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 relative">
                  {/* Balance Display */}
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-purple-950/30 rounded-2xl border border-blue-200/50 dark:border-blue-400/20">
                    <div className="text-3xl font-black text-blue-800 dark:text-blue-200 mb-1">
                      {formatCurrency(drawer.currentBalance)}
                    </div>
                    <p className="text-xs font-bold text-blue-600 dark:text-blue-400">Current Balance</p>
                  </div>

                  {/* Variance Display */}
                  {drawer.variance !== 0 && (
                    <div className={cn(
                      "p-3 rounded-xl border",
                      drawerVarianceInfo.color === "red"
                        ? "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800"
                        : "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800"
                    )}>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Variance:</span>
                        <span className={cn(
                          "font-black text-sm",
                          drawerVarianceInfo.color === "red" ? "text-red-700 dark:text-red-300" : "text-amber-700 dark:text-amber-300"
                        )}>
                          {drawer.variance >= 0 ? "+" : ""}{formatCurrency(drawer.variance)}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons with Enhanced Styling */}
                  <div className="grid grid-cols-2 gap-3">
                    {!drawer.isOpen ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            className="h-12 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg hover:shadow-xl transition-all duration-300 font-bold"
                            onClick={() => {
                              setSelectedDrawerId(drawer.id)
                              setIsOpenDialogOpen(true)
                            }}
                          >
                            <div className="flex flex-col items-center gap-1">
                              <Unlock className="h-4 w-4" />
                              <span className="text-xs">Open</span>
                            </div>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Open this cash drawer</TooltipContent>
                      </Tooltip>
                    ) : (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            className="h-12 bg-white/90 dark:bg-slate-800/90 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 font-bold"
                            onClick={() => {
                              setSelectedDrawerId(drawer.id)
                              setIsCloseDialogOpen(true)
                            }}
                          >
                            <div className="flex flex-col items-center gap-1">
                              <Lock className="h-4 w-4" />
                              <span className="text-xs">Close</span>
                            </div>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Close this cash drawer</TooltipContent>
                      </Tooltip>
                    )}

                    {drawer.isOpen && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            className="h-12 bg-white/90 dark:bg-slate-800/90 border-blue-200 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-bold"
                            onClick={() => {
                              setSelectedDrawerId(drawer.id)
                              setIsCashInDialogOpen(true)
                            }}
                          >
                            <div className="flex flex-col items-center gap-1">
                              <Plus className="h-4 w-4" />
                              <span className="text-xs">Add Cash</span>
                            </div>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Add cash to this drawer</TooltipContent>
                      </Tooltip>
                    )}

                    {drawer.isOpen && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            className="h-12 bg-white/90 dark:bg-slate-800/90 border-red-200 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-700 dark:text-red-300 font-bold"
                            onClick={() => {
                              setSelectedDrawerId(drawer.id)
                              setIsCashOutDialogOpen(true)
                            }}
                          >
                            <div className="flex flex-col items-center gap-1">
                              <Minus className="h-4 w-4" />
                              <span className="text-xs">Remove</span>
                            </div>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Remove cash from this drawer</TooltipContent>
                      </Tooltip>
                    )}
                  </div>

                  {/* Activity Summary */}
                  <div className="pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                        <span className="font-medium text-slate-600 dark:text-slate-400">Today's Activity</span>
                      </div>
                      <Badge variant="outline" className="font-bold">
                        {drawer.todayTransactions} transactions
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        ) : (
          // Empty State
          <div className="col-span-full">
            <Card className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-0 shadow-xl">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-full flex items-center justify-center">
                    <DollarSign className="w-10 h-10 text-slate-400 dark:text-slate-500" />
                  </div>
                  <div className="absolute -inset-2 bg-gradient-to-br from-slate-200/50 to-slate-300/50 rounded-full -z-10"></div>
                </div>
                <h3 className="text-xl font-black text-slate-800 dark:text-white mb-2">No Cash Drawers Found</h3>
                <p className="text-slate-600 dark:text-slate-400 text-center mb-6 max-w-md">
                  No cash drawers are configured for this location. Contact your administrator to set up cash drawers.
                </p>
                <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Cash Drawer
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Dialogs would go here - implement as needed */}
    </div>
  )
}