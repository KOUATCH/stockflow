"use server"

import { createSupplier } from "@/actions/supplierSystem/supplierSystemActions"
import { redirect } from "next/navigation"

export async function onCreate(organizationId: string, input: any) {
  await createSupplier(input)
  redirect(`/dashboard/suppliersSystem?organizationId=${organizationId}`)
}