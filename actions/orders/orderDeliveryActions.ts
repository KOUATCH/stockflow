"use server"

import { prisma } from "@/prisma/db"
import { revalidatePath } from "next/cache"
import { OrderStatus } from "@prisma/client"

export interface CreateDeliveryData {
  orderId: string
  deliveryAddress?: string
  deliveryNotes?: string
  recipientName?: string
  recipientPhone?: string
  isPartialDelivery: boolean
  deliveryFee?: number
  organizationId: string
  deliveredById: string
  deliveryItems: {
    orderLineId: string
    quantityDelivered: number
    notes?: string
  }[]
}

// Generate unique delivery number
export async function generateDeliveryNumber(organizationId: string): Promise<string> {
  const today = new Date()
  const year = today.getFullYear()
  const month = (today.getMonth() + 1).toString().padStart(2, '0')
  const day = today.getDate().toString().padStart(2, '0')

  const datePrefix = `DEL${year}${month}${day}`

  // Find the last delivery number for today
  const lastDelivery = await prisma.orderDelivery.findFirst({
    where: {
      organizationId,
      deliveryNumber: {
        startsWith: datePrefix
      }
    },
    orderBy: {
      deliveryNumber: 'desc'
    }
  })

  let sequence = 1
  if (lastDelivery) {
    const lastSequence = parseInt(lastDelivery.deliveryNumber.substring(11))
    sequence = lastSequence + 1
  }

  return `${datePrefix}${sequence.toString().padStart(4, '0')}`
}

