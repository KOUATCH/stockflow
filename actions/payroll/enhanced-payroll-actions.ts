"use server"

import { db } from "@/prisma/db"
import { startOfMonth, endOfMonth, startOfDay, endOfDay, differenceInMinutes, format, subMonths } from "date-fns"

export interface EnhancedEmployeeData {
  id: string
  firstName: string
  lastName: string
  name: string
  email: string
  phone?: string
  jobTitle?: string
  isActive: boolean
  createdAt: Date
  totalHoursWorked: number
  totalOvertimeHours: number
  totalBreakMinutes: number
  avgDailyHours: number
  payrollCalculations: {
    baseSalary: number
    overtimePay: number
    regularPay: number
    grossPay: number
    deductions: {
      federalTax: number
      stateTax: number
      socialSecurity: number
      medicare: number
      healthInsurance: number
      retirement: number
      total: number
    }
    netPay: number
  }
}

export interface DepartmentPayrollSummary {
  department: string
  employeeCount: number
  totalHours: number
  totalGrossPay: number
  totalNetPay: number
  averageSalary: number
  overtimePercentage: number
}

export interface AttendanceMetrics {
  totalWorkingDays: number
  actualWorkingDays: number
  attendanceRate: number
  avgDailyHours: number
  totalOvertimeHours: number
  punctualityScore: number
}

export interface ComprehensivePayrollSummary {
  period: {
    startDate: Date
    endDate: Date
    label: string
  }
  employees: {
    total: number
    active: number
    newHires: number
    terminated: number
  }
  financials: {
    totalGrossPay: number
    totalNetPay: number
    totalDeductions: number
    totalOvertimePay: number
    averageSalary: number
    payrollCostPercentage: number
  }
  attendance: {
    avgAttendanceRate: number
    totalHoursWorked: number
    avgHoursPerEmployee: number
    punctualityScore: number
    absenteeismRate: number
  }
  departments: DepartmentPayrollSummary[]
  trends: {
    payrollGrowth: number
    attendanceChange: number
    overtimeChange: number
    turnoverRate: number
  }
  alerts: Array<{
    type: 'warning' | 'error' | 'info'
    title: string
    description: string
    severity: 'low' | 'medium' | 'high'
    impact?: number
  }>
}

export async function getEnhancedEmployeeData(
  organizationId: string,
  startDate: Date,
  endDate: Date
): Promise<{ success: boolean; data?: EnhancedEmployeeData[]; error?: string }> {
  try {
    const employees = await db.user.findMany({
      where: {
        organizationId,
        isActive: true
      },
      include: {
        presenceSessions: {
          where: {
            clockInTime: {
              gte: startDate,
              lte: endDate
            }
          },
          include: {
            breakSessions: {
              where: {
                endTime: { not: null }
              }
            }
          }
        }
      }
    })

    const enhancedEmployees: EnhancedEmployeeData[] = employees.map(employee => {
      // Calculate total hours worked
      const totalMinutesWorked = employee.presenceSessions.reduce((total, session) => {
        return total + (session.totalMinutesWorked || 0)
      }, 0)

      const totalHoursWorked = totalMinutesWorked / 60

      // Calculate overtime hours
      const totalOvertimeHours = employee.presenceSessions.reduce((total, session) => {
        return total + (session.overtimeMinutes || 0) / 60
      }, 0)

      // Calculate total break minutes
      const totalBreakMinutes = employee.presenceSessions.reduce((total, session) => {
        return total + (session.totalBreakMinutes || 0)
      }, 0)

      // Calculate working days in period
      const workingDays = employee.presenceSessions.length
      const avgDailyHours = workingDays > 0 ? totalHoursWorked / workingDays : 0

      // Payroll calculations
      const hourlyRate = 25 // Base hourly rate - could be stored in employee profile
      const overtimeRate = hourlyRate * 1.5
      const regularHours = totalHoursWorked - totalOvertimeHours

      const regularPay = regularHours * hourlyRate
      const overtimePay = totalOvertimeHours * overtimeRate
      const grossPay = regularPay + overtimePay

      // Calculate deductions
      const federalTax = grossPay * 0.12
      const stateTax = grossPay * 0.05
      const socialSecurity = grossPay * 0.062
      const medicare = grossPay * 0.0145
      const healthInsurance = 300 // Fixed monthly health insurance
      const retirement = grossPay * 0.04
      const totalDeductions = federalTax + stateTax + socialSecurity + medicare + healthInsurance + retirement

      const netPay = grossPay - totalDeductions

      return {
        id: employee.id,
        firstName: employee.firstName || '',
        lastName: employee.lastName || '',
        name: employee.name || `${employee.firstName} ${employee.lastName}`,
        email: employee.email,
        phone: employee.phone || undefined,
        jobTitle: employee.jobTitle || undefined,
        isActive: employee.isActive,
        createdAt: employee.createdAt,
        totalHoursWorked,
        totalOvertimeHours,
        totalBreakMinutes,
        avgDailyHours,
        payrollCalculations: {
          baseSalary: regularPay,
          overtimePay,
          regularPay,
          grossPay,
          deductions: {
            federalTax,
            stateTax,
            socialSecurity,
            medicare,
            healthInsurance,
            retirement,
            total: totalDeductions
          },
          netPay
        }
      }
    })

    return {
      success: true,
      data: enhancedEmployees
    }
  } catch (error) {
    console.error("Error getting enhanced employee data:", error)
    return {
      success: false,
      error: "Failed to get enhanced employee data"
    }
  }
}

