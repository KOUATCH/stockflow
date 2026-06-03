"use client"

import { useState } from "react"

import { AlertCenter } from "@/components/cashSystem/alerts/alert-center"
import { RealTimeStatusBar } from "@/components/cashSystem/alerts/real-time-status-bar"
import { CashDrawerManager } from "@/components/cashSystem/cash-drawer/cash-drawer-manager"
import { AnalyticsDashboard } from "@/components/cashSystem/reports/analytics-dashboard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertTriangle, BarChart3, CaseLower as CashRegister, DollarSign, TrendingUp, Users } from "lucide-react"
import { useClientAuth } from "@/hooks/useClientAuth"
import { PosTerminalRecent } from "@/components/system/sales/PosTerminalRecent"

export default function HomePage() {
  // const { user, isAuthenticated } = useAuth()
  const [activeTab, setActiveTab] = useState("overview")
  const { session, user, organizationId } = useClientAuth()

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <CashRegister className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900">POS Cash Drawer System</h1>
            <p className="text-gray-600 mt-2">Secure access required</p>
          </div>
          {/* <LoginForm /> */}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <CashRegister className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">POS Cash Drawer System</h1>
          </div>
          <div className="flex items-center space-x-4">
            <RealTimeStatusBar />
            {/* <UserMenu user={user} /> */}
          </div>
        </div>
      </header>

      <main className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="pos" className="flex items-center space-x-2">
              <CashRegister className="h-4 w-4" />
              <span>POS Terminal</span>
            </TabsTrigger>
            <TabsTrigger value="cash-drawer" className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4" />
              <span>Cash Drawer</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>Reports</span>
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4" />
              <span>Alerts</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$2,847.50</div>
                  <p className="text-xs text-muted-foreground">+12.5% from yesterday</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Cash Balance</CardTitle>
                  <CashRegister className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$1,245.75</div>
                  <p className="text-xs text-muted-foreground">Expected: $1,250.00</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Transactions</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">127</div>
                  <p className="text-xs text-muted-foreground">+8 from last hour</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3</div>
                  <p className="text-xs text-muted-foreground">2 cashiers, 1 manager</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common tasks and operations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button onClick={() => setActiveTab("pos")} className="w-full justify-start" variant="outline">
                    <CashRegister className="h-4 w-4 mr-2" />
                    Open POS Terminal
                  </Button>
                  <Button
                    onClick={() => setActiveTab("cash-drawer")}
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    Manage Cash Drawer
                  </Button>
                  <Button onClick={() => setActiveTab("reports")} className="w-full justify-start" variant="outline">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Reports
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Status</CardTitle>
                  <CardDescription>Current system health and alerts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Cash Drawer Status</span>
                      <span className="text-sm font-medium text-green-600">Open & Active</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Network Connection</span>
                      <span className="text-sm font-medium text-green-600">Connected</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Last Backup</span>
                      <span className="text-sm font-medium text-gray-600">2 minutes ago</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Active Alerts</span>
                      <span className="text-sm font-medium text-yellow-600">2 warnings</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="pos">
            <PosTerminalRecent />
          </TabsContent>

          <TabsContent value="cash-drawer">
            <CashDrawerManager
              terminalId={""}
              userId={user?.id ?? ""}
              locationId={""}
              organizationId={organizationId ?? ""}
            />
          </TabsContent>

          <TabsContent value="reports">
            <AnalyticsDashboard locationId={""} organizationId={organizationId ?? ""} />
          </TabsContent>

          <TabsContent value="alerts">
            <AlertCenter />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
