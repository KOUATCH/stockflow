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
  PieChart,
  Plus,
  RefreshCw,
  Settings,
  Target,
  Terminal,
  TrendingDown,
  TrendingUp,
  Wallet,
  Zap
} from "lucide-react"
import { useClientAuth } from "@/hooks/useClientAuth"
import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"

// Form schemas
const cashOperationSchema = z.object({
  amount: z.number().min(0.01, "Amount must be greater than 0"),
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

interface CashDrawerManagementProps {
  organizationId: string
}

export function CashDrawerManagement() {
  const { data: session } = useSession()
  const user = session?.user
  const userId = user?.id || ""
  const organizationId = user?.organizationId || ""

  // State management
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

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Hooks for data fetching
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

  // Mutations
  const addCashMutation = useAddCashToDrawer()
  const removeCashMutation = useRemoveCashFromDrawer()
  const reconcileMutation = useReconcileCashDrawer()
  const createDrawerMutation = useCreateCashDrawer()

  // Forms
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

  // Get selected drawer details
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

  // Handle cash operations
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

    if (operationType === "add") {
      await addCashMutation.mutateAsync(operation)
    } else {
      await removeCashMutation.mutateAsync(operation)
    }

    setOperationDialogOpen(false)
    cashOperationForm.reset()
  }

  // Handle reconciliation
  const handleReconciliation = async (data: ReconciliationForm) => {
    if (!selectedDrawerId || !userId) return

    await reconcileMutation.mutateAsync({
      drawerId: selectedDrawerId,
      countedAmount: data.countedAmount,
      userId,
      notes: data.notes,
    })

    setReconcileDialogOpen(false)
    reconciliationForm.reset()
  }

  // Handle create drawer
  const handleCreateDrawer = async (data: CreateDrawerForm) => {
    await createDrawerMutation.mutateAsync(data)
    setCreateDrawerDialogOpen(false)
    createDrawerForm.reset()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Page Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="relative p-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 to-teal-500/20 rounded-2xl animate-pulse"></div>
                <DollarSign className="relative w-6 h-6 sm:w-8 sm:h-8 text-white" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-slate-900 via-emerald-700 to-teal-700 dark:from-white dark:via-emerald-300 dark:to-teal-300 bg-clip-text text-transparent">
                  Cash Drawer Management
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-600" />
                  Professional cash handling & real-time reconciliation system
                </p>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    Live
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {format(currentTime, "EEEE, MMMM dd, yyyy • HH:mm:ss")}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={refetch}
                disabled={isLoading}
                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-emerald-200 dark:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
              <Dialog open={createDrawerDialogOpen} onOpenChange={setCreateDrawerDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-xl border-0"
                  >
                    <Plus className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">New Drawer</span>
                  </Button>
                </DialogTrigger>
              <DialogContent className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-emerald-200 dark:border-emerald-700">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-emerald-800 dark:text-emerald-200">
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

        {/* Enhanced Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 mb-8 sm:mb-12">
          <Card className="relative overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-0 shadow-2xl group hover:shadow-3xl transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-green-500/10"></div>
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-bl-[3rem] group-hover:scale-110 transition-transform duration-300"></div>
            <CardHeader className="pb-3 relative">
              <CardTitle className="text-sm font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                  <Wallet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                Total Balance
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold text-emerald-800 dark:text-emerald-200 mb-2">
                {formatCurrency(stats.totalBalance)}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Live Balance</span>
                </div>
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Across {stats.totalDrawers} drawers</p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-0 shadow-2xl group hover:shadow-3xl transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-cyan-500/5 to-indigo-500/10"></div>
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-bl-[3rem] group-hover:scale-110 transition-transform duration-300"></div>
            <CardHeader className="pb-3 relative">
              <CardTitle className="text-sm font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <Terminal className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                Active Drawers
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-3xl font-bold text-blue-800 dark:text-blue-200">{stats.activeDrawers}</span>
                <span className="text-xl text-slate-500 dark:text-slate-400">/{stats.totalDrawers}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs font-medium text-blue-600 dark:text-blue-400">Online</span>
                </div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 mt-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${(stats.activeDrawers / stats.totalDrawers) * 100}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-0 shadow-2xl group hover:shadow-3xl transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-violet-500/5 to-indigo-500/10"></div>
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-500/20 to-violet-500/20 rounded-bl-[3rem] group-hover:scale-110 transition-transform duration-300"></div>
            <CardHeader className="pb-3 relative">
              <CardTitle className="text-sm font-semibold text-purple-700 dark:text-purple-300 flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                  <BarChart3 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
                Avg Balance
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold text-purple-800 dark:text-purple-200 mb-2">
                {formatCurrency(stats.averageBalance)}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Activity className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                  <span className="text-xs font-medium text-purple-600 dark:text-purple-400">Per Drawer</span>
                </div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Calculated average</p>
            </CardContent>
          </Card>

          <Card className={cn(
            "relative overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-0 shadow-2xl group hover:shadow-3xl transition-all duration-300",
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
                "text-sm font-semibold flex items-center gap-2",
                Math.abs(stats.totalVariance) > 10 ? "text-red-700 dark:text-red-300" : "text-amber-700 dark:text-amber-300"
              )}>
                <div className={cn(
                  "p-1.5 rounded-lg",
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
                "text-3xl font-bold mb-2",
                Math.abs(stats.totalVariance) > 10 ? "text-red-800 dark:text-red-200" : "text-amber-800 dark:text-amber-200"
              )}>
                {formatCurrency(Math.abs(stats.totalVariance))}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {stats.totalVariance >= 0 ? (
                    <>
                      <TrendingUp className="w-3 h-3 text-green-600 dark:text-green-400" />
                      <span className="text-xs font-medium text-green-600 dark:text-green-400">Overage</span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="w-3 h-3 text-red-600 dark:text-red-400" />
                      <span className="text-xs font-medium text-red-600 dark:text-red-400">Shortage</span>
                    </>
                  )}
                </div>
                <div className={cn(
                  "w-2 h-2 rounded-full animate-pulse",
                  stats.totalVariance >= 0 ? "bg-green-500" : "bg-red-500"
                )}></div>
              </div>
              <div className={cn(
                "w-full rounded-full h-1.5 mt-2",
                Math.abs(stats.totalVariance) > 10 ? "bg-red-200 dark:bg-red-800" : "bg-amber-200 dark:bg-amber-800"
              )}>
                <div
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-500",
                    Math.abs(stats.totalVariance) > 10
                      ? "bg-gradient-to-r from-red-500 to-rose-500"
                      : "bg-gradient-to-r from-amber-500 to-orange-500"
                  )}
                  style={{ width: `${Math.min((Math.abs(stats.totalVariance) / 50) * 100, 100)}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-0 shadow-2xl group hover:shadow-3xl transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-blue-500/5 to-cyan-500/10"></div>
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500/20 to-blue-500/20 rounded-bl-[3rem] group-hover:scale-110 transition-transform duration-300"></div>
            <CardHeader className="pb-3 relative">
              <CardTitle className="text-sm font-semibold text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                  <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                Today's Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold text-indigo-800 dark:text-indigo-200 mb-2">
                {analyticsData?.summary?.totalTransactions || 0}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <History className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">Transactions</span>
                </div>
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Real-time count</p>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <div className="relative">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl shadow-2xl border-0 rounded-2xl p-2 gap-2">
              <TabsTrigger
                value="overview"
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-white data-[state=active]:shadow-xl rounded-xl transition-all duration-300 hover:scale-105"
              >
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger
                value="operations"
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white data-[state=active]:shadow-xl rounded-xl transition-all duration-300 hover:scale-105"
              >
                <DollarSign className="w-4 h-4" />
                <span className="hidden sm:inline">Operations</span>
              </TabsTrigger>
              <TabsTrigger
                value="reconciliation"
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-violet-500 data-[state=active]:text-white data-[state=active]:shadow-xl rounded-xl transition-all duration-300 hover:scale-105"
              >
                <Calculator className="w-4 h-4" />
                <span className="hidden sm:inline">Reconcile</span>
              </TabsTrigger>
              <TabsTrigger
                value="reports"
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white data-[state=active]:shadow-xl rounded-xl transition-all duration-300 hover:scale-105"
              >
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">Reports</span>
              </TabsTrigger>
            </TabsList>
            <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500/20 via-blue-500/10 to-purple-500/20 rounded-3xl -z-10 opacity-60 blur-xl"></div>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Drawer Selection */}
              <div className="relative group">
                <Card className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-blue-500/10"></div>
                  <CardHeader className="relative">
                    <CardTitle className="flex items-center gap-3 text-slate-800 dark:text-white">
                      <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg">
                        <Target className="w-5 h-5 text-white" />
                      </div>
                      <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent font-bold">
                        Select Drawer
                      </span>
                    </CardTitle>
                    <CardDescription className="text-slate-600 dark:text-slate-400">
                      Choose a cash drawer to manage and monitor
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="relative space-y-6">
                    <Select value={selectedDrawerId} onValueChange={setSelectedDrawerId}>
                      <SelectTrigger className="w-full h-12 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-emerald-200/50 dark:border-emerald-400/20 focus:border-emerald-400 dark:focus:border-emerald-400 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
                        <SelectValue placeholder="Select a cash drawer" />
                      </SelectTrigger>
                      <SelectContent className="backdrop-blur-xl bg-white/95 dark:bg-slate-900/95 border-emerald-200/50 dark:border-emerald-400/20">
                        {drawers?.map((drawer) => (
                          <SelectItem key={drawer.id} value={drawer.id} className="focus:bg-emerald-50/80 dark:focus:bg-emerald-900/30">
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "w-3 h-3 rounded-full shadow-lg",
                                drawer.isOpen
                                  ? "bg-gradient-to-r from-green-400 to-emerald-500 shadow-green-500/30"
                                  : "bg-gradient-to-r from-slate-400 to-slate-500 shadow-slate-500/30"
                              )} />
                              <div className="flex flex-col">
                                <span className="font-semibold text-slate-800 dark:text-white">{drawer.name}</span>
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
                        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500 rounded-2xl blur-sm opacity-25 group-hover:opacity-40 transition-opacity duration-500"></div>
                        <div className="relative p-6 bg-gradient-to-br from-emerald-50/90 via-teal-50/90 to-blue-50/90 dark:from-emerald-950/50 dark:via-teal-950/50 dark:to-blue-950/50 backdrop-blur-sm rounded-2xl border border-emerald-200/50 dark:border-emerald-400/20">
                          <div className="space-y-4">
                            <div className="flex justify-between items-center group/item">
                              <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300 group-hover/item:text-emerald-800 dark:group-hover/item:text-emerald-200 transition-colors">
                                Current Balance:
                              </span>
                              <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                                {formatCurrency(selectedDrawer.currentBalance)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center group/item">
                              <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300 group-hover/item:text-emerald-800 dark:group-hover/item:text-emerald-200 transition-colors">
                                Expected Balance:
                              </span>
                              <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                                {formatCurrency(selectedDrawer.expectedBalance)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center group/item">
                              <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300 group-hover/item:text-emerald-800 dark:group-hover/item:text-emerald-200 transition-colors">
                                Variance:
                              </span>
                              <span className={cn(
                                "text-sm font-bold px-2 py-1 rounded-lg",
                                selectedDrawer.variance === 0
                                  ? "text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/30"
                                  : selectedDrawer.variance > 0
                                    ? "text-orange-700 bg-orange-100 dark:text-orange-300 dark:bg-orange-900/30"
                                    : "text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900/30"
                              )}>
                                {selectedDrawer.variance >= 0 ? "+" : ""}{formatCurrency(selectedDrawer.variance)}
                              </span>
                            </div>
                            <div className="h-px bg-gradient-to-r from-transparent via-emerald-300/50 to-transparent my-4"></div>
                            <div className="flex items-center justify-between">
                              <Badge
                                variant={selectedDrawer.isOpen ? "default" : "secondary"}
                                className={cn(
                                  "px-3 py-1 font-semibold shadow-lg",
                                  selectedDrawer.isOpen
                                    ? "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-green-500/30"
                                    : "bg-gradient-to-r from-slate-400 to-slate-500 hover:from-slate-500 hover:to-slate-600 shadow-slate-500/30"
                                )}
                              >
                                {selectedDrawer.isOpen ? "🟢 Open" : "🔴 Closed"}
                              </Badge>
                              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-100/50 dark:bg-emerald-900/30 px-2 py-1 rounded-lg">
                                {selectedDrawer.todayTransactions} transactions today
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <div className="relative group">
                <Card className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-emerald-500/10"></div>
                  <CardHeader className="relative">
                    <CardTitle className="flex items-center gap-3 text-slate-800 dark:text-white">
                      <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                        <Zap className="w-5 h-5 text-white" />
                      </div>
                      <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-bold">
                        Quick Actions
                      </span>
                    </CardTitle>
                    <CardDescription className="text-slate-600 dark:text-slate-400">
                      Perform common cash drawer operations
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="relative space-y-4">
                    <Button
                      className="w-full justify-start h-12 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                      disabled={!selectedDrawerId}
                      onClick={() => {
                        setOperationType("add")
                        setOperationDialogOpen(true)
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-white/20 rounded-lg">
                          <Plus className="w-4 h-4" />
                        </div>
                        <span>Add Cash</span>
                      </div>
                    </Button>
                    <Button
                      className="w-full justify-start h-12 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                      disabled={!selectedDrawerId}
                      onClick={() => {
                        setOperationType("remove")
                        setOperationDialogOpen(true)
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-white/20 rounded-lg">
                          <Minus className="w-4 h-4" />
                        </div>
                        <span>Remove Cash</span>
                      </div>
                    </Button>
                    <Button
                      className="w-full justify-start h-12 bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                      disabled={!selectedDrawerId}
                      onClick={() => setReconcileDialogOpen(true)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-white/20 rounded-lg">
                          <Calculator className="w-4 h-4" />
                        </div>
                        <span>Reconcile</span>
                      </div>
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start h-12 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200/50 dark:border-slate-400/20 hover:bg-slate-50/80 dark:hover:bg-slate-700/80 hover:border-slate-300/50 dark:hover:border-slate-300/30 shadow-sm hover:shadow-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-slate-700 dark:text-slate-300"
                      disabled={!selectedDrawerId}
                      onClick={() => setActiveTab("reports")}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-slate-100/80 dark:bg-slate-700/80 rounded-lg">
                          <FileText className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                        </div>
                        <span>View Report</span>
                      </div>
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <div className="relative group">
                <Card className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-yellow-500/10"></div>
                  <CardHeader className="relative">
                    <CardTitle className="flex items-center gap-3 text-slate-800 dark:text-white">
                      <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl shadow-lg">
                        <History className="w-5 h-5 text-white" />
                      </div>
                      <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent font-bold">
                        Recent Activity
                      </span>
                    </CardTitle>
                    <CardDescription className="text-slate-600 dark:text-slate-400">
                      Latest transactions across all drawers
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="relative">
                    <ScrollArea className="h-80">
                      <div className="space-y-3">
                        {transactionsData && transactionsData.data?.transactions?.slice(0, 5).map((transaction, index) => (
                          <div
                            key={transaction.id}
                            className="group/item relative overflow-hidden rounded-xl border border-slate-200/50 dark:border-slate-700/50 hover:border-slate-300/50 dark:hover:border-slate-600/50 transition-all duration-300"
                            style={{ animationDelay: `${index * 100}ms` }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-white/80 via-slate-50/50 to-white/80 dark:from-slate-800/80 dark:via-slate-700/50 dark:to-slate-800/80 backdrop-blur-sm"></div>
                            <div className="relative flex items-center justify-between p-4">
                              <div className="flex items-center gap-4">
                                <div className={cn(
                                  "p-2.5 rounded-xl shadow-lg transition-all duration-300 group-hover/item:scale-110",
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
                                  <p className="text-sm font-semibold text-slate-800 dark:text-white group-hover/item:text-slate-900 dark:group-hover/item:text-slate-100 transition-colors">
                                    {transaction.reason}
                                  </p>
                                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100/80 dark:bg-slate-800/80 px-2 py-1 rounded-lg">
                                    {format(new Date(transaction.createdAt), "MMM dd, HH:mm")}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className={cn(
                                  "text-sm font-bold px-3 py-1.5 rounded-lg shadow-sm",
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
                            <p className="text-slate-500 dark:text-slate-400 font-medium">No recent activity</p>
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Transactions will appear here</p>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Operations Tab */}
          <TabsContent value="operations" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* All Drawers Overview */}
              <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-blue-600" />
                    All Cash Drawers
                  </CardTitle>
                  <CardDescription>Monitor and manage all cash drawers</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {drawers?.map((drawer) => (
                      <div
                        key={drawer.id}
                        className={cn(
                          "p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:shadow-md",
                          selectedDrawerId === drawer.id
                            ? "border-emerald-500 bg-gradient-to-r from-emerald-50 to-teal-50"
                            : "border-slate-200 bg-white hover:border-emerald-300"
                        )}
                        onClick={() => setSelectedDrawerId(drawer.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-3 h-3 rounded-full",
                              drawer.isOpen ? "bg-green-500 animate-pulse" : "bg-gray-400"
                            )} />
                            <div>
                              <h4 className="font-semibold text-slate-900">{drawer.name}</h4>
                              <p className="text-sm text-slate-600">{drawer.drawerNumber}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-lg text-slate-900">
                              {formatCurrency(drawer.currentBalance)}
                            </div>
                            <div className={cn(
                              "text-sm font-medium",
                              drawer.variance === 0
                                ? "text-green-600"
                                : drawer.variance > 0
                                  ? "text-orange-600"
                                  : "text-red-600"
                            )}>
                              {drawer.variance >= 0 ? "+" : ""}{formatCurrency(drawer.variance)} var
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center justify-between text-sm">
                          <Badge variant={drawer.isOpen ? "default" : "secondary"}>
                            {drawer.isOpen ? "Active" : "Inactive"}
                          </Badge>
                          <span className="text-slate-600">
                            {drawer.todayTransactions} transactions
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Transaction History */}
              <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="w-5 h-5 text-purple-600" />
                    Transaction History
                    {selectedDrawer && (
                      <Badge variant="outline" className="ml-2">
                        {selectedDrawer.name}
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    Recent transactions for the selected drawer
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    <div className="space-y-3">
                      {transactionsData?.success && transactionsData.data?.transactions?.map((transaction) => (
                        <div key={transaction.id} className="p-4 bg-slate-50 rounded-lg">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <div className={cn(
                                "p-2 rounded-full mt-1",
                                transaction.type === "CASH_IN" || transaction.type === "SALE"
                                  ? "bg-green-100 text-green-600"
                                  : transaction.type === "RECONCILIATION"
                                    ? "bg-blue-100 text-blue-600"
                                    : "bg-red-100 text-red-600"
                              )}>
                                {transaction.type === "CASH_IN" || transaction.type === "SALE" ? (
                                  <Plus className="w-4 h-4" />
                                ) : transaction.type === "RECONCILIATION" ? (
                                  <Calculator className="w-4 h-4" />
                                ) : (
                                  <Minus className="w-4 h-4" />
                                )}
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-slate-900">{transaction.reason}</p>
                                <p className="text-sm text-slate-600">{transaction.type.replace(/_/g, " ").toLowerCase()}</p>
                                {transaction.notes && (
                                  <p className="text-xs text-slate-500 mt-1">{transaction.notes}</p>
                                )}
                                <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                                  <span>{format(new Date(transaction.createdAt), "MMM dd, yyyy HH:mm")}</span>
                                  <span>
                                    {transaction.user.firstName || transaction.user.lastName || "System"}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right ml-4">
                              <p className={cn(
                                "text-lg font-bold",
                                transaction.type === "CASH_IN" || transaction.type === "SALE"
                                  ? "text-green-600"
                                  : transaction.type === "RECONCILIATION"
                                    ? "text-blue-600"
                                    : "text-red-600"
                              )}>
                                {transaction.type === "CASH_IN" || transaction.type === "SALE" ? "+" :
                                  transaction.type === "RECONCILIATION" ? "=" : "-"}
                                {formatCurrency(transaction.amount)}
                              </p>
                              <p className="text-sm text-slate-500">
                                Bal: {formatCurrency(transaction.balanceAfter)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                      {!transactionsData && (
                        <div className="text-center py-12 text-muted-foreground">
                          <History className="w-16 h-16 mx-auto mb-4 opacity-50" />
                          <p className="text-lg font-medium">No transactions found</p>
                          <p className="text-sm">Select a drawer to view its transaction history</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Reconciliation Tab */}
          <TabsContent value="reconciliation" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Reconciliation Form */}
              <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-purple-600" />
                    Cash Count & Reconciliation
                  </CardTitle>
                  <CardDescription>
                    Verify physical cash against system records
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedDrawer ? (
                    <div className="space-y-6">
                      {/* Current Status */}
                      <div className="p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl border border-purple-200">
                        <h4 className="font-semibold text-purple-800 mb-3">Current Status</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-purple-600">System Balance:</span>
                            <div className="font-bold text-purple-800">
                              {formatCurrency(selectedDrawer.currentBalance)}
                            </div>
                          </div>
                          <div>
                            <span className="text-purple-600">Expected Balance:</span>
                            <div className="font-bold text-purple-800">
                              {formatCurrency(selectedDrawer.expectedBalance)}
                            </div>
                          </div>
                          <div className="col-span-2">
                            <span className="text-purple-600">Current Variance:</span>
                            <div className={cn(
                              "font-bold text-lg",
                              selectedDrawer.variance === 0
                                ? "text-green-600"
                                : "text-orange-600"
                            )}>
                              {selectedDrawer.variance >= 0 ? "+" : ""}{formatCurrency(selectedDrawer.variance)}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Reconciliation Form */}
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

                          {/* Variance Preview */}
                          {reconciliationForm.watch("countedAmount") > 0 && (
                            <div className="p-3 bg-slate-50 rounded-lg">
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">Variance:</span>
                                <span className={cn(
                                  "font-bold",
                                  (reconciliationForm.watch("countedAmount") - selectedDrawer.currentBalance) === 0
                                    ? "text-green-600"
                                    : "text-orange-600"
                                )}>
                                  {(reconciliationForm.watch("countedAmount") - selectedDrawer.currentBalance) >= 0 ? "+" : ""}
                                  {formatCurrency(reconciliationForm.watch("countedAmount") - selectedDrawer.currentBalance)}
                                </span>
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
                                    placeholder="Add notes about the reconciliation..."
                                    className="resize-none"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700"
                            disabled={reconcileMutation.isPending}
                          >
                            {reconcileMutation.isPending ? (
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                <span>Reconciling...</span>
                              </div>
                            ) : (
                              <>
                                <Calculator className="w-4 h-4 mr-2" />
                                Reconcile Cash Drawer
                              </>
                            )}
                          </Button>
                        </form>
                      </Form>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Calculator className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">Select a cash drawer</p>
                      <p className="text-sm">Choose a drawer to perform reconciliation</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Variance Analysis */}
              <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-orange-600" />
                    Variance Analysis
                  </CardTitle>
                  <CardDescription>
                    Track variance patterns and trends
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {drawers?.map((drawer) => (
                      <div key={drawer.id} className="p-4 bg-slate-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{drawer.name}</h4>
                          <Badge
                            variant={
                              Math.abs(drawer.variance) === 0
                                ? "default"
                                : Math.abs(drawer.variance) < 10
                                  ? "secondary"
                                  : "destructive"
                            }
                          >
                            {Math.abs(drawer.variance) === 0
                              ? "Perfect"
                              : Math.abs(drawer.variance) < 10
                                ? "Minor"
                                : "Alert"}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">Variance:</span>
                          <span className={cn(
                            "font-bold",
                            drawer.variance === 0
                              ? "text-green-600"
                              : drawer.variance > 0
                                ? "text-orange-600"
                                : "text-red-600"
                          )}>
                            {drawer.variance >= 0 ? "+" : ""}{formatCurrency(drawer.variance)}
                          </span>
                        </div>
                        {Math.abs(drawer.variance) > 0 && (
                          <div className="mt-2">
                            <div className="w-full bg-slate-200 rounded-full h-2">
                              <div
                                className={cn(
                                  "h-2 rounded-full",
                                  drawer.variance > 0 ? "bg-orange-400" : "bg-red-400"
                                )}
                                style={{
                                  width: `${Math.min((Math.abs(drawer.variance) / 50) * 100, 100)}%`
                                }}
                              />
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                              {drawer.variance > 0 ? "Overage" : "Shortage"}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Date Range Selector */}
              <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-indigo-600" />
                    Report Filters
                  </CardTitle>
                  <CardDescription>Select date range and options</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="justify-start">
                          <CalendarDays className="w-4 h-4 mr-2" />
                          {format(dateRange.start, "MMM dd")}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={dateRange.start}
                          onSelect={(date) => date && setDateRange(prev => ({ ...prev, start: startOfDay(date) }))}
                        />
                      </PopoverContent>
                    </Popover>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="justify-start">
                          <CalendarDays className="w-4 h-4 mr-2" />
                          {format(dateRange.end, "MMM dd")}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={dateRange.end}
                          onSelect={(date) => date && setDateRange(prev => ({ ...prev, end: endOfDay(date) }))}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => setDateRange({
                        start: startOfDay(new Date()),
                        end: endOfDay(new Date())
                      })}
                    >
                      Today
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => setDateRange({
                        start: startOfDay(subDays(new Date(), 7)),
                        end: endOfDay(new Date())
                      })}
                    >
                      Last 7 Days
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => setDateRange({
                        start: startOfDay(subDays(new Date(), 30)),
                        end: endOfDay(new Date())
                      })}
                    >
                      Last 30 Days
                    </Button>
                  </div>

                  <Button className="w-full bg-gradient-to-r from-indigo-600 to-blue-600">
                    <Download className="w-4 h-4 mr-2" />
                    Export Report
                  </Button>
                </CardContent>
              </Card>

              {/* Report Summary */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-green-600" />
                      Report Summary
                      <Badge variant="outline">
                        {format(dateRange.start, "MMM dd")} - {format(dateRange.end, "MMM dd")}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {analyticsData?.summary ? (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">
                            {formatCurrency(analyticsData.summary.totalSales)}
                          </div>
                          <div className="text-sm text-green-700">Total Sales</div>
                        </div>
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">
                            {analyticsData.summary.totalTransactions}
                          </div>
                          <div className="text-sm text-blue-700">Transactions</div>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                          <div className="text-2xl font-bold text-purple-600">
                            {formatCurrency(analyticsData.summary.totalCashFlow)}
                          </div>
                          <div className="text-sm text-purple-700">Net Cash Flow</div>
                        </div>
                        <div className="text-center p-4 bg-orange-50 rounded-lg">
                          <div className="text-2xl font-bold text-orange-600">
                            {formatCurrency(analyticsData.summary.totalVariance)}
                          </div>
                          <div className="text-sm text-orange-700">Total Variance</div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p>Loading report data...</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Detailed Reports */}
                {reportData?.success && reportData.data && (
                  <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="w-5 h-5 text-blue-600" />
                        Detailed Report - {reportData.data.drawerName}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {/* Summary Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="p-3 bg-slate-50 rounded-lg">
                            <div className="text-lg font-bold">{formatCurrency(reportData.data.openingBalance)}</div>
                            <div className="text-sm text-slate-600">Opening</div>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-lg">
                            <div className="text-lg font-bold">{formatCurrency(reportData.data.closingBalance)}</div>
                            <div className="text-sm text-slate-600">Closing</div>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-lg">
                            <div className="text-lg font-bold">{formatCurrency(reportData.data.netCashFlow)}</div>
                            <div className="text-sm text-slate-600">Net Flow</div>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-lg">
                            <div className={cn(
                              "text-lg font-bold",
                              reportData.data.variance === 0 ? "text-green-600" : "text-orange-600"
                            )}>
                              {formatCurrency(reportData.data.variance)}
                            </div>
                            <div className="text-sm text-slate-600">Variance</div>
                          </div>
                        </div>

                        {/* Transaction Breakdown */}
                        <div>
                          <h4 className="font-semibold mb-3">Transaction Breakdown</h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex justify-between">
                              <span>Cash In:</span>
                              <span className="font-medium text-green-600">
                                +{formatCurrency(reportData.data.totalCashIn)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Cash Out:</span>
                              <span className="font-medium text-red-600">
                                -{formatCurrency(reportData.data.totalCashOut)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Sales:</span>
                              <span className="font-medium text-blue-600">
                                +{formatCurrency(reportData.data.totalSales)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Returns:</span>
                              <span className="font-medium text-orange-600">
                                -{formatCurrency(reportData.data.totalReturns)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Cash Operation Dialog */}
      <Dialog open={operationDialogOpen} onOpenChange={setOperationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
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
              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Current Balance:</span>
                  <span className="font-bold">{formatCurrency(selectedDrawer.currentBalance)}</span>
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
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">New Balance:</span>
                        <span className="font-bold text-blue-600">
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
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-red-600 hover:bg-red-700"
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

      {/* Reconciliation Dialog */}
      <Dialog open={reconcileDialogOpen} onOpenChange={setReconcileDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reconcile Cash Drawer</DialogTitle>
            <DialogDescription>
              Count the physical cash and reconcile with the system balance
            </DialogDescription>
          </DialogHeader>
          {selectedDrawer && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <div className="text-sm text-slate-600">System Balance:</div>
                  <div className="font-bold">{formatCurrency(selectedDrawer.currentBalance)}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <div className="text-sm text-slate-600">Expected Balance:</div>
                  <div className="font-bold">{formatCurrency(selectedDrawer.expectedBalance)}</div>
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

                  {/* Variance display */}
                  {reconciliationForm.watch("countedAmount") > 0 && (
                    <div className="p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg border border-purple-200">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Physical Count:</span>
                          <span className="font-medium">{formatCurrency(reconciliationForm.watch("countedAmount"))}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">System Balance:</span>
                          <span className="font-medium">{formatCurrency(selectedDrawer.currentBalance)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between">
                          <span className="font-medium">Variance:</span>
                          <span className={cn(
                            "font-bold text-lg",
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
                          <div className="text-sm text-center text-purple-700 font-medium">
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