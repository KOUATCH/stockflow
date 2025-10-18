import { format } from 'date-fns'
import { nanoid } from 'nanoid'
import type { PaymentMethod, TransactionStatus } from '../types/pos-system-types'

/**
 * Generate unique transaction ID
 */
export function generateTransactionId(): string {
  const timestamp = Date.now().toString(36)
  const randomId = nanoid(8)
  return `TXN_${timestamp}_${randomId}`.toUpperCase()
}

/**
 * Generate receipt number
 */
export function generateReceiptNumber(): string {
  const date = format(new Date(), 'yyyyMMdd')
  const randomNum = Math.floor(Math.random() * 9999).toString().padStart(4, '0')
  return `${date}-${randomNum}`
}

/**
 * Generate session number
 */
export function generateSessionNumber(terminalId: string): string {
  const date = format(new Date(), 'yyyyMMdd')
  const time = format(new Date(), 'HHmm')
  const terminalShort = terminalId.slice(-4)
  return `S${date}${time}${terminalShort}`
}

/**
 * Format currency with proper locale
 */
export function formatCurrency(amount: number, currency: string = 'USD', locale: string = 'en-US'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency
  }).format(amount)
}

/**
 * Calculate tax amount
 */
export function calculateTax(amount: number, taxRate: number, inclusive: boolean = false): number {
  if (inclusive) {
    return amount - (amount / (1 + taxRate / 100))
  }
  return amount * (taxRate / 100)
}

/**
 * Calculate discount amount
 */
export function calculateDiscount(amount: number, discountRate: number, isPercentage: boolean = true): number {
  if (isPercentage) {
    return amount * (discountRate / 100)
  }
  return Math.min(discountRate, amount)
}

/**
 * Validate payment method
 */
export function validatePaymentMethod(method: string): method is PaymentMethod {
  const validMethods: PaymentMethod[] = [
    'CASH', 'CARD', 'CHECK', 'GIFT_CARD', 'STORE_CREDIT', 'DIGITAL_WALLET', 'BUY_NOW_PAY_LATER'
  ]
  return validMethods.includes(method as PaymentMethod)
}

/**
 * Get payment method display name
 */
export function getPaymentMethodDisplayName(method: PaymentMethod): string {
  const displayNames: Record<PaymentMethod, string> = {
    CASH: 'Cash',
    CARD: 'Credit/Debit Card',
    CHECK: 'Check',
    GIFT_CARD: 'Gift Card',
    STORE_CREDIT: 'Store Credit',
    DIGITAL_WALLET: 'Digital Wallet',
    BUY_NOW_PAY_LATER: 'Buy Now, Pay Later'
  }
  return displayNames[method] || method
}

/**
 * Get transaction status display
 */
export function getTransactionStatusDisplay(status: TransactionStatus): {
  label: string
  color: string
  icon: string
} {
  const statusDisplay: Record<TransactionStatus, { label: string; color: string; icon: string }> = {
    PENDING: { label: 'Pending', color: 'yellow', icon: 'clock' },
    PARTIAL_PAYMENT: { label: 'Partial Payment', color: 'orange', icon: 'credit-card' },
    COMPLETED: { label: 'Completed', color: 'green', icon: 'check-circle' },
    CANCELLED: { label: 'Cancelled', color: 'red', icon: 'x-circle' },
    REFUNDED: { label: 'Refunded', color: 'blue', icon: 'rotate-ccw' }
  }
  return statusDisplay[status]
}

/**
 * Calculate change amount
 */
export function calculateChange(totalAmount: number, amountPaid: number): number {
  return Math.max(0, amountPaid - totalAmount)
}

/**
 * Validate barcode format
 */
export function validateBarcode(barcode: string): {
  isValid: boolean
  type?: 'UPC-A' | 'UPC-E' | 'EAN-13' | 'EAN-8' | 'CODE128' | 'UNKNOWN'
  error?: string
} {
  if (!barcode || barcode.length === 0) {
    return { isValid: false, error: 'Barcode cannot be empty' }
  }

  // UPC-A (12 digits)
  if (/^\d{12}$/.test(barcode)) {
    return { isValid: true, type: 'UPC-A' }
  }

  // UPC-E (8 digits)
  if (/^\d{8}$/.test(barcode)) {
    return { isValid: true, type: 'UPC-E' }
  }

  // EAN-13 (13 digits)
  if (/^\d{13}$/.test(barcode)) {
    return { isValid: true, type: 'EAN-13' }
  }

  // EAN-8 (8 digits)
  if (/^\d{8}$/.test(barcode)) {
    return { isValid: true, type: 'EAN-8' }
  }

  // CODE128 (alphanumeric)
  if (/^[A-Za-z0-9\-_]+$/.test(barcode)) {
    return { isValid: true, type: 'CODE128' }
  }

  return { isValid: true, type: 'UNKNOWN' }
}

/**
 * Format receipt text
 */
