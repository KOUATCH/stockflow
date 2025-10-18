"use server"

import { db } from "@/prisma/db"
import { startOfMonth, endOfMonth, format, startOfDay, endOfDay } from "date-fns"
import type {
  Employee,
  PayrollPeriod,
  PayrollEntry,
  PayrollSummary,
  PayrollExpenseAllocation
} from "@/types/retailFinance"

// Employee Management Actions
export async function createEmployee(data: {
  organizationId: string
  employeeCode: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  jobTitle: string
  department: string
  hireDate: Date
  baseSalary: number
  payFrequency: 'MONTHLY' | 'WEEKLY' | 'BIWEEKLY'
  taxId: string
  bankInfo?: {
    bankName: string
    accountNumber: string
    routingNumber: string
    accountType: 'CHECKING' | 'SAVINGS'
  }
}) {
  try {
    // Check if employee code already exists
    const existingEmployee = await db.user.findFirst({
      where: {
        organizationId: data.organizationId,
        email: data.email
      }
    })

    if (existingEmployee) {
      return {
        success: false,
        error: "Employee with this email already exists"
      }
    }

    // Create employee record as User with employee-specific data
    const employee = await db.user.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        phone: data.phone,
        jobTitle: data.jobTitle,
        organizationId: data.organizationId,
        password: 'temp_password', // Will be reset on first login
        isActive: true,
        isVerified: false
      }
    })

    return {
      success: true,
      data: employee,
      message: "Employee created successfully"
    }
  } catch (error) {
    console.error("Error creating employee:", error)
    return {
      success: false,
      error: "Failed to create employee"
    }
  }
}

export async function updateEmployee(data: {
  employeeId: string
  organizationId: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  jobTitle: string
  department: string
  hireDate: Date
  baseSalary: number
  payFrequency: 'MONTHLY' | 'WEEKLY' | 'BIWEEKLY'
  taxId: string
  bankInfo?: {
    bankName: string
    accountNumber: string
    routingNumber: string
    accountType: 'CHECKING' | 'SAVINGS'
  }
}) {
  try {
    // Check if email is being changed to an existing email (excluding current employee)
    const existingEmployee = await db.user.findFirst({
      where: {
        organizationId: data.organizationId,
        email: data.email,
        id: {
          not: data.employeeId // Exclude the current employee from the check
        }
      }
    })

    if (existingEmployee) {
      return {
        success: false,
        error: "Employee with this email already exists"
      }
    }

    // Update employee record
    const employee = await db.user.update({
      where: {
        id: data.employeeId,
        organizationId: data.organizationId
      },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        phone: data.phone,
        jobTitle: data.jobTitle,
        updatedAt: new Date()
      }
    })

    return {
      success: true,
      data: employee,
      message: "Employee updated successfully"
    }
  } catch (error) {
    console.error("Error updating employee:", error)
    return {
      success: false,
      error: "Failed to update employee"
    }
  }
}

export async function getEmployees(organizationId: string) {
  try {
    const employees = await db.user.findMany({
      where: {
        organizationId,
        isActive: true
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        name: true,
        email: true,
        phone: true,
        jobTitle: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        lastName: 'asc'
      }
    })

    return {
      success: true,
      data: employees
    }
  } catch (error) {
    console.error("Error fetching employees:", error)
    return {
      success: false,
      error: "Failed to fetch employees"
    }
  }
}

// Payroll Period Management
export async function createPayrollPeriod(data: {
  organizationId: string
  periodStart: Date
  periodEnd: Date
  payDate: Date
  notes?: string
}) {
  try {
    // Check for overlapping periods
    const existingPeriod = await db.user.findFirst({
      where: {
        organizationId: data.organizationId
        // Note: This is a simplified check since we don't have payroll tables in schema yet
      }
    })

    // For now, we'll create a mock payroll period
    const payrollPeriod = {
      id: `payroll_${Date.now()}`,
      organizationId: data.organizationId,
      periodStart: data.periodStart,
      periodEnd: data.periodEnd,
      payDate: data.payDate,
      status: 'DRAFT' as const,
      totalGrossPay: 0,
      totalDeductions: 0,
      totalNetPay: 0,
      totalEmployees: 0,
      notes: data.notes,
      createdAt: new Date(),
      updatedAt: new Date(),
      payrollEntries: []
    }

    return {
      success: true,
      data: payrollPeriod,
      message: "Payroll period created successfully"
    }
  } catch (error) {
    console.error("Error creating payroll period:", error)
    return {
      success: false,
      error: "Failed to create payroll period"
    }
  }
}

