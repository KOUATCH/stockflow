// Mock POS Actions for demo purposes
// In a real application, these would connect to your backend API

export interface POSSession {
  id: string
  sessionNumber: string
  status: "ACTIVE" | "INACTIVE"
  startTime: string
  openingBalance: number
  totalSales: number
  transactionCount: number
  cashTotal?: number
  cardTotal?: number
  digitalTotal?: number
  cashDrawerTransactions: Array<{
    id: string
    cashDrawer: {
      id: string
      currentBalance: number
      isOpen: boolean
      lastActivity?: Date
    }
  }>
}

export interface CreatePOSSessionData {
  terminalId: string
  userId: string
  locationId: string
  organizationId: string
  openingBalance: number
}

export interface CreateSaleData {
  sessionId: string
  terminalId: string
  customerId?: string
  userId: string
  locationId: string
  organizationId: string
  lines: Array<{
    itemId: string
    quantity: number
    unitPrice: number
    discount: number
    taxRate: number
    taxAmount: number
    lineTotal: number
  }>
  subtotal: number
  taxAmount: number
  discount: number
  totalAmount: number
  payments: Array<{
    method: string
    amount: number
    referenceNumber?: string
    cardType?: string
    cardLastFour?: string
    authorizationCode?: string
  }>
  notes?: string
}

export interface CreatePaymentData {
  saleId: string
  method: string
  amount: number
  referenceNumber?: string
  cardType?: string
  cardLastFour?: string
  authorizationCode?: string
}

export interface UpdateInventoryData {
  itemId: string
  locationId: string
  quantityChange: number
  reason: string
}

export interface CreateInventoryTransactionData {
  itemId: string
  locationId: string
  transactionType: "SALE" | "ADJUSTMENT" | "TRANSFER"
  quantity: number
  unitCost: number
  totalCost: number
  referenceId?: string
  notes?: string
}

// Mock data storage (in a real app, this would be a database)
const mockSessions: POSSession[] = []
const mockSales: any[] = []
const mockPayments: any[] = []

// Generate mock session ID
const generateId = () => Math.random().toString(36).substr(2, 9)

export async function createPOSSession(data: CreatePOSSessionData) {
  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    const session: POSSession = {
      id: generateId(),
      sessionNumber: `POS-${Date.now()}`,
      status: "ACTIVE",
      startTime: new Date().toISOString(),
      openingBalance: data.openingBalance,
      totalSales: 0,
      transactionCount: 0,
      cashTotal: 0,
      cardTotal: 0,
      digitalTotal: 0,
      cashDrawerTransactions: [
        {
          id: generateId(),
          cashDrawer: {
            id: generateId(),
            currentBalance: data.openingBalance,
            isOpen: true,
            lastActivity: new Date(),
          },
        },
      ],
    }

    mockSessions.push(session)

    return {
      success: true,
      data: session,
      message: "POS session created successfully",
    }
  } catch (error) {
    return {
      success: false,
      error: "Failed to create POS session",
      data: null,
    }
  }
}

export async function getActivePOSSession(terminalId: string) {
  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 200))

    // Find active session for terminal (mock logic)
    const activeSession = mockSessions.find((session) => session.status === "ACTIVE" && session.id)

    if (activeSession) {
      return {
        success: true,
        data: activeSession,
        message: "Active session found",
      }
    }

    return {
      success: false,
      data: null,
      message: "No active session found",
    }
  } catch (error) {
    return {
      success: false,
      error: "Failed to get active session",
      data: null,
    }
  }
}

export async function createSale(data: CreateSaleData) {
  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800))

    const saleId = generateId()
    const sale = {
      id: saleId,
      ...data,
      createdAt: new Date().toISOString(),
      status: "COMPLETED",
    }

    mockSales.push(sale)

    // Update session totals
    const session = mockSessions.find((s) => s.id === data.sessionId)
    if (session) {
      session.totalSales += data.totalAmount
      session.transactionCount += 1

      // Update payment method totals
      data.payments.forEach((payment) => {
        switch (payment.method) {
          case "CASH":
            session.cashTotal = (session.cashTotal || 0) + payment.amount
            break
          case "CARD":
            session.cardTotal = (session.cardTotal || 0) + payment.amount
            break
          case "DIGITAL":
            session.digitalTotal = (session.digitalTotal || 0) + payment.amount
            break
        }
      })
    }

    return {
      success: true,
      saleId,
      data: sale,
      message: "Sale created successfully",
    }
  } catch (error) {
    return {
      success: false,
      error: "Failed to create sale",
      saleId: null,
    }
  }
}

export async function createPayment(data: CreatePaymentData) {
  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    const payment = {
      id: generateId(),
      ...data,
      createdAt: new Date().toISOString(),
      status: "COMPLETED",
    }

    mockPayments.push(payment)

    return {
      success: true,
      data: payment,
      message: "Payment processed successfully",
    }
  } catch (error) {
    return {
      success: false,
      error: "Failed to process payment",
      data: null,
    }
  }
}

export async function updateInventoryLevels(data: UpdateInventoryData[]) {
  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 400))

    // Mock inventory update logic
    console.log("Updating inventory levels:", data)

    return {
      success: true,
      data: data,
      message: "Inventory levels updated successfully",
    }
  } catch (error) {
    return {
      success: false,
      error: "Failed to update inventory levels",
      data: null,
    }
  }
}

export async function createInventoryTransactions(data: CreateInventoryTransactionData[]) {
  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    const transactions = data.map((item) => ({
      id: generateId(),
      ...item,
      createdAt: new Date().toISOString(),
    }))

    console.log("Creating inventory transactions:", transactions)

    return {
      success: true,
      data: transactions,
      message: "Inventory transactions created successfully",
    }
  } catch (error) {
    return {
      success: false,
      error: "Failed to create inventory transactions",
      data: null,
    }
  }
}

// Helper function to close POS session (for completeness)
export async function closePOSSession(sessionId: string, closingBalance: number) {
  try {
    await new Promise((resolve) => setTimeout(resolve, 500))

    const session = mockSessions.find((s) => s.id === sessionId)
    if (session) {
      session.status = "INACTIVE"
    }

    return {
      success: true,
      data: session,
      message: "POS session closed successfully",
    }
  } catch (error) {
    return {
      success: false,
      error: "Failed to close POS session",
      data: null,
    }
  }
}

// Helper function to get session summary
export async function getSessionSummary(sessionId: string) {
  try {
    const session = mockSessions.find((s) => s.id === sessionId)
    const sessionSales = mockSales.filter((sale) => sale.sessionId === sessionId)

    return {
      success: true,
      data: {
        session,
        sales: sessionSales,
        totalSales: session?.totalSales || 0,
        transactionCount: session?.transactionCount || 0,
      },
      message: "Session summary retrieved successfully",
    }
  } catch (error) {
    return {
      success: false,
      error: "Failed to get session summary",
      data: null,
    }
  }
}
