// ============================================
// SERVER ACTIONS (server-side functions)
// ============================================

"use server"

import { revalidatePath } from "next/cache";

import { db } from "@/prisma/db"; // Adjust import path as needed
import {
    cashDrawerTransactionType,
    PaymentMethod,
    PaymentStatus,
    SalesOrderStatus
} from "@prisma/client";

// Types for the dashboard data
export interface DashboardItemSales {
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
}

export interface PaymentMethodSummary {
  cashSales: number
  cardSales: number
  digitalSales: number
  totalRevenue: number
  cashPercentage: number
  cardPercentage: number
  digitalPercentage: number
}

export interface CashDrawerSummary {
  openingBalance: number
  cashSales: number
  cashIn: number
  cashOut: number
  expectedClosing: number
  actualClosing: number
  variance: number
  events: cashDrawerTransaction[]
}

export interface cashDrawerTransaction {
  id: string
  type: cashDrawerTransactionType
  amount: number
  reason?: string
  notes?: string
  balanceBefore: number
  balanceAfter: number
  createdAt: Date
  user: {
    name: string | null
  }
}

export interface DashboardSummary {
  totalRevenue: number
  totalCost: number
  grossProfit: number
  grossMargin: number
  totalQuantitySold: number
  totalTransactions: number
  averageTransactionValue: number
  itemsSold: number
}

export interface DailySalesDashboardData {
  summary: DashboardSummary
  itemSales: DashboardItemSales[]
  paymentMethods: PaymentMethodSummary
  cashDrawer: CashDrawerSummary
  reportDate: string
}

// Main server action to fetch daily sales dashboard data
export async function getDailySalesDashboardData(
  date: string,
  locationId: string,
  organizationId: string
): Promise<DailySalesDashboardData> {
  try {
    const startDate = new Date(date)
    startDate.setHours(0, 0, 0, 0)
    
    const endDate = new Date(date)
    endDate.setHours(23, 59, 59, 999)

    // Fetch all sales orders for the day
    const salesOrders = await db.salesOrder.findMany({
      where: {
        organizationId,
        locationId,
        orderDate: {
          gte: startDate,
          lte: endDate
        },
        status: {
          in: [SalesOrderStatus.COMPLETED, SalesOrderStatus.DELIVERED]
        }
      },
      include: {
        lines: {
          include: {
            item: true
          }
        },
        payments: true
      }
    })

    // Get starting inventory levels
    const startingInventory = await getStartingInventoryLevels(locationId, startDate)
    
    // Get ending inventory levels
    const endingInventory = await getEndingInventoryLevels(locationId, endDate)

    // Get cash drawer data
    const cashDrawerData = await getCashDrawerData(locationId, startDate, endDate)

    // Process the data
    const itemSalesMap = new Map<string, DashboardItemSales>()
    let totalRevenue = 0
    let totalCost = 0
    let totalQuantitySold = 0
    let cashSales = 0
    let cardSales = 0
    let digitalSales = 0

    // Process sales orders and build item sales data
    for (const order of salesOrders) {
      for (const line of order.lines) {
        const itemId = line.itemId
        const item = line.item
        
        if (!itemSalesMap.has(itemId)) {
          itemSalesMap.set(itemId, {
            id: itemId,
            name: item.name,
            sku: item.sku,
            costPrice: item.costPrice,
            sellingPrice: item.sellingPrice,
            startingQuantity: startingInventory.get(itemId) || 0,
            quantitySold: 0,
            endingQuantity: endingInventory.get(itemId) || 0,
            cashSales: 0,
            cardSales: 0,
            digitalSales: 0,
            totalRevenue: 0,
            totalCost: 0,
            grossProfit: 0,
            margin: 0
          })
        }

        const itemSales = itemSalesMap.get(itemId)!
        itemSales.quantitySold += line.quantity
        itemSales.totalRevenue += line.lineTotal
        itemSales.totalCost += (line.quantity * item.costPrice)
        
        totalQuantitySold += line.quantity
        totalRevenue += line.lineTotal
        totalCost += (line.quantity * item.costPrice)
      }

      // Process payments for this order
      const orderPayments = order.payments.filter(p => p.status === PaymentStatus.PAID)
      for (const payment of orderPayments) {
        switch (payment.method) {
          case PaymentMethod.CASH:
            cashSales += payment.amount
            break
          case PaymentMethod.CARD:
            cardSales += payment.amount
            break
          case PaymentMethod.DIGITAL:
            digitalSales += payment.amount
            break
        }
      }
    }

    // Distribute payment amounts across items proportionally
    const itemSales = Array.from(itemSalesMap.values())
    for (const item of itemSales) {
      if (totalRevenue > 0) {
        const itemProportion = item.totalRevenue / totalRevenue
        item.cashSales = cashSales * itemProportion
        item.cardSales = cardSales * itemProportion
        item.digitalSales = digitalSales * itemProportion
      }
      
      item.grossProfit = item.totalRevenue - item.totalCost
      item.margin = item.totalRevenue > 0 ? (item.grossProfit / item.totalRevenue) * 100 : 0
    }

    // Calculate summary metrics
    const summary: DashboardSummary = {
      totalRevenue,
      totalCost,
      grossProfit: totalRevenue - totalCost,
      grossMargin: totalRevenue > 0 ? ((totalRevenue - totalCost) / totalRevenue) * 100 : 0,
      totalQuantitySold,
      totalTransactions: salesOrders.length,
      averageTransactionValue: salesOrders.length > 0 ? totalRevenue / salesOrders.length : 0,
      itemsSold: itemSales.length
    }

    // Payment method summary
    const paymentMethods: PaymentMethodSummary = {
      cashSales,
      cardSales,
      digitalSales,
      totalRevenue,
      cashPercentage: totalRevenue > 0 ? (cashSales / totalRevenue) * 100 : 0,
      cardPercentage: totalRevenue > 0 ? (cardSales / totalRevenue) * 100 : 0,
      digitalPercentage: totalRevenue > 0 ? (digitalSales / totalRevenue) * 100 : 0
    }

    return {
      summary,
      itemSales,
      paymentMethods,
      cashDrawer: cashDrawerData,
      reportDate: date
    }

  } catch (error) {
    console.error('Error fetching daily sales dashboard data:', error)
    throw new Error('Failed to fetch daily sales dashboard data')
  }
}

