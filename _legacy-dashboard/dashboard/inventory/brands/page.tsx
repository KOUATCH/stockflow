import { Suspense } from "react"
import { AlertTriangle, Tags } from "lucide-react"

import { getOrgBrands } from "@/actions/brands/getBrandsAction"
import EnhancedBrandsManagement from "@/components/inventory/EnhancedBrandsManagement"
import { getAuthenticatedUser } from "@/config/useAuth"

export default async function EnhancedBrandsPage() {
  const user = await getAuthenticatedUser()
  const organizationId = user?.organizationId

  if (!organizationId) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-md px-4 py-16 text-center">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <AlertTriangle className="h-7 w-7 text-muted-foreground" />
          </div>
          <h1 className="mb-2 text-xl font-semibold text-foreground">Organization Required</h1>
          <p className="text-sm text-muted-foreground">No organization found for the current user.</p>
        </div>
      </div>
    )
  }

  const initialBrands = await getOrgBrands(organizationId)
  const initialBrandData = initialBrands.data ?? []

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md border bg-muted">
            <Tags className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-normal text-foreground">Brand Portfolio</h1>
            <p className="text-sm text-muted-foreground">Manage bilingual brand records and item assignments.</p>
          </div>
        </div>

        <Suspense fallback={<div className="rounded-md border p-6 text-sm text-muted-foreground">Loading brands...</div>}>
          <EnhancedBrandsManagement data={initialBrandData} organizationId={organizationId} />
        </Suspense>
      </div>
    </div>
  )
}
