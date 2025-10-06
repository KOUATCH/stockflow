

"use server"

import { getAuthenticatedUser } from "@/lib/auth-server"
import { db } from "@/prisma/db"
import type { Customer, CustomerWithStats } from "@/types/customerTypes"
import type { CustomerEditFormData, CustomerFormData } from "@/validations/customer"

export async function getCustomers(): Promise<CustomerWithStats[]> {
  const user = await getAuthenticatedUser()
  const userOrgId = user.organizationId
  const customers = await db.customer.findMany({
    where: {
      organizationId:userOrgId,
    },
    include: {
      salesOrders: {
        select: {
          id: true,
          total: true,
          createdAt: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return customers.map((customer) => ({
    ...customer,
    paymentTerms: customer.paymentTerms ?? 0,
    totalOrders: customer.salesOrders.length,
    totalRevenue: customer.salesOrders.reduce((sum, order) => sum + (order.total || 0), 0),
    lastOrderDate:
      customer.salesOrders.length > 0
        ? customer.salesOrders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0].createdAt
        : null,
  }))
}

export async function getCustomer(id: string, organizationId?: string): Promise<Customer | null> {
  const user = await getAuthenticatedUser()
  const userOrgId = organizationId || user.organizationId

  if (!userOrgId) {
    throw new Error("Organization ID is required")
  }

  const customer = await db.customer.findFirst({
    where: {
      id,
      organizationId: userOrgId,
    },
  })

  if (!customer) return null

  return {
    ...customer,
    paymentTerms: customer.paymentTerms ?? 0,
  }
}

export async function createCustomer(data: CustomerFormData): Promise<Customer> {

  const user = await getAuthenticatedUser()
  const userOrgId = user.organizationId
  const customer = await db.customer.create({
    data: {
      ...data,
      organizationId:userOrgId,
      code: data.code || `CUST-${Date.now()}`,
    },
  })

  return {
    ...customer,
    paymentTerms: customer.paymentTerms ?? 0,
  }
}

export async function updateCustomer(data: CustomerEditFormData): Promise<Customer> {
  
  const user = await getAuthenticatedUser()
  const userOrgId = user.organizationId
  const updated = await db.customer.updateMany({
    where: {
      id: data.id,
      organizationId:userOrgId,
    },
    data: {
      name: data.name,
      code: data.code,
      email: data.email,
      phone: data.phone,
      address: data.address,
      taxId: data.taxId,
      creditLimit: data.creditLimit,
      paymentTerms: data.paymentTerms,
      notes: data.notes,
      isActive: data.isActive,
    },
  })

  // Optionally, fetch and return the updated customer
  const customer = await db.customer.findFirst({
    
    where: {
      id: data.id,
      organizationId:userOrgId,
    },
  })

  if (!customer) {
    throw new Error("Customer not found after update")
  }

  return {
    ...customer,
    paymentTerms: customer.paymentTerms ?? 0,
  }
}

export async function getCustomerOrders(customerId: string) {
  const user = await getAuthenticatedUser()
  const userOrgId = user.organizationId

  if (!userOrgId) {
    throw new Error("Organization ID is required")
  }

  const orders = await db.salesOrder.findMany({
    where: {
      customerId,
      organizationId: userOrgId,
    },
    include: {
      lines: {
        include: {
          item: {
            select: {
              name: true,
              sku: true,
            }
          }
        }
      },
      payments: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return orders.map(order => ({
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    totalAmount: order.totalAmount,
    subtotal: order.subtotal,
    taxAmount: order.taxAmount,
    discountAmount: order.discountAmount,
    itemCount: order.lines.reduce((sum, line) => sum + line.quantity, 0),
    lineItems: order.lines.length,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    deliveredAt: order.deliveredAt,
    lines: order.lines.map(line => ({
      id: line.id,
      itemName: line.item?.name || 'Unknown Item',
      sku: line.item?.sku || '',
      quantity: line.quantity,
      unitPrice: line.unitPrice,
      lineTotal: line.lineTotal,
    })),
    payments: order.payments,
  }))
}

export async function deleteCustomer(id: string): Promise<void> {
  const user = await getAuthenticatedUser()
  const userOrgId = user.organizationId

  await db.customer.delete({
    where: {
      id,
      organizationId:userOrgId,
    },
  })
}
