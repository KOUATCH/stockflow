"use server"

import { getAuthenticatedUser } from "@/lib/auth-server"
import { db } from "@/prisma/db"
import type {
  CreatePurchaseOrderPayload,
  OrderLineInput,
  PurchaseOrderResponse,
  PurchaseOrderWithRelations,
  UpdatePurchaseOrderDTO,
} from "@/types/purchase-orders-system-types"
import { Prisma, type GoodsReceiptStatus, type PurchaseOrderStatus } from "@prisma/client"
import { revalidatePath, revalidateTag } from "next/cache"

// ============================================================================
// UTILITY & CONSTANTS
// ============================================================================

const SORTABLE_FIELDS = ["createdAt", "orderDate", "expectedDeliveryDate", "status", "total", "orderNumber"] as const
type SortableFields = (typeof SORTABLE_FIELDS)[number]

// // Standard include clause for consistent relations - updated to include full supplier fields from your schema
// const standardInclude = {
//   supplier: {
//     select: {
//       id: true,
//       name: true,
//       code: true,
//       email: true,
//       phone: true,
//       contactPerson: true,
//       organizationId: true,
//       createdAt: true,
//       updatedAt: true,
//       address: true,
//       isActive: true,
//       taxId: true,
//       paymentTerms: true,
//       notes: true,
//     },
//   },
//   location: {
//     select: {
//       id: true,
//       name: true,
//       address: true,
//     },
//   },
//   createdBy: {
//     select: {
//       id: true,
//       name: true,
//       email: true,
//     },
//   },
//   approvedBy: {
//     select: {
//       id: true,
//       name: true,
//       email: true,
//     },
//   },
//   lines: {
//     select: {
//       id: true,
//       itemId: true,
//       orderedQuantity: true,
//       receivedQuantity: true,
//       unitCost: true,
//       discount: true,
//       taxRate: true,
//       taxAmount: true,
//       lineTotal: true,
//       notes: true,
//       item: {
//         select: {
//           id: true,
//           name: true,
//           sku: true,
//           description: true,
//           costPrice: true,
//           trackSerialNumbers: true,
//           trackBatches: true,
//           trackExpiry: true,
//         },
//       },
//     },
//     orderBy: { createdAt: "asc" as const },
//   },
//   organization: {
//     select: { id: true, name: true },
//   },
// } satisfies Prisma.PurchaseOrderInclude

export interface GoodsReceiptPayload {
  id: string
  organizationId: string
  receivedBy: string
  locationId?: string
  notes?: string
  items: {
    lineId: string
    receivedQuantity: number
    notes?: string
    serialNumbers?: string[]
    unitPrice?: number
    batchNumber?: string
    expiryDate?: string
  }[]
}

// Allowed status transitions (business rules)
const VALID_STATUS_TRANSITIONS: Record<PurchaseOrderStatus, PurchaseOrderStatus[]> = {
  DRAFT: ["SUBMITTED", "CANCELLED"],
  SUBMITTED: ["APPROVED", "CANCELLED"],
  APPROVED: ["CANCELLED"],
  // ORDERED: ["PARTIALLY_RECEIVED", "RECEIVED", "CANCELLED"],
  PARTIALLY_RECEIVED: ["RECEIVED", "CANCELLED"],
  RECEIVED: ["COMPLETED"],
  COMPLETED: [],
  CANCELLED: [],
}

function canTransition(from: PurchaseOrderStatus, to: PurchaseOrderStatus): boolean {
  return VALID_STATUS_TRANSITIONS[from]?.includes(to) ?? false
}

// ============================================================================
// CALCULATIONS & VALIDATION
// ============================================================================

/**
 * Calculates the total for a single purchase order line.
 */
const calculateLineTotals = (quantity: number, unitPrice: number, taxRate = 0, discount = 0) => {
  const totalPrice = quantity * unitPrice
  const taxAmount = (totalPrice * (taxRate || 0)) / 100
  const total = totalPrice + taxAmount - (discount || 0)
  return { totalPrice, taxAmount, total }
}

/**
 * Validates if the end date is on or after the start date.
 */
const validateDateRange = (startDate: string, endDate: string, fieldName: string): void => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  if (isNaN(start.getTime())) {
    throw new Error(`Invalid ${fieldName} start date format`)
  }
  if (isNaN(end.getTime())) {
    throw new Error(`Invalid ${fieldName} end date format`)
  }
  if (end < start) {
    throw new Error(`${fieldName} end date cannot be before start date`)
  }
}

/**
 * Ensures duplicate items are not present and validates integrity of order lines.
 */
const validateOrderLines = (orderLines: OrderLineInput[]): void => {
  if (!orderLines || orderLines.length === 0) {
    throw new Error("At least one line item is required")
  }

  const seen = new Map<string, number>()
  for (const [index, line] of orderLines.entries()) {
    const lineNumber = index + 1

    if (typeof line.itemId !== "string" || line.itemId.trim() === "") {
      throw new Error(`Item ID is required and must be a non-empty string for line item ${lineNumber}`)
    }
    if (!line.quantity || line.quantity <= 0) {
      throw new Error(`Quantity must be greater than 0 for line item ${lineNumber}`)
    }
    if (line.unitPrice === undefined || line.unitPrice === null || line.unitPrice < 0) {
      throw new Error(`Unit price is required and must be non-negative for line item ${lineNumber}`)
    }
    if (line.taxRate !== undefined && line.taxRate !== null && (line.taxRate < 0 || line.taxRate > 100)) {
      throw new Error(`Tax rate must be between 0 and 100 for line item ${lineNumber}`)
    }
    if (line.discount !== undefined && line.discount !== null && line.discount < 0) {
      throw new Error(`Discount cannot be negative for line item ${lineNumber}`)
    }

    seen.set(line.itemId, (seen.get(line.itemId) || 0) + 1)
  }

  const duplicates = [...seen.entries()].filter(([, count]) => count > 1)
  if (duplicates.length > 0) {
    throw new Error(`Duplicate items found in order lines: ${duplicates.map(([itemId]) => itemId).join(", ")}`)
  }
}

/**
 * Calculates the overall totals for a purchase order based on its lines and shipping cost.
 */
const calculateOrderTotals = (orderLines: OrderLineInput[], shippingCost = 0) => {
  let subtotal = 0
  let taxAmount = 0
  let discount = 0

  for (const line of orderLines) {
    const {
      totalPrice: lineSubTotal,
      taxAmount: lineTaxAmount,
      total: lineTotal,
    } = calculateLineTotals(line.quantity, line?.unitPrice, line.taxRate, line.discount)
    subtotal += lineSubTotal
    taxAmount += lineTaxAmount
    discount += line.discount || 0
  }

  const total = subtotal + taxAmount + (shippingCost || 0) - discount
  return { subtotal, taxAmount, discount, total }
}

/**
 * Generates a new PO number based on the last existing PO for the organization.
 */
const generateNextPONumber = async (organizationId: string): Promise<string> => {
  const lastPO = await db.purchaseOrder.findFirst({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
    select: { orderNumber: true },
  })
  const lastNumber = lastPO ? Number.parseInt((lastPO.orderNumber || "").replace("PO-", ""), 10) : Number.NaN
  const nextNumber = Number.isFinite(lastNumber) ? lastNumber + 1 : 1
  return `PO-${nextNumber.toString().padStart(6, "0")}`
}

/**
 * Builds a Prisma OR filter for searching across multiple fields in Purchase Orders.
 * Enhanced: adds supplier.code, city, state, country.
 */
