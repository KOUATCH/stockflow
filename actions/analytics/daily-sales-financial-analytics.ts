"use server"

import { db } from "@/prisma/db"
import { startOfDay, endOfDay, subDays, format } from "date-fns"

export interface ItemFinancialMetrics {
  id: string
  name: string
  sku: string
  category: string
  quantitySold: number
  grossRevenue: number
  netRevenue: number
  totalCost: number
  grossProfit: number
  grossMargin: number
  profitMargin: number
  averageSellingPrice: number
  averageCostPrice: number
  priceVariance: number
  inventoryTurnover: number
  revenueShare: number
  transactionCount: number
  averageUnitsPerTransaction: number
  stockMovement: {
    opening: number
    closing: number
    movement: number
  }
  performance: {
    trend: "up" | "down" | "stable"
    growth: number
    ranking: number
    efficiency: number
  }
  profitability: {
    roi: number
    contribution: number
    breakeven: number
    marginTrend: "improving" | "declining" | "stable"
  }
}

export interface GlobalFinancialAnalytics {
  overview: {
    totalRevenue: number
    totalCost: number
    grossProfit: number
    netProfit: number
    operatingMargin: number
    grossMargin: number
    profitMargin: number
    revenueGrowth: number
    profitGrowth: number
    costGrowth: number
  }
  performance: {
    itemCount: number
    averageItemRevenue: number
    topPerformers: number
    underPerformers: number
    profitableItems: number
    lossItems: number
    breakEvenItems: number
    highMarginItems: number
    lowMarginItems: number
  }
  financialHealth: {
    liquidityRatio: number
    profitabilityIndex: number
    operatingEfficiency: number
    costEfficiency: number
    revenueQuality: number
    marginStability: number
    growthSustainability: number
    riskIndicator: "low" | "medium" | "high"
  }
  trends: {
    revenueByHour: Array<{ hour: number; revenue: number; cost: number; profit: number }>
    profitTrend: Array<{ time: string; profit: number; margin: number }>
    categoryPerformance: Array<{
      category: string
      revenue: number
      profit: number
      margin: number
      itemCount: number
      growth: number
    }>
  }
  alerts: Array<{
    type: "critical" | "warning" | "info"
    category: "profit" | "cost" | "revenue" | "margin"
    title: string
    message: string
    impact: string
    recommendation: string
  }>
  insights: Array<{
    type: "opportunity" | "risk" | "achievement"
    title: string
    description: string
    actionItems: string[]
    priority: "high" | "medium" | "low"
  }>
}

export interface DailySalesFinancialReport {
  reportDate: string
  reportPeriod: string
  globalAnalytics: GlobalFinancialAnalytics
  itemAnalytics: ItemFinancialMetrics[]
  summary: {
    topRevenueitems: ItemFinancialMetrics[]
    topProfitItems: ItemFinancialMetrics[]
    highestMarginItems: ItemFinancialMetrics[]
    underperformingItems: ItemFinancialMetrics[]
    fastMovingItems: ItemFinancialMetrics[]
    slowMovingItems: ItemFinancialMetrics[]
  }
  comparisons: {
    previousDay: {
      revenueChange: number
      profitChange: number
      marginChange: number
      volumeChange: number
    }
    weekAverage: {
      revenueVsAvg: number
      profitVsAvg: number
      marginVsAvg: number
      volumeVsAvg: number
    }
  }
}

