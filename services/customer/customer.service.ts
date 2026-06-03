import { logger } from "@/lib/logger"
import { db } from "@/prisma/db"
import type { Customer } from "@prisma/client"
import { buildPagination, buildPaginatedResult, MAX_PAGE_SIZES } from "../_shared/pagination"
import type { PaginatedResult } from "../_shared/types"
import type { CustomerCreateInput, CustomerListParams, CustomerUpdateInput } from "./customer.schemas"

export type CustomerDTO = Customer

export async function listCustomers(
  orgId: string,
  params: CustomerListParams,
): Promise<PaginatedResult<CustomerDTO>> {
  const { page, pageSize, search, isActive } = params
  const { skip, take, page: p, pageSize: ps } = buildPagination(page, pageSize, MAX_PAGE_SIZES.customers)

  const where = {
    organizationId: orgId,
    deletedAt: null,
    ...(isActive !== undefined && { isActive }),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
            { phone: { contains: search, mode: "insensitive" as const } },
            { code: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  }

  const [data, total] = await Promise.all([
    db.customer.findMany({ where, orderBy: { name: "asc" }, skip, take }),
    db.customer.count({ where }),
  ])

  return buildPaginatedResult(data as CustomerDTO[], total, p, ps)
}

export async function getCustomerById(orgId: string, id: string): Promise<CustomerDTO> {
  const customer = await db.customer.findFirst({
    where: { id, organizationId: orgId, deletedAt: null },
  })
  if (!customer) throw new Error("Customer not found")
  return customer as CustomerDTO
}

async function nextCustomerCode(orgId: string): Promise<string> {
  const count = await db.customer.count({ where: { organizationId: orgId } })
  return `CUST-${String(count + 1).padStart(4, "0")}`
}

export async function createCustomer(
  orgId: string,
  input: CustomerCreateInput,
): Promise<CustomerDTO> {
  logger.info("customer.create", { orgId, name: input.name })

  const code = input.code ?? (await nextCustomerCode(orgId))

  const existing = await db.customer.findFirst({
    where: { organizationId: orgId, code },
  })
  if (existing) throw new Error(`Customer with code "${code}" already exists in this organisation`)

  const customer = await db.customer.create({
    data: {
      name: input.name,
      code,
      email: input.email ?? null,
      phone: input.phone ?? null,
      address: input.address ?? null,
      taxId: input.taxId ?? null,
      creditLimit: input.creditLimit ?? null,
      paymentTerms: input.paymentTerms ?? null,
      notes: input.notes ?? null,
      isActive: input.isActive,
      preferredLocale: input.preferredLocale,
      organizationId: orgId,
    },
  })
  return customer as CustomerDTO
}

export async function updateCustomer(
  orgId: string,
  id: string,
  input: CustomerUpdateInput,
): Promise<CustomerDTO> {
  const customer = await db.customer.findFirst({
    where: { id, organizationId: orgId, deletedAt: null },
  })
  if (!customer) throw new Error("Customer not found")

  if (input.code && input.code !== customer.code) {
    const codeClash = await db.customer.findFirst({
      where: { organizationId: orgId, code: input.code, NOT: { id } },
    })
    if (codeClash) {
      throw new Error(`Customer with code "${input.code}" already exists in this organisation`)
    }
  }

  const updated = await db.customer.update({
    where: { id },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.code !== undefined && { code: input.code }),
      ...(input.email !== undefined && { email: input.email }),
      ...(input.phone !== undefined && { phone: input.phone }),
      ...(input.address !== undefined && { address: input.address }),
      ...(input.taxId !== undefined && { taxId: input.taxId }),
      ...(input.creditLimit !== undefined && { creditLimit: input.creditLimit }),
      ...(input.paymentTerms !== undefined && { paymentTerms: input.paymentTerms }),
      ...(input.notes !== undefined && { notes: input.notes }),
      ...(input.isActive !== undefined && { isActive: input.isActive }),
      ...(input.preferredLocale !== undefined && { preferredLocale: input.preferredLocale }),
    },
  })
  return updated as CustomerDTO
}

export async function deleteCustomer(orgId: string, id: string): Promise<CustomerDTO> {
  const customer = await db.customer.findFirst({
    where: { id, organizationId: orgId, deletedAt: null },
  })
  if (!customer) throw new Error("Customer not found")

  // Soft delete — the schema includes `deletedAt`, and SalesOrder + ledger
  // entries reference Customer. Hard-delete would orphan history.
  const deleted = await db.customer.update({
    where: { id },
    data: { deletedAt: new Date(), isActive: false },
  })
  return deleted as CustomerDTO
}
