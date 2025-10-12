

'use server'

import { supplierInclude } from '@/lib/supplier/include'
import { db } from '@/prisma/db'
// import { db } from '@/prisma/db'
// import { supplierInclude } from '@/lib/suppliers/includes'
import {
  sanitizeEmail,
  sanitizeOptionalString,
  type SupplierResponse,
  type SupplierWithRelations,
  type UpdateSupplierDTO
} from '@/types/supplier'
import { Prisma } from '@prisma/client'
import { revalidatePath, revalidateTag } from 'next/cache'


/**
 * Update an existing supplier.
 */
export async function updateSupplier(payload: UpdateSupplierDTO): Promise<SupplierResponse<SupplierWithRelations>> {
  try {
    if (!payload?.id) throw new Error('Supplier ID is required')
    if (!payload?.organizationId) throw new Error('Organization ID is required')

    const existing = await db.supplier.findFirst({
      where: { id: payload.id, organizationId: payload.organizationId },
      select: { id: true, code: true, organizationId: true },
    })
    if (!existing) throw new Error("Supplier not found or you don't have permission to update it")

    const code = sanitizeOptionalString(payload.code ?? undefined)
    const email = sanitizeEmail(payload.email ?? null)

    // Enforce unique code per organization when changing code
    if (code) {
      const codeClash = await db.supplier.findFirst({
        where: { organizationId: payload.organizationId, code, NOT: { id: payload.id } },
        select: { id: true },
      })
      if (codeClash) throw new Error('Another supplier with this code already exists in your organization')
    }

    const updated = await db.supplier.update({
      where: { id: payload.id },
      data: {
        name: payload.name?.trim(),
        code,
        contactPerson: sanitizeOptionalString(payload.contactPerson ?? undefined),
        email,
        phone: sanitizeOptionalString(payload.phone ?? undefined),
        address: sanitizeOptionalString(payload.address ?? undefined),
        taxId: sanitizeOptionalString(payload.taxId ?? undefined),
        paymentTerms: payload.paymentTerms ?? undefined,
        creditLimit: payload.creditLimit ?? undefined,
        notes: sanitizeOptionalString(payload.notes ?? undefined),
        isActive: typeof payload.isActive === 'boolean' ? payload.isActive : undefined,
      },
      include: supplierInclude,
    })

    revalidateTag('suppliers')
    revalidateTag(`suppliers-${payload.organizationId}`)
    revalidateTag(`supplier-${payload.id}`)
    revalidatePath('/dashboard/suppliers')
    revalidatePath(`/dashboard/suppliers/${payload.id}`)

    return {
      success: true,
      message: 'Supplier updated successfully',
      data: updated as SupplierWithRelations,
    }
  } catch (error) {
    console.error('Error updating supplier:', error)
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') throw new Error('Supplier not found')
      if (error.code === 'P2002') throw new Error('A supplier with this unique field already exists')
      throw new Error(`Database error: ${error.message}`)
    }
    throw new Error(error instanceof Error ? error.message : 'Failed to update supplier. Please try again.')
  }
}
