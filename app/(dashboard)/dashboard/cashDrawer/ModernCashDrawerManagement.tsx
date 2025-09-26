"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

import {
  useAddCashToDrawer,
  useCashDrawerAnalytics,
  useCashDrawerReport,
  useCashDrawerStatus,
  useCashDrawerTransactions,
  useCreateCashDrawer,
  useReconcileCashDrawer,
  useRemoveCashFromDrawer
} from "@/hooks/cashDrawer/useAllCashDrawerHooks"

import { formatCurrency } from "@/lib/formatCurrency"
import { theme } from "@/lib/theme"
import { cn } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { endOfDay, format, startOfDay, subDays } from "date-fns"
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Building2,
  Calculator,
  CalendarDays,
  CheckCircle2,
  Clock,
  DollarSign,
  Download,
  FileText,
  Filter,
  History,
  Minus,
  Monitor,
  PieChart,
  Plus,
  RefreshCw,
  Settings,
  Shield,
  Sparkles,
  Target,
  Terminal,
  TrendingDown,
  TrendingUp,
  Wallet,
  Zap
} from "lucide-react"
import { useSession } from "next-auth/react"
import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"

// Enhanced form schemas with better validation
const cashOperationSchema = z.object({
  amount: z.number().min(0.01, "Amount must be greater than $0.01"),
  reason: z.string().min(1, "Reason is required"),
  notes: z.string().optional(),
})

const reconciliationSchema = z.object({
  countedAmount: z.number().min(0, "Amount cannot be negative"),
  notes: z.string().optional(),
})

const createDrawerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  drawerNumber: z.string().min(1, "Drawer number is required"),
  locationId: z.string().min(1, "Location is required"),
  terminalId: z.string().min(1, "Terminal is required"),
  initialBalance: z.number().min(0, "Initial balance cannot be negative").optional(),
})

type CashOperationForm = z.infer<typeof cashOperationSchema>
type ReconciliationForm = z.infer<typeof reconciliationSchema>
type CreateDrawerForm = z.infer<typeof createDrawerSchema>

