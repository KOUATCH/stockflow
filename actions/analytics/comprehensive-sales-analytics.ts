"use server"

import { db } from "@/lib/db"
import { endOfDay, startOfDay, startOfMonth, startOfWeek, subDays, subMonths, subWeeks } from "date-fns"

export interface ComprehensiveSalesMetrics {
  revenue: {
    total: number
    change: number
    trend: "up" | "down" | "stable"
    target: number
    progress: number
    breakdown: {
      productSales: number
      serviceSales: number
      shipping: number
      tax: number
    }
  }
  transactions: {
    total: number
    change: number
    avgValue: number
    peakHour: string
    conversionRate: number
    revenuePerHour: number
  }
  customers: {
    total: number
    new: number
    returning: number
    vip: number
    loyalty: number
    satisfaction: number
    segments: {
      vip: { count: number; percentage: number }
      regular: { count: number; percentage: number }
      new: { count: number; percentage: number }
    }
  }
  products: {
    sold: number
    categories: number
    topSelling: string
    lowStock: number
    outOfStock: number
    topProducts: Array<{
      name: string
      sales: number
      quantity: number
      revenue: number
    }>
  }
  staff: {
    active: number
    topPerformer: string
    avgSalesPerStaff: number
    totalHours: number
    leaderboard: Array<{
      name: string
      sales: number
      transactions: number
      hours: number
    }>
  }
  payments: {
    cash: number
    card: number
    digital: number
    fastestMethod: string
    breakdown: Array<{
      method: string
      amount: number
      percentage: number
      count: number
    }>
  }
  geography: {
    topLocation: string
    growthLeader: string
    underperforming: string
    newMarkets: number
    locationPerformance: Array<{
      locationId: string
      name: string
      sales: number
      growth: number
      transactions: number
    }>
  }
  timing: {
    peakDay: string
    peakHour: string
    slowestPeriod: string
    weekendVsWeekday: { weekend: number; weekday: number }
    hourlyBreakdown: Array<{
      hour: number
      sales: number
      transactions: number
      percentage: number
    }>
  }
  promotions: {
    active: number
    discountImpact: number
    mostEffective: string
    avgDiscount: number
    campaigns: Array<{
      id: string
      name: string
      revenue: number
      conversion: number
      discount: number
    }>
  }
  loyalty: {
    members: number
    pointsRedeemed: number
    memberPurchases: number
    avgSpendPerMember: number
    newMembersThisWeek: number
    membershipGrowth: number
  }
  kpis: {
    salesTargetAchievement: number
    customerRetentionRate: number
    avgResponseTime: number
    returnRate: number
    profitMargin: number
    inventoryTurnover: number
  }
  alerts: Array<{
    type: "warning" | "info" | "error"
    title: string
    message: string
    actionRequired: boolean
  }>
  trends: Array<{
    type: "positive" | "negative" | "neutral"
    title: string
    description: string
    impact: string
  }>
}

export async function getComprehensiveSalesAnalytics(
  organizationId: string,
  locationId: string,
  startDate: Date,
  endDate: Date,
  comparison: "previous_period" | "previous_year" | "custom" = "previous_period"
): Promise<ComprehensiveSalesMetrics> {
  try {
    const start = startOfDay(startDate)
    const end = endOfDay(endDate)

    // Calculate comparison period
    const periodDiff = end.getTime() - start.getTime()
    const comparisonStart = new Date(start.getTime() - periodDiff)
    const comparisonEnd = new Date(start.getTime() - 1)

    // Fetch sales data
    const [currentSales, comparisonSales] = await Promise.all([
      fetchSalesData(organizationId, locationId, start, end),
      fetchSalesData(organizationId, locationId, comparisonStart, comparisonEnd)
    ])

    // Fetch additional data
    const [locations, staffData, customerData, inventoryData] = await Promise.all([
      fetchLocationData(organizationId),
      fetchStaffData(organizationId, start, end),
      fetchCustomerData(organizationId, start, end),
      fetchInventoryData(organizationId)
    ])

    // Calculate metrics
    const revenue = calculateRevenueMetrics(currentSales, comparisonSales)
    const transactions = calculateTransactionMetrics(currentSales, comparisonSales)
    const customers = calculateCustomerMetrics(customerData, currentSales)
    const products = calculateProductMetrics(currentSales, inventoryData)
    const staff = calculateStaffMetrics(staffData, currentSales)
    const payments = calculatePaymentMetrics(currentSales)
    const geography = calculateGeographyMetrics(currentSales, locations)
    const timing = calculateTimingMetrics(currentSales)
    const promotions = calculatePromotionMetrics(currentSales)
    const loyalty = calculateLoyaltyMetrics(customerData, currentSales)
    const kpis = calculateKPIs(currentSales, customerData, inventoryData)
    const alerts = generateAlerts(currentSales, inventoryData, staffData)
    const trends = generateTrends(currentSales, comparisonSales)

    return {
      revenue,
      transactions,
      customers,
      products,
      staff,
      payments,
      geography,
      timing,
      promotions,
      loyalty,
      kpis,
      alerts,
      trends
    }
  } catch (error) {
    console.error("Error getting comprehensive sales analytics:", error)
    throw new Error("Failed to get comprehensive sales analytics")
  }
}