const buildSearchFilter = (searchTerm: string): Prisma.PurchaseOrderWhereInput["OR"] => [
  { orderNumber: { contains: searchTerm, mode: "insensitive" } },
  { notes: { contains: searchTerm, mode: "insensitive" } },
  { paymentTerms: { contains: searchTerm, mode: "insensitive" } },
  {
    supplier: {
      is: {
        OR: [
          { name: { contains: searchTerm, mode: "insensitive" } },
          { email: { contains: searchTerm, mode: "insensitive" } },
        ],
      },
    },
  },
  {
    location: {
      is: {
        name: { contains: searchTerm, mode: "insensitive" },
      },
    },
  },
  {
    lines: {
      some: {
        item: {
          OR: [
            { name: { contains: searchTerm, mode: "insensitive" } },
            { sku: { contains: searchTerm, mode: "insensitive" } },
          ],
        },
      },
    },
  },
]

/**
 * Updates inventory levels when goods are received
 */
const updateInventoryLevels = async (
  tx: Prisma.TransactionClient,
  itemId: string,
  locationId: string,
  receivedQuantity: number,
  unitPrice: number,
  organizationId: string,
) => {
  const existingInventory = await tx.inventoryLevel.findFirst({
    where: { itemId, locationId },
  })

  if (existingInventory) {
    const newQuantity = existingInventory.quantityOnHand + receivedQuantity
    const newTotalValue = existingInventory.totalValue + receivedQuantity * unitPrice
    const newAverageCost = newTotalValue / (newQuantity || 1)

    await tx.inventoryLevel.update({
      where: { id: existingInventory.id },
      data: {
        quantityOnHand: newQuantity,
        quantityAvailable: newQuantity - existingInventory.quantityReserved,
        totalValue: newTotalValue,
        averageCost: newAverageCost,
        lastTransactionAt: new Date(),
        updatedAt: new Date(),
      },
    })
  } else {
    await tx.inventoryLevel.create({
      data: {
        itemId,
        locationId,
        // organizationId,
        quantityOnHand: receivedQuantity,
        quantityReserved: 0,
        quantityAvailable: receivedQuantity,
        quantityInTransit: 0,
        quantityOnOrder: 0,
        totalValue: receivedQuantity * unitPrice,
        averageCost: unitPrice,
        lastTransactionAt: new Date(),
      },
    })
  }

  await tx.inventoryTransaction.create({
    data: {
      itemId,
      locationId,
      organizationId,
      type: "PURCHASE_RECEIPT",
      quantity: receivedQuantity,
      unitCost: unitPrice,
      totalCost: receivedQuantity * unitPrice,
      notes: "Goods received - PO receiving",
      referenceType: "PURCHASE_ORDER",
      balanceAfter: 0,
      createdAt: new Date(),
    },
  })
}

// ============================================================================
// CORE FUNCTIONS (ENHANCED)
// ============================================================================

type PrismaResult = Prisma.PurchaseOrderGetPayload<{
  include: typeof standardInclude
}>

// function transformPurchaseOrder(po: PrismaResult): PurchaseOrderWithRelations {
//   return {
//     id: po.id,
//     orderNumber: po.orderNumber,
//     status: po.status as PurchaseOrderWithRelations["status"],
//     orderDate: po.orderDate,
//     expectedDeliveryDate: po.expectedDeliveryDate,
//     paymentTerms: po.paymentTerms,
//     notes: po.notes,
//     subtotal: po.subtotal || 0,
//     taxAmount: po.taxAmount || 0,
//     shippingCost: po.shippingCost || 0,
//     discount: po.discount || 0,
//     total: po.total || 0,
//     supplier: po.supplier,
//     location: po.location,
//     organization: po.organization,
//     createdBy: po.createdBy,
//     approvedBy: po.approvedBy,
//     lines: po.lines.map((line) => ({
//       id: line.id,
//       itemId: line.itemId,
//       orderedQuantity: line.orderedQuantity,
//       receivedQuantity: line.receivedQuantity || 0,
//       unitCost: line.unitCost,
//       discount: line.discount || 0,
//       taxRate: line.taxRate || 0,
//       taxAmount: line.taxAmount || 0,
//       lineTotal: line.lineTotal,
//       notes: line.notes,
//       item: line.item,
//     })),
//     createdAt: po.createdAt,
//     updatedAt: po.updatedAt,
//   }
// }

// export async function getOrgPurchaseOrders(
//   organizationId: string,
// ): Promise<PurchaseOrderResponse<PurchaseOrderWithRelations[]>> {

//   try {
//        const user= await getAuthenticatedUser()
//        const userOrdID= user.organizationId
//     if (!userOrdID) {
//       throw new Error("Organization ID is required")
//     }

//     const purchaseOrders = await db.purchaseOrder.findMany({
//       where: {
//         organizationId:userOrdID,
//       },
//       include: standardInclude,
//     })

//     const transformedData = purchaseOrders.map(transformPurchaseOrder)

//     return {
//       data: transformedData,
//       success: true,
//       error: null,
//     }
//   } catch (error) {
//     console.error("Error fetching purchase orders:", error)
//     return {
//       data: [],
//       success: false,
//       error: error instanceof Error ? error.message : "Failed to fetch purchase orders. Please try again.",
//     }
//   }
// }

// /**
//  * Fetches purchase orders by org ID and location ID.
//  */
// export async function getOrgPurchaseOrderBYLocationId(organizationId: string, locationId: string): Promise<PurchaseOrderResponse<PurchaseOrderWithRelations[]>> {
//   try {
//     const user = await getAuthenticatedUser()
//     const userOrgId = user.organizationId

//     if (!userOrgId) {
//       throw new Error("Organization ID is required")
//     }

//     if (!locationId) {
//       throw new Error("Location ID is required")
//     }

//     const purchaseOrders = await db.purchaseOrder.findMany({
//       where: {
//         organizationId: userOrgId,
//         locationId: locationId,
//       },
//       include: standardInclude,
//       orderBy: {
//         createdAt: 'desc'
//       }
//     })

//     const transformedData = purchaseOrders.map(transformPurchaseOrder)

//     return {
//       data: transformedData,
//       success: true,
//       error: null,
//     }
//   } catch (error) {
//     console.error("Error fetching purchase orders by location:", error)
//     return {
//       data: [],
//       success: false,
//       error: error instanceof Error ? error.message : "Failed to fetch purchase orders. Please try again.",
//     }
//   }
// }

// Standard include clause for consistent relations
const standardInclude = {
  supplier: {
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      contactPerson: true,
    },
  },
  location: {
    select: {
      id: true,
      name: true,
      address: true,
    },
  },
  createdBy: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  approvedBy: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  lines: {
    select: {
      id: true,
      itemId: true,
      orderedQuantity: true,
      receivedQuantity: true,
      unitCost: true,
      discount: true,
      taxRate: true,
      taxAmount: true,
      lineTotal: true,
      notes: true,
      item: {
        select: {
          id: true,
          name: true,
          sku: true,
          description: true,
          costPrice: true,
        },
      },
    },
    orderBy: { createdAt: "asc" as const },
  },
  organization: {
    select: { id: true, name: true },
  },
} satisfies Prisma.PurchaseOrderInclude

