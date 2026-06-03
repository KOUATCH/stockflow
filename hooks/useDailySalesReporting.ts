"use client"

import {
  exportDailySalesReport,
  finalizeDailySalesReport,
  generateDailySalesReport,
  getDailySalesReport,
  getLocations,
  getReportHistory,
} from "@/actions/sales-analyses/dailySalesReportingActions"
import type { FinalizeReportParams, GenerateReportParams } from "@/types/dailySalesReportingTypes"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export function useDailySalesReporting(date: string, locationId: string, organizationId: string) {
  const queryClient = useQueryClient()

  // Query keys
  const reportQueryKey = ["daily-sales-report", date, locationId, organizationId]
  const locationsQueryKey = ["locations", organizationId]
  const historyQueryKey = ["report-history", organizationId, locationId]

  // Fetch daily sales report
  const {
    data: report,
    isLoading: isReportLoading,
    error: reportError,
    refetch: refetchReport,
  } = useQuery({
    queryKey: reportQueryKey,
    queryFn: () => getDailySalesReport(date, locationId, organizationId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })

  // Fetch locations
  const {
    data: locations = [],
    isLoading: isLocationsLoading,
    error: locationsError,
    refetch: refetchLocations,
  } = useQuery({
    queryKey: locationsQueryKey,
    queryFn: () => getLocations(organizationId),
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  })

  // Fetch report history
  const {
    data: history = [],
    isLoading: isHistoryLoading,
    error: historyError,
    refetch: refetchHistory,
  } = useQuery({
    queryKey: historyQueryKey,
    queryFn: () => getReportHistory(organizationId, locationId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  })

  // Generate report mutation
  const generateReportMutation = useMutation({
    meta: { operation: 'generate', entity: 'Daily Sales Report' },
    mutationFn: (params: GenerateReportParams) => generateDailySalesReport(params),
    onSuccess: (result) => {
      if (result.success) {
        // Invalidate and refetch related queries
        queryClient.invalidateQueries({ queryKey: reportQueryKey })
        queryClient.invalidateQueries({ queryKey: historyQueryKey })
      }
    },
  })

  // Finalize report mutation
  const finalizeReportMutation = useMutation({
    meta: { operation: 'finalize', entity: 'Report' },
    mutationFn: (params: FinalizeReportParams) => finalizeDailySalesReport(params),
    onSuccess: (result) => {
      if (result.success) {
        // Invalidate and refetch related queries
        queryClient.invalidateQueries({ queryKey: reportQueryKey })
        queryClient.invalidateQueries({ queryKey: historyQueryKey })
      }
    },
  })

  // Export report mutation
  const exportReportMutation = useMutation({
    meta: { operation: 'export', entity: 'Report' },
    mutationFn: ({ reportId, format }: { reportId: string; format: "pdf" | "csv" | "excel" }) =>
      exportDailySalesReport(reportId, format),
    onSuccess: (result) => {
      if (result.success && result.downloadUrl) {
        // Trigger download
        const link = document.createElement("a")
        link.href = result.downloadUrl
        link.download = ""
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    },
  })

  // Helper functions
  const generateReport = (forceRegenerate = false) => {
    return generateReportMutation.mutate({
      date,
      locationId,
      organizationId,
      forceRegenerate,
    })
  }

  const finalizeReport = (reportId: string, notes?: string) => {
    return finalizeReportMutation.mutate({ reportId, notes })
  }

  const exportReport = (format: "pdf" | "csv" | "excel") => {
    if (report) {
      return exportReportMutation.mutate({ reportId: report.id, format })
    }
  }

  const refreshReport = () => {
    return refetchReport()
  }

  const refreshAll = () => {
    refetchReport()
    refetchLocations()
    refetchHistory()
  }

  // Computed values
  const hasReport = !!report
  const isReportFinalized = report?.isFinalized ?? false
  const canGenerateReport = !generateReportMutation.isPending
  const isLoading = isReportLoading || isLocationsLoading || isHistoryLoading
  const isGenerating = generateReportMutation.isPending
  const isFinalizing = finalizeReportMutation.isPending
  const isExporting = exportReportMutation.isPending

  return {
    // Data
    report,
    locations,
    history,

    // Loading states
    isReportLoading,
    isLocationsLoading,
    isHistoryLoading,
    isLoading,
    isGenerating,
    isFinalizing,
    isExporting,

    // Error states
    reportError,
    locationsError,
    historyError,
    generateError: generateReportMutation.error,
    finalizeError: finalizeReportMutation.error,
    exportError: exportReportMutation.error,

    // Computed states
    hasReport,
    isReportFinalized,
    canGenerateReport,

    // Actions
    generateReport,
    finalizeReport,
    exportReport,
    refreshReport,
    refreshAll,
    refetchReport,
    refetchLocations,
    refetchHistory,

    // Mutation results
    generateResult: generateReportMutation.data,
    finalizeResult: finalizeReportMutation.data,
    exportResult: exportReportMutation.data,
  }
}
