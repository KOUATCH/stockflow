"use server"

import type { CreatePosStationInput, UpdatePosStationInput } from "@/lib/validations/pos-station";
import { posStationSchema, updatePosStationSchema } from "@/lib/validations/pos-station";
import { db } from "@/prisma/db";
import { PaymentMethod, TransactionReferenceType, TransactionType } from "@prisma/client";
import { revalidatePath } from "next/cache";

// Types for the POS actions
interface SalesOrderLine {
  itemId: string
  quantity: number
  unitPrice: number
  discount: number
  taxRate: number
  taxAmount: number
  lineTotal: number
}

interface CreateSalesOrderData {
  customerId: string
  locationId: string
  organizationId: string
  orderNumber: string
  createdById: string
  lines: SalesOrderLine[]
  subtotal: number
  taxAmount: number
  discount: number
  total: number
}

interface CreatePaymentData {
  amount: number
  method: PaymentMethod
  salesOrderId: string
  processedById: string
  cardType?: string
  cardLast4?: string
  transactionId?: string
  authorizationCode?: string
}

interface InventoryUpdate {
  itemId: string
  locationId: string
  quantityChange: number
  organizationId: string
}

interface InventoryTransaction {
  itemId: string
  locationId: string
  type: string
  quantity: number
  unitCost: number
  totalCost: number
  referenceType: string
  referenceId: string
  organizationId: string
  createdById: string
  serialNumbers: string[]
}

// FIXED: Updated interface to match frontend data structure
export interface CreateSaleData {
  organizationId: string
  locationId: string
  stationId: string
  createdById: string
  customerId?: string // Made optional since it can be undefined
  sessionId: string
  lines: SalesOrderLine[]
  subtotal: number
  taxAmount: number
  discount: number
  totalAmount: number
  payments: {
    method: "CASH" | "CARD" | "DIGITAL"
    amount: number
    referenceNumber?: string
    cardLastFour?: string
    cardType?: string
    authorizationCode?: string
  }[]
  notes?: string
}

export interface SalesType {
  id: string
  orderNumber: string
  sessionId: string
  stationId: string
  customerId: string
  userId: string
  locationId: string
  organizationId: string
  status: "PENDING" | "PAID" | "CANCELLED"
  subtotal: number
  taxAmount: number
  discount: number
  totalAmount: number
  amountPaid: number
  changeAmount: number
  notes?: string
  receiptNumber?: string
  createdAt: Date
  lines: {
    id: string
    itemId: string
    quantity: number
    unitPrice: number
    discount: number
    taxAmount: number
    lineTotal: number
    item: {
      name: string
      sku: string
    }
  }[]
  payments: {
    id: string
    method: "CASH" | "CARD" | "DIGITAL"
    paymentNumber: string
    amount: number
    cardLastFour?: string
    cardType?: string
    authorizationCode?: string
    status: string
  }[]
  location: {
    id: string
    name?: string
    cashDrawer: {
      id: string
      name: string
      currentBalance: number
      isOpen: boolean
    }
  }
  customer?: {
    id: string
    name?: string
    phone?: string
  }
}

export async function createSalesOrder(data: CreateSalesOrderData) {
  try {
    const salesOrder = await db.salesOrder.create({
      data: {
        customerId: data.customerId,
        locationId: data.locationId,
        organizationId: data.organizationId,
        createdById: data.createdById,
        subtotal: data.subtotal,
        orderNumber: data.orderNumber,
        taxAmount: data.taxAmount,
        discount: data.discount,
        total: data.total,
        status: "CONFIRMED",
        lines: {
          create: data.lines.map((line) => ({
            itemId: line.itemId,
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            discount: line.discount,
            taxRate: line.taxRate,
            taxAmount: line.taxAmount,
            lineTotal: line.lineTotal,
          })),
        },
      },
      include: {
        lines: true,
      },
    })

    revalidatePath("/dashboard/session-pos-sync")
    return { success: true, data: salesOrder }
  } catch (error) {
    console.error("Failed to create sales order:", error)
    return { success: false, error: "Failed to create sales order" }
  }
}