export async function getAttendanceMetrics(
  organizationId: string,
  startDate: Date,
  endDate: Date
): Promise<{ success: boolean; data?: AttendanceMetrics; error?: string }> {
  try {
    const employees = await db.user.findMany({
      where: {
        organizationId,
        isActive: true
      },
      include: {
        presenceSessions: {
          where: {
            clockInTime: {
              gte: startDate,
              lte: endDate
            }
          }
        },
        schedules: {
          where: {
            isActive: true
          }
        }
      }
    })

    const totalEmployees = employees.length
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    const totalWorkingDays = daysDiff * totalEmployees

    // Calculate attendance metrics
    let actualWorkingDays = 0
    let totalMinutesWorked = 0
    let totalOvertimeMinutes = 0
    let punctualSessions = 0
    let totalSessions = 0

    employees.forEach(employee => {
      employee.presenceSessions.forEach(session => {
        actualWorkingDays++
        totalSessions++
        totalMinutesWorked += session.totalMinutesWorked || 0
        totalOvertimeMinutes += session.overtimeMinutes || 0

        // Check punctuality (assume work starts at 9 AM)
        const clockInHour = new Date(session.clockInTime).getHours()
        if (clockInHour <= 9) {
          punctualSessions++
        }
      })
    })

    const attendanceRate = totalWorkingDays > 0 ? (actualWorkingDays / totalWorkingDays) * 100 : 0
    const avgDailyHours = actualWorkingDays > 0 ? (totalMinutesWorked / 60) / actualWorkingDays : 0
    const totalOvertimeHours = totalOvertimeMinutes / 60
    const punctualityScore = totalSessions > 0 ? (punctualSessions / totalSessions) * 100 : 100

    return {
      success: true,
      data: {
        totalWorkingDays,
        actualWorkingDays,
        attendanceRate,
        avgDailyHours,
        totalOvertimeHours,
        punctualityScore
      }
    }
  } catch (error) {
    console.error("Error getting attendance metrics:", error)
    return {
      success: false,
      error: "Failed to get attendance metrics"
    }
  }
}

