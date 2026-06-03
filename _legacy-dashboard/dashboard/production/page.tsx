import React from 'react'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { ProductionDashboard } from '@/components/production/ProductionDashboard'

export default async function ProductionPage() {
  const session = await auth()

  if (!session || !session.user?.id) {
    redirect('/auth/signin')
  }

  return (
    <div className="container mx-auto p-6">
      <ProductionDashboard
        organizationId={session.user.organizationId || 'default-org'}
        currentUserId={session.user.id}
      />
    </div>
  )
}