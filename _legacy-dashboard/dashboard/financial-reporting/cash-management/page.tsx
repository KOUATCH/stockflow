"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Wallet,
  Building,
  Calendar,
  AlertTriangle,
  CheckCircle
} from "lucide-react"
import { useState } from "react"

export default function CashManagementPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("This Month")

  const cashAccounts = [
    {
      id: "CASH-001",
      name: "Primary Checking Account",
      bank: "First National Bank",
      balance: 245678.90,
      currency: "USD",
      status: "Active",
      lastReconciled: "2024-10-08"
    },
    {
      id: "CASH-002",
      name: "Operating Account",
      bank: "Metro Bank",
      balance: 89234.56,
      currency: "USD",
      status: "Active",
      lastReconciled: "2024-10-07"
    },
    {
      id: "CASH-003",
      name: "Petty Cash",
      bank: "Cash on Hand",
      balance: 2500.00,
      currency: "USD",
      status: "Active",
      lastReconciled: "2024-10-09"
    },
    {
      id: "CASH-004",
      name: "Savings Account",
      bank: "First National Bank",
      balance: 150000.00,
      currency: "USD",
      status: "Active",
      lastReconciled: "2024-10-05"
    }
  ]

  const cashFlowData = [
    {
      date: "2024-10-09",
      type: "Inflow",
      description: "Customer Payment - INV-2024-001",
      amount: 15678.90,
      account: "Primary Checking",
      category: "Sales Revenue"
    },
    {
      date: "2024-10-09",
      type: "Outflow",
      description: "Supplier Payment - SUP-456",
      amount: -8234.50,
      account: "Primary Checking",
      category: "Cost of Goods"
    },
    {
      date: "2024-10-08",
      type: "Inflow",
      description: "Sales Deposit",
      amount: 23445.67,
      account: "Operating Account",
      category: "Sales Revenue"
    },
    {
      date: "2024-10-08",
      type: "Outflow",
      description: "Rent Payment",
      amount: -4500.00,
      account: "Primary Checking",
      category: "Operating Expenses"
    }
  ]

  const cashPosition = {
    totalCash: 487413.46,
    monthlyChange: 23456.78,
    changePercent: 5.1,
    projectedCash: 512000.00,
    cashTargets: {
      minimum: 200000,
      optimal: 400000,
      maximum: 600000
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return <Badge className="bg-green-100 text-green-700 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>
      case "Inactive":
        return <Badge className="bg-gray-100 text-gray-700 border-gray-200">Inactive</Badge>
      case "Reconciling":
        return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200"><AlertTriangle className="w-3 h-3 mr-1" />Reconciling</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getCashPositionColor = () => {
    if (cashPosition.totalCash < cashPosition.cashTargets.minimum) return "text-red-600"
    if (cashPosition.totalCash > cashPosition.cashTargets.maximum) return "text-yellow-600"
    return "text-green-600"
  }

  const getCashPositionProgress = () => {
    const { minimum, maximum } = cashPosition.cashTargets
    const range = maximum - minimum
    const position = Math.max(0, Math.min(100, ((cashPosition.totalCash - minimum) / range) * 100))
    return position
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Cash Management</h1>
          <p className="text-muted-foreground mt-2">
            Monitor cash flow, manage liquidity, and optimize cash positions
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calendar className="w-4 h-4 mr-2" />
            Cash Forecast
          </Button>
          <Button>
            <DollarSign className="w-4 h-4 mr-2" />
            Reconcile Accounts
          </Button>
        </div>
      </div>

      {/* Cash Position Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              Total Cash Position
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getCashPositionColor()}`}>
              {formatCurrency(cashPosition.totalCash)}
            </div>
            <div className="flex items-center gap-1 mt-2">
              {cashPosition.changePercent > 0 ? (
                <TrendingUp className="w-4 h-4 text-green-600" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-600" />
              )}
              <span className={`text-sm font-medium ${cashPosition.changePercent > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {cashPosition.changePercent > 0 ? '+' : ''}{cashPosition.changePercent}%
              </span>
              <span className="text-sm text-muted-foreground">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ArrowUpRight className="w-4 h-4" />
              Monthly Change
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(cashPosition.monthlyChange)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Net cash flow this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Projected Cash
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(cashPosition.projectedCash)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              End of month projection
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Cash Target Range</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Progress value={getCashPositionProgress()} className="w-full" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{formatCurrency(cashPosition.cashTargets.minimum)}</span>
                <span>{formatCurrency(cashPosition.cashTargets.maximum)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="accounts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="accounts">Cash Accounts</TabsTrigger>
          <TabsTrigger value="flow">Cash Flow</TabsTrigger>
          <TabsTrigger value="forecast">Cash Forecast</TabsTrigger>
          <TabsTrigger value="reconciliation">Reconciliation</TabsTrigger>
        </TabsList>

        <TabsContent value="accounts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cash Accounts</CardTitle>
              <CardDescription>
                Monitor all cash and bank accounts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Account</TableHead>
                    <TableHead>Bank</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Reconciled</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cashAccounts.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{account.name}</div>
                          <div className="text-sm text-muted-foreground">{account.id}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4" />
                          {account.bank}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono font-medium">
                        {formatCurrency(account.balance)}
                      </TableCell>
                      <TableCell>{getStatusBadge(account.status)}</TableCell>
                      <TableCell className="text-sm">{account.lastReconciled}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="flow" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Cash Flow</CardTitle>
              <CardDescription>
                Track cash inflows and outflows
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Account</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cashFlowData.map((transaction, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-mono text-sm">{transaction.date}</TableCell>
                      <TableCell>
                        <Badge variant={transaction.type === "Inflow" ? "default" : "secondary"}>
                          {transaction.type === "Inflow" ? (
                            <ArrowUpRight className="w-3 h-3 mr-1" />
                          ) : (
                            <ArrowDownRight className="w-3 h-3 mr-1" />
                          )}
                          {transaction.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell>{transaction.account}</TableCell>
                      <TableCell>{transaction.category}</TableCell>
                      <TableCell className={`font-mono font-medium ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(Math.abs(transaction.amount))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forecast" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cash Flow Forecast</CardTitle>
              <CardDescription>
                Projected cash flow based on historical data and planned activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Cash flow forecasting will be available here</p>
                <p className="text-sm">Predict future cash positions and identify potential shortfalls</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reconciliation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bank Reconciliation</CardTitle>
              <CardDescription>
                Reconcile bank statements with book records
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Bank reconciliation tools will be available here</p>
                <p className="text-sm">Import bank statements and match transactions</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}