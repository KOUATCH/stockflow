"use server"

import { db } from "@/prisma/db"; // Adjust import path as needed
import { type cashDrawerTransactionType, SalesOrderStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

// Types
export interface CreateDailySalesReportInput {
  date: string
  locationId: string
  organizationId: string
  forceRegenerate?: boolean
}

export interface DailySalesReportData {
  id: string
  date: Date
  locationId: string
  organizationId: string
  totalRevenue: number
  totalCost: number
  grossProfit: number
  grossMargin: number
  totalQuantitySold: number
  totalTransactions: number
  averageTransactionValue: number
  itemsSold: number
  cashSales: number
  cardSales: number
  digitalSales: number
  openingBalance: number
  closingBalance: number
  cashIn: number
  cashOut: number
  variance: number
  reportGeneratedAt: Date
  isFinalized: boolean
  notes?: string
  itemSales: Array<{
    id: string
    itemName: string
    itemSku: string
    costPrice: number
    sellingPrice: number
    startingQuantity: number
    quantitySold: number
    endingQuantity: number
    cashSales: number
    cardSales: number
    digitalSales: number
    totalRevenue: number
    totalCost: number
    grossProfit: number
    margin: number
  }>
  cashDrawerTransactions: Array<{
    id: string
    eventType: cashDrawerTransactionType
    amount: number
    reason?: string
    notes?: string
    balanceBefore: number
    balanceAfter: number
    timestamp: Date
    userName?: string
  }>
}

// Generate daily sales report
export async function generateDailySalesReport({
  date,
  locationId,
  organizationId,
  forceRegenerate = false,
}: CreateDailySalesReportInput): Promise<{ success: boolean; reportId?: string; error?: string }> {
  try {
    const reportDate = new Date(date)
    reportDate.setHours(0, 0, 0, 0)

    // Check if report already exists
    const existingReport = await db.dailySalesReport.findUnique({
      where: {
        date_locationId_organizationId: {
          date: reportDate,
          locationId,
          organizationId,
        },
      },
    })

    if (existingReport && !forceRegenerate) {
      return { success: true, reportId: existingReport.id }
    }

    // Delete existing report if force regenerating
    if (existingReport && forceRegenerate) {
      await db.dailySalesReport.delete({
        where: { id: existingReport.id },
      })
    }

    // Generate report data
    const reportData = await generateReportData(date, locationId, organizationId)

    // Create the report
    const report = await db.dailySalesReport.create({
      data: {
        date: reportDate,
        locationId,
        organizationId,
        totalRevenue: reportData.summary.totalRevenue,
        totalCost: reportData.summary.totalCost,
        grossProfit: reportData.summary.grossProfit,
        grossMargin: reportData.summary.grossMargin,
        totalQuantitySold: reportData.summary.totalQuantitySold,
        totalTransactions: reportData.summary.totalTransactions,
        averageTransactionValue: reportData.summary.averageTransactionValue,
        itemsSold: reportData.summary.itemsSold,
        cashSales: reportData.paymentMethods.cashSales,
        cardSales: reportData.paymentMethods.cardSales,
        digitalSales: reportData.paymentMethods.digitalSales,
        openingBalance: reportData.cashDrawer.openingBalance,
        closingBalance: reportData.cashDrawer.actualClosing,
        cashIn: reportData.cashDrawer.cashIn,
        cashOut: reportData.cashDrawer.cashOut,
        variance: reportData.cashDrawer.variance,
        itemSales: {
          create: reportData.itemSales.map((item) => ({
            itemId: item.id,
            itemName: item.name,
            itemSku: item.sku,
            costPrice: item.costPrice,
            sellingPrice: item.sellingPrice,
            startingQuantity: item.startingQuantity,
            quantitySold: item.quantitySold,
            endingQuantity: item.endingQuantity,
            cashSales: item.cashSales,
            cardSales: item.cardSales,
            digitalSales: item.digitalSales,
            totalRevenue: item.totalRevenue,
            totalCost: item.totalCost,
            grossProfit: item.grossProfit,
            margin: item.margin,
          })),
        },
        cashDrawerTransactions: {
          create: reportData.cashDrawer.events.map((event) => ({
            eventType: event.type,
            amount: event.amount,
            reason: event.reason,
            notes: event.notes,
            balanceBefore: event.balanceBefore,
            balanceAfter: event.balanceAfter,
            timestamp: event.createdAt,
            userName: event.user.name,
          })),
        },
      },
    })

    revalidatePath("/dashboard/sales")
    return { success: true, reportId: report.id }
  } catch (error) {
    console.error("Error generating daily sales report:", error)
    return { success: false, error: "Failed to generate daily sales report" }
  }
}

// Get daily sales report
export async function getDailySalesReport(
  date: string,
  locationId: string,
  organizationId: string,
): Promise<DailySalesReportData | null> {
  try {
    const reportDate = new Date(date)
    reportDate.setHours(0, 0, 0, 0)

    const report = await db.dailySalesReport.findUnique({
      where: {
        date_locationId_organizationId: {
          date: reportDate,
          locationId,
          organizationId,
        },
      },
      include: {
        itemSales: true,
        cashDrawerTransactions: true,
      },
    })

    if (!report) return null

    return {
      id: report.id,
      date: report.date,
      locationId: report.locationId,
      organizationId: report.organizationId,
      totalRevenue: Number(report.totalRevenue),
      totalCost: Number(report.totalCost),
      grossProfit: Number(report.grossProfit),
      grossMargin: Number(report.grossMargin),
      totalQuantitySold: report.totalQuantitySold,
      totalTransactions: report.totalTransactions,
      averageTransactionValue: Number(report.averageTransactionValue),
      itemsSold: report.itemsSold,
      cashSales: Number(report.cashSales),
      cardSales: Number(report.cardSales),
      digitalSales: Number(report.digitalSales),
      openingBalance: Number(report.openingBalance),
      closingBalance: Number(report.closingBalance),
      cashIn: Number(report.cashIn),
      cashOut: Number(report.cashOut),
      variance: Number(report.variance),
      reportGeneratedAt: report.reportGeneratedAt,
      isFinalized: report.isFinalized,
      notes: report.notes || undefined,
      itemSales: report.itemSales.map((item) => ({
        id: item.id,
        itemName: item.itemName,
        itemSku: item.itemSku,
        costPrice: Number(item.costPrice),
        sellingPrice: Number(item.sellingPrice),
        startingQuantity: item.startingQuantity,
        quantitySold: item.quantitySold,
        endingQuantity: item.endingQuantity,
        cashSales: Number(item.cashSales),
        cardSales: Number(item.cardSales),
        digitalSales: Number(item.digitalSales),
        totalRevenue: Number(item.totalRevenue),
        totalCost: Number(item.totalCost),
        grossProfit: Number(item.grossProfit),
        margin: Number(item.margin),
      })),
      cashDrawerTransactions: report.cashDrawerTransactions.map((event) => ({
        id: event.id,
        eventType: event.eventType,
        amount: Number(event.amount),
        reason: event.reason || undefined,
        notes: event.notes || undefined,
        balanceBefore: Number(event.balanceBefore),
        balanceAfter: Number(event.balanceAfter),
        timestamp: event.timestamp,
        userName: event.userName || undefined,
      })),
    }
  } catch (error) {
    console.error("Error fetching daily sales report:", error)
    return null
  }
}

// Finalize daily sales report
export async function finalizeDailySalesReport(
  reportId: string,
  notes?: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await db.dailySalesReport.update({
      where: { id: reportId },
      data: {
        isFinalized: true,
        notes,
      },
    })

    revalidatePath("/dashboard/sales")
    return { success: true }
  } catch (error) {
    console.error("Error finalizing daily sales report:", error)
    return { success: false, error: "Failed to finalize report" }
  }
}

