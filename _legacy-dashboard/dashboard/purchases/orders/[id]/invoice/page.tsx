import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getAuthenticatedUser } from "@/config/useAuth";
import {
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  Download,
  FileText,
  Mail,
  MapPin,
  Phone,
  Print,
  Send,
  Share
} from "lucide-react";
import Link from "next/link";

interface InvoicePageProps {
  params: {
    id: string;
  };
}

// Mock invoice data
const mockInvoiceData = {
  invoiceNumber: "INV-2024-001",
  orderNumber: "PO-2024-001",
  invoiceDate: new Date("2024-11-18"),
  dueDate: new Date("2024-12-15"),
  status: "paid",
  paymentDate: new Date("2024-11-20"),
  paymentMethod: "Bank Transfer",
  reference: "REF-TXN-001234",

  // Company details
  company: {
    name: "StockFlow Solutions Inc.",
    address: "456 Business Plaza",
    city: "San Francisco",
    state: "CA",
    zipCode: "94105",
    country: "USA",
    taxId: "TAX-SF-123456",
    email: "billing@stockflow.com",
    phone: "+1-555-987-6543"
  },

  // Supplier details
  supplier: {
    name: "TechCorp Solutions Ltd.",
    code: "TC001",
    address: "123 Innovation Drive",
    city: "San Francisco",
    state: "CA",
    zipCode: "94102",
    country: "USA",
    taxId: "TAX-TC-789012",
    email: "sales@techcorp.com",
    phone: "+1-555-123-4567"
  },

  // Financial details
  subtotal: 13661.00,
  discount: 500.00,
  discountPercentage: 3.5,
  tax: 1234.50,
  taxRate: 8.75,
  shippingCost: 125.00,
  total: 15420.50,

  // Invoice items
  items: [
    {
      id: "1",
      description: "Wireless Bluetooth Headphones",
      sku: "WBH-001",
      quantity: 25,
      unitPrice: 45.50,
      lineTotal: 1137.50
    },
    {
      id: "2",
      description: "USB-C Charging Cable",
      sku: "USB-C-001",
      quantity: 100,
      unitPrice: 12.99,
      lineTotal: 1299.00
    },
    {
      id: "3",
      description: "Laptop Stand Adjustable",
      sku: "LSA-001",
      quantity: 15,
      unitPrice: 89.00,
      lineTotal: 1335.00
    },
    {
      id: "4",
      description: "Wireless Mouse",
      sku: "WM-001",
      quantity: 50,
      unitPrice: 25.75,
      lineTotal: 1287.50
    },
    {
      id: "5",
      description: "Portable Power Bank",
      sku: "PPB-001",
      quantity: 30,
      unitPrice: 32.00,
      lineTotal: 960.00
    },
    {
      id: "6",
      description: "Bluetooth Keyboard",
      sku: "BK-001",
      quantity: 20,
      unitPrice: 67.50,
      lineTotal: 1350.00
    },
    {
      id: "7",
      description: "Monitor Stand Dual",
      sku: "MSD-001",
      quantity: 10,
      unitPrice: 145.00,
      lineTotal: 1450.00
    },
    {
      id: "8",
      description: "Webcam HD",
      sku: "WC-HD-001",
      quantity: 35,
      unitPrice: 42.00,
      lineTotal: 1470.00
    }
  ],

  // Payment terms
  paymentTerms: "Net 30 days",
  notes: "Thank you for your business. Payment is due within 30 days of invoice date.",

  // Bank details for payment
  bankDetails: {
    bankName: "First National Bank",
    accountName: "TechCorp Solutions Ltd.",
    accountNumber: "****-****-1234",
    routingNumber: "****5678",
    swiftCode: "FNBUSAA"
  }
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
};

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
};

