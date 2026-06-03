"use client";

import { notify } from "@/lib/notifications/notify"

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { createPurchaseOrderFromLowStock } from "@/actions/purchaseOrders/createPurchaseOrderFromLowStock";
import getLowStockItems from "@/actions/analytics/getLowStockItems";
import {
  ShoppingCart,
  Package,
  AlertTriangle,
  Truck,
  Calendar,
  DollarSign,
  Plus,
  Minus,
  Check,
  Loader2
} from "lucide-react";
import { useRouter } from "next/navigation";interface CreatePurchaseOrderFormProps {
  organizationId: string;
  preSelectedItems?: string[];
  urgencyLevel?: string;
}

interface OrderItem {
  id: string;
  name: string;
  sku: string;
  currentStock: number;
  reorderPoint: number;
  suggestedQuantity: number;
  unitCost: number;
  supplier?: {
    id: string;
    name: string;
  };
  unit?: {
    symbol: string;
    name: string;
  };
}

export default function CreatePurchaseOrderForm({
  organizationId,
  preSelectedItems = [],
  urgencyLevel = 'normal'
}: CreatePurchaseOrderFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [lowStockItems, setLowStockItems] = useState<OrderItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set(preSelectedItems));
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [supplier, setSupplier] = useState<string>("");
  const [expectedDelivery, setExpectedDelivery] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isUrgent, setIsUrgent] = useState(urgencyLevel === 'critical');

  // Load low stock items on component mount
  useEffect(() => {
    const loadLowStockItems = async () => {
      try {
        const result = await getLowStockItems(organizationId);
        if (result.success && result.data) {
          const items: OrderItem[] = result.data.map(item => ({
            id: item.id,
            name: item.name,
            sku: item.sku,
            currentStock: item.currentStock,
            reorderPoint: item.reorderPoint,
            suggestedQuantity: Math.max(item.stockDeficit, 1),
            unitCost: item.costPrice,
            supplier: {
              id: 'default',
              name: 'Default Supplier'
            },
            unit: item.unit ?? undefined
          }));
          setLowStockItems(items);

          // Initialize quantities
          const initialQuantities: Record<string, number> = {};
          items.forEach(item => {
            initialQuantities[item.id] = item.suggestedQuantity;
          });
          setQuantities(initialQuantities);
        }
      } catch (error) {
        console.error('Failed to load low stock items:', error);
        notify.error('Failed to load low stock items');
      }
    };

    loadLowStockItems();
  }, [organizationId]);

  // Calculate totals
  const calculations = useMemo(() => {
    const selectedItemsList = lowStockItems.filter(item => selectedItems.has(item.id));
    const subtotal = selectedItemsList.reduce((sum, item) => {
      const quantity = quantities[item.id] || 0;
      return sum + (quantity * item.unitCost);
    }, 0);
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax;

    return {
      subtotal,
      tax,
      total,
      itemCount: selectedItems.size,
      totalQuantity: selectedItemsList.reduce((sum, item) => sum + (quantities[item.id] || 0), 0)
    };
  }, [lowStockItems, selectedItems, quantities]);

  const handleItemToggle = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const handleQuantityChange = (itemId: string, quantity: number) => {
    setQuantities(prev => ({
      ...prev,
      [itemId]: Math.max(1, quantity)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedItems.size === 0) {
      notify.error('Please select at least one item');
      return;
    }

    setIsLoading(true);

    try {
      const result = await createPurchaseOrderFromLowStock(organizationId, {
        itemIds: Array.from(selectedItems),
        supplierId: supplier || undefined,
        notes,
        urgentDelivery: isUrgent
      });

      if (result.success) {
        notify.success('Purchase order created successfully');
        router.push('/dashboard/purchases/orders');
      } else {
        notify.error(result.error || 'Failed to create purchase order');
      }
    } catch (error) {
      console.error('Failed to create purchase order:', error);
      notify.error('Failed to create purchase order');
    } finally {
      setIsLoading(false);
    }
  };

  // Set default expected delivery date
  useEffect(() => {
    const days = isUrgent ? 3 : 7;
    const date = new Date();
    date.setDate(date.getDate() + days);
    setExpectedDelivery(date.toISOString().split('T')[0]);
  }, [isUrgent]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Order Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="expectedDelivery" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Expected Delivery Date
            </Label>
            <Input
              id="expectedDelivery"
              type="date"
              value={expectedDelivery}
              onChange={(e) => setExpectedDelivery(e.target.value)}
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Priority Level
            </Label>
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="urgent"
                  checked={isUrgent}
                  onCheckedChange={(checked) => setIsUrgent(checked === true)}
                />
                <Label htmlFor="urgent" className="text-sm">
                  Urgent Delivery (3 days)
                </Label>
              </div>
              {isUrgent && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  URGENT
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Order Notes
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any special instructions or notes for this order..."
              className="min-h-[100px]"
            />
          </div>
        </div>
      </div>

      {/* Order Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Package className="w-8 h-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {calculations.itemCount}
                </div>
                <div className="text-sm text-blue-600 dark:text-blue-400">Items Selected</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 border-emerald-200 dark:border-emerald-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Truck className="w-8 h-8 text-emerald-600" />
              <div>
                <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                  {calculations.totalQuantity}
                </div>
                <div className="text-sm text-emerald-600 dark:text-emerald-400">Total Units</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-purple-600" />
              <div>
                <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                  ${calculations.subtotal.toFixed(2)}
                </div>
                <div className="text-sm text-purple-600 dark:text-purple-400">Subtotal</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Check className="w-8 h-8 text-orange-600" />
              <div>
                <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                  ${calculations.total.toFixed(2)}
                </div>
                <div className="text-sm text-orange-600 dark:text-orange-400">Total Amount</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Items Selection Table */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Package className="w-5 h-5 text-violet-600" />
            Low Stock Items Selection
            <Badge variant="secondary">{lowStockItems.length} available</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {lowStockItems.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400">No low stock items found</p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Select</TableHead>
                    <TableHead>Item Details</TableHead>
                    <TableHead>Stock Status</TableHead>
                    <TableHead>Suggested Qty</TableHead>
                    <TableHead>Unit Cost</TableHead>
                    <TableHead>Line Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lowStockItems.map((item) => (
                    <TableRow key={item.id} className={selectedItems.has(item.id) ? "bg-blue-50 dark:bg-blue-950/50" : ""}>
                      <TableCell>
                        <Checkbox
                          checked={selectedItems.has(item.id)}
                          onCheckedChange={() => handleItemToggle(item.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-slate-900 dark:text-white">{item.name}</div>
                          <div className="text-sm text-slate-500">{item.sku}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{item.currentStock}</span>
                            {item.unit && (
                              <span className="text-xs text-slate-500">{item.unit.symbol}</span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500">
                            Reorder: {item.reorderPoint}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleQuantityChange(item.id, (quantities[item.id] || 0) - 1)}
                            disabled={!selectedItems.has(item.id)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <Input
                            type="number"
                            value={quantities[item.id] || 0}
                            onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 0)}
                            className="w-20 text-center"
                            min="1"
                            disabled={!selectedItems.has(item.id)}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleQuantityChange(item.id, (quantities[item.id] || 0) + 1)}
                            disabled={!selectedItems.has(item.id)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">${item.unitCost.toFixed(2)}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-bold text-emerald-600">
                          ${((quantities[item.id] || 0) * item.unitCost).toFixed(2)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
        <Button
          type="submit"
          disabled={selectedItems.size === 0 || isLoading}
          className="flex-1 h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Creating Purchase Order...
            </>
          ) : (
            <>
              <ShoppingCart className="mr-2 h-5 w-5" />
              Create Purchase Order ({calculations.itemCount} items)
            </>
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="sm:w-auto h-12"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