// Helper function to get starting inventory levels
async function getStartingInventoryLevels(
  locationId: string, 
  date: Date
): Promise<Map<string, number>> {
  const inventoryLevels = await db.inventoryLevel.findMany({
    where: {
      locationId
    },
    select: {
      itemId: true,
      quantityOnHand: true
    }
  })

  // Get transactions that happened before this date to calculate starting balance
  const transactions = await db.inventoryTransaction.findMany({
    where: {
      locationId,
      createdAt: {
        lt: date
      }
    },
    orderBy: {
      createdAt: 'asc'
    }
  })

  const startingLevels = new Map<string, number>()
  
  // Calculate starting levels by subtracting today's transactions from current levels
  for (const level of inventoryLevels) {
    const todayTransactions = await db.inventoryTransaction.findMany({
      where: {
        locationId,
        itemId: level.itemId,
        createdAt: {
          gte: date,
          lte: new Date(date.getTime() + 24 * 60 * 60 * 1000)
        }
      }
    })

    const todayChange = todayTransactions.reduce((sum, t) => sum + t.quantity, 0)
    startingLevels.set(level.itemId, level.quantityOnHand - todayChange)
  }

  return startingLevels
}

// Helper function to get ending inventory levels
async function getEndingInventoryLevels(
  locationId: string, 
  date: Date
): Promise<Map<string, number>> {
  const inventoryLevels = await db.inventoryLevel.findMany({
    where: {
      locationId
    },
    select: {
      itemId: true,
      quantityOnHand: true
    }
  })

  const endingLevels = new Map<string, number>()
  
  for (const level of inventoryLevels) {
    endingLevels.set(level.itemId, level.quantityOnHand)
  }

  return endingLevels
}

