"use server"

import { db } from "@/prisma/db"
import { revalidatePath } from "next/cache"
import { generateReceiptNumber, generateTransactionId } from "../utils/pos-utils"
import type {
  POSTransaction,
  POSTransactionItem,
  POSPayment,
  CreateTransactionData,
  TransactionStatus,
  PaymentMethod
} from "../types/pos-system-types"

/**
 * Create a new POS transaction with enterprise-level features
 */
export async function createTransaction(data: CreateTransactionData): Promise<{
  success: boolean
  transaction?: POSTransaction
  error?: string
}> {
  try {
    // Validate session and terminal
    const session = await validateSession(data.sessionId, data.terminalId)
    if (!session.isValid) {
      return { success: false, error: session.error }
    }

    // Validate inventory availability
    const inventoryCheck = await validateInventoryAvailability(data.items, data.locationId)
    if (!inventoryCheck.isValid) {
      return { success: false, error: inventoryCheck.error }
    }

    // Calculate totals with advanced pricing
    const calculations = await calculateTransactionTotals(data.items, data.locationId, data.customerId)

    const transactionId = generateTransactionId()
    const receiptNumber = generateReceiptNumber()

    // Create transaction in database
    const transaction = await db.$transaction(async (tx) => {
      // Create main transaction record
      const newTransaction = await tx.posTransaction.create({
        data: {
          id: transactionId,
          receiptNumber,
          sessionId: data.sessionId,
          terminalId: data.terminalId,
          locationId: data.locationId,
          organizationId: data.organizationId,
          userId: data.userId,
          customerId: data.customerId,
          status: 'PENDING' as TransactionStatus,
          subtotal: calculations.subtotal,
          taxAmount: calculations.taxAmount,
          discountAmount: calculations.discountAmount,
          totalAmount: calculations.totalAmount,
          amountPaid: 0,
          changeAmount: 0,
          notes: data.notes,
          metadata: {
            terminalInfo: data.terminalInfo,
            customerInfo: data.customerInfo,
            employeeInfo: data.employeeInfo
          }
        }
      })

      // Create transaction items
      const transactionItems = await Promise.all(
        data.items.map((item, index) =>
          tx.posTransactionItem.create({
            data: {
              transactionId: newTransaction.id,
              itemId: item.itemId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              discountAmount: item.discountAmount || 0,
              taxAmount: item.taxAmount || 0,
              lineTotal: item.quantity * item.unitPrice - (item.discountAmount || 0) + (item.taxAmount || 0),
              sortOrder: index + 1,
              metadata: item.metadata
            }
          })
        )
      )

      // Update inventory levels
      await updateInventoryLevels(tx, data.items, data.locationId, 'RESERVE')

      return { ...newTransaction, items: transactionItems }
    })

    revalidatePath('/dashboard/pos')

    return {
      success: true,
      transaction: transaction as POSTransaction
    }

  } catch (error) {
    console.error('Error creating POS transaction:', error)
    return {
      success: false,
      error: 'Failed to create transaction'
    }
  }
}

/**
 * Process payment for a transaction
 */
export async function processPayment(
  transactionId: string,
  payments: POSPayment[]
): Promise<{
  success: boolean
  transaction?: POSTransaction
  error?: string
}> {
  try {
    const transaction = await db.posTransaction.findUnique({
      where: { id: transactionId },
      include: { items: true, payments: true }
    })

    if (!transaction) {
      return { success: false, error: 'Transaction not found' }
    }

    const totalPaymentAmount = payments.reduce((sum, payment) => sum + payment.amount, 0)
    const changeAmount = Math.max(0, totalPaymentAmount - transaction.totalAmount)

    // Process each payment
    const updatedTransaction = await db.$transaction(async (tx) => {
      // Create payment records
      await Promise.all(
        payments.map(payment =>
          tx.posPayment.create({
            data: {
              transactionId,
              method: payment.method,
              amount: payment.amount,
              referenceNumber: payment.referenceNumber,
              cardLastFour: payment.cardLastFour,
              cardType: payment.cardType,
              authorizationCode: payment.authorizationCode,
              processorResponse: payment.processorResponse,
              metadata: payment.metadata
            }
          })
        )
      )

      // Update transaction status
      const updatedTx = await tx.posTransaction.update({
        where: { id: transactionId },
        data: {
          status: totalPaymentAmount >= transaction.totalAmount ? 'COMPLETED' : 'PARTIAL_PAYMENT',
          amountPaid: totalPaymentAmount,
          changeAmount,
          completedAt: totalPaymentAmount >= transaction.totalAmount ? new Date() : null
        },
        include: { items: true, payments: true }
      })

      // Finalize inventory if fully paid
      if (totalPaymentAmount >= transaction.totalAmount) {
        await updateInventoryLevels(tx, transaction.items, transaction.locationId, 'FINALIZE')
      }

      return updatedTx
    })

    revalidatePath('/dashboard/pos')

    return {
      success: true,
      transaction: updatedTransaction as POSTransaction
    }

  } catch (error) {
    console.error('Error processing payment:', error)
    return {
      success: false,
      error: 'Failed to process payment'
    }
  }
}

/**
 * Cancel/void a transaction
 */
export async function cancelTransaction(transactionId: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const transaction = await db.posTransaction.findUnique({
      where: { id: transactionId },
      include: { items: true }
    })

    if (!transaction) {
      return { success: false, error: 'Transaction not found' }
    }

    if (transaction.status === 'COMPLETED') {
      return { success: false, error: 'Cannot cancel completed transaction' }
    }

    await db.$transaction(async (tx) => {
      // Update transaction status
      await tx.posTransaction.update({
        where: { id: transactionId },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date()
        }
      })

      // Release reserved inventory
      await updateInventoryLevels(tx, transaction.items, transaction.locationId, 'RELEASE')
    })

    revalidatePath('/dashboard/pos')

    return { success: true }

  } catch (error) {
    console.error('Error cancelling transaction:', error)
    return {
      success: false,
      error: 'Failed to cancel transaction'
    }
  }
}

