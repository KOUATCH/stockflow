import EnhancedEnterpriseDashboard from '@/components/dashboard/EnhancedEnterpriseDashboard'
import { getAllDashboardData } from "@/actions/dashboard/getDashboardData"
import { Button } from "@/components/ui/button"
import { getAuthenticatedUser } from "@/config/useAuth"
import { LogOut, Package } from "lucide-react"
import { ErrorBoundary } from '@/lib/error-handling/client-error-boundary'
import Link from "next/link"

function isRecoverableDashboardSessionError(error: unknown) {
  const message = error instanceof Error ? error.message : ''

  return (
    message.includes('organization that is no longer available') ||
    message.includes('Organization not found')
  )
}

function DashboardSessionRecovery() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-sky-50/40 to-teal-50/60 dark:from-cyan-950 dark:via-teal-900 dark:to-slate-800">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-8">
        <div className="mx-auto max-w-md py-16 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
            <Package className="h-10 w-10 text-slate-400" />
          </div>
          <h3 className="mb-3 text-xl font-semibold text-slate-900 dark:text-white">Refresh your session</h3>
          <p className="mb-6 text-slate-600 dark:text-slate-400">
            Your session points to an organization that no longer exists in this database.
          </p>
          <Button asChild variant="outline">
            <Link href="/auth/signout">
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default async function DashboardPage() {
  const user = await getAuthenticatedUser()

  if (!user?.organizationId) {
    return <DashboardSessionRecovery />
  }

  const organizationId = user.organizationId

  let dashboardData

  try {
    dashboardData = await getAllDashboardData(organizationId)
  } catch (error) {
    if (isRecoverableDashboardSessionError(error)) {
      return <DashboardSessionRecovery />
    }

    throw error
  }

  return (
    <ErrorBoundary>
      <EnhancedEnterpriseDashboard
        organizationId={dashboardData.organization.id}
        dashboardData={dashboardData}
        dashboardBasePath="/dashboard"
      />
    </ErrorBoundary>
  )
}
