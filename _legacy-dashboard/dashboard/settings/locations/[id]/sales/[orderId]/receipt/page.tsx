"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle,
  Copy,
  CreditCard,
  DollarSign,
  Hash,
  Mail,
  MapPin,
  MessageCircle,
  Package,
  Phone,
  Printer,
  Shield,
  ShoppingCart,
  Star,
  User,
  X
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import QRCode from "qrcode";

// Mock data - in a real app this would come from your API
const mockReceiptData = {
  business: {
    name: "StockFlow Retail",
    address: "123 Business Avenue, Suite 100",
    city: "Business City, BC 12345",
    phone: "+1 (555) 123-BUSI",
    email: "contact@stockflow.com",
    website: "www.stockflow.com",
    taxId: "TAX123456789"
  },
  location: {
    name: "Main Store Location",
    address: "456 Store Street",
    city: "Store City, SC 67890",
    phone: "+1 (555) 456-STORE"
  },
  order: {
    id: "SO-001",
    customerName: "John Smith",
    customerEmail: "john.smith@email.com",
    customerPhone: "+1 (555) 123-4567",
    customerAddress: "123 Main St, Anytown, AN 12345",
    total: 245.99,
    subtotal: 225.45,
    tax: 20.54,
    taxRate: 8.25,
    status: "completed",
    paymentMethod: "credit_card",
    paymentStatus: "paid",
    cashier: "Jane Doe",
    terminal: "POS-001",
    createdAt: new Date("2024-12-30T10:30:00"),
    items: [
      {
        id: "1",
        name: "Premium Coffee Beans",
        sku: "COF-001",
        quantity: 2,
        unitPrice: 15.99,
        totalPrice: 31.98,
        taxRate: 8.25
      },
      {
        id: "2",
        name: "Wireless Headphones",
        sku: "ELE-002",
        quantity: 1,
        unitPrice: 89.99,
        totalPrice: 89.99,
        taxRate: 8.25
      },
      {
        id: "3",
        name: "Artisan Chocolate",
        sku: "FOD-005",
        quantity: 10,
        unitPrice: 12.99,
        totalPrice: 129.90,
        taxRate: 8.25
      }
    ]
  }
};

