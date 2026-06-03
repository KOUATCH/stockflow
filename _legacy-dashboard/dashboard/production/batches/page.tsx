import React from 'react'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { ProductionBatchManagement } from '@/components/production/ProductionBatchManagement'
import { getProductionBatches, getRecipes } from '@/actions/production/productionSystemActions'

export default async function ProductionBatchesPage() {
  const session = await auth()

  if (!session || !session.user?.id) {
    redirect('/auth/signin')
  }

  if (!session.user.organizationId) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Organization Required</h3>
          <p className="text-gray-600">No organization found for the current user.</p>
        </div>
      </div>
    )
  }

  const organizationId = session.user.organizationId
  const currentUserId = session.user.id

  // Fetch batches and recipes data
  const [batchesResult, recipesResult] = await Promise.all([
    getProductionBatches(organizationId),
    getRecipes(organizationId)
  ])

  const batches = batchesResult.success ? batchesResult.data : []
  const recipes = recipesResult.success ? recipesResult.data : []

  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Production Batches</h1>
          <p className="text-gray-600">Manage and monitor your production batches</p>
        </div>

        <ProductionBatchManagement
          batches={batches}
          recipes={recipes}
          organizationId={organizationId}
          currentUserId={currentUserId}
        />
      </div>
    </div>
  )
}