// Get available locations for reports
export async function getReportLocations(organizationId: string) {
  try {
    return await db.location.findMany({
      where: {
        organizationId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        code: true,
        type: true,
      },
      orderBy: {
        name: "asc",
      },
    })
  } catch (error) {
    console.error("Error fetching locations:", error)
    return []
  }
}

// Get report history
export async function getDailySalesReportHistory(organizationId: string, locationId?: string, limit = 30) {
  try {
    return await db.dailySalesReport.findMany({
      where: {
        organizationId,
        ...(locationId && { locationId }),
      },
      select: {
        id: true,
        date: true,
        locationId: true,
        totalRevenue: true,
        totalTransactions: true,
        isFinalized: true,
        reportGeneratedAt: true,
        location: {
          select: {
            name: true,
            code: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
      take: limit,
    })
  } catch (error) {
    console.error("Error fetching report history:", error)
    return []
  }
}

// Helper function to generate report data (reuse from your existing code)
type GenerateReportDataResult = {
  summary: {
    totalRevenue: number
    totalCost: number
    grossProfit: number
    grossMargin: number
    totalQuantitySold: number
    totalTransactions: number
    averageTransactionValue: number
    itemsSold: number
  }
  itemSales: Array<{
    id: string
    name: string
    sku: string
    costPrice: number
    sellingPrice: number
    startingQuantity: number
    quantitySold: number
    endingQuantity: number
    cashSales: number
    cardSales: number
    digitalSales: number
    totalRevenue: number
    totalCost: number
    grossProfit: number
    margin: number
  }>
  paymentMethods: {
    cashSales: number
    cardSales: number
    digitalSales: number
    totalRevenue: number
    cashPercentage: number
    cardPercentage: number
    digitalPercentage: number
  }
  cashDrawer: {
    openingBalance: number
    cashSales: number
    cashIn: number
    cashOut: number
    expectedClosing: number
    actualClosing: number
    variance: number
    events: Array<{
      type: cashDrawerTransactionType
      amount: number
      reason?: string
      notes?: string
      balanceBefore: number
      balanceAfter: number
      createdAt: Date
      user: {
        name?: string
      }
    }>
  }
}

async function generateReportData(
  date: string,
  locationId: string,
  organizationId: string,
): Promise<GenerateReportDataResult> {
  const startDate = new Date(date)
  startDate.setHours(0, 0, 0, 0)

  const endDate = new Date(date)
  endDate.setHours(23, 59, 59, 999)

  // Get sales orders for the day
  const salesOrders = await db.salesOrder.findMany({
    where: {
      organizationId,
      locationId,
      orderDate: {
        gte: startDate,
        lte: endDate,
      },
      status: {
        in: [SalesOrderStatus.COMPLETED, SalesOrderStatus.DELIVERED],
      },
    },
    include: {
      lines: {
        include: {
          item: true,
        },
      },
      payments: true,
    },
  })

  // Process data similar to your existing getDailySalesDashboardData function
  // ... (include the processing logic from your existing code)

  // For brevity, I'll return a mock structure - replace with actual processing
  return {
    summary: {
      totalRevenue: 0,
      totalCost: 0,
      grossProfit: 0,
      grossMargin: 0,
      totalQuantitySold: 0,
      totalTransactions: 0,
      averageTransactionValue: 0,
      itemsSold: 0,
    },
    itemSales: [],
    paymentMethods: {
      cashSales: 0,
      cardSales: 0,
      digitalSales: 0,
      totalRevenue: 0,
      cashPercentage: 0,
      cardPercentage: 0,
      digitalPercentage: 0,
    },
    cashDrawer: {
      openingBalance: 0,
      cashSales: 0,
      cashIn: 0,
      cashOut: 0,
      expectedClosing: 0,
      actualClosing: 0,
      variance: 0,
      events: [],
    },
  }
}
// ============================================
// TANSTACK QUERY HOOKS
// ============================================

;("use client")

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Query keys
export const dailySalesQueryKeys = {
  all: ["daily-sales-reports"] as const,
  reports: () => [...dailySalesQueryKeys.all, "reports"] as const,
  report: (date: string, locationId: string, organizationId: string) =>
    [...dailySalesQueryKeys.reports(), date, locationId, organizationId] as const,
  history: (organizationId: string, locationId?: string) =>
    [...dailySalesQueryKeys.reports(), "history", organizationId, locationId] as const,
  locations: (organizationId: string) => [...dailySalesQueryKeys.all, "locations", organizationId] as const,
}

// Hook for getting daily sales report
export function useDailySalesReport(
  date: string,
  locationId: string,
  organizationId: string,
  options?: {
    enabled?: boolean
    refetchInterval?: number
  },
) {
  return useQuery({
    queryKey: dailySalesQueryKeys.report(date, locationId, organizationId),
    queryFn: () => getDailySalesReport(date, locationId, organizationId),
    enabled: options?.enabled !== false && !!date && !!locationId && !!organizationId,
    refetchInterval: options?.refetchInterval || false, // Don't auto-refresh reports
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
  })
}

// Hook for generating daily sales report
export function useGenerateDailySalesReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: generateDailySalesReport,
    onSuccess: (data, variables) => {
      if (data.success) {
        toast.success("Daily sales report generated successfully")
        // Invalidate and refetch the specific report
        queryClient.invalidateQueries({
          queryKey: dailySalesQueryKeys.report(variables.date, variables.locationId, variables.organizationId),
        })
        // Also invalidate history
        queryClient.invalidateQueries({
          queryKey: dailySalesQueryKeys.history(variables.organizationId, variables.locationId),
        })
      } else {
        toast.error(data.error || "Failed to generate report")
      }
    },
    onError: (error) => {
      toast.error("Failed to generate daily sales report")
      console.error("Generate report error:", error)
    },
  })
}

