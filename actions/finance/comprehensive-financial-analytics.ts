"use server"

import { db } from "@/prisma/db"
import { startOfDay, endOfDay, startOfMonth, startOfYear, subMonths, subYears } from "date-fns"
import { getPayrollSummary, getPayrollExpenseAllocation } from "@/actions/payroll/payrollManagement"

export interface FinancialMetrics {
  revenue: {
    total: number
    growth: number
    recurring: number
    oneTime: number
    forecast: number
    target: number
    achievement: number
    breakdown: {
      productSales: number
      serviceSales: number
      shipping: number
      tax: number
    }
    byCategory: Array<{
      category: string
      amount: number
      percentage: number
      growth: number
    }>
  }
  profitability: {
    grossProfit: number
    grossMargin: number
    netProfit: number
    netMargin: number
    ebitda: number
    ebitdaMargin: number
    operatingProfit: number
    operatingMargin: number
    marginTrends: {
      grossMarginChange: number
      netMarginChange: number
      operatingMarginChange: number
    }
  }
  expenses: {
    total: number
    cogs: number
    operational: number
    salaries: number
    rent: number
    utilities: number
    marketing: number
    other: number
    breakdown: Array<{
      category: string
      amount: number
      percentage: number
      budgetVariance: number
    }>
    trends: {
      totalExpenseChange: number
      cogsChange: number
      operationalChange: number
    }
  }
  cashFlow: {
    operating: number
    investing: number
    financing: number
    netCashFlow: number
    cashOnHand: number
    burnRate: number
    runway: number
    cashConversion: number
    workingCapitalChange: number
  }
  assets: {
    total: number
    current: number
    inventory: number
    receivables: number
    cash: number
    fixedAssets: number
    intangible: number
    breakdown: Array<{
      type: string
      amount: number
      percentage: number
      liquidity: 'high' | 'medium' | 'low'
    }>
  }
  liabilities: {
    total: number
    current: number
    payables: number
    accrued: number
    longTerm: number
    loans: number
    breakdown: Array<{
      type: string
      amount: number
      dueDate: Date | null
      interestRate?: number
    }>
  }
  equity: {
    total: number
    paidInCapital: number
    retainedEarnings: number
    currentEarnings: number
    distributions: number
  }
  ratios: {
    liquidity: {
      currentRatio: number
      quickRatio: number
      cashRatio: number
    }
    leverage: {
      debtToEquity: number
      debtToAssets: number
      timesInterestEarned: number
    }
    profitability: {
      roe: number
      roa: number
      roc: number
      grossMargin: number
      netMargin: number
    }
    efficiency: {
      inventoryTurnover: number
      receivablesTurnover: number
      assetTurnover: number
      payablesTurnover: number
    }
    market: {
      priceToEarnings?: number
      priceToBook?: number
      marketCap?: number
    }
  }
  taxes: {
    salesTax: number
    incomeTax: number
    payrollTax: number
    propertyTax: number
    totalTaxLiability: number
    effectiveTaxRate: number
    taxSavings: number
    nextPaymentDue: Date | null
    nextPaymentAmount: number
  }
  budgetAnalysis: {
    actualVsBudget: Array<{
      category: string
      budgeted: number
      actual: number
      variance: number
      variancePercentage: number
    }>
    overallVariance: number
    favorableVariances: number
    unfavorableVariances: number
  }
  kpis: {
    revenueGrowthRate: number
    profitMarginTrend: number
    costControl: number
    financialHealthScore: number
    cashFlowStability: number
    debtServiceCoverage: number
    workingCapitalRatio: number
    returnOnInvestment: number
  }
  forecasting: {
    nextMonth: {
      revenue: number
      expenses: number
      profit: number
      cashFlow: number
    }
    nextQuarter: {
      revenue: number
      expenses: number
      profit: number
      cashFlow: number
    }
    nextYear: {
      revenue: number
      expenses: number
      profit: number
      cashFlow: number
    }
    scenarios: Array<{
      name: string
      probability: number
      impact: {
        revenue: number
        profit: number
        cashFlow: number
      }
    }>
  }
  alerts: Array<{
    type: 'critical' | 'warning' | 'info'
    category: string
    title: string
    message: string
    actionRequired: boolean
    impact: 'high' | 'medium' | 'low'
    dueDate?: Date
  }>
  benchmarks: {
    industryAverages: {
      grossMargin: number
      netMargin: number
      currentRatio: number
      debtToEquity: number
      roe: number
    }
    performanceVsIndustry: {
      grossMarginComparison: number
      netMarginComparison: number
      liquidityComparison: number
      leverageComparison: number
      profitabilityComparison: number
    }
  }
}

