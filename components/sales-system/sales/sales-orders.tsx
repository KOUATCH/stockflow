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
      draft: { label: "Draft", variant: "secondary", icon: Edit },
      confirmed: { label: "Confirmed", variant: "default", icon: CheckCircle },
      processing: { label: "Processing", variant: "default", icon: Clock },
      shipped: { label: "Shipped", variant: "default", icon: CheckCircle },
      delivered: { label: "Delivered", variant: "default", icon: CheckCircle },
      completed: { label: "Completed", variant: "default", icon: CheckCircle },
      cancelled: { label: "Cancelled", variant: "destructive", icon: XCircle },
    }

    const config = statusConfig[status]
    const Icon = config.icon

    return (
      <Badge variant={config.variant as any} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const getPaymentBadge = (status: SalesOrder["paymentStatus"]) => {
    const statusConfig = {
      pending: { label: "Pending", variant: "secondary" },
      partial: { label: "Partial", variant: "secondary" },
      paid: { label: "Paid", variant: "default" },
      refunded: { label: "Refunded", variant: "destructive" },
    }

    const config = statusConfig[status]

    return (
      <Badge variant={config.variant as any} className="flex items-center gap-1">
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
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Sales Orders</h1>
          <p className="text-muted-foreground">Manage and track all sales transactions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" />
            New Order
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Total Orders</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">{filteredOrders.length}</div>
            <p className="text-xs text-muted-foreground">Active orders</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">${totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">From filtered orders</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">{completedOrders}</div>
            <p className="text-xs text-muted-foreground">Successfully completed</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Pending Payments</CardTitle>
            <Clock className="h-4 w-4 text-chart-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">{pendingPayments}</div>
            <p className="text-xs text-muted-foreground">Awaiting payment</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search orders by number, customer, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
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
              <SelectTrigger className="w-full sm:w-40">
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

      {/* Orders Table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Orders ({filteredOrders.length})</CardTitle>
          <CardDescription>Recent sales orders and their status</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Total</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium text-card-foreground">{order.orderNumber}</div>
                      <div className="text-sm text-muted-foreground">{order.items} items</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium text-card-foreground">{order.customer}</div>
                      {order.customerEmail && (
                        <div className="text-sm text-muted-foreground">{order.customerEmail}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium text-card-foreground">
                        {new Date(order.date).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-muted-foreground">{new Date(order.date).toLocaleTimeString()}</div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell>{getPaymentBadge(order.paymentStatus)}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-bold text-primary">${order.total.toFixed(2)}</div>
                      <div className="text-sm text-muted-foreground">Tax: ${order.tax.toFixed(2)}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => viewOrderDetails(order)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Order
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="mr-2 h-4 w-4" />
                          Print Receipt
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
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
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              {selectedOrder && `Order ${selectedOrder.orderNumber} - ${selectedOrder.customer}`}
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-card-foreground mb-2">Order Information</h4>
                  <div className="space-y-1 text-sm">
                    <div>Order Number: {selectedOrder.orderNumber}</div>
                    <div>Date: {new Date(selectedOrder.date).toLocaleString()}</div>
                    <div>Location: {selectedOrder.location}</div>
                    <div>Items: {selectedOrder.items}</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-card-foreground mb-2">Customer Information</h4>
                  <div className="space-y-1 text-sm">
                    <div>Name: {selectedOrder.customer}</div>
                    {selectedOrder.customerEmail && <div>Email: {selectedOrder.customerEmail}</div>}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-card-foreground mb-2">Status</h4>
                  <div className="space-y-2">
                    {getStatusBadge(selectedOrder.status)}
                    {getPaymentBadge(selectedOrder.paymentStatus)}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-card-foreground mb-2">Payment Summary</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>${selectedOrder.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax:</span>
                      <span>${selectedOrder.tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span>Total:</span>
                      <span>${selectedOrder.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>
                  Close
                </Button>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Download className="mr-2 h-4 w-4" />
                  Print Receipt
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
