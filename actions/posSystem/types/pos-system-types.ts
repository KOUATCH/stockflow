export type TransactionStatus = 'PENDING' | 'PARTIAL_PAYMENT' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED'
export type PaymentMethod = 'CASH' | 'CARD' | 'CHECK' | 'GIFT_CARD' | 'STORE_CREDIT' | 'DIGITAL_WALLET' | 'BUY_NOW_PAY_LATER'
export type SessionStatus = 'ACTIVE' | 'CLOSED' | 'SUSPENDED' | 'RECONCILED'
export type TerminalStatus = 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'ERROR'

// Core POS Transaction Types
export interface POSTransaction {
  id: string
  receiptNumber: string
  sessionId: string
  terminalId: string
  locationId: string
  organizationId: string
  userId: string
  customerId?: string
  status: TransactionStatus
  subtotal: number
  taxAmount: number
  discountAmount: number
  totalAmount: number
  amountPaid: number
  changeAmount: number
  notes?: string
  metadata?: Record<string, any>
  createdAt: Date
  updatedAt: Date
  completedAt?: Date
  cancelledAt?: Date

  // Relations
  items: POSTransactionItem[]
  payments: POSPayment[]
  customer?: Customer
  user: User
  location: Location
  terminal: POSTerminal
  session: POSSession
}

export interface POSTransactionItem {
  id: string
  transactionId: string
  itemId: string
  quantity: number
  unitPrice: number
  discountAmount: number
  taxAmount: number
  lineTotal: number
  sortOrder: number
  metadata?: Record<string, any>

  // Relations
  item: Item
}

export interface POSPayment {
  id: string
  transactionId: string
  method: PaymentMethod
  amount: number
  referenceNumber?: string
  cardLastFour?: string
  cardType?: string
  authorizationCode?: string
  processorResponse?: Record<string, any>
  metadata?: Record<string, any>
  createdAt: Date
}

// POS Session Management
export interface POSSession {
  id: string
  sessionNumber: string
  terminalId: string
  locationId: string
  organizationId: string
  userId: string
  status: SessionStatus
  startTime: Date
  endTime?: Date
  openingCash: number
  closingCash?: number
  expectedCash?: number
  cashVariance?: number
  totalSales: number
  totalTransactions: number
  notes?: string
  metadata?: Record<string, any>

  // Relations
  terminal: POSTerminal
  location: Location
  user: User
  transactions: POSTransaction[]
}

// POS Terminal Configuration
export interface POSTerminal {
  id: string
  terminalNumber: string
  terminalName: string
  locationId: string
  organizationId: string
  status: TerminalStatus
  ipAddress?: string
  macAddress?: string
  hardwareInfo?: Record<string, any>
  configuration: POSTerminalConfig
  lastHeartbeat?: Date
  version: string
  capabilities: string[]

  // Relations
  location: Location
  sessions: POSSession[]
}

export interface POSTerminalConfig {
  receiptPrinter: {
    enabled: boolean
    printerName?: string
    autoprint: boolean
  }
  cashDrawer: {
    enabled: boolean
    autoOpen: boolean
  }
  scanner: {
    enabled: boolean
    scannerType: 'USB' | 'BLUETOOTH' | 'BUILT_IN'
  }
  cardReader: {
    enabled: boolean
    readerType: 'USB' | 'BLUETOOTH' | 'INTEGRATED'
  }
  display: {
    customerDisplay: boolean
    dualMonitor: boolean
    touchScreen: boolean
  }
  security: {
    requirePin: boolean
    timeout: number
    maxFailedAttempts: number
  }
  layout: {
    theme: 'LIGHT' | 'DARK' | 'AUTO'
    compactMode: boolean
    showProductImages: boolean
    categoriesPerRow: number
    itemsPerRow: number
  }
}

// Location-based Features
export interface LocationConfig {
  id: string
  locationId: string
  timezone: string
  currency: string
  taxConfiguration: TaxConfiguration
  paymentMethods: PaymentMethodConfig[]
  receiptTemplate: ReceiptTemplate
  loyaltyProgram?: LoyaltyProgramConfig
  inventory: InventoryConfig
  pricing: PricingConfig
}

export interface TaxConfiguration {
  salesTax: number
  cityTax: number
  stateTax: number
  federalTax: number
  taxInclusive: boolean
  exemptCategories: string[]
}

export interface PaymentMethodConfig {
  method: PaymentMethod
  enabled: boolean
  processorConfig?: Record<string, any>
  minimumAmount?: number
  maximumAmount?: number
  fees?: {
    fixedFee: number
    percentageFee: number
  }
}

export interface ReceiptTemplate {
  header: string
  footer: string
  logoUrl?: string
  showBarcode: boolean
  showQRCode: boolean
  customFields: ReceiptField[]
}

