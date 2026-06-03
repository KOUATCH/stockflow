"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, DollarSign, Receipt, Settings } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-foreground">Modern POS System</h1>
          <p className="text-xl text-muted-foreground">
            Complete point-of-sale solution with integrated cash drawer management
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-card border-border hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <Receipt className="h-5 w-5 text-primary" />
                POS Terminal
              </CardTitle>
              <CardDescription>Process sales, manage inventory, and handle customer transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                <Link href="/pos">
                  Open POS Terminal
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-card border-border hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <DollarSign className="h-5 w-5 text-accent" />
                Cash Drawer Management
              </CardTitle>
              <CardDescription>Monitor cash flow, manage drawer operations, and track transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                <Link href="/dashboard/app/sales/pos/cash-drawer">
                  Manage Cash Drawers
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-card border-border hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <BarChart3 className="h-5 w-5 text-secondary" />
                Reports & Analytics
              </CardTitle>
              <CardDescription>View sales reports, inventory analytics, and business insights</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90" disabled>
                Coming Soon
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">Today&apos;s Sales</CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">$2,450.75</div>
              <p className="text-xs text-muted-foreground">+12% from yesterday</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">Transactions</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">18</div>
              <p className="text-xs text-muted-foreground">+3 from yesterday</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">Cash Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary">$850.25</div>
              <p className="text-xs text-muted-foreground">Across all drawers</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">Avg. Transaction</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">$136.15</div>
              <p className="text-xs text-muted-foreground">+5% from yesterday</p>
            </CardContent>
          </Card>
        </div>

        {/* Features List */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">System Features</CardTitle>
            <CardDescription>Comprehensive POS solution with modern design</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-card-foreground">POS Terminal</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Real-time inventory tracking</li>
                  <li>• Multiple payment methods</li>
                  <li>• Customer management</li>
                  <li>• Receipt generation</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-card-foreground">Cash Drawer System</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Real-time balance tracking</li>
                  <li>• Transaction logging</li>
                  <li>• Variance detection</li>
                  <li>• Multi-drawer support</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}