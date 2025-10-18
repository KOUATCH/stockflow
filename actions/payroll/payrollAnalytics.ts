"use server"

import { db } from "@/prisma/db"
import { startOfYear, endOfYear, startOfMonth, endOfMonth, subMonths, format } from "date-fns"

export interface PayrollAnalytics {
  overview: {
    totalEmployees: number
    totalPayrollExpense: number
    averageSalary: number
    payrollGrowthRate: number
    costPerEmployee: number
    payrollAsPercentageOfRevenue: number
  }

  trends: {
    monthlyPayrollTrend: Array<{
      month: string
      totalPayroll: number
      employeeCount: number
      averageSalary: number
      growth: number
    }>
    departmentTrends: Array<{
      department: string
      currentMonth: number
      previousMonth: number
      growth: number
      employeeCount: number
    }>
  }

  breakdown: {
    byDepartment: Array<{
      department: string
      employeeCount: number
      totalCost: number
      averageSalary: number
      percentageOfTotal: number
      overtimeCost: number
      benefitsCost: number
    }>

    byPayGrade: Array<{
      grade: string
      salaryRange: string
      employeeCount: number
      totalCost: number
      averageSalary: number
    }>

    byCostType: Array<{
      type: 'Base Salary' | 'Overtime' | 'Bonuses' | 'Benefits' | 'Taxes' | 'Other'
      amount: number
      percentage: number
      trend: number
    }>
  }

  efficiency: {
    payrollToRevenueRatio: number
    costPerProductiveHour: number
    averageOvertimePercentage: number
    turnoverCost: number
    absenteeismCost: number
    payrollProcessingCost: number
  }

  compliance: {
    taxWithholdingAccuracy: number
    payrollTaxLiability: number
    benefitsComplianceScore: number
    overtimeCompliance: number
    minimumWageCompliance: number
  }

  forecasting: {
    nextMonthProjection: {
      totalPayroll: number
      employeeCount: number
      estimatedGrowth: number
    }
    quarterlyProjection: {
      totalPayroll: number
      seasonalAdjustment: number
      budgetVariance: number
    }
    annualProjection: {
      totalPayroll: number
      expectedHires: number
      salaryInflation: number
      benefitsCostIncrease: number
    }
  }

  alerts: Array<{
    type: 'budget_variance' | 'overtime_spike' | 'compliance_issue' | 'cost_increase'
    severity: 'low' | 'medium' | 'high' | 'critical'
    title: string
    description: string
    department?: string
    impact: number
    recommendation: string
  }>
}

