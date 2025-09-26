import getItemWithSuppliersById from "@/actions/item-suppliers/getItemWithSuppliers"
import getBriefItemById from "@/actions/itemsShow/getBriefItemById"
import { getSuppliersByOrgId } from "@/actions/suppliers/getSuppliersByOrgId"
import { Button } from "@/components/ui/button"
import { TableLoading } from "@/components/ui/data-table"
import { getAuthenticatedUser } from "@/config/useAuth"
import { SupplierFilters } from '@/types/supplier'
import { ArrowLeft } from 'lucide-react'
import Link from "next/link"
import { Suspense } from "react"
import AddSuppliersToItemModal from "./AddSuppliersToItemModal"
import LayoutItemSuppliers from "./LayoutItemSuppliers"

interface ItemDetailspageProps {
  params: {
    id: string
  },

}

const page = async (filters: SupplierFilters, params: { id: string }) => {
  const id = (await params)?.id
  const user = await getAuthenticatedUser()
  const userOrgId = user.organizationId

  const { data: item, success, error } = await getBriefItemById(id)
  const itemSuppliers = await getItemWithSuppliersById(id)
  const allSuppliers = await getSuppliersByOrgId(userOrgId)
  // const theSupllier = await getSupplierById(id)

  if (!success || !item) {
    return <div className="text-3xl font-bold">Not found</div>
  }
  console.log(item, allSuppliers)
  const suppliers = allSuppliers.data
  // Extract the actual supplier relations from the response
  const supplierRelations = itemSuppliers.data

  console.log("supplierRelations", supplierRelations)
  const existingSupplierIdsForTheItem = supplierRelations?.map(
    (itemSupplier) => itemSupplier?.supplierItems.supplierId,
  ) || []

  return (
    <div className="container py-8">
      <Suspense fallback={<TableLoading title="Item data" />}>
        <div className="container">
          <div className="mb-9 space-y-4">
            <div className="flex items-center gap-2">
              <Link href="/dashboard/inventory/items">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <ArrowLeft className="h-4 w-4" />
                  <span className="sr-only">Back to item</span>
                </Button>
              </Link>
              <div className="text-muted-foreground text-sm">
                <Link href="/dashboard/inventory/items" className="hover:underline">
                  Items
                </Link>
                <span>Suppliers</span>
              </div>
            </div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">{item?.name}</h1>
                <p>
                  SKU: {item?.sku} . Last Updated: {item?.updatedAt.toString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <AddSuppliersToItemModal
                  itemId={id}
                  suppliers={suppliers?.map(supplier => ({ ...supplier, email: supplier.email ?? undefined }))}
                  existingSupplierIds={existingSupplierIdsForTheItem}
                />
              </div>
            </div>
          </div>
          <LayoutItemSuppliers
            itemId={id}
            itemSuppliers={
              supplierRelations
                ? supplierRelations.map(rel => ({
                  ...rel,
                  lastPurchaseDate: rel.supplierItems.lastPurchaseDate === null ? undefined : rel.supplierItems.lastPurchaseDate,
                  // updatedAt and createdAt properties removed as they do not exist on rel
                }))
                : null
            }
            allSuppliers={suppliers ? suppliers.map(sup => ({ ...sup, email: sup.email ?? undefined })) : []}
          />
        </div>
      </Suspense>
    </div>
  )
}

export default page