"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  Users,
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle,
  Mail,
  Phone,
  MapPin,
  Calendar,
  TrendingUp,
  TrendingDown,
  FileText,
  CreditCard,
  Building,
  Target,
  Star,
  Activity,
  BarChart3
} from "lucide-react"

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  address: string
  totalOwed: number
  currentAmount: number
  overdueAmount: number
  creditLimit: number
  paymentHistory: number
  riskScore: "LOW" | "MEDIUM" | "HIGH"
  locations: Array<{
    locationId: string
    locationName: string
    amount: number
    invoices: number
    status: string
  }>
  transactions: Array<{
    id: string
    date: string
    invoice: string
    amount: number
    description: string
    dueDate: string
    status: string
    location: string
  }>
  metrics: {
    avgPaymentDays: number
    utilizationRate: number
    totalTransactions: number
    lastPaymentDate: string
    registrationDate: string
  }
}

interface CustomerDetailsModalProps {
  customer: Customer | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

const formatPercentage = (value: number) => `${value.toFixed(1)}%`

const getRiskColor = (risk: string) => {
  switch (risk) {
    case "LOW":
      return "text-green-700 bg-green-50 border-green-200"
    case "MEDIUM":
      return "text-yellow-700 bg-yellow-50 border-yellow-200"
    case "HIGH":
      return "text-red-700 bg-red-50 border-red-200"
    default:
      return "text-gray-700 bg-gray-50 border-gray-200"
  }
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "CURRENT":
      return <Badge className="bg-green-100 text-green-800 border-green-200">Current</Badge>
    case "OVERDUE":
      return <Badge className="bg-red-100 text-red-800 border-red-200">Overdue</Badge>
    case "PAID":
      return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Paid</Badge>
    default:
      return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Unknown</Badge>
  }
}

export function CustomerDetailsModal({ customer, open, onOpenChange }: CustomerDetailsModalProps) {
  const [activeTab, setActiveTab] = useState("overview")

  if (!customer) return null

  const creditUtilization = (customer.totalOwed / customer.creditLimit) * 100
  const collectionEfficiency = customer.paymentHistory * 100

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
        <DialogHeader className="pb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold">{customer.name}</DialogTitle>
                <DialogDescription className="text-lg mt-1">
                  Comprehensive customer analysis and transaction history
                </DialogDescription>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className={getRiskColor(customer.riskScore)}>
                    {customer.riskScore} Risk
                  </Badge>
                  <Badge variant="outline">
                    ID: {customer.id}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-slate-900 dark:text-white">
                {formatCurrency(customer.totalOwed)}
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Total Outstanding</p>
            </div>
          </div>
        </DialogHeader>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/20">
                  <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Credit Limit</p>
                  <p className="text-xl font-bold">{formatCurrency(customer.creditLimit)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                  <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Utilization</p>
                  <p className="text-xl font-bold">{formatPercentage(creditUtilization)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-teal-100 dark:bg-teal-900/20">
                  <Clock className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Avg Payment Days</p>
                  <p className="text-xl font-bold">{customer.metrics.avgPaymentDays}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/20">
                  <Star className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Payment Score</p>
                  <p className="text-xl font-bold">{formatPercentage(collectionEfficiency)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact Information */}
        <Card className="mb-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-slate-400" />
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Email</p>
                  <p className="font-medium">{customer.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-slate-400" />
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Phone</p>
                  <p className="font-medium">{customer.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-slate-400" />
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Address</p>
                  <p className="font-medium">{customer.address}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Credit Analysis */}
        <Card className="mb-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Credit Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Credit Utilization</span>
                  <span>{formatPercentage(creditUtilization)}</span>
                </div>
                <Progress value={creditUtilization} className="h-2" />
                <p className="text-xs text-slate-600 mt-1">
                  {formatCurrency(customer.totalOwed)} of {formatCurrency(customer.creditLimit)} used
                </p>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Collection Efficiency</span>
                  <span>{formatPercentage(collectionEfficiency)}</span>
                </div>
                <Progress value={collectionEfficiency} className="h-2" />
                <p className="text-xs text-slate-600 mt-1">
                  Historical payment performance
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="locations">Locations</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">Account Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Current Amount:</span>
                    <span className="font-bold text-green-600">{formatCurrency(customer.currentAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Overdue Amount:</span>
                    <span className="font-bold text-red-600">{formatCurrency(customer.overdueAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Total Transactions:</span>
                    <span className="font-bold">{customer.metrics.totalTransactions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Customer Since:</span>
                    <span className="font-medium">{new Date(customer.metrics.registrationDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Last Payment:</span>
                    <span className="font-medium">{new Date(customer.metrics.lastPaymentDate).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">Payment Patterns</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        {customer.metrics.avgPaymentDays <= 30 ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-yellow-500" />
                        )}
                        <span className="font-medium">Payment Timing</span>
                      </div>
                      <span className="text-sm">
                        {customer.metrics.avgPaymentDays <= 30 ? "Excellent" : "Needs Attention"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        {customer.paymentHistory >= 0.9 ? (
                          <TrendingUp className="w-5 h-5 text-green-500" />
                        ) : (
                          <TrendingDown className="w-5 h-5 text-red-500" />
                        )}
                        <span className="font-medium">Payment Reliability</span>
                      </div>
                      <span className="text-sm">
                        {customer.paymentHistory >= 0.9 ? "Reliable" : "Inconsistent"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4">
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Recent Transactions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {customer.transactions.map((transaction) => (
                    <div key={transaction.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium text-lg">{transaction.invoice}</p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">{transaction.description}</p>
                          <p className="text-xs text-slate-500 mt-1">
                            {transaction.location} • {new Date(transaction.date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold">{formatCurrency(transaction.amount)}</p>
                          {getStatusBadge(transaction.status)}
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-400">
                          Due: {new Date(transaction.dueDate).toLocaleDateString()}
                        </span>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Mail className="w-4 h-4 mr-2" />
                            Send Reminder
                          </Button>
                          <Button size="sm" variant="outline">
                            <CreditCard className="w-4 h-4 mr-2" />
                            Record Payment
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="locations" className="space-y-4">
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Location Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {customer.locations.map((location) => (
                    <div key={location.locationId} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-medium text-lg">{location.locationName}</h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400">{location.invoices} invoices</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold">{formatCurrency(location.amount)}</p>
                          {getStatusBadge(location.status)}
                        </div>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${(location.amount / customer.totalOwed) * 100}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        {((location.amount / customer.totalOwed) * 100).toFixed(1)}% of total
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}