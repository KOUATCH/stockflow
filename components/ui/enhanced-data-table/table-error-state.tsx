/**
 * Table Error State Component
 * Professional error handling with retry options and user guidance
 */

"use client"

import { ReactNode } from "react"
import { cn } from "@/lib/utils"

// UI Components
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"

// Icons
import {
  AlertCircle,
  RefreshCw,
  WifiOff,
  Database,
  Server,
  Clock,
  Shield,
  Bug,
  AlertTriangle,
  XCircle,
  HelpCircle,
  ExternalLink,
} from "lucide-react"

import { ErrorConfig } from "./types"

interface TableErrorStateProps {
  error: string | Error | null
  config?: ErrorConfig
  variant?: "minimal" | "detailed" | "card" | "alert"
  className?: string
}

// Error type classification
const getErrorType = (error: string | Error) => {
  const errorMessage = typeof error === 'string' ? error : error.message || 'Unknown error'
  const lowerError = errorMessage.toLowerCase()

  if (lowerError.includes('network') || lowerError.includes('fetch') || lowerError.includes('connection')) {
    return 'network'
  }
  if (lowerError.includes('timeout') || lowerError.includes('slow')) {
    return 'timeout'
  }
  if (lowerError.includes('unauthorized') || lowerError.includes('forbidden') || lowerError.includes('auth')) {
    return 'auth'
  }
  if (lowerError.includes('database') || lowerError.includes('sql') || lowerError.includes('db')) {
    return 'database'
  }
  if (lowerError.includes('server') || lowerError.includes('500') || lowerError.includes('internal')) {
    return 'server'
  }
  if (lowerError.includes('validation') || lowerError.includes('invalid')) {
    return 'validation'
  }
  if (lowerError.includes('not found') || lowerError.includes('404')) {
    return 'notFound'
  }

  return 'unknown'
}

// Error configuration by type
const ERROR_CONFIGS = {
  network: {
    icon: <WifiOff className="h-8 w-8 text-orange-500" />,
    title: "Connection Error",
    description: "Unable to connect to the server. Please check your internet connection.",
    badge: "Network Issue",
    badgeVariant: "destructive" as const,
    suggestions: [
      "Check your internet connection",
      "Verify VPN settings if applicable",
      "Try refreshing the page",
    ],
  },
  timeout: {
    icon: <Clock className="h-8 w-8 text-yellow-500" />,
    title: "Request Timeout",
    description: "The request is taking longer than expected to complete.",
    badge: "Timeout",
    badgeVariant: "secondary" as const,
    suggestions: [
      "The server might be busy, try again",
      "Check your internet speed",
      "Contact support if this persists",
    ],
  },
  auth: {
    icon: <Shield className="h-8 w-8 text-red-500" />,
    title: "Authentication Error",
    description: "You don't have permission to access this data.",
    badge: "Auth Required",
    badgeVariant: "destructive" as const,
    suggestions: [
      "Please log in again",
      "Contact your administrator for access",
      "Check if your session has expired",
    ],
  },
  database: {
    icon: <Database className="h-8 w-8 text-purple-500" />,
    title: "Database Error",
    description: "There was an issue accessing the database.",
    badge: "Database",
    badgeVariant: "destructive" as const,
    suggestions: [
      "This is a temporary issue, please try again",
      "Contact support if the problem persists",
    ],
  },
  server: {
    icon: <Server className="h-8 w-8 text-red-500" />,
    title: "Server Error",
    description: "The server encountered an internal error.",
    badge: "Server Error",
    badgeVariant: "destructive" as const,
    suggestions: [
      "Our team has been notified",
      "Please try again in a few minutes",
      "Contact support for urgent issues",
    ],
  },
  validation: {
    icon: <AlertTriangle className="h-8 w-8 text-amber-500" />,
    title: "Validation Error",
    description: "The request contains invalid data.",
    badge: "Invalid Data",
    badgeVariant: "secondary" as const,
    suggestions: [
      "Check your input data",
      "Ensure all required fields are filled",
      "Contact support if you need help",
    ],
  },
  notFound: {
    icon: <XCircle className="h-8 w-8 text-gray-500" />,
    title: "Data Not Found",
    description: "The requested data could not be found.",
    badge: "Not Found",
    badgeVariant: "secondary" as const,
    suggestions: [
      "Check if the data was deleted",
      "Verify your search criteria",
      "Contact support if you expected to see data",
    ],
  },
  unknown: {
    icon: <Bug className="h-8 w-8 text-red-500" />,
    title: "Unexpected Error",
    description: "An unexpected error occurred while loading the data.",
    badge: "Unknown Error",
    badgeVariant: "destructive" as const,
    suggestions: [
      "Try refreshing the page",
      "Clear your browser cache",
      "Contact support with error details",
    ],
  },
}