export async function getDailySalesFinancialAnalytics(
  organizationId: string,
  locationId: string = "all",
  targetDate: Date = new Date()
): Promise<DailySalesFinancialReport> {
  try {
    console.log("🔍 Generating daily sales financial analytics for:", {
      organizationId,
      locationId,
      targetDate: format(targetDate, "yyyy-MM-dd")
    })

    // Validate organizationId
    if (!organizationId) {
      throw new Error("Organization ID is required")
    }

    // Verify organization exists
    const organization = await db.organization.findUnique({
      where: { id: organizationId },
      select: { id: true, name: true }
    })

    if (!organization) {
      throw new Error("Organization not found")
    }

    console.log("✅ Organization verified:", organization.name)

    const reportDate = startOfDay(targetDate)
    const endOfReportDate = endOfDay(targetDate)
    const previousDay = subDays(reportDate, 1)
    const weekStart = subDays(reportDate, 7)

    // Fetch sales data for the target date with detailed logging
    console.log("📊 Fetching sales data...")
    const [currentDaySales, previousDaySales, weekSales, inventoryData] = await Promise.all([
      fetchDailySalesData(organizationId, locationId, reportDate, endOfReportDate),
      fetchDailySalesData(organizationId, locationId, previousDay, endOfDay(previousDay)),
      fetchWeekSalesData(organizationId, locationId, weekStart, endOfReportDate),
      fetchInventoryData(organizationId, locationId)
    ])

    console.log("📈 Sales data fetched:", {
      currentDaySales: currentDaySales.length,
      previousDaySales: previousDaySales.length,
      weekSales: weekSales.length,
      inventoryItems: inventoryData.length
    })

    // Process item-level analytics
    console.log("🔢 Calculating item financial metrics...")
    const itemAnalytics = await calculateItemFinancialMetrics(currentDaySales, inventoryData, previousDaySales)

    // Process global analytics
    console.log("🌍 Calculating global financial analytics...")
    const globalAnalytics = calculateGlobalFinancialAnalytics(currentDaySales, previousDaySales, weekSales, itemAnalytics)

    // Generate comparisons
    const comparisons = calculateComparisons(currentDaySales, previousDaySales, weekSales)

    // Create summary categories
    const summary = createSummaryCategories(itemAnalytics)

    console.log("✅ Daily sales financial analytics generated successfully")

    return {
      reportDate: format(targetDate, "yyyy-MM-dd"),
      reportPeriod: `Daily Report - ${format(targetDate, "MMMM d, yyyy")}`,
      globalAnalytics,
      itemAnalytics,
      summary,
      comparisons
    }
  } catch (error) {
    console.error("❌ Error generating daily sales financial analytics:", error)

    // Return a fallback response with empty data instead of throwing
    return {
      reportDate: format(targetDate, "yyyy-MM-dd"),
      reportPeriod: `Daily Report - ${format(targetDate, "MMMM d, yyyy")} (Error)`,
      globalAnalytics: {
        overview: {
          totalRevenue: 0,
          totalCost: 0,
          grossProfit: 0,
          netProfit: 0,
          operatingMargin: 0,
          grossMargin: 0,
          profitMargin: 0,
          revenueGrowth: 0,
          profitGrowth: 0,
          costGrowth: 0
        },
        performance: {
          itemCount: 0,
          averageItemRevenue: 0,
          topPerformers: 0,
          underPerformers: 0,
          profitableItems: 0,
          lossItems: 0,
          breakEvenItems: 0,
          highMarginItems: 0,
          lowMarginItems: 0
        },
        financialHealth: {
          liquidityRatio: 0,
          profitabilityIndex: 0,
          operatingEfficiency: 0,
          costEfficiency: 0,
          revenueQuality: 0,
          marginStability: 0,
          growthSustainability: 0,
          riskIndicator: "high"
        },
        trends: {
          revenueByHour: [],
          profitTrend: [],
          categoryPerformance: []
        },
        alerts: [{
          type: "critical",
          category: "revenue",
          title: "Data Loading Error",
          message: "Unable to load sales data. Please try again or contact support.",
          impact: "Analytics unavailable",
          recommendation: "Check database connection and try refreshing the page"
        }],
        insights: [{
          type: "risk",
          title: "System Error",
          description: "Unable to generate financial insights due to data loading issues.",
          actionItems: ["Refresh the page", "Contact technical support"],
          priority: "high"
        }]
      },
      itemAnalytics: [],
      summary: {
        topRevenueitems: [],
        topProfitItems: [],
        highestMarginItems: [],
        underperformingItems: [],
        fastMovingItems: [],
        slowMovingItems: []
      },
      comparisons: {
        previousDay: {
          revenueChange: 0,
          profitChange: 0,
          marginChange: 0,
          volumeChange: 0
        },
        weekAverage: {
          revenueVsAvg: 0,
          profitVsAvg: 0,
          marginVsAvg: 0,
          volumeVsAvg: 0
        }
      }
    }
  }
}