// Helper function to get cash drawer data
async function getCashDrawerData(
  locationId: string,
  startDate: Date,
  endDate: Date
): Promise<CashDrawerSummary> {
  // Get the cash drawer for this location
  const cashDrawer = await db.cashDrawer.findFirst({
    where: {
      locationId
    }
  })

  if (!cashDrawer) {
    return {
      openingBalance: 0,
      cashSales: 0,
      cashIn: 0,
      cashOut: 0,
      expectedClosing: 0,
      actualClosing: 0,
      variance: 0,
      events: []
    }
  }

  // Get cash drawer events for the day
  const events = await db.cashDrawerTransaction.findMany({
    where: {
      cashDrawerId: cashDrawer.id,
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    },
    include: {
      user: {
        select: {
          name: true
        }
      }
    },
    orderBy: {
      createdAt: 'asc'
    }
  })

  let openingBalance = 0
  let cashIn = 0
  let cashOut = 0
  let cashSales = 0
  let closingBalance = 0

  for (const event of events) {
    switch (event.type) {
      case cashDrawerTransactionType.OPENING_BALANCE:
        openingBalance = event.amount
        break
      case cashDrawerTransactionType.SALE:
        cashSales += event.amount
        break
      case cashDrawerTransactionType.CASH_IN:
        cashIn += event.amount
        break
      case cashDrawerTransactionType.CASH_OUT:
        cashOut += event.amount
        break
      case cashDrawerTransactionType.CLOSING_BALANCE:
        closingBalance = event.amount
        break
    }
  }

  const expectedClosing = openingBalance + cashSales + cashIn - cashOut
  const actualClosing = closingBalance || expectedClosing
  const variance = actualClosing - expectedClosing

  return {
    openingBalance,
    cashSales,
    cashIn,
    cashOut,
    expectedClosing,
    actualClosing,
    variance,
    events: events.map(event => ({
      id: event.id,
      type: event.type,
      amount: event.amount,
      reason: event.reason ?? undefined,
      notes: event.notes ?? undefined,
      balanceBefore: event.balanceBefore,
      balanceAfter: event.balanceAfter,
      createdAt: event.createdAt,
      user: {
        name: event.user.name
      }
    }))
  }
}

// Additional helper functions

export async function getAvailableLocations(organizationId: string) {
  return await db.location.findMany({
    where: {
      organizationId,
      isActive: true
    },
    select: {
      id: true,
      name: true,
      code: true,
      type: true
    },
    orderBy: {
      name: 'asc'
    }
  })
}

export async function getDailySalesReport(
  date: string,
  locationId: string,
  organizationId: string
) {
  const reportDate = new Date(date)
  
  return await db.dailySalesReport.findUnique({
    where: {
      date_locationId_organizationId: {
        date: reportDate,
        locationId,
        organizationId
      }
    }
  })
}

// ============================================
// TANSTACK QUERY HOOKS (client-side)
// ============================================

"use client"

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner'; // Adjust based on your notification library

// Query keys
export const dashboardQueryKeys = {
  all: ['dashboard'] as const,
  dailySales: (date: string, locationId: string, organizationId: string) => 
    [...dashboardQueryKeys.all, 'daily-sales', date, locationId, organizationId] as const,
  locations: (organizationId: string) => 
    [...dashboardQueryKeys.all, 'locations', organizationId] as const,
  dailyReport: (date: string, locationId: string, organizationId: string) =>
    [...dashboardQueryKeys.all, 'daily-report', date, locationId, organizationId] as const,
}