function transformPurchaseOrder(po: any): PurchaseOrderWithRelations {
  return {
    id: po.id,
    orderNumber: po.orderNumber,
    status: po.status,
    orderDate: po.orderDate,
    expectedDeliveryDate: po.expectedDeliveryDate,
    paymentTerms: po.paymentTerms,
    notes: po.notes,
    subtotal: po.subtotal || 0,
    taxAmount: po.taxAmount || 0,
    shippingCost: po.shippingCost || 0,
    discount: po.discount || 0,
    total: po.total || 0,
    supplier: po.supplier,
    location: po.location,
    organization: po.organization,
    createdBy: po.createdBy,
    approvedBy: po.approvedBy,
    lines: po.lines?.map((line: any) => ({
      id: line.id,
      itemId: line.itemId,
      orderedQuantity: line.orderedQuantity,
      receivedQuantity: line.receivedQuantity || 0,
      unitCost: line.unitCost,
      discount: line.discount || 0,
      taxRate: line.taxRate || 0,
      taxAmount: line.taxAmount || 0,
      lineTotal: line.lineTotal,
      notes: line.notes,
      item: line.item,
    })) || [],
    createdAt: po.createdAt,
    updatedAt: po.updatedAt,
  }
}

export async function getOrgPurchaseOrders(organizationId: string) {
  try {
    const user = await getAuthenticatedUser()
    if (!user.organizationId) {
      throw new Error("User not authenticated or organization not found")
    }

    // Use the authenticated user's organization ID for security
    const userOrgId = user.organizationId

    const purchaseOrders = await db.purchaseOrder.findMany({
      where: {
        organizationId: userOrgId,
      },
      include: standardInclude,
      orderBy: {
        createdAt: 'desc'
      },
      take: 50 // Limit for performance
    })

    const transformedData = purchaseOrders.map(transformPurchaseOrder)

    return {
      success: true,
      data: transformedData,
      error: null,
    }
  } catch (error) {
    console.error("Error fetching purchase orders:", error)
    return {
      success: false,
      data: [],
      error: error instanceof Error ? error.message : "Failed to fetch purchase orders",
    }
  }
}

export async function getOrgPurchaseOrderBYLocationId(organizationId: string, locationId: string) {
  try {
    const user = await getAuthenticatedUser()
    if (!user.organizationId) {
      throw new Error("User not authenticated or organization not found")
    }

    // Use the authenticated user's organization ID for security
    const userOrgId = user.organizationId

    if (!locationId) {
      throw new Error("Location ID is required")
    }

    const purchaseOrders = await db.purchaseOrder.findMany({
      where: {
        organizationId: userOrgId,
        locationId: locationId,
      },
      include: standardInclude,
      orderBy: {
        createdAt: 'desc'
      },
      take: 50 // Limit for performance
    })

    const transformedData = purchaseOrders.map(transformPurchaseOrder)

    return {
      success: true,
      data: transformedData,
      error: null,
    }
  } catch (error) {
    console.error("Error fetching purchase orders by location:", error)
    return {
      success: false,
      data: [],
      error: error instanceof Error ? error.message : "Failed to fetch purchase orders",
    }
  }
}

/**
 * Fetches a single purchase order by its ID.
 */
export async function getOrgPurchaseOrderById(id: string, organizationId?: string) {
  try {
    if (!id) {
      throw new Error("Purchase order ID is required")
    }

    const where: Prisma.PurchaseOrderWhereInput = { id }
    if (organizationId) {
      where.organizationId = organizationId
    }

    const purchaseOrder = await db.purchaseOrder.findFirst({
      where,
      include: standardInclude,
    })

    if (!purchaseOrder) {
      throw new Error("Purchase Order not found")
    }

    return purchaseOrder
  } catch (error) {
    console.error("Error fetching purchase order:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to fetch purchase order")
  }
}

/**
 * Creates a new purchase order.
 */
export async function createPurchaseOrder(
  data: CreatePurchaseOrderPayload,
): Promise<PurchaseOrderResponse<PurchaseOrderWithRelations>> {
  try {
    const user = await getAuthenticatedUser()
    data.createdBy = user?.id || data.createdBy

    if (!data) throw new Error("Purchase order data is required")
    if (!data.supplierId) throw new Error("Supplier is required")
    if (!data.locationId) throw new Error("Delivery location is required")
    if (!data.organizationId) throw new Error("Organization ID is required")
    if (!data.date) throw new Error("Order date is required")
    if (!data.expectedDeliveryDate) throw new Error("Expected delivery date is required")
    if (!data?.createdBy) throw new Error("Created by user ID is required")

    validateDateRange(data.date, data.expectedDeliveryDate, "Order")
    validateOrderLines(data.orderLines)

    const supplier = await db.supplier.findFirst({
      where: { id: data.supplierId, organizationId: data.organizationId },
    })
    if (!supplier) throw new Error("Supplier not found or does not belong to your organization")

    const location = await db.location.findFirst({
      where: { id: data.locationId, organizationId: data.organizationId },
    })
    if (!location) throw new Error("Delivery location not found or does not belong to your organization")

    const itemIds = data.orderLines.map((line) => line.itemId)
    const items = await db.item.findMany({
      where: { id: { in: itemIds }, organizationId: data.organizationId },
      select: { id: true },
    })
    if (items.length !== itemIds.length) {
      throw new Error("One or more items not found or do not belong to your organization")
    }

    const orderNumber = await generateNextPONumber(data.organizationId)
    const shippingCost = data.shippingCost || 0
    const calculatedTotals = calculateOrderTotals(data.orderLines, shippingCost)

    const purchaseOrder = await db.$transaction(async (tx) => {
      return await tx.purchaseOrder.create({
        data: {
          orderNumber,
          organizationId: data.organizationId,
          orderDate: new Date(data.date),
          supplierId: data.supplierId,
          locationId: data.locationId,
          expectedDeliveryDate: new Date(data.expectedDeliveryDate),
          paymentTerms: data.paymentTerms || "Net 30 days",
          notes: data.notes || "",
          subtotal: calculatedTotals.subtotal,
          taxAmount: calculatedTotals.taxAmount,
          shippingCost,
          discount: calculatedTotals.discount,
          total: calculatedTotals.total,
          status: "DRAFT",
          createdById: data.createdBy,
          lines: {
            create: data.orderLines.map((line) => {
              const { taxAmount: lineTaxAmount, total: lineTotal } = calculateLineTotals(
                line.quantity,
                line.unitPrice,
                line.taxRate,
                line.discount,
              )
              return {
                itemId: line.itemId,
                orderedQuantity: line.quantity,
                unitCost: line.unitPrice,
                discount: line.discount || 0,
                taxRate: line.taxRate || 0,
                taxAmount: lineTaxAmount,
                lineTotal: lineTotal,
                notes: line.notes || "",
                receivedQuantity: 0,
              }
            }),
          },
        },
        include: standardInclude,
      })
    })

    revalidateTag("purchaseOrders")
    revalidateTag(`purchaseOrders-${data.organizationId}`)
    revalidatePath("/dashboard/purchase-orders")

    return { success: true, data: purchaseOrder, error: `Purchase order ${orderNumber} created successfully` }
  } catch (error) {
    console.error("Error creating purchase order:", error)
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") throw new Error("A purchase order with this number already exists")
      if (error.code === "P2003") throw new Error("Referenced record not found")
      throw new Error(`Database error: ${error.message}`)
    }
    throw new Error(error instanceof Error ? error.message : "Failed to create purchase order. Please try again.")
  }
}

/**
 * Updates an existing purchase order.
 */
