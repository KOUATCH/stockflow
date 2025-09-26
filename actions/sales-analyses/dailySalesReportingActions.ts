"use server"

import type { DailySalesReport, FinalizeReportParams, GenerateReportParams, Location, ReportHistory } from "@/types/dailySalesReportingTypes"
import { revalidatePath } from "next/cache"

// Mock database - In production, replace with actual database calls
const mockDatabase = {
  reports: new Map<string, DailySalesReport>(),
  locations: [
    { id: "1", name: "Main Store", code: "MS001", type: "STORE" as const },
    { id: "2", name: "Downtown Branch", code: "DT002", type: "STORE" as const },
    { id: "3", name: "Warehouse", code: "WH001", type: "WAREHOUSE" as const },
  ] as Location[],
}

// Generate mock report data
function generateMockReport(date: string, locationId: string, organizationId: string): DailySalesReport {
  const reportDate = new Date(date)
  const reportId = `${date}-${locationId}-${organizationId}`

  return {
    id: reportId,
    date: reportDate,
    locationId,
    organizationId,
    totalRevenue: 2450.75 + Math.random() * 1000,
    totalCost: 1470.45 + Math.random() * 500,
    grossProfit: 980.3 + Math.random() * 500,
    grossMargin: 35.0 + Math.random() * 10,
    totalQuantitySold: 125 + Math.floor(Math.random() * 50),
    totalTransactions: 18 + Math.floor(Math.random() * 10),
    averageTransactionValue: 136.15 + Math.random() * 50,
    itemsSold: 8 + Math.floor(Math.random() * 5),
    cashSales: 735.23 + Math.random() * 300,
    cardSales: 1225.52 + Math.random() * 500,
    digitalSales: 490.0 + Math.random() * 200,
    openingBalance: 500.0,
    closingBalance: 1235.23 + Math.random() * 200,
    cashIn: 200.0 + Math.random() * 100,
    cashOut: 150.0 + Math.random() * 50,
    variance: -25.5 + Math.random() * 51,
    reportGeneratedAt: new Date(),
    isFinalized: false,
    notes: "",
    itemSales: [
      {
        id: "1",
        itemName: "Premium Coffee Beans",
        itemSku: "COF-001",
        costPrice: 12.5,
        sellingPrice: 18.99,
        startingQuantity: 25,
        quantitySold: 8 + Math.floor(Math.random() * 5),
        endingQuantity: 17 - Math.floor(Math.random() * 3),
        cashSales: 75.96 + Math.random() * 30,
        cardSales: 75.96 + Math.random() * 40,
        digitalSales: Math.random() * 20,
        totalRevenue: 151.92 + Math.random() * 50,
        totalCost: 100.0 + Math.random() * 20,
        grossProfit: 51.92 + Math.random() * 30,
        margin: 34.2 + Math.random() * 5,
      },
      {
        id: "2",
        itemName: "Organic Green Tea",
        itemSku: "TEA-002",
        costPrice: 8.0,
        sellingPrice: 12.5,
        startingQuantity: 30,
        quantitySold: 12 + Math.floor(Math.random() * 8),
        endingQuantity: 18 - Math.floor(Math.random() * 5),
        cashSales: 50.0 + Math.random() * 25,
        cardSales: 100.0 + Math.random() * 50,
        digitalSales: Math.random() * 15,
        totalRevenue: 150.0 + Math.random() * 40,
        totalCost: 96.0 + Math.random() * 15,
        grossProfit: 54.0 + Math.random() * 25,
        margin: 36.0 + Math.random() * 4,
      },
    ],
    cashDrawerTransactions: [
      {
        id: "1",
        eventType: "OPENING_BALANCE",
        amount: 500.0,
        balanceBefore: 0.0,
        balanceAfter: 500.0,
        timestamp: new Date(reportDate.getTime() + 8 * 60 * 60 * 1000), // 8 AM
        userName: "John Doe",
        notes: "Daily opening balance",
      },
      {
        id: "2",
        eventType: "CASH_IN",
        amount: 200.0,
        balanceBefore: 500.0,
        balanceAfter: 700.0,
        timestamp: new Date(reportDate.getTime() + 14 * 60 * 60 * 1000), // 2 PM
        userName: "Jane Smith",
        notes: "Cash deposit from bank",
      },
    ],
  }
}

