"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Plus,
  Download,
  RefreshCw,
  CheckCircle,
  Clock,
  XCircle,
  DollarSign,
  ShoppingCart,
} from "lucide-react"

interface SalesOrder {
  id: string
  orderNumber: string
  customer: string
  customerEmail?: string
  date: string
  status: "draft" | "confirmed" | "processing" | "shipped" | "delivered" | "completed" | "cancelled"
  paymentStatus: "pending" | "partial" | "paid" | "refunded"
  items: number
  subtotal: number
  tax: number
  total: number
  location: string
}

const mockOrders: SalesOrder[] = [
  {
    id: "1",
    orderNumber: "SO-000001",
    customer: "John Doe",
    customerEmail: "john@example.com",
    date: "2024-01-15T10:30:00Z",
    status: "completed",
    paymentStatus: "paid",
    items: 3,
    subtotal: 2747,
    tax: 234.5,
    total: 2981.5,
    location: "Main Store",
  },
  {
    id: "2",
    orderNumber: "SO-000002",
    customer: "Jane Smith",
    customerEmail: "jane@example.com",
    date: "2024-01-15T14:15:00Z",
    status: "processing",
    paymentStatus: "paid",
    items: 1,
    subtotal: 1099,
    tax: 93.42,
    total: 1192.42,
    location: "Main Store",
  },
  {
    id: "3",
    orderNumber: "SO-000003",
    customer: "Bob Johnson",
    date: "2024-01-14T16:45:00Z",
    status: "confirmed",
    paymentStatus: "pending",
    items: 2,
    subtotal: 648,
    tax: 55.08,
    total: 703.08,
    location: "Store Front",
  },
  {
    id: "4",
    orderNumber: "SO-000004",
    customer: "Alice Brown",
    customerEmail: "alice@example.com",
    date: "2024-01-14T11:20:00Z",
    status: "shipped",
    paymentStatus: "paid",
    items: 1,
    subtotal: 1399,
    tax: 119.92,
    total: 1518.92,
    location: "Main Store",
  },
]