export async function getComprehensiveFinancialAnalytics(
  organizationId: string,
  startDate: Date,
  endDate: Date,
  comparisonPeriod: 'previous_period' | 'previous_year' | 'custom' = 'previous_period'
): Promise<FinancialMetrics> {
  try {
    const start = startOfDay(startDate)
    const end = endOfDay(endDate)

    // Calculate comparison period
    const periodDiff = end.getTime() - start.getTime()
    const comparisonStart = comparisonPeriod === 'previous_year'
      ? subYears(start, 1)
      : new Date(start.getTime() - periodDiff)
    const comparisonEnd = comparisonPeriod === 'previous_year'
      ? subYears(end, 1)
      : new Date(start.getTime() - 1)

    // Fetch financial data
    const [currentData, comparisonData, budgetData, taxData, payrollData] = await Promise.all([
      fetchFinancialData(organizationId, start, end),
      fetchFinancialData(organizationId, comparisonStart, comparisonEnd),
      fetchBudgetData(organizationId, start, end),
      fetchTaxData(organizationId, start, end),
      getPayrollSummary(organizationId, start, end)
    ])

    // Calculate all metrics
    const revenue = calculateRevenueMetrics(currentData, comparisonData)
    const profitability = calculateProfitabilityMetrics(currentData, comparisonData, payrollData.data)
    const expenses = calculateExpenseMetrics(currentData, comparisonData, budgetData, payrollData.data)
    const payroll = calculatePayrollMetrics(payrollData.data)
    const cashFlow = calculateCashFlowMetrics(currentData, comparisonData)
    const assets = calculateAssetMetrics(currentData)
    const liabilities = calculateLiabilityMetrics(currentData)
    const equity = calculateEquityMetrics(currentData)
    const ratios = calculateFinancialRatios(revenue, profitability, assets, liabilities, equity)
    const taxes = calculateTaxMetrics(taxData, currentData)
    const budgetAnalysis = calculateBudgetAnalysis(currentData, budgetData)
    const kpis = calculateKPIs(revenue, profitability, cashFlow, ratios)
    const forecasting = calculateForecasting(currentData, comparisonData)
    const alerts = generateFinancialAlerts(currentData, ratios, cashFlow)
    const benchmarks = calculateBenchmarks(ratios, profitability)

    return {
      revenue,
      profitability,
      expenses,
      payroll,
      cashFlow,
      assets,
      liabilities,
      equity,
      ratios,
      taxes,
      budgetAnalysis,
      kpis,
      forecasting,
      alerts,
      benchmarks
    }
  } catch (error) {
    console.error("Error getting comprehensive financial analytics:", error)
    throw new Error("Failed to get comprehensive financial analytics")
  }
}

async function fetchFinancialData(organizationId: string, start: Date, end: Date) {
  const [sales, expenses, inventory, customers, cashTransactions] = await Promise.all([
    // Sales data
    db.salesOrder.findMany({
      where: {
        organizationId,
        createdAt: { gte: start, lte: end },
        status: { not: "CANCELLED" }
      },
      include: {
        lines: {
          include: {
            item: {
              select: {
                costPrice: true,
                sellingPrice: true,
                category: { select: { title: true } }
              }
            }
          }
        },
        payments: true
      }
    }),

    // Expense data (mock for now)
    Promise.resolve([]),

    // Inventory data
    db.item.findMany({
      where: { organizationId, isActive: true },
      include: {
        inventoryLevels: {
          select: {
            quantityOnHand: true,
            locationId: true
          }
        }
      }
    }),

    // Customer data
    db.customer.count({
      where: { organizationId }
    }),

    // Cash transactions (from POS sessions)
    db.cashDrawerTransaction.findMany({
      where: {
        createdAt: { gte: start, lte: end },
        posSession: {
          terminal: {
            organizationId
          }
        }
      }
    })
  ])

  return {
    sales,
    expenses,
    inventory,
    customers,
    cashTransactions
  }
}

