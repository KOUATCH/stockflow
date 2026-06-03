"use server"

import { prisma } from "@/prisma/db"

const toNumber = (value: unknown): number => {
  if (typeof value === "number") return value
  if (value && typeof value === "object" && "toNumber" in value && typeof value.toNumber === "function") {
    return value.toNumber()
  }
  return Number(value ?? 0)
}

// Get customers for order form
export async function getCustomersForOrder(organizationId: string) {
  try {
    const customers = await prisma.customer.findMany({
      where: {
        organizationId,
        isActive: true
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true
      },
      orderBy: {
        name: 'asc'
      },
      take: 100 // Limit to prevent too much data
    })

    return {
      success: true,
      data: customers
    }
  } catch (error) {
    console.error("Error fetching customers:", error)
    return {
      success: false,
      error: "Failed to fetch customers"
    }
  }
}

// Get items for order form
export async function getItemsForOrder(organizationId: string) {
  try {
    const items = await prisma.item.findMany({
      where: {
        organizationId,
        isActive: true
      },
      select: {
        id: true,
        nameEn: true,
        nameFr: true,
        sku: true,
        sellingPrice: true,
        inventoryLevels: {
          select: {
            quantityOnHand: true
          },
          take: 1
        }
      },
      orderBy: {
        nameEn: 'asc'
      },
      take: 200 // Limit to prevent too much data
    })

    // Transform the data to match our interface
    const transformedItems = items.map(item => ({
      id: item.id,
      name: item.nameEn || item.nameFr || item.sku,
      sku: item.sku,
      sellingPrice: toNumber(item.sellingPrice),
      quantityOnHand: toNumber(item.inventoryLevels[0]?.quantityOnHand)
    }))

    return {
      success: true,
      data: transformedItems
    }
  } catch (error) {
    console.error("Error fetching items:", error)
    return {
      success: false,
      error: "Failed to fetch items"
    }
  }
}
