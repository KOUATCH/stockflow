"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import DataTable from '@/components/DataTableComponents/DataTable'
import { createEmployeeColumns } from './EmployeeTableColumns'
import Link from 'next/link'
import {
  Users,
  UserPlus,
  Edit,
  DollarSign,
  Calendar,
  Building,
  Phone,
  Mail,
  CreditCard,
  Save,
  X,
  Search,
  Filter,
  Download,
  Upload,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp
} from 'lucide-react'
import { getEmployees, createEmployee } from '@/actions/payroll/payrollManagement'

interface Employee {
  id: string
  firstName: string
  lastName: string
  name: string
  email: string
  phone?: string
  jobTitle: string
  department: string
  hireDate: Date
  isActive: boolean
  salaryInfo?: {
    baseSalary: number
    payFrequency: 'MONTHLY' | 'WEEKLY' | 'BIWEEKLY'
    currency: string
    effectiveDate: Date
  }
  bankInfo?: {
    bankName: string
    accountNumber: string
    routingNumber: string
    accountType: 'CHECKING' | 'SAVINGS'
  }
  taxInfo?: {
    taxId: string
    exemptions: number
    additionalWithholding: number
  }
  createdAt: Date
}

interface EmployeeManagementProps {
  organizationId: string
}

// Mock departments - replace with actual data
const departments = [
  'Sales',
  'Marketing',
  'Operations',
  'IT',
  'HR',
  'Finance',
  'Customer Service',
  'Management'
]

// Mock job titles - replace with actual data
const jobTitles = [
  'Sales Associate',
  'Senior Sales Associate',
  'Marketing Specialist',
  'Operations Manager',
  'IT Specialist',
  'HR Coordinator',
  'Financial Analyst',
  'Customer Service Rep',
  'Store Manager',
  'Assistant Manager'
]

export default function EmployeeManagement({ organizationId }: EmployeeManagementProps) {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('all')

  useEffect(() => {
    loadEmployees()
  }, [organizationId])

  const loadEmployees = async () => {
    setLoading(true)
    try {
      const result = await getEmployees(organizationId)
      if (result.success) {
        // Mock salary data for demonstration
        const employeesWithSalary = result.data.map((emp: any) => ({
          ...emp,
          firstName: emp.firstName || emp.name?.split(' ')[0] || 'Unknown',
          lastName: emp.lastName || emp.name?.split(' ').slice(1).join(' ') || 'User',
          department: emp.department || emp.jobTitle || 'General',
          salaryInfo: {
            baseSalary: Math.floor(Math.random() * 5000) + 3000,
            payFrequency: 'MONTHLY' as const,
            currency: 'USD',
            effectiveDate: new Date()
          },
          bankInfo: {
            bankName: 'Chase Bank',
            accountNumber: '****1234',
            routingNumber: '021000021',
            accountType: 'CHECKING' as const
          },
          taxInfo: {
            taxId: Math.floor(Math.random() * 900 + 100).toString() + '-' +
                   Math.floor(Math.random() * 90 + 10).toString() + '-' +
                   Math.floor(Math.random() * 9000 + 1000).toString(),
            exemptions: Math.floor(Math.random() * 3),
            additionalWithholding: 0
          }
        }))
        setEmployees(employeesWithSalary)
      }
    } catch (error) {
      console.error('Error loading employees:', error)
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

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge className="bg-green-100 text-green-800 border-green-200">
        <CheckCircle className="w-3 h-3 mr-1" />
        Active
      </Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800 border-red-200">
        <X className="w-3 h-3 mr-1" />
        Inactive
      </Badge>
    )
  }

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDepartment = departmentFilter === 'all' || emp.department === departmentFilter
    return matchesSearch && matchesDepartment
  })

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
            <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                Employee Management
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Manage employee information, salaries, and benefits
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg"
            >
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Link href="/dashboard/payroll/employees/create">
              <Button
                size="sm"
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Add Employee
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="relative overflow-hidden border-2 border-emerald-300/30 bg-gradient-to-br from-emerald-400/20 via-teal-400/10 to-cyan-400/20 backdrop-blur-xl shadow-2xl ring-1 ring-white/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-emerald-500/20 shadow-lg">
                <Users className="w-6 h-6 text-emerald-700" />
              </div>
              <div>
                <p className="text-sm text-emerald-600/80 font-medium">Total Employees</p>
                <p className="text-2xl font-bold text-emerald-700">{employees.length}</p>
                <p className="text-xs text-emerald-600/60">{employees.filter(e => e.isActive).length} active</p>
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
                <p className="text-sm text-emerald-600/80 font-medium">Total Monthly Salary</p>
                <p className="text-2xl font-bold text-emerald-700">
                  {formatCurrency(employees.reduce((sum, emp) => sum + (emp.salaryInfo?.baseSalary || 0), 0))}
                </p>
                <p className="text-xs text-emerald-600/60">Gross amount</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-2 border-orange-300/30 bg-gradient-to-br from-orange-400/20 via-red-400/10 to-pink-400/20 backdrop-blur-xl shadow-2xl ring-1 ring-white/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-orange-500/20 shadow-lg">
                <TrendingUp className="w-6 h-6 text-orange-700" />
              </div>
              <div>
                <p className="text-sm text-orange-600/80 font-medium">Average Salary</p>
                <p className="text-2xl font-bold text-orange-700">
                  {formatCurrency(employees.length > 0 ? employees.reduce((sum, emp) => sum + (emp.salaryInfo?.baseSalary || 0), 0) / employees.length : 0)}
                </p>
                <p className="text-xs text-orange-600/60">Per employee</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-2 border-teal-300/30 bg-gradient-to-br from-teal-400/20 via-cyan-400/10 to-emerald-400/20 backdrop-blur-xl shadow-2xl ring-1 ring-white/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-teal-500/20 shadow-lg">
                <Building className="w-6 h-6 text-teal-700" />
              </div>
              <div>
                <p className="text-sm text-teal-600/80 font-medium">Departments</p>
                <p className="text-2xl font-bold text-teal-700">
                  {new Set(employees.map(emp => emp.department)).size}
                </p>
                <p className="text-xs text-teal-600/60">Active departments</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="mb-6">
        <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search employees by name, email, or job title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-50 dark:bg-slate-700/50 border-0"
                />
              </div>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-full sm:w-64 bg-slate-50 dark:bg-slate-700/50 border-0">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Employee Table */}
      <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            Employee List
          </CardTitle>
          <CardDescription>
            Manage employee information, salaries, and employment details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={createEmployeeColumns({
              formatCurrency
            })}
            data={filteredEmployees}
            searchPlaceholder="Search employees by name, email, or job title..."
          />

          {filteredEmployees.length === 0 && (
            <div className="text-center py-8 text-slate-600 dark:text-slate-400">
              {searchTerm || departmentFilter !== 'all'
                ? 'No employees found matching your criteria'
                : 'No employees found. Click "Add Employee" to get started.'}
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  )
}