// Custom hook for daily sales dashboard data
export function useDailySalesDashboard(
  date: string,
  locationId: string,
  organizationId: string,
  options?: {
    enabled?: boolean
    refetchInterval?: number
  }
) {
  return useQuery({
    queryKey: dashboardQueryKeys.dailySales(date, locationId, organizationId),
    queryFn: () => getDailySalesDashboardData(date, locationId, organizationId),
    enabled: options?.enabled !== false && !!date && !!locationId && !!organizationId,
    refetchInterval: options?.refetchInterval || 5 * 60 * 1000, // Refetch every 5 minutes
    staleTime: 2 * 60 * 1000, // Consider data stale after 2 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}

// Custom hook for available locations
export function useAvailableLocations(organizationId: string) {
  return useQuery({
    queryKey: dashboardQueryKeys.locations(organizationId),
    queryFn: () => getAvailableLocations(organizationId),
    enabled: !!organizationId,
    staleTime: 10 * 60 * 1000, // Locations don't change often
    gcTime: 30 * 60 * 1000,
  })
}

// Custom hook for daily sales report
export function useDailySalesReport(
  date: string,
  locationId: string,
  organizationId: string
) {
  return useQuery({
    queryKey: dashboardQueryKeys.dailyReport(date, locationId, organizationId),
    queryFn: () => getDailySalesReport(date, locationId, organizationId),
    enabled: !!date && !!locationId && !!organizationId,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  })
}

// Custom hook with combined dashboard functionality
export function useDashboardData(
  date: string,
  locationId: string,
  organizationId: string
) {
  const queryClient = useQueryClient()
  
  const dashboardQuery = useDailySalesDashboard(date, locationId, organizationId)
  const locationsQuery = useAvailableLocations(organizationId)
  const reportQuery = useDailySalesReport(date, locationId, organizationId)

  const refreshDashboard = useMutation({
    mutationFn: async () => {
      await queryClient.invalidateQueries({
        queryKey: dashboardQueryKeys.dailySales(date, locationId, organizationId)
      })
      await queryClient.refetchQueries({
        queryKey: dashboardQueryKeys.dailySales(date, locationId, organizationId)
      })
    },
    onSuccess: () => {
      toast.success('Dashboard data refreshed successfully')
    },
    onError: (error) => {
      toast.error('Failed to refresh dashboard data')
      console.error('Dashboard refresh error:', error)
    }
  })

  const exportDashboard = useMutation({
    mutationFn: async (format: 'csv' | 'pdf' | 'excel') => {
      // Implementation for export functionality
      const data = dashboardQuery.data
      if (!data) throw new Error('No data to export')
      
      // You can implement specific export logic here
      // For now, we'll just return the data
      return { format, data }
    },
    onSuccess: (result) => {
      toast.success(`Dashboard exported as ${result.format.toUpperCase()}`)
    },
    onError: (error) => {
      toast.error('Failed to export dashboard')
      console.error('Export error:', error)
    }
  })

  return {
    // Data
    dashboard: dashboardQuery.data,
    locations: locationsQuery.data,
    report: reportQuery.data,
    
    // Loading states
    isDashboardLoading: dashboardQuery.isLoading,
    isLocationsLoading: locationsQuery.isLoading,
    isReportLoading: reportQuery.isLoading,
    isLoading: dashboardQuery.isLoading || locationsQuery.isLoading,
    
    // Error states
    dashboardError: dashboardQuery.error,
    locationsError: locationsQuery.error,
    reportError: reportQuery.error,
    hasError: !!dashboardQuery.error || !!locationsQuery.error,
    
    // Refetch functions
    refetchDashboard: dashboardQuery.refetch,
    refetchLocations: locationsQuery.refetch,
    refetchReport: reportQuery.refetch,
    
    // Mutations
    refreshDashboard: refreshDashboard.mutate,
    exportDashboard: exportDashboard.mutate,
    isRefreshing: refreshDashboard.isPending,
    isExporting: exportDashboard.isPending,
    
    // Utility functions
    invalidateAll: () => {
      queryClient.invalidateQueries({
        queryKey: dashboardQueryKeys.all
      })
    },
    
    // Status checks
    isSuccess: dashboardQuery.isSuccess && locationsQuery.isSuccess,
    isInitialLoading: dashboardQuery.isLoading && dashboardQuery.isFetching,
  }
}

// Provider component for React Query (optional)
import { QueryClient } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error instanceof Error && error.message.includes('4')) {
          return false
        }
        return failureCount < 3
      },
    },
    mutations: {
      retry: 1,
    },
  },
})

