// Enhanced mock database implementation for modern POS/Inventory/Financial Management System
// This replaces Prisma with in-memory data storage matching the new schema

// ===== CORE TYPES =====
export interface Organization {
  id: string
  name: string
  slug: string
  industry?: string
  country?: string
  state?: string
  address?: string
  currency: string
  timezone: string
  inventoryStartDate?: Date
  fiscalYearStart?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Location {
  id: string
  name: string
  code: string
  type: LocationType
  address?: string
  phone?: string
  email?: string
  isActive: boolean
  isDefault: boolean
  organizationId: string
  managerId?: string
  allowNegativeStock: boolean
  requiresApproval: boolean
  createdAt: Date
  updatedAt: Date
}

export enum LocationType {
  WAREHOUSE = "WAREHOUSE",
  STORE = "STORE",
  DISTRIBUTION_CENTER = "DISTRIBUTION_CENTER",
  SUPPLIER = "SUPPLIER",
  CUSTOMER = "CUSTOMER",
  MANUFACTURING = "MANUFACTURING",
  QUARANTINE = "QUARANTINE",
  DAMAGED = "DAMAGED",
  TRANSIT = "TRANSIT",
  VIRTUAL = "VIRTUAL",
}

export interface Category {
  id: string
  title: string
  slug: string
  description?: string
  imageUrl?: string
  parentId?: string
  isActive: boolean
  organizationId: string
  createdAt: Date
  updatedAt: Date
}

export interface Brand {
  id: string
  brandName: string
  slug: string
  description?: string
  logoUrl?: string
  isActive: boolean
  organizationId: string
  createdAt: Date
  updatedAt: Date
}

export interface Unit {
  id: string
  name: string
  symbol: string
  type: UnitType
  baseUnit?: string
  conversionRate?: number
  isActive: boolean
  organizationId: string
  createdAt: Date
  updatedAt: Date
}

export enum UnitType {
  QUANTITY = "QUANTITY",
  WEIGHT = "WEIGHT",
  VOLUME = "VOLUME",
  LENGTH = "LENGTH",
  AREA = "AREA",
  TIME = "TIME",
}

export interface TaxRate {
  id: string
  taxRateName: string
  rate: number
  type: TaxType
  isActive: boolean
  organizationId: string
  createdAt: Date
  updatedAt: Date
}

export enum TaxType {
  SALES = "SALES",
  VAT = "VAT",
  GST = "GST",
  EXCISE = "EXCISE",
  IMPORT = "IMPORT",
  EXPORT = "EXPORT",
}

export interface Item {
  id: string
  name: string
  slug: string
  sku: string
  barcode?: string
  description?: string
  imageUrls: string
  thumbnail?: string
  upc?: string
  ean?: string
  mpn?: string
  isbn?: string
  dimensions?: string
  weight?: number
  color?: string
  size?: string
  costPrice: number
  sellingPrice: number
  msrp?: number
  trackInventory: boolean
  trackSerialNumbers: boolean
  trackBatches: boolean
  trackExpiry: boolean
  minStockLevel: number
  maxStockLevel?: number
  reorderLevel: number
  reorderQuantity?: number
  isActive: boolean
  isDiscontinued: boolean
  organizationId: string
  categoryId?: string
  brandId?: string
  unitId?: string
  taxRateId?: string
  createdAt: Date
  updatedAt: Date
}

export interface InventoryLevel {
  id: string
  itemId: string
  locationId: string
  quantityOnHand: number
  quantityReserved: number
  quantityAvailable: number
  quantityInTransit: number
  quantityOnOrder: number
  reorderPoint: number
  averageCost: number
  totalValue: number
  lastCountDate?: Date
  lastTransactionAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface Customer {
  id: string
  name: string
  code?: string
  email?: string
  phone?: string
  address?: string
  taxId?: string
  creditLimit?: number
  paymentTerms?: number
  notes?: string
  isActive: boolean
  organizationId: string
  createdAt: Date
  updatedAt: Date
}

// ===== POS SYSTEM =====
export interface POSStation {
  id: string
  terminalNumber: string
  name: string
  isActive: boolean
  hasCashDrawer: boolean
  locationId: string
  organizationId: string
  currentSessionId?: string
  createdAt: Date
  updatedAt: Date
}

export interface POSSession {
  id: string
  sessionNumber: string
  status: POSSessionStatus
  startTime: Date
  endTime?: Date
  terminalId: string
  locationId: string
  userId: string
  openingBalance: number
  closingBalance?: number
  expectedBalance?: number
  variance?: number
  totalSales: number
  totalTax: number
  totalDiscount: number
  transactionCount: number
  cashTotal: number
  cardTotal: number
  digitalTotal: number
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export enum POSSessionStatus {
  ACTIVE = "ACTIVE",
  SUSPENDED = "SUSPENDED",
  CLOSED = "CLOSED",
  RECONCILED = "RECONCILED",
}

export interface CashDrawer {
  id: string
  name: string
  currentBalance: number
  isOpen: boolean
  locationId: string
  createdAt: Date
  updatedAt: Date
}

export interface cashDrawerTransaction {
  id: string
  type: cashDrawerTransactionType
  amount: number
  reason?: string
  notes?: string
  cashDrawerId: string
  sessionId?: string
  userId: string
  balanceBefore: number
  balanceAfter: number
  createdAt: Date
}

export enum cashDrawerTransactionType {
  OPENING_BALANCE = "OPENING_BALANCE",
  SALE = "SALE",
  RETURN = "RETURN",
  CASH_IN = "CASH_IN",
  CASH_OUT = "CASH_OUT",
  CLOSING_BALANCE = "CLOSING_BALANCE",
  RECONCILIATION = "RECONCILIATION",
  REFUND = "REFUND",
  PAYOUT = "PAYOUT",
}

// ===== SALES SYSTEM =====
export interface SalesOrder {
  id: string
  orderNumber: string
  status: SalesOrderStatus
  orderDate: Date
  dueDate?: Date
  notes?: string
  subtotal: number
  taxAmount: number
  shippingCost: number
  discount: number
  total: number
  paymentStatus: PaymentStatus
  customerId: string
  locationId: string
  organizationId: string
  createdById?: string
  terminalId?: string
  sessionId?: string
  createdAt: Date
  updatedAt: Date
}

export enum SalesOrderStatus {
  DRAFT = "DRAFT",
  CONFIRMED = "CONFIRMED",
  PROCESSING = "PROCESSING",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  RETURNED = "RETURNED",
}

export interface SalesOrderLine {
  id: string
  salesOrderId: string
  itemId: string
  quantity: number
  unitPrice: number
  discount: number
  taxRate: number
  taxAmount: number
  lineTotal: number
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface Payment {
  id: string
  paymentNumber: string
  amount: number
  method: PaymentMethod
  status: PaymentStatus
  salesOrderId?: string
  cardType?: string
  cardLast4?: string
  transactionId?: string
  authorizationCode?: string
  digitalWalletType?: string
  digitalTransactionId?: string
  cashTendered?: number
  changeGiven?: number
  processedAt?: Date
  processorResponse?: string
  processedById?: string
  refundedAmount: number
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export enum PaymentMethod {
  CASH = "CASH",
  DIGITAL = "DIGITAL",
  CARD = "CARD",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  PARTIAL = "PARTIAL",
  PAID = "PAID",
  REFUNDED = "REFUNDED",
  CANCELLED = "CANCELLED",
}

// ===== REPORTING =====
export interface DailySalesReport {
  id: string
  date: Date
  locationId: string
  organizationId: string
  totalRevenue: number
  totalCost: number
  grossProfit: number
  grossMargin: number
  totalQuantitySold: number
  totalTransactions: number
  averageTransactionValue: number
  itemsSold: number
  cashSales: number
  cardSales: number
  digitalSales: number
  openingBalance: number
  closingBalance: number
  cashIn: number
  cashOut: number
  variance: number
  reportGeneratedAt: Date
  reportGeneratedBy?: string
  isFinalized: boolean
  notes?: string
}

// ===== MOCK DATABASE CLASS =====
class MockDatabase {
  private organizations: Organization[] = [
    {
      id: "org-1",
      name: "Demo Retail Store",
      slug: "demo-retail-store",
      industry: "Retail",
      country: "USA",
      state: "CA",
      address: "123 Main St, San Francisco, CA 94102",
      currency: "USD",
      timezone: "America/Los_Angeles",
      inventoryStartDate: new Date("2024-01-01"),
      fiscalYearStart: "01-01",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]

  private locations: Location[] = [
    {
      id: "loc-1",
      name: "Main Store",
      code: "MAIN-001",
      type: LocationType.STORE,
      address: "123 Main St, San Francisco, CA 94102",
      phone: "(555) 123-4567",
      email: "main@demostore.com",
      isActive: true,
      isDefault: true,
      organizationId: "org-1",
      managerId: "user-2",
      allowNegativeStock: false,
      requiresApproval: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "loc-2",
      name: "Warehouse",
      code: "WH-001",
      type: LocationType.WAREHOUSE,
      address: "456 Industrial Blvd, San Francisco, CA 94103",
      phone: "(555) 123-4568",
      email: "warehouse@demostore.com",
      isActive: true,
      isDefault: false,
      organizationId: "org-1",
      allowNegativeStock: false,
      requiresApproval: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]

  private categories: Category[] = [
    {
      id: "cat-1",
      title: "Beverages",
      slug: "beverages",
      description: "Hot and cold beverages",
      imageUrl: "/assorted-beverages.png",
      isActive: true,
      organizationId: "org-1",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "cat-2",
      title: "Food",
      slug: "food",
      description: "Fresh food items",
      imageUrl: "/diverse-food-spread.png",
      isActive: true,
      organizationId: "org-1",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "cat-3",
      title: "Snacks",
      slug: "snacks",
      description: "Packaged snacks and treats",
      imageUrl: "/variety-of-snacks.png",
      isActive: true,
      organizationId: "org-1",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]

  private brands: Brand[] = [
    {
      id: "brand-1",
      brandName: "Premium Coffee Co.",
      slug: "premium-coffee-co",
      description: "Premium coffee products",
      logoUrl: "/coffee-logo.png",
      isActive: true,
      organizationId: "org-1",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "brand-2",
      brandName: "Fresh Foods Inc.",
      slug: "fresh-foods-inc",
      description: "Fresh food products",
      logoUrl: "/food-logo.png",
      isActive: true,
      organizationId: "org-1",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]

  private units: Unit[] = [
    {
      id: "unit-1",
      name: "Each",
      symbol: "ea",
      type: UnitType.QUANTITY,
      isActive: true,
      organizationId: "org-1",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "unit-2",
      name: "Pound",
      symbol: "lb",
      type: UnitType.WEIGHT,
      isActive: true,
      organizationId: "org-1",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]

  private taxRates: TaxRate[] = [
    {
      id: "tax-1",
      taxRateName: "Standard Sales Tax",
      rate: 8.75,
      type: TaxType.SALES,
      isActive: true,
      organizationId: "org-1",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]

  private items: Item[] = [
    {
      id: "item-1",
      name: "Premium Coffee",
      slug: "premium-coffee",
      sku: "COFFEE-001",
      barcode: "1234567890123",
      description: "Premium roasted coffee beans",
      imageUrls: "/steaming-coffee-cup.png",
      thumbnail: "/steaming-coffee-cup.png",
      upc: "123456789012",
      dimensions: "10x5x3 inches",
      weight: 1.0,
      color: "Brown",
      size: "Medium",
      costPrice: 1.5,
      sellingPrice: 3.99,
      msrp: 4.99,
      trackInventory: true,
      trackSerialNumbers: false,
      trackBatches: true,
      trackExpiry: true,
      minStockLevel: 10,
      maxStockLevel: 100,
      reorderLevel: 20,
      reorderQuantity: 50,
      isActive: true,
      isDiscontinued: false,
      organizationId: "org-1",
      categoryId: "cat-1",
      brandId: "brand-1",
      unitId: "unit-1",
      taxRateId: "tax-1",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "item-2",
      name: "Fresh Sandwich",
      slug: "fresh-sandwich",
      sku: "SAND-001",
      barcode: "1234567890124",
      description: "Fresh made sandwich",
      imageUrls: "/classic-sandwich.png",
      thumbnail: "/classic-sandwich.png",
      costPrice: 4.0,
      sellingPrice: 8.99,
      msrp: 9.99,
      trackInventory: true,
      trackSerialNumbers: false,
      trackBatches: false,
      trackExpiry: true,
      minStockLevel: 5,
      maxStockLevel: 50,
      reorderLevel: 10,
      reorderQuantity: 25,
      isActive: true,
      isDiscontinued: false,
      organizationId: "org-1",
      categoryId: "cat-2",
      brandId: "brand-2",
      unitId: "unit-1",
      taxRateId: "tax-1",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "item-3",
      name: "Energy Drink",
      slug: "energy-drink",
      sku: "ENERGY-001",
      barcode: "1234567890125",
      description: "High energy drink",
      imageUrls: "/energy-drink.png",
      thumbnail: "/energy-drink.png",
      costPrice: 1.25,
      sellingPrice: 2.99,
      msrp: 3.49,
      trackInventory: true,
      trackSerialNumbers: false,
      trackBatches: true,
      trackExpiry: true,
      minStockLevel: 15,
      maxStockLevel: 200,
      reorderLevel: 30,
      reorderQuantity: 100,
      isActive: true,
      isDiscontinued: false,
      organizationId: "org-1",
      categoryId: "cat-1",
      brandId: "brand-1",
      unitId: "unit-1",
      taxRateId: "tax-1",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]

  private inventoryLevels: InventoryLevel[] = [
    {
      id: "inv-1",
      itemId: "item-1",
      locationId: "loc-1",
      quantityOnHand: 85,
      quantityReserved: 5,
      quantityAvailable: 80,
      quantityInTransit: 0,
      quantityOnOrder: 50,
      reorderPoint: 20,
      averageCost: 1.5,
      totalValue: 127.5,
      lastCountDate: new Date(),
      lastTransactionAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "inv-2",
      itemId: "item-2",
      locationId: "loc-1",
      quantityOnHand: 25,
      quantityReserved: 2,
      quantityAvailable: 23,
      quantityInTransit: 0,
      quantityOnOrder: 0,
      reorderPoint: 10,
      averageCost: 4.0,
      totalValue: 100.0,
      lastCountDate: new Date(),
      lastTransactionAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "inv-3",
      itemId: "item-3",
      locationId: "loc-1",
      quantityOnHand: 150,
      quantityReserved: 10,
      quantityAvailable: 140,
      quantityInTransit: 0,
      quantityOnOrder: 100,
      reorderPoint: 30,
      averageCost: 1.25,
      totalValue: 187.5,
      lastCountDate: new Date(),
      lastTransactionAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]

  private customers: Customer[] = [
    {
      id: "cust-1",
      name: "Walk-in Customer",
      code: "WALK-IN",
      isActive: true,
      organizationId: "org-1",
      paymentTerms: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "cust-2",
      name: "John Smith",
      code: "CUST-001",
      email: "john.smith@email.com",
      phone: "(555) 987-6543",
      address: "789 Customer St, San Francisco, CA 94104",
      isActive: true,
      organizationId: "org-1",
      paymentTerms: 30,
      creditLimit: 1000.0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]

  private posStations: POSStation[] = [
    {
      id: "pos-1",
      terminalNumber: "TERM-001",
      name: "Main Register",
      isActive: true,
      hasCashDrawer: true,
      locationId: "loc-1",
      organizationId: "org-1",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "pos-2",
      terminalNumber: "TERM-002",
      name: "Express Register",
      isActive: true,
      hasCashDrawer: true,
      locationId: "loc-1",
      organizationId: "org-1",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]

  private cashDrawers: CashDrawer[] = [
    {
      id: "drawer-1",
      name: "Main Cash Drawer",
      currentBalance: 250.0,
      isOpen: false,
      locationId: "loc-1",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "drawer-2",
      name: "Express Cash Drawer",
      currentBalance: 150.0,
      isOpen: false,
      locationId: "loc-1",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]

  private posSessions: POSSession[] = []
  private cashDrawerTransactions: cashDrawerTransaction[] = []
  private salesOrders: SalesOrder[] = []
  private salesOrderLines: SalesOrderLine[] = []
  private payments: Payment[] = []
  private dailySalesReports: DailySalesReport[] = []
  private users: any[] = [
    {
      id: "user-1",
      firstName: "Demo",
      lastName: "User",
      email: "demo@example.com",
      organizationId: "org-1",
      isActive: true,
    },
  ]

  // ===== DATABASE OPERATIONS =====

  // Organization operations
  organization = {
    findMany: async ({ where }: { where?: { id?: string } } = {}) => {
      if (where?.id) {
        return this.organizations.filter((o) => o.id === where.id)
      }
      return this.organizations
    },
    findUnique: async ({ where }: { where: { id?: string; slug?: string } }) => {
      return this.organizations.find((o) => o.id === where.id || o.slug === where.slug) || null
    },
  }

  // Location operations
  location = {
    findMany: async ({ where }: { where?: { organizationId?: string; isActive?: boolean } } = {}) => {
      let filtered = this.locations
      if (where?.organizationId) {
        filtered = filtered.filter((l) => l.organizationId === where.organizationId)
      }
      if (where?.isActive !== undefined) {
        filtered = filtered.filter((l) => l.isActive === where.isActive)
      }
      return filtered
    },
    findUnique: async ({ where }: { where: { id: string } }) => {
      return this.locations.find((l) => l.id === where.id) || null
    },
  }

  // Category operations
  category = {
    findMany: async ({ where }: { where?: { organizationId?: string; isActive?: boolean } } = {}) => {
      let filtered = this.categories
      if (where?.organizationId) {
        filtered = filtered.filter((c) => c.organizationId === where.organizationId)
      }
      if (where?.isActive !== undefined) {
        filtered = filtered.filter((c) => c.isActive === where.isActive)
      }
      return filtered
    },
  }

  // Brand operations
  brand = {
    findMany: async ({ where }: { where?: { organizationId?: string; isActive?: boolean } } = {}) => {
      let filtered = this.brands
      if (where?.organizationId) {
        filtered = filtered.filter((b) => b.organizationId === where.organizationId)
      }
      if (where?.isActive !== undefined) {
        filtered = filtered.filter((b) => b.isActive === where.isActive)
      }
      return filtered
    },
  }

  // Unit operations
  unit = {
    findMany: async ({ where }: { where?: { organizationId?: string; isActive?: boolean } } = {}) => {
      let filtered = this.units
      if (where?.organizationId) {
        filtered = filtered.filter((u) => u.organizationId === where.organizationId)
      }
      if (where?.isActive !== undefined) {
        filtered = filtered.filter((u) => u.isActive === where.isActive)
      }
      return filtered
    },
  }

  // Tax rate operations
  taxRate = {
    findMany: async ({ where }: { where?: { organizationId?: string; isActive?: boolean } } = {}) => {
      let filtered = this.taxRates
      if (where?.organizationId) {
        filtered = filtered.filter((t) => t.organizationId === where.organizationId)
      }
      if (where?.isActive !== undefined) {
        filtered = filtered.filter((t) => t.isActive === where.isActive)
      }
      return filtered
    },
  }

  // Item operations
  item = {
    findMany: async ({
      where,
      include,
      skip = 0,
      take = 50,
      orderBy,
    }: {
      where?: {
        organizationId?: string
        isActive?: boolean
        categoryId?: string
        brandId?: string
        name?: { contains?: string; mode?: string }
        sku?: { contains?: string; mode?: string }
        barcode?: { contains?: string; mode?: string }
      }
      include?: {
        category?: boolean
        brand?: boolean
        unit?: boolean
        taxRate?: boolean
        inventoryLevels?: boolean | { where?: { locationId?: string } }
      }
      skip?: number
      take?: number
      orderBy?: { [key: string]: "asc" | "desc" }[]
    } = {}) => {
      if (!this.items) {
        console.error("[v0] Items array is undefined in mock database")
        return []
      }

      let filtered = [...this.items]

      if (where?.organizationId) {
        filtered = filtered.filter((i) => i.organizationId === where.organizationId)
      }
      if (where?.isActive !== undefined) {
        filtered = filtered.filter((i) => i.isActive === where.isActive)
      }
      if (where?.categoryId) {
        filtered = filtered.filter((i) => i.categoryId === where.categoryId)
      }
      if (where?.brandId) {
        filtered = filtered.filter((i) => i.brandId === where.brandId)
      }
      if (where?.name?.contains) {
        const searchTerm = where.name.contains.toLowerCase()
        filtered = filtered.filter((i) => i.name.toLowerCase().includes(searchTerm))
      }
      if (where?.sku?.contains) {
        const searchTerm = where.sku.contains.toLowerCase()
        filtered = filtered.filter((i) => i.sku.toLowerCase().includes(searchTerm))
      }
      if (where?.barcode?.contains) {
        const searchTerm = where.barcode.contains.toLowerCase()
        filtered = filtered.filter((i) => i.barcode?.toLowerCase().includes(searchTerm))
      }

      if (orderBy && orderBy.length > 0) {
        filtered.sort((a, b) => {
          for (const order of orderBy) {
            const [field, direction] = Object.entries(order)[0]
            const aVal = (a as any)[field]
            const bVal = (b as any)[field]

            if (aVal < bVal) return direction === "asc" ? -1 : 1
            if (aVal > bVal) return direction === "asc" ? 1 : -1
          }
          return 0
        })
      }

      const paginatedItems = filtered.slice(skip, skip + take)

      return paginatedItems.map((item) => {
        const result: any = { ...item }

        if (include?.category && this.categories) {
          result.category = this.categories.find((c) => c.id === item.categoryId) || null
        }
        if (include?.brand && this.brands) {
          result.brand = this.brands.find((b) => b.id === item.brandId) || null
        }
        if (include?.unit && this.units) {
          result.unit = this.units.find((u) => u.id === item.unitId) || null
        }
        if (include?.taxRate && this.taxRates) {
          result.taxRate = this.taxRates.find((t) => t.id === item.taxRateId) || null
        }
        if (include?.inventoryLevels && this.inventoryLevels) {
          let inventoryLevels = this.inventoryLevels.filter((il) => il.itemId === item.id)
          if (typeof include.inventoryLevels === "object" && include.inventoryLevels.where?.locationId) {
            inventoryLevels = inventoryLevels.filter(
              (il) => il.locationId === include.inventoryLevels.where?.locationId,
            )
          }
          result.inventoryLevels = inventoryLevels
        }

        return result
      })
    },

    findUnique: async ({
      where,
      include,
    }: {
      where: { id?: string; sku?: string }
      include?: {
        category?: boolean
        brand?: boolean
        unit?: boolean
        taxRate?: boolean
        inventoryLevels?: boolean | { where?: { locationId?: string } }
      }
    }) => {
      if (!this.items) {
        console.error("[v0] Items array is undefined in mock database")
        return null
      }

      const item = this.items.find((i) => i.id === where.id || i.sku === where.sku)
      if (!item) return null

      const result: any = { ...item }

      if (include?.category && this.categories) {
        result.category = this.categories.find((c) => c.id === item.categoryId) || null
      }
      if (include?.brand && this.brands) {
        result.brand = this.brands.find((b) => b.id === item.brandId) || null
      }
      if (include?.unit && this.units) {
        result.unit = this.units.find((u) => u.id === item.unitId) || null
      }
      if (include?.taxRate && this.taxRates) {
        result.taxRate = this.taxRates.find((t) => t.id === item.taxRateId) || null
      }
      if (include?.inventoryLevels && this.inventoryLevels) {
        let inventoryLevels = this.inventoryLevels.filter((il) => il.itemId === item.id)
        if (typeof include.inventoryLevels === "object" && include.inventoryLevels.where?.locationId) {
          inventoryLevels = inventoryLevels.filter((il) => il.locationId === include.inventoryLevels.where?.locationId)
        }
        result.inventoryLevels = inventoryLevels
      }

      return result
    },

    update: async ({ where, data }: { where: { id: string }; data: Partial<Item> }) => {
      if (!this.items) {
        console.error("[v0] Items array is undefined in mock database")
        throw new Error("Items array not initialized")
      }

      const index = this.items.findIndex((i) => i.id === where.id)
      if (index !== -1) {
        this.items[index] = { ...this.items[index], ...data, updatedAt: new Date() }
        return this.items[index]
      }
      throw new Error("Item not found")
    },

    create: async ({ data }: { data: Omit<Item, "id" | "createdAt" | "updatedAt"> }) => {
      if (!this.items) {
        console.error("[v0] Items array is undefined in mock database")
        this.items = []
      }

      const newItem: Item = {
        ...data,
        id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      this.items.push(newItem)
      return newItem
    },
  }

  // Customer operations
  customer = {
    findMany: async ({ where }: { where?: { organizationId?: string; isActive?: boolean } } = {}) => {
      let filtered = this.customers
      if (where?.organizationId) {
        filtered = filtered.filter((c) => c.organizationId === where.organizationId)
      }
      if (where?.isActive !== undefined) {
        filtered = filtered.filter((c) => c.isActive === where.isActive)
      }
      return filtered
    },
    findUnique: async ({ where }: { where: { id: string } }) => {
      return this.customers.find((c) => c.id === where.id) || null
    },
  }

  // POS Station operations
  posStation = {
    findMany: async ({ where }: { where?: { locationId?: string; isActive?: boolean } } = {}) => {
      let filtered = this.posStations
      if (where?.locationId) {
        filtered = filtered.filter((p) => p.locationId === where.locationId)
      }
      if (where?.isActive !== undefined) {
        filtered = filtered.filter((p) => p.isActive === where.isActive)
      }
      return filtered
    },
    findUnique: async ({ where }: { where: { id: string } }) => {
      return this.posStations.find((p) => p.id === where.id) || null
    },
  }

  // Cash Drawer operations
  cashDrawer = {
    findMany: async ({ where }: { where?: { locationId?: string } } = {}) => {
      let filtered = this.cashDrawers
      if (where?.locationId) {
        filtered = filtered.filter((cd) => cd.locationId === where.locationId)
      }
      return filtered
    },
    findFirst: async ({ where }: { where: { terminalId?: string; locationId?: string } }) => {
      return (
        this.cashDrawers.find(
          (cd) =>
            (!where.terminalId || (cd as any).terminalId === where.terminalId) &&
            (!where.locationId || cd.locationId === where.locationId),
        ) || null
      )
    },
    findUnique: async ({ where }: { where: { id: string } }) => {
      return this.cashDrawers.find((cd) => cd.id === where.id) || null
    },
    create: async ({ data }: { data: Omit<CashDrawer, "id" | "createdAt" | "updatedAt"> }) => {
      const cashDrawer: CashDrawer = {
        ...data,
        id: `drawer-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      this.cashDrawers.push(cashDrawer)
      return cashDrawer
    },
    update: async ({ where, data }: { where: { id: string }; data: Partial<CashDrawer> }) => {
      const index = this.cashDrawers.findIndex((cd) => cd.id === where.id)
      if (index !== -1) {
        this.cashDrawers[index] = { ...this.cashDrawers[index], ...data, updatedAt: new Date() }
        return this.cashDrawers[index]
      }
      throw new Error("Cash drawer not found")
    },
  }

  // POS Session operations
  posSession = {
    findFirst: async ({
      where,
      include,
    }: {
      where: { userId?: string; status?: POSSessionStatus; terminalId?: string }
      include?: {
        terminal?: { select?: { id?: boolean; name?: boolean; terminalNumber?: boolean } }
        user?: { select?: { id?: boolean; firstName?: boolean; lastName?: boolean; email?: boolean } }
        cashDrawer?: {
          select?: { id?: boolean; currentBalance?: boolean; expectedBalance?: boolean; status?: boolean }
        }
      }
    }) => {
      console.log("[v0] posSession.findFirst called with where:", where)

      // Ensure we have arrays initialized
      if (!Array.isArray(this.posSessions)) {
        console.log("[v0] Initializing posSessions array")
        this.posSessions = []
      }
      if (!Array.isArray(this.posStations)) {
        console.log("[v0] Initializing posStations array")
        this.posStations = []
      }
      if (!Array.isArray(this.cashDrawers)) {
        console.log("[v0] Initializing cashDrawers array")
        this.cashDrawers = []
      }

      const session = this.posSessions.find(
        (s) =>
          (!where.userId || s.userId === where.userId) &&
          (!where.status || s.status === where.status) &&
          (!where.terminalId || s.terminalId === where.terminalId),
      )

      console.log("[v0] Found session:", session ? session.id : "none")

      if (!session) return null

      const result: any = { ...session }

      if (include?.terminal) {
        const terminal = this.posStations.find((p) => p.id === session.terminalId)
        if (terminal) {
          result.terminal = {
            id: terminal.id,
            name: terminal.name,
            terminalNumber: terminal.terminalNumber,
          }
        }
      }

      if (include?.user) {
        result.user = {
          id: session.userId,
          firstName: "Demo",
          lastName: "User",
          email: "demo@example.com",
        }
      }

      if (include?.cashDrawer) {
        const cashDrawer = this.cashDrawers.find((cd) => (cd as any).terminalId === session.terminalId)
        if (cashDrawer) {
          result.cashDrawer = {
            id: cashDrawer.id,
            currentBalance: cashDrawer.currentBalance,
            expectedBalance: (cashDrawer as any).expectedBalance || cashDrawer.currentBalance,
            status: cashDrawer.isOpen ? "open" : "closed",
          }
        }
      }

      return result
    },
    findUnique: async ({
      where,
      include,
    }: {
      where: { id: string }
      include?: {
        terminal?: { select?: { id?: boolean; name?: boolean; terminalNumber?: boolean } }
        user?: { select?: { id?: boolean; firstName?: boolean; lastName?: boolean; email?: boolean } }
        cashDrawer?: {
          select?: { id?: boolean; currentBalance?: boolean; expectedBalance?: boolean; status?: boolean }
        }
      }
    }) => {
      const session = this.posSessions.find((s) => s.id === where.id)
      if (!session) return null

      const result: any = { ...session }

      if (include?.terminal) {
        const terminal = this.posStations.find((p) => p.id === session.terminalId)
        if (terminal) {
          result.terminal = {
            id: terminal.id,
            name: terminal.name,
            terminalNumber: terminal.terminalNumber,
          }
        }
      }

      if (include?.user) {
        result.user = {
          id: session.userId,
          firstName: "Demo",
          lastName: "User",
          email: "demo@example.com",
        }
      }

      if (include?.cashDrawer) {
        const cashDrawer = this.cashDrawers.find((cd) => (cd as any).terminalId === session.terminalId)
        if (cashDrawer) {
          result.cashDrawer = {
            id: cashDrawer.id,
            currentBalance: cashDrawer.currentBalance,
            expectedBalance: (cashDrawer as any).expectedBalance || cashDrawer.currentBalance,
            status: cashDrawer.isOpen ? "open" : "closed",
          }
        }
      }

      return result
    },
    findMany: async ({
      where,
    }: { where?: { userId?: string; locationId?: string; status?: POSSessionStatus } } = {}) => {
      let filtered = this.posSessions
      if (where?.userId) {
        filtered = filtered.filter((s) => s.userId === where.userId)
      }
      if (where?.locationId) {
        filtered = filtered.filter((s) => s.locationId === where.locationId)
      }
      if (where?.status) {
        filtered = filtered.filter((s) => s.status === where.status)
      }
      return filtered
    },
    create: async ({ data }: { data: Omit<POSSession, "id" | "createdAt" | "updatedAt"> }) => {
      const session: POSSession = {
        ...data,
        id: `session-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      this.posSessions.push(session)
      return session
    },
    update: async ({ where, data }: { where: { id: string }; data: Partial<POSSession> }) => {
      const index = this.posSessions.findIndex((s) => s.id === where.id)
      if (index !== -1) {
        this.posSessions[index] = { ...this.posSessions[index], ...data, updatedAt: new Date() }
        return this.posSessions[index]
      }
      throw new Error("Session not found")
    },
  }

  // Cash Drawer Transaction operations
  cashDrawerTransaction = {
    findMany: async ({
      where,
      include,
      orderBy,
      take,
    }: {
      where?: { sessionId?: string; drawerId?: string; userId?: string }
      include?: {
        user?: { select?: { firstName?: boolean; lastName?: boolean } }
      }
      orderBy?: { createdAt?: "asc" | "desc" }
      take?: number
    } = {}) => {
      let filtered = this.cashDrawerTransactions.filter((e) => {
        return (
          (!where?.sessionId || e.sessionId === where.sessionId) &&
          (!where?.drawerId || e.cashDrawerId === where.drawerId) &&
          (!where?.userId || e.userId === where.userId)
        )
      })

      if (orderBy?.createdAt) {
        filtered.sort((a, b) => {
          if (orderBy.createdAt === "desc") {
            return b.createdAt.getTime() - a.createdAt.getTime()
          }
          return a.createdAt.getTime() - b.createdAt.getTime()
        })
      }

      if (take) {
        filtered = filtered.slice(0, take)
      }

      return filtered.map((event) => {
        const result: any = {
          id: event.id,
          drawerId: event.cashDrawerId,
          sessionId: event.sessionId,
          userId: event.userId,
          transactionType: event.type,
          amount: event.amount,
          reason: event.reason,
          description: event.description,
          referenceNumber: event.referenceNumber,
          balanceBefore: event.balanceBefore,
          balanceAfter: event.balanceAfter,
          createdAt: event.createdAt,
        }

        if (include?.user) {
          result.user = {
            firstName: "Demo",
            lastName: "User",
          }
        }

        return result
      })
    },
    create: async ({ data }: { data: any }) => {
      const event: cashDrawerTransaction = {
        id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        cashDrawerId: data.drawerId,
        sessionId: data.sessionId,
        userId: data.userId,
        type: data.transactionType as cashDrawerTransactionType,
        amount: data.amount,
        reason: data.reason,
        description: data.description,
        referenceNumber: data.referenceNumber,
        balanceBefore: data.balanceBefore,
        balanceAfter: data.balanceAfter,
        createdAt: new Date(),
      }
      this.cashDrawerTransactions.push(event)
      return {
        id: event.id,
        drawerId: event.cashDrawerId,
        sessionId: event.sessionId,
        userId: event.userId,
        transactionType: event.type,
        amount: event.amount,
        reason: event.reason,
        description: event.description,
        referenceNumber: event.referenceNumber,
        balanceBefore: event.balanceBefore,
        balanceAfter: event.balanceAfter,
        createdAt: event.createdAt,
      }
    },
  }

  // Sales Order operations
  salesOrder = {
    findMany: async ({ where, include }: { where?: any; include?: any } = {}) => {
      if (!this.salesOrders) {
        console.error("[v0] Sales orders array is undefined in mock database")
        return []
      }
      return this.salesOrders.filter(
        (order) => !where || Object.keys(where).every((key) => (order as any)[key] === where[key]),
      )
    },

    create: async ({ data }: { data: any }) => {
      if (!this.salesOrders) {
        console.error("[v0] Sales orders array is undefined in mock database")
        this.salesOrders = []
      }

      const newOrder = {
        ...data,
        id: `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      this.salesOrders.push(newOrder)
      return newOrder
    },
  }

  // Sales Order Line operations
  salesOrderLine = {
    createMany: async ({ data }: { data: Omit<SalesOrderLine, "id" | "createdAt" | "updatedAt">[] }) => {
      const lines = data.map((line) => ({
        ...line,
        id: `line-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      }))
      this.salesOrderLines.push(...lines)
      return { count: lines.length }
    },
  }

  // Payment operations
  payment = {
    create: async ({ data }: { data: Omit<Payment, "id" | "createdAt" | "updatedAt"> }) => {
      const payment: Payment = {
        ...data,
        id: `payment-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      this.payments.push(payment)
      return payment
    },
  }

  // Inventory Level operations
  inventoryLevel = {
    findMany: async ({ where }: { where?: { itemId?: string; locationId?: string } } = {}) => {
      let filtered = this.inventoryLevels
      if (where?.itemId) {
        filtered = filtered.filter((il) => il.itemId === where.itemId)
      }
      if (where?.locationId) {
        filtered = filtered.filter((il) => il.locationId === where.locationId)
      }
      return filtered
    },
    update: async ({
      where,
      data,
    }: {
      where: { itemId_locationId?: { itemId: string; locationId: string } }
      data: Partial<InventoryLevel>
    }) => {
      if (where.itemId_locationId) {
        const index = this.inventoryLevels.findIndex(
          (il) =>
            il.itemId === where.itemId_locationId!.itemId && il.locationId === where.itemId_locationId!.locationId,
        )
        if (index !== -1) {
          this.inventoryLevels[index] = {
            ...this.inventoryLevels[index],
            ...data,
            updatedAt: new Date(),
          }
          return this.inventoryLevels[index]
        }
      }
      throw new Error("Inventory level not found")
    },
  }

  // Analytics operations
  async getSalesAnalytics(organizationId: string, locationId: string, startDate: Date, endDate: Date) {
    const orders = this.salesOrders.filter(
      (order) =>
        order.organizationId === organizationId &&
        order.locationId === locationId &&
        order.createdAt >= startDate &&
        order.createdAt <= endDate &&
        order.status === SalesOrderStatus.COMPLETED,
    )

    const totalSales = orders.reduce((sum, order) => sum + order.total, 0)
    const totalTransactions = orders.length
    const averageTransaction = totalTransactions > 0 ? totalSales / totalTransactions : 0

    const paymentMethods = this.payments.filter((payment) => orders.some((order) => order.id === payment.salesOrderId))

    const cashSales = paymentMethods
      .filter((p) => p.method === PaymentMethod.CASH)
      .reduce((sum, p) => sum + p.amount, 0)

    const cardSales = paymentMethods
      .filter((p) => p.method === PaymentMethod.CARD)
      .reduce((sum, p) => sum + p.amount, 0)

    const digitalSales = paymentMethods
      .filter((p) => p.method === PaymentMethod.DIGITAL)
      .reduce((sum, p) => sum + p.amount, 0)

    return {
      totalSales,
      totalTransactions,
      averageTransaction,
      cashSales,
      cardSales,
      digitalSales,
      dailySales: orders.reduce(
        (acc, order) => {
          const date = order.createdAt.toISOString().split("T")[0]
          acc[date] = (acc[date] || 0) + order.total
          return acc
        },
        {} as Record<string, number>,
      ),
    }
  }

  async getCashDrawerAnalytics(sessionId: string) {
    const events = this.cashDrawerTransactions.filter((e) => e.sessionId === sessionId)
    const session = this.posSessions.find((s) => s.id === sessionId)

    const totalCashIn = events
      .filter((e) => e.type === cashDrawerTransactionType.CASH_IN)
      .reduce((sum, e) => sum + e.amount, 0)

    const totalCashOut = events
      .filter((e) => e.type === cashDrawerTransactionType.CASH_OUT)
      .reduce((sum, e) => sum + e.amount, 0)

    const salesTotal = events.filter((e) => e.type === cashDrawerTransactionType.SALE).reduce((sum, e) => sum + e.amount, 0)

    const expectedBalance = (session?.openingBalance || 0) + totalCashIn - totalCashOut + salesTotal

    return {
      openingBalance: session?.openingBalance || 0,
      totalCashIn,
      totalCashOut,
      salesTotal,
      expectedBalance,
      actualBalance: session?.closingBalance,
      variance: session?.variance || 0,
      events,
    }
  }

  async getInventoryAnalytics(organizationId: string, locationId?: string) {
    let inventoryLevels = this.inventoryLevels
    if (locationId) {
      inventoryLevels = inventoryLevels.filter((il) => il.locationId === locationId)
    }

    const lowStockItems = inventoryLevels.filter((il) => {
      const item = this.items.find((i) => i.id === il.itemId)
      return item && il.quantityAvailable <= item.minStockLevel
    })

    const totalValue = inventoryLevels.reduce((sum, il) => sum + il.totalValue, 0)
    const totalItems = inventoryLevels.length
    const averageValue = totalItems > 0 ? totalValue / totalItems : 0

    return {
      totalValue,
      totalItems,
      averageValue,
      lowStockCount: lowStockItems.length,
      lowStockItems: lowStockItems.map((il) => {
        const item = this.items.find((i) => i.id === il.itemId)
        return {
          ...il,
          item,
        }
      }),
    }
  }

  public getAllData() {
    return {
      items: this.items,
      categories: this.categories,
      brands: this.brands,
      units: this.units,
      taxRates: this.taxRates,
      inventoryLevels: this.inventoryLevels,
      locations: this.locations,
      organizations: this.organizations,
      posStations: this.posStations,
      posSessions: this.posSessions,
      cashDrawers: this.cashDrawers,
      cashDrawerTransactions: this.cashDrawerTransactions,
      salesOrders: this.salesOrders,
      salesOrderLines: this.salesOrderLines,
      payments: this.payments,
      users: this.users,
      inventoryTransactions: this.inventoryTransactions,
    }
  }
}

// Export singleton instance
const mockDb = new MockDatabase()
export const db = mockDb

Object.defineProperty(db, "sales", {
  get() {
    return mockDb.salesOrders || []
  },
})

Object.defineProperty(db, "saleItems", {
  get() {
    return mockDb.salesOrderLines || []
  },
})

Object.defineProperty(db, "items", {
  get() {
    return mockDb.items || []
  },
})

Object.defineProperty(db, "payments", {
  get() {
    return mockDb.payments || []
  },
})

Object.defineProperty(db, "posSessions", {
  get() {
    return mockDb.posSessions || []
  },
})

Object.defineProperty(db, "cashDrawerTransactions", {
  get() {
    return (mockDb.cashDrawerTransactions || []).map((event: any) => ({
      id: event.id,
      sessionId: event.sessionId,
      transactionType: event.type,
      amount: event.amount,
      reason: event.reason,
      description: event.description,
      createdAt: event.createdAt,
    }))
  },
})

Object.defineProperty(db, "terminals", {
  get() {
    return mockDb.posStations || []
  },
})

Object.defineProperty(db, "users", {
  get() {
    return mockDb.users || []
  },
})

Object.defineProperty(db, "categories", {
  get() {
    return mockDb.categories || []
  },
})

Object.defineProperty(db, "inventoryLevels", {
  get() {
    return mockDb.inventoryLevels || []
  },
})

Object.defineProperty(db, "mockData", {
  get() {
    return mockDb.getAllData()
  },
})
