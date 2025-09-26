"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { useInventoryIntegration } from "@/hooks/purchaseOrderWorkflowHooks/useInventoryIntegration"
import { PurchaseOrderStatus, usePurchaseOrderWorkflow } from "@/hooks/purchaseOrderWorkflowHooks/usePurchaseOrderWorkflow"
import { formatCurrency } from "@/lib/formatCurrency"
import { cn } from "@/lib/utils"
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Package,
  XCircle,
  FileText,
  Send,
  Truck,
  Activity,
  Building2,
  Calendar,
  User,
  Sparkles,
  Zap
} from "lucide-react"
import { useState } from "react"
import { PurchaseOrderStatusBadge } from "./PurchaseOrderStatusBadge"

const STATUS_CONFIG = {
  DRAFT: {
    icon: FileText,
    color: "bg-slate-500 dark:bg-slate-600",
    label: "Draft",
    gradient: "from-slate-500 to-slate-600",
    bgColor: "bg-slate-100 dark:bg-slate-800/50"
  },
  SUBMITTED: {
    icon: Send,
    color: "bg-blue-500 dark:bg-blue-600",
    label: "Submitted",
    gradient: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-100 dark:bg-blue-900/30"
  },
  APPROVED: {
    icon: CheckCircle,
    color: "bg-green-500 dark:bg-green-600",
    label: "Approved",
    gradient: "from-green-500 to-emerald-500",
    bgColor: "bg-green-100 dark:bg-green-900/30"
  },
  PARTIALLY_RECEIVED: {
    icon: Package,
    color: "bg-orange-500 dark:bg-orange-600",
    label: "Partially Received",
    gradient: "from-orange-500 to-amber-500",
    bgColor: "bg-orange-100 dark:bg-orange-900/30"
  },
  RECEIVED: {
    icon: Package,
    color: "bg-emerald-500 dark:bg-emerald-600",
    label: "Received",
    gradient: "from-emerald-500 to-teal-500",
    bgColor: "bg-emerald-100 dark:bg-emerald-900/30"
  },
  COMPLETED: {
    icon: Sparkles,
    color: "bg-emerald-600 dark:bg-emerald-700",
    label: "Completed",
    gradient: "from-emerald-600 to-teal-600",
    bgColor: "bg-emerald-100 dark:bg-emerald-900/30"
  },
  CANCELLED: {
    icon: XCircle,
    color: "bg-red-500 dark:bg-red-600",
    label: "Cancelled",
    gradient: "from-red-500 to-rose-500",
    bgColor: "bg-red-100 dark:bg-red-900/30"
  },
}

interface PurchaseOrderWorkflowPanelProps {
  purchaseOrderId: string
  organizationId?: string
  currentUserId?: string
}