export async function getComprehensivePayrollSummary(
  organizationId: string,
  startDate: Date,
  endDate: Date
): Promise<{ success: boolean; data?: ComprehensivePayrollSummary; error?: string }> {
  try {
    // Get enhanced employee data
    const employeeDataResult = await getEnhancedEmployeeData(organizationId, startDate, endDate)
    if (!employeeDataResult.success || !employeeDataResult.data) {
      return {
        success: false,
        error: "Failed to get employee data"
      }
    }

    const employees = employeeDataResult.data

    // Get attendance metrics
    const attendanceResult = await getAttendanceMetrics(organizationId, startDate, endDate)
    const attendanceMetrics = attendanceResult.data

    // Get previous period for comparison
    const previousPeriodStart = subMonths(startDate, 1)
    const previousPeriodEnd = subMonths(endDate, 1)
    const previousEmployeeDataResult = await getEnhancedEmployeeData(organizationId, previousPeriodStart, previousPeriodEnd)

    // Calculate financial totals
    const totalGrossPay = employees.reduce((sum, emp) => sum + emp.payrollCalculations.grossPay, 0)
    const totalNetPay = employees.reduce((sum, emp) => sum + emp.payrollCalculations.netPay, 0)
    const totalDeductions = employees.reduce((sum, emp) => sum + emp.payrollCalculations.deductions.total, 0)
    const totalOvertimePay = employees.reduce((sum, emp) => sum + emp.payrollCalculations.overtimePay, 0)
    const averageSalary = employees.length > 0 ? totalGrossPay / employees.length : 0

    // Calculate department breakdown
    const departmentGroups = employees.reduce((acc, emp) => {
      const dept = emp.jobTitle || 'General'
      if (!acc[dept]) {
        acc[dept] = []
      }
      acc[dept].push(emp)
      return acc
    }, {} as Record<string, EnhancedEmployeeData[]>)

    const departments: DepartmentPayrollSummary[] = Object.entries(departmentGroups).map(([dept, emps]) => {
      const totalHours = emps.reduce((sum, emp) => sum + emp.totalHoursWorked, 0)
      const totalOvertime = emps.reduce((sum, emp) => sum + emp.totalOvertimeHours, 0)
      const deptGrossPay = emps.reduce((sum, emp) => sum + emp.payrollCalculations.grossPay, 0)
      const deptNetPay = emps.reduce((sum, emp) => sum + emp.payrollCalculations.netPay, 0)

      return {
        department: dept,
        employeeCount: emps.length,
        totalHours,
        totalGrossPay: deptGrossPay,
        totalNetPay: deptNetPay,
        averageSalary: emps.length > 0 ? deptGrossPay / emps.length : 0,
        overtimePercentage: totalHours > 0 ? (totalOvertime / totalHours) * 100 : 0
      }
    })

    // Calculate trends
    const previousTotalGrossPay = previousEmployeeDataResult.success && previousEmployeeDataResult.data ?
      previousEmployeeDataResult.data.reduce((sum, emp) => sum + emp.payrollCalculations.grossPay, 0) : totalGrossPay

    const payrollGrowth = previousTotalGrossPay > 0 ?
      ((totalGrossPay - previousTotalGrossPay) / previousTotalGrossPay) * 100 : 0

    // Generate alerts
    const alerts = []

    if (attendanceMetrics && attendanceMetrics.attendanceRate < 85) {
      alerts.push({
        type: 'warning' as const,
        title: 'Low Attendance Rate',
        description: `Attendance rate is ${attendanceMetrics.attendanceRate.toFixed(1)}%, below the 85% threshold`,
        severity: 'medium' as const,
        impact: totalGrossPay * 0.15
      })
    }

    if (attendanceMetrics && attendanceMetrics.totalOvertimeHours > totalGrossPay * 0.15) {
      alerts.push({
        type: 'warning' as const,
        title: 'High Overtime Costs',
        description: 'Overtime costs are higher than expected for this period',
        severity: 'medium' as const,
        impact: totalOvertimePay
      })
    }

    if (payrollGrowth > 20) {
      alerts.push({
        type: 'info' as const,
        title: 'Significant Payroll Growth',
        description: `Payroll has grown by ${payrollGrowth.toFixed(1)}% compared to last period`,
        severity: 'low' as const
      })
    }

    const summary: ComprehensivePayrollSummary = {
      period: {
        startDate,
        endDate,
        label: format(startDate, 'MMMM yyyy')
      },
      employees: {
        total: employees.length,
        active: employees.filter(emp => emp.isActive).length,
        newHires: employees.filter(emp => emp.createdAt >= startDate).length,
        terminated: 0 // Would need termination date tracking
      },
      financials: {
        totalGrossPay,
        totalNetPay,
        totalDeductions,
        totalOvertimePay,
        averageSalary,
        payrollCostPercentage: totalGrossPay > 0 ? (totalGrossPay / (totalGrossPay * 3)) * 100 : 0 // Assume payroll is ~33% of revenue
      },
      attendance: {
        avgAttendanceRate: attendanceMetrics?.attendanceRate || 0,
        totalHoursWorked: employees.reduce((sum, emp) => sum + emp.totalHoursWorked, 0),
        avgHoursPerEmployee: employees.length > 0 ? employees.reduce((sum, emp) => sum + emp.totalHoursWorked, 0) / employees.length : 0,
        punctualityScore: attendanceMetrics?.punctualityScore || 0,
        absenteeismRate: attendanceMetrics ? 100 - attendanceMetrics.attendanceRate : 0
      },
      departments,
      trends: {
        payrollGrowth,
        attendanceChange: 0, // Would need previous period attendance data
        overtimeChange: 0, // Would need previous period overtime data
        turnoverRate: 0 // Would need termination tracking
      },
      alerts
    }

    return {
      success: true,
      data: summary
    }
  } catch (error) {
    console.error("Error getting comprehensive payroll summary:", error)
    return {
      success: false,
      error: "Failed to get comprehensive payroll summary"
    }
  }
}

