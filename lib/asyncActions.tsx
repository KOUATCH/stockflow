"use client"

import { getOrgPurchaseOrders } from "@/actions/purchaseOrderWorkflow/getOrgPurchaseOrders"
// import { PurchaseOrderWorkflowPanel } from "@/components/purchaseOrderWorkflow/purchaseOrderWorkflowPanel" // Component removed in cleanup
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getAuthenticatedUser } from "@/config/useAuth"
import { AlertTriangle, BarChart3, Clipboard, Clock, FileText, Package, ShoppingCart, TrendingUp } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

// Mock data for demonstration
const MOCK_ORGANIZATION_ID = "org-123"
const MOCK_USER_ID = "user-123"

const SAMPLE_PURCHASE_ORDERS = [
  {
    id: "po-001",
    orderNumber: "PO-000001",
    status: "DRAFT" as const,
    orderDate: new Date("2024-01-15"),
    expectedDeliveryDate: new Date("2024-01-25"),
    total: 1250.0,
    supplier: { id: "sup-1", name: "Tech Supplies Inc" },
    location: { id: "loc-1", name: "Main Warehouse" },
    createdBy: { id: "user-1", name: "John Doe" },
  },
  {
    id: "po-002",
    orderNumber: "PO-000002",
    status: "SUBMITTED" as const,
    orderDate: new Date("2024-01-16"),
    expectedDeliveryDate: new Date("2024-01-26"),
    total: 850.0,
    supplier: { id: "sup-2", name: "Office Depot" },
    location: { id: "loc-1", name: "Main Warehouse" },
    createdBy: { id: "user-2", name: "Jane Smith" },
  },
  {
    id: "po-003",
    orderNumber: "PO-000003",
    status: "APPROVED" as const,
    orderDate: new Date("2024-01-17"),
    expectedDeliveryDate: new Date("2024-01-27"),
    total: 2100.0,
    supplier: { id: "sup-3", name: "Industrial Parts Co" },
    location: { id: "loc-2", name: "Secondary Warehouse" },
    createdBy: { id: "user-1", name: "John Doe" },
  },
]

const STATUS_COLORS = {
  DRAFT: "bg-gray-500",
  SUBMITTED: "bg-blue-500",
  APPROVED: "bg-green-500",
  PARTIALLY_RECEIVED: "bg-yellow-500",
  RECEIVED: "bg-green-600",
  COMPLETED: "bg-green-700",
  CANCELLED: "bg-red-500",
}