async function fetchDailySalesData(
  organizationId: string,
  locationId: string,
  startDate: Date,
  endDate: Date
) {
  try {
    console.log("🔍 Fetching sales data for:", {
      organizationId,
      locationId,
      dateRange: `${startDate.toISOString()} - ${endDate.toISOString()}`
    })

    const salesData = await db.salesOrder.findMany({
      where: {
        organizationId,
        ...(locationId !== "all" && { locationId }),
        createdAt: { gte: startDate, lte: endDate },
        status: { notIn: ["CANCELLED", "DRAFT"] }
      },
      include: {
        lines: {
          include: {
            item: {
              select: {
                id: true,
                nameEn: true,
                sku: true,
                costPrice: true,
                sellingPrice: true,
                minStockLevel: true,
                category: { select: { titleEn: true } },
                inventoryLevels: {
                  where: {
                    ...(locationId !== "all" && { locationId })
                  },
                  select: {
                    quantityOnHand: true,
                    averageCost: true,
                    locationId: true
                  }
                }
              }
            }
          }
        },
        payments: {
          where: {
            status: { not: "CANCELLED" }
          },
          select: {
            method: true,
            amount: true,
            status: true
          }
        },
        location: {
          select: { name: true, code: true }
        }
      }
    })

    console.log(`✅ Fetched ${salesData.length} sales records`)
    return salesData
  } catch (error) {
    console.error("❌ Error fetching daily sales data:", error)
    return [] // Return empty array instead of throwing
  }
}

async function fetchWeekSalesData(
  organizationId: string,
  locationId: string,
  startDate: Date,
  endDate: Date
) {
  try {
    const weekSalesData = await db.salesOrder.findMany({
      where: {
        organizationId,
        ...(locationId !== "all" && { locationId }),
        createdAt: { gte: startDate, lte: endDate },
        status: { notIn: ["CANCELLED", "DRAFT"] }
      },
      include: {
        lines: {
          include: {
            item: {
              select: {
                id: true,
                costPrice: true,
                sellingPrice: true
              }
            }
          }
        }
      }
    })

    console.log(`✅ Fetched ${weekSalesData.length} week sales records`)
    return weekSalesData
  } catch (error) {
    console.error("❌ Error fetching week sales data:", error)
    return []
  }
}

async function fetchInventoryData(organizationId: string, locationId: string) {
  try {
    const inventoryData = await db.inventoryLevel.findMany({
      where: {
        ...(locationId !== "all" && { locationId }),
        item: {
          organizationId,
          isActive: true
        }
      },
      include: {
        item: {
          select: {
            id: true,
            nameEn: true,
            sku: true,
            costPrice: true,
            sellingPrice: true,
            category: { select: { titleEn: true } }
          }
        }
      }
    })

    console.log(`✅ Fetched ${inventoryData.length} inventory records`)
    return inventoryData
  } catch (error) {
    console.error("❌ Error fetching inventory data:", error)
    return []
  }
}

