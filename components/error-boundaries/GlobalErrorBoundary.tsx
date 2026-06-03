"use client"

import React from 'react'
import { ErrorBoundary, withErrorBoundary } from '@/lib/error-handling/client-error-boundary'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

interface ErrorFallbackProps {
  error: Error
  resetErrorBoundary: () => void
}

// Global Error Fallback Component
function GlobalErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  const handleGoHome = () => {
    window.location.href = '/dashboard'
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl border-destructive">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AlertTriangle className="h-12 w-12 text-destructive" />
          </div>
          <CardTitle className="text-2xl text-destructive">
            Something Went Wrong
          </CardTitle>
          <CardDescription className="text-base">
            We&apos;re sorry, but an unexpected error has occurred. Our team has been notified.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {process.env.NODE_ENV === 'development' && (
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-semibold text-sm mb-2">Error Details (Development Only):</h4>
              <pre className="text-xs text-muted-foreground overflow-auto whitespace-pre-wrap">
                {error.message}
              </pre>
              {error.stack && (
                <details className="mt-2">
                  <summary className="text-xs cursor-pointer hover:text-foreground">
                    View Stack Trace
                  </summary>
                  <pre className="text-xs text-muted-foreground mt-2 overflow-auto whitespace-pre-wrap">
                    {error.stack}
                  </pre>
                </details>
              )}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={resetErrorBoundary}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
            <Button
              variant="outline"
              onClick={handleGoHome}
              className="flex items-center gap-2"
            >
              <Home className="h-4 w-4" />
              Go Home
            </Button>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <p>Error ID: {Date.now().toString(36)}</p>
            <p>If this problem persists, please contact support.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// POS-specific Error Fallback
function POSErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <div className="flex items-center justify-center min-h-[400px] p-4">
      <Card className="w-full max-w-md border-destructive">
        <CardHeader className="text-center">
          <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-2" />
          <CardTitle className="text-lg">POS System Error</CardTitle>
          <CardDescription>
            There was an issue with the point of sale system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {process.env.NODE_ENV === 'development' && (
              <div className="bg-muted p-3 rounded text-xs">
                <strong>Error:</strong> {error.message}
              </div>
            )}
            <div className="flex gap-2">
              <Button
                onClick={resetErrorBoundary}
                size="sm"
                className="flex-1"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Retry
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
                className="flex-1"
              >
                Reload Page
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Inventory-specific Error Fallback
function InventoryErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <div className="p-4">
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Inventory System Error
          </CardTitle>
          <CardDescription>
            Unable to load inventory data
          </CardDescription>
        </CardHeader>
        <CardContent>
          {process.env.NODE_ENV === 'development' && (
            <div className="bg-muted p-3 rounded mb-4 text-sm">
              {error.message}
            </div>
          )}
          <Button onClick={resetErrorBoundary} size="sm">
            <RefreshCw className="h-3 w-3 mr-1" />
            Retry Loading
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

// Financial Operations Error Fallback
function FinancialErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <div className="p-4">
      <Card className="border-destructive bg-destructive/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Financial Operation Failed
          </CardTitle>
          <CardDescription>
            A financial transaction could not be completed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Your transaction was not processed. No charges have been made.
              Please try again or contact support if the problem persists.
            </p>
            {process.env.NODE_ENV === 'development' && (
              <div className="bg-muted p-3 rounded text-xs">
                <strong>Error:</strong> {error.message}
              </div>
            )}
            <div className="flex gap-2">
              <Button
                onClick={resetErrorBoundary}
                size="sm"
                variant="destructive"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Try Again
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.history.back()}
              >
                Go Back
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function adaptFallback(Fallback: React.ComponentType<ErrorFallbackProps>) {
  const FallbackAdapter = (error: Error, retry: () => void) =>
    React.createElement(Fallback, { error, resetErrorBoundary: retry })

  FallbackAdapter.displayName = `${Fallback.displayName ?? Fallback.name ?? 'ErrorFallback'}Adapter`

  return FallbackAdapter
}

// Export configured error boundaries
export const GlobalErrorBoundary = withErrorBoundary(
  ({ children }: { children: React.ReactNode }) => <>{children}</>,
  {
    fallback: adaptFallback(GlobalErrorFallback),
    onError: (error, errorInfo) => {
      console.error('Global Error Boundary:', error, errorInfo)
      // Error will be automatically sent to the enterprise error handling system
    }
  }
)

export const POSErrorBoundary = withErrorBoundary(
  ({ children }: { children: React.ReactNode }) => <>{children}</>,
  {
    fallback: adaptFallback(POSErrorFallback),
    onError: (error, errorInfo) => {
      console.error('POS Error Boundary:', error, errorInfo)
    }
  }
)

export const InventoryErrorBoundary = withErrorBoundary(
  ({ children }: { children: React.ReactNode }) => <>{children}</>,
  {
    fallback: adaptFallback(InventoryErrorFallback),
    onError: (error, errorInfo) => {
      console.error('Inventory Error Boundary:', error, errorInfo)
    }
  }
)

export const FinancialErrorBoundary = withErrorBoundary(
  ({ children }: { children: React.ReactNode }) => <>{children}</>,
  {
    fallback: adaptFallback(FinancialErrorFallback),
    onError: (error, errorInfo) => {
      console.error('Financial Error Boundary:', error, errorInfo)
    }
  }
)

// High-level wrapper that can be used around entire sections
export function WithErrorBoundary({
  children,
  type = 'global'
}: {
  children: React.ReactNode
  type?: 'global' | 'pos' | 'inventory' | 'financial'
}) {
  switch (type) {
    case 'pos':
      return <POSErrorBoundary>{children}</POSErrorBoundary>
    case 'inventory':
      return <InventoryErrorBoundary>{children}</InventoryErrorBoundary>
    case 'financial':
      return <FinancialErrorBoundary>{children}</FinancialErrorBoundary>
    default:
      return <GlobalErrorBoundary>{children}</GlobalErrorBoundary>
  }
}