function PurchaseOrderCard({ po }: { po: (typeof SAMPLE_PURCHASE_ORDERS)[0] }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{po.orderNumber}</CardTitle>
          <Badge variant="secondary" className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${STATUS_COLORS[po.status]}`} />
            {po.status}
          </Badge>
        </div>
        <CardDescription>{po.supplier.name}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total:</span>
            <span className="font-medium">${po.total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Expected:</span>
            <span>{po.expectedDeliveryDate.toString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Location:</span>
            <span>{po.location.name}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function DashboardStats() {
  const stats = [
    {
      title: "Total Orders",
      value: "24",
      change: "+12%",
      icon: ShoppingCart,
      color: "text-blue-600",
    },
    {
      title: "Pending Approval",
      value: "8",
      change: "+3",
      icon: Clock,
      color: "text-yellow-600",
    },
    {
      title: "In Transit",
      value: "12",
      change: "-2",
      icon: Package,
      color: "text-green-600",
    },
    {
      title: "Total Value",
      value: "$45,230",
      change: "+18%",
      icon: TrendingUp,
      color: "text-purple-600",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="text-green-600">{stat.change}</span> from last month
                </p>
              </div>
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function WorkflowDemo() {
  const [selectedPO, setSelectedPO] = useState(SAMPLE_PURCHASE_ORDERS[0].id)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Workflow Demo</h2>
        <div className="flex gap-2">
          {SAMPLE_PURCHASE_ORDERS.map((po) => (
            <Button
              key={po.id}
              variant={selectedPO === po.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPO(po.id)}
            >
              {po.orderNumber}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Purchase Order Details</CardTitle>
              <CardDescription>
                Selected: {SAMPLE_PURCHASE_ORDERS.find((po) => po.id === selectedPO)?.orderNumber}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Supplier:</span>
                    <p className="font-medium">
                      {SAMPLE_PURCHASE_ORDERS.find((po) => po.id === selectedPO)?.supplier.name}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total:</span>
                    <p className="font-medium">
                      ${SAMPLE_PURCHASE_ORDERS.find((po) => po.id === selectedPO)?.total.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Order Date:</span>
                    <p className="font-medium">
                      {SAMPLE_PURCHASE_ORDERS.find((po) => po.id === selectedPO)?.orderDate.toString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Expected Delivery:</span>
                    <p className="font-medium">
                      {SAMPLE_PURCHASE_ORDERS.find(
                        (po) => po.id === selectedPO,
                      )?.expectedDeliveryDate.toString()}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">Sample Line Items</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between p-2 bg-muted rounded">
                      <span>Office Chairs (Qty: 5)</span>
                      <span>$750.00</span>
                    </div>
                    <div className="flex justify-between p-2 bg-muted rounded">
                      <span>Desk Lamps (Qty: 10)</span>
                      <span>$300.00</span>
                    </div>
                    <div className="flex justify-between p-2 bg-muted rounded">
                      <span>Notebooks (Qty: 50)</span>
                      <span>$200.00</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <PurchaseOrderWorkflowPanel
            purchaseOrderId={selectedPO}
            organizationId={MOCK_ORGANIZATION_ID}
            currentUserId={MOCK_USER_ID}
          />
        </div>
      </div>
    </div>
  )
}

function InventoryOverview() {
  // const mockInventoryData = [
  //   { item: "Office Chairs", onHand: 25, reserved: 5, available: 20, value: "$3,750" },
  //   { item: "Desk Lamps", onHand: 45, reserved: 10, available: 35, value: "$1,350" },
  //   { item: "Notebooks", onHand: 200, reserved: 50, available: 150, value: "$600" },
  //   { item: "Monitors", onHand: 12, reserved: 2, available: 10, value: "$4,800" },
  // ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Inventory Overview
        </CardTitle>
        <CardDescription>Current stock levels and availability</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockInventoryData.map((item) => (
            <div key={item.item} className="flex items-center justify-between p-3 border rounded">
              <div className="flex-1">
                <p className="font-medium">{item.item}</p>
                <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                  <span>On Hand: {item.onHand}</span>
                  <span>Reserved: {item.reserved}</span>
                  <span>Available: {item.available}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">{item.value}</p>
                <Badge variant={item.available < 10 ? "destructive" : "secondary"} className="text-xs">
                  {item.available < 10 ? "Low Stock" : "In Stock"}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default async function PurchaseOrderDashboard() {
  const user = await getAuthenticatedUser()

  const purchaseOrders = await getOrgPurchaseOrders(user?.organizationId)

  // const purchaseOrderData = purchaseOrdsers.

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Purchase Order Workflow System</h1>
            <p className="text-muted-foreground mt-1">
              Comprehensive purchase order management with inventory integration
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <FileText className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Link href="/dashboard/purchase-orders/new">
              <Button size="sm">
                <ShoppingCart className="h-4 w-4 mr-2" />
                New Order
              </Button>
            </Link>
            <Link href="/dashboard/purchase-orders">
              <Button size="sm">
                <Clipboard className="h-4 w-4 mr-2" />
                Order List
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Dashboard */}
        <DashboardStats />

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="workflow">Workflow Demo</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Purchase Orders</CardTitle>
                  <CardDescription>Latest orders in the system</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {SAMPLE_PURCHASE_ORDERS.map((po) => (
                      <PurchaseOrderCard key={po.id} po={po} />
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <InventoryOverview />

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      Attention Required
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <p className="font-medium">PO-000004</p>
                          <p className="text-sm text-muted-foreground">Overdue delivery</p>
                        </div>
                        <Badge variant="destructive">Overdue</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <p className="font-medium">PO-000002</p>
                          <p className="text-sm text-muted-foreground">Pending approval</p>
                        </div>
                        <Badge variant="secondary">Pending</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="workflow">
            <WorkflowDemo />
          </TabsContent>

          <TabsContent value="inventory">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <InventoryOverview />

              <Card>
                <CardHeader>
                  <CardTitle>Inventory Transactions</CardTitle>
                  <CardDescription>Recent inventory movements</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">Office Chairs</p>
                        <p className="text-sm text-muted-foreground">Purchase Receipt - PO-000001</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-green-600">+5</p>
                        <p className="text-xs text-muted-foreground">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">Notebooks</p>
                        <p className="text-sm text-muted-foreground">Sale</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-red-600">-25</p>
                        <p className="text-xs text-muted-foreground">4 hours ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Order Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    Chart visualization would go here
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Suppliers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Tech Supplies Inc</span>
                      <span className="font-medium">$12,450</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Industrial Parts Co</span>
                      <span className="font-medium">$8,920</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Office Depot</span>
                      <span className="font-medium">$6,340</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
