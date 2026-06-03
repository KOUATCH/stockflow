"use client"

import { useRef } from "react"
import { useReactToPrint } from "react-to-print"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ReceiptComponent } from "./ReceiptComponent"
import { ReceiptData } from "@/types/payments"
import { Printer, Download, X } from "lucide-react"

interface ReceiptModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  receiptData: ReceiptData | null
}

export function ReceiptModal({
  open,
  onOpenChange,
  receiptData,
}: ReceiptModalProps) {
  const receiptRef = useRef<HTMLDivElement>(null)

  const handlePrint = useReactToPrint({
    content: () => receiptRef.current,
    documentTitle: `Receipt-${receiptData?.paymentNumber}`,
    pageStyle: `
      @page {
        size: 80mm auto;
        margin: 0;
      }
      @media print {
        body {
          margin: 0;
          padding: 10mm;
          background: white !important;
        }
        * {
          -webkit-print-color-adjust: exact !important;
          color-adjust: exact !important;
        }
      }
    `,
  })

  const handleDownload = () => {
    if (!receiptData) return

    // Create a new window for printing/downloading
    const printWindow = window.open('', '_blank')
    if (printWindow && receiptRef.current) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Receipt-${receiptData.paymentNumber}</title>
            <style>
              body {
                font-family: monospace;
                font-size: 12px;
                line-height: 1.4;
                margin: 0;
                padding: 20px;
                background: white;
                color: black;
              }
              .receipt {
                max-width: 300px;
                margin: 0 auto;
              }
              .separator {
                border-top: 1px solid #ccc;
                margin: 12px 0;
              }
              @page {
                size: 80mm auto;
                margin: 0;
              }
              @media print {
                body {
                  margin: 0;
                  padding: 10mm;
                }
              }
            </style>
          </head>
          <body>
            ${receiptRef.current.outerHTML}
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.focus()

      // Auto print and close
      setTimeout(() => {
        printWindow.print()
        printWindow.close()
      }, 250)
    }
  }

  if (!receiptData) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Payment Receipt</span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="flex items-center gap-2"
              >
                <Printer className="h-4 w-4" />
                Print
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogTitle>
          <DialogDescription>
            Receipt for Payment {receiptData.paymentNumber} • Order {receiptData.orderNumber}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          <div className="flex justify-center p-4 bg-gray-50 rounded-lg">
            <ReceiptComponent
              ref={receiptRef}
              receiptData={receiptData}
              className="shadow-lg border border-gray-200 rounded-lg bg-white"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={handlePrint} className="flex items-center gap-2">
            <Printer className="h-4 w-4" />
            Print Receipt
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}