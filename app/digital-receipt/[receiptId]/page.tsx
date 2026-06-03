"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Calendar,
  CheckCircle,
  CreditCard,
  DollarSign,
  Download,
  Hash,
  Mail,
  MapPin,
  Package,
  Phone,
  Printer,
  Share2,
  ShoppingCart,
  Star,
  User
} from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface ReceiptData {
  receipt: {
    id: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    total: number;
    subtotal: number;
    tax: number;
    taxRate: number;
    paymentMethod: string;
    paymentStatus: string;
    cashier: string;
    createdAt: string;
    items: Array<{
      id: string;
      name: string;
      sku: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
    }>;
  };
  business: {
    name: string;
    address: string;
    city: string;
    phone: string;
    email: string;
    website: string;
    taxId: string;
  };
  location: {
    name: string;
    address: string;
    city: string;
    phone: string;
  };
}

export default function DigitalReceiptPage() {
  const params = useParams();
  const receiptId = params.receiptId as string;
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReceipt = async () => {
      try {
        const response = await fetch(`/api/receipts/${receiptId}`);
        const data = await response.json();

        if (data.success) {
          setReceiptData(data.data);
        } else {
          setError(data.error || "Failed to load receipt");
        }
      } catch (err) {
        setError("Failed to load receipt");
      } finally {
        setLoading(false);
      }
    };

    fetchReceipt();
  }, [receiptId]);

  const formatDate = (date: string) => {
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
    window.print();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Receipt ${receiptId}`,
          text: `Digital receipt for ${receiptData?.business.name}`,
          url: window.location.href
        });
      } catch (err) {
        console.log("Share cancelled");
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert("Receipt link copied to clipboard!");
    }
  };

  const handleDownload = () => {
    // Create a downloadable PDF version
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your digital receipt...</p>
        </div>
      </div>
    );
  }

  if (error || !receiptData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Receipt Not Found</h1>
          <p className="text-gray-600 mb-4">{error || "The requested receipt could not be found."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/50 print:bg-white">
      {/* Header - Hidden on print */}
      <div className="no-print bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Digital Receipt</h1>
              <p className="text-sm text-slate-600">Receipt #{receiptId}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button size="sm" onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700">
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Receipt Content */}
      <div className="max-w-md mx-auto p-4 print:p-0">
        <Card className="bg-white shadow-2xl print:shadow-none print:border-0">
          <CardContent className="p-8 print:p-6">
            {/* Business Header */}
            <div className="text-center border-b-2 border-slate-200 pb-6 mb-6">
              <div className="mb-4">
                <div className="flex items-center justify-center mb-3">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg">
                    <Building2 className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h1 className="text-3xl font-bold text-slate-900 mb-1">{receiptData.business.name}</h1>
                <p className="text-sm text-slate-500 uppercase tracking-wide">Digital Receipt</p>
              </div>
              <div className="space-y-1.5 text-sm text-slate-600">
                <p className="font-medium">{receiptData.business.address}</p>
                <p>{receiptData.business.city}</p>
                <div className="flex items-center justify-center gap-1">
                  <Phone className="w-3 h-3" />
                  <p>{receiptData.business.phone}</p>
                </div>
                <div className="flex items-center justify-center gap-1">
                  <Mail className="w-3 h-3" />
                  <p>{receiptData.business.email}</p>
                </div>
                <p className="font-medium text-slate-800 mt-2">Tax ID: {receiptData.business.taxId}</p>
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
                  <p className="font-bold text-slate-900">{receiptData.receipt.id}</p>
                </div>
                <div className="bg-white rounded-md p-2 border">
                  <p className="text-slate-500 text-xs uppercase tracking-wide">Date</p>
                  <p className="font-medium text-slate-900">
                    {new Intl.DateTimeFormat("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric"
                    }).format(new Date(receiptData.receipt.createdAt))}
                  </p>
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
                  <h3 className="font-bold text-purple-800">Customer</h3>
                </div>
              </div>
              <div className="text-center">
                <p className="font-bold text-slate-900">{receiptData.receipt.customerName}</p>
                <p className="text-sm text-slate-600">{receiptData.receipt.customerEmail}</p>
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
                {receiptData.receipt.items.map((item, index) => (
                  <div key={index} className="bg-white rounded-md p-3 border shadow-sm">
                    <div className="flex justify-between items-start">
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
              <div className="space-y-3">
                <div className="flex justify-between items-center bg-white/10 rounded-lg p-3">
                  <span className="text-slate-200">Subtotal:</span>
                  <span className="font-bold text-white text-lg">{formatCurrency(receiptData.receipt.subtotal)}</span>
                </div>
                <div className="flex justify-between items-center bg-white/10 rounded-lg p-3">
                  <span className="text-slate-200">Tax ({receiptData.receipt.taxRate}%):</span>
                  <span className="font-bold text-white text-lg">{formatCurrency(receiptData.receipt.tax)}</span>
                </div>
                <div className="border-t-2 border-white/30 pt-3">
                  <div className="flex justify-between items-center bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-4 shadow-lg">
                    <span className="text-white font-bold text-xl uppercase tracking-wide">TOTAL:</span>
                    <span className="text-white font-black text-2xl">{formatCurrency(receiptData.receipt.total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center space-y-4">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                <h3 className="font-bold text-blue-900 mb-2">Thank You!</h3>
                <p className="text-sm text-blue-700">This is your digital receipt. Save this page or bookmark it for your records.</p>
              </div>

              <div className="text-xs text-slate-500">
                <p>Digital receipt generated on {formatDate(new Date().toISOString())}</p>
                <p>Visit us online: {receiptData.business.website}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}