export async function getPayrollAnalytics(
  organizationId: string,
  startDate: Date,
  endDate: Date
): Promise<{ success: boolean; data?: PayrollAnalytics; error?: string }> {
  try {
    // Get employees data
    const employees = await db.user.findMany({
      where: {
        organizationId,
        isActive: true
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        jobTitle: true,
        createdAt: true
      }
    })

    // Mock calculations for demonstration
    const totalEmployees = employees.length
    const mockBaseSalary = 5000
    const totalPayrollExpense = totalEmployees * mockBaseSalary * 1.3 // Including benefits and taxes
    const averageSalary = totalEmployees > 0 ? totalPayrollExpense / totalEmployees : 0

    // Group by department (using jobTitle as proxy)
    const departmentGroups = employees.reduce((acc, emp) => {
      const dept = emp.jobTitle || 'General'
      if (!acc[dept]) {
        acc[dept] = []
      }
      acc[dept].push(emp)
      return acc
    }, {} as Record<string, typeof employees>)

    // Calculate department breakdown
    const byDepartment = Object.entries(departmentGroups).map(([dept, emps]) => {
      const deptTotalCost = emps.length * mockBaseSalary * 1.3
      return {
        department: dept,
        employeeCount: emps.length,
        totalCost: deptTotalCost,
        averageSalary: deptTotalCost / emps.length,
        percentageOfTotal: (deptTotalCost / totalPayrollExpense) * 100,
        overtimeCost: deptTotalCost * 0.05,
        benefitsCost: deptTotalCost * 0.15
      }
    })

    // Generate monthly trend data
    const monthlyPayrollTrend = Array.from({ length: 6 }, (_, i) => {
      const monthDate = subMonths(endDate, 5 - i)
      const baseAmount = totalPayrollExpense * (0.95 + Math.random() * 0.1)

      return {
        month: format(monthDate, 'MMM yyyy'),
        totalPayroll: baseAmount,
        employeeCount: Math.floor(totalEmployees * (0.9 + Math.random() * 0.2)),
        averageSalary: baseAmount / totalEmployees,
        growth: i > 0 ? (Math.random() * 10 - 2) : 0 // -2% to +8% growth
      }
    })

    // Cost type breakdown
    const byCostType = [
      { type: 'Base Salary' as const, amount: totalPayrollExpense * 0.65, percentage: 65, trend: 2.3 },
      { type: 'Benefits' as const, amount: totalPayrollExpense * 0.15, percentage: 15, trend: 4.1 },
      { type: 'Taxes' as const, amount: totalPayrollExpense * 0.125, percentage: 12.5, trend: 1.8 },
      { type: 'Overtime' as const, amount: totalPayrollExpense * 0.05, percentage: 5, trend: -0.5 },
      { type: 'Bonuses' as const, amount: totalPayrollExpense * 0.02, percentage: 2, trend: 12.5 },
      { type: 'Other' as const, amount: totalPayrollExpense * 0.005, percentage: 0.5, trend: 0 }
    ]

    // Pay grade analysis
    const byPayGrade = [
      { grade: 'Entry Level', salaryRange: '$3,000 - $4,500', employeeCount: Math.floor(totalEmployees * 0.4), totalCost: totalPayrollExpense * 0.25, averageSalary: 3750 },
      { grade: 'Mid Level', salaryRange: '$4,500 - $7,000', employeeCount: Math.floor(totalEmployees * 0.4), totalCost: totalPayrollExpense * 0.45, averageSalary: 5625 },
      { grade: 'Senior Level', salaryRange: '$7,000 - $12,000', employeeCount: Math.floor(totalEmployees * 0.15), totalCost: totalPayrollExpense * 0.25, averageSalary: 9500 },
      { grade: 'Executive', salaryRange: '$12,000+', employeeCount: Math.floor(totalEmployees * 0.05), totalCost: totalPayrollExpense * 0.05, averageSalary: 15000 }
    ]

    // Generate alerts
    const alerts = []

    // Budget variance alert
    if (totalPayrollExpense > 100000) {
      alerts.push({
        type: 'budget_variance' as const,
        severity: 'medium' as const,
        title: 'Payroll Over Budget',
        description: 'Monthly payroll expense exceeds planned budget by 8%',
        impact: totalPayrollExpense * 0.08,
        recommendation: 'Review overtime policies and evaluate non-essential positions'
      })
    }

    // Overtime spike alert
    const overtimePercentage = 12.5
    if (overtimePercentage > 10) {
      alerts.push({
        type: 'overtime_spike' as const,
        severity: 'high' as const,
        title: 'High Overtime Costs',
        description: `Overtime represents ${overtimePercentage}% of total payroll costs`,
        department: 'Operations',
        impact: totalPayrollExpense * 0.05,
        recommendation: 'Consider hiring additional staff or redistributing workload'
      })
    }

    const analytics: PayrollAnalytics = {
      overview: {
        totalEmployees,
        totalPayrollExpense,
        averageSalary,
        payrollGrowthRate: 3.2,
        costPerEmployee: totalPayrollExpense / totalEmployees,
        payrollAsPercentageOfRevenue: 35.5
      },

      trends: {
        monthlyPayrollTrend,
        departmentTrends: byDepartment.map(dept => ({
          department: dept.department,
          currentMonth: dept.totalCost,
          previousMonth: dept.totalCost * 0.95,
          growth: 5.3,
          employeeCount: dept.employeeCount
        }))
      },

      breakdown: {
        byDepartment,
        byPayGrade,
        byCostType
      },

      efficiency: {
        payrollToRevenueRatio: 0.355,
        costPerProductiveHour: 45.50,
        averageOvertimePercentage: 8.5,
        turnoverCost: 25000,
        absenteeismCost: 12000,
        payrollProcessingCost: 2500
      },

      compliance: {
        taxWithholdingAccuracy: 99.2,
        payrollTaxLiability: totalPayrollExpense * 0.125,
        benefitsComplianceScore: 95.8,
        overtimeCompliance: 98.5,
        minimumWageCompliance: 100
      },

      forecasting: {
        nextMonthProjection: {
          totalPayroll: totalPayrollExpense * 1.02,
          employeeCount: totalEmployees + 1,
          estimatedGrowth: 2.0
        },
        quarterlyProjection: {
          totalPayroll: totalPayrollExpense * 3 * 1.05,
          seasonalAdjustment: 0.03,
          budgetVariance: -2.5
        },
        annualProjection: {
          totalPayroll: totalPayrollExpense * 12 * 1.08,
          expectedHires: 5,
          salaryInflation: 3.5,
          benefitsCostIncrease: 5.2
        }
      },

      alerts
    }

    return {
      success: true,
      data: analytics
    }
  } catch (error) {
    console.error("Error getting payroll analytics:", error)
    return {
      success: false,
      error: "Failed to get payroll analytics"
    }
  }
}

