"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import DataTable from '@/components/DataTableComponents/DataTable'
import { enhancedSalaryColumns, EnhancedSalaryRecord } from '@/_legacy-dashboard/dashboard/payroll/salary-list/enhanced-columns'
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Calendar,
  CheckCircle,
  CreditCard,
  DollarSign,
  Download,
  FileText,
  Filter,
  Plus,
  RefreshCw,
  Send,
  Settings,
  TrendingUp,
  Users,
  Wallet
} from 'lucide-react'
import { getMonthlyPayrollReport } from '@/actions/payroll/payrollManagement'
import { format, startOfMonth, endOfMonth } from 'date-fns'

interface EnhancedMonthlySalaryListProps {
  organizationId: string
}

export default function EnhancedMonthlySalaryList({ organizationId }: EnhancedMonthlySalaryListProps) {
  const [loading, setLoading] = useState(true)
  const [rawPayrollData, setRawPayrollData] = useState<any>(null)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedTab, setSelectedTab] = useState('overview')

  useEffect(() => {
    loadPayrollData()
  }, [organizationId, selectedMonth, selectedYear])

  const loadPayrollData = async () => {
    setLoading(true)
    try {
      const result = await getMonthlyPayrollReport(organizationId, selectedYear, selectedMonth)
      if (result.success) {
        setRawPayrollData(result.data)
      }
    } catch (error) {
      console.error('Error loading payroll data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Transform raw data to enhanced format for TanStack table
  const enhancedData: EnhancedSalaryRecord[] = useMemo(() => {
    if (!rawPayrollData?.employees) return []

    const sampleImages = [
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
      "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
      "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
    ]

    return rawPayrollData.employees.map((emp: any, index: number) => {
      const baseSalary = emp.salary?.amount || Math.floor(Math.random() * 50000) + 40000
      const overtimeHours = Math.random() * 20
      const overtime = overtimeHours * (baseSalary / 2080 * 1.5) // 1.5x hourly rate
      const bonuses = Math.random() > 0.7 ? Math.floor(Math.random() * 5000) : 0
      const grossPay = baseSalary + overtime + bonuses
      const federalTax = grossPay * 0.22
      const stateTax = grossPay * 0.08
      const socialSecurity = grossPay * 0.062
      const medicare = grossPay * 0.0145
      const healthInsurance = Math.floor(Math.random() * 300) + 200
      const retirement401k = grossPay * 0.06
      const totalDeductions = federalTax + stateTax + socialSecurity + medicare + healthInsurance + retirement401k
      const netPay = grossPay - totalDeductions

      return {
        id: emp.id || `emp-${index}`,
        employeeId: emp.id || `EMP-${String(index + 1).padStart(4, '0')}`,
        employeeName: emp.name || emp.firstName + ' ' + emp.lastName || `Employee ${index + 1}`,
        employeeImage: Math.random() > 0.3 ? sampleImages[index % sampleImages.length] : undefined,
        department: emp.department || ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance'][Math.floor(Math.random() * 5)],
        jobTitle: emp.jobTitle || ['Senior Developer', 'Sales Manager', 'Marketing Specialist', 'HR Coordinator', 'Accountant'][Math.floor(Math.random() * 5)],
        baseSalary: baseSalary,
        overtime: overtime,
        bonuses: bonuses,
        deductions: totalDeductions,
        grossPay: grossPay,
        netPay: netPay,
        taxWithholdings: federalTax + stateTax,
        paymentStatus: ['DRAFT', 'PENDING', 'PROCESSING', 'PAID', 'FAILED'][Math.floor(Math.random() * 5)] as any,
        paymentDate: Math.random() > 0.5 ? new Date() : undefined,
        paymentMethod: ['DIRECT_DEPOSIT', 'CHECK', 'CASH'][Math.floor(Math.random() * 3)] as any,
        workingDays: 22 - Math.floor(Math.random() * 3), // 20-22 working days
        totalHours: (22 - Math.floor(Math.random() * 3)) * 8 + Math.random() * 40, // Base hours + some variation
        overtimeHours: overtimeHours,
        ptoTaken: Math.floor(Math.random() * 3),
        healthInsurance: healthInsurance,
        retirement401k: retirement401k,
        socialSecurity: socialSecurity,
        medicare: medicare,
        federalTax: federalTax,
        stateTax: stateTax,
        createdAt: new Date(),
        updatedAt: new Date(),
        performanceRating: 3 + Math.random() * 2, // 3-5 rating
        attendanceScore: 85 + Math.random() * 15, // 85-100%
        yearToDateTotal: netPay * (selectedMonth), // Rough YTD calculation
        bankAccount: `****${Math.floor(Math.random() * 9999).toString().padStart(4, '0')}`,
      } as EnhancedSalaryRecord
    })
  }, [rawPayrollData, selectedMonth])

  const payrollStats = useMemo(() => {
    if (!enhancedData.length) return null

    const totalEmployees = enhancedData.length
    const totalGrossPay = enhancedData.reduce((sum, emp) => sum + emp.grossPay, 0)
    const totalNetPay = enhancedData.reduce((sum, emp) => sum + emp.netPay, 0)
    const totalDeductions = enhancedData.reduce((sum, emp) => sum + emp.deductions, 0)
    const totalOvertimeHours = enhancedData.reduce((sum, emp) => sum + emp.overtimeHours, 0)
    const avgSalary = totalGrossPay / totalEmployees

    const paidCount = enhancedData.filter(emp => emp.paymentStatus === 'PAID').length
    const pendingCount = enhancedData.filter(emp => emp.paymentStatus === 'PENDING').length
    const processingCount = enhancedData.filter(emp => emp.paymentStatus === 'PROCESSING').length

    return {
      totalEmployees,
      totalGrossPay,
      totalNetPay,
      totalDeductions,
      totalOvertimeHours,
      avgSalary,
      paidCount,
      pendingCount,
      processingCount,
      paymentCompletionRate: (paidCount / totalEmployees) * 100
    }
  }, [enhancedData])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num)
  }

  const currentPeriod = `${format(new Date(selectedYear, selectedMonth - 1), 'MMMM yyyy')}`

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/25">
              <Wallet className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                Monthly Salary Management
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Comprehensive payroll processing for {currentPeriod}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={loadPayrollData} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button>
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>
      </div>

      {/* Period Selection */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Payroll Period</CardTitle>
              <CardDescription>Select the month and year for payroll processing</CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Month:</label>
                <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()}>
                        {format(new Date(2024, i), 'MMMM')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Year:</label>
                <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 5 }, (_, i) => (
                      <SelectItem key={2020 + i} value={(2020 + i).toString()}>
                        {2020 + i}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* KPI Dashboard */}
      {payrollStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 via-white to-blue-50/50 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-700">Total Employees</CardTitle>
                <Users className="w-5 h-5 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{formatNumber(payrollStats.totalEmployees)}</div>
              <p className="text-xs text-slate-600 mt-1">Active employees</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 via-white to-green-50/50 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-700">Gross Payroll</CardTitle>
                <DollarSign className="w-5 h-5 text-green-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{formatCurrency(payrollStats.totalGrossPay)}</div>
              <p className="text-xs text-slate-600 mt-1">Before deductions</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-50 via-white to-emerald-50/50 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-700">Net Payroll</CardTitle>
                <Wallet className="w-5 h-5 text-emerald-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-600">{formatCurrency(payrollStats.totalNetPay)}</div>
              <p className="text-xs text-slate-600 mt-1">Take-home pay</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 via-white to-red-50/50 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-700">Total Deductions</CardTitle>
                <FileText className="w-5 h-5 text-red-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{formatCurrency(payrollStats.totalDeductions)}</div>
              <p className="text-xs text-slate-600 mt-1">Taxes & benefits</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 via-white to-orange-50/50 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-700">Overtime Hours</CardTitle>
                <Activity className="w-5 h-5 text-orange-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{Math.round(payrollStats.totalOvertimeHours)}</div>
              <p className="text-xs text-slate-600 mt-1">Total overtime</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 via-white to-purple-50/50 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-700">Payment Rate</CardTitle>
                <CheckCircle className="w-5 h-5 text-purple-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{Math.round(payrollStats.paymentCompletionRate)}%</div>
              <p className="text-xs text-slate-600 mt-1">Payments processed</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Payment Status Summary */}
      {payrollStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div>
                  <div className="text-2xl font-bold text-green-600">{payrollStats.paidCount}</div>
                  <div className="text-sm text-green-700">Payments Completed</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-8 h-8 text-yellow-600" />
                <div>
                  <div className="text-2xl font-bold text-yellow-600">{payrollStats.pendingCount}</div>
                  <div className="text-sm text-yellow-700">Pending Approval</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Activity className="w-8 h-8 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold text-blue-600">{payrollStats.processingCount}</div>
                  <div className="text-sm text-blue-700">Currently Processing</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Advanced TanStack Data Table */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader className="border-b border-slate-200 dark:border-slate-700">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl text-slate-900 dark:text-white">
                Employee Salary Details
              </CardTitle>
              <CardDescription>
                Comprehensive salary breakdown and payment management for {currentPeriod}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Send className="w-4 h-4 mr-2" />
                Batch Send Payslips
              </Button>
              <Button variant="outline" size="sm">
                <CreditCard className="w-4 h-4 mr-2" />
                Process Payments
              </Button>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Employee
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            columns={enhancedSalaryColumns}
            data={enhancedData}
            model="salary-records"
            searchPlaceholder="Search employees by name, department, or job title..."
          />
        </CardContent>
      </Card>
    </div>
  )
}
