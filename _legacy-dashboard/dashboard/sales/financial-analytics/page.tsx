import { Suspense } from 'react'
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import DailySalesFinancialDashboard from "@/components/analytics/DailySalesFinancialDashboard"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { RefreshCw } from "lucide-react"

interface PageProps {
  searchParams: {
    locationId?: string
    date?: string
  }
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-6 rounded-xl border">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-80" />
            <Skeleton className="h-5 w-96" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
      </div>

      {/* Key Metrics Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="border-0 bg-gradient-to-br from-white to-gray-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-12 w-12 rounded-xl" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content Areas Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <Skeleton className="h-6 w-48 mb-4" />
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-2 w-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-3 bg-gray-50 rounded">
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function LoadingFallback() {
  return (
    <Card>
      <CardContent className="p-8 text-center">
        <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">Loading daily sales financial analytics...</p>
      </CardContent>
    </Card>
  )
}

export default async function DailySalesFinancialAnalyticsPage({
  searchParams
}: PageProps) {
  // Get session for organizationId
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  const locationId = searchParams?.locationId || "all"
  const organizationId = session.user.organizationId

  if (!organizationId) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Organization not found. Please contact support.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Suspense fallback={<DashboardSkeleton />}>
        <DailySalesFinancialDashboard
          organizationId={organizationId}
          locationId={locationId}
        />
      </Suspense>
    </div>
  )
}

export const metadata = {
  title: 'Daily Sales Financial Analytics | StockFlow',
  description: 'Comprehensive financial analysis of daily sales performance with item-level insights and global financial metrics.',
}