"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Building2,
  Calendar,
  Download,
  Edit,
  Eye,
  Filter,
  Package,
  Search,
  ShoppingCart,
  Star,
  Tag,
  Plus,
  Minus,
  MoreHorizontal,
  Trash2,
  Copy,
  PackageCheck,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Settings2,
  RefreshCw,
  FileText,
  Info
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

// Enhanced mock order items data
const mockOrderItems = [
  {
    id: "item_1",
    name: "Wireless Bluetooth Headphones",
    sku: "WBH-001",
    category: "Electronics",
    brand: "TechAudio",
    model: "TA-BT500",
    quantity: 25,
    receivedQuantity: 0,
    unitPrice: 45.50,
    lineTotal: 1137.50,
    description: "Premium wireless headphones with noise cancellation",
    specifications: "Bluetooth 5.0, 30hr battery, Active Noise Cancellation",
    weight: "0.3 kg",
    dimensions: "20x18x8 cm",
    status: "confirmed",
    priority: "high",
    expectedDelivery: new Date("2024-11-25"),
    notes: "Bulk order - corporate discount applied",
    supplierPartNumber: "TA-BT500-BLK",
    warranty: "2 years",
    leadTime: "5-7 days"
  },
  {
    id: "item_2",
    name: "USB-C Charging Cable",
    sku: "USB-C-001",
    category: "Accessories",
    brand: "FastCharge",
    model: "FC-USBC-2M",
    quantity: 100,
    receivedQuantity: 0,
    unitPrice: 12.99,
    lineTotal: 1299.00,
    description: "High-speed USB-C to USB-A charging cable",
    specifications: "USB 3.1, 2m length, 100W power delivery",
    weight: "0.1 kg",
    dimensions: "200cm length",
    status: "confirmed",
    priority: "medium",
    expectedDelivery: new Date("2024-11-25"),
    notes: "Extra length cables as requested",
    supplierPartNumber: "FC-USBC-2M-WHT",
    warranty: "1 year",
    leadTime: "3-5 days"
  },
  {
    id: "item_3",
    name: "Laptop Stand Adjustable",
    sku: "LSA-001",
    category: "Accessories",
    brand: "ErgoTech",
    model: "ET-STAND-ADJ",
    quantity: 15,
    receivedQuantity: 0,
    unitPrice: 89.00,
    lineTotal: 1335.00,
    description: "Ergonomic adjustable aluminum laptop stand",
    specifications: "Aluminum construction, Height adjustable 15-25cm",
    weight: "1.2 kg",
    dimensions: "30x25x5 cm",
    status: "confirmed",
    priority: "low",
    expectedDelivery: new Date("2024-11-25"),
    notes: "Silver finish preferred",
    supplierPartNumber: "ET-STAND-ADJ-SLV",
    warranty: "3 years",
    leadTime: "7-10 days"
  },
  {
    id: "item_4",
    name: "Wireless Mouse",
    sku: "WM-001",
    category: "Electronics",
    brand: "ClickTech",
    model: "CT-WM200",
    quantity: 50,
    receivedQuantity: 25,
    unitPrice: 25.75,
    lineTotal: 1287.50,
    description: "Ergonomic wireless optical mouse",
    specifications: "2.4GHz wireless, 1600 DPI, 18-month battery",
    weight: "0.2 kg",
    dimensions: "12x7x4 cm",
    status: "partially_received",
    priority: "medium",
    expectedDelivery: new Date("2024-11-23"),
    notes: "First batch received, pending remainder",
    supplierPartNumber: "CT-WM200-BLK",
    warranty: "1 year",
    leadTime: "2-3 days"
  },
  {
    id: "item_5",
    name: "USB Hub 7-Port",
    sku: "UH7-001",
    category: "Electronics",
    brand: "HubConnect",
    model: "HC-7PORT",
    quantity: 30,
    receivedQuantity: 30,
    unitPrice: 35.99,
    lineTotal: 1079.70,
    description: "High-speed 7-port USB 3.0 hub",
    specifications: "USB 3.0, 7 ports, LED indicators, external power",
    weight: "0.4 kg",
    dimensions: "15x8x3 cm",
    status: "received",
    priority: "low",
    expectedDelivery: new Date("2024-11-20"),
    notes: "Received in full - quality checked",
    supplierPartNumber: "HC-7PORT-BLK",
    warranty: "2 years",
    leadTime: "1-2 days"
  }
];