export async function getDailySalesReport(
  date: string,
  locationId: string,
  organizationId: string,
): Promise<DailySalesReport | null> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  const reportId = `${date}-${locationId}-${organizationId}`

  // Check if report exists in mock database
  if (mockDatabase.reports.has(reportId)) {
    return mockDatabase.reports.get(reportId)!
  }

  return null
}

export async function generateDailySalesReport(params: GenerateReportParams): Promise<{
  success: boolean
  data?: DailySalesReport
  error?: string
}> {
  try {
    // Simulate report generation delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const reportId = `${params.date}-${params.locationId}-${params.organizationId}`

    // Check if report already exists and forceRegenerate is false
    if (mockDatabase.reports.has(reportId) && !params.forceRegenerate) {
      return {
        success: false,
        error: "Report already exists for this date and location. Use force regenerate to override.",
      }
    }

    // Generate new report
    const report = generateMockReport(params.date, params.locationId, params.organizationId)
    mockDatabase.reports.set(reportId, report)

    revalidatePath("/dashboard/sales")

    return {
      success: true,
      data: report,
    }
  } catch (error) {
    return {
      success: false,
      error: "Failed to generate report. Please try again.",
    }
  }
}

export async function finalizeDailySalesReport(params: FinalizeReportParams): Promise<{
  success: boolean
  data?: DailySalesReport
  error?: string
}> {
  try {
    // Simulate finalization delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Find report in mock database
    const report = Array.from(mockDatabase.reports.values()).find((r) => r.id === params.reportId)

    if (!report) {
      return {
        success: false,
        error: "Report not found",
      }
    }

    if (report.isFinalized) {
      return {
        success: false,
        error: "Report is already finalized",
      }
    }

    // Update report
    const updatedReport = {
      ...report,
      isFinalized: true,
      notes: params.notes || report.notes,
    }

    mockDatabase.reports.set(report.id, updatedReport)

    revalidatePath("/dashboard/sales")

    return {
      success: true,
      data: updatedReport,
    }
  } catch (error) {
    return {
      success: false,
      error: "Failed to finalize report. Please try again.",
    }
  }
}

export async function getLocations(organizationId: string): Promise<Location[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  // In production, filter by organizationId
  return mockDatabase.locations
}

export async function getReportHistory(
  organizationId: string,
  locationId?: string,
  limit = 50,
): Promise<ReportHistory[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 400))

  const reports = Array.from(mockDatabase.reports.values())
    .filter((report) => {
      if (report.organizationId !== organizationId) return false
      if (locationId && report.locationId !== locationId) return false
      return true
    })
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, limit)
    .map((report) => ({
      id: report.id,
      date: report.date,
      locationId: report.locationId,
      totalRevenue: report.totalRevenue,
      totalTransactions: report.totalTransactions,
      isFinalized: report.isFinalized,
      reportGeneratedAt: report.reportGeneratedAt,
      location: mockDatabase.locations.find((l) => l.id === report.locationId)!,
    }))

  return reports
}

export async function exportDailySalesReport(
  reportId: string,
  format: "pdf" | "csv" | "excel",
): Promise<{
  success: boolean
  downloadUrl?: string
  error?: string
}> {
  try {
    // Simulate export processing
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const report = Array.from(mockDatabase.reports.values()).find((r) => r.id === reportId)

    if (!report) {
      return {
        success: false,
        error: "Report not found",
      }
    }

    // In production, generate actual file and return download URL
    const mockDownloadUrl = `/api/exports/${reportId}.${format}`

    return {
      success: true,
      downloadUrl: mockDownloadUrl,
    }
  } catch (error) {
    return {
      success: false,
      error: "Failed to export report. Please try again.",
    }
  }
}
