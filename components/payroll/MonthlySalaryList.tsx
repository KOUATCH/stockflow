"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Search,
  Filter,
  Download,
  Eye,
  Mail,
  Calendar,
  DollarSign,
  TrendingUp,
  Users
} from 'lucide-react'
import { getMonthlyPayrollReport } from '@/actions/payroll/payrollManagement'
import { format } from 'date-fns'

interface MonthlySalaryListProps {
  organizationId: string
}

export default function MonthlySalaryList({ organizationId }: MonthlySalaryListProps) {
  const [loading, setLoading] = useState(true)
  const [payrollData, setPayrollData] = useState<any>(null)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [searchTerm, setSearchTerm] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null)

  useEffect(() => {
    loadPayrollData()
  }, [organizationId, selectedMonth, selectedYear])

  const loadPayrollData = async () => {
    setLoading(true)
    try {
      const result = await getMonthlyPayrollReport(organizationId, selectedYear, selectedMonth)
      if (result.success) {
        setPayrollData(result.data)
      }
    } catch (error) {
      console.error('Error loading payroll data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>
      case 'PROCESSING':
        return <Badge className="bg-yellow-100 text-yellow-800">Processing</Badge>
      case 'DRAFT':
        return <Badge className="bg-gray-100 text-gray-800">Draft</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const filteredEntries = payrollData?.payrollEntries?.filter((entry: any) => {
    const matchesSearch = entry.employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.employee.jobTitle.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDepartment = departmentFilter === 'all' ||
                             entry.employee.jobTitle === departmentFilter
    return matchesSearch && matchesDepartment
  }) || []

  const departments = Array.from(new Set(
    payrollData?.payrollEntries?.map((entry: any) => entry.employee.jobTitle) || []
  )).filter(Boolean)

  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ]

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/25">
              <DollarSign className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                Monthly Salary Report
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Detailed salary information for {payrollData?.periodInfo?.monthName} {payrollData?.periodInfo?.year}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg"
            >
              <Mail className="w-4 h-4 mr-2" />
              Send Payslips
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="relative overflow-hidden border-2 border-amber-300/30 bg-gradient-to-br from-amber-400/20 via-yellow-400/10 to-orange-400/20 backdrop-blur-xl shadow-2xl ring-1 ring-white/20 hover:shadow-3xl hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 ease-out group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/20 to-transparent rounded-bl-full" />
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-white/10 to-transparent rounded-tr-full" />
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-amber-500/20 animate-pulse" />
            <div className="absolute top-8 right-8 w-1 h-1 rounded-full bg-amber-500/20 animate-pulse delay-200" />
            <div className="absolute bottom-6 right-6 w-1.5 h-1.5 rounded-full bg-amber-500/20 animate-pulse delay-500" />
          </div>
          <CardContent className="relative z-10 p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-amber-500/20 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Users className="w-6 h-6 text-amber-700" />
              </div>
              <div>
                <p className="text-sm text-amber-600/80 font-medium">Total Employees</p>
                <p className="text-2xl font-bold text-amber-700">
                  {payrollData?.summary?.totals?.totalEmployees || 0}
                </p>
                <p className="text-xs text-amber-600/60">Active employees</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-2 border-emerald-300/30 bg-gradient-to-br from-emerald-400/20 via-teal-400/10 to-cyan-400/20 backdrop-blur-xl shadow-2xl ring-1 ring-white/20 hover:shadow-3xl hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 ease-out group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/20 to-transparent rounded-bl-full" />
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-white/10 to-transparent rounded-tr-full" />
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-emerald-500/20 animate-pulse" />
            <div className="absolute top-8 right-8 w-1 h-1 rounded-full bg-emerald-500/20 animate-pulse delay-200" />
            <div className="absolute bottom-6 right-6 w-1.5 h-1.5 rounded-full bg-emerald-500/20 animate-pulse delay-500" />
          </div>
          <CardContent className="relative z-10 p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-emerald-500/20 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <DollarSign className="w-6 h-6 text-emerald-700" />
              </div>
              <div>
                <p className="text-sm text-emerald-600/80 font-medium">Gross Payroll</p>
                <p className="text-2xl font-bold text-emerald-700">
                  {formatCurrency(payrollData?.summary?.totals?.totalGrossPay || 0)}
                </p>
                <p className="text-xs text-emerald-600/60">Before deductions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-2 border-orange-300/30 bg-gradient-to-br from-orange-400/20 via-red-400/10 to-pink-400/20 backdrop-blur-xl shadow-2xl ring-1 ring-white/20 hover:shadow-3xl hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 ease-out group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/20 to-transparent rounded-bl-full" />
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-white/10 to-transparent rounded-tr-full" />
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-orange-500/20 animate-pulse" />
            <div className="absolute top-8 right-8 w-1 h-1 rounded-full bg-orange-500/20 animate-pulse delay-200" />
            <div className="absolute bottom-6 right-6 w-1.5 h-1.5 rounded-full bg-orange-500/20 animate-pulse delay-500" />
          </div>
          <CardContent className="relative z-10 p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-orange-500/20 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="w-6 h-6 text-orange-700" />
              </div>
              <div>
                <p className="text-sm text-orange-600/80 font-medium">Total Deductions</p>
                <p className="text-2xl font-bold text-orange-700">
                  {formatCurrency(payrollData?.summary?.totals?.totalDeductions || 0)}
                </p>
                <p className="text-xs text-orange-600/60">Taxes & benefits</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-2 border-violet-300/30 bg-gradient-to-br from-violet-400/20 via-purple-400/10 to-indigo-400/20 backdrop-blur-xl shadow-2xl ring-1 ring-white/20 hover:shadow-3xl hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 ease-out group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/20 to-transparent rounded-bl-full" />
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-white/10 to-transparent rounded-tr-full" />
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-violet-500/20 animate-pulse" />
            <div className="absolute top-8 right-8 w-1 h-1 rounded-full bg-violet-500/20 animate-pulse delay-200" />
            <div className="absolute bottom-6 right-6 w-1.5 h-1.5 rounded-full bg-violet-500/20 animate-pulse delay-500" />
          </div>
          <CardContent className="relative z-10 p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-violet-500/20 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Calendar className="w-6 h-6 text-violet-700" />
              </div>
              <div>
                <p className="text-sm text-violet-600/80 font-medium">Net Payroll</p>
                <p className="text-2xl font-bold text-violet-700">
                  {formatCurrency(payrollData?.summary?.totals?.totalNetPay || 0)}
                </p>
                <p className="text-xs text-violet-600/60">Final payout</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Controls */}
      <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-amber-600" />
            Salary List
          </CardTitle>
          <CardDescription>
            Individual employee salary details for the selected period
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {/* Period Selection */}
            <div className="flex gap-2">
              <div className="space-y-1">
                <Label htmlFor="month">Month</Label>
                <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month) => (
                      <SelectItem key={month.value} value={month.value.toString()}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="year">Year</Label>
                <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                  <SelectTrigger className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Search */}
            <div className="flex-1 max-w-sm">
              <Label htmlFor="search">Search Employees</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by name or title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Department Filter */}
            <div className="space-y-1">
              <Label htmlFor="department">Department</Label>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Salary Table */}
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead className="text-right">Base Salary</TableHead>
                  <TableHead className="text-right">Overtime</TableHead>
                  <TableHead className="text-right">Bonuses</TableHead>
                  <TableHead className="text-right">Gross Pay</TableHead>
                  <TableHead className="text-right">Deductions</TableHead>
                  <TableHead className="text-right">Net Pay</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntries.map((entry: any) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{entry.employee.name}</div>
                        <div className="text-sm text-muted-foreground">ID: {entry.employeeId.slice(-6)}</div>
                      </div>
                    </TableCell>
                    <TableCell>{entry.employee.jobTitle}</TableCell>
                    <TableCell className="text-right">{formatCurrency(entry.baseSalary)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(entry.overtime)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(entry.bonuses)}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(entry.totalGrossEarnings)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(entry.totalDeductions)}</TableCell>
                    <TableCell className="text-right font-bold">{formatCurrency(entry.netPay)}</TableCell>
                    <TableCell>{getStatusBadge(entry.status)}</TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedEmployee(entry)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Payroll Details - {entry.employee.name}</DialogTitle>
                            <DialogDescription>
                              Detailed breakdown for {format(new Date(payrollData?.periodInfo?.startDate), 'MMMM yyyy')}
                            </DialogDescription>
                          </DialogHeader>
                          {selectedEmployee && (
                            <div className="space-y-6">
                              {/* Employee Info */}
                              <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                  <h4 className="font-medium mb-2">Employee Information</h4>
                                  <div className="space-y-1 text-sm">
                                    <p><span className="font-medium">Name:</span> {selectedEmployee.employee.name}</p>
                                    <p><span className="font-medium">Position:</span> {selectedEmployee.employee.jobTitle}</p>
                                    <p><span className="font-medium">Employee ID:</span> {selectedEmployee.employeeId}</p>
                                    <p><span className="font-medium">Payment Method:</span> {selectedEmployee.paymentMethod}</p>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-medium mb-2">Pay Period</h4>
                                  <div className="space-y-1 text-sm">
                                    <p><span className="font-medium">Period:</span> {format(new Date(payrollData?.periodInfo?.startDate), 'MMM d')} - {format(new Date(payrollData?.periodInfo?.endDate), 'MMM d, yyyy')}</p>
                                    <p><span className="font-medium">Pay Date:</span> {format(new Date(selectedEmployee.paidDate), 'MMM d, yyyy')}</p>
                                    <p><span className="font-medium">Status:</span> {selectedEmployee.status}</p>
                                  </div>
                                </div>
                              </div>

                              {/* Earnings Breakdown */}
                              <div>
                                <h4 className="font-medium mb-3">Earnings</h4>
                                <div className="space-y-2">
                                  <div className="flex justify-between">
                                    <span>Base Salary</span>
                                    <span className="font-medium">{formatCurrency(selectedEmployee.baseSalary)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Overtime</span>
                                    <span className="font-medium">{formatCurrency(selectedEmployee.overtime)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Bonuses</span>
                                    <span className="font-medium">{formatCurrency(selectedEmployee.bonuses)}</span>
                                  </div>
                                  <div className="border-t pt-2">
                                    <div className="flex justify-between font-bold">
                                      <span>Total Gross Earnings</span>
                                      <span>{formatCurrency(selectedEmployee.totalGrossEarnings)}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Deductions Breakdown */}
                              <div>
                                <h4 className="font-medium mb-3">Deductions</h4>
                                <div className="space-y-2">
                                  <div className="flex justify-between">
                                    <span>Federal Tax</span>
                                    <span className="font-medium">{formatCurrency(selectedEmployee.federalTax)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>State Tax</span>
                                    <span className="font-medium">{formatCurrency(selectedEmployee.stateTax)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Social Security</span>
                                    <span className="font-medium">{formatCurrency(selectedEmployee.socialSecurity)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Medicare</span>
                                    <span className="font-medium">{formatCurrency(selectedEmployee.medicare)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Health Insurance</span>
                                    <span className="font-medium">{formatCurrency(selectedEmployee.healthInsurance)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Retirement Contribution</span>
                                    <span className="font-medium">{formatCurrency(selectedEmployee.retirementContribution)}</span>
                                  </div>
                                  <div className="border-t pt-2">
                                    <div className="flex justify-between font-bold">
                                      <span>Total Deductions</span>
                                      <span>{formatCurrency(selectedEmployee.totalDeductions)}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Net Pay */}
                              <div className="border-t pt-4">
                                <div className="flex justify-between text-lg font-bold">
                                  <span>Net Pay</span>
                                  <span className="text-green-600">{formatCurrency(selectedEmployee.netPay)}</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredEntries.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No employees found matching your criteria
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}