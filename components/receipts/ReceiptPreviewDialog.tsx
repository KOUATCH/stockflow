"use client"

import { notify } from "@/lib/notifications/notify"
import React, { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import ModernEnterpriseReceipt from "./ModernEnterpriseReceipt"
import { useSendReceipt } from "@/hooks/posHooks/useReceiptDelivery"
import { useTranslations } from "next-intl"
import {
  Download,
  FileText,
  Mail,
  MessageCircle,
  Monitor,
  Printer,
  Share2,
  Smartphone
} from "lucide-react"

interface ReceiptPreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  receiptData: any
  organizationData?: {
    name: string
    address?: string
    phone?: string
    taxId?: string
  }
  locationData?: {
    name: string
  }
  terminalId?: string
  cashierName?: string
  sessionNumber?: string
}

export function ReceiptPreviewDialog({
  open,
  onOpenChange,
  receiptData,
  organizationData,
  locationData,
  terminalId,
  cashierName,
  sessionNumber
}: ReceiptPreviewDialogProps) {
  const printRef = useRef<HTMLDivElement>(null)
  const t = useTranslations("receiptPreview")
  const sendReceiptMutation = useSendReceipt()

  const transformedReceiptData = {
    id: receiptData?.id || `TXN-${Date.now()}`,
    receiptNumber: receiptData?.receiptNumber || `RCP-${Date.now()}`,
    transactionDate: receiptData?.transactionDate || new Date(),
    organizationName: organizationData?.name || "Your Business Name",
    organizationAddress: organizationData?.address,
    organizationPhone: organizationData?.phone,
    organizationTaxId: organizationData?.taxId,
    locationName: locationData?.name,
    terminalId,
    cashierName,
    sessionNumber,
    customer: receiptData?.customer,
    lines: receiptData?.lines || [],
    subtotal: receiptData?.subtotal || 0,
    discountAmount: receiptData?.discountAmount || 0,
    taxAmount: receiptData?.taxAmount || 0,
    totalAmount: receiptData?.totalAmount || 0,
    payments: receiptData?.payments || [],
    cashTendered: receiptData?.cashTendered,
    changeGiven: receiptData?.changeGiven,
    notes: receiptData?.notes
  }

  const handleWhatsApp = async () => {
    try {
      const result = await sendReceiptMutation.mutateAsync({
        salesOrderId: transformedReceiptData.id,
        channel: "WHATSAPP",
        destination: transformedReceiptData.customer?.phone,
        locale: navigator.language.toLowerCase().startsWith("fr") ? "FR" : "EN",
      })

      if (!result.success) {
        notify.error(t("whatsappFailedTitle"), result.error || t("whatsappFailedMessage"))
        return
      }

      notify.success(t("whatsappQueuedTitle"), result.data?.message || t("whatsappQueuedMessage"))
    } catch (error) {
      notify.error(
        t("whatsappFailedTitle"),
        error instanceof Error ? error.message : t("whatsappFailedMessage"),
      )
    }
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

      const printContent = printRef.current?.innerHTML || ""

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Receipt - ${transformedReceiptData.receiptNumber}</title>
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
              }
              .receipt-container {
                max-width: 80mm;
                margin: 0 auto;
                padding: 10px;
                background: white;
              }
              .header {
                text-align: center;
                margin-bottom: 15px;
                padding-bottom: 10px;
                border-bottom: 2px solid #333;
              }
              .company-name {
                font-size: 16px;
                font-weight: bold;
                margin-bottom: 5px;
              }
              .company-details {
                font-size: 10px;
                color: #666;
              }
              .receipt-info {
                margin: 15px 0;
                font-size: 10px;
              }
              .receipt-number {
                text-align: center;
                font-weight: bold;
                margin: 10px 0;
                font-size: 14px;
              }
              .items-section {
                margin: 15px 0;
              }
              .item {
                margin-bottom: 8px;
                padding-bottom: 5px;
              }
              .item-name {
                font-weight: bold;
                margin-bottom: 2px;
              }
              .item-details {
                font-size: 10px;
                color: #666;
                display: flex;
                justify-content: space-between;
              }
              .item-price {
                text-align: right;
                font-weight: bold;
              }
              .totals {
                margin: 15px 0;
                padding-top: 10px;
                border-top: 1px solid #333;
              }
              .total-line {
                display: flex;
                justify-content: space-between;
                margin-bottom: 3px;
                font-size: 11px;
              }
              .final-total {
                display: flex;
                justify-content: space-between;
                font-weight: bold;
                font-size: 14px;
                padding-top: 5px;
                border-top: 1px solid #333;
              }
              .payment-section {
                margin: 15px 0;
                padding-top: 10px;
                border-top: 1px solid #ddd;
              }
              .payment-method {
                display: flex;
                justify-content: space-between;
                margin-bottom: 5px;
                font-size: 11px;
              }
              .footer {
                text-align: center;
                margin-top: 15px;
                padding-top: 10px;
                border-top: 1px solid #ddd;
                font-size: 10px;
                color: #666;
              }
              .separator {
                border-bottom: 1px dashed #999;
                margin: 10px 0;
              }
              @media print {
                body { print-color-adjust: exact; }
                .no-print { display: none !important; }
              }
            </style>
          </head>
          <body>
            <div class="receipt-container">
              <div class="header">
                <div class="company-name">${transformedReceiptData.organizationName}</div>
                ${transformedReceiptData.organizationAddress ? `<div class="company-details">${transformedReceiptData.organizationAddress}</div>` : ''}
                ${transformedReceiptData.organizationPhone ? `<div class="company-details">${transformedReceiptData.organizationPhone}</div>` : ''}
                ${transformedReceiptData.organizationTaxId ? `<div class="company-details">Tax ID: ${transformedReceiptData.organizationTaxId}</div>` : ''}
              </div>

              <div class="receipt-number">RECEIPT #${transformedReceiptData.receiptNumber}</div>

              <div class="receipt-info">
                <div>Date: ${transformedReceiptData.transactionDate.toLocaleDateString()}</div>
                <div>Time: ${transformedReceiptData.transactionDate.toLocaleTimeString()}</div>
                ${transformedReceiptData.terminalId ? `<div>Terminal: ${transformedReceiptData.terminalId}</div>` : ''}
                ${transformedReceiptData.cashierName ? `<div>Cashier: ${transformedReceiptData.cashierName}</div>` : ''}
              </div>

              ${transformedReceiptData.customer ? `
                <div class="separator"></div>
                <div style="margin: 10px 0; font-size: 11px;">
                  <strong>Customer:</strong> ${transformedReceiptData.customer.name}
                  ${transformedReceiptData.customer.phone ? `<br>Phone: ${transformedReceiptData.customer.phone}` : ''}
                </div>
              ` : ''}

              <div class="separator"></div>

              <div class="items-section">
                ${transformedReceiptData.lines.map((line: any) => `
                  <div class="item">
                    <div class="item-name">${line.name}</div>
                    <div class="item-details">
                      <span>${line.quantity} x $${line.unitPrice.toFixed(2)}</span>
                      <span class="item-price">$${line.lineTotal.toFixed(2)}</span>
                    </div>
                    <div style="font-size: 9px; color: #999;">SKU: ${line.sku}</div>
                  </div>
                `).join('')}
              </div>

              <div class="totals">
                <div class="total-line">
                  <span>Subtotal:</span>
                  <span>$${transformedReceiptData.subtotal.toFixed(2)}</span>
                </div>
                ${transformedReceiptData.discountAmount > 0 ? `
                  <div class="total-line" style="color: green;">
                    <span>Discount:</span>
                    <span>-$${transformedReceiptData.discountAmount.toFixed(2)}</span>
                  </div>
                ` : ''}
                ${transformedReceiptData.taxAmount > 0 ? `
                  <div class="total-line">
                    <span>Tax:</span>
                    <span>$${transformedReceiptData.taxAmount.toFixed(2)}</span>
                  </div>
                ` : ''}
                <div class="final-total">
                  <span>TOTAL:</span>
                  <span>$${transformedReceiptData.totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <div class="payment-section">
                <div style="font-weight: bold; margin-bottom: 5px; font-size: 11px;">Payment:</div>
                ${transformedReceiptData.payments.map((payment: any) => `
                  <div class="payment-method">
                    <span>${payment.method}${payment.cardType && payment.cardLastFour ? ` (${payment.cardType} ****${payment.cardLastFour})` : ''}</span>
                    <span>$${payment.amount.toFixed(2)}</span>
                  </div>
                `).join('')}
                ${transformedReceiptData.cashTendered && transformedReceiptData.changeGiven !== undefined ? `
                  <div class="separator"></div>
                  <div class="payment-method">
                    <span>Cash Tendered:</span>
                    <span>$${transformedReceiptData.cashTendered.toFixed(2)}</span>
                  </div>
                  <div class="payment-method" style="font-weight: bold;">
                    <span>Change:</span>
                    <span>$${transformedReceiptData.changeGiven.toFixed(2)}</span>
                  </div>
                ` : ''}
              </div>

              <div class="footer">
                <div>Thank you for your business!</div>
                <div style="margin-top: 5px;">Transaction ID: ${transformedReceiptData.id}</div>
              </div>
            </div>
          </body>
        </html>
      `)

      printWindow.document.close()
      printWindow.focus()

      setTimeout(() => {
        printWindow.print()
        printWindow.close()
      }, 250)

      notify({
        title: "Printing Receipt",
        description: "Receipt has been sent to printer.",
      })
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
      if (navigator.share) {
        await navigator.share({
          title: `Receipt #${transformedReceiptData.receiptNumber}`,
          text: `Receipt from ${transformedReceiptData.organizationName} - Total: $${transformedReceiptData.totalAmount.toFixed(2)}`,
          url: window.location.href
        })

        notify({
          title: "Receipt Shared",
          description: "Receipt has been shared successfully.",
        })
      } else {
        // Fallback for browsers that don't support Web Share API
        await navigator.clipboard.writeText(
          `Receipt #${transformedReceiptData.receiptNumber}\n` +
          `${transformedReceiptData.organizationName}\n` +
          `Date: ${transformedReceiptData.transactionDate.toLocaleDateString()}\n` +
          `Total: $${transformedReceiptData.totalAmount.toFixed(2)}\n` +
          `Transaction ID: ${transformedReceiptData.id}`
        )

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
    const subject = `Receipt #${transformedReceiptData.receiptNumber} - ${transformedReceiptData.organizationName}`
    const body = `
Receipt #${transformedReceiptData.receiptNumber}
${transformedReceiptData.organizationName}
Date: ${transformedReceiptData.transactionDate.toLocaleDateString()}
Time: ${transformedReceiptData.transactionDate.toLocaleTimeString()}

Items:
${transformedReceiptData.lines.map((line: any) =>
  `${line.name} x${line.quantity} @ $${line.unitPrice.toFixed(2)} = $${line.lineTotal.toFixed(2)}`
).join('\n')}

Subtotal: $${transformedReceiptData.subtotal.toFixed(2)}
${transformedReceiptData.discountAmount > 0 ? `Discount: -$${transformedReceiptData.discountAmount.toFixed(2)}\n` : ''}
${transformedReceiptData.taxAmount > 0 ? `Tax: $${transformedReceiptData.taxAmount.toFixed(2)}\n` : ''}
Total: $${transformedReceiptData.totalAmount.toFixed(2)}

Payment Method: ${transformedReceiptData.payments[0]?.method || 'N/A'}

Transaction ID: ${transformedReceiptData.id}

Thank you for your business!
`

    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.open(mailtoUrl, '_blank')

    notify({
      title: "Email Client Opened",
      description: "Email template has been prepared for sending.",
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Receipt Preview
            <Badge variant="outline" className="ml-2">
              #{transformedReceiptData.receiptNumber}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-6 flex-1 overflow-hidden">
          {/* Receipt Preview */}
          <div className="flex-1 overflow-y-auto">
            <div ref={printRef}>
              <ModernEnterpriseReceipt
                receiptData={transformedReceiptData}
                variant="standard"
                showActions={false}
              />
            </div>
          </div>

          {/* Actions Panel */}
          <div className="w-64 flex-shrink-0 space-y-4">
            <div>
              <h3 className="font-semibold mb-3 text-sm text-gray-700">Receipt Options</h3>
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

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleWhatsApp}
                  disabled={sendReceiptMutation.isPending}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  {sendReceiptMutation.isPending ? t("whatsappSending") : t("sendWhatsApp")}
                </Button>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-3 text-sm text-gray-700">Preview Modes</h3>
              <div className="space-y-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-xs"
                  disabled
                >
                  <Monitor className="h-3 w-3 mr-2" />
                  Standard View (Active)
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-xs opacity-50"
                  disabled
                >
                  <Smartphone className="h-3 w-3 mr-2" />
                  Thermal Print View
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-xs opacity-50"
                  disabled
                >
                  <Download className="h-3 w-3 mr-2" />
                  Email Template
                </Button>
              </div>
            </div>

            <Separator />

            <div className="text-xs text-gray-500 space-y-1">
              <div><strong>Transaction ID:</strong></div>
              <div className="font-mono bg-gray-100 p-2 rounded text-xs break-all">
                {transformedReceiptData.id}
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
            Print
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ReceiptPreviewDialog