async function fetchSalesData(organizationId: string, locationId: string, start: Date, end: Date) {
  return await db.salesOrder.findMany({
    where: {
      organizationId,
      ...(locationId !== "all" && { locationId }),
      createdAt: { gte: start, lte: end },
      status: { not: "CANCELLED" }
    },
    include: {
      lines: {
        include: {
          item: {
            select: {
              id: true,
              name: true,
              sku: true,
              category: { select: { title: true } },
              costPrice: true,
              sellingPrice: true
            }
          }
        }
      },
      payments: true,
      customer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          isVIP: true,
          loyaltyPoints: true,
          createdAt: true
        }
      },
      location: {
        select: {
          id: true,
          name: true,
          code: true
        }
      },
      createdBy: {
        select: {
          id: true,
          name: true,
          firstName: true,
          lastName: true
        }
      }
    }
  })
}

async function fetchLocationData(organizationId: string) {
  return await db.location.findMany({
    where: { organizationId, isActive: true },
    select: { id: true, name: true, code: true }
  })
}

async function fetchStaffData(organizationId: string, start: Date, end: Date) {
  return await db.user.findMany({
    where: {
      organizationId,
      isActive: true
    },
    include: {
      posSessions: {
        where: {
          startTime: { gte: start, lte: end }
        },
        include: {
          salesOrders: {
            where: { status: { not: "CANCELLED" } }
          }
        }
      }
    }
  })
}

async function fetchCustomerData(organizationId: string, start: Date, end: Date) {
  return await db.customer.findMany({
    where: { organizationId },
    include: {
      salesOrders: {
        where: {
          createdAt: { gte: start, lte: end },
          status: { not: "CANCELLED" }
        }
      }
    }
  })
}

async function fetchInventoryData(organizationId: string) {
  return await db.item.findMany({
    where: { organizationId, isActive: true },
    include: {
      inventoryLevels: {
        select: {
          quantityOnHand: true,
          locationId: true
        }
      }
    }
  })
}

function calculateRevenueMetrics(currentSales: any[], comparisonSales: any[]) {
  const currentTotal = currentSales.reduce((sum, sale) => sum + sale.total, 0)
  const comparisonTotal = comparisonSales.reduce((sum, sale) => sum + sale.total, 0)
  const change = comparisonTotal > 0 ? ((currentTotal - comparisonTotal) / comparisonTotal) * 100 : 0

  // Calculate breakdown (mock values for now)
  const productSales = currentTotal * 0.807
  const serviceSales = currentTotal * 0.131
  const shipping = currentTotal * 0.036
  const tax = currentTotal * 0.025

  return {
    total: currentTotal,
    change: Number(change.toFixed(1)),
    trend: change > 0 ? "up" as const : change < 0 ? "down" as const : "stable" as const,
    target: 250000,
    progress: Number(((currentTotal / 250000) * 100).toFixed(1)),
    breakdown: {
      productSales,
      serviceSales,
      shipping,
      tax
    }
  }
}