export function PurchaseOrderWorkflowPanel({
  purchaseOrderId,
  organizationId,
  currentUserId,
}: PurchaseOrderWorkflowPanelProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedAction, setSelectedAction] = useState<string | null>(null)
  const [reason, setReason] = useState("")
  const [receiveQuantities, setReceiveQuantities] = useState<Record<string, number>>({})

  const workflow = usePurchaseOrderWorkflow(purchaseOrderId, organizationId)
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-600" />
            {action.label}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {action.requiresInput && selectedAction === "cancel" && (
            <div className="space-y-3">
              <Label htmlFor="reason" className="text-base font-semibold">
                Cancellation Reason
              </Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Please provide a reason for cancellation..."
                className="min-h-[100px] resize-none"
              />
            </div>
          )}

          {selectedAction === "receive" && workflow.purchaseOrder?.lines && (
            <div className="space-y-4">
              <Label className="text-base font-semibold">
                Receive Quantities
              </Label>
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {workflow.purchaseOrder.lines.map((line: any) => {
                  const remainingQty = line.quantity - (line.receivedQuantity || 0)
                  const inventoryLevel = inventory.getInventoryLevel(
                    line.itemId,
                    workflow.purchaseOrder?.locationId || "",
                  )

                  return (
                    <div
                      key={line.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50"
                    >
                      <div className="flex-1 space-y-1">
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {line.item?.name || "Unknown Item"}
                        </p>
                        <div className="text-sm text-slate-600 dark:text-slate-400 space-y-0.5">
                          <div>Ordered: <span className="font-medium">{line.quantity}</span></div>
                          <div>Received: <span className="font-medium">{line.receivedQuantity || 0}</span></div>
                          <div>Remaining: <span className="font-medium text-blue-600">{remainingQty}</span></div>
                        </div>
                        {inventoryLevel && (
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Current Stock: <span className="font-medium">{inventoryLevel.quantityOnHand}</span>
                          </p>
                        )}
                      </div>
                      <div className="w-20">
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
                          className="text-center font-medium"
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              className="bg-white/80 dark:bg-slate-800/80"
            >
              Cancel
            </Button>
            <Button
              onClick={() => executeAction(selectedAction!)}
              disabled={workflow.isProcessing}
              className={cn(
                "bg-gradient-to-r text-white shadow-lg hover:shadow-xl transition-all",
                action.variant === 'destructive' ? "from-red-600 to-red-700 hover:from-red-700 hover:to-red-800" :
                "from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
              )}
            >
              {workflow.isProcessing ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                action.label
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    )
  }

  if (workflow.isLoading) {
    return (
      <Card className="relative overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-800/50 dark:via-slate-700/30 dark:to-slate-600/20"></div>
        <div className="relative z-10 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Skeleton className="w-8 h-8 rounded-lg" />
            <Skeleton className="h-6 w-32" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-24" />
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

  return (
    <Card className="relative overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-xl">
      {/* Modern gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-800/50 dark:via-slate-700/30 dark:to-slate-600/20"></div>

      <CardHeader className="relative z-10 bg-gradient-to-r from-slate-50/80 to-blue-50/50 dark:from-slate-800/80 dark:to-slate-700/50 border-b border-slate-200/60 dark:border-slate-700/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-lg bg-gradient-to-br shadow-sm",
              "from-blue-500 to-cyan-600"
            )}>
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                Workflow Management
              </CardTitle>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                Manage order status and actions
              </p>
            </div>
          </div>
          <PurchaseOrderStatusBadge
            status={status}
            variant="professional"
            size="md"
          />
        </div>

        {/* Progress indicator */}
        {status !== 'CANCELLED' && status !== 'COMPLETED' && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400 font-medium">Workflow Progress</span>
              <span className="text-slate-700 dark:text-slate-300 font-semibold">{Math.round(progressPercentage)}%</span>
            </div>
            <Progress
              value={progressPercentage}
              className="h-2 bg-slate-200/50 dark:bg-slate-700/50"
            />
          </div>
        )}
      </CardHeader>

      <CardContent className="p-6 relative z-10 space-y-6">
        {/* Status Timeline */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Progress Timeline</span>
          </div>
          <div className="flex items-center justify-between px-2">
            {Object.entries(STATUS_CONFIG).map(([statusKey, config], index) => {
              const isActive = statusKey === status
              const isPast = statusOrder.indexOf(statusKey) < statusOrder.indexOf(status)
              const Icon = config.icon

              return (
                <div key={statusKey} className="flex flex-col items-center gap-2">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 shadow-sm",
                      isActive
                        ? "bg-gradient-to-br from-blue-500 to-cyan-600 text-white shadow-lg"
                        : isPast
                          ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md"
                          : "bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <span
                    className={cn(
                      "text-xs font-medium text-center transition-colors",
                      isActive
                        ? "text-slate-900 dark:text-white"
                        : isPast
                          ? "text-emerald-700 dark:text-emerald-300"
                          : "text-slate-400 dark:text-slate-500"
                    )}
                  >
                    {config.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Available Actions */}
        {workflow.availableActions.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Available Actions</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {workflow.availableActions.map((action) => (
                <Dialog key={action.id} open={dialogOpen && selectedAction === action.id} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      disabled={action.disabled || workflow.isProcessing}
                      onClick={() => handleActionClick(action.id)}
                      className={cn(
                        "transition-all duration-200 shadow-md hover:shadow-lg",
                        action.variant === 'destructive' ?
                          "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white" :
                        action.variant === 'default' ?
                          "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white" :
                          "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
                      )}
                    >
                      {action.requiresConfirmation && <AlertTriangle className="h-3 w-3 mr-2" />}
                      {action.label}
                    </Button>
                  </DialogTrigger>
                  {renderActionDialog()}
                </Dialog>
              ))}
            </div>
          </div>
        )}

        {/* Order Details */}
        {workflow.purchaseOrder && (
          <div className="rounded-lg bg-gradient-to-r from-slate-50 to-blue-50/50 dark:from-slate-800/50 dark:to-slate-700/30 p-4 border border-slate-200/60 dark:border-slate-700/60">
            <div className="flex items-center gap-2 mb-3">
              <Building2 className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Order Summary</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <FileText className="w-3 h-3 text-slate-500" />
                <span className="text-slate-600 dark:text-slate-400">Order:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{workflow.purchaseOrder.orderNumber}</span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="w-3 h-3 text-slate-500" />
                <span className="text-slate-600 dark:text-slate-400">Supplier:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{workflow.purchaseOrder.supplier?.name || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Package className="w-3 h-3 text-slate-500" />
                <span className="text-slate-600 dark:text-slate-400">Total:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(workflow.purchaseOrder.total || 0)}
                </span>
              </div>
              {workflow.purchaseOrder.expectedDeliveryDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-3 h-3 text-slate-500" />
                  <span className="text-slate-600 dark:text-slate-400">Expected:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {new Date(workflow.purchaseOrder.expectedDeliveryDate).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