export interface ReceiptField {
  name: string
  label: string
  value: string
  type: 'TEXT' | 'BARCODE' | 'QR_CODE' | 'IMAGE'
  position: 'HEADER' | 'BODY' | 'FOOTER'
}

export interface LoyaltyProgramConfig {
  enabled: boolean
  pointsPerDollar: number
  dollarPerPoint: number
  tierLevels: LoyaltyTier[]
}

export interface LoyaltyTier {
  name: string
  minimumSpend: number
  discountPercentage: number
  bonusPointsMultiplier: number
}

export interface InventoryConfig {
  trackInventory: boolean
  allowNegative: boolean
  lowStockThreshold: number
  autoReorder: boolean
  reorderPoint: number
  reorderQuantity: number
}

export interface PricingConfig {
  defaultPriceLevel: string
  allowPriceOverride: boolean
  requireManagerApproval: boolean
  maxDiscountPercentage: number
}

// Enterprise Analytics
export interface POSAnalytics {
  locationId: string
  period: {
    startDate: Date
    endDate: Date
  }
  sales: {
    totalSales: number
    totalTransactions: number
    averageTransaction: number
    salesGrowth: number
    hourlyBreakdown: HourlySales[]
    categoryBreakdown: CategorySales[]
    paymentMethodBreakdown: PaymentMethodSales[]
  }
  performance: {
    transactionsPerHour: number
    averageServiceTime: number
    peakHours: string[]
    employeePerformance: EmployeePerformance[]
  }
  inventory: {
    topSellingItems: TopSellingItem[]
    lowStockItems: LowStockItem[]
    inventoryTurnover: number
  }
  customers: {
    totalCustomers: number
    newCustomers: number
    returningCustomers: number
    loyaltyProgram: LoyaltyStats
  }
}

export interface HourlySales {
  hour: number
  sales: number
  transactions: number
  averageTransaction: number
}

export interface CategorySales {
  categoryId: string
  categoryName: string
  sales: number
  transactions: number
  percentage: number
}

export interface PaymentMethodSales {
  method: PaymentMethod
  amount: number
  count: number
  percentage: number
}

export interface EmployeePerformance {
  userId: string
  userName: string
  totalSales: number
  totalTransactions: number
  averageTransaction: number
  hoursWorked: number
  salesPerHour: number
}

export interface TopSellingItem {
  itemId: string
  itemName: string
  quantitySold: number
  revenue: number
  profit: number
}

export interface LowStockItem {
  itemId: string
  itemName: string
  currentStock: number
  reorderPoint: number
  daysUntilStockout: number
}

export interface LoyaltyStats {
  totalMembers: number
  activeMembers: number
  pointsIssued: number
  pointsRedeemed: number
  averagePointsPerMember: number
}

// Transaction Creation Data
export interface CreateTransactionData {
  sessionId: string
  terminalId: string
  locationId: string
  organizationId: string
  userId: string
  customerId?: string
  items: CreateTransactionItemData[]
  notes?: string
  terminalInfo?: Record<string, any>
  customerInfo?: Record<string, any>
  employeeInfo?: Record<string, any>
}

export interface CreateTransactionItemData {
  itemId: string
  quantity: number
  unitPrice: number
  discountAmount?: number
  taxAmount?: number
  metadata?: Record<string, any>
}

// Multi-location Support
export interface LocationSyncData {
  lastSyncTime: Date
  pendingTransactions: POSTransaction[]
  inventoryUpdates: InventoryUpdate[]
  priceUpdates: PriceUpdate[]
  configurationUpdates: ConfigurationUpdate[]
}

export interface InventoryUpdate {
  itemId: string
  locationId: string
  currentLevel: number
  reservedLevel: number
  lastUpdated: Date
}

export interface PriceUpdate {
  itemId: string
  locationId: string
  price: number
  effectiveDate: Date
  priceLevel: string
}

export interface ConfigurationUpdate {
  type: 'TAX' | 'PAYMENT' | 'RECEIPT' | 'LOYALTY' | 'INVENTORY'
  data: Record<string, any>
  effectiveDate: Date
}

// Related Types (should be imported from other modules)
export interface Customer {
  id: string
  name: string
  email?: string
  phone?: string
  loyaltyNumber?: string
  priceLevel?: string
  loyaltyDiscount?: number
}

export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
}

export interface Location {
  id: string
  name: string
  address: string
  city: string
  state: string
  zipCode: string
  timezone: string
}

export interface Item {
  id: string
  name: string
  sku: string
  barcode?: string
  price: number
  cost?: number
  categoryId: string
  brandId?: string
  imageUrl?: string
  category: Category
  brand?: Brand
}

export interface Category {
  id: string
  name: string
  description?: string
  parentId?: string
}

export interface Brand {
  id: string
  name: string
  description?: string
}