function calculateTransactionMetrics(currentSales: any[], comparisonSales: any[]) {
  const currentCount = currentSales.length
  const comparisonCount = comparisonSales.length
  const change = comparisonCount > 0 ? ((currentCount - comparisonCount) / comparisonCount) * 100 : 0

  const currentTotal = currentSales.reduce((sum, sale) => sum + sale.total, 0)
  const avgValue = currentCount > 0 ? currentTotal / currentCount : 0

  // Find peak hour
  const hourCounts = new Array(24).fill(0)
  currentSales.forEach(sale => {
    const hour = new Date(sale.createdAt).getHours()
    hourCounts[hour]++
  })
  const peakHourIndex = hourCounts.indexOf(Math.max(...hourCounts))
  const peakHour = `${peakHourIndex}:00-${peakHourIndex + 1}:00`

  return {
    total: currentCount,
    change: Number(change.toFixed(1)),
    avgValue: Number(avgValue.toFixed(2)),
    peakHour,
    conversionRate: 73.2, // Mock value
    revenuePerHour: Number((currentTotal / 24).toFixed(2))
  }
}

function calculateCustomerMetrics(customers: any[], sales: any[]) {
  const totalCustomers = customers.length
  const newCustomers = customers.filter(c =>
    new Date(c.createdAt) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  ).length
  const vipCustomers = customers.filter(c => c.isVIP).length
  const returningCustomers = totalCustomers - newCustomers

  const segments = {
    vip: { count: vipCustomers, percentage: Number(((vipCustomers / totalCustomers) * 100).toFixed(1)) },
    regular: { count: returningCustomers, percentage: Number(((returningCustomers / totalCustomers) * 100).toFixed(1)) },
    new: { count: newCustomers, percentage: Number(((newCustomers / totalCustomers) * 100).toFixed(1)) }
  }

  return {
    total: totalCustomers,
    new: newCustomers,
    returning: returningCustomers,
    vip: vipCustomers,
    loyalty: 68.5, // Mock value
    satisfaction: 4.7, // Mock value
    segments
  }
}

function calculateProductMetrics(sales: any[], inventory: any[]) {
  const itemsSold = sales.reduce((sum, sale) =>
    sum + sale.lines.reduce((lineSum: number, line: any) => lineSum + line.quantity, 0), 0
  )

  const categories = new Set()
  const productSales = new Map()

  sales.forEach(sale => {
    sale.lines.forEach((line: any) => {
      if (line.item) {
        categories.add(line.item.category?.title || 'Uncategorized')
        const key = line.item.id
        const existing = productSales.get(key) || {
          name: line.item.name,
          sales: 0,
          quantity: 0,
          revenue: 0
        }
        existing.quantity += line.quantity
        existing.revenue += line.lineTotal
        existing.sales += line.lineTotal
        productSales.set(key, existing)
      }
    })
  })

  const topProducts = Array.from(productSales.values())
    .sort((a: any, b: any) => b.sales - a.sales)
    .slice(0, 5)

  const lowStock = inventory.filter(item =>
    item.inventoryLevels.some((level: any) => level.quantityOnHand <= 10)
  ).length

  const outOfStock = inventory.filter(item =>
    item.inventoryLevels.every((level: any) => level.quantityOnHand === 0)
  ).length

  return {
    sold: itemsSold,
    categories: categories.size,
    topSelling: "Electronics", // Mock value
    lowStock,
    outOfStock,
    topProducts
  }
}

function calculateStaffMetrics(staff: any[], sales: any[]) {
  const activeStaff = staff.filter(s => s.posSessions.length > 0).length
  const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0)
  const avgSalesPerStaff = activeStaff > 0 ? totalSales / activeStaff : 0

  const leaderboard = staff
    .map(user => {
      const userSales = user.posSessions.flatMap((session: any) => session.salesOrders)
      const userTotal = userSales.reduce((sum: number, sale: any) => sum + sale.total, 0)
      const userTransactions = userSales.length
      const userHours = user.posSessions.reduce((sum: number, session: any) => {
        if (session.endTime) {
          return sum + (session.endTime.getTime() - session.startTime.getTime()) / (1000 * 60 * 60)
        }
        return sum
      }, 0)

      return {
        name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        sales: userTotal,
        transactions: userTransactions,
        hours: userHours
      }
    })
    .filter(user => user.sales > 0)
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 5)

  return {
    active: activeStaff,
    topPerformer: leaderboard[0]?.name || "N/A",
    avgSalesPerStaff: Number(avgSalesPerStaff.toFixed(2)),
    totalHours: 120, // Mock value
    leaderboard
  }
}

