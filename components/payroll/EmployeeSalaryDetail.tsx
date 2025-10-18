"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DatePicker } from '@/components/ui/date-picker'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DollarSign,
  Calendar,
  User,
  TrendingUp,
  FileText,
  Download,
  Calculator,
  CreditCard,
  Receipt,
  Clock,
  CheckCircle,
  Building
} from 'lucide-react'
import { getEmployees } from '@/actions/payroll/payrollManagement'

interface Employee {
  id: string
  firstName: string
  lastName: string
  name: string
  email: string
  jobTitle: string
  department: string
  salaryInfo?: {
    baseSalary: number
    payFrequency: 'MONTHLY' | 'WEEKLY' | 'BIWEEKLY'
    currency: string
  }
}

interface SalaryPeriod {
  id: string
  startDate: Date
  endDate: Date
  periodType: 'MONTHLY' | 'WEEKLY' | 'BIWEEKLY' | 'QUARTERLY' | 'YEARLY'
  grossSalary: number
  deductions: {
    federalTax: number
    stateTax: number
    socialSecurity: number
    medicare: number
    insurance: number
    retirement: number
    other: number
  }
  netSalary: number
  status: 'PENDING' | 'PROCESSED' | 'PAID'
  payDate?: Date
}

interface EmployeeSalaryDetailProps {
  organizationId: string
}

