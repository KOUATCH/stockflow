'use server'

import { supplierInclude } from '@/lib/supplier/include'
import { db } from '@/prisma/db'
// import { db } from '@/prisma/db'
// import { supplierInclude } from '@/lib/suppliers/includes'
import {
  sanitizeEmail,
  sanitizeOptionalString,
  type CreateSupplierDTO,
  type SupplierResponse,
  type SupplierWithRelations
} from '@/types/supplier'
import { Prisma } from '@prisma/client'
import { revalidatePath, revalidateTag } from 'next/cache'

export async function createSupplier(payload: CreateSupplierDTO): Promise<SupplierResponse<SupplierWithRelations>> {
  try {
    if (!payload) throw new Error('Supplier data is required')
    if (!payload.organizationId) throw new Error('Organization ID is required')
    if (!payload.name || !payload.name.trim()) throw new Error('Supplier name is required')

    const code = sanitizeOptionalString(payload.code || undefined)
    const email = sanitizeEmail(payload.email ?? null)

    // Enforce unique code per organization when provided
    if (code) {
      const existing = await db.supplier.findFirst({
        where: { organizationId: payload.organizationId, code },
        select: { id: true },
      })
      if (existing) throw new Error('A supplier with this code already exists in your organization')
    }

    const created = await db.supplier.create({
      data: {
        organizationId: payload.organizationId,
        name: payload.name.trim(),
        code,
        contactPerson: sanitizeOptionalString(payload.contactPerson ?? null),
        email,
        phone: sanitizeOptionalString(payload.phone ?? null),
        address: sanitizeOptionalString(payload.address ?? null),
        taxId: sanitizeOptionalString(payload.taxId ?? null),
        paymentTerms: payload.paymentTerms ?? 30,
        creditLimit: payload.creditLimit ?? null,
        notes: sanitizeOptionalString(payload.notes ?? null),
        isActive: payload.isActive ?? true,
      },
      include: supplierInclude,
    })

    revalidateTag('suppliers')
    revalidateTag(`suppliers-${payload.organizationId}`)
    revalidatePath('/dashboard/suppliers')

    return {
      success: true,
      error: null,
      message: 'Supplier created successfully',
      data: created as SupplierWithRelations,
    }
  } catch (error) {
    // When used with useActionState, consider returning error values instead of throwing for expected failures [^1].
    console.error('Error creating supplier:', error)
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        // unique constraint (e.g., code unique, email unique)
        throw new Error('A supplier with this unique field already exists')
      }
      throw new Error(`Database error: ${error.message}`)
    }
    throw new Error(error instanceof Error ? error.message : 'Failed to create supplier. Please try again.')
  }
}

export default createSupplier