export async function updatePurchaseOrder(
  data: UpdatePurchaseOrderDTO,
): Promise<PurchaseOrderResponse<PurchaseOrderWithRelations>> {
  try {
    if (!data.id) throw new Error("Purchase order ID is required")
    if (!data.organizationId) throw new Error("Organization ID is required")

    const existingPO = await db.purchaseOrder.findFirst({
      where: { id: data.id, organizationId: data.organizationId },
      include: standardInclude,
    })
    if (!existingPO) throw new Error("Purchase order not found or you don't have permission to update it")

    const nonEditableStatuses: PurchaseOrderStatus[] = ["APPROVED", "RECEIVED", "CANCELLED", "COMPLETED"]
    if (nonEditableStatuses.includes(existingPO.status)) {
      throw new Error(`Cannot update purchase order with status: ${existingPO.status}`)
    }

    if (data.date && data.expectedDeliveryDate) {
      validateDateRange(data.date, data.expectedDeliveryDate, "Order")
    } else if (data.date && !data.expectedDeliveryDate && existingPO.expectedDeliveryDate) {
      validateDateRange(data.date, existingPO.expectedDeliveryDate.toISOString().slice(0, 10), "Order")
    } else if (!data.date && data.expectedDeliveryDate) {
      validateDateRange(existingPO.orderDate.toISOString().slice(0, 10), data.expectedDeliveryDate, "Order")
    }

    if (data.supplierId) {
      const supplier = await db.supplier.findFirst({
        where: { id: data.supplierId, organizationId: data.organizationId },
      })
      if (!supplier) throw new Error("Supplier not found or does not belong to your organization")
    }

    if (data.locationId) {
      const location = await db.location.findFirst({
        where: { id: data.locationId, organizationId: data.organizationId },
      })
      if (!location) throw new Error("Delivery location not found or does not belong to your organization")
    }

    let calculatedTotals = { subtotal: 0, taxAmount: 0, discount: 0, total: 0 }

    if (data.orderLines) {
      if (data.orderLines.length > 0) {
        const itemIds = data.orderLines.map((line) => line.itemId).filter(Boolean) as string[]
        validateOrderLines(data.orderLines)
        if (itemIds.length !== data.orderLines.length) {
          throw new Error("All order lines must have a valid itemId")
        }

        const items = await db.item.findMany({
          where: { id: { in: itemIds }, organizationId: data.organizationId },
          select: { id: true },
        })
        if (items.length !== itemIds.length) {
          const foundItemIds = items.map((item) => item.id)
          const missingItemIds = itemIds.filter((id) => !foundItemIds.includes(id))
          throw new Error(`Items not found or do not belong to your organization: ${missingItemIds.join(", ")}`)
        }

        calculatedTotals = calculateOrderTotals(data.orderLines, data.shippingCost || 0)
      } else {
        calculatedTotals = { subtotal: 0, taxAmount: 0, discount: 0, total: data.shippingCost || 0 }
      }
    } else {
      calculatedTotals = {
        subtotal: existingPO.subtotal,
        taxAmount: existingPO.taxAmount,
        discount: existingPO.discount,
        total: existingPO.total,
      }
    }

    const purchaseOrder = await db.$transaction(async (tx) => {
      await tx.purchaseOrder.update({
        where: { id: data.id },
        data: {
          orderDate: data.date ? new Date(data.date) : undefined,
          supplierId: data.supplierId,
          locationId: data.locationId,
          expectedDeliveryDate: data.expectedDeliveryDate ? new Date(data.expectedDeliveryDate) : undefined,
          paymentTerms: data.paymentTerms,
          notes: data.notes,
          subtotal: calculatedTotals.subtotal,
          taxAmount: calculatedTotals.taxAmount,
          shippingCost: data.shippingCost ?? existingPO.shippingCost,
          discount: calculatedTotals.discount,
          total: calculatedTotals.total,
          updatedAt: new Date(),
        },
      })

      if (data.orderLines) {
        await tx.purchaseOrderLine.deleteMany({ where: { purchaseOrderId: data.id } })

        if (data.orderLines.length > 0) {
          const orderLinesToCreate = data.orderLines.map((line) => {
            const { taxAmount: lineTaxAmount, total: lineTotal } = calculateLineTotals(
              line.quantity,
              line?.unitPrice,
              line.taxRate,
              line.discount,
            )
            return {
              purchaseOrderId: data.id,
              itemId: line.itemId,
              orderedQuantity: line.quantity,
              unitCost: line.unitPrice,
              discount: line.discount || 0,
              taxRate: line.taxRate || 0,
              taxAmount: lineTaxAmount,
              lineTotal: lineTotal,
              notes: line.notes || "",
              receivedQuantity: 0, // never set to ordered qty when editing
            }
          })

          await tx.purchaseOrderLine.createMany({ data: orderLinesToCreate })
        }
      }

      return await tx.purchaseOrder.findUnique({ where: { id: data.id }, include: standardInclude })
    })

    revalidateTag("purchaseOrders")
    revalidateTag(`purchaseOrders-${data.organizationId}`)
    revalidateTag(`purchaseOrder-${data.id}`)
    revalidatePath("/dashboard/purchase-orders")
    revalidatePath(`/dashboard/purchase-orders/${data.id}`)

    return {
      success: true,
      data: purchaseOrder!,
      error: `Purchase order ${existingPO.orderNumber} updated successfully`,
    }
  } catch (error) {
    console.error("Error updating purchase order:", error)
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") throw new Error("Purchase order not found")
      if (error.code === "P2003") throw new Error("Referenced record not found")
      throw new Error(`Database error: ${error.message}`)
    }
    throw new Error(error instanceof Error ? error.message : "Failed to update purchase order. Please try again.")
  }
}

/**
 * Deletes a purchase order.
 */
export async function deletePurchaseOrder(id: string, organizationId: string): Promise<PurchaseOrderResponse<null>> {
  try {
    if (!id) throw new Error("Purchase order ID is required")
    if (!organizationId) throw new Error("Organization ID is required")

    const existingPO = await db.purchaseOrder.findFirst({
      where: { id, organizationId },
      select: { id: true, status: true, orderNumber: true },
    })
    if (!existingPO) throw new Error("Purchase order not found or you don't have permission to delete it")

    const nonDeletableStatuses: PurchaseOrderStatus[] = ["RECEIVED", "PARTIALLY_RECEIVED", "COMPLETED"]
    if (nonDeletableStatuses.includes(existingPO.status)) {
      throw new Error(`Cannot delete purchase order with status: ${existingPO.status}`)
    }

    await db.$transaction(async (tx) => {
      await tx.purchaseOrderLine.deleteMany({ where: { purchaseOrderId: id } })
      await tx.purchaseOrder.delete({ where: { id } })
    })

    revalidateTag("purchaseOrders")
    revalidateTag(`purchaseOrders-${organizationId}`)
    revalidatePath("/dashboard/purchase-orders")

    return { success: true, error: `Purchase order ${existingPO.orderNumber} deleted successfully`, data: null }
  } catch (error) {
    console.error("Error deleting purchase order:", error)
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") throw new Error("Purchase order not found")
      throw new Error(`Database error: ${error.message}`)
    }
    throw new Error(error instanceof Error ? error.message : "Failed to delete purchase order. Please try again.")
  }
}

/**
 * Submits a purchase order for approval.
 */
