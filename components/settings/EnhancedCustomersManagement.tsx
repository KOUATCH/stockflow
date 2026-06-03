"use client"

import React, { useState, useMemo } from "react"
import {
  Plus,
  Users,
  UserCheck,
  Crown,
  DollarSign,
  ShoppingCart,
  Calendar,
  Search,
  Filter,
  Download,
  Upload,
  Mail,
  MessageSquare,
  Gift,
  Target,
  TrendingUp,
  BarChart3,
  RefreshCw,
  Settings,
  Star,
  Award,
  Zap,
  Activity
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DataTable } from "@/components/ui/data-table"
import { enhancedCustomersColumns, EnhancedCustomer } from "@/_legacy-dashboard/dashboard/settings/customers/enhanced-columns"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface EnhancedCustomersManagementProps {
  data: EnhancedCustomer[]
  organizationId: string
}

// Mock data generator for demonstration
const generateMockCustomers = (count: number): EnhancedCustomer[] => {
  const tiers = ["Bronze", "Silver", "Gold", "Platinum"]
  const statuses = ["Active", "Inactive", "Blocked"]
  const sources = ["Website", "Store", "Referral", "Advertisement", "Other"]
  const genders = ["Male", "Female", "Other"]
  const contactMethods = ["Email", "Phone", "SMS"]

  return Array.from({ length: count }, (_, i) => ({
    id: `customer-${i + 1}`,
    firstName: `Customer${i + 1}`,
    lastName: `LastName${i + 1}`,
    email: `customer${i + 1}@example.com`,
    phone: `+1-555-${String(i).padStart(4, '0')}`,
    address: `${i + 1}23 Main St`,
    city: "Springfield",
    state: "IL",
    country: "USA",
    postalCode: `6200${i % 10}`,
    dateOfBirth: new Date(1980 + (i % 40), i % 12, (i % 28) + 1),
    gender: genders[i % 3] as "Male" | "Female" | "Other",
    totalOrders: Math.floor(Math.random() * 50) + 1,
    totalSpent: Math.floor(Math.random() * 5000) + 100,
    averageOrderValue: Math.floor(Math.random() * 200) + 50,
    lastOrderDate: new Date(Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000),
    customerTier: tiers[i % 4] as "Bronze" | "Silver" | "Gold" | "Platinum",
    loyaltyPoints: Math.floor(Math.random() * 1000),
    isVip: Math.random() > 0.8,
    status: statuses[i % 3] as "Active" | "Inactive" | "Blocked",
    joinedDate: new Date(Date.now() - Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000),
    notes: i % 5 === 0 ? `Customer note ${i + 1}` : undefined,
    creditLimit: Math.floor(Math.random() * 10000),
    outstandingBalance: Math.floor(Math.random() * 1000),
    lifetimeValue: Math.floor(Math.random() * 10000) + 500,
    preferredContactMethod: contactMethods[i % 3] as "Email" | "Phone" | "SMS",
    marketingOptIn: Math.random() > 0.3,
    lastContactDate: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
    source: sources[i % 5] as "Website" | "Store" | "Referral" | "Advertisement" | "Other",
    organizationId: "org-1",
    createdAt: new Date(Date.now() - Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
  }))
}

export default function EnhancedCustomersManagement({
  data,
  organizationId,
}: EnhancedCustomersManagementProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [tierFilter, setTierFilter] = useState("all")
  const [sourceFilter, setSourceFilter] = useState("all")
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Use mock data if no real data provided
  const customersData = data.length > 0 ? data : generateMockCustomers(50)

  // Filter and search customers
  const filteredCustomers = useMemo(() => {
    return customersData.filter((customer) => {
      const matchesSearch =
        !searchQuery ||
        customer.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.phone?.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = statusFilter === "all" || customer.status === statusFilter
      const matchesTier = tierFilter === "all" || customer.customerTier === tierFilter
      const matchesSource = sourceFilter === "all" || customer.source === sourceFilter

      return matchesSearch && matchesStatus && matchesTier && matchesSource
    })
  }, [customersData, searchQuery, statusFilter, tierFilter, sourceFilter])

  // Calculate advanced statistics
  const stats = useMemo(() => {
    const total = filteredCustomers.length
    const active = filteredCustomers.filter(c => c.status === "Active").length
    const vip = filteredCustomers.filter(c => c.isVip).length
    const totalRevenue = filteredCustomers.reduce((sum, c) => sum + c.totalSpent, 0)
    const avgOrderValue = filteredCustomers.reduce((sum, c) => sum + c.averageOrderValue, 0) / total
    const totalOrders = filteredCustomers.reduce((sum, c) => sum + c.totalOrders, 0)
    const avgLifetimeValue = filteredCustomers.reduce((sum, c) => sum + c.lifetimeValue, 0) / total

    return {
      total,
      active,
      vip,
      totalRevenue,
      avgOrderValue: isNaN(avgOrderValue) ? 0 : avgOrderValue,
      totalOrders,
      avgLifetimeValue: isNaN(avgLifetimeValue) ? 0 : avgLifetimeValue,
      activeRate: total > 0 ? (active / total) * 100 : 0,
      vipRate: total > 0 ? (vip / total) * 100 : 0,
    }
  }, [filteredCustomers])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsRefreshing(false)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Advanced Analytics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-900 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Total</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.total}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950 dark:to-emerald-900 border-green-200 dark:border-green-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700 dark:text-green-300">Active Rate</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">{stats.activeRate.toFixed(1)}%</p>
              </div>
              <UserCheck className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-950 dark:to-pink-900 border-purple-200 dark:border-purple-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700 dark:text-purple-300">VIP Rate</p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{stats.vipRate.toFixed(1)}%</p>
              </div>
              <Crown className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-emerald-950 dark:to-teal-900 border-emerald-200 dark:border-emerald-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Revenue</p>
                <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                  {formatCurrency(stats.totalRevenue).replace(/\.\d{2}/, '').replace('$', '$').slice(0, 6)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-amber-100 dark:from-orange-950 dark:to-amber-900 border-orange-200 dark:border-orange-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700 dark:text-orange-300">Avg LTV</p>
                <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                  {formatCurrency(stats.avgLifetimeValue).replace(/\.\d{2}/, '').replace('$', '$').slice(0, 6)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-slate-200 dark:border-slate-700">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 border-b">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Users className="h-5 w-5" />
                Customer Database ({stats.total})
              </CardTitle>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Manage and analyze your customer relationships
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {/* Filters and Search */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search customers by name, email, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="Blocked">Blocked</SelectItem>
                </SelectContent>
              </Select>

              <Select value={tierFilter} onValueChange={setTierFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Tier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tiers</SelectItem>
                  <SelectItem value="Bronze">Bronze</SelectItem>
                  <SelectItem value="Silver">Silver</SelectItem>
                  <SelectItem value="Gold">Gold</SelectItem>
                  <SelectItem value="Platinum">Platinum</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="Website">Website</SelectItem>
                  <SelectItem value="Store">Store</SelectItem>
                  <SelectItem value="Referral">Referral</SelectItem>
                  <SelectItem value="Advertisement">Advertisement</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 mb-6">
            <Button className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
              <Plus className="h-4 w-4" />
              Add Customer
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Import
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Bulk Email
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Gift className="h-4 w-4" />
              Rewards Campaign
            </Button>
          </div>

          {/* Data Table */}
          <div className="rounded-lg border bg-white dark:bg-slate-800">
            <DataTable
              columns={enhancedCustomersColumns}
              data={filteredCustomers}
              searchKey="firstName"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
