import { logger } from "@/lib/logger"
import { db } from "@/prisma/db"
import type { Prisma, Supplier } from "@prisma/client"
import { buildPagination, buildPaginatedResult } from "../_shared/pagination"
import type { PaginatedResult } from "../_shared/types"
import type {
  SupplierCreateInput,
  SupplierListParams,
  SupplierSearchParams,
  SupplierUpdateInput,
} from "./supplier.schemas"

export type SupplierDTO = Supplier

const MAX_SUPPLIER_PAGE_SIZE = 200

export async function listSuppliers(
  orgId: string,
  params: SupplierListParams,
): Promise<PaginatedResult<SupplierDTO>> {
  const { page, pageSize, search, isActive, sortBy, sortOrder } = params
  const { skip, take, page: p, pageSize: ps } = buildPagination(page, pageSize, MAX_SUPPLIER_PAGE_SIZE)

  const where: Prisma.SupplierWhereInput = {
    organizationId: orgId,
    deletedAt: null,
    ...(isActive !== undefined && { isActive }),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { code: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
            { phone: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  }

  const orderBy: Prisma.SupplierOrderByWithRelationInput = { [sortBy]: sortOrder }

  const [data, total] = await Promise.all([
    db.supplier.findMany({ where, orderBy, skip, take }),
    db.supplier.count({ where }),
  ])

  return buildPaginatedResult(data as SupplierDTO[], total, p, ps)
}

export async function getSupplierById(orgId: string, id: string): Promise<SupplierDTO> {
  const supplier = await db.supplier.findFirst({
    where: { id, organizationId: orgId, deletedAt: null },
  })
  if (!supplier) throw new Error("Supplier not found")
  return supplier as SupplierDTO
}

async function nextSupplierCode(orgId: string): Promise<string> {
  const count = await db.supplier.count({ where: { organizationId: orgId } })
  return `SUP-${String(count + 1).padStart(4, "0")}`
}

export async function createSupplier(
  orgId: string,
  input: SupplierCreateInput,
): Promise<SupplierDTO> {
  logger.info("supplier.create", { orgId, name: input.name })

  const code = input.code ?? (await nextSupplierCode(orgId))
  const existing = await db.supplier.findFirst({
    where: { organizationId: orgId, code },
  })
  if (existing) throw new Error(`Supplier with code "${code}" already exists in this organisation`)

  const supplier = await db.supplier.create({
    data: {
      name: input.name,
      code,
      contactPerson: input.contactPerson ?? null,
      email: input.email ?? null,
      phone: input.phone ?? null,
      address: input.address ?? null,
      city: input.city ?? null,
      state: input.state ?? null,
      zipCode: input.zipCode ?? null,
      country: input.country ?? null,
      taxId: input.taxId ?? null,
      paymentTerms: input.paymentTerms ?? 30,
      creditLimit: input.creditLimit ?? null,
      notes: input.notes ?? null,
      isActive: input.isActive,
      preferredLocale: input.preferredLocale,
      organizationId: orgId,
    },
  })
  return supplier as SupplierDTO
}

export async function updateSupplier(
  orgId: string,
  id: string,
  input: SupplierUpdateInput,
): Promise<SupplierDTO> {
  const supplier = await db.supplier.findFirst({
    where: { id, organizationId: orgId, deletedAt: null },
  })
  if (!supplier) throw new Error("Supplier not found")

  if (input.code && input.code !== supplier.code) {
    const clash = await db.supplier.findFirst({
      where: { organizationId: orgId, code: input.code, NOT: { id } },
    })
    if (clash) {
      throw new Error(`Supplier with code "${input.code}" already exists in this organisation`)
    }
  }

  const updated = await db.supplier.update({
    where: { id },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.code !== undefined && { code: input.code }),
      ...(input.contactPerson !== undefined && { contactPerson: input.contactPerson }),
      ...(input.email !== undefined && { email: input.email }),
      ...(input.phone !== undefined && { phone: input.phone }),
      ...(input.address !== undefined && { address: input.address }),
      ...(input.city !== undefined && { city: input.city }),
      ...(input.state !== undefined && { state: input.state }),
      ...(input.zipCode !== undefined && { zipCode: input.zipCode }),
      ...(input.country !== undefined && { country: input.country }),
      ...(input.taxId !== undefined && { taxId: input.taxId }),
      ...(input.paymentTerms !== undefined && { paymentTerms: input.paymentTerms }),
      ...(input.creditLimit !== undefined && { creditLimit: input.creditLimit }),
      ...(input.notes !== undefined && { notes: input.notes }),
      ...(input.isActive !== undefined && { isActive: input.isActive }),
      ...(input.preferredLocale !== undefined && { preferredLocale: input.preferredLocale }),
    },
  })
  return updated as SupplierDTO
}

export async function setSupplierActive(
  orgId: string,
  id: string,
  isActive: boolean,
): Promise<SupplierDTO> {
  const supplier = await db.supplier.findFirst({
    where: { id, organizationId: orgId, deletedAt: null },
  })
  if (!supplier) throw new Error("Supplier not found")

  const updated = await db.supplier.update({ where: { id }, data: { isActive } })
  return updated as SupplierDTO
}

export async function deleteSupplier(orgId: string, id: string): Promise<SupplierDTO> {
  const supplier = await db.supplier.findFirst({
    where: { id, organizationId: orgId, deletedAt: null },
  })
  if (!supplier) throw new Error("Supplier not found")

  // Block hard delete if there are dependent purchase orders to preserve history.
  const linkedPOs = await db.purchaseOrder.count({
    where: { supplierId: id, organizationId: orgId },
  })
  if (linkedPOs > 0) {
    throw new Error("Cannot delete supplier: it is referenced by purchase orders")
  }

  // Soft-delete to preserve ItemSupplier / ledger history.
  const deleted = await db.supplier.update({
    where: { id },
    data: { deletedAt: new Date(), isActive: false },
  })
  return deleted as SupplierDTO
}

export async function searchSuppliersLite(
  orgId: string,
  params: SupplierSearchParams,
): Promise<Array<Pick<Supplier, "id" | "name" | "code" | "email">>> {
  const { q, limit } = params
  const where: Prisma.SupplierWhereInput = {
    organizationId: orgId,
    deletedAt: null,
    isActive: true,
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { code: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  }

  return db.supplier.findMany({
    where,
    take: limit,
    orderBy: { name: "asc" },
    select: { id: true, name: true, code: true, email: true },
  })
}