async function fetchBudgetData(organizationId: string, start: Date, end: Date) {
  // Mock budget data - replace with actual budget table
  return {
    revenue: 1200000,
    cogs: 720000,
    operatingExpenses: 300000,
    marketing: 50000,
    salaries: 180000,
    rent: 45000,
    utilities: 15000
  }
}

async function fetchTaxData(organizationId: string, start: Date, end: Date) {
  // Mock tax data - replace with actual tax tracking
  return {
    salesTax: 89765.43,
    incomeTax: 45678.90,
    payrollTax: 23456.78,
    propertyTax: 12000,
    nextPaymentDue: new Date('2024-04-15'),
    nextPaymentAmount: 45678.90
  }
}

function calculateRevenueMetrics(currentData: any, comparisonData: any) {
  const currentRevenue = currentData.sales.reduce((sum: number, sale: any) => sum + sale.total, 0)
  const comparisonRevenue = comparisonData.sales.reduce((sum: number, sale: any) => sum + sale.total, 0)
  const growth = comparisonRevenue > 0 ? ((currentRevenue - comparisonRevenue) / comparisonRevenue) * 100 : 0

  // Calculate breakdown
  const breakdown = {
    productSales: currentRevenue * 0.807,
    serviceSales: currentRevenue * 0.131,
    shipping: currentRevenue * 0.036,
    tax: currentRevenue * 0.025
  }

  // Revenue by category
  const categoryRevenue = new Map()
  currentData.sales.forEach((sale: any) => {
    sale.lines.forEach((line: any) => {
      const category = line.item?.category?.title || 'Uncategorized'
      categoryRevenue.set(category, (categoryRevenue.get(category) || 0) + line.lineTotal)
    })
  })

  const byCategory = Array.from(categoryRevenue.entries()).map(([category, amount]) => ({
    category,
    amount: amount as number,
    percentage: currentRevenue > 0 ? ((amount as number) / currentRevenue) * 100 : 0,
    growth: Math.random() * 20 - 10 // Mock growth data
  }))

  return {
    total: currentRevenue,
    growth: Number(growth.toFixed(1)),
    recurring: currentRevenue * 0.715,
    oneTime: currentRevenue * 0.285,
    forecast: currentRevenue * 1.08,
    target: 1200000,
    achievement: currentRevenue > 0 ? Number(((currentRevenue / 1200000) * 100).toFixed(1)) : 0,
    breakdown,
    byCategory
  }
}

function calculateProfitabilityMetrics(currentData: any, comparisonData: any, payrollData?: any) {
  const currentRevenue = currentData.sales.reduce((sum: number, sale: any) => sum + sale.total, 0)
  const currentCogs = currentData.sales.reduce((sum: number, sale: any) =>
    sum + sale.lines.reduce((lineSum: number, line: any) =>
      lineSum + (line.quantity * (line.item?.costPrice || 0)), 0), 0)

  const grossProfit = currentRevenue - currentCogs
  const grossMargin = currentRevenue > 0 ? (grossProfit / currentRevenue) * 100 : 0

  // Mock operating expenses
  const operatingExpenses = currentRevenue * 0.25
  const operatingProfit = grossProfit - operatingExpenses
  const operatingMargin = currentRevenue > 0 ? (operatingProfit / currentRevenue) * 100 : 0

  // Mock other expenses
  const otherExpenses = currentRevenue * 0.02
  const netProfit = operatingProfit - otherExpenses
  const netMargin = currentRevenue > 0 ? (netProfit / currentRevenue) * 100 : 0

  // EBITDA calculation (mock depreciation and amortization)
  const ebitda = operatingProfit + (currentRevenue * 0.03)
  const ebitdaMargin = currentRevenue > 0 ? (ebitda / currentRevenue) * 100 : 0

  return {
    grossProfit,
    grossMargin: Number(grossMargin.toFixed(1)),
    netProfit,
    netMargin: Number(netMargin.toFixed(1)),
    ebitda,
    ebitdaMargin: Number(ebitdaMargin.toFixed(1)),
    operatingProfit,
    operatingMargin: Number(operatingMargin.toFixed(1)),
    marginTrends: {
      grossMarginChange: 2.1,
      netMarginChange: 1.8,
      operatingMarginChange: 1.5
    }
  }
}

