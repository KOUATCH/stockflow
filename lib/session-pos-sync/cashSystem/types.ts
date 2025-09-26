// Type definitions for the POS system

export interface CartItem {
  id: string
  itemId: string
  name: string
  sku: string
  price: number
  quantity: number
  discount: number
  taxRate: number
  taxAmount: number
  lineTotal: number
  imageUrl?: string
}

export interface PaymentMethod {
  CASH: "CASH"
  CARD: "CARD"
  DIGITAL: "DIGITAL"
}

export interface POSSessionStatus {
  ACTIVE: "ACTIVE"
  INACTIVE: "INACTIVE"
}

export interface InventoryLevel {
  id: string
  itemId: string
  locationId: string
  quantityAvailable: number
  quantityReserved: number
  quantityOnOrder: number
  minStockLevel: number
  maxStockLevel: number
  lastUpdated: Date
}

export interface Item {
  id: string
  name: string
  sku: string
  description?: string
  sellingPrice: number
  costPrice: number
  categoryId?: string
  category?: {
    id: string
    title: string
  }
  taxRate?: {
    id: string
    rate: number
  }
  inventoryLevels?: InventoryLevel[]
  thumbnail?: string
  isActive: boolean
  minStockLevel: number
}

export interface Transaction {
  id: string
  type: "SALE" | "RETURN" | "VOID"
  amount: number
  paymentMethod: string
  timestamp: Date
  items: CartItem[]
  customerId?: string
  sessionId: string
  terminalId: string
}

export interface CashDrawerTransaction {
  id: string
  type: "OPEN" | "CLOSE" | "ADD" | "REMOVE" | "SALE"
  amount: number
  balance: number
  timestamp: Date
  reason?: string
  userId: string
  sessionId: string
}