export async function submitPurchaseOrder(
  id: string,
  organizationId: string,
): Promise<PurchaseOrderResponse<PurchaseOrderWithRelations>> {
  try {
    if (!id) throw new Error("Purchase order ID is required")
    if (!organizationId) throw new Error("Organization ID is required")

    const existingPO = await db.purchaseOrder.findFirst({ where: { id, organizationId }, include: standardInclude })
    if (!existingPO) throw new Error("Purchase order not found or you don't have permission to submit it")
    if (!existingPO.lines || existingPO.lines.length === 0) {
      throw new Error("Cannot submit purchase order without line items")
    }
    if (existingPO.status !== "DRAFT") {
      throw new Error(`Cannot submit purchase order with status: ${existingPO.status}`)
    }

    const updatedPO = await db.purchaseOrder.update({
      where: { id },
      data: { status: "SUBMITTED", updatedAt: new Date() },
      include: standardInclude,
    })

    revalidateTag("purchaseOrders")
    revalidateTag(`purchaseOrders-${organizationId}`)
    revalidateTag(`purchaseOrder-${id}`)
    revalidatePath("/dashboard/purchase-orders")
    revalidatePath(`/dashboard/purchase-orders/${id}`)

    return {
      success: true,
      data: updatedPO,
      error: `Purchase order ${existingPO.orderNumber} submitted for approval`,
    }
  } catch (error) {
    console.error("Error submitting purchase order:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to submit purchase order")
  }
}

/**
 * Approves a purchase order.
 */
export async function approvePurchaseOrder(
  id: string,
  organizationId: string,
  approvedById: string,
): Promise<PurchaseOrderResponse<PurchaseOrderWithRelations>> {
  try {
    if (!id) throw new Error("Purchase order ID is required")
    if (!organizationId) throw new Error("Organization ID is required")
    if (!approvedById) throw new Error("Approved by user ID is required")

    const existingPO = await db.purchaseOrder.findFirst({ where: { id, organizationId }, include: standardInclude })
    if (!existingPO) throw new Error("Purchase order not found or you don't have permission to approve it")
    if (existingPO.status !== "SUBMITTED") {
      throw new Error(`Cannot approve purchase order with status: ${existingPO.status}`)
    }

    const updatedPO = await db.purchaseOrder.update({
      where: { id },
      data: { status: "APPROVED", approvedById, approvedAt: new Date(), updatedAt: new Date() },
      include: standardInclude,
    })

    revalidateTag("purchaseOrders")
    revalidateTag(`purchaseOrders-${organizationId}`)
    revalidateTag(`purchaseOrder-${id}`)
    revalidatePath("/dashboard/purchase-orders")
    revalidatePath(`/dashboard/purchase-orders/${id}`)

    return { success: true, data: updatedPO, error: `Purchase order ${existingPO.orderNumber} approved successfully` }
  } catch (error) {
    console.error("Error approving purchase order:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to approve purchase order")
  }
}

/**
 * Cancels a purchase order.
 */
export async function cancelPurchaseOrder(
  id: string,
  organizationId: string,
  reason?: string,
): Promise<PurchaseOrderResponse<PurchaseOrderWithRelations>> {
  try {
    if (!id) throw new Error("Purchase order ID is required")
    if (!organizationId) throw new Error("Organization ID is required")

    const existingPO = await db.purchaseOrder.findFirst({ where: { id, organizationId }, include: standardInclude })
    if (!existingPO) throw new Error("Purchase order not found or you don't have permission to cancel it")

    const nonCancellableStatuses: PurchaseOrderStatus[] = ["RECEIVED", "COMPLETED", "CANCELLED"]
    if (nonCancellableStatuses.includes(existingPO.status)) {
      throw new Error(`Cannot cancel purchase order with status: ${existingPO.status}`)
    }

    const updatedPO = await db.purchaseOrder.update({
      where: { id },
      data: {
        status: "CANCELLED",
        notes: reason ? `${existingPO.notes || ""}\n\nCancellation reason: ${reason}` : existingPO.notes,
        updatedAt: new Date(),
      },
      include: standardInclude,
    })

    revalidateTag("purchaseOrders")
    revalidateTag(`purchaseOrders-${organizationId}`)
    revalidateTag(`purchaseOrder-${id}`)
    revalidatePath("/dashboard/purchase-orders")
    revalidatePath(`/dashboard/purchase-orders/${id}`)

    return {
      success: true,
      data: updatedPO,
      error: `Purchase order ${existingPO.orderNumber} cancelled successfully`,
    }
  } catch (error) {
    console.error("Error cancelling purchase order:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to cancel purchase order")
  }
}


/**
 * Closes/completes a purchase order.
 */
export async function closePurchaseOrder(
  id: string,
  organizationId?: string,
): Promise<PurchaseOrderResponse<PurchaseOrderWithRelations>> {
  try {
    if (!id) throw new Error("Purchase order ID is required")

    const whereClause = organizationId ? { id, organizationId } : { id }

    const existingPO = await db.purchaseOrder.findFirst({
      where: whereClause,
      include: standardInclude,
    })

    if (!existingPO) throw new Error("Purchase order not found")

    if (existingPO.status !== "RECEIVED") {
      throw new Error(
        `Cannot close purchase order with status: ${existingPO.status}. Only RECEIVED orders can be closed.`,
      )
    }

    const updatedPO = await db.purchaseOrder.update({
      where: { id },
      data: { status: "COMPLETED", updatedAt: new Date() },
      include: standardInclude,
    })

    revalidateTag("purchaseOrders")
    if (organizationId) {
      revalidateTag(`purchaseOrders-${organizationId}`)
    }
    revalidateTag(`purchaseOrder-${id}`)
    revalidatePath("/dashboard/purchase-orders")

    return { success: true, data: updatedPO, error: "Purchase order completed successfully" }
  } catch (error) {
    console.error("Error closing purchase order:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to close purchase order")
  }
}

/**
 * Receives items for a purchase order and creates goods receipt records.
 * Enhanced: serial/batch validation + inventory updates
 */
