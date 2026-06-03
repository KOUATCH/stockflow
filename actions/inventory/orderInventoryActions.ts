"use server"

import { prisma } from "@/prisma/db"
import { revalidatePath } from "next/cache"
import { TransactionType, TransactionReferenceType } from "@prisma/client"

export interface InventoryReservationData {
  itemId: string
  locationId: string
  quantity: number
  orderId: string
  orderNumber: string
  organizationId: string
  userId: string
  notes?: string
}

export interface InventoryReleaseData {
  itemId: string
  locationId: string
  quantity: number
  reason: string
  organizationId: string
  userId: string
  notes?: string
}

function toNumber(value: any): number {
  if (value === null || value === undefined) return 0
  if (typeof value === "number") return value
  if (typeof value === "string") return Number(value) || 0
  if (typeof value.toNumber === "function") return value.toNumber()
  return Number(value) || 0
}

function displayName(item: any): string {
  return item?.nameEn ?? item?.nameFr ?? item?.name ?? item?.sku ?? ""
}

// Check item availability at a location
export async function checkItemAvailability(
  itemId: string,
  locationId: string,
  quantity: number,
  organizationId: string
) {
  try {
    const inventoryLevel = await prisma.inventoryLevel.findUnique({
      where: {
        itemId_locationId: {
          itemId,
          locationId
        }
      },
      include: {
        item: {
          select: {
            nameEn: true,
            nameFr: true,
            sku: true
          }
        }
      }
    })

    if (!inventoryLevel) {
      return {
        success: false,
        error: "Item not found in inventory",
        available: false,
        quantityAvailable: 0
      }
    }

    const quantityAvailable = toNumber(inventoryLevel.quantityAvailable)
    const available = quantityAvailable >= quantity

    return {
      success: true,
      available,
      quantityAvailable,
      quantityOnHand: toNumber(inventoryLevel.quantityOnHand),
      quantityReserved: toNumber(inventoryLevel.quantityReserved),
      data: {
        ...inventoryLevel,
        quantityAvailable,
        quantityOnHand: toNumber(inventoryLevel.quantityOnHand),
        quantityReserved: toNumber(inventoryLevel.quantityReserved),
        item: {
          ...inventoryLevel.item,
          name: displayName(inventoryLevel.item),
        },
      }
    }
  } catch (error) {
    console.error("Error checking item availability:", error)
    return {
      success: false,
      error: "Failed to check item availability",
      available: false,
      quantityAvailable: 0
    }
  }
}

// Reserve inventory for an order
export async function reserveInventoryForOrder(items: InventoryReservationData[]) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const reservations = []
      const transactions = []

      // Check availability for all items first
      for (const item of items) {
        const inventoryLevel = await tx.inventoryLevel.findUnique({
          where: {
            itemId_locationId: {
              itemId: item.itemId,
              locationId: item.locationId
            }
          },
          include: {
            item: {
              select: {
                nameEn: true,
                nameFr: true,
                sku: true
              }
            }
          }
        })

        if (!inventoryLevel) {
          throw new Error(`Item ${item.itemId} not found in inventory at location ${item.locationId}`)
        }

        const quantityAvailable = toNumber(inventoryLevel.quantityAvailable)
        if (quantityAvailable < item.quantity) {
          throw new Error(`Insufficient stock for ${displayName(inventoryLevel.item)} (${inventoryLevel.item.sku}). Available: ${quantityAvailable}, Requested: ${item.quantity}`)
        }
      }

      // All items are available, proceed with reservations
      for (const item of items) {
        // Update inventory level
        const updatedLevel = await tx.inventoryLevel.update({
          where: {
            itemId_locationId: {
              itemId: item.itemId,
              locationId: item.locationId
            }
          },
          data: {
            quantityReserved: {
              increment: item.quantity
            },
            quantityAvailable: {
              decrement: item.quantity
            },
            lastTransactionAt: new Date()
          }
        })

        reservations.push(updatedLevel)

        // Create inventory transaction
        const transaction = await tx.inventoryTransaction.create({
          data: {
            type: TransactionType.RESERVATION,
            quantity: item.quantity,
            unitCost: 0,
            totalCost: 0,
            itemId: item.itemId,
            locationId: item.locationId,
            organizationId: item.organizationId,
            createdById: item.userId,
            referenceType: TransactionReferenceType.SALES_ORDER,
            referenceId: item.orderId,
            referenceNumber: item.orderNumber,
            notes: item.notes || `Reserved for order ${item.orderNumber}`,
            balanceAfter: updatedLevel.quantityOnHand,
            serialNumbers: [],
          }
        })

        transactions.push(transaction)
      }

      return { reservations, transactions }
    })

    revalidatePath("/dashboard/inventory")
    revalidatePath("/dashboard/orders")

    return {
      success: true,
      data: result,
      message: "Inventory reserved successfully"
    }
  } catch (error) {
    console.error("Error reserving inventory:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to reserve inventory"
    }
  }
}

// Release reserved inventory (when order is cancelled)
export async function releaseReservedInventory(items: InventoryReleaseData[]) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const releases = []
      const transactions = []

      for (const item of items) {
        // Update inventory level
        const updatedLevel = await tx.inventoryLevel.update({
          where: {
            itemId_locationId: {
              itemId: item.itemId,
              locationId: item.locationId
            }
          },
          data: {
            quantityReserved: {
              decrement: item.quantity
            },
            quantityAvailable: {
              increment: item.quantity
            },
            lastTransactionAt: new Date()
          }
        })

        releases.push(updatedLevel)

        // Create inventory transaction
        const transaction = await tx.inventoryTransaction.create({
          data: {
            type: TransactionType.RESERVATION_RELEASE,
            quantity: item.quantity,
            unitCost: 0,
            totalCost: 0,
            itemId: item.itemId,
            locationId: item.locationId,
            organizationId: item.organizationId,
            createdById: item.userId,
            referenceType: TransactionReferenceType.MANUAL,
            notes: item.notes || `Released: ${item.reason}`,
            balanceAfter: updatedLevel.quantityOnHand,
            serialNumbers: [],
          }
        })

        transactions.push(transaction)
      }

      return { releases, transactions }
    })

    revalidatePath("/dashboard/inventory")
    revalidatePath("/dashboard/orders")

    return {
      success: true,
      data: result,
      message: "Reserved inventory released successfully"
    }
  } catch (error) {
    console.error("Error releasing inventory:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to release inventory"
    }
  }
}

