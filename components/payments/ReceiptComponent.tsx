"use client"

import { forwardRef } from "react"
import { ReceiptData } from "@/types/payments"
import { OrderPaymentMethod } from "@prisma/client"
import { format } from "date-fns"
import { Separator } from "@/components/ui/separator"

interface ReceiptComponentProps {
  receiptData: ReceiptData
  className?: string
}

export const ReceiptComponent = forwardRef<HTMLDivElement, ReceiptComponentProps>(
  ({ receiptData, className }, ref) => {
    const getMethodDisplayName = (method: OrderPaymentMethod) => {
      const methodNames = {
        CASH: "Cash",
        CREDIT_CARD: "Credit Card",
        DEBIT_CARD: "Debit Card",
        BANK_TRANSFER: "Bank Transfer",
        MOBILE_MONEY: "Mobile Money",
        CHEQUE: "Cheque",
        STORE_CREDIT: "Store Credit",
        OTHER: "Other",
      }
      return methodNames[method] || method
    }

    return (
      <div
        ref={ref}
        className={`max-w-md mx-auto bg-white text-black p-6 font-mono text-sm ${className}`}
        style={{
          fontFamily: 'monospace',
          fontSize: '12px',
          lineHeight: '1.4',
          color: '#000'
        }}
      >
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="text-lg font-bold mb-2">{receiptData.organization.name}</h1>
          {receiptData.organization.address && (
            <div className="text-xs text-gray-600">
              {receiptData.organization.address}
            </div>
          )}
          {receiptData.organization.phone && (
            <div className="text-xs text-gray-600">
              Tel: {receiptData.organization.phone}
            </div>
          )}
          {receiptData.organization.email && (
            <div className="text-xs text-gray-600">
              Email: {receiptData.organization.email}
            </div>
          )}
        </div>

        <Separator className="my-4" />

        {/* Receipt Title */}
        <div className="text-center mb-4">
          <h2 className="text-md font-bold">PAYMENT RECEIPT</h2>
        </div>

        {/* Receipt Details */}
        <div className="mb-4 space-y-1">
          <div className="flex justify-between">
            <span>Receipt No:</span>
            <span className="font-bold">{receiptData.paymentNumber}</span>
          </div>
          <div className="flex justify-between">
            <span>Order No:</span>
            <span>{receiptData.orderNumber}</span>
          </div>
          <div className="flex justify-between">
            <span>Date:</span>
            <span>{format(new Date(receiptData.paymentDate), "MMM dd, yyyy HH:mm")}</span>
          </div>
          <div className="flex justify-between">
            <span>Customer:</span>
            <span className="text-right max-w-32 break-words">{receiptData.customerName}</span>
          </div>
          {receiptData.customerPhone && (
            <div className="flex justify-between">
              <span>Phone:</span>
              <span>{receiptData.customerPhone}</span>
            </div>
          )}
        </div>

        <Separator className="my-4" />

        {/* Order Items */}
        <div className="mb-4">
          <div className="font-bold mb-2">ORDER ITEMS:</div>
          <div className="space-y-1">
            {receiptData.items.map((item, index) => (
              <div key={index} className="text-xs">
                <div className="flex justify-between">
                  <span className="flex-1">{item.name}</span>
                </div>
                <div className="flex justify-between pl-2">
                  <span>{item.quantity} x ${item.unitPrice.toFixed(2)}</span>
                  <span>${item.totalPrice.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator className="my-3" />

        {/* Order Totals */}
        <div className="mb-4 space-y-1">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>${receiptData.subtotal.toFixed(2)}</span>
          </div>
          {receiptData.discountAmount > 0 && (
            <div className="flex justify-between">
              <span>Discount:</span>
              <span>-${receiptData.discountAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Tax:</span>
            <span>${receiptData.taxAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold border-t pt-1">
            <span>ORDER TOTAL:</span>
            <span>${receiptData.totalAmount.toFixed(2)}</span>
          </div>
        </div>

        <Separator className="my-3" />

        {/* Payment Details */}
        <div className="mb-4 space-y-1">
          <div className="font-bold mb-2">PAYMENT DETAILS:</div>
          <div className="flex justify-between">
            <span>Payment Method:</span>
            <span>{getMethodDisplayName(receiptData.method)}</span>
          </div>
          <div className="flex justify-between font-bold">
            <span>Amount Paid:</span>
            <span>${receiptData.amount.toFixed(2)}</span>
          </div>

          {/* Cash specific details */}
          {receiptData.method === "CASH" && receiptData.cashTendered && (
            <>
              <div className="flex justify-between">
                <span>Cash Tendered:</span>
                <span>${receiptData.cashTendered.toFixed(2)}</span>
              </div>
              {receiptData.changeGiven && receiptData.changeGiven > 0 && (
                <div className="flex justify-between font-bold">
                  <span>Change Given:</span>
                  <span>${receiptData.changeGiven.toFixed(2)}</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Check if this is a partial payment */}
        {receiptData.amount < receiptData.totalAmount && (
          <>
            <Separator className="my-3" />
            <div className="mb-4 space-y-1">
              <div className="flex justify-between">
                <span>Remaining Balance:</span>
                <span className="font-bold">${(receiptData.totalAmount - receiptData.amount).toFixed(2)}</span>
              </div>
            </div>
          </>
        )}

        <Separator className="my-4" />

        {/* Footer */}
        <div className="text-center text-xs text-gray-600 space-y-1">
          <div>Thank you for your business!</div>
          <div>Please keep this receipt for your records.</div>
          {receiptData.method === "CREDIT_CARD" || receiptData.method === "DEBIT_CARD" ? (
            <div className="mt-2">
              Returns: Please bring this receipt and your card for returns.
            </div>
          ) : receiptData.method === "CASH" ? (
            <div className="mt-2">
              Returns: Please bring this receipt for returns.
            </div>
          ) : null}
        </div>

        <div className="text-center text-xs text-gray-500 mt-4 border-t pt-2">
          Generated on {format(new Date(), "MMM dd, yyyy HH:mm:ss")}
        </div>
      </div>
    )
  }
)

ReceiptComponent.displayName = "ReceiptComponent"