export default function PrintReceiptPage() {
  const params = useParams();
  const locationId = params.id as string;
  const orderId = params.orderId as string;
  const [isPrinting, setIsPrinting] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");

  useEffect(() => {
    // Auto-focus for better print experience
    window.focus();

    // Generate QR code for digital receipt
    generateQRCode();
  }, []);

  const generateQRCode = async () => {
    try {
      const digitalReceiptUrl = `${window.location.origin}/digital-receipt/${orderId}`;
      const qrUrl = await QRCode.toDataURL(digitalReceiptUrl, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrCodeUrl(qrUrl);
    } catch (error) {
      console.error("Error generating QR code:", error);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    }).format(new Date(date));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
    }).format(amount);
  };

  const handlePrint = () => {
    setIsPrinting(true);

    // Enhanced print styles for better receipt formatting
    const printStyle = document.createElement('style');
    printStyle.textContent = `
      @media print {
        .no-print { display: none !important; }

        body {
          margin: 0;
          padding: 0;
          font-size: 12px;
          line-height: 1.4;
          color: #000;
          background: white;
        }

        .receipt-container {
          max-width: none !important;
          margin: 0 !important;
          padding: 0 !important;
          box-shadow: none !important;
          border: none !important;
          border-radius: 0 !important;
          background: white !important;
        }

        .receipt-card {
          box-shadow: none !important;
          border: none !important;
          border-radius: 0 !important;
          background: white !important;
        }

        .receipt-content {
          padding: 10mm !important;
          max-width: 80mm;
          margin: 0 auto;
        }

        h1 { font-size: 18px; margin: 5px 0; }
        h2 { font-size: 16px; margin: 4px 0; }
        h3 { font-size: 14px; margin: 3px 0; }

        .print-divider {
          border-color: #000 !important;
          margin: 8px 0;
        }

        .print-total {
          font-weight: bold;
          font-size: 14px;
          border-top: 2px solid #000;
          padding-top: 4px;
        }

        /* Ensure all text is black for print */
        * {
          color: #000 !important;
          background: transparent !important;
        }

        .gradient-icon {
          background: #666 !important;
        }

        /* Page break settings */
        .receipt-container {
          page-break-inside: avoid;
        }

        /* Thermal printer optimization */
        @page {
          size: 80mm auto;
          margin: 5mm;
        }
      }
    `;
    document.head.appendChild(printStyle);

    // Small delay to ensure styles are applied
    setTimeout(() => {
      window.print();

      // Clean up after print dialog
      setTimeout(() => {
        document.head.removeChild(printStyle);
        setIsPrinting(false);
      }, 500);
    }, 100);
  };

  const handleWhatsAppShare = () => {
    if (phoneNumber) {
      const digitalReceiptUrl = `${window.location.origin}/digital-receipt/${orderId}`;
      const message = `Hi! Here's your digital receipt for order ${orderId} from ${mockReceiptData.business.name}. Total: ${formatCurrency(mockReceiptData.order.total)}. View your receipt: ${digitalReceiptUrl}`;

      // Format phone number (remove any non-digits)
      const cleanPhone = phoneNumber.replace(/\D/g, '');
      const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

      window.open(whatsappUrl, '_blank');
      setShowWhatsAppModal(false);
      setPhoneNumber("");
    }
  };

  const copyDigitalReceiptLink = () => {
    const digitalReceiptUrl = `${window.location.origin}/digital-receipt/${orderId}`;
    navigator.clipboard.writeText(digitalReceiptUrl);
    alert("Digital receipt link copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 print:bg-white">
      {/* Header - Hidden on print */}
      <div className="no-print mb-6 p-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-4">
            <Link href={`/dashboard/settings/locations/${locationId}/sales/${orderId}`}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Order
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Receipt for Order #{orderId}
            </h1>
          </div>
          <Button
            onClick={handlePrint}
            disabled={isPrinting}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
          >
            <Printer className="w-4 h-4 mr-2" />
            {isPrinting ? "Printing..." : "Print Receipt"}
          </Button>
          <Button
            onClick={() => setShowWhatsAppModal(true)}
            variant="outline"
            className="border-green-600 text-green-600 hover:bg-green-50"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Send via WhatsApp
          </Button>
          <Button
            onClick={copyDigitalReceiptLink}
            variant="outline"
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy Link
          </Button>
        </div>
      </div>

      {/* Receipt Content */}
      <div className="max-w-md mx-auto p-4 print:p-0 receipt-container">
        <Card className="bg-white shadow-2xl print:shadow-none print:border-0 receipt-card">
          <CardContent className="p-8 print:p-6 receipt-content">
            {/* Business Header */}
            <div className="text-center border-b-2 border-slate-200 print-divider pb-6 mb-6">
              <div className="mb-4">
                <div className="flex items-center justify-center mb-3">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg gradient-icon">
                    <Building2 className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h1 className="text-3xl font-bold text-slate-900 mb-1">{mockReceiptData.business.name}</h1>
                <p className="text-sm text-slate-500 uppercase tracking-wide">Official Receipt</p>
              </div>
              <div className="space-y-1.5 text-sm text-slate-600">
                <p className="font-medium">{mockReceiptData.business.address}</p>
                <p>{mockReceiptData.business.city}</p>
                <div className="flex items-center justify-center gap-1">
                  <Phone className="w-3 h-3" />
                  <p>{mockReceiptData.business.phone}</p>
                </div>
                <div className="flex items-center justify-center gap-1">
                  <Mail className="w-3 h-3" />
                  <p>{mockReceiptData.business.email}</p>
                </div>
                <p className="font-medium text-slate-800 mt-2">Tax ID: {mockReceiptData.business.taxId}</p>
              </div>
            </div>

            {/* Location Info */}
            <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-lg p-4 border border-slate-200 mb-6">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <h2 className="font-semibold text-slate-900">Store Location</h2>
                </div>
                <div className="space-y-1 text-sm text-slate-700">
                  <p className="font-bold text-blue-700">{mockReceiptData.location.name}</p>
                  <p>{mockReceiptData.location.address}</p>
                  <p>{mockReceiptData.location.city}</p>
                  <div className="flex items-center justify-center gap-1 text-blue-600">
                    <Phone className="w-3 h-3" />
                    <p>{mockReceiptData.location.phone}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Transaction Info */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200 mb-6">
              <div className="text-center mb-3">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                    <ShoppingCart className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="font-bold text-green-800">Transaction Details</h3>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-white rounded-md p-2 border">
                  <p className="text-slate-500 text-xs uppercase tracking-wide">Receipt #</p>
                  <p className="font-bold text-slate-900">{mockReceiptData.order.id}</p>
                </div>
                <div className="bg-white rounded-md p-2 border">
                  <p className="text-slate-500 text-xs uppercase tracking-wide">Date</p>
                  <p className="font-medium text-slate-900">
                    {new Intl.DateTimeFormat("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric"
                    }).format(mockReceiptData.order.createdAt)}
                  </p>
                </div>
                <div className="bg-white rounded-md p-2 border">
                  <p className="text-slate-500 text-xs uppercase tracking-wide">Time</p>
                  <p className="font-medium text-slate-900">
                    {new Intl.DateTimeFormat("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit"
                    }).format(mockReceiptData.order.createdAt)}
                  </p>
                </div>
                <div className="bg-white rounded-md p-2 border">
                  <p className="text-slate-500 text-xs uppercase tracking-wide">Cashier</p>
                  <p className="font-medium text-slate-900">{mockReceiptData.order.cashier}</p>
                </div>
                <div className="bg-white rounded-md p-2 border">
                  <p className="text-slate-500 text-xs uppercase tracking-wide">Terminal</p>
                  <p className="font-medium text-slate-900">{mockReceiptData.order.terminal}</p>
                </div>
                <div className="bg-white rounded-md p-2 border">
                  <p className="text-slate-500 text-xs uppercase tracking-wide">Payment</p>
                  <div className="flex items-center gap-1">
                    <CreditCard className="w-3 h-3 text-green-600" />
                    <p className="font-medium text-slate-900 capitalize">
                      {mockReceiptData.order.paymentMethod.replace('_', ' ')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200 mb-6">
              <div className="text-center mb-3">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="font-bold text-purple-800">Customer Information</h3>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="bg-white rounded-md p-3 border flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                    {mockReceiptData.order.customerName.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{mockReceiptData.order.customerName}</p>
                    <p className="text-xs text-slate-500 uppercase tracking-wide">Valued Customer</p>
                  </div>
                </div>
                <div className="bg-white rounded-md p-2 border">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-purple-500" />
                    <span className="text-slate-700">{mockReceiptData.order.customerEmail}</span>
                  </div>
                </div>
                <div className="bg-white rounded-md p-2 border">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-purple-500" />
                    <span className="text-slate-700">{mockReceiptData.order.customerPhone}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg p-4 border border-orange-200 mb-6">
              <div className="text-center mb-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center">
                    <Package className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="font-bold text-orange-800">Items Purchased</h3>
                </div>
              </div>
              <div className="space-y-2">
                {mockReceiptData.order.items.map((item, index) => (
                  <div key={index} className="bg-white rounded-md p-3 border shadow-sm">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-start gap-2">
                          <div className="w-6 h-6 rounded bg-gradient-to-br from-orange-400 to-yellow-500 flex items-center justify-center text-white text-xs font-bold">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-slate-900">{item.name}</p>
                            <p className="text-xs text-slate-500 bg-slate-100 rounded px-2 py-1 inline-block mt-1">
                              SKU: {item.sku}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center gap-2 text-sm text-slate-600">
                                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                                  Qty: {item.quantity}
                                </span>
                                <span className="text-slate-500">×</span>
                                <span className="font-medium">{formatCurrency(item.unitPrice)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right ml-3">
                        <p className="text-xl font-bold text-green-600">{formatCurrency(item.totalPrice)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-xl p-6 mb-6 shadow-lg">
              <div className="text-center mb-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="font-bold text-white">Order Summary</h3>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center bg-white/10 rounded-lg p-3">
                  <span className="text-slate-200">Subtotal:</span>
                  <span className="font-bold text-white text-lg">{formatCurrency(mockReceiptData.order.subtotal)}</span>
                </div>
                <div className="flex justify-between items-center bg-white/10 rounded-lg p-3">
                  <span className="text-slate-200">Tax ({mockReceiptData.order.taxRate}%):</span>
                  <span className="font-bold text-white text-lg">{formatCurrency(mockReceiptData.order.tax)}</span>
                </div>
                <div className="border-t-2 border-white/30 pt-3">
                  <div className="flex justify-between items-center bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-4 shadow-lg">
                    <span className="text-white font-bold text-xl uppercase tracking-wide">TOTAL:</span>
                    <span className="text-white font-black text-2xl">{formatCurrency(mockReceiptData.order.total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Summary - Enhanced */}
            <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-6 rounded-2xl border border-emerald-100 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Payment Summary</h3>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-white/80 rounded-xl backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-emerald-600" />
                    <span className="font-medium text-gray-700">Payment Method</span>
                  </div>
                  <span className="font-semibold text-gray-900 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent capitalize">
                    {mockReceiptData.order.paymentMethod.replace('_', ' ')}
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 bg-white/80 rounded-xl backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    <span className="font-medium text-gray-700">Amount Charged</span>
                  </div>
                  <span className="font-bold text-xl text-emerald-600">{formatCurrency(mockReceiptData.order.total)}</span>
                </div>

                <div className="flex justify-between items-center p-3 bg-white/80 rounded-xl backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span className="font-medium text-gray-700">Payment Status</span>
                  </div>
                  <div className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200 px-3 py-1.5 rounded-full text-sm font-semibold flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    PAID
                  </div>
                </div>

                <div className="flex justify-between items-center p-3 bg-white/80 rounded-xl backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4 text-emerald-600" />
                    <span className="font-medium text-gray-700">Transaction ID</span>
                  </div>
                  <code className="font-mono text-sm bg-gradient-to-r from-gray-100 to-slate-100 px-3 py-1.5 rounded-lg border text-gray-800">
                    {mockReceiptData.order.id}-{Date.now().toString().slice(-6)}
                  </code>
                </div>
              </div>
            </div>

            {/* Footer - Enhanced */}
            <div className="space-y-6">
              {/* Thank You Message */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200 text-center">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                    <Star className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="font-bold text-blue-900 text-lg">Thank You!</h3>
                </div>
                <p className="text-blue-800 font-medium mb-2">We appreciate your business and trust in our store.</p>
                <div className="text-sm text-blue-700 space-y-1">
                  <p className="flex items-center justify-center gap-2">
                    <Shield className="w-4 h-4" />
                    <span>For returns or exchanges, please bring this receipt within 30 days</span>
                  </p>
                  <p className="flex items-center justify-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>Questions? Contact us at {mockReceiptData.business.phone}</span>
                  </p>
                </div>
              </div>

              {/* Receipt Information */}
              <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl p-4 border border-slate-200">
                <div className="grid grid-cols-1 gap-3 text-sm">
                  <div className="flex justify-between items-center p-2 bg-white rounded-lg border">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-600" />
                      <span className="text-slate-600">Receipt Generated:</span>
                    </div>
                    <span className="font-medium text-slate-900">{formatDate(new Date())}</span>
                  </div>

                  <div className="flex justify-between items-center p-2 bg-white rounded-lg border">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-slate-600" />
                      <span className="text-slate-600">Visit Us Online:</span>
                    </div>
                    <span className="font-medium text-blue-600">{mockReceiptData.business.website}</span>
                  </div>

                  <div className="flex justify-between items-center p-2 bg-white rounded-lg border">
                    <div className="flex items-center gap-2">
                      <Hash className="w-4 h-4 text-slate-600" />
                      <span className="text-slate-600">Reference ID:</span>
                    </div>
                    <code className="font-mono text-sm bg-slate-100 px-2 py-1 rounded text-slate-800">
                      {mockReceiptData.order.id}-{Date.now().toString().slice(-6)}
                    </code>
                  </div>
                </div>
              </div>

              {/* QR Code and Digital Receipt */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200 text-center">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center">
                    <Package className="w-4 h-4 text-white" />
                  </div>
                  <h4 className="font-bold text-purple-900">Digital Receipt</h4>
                </div>

                <div className="flex justify-center mb-4">
                  {qrCodeUrl ? (
                    <div className="bg-white p-3 rounded-xl border-2 border-purple-300 shadow-lg">
                      <img
                        src={qrCodeUrl}
                        alt="Digital Receipt QR Code"
                        className="w-20 h-20"
                      />
                    </div>
                  ) : (
                    <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 border-2 border-dashed border-purple-300 rounded-xl flex flex-col items-center justify-center shadow-inner">
                      <Package className="w-6 h-6 text-purple-600 mb-1" />
                      <span className="text-xs text-purple-600 font-medium">Generating...</span>
                    </div>
                  )}
                </div>

                <p className="text-sm text-purple-700 max-w-xs mx-auto">
                  Scan for digital receipt and product warranty information
                </p>
              </div>

              {/* Store Branding */}
              <div className="border-t-2 border-slate-200 pt-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-md flex items-center justify-center">
                    <Building2 className="w-3 h-3 text-white" />
                  </div>
                  <span className="font-bold text-slate-900">{mockReceiptData.business.name}</span>
                </div>
                <p className="text-xs text-slate-500 italic">Powered by StockFlow Retail Management System</p>
                <p className="text-xs text-slate-400 mt-1">Your trusted retail partner since 2024</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Print Instructions - Hidden on print */}
      <div className="no-print mt-6 p-4">
        <div className="max-w-md mx-auto">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Print Instructions</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Ensure your printer is connected and has paper</li>
                <li>• Use portrait orientation for best results</li>
                <li>• Check "Print backgrounds" in browser print settings</li>
                <li>• For thermal printers, adjust margins to minimum</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* WhatsApp Modal */}
      {showWhatsAppModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 no-print">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Send Receipt via WhatsApp</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowWhatsAppModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="tel"
                    id="phone"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="e.g., +1234567890 or 1234567890"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Include country code for international numbers
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-800">
                  <strong>Preview:</strong> Customer will receive a WhatsApp message with the digital receipt link and order summary.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowWhatsAppModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleWhatsAppShare}
                  disabled={!phoneNumber.trim()}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Send WhatsApp
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}