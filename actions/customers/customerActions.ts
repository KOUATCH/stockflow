"use server"

import { createCustomer, deleteCustomer, getCustomer, getCustomerOrders, getCustomers, updateCustomer } from "@/actions/customers/customerAction2"
import type { Customer } from "@/types/customerTypes"
import { CustomerEditFormData, customerEditSchema, CustomerFormData, customerSchema } from "@/validations/customer"
import { revalidatePath } from "next/cache"

// Get organization ID - in a real app, this would come from authenticated user
function getOrganizationId(): string {
  return "org1" // Placeholder for real authentication
}

export async function getCustomersAction(): Promise<Customer[]> {
  try {
    // const organizationId = getOrganizationId()
    return await getCustomers()
  } catch (error) {
    console.error("Failed to fetch customers:", error)
    throw new Error("Failed to fetch customers")
  }
}

export async function getCustomerAction(id: string): Promise<Customer | null> {
  try {
    if (!id || id === "new" || id.trim().length === 0) {
      console.log("[v0] Invalid customer ID provided:", id)
      return null
    }

    console.log("[v0] Fetching customer with ID:", id)

    // Use the enhanced getCustomer function that gets org ID internally
    const customer = await getCustomer(id)
    console.log("[v0] Customer fetch result:", customer ? "found" : "not found")

    return customer
  } catch (error) {
    console.error("[v0] Failed to fetch customer:", error)
    throw new Error(`Failed to fetch customer: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

export async function createCustomerAction(data: CustomerFormData): Promise<Customer> {
  try {
    const validatedData = customerSchema.parse(data)
    const organizationId = getOrganizationId()

    const customer = await createCustomer(validatedData)

    revalidatePath("/customers")

    return customer
  } catch (error) {
    console.error("Failed to create customer:", error)
    throw new Error("Failed to create customer")
  }
}

export async function updateCustomerAction(data: CustomerEditFormData): Promise<Customer> {
  try {
    const validatedData = customerEditSchema.parse(data)
    const organizationId = getOrganizationId()

    const customer = await updateCustomer(validatedData)

    revalidatePath("/customers")
    revalidatePath(`/customers/${data.id}`)

    return customer
  } catch (error) {
    console.error("Failed to update customer:", error)
    throw new Error("Failed to update customer")
  }
}

export async function deleteCustomerAction(id: string): Promise<void> {
  try {
    const organizationId = getOrganizationId()
    await deleteCustomer(id)

    revalidatePath("/customers")
  } catch (error) {
    console.error("Failed to delete customer:", error)
    throw new Error("Failed to delete customer")
  }
}

export async function getCustomerOrdersAction(customerId: string) {
  try {
    if (!customerId || customerId.trim().length === 0) {
      console.log("Invalid customer ID provided:", customerId)
      return { orders: [], stats: { totalOrders: 0, totalRevenue: 0, averageOrderValue: 0 } }
    }

    const orders = await getCustomerOrders(customerId)

    // Calculate statistics
    const totalOrders = orders.length
    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0)
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    return {
      orders,
      stats: {
        totalOrders,
        totalRevenue,
        averageOrderValue,
      }
    }
  } catch (error) {
    console.error("Failed to fetch customer orders:", error)
    throw new Error(`Failed to fetch customer orders: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}