export default function EnhancedOrderItemsPage() {
  const params = useParams();
  const orderId = params.id;

  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [editingItem, setEditingItem] = useState<string | null>(null);

  // Filter items based on current filters
  const filteredItems = useMemo(() => {
    return mockOrderItems.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.brand.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      const matchesPriority = priorityFilter === "all" || item.priority === priorityFilter;

      return matchesSearch && matchesCategory && matchesStatus && matchesPriority;
    });
  }, [searchTerm, categoryFilter, statusFilter, priorityFilter]);

  // Get unique categories for filter
  const categories = Array.from(new Set(mockOrderItems.map(item => item.category)));

  // Calculate totals
  const totalItems = filteredItems.length;
  const totalQuantity = filteredItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalReceived = filteredItems.reduce((sum, item) => sum + item.receivedQuantity, 0);
  const totalValue = filteredItems.reduce((sum, item) => sum + item.lineTotal, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(date));
  };

  const getStatusBadge = (status: string, receivedQty: number, totalQty: number) => {
    if (status === "received" || receivedQty === totalQty) {
      return (
        <Badge className="bg-green-100 text-green-700 border-green-200 dark:bg-green-900 dark:text-green-300">
          <PackageCheck className="w-3 h-3 mr-1" />
          Received
        </Badge>
      );
    }

    if (status === "partially_received" || receivedQty > 0) {
      return (
        <Badge className="bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900 dark:text-orange-300">
          <Clock className="w-3 h-3 mr-1" />
          Partial ({receivedQty}/{totalQty})
        </Badge>
      );
    }

    return (
      <Badge className="bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900 dark:text-blue-300">
        <Package className="w-3 h-3 mr-1" />
        Confirmed
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      low: { color: "bg-slate-100 text-slate-700 border-slate-200", icon: Info },
      medium: { color: "bg-blue-100 text-blue-700 border-blue-200", icon: Info },
      high: { color: "bg-orange-100 text-orange-700 border-orange-200", icon: AlertTriangle },
      urgent: { color: "bg-red-100 text-red-700 border-red-200", icon: AlertTriangle }
    };

    const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.medium;
    const IconComponent = config.icon;

    return (
      <Badge variant="outline" className={`text-xs ${config.color}`}>
        <IconComponent className="w-3 h-3 mr-1" />
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    );
  };

  const handleSelectItem = (itemId: string, checked: boolean) => {
    if (checked) {
      setSelectedItems([...selectedItems, itemId]);
    } else {
      setSelectedItems(selectedItems.filter(id => id !== itemId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(filteredItems.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const isAllSelected = filteredItems.length > 0 && selectedItems.length === filteredItems.length;
  const isSomeSelected = selectedItems.length > 0 && selectedItems.length < filteredItems.length;

  return (
    <div className="flex h-screen bg-background">
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background">
          <div className="container mx-auto px-6 py-8 max-w-full">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-6">
                <Link href={`/dashboard/purchases/orders/${orderId}`}>
                  <Button variant="outline" size="sm" className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Order
                  </Button>
                </Link>
                <div className="h-6 w-px bg-slate-200 dark:bg-slate-700"></div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                    <Package className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Order Items</h1>
                    <p className="text-slate-600 dark:text-slate-400">PO-2024-001 • {totalItems} items</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="flex items-center gap-1 px-3 py-1">
                    <Package className="w-4 h-4 text-blue-600" />
                    {totalQuantity} Total Quantity
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1 px-3 py-1">
                    <PackageCheck className="w-4 h-4 text-green-600" />
                    {totalReceived} Received
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1 px-3 py-1">
                    <DollarSign className="w-4 h-4 text-purple-600" />
                    {formatCurrency(totalValue)} Value
                  </Badge>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                  <Button className="gap-2 bg-green-600 hover:bg-green-700">
                    <Plus className="h-4 w-4" />
                    Add Item
                  </Button>
                </div>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="border-slate-200 dark:border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                      <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-slate-900 dark:text-white">{totalItems}</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Total Items</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 dark:border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                      <PackageCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-slate-900 dark:text-white">
                        {Math.round((totalReceived / totalQuantity) * 100) || 0}%
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Received</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 dark:border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                      <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-slate-900 dark:text-white">
                        {totalQuantity - totalReceived}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Pending</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 dark:border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                      <DollarSign className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-slate-900 dark:text-white">
                        {formatCurrency(totalValue)}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Total Value</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card className="border-slate-200 dark:border-slate-700 mb-6">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                  <div className="flex flex-col sm:flex-row gap-3 flex-1">
                    <div className="relative flex-1 max-w-sm">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                      <Input
                        placeholder="Search items..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>

                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="partially_received">Partial</SelectItem>
                        <SelectItem value="received">Received</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Priority</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedItems.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="gap-1">
                        <CheckCircle className="h-3 w-3" />
                        {selectedItems.length} selected
                      </Badge>
                      <Button variant="outline" size="sm" className="gap-1">
                        <PackageCheck className="h-4 w-4" />
                        Mark Received
                      </Button>
                      <Button variant="outline" size="sm" className="gap-1 text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                        Remove
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Items Table */}
            <Card className="border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-green-600" />
                  Order Items ({filteredItems.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-200 dark:border-slate-700">
                        <TableHead className="w-12 bg-slate-50 dark:bg-slate-900/50">
                          <Checkbox
                            checked={isAllSelected}
                            onCheckedChange={handleSelectAll}
                            className="border-slate-300 dark:border-slate-600"
                          />
                        </TableHead>
                        <TableHead className="bg-slate-50 dark:bg-slate-900/50 font-semibold text-slate-900 dark:text-slate-100">
                          Item Details
                        </TableHead>
                        <TableHead className="bg-slate-50 dark:bg-slate-900/50 font-semibold text-slate-900 dark:text-slate-100 text-center">
                          Quantity
                        </TableHead>
                        <TableHead className="bg-slate-50 dark:bg-slate-900/50 font-semibold text-slate-900 dark:text-slate-100 text-right">
                          Pricing
                        </TableHead>
                        <TableHead className="bg-slate-50 dark:bg-slate-900/50 font-semibold text-slate-900 dark:text-slate-100 text-center">
                          Status
                        </TableHead>
                        <TableHead className="bg-slate-50 dark:bg-slate-900/50 font-semibold text-slate-900 dark:text-slate-100 text-center">
                          Expected
                        </TableHead>
                        <TableHead className="bg-slate-50 dark:bg-slate-900/50 font-semibold text-slate-900 dark:text-slate-100 w-12">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredItems.map((item) => (
                        <TableRow
                          key={item.id}
                          className="hover:bg-slate-50 dark:hover:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                        >
                          <TableCell>
                            <Checkbox
                              checked={selectedItems.includes(item.id)}
                              onCheckedChange={(checked) => handleSelectItem(item.id, !!checked)}
                              className="border-slate-300 dark:border-slate-600"
                            />
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="space-y-2 min-w-[300px]">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                                  <Package className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                  <h3 className="font-semibold text-slate-900 dark:text-white">{item.name}</h3>
                                  <div className="flex items-center gap-2">
                                    <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-xs font-mono">
                                      {item.sku}
                                    </code>
                                    {getPriorityBadge(item.priority)}
                                  </div>
                                </div>
                              </div>
                              <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                                <div className="flex items-center gap-1">
                                  <Building2 className="h-3 w-3" />
                                  {item.brand} • {item.model}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Tag className="h-3 w-3" />
                                  {item.category}
                                </div>
                                <div className="text-xs leading-relaxed">{item.description}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="space-y-2">
                              <div className="text-lg font-semibold text-slate-900 dark:text-white">
                                {item.quantity}
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-400">
                                Received: {item.receivedQuantity}
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-400">
                                Pending: {item.quantity - item.receivedQuantity}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="space-y-1">
                              <div className="text-sm text-slate-600 dark:text-slate-400">
                                {formatCurrency(item.unitPrice)} each
                              </div>
                              <div className="text-lg font-semibold text-slate-900 dark:text-white">
                                {formatCurrency(item.lineTotal)}
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-400">
                                Line Total
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            {getStatusBadge(item.status, item.receivedQuantity, item.quantity)}
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="space-y-1">
                              <div className="text-sm font-medium text-slate-900 dark:text-white">
                                {formatDate(item.expectedDelivery)}
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-400">
                                {item.leadTime}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuLabel>Item Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit Item
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <PackageCheck className="mr-2 h-4 w-4" />
                                  Mark Received
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Copy className="mr-2 h-4 w-4" />
                                  Duplicate
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600 dark:text-red-400">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Remove Item
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {filteredItems.length === 0 && (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                      No items found
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                      No items match your current filters
                    </p>
                    <Button variant="outline" onClick={() => {
                      setSearchTerm("");
                      setCategoryFilter("all");
                      setStatusFilter("all");
                      setPriorityFilter("all");
                    }}>
                      Clear filters
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}