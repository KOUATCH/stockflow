"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  Users,
  DollarSign,
  TrendingUp,
  Calendar,
  FileText,
  AlertTriangle,
  Plus,
  Download,
  Clock,
  CreditCard,
  BarChart3
} from 'lucide-react'
import { getPayrollSummary, getPayrollPeriods } from '@/actions/payroll/payrollManagement'
import { getPayrollAnalytics } from '@/actions/payroll/payrollAnalytics'
import { format, startOfMonth, endOfMonth } from 'date-fns'

interface PayrollDashboardProps {
  organizationId: string
}

export default function PayrollDashboard({ organizationId }: PayrollDashboardProps) {
  const [loading, setLoading] = useState(true)
  const [payrollSummary, setPayrollSummary] = useState<any>(null)
  const [payrollPeriods, setPayrollPeriods] = useState<any[]>([])
  const [analytics, setAnalytics] = useState<any>(null)
  const [selectedPeriod, setSelectedPeriod] = useState('current')

  useEffect(() => {
    loadPayrollData()
  }, [organizationId])

  const loadPayrollData = async () => {
    setLoading(true)
    try {
      const currentDate = new Date()
      const startDate = startOfMonth(currentDate)
      const endDate = endOfMonth(currentDate)

      const [summaryResult, periodsResult, analyticsResult] = await Promise.all([
        getPayrollSummary(organizationId, startDate, endDate),
        getPayrollPeriods(organizationId, currentDate.getFullYear()),
        getPayrollAnalytics(organizationId, startDate, endDate)
      ])

      if (summaryResult.success) setPayrollSummary(summaryResult.data)
      if (periodsResult.success) setPayrollPeriods(periodsResult.data)
      if (analyticsResult.success) setAnalytics(analyticsResult.data)
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'bg-green-100 text-green-800'
      case 'PROCESSING': return 'bg-yellow-100 text-yellow-800'
      case 'DRAFT': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

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
              <Users className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                Payroll Management
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Manage employee salaries, benefits, and payroll processing
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
            <Button
              size="sm"
              className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              Process Payroll
            </Button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
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
                  {payrollSummary?.totals?.totalEmployees || 0}
                </p>
                <p className="text-xs text-amber-600/60">+2 from last month</p>
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
                <p className="text-sm text-emerald-600/80 font-medium">Monthly Payroll</p>
                <p className="text-2xl font-bold text-emerald-700">
                  {formatCurrency(payrollSummary?.totals?.totalGrossPay || 0)}
                </p>
                <p className="text-xs text-emerald-600/60">+3.2% from last month</p>
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
                <p className="text-sm text-orange-600/80 font-medium">Average Salary</p>
                <p className="text-2xl font-bold text-orange-700">
                  {formatCurrency(payrollSummary?.totals?.averageSalary || 0)}
                </p>
                <p className="text-xs text-orange-600/60">+1.8% from last month</p>
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
                  {formatCurrency(payrollSummary?.totals?.totalNetPay || 0)}
                </p>
                <p className="text-xs text-violet-600/60">After deductions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-xl p-1 shadow-xl">
          <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-600 data-[state=active]:text-white">
            Overview
          </TabsTrigger>
          <TabsTrigger value="periods" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-600 data-[state=active]:text-white">
            Payroll Periods
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-600 data-[state=active]:text-white">
            Analytics
          </TabsTrigger>
          <TabsTrigger value="employees" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-600 data-[state=active]:text-white">
            Employees
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Department Breakdown */}
            <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-amber-600" />
                  Payroll by Department
                </CardTitle>
                <CardDescription>
                  Monthly payroll distribution across departments
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {payrollSummary?.breakdown?.byDepartment?.map((dept: any, index: number) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{dept.department}</span>
                      <span className="font-medium">{formatCurrency(dept.totalGrossPay)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{dept.employeeCount} employees</span>
                      <span>Avg: {formatCurrency(dept.averageSalary)}</span>
                    </div>
                    <Progress
                      value={(dept.totalGrossPay / (payrollSummary?.totals?.totalGrossPay || 1)) * 100}
                      className="h-2"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recent Alerts */}
            <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                  Payroll Alerts
                </CardTitle>
                <CardDescription>
                  Important notifications and reminders
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {analytics?.alerts?.map((alert: any, index: number) => (
                  <div key={index} className="flex items-start space-x-3">
                    <AlertTriangle className={`h-4 w-4 mt-0.5 ${
                      alert.severity === 'high' ? 'text-red-500' :
                      alert.severity === 'medium' ? 'text-yellow-500' : 'text-blue-500'
                    }`} />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{alert.title}</p>
                      <p className="text-xs text-muted-foreground">{alert.description}</p>
                      {alert.impact && (
                        <p className="text-xs text-red-600">
                          Impact: {formatCurrency(alert.impact)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                {(!analytics?.alerts || analytics.alerts.length === 0) && (
                  <p className="text-sm text-muted-foreground">No alerts at this time</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Payment Methods */}
          <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-violet-600" />
                Payment Method Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Direct Deposit</span>
                    <span className="text-sm font-medium">
                      {formatCurrency(payrollSummary?.paymentMethods?.directDeposit || 0)}
                    </span>
                  </div>
                  <Progress value={90} className="h-2" />
                  <p className="text-xs text-muted-foreground">90% of employees</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Check</span>
                    <span className="text-sm font-medium">
                      {formatCurrency(payrollSummary?.paymentMethods?.check || 0)}
                    </span>
                  </div>
                  <Progress value={8} className="h-2" />
                  <p className="text-xs text-muted-foreground">8% of employees</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Cash</span>
                    <span className="text-sm font-medium">
                      {formatCurrency(payrollSummary?.paymentMethods?.cash || 0)}
                    </span>
                  </div>
                  <Progress value={2} className="h-2" />
                  <p className="text-xs text-muted-foreground">2% of employees</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="periods" className="space-y-6">
          <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-600" />
                Payroll Periods
              </CardTitle>
              <CardDescription>
                View and manage payroll processing periods
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {payrollPeriods.map((period, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">
                          {format(new Date(period.periodStart), 'MMMM yyyy')}
                        </h4>
                        <Badge className={getStatusColor(period.status)}>
                          {period.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(period.periodStart), 'MMM d')} - {format(new Date(period.periodEnd), 'MMM d, yyyy')}
                      </p>
                      <p className="text-sm">
                        {period.totalEmployees} employees • {formatCurrency(period.totalGrossPay)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-right">
                        <p className="text-sm font-medium">Pay Date</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(period.payDate), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6">
            <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-amber-600" />
                  Payroll Analytics
                </CardTitle>
                <CardDescription>
                  Detailed insights into payroll costs and trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Payroll Growth Rate</p>
                    <p className="text-2xl font-bold text-green-600">
                      +{analytics?.overview?.payrollGrowthRate || 0}%
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Cost Per Employee</p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(analytics?.overview?.costPerEmployee || 0)}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Overtime Percentage</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {analytics?.efficiency?.averageOvertimePercentage || 0}%
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Benefits Cost</p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(analytics?.breakdown?.byCostType?.find((item: any) => item.type === 'Benefits')?.amount || 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="employees" className="space-y-6">
          <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-600" />
                Employee Management
              </CardTitle>
              <CardDescription>
                Manage employee information and payroll settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h4 className="font-medium">Active Employees</h4>
                  <p className="text-sm text-muted-foreground">
                    {payrollSummary?.totals?.totalEmployees || 0} employees currently active
                  </p>
                </div>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Employee
                </Button>
              </div>
              <div className="border rounded-lg">
                <div className="p-4 text-center text-muted-foreground">
                  <Users className="h-8 w-8 mx-auto mb-2" />
                  <p>Employee list will be displayed here</p>
                  <p className="text-sm">Click "Add Employee" to get started</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}