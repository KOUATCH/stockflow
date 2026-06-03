// @ts-nocheck
/**
 * Integration Examples for Enterprise Error Handling
 *
 * Demonstrates how to use the comprehensive error handling patterns
 * in real StockFlow operations with enhanced safety mechanisms.
 */

import {
  dbTransaction,
  executeFinancialOperation,
  FinancialTransactionType,
  FinancialAccountType,
  executeWithCircuitBreaker,
  ServiceType,
  salesAction,
  ServerActionResult,
  ErrorCategory,
  ErrorSeverity
} from './index'

// Example 1: Enhanced Sales Transaction with Full Safety Stack
export const createSaleWithAdvancedSafety = salesAction(
  async (saleData: any): Promise<ServerActionResult<any>> => {
    const saleId = `sale_${Date.now()}`
    const organizationId = saleData.organizationId
    const userId = saleData.userId

    // Step 1: Execute financial transaction with compensation patterns
    const result = await executeFinancialOperation(
      {
        id: saleId,
        type: FinancialTransactionType.SALE,
        amount: saleData.totalAmount,
        currency: 'USD',
        reference: `SALE-${Date.now()}`,
        description: `Sale transaction for ${saleData.items.length} items`,
        organizationId,
        userId,
        customerId: saleData.customerId,
        locationId: saleData.locationId,
        sessionId: saleData.sessionId,
        metadata: {
          itemCount: saleData.items.length,
          paymentMethods: saleData.payments.map((p: any) => p.method)
        }
      },
      async (tx, transactionId) => {
        // Step 2: Use resilient database transaction
        const sale = await tx.salesOrder.create({
          data: {
            id: transactionId,
            orderNumber: `SALE-${Date.now()}`,
            customerId: saleData.customerId,
            locationId: saleData.locationId,
            organizationId,
            createdById: userId,
            subtotal: saleData.subtotal,
            taxAmount: saleData.taxAmount,
            discount: saleData.discountAmount,
            total: saleData.totalAmount,
            status: 'PENDING',
            notes: saleData.notes
          }
        })

        // Step 3: Create sale items with inventory updates
        for (const item of saleData.items) {
          await tx.salesOrderLine.create({
            data: {
              salesOrderId: sale.id,
              itemId: item.itemId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              discount: item.discountAmount || 0,
              taxAmount: item.taxAmount || 0,
              lineTotal: item.unitPrice * item.quantity - (item.discountAmount || 0) + (item.taxAmount || 0)
            }
          })

          // Update inventory with error handling
          const inventoryLevel = await tx.inventoryLevel.findFirst({
            where: { itemId: item.itemId, locationId: saleData.locationId }
          })

          if (!inventoryLevel) {
            throw new Error(`Inventory level not found for item ${item.itemId}`)
          }

          if (inventoryLevel.quantityOnHand < item.quantity) {
            throw new Error(`Insufficient inventory for item ${item.itemId}`)
          }

          await tx.inventoryLevel.update({
            where: { id: inventoryLevel.id },
            data: {
              quantityOnHand: inventoryLevel.quantityOnHand - item.quantity,
              quantityAvailable: inventoryLevel.quantityAvailable - item.quantity,
              lastTransactionAt: new Date()
            }
          })
        }

        // Step 4: Process payments with external service circuit breakers
        for (const payment of saleData.payments) {
          if (payment.method === 'card') {
            // Use circuit breaker for payment processing
            await executeWithCircuitBreaker(
              'payment-processor',
              ServiceType.PAYMENT_PROCESSOR,
              async () => {
                // Mock payment processing call
                if (Math.random() < 0.1) { // 10% failure rate for demo
                  throw new Error('Payment processor declined transaction')
                }
                return { success: true, authCode: `AUTH_${Date.now()}` }
              },
              {
                operationName: 'process_card_payment',
                organizationId,
                userId,
                requestId: transactionId,
                metadata: { amount: payment.amount, cardType: payment.cardType }
              },
              {
                enableRetry: true,
                fallback: async () => {
                  // Fallback: Mark payment as pending for manual processing
                  console.log('Payment processing failed, marking as pending for manual processing')
                  return { success: true, authCode: 'MANUAL_PENDING', requiresManualProcessing: true }
                }
              }
            )
          }

          // Create payment record
          await tx.payment.create({
            data: {
              paymentNumber: `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
              salesOrderId: sale.id,
              method: payment.method === 'cash' ? 'CASH' : 'CARD',
              amount: payment.amount,
              cardLast4: payment.cardLastFour,
              cardType: payment.cardType,
              authorizationCode: payment.authorizationCode,
              status: 'PAID'
            }
          })
        }

        // Step 5: Update sale status
        const completedSale = await tx.salesOrder.update({
          where: { id: sale.id },
          data: { status: 'COMPLETED' }
        })

        return completedSale
      },
      {
        idempotencyKey: saleId,
        journalEntries: [
          // Double-entry bookkeeping entries
          {
            accountCode: 'REVENUE_001',
            accountType: FinancialAccountType.REVENUE,
            debitAmount: 0,
            creditAmount: saleData.totalAmount,
            description: 'Sales revenue',
            reference: saleId
          },
          {
            accountCode: 'AR_001',
            accountType: FinancialAccountType.ASSET,
            debitAmount: saleData.totalAmount,
            creditAmount: 0,
            description: 'Accounts receivable',
            reference: saleId
          }
        ],
        preValidation: async () => {
          // Pre-flight checks
          if (saleData.totalAmount <= 0) {
            throw new Error('Sale amount must be positive')
          }

          // Check inventory availability
          for (const item of saleData.items) {
            const inventory = await dbTransaction(
              async (tx) => {
                return tx.inventoryLevel.findFirst({
                  where: { itemId: item.itemId, locationId: saleData.locationId }
                })
              },
              {
                operationName: 'check_inventory_availability',
                organizationId,
                userId
              }
            )

            if (!inventory || inventory.quantityOnHand < item.quantity) {
              throw new Error(`Insufficient inventory for item ${item.itemId}`)
            }
          }
        },
        postValidation: async (result) => {
          // Post-transaction validation
          if (!result.id) {
            throw new Error('Sale was not created properly')
          }

          // Send confirmation email with circuit breaker
          await executeWithCircuitBreaker(
            'email-service',
            ServiceType.EMAIL_SERVICE,
            async () => {
              console.log(`Sending sale confirmation email for sale ${result.id}`)
              // Mock email service call
              if (Math.random() < 0.05) { // 5% failure rate
                throw new Error('Email service unavailable')
              }
              return { sent: true }
            },
            {
              operationName: 'send_sale_confirmation',
              organizationId,
              userId,
              requestId: result.id,
              metadata: { saleId: result.id, customerEmail: saleData.customerEmail }
            },
            {
              fallback: async () => {
                // Fallback: Queue email for later sending
                console.log(`Queued email confirmation for later sending: sale ${result.id}`)
                return { queued: true }
              }
            }
          )
        },
        compensatingActions: [
          // Compensation actions if transaction fails
          async () => {
            console.log(`Executing compensation for failed sale ${saleId}`)
            // In a real implementation:
            // - Reverse inventory changes
            // - Void payment authorizations
            // - Clean up temporary records
          }
        ]
      }
    )

    return {
      success: true,
      data: result
    }
  },
  {
    actionName: 'createSaleWithAdvancedSafety',
    component: 'POSTerminal',
    notifyUser: true,
    notifyAdmin: false,
    businessContext: {
      domain: 'sales',
      operation: 'create',
      resourceType: 'sale',
      critical: true
    },
    affectedResources: ['sales', 'inventory', 'payments', 'financial'],
    customUserMessages: {
      [ErrorCategory.FINANCIAL]: 'Payment processing failed. Please try a different payment method.',
      [ErrorCategory.INVENTORY]: 'Some items are out of stock. Please adjust quantities or remove unavailable items.',
      [ErrorCategory.EXTERNAL_SERVICE]: 'External services are temporarily unavailable. Your sale has been saved and will be processed shortly.',
      [ErrorCategory.DATABASE]: 'Unable to complete the sale due to a system error. Please try again.'
    }
  }
)

// Example 2: Inventory Management with Database Resilience
export const adjustInventoryWithResilience = salesAction(
  async (adjustmentData: any): Promise<ServerActionResult<any>> => {
    // Use database transaction with resilience patterns
    const result = await dbTransaction(
      async (tx) => {
        const inventoryLevel = await tx.inventoryLevel.findFirst({
          where: {
            itemId: adjustmentData.itemId,
            locationId: adjustmentData.locationId
          }
        })

        if (!inventoryLevel) {
          throw new Error('Inventory level not found')
        }

        const newQuantity = inventoryLevel.quantityOnHand + adjustmentData.adjustmentQuantity

        if (newQuantity < 0) {
          throw new Error('Adjustment would result in negative inventory')
        }

        const updatedLevel = await tx.inventoryLevel.update({
          where: { id: inventoryLevel.id },
          data: {
            quantityOnHand: newQuantity,
            quantityAvailable: newQuantity,
            lastTransactionAt: new Date()
          }
        })

        // Create inventory movement record
        await tx.inventoryMovement.create({
          data: {
            itemId: adjustmentData.itemId,
            locationId: adjustmentData.locationId,
            organizationId: adjustmentData.organizationId,
            movementType: 'ADJUSTMENT',
            quantity: adjustmentData.adjustmentQuantity,
            unitCost: adjustmentData.unitCost || 0,
            reference: adjustmentData.reference || 'Manual Adjustment',
            notes: adjustmentData.notes,
            createdById: adjustmentData.userId,
            balanceBefore: inventoryLevel.quantityOnHand,
            balanceAfter: newQuantity
          }
        })

        return updatedLevel
      },
      {
        operationName: 'adjust_inventory_levels',
        organizationId: adjustmentData.organizationId,
        userId: adjustmentData.userId,
        businessContext: {
          itemId: adjustmentData.itemId,
          locationId: adjustmentData.locationId,
          adjustmentQuantity: adjustmentData.adjustmentQuantity,
          reason: adjustmentData.reason
        }
      }
    )

    return {
      success: true,
      data: result
    }
  },
  {
    actionName: 'adjustInventoryWithResilience',
    component: 'InventoryManagement',
    notifyUser: true,
    businessContext: {
      domain: 'inventory',
      operation: 'update',
      resourceType: 'inventory_level'
    }
  }
)

// Example 3: Customer Payment Processing with Full Error Handling Stack
export const processCustomerPaymentAdvanced = salesAction(
  async (paymentData: any): Promise<ServerActionResult<any>> => {
    // Use financial safety patterns for payment processing
    const result = await executeFinancialOperation(
      {
        type: FinancialTransactionType.PAYMENT,
        amount: paymentData.amount,
        currency: paymentData.currency || 'USD',
        reference: paymentData.reference,
        description: `Payment from customer ${paymentData.customerId}`,
        organizationId: paymentData.organizationId,
        userId: paymentData.userId,
        customerId: paymentData.customerId,
        metadata: {
          paymentMethod: paymentData.method,
          invoiceId: paymentData.invoiceId
        }
      },
      async (tx, transactionId) => {
        // Process payment with external service
        const paymentResult = await executeWithCircuitBreaker(
          'payment-processor',
          ServiceType.PAYMENT_PROCESSOR,
          async () => {
            // Mock payment processing
            if (Math.random() < 0.08) {
              throw new Error('Payment declined by bank')
            }
            return {
              success: true,
              transactionId: `TXN_${Date.now()}`,
              authCode: `AUTH_${Date.now()}`
            }
          },
          {
            operationName: 'process_customer_payment',
            organizationId: paymentData.organizationId,
            userId: paymentData.userId,
            requestId: transactionId,
            metadata: { amount: paymentData.amount, customerId: paymentData.customerId }
          },
          {
            enableRetry: true,
            config: {
              failureThreshold: 2,
              timeout: 15000,
              maxRetries: 3
            }
          }
        )

        // Create payment record
        const payment = await tx.payment.create({
          data: {
            paymentNumber: `PAY-${Date.now()}`,
            customerId: paymentData.customerId,
            organizationId: paymentData.organizationId,
            amount: paymentData.amount,
            method: paymentData.method,
            status: 'COMPLETED',
            referenceNumber: paymentResult.transactionId,
            authorizationCode: paymentResult.authCode,
            notes: paymentData.notes,
            processedAt: new Date()
          }
        })

        // Update customer account balance if applicable
        if (paymentData.updateAccountBalance) {
          await tx.customer.update({
            where: { id: paymentData.customerId },
            data: {
              accountBalance: {
                decrement: paymentData.amount
              },
              lastPaymentDate: new Date()
            }
          })
        }

        return payment
      },
      {
        idempotencyKey: paymentData.idempotencyKey,
        preValidation: async () => {
          // Validate payment amount and customer
          if (paymentData.amount <= 0) {
            throw new Error('Payment amount must be positive')
          }

          const customer = await dbTransaction(
            async (tx) => tx.customer.findUnique({
              where: { id: paymentData.customerId }
            }),
            {
              operationName: 'validate_customer',
              organizationId: paymentData.organizationId
            }
          )

          if (!customer) {
            throw new Error('Customer not found')
          }

          if (!customer.isActive) {
            throw new Error('Customer account is inactive')
          }
        }
      }
    )

    return {
      success: true,
      data: result
    }
  },
  {
    actionName: 'processCustomerPaymentAdvanced',
    component: 'PaymentProcessing',
    notifyUser: true,
    businessContext: {
      domain: 'financial',
      operation: 'process',
      resourceType: 'payment',
      critical: true
    }
  }
)

// Export utility function for initializing all enhanced error handling
export const initializeEnterpriseErrorHandling = async (config: {
  enableMonitoring?: boolean
  enableCircuitBreakers?: boolean
  organizationId: string
} = { organizationId: 'default' }): Promise<void> => {
  console.log('Initializing enterprise error handling...')

  try {
    // Start system monitoring if enabled
    if (config.enableMonitoring !== false) {
      const { startSystemMonitoring } = await import('./monitoring')
      await startSystemMonitoring()
      console.log('✓ System monitoring started')
    }

    // Initialize circuit breakers for common services if enabled
    if (config.enableCircuitBreakers !== false) {
      const { createCircuitBreaker } = await import('./circuit-breaker')

      // Pre-configure common circuit breakers
      createCircuitBreaker('payment-processor', ServiceType.PAYMENT_PROCESSOR)
      createCircuitBreaker('email-service', ServiceType.EMAIL_SERVICE)
      createCircuitBreaker('sms-service', ServiceType.SMS_SERVICE)
      createCircuitBreaker('inventory-api', ServiceType.INVENTORY_API)

      console.log('✓ Circuit breakers initialized')
    }

    // Perform initial health check
    const { resilientDb } = await import('./database-resilience')
    await resilientDb.performHealthCheck()
    console.log('✓ Database health check completed')

    console.log('Enterprise error handling initialization complete!')

  } catch (error) {
    console.error('Failed to initialize enterprise error handling:', error)
    throw error
  }
}
