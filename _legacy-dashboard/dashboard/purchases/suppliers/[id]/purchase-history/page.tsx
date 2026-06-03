"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getAuthenticatedUser } from "@/config/useAuth";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
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
  DollarSign,
  Download,
  Eye,
  FileText,
  Filter,
  Package,
  Search,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
  Plus,
  RefreshCw
} from "lucide-react";
import Link from "next/link";
import { enhancedPurchaseHistoryColumns, EnhancedPurchaseOrder } from "./enhanced-columns";
import { useState, useMemo } from "react";
import { useParams } from "next/navigation";

interface PurchaseHistoryPageProps {
  params: {
    id: string;
  };
}

// Enhanced mock purchase history data
const mockPurchaseHistory: EnhancedPurchaseOrder[] = [
  {
    id: "po_001",
    orderNumber: "PO-2024-001",
    orderDate: new Date("2024-11-15"),
    status: "completed",
    total: 15420.50,
    items: 8,
    deliveryDate: new Date("2024-11-18"),
    paymentStatus: "paid",
    supplierId: "supplier_123",
    supplierName: "TechCorp Solutions Ltd.",
    priority: "high",
    discount: 500.00,
    tax: 1234.50,
    shippingCost: 125.00,
    notes: "Urgent delivery required for project deadline",
    createdBy: "John Smith",
    updatedAt: new Date("2024-11-18"),
    expectedDelivery: new Date("2024-11-18"),
    actualDelivery: new Date("2024-11-18"),
    invoiceNumber: "INV-2024-001",
    paymentDueDate: new Date("2024-12-15"),
    deliveryAddress: "123 Main St, San Francisco, CA",
    orderType: "standard"
  },
  {
    id: "po_002",
    orderNumber: "PO-2024-002",
    orderDate: new Date("2024-10-28"),
    status: "completed",
    total: 8750.00,
    items: 5,
    deliveryDate: new Date("2024-11-02"),
    paymentStatus: "paid",
    supplierId: "supplier_123",
    supplierName: "TechCorp Solutions Ltd.",
    priority: "medium",
    discount: 150.00,
    tax: 700.00,
    shippingCost: 75.00,
    notes: "Regular order for inventory replenishment",
    createdBy: "Sarah Johnson",
    updatedAt: new Date("2024-11-02"),
    expectedDelivery: new Date("2024-11-01"),
    actualDelivery: new Date("2024-11-02"),
    invoiceNumber: "INV-2024-002",
    paymentDueDate: new Date("2024-11-28"),
    deliveryAddress: "123 Main St, San Francisco, CA",
    orderType: "standard"
  },
  {
    id: "po_003",
    orderNumber: "PO-2024-003",
    orderDate: new Date("2024-10-12"),
    status: "completed",
    total: 22100.75,
    items: 12,
    deliveryDate: new Date("2024-10-16"),
    paymentStatus: "paid",
    supplierId: "supplier_123",
    supplierName: "TechCorp Solutions Ltd.",
    priority: "medium",
    discount: 800.00,
    tax: 1768.75,
    shippingCost: 200.00,
    notes: "Bulk order with volume discount applied",
    createdBy: "Mike Rodriguez",
    updatedAt: new Date("2024-10-16"),
    expectedDelivery: new Date("2024-10-16"),
    actualDelivery: new Date("2024-10-16"),
    invoiceNumber: "INV-2024-003",
    paymentDueDate: new Date("2024-11-12"),
    deliveryAddress: "456 Tech Park Ave, San Francisco, CA",
    orderType: "bulk"
  },
  {
    id: "po_004",
    orderNumber: "PO-2024-004",
    orderDate: new Date("2024-09-30"),
    status: "processing",
    total: 5680.25,
    items: 3,
    deliveryDate: new Date("2024-10-05"),
    paymentStatus: "pending",
    supplierId: "supplier_123",
    supplierName: "TechCorp Solutions Ltd.",
    priority: "low",
    discount: 0,
    tax: 454.25,
    shippingCost: 50.00,
    notes: "Small order for specialized components",
    createdBy: "Lisa Chen",
    updatedAt: new Date("2024-11-20"),
    expectedDelivery: new Date("2024-12-05"),
    actualDelivery: undefined,
    invoiceNumber: "INV-2024-004",
    paymentDueDate: new Date("2024-12-30"),
    deliveryAddress: "789 Warehouse District, Oakland, CA",
    orderType: "special"
  },
  {
    id: "po_005",
    orderNumber: "PO-2024-005",
    orderDate: new Date("2024-09-15"),
    status: "cancelled",
    total: 12300.00,
    items: 7,
    deliveryDate: null,
    paymentStatus: "cancelled",
    supplierId: "supplier_123",
    supplierName: "TechCorp Solutions Ltd.",
    priority: "low",
    discount: 300.00,
    tax: 984.00,
    shippingCost: 100.00,
    notes: "Order cancelled due to specification changes",
    createdBy: "John Smith",
    updatedAt: new Date("2024-09-20"),
    expectedDelivery: undefined,
    actualDelivery: undefined,
    invoiceNumber: undefined,
    paymentDueDate: undefined,
    deliveryAddress: "123 Main St, San Francisco, CA",
    orderType: "standard"
  },
  {
    id: "po_006",
    orderNumber: "PO-2024-006",
    orderDate: new Date("2024-11-20"),
    status: "pending",
    total: 18750.00,
    items: 15,
    deliveryDate: new Date("2024-12-01"),
    paymentStatus: "pending",
    supplierId: "supplier_123",
    supplierName: "TechCorp Solutions Ltd.",
    priority: "urgent",
    discount: 625.00,
    tax: 1500.00,
    shippingCost: 150.00,
    notes: "Critical order for Q4 product launch",
    createdBy: "Sarah Johnson",
    updatedAt: new Date("2024-11-21"),
    expectedDelivery: new Date("2024-12-01"),
    actualDelivery: undefined,
    invoiceNumber: "INV-2024-006",
    paymentDueDate: new Date("2024-12-31"),
    deliveryAddress: "123 Main St, San Francisco, CA",
    orderType: "urgent"
  },
  {
    id: "po_007",
    orderNumber: "PO-2024-007",
    orderDate: new Date("2024-08-15"),
    status: "shipped",
    total: 9850.00,
    items: 6,
    deliveryDate: new Date("2024-08-22"),
    paymentStatus: "partial",
    supplierId: "supplier_123",
    supplierName: "TechCorp Solutions Ltd.",
    priority: "medium",
    discount: 200.00,
    tax: 788.00,
    shippingCost: 85.00,
    notes: "Partial payment made, balance pending delivery confirmation",
    createdBy: "Mike Rodriguez",
    updatedAt: new Date("2024-08-20"),
    expectedDelivery: new Date("2024-08-22"),
    actualDelivery: new Date("2024-08-22"),
    invoiceNumber: "INV-2024-007",
    paymentDueDate: new Date("2024-09-15"),
    deliveryAddress: "456 Tech Park Ave, San Francisco, CA",
    orderType: "standard"
  }
];