export function TableErrorState({
  error,
  config = { enabled: true, retryEnabled: true },
  variant = "card",
  className,
}: TableErrorStateProps) {
  if (!config.enabled || !error) return null

  // Use custom error component if provided
  if (config.customErrorComponent) {
    return <>{config.customErrorComponent}</>
  }

  const errorType = getErrorType(error)
  const errorConfig = ERROR_CONFIGS[errorType]
  const errorMessage = typeof error === 'string' ? error : error.message || 'Unknown error'

  // Use config overrides
  const title = config.errorMessage || errorConfig.title
  const description = errorConfig.description

  // Minimal variant
  if (variant === "minimal") {
    return (
      <div className={cn("flex items-center justify-center py-8", className)}>
        <div className="flex items-center gap-3 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <span className="text-sm font-medium">{title}</span>
          {config.retryEnabled && config.onRetry && typeof config.onRetry === 'function' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => config.onRetry?.()}
              className="ml-2 h-7"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Retry
            </Button>
          )}
        </div>
      </div>
    )
  }

  // Alert variant
  if (variant === "alert") {
    return (
      <Alert variant="destructive" className={className}>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle className="flex items-center gap-2">
          {title}
          <Badge variant={errorConfig.badgeVariant} className="text-xs">
            {errorConfig.badge}
          </Badge>
        </AlertTitle>
        <AlertDescription className="mt-2">
          <p className="mb-3">{description}</p>
          {config.retryEnabled && config.onRetry && typeof config.onRetry === 'function' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => config.onRetry?.()}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          )}
        </AlertDescription>
      </Alert>
    )
  }

  // Card variant (default)
  return (
    <Card className={cn("border-destructive/20", className)}>
      <CardContent className="flex flex-col items-center justify-center py-16 px-8 text-center">
        {/* Error Icon */}
        <div className="mb-4">
          {errorConfig.icon}
        </div>

        {/* Title and Badge */}
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-lg font-semibold text-foreground">
            {title}
          </h3>
          <Badge variant={errorConfig.badgeVariant} className="text-xs">
            {errorConfig.badge}
          </Badge>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground mb-6 max-w-md">
          {description}
        </p>

        {/* Error Details (in development) */}
        {process.env.NODE_ENV === 'development' && (
          <details className="mb-6 w-full max-w-md">
            <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
              Error Details (Development)
            </summary>
            <pre className="mt-2 p-3 bg-muted rounded text-xs text-left overflow-auto max-h-32">
              {errorMessage}
            </pre>
          </details>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {config.retryEnabled && config.onRetry && typeof config.onRetry === 'function' && (
            <Button
              onClick={() => config.onRetry?.()}
              className="gap-2"
              size="sm"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh Page
          </Button>
        </div>

        {/* Suggestions */}
        {variant === "detailed" && errorConfig.suggestions && (
          <div className="w-full max-w-md">
            <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
              <HelpCircle className="h-4 w-4" />
              What you can try:
            </h4>
            <ul className="text-xs text-muted-foreground space-y-1 text-left">
              {errorConfig.suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Support Link */}
        <div className="mt-6 pt-4 border-t w-full max-w-md">
          <p className="text-xs text-muted-foreground">
            Need help? {" "}
            <Button
              variant="link"
              size="sm"
              className="p-0 h-auto text-xs"
              onClick={() => console.log("Contact support")}
            >
              Contact Support
              <ExternalLink className="h-3 w-3 ml-1" />
            </Button>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

// Specialized error states
export function NetworkErrorState(props: Omit<TableErrorStateProps, "error">) {
  return (
    <TableErrorState
      {...props}
      error="Network connection error"
    />
  )
}

export function ServerErrorState(props: Omit<TableErrorStateProps, "error">) {
  return (
    <TableErrorState
      {...props}
      error="Internal server error"
    />
  )
}

export function AuthErrorState(props: Omit<TableErrorStateProps, "error">) {
  return (
    <TableErrorState
      {...props}
      error="Authentication required"
    />
  )
}

export function ValidationErrorState(props: Omit<TableErrorStateProps, "error"> & { details?: string }) {
  return (
    <TableErrorState
      {...props}
      error={`Validation error: ${props.details || "Invalid data provided"}`}
    />
  )
}