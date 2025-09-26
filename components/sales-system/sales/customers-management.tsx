"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import {
  DollarSign,
  Edit,
  Eye,
  MoreHorizontal,
  Plus,
  Search,
  ShoppingBag,
  Trash2,
  TrendingUp,
  Users,
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"

interface Customer {
  id: string
  name: string
  email?: string
  phone?: string
  address?: string
  city?: string
  totalOrders: number
  totalSpent: number
  lastOrderDate?: string
  status: "active" | "inactive"
  createdAt: string
}

const mockCustomers: Customer[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    phone: "+1234567890",
    address: "123 Main St",
    city: "New York",
    totalOrders: 15,
    totalSpent: 4250.75,
    lastOrderDate: "2024-01-15T10:30:00Z",
    status: "active",
    createdAt: "2023-06-15T09:00:00Z",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    phone: "+1234567891",
    address: "456 Oak Ave",
    city: "Los Angeles",
    totalOrders: 8,
    totalSpent: 2180.5,
    lastOrderDate: "2024-01-14T14:15:00Z",
    status: "active",
    createdAt: "2023-08-22T11:30:00Z",
  },
  {
    id: "3",
    name: "Bob Johnson",
    phone: "+1234567892",
    address: "789 Pine Rd",
    city: "Chicago",
    totalOrders: 3,
    totalSpent: 890.25,
    lastOrderDate: "2024-01-10T16:45:00Z",
    status: "active",
    createdAt: "2023-11-05T14:20:00Z",
  },
  {
    id: "4",
    name: "Alice Brown",
    email: "alice@example.com",
    phone: "+1234567893",
    totalOrders: 22,
    totalSpent: 6750.0,
    lastOrderDate: "2024-01-12T11:20:00Z",
    status: "active",
    createdAt: "2023-03-10T08:45:00Z",
  },
]

export function CustomersManagement() {
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (customer.phone && customer.phone.includes(searchTerm))

    return matchesSearch
  })

  const viewCustomerDetails = (customer: Customer) => {
    setSelectedCustomer(customer)
    setIsDetailsDialogOpen(true)
  }

  const totalCustomers = filteredCustomers.length
  const activeCustomers = filteredCustomers.filter((c) => c.status === "active").length
  const totalRevenue = filteredCustomers.reduce((sum, c) => sum + c.totalSpent, 0)
  const avgOrderValue = totalRevenue / filteredCustomers.reduce((sum, c) => sum + c.totalOrders, 0) || 0

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Customer Management</h1>
          <p className="text-muted-foreground">Manage your customer relationships and track sales history</p>
        </div>
        <Link href="/dashboard/customers/new">
          <Button
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Customer
          </Button>
        </Link>
        <Button
          className="bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={() => setIsAddDialogOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Customer
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">{totalCustomers}</div>
            <p className="text-xs text-muted-foreground">{activeCustomers} active</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">${totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">From all customers</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Avg Order Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">${avgOrderValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Per transaction</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {filteredCustomers.reduce((sum, c) => sum + c.totalOrders, 0)}
            </div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search customers by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Customers ({filteredCustomers.length})</CardTitle>
          <CardDescription>Manage your customer database</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Total Spent</TableHead>
                <TableHead>Last Order</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium text-card-foreground">{customer.name}</div>
                      {customer.address && (
                        <div className="text-sm text-muted-foreground">
                          {customer.address}
                          {customer.city && `, ${customer.city}`}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      {customer.email && <div className="text-sm text-card-foreground">{customer.email}</div>}
                      {customer.phone && <div className="text-sm text-muted-foreground">{customer.phone}</div>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-card-foreground">{customer.totalOrders}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-bold text-primary">${customer.totalSpent.toLocaleString()}</div>
                  </TableCell>
                  <TableCell>
                    {customer.lastOrderDate ? (
                      <div>
                        <div className="text-sm text-card-foreground">
                          {new Date(customer.lastOrderDate).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(customer.lastOrderDate).toLocaleTimeString()}
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">No orders</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={customer.status === "active" ? "default" : "secondary"}>{customer.status}</Badge>
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
                        <DropdownMenuItem onClick={() => viewCustomerDetails(customer)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Customer
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Customer
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

      {/* Add Customer Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
            <DialogDescription>Create a new customer profile</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="Enter customer name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="customer@example.com" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" placeholder="+1234567890" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" placeholder="Enter city" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" placeholder="Enter full address" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" placeholder="Additional customer notes (optional)" />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Create Customer</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Customer Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
            <DialogDescription>{selectedCustomer && `Profile for ${selectedCustomer.name}`}</DialogDescription>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-card-foreground mb-2">Contact Information</h4>
                  <div className="space-y-1 text-sm">
                    <div>Name: {selectedCustomer.name}</div>
                    {selectedCustomer.email && <div>Email: {selectedCustomer.email}</div>}
                    {selectedCustomer.phone && <div>Phone: {selectedCustomer.phone}</div>}
                    {selectedCustomer.address && <div>Address: {selectedCustomer.address}</div>}
                    {selectedCustomer.city && <div>City: {selectedCustomer.city}</div>}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-card-foreground mb-2">Purchase History</h4>
                  <div className="space-y-1 text-sm">
                    <div>Total Orders: {selectedCustomer.totalOrders}</div>
                    <div>Total Spent: ${selectedCustomer.totalSpent.toLocaleString()}</div>
                    <div>Avg Order: ${(selectedCustomer.totalSpent / selectedCustomer.totalOrders).toFixed(2)}</div>
                    {selectedCustomer.lastOrderDate && (
                      <div>Last Order: {new Date(selectedCustomer.lastOrderDate).toLocaleDateString()}</div>
                    )}
                    <div>Member Since: {new Date(selectedCustomer.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>
                  Close
                </Button>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Customer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div >
  )
}