export function formatReceiptText(
  transaction: any,
  location: any,
  template: any
): string {
  const lines: string[] = []

  // Header
  lines.push(centerText(location.name, 40))
  lines.push(centerText(location.address, 40))
  lines.push(centerText(`${location.city}, ${location.state} ${location.zipCode}`, 40))
  lines.push('')

  // Transaction info
  lines.push(`Receipt #: ${transaction.receiptNumber}`)
  lines.push(`Date: ${format(transaction.createdAt, 'MM/dd/yyyy HH:mm:ss')}`)
  lines.push(`Terminal: ${transaction.terminal.terminalNumber}`)
  lines.push(`Cashier: ${transaction.user.firstName} ${transaction.user.lastName}`)
  lines.push('')
  lines.push('-'.repeat(40))

  // Items
  transaction.items.forEach((item: any) => {
    lines.push(`${item.item.name}`)
    lines.push(`  ${item.quantity} x ${formatCurrency(item.unitPrice)} = ${formatCurrency(item.lineTotal)}`)
  })

  lines.push('-'.repeat(40))

  // Totals
  lines.push(rightAlign(`Subtotal: ${formatCurrency(transaction.subtotal)}`, 40))
  if (transaction.discountAmount > 0) {
    lines.push(rightAlign(`Discount: -${formatCurrency(transaction.discountAmount)}`, 40))
  }
  lines.push(rightAlign(`Tax: ${formatCurrency(transaction.taxAmount)}`, 40))
  lines.push(rightAlign(`Total: ${formatCurrency(transaction.totalAmount)}`, 40))
  lines.push('')

  // Payments
  transaction.payments.forEach((payment: any) => {
    lines.push(rightAlign(`${getPaymentMethodDisplayName(payment.method)}: ${formatCurrency(payment.amount)}`, 40))
  })

  if (transaction.changeAmount > 0) {
    lines.push(rightAlign(`Change: ${formatCurrency(transaction.changeAmount)}`, 40))
  }

  lines.push('')
  lines.push(centerText('Thank you for your business!', 40))

  return lines.join('\n')
}

/**
 * Center text for receipt
 */
function centerText(text: string, width: number): string {
  if (text.length >= width) return text
  const padding = Math.floor((width - text.length) / 2)
  return ' '.repeat(padding) + text
}

/**
 * Right align text for receipt
 */
function rightAlign(text: string, width: number): string {
  if (text.length >= width) return text
  const padding = width - text.length
  return ' '.repeat(padding) + text
}

/**
 * Validate card number (basic Luhn algorithm)
 */
export function validateCardNumber(cardNumber: string): boolean {
  const num = cardNumber.replace(/\s+/g, '')

  if (!/^\d+$/.test(num)) return false

  let sum = 0
  let shouldDouble = false

  for (let i = num.length - 1; i >= 0; i--) {
    let digit = parseInt(num[i])

    if (shouldDouble) {
      digit *= 2
      if (digit > 9) digit -= 9
    }

    sum += digit
    shouldDouble = !shouldDouble
  }

  return sum % 10 === 0
}

/**
 * Get card type from number
 */
export function getCardType(cardNumber: string): string {
  const num = cardNumber.replace(/\s+/g, '')

  if (/^4/.test(num)) return 'VISA'
  if (/^5[1-5]/.test(num)) return 'MASTERCARD'
  if (/^3[47]/.test(num)) return 'AMEX'
  if (/^6(?:011|5)/.test(num)) return 'DISCOVER'

  return 'UNKNOWN'
}

/**
 * Mask card number for display
 */
export function maskCardNumber(cardNumber: string): string {
  const num = cardNumber.replace(/\s+/g, '')
  if (num.length < 4) return num

  const lastFour = num.slice(-4)
  const masked = '*'.repeat(num.length - 4)

  return masked + lastFour
}

/**
 * Format phone number
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')

  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  }

  return phone
}

/**
 * Calculate tip suggestions
 */
export function calculateTipSuggestions(amount: number): {
  fifteen: number
  eighteen: number
  twenty: number
  twentyFive: number
} {
  return {
    fifteen: Math.round(amount * 0.15 * 100) / 100,
    eighteen: Math.round(amount * 0.18 * 100) / 100,
    twenty: Math.round(amount * 0.20 * 100) / 100,
    twentyFive: Math.round(amount * 0.25 * 100) / 100
  }
}

/**
 * Generate QR code data for receipt
 */
export function generateReceiptQRData(transaction: any): string {
  return JSON.stringify({
    receiptNumber: transaction.receiptNumber,
    date: transaction.createdAt,
    total: transaction.totalAmount,
    location: transaction.locationId
  })
}

/**
 * Parse scanned barcode
 */
export function parseScannedBarcode(scannedData: string): {
  type: 'PRODUCT' | 'CUSTOMER' | 'COUPON' | 'UNKNOWN'
  data: string
  metadata?: any
} {
  // Product barcode (starts with digits)
  if (/^\d+$/.test(scannedData)) {
    return {
      type: 'PRODUCT',
      data: scannedData
    }
  }

  // Customer loyalty card (starts with CUST)
  if (scannedData.startsWith('CUST')) {
    return {
      type: 'CUSTOMER',
      data: scannedData.substring(4)
    }
  }

  // Coupon code (starts with COUP)
  if (scannedData.startsWith('COUP')) {
    return {
      type: 'COUPON',
      data: scannedData.substring(4)
    }
  }

  return {
    type: 'UNKNOWN',
    data: scannedData
  }
}

/**
 * Calculate business hours
 */
export function isWithinBusinessHours(date: Date, businessHours: any): boolean {
  const day = date.getDay() // 0 = Sunday, 1 = Monday, etc.
  const time = format(date, 'HH:mm')

  const daySchedule = businessHours[day]
  if (!daySchedule || !daySchedule.isOpen) return false

  return time >= daySchedule.openTime && time <= daySchedule.closeTime
}

/**
 * Calculate loyalty points
 */
export function calculateLoyaltyPoints(amount: number, pointsPerDollar: number): number {
  return Math.floor(amount * pointsPerDollar)
}

/**
 * Round to nearest currency unit
 */
export function roundCurrency(amount: number): number {
  return Math.round(amount * 100) / 100
}