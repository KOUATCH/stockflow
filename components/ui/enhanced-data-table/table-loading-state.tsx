/**
 * Table Loading State Component
 * Professional loading states with skeletons and progress indicators
 */

"use client"

import { ReactNode } from "react"
import { cn } from "@/lib/utils"

// UI Components
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

// Icons
import {
  Loader2,
  Database,
  Download,
  Upload,
  Search,
  Filter,
  RefreshCw,
} from "lucide-react"

import { LoadingConfig } from "./types"

interface TableLoadingStateProps {
  config?: LoadingConfig
  variant?: "skeleton" | "spinner" | "progress" | "custom"
  className?: string
}

export function TableLoadingState({
  config = { enabled: true, skeletonRows: 5 },
  variant = "skeleton",
  className,
}: TableLoadingStateProps) {
  if (!config.enabled) return null

  // Custom loader component
  if (config.customLoader) {
    return <>{config.customLoader}</>
  }

  const loadingMessage = config.loadingMessage || "Loading data..."

  // Spinner variant
  if (variant === "spinner") {
    return (
      <Card className={cn("", className)}>
        <CardContent className="flex flex-col items-center justify-center py-16 px-8 text-center">
          <div className="flex items-center gap-3 mb-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="text-lg font-medium">{loadingMessage}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Please wait while we fetch your data...
          </p>
        </CardContent>
      </Card>
    )
  }

  // Progress variant
  if (variant === "progress") {
    return (
      <Card className={cn("", className)}>
        <CardContent className="p-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Database className="h-5 w-5 text-primary" />
              <span className="font-medium">{loadingMessage}</span>
            </div>
            <Progress value={75} className="w-full" />
            <p className="text-sm text-muted-foreground">
              Fetching and processing records...
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Skeleton variant (default)
  return (
    <div className={cn("space-y-4", className)}>
      {/* Loading Toolbar Skeleton */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Skeleton className="h-8 w-32" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-20" />
              </div>
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filters Skeleton */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-9 w-80" />
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-28" />
      </div>

      {/* Table Skeleton */}
      <Card>
        <CardContent className="p-0">
          {/* Table Header Skeleton */}
          <div className="border-b">
            <div className="flex items-center p-4 space-x-4">
              <Skeleton className="h-4 w-4" /> {/* Checkbox */}
              <Skeleton className="h-4 w-4" /> {/* Row number */}
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>

          {/* Table Rows Skeleton */}
          <div className="divide-y">
            {Array.from({ length: config.skeletonRows || 5 }).map((_, index) => (
              <TableRowSkeleton key={index} delay={index * 100} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pagination Skeleton */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Skeleton className="h-4 w-48" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-16" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Individual table row skeleton with staggered animation
function TableRowSkeleton({ delay = 0 }: { delay?: number }) {
  return (
    <div className="flex items-center p-4 space-x-4 animate-pulse" style={{ animationDelay: `${delay}ms` }}>
      <Skeleton className="h-4 w-4" /> {/* Checkbox */}
      <Skeleton className="h-4 w-4" /> {/* Row number */}
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-4 w-36" />
      <Skeleton className="h-4 w-16" />
    </div>
  )
}

// Specialized loading states for different contexts
export function SearchLoadingState({ className }: { className?: string }) {
  return (
    <Card className={cn("", className)}>
      <CardContent className="flex items-center justify-center py-12 px-8">
        <div className="flex items-center gap-3">
          <Search className="h-5 w-5 animate-pulse text-primary" />
          <span className="font-medium">Searching...</span>
        </div>
      </CardContent>
    </Card>
  )
}

export function FilterLoadingState({ className }: { className?: string }) {
  return (
    <Card className={cn("", className)}>
      <CardContent className="flex items-center justify-center py-12 px-8">
        <div className="flex items-center gap-3">
          <Filter className="h-5 w-5 animate-pulse text-primary" />
          <span className="font-medium">Applying filters...</span>
        </div>
      </CardContent>
    </Card>
  )
}

export function ExportLoadingState({ className }: { className?: string }) {
  return (
    <Card className={cn("", className)}>
      <CardContent className="flex items-center justify-center py-12 px-8">
        <div className="flex items-center gap-3">
          <Download className="h-5 w-5 animate-pulse text-primary" />
          <span className="font-medium">Preparing export...</span>
        </div>
      </CardContent>
    </Card>
  )
}

export function ImportLoadingState({ className }: { className?: string }) {
  return (
    <Card className={cn("", className)}>
      <CardContent className="flex items-center justify-center py-12 px-8">
        <div className="space-y-4 text-center">
          <div className="flex items-center gap-3 justify-center">
            <Upload className="h-5 w-5 animate-pulse text-primary" />
            <span className="font-medium">Processing import...</span>
          </div>
          <Progress value={60} className="w-64" />
          <p className="text-sm text-muted-foreground">
            Validating and importing your data...
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export function RefreshLoadingState({ className }: { className?: string }) {
  return (
    <Card className={cn("", className)}>
      <CardContent className="flex items-center justify-center py-12 px-8">
        <div className="flex items-center gap-3">
          <RefreshCw className="h-5 w-5 animate-spin text-primary" />
          <span className="font-medium">Refreshing data...</span>
        </div>
      </CardContent>
    </Card>
  )
}

// Compact loading state for smaller spaces
export function CompactLoadingState({
  message = "Loading...",
  className
}: {
  message?: string
  className?: string
}) {
  return (
    <div className={cn("flex items-center justify-center py-8", className)}>
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
        <span className="text-sm text-muted-foreground">{message}</span>
      </div>
    </div>
  )
}

// Loading overlay for existing content
export function LoadingOverlay({
  children,
  loading = false,
  message = "Loading...",
  className
}: {
  children: ReactNode
  loading?: boolean
  message?: string
  className?: string
}) {
  return (
    <div className={cn("relative", className)}>
      {children}
      {loading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="flex items-center gap-3 bg-card p-4 rounded-lg shadow-lg">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="font-medium">{message}</span>
          </div>
        </div>
      )}
    </div>
  )
}