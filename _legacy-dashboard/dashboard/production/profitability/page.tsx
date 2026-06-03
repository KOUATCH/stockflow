import React from 'react'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth/next'
import ProfitabilityAnalytics from '@/components/production/ProfitabilityAnalytics'

export default async function ProfitabilityAnalyticsPage() {
  const session = await auth()

  if (!session || !session.user?.id) {
    redirect('/auth/signin')
  }

  return (
    <div className="container mx-auto p-6">
      <ProfitabilityAnalytics organizationId={session.user.organizationId} />
    </div>
  )
}