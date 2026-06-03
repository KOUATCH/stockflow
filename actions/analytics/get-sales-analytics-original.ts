// "use server"

// import { db } from "@/prisma/db"
// import { endOfDay, startOfDay, startOfMonth, startOfWeek, subDays } from "date-fns"

// export interface SalesAnalytics {
//   totalSales: number
//   totalTransactions: number
//   averageTransaction: number
//   totalItems: number
//   topSellingItems: {
//     itemId: string
//     itemName: string
//     itemSku: string
//     quantitySold: number
//     totalRevenue: number
//   }[]
//   salesByHour: {
//     hour: number
//     sales: number
//     transactions: number
//   }[]
//   salesByDay: {
//     date: string
//     sales: number
//     transactions: number
//   }[]
//   paymentMethods: {
//     method: string
//     amount: number
//     count: number
//     percentage: number
//   }[]
// }

// export interface CashReconciliationReport {
//   sessionId: string
//   sessionNumber: string
//   terminalName: string
//   userName: string
//   openedAt: Date
//   closedAt?: Date
//   openingBalance: number
//   expectedBalance: number
//   actualBalance?: number
//   variance?: number
//   totalSales: number
//   totalCashIn: number
//   totalCashOut: number
//   transactionCount: number
//   status: string
// }

// export interface ProductPerformance {
//   itemId: string
//   itemName: string
//   itemSku: string
//   category: string
//   quantitySold: number
//   totalRevenue: number
//   averagePrice: number
//   profitMargin: number
//   currentStock: number
//   stockStatus: "in_stock" | "low_stock" | "out_of_stock"
// }

// export interface UserPerformance {
//   userId: string
//   userName: string
//   totalSales: number
//   totalTransactions: number
//   averageTransaction: number
//   sessionsCount: number
//   totalHours: number
//   averageVariance: number
//   performanceScore: number
// }

// // Get sales analytics for a date range
// export async function getSalesAnalytics(
//   organizationId: string,
//   locationId: string,
//   startDate: Date,
//   endDate: Date,
// ): Promise<SalesAnalytics> {
//   try {
//     const start = startOfDay(startDate)
//     const end = endOfDay(endDate)

//     // Get sales data from database
//     const sales = await db.salesOrder.findMany({
//       where: {
//         organizationId,
//         locationId,
//         createdAt: {
//           gte: start,
//           lte: end,
//         },
//       },
//     })

//     const totalSales = sales.reduce((sum, sale) => sum + (sale?.total ?? 0), 0)
//     const totalTransactions = sales.length
//     const averageTransaction = totalTransactions > 0 ? totalSales / totalTransactions : 0

//     // Calculate total items from sale items
//     const saleItems = await db.salesOrder.findMany({
//       where: {
//         id: {
//           in: sales.map(sale => sale.id)
//         }
//       }
//     })
//     const totalItems = saleItems.reduce((sum, item) => sum + item.quantity, 0)

//     // Top selling items
//     const itemSales = new Map<string, { name: string; sku: string; quantity: number; revenue: number }>()
//     saleItems.forEach((saleItem) => {
//       const item = db.items.find((i) => i.id === saleItem.itemId)
//       if (item) {
//         const key = saleItem.itemId
//         const existing = itemSales.get(key) || { name: item.name, sku: item.sku, quantity: 0, revenue: 0 }
//         existing.quantity += saleItem.quantity
//         existing.revenue += saleItem.lineTotal
//         itemSales.set(key, existing)
//       }
//     })

//     const topSellingItems = Array.from(itemSales.entries())
//       .map(([itemId, data]) => ({
//         itemId,
//         itemName: data.name,
//         itemSku: data.sku,
//         quantitySold: data.quantity,
//         totalRevenue: data.revenue,
//       }))
//       .sort((a, b) => b.quantitySold - a.quantitySold)
//       .slice(0, 10)