function calculateExpenseMetrics(currentData: any, comparisonData: any, budgetData: any, payrollData?: any) {
  const currentRevenue = currentData.sales.reduce((sum: number, sale: any) => sum + sale.total, 0)

  // Calculate COGS
  const cogs = currentData.sales.reduce((sum: number, sale: any) =>
    sum + sale.lines.reduce((lineSum: number, line: any) =>
      lineSum + (line.quantity * (line.item?.costPrice || 0)), 0), 0)

  // Mock other expenses
  const operational = currentRevenue * 0.126
  const salaries = payrollData?.totals?.totalGrossPay || currentRevenue * 0.15
  const rent = 45000
  const utilities = currentRevenue * 0.01
  const marketing = currentRevenue * 0.019
  const other = currentRevenue * 0.02

  const total = cogs + operational + salaries + rent + utilities + marketing + other

  const breakdown = [
    { category: 'Cost of Goods Sold', amount: cogs, percentage: (cogs / total) * 100, budgetVariance: 0 },
    { category: 'Salaries & Benefits', amount: salaries, percentage: (salaries / total) * 100, budgetVariance: 0 },
    { category: 'Operational', amount: operational, percentage: (operational / total) * 100, budgetVariance: 0 },
    { category: 'Rent', amount: rent, percentage: (rent / total) * 100, budgetVariance: 0 },
    { category: 'Marketing', amount: marketing, percentage: (marketing / total) * 100, budgetVariance: 0 },
    { category: 'Utilities', amount: utilities, percentage: (utilities / total) * 100, budgetVariance: 0 },
    { category: 'Other', amount: other, percentage: (other / total) * 100, budgetVariance: 0 }
  ]

  return {
    total,
    cogs,
    operational,
    salaries,
    rent,
    utilities,
    marketing,
    other,
    breakdown,
    trends: {
      totalExpenseChange: -3.2,
      cogsChange: -1.8,
      operationalChange: 2.1
    }
  }
}

function calculatePayrollMetrics(payrollData?: any) {
  if (!payrollData) {
    return {
      totalPayrollExpense: 0,
      totalEmployees: 0,
      averageSalary: 0,
      payrollGrowth: 0,
      departmentBreakdown: [],
      benefitsCost: 0,
      payrollTaxes: 0,
      overtimeCost: 0,
      overtimePercentage: 0
    }
  }

  const totalPayrollExpense = payrollData.totals.totalGrossPay + payrollData.totals.totalDeductions
  const benefitsCost = totalPayrollExpense * 0.15
  const payrollTaxes = totalPayrollExpense * 0.125
  const overtimeCost = totalPayrollExpense * 0.05

  return {
    totalPayrollExpense,
    totalEmployees: payrollData.totals.totalEmployees,
    averageSalary: payrollData.totals.averageSalary,
    payrollGrowth: 3.2, // Mock growth rate
    departmentBreakdown: payrollData.breakdown.byDepartment.map((dept: any) => ({
      department: dept.department,
      employeeCount: dept.employeeCount,
      totalCost: dept.totalGrossPay + (dept.totalGrossPay * 0.25), // Including benefits and taxes
      averageSalary: dept.averageSalary
    })),
    benefitsCost,
    payrollTaxes,
    overtimeCost,
    overtimePercentage: (overtimeCost / totalPayrollExpense) * 100
  }
}

