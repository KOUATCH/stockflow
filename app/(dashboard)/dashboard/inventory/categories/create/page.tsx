import createCategory from "@/actions/categories/createCategory"
import { ModernCategoryForm } from "@/components/categories/ModernCategoryForm"
import { Button } from "@/components/ui/button"
import { getAuthenticatedUser } from "@/config/useAuth"
import { ArrowLeft, FolderOpen } from "lucide-react"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

async function handleCreateCategory(formData: FormData) {
  'use server'

  const user = await getAuthenticatedUser()

  if (!user?.organizationId) {
    throw new Error("Organization not found")
  }

  const data = {
    id: crypto.randomUUID(),
    title: formData.get('title') as string,
    description: formData.get('description') as string || "",
    slug: "", // Will be generated in the action
    organizationId: user.organizationId,
    createdAt: new Date(),
  }

  const result = await createCategory(data)

  if (result.success) {
    revalidatePath('/dashboard/inventory/categories')
    redirect('/dashboard/inventory/categories')
  } else {
    throw new Error(result.error || 'Failed to create category')
  }
}

export default async function CreateCategoryPage() {
  // Get authenticated user and organization
  const user = await getAuthenticatedUser()

  if (!user?.organizationId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-purple-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
          <div className="max-w-md mx-auto text-center py-16">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <FolderOpen className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">Organization Required</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              No organization found for the current user.
            </p>
            <form action={() => redirect('/dashboard/inventory/categories')}>
              <Button type="submit" variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Categories
              </Button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  const organizationId = user.organizationId

  return (
    <ModernCategoryForm
      action={handleCreateCategory}
      isLoading={false}
      onCancel={() => redirect('/dashboard/inventory/categories')}
      organizationId={organizationId}
    />
  )
}