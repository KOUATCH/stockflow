"use server"

import { prisma } from "@/prisma/db"
import { revalidatePath } from "next/cache"
import { DeliveryStatus } from "@prisma/client"
import { convertReservedToSold } from "@/actions/inventory/orderInventoryActions"

export interface CreateDeliveryData {
  orderId: string
  organizationId: string
  deliveredBy: string
  deliveryAddress: string
  deliveryNotes?: string
  estimatedDeliveryDate?: Date
  deliveryItems: {
    orderLineId: string
    itemId: string
    itemName: string
    itemSku: string
    quantityToDeliver: number
    notes?: string
  }[]
}

export async function createOrderDelivery(data: CreateDeliveryData) {
  try {
    // Verify the order exists and belongs to the organization
    const existingOrder = await prisma.clientOrder.findFirst({
      where: {
        id: data.orderId,
        organizationId: data.organizationId
      },
      include: {
        orderLines: true,
        deliveries: {
          include: {
            deliveryItems: true
          }
        }
      }
    })

    if (!existingOrder) {
      return {
        success: false,
        error: "Order not found or doesn't belong to this organization"
      }
    }

    // Check if order can have deliveries
    const canCreateDelivery = ['CONFIRMED', 'PROCESSING', 'READY_FOR_PICKUP', 'PARTIALLY_DELIVERED'].includes(existingOrder.status)

    if (!canCreateDelivery) {
      return {
        success: false,
        error: `Order cannot be delivered in ${existingOrder.status} status`
      }
    }

    // Validate delivery items against order lines
    const orderLineMap = new Map(existingOrder.orderLines.map(line => [line.id, line]))

    // Calculate already delivered quantities
    const deliveredQuantities = new Map<string, number>()
    existingOrder.deliveries.forEach(delivery => {
      if (delivery.status !== 'CANCELLED') {
        delivery.deliveryItems.forEach(item => {
          const current = deliveredQuantities.get(item.orderLineId) || 0
          deliveredQuantities.set(item.orderLineId, current + item.quantityDelivered)
        })
      }
    })

    // Validate each delivery item
    for (const deliveryItem of data.deliveryItems) {
      const orderLine = orderLineMap.get(deliveryItem.orderLineId)
      if (!orderLine) {
        return {
          success: false,
          error: `Order line ${deliveryItem.orderLineId} not found`
        }
      }

      const alreadyDelivered = deliveredQuantities.get(deliveryItem.orderLineId) || 0
      const remainingQuantity = orderLine.quantity - alreadyDelivered

      if (deliveryItem.quantityToDeliver > remainingQuantity) {
        return {
          success: false,
          error: `Cannot deliver ${deliveryItem.quantityToDeliver} of ${deliveryItem.itemName}. Only ${remainingQuantity} remaining.`
        }
      }

      if (deliveryItem.quantityToDeliver <= 0) {
        return {
          success: false,
          error: `Invalid quantity for ${deliveryItem.itemName}. Must be greater than 0.`
        }
      }
    }

    // Generate delivery number
    const deliveryCount = await prisma.orderDelivery.count({
      where: { organizationId: data.organizationId }
    })
    const deliveryNumber = `DEL-${(deliveryCount + 1).toString().padStart(6, '0')}`

    // Create the delivery in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the delivery
      const delivery = await tx.orderDelivery.create({
        data: {
          orderId: data.orderId,
          deliveryNumber,
          deliveredBy: data.deliveredBy,
          deliveryAddress: data.deliveryAddress,
          deliveryNotes: data.deliveryNotes,
          estimatedDeliveryDate: data.estimatedDeliveryDate,
          status: DeliveryStatus.PENDING,
          organizationId: data.organizationId,
          deliveryItems: {
            create: data.deliveryItems.map(item => ({
              orderLineId: item.orderLineId,
              itemId: item.itemId,
              itemName: item.itemName,
              itemSku: item.itemSku,
              quantityDelivered: item.quantityToDeliver,
              notes: item.notes
            }))
          }
        },
        include: {
          deliveryItems: {
            include: {
              orderLine: true,
              item: true
            }
          }
        }
      })

      // Check if order is now fully delivered
      const updatedDeliveredQuantities = new Map(deliveredQuantities)
      data.deliveryItems.forEach(item => {
        const current = updatedDeliveredQuantities.get(item.orderLineId) || 0
        updatedDeliveredQuantities.set(item.orderLineId, current + item.quantityToDeliver)
      })

      let isFullyDelivered = true
      for (const orderLine of existingOrder.orderLines) {
        const deliveredQty = updatedDeliveredQuantities.get(orderLine.id) || 0
        if (deliveredQty < orderLine.quantity) {
          isFullyDelivered = false
          break
        }
      }

      // Update order status if needed
      const hasAnyDeliveries = existingOrder.deliveries.length > 0 || true // We're adding one now
      let newOrderStatus = existingOrder.status

      if (isFullyDelivered) {
        newOrderStatus = 'DELIVERED'
      } else if (hasAnyDeliveries && existingOrder.status !== 'PARTIALLY_DELIVERED') {
        newOrderStatus = 'PARTIALLY_DELIVERED'
      }

      if (newOrderStatus !== existingOrder.status) {
        await tx.clientOrder.update({
          where: { id: data.orderId },
          data: {
            status: newOrderStatus,
            updatedAt: new Date()
          }
        })

        // Create status history entry
        await tx.orderStatusHistory.create({
          data: {
            orderId: data.orderId,
            status: newOrderStatus,
            changedById: data.deliveredBy,
            notes: `Order status updated due to delivery ${deliveryNumber}`,
            organizationId: data.organizationId
          }
        })
      }

      return delivery
    })

    // Convert reserved inventory to sold for delivered items
    if (result && existingOrder.locationId) {
      const inventoryItems = data.deliveryItems.map(item => ({
        itemId: item.itemId,
        locationId: existingOrder.locationId!,
        quantity: item.quantityToDeliver,
        unitCost: undefined, // Will use item's cost price
        orderId: data.orderId,
        orderNumber: existingOrder.orderNumber,
        deliveryId: result.id,
        deliveryNumber: deliveryNumber
      }))

      const inventoryResult = await convertReservedToSold(
        inventoryItems,
        data.organizationId,
        data.deliveredBy
      )

      if (!inventoryResult.success) {
        console.warn("Failed to update inventory for delivery:", inventoryResult.error)
        // Don't fail the entire delivery if inventory update fails
      }
    }

    revalidatePath("/dashboard/orders")
    revalidatePath(`/dashboard/orders/${data.orderId}`)
    revalidatePath(`/dashboard/orders/${data.orderId}/delivery`)
    revalidatePath("/dashboard/inventory")

    return {
      success: true,
      data: result,
      message: `Delivery ${deliveryNumber} created successfully`
    }
  } catch (error) {
    console.error("Error creating delivery:", error)
    return {
      success: false,
      error: "Failed to create delivery"
    }
  }
}

