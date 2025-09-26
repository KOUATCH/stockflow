import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { PurchaseOrderStatus } from "@prisma/client"
import {
  CheckCircle,
  FileText,
  Lock,
  Package,
  PackageCheck,
  Send,
  XCircle
} from "lucide-react"

interface ModernStatusBadgeProps {
  status: PurchaseOrderStatus
  className?: string
  showIcon?: boolean
}

const statusConfig: Record<PurchaseOrderStatus, {
  variant: "default" | "secondary" | "destructive" | "outline"
  className: string
  icon: React.ComponentType<{ className?: string }>
  label: string
}> = {
  DRAFT: {
    variant: "secondary",
    className: "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200",
    icon: FileText,
    label: "Draft"
  },
  SUBMITTED: {
    variant: "outline",
    className: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100",
    icon: Send,
    label: "Submitted"
  },
  APPROVED: {
    variant: "default",
    className: "bg-green-100 text-green-700 border-green-200 hover:bg-green-200",
    icon: CheckCircle,
    label: "Approved"
  },
  PARTIALLY_RECEIVED: {
    variant: "outline",
    className: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100",
    icon: Package,
    label: "Partially Received"
  },
  RECEIVED: {
    variant: "default",
    className: "bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200",
    icon: PackageCheck,
    label: "Received"
  },
  CANCELLED: {
    variant: "destructive",
    className: "bg-red-100 text-red-700 border-red-200 hover:bg-red-200",
    icon: XCircle,
    label: "Cancelled"
  },
  COMPLETED: {
    variant: "outline",
    className: "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200",
    icon: Lock,
    label: "Closed"
  }
}

export function ModernStatusBadge({
  status,
  className,
  showIcon = true
}: ModernStatusBadgeProps) {
  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <Badge
      variant={config.variant}
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full transition-colors",
        config.className,
        className
      )}
    >
      {showIcon && <Icon className="h-3 w-3" />}
      {config.label}
    </Badge>
  )
}