function calculateCashFlowMetrics(currentData: any, comparisonData: any) {
  const currentRevenue = currentData.sales.reduce((sum: number, sale: any) => sum + sale.total, 0)

  // Mock cash flow data
  const operating = currentRevenue * 0.277
  const investing = -89123.45
  const financing = -45678.90
  const netCashFlow = operating + investing + financing

  const cashOnHand = currentData.cashTransactions.reduce((sum: number, trans: any) => {
    return trans.type === 'CASH_IN' ? sum + trans.amount : sum - trans.amount
  }, 567890.12)

  return {
    operating,
    investing,
    financing,
    netCashFlow,
    cashOnHand,
    burnRate: 12345.67,
    runway: cashOnHand / 12345.67,
    cashConversion: 23.5,
    workingCapitalChange: 15672.34
  }
}

function calculateAssetMetrics(currentData: any) {
  // Mock asset calculation
  const inventoryValue = currentData.inventory.reduce((sum: number, item: any) => {
    const totalQty = item.inventoryLevels.reduce((qtySum: number, level: any) => qtySum + level.quantityOnHand, 0)
    return sum + (totalQty * (item.costPrice || 0))
  }, 0)

  const cash = 567890.12
  const receivables = 234567.89
  const current = cash + receivables + inventoryValue
  const fixedAssets = 1469134.69
  const intangible = 125000
  const total = current + fixedAssets + intangible

  const breakdown = [
    { type: 'Cash', amount: cash, percentage: (cash / total) * 100, liquidity: 'high' as const },
    { type: 'Accounts Receivable', amount: receivables, percentage: (receivables / total) * 100, liquidity: 'medium' as const },
    { type: 'Inventory', amount: inventoryValue, percentage: (inventoryValue / total) * 100, liquidity: 'medium' as const },
    { type: 'Fixed Assets', amount: fixedAssets, percentage: (fixedAssets / total) * 100, liquidity: 'low' as const },
    { type: 'Intangible Assets', amount: intangible, percentage: (intangible / total) * 100, liquidity: 'low' as const }
  ]

  return {
    total,
    current,
    inventory: inventoryValue,
    receivables,
    cash,
    fixedAssets,
    intangible,
    breakdown
  }
}

function calculateLiabilityMetrics(currentData: any) {
  // Mock liability data
  const payables = 156789.45
  const accrued = 67890.12
  const current = payables + accrued
  const loans = 234567.89
  const longTerm = 333322.23 - loans
  const total = current + longTerm + loans

  const breakdown = [
    { type: 'Accounts Payable', amount: payables, dueDate: new Date('2024-04-30'), interestRate: undefined },
    { type: 'Accrued Expenses', amount: accrued, dueDate: new Date('2024-04-15'), interestRate: undefined },
    { type: 'Bank Loans', amount: loans, dueDate: new Date('2027-12-31'), interestRate: 5.5 },
    { type: 'Long-term Debt', amount: longTerm, dueDate: new Date('2029-06-30'), interestRate: 4.2 }
  ]

  return {
    total,
    current,
    payables,
    accrued,
    longTerm: longTerm + loans,
    loans,
    breakdown
  }
}

function calculateEquityMetrics(currentData: any) {
  // Mock equity data
  const paidInCapital = 1000000
  const retainedEarnings = 701665.43
  const currentEarnings = 187234.12
  const distributions = 0
  const total = paidInCapital + retainedEarnings + currentEarnings - distributions

  return {
    total,
    paidInCapital,
    retainedEarnings,
    currentEarnings,
    distributions
  }
}

function calculateFinancialRatios(revenue: any, profitability: any, assets: any, liabilities: any, equity: any) {
  return {
    liquidity: {
      currentRatio: assets.current / liabilities.current,
      quickRatio: (assets.current - assets.inventory) / liabilities.current,
      cashRatio: assets.cash / liabilities.current
    },
    leverage: {
      debtToEquity: liabilities.total / equity.total,
      debtToAssets: liabilities.total / assets.total,
      timesInterestEarned: profitability.operatingProfit / (liabilities.loans * 0.055) // Assuming 5.5% average interest
    },
    profitability: {
      roe: (profitability.netProfit / equity.total) * 100,
      roa: (profitability.netProfit / assets.total) * 100,
      roc: (profitability.netProfit / (assets.total - liabilities.current)) * 100,
      grossMargin: profitability.grossMargin,
      netMargin: profitability.netMargin
    },
    efficiency: {
      inventoryTurnover: revenue.total / assets.inventory,
      receivablesTurnover: revenue.total / assets.receivables,
      assetTurnover: revenue.total / assets.total,
      payablesTurnover: revenue.total / liabilities.payables
    },
    market: {
      priceToEarnings: undefined,
      priceToBook: undefined,
      marketCap: undefined
    }
  }
}