//     // Sales by hour
//     const salesByHour = Array.from({ length: 24 }, (_, hour) => {
//       const hourSales = sales.filter((sale) => new Date(sale.createdAt).getHours() === hour)
//       return {
//         hour,
//         sales: hourSales.reduce((sum, sale) => sum + sale.totalAmount, 0),
//         transactions: hourSales.length,
//       }
//     })

//     // Sales by day
//     const salesByDay: { date: string; sales: number; transactions: number }[] = []
//     const currentDate = new Date(start)
//     while (currentDate <= end) {
//       const dayStart = startOfDay(currentDate)
//       const dayEnd = endOfDay(currentDate)
//       const daySales = sales.filter((sale) => sale.createdAt >= dayStart && sale.createdAt <= dayEnd)

//       salesByDay.push({
//         date: currentDate.toISOString().split("T")[0],
//         sales: daySales.reduce((sum, sale) => sum + sale.totalAmount, 0),
//         transactions: daySales.length,
//       })

//       currentDate.setDate(currentDate.getDate() + 1)
//     }

//     // Payment methods
//     const payments = db.payments.filter((payment) => sales.some((sale) => sale.id === payment.salesOrderId))
//     const paymentMethodMap = new Map<string, { amount: number; count: number }>()
//     payments.forEach((payment) => {
//       const existing = paymentMethodMap.get(payment.method) || { amount: 0, count: 0 }
//       existing.amount += payment.amount
//       existing.count += 1
//       paymentMethodMap.set(payment.method, existing)
//     })

//     const paymentMethods = Array.from(paymentMethodMap.entries()).map(([method, data]) => ({
//       method,
//       amount: data.amount,
//       count: data.count,
//       percentage: totalSales > 0 ? (data.amount / totalSales) * 100 : 0,
//     }))

//     return {
//       totalSales,
//       totalTransactions,
//       averageTransaction,
//       totalItems,
//       topSellingItems,
//       salesByHour,
//       salesByDay,
//       paymentMethods,
//     }
//   } catch (error) {
//     console.error("Error getting sales analytics:", error)
//     throw new Error("Failed to get sales analytics")
//   }
// }

// // Get cash reconciliation reports
// export async function getCashReconciliationReports(
//   organizationId: string,
//   locationId: string,
//   startDate: Date,
//   endDate: Date,
// ): Promise<CashReconciliationReport[]> {
//   try {
//     const start = startOfDay(startDate)
//     const end = endOfDay(endDate)

//     const sessions = db.posSessions
//       .filter(
//         (session) =>
//           session.organizationId === organizationId &&
//           session.locationId === locationId &&
//           session.openedAt >= start &&
//           session.openedAt <= end,
//       )
//       .sort((a, b) => b.openedAt.getTime() - a.openedAt.getTime())

//     return sessions.map((session) => {
//       const sessionSales = db.sales.filter((sale) => sale.sessionId === session.id && !sale.voidedAt)
//       const totalSales = sessionSales.reduce((sum, sale) => sum + sale.totalAmount, 0)

//       const cashTransactions = db.cashDrawerTransaction.filter((t) => t.sessionId === session.id)
//       const totalCashIn = cashTransactions
//         .filter((t) => t.transactionType === "cash_in")
//         .reduce((sum, t) => sum + t.amount, 0)
//       const totalCashOut = cashTransactions
//         .filter((t) => t.transactionType === "cash_out")
//         .reduce((sum, t) => sum + t.amount, 0)

//       const terminal = db.terminals.find((t) => t.id === session.terminalId)
//       const user = db.users.find((u) => u.id === session.userId)

