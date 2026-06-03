"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  Package,
  Save,
  Star,
  User,
  X,
  AlertCircle,
  ShoppingCart,
  Loader2,
  MapPin,
  Truck,
  Check,
  FileText
} from "lucide-react";
import Link from "next/link";
import { useState, useMemo, useCallback, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useNotifications } from "@/components/notifications/NotificationProvider";
import { usePurchaseOrder, useReceiveItems } from "@/hooks/usePurchaseOrders";
import { useLocations } from "@/hooks/useLocations";
import { useClientAuth } from "@/hooks/useClientAuth";

// Types for receiving workflow
interface ReceiveItem {
  received: number;
  notes?: string;
  batchNumber?: string;
  expiryDate?: string;
  serialNumbers?: string[];
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
};

export default function ReceiveItemsPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  const notifications = useNotifications();

  // Hooks for data fetching
  const { user } = useClientAuth();
  const { data: orderData, isLoading: loadingOrder, error: orderError } = usePurchaseOrder(orderId);
  const { data: locations = [], isLoading: loadingLocations } = useLocations(user?.organizationId);
  const receiveItemsMutation = useReceiveItems();

  // State management
  const [selectedLocationId, setSelectedLocationId] = useState<string>("");
  const [receiveItems, setReceiveItems] = useState<{ [lineId: string]: ReceiveItem }>({});
  const [receivingNotes, setReceivingNotes] = useState("");

  const loading = loadingOrder || loadingLocations;

  // Initialize receive items state when order data loads
  useEffect(() => {
    if (orderData?.lines) {
      const initialReceiveItems: { [lineId: string]: ReceiveItem } = {};
      orderData.lines.forEach(line => {
        const remainingQuantity = line.quantity - line.receivedQuantity;
        initialReceiveItems[line.id] = {
          received: remainingQuantity > 0 ? remainingQuantity : 0,
          notes: ''
        };
      });
      setReceiveItems(initialReceiveItems);
    }
  }, [orderData?.lines]);

  // Set default location when locations load
  useEffect(() => {
    if (locations.length > 0 && !selectedLocationId) {
      setSelectedLocationId(locations[0].id);
    }
  }, [locations, selectedLocationId]);

  // Handle order error
  useEffect(() => {
    if (orderError) {
      notifications.error("Order Not Found", "The purchase order you're looking for could not be found.");
      router.push("/dashboard/purchases/orders");
    }
  }, [orderError, notifications, router]);

  // Calculate receiving totals
  const receivingTotals = useMemo(() => {
    if (!orderData) return { totalUnits: 0, totalValue: 0, linesWithItems: 0 };

    const totalUnits = Object.values(receiveItems).reduce((sum, item) => sum + item.received, 0);
    const totalValue = Object.entries(receiveItems).reduce((sum, [lineId, data]) => {
      const line = orderData.lines.find(l => l.id === lineId);
      return sum + (line?.unitPrice || 0) * data.received;
    }, 0);
    const linesWithItems = Object.values(receiveItems).filter(item => item.received > 0).length;

    return {
      totalUnits,
      totalValue,
      linesWithItems
    };
  }, [receiveItems, orderData?.lines]);

  const handleReceiveQuantityChange = useCallback((lineId: string, quantity: number) => {
    setReceiveItems(prev => ({
      ...prev,
      [lineId]: {
        ...prev[lineId],
        received: Math.max(0, quantity)
      }
    }));
  }, []);

  const handleBatchNumberChange = useCallback((lineId: string, batchNumber: string) => {
    setReceiveItems(prev => ({
      ...prev,
      [lineId]: {
        ...prev[lineId],
        batchNumber: batchNumber || undefined
      }
    }));
  }, []);

  const handleExpiryDateChange = useCallback((lineId: string, expiryDate: string) => {
    setReceiveItems(prev => ({
      ...prev,
      [lineId]: {
        ...prev[lineId],
        expiryDate: expiryDate || undefined
      }
    }));
  }, []);

  const handleSerialNumbersChange = useCallback((lineId: string, serialNumbers: string) => {
    // Convert comma-separated string to array, filter empty values
    const serialArray = serialNumbers.split(',').map(s => s.trim()).filter(s => s.length > 0);
    setReceiveItems(prev => ({
      ...prev,
      [lineId]: {
        ...prev[lineId],
        serialNumbers: serialArray.length > 0 ? serialArray : undefined
      }
    }));
  }, []);

  const handleNotesChange = useCallback((lineId: string, notes: string) => {
    setReceiveItems(prev => ({
      ...prev,
      [lineId]: {
        ...prev[lineId],
        notes: notes || undefined
      }
    }));
  }, []);

  const handleReceiveItems = useCallback(async () => {
    if (!orderData || !selectedLocationId) {
      notifications.warning("Invalid Selection", "Please select a location and ensure items are ready to receive.");
      return;
    }

    const itemsToReceive = Object.entries(receiveItems)
      .filter(([_, data]) => data.received > 0)
      .map(([lineId, data]) => {
        const line = orderData.lines.find(l => l.id === lineId);
        const item = line?.item;

        const lineItem = {
          lineId,
          quantity: data.received,
          batchNumber: data.batchNumber,
          expiryDate: data.expiryDate,
          serialNumbers: data.serialNumbers,
          notes: data.notes
        };

        // Client-side logging (can be removed in production)
        console.log('Sending line item:', { lineId, quantity: data.received, hasNotes: !!data.notes });

        return lineItem;
      });

    if (itemsToReceive.length === 0) {
      notifications.warning("No Items to Receive", "Please specify quantities to receive for at least one item.");
      return;
    }

    try {
      if (!user?.id || !user?.organizationId) {
        notifications.error("Authentication Error", "User information not available. Please refresh and try again.");
        return;
      }

      await receiveItemsMutation.mutateAsync({
        purchaseOrderId: orderId,
        locationId: selectedLocationId,
        lines: itemsToReceive,
        organizationId: user.organizationId,
        receivedBy: user.id,
        notes: receivingNotes
      });

      notifications.purchaseOrderReceived(orderData.orderNumber, receivingTotals.totalUnits);
      router.push(`/dashboard/purchases/orders/${orderId}`);
    } catch (error) {
      console.error('Error receiving items:', error);
      notifications.error("Receiving Failed", "An unexpected error occurred while receiving items.");
    }
  }, [orderData, selectedLocationId, receiveItems, receiveItemsMutation, orderId, notifications, receivingTotals.totalUnits, router]);

  const getLineStatus = (line: typeof orderData.lines[0]) => {
    const remaining = line.quantity - line.receivedQuantity;
    if (remaining <= 0) return "received";
    if (line.receivedQuantity > 0) return "partially_received";
    return "pending";
  };

  const getStatusBadge = (status: string, receivedQty: number, totalQty: number) => {
    switch (status) {
      case "received":
        return <Badge className="bg-green-100 text-green-700">Fully Received</Badge>;
      case "partially_received":
        return <Badge className="bg-yellow-100 text-yellow-700">Partial ({receivedQty}/{totalQty})</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                Loading Order Details
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Please wait while we fetch the order information...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (!orderData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                Order Not Found
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                The purchase order you're looking for could not be found.
              </p>
              <Link href="/dashboard/purchases/orders">
                <Button className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Orders
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Link href={`/dashboard/purchases/orders/${params.id}`}>
                <Button variant="outline" size="sm" className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Order Details
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                  <Truck className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                    Receive Items
                  </h1>
                  <p className="text-slate-600 dark:text-slate-400">
                    {orderData.orderNumber} - {orderData.supplier.name}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => router.back()} className="gap-2">
                <X className="w-4 h-4" />
                Cancel
              </Button>
              <Button
                onClick={handleReceiveItems}
                className="gap-2 bg-green-600 hover:bg-green-700"
                disabled={receivingTotals.linesWithItems === 0 || receiveItemsMutation.isPending}
              >
                {receiveItemsMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                {receiveItemsMutation.isPending ? "Receiving..." : "Receive Items"}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Left and Center Columns */}
          <div className="lg:col-span-2 space-y-8">
            {/* Receiving Configuration */}
            <Card className="border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  Receiving Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Receiving Location</Label>
                    <Select value={selectedLocationId} onValueChange={setSelectedLocationId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.map((location) => (
                          <SelectItem key={location.id} value={location.id}>
                            {location.name} {location.code && `(${location.code})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="receivingDate">Receiving Date</Label>
                    <Input
                      id="receivingDate"
                      type="date"
                      value={new Date().toISOString().split('T')[0]}
                      readOnly
                      className="bg-slate-50 dark:bg-slate-800"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Receiving Notes</Label>
                  <Textarea
                    id="notes"
                    value={receivingNotes}
                    onChange={(e) => setReceivingNotes(e.target.value)}
                    placeholder="Add any notes about this receiving transaction..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Items to Receive */}
            <Card className="border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-green-600" />
                  Items to Receive ({orderData.lines.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {orderData.lines && orderData.lines.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-slate-200 dark:border-slate-700">
                          <TableHead className="bg-slate-50 dark:bg-slate-900/50">Item</TableHead>
                          <TableHead className="bg-slate-50 dark:bg-slate-900/50">SKU</TableHead>
                          <TableHead className="bg-slate-50 dark:bg-slate-900/50">Ordered</TableHead>
                          <TableHead className="bg-slate-50 dark:bg-slate-900/50">Received</TableHead>
                          <TableHead className="bg-slate-50 dark:bg-slate-900/50">Remaining</TableHead>
                          <TableHead className="bg-slate-50 dark:bg-slate-900/50">Receive Now</TableHead>
                          <TableHead className="bg-slate-50 dark:bg-slate-900/50">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orderData.lines.map((line) => {
                          const lineStatus = getLineStatus(line);
                          const remainingQty = line.quantity - line.receivedQuantity;
                          const currentReceiving = receiveItems[line.id]?.received || 0;

                          return (
                            <TableRow key={line.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                              <TableCell>
                                <div>
                                  <p className="font-medium text-slate-900 dark:text-white">{line.name}</p>
                                  {line.brand && (
                                    <p className="text-sm text-slate-600 dark:text-slate-400">{line.brand}</p>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                                  {line.sku}
                                </code>
                              </TableCell>
                              <TableCell>
                                <span className="font-semibold">{line.quantity}</span>
                              </TableCell>
                              <TableCell>
                                <span className="text-green-600 font-semibold">{line.receivedQuantity}</span>
                              </TableCell>
                              <TableCell>
                                <span className={`font-semibold ${remainingQty > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                                  {remainingQty}
                                </span>
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  value={currentReceiving}
                                  onChange={(e) => handleReceiveQuantityChange(line.id, parseInt(e.target.value) || 0)}
                                  className="w-20"
                                  min="0"
                                  max={remainingQty}
                                  disabled={remainingQty <= 0}
                                />
                              </TableCell>
                              <TableCell>
                                {getStatusBadge(lineStatus, line.receivedQuantity, line.quantity)}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <ShoppingCart className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                      No items in this order
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      There are no items to receive for this purchase order
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Right Column */}
          <div className="space-y-6">
            {/* Receiving Summary */}
            <Card className="border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-green-600" />
                  Receiving Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Units to Receive</span>
                    <span className="text-slate-900 dark:text-white font-semibold">
                      {receivingTotals.totalUnits}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Lines with Items</span>
                    <span className="text-slate-900 dark:text-white font-semibold">
                      {receivingTotals.linesWithItems}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Estimated Value</span>
                    <span className="text-slate-900 dark:text-white font-semibold">
                      {formatCurrency(receivingTotals.totalValue)}
                    </span>
                  </div>

                  <Separator />

                  {receivingTotals.linesWithItems === 0 && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5" />
                        <div className="text-sm">
                          <p className="text-orange-800 font-medium">No items to receive</p>
                          <p className="text-orange-700">Please specify quantities to receive.</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Order Information */}
            <Card className="border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  Order Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Order Number</p>
                  <p className="font-semibold text-slate-900 dark:text-white">{orderData.orderNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Supplier</p>
                  <p className="font-semibold text-slate-900 dark:text-white">{orderData.supplier.name}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Status</p>
                  <Badge variant="default">{orderData.status}</Badge>
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Expected Delivery</p>
                  <p className="text-slate-900 dark:text-white">
                    {orderData.expectedDelivery
                      ? new Date(orderData.expectedDelivery).toLocaleDateString()
                      : "Not specified"
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