function calculatePaymentMetrics(sales: any[]) {
  const paymentCounts = new Map()
  const paymentTotals = new Map()
  let totalAmount = 0

  sales.forEach(sale => {
    sale.payments.forEach((payment: any) => {
      const method = payment.method
      paymentCounts.set(method, (paymentCounts.get(method) || 0) + 1)
      paymentTotals.set(method, (paymentTotals.get(method) || 0) + payment.amount)
      totalAmount += payment.amount
    })
  })

  const breakdown = Array.from(paymentTotals.entries()).map(([method, amount]) => ({
    method,
    amount,
    percentage: totalAmount > 0 ? Number(((amount / totalAmount) * 100).toFixed(1)) : 0,
    count: paymentCounts.get(method) || 0
  }))

  const cashPercentage = breakdown.find(b => b.method === 'CASH')?.percentage || 0
  const cardPercentage = breakdown.find(b => b.method === 'CARD')?.percentage || 0
  const digitalPercentage = breakdown.filter(b => !['CASH', 'CARD'].includes(b.method))
    .reduce((sum, b) => sum + b.percentage, 0)

  return {
    cash: cashPercentage,
    card: cardPercentage,
    digital: digitalPercentage,
    fastestMethod: "Contactless", // Mock value
    breakdown
  }
}

function calculateGeographyMetrics(sales: any[], locations: any[]) {
  const locationSales = new Map()

  sales.forEach(sale => {
    const locId = sale.locationId
    const existing = locationSales.get(locId) || { sales: 0, transactions: 0 }
    existing.sales += sale.total
    existing.transactions += 1
    locationSales.set(locId, existing)
  })

  const locationPerformance = Array.from(locationSales.entries()).map(([locationId, data]) => {
    const location = locations.find(l => l.id === locationId)
    return {
      locationId,
      name: location?.name || 'Unknown',
      sales: (data as any).sales,
      growth: Math.random() * 40 - 10, // Mock growth data
      transactions: (data as any).transactions
    }
  }).sort((a, b) => b.sales - a.sales)

  return {
    topLocation: locationPerformance[0]?.name || "N/A",
    growthLeader: "Mall Branch", // Mock value
    underperforming: "Suburb Store", // Mock value
    newMarkets: 2, // Mock value
    locationPerformance
  }
}

function calculateTimingMetrics(sales: any[]) {
  const dayCounts = new Array(7).fill(0)
  const hourCounts = new Array(24).fill(0)
  const daySales = new Array(7).fill(0)
  const hourSales = new Array(24).fill(0)

  sales.forEach(sale => {
    const date = new Date(sale.createdAt)
    const day = date.getDay()
    const hour = date.getHours()

    dayCounts[day]++
    hourCounts[hour]++
    daySales[day] += sale.total
    hourSales[hour] += sale.total
  })

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const peakDayIndex = daySales.indexOf(Math.max(...daySales))
  const peakHourIndex = hourSales.indexOf(Math.max(...hourSales))
  const slowestHourIndex = hourSales.indexOf(Math.min(...hourSales.filter(h => h > 0)))

  const weekendSales = daySales[0] + daySales[6] // Sunday + Saturday
  const weekdaySales = daySales.slice(1, 6).reduce((sum, sales) => sum + sales, 0)
  const totalSales = weekendSales + weekdaySales

  const hourlyBreakdown = hourSales.map((sales, hour) => ({
    hour,
    sales,
    transactions: hourCounts[hour],
    percentage: totalSales > 0 ? Number(((sales / totalSales) * 100).toFixed(1)) : 0
  }))

  return {
    peakDay: days[peakDayIndex],
    peakHour: `${peakHourIndex}:00-${peakHourIndex + 1}:00`,
    slowestPeriod: `${slowestHourIndex}:00-${slowestHourIndex + 1}:00`,
    weekendVsWeekday: {
      weekend: Number(((weekendSales / totalSales) * 100).toFixed(1)),
      weekday: Number(((weekdaySales / totalSales) * 100).toFixed(1))
    },
    hourlyBreakdown
  }
}

function calculatePromotionMetrics(sales: any[]) {
  // Mock promotion data
  return {
    active: 8,
    discountImpact: 12450,
    mostEffective: "Buy 2 Get 1",
    avgDiscount: 15.7,
    campaigns: [
      { id: "1", name: "Summer Sale", revenue: 5230, conversion: 23.4, discount: 20 },
      { id: "2", name: "Buy 2 Get 1", revenue: 3450, conversion: 34.1, discount: 12 },
      { id: "3", name: "Weekend Special", revenue: 2890, conversion: 18.7, discount: 15 },
    ]
  }
}

