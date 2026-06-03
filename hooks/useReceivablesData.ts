"use client"

import { useState, useEffect } from "react"
import { getAccountsReceivable, getReceivableSummary } from "@/actions/finance/accounts-receivable-actions"
import { useClientAuth } from "@/hooks/useClientAuth"

interface ReceivableItem {
  id: string
  invoiceNumber: string
  customer: {
    id: string
    name: string
    email?: string
    phone?: string
  }
  salesOrder?: {
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
  sentDate?: Date
  remindersSent: number
  lastReminderDate?: Date
  payments: Array<{
    id: string
    paymentNumber: string
    amount: number
    paymentDate: Date
    paymentMethod: string
  }>
}

interface ReceivablesSummary {
  totalAmount: number
  paidAmount: number
  outstandingAmount: number
  totalCount: number
  overdueAmount: number
  overdueCount: number
  dueSoonAmount: number
  dueSoonCount: number
  aging: Array<{
    range: string
    amount: number
    count: number
  }>
}

interface ReceivablesFilters {
  status?: string
  customerId?: string
  overdue?: boolean
  page?: number
  limit?: number
}

export function useReceivablesData() {
  const { organizationId } = useClientAuth()
  const [receivables, setReceivables] = useState<ReceivableItem[]>([])
  const [summary, setSummary] = useState<ReceivablesSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    totalCount: 0,
    totalPages: 0
  })

  const fetchReceivables = async (filters: ReceivablesFilters = {}) => {
    if (!organizationId) return

    try {
      setLoading(true)
      setError(null)

      const [receivablesResult, summaryResult] = await Promise.all([
        getAccountsReceivable(organizationId, filters),
        getReceivableSummary(organizationId)
      ])

      if (receivablesResult.success) {
        setReceivables(receivablesResult.data || [])
        setPagination(receivablesResult.pagination || pagination)
      } else {
        setError(receivablesResult.error || "Failed to fetch receivables")
      }

      if (summaryResult.success) {
        setSummary(summaryResult.data || null)
      }
    } catch (err) {
      console.error("Error fetching receivables:", err)
      setError("Failed to fetch receivables data")
    } finally {
      setLoading(false)
    }
  }

  const refreshData = () => {
    fetchReceivables()
  }

  useEffect(() => {
    fetchReceivables()
  }, [organizationId])

  return {
    receivables,
    summary,
    loading,
    error,
    pagination,
    fetchReceivables,
    refreshData
  }
}