function calculateTaxMetrics(taxData: any, currentData: any) {
  const totalTaxLiability = taxData.salesTax + taxData.incomeTax + taxData.payrollTax + taxData.propertyTax
  const currentRevenue = currentData.sales.reduce((sum: number, sale: any) => sum + sale.total, 0)
  const effectiveTaxRate = currentRevenue > 0 ? (taxData.incomeTax / currentRevenue) * 100 : 0

  return {
    salesTax: taxData.salesTax,
    incomeTax: taxData.incomeTax,
    payrollTax: taxData.payrollTax,
    propertyTax: taxData.propertyTax,
    totalTaxLiability,
    effectiveTaxRate: Number(effectiveTaxRate.toFixed(1)),
    taxSavings: 15234.56, // Mock tax savings
    nextPaymentDue: taxData.nextPaymentDue,
    nextPaymentAmount: taxData.nextPaymentAmount
  }
}

function calculateBudgetAnalysis(currentData: any, budgetData: any) {
  const currentRevenue = currentData.sales.reduce((sum: number, sale: any) => sum + sale.total, 0)

  const actualVsBudget = [
    {
      category: 'Revenue',
      budgeted: budgetData.revenue,
      actual: currentRevenue,
      variance: currentRevenue - budgetData.revenue,
      variancePercentage: ((currentRevenue - budgetData.revenue) / budgetData.revenue) * 100
    }
    // Add more budget comparisons here
  ]

  const overallVariance = actualVsBudget.reduce((sum, item) => sum + item.variance, 0)
  const favorableVariances = actualVsBudget.filter(item => item.variance > 0).length
  const unfavorableVariances = actualVsBudget.filter(item => item.variance < 0).length

  return {
    actualVsBudget,
    overallVariance,
    favorableVariances,
    unfavorableVariances
  }
}

function calculateKPIs(revenue: any, profitability: any, cashFlow: any, ratios: any) {
  return {
    revenueGrowthRate: revenue.growth,
    profitMarginTrend: profitability.marginTrends.grossMarginChange,
    costControl: 95.2, // Mock value
    financialHealthScore: 87, // Mock composite score
    cashFlowStability: 78.5, // Mock value
    debtServiceCoverage: ratios.liquidity.currentRatio * 25, // Simplified calculation
    workingCapitalRatio: ratios.liquidity.currentRatio,
    returnOnInvestment: ratios.profitability.roi || ratios.profitability.roe
  }
}

function calculateForecasting(currentData: any, comparisonData: any) {
  const currentRevenue = currentData.sales.reduce((sum: number, sale: any) => sum + sale.total, 0)
  const growthRate = 0.08 // 8% growth assumption

  return {
    nextMonth: {
      revenue: currentRevenue * (1 + growthRate),
      expenses: currentRevenue * 0.7,
      profit: currentRevenue * 0.15,
      cashFlow: currentRevenue * 0.25
    },
    nextQuarter: {
      revenue: currentRevenue * 3 * (1 + growthRate),
      expenses: currentRevenue * 3 * 0.7,
      profit: currentRevenue * 3 * 0.15,
      cashFlow: currentRevenue * 3 * 0.25
    },
    nextYear: {
      revenue: currentRevenue * 12 * (1 + growthRate),
      expenses: currentRevenue * 12 * 0.7,
      profit: currentRevenue * 12 * 0.15,
      cashFlow: currentRevenue * 12 * 0.25
    },
    scenarios: [
      {
        name: 'Optimistic',
        probability: 30,
        impact: {
          revenue: currentRevenue * 1.2,
          profit: currentRevenue * 0.2,
          cashFlow: currentRevenue * 0.3
        }
      },
      {
        name: 'Pessimistic',
        probability: 20,
        impact: {
          revenue: currentRevenue * 0.85,
          profit: currentRevenue * 0.1,
          cashFlow: currentRevenue * 0.15
        }
      },
      {
        name: 'Most Likely',
        probability: 50,
        impact: {
          revenue: currentRevenue * 1.08,
          profit: currentRevenue * 0.15,
          cashFlow: currentRevenue * 0.25
        }
      }
    ]
  }
}

