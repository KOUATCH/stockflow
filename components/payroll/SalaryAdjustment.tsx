"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DatePicker } from '@/components/ui/date-picker'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
  DialogFooter,
} from '@/components/ui/dialog'
import {
  TrendingUp,
  TrendingDown,
  Plus,
  Calendar,
  DollarSign,
  Users,
  FileText,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  Clock,
  History,
  Edit,
  Gift,
  Award,
  CreditCard
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
    effectiveDate: Date
  }
}

interface SalaryAdjustment {
  id: string
  employeeId: string
  employeeName: string
  currentSalary: number
  newSalary: number
  adjustmentAmount: number
  adjustmentType: 'INCREASE' | 'DECREASE'
  reason: string
  effectiveDate: Date
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  createdBy: string
  createdAt: Date
}

interface Benefit {
  id: string
  employeeId: string
  employeeName: string
  benefitType: 'HEALTH' | 'DENTAL' | 'VISION' | 'LIFE' | 'RETIREMENT' | 'OTHER'
  benefitName: string
  monthlyAmount: number
  startDate: Date
  endDate?: Date
  isActive: boolean
}

interface SalaryAdjustmentProps {
  organizationId: string
}

export default function SalaryAdjustment({ organizationId }: SalaryAdjustmentProps) {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [adjustments, setAdjustments] = useState<SalaryAdjustment[]>([])
  const [benefits, setBenefits] = useState<Benefit[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false)
  const [isBenefitModalOpen, setIsBenefitModalOpen] = useState(false)
  const [selectedTab, setSelectedTab] = useState<'adjustments' | 'benefits'>('adjustments')

  const [adjustmentForm, setAdjustmentForm] = useState({
    employeeId: '',
    newSalary: '',
    reason: '',
    effectiveDate: undefined as Date | undefined
  })

  const [benefitForm, setBenefitForm] = useState({
    employeeId: '',
    benefitType: 'HEALTH' as const,
    benefitName: '',
    monthlyAmount: '',
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined
  })

  useEffect(() => {
    loadData()
  }, [organizationId])

  const loadData = async () => {
    setLoading(true)
    try {
      const employeeResult = await getEmployees(organizationId)
      if (employeeResult.success) {
        const employeesWithSalary = employeeResult.data.map((emp: any) => ({
          ...emp,
          salaryInfo: {
            baseSalary: Math.floor(Math.random() * 5000) + 3000,
            payFrequency: 'MONTHLY' as const,
            currency: 'USD',
            effectiveDate: new Date()
          }
        }))
        setEmployees(employeesWithSalary)

        // Mock salary adjustments data
        const mockAdjustments: SalaryAdjustment[] = employeesWithSalary.slice(0, 5).map((emp, index) => ({
          id: `adj_${emp.id}`,
          employeeId: emp.id,
          employeeName: emp.name,
          currentSalary: emp.salaryInfo?.baseSalary || 0,
          newSalary: (emp.salaryInfo?.baseSalary || 0) + (index % 2 === 0 ? 500 : -200),
          adjustmentAmount: index % 2 === 0 ? 500 : -200,
          adjustmentType: index % 2 === 0 ? 'INCREASE' : 'DECREASE',
          reason: index % 2 === 0 ? 'Performance increase' : 'Role adjustment',
          effectiveDate: new Date(Date.now() + index * 7 * 24 * 60 * 60 * 1000),
          status: ['PENDING', 'APPROVED', 'REJECTED'][index % 3] as any,
          createdBy: 'HR Manager',
          createdAt: new Date(Date.now() - index * 24 * 60 * 60 * 1000)
        }))
        setAdjustments(mockAdjustments)

        // Mock benefits data
        const mockBenefits: Benefit[] = employeesWithSalary.slice(0, 8).map((emp, index) => ({
          id: `ben_${emp.id}_${index}`,
          employeeId: emp.id,
          employeeName: emp.name,
          benefitType: ['HEALTH', 'DENTAL', 'VISION', 'LIFE', 'RETIREMENT'][index % 5] as any,
          benefitName: ['Health Insurance', 'Dental Coverage', 'Vision Care', 'Life Insurance', '401(k) Match'][index % 5],
          monthlyAmount: [250, 75, 50, 100, 200][index % 5],
          startDate: new Date(Date.now() - index * 30 * 24 * 60 * 60 * 1000),
          endDate: index % 3 === 0 ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) : undefined,
          isActive: index % 4 !== 0
        }))
        setBenefits(mockBenefits)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAdjustment = () => {
    const employee = employees.find(emp => emp.id === adjustmentForm.employeeId)
    if (!employee) return

    const currentSalary = employee.salaryInfo?.baseSalary || 0
    const newSalary = parseFloat(adjustmentForm.newSalary)
    const adjustmentAmount = newSalary - currentSalary

    const newAdjustment: SalaryAdjustment = {
      id: `adj_${Date.now()}`,
      employeeId: adjustmentForm.employeeId,
      employeeName: employee.name,
      currentSalary,
      newSalary,
      adjustmentAmount,
      adjustmentType: adjustmentAmount >= 0 ? 'INCREASE' : 'DECREASE',
      reason: adjustmentForm.reason,
      effectiveDate: adjustmentForm.effectiveDate!,
      status: 'PENDING',
      createdBy: 'Current User',
      createdAt: new Date()
    }

    setAdjustments([newAdjustment, ...adjustments])
    setIsAdjustmentModalOpen(false)
    resetAdjustmentForm()
  }

  const handleCreateBenefit = () => {
    const employee = employees.find(emp => emp.id === benefitForm.employeeId)
    if (!employee) return

    const newBenefit: Benefit = {
      id: `ben_${Date.now()}`,
      employeeId: benefitForm.employeeId,
      employeeName: employee.name,
      benefitType: benefitForm.benefitType,
      benefitName: benefitForm.benefitName,
      monthlyAmount: parseFloat(benefitForm.monthlyAmount),
      startDate: benefitForm.startDate!,
      endDate: benefitForm.endDate || undefined,
      isActive: true
    }

    setBenefits([newBenefit, ...benefits])
    setIsBenefitModalOpen(false)
    resetBenefitForm()
  }

  const resetAdjustmentForm = () => {
    setAdjustmentForm({
      employeeId: '',
      newSalary: '',
      reason: '',
      effectiveDate: undefined
    })
  }

  const resetBenefitForm = () => {
    setBenefitForm({
      employeeId: '',
      benefitType: 'HEALTH',
      benefitName: '',
      monthlyAmount: '',
      startDate: undefined,
      endDate: undefined
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200', icon: Clock },
      APPROVED: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200', icon: CheckCircle },
      REJECTED: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200', icon: X }
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

  const getBenefitIcon = (type: string) => {
    const icons = {
      HEALTH: CreditCard,
      DENTAL: Gift,
      VISION: Award,
      LIFE: CheckCircle,
      RETIREMENT: DollarSign,
      OTHER: Gift
    }
    return icons[type as keyof typeof icons] || Gift
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
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
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                Salary & Benefits Management
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Manage salary adjustments and employee benefits
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={selectedTab === 'adjustments' ? 'default' : 'outline'}
          onClick={() => setSelectedTab('adjustments')}
          className={selectedTab === 'adjustments'
            ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white'
            : 'bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg'
          }
        >
          <TrendingUp className="w-4 h-4 mr-2" />
          Salary Adjustments
        </Button>
        <Button
          variant={selectedTab === 'benefits' ? 'default' : 'outline'}
          onClick={() => setSelectedTab('benefits')}
          className={selectedTab === 'benefits'
            ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white'
            : 'bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg'
          }
        >
          <Gift className="w-4 h-4 mr-2" />
          Benefits
        </Button>
      </div>

      {selectedTab === 'adjustments' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="relative overflow-hidden border-2 border-amber-300/30 bg-gradient-to-br from-amber-400/20 via-yellow-400/10 to-orange-400/20 backdrop-blur-xl shadow-2xl ring-1 ring-white/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-amber-500/20 shadow-lg">
                    <TrendingUp className="w-6 h-6 text-amber-700" />
                  </div>
                  <div>
                    <p className="text-sm text-amber-600/80 font-medium">Pending Adjustments</p>
                    <p className="text-2xl font-bold text-amber-700">
                      {adjustments.filter(adj => adj.status === 'PENDING').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-2 border-emerald-300/30 bg-gradient-to-br from-emerald-400/20 via-teal-400/10 to-cyan-400/20 backdrop-blur-xl shadow-2xl ring-1 ring-white/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-emerald-500/20 shadow-lg">
                    <CheckCircle className="w-6 h-6 text-emerald-700" />
                  </div>
                  <div>
                    <p className="text-sm text-emerald-600/80 font-medium">Approved This Month</p>
                    <p className="text-2xl font-bold text-emerald-700">
                      {adjustments.filter(adj => adj.status === 'APPROVED').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-2 border-orange-300/30 bg-gradient-to-br from-orange-400/20 via-red-400/10 to-pink-400/20 backdrop-blur-xl shadow-2xl ring-1 ring-white/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-orange-500/20 shadow-lg">
                    <DollarSign className="w-6 h-6 text-orange-700" />
                  </div>
                  <div>
                    <p className="text-sm text-orange-600/80 font-medium">Total Increase</p>
                    <p className="text-2xl font-bold text-orange-700">
                      {formatCurrency(
                        adjustments
                          .filter(adj => adj.adjustmentType === 'INCREASE' && adj.status === 'APPROVED')
                          .reduce((sum, adj) => sum + adj.adjustmentAmount, 0)
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-2 border-teal-300/30 bg-gradient-to-br from-teal-400/20 via-cyan-400/10 to-emerald-400/20 backdrop-blur-xl shadow-2xl ring-1 ring-white/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-teal-500/20 shadow-lg">
                    <Users className="w-6 h-6 text-teal-700" />
                  </div>
                  <div>
                    <p className="text-sm text-teal-600/80 font-medium">Employees Affected</p>
                    <p className="text-2xl font-bold text-teal-700">
                      {new Set(adjustments.map(adj => adj.employeeId)).size}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <div className="flex justify-end">
            <Dialog open={isAdjustmentModalOpen} onOpenChange={setIsAdjustmentModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg">
                  <Plus className="w-4 h-4 mr-2" />
                  New Salary Adjustment
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Salary Adjustment</DialogTitle>
                  <DialogDescription>
                    Propose a salary adjustment for an employee
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="employee">Employee *</Label>
                    <Select value={adjustmentForm.employeeId} onValueChange={(value) => setAdjustmentForm({ ...adjustmentForm, employeeId: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select employee" />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.map((emp) => (
                          <SelectItem key={emp.id} value={emp.id}>
                            {emp.name} - {formatCurrency(emp.salaryInfo?.baseSalary || 0)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newSalary">New Monthly Salary *</Label>
                    <Input
                      id="newSalary"
                      type="number"
                      value={adjustmentForm.newSalary}
                      onChange={(e) => setAdjustmentForm({ ...adjustmentForm, newSalary: e.target.value })}
                      placeholder="5500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="effectiveDate">Effective Date *</Label>
                    <DatePicker
                      date={adjustmentForm.effectiveDate}
                      onDateChange={(date) => setAdjustmentForm({ ...adjustmentForm, effectiveDate: date })}
                      placeholder="Select effective date"
                      minDate={new Date()}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reason">Reason *</Label>
                    <Textarea
                      id="reason"
                      value={adjustmentForm.reason}
                      onChange={(e) => setAdjustmentForm({ ...adjustmentForm, reason: e.target.value })}
                      placeholder="Performance increase, role change, market adjustment..."
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAdjustmentModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateAdjustment} className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white">
                    <Save className="w-4 h-4 mr-2" />
                    Create Adjustment
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Adjustments Table */}
          <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5 text-amber-600" />
                Salary Adjustments
              </CardTitle>
              <CardDescription>
                Review and manage salary adjustment requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Current Salary</TableHead>
                      <TableHead>New Salary</TableHead>
                      <TableHead>Adjustment</TableHead>
                      <TableHead>Effective Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Reason</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {adjustments.map((adjustment) => (
                      <TableRow key={adjustment.id}>
                        <TableCell className="font-medium">{adjustment.employeeName}</TableCell>
                        <TableCell>{formatCurrency(adjustment.currentSalary)}</TableCell>
                        <TableCell>{formatCurrency(adjustment.newSalary)}</TableCell>
                        <TableCell>
                          <div className={`flex items-center gap-1 ${adjustment.adjustmentType === 'INCREASE' ? 'text-green-600' : 'text-red-600'}`}>
                            {adjustment.adjustmentType === 'INCREASE' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                            {formatCurrency(Math.abs(adjustment.adjustmentAmount))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            {adjustment.effectiveDate.toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(adjustment.status)}</TableCell>
                        <TableCell className="max-w-xs truncate">{adjustment.reason}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {selectedTab === 'benefits' && (
        <div className="space-y-6">
          {/* Benefits Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="relative overflow-hidden border-2 border-blue-300/30 bg-gradient-to-br from-blue-400/20 via-cyan-400/10 to-teal-400/20 backdrop-blur-xl shadow-2xl ring-1 ring-white/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-blue-500/20 shadow-lg">
                    <Gift className="w-6 h-6 text-blue-700" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-600/80 font-medium">Active Benefits</p>
                    <p className="text-2xl font-bold text-blue-700">
                      {benefits.filter(ben => ben.isActive).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-2 border-emerald-300/30 bg-gradient-to-br from-emerald-400/20 via-teal-400/10 to-cyan-400/20 backdrop-blur-xl shadow-2xl ring-1 ring-white/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-emerald-500/20 shadow-lg">
                    <DollarSign className="w-6 h-6 text-emerald-700" />
                  </div>
                  <div>
                    <p className="text-sm text-emerald-600/80 font-medium">Monthly Cost</p>
                    <p className="text-2xl font-bold text-emerald-700">
                      {formatCurrency(
                        benefits
                          .filter(ben => ben.isActive)
                          .reduce((sum, ben) => sum + ben.monthlyAmount, 0)
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-2 border-orange-300/30 bg-gradient-to-br from-orange-400/20 via-red-400/10 to-pink-400/20 backdrop-blur-xl shadow-2xl ring-1 ring-white/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-orange-500/20 shadow-lg">
                    <Users className="w-6 h-6 text-orange-700" />
                  </div>
                  <div>
                    <p className="text-sm text-orange-600/80 font-medium">Enrolled Employees</p>
                    <p className="text-2xl font-bold text-orange-700">
                      {new Set(benefits.filter(ben => ben.isActive).map(ben => ben.employeeId)).size}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-2 border-teal-300/30 bg-gradient-to-br from-teal-400/20 via-cyan-400/10 to-emerald-400/20 backdrop-blur-xl shadow-2xl ring-1 ring-white/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-teal-500/20 shadow-lg">
                    <Award className="w-6 h-6 text-teal-700" />
                  </div>
                  <div>
                    <p className="text-sm text-teal-600/80 font-medium">Benefit Types</p>
                    <p className="text-2xl font-bold text-teal-700">
                      {new Set(benefits.map(ben => ben.benefitType)).size}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <div className="flex justify-end">
            <Dialog open={isBenefitModalOpen} onOpenChange={setIsBenefitModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Benefit
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Employee Benefit</DialogTitle>
                  <DialogDescription>
                    Assign a new benefit to an employee
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="benefitEmployee">Employee *</Label>
                    <Select value={benefitForm.employeeId} onValueChange={(value) => setBenefitForm({ ...benefitForm, employeeId: value })}>
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
                    <Label htmlFor="benefitType">Benefit Type *</Label>
                    <Select value={benefitForm.benefitType} onValueChange={(value: any) => setBenefitForm({ ...benefitForm, benefitType: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="HEALTH">Health Insurance</SelectItem>
                        <SelectItem value="DENTAL">Dental Coverage</SelectItem>
                        <SelectItem value="VISION">Vision Care</SelectItem>
                        <SelectItem value="LIFE">Life Insurance</SelectItem>
                        <SelectItem value="RETIREMENT">Retirement Plan</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="benefitName">Benefit Name *</Label>
                    <Input
                      id="benefitName"
                      value={benefitForm.benefitName}
                      onChange={(e) => setBenefitForm({ ...benefitForm, benefitName: e.target.value })}
                      placeholder="Health Insurance Premium"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="monthlyAmount">Monthly Amount *</Label>
                    <Input
                      id="monthlyAmount"
                      type="number"
                      value={benefitForm.monthlyAmount}
                      onChange={(e) => setBenefitForm({ ...benefitForm, monthlyAmount: e.target.value })}
                      placeholder="250"
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date *</Label>
                      <DatePicker
                        date={benefitForm.startDate}
                        onDateChange={(date) => setBenefitForm({ ...benefitForm, startDate: date })}
                        placeholder="Select start date"
                        maxDate={benefitForm.endDate}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endDate">End Date (Optional)</Label>
                      <DatePicker
                        date={benefitForm.endDate}
                        onDateChange={(date) => setBenefitForm({ ...benefitForm, endDate: date })}
                        placeholder="Select end date"
                        minDate={benefitForm.startDate}
                      />
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsBenefitModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateBenefit} className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white">
                    <Save className="w-4 h-4 mr-2" />
                    Add Benefit
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Benefits Table */}
          <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-amber-600" />
                Employee Benefits
              </CardTitle>
              <CardDescription>
                Manage employee benefits and enrollment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Benefit</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Monthly Cost</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {benefits.map((benefit) => {
                      const Icon = getBenefitIcon(benefit.benefitType)
                      return (
                        <TableRow key={benefit.id}>
                          <TableCell className="font-medium">{benefit.employeeName}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4 text-slate-500" />
                              {benefit.benefitName}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{benefit.benefitType}</Badge>
                          </TableCell>
                          <TableCell>{formatCurrency(benefit.monthlyAmount)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              {benefit.startDate.toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={benefit.isActive ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'}>
                              {benefit.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}