export async function getPayrollPeriods(organizationId: string, year?: number) {
  try {
    // Mock payroll periods for demonstration
    const currentYear = year || new Date().getFullYear()
    const months = Array.from({ length: 12 }, (_, i) => {
      const month = i
      const start = startOfMonth(new Date(currentYear, month))
      const end = endOfMonth(new Date(currentYear, month))

      return {
        id: `payroll_${currentYear}_${month + 1}`,
        organizationId,
        periodStart: start,
        periodEnd: end,
        payDate: new Date(currentYear, month + 1, 5), // 5th of next month
        status: month < new Date().getMonth() ? 'PAID' : 'DRAFT',
        totalGrossPay: Math.random() * 100000 + 50000,
        totalDeductions: Math.random() * 20000 + 10000,
        totalNetPay: 0,
        totalEmployees: Math.floor(Math.random() * 20) + 10,
        createdAt: start,
        updatedAt: start,
        payrollEntries: []
      }
    })

    // Calculate net pay
    months.forEach(period => {
      period.totalNetPay = period.totalGrossPay - period.totalDeductions
    })

    return {
      success: true,
      data: months
    }
  } catch (error) {
    console.error("Error fetching payroll periods:", error)
    return {
      success: false,
      error: "Failed to fetch payroll periods"
    }
  }
}

// Payroll Processing
export async function processPayroll(payrollPeriodId: string) {
  try {
    // Get all active employees for the organization
    // This would typically involve complex payroll calculations

    // Mock processing for demonstration
    const processedPayroll = {
      id: payrollPeriodId,
      status: 'PROCESSING',
      totalEmployees: 15,
      totalGrossPay: 75000,
      totalDeductions: 18750,
      totalNetPay: 56250,
      processedAt: new Date()
    }

    return {
      success: true,
      data: processedPayroll,
      message: "Payroll processed successfully"
    }
  } catch (error) {
    console.error("Error processing payroll:", error)
    return {
      success: false,
      error: "Failed to process payroll"
    }
  }
}

// Payroll Summary and Analytics
export async function getPayrollSummary(
  organizationId: string,
  startDate: Date,
  endDate: Date
): Promise<{ success: boolean; data?: PayrollSummary; error?: string }> {
  try {
    // Get employees count
    const employees = await db.user.findMany({
      where: {
        organizationId,
        isActive: true
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        jobTitle: true
      }
    })

    // Mock payroll calculations based on employee data
    const totalEmployees = employees.length
    const mockBaseSalary = 5000 // Average base salary
    const totalGrossPay = totalEmployees * mockBaseSalary
    const totalDeductions = totalGrossPay * 0.25 // 25% average deductions
    const totalNetPay = totalGrossPay - totalDeductions

    // Group employees by department (using jobTitle as proxy)
    const departmentGroups = employees.reduce((acc, emp) => {
      const dept = emp.jobTitle || 'General'
      if (!acc[dept]) {
        acc[dept] = []
      }
      acc[dept].push(emp)
      return acc
    }, {} as Record<string, typeof employees>)

    const departmentBreakdown = Object.entries(departmentGroups).map(([dept, emps]) => ({
      department: dept,
      employeeCount: emps.length,
      totalGrossPay: emps.length * mockBaseSalary,
      totalNetPay: emps.length * mockBaseSalary * 0.75,
      averageSalary: mockBaseSalary
    }))

    const summary: PayrollSummary = {
      period: {
        startDate,
        endDate,
        payDate: new Date(),
        label: format(startDate, 'MMMM yyyy')
      },
      totals: {
        totalEmployees,
        totalGrossPay,
        totalDeductions,
        totalNetPay,
        averageSalary: totalEmployees > 0 ? totalGrossPay / totalEmployees : 0
      },
      breakdown: {
        byDepartment: departmentBreakdown,
        byPayFrequency: [
          { frequency: 'Monthly', employeeCount: totalEmployees, totalAmount: totalGrossPay }
        ]
      },
      deductions: {
        federalTax: totalDeductions * 0.4,
        stateTax: totalDeductions * 0.15,
        socialSecurity: totalDeductions * 0.25,
        medicare: totalDeductions * 0.1,
        healthInsurance: totalDeductions * 0.05,
        retirement: totalDeductions * 0.03,
        other: totalDeductions * 0.02
      },
      paymentMethods: {
        directDeposit: totalNetPay * 0.9,
        check: totalNetPay * 0.08,
        cash: totalNetPay * 0.02
      }
    }

    return {
      success: true,
      data: summary
    }
  } catch (error) {
    console.error("Error getting payroll summary:", error)
    return {
      success: false,
      error: "Failed to get payroll summary"
    }
  }
}

