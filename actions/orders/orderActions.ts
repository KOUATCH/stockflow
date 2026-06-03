"use server"

type LegacyActionResult<T = unknown> = {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export type OrderStatus =
  | "DRAFT"
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "READY_FOR_PICKUP"
  | "DELIVERED"
  | "CANCELLED"

export type OrderPaymentStatus =
  | "UNPAID"
  | "ADVANCE_PAID"
  | "PARTIALLY_PAID"
  | "FULLY_PAID"

export type OrderPaymentMethod =
  | "CASH"
  | "CARD"
  | "BANK_TRANSFER"
  | "MOBILE_MONEY"
  | "STORE_CREDIT"

export type DeliveryMethod = "PICKUP" | "DELIVERY"
export type OrderType = "STANDARD" | "SPECIAL" | "WHOLESALE"

export interface CreateOrderData {
  customerId?: string | null
  customerName: string
  customerEmail?: string
  customerPhone?: string
  customerAddress?: string
  orderType?: OrderType
  deliveryMethod?: DeliveryMethod
  expectedDate?: Date
  notes?: string
  specialInstructions?: string
  organizationId: string
  locationId?: string
  createdById: string
  orderLines: {
    itemId: string
    itemName: string
    itemSku: string
    unitPrice: number
    quantity: number
    notes?: string
    specialRequirements?: string
  }[]
}

export interface UpdateOrderData {
  status?: OrderStatus
  paymentStatus?: OrderPaymentStatus
  expectedDate?: Date
  deliveryDate?: Date
  notes?: string
  specialInstructions?: string
  internalNotes?: string
}

export interface CreatePaymentData {
  orderId: string
  paymentMethod: OrderPaymentMethod
  amount: number
  reference?: string
  notes?: string
  isAdvancePayment: boolean
  organizationId: string
  processedById: string
}

export interface OrderFilters {
  status?: OrderStatus
  paymentStatus?: OrderPaymentStatus
  customerId?: string
  locationId?: string
  dateFrom?: Date
  dateTo?: Date
  searchTerm?: string
}

const LEGACY_ORDER_DISABLED =
  "Legacy ClientOrder workflow is disabled. Use the canonical POS and sales workflow instead."

const disabled = <T = unknown>(): LegacyActionResult<T> => ({
  success: false,
  error: LEGACY_ORDER_DISABLED,
})

export async function generateOrderNumber(_organizationId: string): Promise<string> {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, "0")
  const day = String(today.getDate()).padStart(2, "0")

  return `ORD${year}${month}${day}0000`
}

export async function createOrder(_data: CreateOrderData) {
  return disabled()
}

export async function getOrders(_organizationId: string, _filters?: OrderFilters) {
  return {
    success: true,
    data: [],
    message: LEGACY_ORDER_DISABLED,
  }
}

export async function getOrderById(_orderId: string, _organizationId: string) {
  return disabled()
}

export async function confirmOrderAndReserveInventory(
  _orderId: string,
  _changedById: string,
  _organizationId: string,
  _locationId?: string
) {
  return disabled()
}

export async function cancelOrderAndReleaseInventory(
  _orderId: string,
  _reason: string,
  _changedById: string,
  _organizationId: string,
  _notes?: string
) {
  return disabled()
}

export async function updateOrderStatus(
  _orderId: string,
  _status: OrderStatus,
  _reason: string,
  _changedById: string,
  _organizationId: string,
  _notes?: string
) {
  return disabled()
}

export async function createOrderPayment(_data: CreatePaymentData) {
  return disabled()
}

export async function getOrderAnalytics(
  _organizationId: string,
  _dateFrom?: Date,
  _dateTo?: Date
) {
  return {
    success: true,
    data: {
      totalOrders: 0,
      ordersByStatus: {
        pending: 0,
        processing: 0,
        ready: 0,
        delivered: 0,
        cancelled: 0,
      },
      revenue: {
        totalRevenue: 0,
        advancePayments: 0,
        balancePayments: 0,
      },
    },
    message: LEGACY_ORDER_DISABLED,
  }
}

export async function deleteOrder(
  _orderId: string,
  _organizationId: string,
  _userId: string
) {
  return disabled()
}