async function calculateItemFinancialMetrics(
  currentSales: any[],
  inventoryData: any[],
  previousSales: any[]
): Promise<ItemFinancialMetrics[]> {
  const itemMetricsMap = new Map<string, any>()

  // Process current day sales
  currentSales.forEach(sale => {
    sale.lines.forEach((line: any) => {
      if (!line.item) return

      const itemId = line.item.id
      const existing = itemMetricsMap.get(itemId) || {
        id: itemId,
        name: line.item.nameEn,
        sku: line.item.sku,
        category: line.item.category?.titleEn || "Uncategorized",
        quantitySold: 0,
        grossRevenue: 0,
        totalCost: 0,
        transactionCount: 0,
        totalUnits: 0,
        costPrices: [],
        sellingPrices: []
      }

      existing.quantitySold += line.quantity
      existing.grossRevenue += line.lineTotal
      existing.totalCost += line.quantity * line.item.costPrice
      existing.transactionCount += 1
      existing.totalUnits += line.quantity
      existing.costPrices.push(line.item.costPrice)
      existing.sellingPrices.push(line.unitPrice)

      itemMetricsMap.set(itemId, existing)
    })
  })

  // Process previous day sales for comparison
  const previousMetricsMap = new Map<string, any>()
  previousSales.forEach(sale => {
    sale.lines.forEach((line: any) => {
      if (!line.item) return
      const itemId = line.item.id
      const existing = previousMetricsMap.get(itemId) || { grossRevenue: 0, grossProfit: 0 }
      existing.grossRevenue += line.lineTotal
      existing.grossProfit += line.lineTotal - (line.quantity * line.item.costPrice)
      previousMetricsMap.set(itemId, existing)
    })
  })

  // Calculate comprehensive metrics
  const itemAnalytics: ItemFinancialMetrics[] = Array.from(itemMetricsMap.entries()).map(([itemId, data]) => {
    const grossProfit = data.grossRevenue - data.totalCost
    const grossMargin = data.grossRevenue > 0 ? (grossProfit / data.grossRevenue) * 100 : 0
    const profitMargin = data.grossRevenue > 0 ? (grossProfit / data.grossRevenue) * 100 : 0
    const averageSellingPrice = data.totalUnits > 0 ? data.grossRevenue / data.totalUnits : 0
    const averageCostPrice = data.costPrices.length > 0
      ? data.costPrices.reduce((sum: number, price: number) => sum + price, 0) / data.costPrices.length
      : 0

    // Get inventory data
    const inventory = inventoryData.find(inv => inv.item.id === itemId)
    const stockLevel = inventory?.quantityOnHand || 0

    // Calculate performance metrics
    const previousData = previousMetricsMap.get(itemId) || { grossRevenue: 0, grossProfit: 0 }
    const revenueGrowth = previousData.grossRevenue > 0
      ? ((data.grossRevenue - previousData.grossRevenue) / previousData.grossRevenue) * 100
      : 0

    const performanceTrend = revenueGrowth > 5 ? "up" : revenueGrowth < -5 ? "down" : "stable"

    return {
      id: itemId,
      name: data.name,
      sku: data.sku,
      category: data.category,
      quantitySold: data.quantitySold,
      grossRevenue: Number(data.grossRevenue.toFixed(2)),
      netRevenue: Number(data.grossRevenue.toFixed(2)), // Assuming no returns for simplicity
      totalCost: Number(data.totalCost.toFixed(2)),
      grossProfit: Number(grossProfit.toFixed(2)),
      grossMargin: Number(grossMargin.toFixed(2)),
      profitMargin: Number(profitMargin.toFixed(2)),
      averageSellingPrice: Number(averageSellingPrice.toFixed(2)),
      averageCostPrice: Number(averageCostPrice.toFixed(2)),
      priceVariance: Number(((averageSellingPrice - averageCostPrice) / averageCostPrice * 100).toFixed(2)),
      inventoryTurnover: stockLevel > 0 ? Number((data.quantitySold / stockLevel).toFixed(2)) : 0,
      revenueShare: 0, // Will be calculated after all items are processed
      transactionCount: data.transactionCount,
      averageUnitsPerTransaction: Number((data.quantitySold / data.transactionCount).toFixed(2)),
      stockMovement: {
        opening: stockLevel + data.quantitySold, // Simplified calculation
        closing: stockLevel,
        movement: data.quantitySold
      },
      performance: {
        trend: performanceTrend,
        growth: Number(revenueGrowth.toFixed(1)),
        ranking: 0, // Will be calculated after sorting
        efficiency: Number((grossProfit / data.totalCost * 100).toFixed(1))
      },
      profitability: {
        roi: data.totalCost > 0 ? Number((grossProfit / data.totalCost * 100).toFixed(1)) : 0,
        contribution: Number(grossProfit.toFixed(2)),
        breakeven: averageCostPrice > 0 ? Math.ceil(data.totalCost / averageCostPrice) : 0,
        marginTrend: grossMargin > 30 ? "improving" : grossMargin < 10 ? "declining" : "stable"
      }
    }
  })

  // Calculate revenue share and ranking
  const totalRevenue = itemAnalytics.reduce((sum, item) => sum + item.grossRevenue, 0)

  return itemAnalytics
    .map((item, index) => ({
      ...item,
      revenueShare: totalRevenue > 0 ? Number(((item.grossRevenue / totalRevenue) * 100).toFixed(2)) : 0
    }))
    .sort((a, b) => b.grossRevenue - a.grossRevenue)
    .map((item, index) => ({
      ...item,
      performance: {
        ...item.performance,
        ranking: index + 1
      }
    }))
}

