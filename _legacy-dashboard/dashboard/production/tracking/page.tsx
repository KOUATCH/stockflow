import React from 'react'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth/next'
import ProductionTracking from '@/components/production/ProductionTracking'

export default async function ProductionTrackingPage() {
  const session = await auth()

  if (!session || !session.user?.id) {
    redirect('/auth/signin')
  }

  return (
    <div className="container mx-auto p-6">
      <ProductionTracking organizationId={session.user.organizationId} />
    </div>
  )
}