export async function receiveItems(
  data: GoodsReceiptPayload,
): Promise<PurchaseOrderResponse<PurchaseOrderWithRelations>> {
  try {
    if (!data.id) throw new Error("Purchase order ID is required")
    if (!data.organizationId) throw new Error("Organization ID is required")
    if (!data.receivedBy) throw new Error("Received by user ID is required")
    if (!data.items || data.items.length === 0) throw new Error("At least one item must be received")

    for (const [index, item] of data.items.entries()) {
      if (!item.lineId) throw new Error(`Line ID is required for item ${index + 1}`)
      if (item.receivedQuantity <= 0) throw new Error(`Received quantity must be greater than 0 for item ${index + 1}`)
      // basic serial uniqueness within payload
      if (item.serialNumbers && new Set(item.serialNumbers).size !== item.serialNumbers.length) {
        throw new Error(`Duplicate serial numbers found in item ${index + 1}`)
      }
    }

    const existingPO = await db.purchaseOrder.findFirst({
      where: { id: data.id, organizationId: data.organizationId },
      include: {
        ...standardInclude,
        lines: {
          include: {
            item: {
              select: {
                id: true,
                name: true,
                trackSerialNumbers: true,
                trackBatches: true,
                trackExpiry: true,
              },
            },
          },
        },
      },
    })
    if (!existingPO) throw new Error("Purchase order not found or you don't have permission to receive items")

    // Allow receiving for APPROVED, ORDERED, or PARTIALLY_RECEIVED
    if (!["APPROVED", "PARTIALLY_RECEIVED"].includes(existingPO.status)) {
      throw new Error(`Cannot receive items for purchase order with status: ${existingPO.status}`)
    }

    const lineIds = data.items.map((i) => i.lineId)
    const existingLines = await db.purchaseOrderLine.findMany({
      where: { id: { in: lineIds }, purchaseOrderId: data.id },
      include: { item: true },
    })
    if (existingLines.length !== lineIds.length) throw new Error("One or more line items not found")

    // Validate received quantities + serial/batch business rules
    for (const receiveItem of data.items) {
      const line = existingLines.find((l) => l.id === receiveItem.lineId)
      if (!line) continue
      const remainingToReceive = line.orderedQuantity - (line.receivedQuantity || 0)
      if (receiveItem.receivedQuantity > remainingToReceive) {
        throw new Error(
          `Cannot receive ${receiveItem.receivedQuantity} of ${line.item.name}. Only ${remainingToReceive} remaining to receive.`,
        )
      }

      if ((line.item as any)?.trackSerialNumbers) {
        if (!receiveItem.serialNumbers || receiveItem.serialNumbers.length !== receiveItem.receivedQuantity) {
          throw new Error(`Serial numbers required and must match received quantity for ${line.item.name}`)
        }
      }
      if ((line.item as any)?.trackBatches) {
        if (!receiveItem.batchNumber) {
          throw new Error(`Batch number is required for ${line.item.name}`)
        }
      }
      if ((line.item as any)?.trackExpiry) {
        if (!receiveItem.expiryDate) {
          throw new Error(`Expiry date is required for ${line.item.name}`)
        }
        const exp = new Date(receiveItem.expiryDate)
        if (isNaN(exp.getTime())) {
          throw new Error(`Invalid expiry date for ${line.item.name}`)
        }
      }
    }

    // Generate goods receipt number
    const lastReceipt = await db.goodsReceipt.findFirst({
      where: { organizationId: data.organizationId },
      orderBy: { createdAt: "desc" },
      select: { receiptNumber: true },
    })
    const nextNumber = lastReceipt ? Number.parseInt(lastReceipt.receiptNumber.replace("GR-", "")) + 1 : 1
    const receiptNumber = `GR-${nextNumber.toString().padStart(6, "0")}`

    const result = await db.$transaction(async (tx) => {
      const goodsReceipt = await tx.goodsReceipt.create({
        data: {
          receiptNumber,
          receiptDate: new Date(),
          purchaseOrderId: data.id,
          locationId: data.locationId || existingPO.locationId,
          status: "RECEIVED" as GoodsReceiptStatus,
          notes: data.notes || "",
          organizationId: data.organizationId,
          receivedById: data.receivedBy,
        },
      })

      for (const receiveItem of data.items) {
        const line = existingLines.find((l) => l.id === receiveItem.lineId)!
        const unitCost = receiveItem.unitPrice ?? line.unitCost

        await tx.goodsReceiptLine.create({
          data: {
            goodsReceiptId: goodsReceipt.id,
            purchaseOrderLineId: line.id,
            itemId: line.itemId,
            receivedQuantity: receiveItem.receivedQuantity,
            unitCost,
            lineTotal: unitCost * receiveItem.receivedQuantity,
            notes: receiveItem.notes || "",
            serialNumbers: receiveItem.serialNumbers || [],
            batchNumber: receiveItem.batchNumber || null,
            expiryDate: receiveItem.expiryDate ? new Date(receiveItem.expiryDate) : null,
          },
        })

        // Update line received
        await tx.purchaseOrderLine.update({
          where: { id: line.id },
          data: { receivedQuantity: (line.receivedQuantity || 0) + receiveItem.receivedQuantity },
        })

        // Update inventory
        await updateInventoryLevels(
          tx,
          line.itemId,
          data.locationId || existingPO.locationId,
          receiveItem.receivedQuantity,
          unitCost,
          data.organizationId,
        )
      }

      // Recompute PO status
      const allLines = await tx.purchaseOrderLine.findMany({ where: { purchaseOrderId: data.id } })
      const totalOrdered = allLines.reduce((sum, l) => sum + l.orderedQuantity, 0)
      const totalReceived = allLines.reduce((sum, l) => sum + (l.receivedQuantity || 0), 0)
      let newStatus = existingPO.status
      if (totalReceived >= totalOrdered) newStatus = "RECEIVED"
      else if (totalReceived > 0) newStatus = "PARTIALLY_RECEIVED"

      if (newStatus !== existingPO.status) {
        await tx.purchaseOrder.update({
          where: { id: data.id },
          data: { status: newStatus, updatedAt: new Date() },
        })
      }

      return await tx.purchaseOrder.findUnique({ where: { id: data.id }, include: standardInclude })
    })

    // Cache invalidations
    revalidateTag("purchaseOrders")
    revalidateTag(`purchaseOrders-${data.organizationId}`)
    revalidateTag(`purchaseOrder-${data.id}`)
    revalidateTag("inventory")
    revalidateTag(`inventory-${data.organizationId}`)
    revalidateTag("items")
    revalidateTag(`items-${data.organizationId}`)
    revalidatePath("/dashboard/purchase-orders")
    revalidatePath(`/dashboard/purchase-orders/${data.id}`)
    revalidatePath("/dashboard/inventory")

    return {
      success: true,
      data: result!,
      error: `Items received successfully. Goods receipt ${receiptNumber} created and inventory updated.`,
    }
  } catch (error) {
    console.error("Error receiving items:", error)
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") throw new Error("Purchase order or line items not found")
      if (error.code === "P2003") throw new Error("Referenced record not found")
      throw new Error(`Database error: ${error.message}`)
    }
    throw new Error(error instanceof Error ? error.message : "Failed to receive items. Please try again.")
  }
}

/**
 * Fetches goods receipts for a purchase order.
 */
export async function getGoodsReceiptsForPurchaseOrder(purchaseOrderId: string, organizationId: string) {
  try {
    if (!purchaseOrderId) throw new Error("Purchase order ID is required")
    if (!organizationId) throw new Error("Organization ID is required")

    const receipts = await db.goodsReceipt.findMany({
      where: { purchaseOrderId, organizationId },
      include: {
        lines: {
          include: {
            item: { select: { id: true, name: true, sku: true } },
          },
        },
        receivedBy: { select: { id: true, name: true, email: true } },
        location: { select: { id: true, name: true, address: true } },
      },
      orderBy: { createdAt: "desc" },
    })
    return receipts
  } catch (error) {
    console.error("Error fetching goods receipts:", error)
    throw new Error("Failed to fetch goods receipts")
  }
}

/**
 * Fetches purchase orders summary for dashboard.
 */
export async function getPurchaseOrdersSummary(organizationId: string) {
  try {
    if (!organizationId) throw new Error("Organization ID is required")

    const [
      totalOrders,
      draftOrders,
      submittedOrders,
      approvedOrders,
      // orderedOrders,
      partiallyReceivedOrders,
      receivedOrders,
      completedOrders,
      cancelledOrders,
      totalValue,
      overdueOrders,
    ] = await Promise.all([
      db.purchaseOrder.count({ where: { organizationId } }),
      db.purchaseOrder.count({ where: { organizationId, status: "DRAFT" } }),
      db.purchaseOrder.count({ where: { organizationId, status: "SUBMITTED" } }),
      db.purchaseOrder.count({ where: { organizationId, status: "APPROVED" } }),
      db.purchaseOrder.count({ where: { organizationId, status: "PARTIALLY_RECEIVED" } }),
      db.purchaseOrder.count({ where: { organizationId, status: "RECEIVED" } }),
      db.purchaseOrder.count({ where: { organizationId, status: "COMPLETED" } }),
      db.purchaseOrder.count({ where: { organizationId, status: "CANCELLED" } }),
      db.purchaseOrder.aggregate({ where: { organizationId }, _sum: { total: true } }),
      db.purchaseOrder.count({
        where: {
          organizationId,
          expectedDeliveryDate: { lt: new Date() },
          status: { notIn: ["RECEIVED", "CANCELLED", "COMPLETED"] },
        },
      }),
    ])

    return {
      totalOrders,
      statusBreakdown: {
        draft: draftOrders,
        submitted: submittedOrders,
        approved: approvedOrders,
        partiallyReceived: partiallyReceivedOrders,
        received: receivedOrders,
        completed: completedOrders,
        cancelled: cancelledOrders,
      },
      totalValue: totalValue._sum.total || 0,
      overdueOrders,
    }
  } catch (error) {
    console.error("Error fetching purchase orders summary:", error)
    throw new Error("Failed to fetch purchase orders summary")
  }
}