export async function getPayrollCostAnalysis(
  organizationId: string,
  period: 'month' | 'quarter' | 'year' = 'month'
) {
  try {
    const employees = await db.user.findMany({
      where: {
        organizationId,
        isActive: true
      }
    })

    const totalEmployees = employees.length
    const periodMultiplier = period === 'month' ? 1 : period === 'quarter' ? 3 : 12
    const baseCost = totalEmployees * 5000 * periodMultiplier

    const costAnalysis = {
      period,
      totalCost: baseCost * 1.3,
      breakdown: {
        directCosts: {
          salariesAndWages: baseCost,
          overtime: baseCost * 0.05,
          bonuses: baseCost * 0.02,
          commissions: baseCost * 0.01
        },
        benefits: {
          healthInsurance: baseCost * 0.08,
          retirement: baseCost * 0.04,
          paidTimeOff: baseCost * 0.03,
          other: baseCost * 0.02
        },
        taxes: {
          socialSecurity: baseCost * 0.062,
          medicare: baseCost * 0.0145,
          unemployment: baseCost * 0.006,
          workersComp: baseCost * 0.015
        },
        administrativeCosts: {
          payrollProcessing: 2500 * periodMultiplier,
          hrSystems: 1000 * periodMultiplier,
          compliance: 500 * periodMultiplier
        }
      },
      metrics: {
        costPerEmployee: (baseCost * 1.3) / totalEmployees,
        costPerHour: ((baseCost * 1.3) / totalEmployees) / (160 * periodMultiplier),
        benefitsAsPercentageOfSalary: 17,
        taxesAsPercentageOfSalary: 10.5
      },
      comparisons: {
        industryAverage: baseCost * 1.25,
        variance: 4.0,
        ranking: 'Above Average'
      }
    }

    return {
      success: true,
      data: costAnalysis
    }
  } catch (error) {
    console.error("Error getting payroll cost analysis:", error)
    return {
      success: false,
      error: "Failed to get payroll cost analysis"
    }
  }
}

export async function getDepartmentPayrollComparison(organizationId: string) {
  try {
    const employees = await db.user.findMany({
      where: {
        organizationId,
        isActive: true
      },
      select: {
        jobTitle: true
      }
    })

    // Group by department
    const departmentGroups = employees.reduce((acc, emp) => {
      const dept = emp.jobTitle || 'General'
      if (!acc[dept]) {
        acc[dept] = 0
      }
      acc[dept]++
      return acc
    }, {} as Record<string, number>)

    const comparison = Object.entries(departmentGroups).map(([dept, count]) => {
      const avgSalary = 5000 * (0.8 + Math.random() * 0.4) // Vary by department
      const totalCost = count * avgSalary * 1.3

      return {
        department: dept,
        employeeCount: count,
        averageSalary: avgSalary,
        totalCost,
        costPerEmployee: totalCost / count,
        percentageOfTotalPayroll: 0, // Will be calculated after
        efficiency: Math.random() * 40 + 60, // 60-100% efficiency score
        growth: (Math.random() * 20) - 5, // -5% to +15% growth
        budget: totalCost * 1.1,
        variance: -10 + Math.random() * 20 // -10% to +10% budget variance
      }
    })

    // Calculate percentages
    const totalPayroll = comparison.reduce((sum, dept) => sum + dept.totalCost, 0)
    comparison.forEach(dept => {
      dept.percentageOfTotalPayroll = (dept.totalCost / totalPayroll) * 100
    })

    return {
      success: true,
      data: {
        departments: comparison,
        summary: {
          totalDepartments: comparison.length,
          totalEmployees: employees.length,
          totalPayroll,
          averageDepartmentSize: employees.length / comparison.length,
          mostExpensiveDepartment: comparison.reduce((prev, curr) =>
            prev.totalCost > curr.totalCost ? prev : curr
          ),
          mostEfficientDepartment: comparison.reduce((prev, curr) =>
            prev.efficiency > curr.efficiency ? prev : curr
          )
        }
      }
    }
  } catch (error) {
    console.error("Error getting department payroll comparison:", error)
    return {
      success: false,
      error: "Failed to get department payroll comparison"
    }
  }
}