// Create sales order
export async function createSalesOrder(data: {
  customerId: string
  locationId: string
  organizationId: string
  lines: Array<{
    itemId: string
    quantity: number
    unitPrice: number
    discount?: number
    taxRate?: number
  }>
  discount?: number
  notes?: string
}) {
  try {
    const orderNumber = `SO-${Date.now()}`

    // Calculate totals
    let subtotal = 0
    let totalTax = 0

    const processedLines = data.lines.map((line) => {
      const lineSubtotal = line.quantity * line.unitPrice - (line.discount || 0)
      const lineTax = (lineSubtotal * (line.taxRate || 0)) / 100

      subtotal += lineSubtotal
      totalTax += lineTax

      return {
        itemId: line.itemId,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        discount: line.discount || 0,
        taxRate: line.taxRate || 0,
        taxAmount: lineTax,
        lineTotal: lineSubtotal + lineTax,
      }
    })

    const total = subtotal + totalTax - (data.discount || 0)

    const salesOrder = await db.salesOrder.create({
      data: {
        orderNumber,
        customerId: data.customerId,
        locationId: data.locationId,
        organizationId: data.organizationId,
        subtotal,
        taxAmount: totalTax,
        discount: data.discount || 0,
        total,
        status: "DRAFT",
        paymentStatus: "PENDING",
        notes: data.notes,
        lines: {
          create: processedLines,
        },
      },
      include: {
        lines: {
          include: {
            item: true,
          },
        },
        customer: true,
        payments: true,
      },
    })

    revalidatePath("/dashboard/sales")
    return { success: true, salesOrder }
  } catch (error) {
    console.error("Error creating sales order:", error)
    return { success: false, error: "Failed to create sales order" }
  }
}

// Process sales order (confirm and reserve inventory)
export async function processSalesOrder(salesOrderId: string) {
  try {
    const salesOrder = await db.salesOrder.findUnique({
      where: { id: salesOrderId },
      include: {
        lines: {
          include: {
            item: true,
          },
        },
      },
    })

    if (!salesOrder) {
      return { success: false, error: "Sales order not found" }
    }

    if (salesOrder.status !== "DRAFT") {
      return { success: false, error: "Order is already processed" }
    }

    // Check inventory availability
    for (const line of salesOrder.lines) {
      const inventoryLevel = await db.inventoryLevel.findUnique({
        where: {
          itemId_locationId: {
            itemId: line.itemId,
            locationId: salesOrder.locationId,
          },
        },
      })

      if (!inventoryLevel || inventoryLevel.quantityAvailable < line.quantity) {
        return {
          success: false,
          error: `Insufficient inventory for ${line.item.name}`,
        }
      }
    }

    // Reserve inventory and create transactions
    for (const line of salesOrder.lines) {
      // Update inventory level
      await db.inventoryLevel.update({
        where: {
          itemId_locationId: {
            itemId: line.itemId,
            locationId: salesOrder.locationId,
          },
        },
        data: {
          quantityReserved: {
            increment: line.quantity,
          },
          quantityAvailable: {
            decrement: line.quantity,
          },
        },
      })

      // Create inventory transaction
      await db.inventoryTransaction.create({
        data: {
          type: "SALE",
          quantity: -line.quantity,
          unitCost: line.item.costPrice,
          totalCost: line.quantity * line.item.costPrice,
          itemId: line.itemId,
          locationId: salesOrder.locationId,
          organizationId: salesOrder.organizationId,
          referenceType: "SALES_ORDER",
          referenceId: salesOrderId,
          referenceNumber: salesOrder.orderNumber,
          balanceAfter: 0, // Will be updated by trigger
          notes: `Sale to customer`,
        },
      })
    }

    // Update sales order status
    await db.salesOrder.update({
      where: { id: salesOrderId },
      data: { status: "CONFIRMED" },
    })

    revalidatePath("/dashboard/sales")
    return { success: true }
  } catch (error) {
    console.error("Error processing sales order:", error)
    return { success: false, error: "Failed to process sales order" }
  }
}

