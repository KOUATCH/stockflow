"use client"

import React, { useState, useMemo } from "react"
import { Plus, Users, UserCheck, Crown, DollarSign, ShoppingCart, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import DataTable from "@/components/DataTableComponents/DataTable"
import { enhancedCustomersColumns, EnhancedCustomer } from "@/_legacy-dashboard/dashboard/customers/enhanced-columns"

interface Customer {
  id: string
  name: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  country: string
  postalCode: string
  dateOfBirth?: string
  gender?: "Male" | "Female" | "Other"
  totalOrders: number
  totalSpent: number
  averageOrderValue: number
  lastOrderDate?: string
  customerTier: "Bronze" | "Silver" | "Gold" | "Platinum"
  loyaltyPoints: number
  isVip: boolean
  status: "Active" | "Inactive" | "Blocked"
  joinedDate: string
  notes?: string
}

interface EnhancedCustomersManagementProps {
  data: EnhancedCustomer[]
  organizationId: string
}

const mockCustomers: Customer[] = [
  {
    id: "1",
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah.johnson@email.com",
    phone: "+1-555-0123",
    address: "123 Main St",
    city: "New York",
    state: "NY",
    country: "USA",
    postalCode: "10001",
    dateOfBirth: "1985-03-15",
    gender: "Female",
    totalOrders: 45,
    totalSpent: 12500.75,
    averageOrderValue: 277.79,
    lastOrderDate: "2024-11-20",
    customerTier: "Gold",
    loyaltyPoints: 2850,
    isVip: true,
    status: "Active",
    joinedDate: "2023-01-15",
    notes: "Preferred customer - excellent payment history"
  },
  {
    id: "2",
    firstName: "Michael",
    lastName: "Chen",
    email: "michael.chen@email.com",
    phone: "+1-555-0124",
    address: "456 Oak Ave",
    city: "Los Angeles",
    state: "CA",
    country: "USA",
    postalCode: "90210",
    dateOfBirth: "1990-07-22",
    gender: "Male",
    totalOrders: 23,
    totalSpent: 5670.25,
    averageOrderValue: 246.53,
    lastOrderDate: "2024-11-18",
    customerTier: "Silver",
    loyaltyPoints: 1425,
    isVip: false,
    status: "Active",
    joinedDate: "2023-06-10",
    notes: "Regular customer, prefers weekend shopping"
  },
  {
    id: "3",
    firstName: "Emma",
    lastName: "Williams",
    email: "emma.williams@email.com",
    phone: "+1-555-0125",
    address: "789 Pine Rd",
    city: "Chicago",
    state: "IL",
    country: "USA",
    postalCode: "60601",
    dateOfBirth: "1988-12-03",
    gender: "Female",
    totalOrders: 67,
    totalSpent: 18750.90,
    averageOrderValue: 279.86,
    lastOrderDate: "2024-11-21",
    customerTier: "Platinum",
    loyaltyPoints: 4200,
    isVip: true,
    status: "Active",
    joinedDate: "2022-11-20",
    notes: "VIP customer - high-value purchases"
  },
  {
    id: "4",
    firstName: "David",
    lastName: "Brown",
    email: "david.brown@email.com",
    phone: "+1-555-0126",
    address: "321 Elm St",
    city: "Houston",
    state: "TX",
    country: "USA",
    postalCode: "77001",
    dateOfBirth: "1992-04-18",
    gender: "Male",
    totalOrders: 8,
    totalSpent: 1250.40,
    averageOrderValue: 156.30,
    lastOrderDate: "2024-10-15",
    customerTier: "Bronze",
    loyaltyPoints: 340,
    isVip: false,
    status: "Inactive",
    joinedDate: "2024-03-22",
    notes: "New customer - needs follow-up"
  },
  {
    id: "5",
    firstName: "Lisa",
    lastName: "Anderson",
    email: "lisa.anderson@email.com",
    phone: "+1-555-0127",
    address: "654 Maple Dr",
    city: "Phoenix",
    state: "AZ",
    country: "USA",
    postalCode: "85001",
    dateOfBirth: "1987-09-11",
    gender: "Female",
    totalOrders: 34,
    totalSpent: 8940.60,
    averageOrderValue: 263.25,
    lastOrderDate: "2024-11-19",
    customerTier: "Gold",
    loyaltyPoints: 2150,
    isVip: false,
    status: "Active",
    joinedDate: "2023-04-08",
    notes: "Loyal customer - seasonal buyer"
  }
]

export default function EnhancedCustomersManagement({ data = [], organizationId }: EnhancedCustomersManagementProps) {
  // Transform the raw customer data to match our enhanced type
  const enhancedData: EnhancedCustomer[] = useMemo(() => {
    // Sample customer profile images for demonstration
    const sampleAvatars = [
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
      "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
      "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
      "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
      "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
    ];

    return data.map((customer: any, index: number) => ({
      id: customer.id,
      name: customer.name || "",
      email: customer.email || "",
      phone: customer.phone || "",
      address: customer.address || "",
      notes: customer.notes || "",
      isActive: customer.isActive ?? true,
      createdAt: customer.createdAt || new Date(),
      updatedAt: customer.updatedAt || new Date(),
      // Add image fields
      avatar: Math.random() > 0.3 ? sampleAvatars[index % sampleAvatars.length] : undefined, // 70% chance of having an avatar
      imageUrls: Math.random() > 0.5 ? [sampleAvatars[index % sampleAvatars.length]] : undefined,
      // Add mock enhanced fields for demonstration
      totalOrderValue: Math.floor(Math.random() * 10000) + 500,
      totalOrders: Math.floor(Math.random() * 50) + 1,
      lastOrderDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
      loyaltyPoints: Math.floor(Math.random() * 5000),
      customerTier: ['Bronze', 'Silver', 'Gold', 'Platinum'][Math.floor(Math.random() * 4)] as any,
    }))
  }, [data])

  const stats = useMemo(() => {
    const totalCustomers = enhancedData.length
    const activeCustomers = enhancedData.filter(c => c.isActive).length
    const vipCustomers = enhancedData.filter(c => c.customerTier === 'Platinum').length
    const totalRevenue = enhancedData.reduce((sum, c) => sum + (c.totalOrderValue || 0), 0)
    const totalOrders = enhancedData.reduce((sum, c) => sum + (c.totalOrders || 0), 0)
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    const tierDistribution = enhancedData.reduce((acc, c) => {
      acc[c.customerTier || 'Bronze'] = (acc[c.customerTier || 'Bronze'] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      totalCustomers,
      activeCustomers,
      vipCustomers,
      totalRevenue,
      totalOrders,
      avgOrderValue,
      tierDistribution
    }
  }, [enhancedData])

  return (
    <div className="space-y-6">
      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 via-white to-blue-50/50 dark:from-slate-800 dark:via-slate-750 dark:to-slate-800 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-300">Total Customers</CardTitle>
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {stats.totalCustomers.toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Registered customers
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 via-white to-green-50/50 dark:from-slate-800 dark:via-slate-750 dark:to-slate-800 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-300">Active Customers</CardTitle>
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <UserCheck className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {stats.activeCustomers.toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {((stats.activeCustomers / stats.totalCustomers) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 via-white to-purple-50/50 dark:from-slate-800 dark:via-slate-750 dark:to-slate-800 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-300">VIP Customers</CardTitle>
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <Crown className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {stats.vipCustomers.toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {((stats.vipCustomers / stats.totalCustomers) * 100).toFixed(1)}% VIP status
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 via-white to-amber-50/50 dark:from-slate-800 dark:via-slate-750 dark:to-slate-800 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-300">Total Revenue</CardTitle>
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <DollarSign className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              ${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Customer lifetime value
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-rose-50 via-white to-rose-50/50 dark:from-slate-800 dark:via-slate-750 dark:to-slate-800 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-300">Total Orders</CardTitle>
              <div className="p-2 rounded-lg bg-rose-100 dark:bg-rose-900/30">
                <ShoppingCart className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {stats.totalOrders.toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Customer orders placed
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-50 via-white to-indigo-50/50 dark:from-slate-800 dark:via-slate-750 dark:to-slate-800 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-300">Avg Order Value</CardTitle>
              <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              ${stats.avgOrderValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Per customer order
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Card */}
      <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
        <CardHeader className="pb-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <CardTitle className="text-xl text-slate-900 dark:text-white">Customer Management</CardTitle>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Manage your customer relationships and track customer analytics
              </p>
            </div>
            <Button className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 whitespace-nowrap">
              <Plus className="w-4 h-4 mr-2" />
              Add Customer
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {/* Data Table */}
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
            <DataTable
              columns={enhancedCustomersColumns}
              data={enhancedData}
              model="customers"
              searchPlaceholder="Search customers by name, email, or phone..."
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