/**
 * Get transaction details
 */
export async function getTransaction(transactionId: string): Promise<POSTransaction | null> {
  try {
    const transaction = await db.posTransaction.findUnique({
      where: { id: transactionId },
      include: {
        items: {
          include: {
            item: {
              include: {
                category: true,
                brand: true
              }
            }
          }
        },
        payments: true,
        customer: true,
        user: true,
        location: true,
        terminal: true,
        session: true
      }
    })

    return transaction as POSTransaction

  } catch (error) {
    console.error('Error fetching transaction:', error)
    return null
  }
}

/**
 * Get transactions for a session
 */
export async function getSessionTransactions(sessionId: string): Promise<POSTransaction[]> {
  try {
    const transactions = await db.posTransaction.findMany({
      where: { sessionId },
      include: {
        items: {
          include: {
            item: true
          }
        },
        payments: true,
        customer: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return transactions as POSTransaction[]

  } catch (error) {
    console.error('Error fetching session transactions:', error)
    return []
  }
}

// Helper functions (not exported as they are internal)

/**
 * Validate POS session and terminal
 */
async function validateSession(sessionId: string, terminalId: string) {
  try {
    const session = await db.posSession.findUnique({
      where: { id: sessionId },
      include: { terminal: true }
    })

    if (!session) {
      return { isValid: false, error: 'Invalid session' }
    }

    if (session.status !== 'ACTIVE') {
      return { isValid: false, error: 'Session is not active' }
    }

    if (session.terminalId !== terminalId) {
      return { isValid: false, error: 'Terminal mismatch' }
    }

    return { isValid: true, session }

  } catch (error) {
    return { isValid: false, error: 'Session validation failed' }
  }
}

/**
 * Validate inventory availability
 */
async function validateInventoryAvailability(items: POSTransactionItem[], locationId: string) {
  try {
    for (const item of items) {
      const inventory = await db.inventoryLevel.findFirst({
        where: {
          itemId: item.itemId,
          locationId: locationId
        }
      })

      if (!inventory) {
        return { isValid: false, error: `Item ${item.itemId} not found in inventory` }
      }

      if (inventory.currentLevel < item.quantity) {
        return { isValid: false, error: `Insufficient inventory for item ${item.itemId}` }
      }
    }

    return { isValid: true }

  } catch (error) {
    return { isValid: false, error: 'Inventory validation failed' }
  }
}

/**
 * Calculate transaction totals with advanced pricing
 */
async function calculateTransactionTotals(
  items: POSTransactionItem[],
  locationId: string,
  customerId?: string
) {
  let subtotal = 0
  let totalTax = 0
  let totalDiscount = 0

  // Get tax rates for location
  const taxRates = await getTaxRates(locationId)

  // Get customer pricing if applicable
  const customerPricing = customerId ? await getCustomerPricing(customerId) : null

  for (const item of items) {
    const itemSubtotal = item.quantity * item.unitPrice
    subtotal += itemSubtotal

    // Calculate item-specific tax
    const itemTax = itemSubtotal * (taxRates.salesTax / 100)
    totalTax += itemTax

    // Apply customer-specific discounts
    if (customerPricing?.discountPercentage) {
      const itemDiscount = itemSubtotal * (customerPricing.discountPercentage / 100)
      totalDiscount += itemDiscount
    }
  }

  const totalAmount = subtotal + totalTax - totalDiscount

  return {
    subtotal,
    taxAmount: totalTax,
    discountAmount: totalDiscount,
    totalAmount
  }
}

/**
 * Get tax rates for location
 */
async function getTaxRates(locationId: string) {
  // Mock implementation - replace with actual tax calculation
  return {
    salesTax: 8.5, // 8.5%
    cityTax: 1.0,  // 1.0%
    stateTax: 6.5  // 6.5%
  }
}

/**
 * Get customer-specific pricing
 */
async function getCustomerPricing(customerId: string) {
  try {
    const customer = await db.customer.findUnique({
      where: { id: customerId }
    })

    return {
      discountPercentage: customer?.loyaltyDiscount || 0,
      priceLevel: customer?.priceLevel || 'STANDARD'
    }
  } catch (error) {
    return null
  }
}

/**
 * Update inventory levels
 */
async function updateInventoryLevels(
  tx: any,
  items: POSTransactionItem[],
  locationId: string,
  action: 'RESERVE' | 'FINALIZE' | 'RELEASE'
) {
  for (const item of items) {
    if (action === 'RESERVE') {
      // Reserve inventory
      await tx.inventoryLevel.update({
        where: {
          itemId_locationId: {
            itemId: item.itemId,
            locationId: locationId
          }
        },
        data: {
          reservedLevel: { increment: item.quantity }
        }
      })
    } else if (action === 'FINALIZE') {
      // Finalize sale - reduce current and reserved levels
      await tx.inventoryLevel.update({
        where: {
          itemId_locationId: {
            itemId: item.itemId,
            locationId: locationId
          }
        },
        data: {
          currentLevel: { decrement: item.quantity },
          reservedLevel: { decrement: item.quantity }
        }
      })
    } else if (action === 'RELEASE') {
      // Release reserved inventory
      await tx.inventoryLevel.update({
        where: {
          itemId_locationId: {
            itemId: item.itemId,
            locationId: locationId
          }
        },
        data: {
          reservedLevel: { decrement: item.quantity }
        }
      })
    }
  }
}