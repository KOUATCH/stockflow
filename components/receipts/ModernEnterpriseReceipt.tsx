"use client"

import React from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { formatCurrency } from "@/lib/formatCurrency"
import {
  Building2,
  Calendar,
  Clock,
  CreditCard,
  Hash,
  MapPin,
  Phone,
  Printer,
  Receipt,
  Share2,
  User,
  Wifi
} from "lucide-react"

interface ReceiptLine {
  itemId: string
  name: string
  sku: string
  quantity: number
  unitPrice: number
  discount: number
  taxRate: number
  taxAmount: number
  lineTotal: number
}

interface Payment {
  method: "CASH" | "CARD" | "DIGITAL"
  amount: number
  referenceNumber?: string
  cardType?: string
  cardLastFour?: string
  authorizationCode?: string
}

interface ReceiptData {
  id: string
  receiptNumber: string
  transactionDate: Date
  organizationName: string
  organizationAddress?: string
  organizationPhone?: string
  organizationTaxId?: string
  locationName?: string
  terminalId?: string
  cashierName?: string
  customer?: {
    name: string
    phone?: string
    email?: string
  }
  lines: ReceiptLine[]
  subtotal: number
  discountAmount: number
  taxAmount: number
  totalAmount: number
  payments: Payment[]
  cashTendered?: number
  changeGiven?: number
  notes?: string
  sessionNumber?: string
}

interface ModernEnterpriseReceiptProps {
  receiptData: ReceiptData
  variant?: "thermal" | "standard" | "email"
  showActions?: boolean
  onPrint?: () => void
  onShare?: () => void
  onEmail?: () => void
}