function calculateGlobalFinancialAnalytics(
  currentSales: any[],
  previousSales: any[],
  weekSales: any[],
  itemAnalytics: ItemFinancialMetrics[]
): GlobalFinancialAnalytics {
  // Calculate totals
  const totalRevenue = itemAnalytics.reduce((sum, item) => sum + item.grossRevenue, 0)
  const totalCost = itemAnalytics.reduce((sum, item) => sum + item.totalCost, 0)
  const grossProfit = totalRevenue - totalCost
  const grossMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0

  // Previous day totals
  const previousRevenue = previousSales.reduce((sum, sale) => sum + sale.total, 0)
  const previousCost = previousSales.reduce((sum, sale) =>
    sum + sale.lines.reduce((lineSum: number, line: any) =>
      lineSum + (line.quantity * (line.item?.costPrice || 0)), 0), 0)
  const previousProfit = previousRevenue - previousCost

  // Calculate growth rates
  const revenueGrowth = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0
  const profitGrowth = previousProfit > 0 ? ((grossProfit - previousProfit) / previousProfit) * 100 : 0
  const costGrowth = previousCost > 0 ? ((totalCost - previousCost) / previousCost) * 100 : 0

  // Performance metrics
  const profitableItems = itemAnalytics.filter(item => item.grossProfit > 0).length
  const lossItems = itemAnalytics.filter(item => item.grossProfit < 0).length
  const highMarginItems = itemAnalytics.filter(item => item.grossMargin > 30).length
  const topPerformers = Math.ceil(itemAnalytics.length * 0.2) // Top 20%

  // Calculate hourly trends
  const revenueByHour = calculateHourlyTrends(currentSales)

  // Calculate category performance
  const categoryPerformance = calculateCategoryPerformance(itemAnalytics)

  // Generate alerts
  const alerts = generateFinancialAlerts(itemAnalytics, grossMargin, revenueGrowth)

  // Generate insights
  const insights = generateFinancialInsights(itemAnalytics, grossMargin, revenueGrowth)

  return {
    overview: {
      totalRevenue: Number(totalRevenue.toFixed(2)),
      totalCost: Number(totalCost.toFixed(2)),
      grossProfit: Number(grossProfit.toFixed(2)),
      netProfit: Number((grossProfit * 0.85).toFixed(2)), // Simplified net profit
      operatingMargin: Number((grossMargin * 0.85).toFixed(2)),
      grossMargin: Number(grossMargin.toFixed(2)),
      profitMargin: Number(grossMargin.toFixed(2)),
      revenueGrowth: Number(revenueGrowth.toFixed(1)),
      profitGrowth: Number(profitGrowth.toFixed(1)),
      costGrowth: Number(costGrowth.toFixed(1))
    },
    performance: {
      itemCount: itemAnalytics.length,
      averageItemRevenue: itemAnalytics.length > 0 ? Number((totalRevenue / itemAnalytics.length).toFixed(2)) : 0,
      topPerformers,
      underPerformers: itemAnalytics.length - topPerformers,
      profitableItems,
      lossItems,
      breakEvenItems: itemAnalytics.length - profitableItems - lossItems,
      highMarginItems,
      lowMarginItems: itemAnalytics.filter(item => item.grossMargin < 10).length
    },
    financialHealth: {
      liquidityRatio: 1.25, // Mock value
      profitabilityIndex: grossMargin / 100,
      operatingEfficiency: Number((grossMargin / 100).toFixed(2)),
      costEfficiency: totalRevenue > 0 ? Number(((totalRevenue - totalCost) / totalRevenue).toFixed(2)) : 0,
      revenueQuality: Number((profitableItems / itemAnalytics.length).toFixed(2)),
      marginStability: 0.85, // Mock value
      growthSustainability: revenueGrowth > 0 && costGrowth < revenueGrowth ? 0.8 : 0.4,
      riskIndicator: grossMargin < 10 ? "high" : grossMargin < 20 ? "medium" : "low"
    },
    trends: {
      revenueByHour,
      profitTrend: [], // Simplified for now
      categoryPerformance
    },
    alerts,
    insights
  }
}