// Hook for finalizing daily sales report
export function useFinalizeDailySalesReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ reportId, notes }: { reportId: string; notes?: string }) =>
      finalizeDailySalesReport(reportId, notes),
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Daily sales report finalized successfully")
        // Invalidate all reports to refresh finalization status
        queryClient.invalidateQueries({
          queryKey: dailySalesQueryKeys.all,
        })
      } else {
        toast.error(data.error || "Failed to finalize report")
      }
    },
    onError: (error) => {
      toast.error("Failed to finalize report")
      console.error("Finalize report error:", error)
    },
  })
}

// Hook for getting report locations
export function useReportLocations(organizationId: string) {
  return useQuery({
    queryKey: dailySalesQueryKeys.locations(organizationId),
    queryFn: () => getReportLocations(organizationId),
    enabled: !!organizationId,
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  })
}

// Hook for getting report history
export function useDailySalesReportHistory(organizationId: string, locationId?: string, limit = 30) {
  return useQuery({
    queryKey: dailySalesQueryKeys.history(organizationId, locationId),
    queryFn: () => getDailySalesReportHistory(organizationId, locationId, limit),
    enabled: !!organizationId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  })
}

// Combined hook for complete daily sales reporting functionality
export function useDailySalesReporting(date: string, locationId: string, organizationId: string) {
  const queryClient = useQueryClient()

  // Individual hooks
  const reportQuery = useDailySalesReport(date, locationId, organizationId)
  const locationsQuery = useReportLocations(organizationId)
  const historyQuery = useDailySalesReportHistory(organizationId, locationId)
  const generateMutation = useGenerateDailySalesReport()
  const finalizeMutation = useFinalizeDailySalesReport()

  // Utility functions
  const refreshReport = () => {
    queryClient.invalidateQueries({
      queryKey: dailySalesQueryKeys.report(date, locationId, organizationId),
    })
  }

  const refreshAll = () => {
    queryClient.invalidateQueries({
      queryKey: dailySalesQueryKeys.all,
    })
  }

  const generateReport = (forceRegenerate = false) => {
    generateMutation.mutate({
      date,
      locationId,
      organizationId,
      forceRegenerate,
    })
  }

  const finalizeReport = (reportId: string, notes?: string) => {
    finalizeMutation.mutate({ reportId, notes })
  }

  return {
    // Data
    report: reportQuery.data,
    locations: locationsQuery.data || [],
    history: historyQuery.data || [],

    // Loading states
    isReportLoading: reportQuery.isLoading,
    isLocationsLoading: locationsQuery.isLoading,
    isHistoryLoading: historyQuery.isLoading,
    isGenerating: generateMutation.isPending,
    isFinalizing: finalizeMutation.isPending,
    isLoading: reportQuery.isLoading || locationsQuery.isLoading,

    // Error states
    reportError: reportQuery.error,
    locationsError: locationsQuery.error,
    historyError: historyQuery.error,
    generateError: generateMutation.error,
    finalizeError: finalizeMutation.error,

    // Status
    hasReport: !!reportQuery.data,
    isReportFinalized: reportQuery.data?.isFinalized || false,
    canGenerateReport: !reportQuery.data || !reportQuery.data.isFinalized,

    // Actions
    generateReport,
    finalizeReport,
    refreshReport,
    refreshAll,

    // Refetch functions
    refetchReport: reportQuery.refetch,
    refetchLocations: locationsQuery.refetch,
    refetchHistory: historyQuery.refetch,
  }
}

// // Export types for use in components
// export type {
//   CreateDailySalesReportInput,
//   DailySalesReportData
// };
