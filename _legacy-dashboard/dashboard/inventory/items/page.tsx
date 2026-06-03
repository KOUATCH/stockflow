
import { getOrgItemsWithInventoryLevels } from "@/actions/itemsShow/getOrgItemsWithInventoryLevels"
import EnhancedItemsManagement from "@/components/inventory/EnhancedItemsManagement"
import { Button } from "@/components/ui/button"
import { getAuthenticatedUser } from "@/config/useAuth"
import {
  AlertTriangle,
  Package,
  Plus,
  Sparkles,
} from "lucide-react"
import Link from "next/link"
import { Suspense } from "react"

export default async function EnhancedItemsPage() {
  const user = await getAuthenticatedUser()
  const userOrg = user?.organizationId

  if (!userOrg) {
    return (
      <div className="dashboard-landing-theme dark min-h-screen overflow-x-hidden">
        <div className="dashboard-landing-content mx-auto w-full max-w-7xl min-w-0 px-4 py-8 sm:px-6">
          <div className="dashboard-glass-panel mx-auto max-w-md rounded-lg px-6 py-14 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-lg border border-[var(--dash-border-subtle)] bg-[var(--dash-danger-soft)]">
              <AlertTriangle className="h-8 w-8 text-[var(--dash-danger)]" />
            </div>
            <h3 className="mb-3 text-xl font-semibold text-[var(--dash-text)]">Organization Required</h3>
            <p className="text-sm text-[var(--dash-text-soft)]">No organization found for the current user.</p>
          </div>
        </div>
      </div>
    )
  }

  // Fetch items with full inventory, brand, category data
  const itemsResponse = await getOrgItemsWithInventoryLevels(userOrg).catch((error) => {
    console.error('Error fetching items with inventory levels:', error)
    return { data: [], success: false, error: error?.message || 'Failed to fetch items' }
  })

  const initialItemData = itemsResponse?.data ?? []

  return (
    <div className="dashboard-landing-theme dark min-h-screen overflow-x-hidden">
      <div className="dashboard-landing-content mx-auto w-full max-w-7xl min-w-0 px-4 py-6 sm:px-6 sm:py-8">
        {/* Page Header */}
        <div className="mb-6 flex flex-col gap-5 sm:mb-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0 max-w-3xl">
            <div className="dashboard-eyebrow mb-4">
              <span className="dashboard-live-dot" />
              Inventory workspace
            </div>
            <div className="flex min-w-0 items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-[var(--dash-border-subtle)] bg-[var(--dash-brand-soft)] shadow-[0_16px_34px_rgba(47,125,246,0.18)]">
                <Package className="h-6 w-6 text-[var(--dash-brand-strong)]" />
              </div>
              <div className="min-w-0">
                <h1 className="text-3xl font-semibold tracking-tight text-[var(--dash-text)] sm:text-4xl">
                  Product Inventory
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--dash-text-soft)] sm:text-base">
                  Manage your catalog, stock posture, pricing, and operational signals from one focused table.
                </p>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <div className="dashboard-filter-chip flex h-9 items-center gap-2 rounded-lg px-3 text-xs font-medium">
              <Sparkles className="h-4 w-4 text-[var(--dash-gold)]" />
              Live catalog
            </div>
            <Button asChild size="sm" className="dashboard-button-primary h-9 rounded-lg px-3">
              <Link href="/dashboard/inventory/items/create">
                <Plus className="h-4 w-4" />
                Add Item
              </Link>
            </Button>
          </div>
        </div>

        {/* Enhanced Items Management Component with TanStack Table */}
        <Suspense fallback={
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Package className="mx-auto mb-4 h-12 w-12 text-[var(--dash-text-faint)]" />
              <p className="text-sm text-[var(--dash-text-soft)]">Loading product inventory...</p>
            </div>
          </div>
        }>
          <EnhancedItemsManagement data={initialItemData} organizationId={userOrg} />
        </Suspense>
      </div>
    </div>
  )
}