function calculateHourlyTrends(sales: any[]) {
  const hourlyData = new Array(24).fill(null).map((_, hour) => ({
    hour,
    revenue: 0,
    cost: 0,
    profit: 0
  }))

  sales.forEach(sale => {
    const hour = new Date(sale.createdAt).getHours()
    const revenue = sale.total
    const cost = sale.lines.reduce((sum: number, line: any) =>
      sum + (line.quantity * (line.item?.costPrice || 0)), 0)

    hourlyData[hour].revenue += revenue
    hourlyData[hour].cost += cost
    hourlyData[hour].profit += revenue - cost
  })

  return hourlyData
}

function calculateCategoryPerformance(itemAnalytics: ItemFinancialMetrics[]) {
  const categoryMap = new Map<string, any>()

  itemAnalytics.forEach(item => {
    const existing = categoryMap.get(item.category) || {
      category: item.category,
      revenue: 0,
      profit: 0,
      itemCount: 0,
      totalMargin: 0
    }

    existing.revenue += item.grossRevenue
    existing.profit += item.grossProfit
    existing.itemCount += 1
    existing.totalMargin += item.grossMargin

    categoryMap.set(item.category, existing)
  })

  return Array.from(categoryMap.values()).map(cat => ({
    category: cat.category,
    revenue: Number(cat.revenue.toFixed(2)),
    profit: Number(cat.profit.toFixed(2)),
    margin: Number((cat.totalMargin / cat.itemCount).toFixed(2)),
    itemCount: cat.itemCount,
    growth: Math.random() * 20 - 10 // Mock growth data
  })).sort((a, b) => b.revenue - a.revenue)
}

function generateFinancialAlerts(itemAnalytics: ItemFinancialMetrics[], grossMargin: number, revenueGrowth: number) {
  const alerts = []

  // Low margin alert
  if (grossMargin < 15) {
    alerts.push({
      type: "critical" as const,
      category: "margin" as const,
      title: "Low Gross Margin",
      message: `Daily gross margin is ${grossMargin.toFixed(1)}% - below target of 20%`,
      impact: "Reduced profitability affecting business sustainability",
      recommendation: "Review pricing strategy and cost optimization opportunities"
    })
  }

  // High cost items
  const highCostItems = itemAnalytics.filter(item => item.grossMargin < 10)
  if (highCostItems.length > 0) {
    alerts.push({
      type: "warning" as const,
      category: "cost" as const,
      title: "High Cost Items Detected",
      message: `${highCostItems.length} items have margins below 10%`,
      impact: "Items potentially losing money on each sale",
      recommendation: "Review cost structure and consider price adjustments"
    })
  }

  // Revenue decline
  if (revenueGrowth < -10) {
    alerts.push({
      type: "critical" as const,
      category: "revenue" as const,
      title: "Significant Revenue Decline",
      message: `Revenue decreased by ${Math.abs(revenueGrowth).toFixed(1)}% compared to previous day`,
      impact: "Substantial reduction in business performance",
      recommendation: "Investigate causes and implement recovery strategies"
    })
  }

  return alerts
}

