"use client"

import { getCustomers } from "@/actions/customers/customerAction2"
import {
  createCustomerAction,
  deleteCustomerAction,
  getCustomerAction,
  getCustomerOrdersAction,
  updateCustomerAction
} from "@/actions/customers/customerActions"
import type { Customer, CustomerWithStats } from "@/types/customerTypes"
import type { CustomerEditFormData, CustomerFormData } from "@/validations/customer"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

// Fetch all customers
export function useCustomers() {
  return useQuery<CustomerWithStats[]>({
    queryKey: ["customers"],
    queryFn:  () =>  getCustomers(),
  })
}

// Fetch single customer
export function useCustomer(id: string) {
  return useQuery<Customer | null>({
    queryKey: ["customers", id],
    queryFn: () => getCustomerAction(id),
    enabled: !!id,
  })
}

// Fetch customer orders
export function useCustomerOrders(customerId: string) {
  return useQuery({
    queryKey: ["customers", customerId, "orders"],
    queryFn: () => getCustomerOrdersAction(customerId),
    enabled: !!customerId,
  })
}

// Create customer mutation
export function useCreateCustomer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CustomerFormData) => createCustomerAction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] })
    },
  })
}

// Update customer mutation
export function useUpdateCustomer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CustomerEditFormData) => updateCustomerAction(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["customers"] })
      queryClient.invalidateQueries({ queryKey: ["customers", variables.id] })
    },
  })
}

// Delete customer mutation
export function useDeleteCustomer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteCustomerAction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] })
    },
  })
}
