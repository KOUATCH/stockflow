"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { PurchaseOrderStatus } from "@/hooks/purchaseOrderWorkflowHooks/usePurchaseOrderWorkflow"
import { cn } from "@/lib/utils"

import {
  Activity,
  CheckCircle,
  Clock,
  FileText,
  Package,
  Send,
  Sparkles,
  XCircle
} from "lucide-react"

interface PurchaseOrderWorkflowProps {
  currentStatus: PurchaseOrderStatus
  className?: string
}

const workflowSteps = [
  {
    status: "DRAFT" as PurchaseOrderStatus,
    label: "Draft",
    description: "Order is being prepared",
    icon: <FileText className="h-4 w-4" />,
    color: "text-slate-600 dark:text-slate-400",
    gradient: "from-slate-500 to-slate-600",
    bgColor: "bg-slate-100 dark:bg-slate-800",
    borderColor: "border-slate-300 dark:border-slate-600",
  },
  {
    status: "SUBMITTED" as PurchaseOrderStatus,
    label: "Submitted",
    description: "Awaiting approval",
    icon: <Send className="h-4 w-4" />,
    color: "text-blue-600 dark:text-blue-400",
    gradient: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    borderColor: "border-blue-300 dark:border-blue-600",
  },
  {
    status: "APPROVED" as PurchaseOrderStatus,
    label: "Approved",
    description: "Ready to send to supplier",
    icon: <CheckCircle className="h-4 w-4" />,
    color: "text-green-600 dark:text-green-400",
    gradient: "from-green-500 to-emerald-500",
    bgColor: "bg-green-100 dark:bg-green-900/30",
    borderColor: "border-green-300 dark:border-green-600",
  },
  {
    status: "PARTIALLY_RECEIVED" as PurchaseOrderStatus,
    label: "Partial",
    description: "Partially received",
    icon: <Package className="h-4 w-4" />,
    color: "text-orange-600 dark:text-orange-400",
    gradient: "from-orange-500 to-amber-500",
    bgColor: "bg-orange-100 dark:bg-orange-900/30",
    borderColor: "border-orange-300 dark:border-orange-600",
  },
  {
    status: "RECEIVED" as PurchaseOrderStatus,
    label: "Received",
    description: "Items received",
    icon: <Package className="h-4 w-4" />,
    color: "text-emerald-600 dark:text-emerald-400",
    gradient: "from-emerald-500 to-teal-500",
    bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
    borderColor: "border-emerald-300 dark:border-emerald-600",
  },
]

