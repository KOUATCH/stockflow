/**
 * Table Empty State Component
 * Professional empty state for when no data is available
 */

"use client"

import { ReactNode } from "react"
import { cn } from "@/lib/utils"

// UI Components
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

// Icons
import {
  Package,
  Search,
  FileX,
  Plus,
  RefreshCw,
  Filter,
  Database,
  Inbox,
  Users,
  ShoppingCart,
  BarChart3,
  Settings,
} from "lucide-react"

import { EmptyStateConfig } from "./types"

interface TableEmptyStateProps {
  config?: EmptyStateConfig
  context?: "search" | "filter" | "noData" | "error" | "loading"
  className?: string
}

const DEFAULT_EMPTY_STATES = {
  noData: {
    icon: <Database className="h-12 w-12 text-muted-foreground/50" />,
    title: "No data available",
    description: "There are currently no records to display. Get started by adding your first entry.",
  },
  search: {
    icon: <Search className="h-12 w-12 text-muted-foreground/50" />,
    title: "No search results",
    description: "We couldn't find any records matching your search criteria. Try adjusting your search terms.",
  },
  filter: {
    icon: <Filter className="h-12 w-12 text-muted-foreground/50" />,
    title: "No matching results",
    description: "No records match the current filters. Try adjusting your filter criteria or clearing all filters.",
  },
  error: {
    icon: <FileX className="h-12 w-12 text-destructive/50" />,
    title: "Unable to load data",
    description: "We encountered an error while loading the data. Please try again or contact support if the issue persists.",
  },
  loading: {
    icon: <RefreshCw className="h-12 w-12 text-muted-foreground/50" />,
    title: "Loading data",
    description: "Records are being prepared for display.",
  },
}

const CONTEXT_ICONS = {
  inventory: <Package className="h-12 w-12 text-muted-foreground/50" />,
  users: <Users className="h-12 w-12 text-muted-foreground/50" />,
  orders: <ShoppingCart className="h-12 w-12 text-muted-foreground/50" />,
  analytics: <BarChart3 className="h-12 w-12 text-muted-foreground/50" />,
  settings: <Settings className="h-12 w-12 text-muted-foreground/50" />,
  general: <Inbox className="h-12 w-12 text-muted-foreground/50" />,
}

export function TableEmptyState({
  config = { enabled: true },
  context = "noData",
  className,
}: TableEmptyStateProps) {
  if (!config.enabled) return null

  // Use custom component if provided
  if (config.customComponent) {
    return <>{config.customComponent}</>
  }

  // Determine the appropriate empty state
  const emptyState = DEFAULT_EMPTY_STATES[context] || DEFAULT_EMPTY_STATES.noData

  // Use config overrides if provided
  const icon = config.icon || emptyState.icon
  const title = config.title || emptyState.title
  const description = config.description || emptyState.description

  return (
    <Card className={cn("border-dashed", className)}>
      <CardContent className="flex flex-col items-center justify-center py-16 px-8 text-center">
        {/* Icon */}
        <div className="mb-6">
          {icon}
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {title}
        </h3>

        {/* Description */}
        <p className="text-sm text-muted-foreground mb-6 max-w-md">
          {description}
        </p>

        {/* Action Button */}
        {config.action && config.action.onClick && typeof config.action.onClick === 'function' && (
          <Button
            onClick={() => config.action?.onClick?.()}
            className="gap-2"
            size="sm"
          >
            <Plus className="h-4 w-4" />
            {config.action.label}
          </Button>
        )}

        {/* Context-specific suggestions */}
        {context === "search" && (
          <div className="mt-4 text-xs text-muted-foreground space-y-1">
            <p>Try:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Checking your spelling</li>
              <li>Using fewer keywords</li>
              <li>Searching for general terms</li>
            </ul>
          </div>
        )}

        {context === "filter" && (
          <div className="mt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.reload()}
              className="gap-1 text-xs"
            >
              <RefreshCw className="h-3 w-3" />
              Clear all filters
            </Button>
          </div>
        )}

        {context === "error" && (
          <div className="mt-4 space-y-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
              className="gap-1"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
            <p className="text-xs text-muted-foreground">
              Error persisting? Contact our support team for assistance.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Specialized empty states for common scenarios
export function InventoryEmptyState(props: Omit<TableEmptyStateProps, "context">) {
  return (
    <TableEmptyState
      {...props}
      context="noData"
      config={{
        ...props.config,
        enabled: props.config?.enabled ?? true,
        icon: <Package className="h-12 w-12 text-blue-500/50" />,
        title: props.config?.title || "No inventory items",
        description: props.config?.description || "Start building your inventory by adding your first product or service.",
        action: props.config?.action,
      }}
    />
  )
}

export function UsersEmptyState(props: Omit<TableEmptyStateProps, "context">) {
  return (
    <TableEmptyState
      {...props}
      context="noData"
      config={{
        ...props.config,
        enabled: props.config?.enabled ?? true,
        icon: <Users className="h-12 w-12 text-green-500/50" />,
        title: props.config?.title || "No users found",
        description: props.config?.description || "Invite team members to start collaborating on your projects.",
        action: props.config?.action,
      }}
    />
  )
}

export function OrdersEmptyState(props: Omit<TableEmptyStateProps, "context">) {
  return (
    <TableEmptyState
      {...props}
      context="noData"
      config={{
        ...props.config,
        enabled: props.config?.enabled ?? true,
        icon: <ShoppingCart className="h-12 w-12 text-purple-500/50" />,
        title: props.config?.title || "No orders yet",
        description: props.config?.description || "Orders will appear here once customers start making purchases.",
      }}
    />
  )
}

export function AnalyticsEmptyState(props: Omit<TableEmptyStateProps, "context">) {
  return (
    <TableEmptyState
      {...props}
      context="noData"
      config={{
        ...props.config,
        enabled: props.config?.enabled ?? true,
        icon: <BarChart3 className="h-12 w-12 text-orange-500/50" />,
        title: props.config?.title || "No analytics data",
        description: props.config?.description || "Analytics will be generated once you have sufficient data to analyze.",
      }}
    />
  )
}

// Generic empty state with context detection
export function ContextualEmptyState({
  entityType,
  ...props
}: TableEmptyStateProps & { entityType?: keyof typeof CONTEXT_ICONS }) {
  const contextIcon = entityType ? CONTEXT_ICONS[entityType] : CONTEXT_ICONS.general

  return (
    <TableEmptyState
      {...props}
      config={{
        ...props.config,
        enabled: props.config?.enabled ?? true,
        icon: props.config?.icon || contextIcon,
        title: props.config?.title || `No ${entityType || "data"} available`,
        description: props.config?.description || `There are currently no ${entityType || "records"} to display.`,
      }}
    />
  )
}
