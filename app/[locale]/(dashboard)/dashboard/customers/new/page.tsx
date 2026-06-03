"use client"

import { CreateCustomerForm } from "@/components/customers/CreateCustomerForm"
import { useCreateCustomer } from "@/hooks/useCustomerQueries"
import { getLocaleFromPathname, localizePath } from "@/i18n/routing"
import { DEFAULT_LOCALE } from "@/types/bilingual"
import type { CustomerFormData } from "@/validations/customer"
import { usePathname, useRouter } from "next/navigation"
import { useEnhancedNotifications } from "@/components/notifications/EnhancedNotificationProvider"

export default function NewCustomerPage() {
  const router = useRouter()
  const pathname = usePathname()
  const locale = getLocaleFromPathname(pathname) ?? DEFAULT_LOCALE
  const customersHref = localizePath("/dashboard/customers", locale)
  const createCustomerMutation = useCreateCustomer()
  const { businessSuccess, businessError } = useEnhancedNotifications()

  const handleSubmit = async (data: CustomerFormData) => {
    try {
      await createCustomerMutation.mutateAsync(data)
      businessSuccess("Customer Creation", `Customer "${data.name}" has been created successfully`)
      router.push(customersHref)
    } catch (error) {
      businessError("Customer Creation", "Failed to create customer. Please check the form data and try again.")
      throw error
    }
  }

  return (
    <CreateCustomerForm
      onSubmit={handleSubmit}
      isLoading={createCustomerMutation.isPending}
      onCancel={() => router.push(customersHref)}
    />
  )
}