const getStatusBadge = (status: string) => {
  const statusConfig = {
    paid: { className: "bg-green-100 text-green-700 border-green-200 dark:bg-green-900 dark:text-green-300", icon: CheckCircle },
    pending: { className: "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-300", icon: Clock },
    overdue: { className: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900 dark:text-red-300", icon: Clock }
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  const IconComponent = config.icon;

  return (
    <Badge className={`flex items-center gap-1 text-sm font-medium ${config.className}`}>
      <IconComponent className="w-4 h-4" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

export default async function InvoicePage({ params }: InvoicePageProps) {
  const user = await getAuthenticatedUser();
  const userOrg = user?.organizationId;

  if (!userOrg) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        <div className="container py-8">
          <div className="max-w-md mx-auto text-center py-16">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <Building2 className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-3">Access Denied</h3>
            <p className="text-muted-foreground">You need to be part of an organization to view invoices.</p>
          </div>
        </div>
      </div>
    );
  }

  const invoice = mockInvoiceData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Header Actions */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Link href={`/dashboard/purchases/orders/${params.id}`}>
              <Button variant="outline" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Order
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                Invoice
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                {invoice.invoiceNumber} • {invoice.supplier.name}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2">
                <Print className="w-4 h-4" />
                Print
              </Button>
              <Button variant="outline" className="gap-2">
                <Mail className="w-4 h-4" />
                Email
              </Button>
              <Button variant="outline" className="gap-2">
                <Share className="w-4 h-4" />
                Share
              </Button>
              <Button className="gap-2">
                <Download className="w-4 h-4" />
                Download PDF
              </Button>
            </div>
          </div>
        </div>

        {/* Invoice Document */}
        <Card className="shadow-2xl">
          <CardContent className="p-8 bg-white dark:bg-slate-900">
            {/* Invoice Header */}
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">INVOICE</h2>
                <div className="space-y-1">
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">{invoice.invoiceNumber}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Order: {invoice.orderNumber}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="mb-4">
                  {getStatusBadge(invoice.status)}
                </div>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Invoice Date:</span> {formatDate(invoice.invoiceDate)}</p>
                  <p><span className="font-medium">Due Date:</span> {formatDate(invoice.dueDate)}</p>
                  {invoice.status === "paid" && (
                    <p><span className="font-medium">Paid Date:</span> {formatDate(invoice.paymentDate)}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Bill To / Bill From */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Bill From:</h3>
                <div className="space-y-1 text-sm">
                  <p className="font-semibold text-slate-900 dark:text-white">{invoice.supplier.name}</p>
                  <p className="text-slate-600 dark:text-slate-400">Code: {invoice.supplier.code}</p>
                  <p className="text-slate-600 dark:text-slate-400">{invoice.supplier.address}</p>
                  <p className="text-slate-600 dark:text-slate-400">
                    {invoice.supplier.city}, {invoice.supplier.state} {invoice.supplier.zipCode}
                  </p>
                  <p className="text-slate-600 dark:text-slate-400">{invoice.supplier.country}</p>
                  <div className="mt-3 space-y-1">
                    <p className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-slate-400" />
                      {invoice.supplier.email}
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-slate-400" />
                      {invoice.supplier.phone}
                    </p>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">Tax ID: {invoice.supplier.taxId}</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Bill To:</h3>
                <div className="space-y-1 text-sm">
                  <p className="font-semibold text-slate-900 dark:text-white">{invoice.company.name}</p>
                  <p className="text-slate-600 dark:text-slate-400">{invoice.company.address}</p>
                  <p className="text-slate-600 dark:text-slate-400">
                    {invoice.company.city}, {invoice.company.state} {invoice.company.zipCode}
                  </p>
                  <p className="text-slate-600 dark:text-slate-400">{invoice.company.country}</p>
                  <div className="mt-3 space-y-1">
                    <p className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-slate-400" />
                      {invoice.company.email}
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-slate-400" />
                      {invoice.company.phone}
                    </p>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">Tax ID: {invoice.company.taxId}</p>
                </div>
              </div>
            </div>

            {/* Invoice Items Table */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Invoice Items</h3>
              <div className="overflow-x-auto">
                <table className="w-full border border-slate-200 dark:border-slate-700">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800">
                      <th className="text-left py-3 px-4 border-b border-slate-200 dark:border-slate-700 font-semibold text-slate-900 dark:text-white">
                        Description
                      </th>
                      <th className="text-left py-3 px-4 border-b border-slate-200 dark:border-slate-700 font-semibold text-slate-900 dark:text-white">
                        SKU
                      </th>
                      <th className="text-right py-3 px-4 border-b border-slate-200 dark:border-slate-700 font-semibold text-slate-900 dark:text-white">
                        Qty
                      </th>
                      <th className="text-right py-3 px-4 border-b border-slate-200 dark:border-slate-700 font-semibold text-slate-900 dark:text-white">
                        Unit Price
                      </th>
                      <th className="text-right py-3 px-4 border-b border-slate-200 dark:border-slate-700 font-semibold text-slate-900 dark:text-white">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.items.map((item) => (
                      <tr key={item.id} className="border-b border-slate-100 dark:border-slate-800">
                        <td className="py-3 px-4 text-slate-900 dark:text-white">{item.description}</td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-mono text-sm">{item.sku}</td>
                        <td className="py-3 px-4 text-right text-slate-900 dark:text-white">{item.quantity}</td>
                        <td className="py-3 px-4 text-right text-slate-900 dark:text-white">{formatCurrency(item.unitPrice)}</td>
                        <td className="py-3 px-4 text-right text-slate-900 dark:text-white font-semibold">
                          {formatCurrency(item.lineTotal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Invoice Totals */}
            <div className="flex justify-end mb-8">
              <div className="w-80">
                <div className="space-y-2">
                  <div className="flex justify-between py-2">
                    <span className="text-slate-600 dark:text-slate-400">Subtotal:</span>
                    <span className="text-slate-900 dark:text-white font-medium">{formatCurrency(invoice.subtotal)}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-slate-600 dark:text-slate-400">
                      Discount ({invoice.discountPercentage}%):
                    </span>
                    <span className="text-green-600 dark:text-green-400 font-medium">
                      -{formatCurrency(invoice.discount)}
                    </span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-slate-600 dark:text-slate-400">Shipping:</span>
                    <span className="text-slate-900 dark:text-white font-medium">{formatCurrency(invoice.shippingCost)}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-slate-600 dark:text-slate-400">
                      Tax ({invoice.taxRate}%):
                    </span>
                    <span className="text-slate-900 dark:text-white font-medium">{formatCurrency(invoice.tax)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between py-3">
                    <span className="text-xl font-bold text-slate-900 dark:text-white">Total:</span>
                    <span className="text-xl font-bold text-slate-900 dark:text-white">{formatCurrency(invoice.total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Payment Terms</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Terms:</span> {invoice.paymentTerms}</p>
                  <p><span className="font-medium">Due Date:</span> {formatDate(invoice.dueDate)}</p>
                  {invoice.status === "paid" && (
                    <>
                      <p><span className="font-medium">Payment Method:</span> {invoice.paymentMethod}</p>
                      <p><span className="font-medium">Reference:</span> {invoice.reference}</p>
                    </>
                  )}
                </div>
              </div>

              {invoice.status !== "paid" && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Bank Details</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Bank:</span> {invoice.bankDetails.bankName}</p>
                    <p><span className="font-medium">Account Name:</span> {invoice.bankDetails.accountName}</p>
                    <p><span className="font-medium">Account Number:</span> {invoice.bankDetails.accountNumber}</p>
                    <p><span className="font-medium">Routing Number:</span> {invoice.bankDetails.routingNumber}</p>
                    <p><span className="font-medium">SWIFT Code:</span> {invoice.bankDetails.swiftCode}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Notes */}
            <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Notes</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">{invoice.notes}</p>
            </div>

            {/* Invoice Footer */}
            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700 text-center">
              <p className="text-xs text-slate-500 dark:text-slate-500">
                This is a computer-generated invoice. For any queries, please contact {invoice.supplier.email}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}