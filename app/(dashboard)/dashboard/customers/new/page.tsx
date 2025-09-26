"use client"

import { CreateCustomerForm } from "@/components/customers/CreateCustomerForm"
import { useCreateCustomer } from "@/hooks/useCustomerQueries"
import type { CustomerFormData } from "@/validations/customer"
import { useRouter } from "next/navigation"
import { toast } from 'sonner'

export default function NewCustomerPage() {
  const router = useRouter()
  const createCustomerMutation = useCreateCustomer()

  const handleSubmit = async (data: CustomerFormData) => {
    try {
      await createCustomerMutation.mutateAsync(data)
      toast.success("Customer created successfully")
      router.push("/dashboard/customers")
    } catch (error) {
      toast.error("Failed to create customer")
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