function generateFinancialAlerts(currentData: any, ratios: any, cashFlow: any) {
  const alerts = []

  // Cash flow alert
  if (cashFlow.netCashFlow < 0) {
    alerts.push({
      type: 'critical' as const,
      category: 'Cash Flow',
      title: 'Negative Cash Flow',
      message: 'Net cash flow is negative, immediate action required',
      actionRequired: true,
      impact: 'high' as const
    })
  }

  // Liquidity alert
  if (ratios.liquidity.currentRatio < 1.5) {
    alerts.push({
      type: 'warning' as const,
      category: 'Liquidity',
      title: 'Low Current Ratio',
      message: 'Current ratio below recommended threshold',
      actionRequired: true,
      impact: 'medium' as const
    })
  }

  // Positive performance alert
  if (ratios.profitability.roe > 15) {
    alerts.push({
      type: 'info' as const,
      category: 'Performance',
      title: 'Strong ROE',
      message: 'Return on equity exceeds industry average',
      actionRequired: false,
      impact: 'low' as const
    })
  }

  return alerts
}

function calculateBenchmarks(ratios: any, profitability: any) {
  // Industry averages (mock data)
  const industryAverages = {
    grossMargin: 35.0,
    netMargin: 10.0,
    currentRatio: 2.0,
    debtToEquity: 0.5,
    roe: 15.0
  }

  return {
    industryAverages,
    performanceVsIndustry: {
      grossMarginComparison: profitability.grossMargin - industryAverages.grossMargin,
      netMarginComparison: profitability.netMargin - industryAverages.netMargin,
      liquidityComparison: ratios.liquidity.currentRatio - industryAverages.currentRatio,
      leverageComparison: industryAverages.debtToEquity - ratios.leverage.debtToEquity,
      profitabilityComparison: ratios.profitability.roe - industryAverages.roe
    }
  }
}

export async function getFinancialHealthScore(organizationId: string): Promise<number> {
  const endDate = new Date()
  const startDate = startOfMonth(endDate)

  const metrics = await getComprehensiveFinancialAnalytics(organizationId, startDate, endDate)

  // Calculate weighted score
  let score = 0

  // Profitability (30%)
  score += Math.min(metrics.profitability.netMargin / 15 * 30, 30)

  // Liquidity (25%)
  score += Math.min(metrics.ratios.liquidity.currentRatio / 2 * 25, 25)

  // Growth (20%)
  score += Math.min(metrics.revenue.growth / 20 * 20, 20)

  // Leverage (15%)
  score += Math.max(15 - (metrics.ratios.leverage.debtToEquity / 0.5 * 15), 0)

  // Cash Flow (10%)
  score += metrics.cashFlow.netCashFlow > 0 ? 10 : 0

  return Math.round(Math.min(score, 100))
}

export async function generateFinancialReport(
  organizationId: string,
  reportType: 'income_statement' | 'balance_sheet' | 'cash_flow' | 'comprehensive',
  startDate: Date,
  endDate: Date
): Promise<any> {
  const metrics = await getComprehensiveFinancialAnalytics(organizationId, startDate, endDate)

  switch (reportType) {
    case 'income_statement':
      return {
        revenue: metrics.revenue,
        expenses: metrics.expenses,
        profitability: metrics.profitability
      }
    case 'balance_sheet':
      return {
        assets: metrics.assets,
        liabilities: metrics.liabilities,
        equity: metrics.equity
      }
    case 'cash_flow':
      return {
        cashFlow: metrics.cashFlow
      }
    case 'comprehensive':
    default:
      return metrics
  }
}