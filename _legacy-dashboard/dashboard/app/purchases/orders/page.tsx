"use client";

import React, { useState, useMemo } from "react";
import { useNotifications } from "@/components/notifications/NotificationProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
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
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { enhancedPurchaseOrderColumns, EnhancedPurchaseOrder } from "./enhanced-columns";
import {
  Download,
  Filter,
  MoreHorizontal,
  Plus,
  Search,
  Settings2,
  Trash2,
  RefreshCw,
  FileText,
  BarChart3,
  Package,
  DollarSign,
  Clock,
  CheckCircle,
  Eye,
} from "lucide-react";

// Mock data for purchase orders - in real app, this would come from API
const mockPurchaseOrdersData: EnhancedPurchaseOrder[] = [
  {
    id: "po-001",
    orderNumber: "PO-2024-001",
    supplierId: "sup-001",
    supplierName: "Tech Supplies Co.",
    supplierCode: "TSC001",
    status: "approved",
    priority: "high",
    orderDate: new Date("2024-01-15"),
    expectedDeliveryDate: new Date("2024-01-25"),
    actualDeliveryDate: null,
    requestedBy: "John Smith",
    approvedBy: "Jane Doe",
    totalAmount: 12750.50,
    subtotal: 11500.00,
    taxAmount: 1150.00,
    shippingCost: 100.50,
    discountAmount: 0,
    itemsCount: 24,
    receivedItemsCount: 0,
    reference: "REQ-2024-001",
    notes: "Urgent delivery required for project deadline",
    paymentTerms: "Net 30",
    shippingAddress: "123 Business Park, Tech City, TC 12345",
    trackingNumber: null,
    organizationId: "org-001",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
    _count: {
      items: 24,
      receipts: 0,
      invoices: 1,
    },
  },
  {
    id: "po-002",
    orderNumber: "PO-2024-002",
    supplierId: "sup-002",
    supplierName: "Office Equipment Ltd.",
    supplierCode: "OEL002",
    status: "shipped",
    priority: "medium",
    orderDate: new Date("2024-01-12"),
    expectedDeliveryDate: new Date("2024-01-20"),
    actualDeliveryDate: null,
    requestedBy: "Sarah Johnson",
    approvedBy: "Mike Wilson",
    totalAmount: 8420.75,
    subtotal: 7650.00,
    taxAmount: 765.00,
    shippingCost: 55.75,
    discountAmount: 50.00,
    itemsCount: 15,
    receivedItemsCount: 8,
    reference: "REQ-2024-002",
    notes: "Standard office supplies replenishment",
    paymentTerms: "Net 15",
    shippingAddress: "456 Corporate Ave, Business Town, BT 67890",
    trackingNumber: "TRK123456789",
    organizationId: "org-001",
    createdAt: new Date("2024-01-12"),
    updatedAt: new Date("2024-01-18"),
    _count: {
      items: 15,
      receipts: 1,
      invoices: 1,
    },
  },
  {
    id: "po-003",
    orderNumber: "PO-2024-003",
    supplierId: "sup-003",
    supplierName: "Industrial Parts Inc.",
    supplierCode: "IPI003",
    status: "received",
    priority: "low",
    orderDate: new Date("2024-01-05"),
    expectedDeliveryDate: new Date("2024-01-15"),
    actualDeliveryDate: new Date("2024-01-14"),
    requestedBy: "Robert Brown",
    approvedBy: "Lisa Davis",
    totalAmount: 15670.25,
    subtotal: 14200.00,
    taxAmount: 1420.00,
    shippingCost: 125.25,
    discountAmount: 75.00,
    itemsCount: 32,
    receivedItemsCount: 32,
    reference: "REQ-2024-003",
    notes: "Maintenance parts for production line",
    paymentTerms: "Net 45",
    shippingAddress: "789 Industrial Way, Factory City, FC 54321",
    trackingNumber: "TRK987654321",
    organizationId: "org-001",
    createdAt: new Date("2024-01-05"),
    updatedAt: new Date("2024-01-14"),
    _count: {
      items: 32,
      receipts: 1,
      invoices: 1,
    },
  },
  {
    id: "po-004",
    orderNumber: "PO-2024-004",
    supplierId: "sup-001",
    supplierName: "Tech Supplies Co.",
    supplierCode: "TSC001",
    status: "pending",
    priority: "urgent",
    orderDate: new Date("2024-01-20"),
    expectedDeliveryDate: new Date("2024-01-27"),
    actualDeliveryDate: null,
    requestedBy: "Emily Wilson",
    approvedBy: null,
    totalAmount: 5680.00,
    subtotal: 5200.00,
    taxAmount: 520.00,
    shippingCost: 0,
    discountAmount: 40.00,
    itemsCount: 8,
    receivedItemsCount: 0,
    reference: "REQ-2024-004",
    notes: "Emergency replacement parts",
    paymentTerms: "Net 15",
    shippingAddress: "123 Business Park, Tech City, TC 12345",
    trackingNumber: null,
    organizationId: "org-001",
    createdAt: new Date("2024-01-20"),
    updatedAt: new Date("2024-01-20"),
    _count: {
      items: 8,
      receipts: 0,
      invoices: 0,
    },
  },
];

