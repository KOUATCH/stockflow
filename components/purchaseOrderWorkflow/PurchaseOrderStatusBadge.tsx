"use client"

import React from "react"

import { Badge } from "@/components/ui/badge"
import { PurchaseOrderStatus } from "@/hooks/purchaseOrderWorkflowHooks/usePurchaseOrderWorkflow"
import { cn } from "@/lib/utils"
import {
  AlertTriangle,
  CheckCircle,
  FileText,
  Package,
  Send,
  Sparkles,
  XCircle
} from "lucide-react"

interface PurchaseOrderStatusBadgeProps {
  status: PurchaseOrderStatus
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'modern' | 'professional'
}

const statusConfig: Record<PurchaseOrderStatus, {
  color: string;
  icon: React.ReactElement<{ className?: string }>;
  label: string;
  gradient: string;
  modernColor: string;
  professionalColor: string;
}> = {
  DRAFT: {
    color: "bg-slate-100 text-slate-700 dark:bg-slate-800/70 dark:text-slate-300 border-slate-200 dark:border-slate-600",
    modernColor: "bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 text-slate-700 dark:text-slate-300 border-slate-300/60 dark:border-slate-600/60 shadow-sm",
    professionalColor: "bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600 shadow-md",
    gradient: "from-slate-500 to-slate-600",
    icon: <FileText className="h-3 w-3" />,
    label: "Draft",
  },
  SUBMITTED: {
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-700",
    modernColor: "bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 text-blue-700 dark:text-blue-300 border-blue-300/60 dark:border-blue-600/60 shadow-sm",
    professionalColor: "bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-600 shadow-md",
    gradient: "from-blue-500 to-cyan-500",
    icon: <Send className="h-3 w-3" />,
    label: "Submitted",
  },
  APPROVED: {
    color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-700",
    modernColor: "bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-green-700 dark:text-green-300 border-green-300/60 dark:border-green-600/60 shadow-sm",
    professionalColor: "bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm text-green-700 dark:text-green-300 border-green-200 dark:border-green-600 shadow-md",
    gradient: "from-green-500 to-emerald-500",
    icon: <CheckCircle className="h-3 w-3" />,
    label: "Approved",
  },
  PARTIALLY_RECEIVED: {
    color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200 dark:border-orange-700",
    modernColor: "bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 text-orange-700 dark:text-orange-300 border-orange-300/60 dark:border-orange-600/60 shadow-sm",
    professionalColor: "bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-600 shadow-md",
    gradient: "from-orange-500 to-amber-500",
    icon: <Package className="h-3 w-3" />,
    label: "Partially Received",
  },
  RECEIVED: {
    color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700",
    modernColor: "bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-300/60 dark:border-emerald-600/60 shadow-sm",
    professionalColor: "bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-600 shadow-md",
    gradient: "from-emerald-500 to-teal-500",
    icon: <Package className="h-3 w-3" />,
    label: "Received",
  },
  CANCELLED: {
    color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-700",
    modernColor: "bg-gradient-to-r from-red-100 to-rose-100 dark:from-red-900/30 dark:to-rose-900/30 text-red-700 dark:text-red-300 border-red-300/60 dark:border-red-600/60 shadow-sm",
    professionalColor: "bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm text-red-700 dark:text-red-300 border-red-200 dark:border-red-600 shadow-md",
    gradient: "from-red-500 to-rose-500",
    icon: <XCircle className="h-3 w-3" />,
    label: "Cancelled",
  },
  // CLOSED: {
  //   color: "bg-slate-100 text-slate-700 dark:bg-slate-800/70 dark:text-slate-300 border-slate-200 dark:border-slate-600",
  //   modernColor: "bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 text-slate-700 dark:text-slate-300 border-slate-300/60 dark:border-slate-600/60 shadow-sm",
  //   professionalColor: "bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600 shadow-md",
  //   gradient: "from-slate-500 to-slate-600",
  //   icon: <CheckCircle className="h-3 w-3" />,
  //   label: "Closed",
  // },
  COMPLETED: {
    color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700",
    modernColor: "bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-300/60 dark:border-emerald-600/60 shadow-sm",
    professionalColor: "bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-600 shadow-md",
    gradient: "from-emerald-500 to-teal-500",
    icon: <Sparkles className="h-3 w-3" />,
    label: "Completed"
  }
}

export function PurchaseOrderStatusBadge({
  status,
  className,
  size = 'md',
  variant = 'modern'
}: PurchaseOrderStatusBadgeProps) {
  const config = statusConfig[status]

  if (!config || !config.icon) {
    return (
      <Badge className={cn("gap-1.5 px-2.5 py-1", statusConfig.DRAFT.color, className)}>
        <AlertTriangle className="h-3 w-3" />
        Unknown
      </Badge>
    )
  }

  const sizeStyles = {
    sm: "gap-1 px-2 py-0.5 text-xs",
    md: "gap-1.5 px-2.5 py-1 text-sm",
    lg: "gap-2 px-3 py-1.5 text-base"
  }

  const iconSizes = {
    sm: "h-2.5 w-2.5",
    md: "h-3 w-3",
    lg: "h-4 w-4"
  }

  const getColorClass = () => {
    switch (variant) {
      case 'modern':
        return config.modernColor
      case 'professional':
        return config.professionalColor
      default:
        return config.color
    }
  }

  // Clone the icon with the appropriate size
  const sizedIcon = React.isValidElement(config.icon)
    ? React.cloneElement(config.icon, { className: iconSizes[size] })
    : config.icon

  return (
    <Badge
      className={cn(
        sizeStyles[size],
        getColorClass(),
        "font-medium transition-all duration-200 hover:shadow-lg",
        variant === 'modern' && "hover:scale-105",
        variant === 'professional' && "hover:bg-white/90 dark:hover:bg-slate-800/90",
        className
      )}
    >
      {sizedIcon}
      <span className="font-semibold">{config.label}</span>
    </Badge>
  )
}