export function PurchaseOrderWorkflow({ currentStatus, className }: PurchaseOrderWorkflowProps) {
  const currentStepIndex = workflowSteps.findIndex((step) => step.status === currentStatus)
  const isCancelled = currentStatus === "CANCELLED"
  const isCompleted = currentStatus === "COMPLETED"

  // Calculate progress percentage
  const progressPercentage = currentStepIndex >= 0 ? ((currentStepIndex + 1) / workflowSteps.length) * 100 : 0

  return (
    <Card className={cn(
      "relative overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-xl",
      className
    )}>
      {/* Modern gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-800/50 dark:via-slate-700/30 dark:to-slate-600/20"></div>

      <CardHeader className="relative z-10 bg-gradient-to-r from-slate-50/80 to-blue-50/50 dark:from-slate-800/80 dark:to-slate-700/50 border-b border-slate-200/60 dark:border-slate-700/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-lg bg-gradient-to-br shadow-sm",
              isCancelled ? "from-red-500 to-rose-600" :
                isCompleted ? "from-emerald-500 to-teal-600" :
                  currentStepIndex >= 0 ? workflowSteps[currentStepIndex].gradient ? `from-${workflowSteps[currentStepIndex].gradient.split(' ')[0].split('-').slice(1).join('-')}-500 to-${workflowSteps[currentStepIndex].gradient.split(' ')[2].split('-').slice(1).join('-')}-600` : "from-blue-500 to-cyan-600" :
                    "from-slate-500 to-slate-600"
            )}>
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                Order Workflow
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Track the progress of this purchase order through its lifecycle
              </CardDescription>
            </div>
          </div>
          <Badge
            variant="secondary"
            className="bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600 shadow-sm"
          >
            <Activity className="w-3 h-3 mr-1" />
            Live Status
          </Badge>
        </div>

        {/* Progress bar */}
        {!isCancelled && !isCompleted && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400 font-medium">Completion Progress</span>
              <span className="text-slate-700 dark:text-slate-300 font-semibold">{Math.round(progressPercentage)}%</span>
            </div>
            <Progress
              value={progressPercentage}
              className="h-2 bg-slate-200/50 dark:bg-slate-700/50"
            />
          </div>
        )}
      </CardHeader>

      <CardContent className="p-6 relative z-10">
        {isCancelled ? (
          <div className="relative overflow-hidden rounded-xl border border-red-200/60 dark:border-red-700/60 bg-gradient-to-r from-red-50 via-red-50 to-rose-50 dark:from-red-900/20 dark:via-red-800/20 dark:to-rose-900/20 p-6">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-rose-500/5 dark:from-red-400/10 dark:to-rose-400/10"></div>
            <div className="relative flex items-center gap-4">
              <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/30 shadow-sm">
                <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="font-bold text-red-800 dark:text-red-200 text-lg">Order Cancelled</p>
                <p className="text-red-700 dark:text-red-300 mt-1">This purchase order has been cancelled</p>
              </div>
            </div>
          </div>
        ) : (isCompleted) ? (
          <div className="relative overflow-hidden rounded-xl border border-emerald-200/60 dark:border-emerald-700/60 bg-gradient-to-r from-emerald-50 via-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:via-emerald-800/20 dark:to-teal-900/20 p-6">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 dark:from-emerald-400/10 dark:to-teal-400/10"></div>
            <div className="relative flex items-center gap-4">
              <div className="p-3 rounded-full bg-emerald-100 dark:bg-emerald-900/30 shadow-sm">
                <CheckCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="font-bold text-emerald-800 dark:text-emerald-200 text-lg">Order Completed</p>
                <p className="text-emerald-700 dark:text-emerald-300 mt-1">This purchase order has been completed and closed</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {workflowSteps.map((step, index) => {
              const isCompleted = index < currentStepIndex
              const isCurrent = index === currentStepIndex
              const isPending = index > currentStepIndex

              return (
                <div key={step.status} className="relative">
                  <div className="flex items-center gap-4">
                    {/* Step indicator */}
                    <div
                      className={cn(
                        "relative flex-shrink-0 w-10 h-10 rounded-xl border-2 flex items-center justify-center shadow-sm transition-all duration-300",
                        isCompleted
                          ? "bg-gradient-to-br from-emerald-500 to-teal-600 border-emerald-400 text-white shadow-emerald-200/50 dark:shadow-emerald-900/50"
                          : isCurrent
                            ? cn("bg-gradient-to-br border-opacity-80 text-white shadow-lg",
                              step.gradient ? `from-${step.gradient.split(' ')[0].split('-').slice(1).join('-')}-500 to-${step.gradient.split(' ')[2].split('-').slice(1).join('-')}-600` : "from-blue-500 to-cyan-600",
                              step.borderColor
                            )
                            : cn("border-2 text-slate-400 dark:text-slate-500", step.bgColor, step.borderColor),
                      )}
                    >
                      {isCompleted ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <div className={cn("transition-colors", isCurrent ? "text-white" : step.color)}>
                          {step.icon}
                        </div>
                      )}

                      {/* Pulse effect for current step */}
                      {isCurrent && (
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-400/30 to-cyan-500/30 animate-pulse"></div>
                      )}
                    </div>

                    {/* Step content */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <p
                          className={cn(
                            "font-semibold transition-colors",
                            isCompleted
                              ? "text-emerald-800 dark:text-emerald-200"
                              : isCurrent
                                ? "text-slate-900 dark:text-white"
                                : "text-slate-500 dark:text-slate-400",
                          )}
                        >
                          {step.label}
                        </p>
                        {isCurrent && (
                          <Badge
                            variant="secondary"
                            className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700 shadow-sm"
                          >
                            <Clock className="w-3 h-3 mr-1" />
                            Current
                          </Badge>
                        )}
                        {isCompleted && (
                          <Badge
                            variant="secondary"
                            className="text-xs px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700 shadow-sm"
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Done
                          </Badge>
                        )}
                      </div>
                      <p
                        className={cn(
                          "text-sm transition-colors",
                          isCompleted
                            ? "text-emerald-600 dark:text-emerald-400"
                            : isCurrent
                              ? "text-slate-700 dark:text-slate-300"
                              : "text-slate-400 dark:text-slate-500",
                        )}
                      >
                        {step.description}
                      </p>
                    </div>
                  </div>

                  {/* Connection line */}
                  {index < workflowSteps.length - 1 && (
                    <div className="flex justify-start ml-5 mt-3 mb-3">
                      <div
                        className={cn(
                          "w-0.5 h-6 rounded-full transition-colors duration-300",
                          isCompleted
                            ? "bg-gradient-to-b from-emerald-500 to-teal-600 shadow-sm"
                            : "bg-slate-200 dark:bg-slate-600"
                        )}
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