// ============================================================================
// NEW ESSENTIAL FUNCTIONS
// ============================================================================

/**
 * Bulk update status for multiple POs (with validation and audit).
 */
export async function bulkUpdatePurchaseOrderStatus(params: {
  organizationId: string
  purchaseOrderIds: string[]
  toStatus: PurchaseOrderStatus
  reason?: string
}): Promise<PurchaseOrderResponse<{ updated: string[]; failed: { id: string; error: string }[] }>> {
  const { organizationId, purchaseOrderIds, toStatus, reason } = params
  if (!organizationId) throw new Error("Organization ID is required")
  if (!purchaseOrderIds || purchaseOrderIds.length === 0) throw new Error("No purchase orders specified")

  const results: { updated: string[]; failed: { id: string; error: string }[] } = { updated: [], failed: [] }

  try {
    await db.$transaction(async (tx) => {
      const pos = await tx.purchaseOrder.findMany({
        where: { id: { in: purchaseOrderIds }, organizationId },
        select: { id: true, status: true, orderNumber: true },
      })

      const foundIds = new Set(pos.map((p) => p.id))
      for (const id of purchaseOrderIds) {
        if (!foundIds.has(id)) {
          results.failed.push({ id, error: "Purchase order not found or not in organization" })
        }
      }

      for (const po of pos) {
        if (!canTransition(po.status as PurchaseOrderStatus, toStatus)) {
          results.failed.push({
            id: po.id,
            error: `Invalid status transition from ${po.status} to ${toStatus}`,
          })
          continue
        }

        await tx.purchaseOrder.update({
          where: { id: po.id },
          data: {
            status: toStatus,
            updatedAt: new Date(),
            notes: reason ? `${reason}\n${new Date().toISOString()}: Status changed to ${toStatus}` : undefined,
            approvedAt: toStatus === "APPROVED" ? new Date() : undefined,
          },
        })

        // Optional: if you later add a status history model, insert here.
        results.updated.push(po.id)
      }
    })

    // Revalidate caches
    revalidateTag("purchaseOrders")
    revalidateTag(`purchaseOrders-${organizationId}`)
    revalidatePath("/dashboard/purchase-orders")

    return {
      success: true,
      data: results,
      error: `Bulk update completed. Updated: ${results.updated.length}, Failed: ${results.failed.length}`,
    }
  } catch (error) {
    console.error("Bulk update status error:", error)
    throw new Error("Failed to bulk update purchase order status")
  }
}

/**
 * Clone an existing PO (with optional overrides).
 */
export async function clonePurchaseOrder(params: {
  id: string
  organizationId: string
  overrides?: Partial<{
    supplierId: string
    locationId: string
    date: string
    expectedDeliveryDate: string
    notes: string
    paymentTerms: string
    shippingCost: number
  }>
}): Promise<PurchaseOrderResponse<PurchaseOrderWithRelations>> {
  const { id, organizationId, overrides = {} } = params
  try {
    if (!id) throw new Error("Purchase order ID is required")
    if (!organizationId) throw new Error("Organization ID is required")

    const po = await db.purchaseOrder.findFirst({
      where: { id, organizationId },
      include: { lines: true },
    })
    if (!po) throw new Error("Purchase order not found")

    const orderNumber = await generateNextPONumber(organizationId)
    const newDate = overrides.date ? new Date(overrides.date) : new Date()
    const newExpected = overrides.expectedDeliveryDate
      ? new Date(overrides.expectedDeliveryDate)
      : po.expectedDeliveryDate || null

    const created = await db.$transaction(async (tx) => {
      const cloned = await tx.purchaseOrder.create({
        data: {
          orderNumber,
          organizationId,
          orderDate: newDate,
          supplierId: overrides.supplierId || po.supplierId,
          locationId: overrides.locationId || po.locationId,
          expectedDeliveryDate: newExpected,
          paymentTerms: overrides.paymentTerms || po.paymentTerms || "Net 30 days",
          notes: overrides.notes || `Cloned from ${po.orderNumber}`,
          subtotal: 0,
          taxAmount: 0,
          shippingCost: overrides.shippingCost ?? po.shippingCost ?? 0,
          discount: 0,
          total: 0,
          status: "DRAFT",
          createdById: (await getAuthenticatedUser())?.id ?? null,
        },
      })

      if (po.lines.length > 0) {
        await tx.purchaseOrderLine.createMany({
          data: po.lines.map((l) => ({
            purchaseOrderId: cloned.id,
            itemId: l.itemId,
            orderedQuantity: l.orderedQuantity,
            unitCost: l.unitCost,
            discount: l.discount,
            taxRate: l.taxRate,
            taxAmount: l.taxAmount,
            lineTotal: l.lineTotal,
            notes: l.notes || "",
            receivedQuantity: 0,
          })),
        })

        // Recompute totals after cloning
        const lines = await tx.purchaseOrderLine.findMany({ where: { purchaseOrderId: cloned.id } })
        const subtotal = lines.reduce((s, x) => s + x.unitCost * x.orderedQuantity, 0)
        const taxAmount = lines.reduce((s, x) => s + x.taxAmount, 0)
        const discount = lines.reduce((s, x) => s + (x.discount || 0), 0)
        const total = subtotal + taxAmount + (cloned.shippingCost || 0) - discount

        await tx.purchaseOrder.update({
          where: { id: cloned.id },
          data: { subtotal, taxAmount, discount, total },
        })
      }

      return tx.purchaseOrder.findUnique({ where: { id: cloned.id }, include: standardInclude })
    })

    revalidateTag("purchaseOrders")
    revalidateTag(`purchaseOrders-${organizationId}`)
    revalidatePath("/dashboard/purchase-orders")

    return { success: true, data: created!, error: `Purchase order ${orderNumber} cloned successfully` }
  } catch (error) {
    console.error("Clone PO error:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to clone purchase order")
  }
}

/**
 * Purchase Orders requiring attention (overdue, pending approval, pending receipt).
 */
export async function getPurchaseOrdersRequiringAttention(params: {
  organizationId: string
  limit?: number
}) {
  const { organizationId, limit = 10 } = params
  try {
    if (!organizationId) throw new Error("Organization ID is required")
    const now = new Date()

    const [overdue, pendingApproval, pendingReceipt] = await Promise.all([
      db.purchaseOrder.findMany({
        where: {
          organizationId,
          expectedDeliveryDate: { lt: now },
          status: { notIn: ["RECEIVED", "COMPLETED", "CANCELLED"] },
        },
        include: standardInclude,
        orderBy: { expectedDeliveryDate: "asc" },
        take: limit,
      }),
      db.purchaseOrder.findMany({
        where: { organizationId, status: { in: ["DRAFT", "SUBMITTED"] } },
        include: standardInclude,
        orderBy: { updatedAt: "asc" },
        take: limit,
      }),
      db.purchaseOrder.findMany({
        where: { organizationId, status: { in: ["APPROVED", "PARTIALLY_RECEIVED"] } },
        include: {
          ...standardInclude,
          lines: { select: { orderedQuantity: true, receivedQuantity: true } },
        },
        orderBy: { updatedAt: "asc" },
        take: limit,
      }),
    ])

    // Filter pendingReceipt to those actually having unreceived qty
    const pendingReceiptFiltered = pendingReceipt.filter((po) =>
      po.lines.some((l) => (l.receivedQuantity || 0) < l.orderedQuantity),
    )

    return {
      overdue,
      pendingApproval,
      pendingReceipt: pendingReceiptFiltered,
      counts: {
        overdue: overdue.length,
        pendingApproval: pendingApproval.length,
        pendingReceipt: pendingReceiptFiltered.length,
      },
    }
  } catch (error) {
    console.error("Error fetching POs requiring attention:", error)
    throw new Error("Failed to fetch purchase orders requiring attention")
  }
}

