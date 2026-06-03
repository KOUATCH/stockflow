"use server"

import {
  deleteItemSupplierLink,
  getRecentPOItemsForSupplier,
  searchItemsLite,
  updateSupplier,
  upsertItemSupplierBulk,
} from "@/app/actions/suppliers.actions"
import { redirect } from "next/navigation"

export async function onSave(supplierId: string, organizationId: string, input: any) {
  await updateSupplier(supplierId, input)
  redirect(`/dashboard/supplierSystem/${supplierId}?organizationId=${organizationId}`)
}

export async function itemSearch(organizationId: string, q: string) {
  return searchItemsLite({ organizationId, q, limit: 10 })
}

export async function upsertLinks(supplierId: string, organizationId: string, rows: Array<any>) {
  await upsertItemSupplierBulk({ supplierId, organizationId, rows })
}

export async function deleteLink(organizationId: string, id: string) {
  await deleteItemSupplierLink({ id, organizationId })
}

export async function linkRecent(supplierId: string, organizationId: string, months: number) {
  const items = await getRecentPOItemsForSupplier({ supplierId, organizationId, months, limit: 100 })
  return items
}