//       return {
//         sessionId: session.id,
//         sessionNumber: session.sessionNumber,
//         terminalName: terminal?.name || "Unknown Terminal",
//         userName: user ? `${user.firstName} ${user.lastName}` : "Unknown User",
//         openedAt: session.openedAt,
//         closedAt: session.closedAt || undefined,
//         openingBalance: session.openingBalance,
//         expectedBalance: session.expectedBalance || 0,
//         actualBalance: session.actualBalance || undefined,
//         variance: session.variance || undefined,
//         totalSales,
//         totalCashIn,
//         totalCashOut,
//         transactionCount: cashTransactions.length,
//         status: session.status,
//       }
//     })
//   } catch (error) {
//     console.error("Error getting cash reconciliation reports:", error)
//     throw new Error("Failed to get cash reconciliation reports")
//   }
// }

// // Get product performance analytics
// export async function getProductPerformance(
//   organizationId: string,
//   locationId: string,
//   startDate: Date,
//   endDate: Date,
// ): Promise<ProductPerformance[]> {
//   try {
//     const start = startOfDay(startDate)
//     const end = endOfDay(endDate)

//     const items = db.items.filter((item) => item.organizationId === organizationId && item.isActive)

//     return items.map((item) => {
//       // Get sales for this item in the date range
//       const itemSales = db.saleItems.filter((saleItem) => {
//         const sale = db.sales.find((s) => s.id === saleItem.saleId)
//         return (
//           saleItem.itemId === item.id &&
//           sale &&
//           sale.locationId === locationId &&
//           sale.createdAt >= start &&
//           sale.createdAt <= end &&
//           !sale.voidedAt
//         )
//       })

//       const quantitySold = itemSales.reduce((sum, saleItem) => sum + saleItem.quantity, 0)
//       const totalRevenue = itemSales.reduce((sum, saleItem) => sum + saleItem.lineTotal, 0)
//       const averagePrice = quantitySold > 0 ? totalRevenue / quantitySold : item.sellingPrice
//       const profitMargin = item.sellingPrice > 0 ? ((item.sellingPrice - item.costPrice) / item.sellingPrice) * 100 : 0

//       const inventoryLevel = db.inventoryLevels.find(
//         (level) => level.itemId === item.id && level.locationId === locationId,
//       )
//       const currentStock = inventoryLevel?.quantityOnHand || 0

//       let stockStatus: "in_stock" | "low_stock" | "out_of_stock" = "in_stock"
//       if (currentStock === 0) {
//         stockStatus = "out_of_stock"
//       } else if (currentStock <= item.reorderLevel) {
//         stockStatus = "low_stock"
//       }

//       const category = item.categoryId ? db.categories.find((c) => c.id === item.categoryId) : null

//       return {
//         itemId: item.id,
//         itemName: item.name,
//         itemSku: item.sku,
//         category: category?.name || "Uncategorized",
//         quantitySold,
//         totalRevenue,
//         averagePrice,
//         profitMargin,
//         currentStock,
//         stockStatus,
//       }
//     })
//   } catch (error) {
//     console.error("Error getting product performance:", error)
//     throw new Error("Failed to get product performance")
//   }
// }

// // Get user performance analytics
// export async function getUserPerformance(
//   organizationId: string,
//   locationId: string,
//   startDate: Date,
//   endDate: Date,
// ): Promise<UserPerformance[]> {
//   try {
//     const start = startOfDay(startDate)
//     const end = endOfDay(endDate)

//     const users = db.users.filter((user) => user.organizationId === organizationId && user.isActive)

//     return users
//       .map((user) => {
//         const sessions = db.posSessions.filter(
//           (session) =>
//             session.userId === user.id &&
//             session.locationId === locationId &&
//             session.openedAt >= start &&
//             session.openedAt <= end,
//         )

//         const sessionSales = db.sales.filter(
//           (sale) => sessions.some((session) => session.id === sale.sessionId) && !sale.voidedAt,
//         )

//         const totalSales = sessionSales.reduce((sum, sale) => sum + sale.totalAmount, 0)
//         const totalTransactions = sessionSales.length
//         const averageTransaction = totalTransactions > 0 ? totalSales / totalTransactions : 0
//         const sessionsCount = sessions.length