export async function updateDeliveryStatus(
  deliveryId: string,
  status: DeliveryStatus,
  organizationId: string,
  updatedBy: string,
  notes?: string
) {
  try {
    // Verify the delivery exists and belongs to the organization
    const existingDelivery = await prisma.orderDelivery.findFirst({
      where: {
        id: deliveryId,
        organizationId
      },
      include: {
        order: true,
        deliveryItems: true
      }
    })

    if (!existingDelivery) {
      return {
        success: false,
        error: "Delivery not found or doesn't belong to this organization"
      }
    }

    // Update the delivery status
    const updatedDelivery = await prisma.orderDelivery.update({
      where: { id: deliveryId },
      data: {
        status,
        actualDeliveryDate: status === DeliveryStatus.DELIVERED ? new Date() : null,
        updatedAt: new Date()
      },
      include: {
        deliveryItems: true,
        order: {
          include: {
            orderLines: true,
            deliveries: {
              include: {
                deliveryItems: true
              }
            }
          }
        }
      }
    })

    // If delivery was completed or cancelled, check if we need to update order status
    if (status === DeliveryStatus.DELIVERED || status === DeliveryStatus.CANCELLED) {
      // Recalculate delivered quantities excluding cancelled deliveries
      const deliveredQuantities = new Map<string, number>()
      updatedDelivery.order.deliveries.forEach(delivery => {
        if (delivery.status === DeliveryStatus.DELIVERED) {
          delivery.deliveryItems.forEach(item => {
            const current = deliveredQuantities.get(item.orderLineId) || 0
            deliveredQuantities.set(item.orderLineId, current + item.quantityDelivered)
          })
        }
      })

      // Check if order is fully delivered
      let isFullyDelivered = true
      let hasPartialDeliveries = false

      for (const orderLine of updatedDelivery.order.orderLines) {
        const deliveredQty = deliveredQuantities.get(orderLine.id) || 0
        if (deliveredQty < orderLine.quantity) {
          isFullyDelivered = false
        }
        if (deliveredQty > 0) {
          hasPartialDeliveries = true
        }
      }

      let newOrderStatus = updatedDelivery.order.status
      if (isFullyDelivered) {
        newOrderStatus = 'DELIVERED'
      } else if (hasPartialDeliveries) {
        newOrderStatus = 'PARTIALLY_DELIVERED'
      } else {
        // No deliveries completed, revert to previous status
        newOrderStatus = 'READY_FOR_PICKUP'
      }

      if (newOrderStatus !== updatedDelivery.order.status) {
        await prisma.clientOrder.update({
          where: { id: updatedDelivery.orderId },
          data: {
            status: newOrderStatus,
            updatedAt: new Date()
          }
        })

        // Create status history entry
        await prisma.orderStatusHistory.create({
          data: {
            orderId: updatedDelivery.orderId,
            status: newOrderStatus,
            changedById: updatedBy,
            notes: notes || `Order status updated due to delivery ${updatedDelivery.deliveryNumber} status change to ${status}`,
            organizationId
          }
        })
      }
    }

    revalidatePath("/dashboard/orders")
    revalidatePath(`/dashboard/orders/${updatedDelivery.orderId}`)
    revalidatePath(`/dashboard/orders/${updatedDelivery.orderId}/delivery`)

    return {
      success: true,
      data: updatedDelivery,
      message: `Delivery ${updatedDelivery.deliveryNumber} status updated to ${status}`
    }
  } catch (error) {
    console.error("Error updating delivery status:", error)
    return {
      success: false,
      error: "Failed to update delivery status"
    }
  }
}