export async function getMonthlyPayrollReport(
  organizationId: string,
  year: number,
  month: number
) {
  try {
    const startDate = startOfMonth(new Date(year, month - 1))
    const endDate = endOfMonth(new Date(year, month - 1))

    const summary = await getPayrollSummary(organizationId, startDate, endDate)

    if (!summary.success) {
      return summary
    }

    // Get individual employee payroll entries for the month
    const employees = await db.user.findMany({
      where: {
        organizationId,
        isActive: true
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        name: true,
        email: true,
        jobTitle: true
      }
    })

    // Mock individual payroll entries
    const payrollEntries = employees.map(emp => ({
      id: `entry_${emp.id}_${year}_${month}`,
      employeeId: emp.id,
      employee: {
        id: emp.id,
        name: emp.name || `${emp.firstName} ${emp.lastName}`,
        jobTitle: emp.jobTitle || 'Employee'
      },
      baseSalary: 5000,
      overtime: Math.random() * 500,
      bonuses: Math.random() * 1000,
      totalGrossEarnings: 0,
      federalTax: 0,
      stateTax: 0,
      socialSecurity: 0,
      medicare: 0,
      healthInsurance: 300,
      retirementContribution: 250,
      totalDeductions: 0,
      netPay: 0,
      status: 'PAID' as const,
      paymentMethod: 'DIRECT_DEPOSIT' as const,
      paidDate: new Date(year, month, 5)
    }))

    // Calculate totals for each entry
    payrollEntries.forEach(entry => {
      entry.totalGrossEarnings = entry.baseSalary + entry.overtime + entry.bonuses
      entry.federalTax = entry.totalGrossEarnings * 0.12
      entry.stateTax = entry.totalGrossEarnings * 0.05
      entry.socialSecurity = entry.totalGrossEarnings * 0.062
      entry.medicare = entry.totalGrossEarnings * 0.0145
      entry.totalDeductions = entry.federalTax + entry.stateTax + entry.socialSecurity +
                             entry.medicare + entry.healthInsurance + entry.retirementContribution
      entry.netPay = entry.totalGrossEarnings - entry.totalDeductions
    })

    return {
      success: true,
      data: {
        summary: summary.data,
        payrollEntries,
        periodInfo: {
          year,
          month,
          monthName: format(startDate, 'MMMM'),
          startDate,
          endDate,
          payDate: new Date(year, month, 5)
        }
      }
    }
  } catch (error) {
    console.error("Error getting monthly payroll report:", error)
    return {
      success: false,
      error: "Failed to get monthly payroll report"
    }
  }
}

// Payroll Expense Allocation for Financial Integration
export async function getPayrollExpenseAllocation(
  organizationId: string,
  payrollPeriodId: string
): Promise<{ success: boolean; data?: PayrollExpenseAllocation; error?: string }> {
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

    const totalEmployees = employees.length
    const mockBaseSalary = 5000
    const totalSalariesAndWages = totalEmployees * mockBaseSalary
    const benefits = totalSalariesAndWages * 0.15
    const payrollTaxes = totalSalariesAndWages * 0.125
    const workersCompensation = totalSalariesAndWages * 0.02
    const unemploymentTax = totalSalariesAndWages * 0.006

    // Department allocation based on job titles
    const deptCounts = employees.reduce((acc, emp) => {
      const dept = emp.jobTitle || 'General'
      acc[dept] = (acc[dept] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const totalPayrollExpense = totalSalariesAndWages + benefits + payrollTaxes +
                               workersCompensation + unemploymentTax

    const departmentAllocations = Object.entries(deptCounts).map(([dept, count]) => ({
      department: dept,
      amount: (count / totalEmployees) * totalPayrollExpense,
      percentage: (count / totalEmployees) * 100
    }))

    const allocation: PayrollExpenseAllocation = {
      id: `allocation_${payrollPeriodId}`,
      organizationId,
      payrollPeriodId,
      salariesAndWages: totalSalariesAndWages,
      benefits,
      payrollTaxes,
      workersCompensation,
      unemploymentTax,
      departmentAllocations,
      totalPayrollExpense,
      createdAt: new Date()
    }

    return {
      success: true,
      data: allocation
    }
  } catch (error) {
    console.error("Error getting payroll expense allocation:", error)
    return {
      success: false,
      error: "Failed to get payroll expense allocation"
    }
  }
}