// Create delivery for order
export async function createOrderDelivery(data: CreateDeliveryData) {
  try {
    // Generate delivery number
    const deliveryNumber = await generateDeliveryNumber(data.organizationId)

    // Get current order with order lines
    const order = await prisma.clientOrder.findFirst({
      where: {
        id: data.orderId,
        organizationId: data.organizationId
      },
      include: {
        orderLines: {
          include: {
            deliveryItems: true
          }
        }
      }
    })

    if (!order) {
      return {
        success: false,
        error: "Order not found"
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      // Create the delivery
      const delivery = await tx.orderDelivery.create({
        data: {
          orderId: data.orderId,
          deliveryNumber,
          deliveryAddress: data.deliveryAddress,
          deliveryNotes: data.deliveryNotes,
          recipientName: data.recipientName,
          recipientPhone: data.recipientPhone,
          isPartialDelivery: data.isPartialDelivery,
          deliveryFee: data.deliveryFee || 0,
          organizationId: data.organizationId,
          deliveredById: data.deliveredById,
          deliveryItems: {
            create: data.deliveryItems
          }
        },
        include: {
          deliveryItems: {
            include: {
              orderLine: {
                include: {
                  item: true
                }
              }
            }
          },
          deliveredBy: {
            select: {
              name: true,
              email: true
            }
          }
        }
      })

      // Update order line delivered quantities
      for (const deliveryItem of data.deliveryItems) {
        const orderLine = order.orderLines.find(ol => ol.id === deliveryItem.orderLineId)
        if (orderLine) {
          await tx.orderLine.update({
            where: { id: deliveryItem.orderLineId },
            data: {
              deliveredQuantity: orderLine.deliveredQuantity + deliveryItem.quantityDelivered
            }
          })
        }
      }

      // Check if all items are fully delivered
      const updatedOrder = await tx.clientOrder.findUnique({
        where: { id: data.orderId },
        include: {
          orderLines: true
        }
      })

      if (updatedOrder) {
        const allFullyDelivered = updatedOrder.orderLines.every(
          line => line.deliveredQuantity >= line.quantity
        )

        const someDelivered = updatedOrder.orderLines.some(
          line => line.deliveredQuantity > 0
        )

        let newStatus = updatedOrder.status
        if (allFullyDelivered) {
          newStatus = OrderStatus.DELIVERED
        } else if (someDelivered) {
          newStatus = OrderStatus.PARTIALLY_DELIVERED
        }

        if (newStatus !== updatedOrder.status) {
          await tx.clientOrder.update({
            where: { id: data.orderId },
            data: {
              status: newStatus,
              ...(newStatus === OrderStatus.DELIVERED && {
                completedDate: new Date(),
                deliveryDate: new Date()
              }),
              statusHistory: {
                create: {
                  fromStatus: updatedOrder.status,
                  toStatus: newStatus,
                  reason: "Delivery completed",
                  notes: `Delivery ${deliveryNumber} completed`,
                  changedById: data.deliveredById
                }
              }
            }
          })
        }
      }

      return delivery
    })

    revalidatePath("/dashboard/orders")

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

// Get deliveries for an order
export async function getOrderDeliveries(orderId: string, organizationId: string) {
  try {
    const deliveries = await prisma.orderDelivery.findMany({
      where: {
        orderId,
        organizationId
      },
      include: {
        deliveryItems: {
          include: {
            orderLine: {
              include: {
                item: true
              }
            }
          }
        },
        deliveredBy: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        deliveryDate: 'desc'
      }
    })

    return {
      success: true,
      data: deliveries
    }
  } catch (error) {
    console.error("Error fetching deliveries:", error)
    return {
      success: false,
      error: "Failed to fetch deliveries"
    }
  }
}

// Get all deliveries for organization
export async function getAllDeliveries(organizationId: string, filters?: {
  dateFrom?: Date
  dateTo?: Date
  searchTerm?: string
}) {
  try {
    const where: any = {
      organizationId
    }

    if (filters) {
      if (filters.dateFrom || filters.dateTo) {
        where.deliveryDate = {}
        if (filters.dateFrom) {
          where.deliveryDate.gte = filters.dateFrom
        }
        if (filters.dateTo) {
          where.deliveryDate.lte = filters.dateTo
        }
      }
      if (filters.searchTerm) {
        where.OR = [
          { deliveryNumber: { contains: filters.searchTerm, mode: 'insensitive' } },
          { recipientName: { contains: filters.searchTerm, mode: 'insensitive' } },
          { order: { customerName: { contains: filters.searchTerm, mode: 'insensitive' } } },
          { order: { orderNumber: { contains: filters.searchTerm, mode: 'insensitive' } } }
        ]
      }
    }

    const deliveries = await prisma.orderDelivery.findMany({
      where,
      include: {
        order: {
          select: {
            orderNumber: true,
            customerName: true,
            totalAmount: true
          }
        },
        deliveryItems: {
          include: {
            orderLine: {
              include: {
                item: {
                  select: {
                    name: true,
                    sku: true
                  }
                }
              }
            }
          }
        },
        deliveredBy: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        deliveryDate: 'desc'
      }
    })

    return {
      success: true,
      data: deliveries
    }
  } catch (error) {
    console.error("Error fetching deliveries:", error)
    return {
      success: false,
      error: "Failed to fetch deliveries"
    }
  }
}

// Update delivery information
export async function updateDelivery(
  deliveryId: string,
  organizationId: string,
  data: {
    deliveryAddress?: string
    deliveryNotes?: string
    recipientName?: string
    recipientPhone?: string
    deliveryFee?: number
  }
) {
  try {
    const delivery = await prisma.orderDelivery.update({
      where: {
        id: deliveryId,
        organizationId
      },
      data,
      include: {
        deliveryItems: {
          include: {
            orderLine: {
              include: {
                item: true
              }
            }
          }
        },
        deliveredBy: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    revalidatePath("/dashboard/orders")

    return {
      success: true,
      data: delivery,
      message: "Delivery updated successfully"
    }
  } catch (error) {
    console.error("Error updating delivery:", error)
    return {
      success: false,
      error: "Failed to update delivery"
    }
  }
}

// Get delivery analytics
export async function getDeliveryAnalytics(organizationId: string, dateFrom?: Date, dateTo?: Date) {
  try {
    const whereClause: any = {
      organizationId
    }

    if (dateFrom || dateTo) {
      whereClause.deliveryDate = {}
      if (dateFrom) {
        whereClause.deliveryDate.gte = dateFrom
      }
      if (dateTo) {
        whereClause.deliveryDate.lte = dateTo
      }
    }

    const [
      totalDeliveries,
      partialDeliveries,
      fullDeliveries,
      totalDeliveryFees
    ] = await Promise.all([
      prisma.orderDelivery.count({ where: whereClause }),
      prisma.orderDelivery.count({ where: { ...whereClause, isPartialDelivery: true } }),
      prisma.orderDelivery.count({ where: { ...whereClause, isPartialDelivery: false } }),
      prisma.orderDelivery.aggregate({
        where: whereClause,
        _sum: {
          deliveryFee: true
        }
      })
    ])

    return {
      success: true,
      data: {
        totalDeliveries,
        partialDeliveries,
        fullDeliveries,
        totalDeliveryFees: totalDeliveryFees._sum.deliveryFee || 0
      }
    }
  } catch (error) {
    console.error("Error fetching delivery analytics:", error)
    return {
      success: false,
      error: "Failed to fetch delivery analytics"
    }
  }
}