import React from 'react'
import { Metadata } from 'next'
import { ModernEmployeeForm } from '@/components/payroll/ModernEmployeeForm'
import { redirect } from 'next/navigation'
import { auth } from "@/auth"

export const metadata: Metadata = {
  title: 'Create Employee | StockFlow',
  description: 'Add a new employee to your organization',
}

export default async function CreateEmployeePage() {
  const session = await auth()

  if (!session?.user?.organizationId) {
    redirect('/login')
  }

  return (
    <ModernEmployeeForm
      organizationId={session.user.organizationId}
    />
  )
}