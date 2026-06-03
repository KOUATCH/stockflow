"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
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
import { useEffect, useState } from "react";
import QRCode from "qrcode";

interface SalesReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  saleData: {
    saleId: string;
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    items: Array<{
      name: string;
      sku: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
    }>;
    subtotal: number;
    tax: number;
    total: number;
    paymentMethod: string;
    cashier?: string;
    terminal?: string;
    createdAt: Date;
  };
  businessInfo: {
    name: string;
    address: string;
    city: string;
    phone: string;
    email: string;
    website: string;
    taxId: string;
  };
  locationInfo: {
    name: string;
    address: string;
    city: string;
    phone: string;
  };
}

export default function SalesReceiptModal({
  isOpen,
  onClose,
  saleData,
  businessInfo,
  locationInfo
}: SalesReceiptModalProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isPrinting, setIsPrinting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      generateQRCode();
      // Pre-fill customer phone if available
      if (saleData.customerPhone) {
        setPhoneNumber(saleData.customerPhone);
      }
    }
  }, [isOpen, saleData.saleId]);

  const generateQRCode = async () => {
    try {
      const digitalReceiptUrl = `${window.location.origin}/digital-receipt/${saleData.saleId}`;
      const qrUrl = await QRCode.toDataURL(digitalReceiptUrl, {
        width: 150,
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
      minute: "2-digit"
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
    window.print();
    setTimeout(() => setIsPrinting(false), 1000);
  };

  const handleWhatsAppShare = () => {
    if (phoneNumber) {
      const digitalReceiptUrl = `${window.location.origin}/digital-receipt/${saleData.saleId}`;
      const message = `Hi ${saleData.customerName || 'there'}! Thank you for your purchase at ${businessInfo.name}. Here's your digital receipt for order ${saleData.saleId}. Total: ${formatCurrency(saleData.total)}. View your receipt: ${digitalReceiptUrl}`;

      const cleanPhone = phoneNumber.replace(/\D/g, '');
      const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

      window.open(whatsappUrl, '_blank');
      setShowWhatsAppModal(false);
    }
  };

  const copyDigitalReceiptLink = () => {
    const digitalReceiptUrl = `${window.location.origin}/digital-receipt/${saleData.saleId}`;
    navigator.clipboard.writeText(digitalReceiptUrl);
    alert("Digital receipt link copied to clipboard!");
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Sale Complete!</h2>
                <p className="text-sm text-gray-600">Receipt #{saleData.saleId}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowWhatsAppModal(true)}
                className="border-green-600 text-green-600 hover:bg-green-50"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                WhatsApp
              </Button>
              <Button variant="outline" size="sm" onClick={copyDigitalReceiptLink}>
                <Copy className="w-4 h-4 mr-2" />
                Copy Link
              </Button>
            </div>
          </div>

          {/* Receipt Content */}
          <div className="p-6">
            <Card className="receipt-card">
              <CardContent className="p-6">
                {/* Business Header */}
                <div className="text-center border-b-2 border-slate-200 pb-4 mb-4">
                  <div className="flex items-center justify-center mb-2">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg">
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <h1 className="text-2xl font-bold text-slate-900">{businessInfo.name}</h1>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Sales Receipt</p>
                  <div className="space-y-1 text-sm text-slate-600 mt-2">
                    <p>{businessInfo.address}</p>
                    <p>{businessInfo.city}</p>
                    <p>{businessInfo.phone}</p>
                  </div>
                </div>

                {/* Transaction Info */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 mb-4">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-slate-500 text-xs">Receipt #</p>
                      <p className="font-bold">{saleData.saleId}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs">Date</p>
                      <p className="font-medium">
                        {new Intl.DateTimeFormat("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        }).format(saleData.createdAt)}
                      </p>
                    </div>
                    {saleData.cashier && (
                      <div>
                        <p className="text-slate-500 text-xs">Cashier</p>
                        <p className="font-medium">{saleData.cashier}</p>
                      </div>
                    )}
                    {saleData.terminal && (
                      <div>
                        <p className="text-slate-500 text-xs">Terminal</p>
                        <p className="font-medium">{saleData.terminal}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Customer Info */}
                {saleData.customerName && (
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4 text-purple-600" />
                      <h3 className="font-semibold text-purple-800">Customer</h3>
                    </div>
                    <div className="text-sm">
                      <p className="font-bold">{saleData.customerName}</p>
                      {saleData.customerEmail && <p className="text-slate-600">{saleData.customerEmail}</p>}
                      {saleData.customerPhone && <p className="text-slate-600">{saleData.customerPhone}</p>}
                    </div>
                  </div>
                )}

                {/* Items */}
                <div className="mb-4">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Items ({saleData.items.length})
                  </h3>
                  <div className="space-y-2">
                    {saleData.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-start p-2 bg-slate-50 rounded">
                        <div className="flex-1">
                          <p className="font-medium">{item.name}</p>
                          <p className="text-xs text-slate-500">SKU: {item.sku}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                              Qty: {item.quantity}
                            </span>
                            <span className="text-xs text-slate-500">×</span>
                            <span className="text-sm">{formatCurrency(item.unitPrice)}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">{formatCurrency(item.totalPrice)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totals */}
                <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-lg p-4 mb-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span className="font-bold">{formatCurrency(saleData.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax:</span>
                      <span className="font-bold">{formatCurrency(saleData.tax)}</span>
                    </div>
                    <div className="border-t border-white/30 pt-2">
                      <div className="flex justify-between items-center bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg p-3">
                        <span className="font-bold text-lg uppercase">TOTAL:</span>
                        <span className="font-black text-xl">{formatCurrency(saleData.total)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-3 mb-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-emerald-600" />
                      <span className="font-medium">Payment Method</span>
                    </div>
                    <span className="font-bold capitalize">{saleData.paymentMethod.replace('_', ' ')}</span>
                  </div>
                </div>

                {/* QR Code Section */}
                <div className="text-center bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                      <Package className="w-3 h-3 text-white" />
                    </div>
                    <h4 className="font-bold text-blue-900">Digital Receipt</h4>
                  </div>

                  {qrCodeUrl ? (
                    <div className="flex justify-center mb-3">
                      <div className="bg-white p-2 rounded-lg border-2 border-blue-300">
                        <img src={qrCodeUrl} alt="Digital Receipt QR Code" className="w-16 h-16" />
                      </div>
                    </div>
                  ) : (
                    <div className="w-20 h-20 mx-auto mb-3 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Package className="w-6 h-6 text-blue-600" />
                    </div>
                  )}

                  <p className="text-sm text-blue-700">
                    Scan with your phone camera for digital copy
                  </p>
                </div>

                {/* Thank You Message */}
                <div className="text-center mt-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                  <h3 className="font-bold text-green-800 mb-1">Thank You!</h3>
                  <p className="text-sm text-green-700">We appreciate your business</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      {/* WhatsApp Modal */}
      {showWhatsAppModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
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
                    placeholder="e.g., +1234567890"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-800">
                  <strong>Preview:</strong> "Hi {saleData.customerName || 'there'}! Thank you for your purchase at {businessInfo.name}..."
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
    </>
  );
}