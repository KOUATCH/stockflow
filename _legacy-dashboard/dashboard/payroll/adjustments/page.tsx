import React from 'react'
import { Metadata } from 'next'
import SalaryAdjustment from '@/components/payroll/SalaryAdjustment'
import { redirect } from 'next/navigation'
import { auth } from "@/auth"

export const metadata: Metadata = {
  title: 'Salary & Benefits Management | StockFlow',
  description: 'Manage employee salary adjustments and benefits',
}

export default async function SalaryAdjustmentPage() {
  const session = await auth()

  if (!session?.user?.organizationId) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/30 to-orange-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <SalaryAdjustment organizationId={session.user.organizationId} />
      </div>
    </div>
  )
}