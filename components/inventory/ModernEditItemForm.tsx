"use client"

import { ModernCreateItemForm } from './ModernCreateItemForm'
import { ItemCreationFormData } from './ModernCreateItemForm'
import { useRouter } from 'next/navigation'
import { useNotifications } from '@/components/notifications/NotificationProvider'

interface ItemData {
  id: string
  name: string
  description?: string | null
  sku: string
  barcode?: string | null
  costPrice: number
  sellingPrice: number
  categoryId?: string | null
  brandId?: string | null
  unitId?: string | null
  taxRateId?: string | null
  minStockLevel: number
  maxStockLevel?: number | null
  weight?: number | null
  dimensions?: string | null
  isActive: boolean
  isSerialTracked: boolean
  thumbnail?: string | null
  imageUrls?: string | null
  organizationId: string
}

interface ModernEditItemFormProps {
  itemData: ItemData
  action?: (formData: FormData) => Promise<void>
  onSubmit?: (data: ItemCreationFormData) => Promise<void>
  isLoading?: boolean
  onCancel?: () => void
  categories?: Array<{ id: string; name: string }>
  brands?: Array<{ id: string; name: string }>
  units?: Array<{ id: string; name: string }>
  taxRate?: Array<{ id: string; name: string; rate: number }>
  organizationId: string
}

export function ModernEditItemForm({
  itemData,
  action,
  onSubmit,
  isLoading = false,
  onCancel,
  categories = [],
  brands = [],
  units = [],
  taxRate = [],
  organizationId
}: ModernEditItemFormProps) {
  const router = useRouter()
  const { success } = useNotifications()

  // Handle successful edit
  const handleEditSuccess = async (data: ItemCreationFormData) => {
    if (onSubmit) {
      await onSubmit(data)
    }
    success("Item Updated", `${data.name} has been successfully updated`)
    router.push('/dashboard/inventory/items')
  }

  // Convert item data to form data format
  const initialData: Partial<ItemCreationFormData> = {
    name: itemData.name || "",
    description: itemData.description || "",
    sku: itemData.sku || "",
    barcode: itemData.barcode || "",
    costPrice: itemData.costPrice || 0,
    sellingPrice: itemData.sellingPrice || 0,
    categoryId: itemData.categoryId || "",
    brandId: itemData.brandId || "",
    unitId: itemData.unitId || "",
    taxRateId: itemData.taxRateId || "",
    minStockLevel: itemData.minStockLevel || 0,
    maxStockLevel: itemData.maxStockLevel || 0,
    weight: itemData.weight || 0,
    dimensions: itemData.dimensions || "",
    isActive: itemData.isActive ?? true,
    isSerialTracked: itemData.isSerialTracked ?? false,
    thumbnail: itemData.thumbnail || "",
    imageUrls: itemData.imageUrls || "",
    organizationId: itemData.organizationId || organizationId,
  }

  return (
    <ModernCreateItemForm
      action={action}
      onSubmit={handleEditSuccess}
      isLoading={isLoading}
      onCancel={onCancel}
      categories={categories}
      brands={brands}
      units={units}
      taxRate={taxRate}
      organizationId={organizationId}
      initialData={initialData}
      isEditMode={true}
      itemId={itemData.id}
    />
  )
}