// Add payment to sales order
export async function addPaymentToSalesOrder(data: {
  salesOrderId: string
  amount: number
  method: PaymentMethod
  cardType?: string
  cardLast4?: string
  transactionId?: string
  cashTendered?: number
  changeGiven?: number
}) {
  try {
    const paymentNumber = `PAY-${Date.now()}`

    const payment = await db.payment.create({
      data: {
        paymentNumber,
        amount: data.amount,
        method: data.method,
        status: PaymentStatus.PAID,
        salesOrderId: data.salesOrderId,
        cardType: data.cardType,
        cardLast4: data.cardLast4,
        transactionId: data.transactionId,
        cashTendered: data.cashTendered,
        changeGiven: data.changeGiven,
        processedAt: new Date(),
      },
    })

    // Check if order is fully paid
    const salesOrder = await db.salesOrder.findUnique({
      where: { id: data.salesOrderId },
      include: { payments: true },
    })

    if (salesOrder) {
      const totalPaid = salesOrder.payments.reduce((sum, p) => sum + p.amount, 0)

      if (totalPaid >= salesOrder.total) {
        await db.salesOrder.update({
          where: { id: data.salesOrderId },
          data: {
            paymentStatus: PaymentStatus.PAID,
            status: SalesOrderStatus.CONFIRMED,
          },
        })
      }
    }

    revalidatePath("/dashboard/sales")
    return { success: true, payment }
  } catch (error) {
    console.error("Error adding payment:", error)
    return { success: false, error: "Failed to add payment" }
  }
}

// Get sales orders
export async function getSalesOrders(
  organizationId: string,
  locationId?: string,
  status?: SalesOrderStatus,
  limit = 50
) {
  try {
    const salesOrders = await db.salesOrder.findMany({
      where: {
        organizationId,
        ...(locationId && { locationId }),
        ...(status && { status }),
      },
      include: {
        customer: true,
        location: true,
        lines: {
          include: {
            item: true,
          },
        },
        payments: true,
        createdBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    })

    return salesOrders
  } catch (error) {
    console.error("Error fetching sales orders:", error)
    return []
  }
}

// Get sales analytics
export async function getSalesAnalytics(organizationId: string, locationId?: string, startDate?: Date, endDate?: Date) {
  try {
    const whereClause = {
      organizationId,
      ...(locationId && { locationId }),
      status: SalesOrderStatus.COMPLETED,
      ...(startDate &&
        endDate && {
          orderDate: {
            gte: startDate,
            lte: endDate,
          },
        }),
    }

    const [totalSales, totalOrders, topItems] = await Promise.all([
      // Total sales amount
      db.salesOrder.aggregate({
        where: whereClause,
        _sum: {
          total: true,
        },
      }),

      // Total number of orders
      db.salesOrder.count({
        where: whereClause,
      }),

      // Top selling items
      db.salesOrderLine.groupBy({
        by: ["itemId"],
        where: {
          salesOrder: whereClause,
        },
        _sum: {
          quantity: true,
          lineTotal: true,
        },
        orderBy: {
          _sum: {
            quantity: "desc",
          },
        },
        take: 10,
      }),
    ])

    // Get item details for top items
    const topItemsWithDetails = await Promise.all(
      topItems.map(async (item) => {
        const itemDetails = await db.item.findUnique({
          where: { id: item.itemId },
          select: {
            name: true,
            sku: true,
            sellingPrice: true,
          },
        })

        return {
          ...item,
          item: itemDetails,
        }
      }),
    )

    return {
      totalSales: totalSales._sum.total || 0,
      totalOrders,
      averageOrderValue: totalOrders > 0 ? (totalSales._sum.total || 0) / totalOrders : 0,
      topItems: topItemsWithDetails,
    }
  } catch (error) {
    console.error("Error fetching sales analytics:", error)
    return {
      totalSales: 0,
      totalOrders: 0,
      averageOrderValue: 0,
      topItems: [],
    }
  }
}
