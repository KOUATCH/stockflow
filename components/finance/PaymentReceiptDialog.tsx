"use client"

import { notify } from "@/lib/notifications/notify"
import React, { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useNotifications } from "@/components/notifications/NotificationProvider"
import {
  Download,
  FileText,
  Mail,
  Printer,
  Share2,
  Receipt,
  CreditCard,
  Calendar,
  Building,
  User,
  DollarSign
} from "lucide-react"

interface PaymentReceiptData {
  id: string
  paymentNumber: string
  paymentDate: Date
  amount: number
  paymentMethod: string
  referenceNumber?: string
  notes?: string
  discountTaken?: number
  organization: {
    name: string
    address?: string
    phone?: string
    email?: string
    taxId?: string
  }
  location?: {
    name: string
    address?: string
  }
  payer: {
    name: string
    email?: string
    phone?: string
    address?: string
  }
  invoice: {
    invoiceNumber: string
    totalAmount: number
    outstandingAmount: number
    description?: string
  }
  type: 'receivable' | 'payable'
}

interface PaymentReceiptDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  receiptData: PaymentReceiptData
}

export function PaymentReceiptDialog({
  open,
  onOpenChange,
  receiptData
}: PaymentReceiptDialogProps) {
  const printRef = useRef<HTMLDivElement>(null)
  const { success } = useNotifications()

  const isReceivable = receiptData.type === 'receivable'
  const paymentType = isReceivable ? 'Payment Received' : 'Payment Made'
  const fromTo = isReceivable ? 'From' : 'To'

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(date)
  }

  const handlePrint = () => {
    try {
      const printWindow = window.open("", "_blank")
      if (!printWindow) {
        notify({
          variant: "destructive",
          title: "Print Failed",
          description: "Unable to open print window. Please check popup blocker settings."
        })
        return
      }

      const printContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>${paymentType} Receipt - ${receiptData.paymentNumber}</title>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                font-size: 12px;
                line-height: 1.4;
                color: #333;
                background: white;
                max-width: 210mm;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                text-align: center;
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 3px solid #333;
              }
              .company-name {
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 10px;
                color: #333;
              }
              .receipt-title {
                font-size: 18px;
                font-weight: bold;
                margin: 15px 0;
                color: ${isReceivable ? '#059669' : '#dc2626'};
                text-transform: uppercase;
              }
              .receipt-number {
                font-size: 16px;
                font-weight: bold;
                margin: 10px 0;
                background: #f3f4f6;
                padding: 10px;
                border-radius: 5px;
              }
              .section {
                margin: 20px 0;
                padding: 15px;
                background: #f9fafb;
                border-radius: 8px;
              }
              .section-title {
                font-size: 14px;
                font-weight: bold;
                margin-bottom: 10px;
                color: #374151;
                border-bottom: 1px solid #d1d5db;
                padding-bottom: 5px;
              }
              .info-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 15px;
                margin: 15px 0;
              }
              .info-item {
                display: flex;
                justify-content: space-between;
                margin-bottom: 8px;
                padding: 5px 0;
              }
              .info-label {
                font-weight: 600;
                color: #6b7280;
              }
              .info-value {
                font-weight: 500;
                color: #111827;
              }
              .payment-amount {
                text-align: center;
                margin: 30px 0;
                padding: 20px;
                background: ${isReceivable ? '#ecfdf5' : '#fef2f2'};
                border-radius: 10px;
                border: 2px solid ${isReceivable ? '#10b981' : '#ef4444'};
              }
              .amount-label {
                font-size: 14px;
                color: #6b7280;
                margin-bottom: 5px;
              }
              .amount-value {
                font-size: 32px;
                font-weight: bold;
                color: ${isReceivable ? '#059669' : '#dc2626'};
              }
              .footer {
                text-align: center;
                margin-top: 40px;
                padding-top: 20px;
                border-top: 2px solid #e5e7eb;
                font-size: 11px;
                color: #6b7280;
              }
              @media print {
                body { print-color-adjust: exact; }
                .no-print { display: none !important; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="company-name">${receiptData.organization.name}</div>
              ${receiptData.organization.address ? `<div>${receiptData.organization.address}</div>` : ''}
              ${receiptData.organization.phone ? `<div>Phone: ${receiptData.organization.phone}</div>` : ''}
              ${receiptData.organization.email ? `<div>Email: ${receiptData.organization.email}</div>` : ''}
              <div class="receipt-title">${paymentType} Receipt</div>
              <div class="receipt-number">Receipt #${receiptData.paymentNumber}</div>
            </div>

            <div class="info-grid">
              <div class="section">
                <div class="section-title">Payment Information</div>
                <div class="info-item">
                  <span class="info-label">Date & Time:</span>
                  <span class="info-value">${formatDate(receiptData.paymentDate)}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Payment Method:</span>
                  <span class="info-value">${receiptData.paymentMethod}</span>
                </div>
                ${receiptData.referenceNumber ? `
                  <div class="info-item">
                    <span class="info-label">Reference #:</span>
                    <span class="info-value">${receiptData.referenceNumber}</span>
                  </div>
                ` : ''}
              </div>

              <div class="section">
                <div class="section-title">${fromTo} ${isReceivable ? 'Customer' : 'Supplier'}</div>
                <div class="info-item">
                  <span class="info-label">Name:</span>
                  <span class="info-value">${receiptData.payer.name}</span>
                </div>
                ${receiptData.payer.email ? `
                  <div class="info-item">
                    <span class="info-label">Email:</span>
                    <span class="info-value">${receiptData.payer.email}</span>
                  </div>
                ` : ''}
                ${receiptData.payer.phone ? `
                  <div class="info-item">
                    <span class="info-label">Phone:</span>
                    <span class="info-value">${receiptData.payer.phone}</span>
                  </div>
                ` : ''}
              </div>
            </div>

            <div class="section">
              <div class="section-title">Invoice Details</div>
              <div class="info-item">
                <span class="info-label">Invoice Number:</span>
                <span class="info-value">${receiptData.invoice.invoiceNumber}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Invoice Total:</span>
                <span class="info-value">${formatCurrency(receiptData.invoice.totalAmount)}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Outstanding Before Payment:</span>
                <span class="info-value">${formatCurrency(receiptData.invoice.outstandingAmount)}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Remaining Balance:</span>
                <span class="info-value">${formatCurrency(receiptData.invoice.outstandingAmount - receiptData.amount)}</span>
              </div>
            </div>

            <div class="payment-amount">
              <div class="amount-label">Amount ${isReceivable ? 'Received' : 'Paid'}</div>
              <div class="amount-value">${formatCurrency(receiptData.amount)}</div>
              ${receiptData.discountTaken && receiptData.discountTaken > 0 ? `
                <div style="margin-top: 10px; font-size: 14px; color: #059669;">
                  Discount Applied: ${formatCurrency(receiptData.discountTaken)}
                </div>
              ` : ''}
            </div>

            ${receiptData.notes ? `
              <div class="section">
                <div class="section-title">Notes</div>
                <div style="font-style: italic;">${receiptData.notes}</div>
              </div>
            ` : ''}

            <div class="footer">
              <div>Thank you for your ${isReceivable ? 'payment' : 'business'}!</div>
              <div style="margin-top: 10px;">
                Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
              </div>
              <div>Transaction ID: ${receiptData.id}</div>
            </div>
          </body>
        </html>
      `

      printWindow.document.write(printContent)
      printWindow.document.close()
      printWindow.focus()

      setTimeout(() => {
        printWindow.print()
        printWindow.close()
      }, 250)

      success("Receipt Printed", `${paymentType} receipt has been sent to printer`)
    } catch (error) {
      console.error("Print error:", error)
      notify({
        variant: "destructive",
        title: "Print Failed",
        description: "Unable to print receipt. Please try again.",
      })
    }
  }

  const handleShare = async () => {
    try {
      const shareText = `${paymentType} Receipt #${receiptData.paymentNumber}\n` +
        `${receiptData.organization.name}\n` +
        `Amount: ${formatCurrency(receiptData.amount)}\n` +
        `Date: ${formatDate(receiptData.paymentDate)}\n` +
        `${fromTo}: ${receiptData.payer.name}\n` +
        `Invoice: ${receiptData.invoice.invoiceNumber}`

      if (navigator.share) {
        await navigator.share({
          title: `${paymentType} Receipt #${receiptData.paymentNumber}`,
          text: shareText,
          url: window.location.href
        })
      } else {
        await navigator.clipboard.writeText(shareText)
        notify({
          title: "Receipt Copied",
          description: "Receipt details copied to clipboard.",
        })
      }
    } catch (error) {
      console.error("Share error:", error)
      notify({
        variant: "destructive",
        title: "Share Failed",
        description: "Unable to share receipt. Please try again.",
      })
    }
  }

  const handleEmail = () => {
    const subject = `${paymentType} Receipt #${receiptData.paymentNumber}`
    const body = `Dear ${receiptData.payer.name},

This is to confirm that we have ${isReceivable ? 'received' : 'processed'} your payment.

Payment Details:
- Receipt Number: ${receiptData.paymentNumber}
- Date: ${formatDate(receiptData.paymentDate)}
- Amount: ${formatCurrency(receiptData.amount)}
- Payment Method: ${receiptData.paymentMethod}
- Invoice: ${receiptData.invoice.invoiceNumber}

${receiptData.invoice.outstandingAmount - receiptData.amount <= 0
  ? 'This payment has settled your invoice in full.'
  : `Remaining balance: ${formatCurrency(receiptData.invoice.outstandingAmount - receiptData.amount)}`}

Thank you for your ${isReceivable ? 'payment' : 'business'}!

Best regards,
${receiptData.organization.name}
${receiptData.organization.phone || ''}
${receiptData.organization.email || ''}`

    const mailtoUrl = `mailto:${receiptData.payer.email || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.open(mailtoUrl, '_blank')

    notify({
      title: "Email Client Opened",
      description: "Email template has been prepared for sending.",
    })
  }

  const remainingBalance = receiptData.invoice.outstandingAmount - receiptData.amount
  const isFullyPaid = remainingBalance <= 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            {paymentType} Receipt
            <Badge variant={isReceivable ? "default" : "secondary"} className="ml-2">
              #{receiptData.paymentNumber}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-6 flex-1 overflow-hidden">
          {/* Receipt Preview */}
          <div className="flex-1 overflow-y-auto">
            <div ref={printRef} className="bg-white p-8 rounded-lg shadow-sm border">
              {/* Header */}
              <div className="text-center mb-8 pb-6 border-b-2">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                  {receiptData.organization.name}
                </h1>
                {receiptData.organization.address && (
                  <p className="text-gray-600 text-sm">{receiptData.organization.address}</p>
                )}
                {receiptData.organization.phone && (
                  <p className="text-gray-600 text-sm">Phone: {receiptData.organization.phone}</p>
                )}
                <h2 className={`text-xl font-bold mt-4 ${isReceivable ? 'text-green-600' : 'text-red-600'}`}>
                  {paymentType} Receipt
                </h2>
                <div className="bg-gray-100 inline-block px-4 py-2 rounded-lg mt-2">
                  <span className="font-semibold">Receipt #{receiptData.paymentNumber}</span>
                </div>
              </div>

              {/* Payment Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Payment Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Payment Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date & Time:</span>
                      <span className="font-medium">{formatDate(receiptData.paymentDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Method:</span>
                      <span className="font-medium flex items-center gap-1">
                        <CreditCard className="h-3 w-3" />
                        {receiptData.paymentMethod}
                      </span>
                    </div>
                    {receiptData.referenceNumber && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Reference:</span>
                        <span className="font-medium font-mono text-xs">{receiptData.referenceNumber}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Payer Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {fromTo} {isReceivable ? 'Customer' : 'Supplier'}
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium">{receiptData.payer.name}</span>
                    </div>
                    {receiptData.payer.email && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email:</span>
                        <span className="font-medium">{receiptData.payer.email}</span>
                      </div>
                    )}
                    {receiptData.payer.phone && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Phone:</span>
                        <span className="font-medium">{receiptData.payer.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Invoice Details */}
              <div className="bg-gray-50 p-4 rounded-lg mb-8">
                <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Invoice Details
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Invoice Number:</span>
                    <span className="font-medium">{receiptData.invoice.invoiceNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Invoice Total:</span>
                    <span className="font-medium">{formatCurrency(receiptData.invoice.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Outstanding Before:</span>
                    <span className="font-medium">{formatCurrency(receiptData.invoice.outstandingAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Remaining Balance:</span>
                    <span className={`font-medium ${isFullyPaid ? 'text-green-600' : ''}`}>
                      {formatCurrency(remainingBalance)}
                      {isFullyPaid && <span className="ml-1 text-green-600 font-semibold">✓ PAID IN FULL</span>}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Amount Highlight */}
              <div className={`text-center py-8 mb-8 rounded-lg border-2 ${
                isReceivable
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="text-gray-600 text-sm mb-2">Amount {isReceivable ? 'Received' : 'Paid'}</div>
                <div className={`text-4xl font-bold ${isReceivable ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(receiptData.amount)}
                </div>
                {receiptData.discountTaken && receiptData.discountTaken > 0 && (
                  <div className="text-green-600 text-sm mt-2">
                    Discount Applied: {formatCurrency(receiptData.discountTaken)}
                  </div>
                )}
              </div>

              {/* Notes */}
              {receiptData.notes && (
                <div className="bg-gray-50 p-4 rounded-lg mb-8">
                  <h3 className="font-semibold text-gray-700 mb-2">Notes</h3>
                  <p className="text-sm text-gray-600 italic">{receiptData.notes}</p>
                </div>
              )}

              {/* Footer */}
              <div className="text-center text-gray-500 text-xs border-t pt-4">
                <p className="mb-2">Thank you for your {isReceivable ? 'payment' : 'business'}!</p>
                <p>Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}</p>
                <p className="font-mono">Transaction ID: {receiptData.id}</p>
              </div>
            </div>
          </div>

          {/* Actions Panel */}
          <div className="w-64 flex-shrink-0 space-y-4">
            <div>
              <h3 className="font-semibold mb-3 text-sm text-gray-700">Receipt Actions</h3>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handlePrint}
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print Receipt
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleShare}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Receipt
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleEmail}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Email Receipt
                </Button>
              </div>
            </div>

            <Separator />

            <div className="text-xs text-gray-500 space-y-2">
              <div>
                <div className="font-semibold mb-1">Payment Status:</div>
                <Badge
                  variant={isFullyPaid ? "default" : "secondary"}
                  className={isFullyPaid ? "bg-green-100 text-green-800" : ""}
                >
                  {isFullyPaid ? "Invoice Paid in Full" : "Partial Payment"}
                </Badge>
              </div>

              <div>
                <div className="font-semibold mb-1">Transaction ID:</div>
                <div className="font-mono bg-gray-100 p-2 rounded text-xs break-all">
                  {receiptData.id}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print Receipt
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default PaymentReceiptDialog
