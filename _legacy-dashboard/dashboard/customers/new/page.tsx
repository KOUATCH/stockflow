"use client"

import { notify } from "@/lib/notifications/notify"
import { CreateCustomerForm } from "@/components/customers/CreateCustomerForm"
import { useCreateCustomer } from "@/hooks/useCustomerQueries"
import type { CustomerFormData } from "@/validations/customer"
import { useRouter } from "next/navigation"
export default function NewCustomerPage() {
  const router = useRouter()
  const createCustomerMutation = useCreateCustomer()

  const handleSubmit = async (data: CustomerFormData) => {
    try {
      await createCustomerMutation.mutateAsync(data)
      notify.success("Customer created successfully")
      router.push("/dashboard/customers")
    } catch (error) {
      notify.error("Failed to create customer")
      throw error
    }
  }

  return (
    <CreateCustomerForm
      onSubmit={handleSubmit}
      isLoading={createCustomerMutation.isPending}
      onCancel={() => router.push("/dashboard/customers")}
    />
  )
}
