import React from 'react'
import { Metadata } from 'next'
import { ModernEmployeeForm } from '@/components/payroll/ModernEmployeeForm'
import { redirect } from 'next/navigation'
import { auth } from "@/auth"
import { getEmployees } from '@/actions/payroll/payrollManagement'

export const metadata: Metadata = {
  title: 'Edit Employee | StockFlow',
  description: 'Edit employee information',
}

interface EditEmployeePageProps {
  params: {
    id: string
  }
}

export default async function EditEmployeePage({ params }: EditEmployeePageProps) {
  const session = await auth()

  if (!session?.user?.organizationId) {
    redirect('/login')
  }

  // Get employee data
  const result = await getEmployees(session.user.organizationId)
  if (!result.success) {
    redirect('/dashboard/payroll/employees')
  }

  const employee = result.data.find((emp: any) => emp.id === params.id)
  if (!employee) {
    redirect('/dashboard/payroll/employees')
  }

  // Prepare employee data using basic fields for now
  const employeeWithSalary = {
    ...employee,
    firstName: employee.firstName || employee.name?.split(' ')[0] || 'Unknown',
    lastName: employee.lastName || employee.name?.split(' ').slice(1).join(' ') || 'User',
    department: 'General', // Default until payroll fields are working
    salaryInfo: {
      baseSalary: 0, // Default until payroll fields are working
      payFrequency: 'MONTHLY' as const,
      currency: 'USD',
      effectiveDate: new Date()
    },
    bankInfo: {
      bankName: '',
      accountNumber: '',
      routingNumber: '',
      accountType: 'CHECKING' as const
    },
    taxInfo: {
      taxId: '', // Default until payroll fields are working
      exemptions: 0,
      additionalWithholding: 0
    }
  }

  return (
    <ModernEmployeeForm
      organizationId={session.user.organizationId}
      isEditMode={true}
      employeeId={employee.id}
      initialData={{
        firstName: employeeWithSalary.firstName || '',
        lastName: employeeWithSalary.lastName || '',
        email: employeeWithSalary.email || '',
        phone: employeeWithSalary.phone || '',
        jobTitle: employeeWithSalary.jobTitle || '',
        department: employeeWithSalary.department || '',
        hireDate: employeeWithSalary.hireDate ? new Date(employeeWithSalary.hireDate) : new Date(),
        baseSalary: employeeWithSalary.salaryInfo?.baseSalary || 0,
        payFrequency: employeeWithSalary.salaryInfo?.payFrequency || 'MONTHLY',
        currency: employeeWithSalary.salaryInfo?.currency || 'USD',
        taxId: employeeWithSalary.taxInfo?.taxId || '',
        exemptions: employeeWithSalary.taxInfo?.exemptions || 0,
        additionalWithholding: employeeWithSalary.taxInfo?.additionalWithholding || 0,
        bankName: employeeWithSalary.bankInfo?.bankName || '',
        accountNumber: employeeWithSalary.bankInfo?.accountNumber || '',
        routingNumber: employeeWithSalary.bankInfo?.routingNumber || '',
        accountType: employeeWithSalary.bankInfo?.accountType || 'CHECKING',
        isActive: employeeWithSalary.isActive ?? true,
        organizationId: session.user.organizationId,
      }}
    />
  )
}