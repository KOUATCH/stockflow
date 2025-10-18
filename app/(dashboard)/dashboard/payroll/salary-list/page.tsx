import { auth } from "@/auth"
import MonthlySalaryList from '@/components/payroll/MonthlySalaryList'
import { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Monthly Salary List | StockFlow',
  description: 'View and manage monthly employee salary reports',
}

export async function getServerSession() {
  return await auth()
}
export default async function SalaryListPage() {
  const session = await auth()
  if (!session?.user?.organizationId) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/30 to-orange-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <MonthlySalaryList organizationId={session.user.organizationId} />
      </div>
    </div>
  )
}