export async function getEmployeeAttendanceReport(
  organizationId: string,
  employeeId: string,
  startDate: Date,
  endDate: Date
) {
  try {
    const employee = await db.user.findFirst({
      where: {
        id: employeeId,
        organizationId
      },
      include: {
        presenceSessions: {
          where: {
            clockInTime: {
              gte: startDate,
              lte: endDate
            }
          },
          include: {
            breakSessions: true,
            activityLogs: true
          },
          orderBy: {
            clockInTime: 'desc'
          }
        },
        schedules: {
          where: {
            isActive: true
          }
        }
      }
    })

    if (!employee) {
      return {
        success: false,
        error: "Employee not found"
      }
    }

    // Process attendance data
    const attendanceData = employee.presenceSessions.map(session => {
      const clockInTime = new Date(session.clockInTime)
      const clockOutTime = session.clockOutTime ? new Date(session.clockOutTime) : null
      const hoursWorked = session.totalMinutesWorked / 60
      const breakTime = session.totalBreakMinutes
      const overtime = session.overtimeMinutes / 60

      return {
        date: format(clockInTime, 'yyyy-MM-dd'),
        clockIn: format(clockInTime, 'HH:mm'),
        clockOut: clockOutTime ? format(clockOutTime, 'HH:mm') : 'In Progress',
        hoursWorked: hoursWorked.toFixed(2),
        breakTime,
        overtime: overtime.toFixed(2),
        status: session.status,
        notes: session.notes
      }
    })

    // Calculate summary statistics
    const totalHours = employee.presenceSessions.reduce((sum, session) => sum + (session.totalMinutesWorked / 60), 0)
    const totalOvertimeHours = employee.presenceSessions.reduce((sum, session) => sum + (session.overtimeMinutes / 60), 0)
    const totalBreakMinutes = employee.presenceSessions.reduce((sum, session) => sum + session.totalBreakMinutes, 0)
    const attendanceDays = employee.presenceSessions.length

    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    const attendanceRate = (attendanceDays / daysDiff) * 100

    return {
      success: true,
      data: {
        employee: {
          id: employee.id,
          name: employee.name || `${employee.firstName} ${employee.lastName}`,
          jobTitle: employee.jobTitle,
          email: employee.email
        },
        period: {
          startDate,
          endDate,
          totalDays: daysDiff
        },
        summary: {
          attendanceDays,
          attendanceRate: attendanceRate.toFixed(1),
          totalHours: totalHours.toFixed(2),
          avgHoursPerDay: attendanceDays > 0 ? (totalHours / attendanceDays).toFixed(2) : '0',
          totalOvertimeHours: totalOvertimeHours.toFixed(2),
          totalBreakMinutes,
          punctualityScore: 95 // Would calculate based on schedule adherence
        },
        attendanceData
      }
    }
  } catch (error) {
    console.error("Error getting employee attendance report:", error)
    return {
      success: false,
      error: "Failed to get employee attendance report"
    }
  }
}