const mockSupplierData = {
  id: "supplier_123",
  name: "TechCorp Solutions Ltd.",
  code: "TC001"
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
};

export default function PurchaseHistoryPage() {
  const params = useParams();
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  // For demo purposes, we'll simulate user check
  const userOrg = "demo_org"; // In real app, this would come from authentication

  const supplier = mockSupplierData;
  const orders = mockPurchaseHistory;

  // Calculate summary statistics
  const totalOrders = orders.length;
  const totalValue = orders.reduce((sum, order) => sum + order.total, 0);
  const completedOrders = orders.filter(order => order.status === "completed").length;
  const avgOrderValue = totalValue / totalOrders;
  const pendingOrders = orders.filter(order => order.status === "pending" || order.status === "processing").length;

  // Filter data based on search and filters
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch = searchValue === "" ||
        order.orderNumber.toLowerCase().includes(searchValue.toLowerCase()) ||
        (order.invoiceNumber && order.invoiceNumber.toLowerCase().includes(searchValue.toLowerCase()));

      const matchesStatus = statusFilter === "all" || order.status === statusFilter;
      const matchesPayment = paymentFilter === "all" || order.paymentStatus === paymentFilter;
      const matchesPriority = priorityFilter === "all" || order.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPayment && matchesPriority;
    });
  }, [orders, searchValue, statusFilter, paymentFilter, priorityFilter]);

  // TanStack Table setup
  const table = useReactTable({
    data: filteredOrders,
    columns: enhancedPurchaseHistoryColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  if (!userOrg) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        <div className="container py-8">
          <div className="max-w-md mx-auto text-center py-16">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <Building2 className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-3">Access Denied</h3>
            <p className="text-muted-foreground">You need to be part of an organization to view purchase history.</p>
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
          <div className="flex items-center gap-4 mb-4">
            <Link href={`/dashboard/purchases/suppliers/${params.id}`}>
              <Button variant="outline" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Details
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                Purchase History
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                {supplier.name} ({supplier.code})
              </p>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                    <ShoppingCart className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Total Orders</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalOrders}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/20">
                    <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Total Value</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(totalValue)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/20">
                    <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Avg Order Value</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(avgOrderValue)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/20">
                    <Package className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Completed</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{completedOrders}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/20">
                    <RefreshCw className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Pending</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{pendingOrders}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Advanced Filters & Search
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <Plus className="w-4 h-4" />
                  New Order
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="w-4 h-4" />
                  Export All
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search orders, invoices..."
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Order Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>

              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Payment Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payments</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Active Filters Display */}
            {(searchValue || statusFilter !== "all" || paymentFilter !== "all" || priorityFilter !== "all") && (
              <div className="mt-4 flex flex-wrap gap-2 items-center">
                <span className="text-sm text-slate-600 dark:text-slate-400">Active filters:</span>
                {searchValue && (
                  <Badge variant="outline" className="gap-1">
                    Search: "{searchValue}"
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0"
                      onClick={() => setSearchValue("")}
                    >
                      ×
                    </Button>
                  </Badge>
                )}
                {statusFilter !== "all" && (
                  <Badge variant="outline" className="gap-1">
                    Status: {statusFilter}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0"
                      onClick={() => setStatusFilter("all")}
                    >
                      ×
                    </Button>
                  </Badge>
                )}
                {paymentFilter !== "all" && (
                  <Badge variant="outline" className="gap-1">
                    Payment: {paymentFilter}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0"
                      onClick={() => setPaymentFilter("all")}
                    >
                      ×
                    </Button>
                  </Badge>
                )}
                {priorityFilter !== "all" && (
                  <Badge variant="outline" className="gap-1">
                    Priority: {priorityFilter}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0"
                      onClick={() => setPriorityFilter("all")}
                    >
                      ×
                    </Button>
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchValue("");
                    setStatusFilter("all");
                    setPaymentFilter("all");
                    setPriorityFilter("all");
                  }}
                  className="text-slate-500 hover:text-slate-700"
                >
                  Clear all
                </Button>
              </div>
            )}

            <div className="mt-3 text-sm text-slate-500 dark:text-slate-400">
              Showing {filteredOrders.length} of {totalOrders} orders
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Purchase Orders Table */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Purchase Orders ({filteredOrders.length})
              </CardTitle>
              {filteredOrders.length > 0 && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="w-4 h-4" />
                    Export Selected
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                  </Button>
                </div>
              )}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Comprehensive purchase order management with advanced filtering, sorting, and bulk actions
            </div>
          </CardHeader>
          <CardContent>
            {filteredOrders.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  {searchValue || statusFilter !== "all" || paymentFilter !== "all" || priorityFilter !== "all"
                    ? "No Orders Match Your Filters"
                    : "No Purchase Orders"}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  {searchValue || statusFilter !== "all" || paymentFilter !== "all" || priorityFilter !== "all"
                    ? "Try adjusting your filters to see more results."
                    : "No purchase orders found for this supplier yet."}
                </p>
                {(searchValue || statusFilter !== "all" || paymentFilter !== "all" || priorityFilter !== "all") ? (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchValue("");
                      setStatusFilter("all");
                      setPaymentFilter("all");
                      setPriorityFilter("all");
                    }}
                  >
                    Clear Filters
                  </Button>
                ) : (
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    Create First Order
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {/* TanStack Table */}
                <div className="rounded-md border border-slate-200 dark:border-slate-700">
                  <Table>
                    <TableHeader>
                      {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                          {headerGroup.headers.map((header) => (
                            <TableHead key={header.id} className="px-4 py-3">
                              {header.isPlaceholder
                                ? null
                                : flexRender(
                                    header.column.columnDef.header,
                                    header.getContext()
                                  )}
                            </TableHead>
                          ))}
                        </TableRow>
                      ))}
                    </TableHeader>
                    <TableBody>
                      {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                          <TableRow
                            key={row.id}
                            data-state={row.getIsSelected() && "selected"}
                            className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                          >
                            {row.getVisibleCells().map((cell) => (
                              <TableCell key={cell.id} className="px-4 py-3">
                                {flexRender(
                                  cell.column.columnDef.cell,
                                  cell.getContext()
                                )}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={enhancedPurchaseHistoryColumns.length}
                            className="h-24 text-center"
                          >
                            No results.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between space-x-2 py-4">
                  <div className="flex-1 text-sm text-muted-foreground">
                    {table.getFilteredSelectedRowModel().rows.length} of{" "}
                    {table.getFilteredRowModel().rows.length} row(s) selected.
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => table.previousPage()}
                      disabled={!table.getCanPreviousPage()}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => table.nextPage()}
                      disabled={!table.getCanNextPage()}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