// Convert reserved inventory to sold (on delivery/completion)
export async function convertReservedToSold(
  items: {
    itemId: string
    locationId: string
    quantity: number
    unitCost?: number
    orderId: string
    orderNumber: string
    deliveryId?: string
    deliveryNumber?: string
  }[],
  organizationId: string,
  userId: string
) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const sales = []
      const transactions = []

      for (const item of items) {
        // Update inventory level - reduce on hand and reserved
        const updatedLevel = await tx.inventoryLevel.update({
          where: {
            itemId_locationId: {
              itemId: item.itemId,
              locationId: item.locationId
            }
          },
          data: {
            quantityOnHand: {
              decrement: item.quantity
            },
            quantityReserved: {
              decrement: item.quantity
            },
            lastTransactionAt: new Date()
          }
        })

        sales.push(updatedLevel)

        // Create inventory transaction for the sale
        const transaction = await tx.inventoryTransaction.create({
          data: {
            type: TransactionType.SALE,
            quantity: -item.quantity, // Negative for outbound
            unitCost: item.unitCost || 0,
            totalCost: (item.unitCost || 0) * item.quantity,
            itemId: item.itemId,
            locationId: item.locationId,
            organizationId,
            createdById: userId,
            referenceType: TransactionReferenceType.SALES_ORDER,
            referenceId: item.orderId,
            referenceNumber: item.orderNumber,
            notes: item.deliveryId
              ? `Sold via delivery ${item.deliveryNumber}`
              : `Sold via order ${item.orderNumber}`,
            balanceAfter: updatedLevel.quantityOnHand,
            serialNumbers: [],
          }
        })

        transactions.push(transaction)
      }

      return { sales, transactions }
    })

    revalidatePath("/dashboard/inventory")
    revalidatePath("/dashboard/orders")

    return {
      success: true,
      data: result,
      message: "Inventory sold successfully"
    }
  } catch (error) {
    console.error("Error converting reserved to sold:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to process sale"
    }
  }
}

// Get inventory levels for multiple items
export async function getInventoryLevels(
  items: { itemId: string; locationId?: string }[],
  organizationId: string
) {
  try {
    const inventoryLevels = await prisma.inventoryLevel.findMany({
      where: {
        OR: items.map(item => ({
          itemId: item.itemId,
          ...(item.locationId && { locationId: item.locationId })
        })),
        item: {
          organizationId
        }
      },
      include: {
        item: {
          select: {
            nameEn: true,
            nameFr: true,
            sku: true,
            costPrice: true
          }
        },
        location: {
          select: {
            name: true,
            code: true
          }
        }
      }
    })

    return {
      success: true,
      data: inventoryLevels.map((level) => ({
        ...level,
        quantityOnHand: toNumber(level.quantityOnHand),
        quantityReserved: toNumber(level.quantityReserved),
        quantityAvailable: toNumber(level.quantityAvailable),
        quantityInTransit: toNumber(level.quantityInTransit),
        quantityOnOrder: toNumber(level.quantityOnOrder),
        averageCost: toNumber(level.averageCost),
        totalValue: toNumber(level.totalValue),
        reorderPoint: toNumber(level.reorderPoint),
        item: {
          ...level.item,
          name: displayName(level.item),
          costPrice: toNumber(level.item.costPrice),
        },
      }))
    }
  } catch (error) {
    console.error("Error fetching inventory levels:", error)
    return {
      success: false,
      error: "Failed to fetch inventory levels"
    }
  }
}

// Validate order items against inventory
export async function validateOrderItemsInventory(
  orderItems: {
    itemId: string
    quantity: number
    locationId?: string
  }[],
  organizationId: string,
  defaultLocationId?: string
) {
  try {
    const validationResults = []
    let allItemsAvailable = true

    for (const orderItem of orderItems) {
      const locationId = orderItem.locationId || defaultLocationId

      if (!locationId) {
        allItemsAvailable = false
        validationResults.push({
          itemId: orderItem.itemId,
          available: false,
          error: "No location specified",
          quantityAvailable: 0,
          quantityRequested: orderItem.quantity
        })
        continue
      }

      const availabilityCheck = await checkItemAvailability(
        orderItem.itemId,
        locationId,
        orderItem.quantity,
        organizationId
      )

      validationResults.push({
        itemId: orderItem.itemId,
        locationId,
        available: availabilityCheck.available,
        error: availabilityCheck.error,
        quantityAvailable: availabilityCheck.quantityAvailable,
        quantityRequested: orderItem.quantity,
        item: availabilityCheck.data?.item
      })

      if (!availabilityCheck.available) {
        allItemsAvailable = false
      }
    }

    return {
      success: true,
      allItemsAvailable,
      validationResults,
      message: allItemsAvailable
        ? "All items are available"
        : "Some items are not available in sufficient quantity"
    }
  } catch (error) {
    console.error("Error validating order items:", error)
    return {
      success: false,
      error: "Failed to validate inventory availability"
    }
  }
}
