import React from 'react'
import { Metadata } from 'next'
import EmployeeSalaryDetail from '@/components/payroll/EmployeeSalaryDetail'
import { redirect } from 'next/navigation'
import { auth } from "@/auth"

export const metadata: Metadata = {
  title: 'Employee Salary Details | StockFlow',
  description: 'View detailed salary information for employees',
}

export default async function SalaryDetailsPage() {
  const session = await auth()

  if (!session?.user?.organizationId) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <EmployeeSalaryDetail organizationId={session.user.organizationId} />
      </div>
    </div>
  )
}