export default function EnhancedPurchaseOrdersPage() {
  const notifications = useNotifications();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");

  // Filter states
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [supplierFilter, setSupplierFilter] = useState("all");

  // Filtered data based on local filters
  const filteredData = useMemo(() => {
    return mockPurchaseOrdersData.filter((order) => {
      const matchesStatus = statusFilter === "all" || order.status === statusFilter;
      const matchesPriority = priorityFilter === "all" || order.priority === priorityFilter;
      const matchesSupplier = supplierFilter === "all" || order.supplierName === supplierFilter;

      return matchesStatus && matchesPriority && matchesSupplier;
    });
  }, [statusFilter, priorityFilter, supplierFilter]);

  const table = useReactTable({
    data: filteredData,
    columns: enhancedPurchaseOrderColumns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedOrdersCount = selectedRows.length;

  // Get unique suppliers for filter dropdown
  const uniqueSuppliers = Array.from(
    new Set(mockPurchaseOrdersData.map((order) => order.supplierName))
  );

  // Statistics calculations
  const totalOrders = filteredData.length;
  const totalValue = filteredData.reduce((sum, order) => sum + order.totalAmount, 0);
  const pendingOrders = filteredData.filter(order => order.status === "pending").length;
  const completedOrders = filteredData.filter(order => order.status === "received").length;

  const handleBulkDelete = () => {
    const orderNumbers = selectedRows.map(row => row.original.orderNumber).join(", ");
    notifications.warning(
      "Bulk Delete Orders",
      `Preparing to delete ${selectedOrdersCount} orders: ${orderNumbers}. This action would require confirmation.`
    );
    console.log("Bulk delete orders:", selectedRows.map(row => row.original.id));
  };

  const handleBulkExport = () => {
    notifications.operationStart("Purchase Orders Export");
    // Simulate export process
    setTimeout(() => {
      notifications.operationComplete(
        "Purchase Orders Export",
        `Successfully exported ${selectedOrdersCount} purchase orders to CSV file.`
      );
    }, 2000);
    console.log("Bulk export orders:", selectedRows.map(row => row.original.id));
  };

  return (
    <div className="flex h-screen bg-background">
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background">
          <div className="container mx-auto px-6 py-8 max-w-full">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                    Purchase Orders
                  </h1>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">
                    Manage and track your purchase orders with suppliers
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="outline" className="gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                  </Button>
                  <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4" />
                    Create Order
                  </Button>
                </div>
              </div>

              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
                <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                      <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-slate-900 dark:text-white">{totalOrders}</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Total Orders</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                      <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-slate-900 dark:text-white">
                        ${totalValue.toLocaleString()}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Total Value</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                      <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-slate-900 dark:text-white">{pendingOrders}</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Pending</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-slate-900 dark:text-white">{completedOrders}</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Completed</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 mb-6">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-3 flex-1">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                    <Input
                      placeholder="Search purchase orders..."
                      value={globalFilter ?? ""}
                      onChange={(event) => setGlobalFilter(String(event.target.value))}
                      className="pl-10"
                    />
                  </div>

                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="partially_received">Partially Received</SelectItem>
                      <SelectItem value="received">Received</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="All Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priority</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={supplierFilter} onValueChange={setSupplierFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="All Suppliers" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Suppliers</SelectItem>
                      {uniqueSuppliers.map((supplier) => (
                        <SelectItem key={supplier} value={supplier}>
                          {supplier}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  {selectedOrdersCount > 0 && (
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="gap-1">
                        <Package className="h-3 w-3" />
                        {selectedOrdersCount} selected
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleBulkExport}
                        className="gap-1"
                      >
                        <Download className="h-4 w-4" />
                        Export
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleBulkDelete}
                        className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  )}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Settings2 className="h-4 w-4" />
                        Columns
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {table
                        .getAllColumns()
                        .filter((column) => column.getCanHide())
                        .map((column) => {
                          return (
                            <DropdownMenuCheckboxItem
                              key={column.id}
                              className="capitalize"
                              checked={column.getIsVisible()}
                              onCheckedChange={(value) =>
                                column.toggleVisibility(!!value)
                              }
                            >
                              {column.id}
                            </DropdownMenuCheckboxItem>
                          );
                        })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id} className="hover:bg-transparent border-slate-200 dark:border-slate-700">
                        {headerGroup.headers.map((header) => (
                          <TableHead key={header.id} className="bg-slate-50 dark:bg-slate-900/50 font-semibold text-slate-900 dark:text-slate-100">
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
                          className="hover:bg-slate-50 dark:hover:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                        >
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id} className="py-4">
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
                          colSpan={enhancedPurchaseOrderColumns.length}
                          className="h-24 text-center text-slate-500 dark:text-slate-400"
                        >
                          No purchase orders found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <span>
                    Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{" "}
                    {Math.min(
                      (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                      table.getFilteredRowModel().rows.length
                    )}{" "}
                    of {table.getFilteredRowModel().rows.length} orders
                  </span>
                  {selectedOrdersCount > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {selectedOrdersCount} selected
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                  >
                    Previous
                  </Button>

                  <div className="flex items-center gap-1">
                    {[...Array(table.getPageCount())].map((_, i) => {
                      const pageNumber = i + 1;
                      const isCurrentPage = table.getState().pagination.pageIndex === i;

                      // Only show first page, last page, current page, and adjacent pages
                      if (
                        pageNumber === 1 ||
                        pageNumber === table.getPageCount() ||
                        Math.abs(table.getState().pagination.pageIndex - i) <= 1
                      ) {
                        return (
                          <Button
                            key={i}
                            variant={isCurrentPage ? "default" : "outline"}
                            size="sm"
                            className="w-8 h-8 p-0"
                            onClick={() => table.setPageIndex(i)}
                          >
                            {pageNumber}
                          </Button>
                        );
                      } else if (
                        pageNumber === 2 && table.getState().pagination.pageIndex > 3 ||
                        pageNumber === table.getPageCount() - 1 && table.getState().pagination.pageIndex < table.getPageCount() - 4
                      ) {
                        return <span key={i} className="px-1 text-slate-400">...</span>;
                      }
                      return null;
                    })}
                  </div>

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
          </div>
        </main>
      </div>
    </div>
  );
}