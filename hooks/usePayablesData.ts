"use client"

import { useState, useEffect } from "react"
import { getAccountsPayable, getPayableSummary } from "@/actions/finance/accounts-payable-actions"
import { useClientAuth } from "@/hooks/useClientAuth"

interface PayableItem {
  id: string
  invoiceNumber: string
  supplierInvoiceNumber?: string
  supplier: {
    id: string
    name: string
    email?: string
    phone?: string
  }
  purchaseOrder?: {
    id: string
    orderNumber: string
  }
  amount: number
  dueDate: Date
  invoiceDate: Date
  status: string
  paymentTerms: number
  discountTerms?: string
  discountAmount: number
  taxAmount: number
  totalAmount: number
  paidAmount: number
  outstandingAmount: number
  description?: string
  notes?: string
  payments: Array<{
    id: string
    paymentNumber: string
    amount: number
    paymentDate: Date
    paymentMethod: string
  }>
}

interface PayablesSummary {
  totalAmount: number
  paidAmount: number
  outstandingAmount: number
  totalCount: number
  overdueAmount: number
  overdueCount: number
  dueSoonAmount: number
  dueSoonCount: number
}

interface PayablesFilters {
  status?: string
  supplierId?: string
  overdue?: boolean
  page?: number
  limit?: number
}

export function usePayablesData() {
  const { organizationId } = useClientAuth()
  const [payables, setPayables] = useState<PayableItem[]>([])
  const [summary, setSummary] = useState<PayablesSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    totalCount: 0,
    totalPages: 0
  })

  const fetchPayables = async (filters: PayablesFilters = {}) => {
    if (!organizationId) return

    try {
      setLoading(true)
      setError(null)

      const [payablesResult, summaryResult] = await Promise.all([
        getAccountsPayable(organizationId, filters),
        getPayableSummary(organizationId)
      ])

      if (payablesResult.success) {
        setPayables(payablesResult.data || [])
        setPagination(payablesResult.pagination || pagination)
      } else {
        setError(payablesResult.error || "Failed to fetch payables")
      }

      if (summaryResult.success) {
        setSummary(summaryResult.data || null)
      }
    } catch (err) {
      console.error("Error fetching payables:", err)
      setError("Failed to fetch payables data")
    } finally {
      setLoading(false)
    }
  }

  const refreshData = () => {
    fetchPayables()
  }

  useEffect(() => {
    fetchPayables()
  }, [organizationId])

  return {
    payables,
    summary,
    loading,
    error,
    pagination,
    fetchPayables,
    refreshData
  }
}