export function ModernCashDrawerManagement() {
  const { data: session } = useSession()
  const user = session?.user
  const userId = user?.id || ""
  const organizationId = user?.organizationId || ""

  // Enhanced state management
  const [selectedDrawerId, setSelectedDrawerId] = useState<string>("")
  const [activeTab, setActiveTab] = useState("overview")
  const [dateRange, setDateRange] = useState({
    start: startOfDay(subDays(new Date(), 7)),
    end: endOfDay(new Date())
  })
  const [currentTime, setCurrentTime] = useState(new Date())
  const [operationDialogOpen, setOperationDialogOpen] = useState(false)
  const [operationType, setOperationType] = useState<"add" | "remove">("add")
  const [reconcileDialogOpen, setReconcileDialogOpen] = useState(false)
  const [createDrawerDialogOpen, setCreateDrawerDialogOpen] = useState(false)
  const [transactionPage, setTransactionPage] = useState(1)
  const [quickStatsExpanded, setQuickStatsExpanded] = useState(true)

  // Real-time clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Enhanced data fetching hooks
  const { drawers, stats, isLoading, refetch } = useCashDrawerStatus(organizationId)
  const { data: transactionsData } = useCashDrawerTransactions(
    selectedDrawerId,
    transactionPage,
    20,
    dateRange.start,
    dateRange.end,
    { enabled: !!selectedDrawerId }
  )
  const { data: reportData } = useCashDrawerReport(
    selectedDrawerId,
    dateRange.start,
    dateRange.end,
    { enabled: !!selectedDrawerId }
  )
  const { data: analyticsData } = useCashDrawerAnalytics(organizationId, dateRange)

  // Enhanced mutations
  const addCashMutation = useAddCashToDrawer()
  const removeCashMutation = useRemoveCashFromDrawer()
  const reconcileMutation = useReconcileCashDrawer()
  const createDrawerMutation = useCreateCashDrawer()

  // Enhanced forms with better validation
  const cashOperationForm = useForm<CashOperationForm>({
    resolver: zodResolver(cashOperationSchema),
    defaultValues: { amount: 0, reason: "", notes: "" }
  })

  const reconciliationForm = useForm<ReconciliationForm>({
    resolver: zodResolver(reconciliationSchema),
    defaultValues: { countedAmount: 0, notes: "" }
  })

  const createDrawerForm = useForm<CreateDrawerForm>({
    resolver: zodResolver(createDrawerSchema),
    defaultValues: { name: "", drawerNumber: "", locationId: "", terminalId: "", initialBalance: 0 }
  })

  // Enhanced selected drawer logic
  const selectedDrawer = useMemo(() =>
    drawers?.find(d => d.id === selectedDrawerId),
    [drawers, selectedDrawerId]
  )

  // Auto-select first drawer if none selected
  useEffect(() => {
    if (!selectedDrawerId && Array.isArray(drawers) && drawers.length > 0) {
      setSelectedDrawerId(drawers[0]?.id)
    }
  }, [drawers, selectedDrawerId])

  // Enhanced cash operation handlers
  const handleCashOperation = async (data: CashOperationForm) => {
    if (!selectedDrawerId || !userId) return

    const operation = {
      drawerId: selectedDrawerId,
      userId,
      type: operationType === "add" ? "CASH_IN" as const : "CASH_OUT" as const,
      amount: data.amount,
      reason: data.reason,
      notes: data.notes,
    }

    try {
      if (operationType === "add") {
        await addCashMutation.mutateAsync(operation)
      } else {
        await removeCashMutation.mutateAsync(operation)
      }
      setOperationDialogOpen(false)
      cashOperationForm.reset()
    } catch (error) {
      console.error("Cash operation failed:", error)
    }
  }

  const handleReconciliation = async (data: ReconciliationForm) => {
    if (!selectedDrawerId || !userId) return

    try {
      await reconcileMutation.mutateAsync({
        drawerId: selectedDrawerId,
        countedAmount: data.countedAmount,
        userId,
        notes: data.notes,
      })
      setReconcileDialogOpen(false)
      reconciliationForm.reset()
    } catch (error) {
      console.error("Reconciliation failed:", error)
    }
  }

  const handleCreateDrawer = async (data: CreateDrawerForm) => {
    try {
      await createDrawerMutation.mutateAsync(data)
      setCreateDrawerDialogOpen(false)
      createDrawerForm.reset()
    } catch (error) {
      console.error("Create drawer failed:", error)
    }
  }

  // Enhanced variance calculation and display
  const getVarianceStatus = (variance: number) => {
    if (variance === 0) return { status: "perfect", color: "emerald", icon: CheckCircle2 }
    if (Math.abs(variance) <= 10) return { status: "minor", color: "amber", icon: AlertTriangle }
    return { status: "alert", color: "red", icon: AlertTriangle }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Enhanced Header with Professional Styling */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="p-4 rounded-3xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-3xl animate-pulse"></div>
                  <DollarSign className="relative w-8 h-8 text-white" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full flex items-center justify-center">
                    <Sparkles className="w-2 h-2 text-green-800" />
                  </div>
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-black bg-gradient-to-r from-slate-900 via-blue-700 to-indigo-700 dark:from-white dark:via-blue-300 dark:to-indigo-300 bg-clip-text text-transparent">
                  Cash Drawer Management
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-2 flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-blue-600" />
                  Professional cash handling & real-time reconciliation system
                </p>
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    Live System
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    {format(currentTime, "EEEE, MMMM dd, yyyy • HH:mm:ss")}
                  </div>
                  <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700">
                    <Monitor className="w-3 h-3 mr-1" />
                    Real-time
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={refetch}
                    disabled={isLoading}
                    className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-blue-200 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all duration-300"
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    <span className="hidden sm:inline">Refresh</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Refresh cash drawer data</TooltipContent>
              </Tooltip>

              <Dialog open={createDrawerDialogOpen} onOpenChange={setCreateDrawerDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white shadow-xl border-0 transition-all duration-300 hover:scale-105"
                  >
                    <Plus className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">New Drawer</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-blue-200 dark:border-blue-700">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                      <Terminal className="w-5 h-5" />
                      Create New Cash Drawer
                    </DialogTitle>
                    <DialogDescription className="text-slate-600 dark:text-slate-400">
                      Set up a new cash drawer for your location with professional configuration
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...createDrawerForm}>
                    <form onSubmit={createDrawerForm.handleSubmit(handleCreateDrawer)} className="space-y-4">
                      <FormField
                        control={createDrawerForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Drawer Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Main Counter Drawer" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={createDrawerForm.control}
                        name="drawerNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Drawer Number</FormLabel>
                            <FormControl>
                              <Input placeholder="DRW-001" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={createDrawerForm.control}
                        name="initialBalance"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Initial Balance</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="200.00"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setCreateDrawerDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={createDrawerMutation.isPending}>
                          {createDrawerMutation.isPending ? "Creating..." : "Create Drawer"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Enhanced Statistics Overview with Professional Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
          {/* Total Balance Card */}
          <Card className="relative overflow-hidden bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-0 shadow-2xl group hover:shadow-3xl transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-purple-500/10"></div>
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-bl-[3rem] group-hover:scale-110 transition-transform duration-300"></div>
            <CardHeader className="pb-3 relative">
              <CardTitle className="text-sm font-bold text-blue-700 dark:text-blue-300 flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                  <Wallet className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                Total Balance
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-black text-blue-800 dark:text-blue-200 mb-2">
                {formatCurrency(stats.totalBalance)}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400">Live Balance</span>
                </div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Across {stats.totalDrawers} drawers</p>
            </CardContent>
          </Card>

          {/* Active Drawers Card */}
          <Card className="relative overflow-hidden bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-0 shadow-2xl group hover:shadow-3xl transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-green-500/10"></div>
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-bl-[3rem] group-hover:scale-110 transition-transform duration-300"></div>
            <CardHeader className="pb-3 relative">
              <CardTitle className="text-sm font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                  <Terminal className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                Active Drawers
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-3xl font-black text-emerald-800 dark:text-emerald-200">{stats.activeDrawers}</span>
                <span className="text-xl text-slate-500 dark:text-slate-400">/{stats.totalDrawers}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Online</span>
                </div>
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mt-2">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-green-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${stats.totalDrawers > 0 ? (stats.activeDrawers / stats.totalDrawers) * 100 : 0}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>

          {/* Average Balance Card */}
          <Card className="relative overflow-hidden bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-0 shadow-2xl group hover:shadow-3xl transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-violet-500/5 to-indigo-500/10"></div>
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-500/20 to-violet-500/20 rounded-bl-[3rem] group-hover:scale-110 transition-transform duration-300"></div>
            <CardHeader className="pb-3 relative">
              <CardTitle className="text-sm font-bold text-purple-700 dark:text-purple-300 flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/30">
                  <BarChart3 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
                Avg Balance
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-black text-purple-800 dark:text-purple-200 mb-2">
                {formatCurrency(stats.averageBalance)}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Activity className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                  <span className="text-xs font-bold text-purple-600 dark:text-purple-400">Per Drawer</span>
                </div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Calculated average</p>
            </CardContent>
          </Card>

          {/* Enhanced Variance Card with Alert States */}
          <Card className={cn(
            "relative overflow-hidden bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-0 shadow-2xl group hover:shadow-3xl transition-all duration-500",
            Math.abs(stats.totalVariance) > 10 ? "ring-2 ring-red-200 dark:ring-red-800" : ""
          )}>
            <div className={cn(
              "absolute inset-0 bg-gradient-to-br",
              Math.abs(stats.totalVariance) > 10
                ? "from-red-500/10 via-rose-500/5 to-red-500/10"
                : "from-amber-500/10 via-yellow-500/5 to-orange-500/10"
            )}></div>
            <div className={cn(
              "absolute top-0 right-0 w-24 h-24 rounded-bl-[3rem] group-hover:scale-110 transition-transform duration-300",
              Math.abs(stats.totalVariance) > 10
                ? "bg-gradient-to-br from-red-500/20 to-rose-500/20"
                : "bg-gradient-to-br from-amber-500/20 to-orange-500/20"
            )}></div>
            <CardHeader className="pb-3 relative">
              <CardTitle className={cn(
                "text-sm font-bold flex items-center gap-2",
                Math.abs(stats.totalVariance) > 10 ? "text-red-700 dark:text-red-300" : "text-amber-700 dark:text-amber-300"
              )}>
                <div className={cn(
                  "p-2 rounded-xl",
                  Math.abs(stats.totalVariance) > 10 ? "bg-red-100 dark:bg-red-900/30" : "bg-amber-100 dark:bg-amber-900/30"
                )}>
                  <AlertTriangle className={cn(
                    "w-4 h-4",
                    Math.abs(stats.totalVariance) > 10 ? "text-red-600 dark:text-red-400" : "text-amber-600 dark:text-amber-400"
                  )} />
                </div>
                Total Variance
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <div className={cn(
                "text-3xl font-black mb-2",
                Math.abs(stats.totalVariance) > 10 ? "text-red-800 dark:text-red-200" : "text-amber-800 dark:text-amber-200"
              )}>
                {formatCurrency(Math.abs(stats.totalVariance))}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {stats.totalVariance >= 0 ? (
                    <>
                      <TrendingUp className="w-3 h-3 text-green-600 dark:text-green-400" />
                      <span className="text-xs font-bold text-green-600 dark:text-green-400">Overage</span>
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
                  stats.totalVariance >= 0 ? "bg-green-500" : "bg-red-500"
                )}></div>
              </div>
              <div className={cn(
                "w-full rounded-full h-2 mt-2",
                Math.abs(stats.totalVariance) > 10 ? "bg-red-200 dark:bg-red-800" : "bg-amber-200 dark:bg-amber-800"
              )}>
                <div
                  className={cn(
                    "h-2 rounded-full transition-all duration-500",
                    Math.abs(stats.totalVariance) > 10
                      ? "bg-gradient-to-r from-red-500 to-rose-500"
                      : "bg-gradient-to-r from-amber-500 to-orange-500"
                  )}
                  style={{ width: `${Math.min((Math.abs(stats.totalVariance) / 50) * 100, 100)}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>

          {/* Today's Activity Card */}
          <Card className="relative overflow-hidden bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-0 shadow-2xl group hover:shadow-3xl transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-blue-500/5 to-cyan-500/10"></div>
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500/20 to-blue-500/20 rounded-bl-[3rem] group-hover:scale-110 transition-transform duration-300"></div>
            <CardHeader className="pb-3 relative">
              <CardTitle className="text-sm font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
                  <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                Today's Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-black text-indigo-800 dark:text-indigo-200 mb-2">
                {analyticsData?.summary?.totalTransactions || 0}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <History className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">Transactions</span>
                </div>
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Real-time count</p>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Modern Tabs System */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <div className="relative">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl shadow-2xl border-0 rounded-3xl p-2 gap-2">
              <TabsTrigger
                value="overview"
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:via-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-xl rounded-2xl transition-all duration-300 hover:scale-105"
              >
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger
                value="operations"
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-white data-[state=active]:shadow-xl rounded-2xl transition-all duration-300 hover:scale-105"
              >
                <DollarSign className="w-4 h-4" />
                <span className="hidden sm:inline">Operations</span>
              </TabsTrigger>
              <TabsTrigger
                value="reconciliation"
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-violet-500 data-[state=active]:text-white data-[state=active]:shadow-xl rounded-2xl transition-all duration-300 hover:scale-105"
              >
                <Calculator className="w-4 h-4" />
                <span className="hidden sm:inline">Reconcile</span>
              </TabsTrigger>
              <TabsTrigger
                value="reports"
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white data-[state=active]:shadow-xl rounded-2xl transition-all duration-300 hover:scale-105"
              >
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">Reports</span>
              </TabsTrigger>
            </TabsList>
            <div className="absolute -inset-2 bg-gradient-to-r from-blue-500/20 via-indigo-500/10 to-purple-500/20 rounded-3xl -z-10 opacity-60 blur-xl"></div>
          </div>

          {/* Enhanced Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Enhanced Drawer Selection Card */}
              <Card className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-purple-500/10"></div>
                <CardHeader className="relative">
                  <CardTitle className="flex items-center gap-3 text-slate-800 dark:text-white">
                    <div className="p-3 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 rounded-2xl shadow-lg">
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent font-black">
                      Select Drawer
                    </span>
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-400">
                    Choose a cash drawer to manage and monitor in real-time
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative space-y-6">
                  <Select value={selectedDrawerId} onValueChange={setSelectedDrawerId}>
                    <SelectTrigger className="w-full h-14 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-blue-200/50 dark:border-blue-400/20 focus:border-blue-400 dark:focus:border-blue-400 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
                      <SelectValue placeholder="Select a cash drawer" />
                    </SelectTrigger>
                    <SelectContent className="backdrop-blur-xl bg-white/95 dark:bg-slate-900/95 border-blue-200/50 dark:border-blue-400/20">
                      {drawers?.map((drawer) => (
                        <SelectItem key={drawer.id} value={drawer.id} className="focus:bg-blue-50/80 dark:focus:bg-blue-900/30">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-3 h-3 rounded-full shadow-lg",
                              drawer.isOpen
                                ? "bg-gradient-to-r from-green-400 to-emerald-500 shadow-green-500/30"
                                : "bg-gradient-to-r from-slate-400 to-slate-500 shadow-slate-500/30"
                            )} />
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-800 dark:text-white">{drawer.name}</span>
                              <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                                #{drawer.drawerNumber} • {formatCurrency(drawer.currentBalance)}
                              </span>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {selectedDrawer && (
                    <div className="relative group">
                      <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-3xl blur-sm opacity-25 group-hover:opacity-40 transition-opacity duration-500"></div>
                      <div className="relative p-6 bg-gradient-to-br from-blue-50/90 via-indigo-50/90 to-purple-50/90 dark:from-blue-950/50 dark:via-indigo-950/50 dark:to-purple-950/50 backdrop-blur-sm rounded-3xl border border-blue-200/50 dark:border-blue-400/20">
                        <div className="space-y-4">
                          <div className="flex justify-between items-center group/item">
                            <span className="text-sm font-bold text-blue-700 dark:text-blue-300 group-hover/item:text-blue-800 dark:group-hover/item:text-blue-200 transition-colors">
                              Current Balance:
                            </span>
                            <span className="text-2xl font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                              {formatCurrency(selectedDrawer.currentBalance)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center group/item">
                            <span className="text-sm font-bold text-blue-700 dark:text-blue-300 group-hover/item:text-blue-800 dark:group-hover/item:text-blue-200 transition-colors">
                              Expected Balance:
                            </span>
                            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                              {formatCurrency(selectedDrawer.expectedBalance)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center group/item">
                            <span className="text-sm font-bold text-blue-700 dark:text-blue-300 group-hover/item:text-blue-800 dark:group-hover/item:text-blue-200 transition-colors">
                              Variance:
                            </span>
                            <span className={cn(
                              "text-sm font-black px-3 py-1.5 rounded-xl shadow-lg",
                              selectedDrawer.variance === 0
                                ? "text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/30"
                                : selectedDrawer.variance > 0
                                  ? "text-orange-700 bg-orange-100 dark:text-orange-300 dark:bg-orange-900/30"
                                  : "text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900/30"
                            )}>
                              {selectedDrawer.variance >= 0 ? "+" : ""}{formatCurrency(selectedDrawer.variance)}
                            </span>
                          </div>
                          <div className="h-px bg-gradient-to-r from-transparent via-blue-300/50 to-transparent my-4"></div>
                          <div className="flex items-center justify-between">
                            <Badge
                              variant={selectedDrawer.isOpen ? "default" : "secondary"}
                              className={cn(
                                "px-4 py-2 font-bold shadow-lg",
                                selectedDrawer.isOpen
                                  ? "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-green-500/30"
                                  : "bg-gradient-to-r from-slate-400 to-slate-500 hover:from-slate-500 hover:to-slate-600 shadow-slate-500/30"
                              )}
                            >
                              {selectedDrawer.isOpen ? "🟢 Open" : "🔴 Closed"}
                            </Badge>
                            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-100/50 dark:bg-blue-900/30 px-3 py-1.5 rounded-xl">
                              {selectedDrawer.todayTransactions} transactions today
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Enhanced Quick Actions Card */}
              <Card className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-green-500/10"></div>
                <CardHeader className="relative">
                  <CardTitle className="flex items-center gap-3 text-slate-800 dark:text-white">
                    <div className="p-3 bg-gradient-to-br from-emerald-500 via-teal-600 to-green-700 rounded-2xl shadow-lg">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 bg-clip-text text-transparent font-black">
                      Quick Actions
                    </span>
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-400">
                    Perform common cash drawer operations with ease
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative space-y-4">
                  <Button
                    className="w-full justify-start h-14 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-white"
                    disabled={!selectedDrawerId}
                    onClick={() => {
                      setOperationType("add")
                      setOperationDialogOpen(true)
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/20 rounded-xl">
                        <Plus className="w-5 h-5" />
                      </div>
                      <span>Add Cash</span>
                    </div>
                  </Button>

                  <Button
                    className="w-full justify-start h-14 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-white"
                    disabled={!selectedDrawerId}
                    onClick={() => {
                      setOperationType("remove")
                      setOperationDialogOpen(true)
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/20 rounded-xl">
                        <Minus className="w-5 h-5" />
                      </div>
                      <span>Remove Cash</span>
                    </div>
                  </Button>

                  <Button
                    className="w-full justify-start h-14 bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-white"
                    disabled={!selectedDrawerId}
                    onClick={() => setReconcileDialogOpen(true)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/20 rounded-xl">
                        <Calculator className="w-5 h-5" />
                      </div>
                      <span>Reconcile</span>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full justify-start h-14 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-slate-200/50 dark:border-slate-400/20 hover:bg-slate-50/90 dark:hover:bg-slate-700/90 hover:border-slate-300/50 dark:hover:border-slate-300/30 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-slate-700 dark:text-slate-300"
                    disabled={!selectedDrawerId}
                    onClick={() => setActiveTab("reports")}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100/80 dark:bg-slate-700/80 rounded-xl">
                        <FileText className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                      </div>
                      <span>View Report</span>
                    </div>
                  </Button>
                </CardContent>
              </Card>

              {/* Enhanced Recent Activity Card */}
              <Card className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-yellow-500/10"></div>
                <CardHeader className="relative">
                  <CardTitle className="flex items-center gap-3 text-slate-800 dark:text-white">
                    <div className="p-3 bg-gradient-to-br from-orange-500 via-amber-600 to-yellow-700 rounded-2xl shadow-lg">
                      <History className="w-6 h-6 text-white" />
                    </div>
                    <span className="bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 bg-clip-text text-transparent font-black">
                      Recent Activity
                    </span>
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-400">
                    Latest transactions across all cash drawers
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative">
                  <ScrollArea className="h-80">
                    <div className="space-y-3">
                      {transactionsData && transactionsData.data?.transactions?.slice(0, 5).map((transaction, index) => (
                        <div
                          key={transaction.id}
                          className="group/item relative overflow-hidden rounded-2xl border border-slate-200/50 dark:border-slate-700/50 hover:border-slate-300/50 dark:hover:border-slate-600/50 transition-all duration-300 hover:shadow-lg"
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-slate-50/50 to-white/90 dark:from-slate-800/90 dark:via-slate-700/50 dark:to-slate-800/90 backdrop-blur-sm"></div>
                          <div className="relative flex items-center justify-between p-4">
                            <div className="flex items-center gap-4">
                              <div className={cn(
                                "p-3 rounded-2xl shadow-lg transition-all duration-300 group-hover/item:scale-110",
                                transaction.type === "CASH_IN" || transaction.type === "SALE"
                                  ? "bg-gradient-to-br from-green-400 to-emerald-500 shadow-green-500/30"
                                  : "bg-gradient-to-br from-red-400 to-rose-500 shadow-red-500/30"
                              )}>
                                {transaction.type === "CASH_IN" || transaction.type === "SALE" ? (
                                  <Plus className="w-4 h-4 text-white" />
                                ) : (
                                  <Minus className="w-4 h-4 text-white" />
                                )}
                              </div>
                              <div className="space-y-1">
                                <p className="text-sm font-bold text-slate-800 dark:text-white group-hover/item:text-slate-900 dark:group-hover/item:text-slate-100 transition-colors">
                                  {transaction.reason}
                                </p>
                                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100/80 dark:bg-slate-800/80 px-2 py-1 rounded-lg">
                                  {format(new Date(transaction.createdAt), "MMM dd, HH:mm")}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={cn(
                                "text-sm font-black px-3 py-2 rounded-xl shadow-sm",
                                transaction.type === "CASH_IN" || transaction.type === "SALE"
                                  ? "text-green-700 bg-green-100/80 dark:text-green-300 dark:bg-green-900/40"
                                  : "text-red-700 bg-red-100/80 dark:text-red-300 dark:bg-red-900/40"
                              )}>
                                {transaction.type === "CASH_IN" || transaction.type === "SALE" ? "+" : "-"}
                                {formatCurrency(transaction.amount)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                      {(!transactionsData || !transactionsData.data?.transactions?.length) && (
                        <div className="text-center py-12">
                          <div className="relative mx-auto w-20 h-20 mb-4">
                            <div className="absolute inset-0 bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 rounded-full"></div>
                            <div className="absolute inset-2 bg-gradient-to-br from-orange-500/20 to-amber-500/20 rounded-full flex items-center justify-center">
                              <History className="w-8 h-8 text-orange-500/60" />
                            </div>
                          </div>
                          <p className="text-slate-500 dark:text-slate-400 font-bold">No recent activity</p>
                          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Transactions will appear here</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Continue with other tabs... */}
          <TabsContent value="operations" className="space-y-6">
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
              <p>Operations tab content coming soon...</p>
            </div>
          </TabsContent>

          <TabsContent value="reconciliation" className="space-y-6">
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
              <p>Reconciliation tab content coming soon...</p>
            </div>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
              <p>Reports tab content coming soon...</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Enhanced Cash Operation Dialog */}
      <Dialog open={operationDialogOpen} onOpenChange={setOperationDialogOpen}>
        <DialogContent className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-blue-200 dark:border-blue-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className={cn(
                "p-2 rounded-xl",
                operationType === "add" ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"
              )}>
                {operationType === "add" ? <Plus className="w-5 h-5 text-green-600" /> : <Minus className="w-5 h-5 text-red-600" />}
              </div>
              {operationType === "add" ? "Add Cash to Drawer" : "Remove Cash from Drawer"}
            </DialogTitle>
            <DialogDescription>
              {operationType === "add"
                ? "Add cash to the selected drawer and record the reason"
                : "Remove cash from the selected drawer and record the reason"}
            </DialogDescription>
          </DialogHeader>
          {selectedDrawer && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50/80 dark:bg-slate-800/80 rounded-xl">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold">Current Balance:</span>
                  <span className="font-black text-lg">{formatCurrency(selectedDrawer.currentBalance)}</span>
                </div>
              </div>

              <Form {...cashOperationForm}>
                <form onSubmit={cashOperationForm.handleSubmit(handleCashOperation)} className="space-y-4">
                  <FormField
                    control={cashOperationForm.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0.01"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={cashOperationForm.control}
                    name="reason"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reason</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={operationType === "add" ? "Till float replenishment" : "Bank deposit"}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={cashOperationForm.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Additional details..."
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Preview new balance */}
                  {cashOperationForm.watch("amount") > 0 && (
                    <div className="p-4 bg-blue-50/80 dark:bg-blue-900/30 rounded-xl">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold">New Balance:</span>
                        <span className="font-black text-blue-600 text-lg">
                          {formatCurrency(
                            selectedDrawer.currentBalance +
                            (operationType === "add" ? 1 : -1) * cashOperationForm.watch("amount")
                          )}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setOperationDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={addCashMutation.isPending || removeCashMutation.isPending}
                      className={operationType === "add"
                        ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                        : "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700"
                      }
                    >
                      {addCashMutation.isPending || removeCashMutation.isPending ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          <span>Processing...</span>
                        </div>
                      ) : (
                        <>
                          {operationType === "add" ? <Plus className="w-4 h-4 mr-2" /> : <Minus className="w-4 h-4 mr-2" />}
                          {operationType === "add" ? "Add Cash" : "Remove Cash"}
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Enhanced Reconciliation Dialog */}
      <Dialog open={reconcileDialogOpen} onOpenChange={setReconcileDialogOpen}>
        <DialogContent className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-purple-200 dark:border-purple-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/30">
                <Calculator className="w-5 h-5 text-purple-600" />
              </div>
              Reconcile Cash Drawer
            </DialogTitle>
            <DialogDescription>
              Count the physical cash and reconcile with the system balance
            </DialogDescription>
          </DialogHeader>
          {selectedDrawer && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50/80 dark:bg-slate-800/80 rounded-xl">
                  <div className="text-sm text-slate-600 dark:text-slate-400">System Balance:</div>
                  <div className="font-black text-lg">{formatCurrency(selectedDrawer.currentBalance)}</div>
                </div>
                <div className="p-4 bg-slate-50/80 dark:bg-slate-800/80 rounded-xl">
                  <div className="text-sm text-slate-600 dark:text-slate-400">Expected Balance:</div>
                  <div className="font-black text-lg">{formatCurrency(selectedDrawer.expectedBalance)}</div>
                </div>
              </div>

              <Form {...reconciliationForm}>
                <form onSubmit={reconciliationForm.handleSubmit(handleReconciliation)} className="space-y-4">
                  <FormField
                    control={reconciliationForm.control}
                    name="countedAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Physical Cash Count</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Enhanced variance display */}
                  {reconciliationForm.watch("countedAmount") > 0 && (
                    <div className="p-4 bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-950/50 dark:to-violet-950/50 rounded-xl border border-purple-200 dark:border-purple-800">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-bold">Physical Count:</span>
                          <span className="font-bold">{formatCurrency(reconciliationForm.watch("countedAmount"))}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-bold">System Balance:</span>
                          <span className="font-bold">{formatCurrency(selectedDrawer.currentBalance)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between">
                          <span className="font-black">Variance:</span>
                          <span className={cn(
                            "font-black text-xl",
                            (reconciliationForm.watch("countedAmount") - selectedDrawer.currentBalance) === 0
                              ? "text-green-600"
                              : (reconciliationForm.watch("countedAmount") - selectedDrawer.currentBalance) > 0
                                ? "text-orange-600"
                                : "text-red-600"
                          )}>
                            {(reconciliationForm.watch("countedAmount") - selectedDrawer.currentBalance) >= 0 ? "+" : ""}
                            {formatCurrency(reconciliationForm.watch("countedAmount") - selectedDrawer.currentBalance)}
                          </span>
                        </div>
                        {(reconciliationForm.watch("countedAmount") - selectedDrawer.currentBalance) !== 0 && (
                          <div className="text-sm text-center text-purple-700 dark:text-purple-300 font-bold">
                            {(reconciliationForm.watch("countedAmount") - selectedDrawer.currentBalance) > 0
                              ? "Cash Overage Detected"
                              : "Cash Shortage Detected"}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <FormField
                    control={reconciliationForm.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Add notes about the count or any discrepancies..."
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setReconcileDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={reconcileMutation.isPending}
                      className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700"
                    >
                      {reconcileMutation.isPending ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          <span>Reconciling...</span>
                        </div>
                      ) : (
                        <>
                          <Calculator className="w-4 h-4 mr-2" />
                          Complete Reconciliation
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}