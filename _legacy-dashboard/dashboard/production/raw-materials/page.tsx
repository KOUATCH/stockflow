import React from 'react'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { RawMaterialsManagement } from '@/components/production/RawMaterialsManagement'
import { getOrgItemsWithInventoryLevels } from '@/actions/itemsShow/getOrgItemsWithInventoryLevels'
import getOrgCategories from '@/actions/categories/getOrgCategories'
import { getItemSuppliers } from '@/actions/suppliers/itemSupplierActions'

export default async function RawMaterialsPage() {
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

  // Fetch raw materials (items), categories, and suppliers
  const [itemsResult, categoriesResult, suppliersResult] = await Promise.all([
    getOrgItemsWithInventoryLevels(organizationId),
    getOrgCategories(organizationId),
    getItemSuppliers(organizationId)
  ])

  const items = itemsResult.success ? itemsResult.data : []
  const categories = categoriesResult.success ? categoriesResult.data : []
  const suppliers = suppliersResult.success ? suppliersResult.data : []

  // Filter items that are suitable for raw materials (ingredients)
  const rawMaterials = items.filter(item =>
    item.category?.title?.toLowerCase().includes('ingredient') ||
    item.category?.title?.toLowerCase().includes('raw') ||
    item.category?.title?.toLowerCase().includes('material') ||
    item.name.toLowerCase().includes('flour') ||
    item.name.toLowerCase().includes('sugar') ||
    item.name.toLowerCase().includes('butter') ||
    item.name.toLowerCase().includes('egg') ||
    item.name.toLowerCase().includes('milk') ||
    item.name.toLowerCase().includes('yeast')
  )

  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Raw Materials</h1>
          <p className="text-gray-600">Manage your bakery raw materials inventory</p>
        </div>

        <RawMaterialsManagement
          rawMaterials={rawMaterials}
          allItems={items}
          categories={categories}
          suppliers={suppliers}
          organizationId={organizationId}
          currentUserId={currentUserId}
        />
      </div>
    </div>
  )
}
