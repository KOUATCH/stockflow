"use client"

import type React from "react"

import { AlertCenter } from "@/components/alerts/alert-center"
import { RealTimeStatusBar } from "@/components/alerts/real-time-status-bar"
import { LoginForm } from "@/components/auth/login-form"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { UserMenu } from "@/components/auth/user-menu"
import { CashDrawerManager } from "@/components/cash-drawer/cash-drawer-manager"
import { AnalyticsDashboard } from "@/components/reports/analytics-dashboard"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/hooks/use-auth"
import {
  AlertTriangle,
  BarChart3,
  Clock,
  CreditCard,
  DollarSign,
  Settings,
  Store,
  TrendingUp,
  Users,
} from "lucide-react"
import { useState } from "react"

interface MainLayoutProps {
  children?: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const [activeTab, setActiveTab] = useState("pos")
  const { user, isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoginForm />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Store className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-semibold">POS Cash Management System</h1>
            </div>
            <Badge variant="secondary" className="text-xs">
              {user?.location?.name || "Main Location"}
            </Badge>
          </div>

          <div className="flex items-center gap-4">
            <RealTimeStatusBar />
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar Navigation */}
        <aside className="w-64 border-r bg-card p-4">
          <nav className="space-y-2">
            <Button
              variant={activeTab === "pos" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("pos")}
            >
              <CreditCard className="mr-2 h-4 w-4" />
              POS Terminal
            </Button>

            <Button
              variant={activeTab === "cash-drawer" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("cash-drawer")}
            >
              <DollarSign className="mr-2 h-4 w-4" />
              Cash Drawer
            </Button>

            <Button
              variant={activeTab === "reports" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("reports")}
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              Reports & Analytics
            </Button>

            <Button
              variant={activeTab === "alerts" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("alerts")}
            >
              <AlertTriangle className="mr-2 h-4 w-4" />
              Alerts & Monitoring
            </Button>

            {(user?.role === "ADMIN" || user?.role === "MANAGER") && (
              <Button
                variant={activeTab === "management" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("management")}
              >
                <Settings className="mr-2 h-4 w-4" />
                Management
              </Button>
            )}
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto">
          {activeTab === "pos" && (
            <div className="p-6">
              <pOSStation />
            </div>
          )}

          {activeTab === "cash-drawer" && (
            <div className="p-6">
              <CashDrawerManager />
            </div>
          )}

          {activeTab === "reports" && (
            <div className="p-6">
              <AnalyticsDashboard />
            </div>
          )}

          {activeTab === "alerts" && (
            <div className="p-6">
              <AlertCenter />
            </div>
          )}

          {activeTab === "management" && (
            <ProtectedRoute requiredRoles={["ADMIN", "MANAGER"]}>
              <div className="p-6">
                <ManagementDashboard />
              </div>
            </ProtectedRoute>
          )}
        </main>
      </div>
    </div>
  )
}

function ManagementDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Management Dashboard</h2>
        <Badge variant="outline">Admin Access</Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">+2 from yesterday</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cash</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$2,847.50</div>
            <p className="text-xs text-muted-foreground">Across all drawers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Sales</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$12,234</div>
            <p className="text-xs text-muted-foreground">+15% from yesterday</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Session Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.2h</div>
            <p className="text-xs text-muted-foreground">Per active session</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="locations">Locations</TabsTrigger>
          <TabsTrigger value="terminals">Terminals</TabsTrigger>
          <TabsTrigger value="settings">System Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: "John Doe", role: "CASHIER", status: "Active", session: "2h 15m" },
                  { name: "Jane Smith", role: "MANAGER", status: "Active", session: "4h 32m" },
                  { name: "Mike Johnson", role: "CASHIER", status: "Inactive", session: "-" },
                ].map((user, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <Users className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={user.status === "Active" ? "default" : "secondary"}>{user.status}</Badge>
                      <span className="text-sm text-muted-foreground">{user.session}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="locations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Store Locations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Location management interface would be implemented here using the imported location hooks.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="terminals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>POS Terminals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { id: "TERM-001", location: "Main Counter", status: "Online", cashier: "John Doe" },
                  { id: "TERM-002", location: "Express Lane", status: "Online", cashier: "Jane Smith" },
                  { id: "TERM-003", location: "Customer Service", status: "Offline", cashier: "-" },
                ].map((terminal, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <CreditCard className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium">{terminal.id}</p>
                        <p className="text-sm text-muted-foreground">{terminal.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={terminal.status === "Online" ? "default" : "secondary"}>{terminal.status}</Badge>
                      <span className="text-sm text-muted-foreground">{terminal.cashier}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Cash Drawer Variance Threshold</p>
                    <p className="text-sm text-muted-foreground">Alert when variance exceeds this amount</p>
                  </div>
                  <Badge variant="outline">$5.00</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Session Timeout</p>
                    <p className="text-sm text-muted-foreground">Auto-close sessions after inactivity</p>
                  </div>
                  <Badge variant="outline">8 hours</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Low Stock Alert</p>
                    <p className="text-sm text-muted-foreground">Alert when inventory falls below threshold</p>
                  </div>
                  <Badge variant="outline">10 units</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