export function SalesOrders() {
  const [orders, setOrders] = useState<SalesOrder[]>(mockOrders)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [paymentFilter, setPaymentFilter] = useState("all")
  const [selectedOrder, setSelectedOrder] = useState<SalesOrder | null>(null)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.customerEmail && order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesStatus = statusFilter === "all" || order.status === statusFilter
    const matchesPayment = paymentFilter === "all" || order.paymentStatus === paymentFilter

    return matchesSearch && matchesStatus && matchesPayment
  })

  const getStatusBadge = (status: SalesOrder["status"]) => {
    const statusConfig = {
      draft: { label: "Draft", className: "border-slate-200 bg-slate-50 text-slate-700", icon: Edit },
      confirmed: { label: "Confirmed", className: "border-teal-200 bg-teal-50 text-teal-700", icon: CheckCircle },
      processing: { label: "Processing", className: "border-cyan-200 bg-cyan-50 text-cyan-700", icon: Clock },
      shipped: { label: "Shipped", className: "border-sky-200 bg-sky-50 text-sky-700", icon: CheckCircle },
      delivered: { label: "Delivered", className: "border-emerald-200 bg-emerald-50 text-emerald-700", icon: CheckCircle },
      completed: { label: "Completed", className: "border-green-200 bg-green-50 text-green-700", icon: CheckCircle },
      cancelled: { label: "Cancelled", className: "border-red-200 bg-red-50 text-red-700", icon: XCircle },
    }

    const config = statusConfig[status]
    const Icon = config.icon

    return (
      <Badge variant="outline" className={`flex items-center gap-1 ${config.className}`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const getPaymentBadge = (status: SalesOrder["paymentStatus"]) => {
    const statusConfig = {
      pending: { label: "Pending", className: "border-amber-200 bg-amber-50 text-amber-700" },
      partial: { label: "Partial", className: "border-orange-200 bg-orange-50 text-orange-700" },
      paid: { label: "Paid", className: "border-green-200 bg-green-50 text-green-700" },
      refunded: { label: "Refunded", className: "border-red-200 bg-red-50 text-red-700" },
    }

    const config = statusConfig[status]

    return (
      <Badge variant="outline" className={`flex items-center gap-1 ${config.className}`}>
        <DollarSign className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const viewOrderDetails = (order: SalesOrder) => {
    setSelectedOrder(order)
    setIsDetailsDialogOpen(true)
  }

  const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.total, 0)
  const completedOrders = filteredOrders.filter((order) => order.status === "completed").length
  const pendingPayments = filteredOrders.filter((order) => order.paymentStatus === "pending").length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50/80 via-blue-50/40 to-teal-50/30 dark:from-slate-800/80 dark:via-slate-700/40 dark:to-slate-600/30">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_50%)] dark:bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.05),transparent_50%)]"></div>

      {/* Enhanced Header Section */}
      <div className="relative z-10 sticky top-0 backdrop-blur-xl bg-gradient-to-r from-white/60 to-slate-50/40 dark:from-slate-800/60 dark:to-slate-700/40 border-b border-slate-200/60 dark:border-slate-700/60 shadow-2xl">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 shadow-lg ring-4 ring-teal-500/20">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">Sales Orders</h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1 font-medium">Manage and track all sales transactions</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button className="bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 font-semibold">
                <Plus className="mr-2 h-4 w-4" />
                New Order
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 p-8 space-y-8">

      {/* Enhanced Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-4 rounded-xl border border-blue-200/40 dark:border-blue-800/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10 dark:bg-blue-400/10">
              <RefreshCw className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                Total Orders
              </p>
              <p className="text-xl font-bold text-blue-900 dark:text-blue-100">{filteredOrders.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 p-4 rounded-xl border border-emerald-200/40 dark:border-emerald-800/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 dark:bg-emerald-400/10">
              <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
                Total Revenue
              </p>
              <p className="text-xl font-bold text-emerald-900 dark:text-emerald-100">${totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20 p-4 rounded-xl border border-teal-200/40 dark:border-teal-800/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-teal-500/10 dark:bg-teal-400/10">
              <CheckCircle className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <p className="text-xs font-medium text-teal-600 dark:text-teal-400 uppercase tracking-wide">
                Completed
              </p>
              <p className="text-xl font-bold text-teal-900 dark:text-teal-100">{completedOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-4 rounded-xl border border-amber-200/40 dark:border-amber-800/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 dark:bg-amber-400/10">
              <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-xs font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wide">
                Pending Payments
              </p>
              <p className="text-xl font-bold text-amber-900 dark:text-amber-100">{pendingPayments}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Filters */}
      <Card className="relative overflow-hidden bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-0 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50/80 via-blue-50/40 to-teal-50/30 dark:from-slate-800/80 dark:via-slate-700/40 dark:to-slate-600/30"></div>
        <CardContent className="relative z-10 p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <Input
                placeholder="Search orders by number, customer, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40 bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700">
                <SelectValue placeholder="Order Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger className="w-full sm:w-40 bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700">
                <SelectValue placeholder="Payment Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payments</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Orders Table */}
      <Card className="relative overflow-hidden bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-0 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50/80 via-blue-50/40 to-teal-50/30 dark:from-slate-800/80 dark:via-slate-700/40 dark:to-slate-600/30"></div>
        <CardHeader className="relative z-10 bg-gradient-to-r from-white/60 to-slate-50/40 dark:from-slate-800/60 dark:to-slate-700/40 backdrop-blur-sm border-b border-slate-200/60 dark:border-slate-700/60">
          <CardTitle className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">Orders ({filteredOrders.length})</CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400">Recent sales orders and their status</CardDescription>
        </CardHeader>
        <CardContent className="relative z-10 p-0">
          <div className="rounded-lg border border-slate-200/60 dark:border-slate-700/60 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-200/50 dark:border-slate-700/50 hover:bg-slate-50/50 dark:hover:bg-slate-700/50">
                  <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">Order</TableHead>
                  <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">Customer</TableHead>
                  <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">Date</TableHead>
                  <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">Status</TableHead>
                  <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">Payment</TableHead>
                  <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">Total</TableHead>
                  <TableHead className="text-slate-700 dark:text-slate-300 font-semibold w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id} className="border-slate-200/30 dark:border-slate-700/30 hover:bg-slate-50/60 dark:hover:bg-slate-700/60 transition-colors">
                    <TableCell>
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white">{order.orderNumber}</div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">{order.items} items</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white">{order.customer}</div>
                        {order.customerEmail && (
                          <div className="text-sm text-slate-600 dark:text-slate-400">{order.customerEmail}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white">
                          {new Date(order.date).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">{new Date(order.date).toLocaleTimeString()}</div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell>{getPaymentBadge(order.paymentStatus)}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-bold text-emerald-600 dark:text-emerald-400">${order.total.toFixed(2)}</div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">Tax: ${order.tax.toFixed(2)}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="hover:bg-slate-50 dark:hover:bg-slate-700">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => viewOrderDetails(order)} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem className="hover:bg-slate-50 dark:hover:bg-slate-700">
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Order
                          </DropdownMenuItem>
                          <DropdownMenuItem className="hover:bg-slate-50 dark:hover:bg-slate-700">
                            <Download className="mr-2 h-4 w-4" />
                            Print Receipt
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Cancel Order
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Order Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-0 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-slate-50/50 to-blue-50/30 dark:from-slate-900/80 dark:via-slate-800/50 dark:to-slate-700/30 rounded-lg"></div>

          <DialogHeader className="relative z-10 pb-6 border-b border-slate-200/60 dark:border-slate-700/60">
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 shadow-lg">
                <Eye className="h-5 w-5 text-white" />
              </div>
              <span className="bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent font-semibold">
                Order Details
              </span>
            </DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400">
              {selectedOrder && `Order ${selectedOrder.orderNumber} - ${selectedOrder.customer}`}
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6 relative z-10 py-6">
              <div className="grid grid-cols-2 gap-4">
                <Card className="border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-sm text-slate-700 dark:text-slate-300 font-semibold">Order Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Order Number:</span>
                        <span className="font-medium text-slate-900 dark:text-white">{selectedOrder.orderNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Date:</span>
                        <span className="font-medium text-slate-900 dark:text-white">{new Date(selectedOrder.date).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Location:</span>
                        <span className="font-medium text-slate-900 dark:text-white">{selectedOrder.location}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Items:</span>
                        <span className="font-medium text-slate-900 dark:text-white">{selectedOrder.items}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-sm text-slate-700 dark:text-slate-300 font-semibold">Customer Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Name:</span>
                        <span className="font-medium text-slate-900 dark:text-white">{selectedOrder.customer}</span>
                      </div>
                      {selectedOrder.customerEmail && (
                        <div className="flex justify-between">
                          <span className="text-slate-600 dark:text-slate-400">Email:</span>
                          <span className="font-medium text-slate-900 dark:text-white">{selectedOrder.customerEmail}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Card className="border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-sm text-slate-700 dark:text-slate-300 font-semibold">Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {getStatusBadge(selectedOrder.status)}
                      {getPaymentBadge(selectedOrder.paymentStatus)}
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-sm text-slate-700 dark:text-slate-300 font-semibold">Payment Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Subtotal:</span>
                        <span className="font-medium text-slate-900 dark:text-white">${selectedOrder.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Tax:</span>
                        <span className="font-medium text-slate-900 dark:text-white">${selectedOrder.tax.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                        <span className="text-emerald-700 dark:text-emerald-400">Total:</span>
                        <span className="text-emerald-700 dark:text-emerald-400">${selectedOrder.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-200/60 dark:border-slate-700/60">
                <Button
                  variant="outline"
                  onClick={() => setIsDetailsDialogOpen(false)}
                  className="bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                >
                  Close
                </Button>
                <Button className="bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 font-semibold">
                  <Download className="mr-2 h-4 w-4" />
                  Print Receipt
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      </div>
    </div>
  )
}
