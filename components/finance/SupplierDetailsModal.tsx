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
  Building2,
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
  ShoppingCart,
  Target,
  Star,
  Activity,
  BarChart3,
  Package
} from "lucide-react"

interface Supplier {
  id: string
  name: string
  email: string
  phone: string
  address: string
  totalOwed: number
  locations: Array<{
    locationId: string
    locationName: string
    amount: number
    invoices: number
    status: string
  }>
  metrics: {
    avgPaymentDays: number
    creditLimit: number
    utilizationRate: number
    paymentHistory: number
    riskScore: "LOW" | "MEDIUM" | "HIGH"
  }
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
}

interface SupplierDetailsModalProps {
  supplier: Supplier | null
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
    case "PENDING":
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>
    case "PAID":
      return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Paid</Badge>
    default:
      return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Unknown</Badge>
  }
}

export function SupplierDetailsModal({ supplier, open, onOpenChange }: SupplierDetailsModalProps) {
  const [activeTab, setActiveTab] = useState("overview")

  if (!supplier) return null

  const creditUtilization = (supplier.totalOwed / supplier.metrics.creditLimit) * 100
  const paymentReliability = supplier.metrics.paymentHistory * 100

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
        <DialogHeader className="pb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 shadow-lg">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold">{supplier.name}</DialogTitle>
                <DialogDescription className="text-lg mt-1">
                  Comprehensive supplier analysis and payment history
                </DialogDescription>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className={getRiskColor(supplier.metrics.riskScore)}>
                    {supplier.metrics.riskScore} Risk
                  </Badge>
                  <Badge variant="outline">
                    ID: {supplier.id}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-slate-900 dark:text-white">
                {formatCurrency(supplier.totalOwed)}
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Total Outstanding</p>
            </div>
          </div>
        </DialogHeader>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="relative overflow-hidden border-2 border-teal-300/30 bg-gradient-to-br from-teal-400/20 via-cyan-400/10 to-emerald-400/20 backdrop-blur-xl shadow-2xl">
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-white/20 to-transparent rounded-bl-full" />
            <CardContent className="p-4 relative z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-teal-500/20">
                  <DollarSign className="w-5 h-5 text-teal-700" />
                </div>
                <div>
                  <p className="text-sm text-teal-600/80 font-medium">Credit Limit</p>
                  <p className="text-xl font-bold text-teal-700">{formatCurrency(supplier.metrics.creditLimit)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-2 border-teal-300/30 bg-gradient-to-br from-teal-400/20 via-cyan-400/10 to-blue-400/20 backdrop-blur-xl shadow-2xl">
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-white/20 to-transparent rounded-bl-full" />
            <CardContent className="p-4 relative z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-teal-500/20">
                  <Target className="w-5 h-5 text-teal-700" />
                </div>
                <div>
                  <p className="text-sm text-teal-600/80 font-medium">Utilization</p>
                  <p className="text-xl font-bold text-teal-700">{formatPercentage(creditUtilization)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-2 border-amber-300/30 bg-gradient-to-br from-amber-400/20 via-yellow-400/10 to-orange-400/20 backdrop-blur-xl shadow-2xl">
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-white/20 to-transparent rounded-bl-full" />
            <CardContent className="p-4 relative z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/20">
                  <Clock className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <p className="text-sm text-amber-600/80 font-medium">Avg Payment Days</p>
                  <p className="text-xl font-bold text-amber-700">{supplier.metrics.avgPaymentDays}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-2 border-emerald-300/30 bg-gradient-to-br from-emerald-400/20 via-green-400/10 to-teal-400/20 backdrop-blur-xl shadow-2xl">
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-white/20 to-transparent rounded-bl-full" />
            <CardContent className="p-4 relative z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/20">
                  <Star className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <p className="text-sm text-emerald-600/80 font-medium">Payment Score</p>
                  <p className="text-xl font-bold text-emerald-700">{formatPercentage(paymentReliability)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact Information */}
        <Card className="mb-6 relative overflow-hidden border-2 border-slate-300/30 bg-gradient-to-br from-slate-400/20 via-gray-400/10 to-zinc-400/20 backdrop-blur-xl shadow-2xl">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/20 to-transparent rounded-bl-full" />
          <CardHeader className="relative z-10">
            <CardTitle className="flex items-center gap-2 text-slate-700">
              <Building2 className="w-5 h-5" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-slate-400" />
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Email</p>
                  <p className="font-medium">{supplier.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-slate-400" />
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Phone</p>
                  <p className="font-medium">{supplier.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-slate-400" />
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Address</p>
                  <p className="font-medium">{supplier.address}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Credit Analysis */}
        <Card className="mb-6 relative overflow-hidden border-2 border-teal-300/30 bg-gradient-to-br from-teal-400/20 via-blue-400/10 to-cyan-400/20 backdrop-blur-xl shadow-2xl">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/20 to-transparent rounded-bl-full" />
          <CardHeader className="relative z-10">
            <CardTitle className="flex items-center gap-2 text-teal-700">
              <BarChart3 className="w-5 h-5" />
              Payment Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Credit Utilization</span>
                  <span>{formatPercentage(creditUtilization)}</span>
                </div>
                <Progress value={creditUtilization} className="h-2" />
                <p className="text-xs text-slate-600 mt-1">
                  {formatCurrency(supplier.totalOwed)} of {formatCurrency(supplier.metrics.creditLimit)} used
                </p>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Payment Reliability</span>
                  <span>{formatPercentage(paymentReliability)}</span>
                </div>
                <Progress value={paymentReliability} className="h-2" />
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
              <Card className="relative overflow-hidden border-2 border-cyan-300/30 bg-gradient-to-br from-cyan-400/20 via-blue-400/10 to-teal-400/20 backdrop-blur-xl shadow-2xl">
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-white/20 to-transparent rounded-bl-full" />
                <CardHeader className="relative z-10">
                  <CardTitle className="text-lg text-cyan-700">Account Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 relative z-10">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Total Outstanding:</span>
                    <span className="font-bold text-cyan-700">{formatCurrency(supplier.totalOwed)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Payment Terms:</span>
                    <span className="font-medium">Net {supplier.metrics.avgPaymentDays}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Locations Served:</span>
                    <span className="font-bold">{supplier.locations.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Credit Available:</span>
                    <span className="font-medium text-green-600">
                      {formatCurrency(supplier.metrics.creditLimit - supplier.totalOwed)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden border-2 border-emerald-300/30 bg-gradient-to-br from-emerald-400/20 via-green-400/10 to-teal-400/20 backdrop-blur-xl shadow-2xl">
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-white/20 to-transparent rounded-bl-full" />
                <CardHeader className="relative z-10">
                  <CardTitle className="text-lg text-emerald-700">Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        {supplier.metrics.avgPaymentDays <= 30 ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-yellow-500" />
                        )}
                        <span className="font-medium">Payment Timing</span>
                      </div>
                      <span className="text-sm">
                        {supplier.metrics.avgPaymentDays <= 30 ? "Excellent" : "Needs Attention"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        {supplier.metrics.paymentHistory >= 0.9 ? (
                          <TrendingUp className="w-5 h-5 text-green-500" />
                        ) : (
                          <TrendingDown className="w-5 h-5 text-red-500" />
                        )}
                        <span className="font-medium">Payment Reliability</span>
                      </div>
                      <span className="text-sm">
                        {supplier.metrics.paymentHistory >= 0.9 ? "Reliable" : "Inconsistent"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4">
            <Card className="relative overflow-hidden border-2 border-slate-300/30 bg-gradient-to-br from-slate-400/20 via-gray-400/10 to-zinc-400/20 backdrop-blur-xl shadow-2xl">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/20 to-transparent rounded-bl-full" />
              <CardHeader className="relative z-10">
                <CardTitle className="flex items-center gap-2 text-slate-700">
                  <FileText className="w-5 h-5" />
                  Recent Transactions
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="space-y-3">
                  {supplier.transactions.map((transaction) => (
                    <div key={transaction.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-white/50 transition-colors">
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
                            <CreditCard className="w-4 h-4 mr-2" />
                            Pay Now
                          </Button>
                          <Button size="sm" variant="outline">
                            <Calendar className="w-4 h-4 mr-2" />
                            Schedule
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
            <Card className="relative overflow-hidden border-2 border-teal-300/30 bg-gradient-to-br from-teal-400/20 via-cyan-400/10 to-blue-400/20 backdrop-blur-xl shadow-2xl">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/20 to-transparent rounded-bl-full" />
              <CardHeader className="relative z-10">
                <CardTitle className="flex items-center gap-2 text-teal-700">
                  <MapPin className="w-5 h-5" />
                  Location Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {supplier.locations.map((location) => (
                    <div key={location.locationId} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-white/50">
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
                          className="bg-teal-500 h-2 rounded-full"
                          style={{ width: `${(location.amount / supplier.totalOwed) * 100}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        {((location.amount / supplier.totalOwed) * 100).toFixed(1)}% of total
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