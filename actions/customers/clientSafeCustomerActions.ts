"use server"

import { auth } from "@/auth"
import { db } from "@/prisma/db"
import { stockFlowAction } from "@/lib/error-handling"
import type { ServerActionResult } from "@/lib/error-handling/types"

/**
 * Client-safe customer actions that don't use getAuthenticatedUser()
 */

export const getOrgCustomersClientSafe = stockFlowAction(
  async (organizationId?: string): Promise<ServerActionResult<any>> => {
    const session = await auth()

    if (!session?.user) {
      throw new Error('Not authenticated');
    }

    const userOrgId = organizationId || session.user.organizationId

    if (!userOrgId) {
      throw new Error('No organization ID');
    }

    const customers = await db.customer.findMany({
      where: {
        organizationId: userOrgId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        notes: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        // Include related data if needed
      },
    })

    return {
      success: true,
      data: customers
    }
  },
  {
    actionName: 'getOrgCustomersClientSafe',
    component: 'CustomerManagement',
    businessContext: {
      domain: 'customers',
      operation: 'read',
      resourceType: 'customers'
    }
  }
);

export const getCustomerByIdClientSafe = stockFlowAction(
  async (customerId: string, organizationId?: string): Promise<ServerActionResult<any>> => {
    const session = await auth()

    if (!session?.user) {
      throw new Error('Not authenticated');
    }

    const userOrgId = organizationId || session.user.organizationId

    if (!userOrgId) {
      throw new Error('No organization ID');
    }

    const customer = await db.customer.findFirst({
      where: {
        id: customerId,
        organizationId: userOrgId,
      },
      include: {
        _count: true,
      },
    })

    if (!customer) {
      throw new Error('Customer not found');
    }

    return {
      success: true,
      data: customer
    }
  },
  {
    actionName: 'getCustomerByIdClientSafe',
    component: 'CustomerManagement',
    businessContext: {
      domain: 'customers',
      operation: 'read',
      resourceType: 'customer'
    }
  }
);