"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { AlertTriangle, DollarSign, Package, ShoppingCart, TrendingDown, TrendingUp, Truck, Users } from "lucide-react"

export function DashboardOverview() {
  const stats = [
    {
      title: "Total Revenue",
      value: "$45,231.89",
      change: "+20.1%",
      trend: "up",
      icon: DollarSign,
    },
    {
      title: "Total Orders",
      value: "2,350",
      change: "+180.1%",
      trend: "up",
      icon: ShoppingCart,
    },
    {
      title: "Active Customers",
      value: "1,234",
      change: "+19%",
      trend: "up",
      icon: Users,
    },
    {
      title: "Pending Orders",
      value: "23",
      change: "-4%",
      trend: "down",
      icon: Truck,
    },
  ]

  const lowStockItems = [
    { name: "iPhone 15 Pro", sku: "IPH15P-256", current: 5, minimum: 10, status: "critical" },
    { name: "Samsung Galaxy S24", sku: "SGS24-128", current: 8, minimum: 15, status: "low" },
    { name: "MacBook Air M3", sku: "MBA-M3-512", current: 12, minimum: 20, status: "low" },
    { name: "AirPods Pro", sku: "APP-GEN3", current: 3, minimum: 25, status: "critical" },
  ]

  const recentTransactions = [
    { id: "TXN-001", type: "Sale", item: "iPhone 15 Pro", quantity: -2, time: "2 minutes ago" },
    { id: "TXN-002", type: "Purchase", item: "Samsung Galaxy S24", quantity: +50, time: "15 minutes ago" },
    { id: "TXN-003", type: "Adjustment", item: "MacBook Air M3", quantity: -1, time: "1 hour ago" },
    { id: "TXN-004", type: "Sale", item: "AirPods Pro", quantity: -5, time: "2 hours ago" },
  ]

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's what's happening with your inventory.</p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Package className="mr-2 h-4 w-4" />
          Add New Item
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-card-foreground">{stat.value}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {stat.trend === "up" ? (
                  <TrendingUp className="mr-1 h-3 w-3 text-primary" />
                ) : (
                  <TrendingDown className="mr-1 h-3 w-3 text-destructive" />
                )}
                <span className={stat.trend === "up" ? "text-primary" : "text-destructive"}>{stat.change}</span>
                <span className="ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Low Stock Alert */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Low Stock Alert
            </CardTitle>
            <CardDescription>Items that need immediate attention</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {lowStockItems.map((item) => (
              <div key={item.sku} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex-1">
                  <div className="font-medium text-card-foreground">{item.name}</div>
                  <div className="text-sm text-muted-foreground">SKU: {item.sku}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm font-medium text-card-foreground">
                      {item.current} / {item.minimum}
                    </div>
                    <Progress value={(item.current / item.minimum) * 100} className="w-16 h-2" />
                  </div>
                  <Badge className={item.status === "critical" ? "inventory-status-critical" : "inventory-status-low"}>
                    {item.status}
                  </Badge>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full bg-transparent">
              View All Low Stock Items
            </Button>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Recent Transactions</CardTitle>
            <CardDescription>Latest inventory movementszzzxxx</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex-1">
                  <div className="font-medium text-card-foreground">{transaction.item}</div>
                  <div className="text-sm text-muted-foreground">
                    {transaction.id} • {transaction.time}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline">{transaction.type}</Badge>
                  <div className={`font-medium ${transaction.quantity > 0 ? "text-primary" : "text-destructive"}`}>
                    {transaction.quantity > 0 ? "+" : ""}
                    {transaction.quantity}
                  </div>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full bg-transparent">
              View All Transactions
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