export default function EmployeeSalaryDetail({ organizationId }: EmployeeSalaryDetailProps) {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('')
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState<'MONTHLY' | 'WEEKLY' | 'BIWEEKLY' | 'QUARTERLY' | 'YEARLY'>('MONTHLY')
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [salaryPeriods, setSalaryPeriods] = useState<SalaryPeriod[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadEmployees()
  }, [organizationId])

  useEffect(() => {
    if (selectedEmployeeId) {
      const employee = employees.find(emp => emp.id === selectedEmployeeId)
      setSelectedEmployee(employee || null)
    }
  }, [selectedEmployeeId, employees])

  useEffect(() => {
    if (selectedEmployee && startDate && endDate) {
      generateSalaryPeriods()
    }
  }, [selectedEmployee, selectedPeriod, startDate, endDate])

  const loadEmployees = async () => {
    try {
      const result = await getEmployees(organizationId)
      if (result.success) {
        const employeesWithSalary = result.data.map((emp: any) => ({
          ...emp,
          firstName: emp.firstName || emp.name?.split(' ')[0] || 'Unknown',
          lastName: emp.lastName || emp.name?.split(' ').slice(1).join(' ') || 'User',
          salaryInfo: {
            baseSalary: Math.floor(Math.random() * 5000) + 3000,
            payFrequency: 'MONTHLY' as const,
            currency: 'USD'
          }
        }))
        setEmployees(employeesWithSalary)
      }
    } catch (error) {
      console.error('Error loading employees:', error)
    }
  }

  const generateSalaryPeriods = () => {
    if (!selectedEmployee || !startDate || !endDate) return

    setLoading(true)
    const periods: SalaryPeriod[] = []
    const start = startDate
    const end = endDate
    const baseSalary = selectedEmployee.salaryInfo?.baseSalary || 0

    let currentDate = new Date(start)
    let periodIndex = 0

    while (currentDate <= end) {
      let periodEnd = new Date(currentDate)

      switch (selectedPeriod) {
        case 'WEEKLY':
          periodEnd.setDate(currentDate.getDate() + 6)
          break
        case 'BIWEEKLY':
          periodEnd.setDate(currentDate.getDate() + 13)
          break
        case 'MONTHLY':
          periodEnd.setMonth(currentDate.getMonth() + 1)
          periodEnd.setDate(0) // Last day of the month
          break
        case 'QUARTERLY':
          periodEnd.setMonth(currentDate.getMonth() + 3)
          periodEnd.setDate(0)
          break
        case 'YEARLY':
          periodEnd.setFullYear(currentDate.getFullYear() + 1)
          periodEnd.setDate(0)
          break
      }

      if (periodEnd > end) periodEnd = new Date(end)

      // Calculate salary for this period
      let grossSalary = 0
      switch (selectedPeriod) {
        case 'WEEKLY':
          grossSalary = baseSalary / 4.33 // Approximate weeks per month
          break
        case 'BIWEEKLY':
          grossSalary = baseSalary / 2.17 // Approximate bi-weeks per month
          break
        case 'MONTHLY':
          grossSalary = baseSalary
          break
        case 'QUARTERLY':
          grossSalary = baseSalary * 3
          break
        case 'YEARLY':
          grossSalary = baseSalary * 12
          break
      }

      // Calculate deductions (mock calculations)
      const federalTax = grossSalary * 0.22 // 22% federal tax
      const stateTax = grossSalary * 0.05 // 5% state tax
      const socialSecurity = grossSalary * 0.062 // 6.2% social security
      const medicare = grossSalary * 0.0145 // 1.45% medicare
      const insurance = 150 // Fixed insurance deduction
      const retirement = grossSalary * 0.05 // 5% retirement contribution
      const other = 0

      const totalDeductions = federalTax + stateTax + socialSecurity + medicare + insurance + retirement + other
      const netSalary = grossSalary - totalDeductions

      periods.push({
        id: `period_${periodIndex}`,
        startDate: new Date(currentDate),
        endDate: new Date(periodEnd),
        periodType: selectedPeriod,
        grossSalary,
        deductions: {
          federalTax,
          stateTax,
          socialSecurity,
          medicare,
          insurance,
          retirement,
          other
        },
        netSalary,
        status: periodIndex % 3 === 0 ? 'PAID' : periodIndex % 3 === 1 ? 'PROCESSED' : 'PENDING',
        payDate: periodIndex % 3 === 0 ? new Date(periodEnd.getTime() + 2 * 24 * 60 * 60 * 1000) : undefined
      })

      // Move to next period
      currentDate = new Date(periodEnd)
      currentDate.setDate(currentDate.getDate() + 1)
      periodIndex++

      // Safety check to prevent infinite loop
      if (periodIndex > 50) break
    }

    setSalaryPeriods(periods)
    setLoading(false)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200', icon: Clock },
      PROCESSED: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200', icon: Calculator },
      PAID: { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-200', icon: CheckCircle }
    }
    const variant = variants[status as keyof typeof variants]
    const Icon = variant.icon

    return (
      <Badge className={`${variant.bg} ${variant.text} ${variant.border}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status}
      </Badge>
    )
  }

  const totalGrossSalary = salaryPeriods.reduce((sum, period) => sum + period.grossSalary, 0)
  const totalDeductions = salaryPeriods.reduce((sum, period) =>
    sum + Object.values(period.deductions).reduce((deductionSum, amount) => deductionSum + amount, 0), 0)
  const totalNetSalary = salaryPeriods.reduce((sum, period) => sum + period.netSalary, 0)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25">
            <Receipt className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              Employee Salary Details
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              View detailed salary information for specific employees and time periods
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-600" />
            Salary Inquiry
          </CardTitle>
          <CardDescription>
            Select an employee and date range to view salary details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="employee">Employee *</Label>
              <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.name} - {emp.department}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="period">Period Type</Label>
              <Select value={selectedPeriod} onValueChange={(value: any) => setSelectedPeriod(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WEEKLY">Weekly</SelectItem>
                  <SelectItem value="BIWEEKLY">Bi-weekly</SelectItem>
                  <SelectItem value="MONTHLY">Monthly</SelectItem>
                  <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                  <SelectItem value="YEARLY">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <DatePicker
                date={startDate}
                onDateChange={setStartDate}
                placeholder="Select start date"
                maxDate={endDate || new Date()}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date *</Label>
              <DatePicker
                date={endDate}
                onDateChange={setEndDate}
                placeholder="Select end date"
                minDate={startDate}
                maxDate={new Date()}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employee Info */}
      {selectedEmployee && (
        <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-emerald-500/20 shadow-lg">
                <User className="w-6 h-6 text-emerald-700" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold">{selectedEmployee.name}</h3>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                  <span className="flex items-center gap-1">
                    <Building className="w-4 h-4" />
                    {selectedEmployee.department}
                  </span>
                  <span>{selectedEmployee.jobTitle}</span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    {formatCurrency(selectedEmployee.salaryInfo?.baseSalary || 0)} / month
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      {salaryPeriods.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Card className="relative overflow-hidden border-2 border-emerald-300/30 bg-gradient-to-br from-emerald-400/20 via-teal-400/10 to-cyan-400/20 backdrop-blur-xl shadow-2xl ring-1 ring-white/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-emerald-500/20 shadow-lg">
                  <DollarSign className="w-6 h-6 text-emerald-700" />
                </div>
                <div>
                  <p className="text-sm text-emerald-600/80 font-medium">Total Gross Salary</p>
                  <p className="text-2xl font-bold text-emerald-700">{formatCurrency(totalGrossSalary)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-2 border-red-300/30 bg-gradient-to-br from-red-400/20 via-orange-400/10 to-yellow-400/20 backdrop-blur-xl shadow-2xl ring-1 ring-white/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-red-500/20 shadow-lg">
                  <TrendingUp className="w-6 h-6 text-red-700" />
                </div>
                <div>
                  <p className="text-sm text-red-600/80 font-medium">Total Deductions</p>
                  <p className="text-2xl font-bold text-red-700">{formatCurrency(totalDeductions)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-2 border-blue-300/30 bg-gradient-to-br from-blue-400/20 via-cyan-400/10 to-teal-400/20 backdrop-blur-xl shadow-2xl ring-1 ring-white/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-blue-500/20 shadow-lg">
                  <CreditCard className="w-6 h-6 text-blue-700" />
                </div>
                <div>
                  <p className="text-sm text-blue-600/80 font-medium">Total Net Salary</p>
                  <p className="text-2xl font-bold text-blue-700">{formatCurrency(totalNetSalary)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Salary Periods Table */}
      {salaryPeriods.length > 0 && (
        <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-0 shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-600" />
                  Salary Breakdown
                </CardTitle>
                <CardDescription>
                  Detailed salary information for {selectedPeriod.toLowerCase()} periods
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" className="bg-white/80 dark:bg-slate-800/80">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Period</TableHead>
                    <TableHead>Gross Salary</TableHead>
                    <TableHead>Federal Tax</TableHead>
                    <TableHead>State Tax</TableHead>
                    <TableHead>Social Security</TableHead>
                    <TableHead>Medicare</TableHead>
                    <TableHead>Insurance</TableHead>
                    <TableHead>Retirement</TableHead>
                    <TableHead>Net Salary</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Pay Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salaryPeriods.map((period) => (
                    <TableRow key={period.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{formatDate(period.startDate)}</div>
                          <div className="text-sm text-muted-foreground">to {formatDate(period.endDate)}</div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{formatCurrency(period.grossSalary)}</TableCell>
                      <TableCell>{formatCurrency(period.deductions.federalTax)}</TableCell>
                      <TableCell>{formatCurrency(period.deductions.stateTax)}</TableCell>
                      <TableCell>{formatCurrency(period.deductions.socialSecurity)}</TableCell>
                      <TableCell>{formatCurrency(period.deductions.medicare)}</TableCell>
                      <TableCell>{formatCurrency(period.deductions.insurance)}</TableCell>
                      <TableCell>{formatCurrency(period.deductions.retirement)}</TableCell>
                      <TableCell className="font-bold text-emerald-600">{formatCurrency(period.netSalary)}</TableCell>
                      <TableCell>{getStatusBadge(period.status)}</TableCell>
                      <TableCell>
                        {period.payDate ? (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            {formatDate(period.payDate)}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Data State */}
      {!loading && salaryPeriods.length === 0 && selectedEmployee && startDate && endDate && (
        <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-0 shadow-xl">
          <CardContent className="p-12 text-center">
            <Receipt className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-600 dark:text-slate-400 mb-2">
              No Salary Data Found
            </h3>
            <p className="text-slate-500 dark:text-slate-500">
              No salary records found for the selected employee and date range.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-0 shadow-xl">
          <CardContent className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-slate-600 dark:text-slate-400">Calculating salary details...</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}