function generateFinancialInsights(itemAnalytics: ItemFinancialMetrics[], grossMargin: number, revenueGrowth: number) {
  const insights = []

  // High performers
  const topItems = itemAnalytics.slice(0, 5)
  if (topItems.length > 0) {
    insights.push({
      type: "achievement" as const,
      title: "Top Revenue Generators",
      description: `Top 5 items generated ${topItems.reduce((sum, item) => sum + item.grossRevenue, 0).toFixed(0)} in revenue`,
      actionItems: [
        "Ensure adequate stock levels for top performers",
        "Consider promoting similar items",
        "Analyze what makes these items successful"
      ],
      priority: "medium" as const
    })
  }

  // Margin opportunities
  const lowMarginItems = itemAnalytics.filter(item => item.grossMargin < 15 && item.grossRevenue > 100)
  if (lowMarginItems.length > 0) {
    insights.push({
      type: "opportunity" as const,
      title: "Margin Improvement Opportunities",
      description: `${lowMarginItems.length} high-revenue items have margins below 15%`,
      actionItems: [
        "Review supplier costs and negotiate better terms",
        "Consider price increases for low-margin, high-volume items",
        "Analyze competitor pricing"
      ],
      priority: "high" as const
    })
  }

  // Growth insights
  if (revenueGrowth > 15) {
    insights.push({
      type: "achievement" as const,
      title: "Strong Revenue Growth",
      description: `Revenue increased by ${revenueGrowth.toFixed(1)}% - exceeding growth targets`,
      actionItems: [
        "Identify growth drivers and replicate success",
        "Ensure operational capacity can support continued growth",
        "Consider expanding successful product lines"
      ],
      priority: "medium" as const
    })
  }

  return insights
}

function calculateComparisons(currentSales: any[], previousSales: any[], weekSales: any[]) {
  const currentRevenue = currentSales.reduce((sum, sale) => sum + sale.total, 0)
  const currentVolume = currentSales.reduce((sum, sale) =>
    sum + sale.lines.reduce((lineSum: number, line: any) => lineSum + line.quantity, 0), 0)

  const previousRevenue = previousSales.reduce((sum, sale) => sum + sale.total, 0)
  const previousVolume = previousSales.reduce((sum, sale) =>
    sum + sale.lines.reduce((lineSum: number, line: any) => lineSum + line.quantity, 0), 0)

  // Week averages (7 days)
  const weekRevenue = weekSales.reduce((sum, sale) => sum + sale.total, 0)
  const weekVolume = weekSales.reduce((sum, sale) =>
    sum + sale.lines.reduce((lineSum: number, line: any) => lineSum + line.quantity, 0), 0)
  const avgWeekRevenue = weekRevenue / 7
  const avgWeekVolume = weekVolume / 7

  return {
    previousDay: {
      revenueChange: previousRevenue > 0 ? Number(((currentRevenue - previousRevenue) / previousRevenue * 100).toFixed(1)) : 0,
      profitChange: 0, // Simplified
      marginChange: 0, // Simplified
      volumeChange: previousVolume > 0 ? Number(((currentVolume - previousVolume) / previousVolume * 100).toFixed(1)) : 0
    },
    weekAverage: {
      revenueVsAvg: avgWeekRevenue > 0 ? Number(((currentRevenue - avgWeekRevenue) / avgWeekRevenue * 100).toFixed(1)) : 0,
      profitVsAvg: 0, // Simplified
      marginVsAvg: 0, // Simplified
      volumeVsAvg: avgWeekVolume > 0 ? Number(((currentVolume - avgWeekVolume) / avgWeekVolume * 100).toFixed(1)) : 0
    }
  }
}

function createSummaryCategories(itemAnalytics: ItemFinancialMetrics[]) {
  const sorted = [...itemAnalytics]

  return {
    topRevenueitems: sorted.sort((a, b) => b.grossRevenue - a.grossRevenue).slice(0, 10),
    topProfitItems: sorted.sort((a, b) => b.grossProfit - a.grossProfit).slice(0, 10),
    highestMarginItems: sorted.sort((a, b) => b.grossMargin - a.grossMargin).slice(0, 10),
    underperformingItems: sorted.filter(item => item.grossMargin < 10 || item.grossProfit < 0).slice(0, 10),
    fastMovingItems: sorted.sort((a, b) => b.quantitySold - a.quantitySold).slice(0, 10),
    slowMovingItems: sorted.sort((a, b) => a.quantitySold - b.quantitySold).filter(item => item.quantitySold > 0).slice(0, 10)
  }
}