// FIXED: Main createSale function with proper error handling and data structure
export async function createSale(
  saleData: CreateSaleData,
  userId: string
): Promise<{ success: boolean; data?: { id: string }; saleId?: string; error?: string }> {
  try {
    console.log("[CREATE_SALES] Starting sale creation with data:", {
      ...saleData,
      userId,
      hasLines: saleData.lines?.length > 0,
      hasPayments: saleData.payments?.length > 0
    });

    // FIXED: Enhanced validation with detailed error messages
    if (!saleData.payments || !Array.isArray(saleData.payments) || saleData.payments.length === 0) {
      console.error("[CREATE_SALES] Validation failed: No payments provided");
      return { success: false, error: "At least one payment method is required" }
    }

    if (!saleData.lines || !Array.isArray(saleData.lines) || saleData.lines.length === 0) {
      console.error("[CREATE_SALES] Validation failed: No sale lines provided");
      return { success: false, error: "At least one sale item is required" }
    }

    if (!userId) {
      console.error("[CREATE_SALES] Validation failed: No user ID provided");
      return { success: false, error: "User ID is required" }
    }

    if (!saleData.organizationId || !saleData.locationId || !saleData.stationId) {
      console.error("[CREATE_SALES] Validation failed: Missing required IDs", {
        hasOrgId: !!saleData.organizationId,
        hasLocationId: !!saleData.locationId,
        hasstationId: !!saleData.stationId
      });
      return { success: false, error: "Organization, location, and terminal IDs are required" }
    }

    // Generate sale number
    const saleNumber = `SALES-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    console.log("[CREATE_SALES] Generated sales number:", saleNumber);

    // Calculate change amount with null safety
    const totalPaid = saleData.payments.reduce((sum, payment) => sum + (payment.amount || 0), 0)
    const changeAmount = Math.max(0, totalPaid - saleData.totalAmount)

    console.log("[CREATE_SALES] Payment calculations:", {
      totalPaid,
      totalAmount: saleData.totalAmount,
      changeAmount
    });

    // Use database transaction to ensure data consistency
    const result = await db.$transaction(async (tx) => {
      console.log("[CREATE_SALES] Starting database transaction");

      // FIXED: Proper customer handling (can be null/undefined)
      const customerData: any = {
        orderNumber: saleNumber,
        sessionId: saleData.sessionId,
        stationId: saleData.stationId,
        createdById: userId, // Use the passed userId parameter
        locationId: saleData.locationId,
        organizationId: saleData.organizationId,
        subtotal: saleData.subtotal,
        taxAmount: saleData.taxAmount,
        discount: saleData.discount,
        total: saleData.totalAmount,
        notes: saleData.notes,
        status: "CONFIRMED",
        paymentStatus: "PAID",
      };

      // Only add customerId if it exists and is not empty
      if (saleData.customerId && saleData.customerId.trim() !== '') {
        customerData.customerId = saleData.customerId;
      }

      // Create the sales order
      const sale = await tx.salesOrder.create({
        data: customerData,
      })

      console.log("[CREATE_SALES] Sales order created with ID:", sale.id);

      // Create sale items and update inventory
      for (const [index, item] of Array.from(saleData.lines.entries())) {
        console.log(`[CREATE_SALES] Processing line item ${index + 1}:`, {
          itemId: item.itemId,
          quantity: item.quantity,
          unitPrice: item.unitPrice
        });

        // Validate required item properties
        if (!item.itemId || item.quantity === undefined || item.unitPrice === undefined) {
          throw new Error(`Invalid item data at line ${index + 1}: missing required properties`)
        }

        const lineTotal = item.unitPrice * item.quantity - (item.discount || 0) + (item.taxAmount || 0)

        await tx.salesOrderLine.create({
          data: {
            salesOrderId: sale.id,
            itemId: item.itemId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discount: item.discount || 0,
            taxRate: item.taxRate || 0,
            taxAmount: item.taxAmount || 0,
            lineTotal,
          },
        })

        // Get current inventory level
        const inventoryLevel = await tx.inventoryLevel.findFirst({
          where: {
            itemId: item.itemId,
            locationId: saleData.locationId,
          },
        })

        // Update or create inventory level
        if (inventoryLevel) {
          const newQuantityOnHand = inventoryLevel.quantityOnHand - item.quantity
          const newQuantityAvailable = Math.max(0, inventoryLevel.quantityAvailable - item.quantity)

          await tx.inventoryLevel.update({
            where: { id: inventoryLevel.id },
            data: {
              quantityOnHand: newQuantityOnHand,
              quantityAvailable: newQuantityAvailable,
              lastTransactionAt: new Date(),
            },
          })

          // Create inventory transaction
          await tx.inventoryTransaction.create({
            data: {
              itemId: item.itemId,
              locationId: saleData.locationId,
              organizationId: saleData.organizationId,
              type: TransactionType.SALE,
              quantity: -item.quantity, // Negative for outbound
              unitCost: item.unitPrice,
              totalCost: item.unitPrice * item.quantity,
              balanceAfter: newQuantityOnHand,
              referenceType: TransactionReferenceType.SALES_ORDER,
              referenceId: sale.id,
              referenceNumber: saleNumber,
              createdById: userId,
              notes: `Sale transaction - ${item.quantity} units sold`,
            },
          })
        } else {
          // Create new inventory level if it doesn't exist
          await tx.inventoryLevel.create({
            data: {
              itemId: item.itemId,
              locationId: saleData.locationId,
              quantityOnHand: -item.quantity,
              quantityAvailable: 0,
              quantityReserved: 0,
              quantityInTransit: 0,
              quantityOnOrder: 0,
              reorderPoint: 0,
              averageCost: item.unitPrice,
              totalValue: 0,
              lastTransactionAt: new Date(),
            },
          })

          // Create inventory transaction
          await tx.inventoryTransaction.create({
            data: {
              itemId: item.itemId,
              locationId: saleData.locationId,
              organizationId: saleData.organizationId,
              type: TransactionType.SALE,
              quantity: -item.quantity,
              unitCost: item.unitPrice,
              totalCost: item.unitPrice * item.quantity,
              balanceAfter: -item.quantity,
              referenceType: TransactionReferenceType.SALES_ORDER,
              referenceId: sale.id,
              referenceNumber: saleNumber,
              createdById: userId,
              notes: `Sale transaction - ${item.quantity} units sold`,
            },
          })
        }
      }

      console.log("[CREATE_SALES] All line items processed, creating payments");

      // Create payments
      for (const [index, payment] of Array.from(saleData.payments.entries())) {
        // Validate payment data
        if (!payment.method || payment.amount === undefined || payment.amount <= 0) {
          throw new Error(`Invalid payment data at payment ${index + 1}: missing or invalid method/amount`)
        }

        const paymentNumber = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

        await tx.payment.create({
          data: {
            paymentNumber,
            salesOrderId: sale.id,
            method: payment.method as PaymentMethod,
            amount: payment.amount,
            cardLast4: payment.cardLastFour,
            cardType: payment.cardType,
            authorizationCode: payment.authorizationCode,
            status: "PAID",
            processedById: userId,
            processedAt: new Date(),
          },
        })
      }

      // Handle cash drawer updates for cash payments
      const cashPayments = saleData.payments.filter(p => p.method === "CASH")
      if (cashPayments.length > 0) {
        console.log("[CREATE_SALES] Processing cash payments, count:", cashPayments.length);

        // Find the cash drawer for this session/terminal
        const cashDrawer = await tx.cashDrawer.findFirst({
          where: {
            stationId: saleData.stationId,
            locationId: saleData.locationId,
            isOpen: true,
          },
        })

        if (cashDrawer) {
          const totalCashPayment = cashPayments.reduce((sum, payment) => sum + payment.amount, 0)
          const netCashAmount = totalCashPayment - changeAmount
          const newBalance = cashDrawer.currentBalance + netCashAmount

          console.log("[CREATE_SALES] Updating cash drawer:", {
            currentBalance: cashDrawer.currentBalance,
            totalCashPayment,
            changeAmount,
            netCashAmount,
            newBalance
          });

          // Update cash drawer balance
          await tx.cashDrawer.update({
            where: { id: cashDrawer.id },
            data: {
              currentBalance: newBalance,
              expectedBalance: newBalance,
            },
          })

          // FIXED: Proper cash drawer transaction creation with relation handling
          const transactionData: any = {
            cashDrawer: {
              connect: { id: cashDrawer.id }
            },
            session: {
              connect: { id: saleData.sessionId }
            },
            type: "SALE",
            amount: netCashAmount,
            reason: `Sale ${saleNumber}`,
            balanceBefore: cashDrawer.currentBalance,
            balanceAfter: newBalance,
          }

          // Add notes if change was given
          if (changeAmount > 0) {
            transactionData.notes = `Change given: $${changeAmount.toFixed(2)}`
          }

          // Only connect user if userId is provided and valid
          if (userId) {
            transactionData.user = {
              connect: { id: userId }
            }
          }

          // Record cash drawer transaction
          await tx.cashDrawerTransaction.create({
            data: transactionData
          })
        } else {
          console.warn(`[CREATE_SALES] No active cash drawer found for terminal ${saleData.stationId}`)
        }
      }

      // Update POS session totals
      const session = await tx.pOSSession.findUnique({
        where: { id: saleData.sessionId },
      })

      if (session) {
        console.log("[CREATE_SALES] Updating POS session totals");

        await tx.pOSSession.update({
          where: { id: saleData.sessionId },
          data: {
            totalSales: session.totalSales + saleData.totalAmount,
            totalTax: session.totalTax + saleData.taxAmount,
            totalDiscount: session.totalDiscount + saleData.discount,
            transactionCount: session.transactionCount + 1,
            cashTotal: session.cashTotal + cashPayments.reduce((sum, p) => sum + p.amount, 0),
            cardTotal: session.cardTotal + saleData.payments.filter(p => p.method === "CARD").reduce((sum, p) => sum + p.amount, 0),
            digitalTotal: session.digitalTotal + saleData.payments.filter(p => p.method === "DIGITAL").reduce((sum, p) => sum + p.amount, 0),
          },
        })
      } else {
        console.warn("[CREATE_SALES] No session found with ID:", saleData.sessionId);
      }

      console.log("[CREATE_SALES] Transaction completed successfully, sale ID:", sale.id);
      return sale
    })

    revalidatePath("/dashboard/app/sales/pos")

    // FIXED: Return consistent data structure that matches frontend expectations
    return {
      success: true,
      data: { id: result.id },
      saleId: result.id
    }
  } catch (error) {
    console.error("[CREATE_SALES] Error creating sale:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create sale"
    }
  }
}

export async function createPayment(data: CreatePaymentData, userId: string) {
  try {
    const payment = await db.payment.create({
      data: {
        amount: data.amount,
        method: data.method,
        salesOrderId: data.salesOrderId,
        processedById: userId,
        status: "PAID",
        paymentNumber: `${data.method.toString().toUpperCase().slice(0, 3)}-${Date.now().toString().slice(-6)}`,
        cardType: data.cardType,
        cardLast4: data.cardLast4,
        transactionId: data.transactionId,
        authorizationCode: data.authorizationCode,
        processedAt: new Date(),
      },
    })

    revalidatePath("/dashboard/app/sales/pos")
    return { success: true, data: payment }
  } catch (error) {
    console.error("Failed to create payment:", error)
    return { success: false, error: "Failed to create payment" }
  }
}

export async function updateInventoryLevels(updates: InventoryUpdate[]) {
  try {
    // Process each inventory update
    for (const update of updates) {
      await db.inventoryLevel.upsert({
        where: {
          itemId_locationId: {
            itemId: update.itemId,
            locationId: update.locationId,
          },
        },
        update: {
          quantityOnHand: {
            decrement: Math.abs(update.quantityChange),
          },
          quantityAvailable: {
            decrement: Math.abs(update.quantityChange),
          },
          lastTransactionAt: new Date(),
        },
        create: {
          itemId: update.itemId,
          locationId: update.locationId,
          quantityOnHand: Math.max(0, -Math.abs(update.quantityChange)),
          quantityAvailable: Math.max(0, -Math.abs(update.quantityChange)),
          quantityReserved: 0,
          quantityInTransit: 0,
          quantityOnOrder: 0,
          reorderPoint: 0,
          averageCost: 0,
          totalValue: 0,
        },
      })
    }

    revalidatePath("/pos")
    return { success: true }
  } catch (error) {
    console.error("Failed to update inventory levels:", error)
    return { success: false, error: "Failed to update inventory levels" }
  }
}

export async function createPOSSession(data: {
  stationId: string
  userId: string
  locationId: string
  organizationId: string
  openingBalance?: number
}) {
  try {
    const sessionNumber = `SES-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(Date.now()).slice(-6)}`
    const openingBalance = data.openingBalance || 200.0

    const result = await db.$transaction(async (tx) => {
      // Verify user exists
      const user = await tx.user.findUnique({ where: { id: data.userId } })
      if (!user) {
        throw new Error(`User with ID ${data.userId} not found`)
      }

      // Create the POS session
      const session = await tx.pOSSession.create({
        data: {
          sessionNumber,
          stationId: data.stationId,
          userId: data.userId,
          locationId: data.locationId,
          status: "ACTIVE",
          startTime: new Date(),
          openingBalance: openingBalance,
          totalSales: 0,
          totalTax: 0,
          totalDiscount: 0,
          transactionCount: 0,
          cashTotal: 0,
          cardTotal: 0,
          digitalTotal: 0,
        },
      })

      // Create or find existing cash drawer for this terminal
      let cashDrawer = await tx.cashDrawer.findFirst({
        where: {
          stationId: data.stationId,
          locationId: data.locationId,
        },
      })

      if (!cashDrawer) {
        cashDrawer = await tx.cashDrawer.create({
          data: {
            name: `Drawer-${data.stationId}`,
            drawerNumber: `DRW-${data.stationId}-${Date.now()}`,
            stationId: data.stationId,
            locationId: data.locationId,
            currentBalance: openingBalance,
            expectedBalance: openingBalance,
            isOpen: true,
          },
        })
      } else {
        // Update existing cash drawer
        await tx.cashDrawer.update({
          where: { id: cashDrawer.id },
          data: {
            currentBalance: openingBalance,
            expectedBalance: openingBalance,
            isOpen: true,
          },
        })
      }

      // Create opening balance transaction with proper relations
      await tx.cashDrawerTransaction.create({
        data: {
          cashDrawer: {
            connect: { id: cashDrawer.id }
          },
          session: {
            connect: { id: session.id }
          },
          user: {
            connect: { id: user.id }
          },
          type: "OPENING_BALANCE",
          amount: openingBalance,
          reason: "Session opened",
          balanceBefore: 0,
          balanceAfter: openingBalance,
        },
      })

      // Update terminal's current session
      await tx.pOSStation.update({
        where: { id: data.stationId },
        data: { currentSessionId: session.id },
      })

      return session
    })

    revalidatePath("/dashboard/app/sales/pos")
    return { success: true, data: result }
  } catch (error) {
    console.error("Failed to create POS session:", error)
    return { success: false, error: "Failed to create POS session" }
  }
}

export async function getActivePOSSession(stationId: string) {
  try {
    const session = await db.pOSSession.findFirst({
      where: {
        stationId: stationId,
        status: "ACTIVE",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
          },
        },
        station: {
          select: {
            id: true,
            name: true,
            stationNumber: true,
          },
        },
        cashDrawerTransactions: {
          include: {
            cashDrawer: {
              select: {
                id: true,
                name: true,
                currentBalance: true,
                expectedBalance: true,
                isOpen: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
    })

    return { success: true, data: session }
  } catch (error) {
    console.error("Failed to get active POS session:", error)
    return { success: false, error: "Failed to get active POS session" }
  }
}

export async function createInventoryTransactions(transactions: InventoryTransaction[]) {
  try {
    const createdTransactions = await db.inventoryTransaction.createMany({
      data: transactions.map((transaction) => ({
        itemId: transaction.itemId,
        locationId: transaction.locationId,
        organizationId: transaction.organizationId,
        type: transaction.type as TransactionType,
        quantity: transaction.quantity,
        unitCost: transaction.unitCost,
        totalCost: transaction.totalCost,
        balanceAfter: 0, // This should be calculated based on current inventory levels
        referenceType: transaction.referenceType as TransactionReferenceType,
        referenceId: transaction.referenceId,
        createdById: transaction.createdById,
        serialNumbers: transaction.serialNumbers,
        notes: `Sale transaction for ${Math.abs(transaction.quantity)} units`,
      })),
    })

    revalidatePath("/dashboard/session-pos-sync")
    return { success: true, data: createdTransactions }
  } catch (error) {
    console.error("Failed to create inventory transactions:", error)
    return { success: false, error: "Failed to create inventory transactions" }
  }
}

export async function closePOSSession(
  sessionId: string,
  closingBalance: number,
  userId: string
) {
  try {
    const result = await db.$transaction(async (tx) => {
      // Get the current session
      const currentSession = await tx.pOSSession.findUnique({
        where: { id: sessionId },
        include: {
          cashDrawerTransactions: {
            include: { cashDrawer: true },
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      })

      if (!currentSession) {
        throw new Error("Session not found")
      }

      // Update session status
      const session = await tx.pOSSession.update({
        where: { id: sessionId },
        data: {
          status: "CLOSED",
          endTime: new Date(),
          closingBalance: closingBalance,
          expectedBalance: currentSession.openingBalance + currentSession.totalSales,
          variance: closingBalance - (currentSession.openingBalance + currentSession.totalSales),
        },
      })

      // Close associated cash drawer
      const cashDrawerTransaction = currentSession.cashDrawerTransactions[0]
      if (cashDrawerTransaction?.cashDrawer) {
        await tx.cashDrawer.update({
          where: { id: cashDrawerTransaction.cashDrawer.id },
          data: {
            isOpen: false,
            currentBalance: closingBalance,
          },
        })

        // Record closing event with proper relations
        await tx.cashDrawerTransaction.create({
          data: {
            cashDrawer: {
              connect: { id: cashDrawerTransaction.cashDrawer.id }
            },
            session: {
              connect: { id: sessionId }
            },
            user: {
              connect: { id: userId }
            },
            type: "CLOSING_BALANCE",
            amount: closingBalance,
            reason: "Session closed",
            balanceBefore: cashDrawerTransaction.cashDrawer.currentBalance,
            balanceAfter: closingBalance,
          },
        })
      }

      // Clear terminal's current session
      await tx.pOSStation.update({
        where: { id: currentSession.stationId },
        data: { currentSessionId: null },
      })

      return session
    })

    revalidatePath("/dashboard/session-pos-sync")
    return {
      success: true,
      data: result,
      message: `POS Session ${result.sessionNumber} closed successfully. Final sales: $${result.totalSales.toFixed(2)}, Variance: $${(result.variance || 0).toFixed(2)}`
    }
  } catch (error) {
    console.error("Failed to close POS session:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to close POS session",
      message: "Could not close the session. Please try again or contact support."
    }
  }
}

// ============================================================================
// POS STATION MANAGEMENT FUNCTIONS
// ============================================================================

// Generate unique terminal number
async function generatestationNumber(): Promise<string> {
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  const stationNumber = `POS-${timestamp}-${random}`

  // Check if terminal number already exists
  const existing = await db.pOSStation.findUnique({
    where: { stationNumber },
  })

  if (existing) {
    // Recursively generate a new number if collision occurs
    return generatestationNumber()
  }

  return stationNumber
}

export async function createPosStation(input: CreatePosStationInput) {
  try {
    // Validate input
    const validatedInput = posStationSchema.parse(input)

    // Check if organization exists
    const organization = await db.organization.findUnique({
      where: { id: validatedInput.organizationId },
    })

    if (!organization) {
      return {
        success: false,
        error: "Organization not found",
      }
    }

    // Check if location exists and belongs to the organization
    const location = await db.location.findFirst({
      where: {
        id: validatedInput.locationId,
        organizationId: validatedInput.organizationId,
      },
    })

    if (!location) {
      return {
        success: false,
        error: "Location not found or does not belong to the specified organization",
      }
    }

    // Generate unique terminal number
    const stationNumber = await generatestationNumber()

    // Create POS station
    const posStation = await db.pOSStation.create({
      data: {
        ...validatedInput,
        stationNumber,
      },
      include: {
        location: {
          select: { id: true, name: true },
        },
        organization: {
          select: { id: true, name: true },
        },
        currentSession: {
          select: { id: true, sessionNumber: true, status: true },
        },
      },
    })

    revalidatePath("/dashboard/posStation")
    revalidatePath("/dashboard/session-pos-sync")

    return {
      success: true,
      data: posStation,
    }
  } catch (error) {
    console.error("Error creating POS station:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create POS station",
    }
  }
}

export async function getPosStations(organizationId?: string) {
  try {
    const posStations = await db.pOSStation.findMany({
      where: organizationId ? { organizationId } : undefined,
      include: {
        location: {
          select: { id: true, name: true },
        },
        organization: {
          select: { id: true, name: true },
        },
        currentSession: {
          select: { id: true, sessionNumber: true, status: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return {
      success: true,
      data: posStations,
    }
  } catch (error) {
    console.error("Error fetching POS stations:", error)
    return {
      success: false,
      error: "Failed to fetch POS stations",
    }
  }
}

export async function getPosStationById(id: string) {
  try {
    const posStation = await db.pOSStation.findUnique({
      where: { id },
      include: {
        location: {
          select: { id: true, name: true },
        },
        organization: {
          select: { id: true, name: true },
        },
        currentSession: {
          select: { id: true, sessionNumber: true, status: true },
        },
      },
    })

    if (!posStation) {
      return {
        success: false,
        error: "POS station not found",
      }
    }

    return {
      success: true,
      data: posStation,
    }
  } catch (error) {
    console.error("Error fetching POS station:", error)
    return {
      success: false,
      error: "Failed to fetch POS station",
    }
  }
}

export async function updatePosStation(input: UpdatePosStationInput) {
  try {
    // Validate input
    const validatedInput = updatePosStationSchema.parse(input)
    const { id, ...updateData } = validatedInput

    // Check if POS station exists
    const existingStation = await db.pOSStation.findUnique({
      where: { id },
    })

    if (!existingStation) {
      return {
        success: false,
        error: "POS station not found",
      }
    }

    // If updating location, verify it belongs to the organization
    if (updateData.locationId && updateData.organizationId) {
      const location = await db.location.findFirst({
        where: {
          id: updateData.locationId,
          organizationId: updateData.organizationId,
        },
      })

      if (!location) {
        return {
          success: false,
          error: "Location not found or does not belong to the specified organization",
        }
      }
    }

    // Update POS station
    const updatedStation = await db.pOSStation.update({
      where: { id },
      data: updateData,
      include: {
        location: {
          select: { id: true, name: true },
        },
        organization: {
          select: { id: true, name: true },
        },
        currentSession: {
          select: { id: true, sessionNumber: true, status: true },
        },
      },
    })

    revalidatePath("/dashboard/posStation")
    revalidatePath("/dashboard/session-pos-sync")

    return {
      success: true,
      data: updatedStation,
    }
  } catch (error) {
    console.error("Error updating POS station:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update POS station",
    }
  }
}

export async function deletePosStation(id: string) {
  try {
    // Check if POS station exists
    const existingStation = await db.pOSStation.findUnique({
      where: { id },
      include: {
        sessions: { take: 1 },
        salesOrders: { take: 1 },
      },
    })

    if (!existingStation) {
      return {
        success: false,
        error: "POS station not found",
      }
    }

    // Check if station has active sessions or sales orders
    if (existingStation.sessions.length > 0 || existingStation.salesOrders.length > 0) {
      return {
        success: false,
        error: "Cannot delete POS station with existing sessions or sales orders. Deactivate it instead.",
      }
    }

    // Delete POS station
    await db.pOSStation.delete({
      where: { id },
    })

    revalidatePath("/dashboard/posStation")
    revalidatePath("/dashboard/session-pos-sync")

    return {
      success: true,
      message: "POS station deleted successfully",
    }
  } catch (error) {
    console.error("Error deleting POS station:", error)
    return {
      success: false,
      error: "Failed to delete POS station",
    }
  }
}

export async function getOrganizations() {
  try {
    const organizations = await db.organization.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    })

    return {
      success: true,
      data: organizations,
    }
  } catch (error) {
    console.error("Error fetching organizations:", error)
    return {
      success: false,
      error: "Failed to fetch organizations",
    }
  }
}

export async function getLocationsByOrganization(organizationId: string) {
  try {
    const locations = await db.location.findMany({
      where: { organizationId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    })

    return {
      success: true,
      data: locations,
    }
  } catch (error) {
    console.error("Error fetching locations:", error)
    return {
      success: false,
      error: "Failed to fetch locations",
    }
  }
}

// ============================================================================
// CASH DRAWER MANAGEMENT FUNCTIONS
// ============================================================================

export async function getCashDrawerByStationId(stationId: string) {
  try {
    const cashDrawer = await db.cashDrawer.findFirst({
      where: { stationId },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            user: {
              select: { id: true, name: true, firstName: true, lastName: true }
            }
          }
        },
        station: {
          select: { id: true, name: true, stationNumber: true }
        }
      }
    })

    return {
      success: true,
      data: cashDrawer,
    }
  } catch (error) {
    console.error("Error fetching cash drawer:", error)
    return {
      success: false,
      error: "Failed to fetch cash drawer",
    }
  }
}

export async function openCashDrawer(stationId: string, userId: string, openingBalance: number) {
  try {
    const result = await db.$transaction(async (tx) => {
      // Find or create cash drawer for the station
      let cashDrawer = await tx.cashDrawer.findFirst({
        where: { stationId }
      })

      if (!cashDrawer) {
        // Create new cash drawer
        cashDrawer = await tx.cashDrawer.create({
          data: {
            name: `Drawer-${stationId}`,
            drawerNumber: `DRW-${stationId}-${Date.now()}`,
            stationId,
            locationId: "", // Will be updated when we have location context
            currentBalance: openingBalance,
            expectedBalance: openingBalance,
            isOpen: true,
          }
        })
      } else {
        // Update existing cash drawer
        await tx.cashDrawer.update({
          where: { id: cashDrawer.id },
          data: {
            currentBalance: openingBalance,
            expectedBalance: openingBalance,
            isOpen: true,
          }
        })
      }

      // Create opening transaction
      await tx.cashDrawerTransaction.create({
        data: {
          cashDrawer: { connect: { id: cashDrawer.id } },
          user: { connect: { id: userId } },
          type: "OPENING_BALANCE",
          amount: openingBalance,
          reason: "Cash drawer opened",
          balanceBefore: 0,
          balanceAfter: openingBalance,
        }
      })

      return cashDrawer
    })

    revalidatePath("/dashboard/session-pos-sync")
    return {
      success: true,
      data: result,
      message: `Cash drawer opened with balance: $${openingBalance.toFixed(2)}`
    }
  } catch (error) {
    console.error("Error opening cash drawer:", error)
    return {
      success: false,
      error: "Failed to open cash drawer",
    }
  }
}

export async function closeCashDrawer(stationId: string, userId: string, closingBalance: number) {
  try {
    const result = await db.$transaction(async (tx) => {
      const cashDrawer = await tx.cashDrawer.findFirst({
        where: { stationId, isOpen: true }
      })

      if (!cashDrawer) {
        throw new Error("No open cash drawer found for this station")
      }

      // Update cash drawer status
      const updatedDrawer = await tx.cashDrawer.update({
        where: { id: cashDrawer.id },
        data: {
          isOpen: false,
          currentBalance: closingBalance,
        }
      })

      // Create closing transaction
      await tx.cashDrawerTransaction.create({
        data: {
          cashDrawer: { connect: { id: cashDrawer.id } },
          user: { connect: { id: userId } },
          type: "CLOSING_BALANCE",
          amount: closingBalance,
          reason: "Cash drawer closed",
          balanceBefore: cashDrawer.currentBalance,
          balanceAfter: closingBalance,
        }
      })

      return updatedDrawer
    })

    revalidatePath("/dashboard/session-pos-sync")
    return {
      success: true,
      data: result,
      message: `Cash drawer closed with balance: $${closingBalance.toFixed(2)}`
    }
  } catch (error) {
    console.error("Error closing cash drawer:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to close cash drawer",
    }
  }
}

export async function addCashToDrawer(
  stationId: string,
  userId: string,
  amount: number,
  reason: string,
  sessionId?: string
) {
  try {
    const result = await db.$transaction(async (tx) => {
      const cashDrawer = await tx.cashDrawer.findFirst({
        where: { stationId, isOpen: true }
      })

      if (!cashDrawer) {
        throw new Error("No open cash drawer found for this station")
      }

      const newBalance = cashDrawer.currentBalance + amount

      // Update cash drawer balance
      const updatedDrawer = await tx.cashDrawer.update({
        where: { id: cashDrawer.id },
        data: {
          currentBalance: newBalance,
          expectedBalance: newBalance,
        }
      })

      // Create transaction record
      const transactionData: any = {
        cashDrawer: { connect: { id: cashDrawer.id } },
        user: { connect: { id: userId } },
        type: "CASH_ADDED",
        amount,
        reason,
        balanceBefore: cashDrawer.currentBalance,
        balanceAfter: newBalance,
      }

      if (sessionId) {
        transactionData.session = { connect: { id: sessionId } }
      }

      await tx.cashDrawerTransaction.create({ data: transactionData })

      return updatedDrawer
    })

    revalidatePath("/dashboard/session-pos-sync")
    return {
      success: true,
      data: result,
      message: `$${amount.toFixed(2)} added to cash drawer`
    }
  } catch (error) {
    console.error("Error adding cash to drawer:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to add cash to drawer",
    }
  }
}

export async function removeCashFromDrawer(
  stationId: string,
  userId: string,
  amount: number,
  reason: string,
  sessionId?: string
) {
  try {
    const result = await db.$transaction(async (tx) => {
      const cashDrawer = await tx.cashDrawer.findFirst({
        where: { stationId, isOpen: true }
      })

      if (!cashDrawer) {
        throw new Error("No open cash drawer found for this station")
      }

      if (cashDrawer.currentBalance < amount) {
        throw new Error("Insufficient cash in drawer")
      }

      const newBalance = cashDrawer.currentBalance - amount

      // Update cash drawer balance
      const updatedDrawer = await tx.cashDrawer.update({
        where: { id: cashDrawer.id },
        data: {
          currentBalance: newBalance,
          expectedBalance: newBalance,
        }
      })

      // Create transaction record
      const transactionData: any = {
        cashDrawer: { connect: { id: cashDrawer.id } },
        user: { connect: { id: userId } },
        type: "CASH_REMOVED",
        amount: -amount, // Negative for removal
        reason,
        balanceBefore: cashDrawer.currentBalance,
        balanceAfter: newBalance,
      }

      if (sessionId) {
        transactionData.session = { connect: { id: sessionId } }
      }

      await tx.cashDrawerTransaction.create({ data: transactionData })

      return updatedDrawer
    })

    revalidatePath("/dashboard/session-pos-sync")
    return {
      success: true,
      data: result,
      message: `$${amount.toFixed(2)} removed from cash drawer`
    }
  } catch (error) {
    console.error("Error removing cash from drawer:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to remove cash from drawer",
    }
  }
}

export async function getCashDrawerTransactions(stationId: string, limit: number = 50) {
  try {
    const cashDrawer = await db.cashDrawer.findFirst({
      where: { stationId },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: limit,
          include: {
            user: {
              select: { id: true, name: true, firstName: true, lastName: true }
            },
            session: {
              select: { id: true, sessionNumber: true }
            }
          }
        }
      }
    })

    if (!cashDrawer) {
      return {
        success: false,
        error: "Cash drawer not found",
      }
    }

    return {
      success: true,
      data: cashDrawer.transactions,
    }
  } catch (error) {
    console.error("Error fetching cash drawer transactions:", error)
    return {
      success: false,
      error: "Failed to fetch cash drawer transactions",
    }
  }
}

export async function performCashCount(
  stationId: string,
  userId: string,
  countedAmount: number,
  sessionId?: string
) {
  try {
    const result = await db.$transaction(async (tx) => {
      const cashDrawer = await tx.cashDrawer.findFirst({
        where: { stationId, isOpen: true }
      })

      if (!cashDrawer) {
        throw new Error("No open cash drawer found for this station")
      }

      const variance = countedAmount - cashDrawer.expectedBalance

      // Update cash drawer with counted amount
      const updatedDrawer = await tx.cashDrawer.update({
        where: { id: cashDrawer.id },
        data: {
          currentBalance: countedAmount,
        }
      })

      // Create cash count transaction
      const transactionData: any = {
        cashDrawer: { connect: { id: cashDrawer.id } },
        user: { connect: { id: userId } },
        type: "CASH_COUNT",
        amount: variance,
        reason: `Cash count - Variance: $${variance.toFixed(2)}`,
        balanceBefore: cashDrawer.currentBalance,
        balanceAfter: countedAmount,
        notes: `Expected: $${cashDrawer.expectedBalance.toFixed(2)}, Counted: $${countedAmount.toFixed(2)}, Variance: $${variance.toFixed(2)}`
      }

      if (sessionId) {
        transactionData.session = { connect: { id: sessionId } }
      }

      await tx.cashDrawerTransaction.create({ data: transactionData })

      return { drawer: updatedDrawer, variance }
    })

    revalidatePath("/dashboard/session-pos-sync")
    return {
      success: true,
      data: result,
      message: `Cash count completed. Variance: $${result.variance.toFixed(2)}`
    }
  } catch (error) {
    console.error("Error performing cash count:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to perform cash count",
    }
  }
}

// Helper function to get cash drawer status
export async function getCashDrawerStatus(stationId: string) {
  try {
    const cashDrawer = await db.cashDrawer.findFirst({
      where: { stationId },
      select: {
        id: true,
        isOpen: true,
        currentBalance: true,
        expectedBalance: true,
        // lastActivity: true,
      }
    })

    return {
      success: true,
      data: cashDrawer || {
        id: null,
        isOpen: false,
        currentBalance: 0,
        expectedBalance: 0,
        lastActivity: null,
      },
    }
  } catch (error) {
    console.error("Error fetching cash drawer status:", error)
    return {
      success: false,
      error: "Failed to fetch cash drawer status",
    }
  }
}