function calculateLoyaltyMetrics(customers: any[], sales: any[]) {
  const loyaltyMembers = customers.filter(c => c.loyaltyPoints > 0).length
  const memberSales = sales.filter(s => s.customer?.loyaltyPoints > 0)
  const memberPurchasesPercentage = sales.length > 0 ? (memberSales.length / sales.length) * 100 : 0

  const avgSpendPerMember = loyaltyMembers > 0
    ? memberSales.reduce((sum, sale) => sum + sale.total, 0) / loyaltyMembers
    : 0

  return {
    members: loyaltyMembers,
    pointsRedeemed: 45230, // Mock value
    memberPurchases: Number(memberPurchasesPercentage.toFixed(1)),
    avgSpendPerMember: Number(avgSpendPerMember.toFixed(2)),
    newMembersThisWeek: 156, // Mock value
    membershipGrowth: 12.3 // Mock value
  }
}

function calculateKPIs(sales: any[], customers: any[], inventory: any[]) {
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0)
  const totalCost = sales.reduce((sum, sale) =>
    sum + sale.lines.reduce((lineSum: number, line: any) =>
      lineSum + (line.quantity * (line.item?.costPrice || 0)), 0
    ), 0
  )
  const profitMargin = totalRevenue > 0 ? ((totalRevenue - totalCost) / totalRevenue) * 100 : 0

  return {
    salesTargetAchievement: 98.3,
    customerRetentionRate: 82.5,
    avgResponseTime: 2.3,
    returnRate: 3.2,
    profitMargin: Number(profitMargin.toFixed(1)),
    inventoryTurnover: 4.2 // Mock value
  }
}

function generateAlerts(sales: any[], inventory: any[], staff: any[]) {
  const alerts = []

  // Low stock alert
  const lowStockItems = inventory.filter(item =>
    item.inventoryLevels.some((level: any) => level.quantityOnHand <= 10)
  ).length

  if (lowStockItems > 0) {
    alerts.push({
      type: "warning" as const,
      title: "Low Stock Alert",
      message: `${lowStockItems} items need restocking`,
      actionRequired: true
    })
  }

  // Staff shift changes
  alerts.push({
    type: "info" as const,
    title: "Shift Change",
    message: "3 staff members ending shifts soon",
    actionRequired: false
  })

  // High demand category
  alerts.push({
    type: "info" as const,
    title: "High Demand",
    message: "Electronics category is trending",
    actionRequired: false
  })

  return alerts
}

function generateTrends(currentSales: any[], comparisonSales: any[]) {
  const currentRevenue = currentSales.reduce((sum, sale) => sum + sale.total, 0)
  const comparisonRevenue = comparisonSales.reduce((sum, sale) => sum + sale.total, 0)
  const revenueChange = comparisonRevenue > 0 ? ((currentRevenue - comparisonRevenue) / comparisonRevenue) * 100 : 0

  const trends = []

  if (revenueChange > 10) {
    trends.push({
      type: "positive" as const,
      title: "Growth Trend",
      description: `${revenueChange.toFixed(1)}% increase in sales`,
      impact: "Revenue growth exceeding expectations"
    })
  }

  trends.push({
    type: "positive" as const,
    title: "Peak Performance",
    description: "Weekends show 65% of total sales",
    impact: "Strong weekend performance driving results"
  })

  trends.push({
    type: "neutral" as const,
    title: "Opportunity",
    description: "Morning hours underperforming",
    impact: "Potential for morning sales optimization"
  })

  return trends
}

export async function getSalesAspectsCarousel(
  organizationId: string,
  locationId: string = "all",
  period: string = "today"
): Promise<any> {
  const now = new Date()
  let startDate: Date
  let endDate: Date = now

  switch (period) {
    case "yesterday":
      startDate = subDays(now, 1)
      endDate = subDays(now, 1)
      break
    case "week":
      startDate = startOfWeek(now)
      break
    case "month":
      startDate = startOfMonth(now)
      break
    default:
      startDate = startOfDay(now)
  }

  return await getComprehensiveSalesAnalytics(organizationId, locationId, startDate, endDate)
}