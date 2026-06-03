import React from 'react'
import { Metadata } from 'next'
import EmployeeManagement from '@/components/payroll/EmployeeManagement'
import { redirect } from 'next/navigation'
import { auth } from "@/auth"

export const metadata: Metadata = {
  title: 'Employee Management | StockFlow',
  description: 'Manage employee information, salaries, and benefits',
}

export default async function EmployeesPage() {
  const session = await auth()

  if (!session?.user?.organizationId) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/30 to-orange-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <EmployeeManagement organizationId={session.user.organizationId} />
      </div>
    </div>
  )
}