export function ModernEnterpriseReceipt({
  receiptData,
  variant = "standard",
  showActions = true,
  onPrint,
  onShare,
  onEmail
}: ModernEnterpriseReceiptProps) {
  const isThermalStyle = variant === "thermal"
  const isEmailStyle = variant === "email"

  const formatDateTime = (date: Date) => {
    return {
      date: date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric"
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      })
    }
  }

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case "CASH":
        return <Hash className="h-4 w-4" />
      case "CARD":
        return <CreditCard className="h-4 w-4" />
      case "DIGITAL":
        return <Wifi className="h-4 w-4" />
      default:
        return <Receipt className="h-4 w-4" />
    }
  }

  const getPaymentMethodLabel = (payment: Payment) => {
    if (payment.method === "CARD" && payment.cardType && payment.cardLastFour) {
      return `${payment.cardType} ****${payment.cardLastFour}`
    }
    return payment.method
  }

  const datetime = formatDateTime(receiptData.transactionDate)

  return (
    <Card className={`mx-auto shadow-lg border-0 ${
      isThermalStyle
        ? "max-w-sm bg-white"
        : isEmailStyle
        ? "max-w-2xl bg-gradient-to-br from-slate-50 to-white"
        : "max-w-md bg-gradient-to-br from-slate-50 to-white"
    }`}>
      <CardContent className={`p-0 ${isThermalStyle ? "text-xs" : "text-sm"}`}>
        {/* Header Section */}
        <div className={`text-center space-y-3 ${
          isThermalStyle ? "p-4 border-b" : "p-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white"
        }`}>
          <div className="flex items-center justify-center gap-2">
            <div className={`p-2 rounded-lg ${
              isThermalStyle
                ? "bg-blue-100 text-blue-600"
                : "bg-white/20 text-white"
            }`}>
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <h1 className={`font-bold ${
                isThermalStyle ? "text-lg text-gray-900" : "text-xl text-white"
              }`}>
                {receiptData.organizationName}
              </h1>
              {receiptData.organizationTaxId && (
                <p className={`text-xs ${
                  isThermalStyle ? "text-gray-600" : "text-blue-100"
                }`}>
                  Tax ID: {receiptData.organizationTaxId}
                </p>
              )}
            </div>
          </div>

          {receiptData.organizationAddress && (
            <div className={`flex items-center justify-center gap-1 text-xs ${
              isThermalStyle ? "text-gray-600" : "text-blue-100"
            }`}>
              <MapPin className="h-3 w-3" />
              <span>{receiptData.organizationAddress}</span>
            </div>
          )}

          {receiptData.organizationPhone && (
            <div className={`flex items-center justify-center gap-1 text-xs ${
              isThermalStyle ? "text-gray-600" : "text-blue-100"
            }`}>
              <Phone className="h-3 w-3" />
              <span>{receiptData.organizationPhone}</span>
            </div>
          )}
        </div>

        {/* Receipt Info Section */}
        <div className={`space-y-3 ${isThermalStyle ? "p-4" : "p-6"}`}>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Sales Receipt</h2>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              #{receiptData.receiptNumber}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="h-3 w-3" />
                <span>{datetime.date}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="h-3 w-3" />
                <span>{datetime.time}</span>
              </div>
              {receiptData.locationName && (
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="h-3 w-3" />
                  <span>{receiptData.locationName}</span>
                </div>
              )}
            </div>

            <div className="space-y-2 text-right">
              {receiptData.terminalId && (
                <div className="text-gray-600">
                  Terminal: <span className="font-medium">{receiptData.terminalId}</span>
                </div>
              )}
              {receiptData.cashierName && (
                <div className="text-gray-600">
                  Cashier: <span className="font-medium">{receiptData.cashierName}</span>
                </div>
              )}
              {receiptData.sessionNumber && (
                <div className="text-gray-600">
                  Session: <span className="font-medium">{receiptData.sessionNumber}</span>
                </div>
              )}
            </div>
          </div>

          {/* Customer Information */}
          {receiptData.customer && (
            <div className="p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-4 w-4 text-gray-600" />
                <span className="font-medium text-gray-900">Customer</span>
              </div>
              <div className="space-y-1 text-xs text-gray-600">
                <div className="font-medium text-gray-900">{receiptData.customer.name}</div>
                {receiptData.customer.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {receiptData.customer.phone}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Items Section */}
        <div className={`space-y-3 ${isThermalStyle ? "p-4" : "p-6"}`}>
          <h3 className="font-semibold text-gray-900 mb-4">Items Purchased</h3>

          <div className="space-y-3">
            {receiptData.lines.map((line, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">{line.name}</div>
                    <div className="text-xs text-gray-500">SKU: {line.sku}</div>
                  </div>
                  <div className="text-right ml-3">
                    <div className="font-bold text-gray-900">
                      {formatCurrency(line.lineTotal)}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs text-gray-600">
                  <div className="flex items-center gap-4">
                    <span>Qty: {line.quantity}</span>
                    <span>@ {formatCurrency(line.unitPrice)}</span>
                    {line.discount > 0 && (
                      <Badge variant="outline" className="text-xs px-1 py-0 text-green-600 border-green-300">
                        -{formatCurrency(line.discount)} disc
                      </Badge>
                    )}
                  </div>
                  {line.taxAmount > 0 && (
                    <span>Tax: {formatCurrency(line.taxAmount)}</span>
                  )}
                </div>

                {index < receiptData.lines.length - 1 && (
                  <Separator className="my-2" />
                )}
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Totals Section */}
        <div className={`space-y-3 ${isThermalStyle ? "p-4" : "p-6"} bg-gradient-to-r from-gray-50 to-slate-50`}>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium">{formatCurrency(receiptData.subtotal)}</span>
            </div>

            {receiptData.discountAmount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount:</span>
                <span className="font-medium">-{formatCurrency(receiptData.discountAmount)}</span>
              </div>
            )}

            {receiptData.taxAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax:</span>
                <span className="font-medium">{formatCurrency(receiptData.taxAmount)}</span>
              </div>
            )}
          </div>

          <Separator />

          <div className="flex justify-between text-lg font-bold">
            <span>Total:</span>
            <span className="text-blue-600">{formatCurrency(receiptData.totalAmount)}</span>
          </div>
        </div>

        <Separator />

        {/* Payment Section */}
        <div className={`space-y-3 ${isThermalStyle ? "p-4" : "p-6"}`}>
          <h3 className="font-semibold text-gray-900 mb-3">Payment Details</h3>

          <div className="space-y-2">
            {receiptData.payments.map((payment, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-white rounded-lg border">
                <div className="flex items-center gap-2">
                  {getPaymentIcon(payment.method)}
                  <span className="font-medium">{getPaymentMethodLabel(payment)}</span>
                </div>
                <span className="font-bold">{formatCurrency(payment.amount)}</span>
              </div>
            ))}
          </div>

          {receiptData.cashTendered && receiptData.changeGiven !== undefined && (
            <div className="space-y-2 mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex justify-between text-sm">
                <span className="text-green-700">Cash Tendered:</span>
                <span className="font-medium">{formatCurrency(receiptData.cashTendered)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold">
                <span className="text-green-700">Change Given:</span>
                <span className="text-green-800">{formatCurrency(receiptData.changeGiven)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Section */}
        <div className={`text-center space-y-3 ${
          isThermalStyle
            ? "p-4 border-t"
            : "p-6 bg-gradient-to-r from-gray-100 to-gray-200"
        }`}>
          {receiptData.notes && (
            <div className="text-xs text-gray-600 italic">
              {receiptData.notes}
            </div>
          )}

          <div className="text-xs text-gray-500 space-y-1">
            <div>Thank you for your business!</div>
            <div>Please keep this receipt for your records</div>
            <div className="flex items-center justify-center gap-1 pt-2">
              <Receipt className="h-3 w-3" />
              <span>Transaction ID: {receiptData.id}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        {showActions && !isThermalStyle && (
          <div className="p-4 border-t bg-white">
            <div className="flex gap-2 justify-center">
              {onPrint && (
                <Button variant="outline" size="sm" onClick={onPrint}>
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
              )}
              {onShare && (
                <Button variant="outline" size="sm" onClick={onShare}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              )}
              {onEmail && (
                <Button variant="outline" size="sm" onClick={onEmail}>
                  <User className="h-4 w-4 mr-2" />
                  Email
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default ModernEnterpriseReceipt