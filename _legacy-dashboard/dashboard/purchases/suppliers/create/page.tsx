import { createSupplier } from "@/actions/suppliers/createSupplier"
import { ModernCreateSupplierForm } from "@/components/suppliers/ModernCreateSupplierForm"
import { Button } from "@/components/ui/button"
import { getAuthenticatedUser } from "@/config/useAuth"
import { AlertTriangle, Building2 } from "lucide-react"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

async function handleCreateSupplier(formData: FormData) {
  'use server'

  console.log('Server action received FormData entries:');
  for (let [key, value] of formData.entries()) {
    console.log(`${key}: ${value}`);
  }

  const data = {
    name: formData.get('name') as string,
    code: formData.get('code') as string || undefined,
    contactPerson: formData.get('contactPerson') as string || undefined,
    email: formData.get('email') as string || undefined,
    phone: formData.get('phone') as string || undefined,
    address: formData.get('address') as string || undefined,
    city: formData.get('city') as string || undefined,
    state: formData.get('state') as string || undefined,
    zipCode: formData.get('zipCode') as string || undefined,
    country: formData.get('country') as string || undefined,
    taxId: formData.get('taxId') as string || undefined,
    paymentTerms: formData.get('paymentTerms') ? parseInt(formData.get('paymentTerms') as string) : 30,
    creditLimit: formData.get('creditLimit') ? parseFloat(formData.get('creditLimit') as string) : 0,
    notes: formData.get('notes') as string || undefined,
    isActive: formData.get('isActive') === 'true',
    organizationId: formData.get('organizationId') as string,
  }

  console.log('Prepared data for createSupplier:', data);

  const result = await createSupplier(data)

  console.log('CreateSupplier result:', result);

  if (result.success) {
    console.log('Supplier created successfully:', result.data?.id);
    revalidatePath('/dashboard/purchases/suppliers')
    redirect('/dashboard/purchases/suppliers')
  } else {
    console.error('Create supplier failed:', result.error);
    throw new Error(result.error)
  }
}

export default async function CreateSupplierPage() {
  // Get authenticated user and organization
  const user = await getAuthenticatedUser()

  if (!user?.organizationId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
          <div className="max-w-md mx-auto text-center py-16">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <Building2 className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">Organization Required</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              No organization found for the current user.
            </p>
            <form action={() => redirect('/dashboard/purchases/suppliers')}>
              <Button type="submit" variant="outline">
                <AlertTriangle className="mr-2 h-4 w-4" />
                Back to Suppliers
              </Button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  const organizationId = user.organizationId

  return (
    <ModernCreateSupplierForm
      action={handleCreateSupplier}
      isLoading={false}
      organizationId={organizationId}
    />
  )
}