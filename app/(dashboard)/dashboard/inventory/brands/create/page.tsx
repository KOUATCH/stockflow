import createActionBrand from "@/actions/brands/createActionBrand"
import { ModernBrandForm } from "@/components/brands/ModernBrandForm"
import { Button } from "@/components/ui/button"
import { getAuthenticatedUser } from "@/config/useAuth"
import { generateSlug } from "@/lib/generateSlug"
import { ArrowLeft, Tag } from "lucide-react"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

async function handleCreateBrand(formData: FormData) {
  'use server'

  const brandName = formData.get('brandName') as string
  const data = {
    id: crypto.randomUUID(),
    brandName,
    slug: generateSlug(brandName),
    organizationId: "",
    createdAt: new Date(),
  }

  const result = await createActionBrand(data)

  if (result.success) {
    revalidatePath('/dashboard/inventory/brands')
    redirect('/dashboard/inventory/brands')
  } else {
    throw new Error(result.error || 'Failed to create brand')
  }
}

export default async function CreateBrandPage() {
  // Get authenticated user and organization
  const user = await getAuthenticatedUser()

  if (!user?.organizationId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-purple-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
          <div className="max-w-md mx-auto text-center py-16">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <Tag className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">Organization Required</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              No organization found for the current user.
            </p>
            <form action={() => redirect('/dashboard/inventory/brands')}>
              <Button type="submit" variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Brands
              </Button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  const organizationId = user.organizationId

  return (
    <ModernBrandForm
      action={handleCreateBrand}
      isLoading={false}
      onCancel={() => redirect('/dashboard/inventory/brands')}
      organizationId={organizationId}
    />
  )
}