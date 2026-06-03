"use client"

import { CustomerQuickActions } from "@/components/customers/CustomerQuickActions"
import { CustomerFormEdit } from "@/components/customers/forms/CustomerFormEdit"
import { useNotifications } from "@/components/notifications/NotificationProvider"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useCustomer, useCustomerOrders, useUpdateCustomer } from "@/hooks/useCustomerQueries"
import type { CustomerEditFormData } from "@/validations/customer"
import { ArrowLeft, Users } from "lucide-react"
import { useParams, useRouter } from "next/navigation"

export default function EditCustomerPage() {
  const params = useParams()
  const router = useRouter()
  const customerId = params.id as string

  const { data: customer, isLoading, error } = useCustomer(customerId)
  const { data: customerOrdersData } = useCustomerOrders(customerId)
  const updateCustomerMutation = useUpdateCustomer()
  const { formSuccess, formError, operationStart } = useNotifications()

  const handleSubmit = async (data: CustomerEditFormData) => {
    const operationId = operationStart("Updating Customer")

    try {
      await updateCustomerMutation.mutateAsync(data)
      formSuccess("Customer Updated", `Customer "${data.name}" has been successfully updated`)
      router.push(`/dashboard/customers/${customer?.id}`)
    } catch (error) {
      formError(
        "Failed to Update Customer",
        "Could not save the customer changes",
        error instanceof Error ? error.message : "An unexpected error occurred"
      )
      throw error
    }
  }

  if (isLoading) {
    return <EditCustomerSkeleton />
  }

  if (error || !customer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
          <div className="max-w-md mx-auto text-center py-16">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">Customer Not Found</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              The customer you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => router.push("/dashboard/customers")} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Customers
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Quick Actions Sidebar */}
          <div className="lg:col-span-1">
            <CustomerQuickActions
              customer={{
                id: customer.id,
                name: customer.name,
                email: customer.email ?? undefined,
                phone: customer.phone ?? undefined,
                isActive: customer.isActive,
                totalOrders: customerOrdersData?.stats?.totalOrders || 0
              }}
              currentPage="edit"
            />
          </div>

          {/* Main Edit Form */}
          <div className="lg:col-span-3">
            <CustomerFormEdit
              customer={customer}
              onSubmit={handleSubmit}
              isLoading={updateCustomerMutation.isPending}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function EditCustomerSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-20" />
            <div className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-lg" />
              <div>
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 shadow-xl rounded-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-slate-50 to-blue-50/50 dark:from-slate-800 dark:to-slate-700 px-6 py-4">
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-64" />
              </div>
              <div className="p-6 space-y-8">
                {[1, 2, 3].map((section) => (
                  <div key={section} className="space-y-6">
                    <div className="flex items-center gap-2 pb-2">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-5 w-32" />
                    </div>
                    <div className="grid gap-6 md:grid-cols-2">
                      {[1, 2].map((field) => (
                        <div key={field} className="space-y-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-10 w-full" />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                <div className="flex gap-4 pt-6">
                  <Skeleton className="h-10 w-32" />
                  <Skeleton className="h-10 w-20" />
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 shadow-xl rounded-2xl overflow-hidden sticky top-8">
              <div className="bg-gradient-to-r from-slate-50 to-blue-50/50 dark:from-slate-800 dark:to-slate-700 px-6 py-4">
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-48" />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-24 mb-2" />
                    <Skeleton className="h-4 w-16 mb-2" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                </div>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50/80 dark:bg-slate-800/50">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-3 w-16 mb-2" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