//         // Calculate total hours worked
//         const totalHours = sessions.reduce((sum, session) => {
//           if (session.closedAt) {
//             const hours = (session.closedAt.getTime() - session.openedAt.getTime()) / (1000 * 60 * 60)
//             return sum + hours
//           }
//           return sum
//         }, 0)

//         // Calculate average variance
//         const sessionsWithVariance = sessions.filter((s) => s.variance !== null)
//         const averageVariance =
//           sessionsWithVariance.length > 0
//             ? sessionsWithVariance.reduce((sum, s) => sum + Math.abs(s.variance || 0), 0) / sessionsWithVariance.length
//             : 0

//         // Calculate performance score (0-100)
//         let performanceScore = 100
//         if (averageVariance > 10) performanceScore -= 20
//         else if (averageVariance > 5) performanceScore -= 10
//         if (totalTransactions < 10) performanceScore -= 10
//         if (averageTransaction < 20) performanceScore -= 10

//         return {
//           userId: user.id,
//           userName: `${user.firstName} ${user.lastName}`,
//           totalSales,
//           totalTransactions,
//           averageTransaction,
//           sessionsCount,
//           totalHours,
//           averageVariance,
//           performanceScore: Math.max(0, performanceScore),
//         }
//       })
//       .filter((user) => user.sessionsCount > 0)
//       .sort((a, b) => b.totalSales - a.totalSales)
//   } catch (error) {
//     console.error("Error getting user performance:", error)
//     throw new Error("Failed to get user performance")
//   }
// }

// // Get dashboard summary
// export async function getDashboardSummary(organizationId: string, locationId: string) {
//   try {
//     const today = new Date()
//     const yesterday = subDays(today, 1)
//     const thisWeek = startOfWeek(today)
//     const thisMonth = startOfMonth(today)

//     // Today's stats
//     const todayStats = await getSalesAnalytics(organizationId, locationId, today, today)

//     // Yesterday's stats for comparison
//     const yesterdayStats = await getSalesAnalytics(organizationId, locationId, yesterday, yesterday)

//     // This week's stats
//     const weekStats = await getSalesAnalytics(organizationId, locationId, thisWeek, today)

//     // This month's stats
//     const monthStats = await getSalesAnalytics(organizationId, locationId, thisMonth, today)

//     // Active sessions
//     const activeSessions = db.pOSSessions.filter(
//       (session) =>
//         session.organizationId === organizationId && session.locationId === locationId && session.status === "active",
//     ).length

//     // Low stock items
//     const lowStockItems = db.items.filter((item) => {
//       if (item.organizationId !== organizationId || !item.isActive) return false
//       const inventoryLevel = db.inventoryLevels.find(
//         (level) => level.itemId === item.id && level.locationId === locationId,
//       )
//       return inventoryLevel && inventoryLevel.quantityOnHand <= 10
//     }).length

//     return {
//       today: {
//         sales: todayStats.totalSales,
//         transactions: todayStats.totalTransactions,
//         averageTransaction: todayStats.averageTransaction,
//         salesChange: todayStats.totalSales - yesterdayStats.totalSales,
//         transactionsChange: todayStats.totalTransactions - yesterdayStats.totalTransactions,
//       },
//       week: {
//         sales: weekStats.totalSales,
//         transactions: weekStats.totalTransactions,
//         averageTransaction: weekStats.averageTransaction,
//       },
//       month: {
//         sales: monthStats.totalSales,
//         transactions: monthStats.totalTransactions,
//         averageTransaction: monthStats.averageTransaction,
//       },
//       activeSessions,
//       lowStockItems,
//       topSellingItems: todayStats.topSellingItems.slice(0, 5),
//     }
//   } catch (error) {
//     console.error("Error getting dashboard summary:", error)
//     throw new Error("Failed to get dashboard summary")
//   }
// }
