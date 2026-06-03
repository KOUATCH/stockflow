"use server"

import { prisma } from "@/prisma/db"
import { revalidatePath } from "next/cache"
import { OrderType, DeliveryMethod } from "@prisma/client"

export interface UpdateOrderData {
  id: string
  customerId?: string | null
  customerName: string
  customerEmail?: string
  customerPhone?: string
  customerAddress?: string
  orderType: OrderType
  deliveryMethod: DeliveryMethod
  expectedDate?: Date
  notes?: string
  specialInstructions?: string
  organizationId: string
  updatedById: string
  orderLines: {
    id?: string // undefined for new lines
    itemId: string
    itemName: string
    itemSku: string
    unitPrice: number
    quantity: number
    notes?: string
    specialRequirements?: string
  }[]
}

export async function updateOrder(data: UpdateOrderData) {
  try {
    // Verify the order exists and belongs to the organization
    const existingOrder = await prisma.clientOrder.findFirst({
      where: {
        id: data.id,
        organizationId: data.organizationId
      },
      include: {
        orderLines: true
      }
    })

    if (!existingOrder) {
      return {
        success: false,
        error: "Order not found or doesn't belong to this organization"
      }
    }

    // Check if order can be edited
    if (!['DRAFT', 'PENDING'].includes(existingOrder.status)) {
      return {
        success: false,
        error: `Order cannot be edited in ${existingOrder.status} status`
      }
    }

    // Handle customer - update or create if needed
    let customerId = data.customerId
    if (!customerId) {
      // Create a new customer
      const newCustomer = await prisma.customer.create({
        data: {
          name: data.customerName,
          email: data.customerEmail || null,
          phone: data.customerPhone || null,
          address: data.customerAddress || null,
          organizationId: data.organizationId,
          code: `CUST-${Date.now().toString(36).toUpperCase()}`
        }
      })
      customerId = newCustomer.id
    } else {
      // Verify the customer exists and belongs to the organization
      const customer = await prisma.customer.findFirst({
        where: {
          id: customerId,
          organizationId: data.organizationId
        }
      })

      if (!customer) {
        return {
          success: false,
          error: "Customer not found or doesn't belong to this organization"
        }
      }
    }

    // Calculate totals
    let subtotal = 0
    const orderLinesData = data.orderLines.map(line => {
      const lineSubtotal = line.quantity * line.unitPrice
      subtotal += lineSubtotal

      return {
        id: line.id,
        itemId: line.itemId,
        itemName: line.itemName,
        itemSku: line.itemSku,
        unitPrice: line.unitPrice,
        quantity: line.quantity,
        subtotal: lineSubtotal,
        totalAmount: lineSubtotal,
        notes: line.notes,
        specialRequirements: line.specialRequirements
      }
    })

    // Update the order in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Get existing order line IDs
      const existingLineIds = existingOrder.orderLines.map(line => line.id)
      const updatedLineIds = orderLinesData.filter(line => line.id).map(line => line.id!)
      const linesToDelete = existingLineIds.filter(id => !updatedLineIds.includes(id))

      // Delete removed lines
      if (linesToDelete.length > 0) {
        await tx.orderLine.deleteMany({
          where: {
            id: {
              in: linesToDelete
            }
          }
        })
      }

      // Update or create order lines
      for (const lineData of orderLinesData) {
        if (lineData.id) {
          // Update existing line
          await tx.orderLine.update({
            where: { id: lineData.id },
            data: {
              itemId: lineData.itemId,
              itemName: lineData.itemName,
              itemSku: lineData.itemSku,
              unitPrice: lineData.unitPrice,
              quantity: lineData.quantity,
              subtotal: lineData.subtotal,
              totalAmount: lineData.totalAmount,
              notes: lineData.notes,
              specialRequirements: lineData.specialRequirements
            }
          })
        } else {
          // Create new line
          await tx.orderLine.create({
            data: {
              orderId: data.id,
              itemId: lineData.itemId,
              itemName: lineData.itemName,
              itemSku: lineData.itemSku,
              unitPrice: lineData.unitPrice,
              quantity: lineData.quantity,
              subtotal: lineData.subtotal,
              totalAmount: lineData.totalAmount,
              notes: lineData.notes,
              specialRequirements: lineData.specialRequirements
            }
          })
        }
      }

      // Update the order
      const updatedOrder = await tx.clientOrder.update({
        where: { id: data.id },
        data: {
          customerId,
          customerName: data.customerName,
          customerEmail: data.customerEmail,
          customerPhone: data.customerPhone,
          customerAddress: data.customerAddress,
          orderType: data.orderType,
          deliveryMethod: data.deliveryMethod,
          expectedDate: data.expectedDate,
          notes: data.notes,
          specialInstructions: data.specialInstructions,
          subtotal,
          totalAmount: subtotal,
          updatedById: data.updatedById
        },
        include: {
          orderLines: {
            include: {
              item: true
            }
          },
          customer: true,
          statusHistory: true,
          payments: true
        }
      })

      return updatedOrder
    })

    revalidatePath("/dashboard/orders")
    revalidatePath(`/dashboard/orders/${data.id}`)

    return {
      success: true,
      data: result,
      message: `Order ${existingOrder.orderNumber} updated successfully`
    }
  } catch (error) {
    console.error("Error updating order:", error)
    return {
      success: false,
      error: "Failed to update order"
    }
  }
}