"use client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useInventoryIntegration } from "@/hooks/purchaseOrderWorkflowHooks/useInventoryIntegration"
import {
  type PurchaseOrderStatus,
  usePurchaseOrderWorkflow,
} from "@/hooks/purchaseOrderWorkflowHooks/usePurchaseOrderWorkflow"
import { formatCurrency } from "@/lib/formatCurrency"
import { cn } from "@/lib/utils"
import {
  Activity,
  AlertTriangle,
  Building2,
  Calculator,
  CheckCircle,
  Clock,
  CreditCard,
  DollarSign,
  FileText,
  History,
  Mail,
  MapPin,
  Package,
  Package2,
  Phone,
  Send,
  Sparkles,
  TrendingUp,
  Truck,
  User,
  XCircle,
  Zap,
} from "lucide-react"
import { useState } from "react"
import { PurchaseOrderStatusBadge } from "./PurchaseOrderStatusBadge"

const STATUS_CONFIG = {
  DRAFT: {
    icon: FileText,
    color: "bg-slate-500 dark:bg-slate-600",
    label: "Draft",
    gradient: "from-slate-500 to-slate-600",
    bgColor: "bg-slate-50 dark:bg-slate-800/30",
    ringColor: "ring-slate-200 dark:ring-slate-700",
  },
  SUBMITTED: {
    icon: Send,
    color: "bg-blue-500 dark:bg-blue-600",
    label: "Submitted",
    gradient: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
    ringColor: "ring-blue-200 dark:ring-blue-800",
  },
  APPROVED: {
    icon: CheckCircle,
    color: "bg-emerald-500 dark:bg-emerald-600",
    label: "Approved",
    gradient: "from-emerald-500 to-teal-500",
    bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
    ringColor: "ring-emerald-200 dark:ring-emerald-800",
  },
  PARTIALLY_RECEIVED: {
    icon: Package,
    color: "bg-amber-500 dark:bg-amber-600",
    label: "Partially Received",
    gradient: "from-amber-500 to-orange-500",
    bgColor: "bg-amber-50 dark:bg-amber-900/20",
    ringColor: "ring-amber-200 dark:ring-amber-800",
  },
  RECEIVED: {
    icon: Package,
    color: "bg-teal-500 dark:bg-teal-600",
    label: "Received",
    gradient: "from-teal-500 to-emerald-500",
    bgColor: "bg-teal-50 dark:bg-teal-900/20",
    ringColor: "ring-teal-200 dark:ring-teal-800",
  },
  COMPLETED: {
    icon: Sparkles,
    color: "bg-emerald-600 dark:bg-emerald-700",
    label: "Completed",
    gradient: "from-emerald-600 to-teal-600",
    bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
    ringColor: "ring-emerald-200 dark:ring-emerald-800",
  },
  CANCELLED: {
    icon: XCircle,
    color: "bg-red-500 dark:bg-red-600",
    label: "Cancelled",
    gradient: "from-red-500 to-red-600",
    bgColor: "bg-red-50 dark:bg-red-900/20",
    ringColor: "ring-red-200 dark:ring-red-800",
  },
}

interface PurchaseOrderWorkflowPanelProps {
  purchaseOrderId: string
  organizationId?: string
  currentUserId?: string
}

