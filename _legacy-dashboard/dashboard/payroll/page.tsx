import { auth } from "@/auth"
import PayrollDashboard from '@/components/payroll/PayrollDashboard'
import { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Payroll Management | StockFlow',
  description: 'Manage employee salaries, benefits, and payroll processing',
}

export async function getServerSession() {
  return await auth()
}
export default async function PayrollPage() {
  const session = await auth()
  // const userPermissions = session?.user?.permissions || []
  if (!session?.user?.organizationId) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/30 to-orange-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <PayrollDashboard organizationId={session.user.organizationId} />
      </div>
    </div>
  )
}