/**
 * Export POs to CSV using current filters.
 */
export async function exportPurchaseOrders(organizationId: string): Promise<{
  filename: string
  mimeType: "text/csv"
  csv: string
}> {
  const { data } = await getOrgPurchaseOrders(organizationId) // export up to 1000 rows; adjust as needed

  const headers = [
    "Order Number",
    "Status",
    "Order Date",
    "Expected Delivery",
    "Supplier",
    "Supplier Code",
    "Supplier Email",
    "Location",
    "Subtotal",
    "Tax",
    "Shipping",
    "Discount",
    "Total",
  ]

  const escape = (v: unknown) => {
    const s = v ?? ""
    const str = typeof s === "string" ? s : (s?.toString?.() ?? "")
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`
    }
    return str
  }

  const rows = data.map((po) => [
    po.orderNumber,
    po.status,
    po.orderDate?.toString()?.slice(0, 10),
    po.expectedDeliveryDate ? po.expectedDeliveryDate.toString().slice(0, 10) : "",
    po.supplier?.name || "",
    po.supplier?.email || "",
    // po.location?.name || "",
    po.subtotal,
    po.taxAmount,
    po.shippingCost,
    po.discount,
    po.total,
  ])

  const csv = [headers.map(escape).join(","), ...rows.map((r) => r.map(escape).join(","))].join("\n")

  const filename = `purchase-orders-${new Date().toISOString().replace(/[:.]/g, "-")}.csv`
  return { filename, mimeType: "text/csv", csv }
}

/**
 * Analytics: monthly trends, totals, top suppliers, average approval time (approx).
 */
export async function getPurchaseOrderAnalytics(params: {
  organizationId: string
  from?: string
  to?: string
  topSuppliersLimit?: number
}) {
  const { organizationId, from, to, topSuppliersLimit = 5 } = params
  if (!organizationId) throw new Error("Organization ID is required")

  const whereDate: Prisma.PurchaseOrderWhereInput = { organizationId }
  if (from || to) {
    whereDate.orderDate = {}
    if (from) (whereDate.orderDate as Prisma.DateTimeFilter).gte = new Date(from)
    if (to) (whereDate.orderDate as Prisma.DateTimeFilter).lte = new Date(to)
  }

  const [orders, topSuppliersAgg] = await Promise.all([
    db.purchaseOrder.findMany({
      where: whereDate,
      select: { orderDate: true, total: true, status: true, createdAt: true, approvedAt: true },
      orderBy: { orderDate: "asc" },
    }),
    db.purchaseOrder.groupBy({
      by: ["supplierId"],
      where: { organizationId },
      _sum: { total: true },
      _count: { _all: true },
      orderBy: { _sum: { total: "desc" } },
      take: topSuppliersLimit,
    }),
  ])

  // Monthly trends in JS
  const monthKey = (d: Date) => `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`
  const monthly: Record<
    string,
    { total: number; count: number; statusCounts: Partial<Record<PurchaseOrderStatus, number>> }
  > = {}

  for (const o of orders) {
    const d = o.orderDate || o.createdAt
    const key = monthKey(d)
    monthly[key] ||= { total: 0, count: 0, statusCounts: {} }
    monthly[key].total += o.total || 0
    monthly[key].count += 1
    const st = o.status as PurchaseOrderStatus
    monthly[key].statusCounts[st] = (monthly[key].statusCounts[st] || 0) + 1
  }

  // Approx approval time: approvedAt - createdAt for orders that have approvedAt
  const approvalDurationsMs = orders
    .filter((o) => o.approvedAt && o.createdAt)
    .map((o) => o.approvedAt!.getTime() - o.createdAt.getTime())
  const avgApprovalMs =
    approvalDurationsMs.length > 0
      ? Math.round(approvalDurationsMs.reduce((a, b) => a + b, 0) / approvalDurationsMs.length)
      : 0

  // Top suppliers with names
  const supplierIds = topSuppliersAgg.map((x) => x.supplierId).filter(Boolean) as string[]
  const suppliers = supplierIds.length
    ? await db.supplier.findMany({ where: { id: { in: supplierIds } }, select: { id: true, name: true, code: true } })
    : []

  const topSuppliers = topSuppliersAgg.map((x) => ({
    supplierId: x.supplierId,
    name: suppliers.find((s) => s.id === x.supplierId)?.name || "Unknown",
    code: suppliers.find((s) => s.id === x.supplierId)?.code || "",
    total: x._sum.total || 0,
    orders: x._count._all,
  }))

  return {
    monthly,
    avgApprovalMs,
    topSuppliers,
  }
}

/**
 * Status history (derived): created, approvedAt, last received via goods receipt, cancelled/completed via updatedAt.
 * If you add a dedicated history table later, we can switch to it here.
 */
export async function getPurchaseOrderStatusHistory(params: { id: string; organizationId: string }) {
  const { id, organizationId } = params
  if (!id) throw new Error("Purchase order ID is required")
  if (!organizationId) throw new Error("Organization ID is required")

  const po = await db.purchaseOrder.findFirst({
    where: { id, organizationId },
    select: { id: true, status: true, createdAt: true, approvedAt: true, updatedAt: true },
  })
  if (!po) throw new Error("Purchase order not found")

  const goods = await db.goodsReceipt.findMany({
    where: { purchaseOrderId: id, organizationId },
    select: { createdAt: true, status: true, receiptNumber: true },
    orderBy: { createdAt: "asc" },
  })

  const history: Array<{ status: string; at: Date; meta?: Record<string, any> }> = [
    { status: "DRAFT", at: po.createdAt },
  ]

  // We don't store submittedAt; infer by earliest change when status became SUBMITTED (not tracked) - omitted
  if (po.approvedAt) {
    history.push({ status: "APPROVED", at: po.approvedAt })
  }
  if (goods.length > 0) {
    // first receipt indicates partially/received journey
    for (const gr of goods) {
      history.push({
        status: gr.status,
        at: gr.createdAt,
        meta: { receiptNumber: gr.receiptNumber },
      })
    }
  }
  if (po.status === "CANCELLED") {
    history.push({ status: "CANCELLED", at: po.updatedAt })
  }
  if (po.status === "COMPLETED") {
    history.push({ status: "COMPLETED", at: po.updatedAt })
  }
  if (po.status === "RECEIVED") {
    history.push({ status: "RECEIVED", at: po.updatedAt })
  }

  // Sort chronologically
  history.sort((a, b) => a.at.getTime() - b.at.getTime())

  return { id, status: po.status, history }
}

export async function searchLocations(params: { organizationId: string; q: string; limit?: number }) {
  const { organizationId, q, limit = 10 } = params
  if (!organizationId) throw new Error("organizationId is required")
  const where: Prisma.LocationWhereInput = {
    organizationId,
    OR: q
      ? [{ name: { contains: q, mode: "insensitive" } }, { address: { contains: q, mode: "insensitive" } }]
      : undefined,
  }
  const locations = await db.location.findMany({
    where,
    take: limit,
    orderBy: { name: "asc" },
    select: { id: true, name: true, address: true },
  })
  return locations
}