export function PurchaseOrderWorkflowPanelModern({
  purchaseOrderId,
  organizationId,
  currentUserId,
}: PurchaseOrderWorkflowPanelProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedAction, setSelectedAction] = useState<string | null>(null)
  const [reason, setReason] = useState("")
  const [receiveQuantities, setReceiveQuantities] = useState<Record<string, number>>({})
  const [activeTab, setActiveTab] = useState("overview")

  const workflow = usePurchaseOrderWorkflow(purchaseOrderId, organizationId, currentUserId)
  const inventory = useInventoryIntegration(organizationId)

  const handleActionClick = (actionId: string) => {
    const action = workflow.availableActions.find((a) => a.id === actionId)

    if (action?.requiresConfirmation || action?.requiresInput) {
      setSelectedAction(actionId)
      setDialogOpen(true)
    } else {
      executeAction(actionId)
    }
  }

  const executeAction = async (actionId: string) => {
    try {
      let params: any = {}

      switch (actionId) {
        case "approve":
          params = { approvedById: currentUserId }
          break
        case "cancel":
          params = { reason }
          break
        case "receive":
          const lines = Object.entries(receiveQuantities)
            .filter(([_, quantity]) => quantity > 0)
            .map(([lineId, quantity]) => ({ lineId, quantity }))
          params = { lines }
          break
      }

      await workflow.executeAction(actionId, params)
      setDialogOpen(false)
      setSelectedAction(null)
      setReason("")
      setReceiveQuantities({})
    } catch (error) {
      console.error("Action failed:", error)
    }
  }

  const renderActionDialog = () => {
    const action = workflow.availableActions.find((a) => a.id === selectedAction)
    if (!action) return null

    return (
      <DialogContent className="sm:max-w-[600px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-0 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-slate-50/50 to-blue-50/30 dark:from-slate-900/80 dark:via-slate-800/50 dark:to-slate-700/30 rounded-lg"></div>

        <DialogHeader className="relative z-10 pb-6 border-b border-slate-200/60 dark:border-slate-700/60">
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent font-semibold">
              {action.label}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 relative z-10 py-6">
          {action.requiresInput && selectedAction === "cancel" && (
            <div className="space-y-4">
              <Label htmlFor="reason" className="text-base font-semibold text-slate-900 dark:text-white">
                Cancellation Reason
              </Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Please provide a detailed reason for cancellation..."
                className="min-h-[120px] resize-none bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          )}

          {selectedAction === "receive" && workflow.purchaseOrder?.lines && (
            <div className="space-y-4">
              <Label className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Package className="h-4 w-4 text-teal-600" />
                Receive Quantities
              </Label>
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {workflow.purchaseOrder.lines.map((line: any) => {
                  const remainingQty = line.quantity - (line.receivedQuantity || 0)
                  const inventoryLevel = inventory.getInventoryLevel(
                    line.itemId,
                    workflow.purchaseOrder?.locationId || "",
                  )

                  return (
                    <div
                      key={line.id}
                      className="group flex items-center justify-between p-5 rounded-xl border border-slate-200/60 dark:border-slate-700/60 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all duration-200"
                    >
                      <div className="flex-1 space-y-2">
                        <p className="font-semibold text-slate-900 dark:text-white text-base">
                          {line.item?.name || "Unknown Item"}
                        </p>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div className="space-y-1">
                            <span className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wide">
                              Ordered
                            </span>
                            <div className="font-semibold text-slate-900 dark:text-white">{line.quantity}</div>
                          </div>
                          <div className="space-y-1">
                            <span className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wide">
                              Received
                            </span>
                            <div className="font-semibold text-emerald-600 dark:text-emerald-400">
                              {line.receivedQuantity || 0}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <span className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wide">
                              Remaining
                            </span>
                            <div className="font-semibold text-blue-600 dark:text-blue-400">{remainingQty}</div>
                          </div>
                        </div>
                        {inventoryLevel && (
                          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-100/50 dark:bg-slate-700/50 px-2 py-1 rounded-md">
                            <Activity className="h-3 w-3" />
                            Current Stock:{" "}
                            <span className="font-medium text-slate-700 dark:text-slate-300">
                              {inventoryLevel.quantityOnHand}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="ml-6">
                        <Input
                          type="number"
                          min="0"
                          max={remainingQty}
                          value={receiveQuantities[line.id] || 0}
                          onChange={(e) =>
                            setReceiveQuantities((prev) => ({
                              ...prev,
                              [line.id]: Number.parseInt(e.target.value) || 0,
                            }))
                          }
                          className="w-20 text-center font-semibold bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-200/60 dark:border-slate-700/60">
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              className="bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
            >
              Cancel
            </Button>
            <Button
              onClick={() => executeAction(selectedAction!)}
              disabled={workflow.isProcessing}
              className={cn(
                "shadow-lg hover:shadow-xl transition-all duration-200 font-semibold",
                action.variant === "destructive"
                  ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
                  : "bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white",
              )}
            >
              {workflow.isProcessing ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  {action.label}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    )
  }

  if (workflow.isLoading) {
    return (
      <Card className="relative overflow-hidden bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-0 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50/80 via-blue-50/40 to-teal-50/30 dark:from-slate-800/80 dark:via-slate-700/40 dark:to-slate-600/30"></div>
        <div className="relative z-10 p-8 space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="w-12 h-12 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-2 w-full" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-28" />
            <Skeleton className="h-10 w-20" />
          </div>
        </div>
      </Card>
    )
  }

  const status = workflow.purchaseOrder?.status as PurchaseOrderStatus
  const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG.DRAFT
  const StatusIcon = statusConfig.icon

  // Calculate progress
  const statusOrder = Object.keys(STATUS_CONFIG)
  const currentIndex = statusOrder.indexOf(status)
  const progressPercentage = currentIndex >= 0 ? ((currentIndex + 1) / statusOrder.length) * 100 : 0

  const orderStats = {
    totalItems: workflow.purchaseOrder?.lines?.length || 0,
    totalQuantity: workflow.purchaseOrder?.lines?.reduce((sum: number, line: any) => sum + line.quantity, 0) || 0,
    totalReceived:
      workflow.purchaseOrder?.lines?.reduce((sum: number, line: any) => sum + (line.receivedQuantity || 0), 0) || 0,
    subtotal:
      workflow.purchaseOrder?.lines?.reduce((sum: number, line: any) => sum + line.quantity * line.unitPrice, 0) || 0,
    taxAmount: workflow.purchaseOrder?.taxAmount || 0,
    shippingCost: workflow.purchaseOrder?.shippingCost || 0,
    totalAmount: workflow.purchaseOrder?.total || 0,
  }

  return (
    <Card className="relative overflow-hidden bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-0 shadow-2xl">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50/80 via-blue-50/40 to-teal-50/30 dark:from-slate-800/80 dark:via-slate-700/40 dark:to-slate-600/30"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_50%)] dark:bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.05),transparent_50%)]"></div>

      <CardHeader className="relative z-10 bg-gradient-to-r from-white/60 to-slate-50/40 dark:from-slate-800/60 dark:to-slate-700/40 backdrop-blur-sm border-b border-slate-200/60 dark:border-slate-700/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 shadow-lg ring-4 ring-teal-500/20">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                Purchase Order Details
              </CardTitle>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 font-medium">
                {workflow.purchaseOrder?.orderNumber || "Loading..."} •{" "}
                {workflow.purchaseOrder?.supplier?.name || "N/A"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <PurchaseOrderStatusBadge status={status} variant="professional" size="lg" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 relative z-10">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-slate-100/60 dark:bg-slate-800/60 backdrop-blur-sm border-b border-slate-200/60 dark:border-slate-700/60 rounded-none h-14">
            <TabsTrigger
              value="overview"
              className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm"
            >
              <Activity className="w-4 h-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger
              value="items"
              className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm"
            >
              <Package2 className="w-4 h-4" />
              <span className="hidden sm:inline">Line Items</span>
            </TabsTrigger>
            <TabsTrigger
              value="financials"
              className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm"
            >
              <Calculator className="w-4 h-4" />
              <span className="hidden sm:inline">Financials</span>
            </TabsTrigger>
            <TabsTrigger
              value="supplier"
              className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm"
            >
              <Building2 className="w-4 h-4" />
              <span className="hidden sm:inline">Supplier</span>
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm"
            >
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">History</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="p-8 space-y-8">
            {/* Workflow Progress */}
            {status !== "CANCELLED" && status !== "COMPLETED" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Truck className="h-4 w-4 text-teal-600" />
                    Workflow Progress
                  </span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-md">
                    {Math.round(progressPercentage)}%
                  </span>
                </div>
                <Progress
                  value={progressPercentage}
                  className="h-3 bg-slate-200/60 dark:bg-slate-700/60 rounded-full overflow-hidden"
                />
              </div>
            )}

            {/* Progress Timeline */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600">
                  <Truck className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </div>
                <span className="text-base font-bold text-slate-900 dark:text-white">Progress Timeline</span>
              </div>

              <div className="relative">
                <div className="absolute top-5 left-5 right-5 h-0.5 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700"></div>

                <div className="flex items-center justify-between relative z-10">
                  {Object.entries(STATUS_CONFIG).map(([statusKey, config], index) => {
                    const isActive = statusKey === status
                    const isPast = statusOrder.indexOf(statusKey) < statusOrder.indexOf(status)
                    const Icon = config.icon

                    return (
                      <div key={statusKey} className="flex flex-col items-center gap-3 group">
                        <div
                          className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500 shadow-lg ring-4",
                            isActive
                              ? `bg-gradient-to-br ${config.gradient} text-white shadow-xl ring-blue-500/30 scale-110`
                              : isPast
                                ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg ring-emerald-500/20"
                                : "bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 shadow-md ring-slate-200/50 dark:ring-slate-700/50",
                          )}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="text-center">
                          <span
                            className={cn(
                              "text-xs font-semibold transition-colors block",
                              isActive
                                ? "text-slate-900 dark:text-white"
                                : isPast
                                  ? "text-emerald-700 dark:text-emerald-300"
                                  : "text-slate-500 dark:text-slate-400",
                            )}
                          >
                            {config.label}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Available Actions */}
            {workflow.availableActions.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30">
                    <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-base font-bold text-slate-900 dark:text-white">Available Actions</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {workflow.availableActions.map((action) => (
                    <Dialog
                      key={action.id}
                      open={dialogOpen && selectedAction === action.id}
                      onOpenChange={setDialogOpen}
                    >
                      <DialogTrigger asChild>
                        <Button
                          size="default"
                          disabled={action.disabled || workflow.isProcessing}
                          onClick={() => handleActionClick(action.id)}
                          className={cn(
                            "transition-all duration-300 shadow-lg hover:shadow-xl font-semibold px-6 py-3 rounded-xl",
                            action.variant === "destructive"
                              ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white ring-2 ring-red-500/20 hover:ring-red-500/40"
                              : action.variant === "default"
                                ? "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white ring-2 ring-emerald-500/20 hover:ring-emerald-500/40"
                                : "bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white ring-2 ring-blue-500/20 hover:ring-blue-500/40",
                          )}
                        >
                          {action.requiresConfirmation && <AlertTriangle className="h-4 w-4 mr-2" />}
                          {action.label}
                        </Button>
                      </DialogTrigger>
                      {renderActionDialog()}
                    </Dialog>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-4 rounded-xl border border-blue-200/40 dark:border-blue-800/40">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10 dark:bg-blue-400/10">
                    <Package2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                      Total Items
                    </p>
                    <p className="text-xl font-bold text-blue-900 dark:text-blue-100">{orderStats.totalItems}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 p-4 rounded-xl border border-emerald-200/40 dark:border-emerald-800/40">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10 dark:bg-emerald-400/10">
                    <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
                      Total Qty
                    </p>
                    <p className="text-xl font-bold text-emerald-900 dark:text-emerald-100">
                      {orderStats.totalQuantity}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-4 rounded-xl border border-amber-200/40 dark:border-amber-800/40">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/10 dark:bg-amber-400/10">
                    <Package className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wide">
                      Received
                    </p>
                    <p className="text-xl font-bold text-amber-900 dark:text-amber-100">{orderStats.totalReceived}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-xl border border-purple-200/40 dark:border-purple-800/40">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/10 dark:bg-purple-400/10">
                    <DollarSign className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-purple-600 dark:text-purple-400 uppercase tracking-wide">
                      Total Value
                    </p>
                    <p className="text-xl font-bold text-purple-900 dark:text-purple-100">
                      {formatCurrency(orderStats.totalAmount)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="items" className="p-8">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30">
                    <Package2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-base font-bold text-slate-900 dark:text-white">Order Line Items</span>
                </div>
                <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800">
                  {orderStats.totalItems} items
                </Badge>
              </div>

              {workflow.purchaseOrder?.lines && workflow.purchaseOrder.lines.length > 0 ? (
                <div className="space-y-4">
                  {workflow.purchaseOrder.lines.map((line: any, index: number) => {
                    const receivedPercentage =
                      line.quantity > 0 ? ((line.receivedQuantity || 0) / line.quantity) * 100 : 0
                    const lineTotal = line.quantity * line.unitPrice

                    return (
                      <div
                        key={line.id}
                        className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl border border-slate-200/60 dark:border-slate-700/60 p-6 hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-md">
                                #{index + 1}
                              </span>
                              <h3 className="font-bold text-slate-900 dark:text-white text-lg">
                                {line.item?.name || "Unknown Item"}
                              </h3>
                            </div>
                            {line.item?.description && (
                              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{line.item.description}</p>
                            )}
                            {line.item?.sku && (
                              <div className="flex items-center gap-2 mb-3">
                                <Badge variant="outline" className="text-xs">
                                  SKU: {line.item.sku}
                                </Badge>
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                              {formatCurrency(lineTotal)}
                            </p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              {formatCurrency(line.unitPrice)} × {line.quantity}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg">
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                              Ordered Qty
                            </p>
                            <p className="text-lg font-bold text-slate-900 dark:text-white">{line.quantity}</p>
                          </div>
                          <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg">
                            <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wide mb-1">
                              Received Qty
                            </p>
                            <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
                              {line.receivedQuantity || 0}
                            </p>
                          </div>
                          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                            <p className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-1">
                              Remaining
                            </p>
                            <p className="text-lg font-bold text-blue-700 dark:text-blue-300">
                              {line.quantity - (line.receivedQuantity || 0)}
                            </p>
                          </div>
                          <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                            <p className="text-xs font-medium text-purple-600 dark:text-purple-400 uppercase tracking-wide mb-1">
                              Unit Price
                            </p>
                            <p className="text-lg font-bold text-purple-700 dark:text-purple-300">
                              {formatCurrency(line.unitPrice)}
                            </p>
                          </div>
                        </div>

                        {receivedPercentage > 0 && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                Receiving Progress
                              </span>
                              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                                {Math.round(receivedPercentage)}%
                              </span>
                            </div>
                            <Progress value={receivedPercentage} className="h-2" />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Package2 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-500 dark:text-slate-400">No line items found</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="financials" className="p-8">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30">
                  <Calculator className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <span className="text-base font-bold text-slate-900 dark:text-white">Financial Summary</span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Cost Breakdown */}
                <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl border border-slate-200/60 dark:border-slate-700/60 p-6">
                  <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-emerald-600" />
                    Cost Breakdown
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-slate-200/40 dark:border-slate-700/40">
                      <span className="text-slate-600 dark:text-slate-400">Subtotal</span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {formatCurrency(orderStats.subtotal)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-200/40 dark:border-slate-700/40">
                      <span className="text-slate-600 dark:text-slate-400">Tax Amount</span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {formatCurrency(orderStats.taxAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-200/40 dark:border-slate-700/40">
                      <span className="text-slate-600 dark:text-slate-400">Shipping Cost</span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {formatCurrency(orderStats.shippingCost)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg px-4 border border-emerald-200/40 dark:border-emerald-800/40">
                      <span className="font-bold text-emerald-900 dark:text-emerald-100">Total Amount</span>
                      <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(orderStats.totalAmount)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment Information */}
                <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl border border-slate-200/60 dark:border-slate-700/60 p-6">
                  <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    Payment Information
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2">
                      <span className="text-slate-600 dark:text-slate-400">Payment Terms</span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {workflow.purchaseOrder?.paymentTerms || "Net 30"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-slate-600 dark:text-slate-400">Payment Method</span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {workflow.purchaseOrder?.paymentTerms || "Bank Transfer"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-slate-600 dark:text-slate-400">Currency</span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {"XAF"}
                      </span>
                    </div>
                    {workflow.purchaseOrder?.expectedDeliveryDate && (
                      <div className="flex justify-between items-center py-2">
                        <span className="text-slate-600 dark:text-slate-400">Due Date</span>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {new Date(workflow.purchaseOrder.expectedDeliveryDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="supplier" className="p-8">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30">
                  <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-base font-bold text-slate-900 dark:text-white">Supplier Information</span>
              </div>

              {workflow.purchaseOrder?.supplier ? (
                <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl border border-slate-200/60 dark:border-slate-700/60 p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                          {workflow.purchaseOrder.supplier.name}
                        </h3>
                        {workflow.purchaseOrder.supplier.email && (
                          <Badge variant="outline" className="mb-3">
                            Code: {workflow.purchaseOrder.supplier?.email}
                          </Badge>
                        )}
                      </div>

                      {workflow.purchaseOrder.supplier.contactPerson && (
                        <div className="flex items-start gap-3">
                          <MapPin className="w-5 h-5 text-slate-500 mt-0.5" />
                          <div>
                            <p className="font-medium text-slate-900 dark:text-white">Address</p>
                            <p className="text-slate-600 dark:text-slate-400 text-sm">
                              {workflow.purchaseOrder.supplier.contactPerson}
                            </p>
                          </div>
                        </div>
                      )}

                      {workflow.purchaseOrder.supplier.phone && (
                        <div className="flex items-center gap-3">
                          <Phone className="w-5 h-5 text-slate-500" />
                          <div>
                            <p className="font-medium text-slate-900 dark:text-white">Phone</p>
                            <p className="text-slate-600 dark:text-slate-400 text-sm">
                              {workflow.purchaseOrder.supplier.phone}
                            </p>
                          </div>
                        </div>
                      )}

                      {workflow.purchaseOrder.supplier.email && (
                        <div className="flex items-center gap-3">
                          <Mail className="w-5 h-5 text-slate-500" />
                          <div>
                            <p className="font-medium text-slate-900 dark:text-white">Email</p>
                            <p className="text-slate-600 dark:text-slate-400 text-sm">
                              {workflow.purchaseOrder.supplier.email}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      {workflow.purchaseOrder.supplier.contactPerson && (
                        <div className="flex items-center gap-3">
                          <User className="w-5 h-5 text-slate-500" />
                          <div>
                            <p className="font-medium text-slate-900 dark:text-white">Contact Person</p>
                            <p className="text-slate-600 dark:text-slate-400 text-sm">
                              {workflow.purchaseOrder.supplier.contactPerson}
                            </p>
                          </div>
                        </div>
                      )}

                      {workflow.purchaseOrder?.taxAmount && (
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">Tax ID</p>
                          <p className="text-slate-600 dark:text-slate-400 text-sm">
                            {workflow.purchaseOrder.taxAmount}
                          </p>
                        </div>
                      )}

                      {workflow.purchaseOrder?.paymentTerms && (
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">Default Payment Terms</p>
                          <p className="text-slate-600 dark:text-slate-400 text-sm">
                            {workflow.purchaseOrder?.paymentTerms}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-500 dark:text-slate-400">No supplier information available</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="history" className="p-8">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30">
                  <History className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <span className="text-base font-bold text-slate-900 dark:text-white">Order History & Activity</span>
              </div>

              <div className="space-y-4">
                {/* Order Creation */}
                <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl border border-slate-200/60 dark:border-slate-700/60 p-4">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                      <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-slate-900 dark:text-white">Order Created</h4>
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                          {workflow.purchaseOrder?.createdAt
                            ? new Date(workflow.purchaseOrder.createdAt).toLocaleString()
                            : "N/A"}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Purchase order {workflow.purchaseOrder?.orderNumber} was created
                      </p>
                    </div>
                  </div>
                </div>

                Status Changes
                {/* {workflow.purchaseOrder?.supplier?.?.map((historyItem: any, index: number) => {
                  const statusConfig = STATUS_CONFIG[historyItem.status as PurchaseOrderStatus]
                  const StatusIcon = statusConfig?.icon || Activity

                  return (
                    <div
                      key={index}
                      className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl border border-slate-200/60 dark:border-slate-700/60 p-4"
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={cn("p-2 rounded-lg", statusConfig?.bgColor || "bg-slate-100 dark:bg-slate-700")}
                        >
                          <StatusIcon
                            className={cn(
                              "w-5 h-5",
                              statusConfig ? "text-current" : "text-slate-600 dark:text-slate-400",
                            )}
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-slate-900 dark:text-white">
                              Status changed to {statusConfig?.label || historyItem.status}
                            </h4>
                            <span className="text-sm text-slate-500 dark:text-slate-400">
                              {new Date(historyItem.timestamp).toLocaleString()}
                            </span>
                          </div>
                          {historyItem.notes && (
                            <p className="text-sm text-slate-600 dark:text-slate-400">{historyItem.notes}</p>
                          )}
                          {historyItem.changedBy && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                              Changed by: {historyItem.changedBy}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                }) || (
                    <div className="text-center py-12">
                      <History className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-500 dark:text-slate-400">No history available</p>
                    </div>
                  )} */}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
