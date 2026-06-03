import { notFound } from "next/navigation"

import { getBrandById } from "@/actions/brands/getBrandsAction"
import { ModernBrandForm } from "@/components/brands/ModernBrandForm"
import { getAuthenticatedUser } from "@/config/useAuth"

interface BrandEditPageProps {
  params: Promise<{ id: string }> | { id: string }
}

export default async function BrandEditPage({ params }: BrandEditPageProps) {
  const { id } = await Promise.resolve(params)
  const user = await getAuthenticatedUser()

  if (!user?.organizationId) {
    notFound()
  }

  const brandResult = await getBrandById(id, user.organizationId)

  if (!brandResult.success || !brandResult.data) {
    notFound()
  }

  return (
    <ModernBrandForm
      mode="edit"
      organizationId={user.organizationId}
      initialData={brandResult.data}
    />
  )
}
